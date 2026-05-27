/**
 * 
 * LOCATION RESEARCH CACHE SERVICE
 * 
 * 
 * Intelligent caching system for location research results to prevent redundant
 * API calls and provide instant access to previously researched locations.
 * 
 * Features:
 * - In-memory caching with IndexedDB persistence
 * - Automatic cache invalidation based on data freshness
 * - Partial result caching during multi-stage research
 * - Cache key generation with normalization
 */

import { MultiSourceResult } from './multiSourceResearchService_v2';

interface CacheEntry {
  key: string;
  location: string;
  result: MultiSourceResult;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
  lastAccessed: number;
}

interface PartialCacheEntry {
  key: string;
  location: string;
  stage: string;
  progress: number;
  data: Partial<MultiSourceResult>;
  timestamp: number;
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const PARTIAL_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const DB_NAME = 'LocationResearchDB';
const FULL_CACHE_STORE = 'fullResearchCache';
const PARTIAL_CACHE_STORE = 'partialResearchCache';

class LocationResearchCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private partialCache: Map<string, PartialCacheEntry> = new Map();
  private db: IDBDatabase | null = null;
  private initialized = false;

  /**
   * Initialize IndexedDB for persistent cache storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        console.warn('IndexedDB initialization failed, using memory cache only');
        this.initialized = true;
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        this.cleanupExpiredEntries();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(FULL_CACHE_STORE)) {
          db.createObjectStore(FULL_CACHE_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(PARTIAL_CACHE_STORE)) {
          db.createObjectStore(PARTIAL_CACHE_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Normalize location query for consistent cache keys
   */
  private normalizeKey(location: string): string {
    return location
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Get full research result from cache
   */
  async getFullResult(location: string): Promise<MultiSourceResult | null> {
    const key = this.normalizeKey(location);

    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry.timestamp, memEntry.ttl)) {
      memEntry.hits++;
      memEntry.lastAccessed = Date.now();
      return memEntry.result;
    }

    // Check IndexedDB
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([FULL_CACHE_STORE], 'readonly');
        const store = transaction.objectStore(FULL_CACHE_STORE);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result as CacheEntry | undefined;
          if (entry && !this.isExpired(entry.timestamp, entry.ttl)) {
            // Move to memory cache
            this.memoryCache.set(key, entry);
            entry.hits++;
            entry.lastAccessed = Date.now();

            // Update in DB
            const updateTx = this.db!.transaction([FULL_CACHE_STORE], 'readwrite');
            updateTx.objectStore(FULL_CACHE_STORE).put(entry);

            resolve(entry.result);
          } else {
            resolve(null);
          }
        };
      });
    }

    return null;
  }

  /**
   * Save full research result to cache
   */
  async saveFullResult(
    location: string,
    result: MultiSourceResult,
    ttl: number = CACHE_DURATION
  ): Promise<void> {
    const key = this.normalizeKey(location);
    const entry: CacheEntry = {
      key,
      location,
      result,
      timestamp: Date.now(),
      ttl,
      hits: 1,
      lastAccessed: Date.now()
    };

    // Save to memory
    this.memoryCache.set(key, entry);

    // Save to IndexedDB
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([FULL_CACHE_STORE], 'readwrite');
        const store = transaction.objectStore(FULL_CACHE_STORE);
        store.put(entry);

        transaction.oncomplete = () => resolve();
      });
    }
  }

  /**
   * Get partial research result (mid-research cache)
   */
  async getPartialResult(location: string): Promise<PartialCacheEntry | null> {
    const key = this.normalizeKey(location);
    const entry = this.partialCache.get(key);

    if (entry && !this.isExpired(entry.timestamp, PARTIAL_CACHE_DURATION)) {
      return entry;
    }

    return null;
  }

  /**
   * Save partial research result during multi-stage research
   */
  async savePartialResult(
    location: string,
    stage: string,
    progress: number,
    data: Partial<MultiSourceResult>
  ): Promise<void> {
    const key = this.normalizeKey(location);
    const entry: PartialCacheEntry = {
      key,
      location,
      stage,
      progress,
      data,
      timestamp: Date.now()
    };

    this.partialCache.set(key, entry);

    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([PARTIAL_CACHE_STORE], 'readwrite');
        const store = transaction.objectStore(PARTIAL_CACHE_STORE);
        store.put(entry);

        transaction.oncomplete = () => resolve();
      });
    }
  }

  /**
   * Clear partial cache (after full research completes)
   */
  async clearPartialResult(location: string): Promise<void> {
    const key = this.normalizeKey(location);
    this.partialCache.delete(key);

    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([PARTIAL_CACHE_STORE], 'readwrite');
        const store = transaction.objectStore(PARTIAL_CACHE_STORE);
        store.delete(key);

        transaction.oncomplete = () => resolve();
      });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryCacheSize: number;
    totalHits: number;
    averageHitsPerEntry: number;
  } {
    const entries = Array.from(this.memoryCache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);

    return {
      memoryCacheSize: entries.length,
      totalHits,
      averageHitsPerEntry: entries.length > 0 ? totalHits / entries.length : 0
    };
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    this.memoryCache.clear();
    this.partialCache.clear();

    if (this.db) {
      return new Promise((resolve) => {
        const fullTx = this.db!.transaction([FULL_CACHE_STORE], 'readwrite');
        fullTx.objectStore(FULL_CACHE_STORE).clear();

        const partialTx = this.db!.transaction([PARTIAL_CACHE_STORE], 'readwrite');
        partialTx.objectStore(PARTIAL_CACHE_STORE).clear();

        Promise.all([
          new Promise(r => { fullTx.oncomplete = () => r(null); }),
          new Promise(r => { partialTx.oncomplete = () => r(null); })
        ]).then(() => resolve());
      });
    }
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    // Memory cache cleanup
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry.timestamp, entry.ttl)) {
        this.memoryCache.delete(key);
      }
    }

    // Partial cache cleanup
    for (const [key, entry] of this.partialCache.entries()) {
      if (this.isExpired(entry.timestamp, PARTIAL_CACHE_DURATION)) {
        this.partialCache.delete(key);
      }
    }

    // IndexedDB cleanup
    if (this.db) {
      const fullTx = this.db.transaction([FULL_CACHE_STORE], 'readwrite');
      const fullStore = fullTx.objectStore(FULL_CACHE_STORE);
      const fullRequest = fullStore.getAll();

      fullRequest.onsuccess = () => {
        const entries = fullRequest.result as CacheEntry[];
        for (const entry of entries) {
          if (this.isExpired(entry.timestamp, entry.ttl)) {
            fullStore.delete(entry.key);
          }
        }
      };
    }
  }

  /**
   * Check if entry is expired
   */
  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }
}

// Singleton instance
export const locationResearchCache = new LocationResearchCache();

export type { CacheEntry, PartialCacheEntry };

