/**
 * ADVANCED ETL PIPELINE - Historical Data Integration
 * 
 * Implements:
 * - CSV parsing with column type inference
 * - JSON ingestion with schema validation
 * - API data fetching with caching and pagination
 * - Data cleaning and normalization
 * - Data quality scoring
 * - Deduplication
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache configuration
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ============================================================================
// TYPES
// ============================================================================

export interface DataRecord {
  [key: string]: string | number | boolean | null | undefined;
}

interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  duplicates: number;
  nullValues: number;
  qualityScore: number;
  issues: string[];
}

interface CacheEntry {
  timestamp: number;
  data: DataRecord[];
  source: string;
}

// ============================================================================
// CACHING
// ============================================================================

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCacheKey(source: string): string {
  return source.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
}

function getFromCache(source: string): DataRecord[] | null {
  ensureCacheDir();
  const cacheFile = path.join(CACHE_DIR, `${getCacheKey(source)}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const entry: CacheEntry = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        console.log(`ðŸ“¦ Cache hit for: ${source}`);
        return entry.data;
      }
    }
  } catch {
    // Cache miss or error
  }
  
  return null;
}

function saveToCache(source: string, data: DataRecord[]): void {
  ensureCacheDir();
  const cacheFile = path.join(CACHE_DIR, `${getCacheKey(source)}.json`);
  
  try {
    const entry: CacheEntry = {
      timestamp: Date.now(),
      data,
      source
    };
    fs.writeFileSync(cacheFile, JSON.stringify(entry));
    console.log(`ðŸ’¾ Cached data for: ${source}`);
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

// ============================================================================
// CSV INGESTION
// ============================================================================

export async function ingestCSV(filePath: string): Promise<DataRecord[]> {
  // Check cache first
  const cached = getFromCache(filePath);
  if (cached) return cached;
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  const records: DataRecord[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values, expected ${headers.length}`);
      continue;
    }
    
    const record: DataRecord = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim();
      const value = values[j];
      record[header] = inferType(value);
    }
    
    records.push(record);
  }
  
  // Cache results
  saveToCache(filePath, records);
  
  console.log(`ðŸ“Š Ingested ${records.length} records from CSV`);
  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function inferType(value: string): string | number | boolean | null {
  const trimmed = value.trim();
  
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'na' || trimmed === 'N/A') {
    return null;
  }
  
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  
  // Try number
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') {
    return num;
  }
  
  return trimmed;
}

// ============================================================================
// JSON INGESTION
// ============================================================================

export async function ingestJSON(filePath: string): Promise<DataRecord[]> {
  // Check cache first
  const cached = getFromCache(filePath);
  if (cached) return cached;
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  // Handle different JSON structures
  let records: DataRecord[];
  
  if (Array.isArray(data)) {
    records = data;
  } else if (typeof data === 'object' && data !== null) {
    // Look for common patterns
    if (data.data && Array.isArray(data.data)) {
      records = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      records = data.results;
    } else if (data.items && Array.isArray(data.items)) {
      records = data.items;
    } else {
      // Wrap single object in array
      records = [data];
    }
  } else {
    records = [];
  }
  
  // Cache results
  saveToCache(filePath, records);
  
  console.log(`ðŸ“Š Ingested ${records.length} records from JSON`);
  return records;
}

// ============================================================================
// API INGESTION
// ============================================================================

export async function ingestAPI(
  url: string,
  options: {
    headers?: Record<string, string>;
    pagination?: {
      pageParam: string;
      limitParam: string;
      limit: number;
      maxPages: number;
    };
  } = {}
): Promise<DataRecord[]> {
  // Check cache first
  const cached = getFromCache(url);
  if (cached) return cached;
  
  const allRecords: DataRecord[] = [];
  
  if (options.pagination) {
    // Paginated fetch
    const { pageParam, limitParam, limit, maxPages } = options.pagination;
    
    for (let page = 1; page <= maxPages; page++) {
      const pageUrl = new URL(url);
      pageUrl.searchParams.set(pageParam, String(page));
      pageUrl.searchParams.set(limitParam, String(limit));
      
      console.log(`ðŸŒ Fetching page ${page}: ${pageUrl.toString()}`);
      
      const response = await fetch(pageUrl.toString(), {
        headers: options.headers || {}
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const records = extractRecords(data);
      
      if (records.length === 0) {
        break; // No more data
      }
      
      allRecords.push(...records);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    // Single fetch
    console.log(`ðŸŒ Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: options.headers || {}
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    allRecords.push(...extractRecords(data));
  }
  
  // Cache results
  saveToCache(url, allRecords);
  
  console.log(`ðŸ“Š Ingested ${allRecords.length} records from API`);
  return allRecords;
}

function extractRecords(data: unknown): DataRecord[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    
    // Common API response patterns
    for (const key of ['data', 'results', 'items', 'records', 'rows', 'entries']) {
      if (Array.isArray(obj[key])) {
        return obj[key] as DataRecord[];
      }
    }
  }
  
  return [];
}

// ============================================================================
// DATA CLEANING
// ============================================================================

export function cleanData(raw: DataRecord[]): DataRecord[] {
  if (!Array.isArray(raw)) return [];
  
  const cleaned: DataRecord[] = [];
  const seen = new Set<string>();
  
  for (const record of raw) {
    if (!record || typeof record !== 'object') continue;
    
    // Create cleaned record
    const cleanRecord: DataRecord = {};
    
    for (const [key, value] of Object.entries(record)) {
      // Normalize key
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Clean value
      if (value === undefined || value === null) {
        cleanRecord[cleanKey] = null;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        cleanRecord[cleanKey] = trimmed === '' ? null : inferType(trimmed);
      } else {
        cleanRecord[cleanKey] = value;
      }
    }
    
    // Deduplicate based on content hash
    const hash = JSON.stringify(cleanRecord);
    if (!seen.has(hash)) {
      seen.add(hash);
      cleaned.push(cleanRecord);
    }
  }
  
  return cleaned;
}

// ============================================================================
// DATA QUALITY ASSESSMENT
// ============================================================================

export function assessDataQuality(data: DataRecord[]): DataQualityReport {
  const issues: string[] = [];
  let nullValues = 0;
  let validRecords = 0;
  
  // Count nulls and assess validity
  for (const record of data) {
    let hasValidField = false;
    
    for (const value of Object.values(record)) {
      if (value === null || value === undefined) {
        nullValues++;
      } else {
        hasValidField = true;
      }
    }
    
    if (hasValidField) {
      validRecords++;
    }
  }
  
  // Check for duplicates
  const hashes = data.map(r => JSON.stringify(r));
  const uniqueHashes = new Set(hashes);
  const duplicates = hashes.length - uniqueHashes.size;
  
  // Generate issues
  if (duplicates > 0) {
    issues.push(`Found ${duplicates} duplicate records`);
  }
  
  const nullPercentage = (nullValues / (data.length * Object.keys(data[0] || {}).length)) * 100;
  if (nullPercentage > 10) {
    issues.push(`High null value rate: ${nullPercentage.toFixed(1)}%`);
  }
  
  if (validRecords < data.length * 0.9) {
    issues.push(`${data.length - validRecords} records have no valid fields`);
  }
  
  // Calculate quality score
  let qualityScore = 100;
  qualityScore -= duplicates / data.length * 20;
  qualityScore -= nullPercentage / 2;
  qualityScore -= (data.length - validRecords) / data.length * 30;
  qualityScore = Math.max(0, Math.min(100, qualityScore));
  
  return {
    totalRecords: data.length,
    validRecords,
    duplicates,
    nullValues,
    qualityScore,
    issues
  };
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

export function normalizeData(
  data: DataRecord[],
  schema: {
    fields: Array<{
      source: string;
      target: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      required?: boolean;
      default?: unknown;
    }>;
  }
): DataRecord[] {
  return data.map(record => {
    const normalized: DataRecord = {};
    
    for (const field of schema.fields) {
      const sourceValue = record[field.source] ?? record[field.source.toLowerCase()];
      const defaultValue = isDataValue(field.default) ? field.default : null;
      
      if (sourceValue === null || sourceValue === undefined) {
        normalized[field.target] = defaultValue;
        continue;
      }
      
      // Type conversion
      switch (field.type) {
        case 'string':
          normalized[field.target] = String(sourceValue);
          break;
        case 'number':
          normalized[field.target] = Number(sourceValue) || 0;
          break;
        case 'boolean':
          normalized[field.target] = Boolean(sourceValue);
          break;
        case 'date':
          normalized[field.target] = new Date(String(sourceValue)).toISOString();
          break;
        default:
          normalized[field.target] = String(sourceValue);
      }
    }
    
    return normalized;
  });
}

function isDataValue(value: unknown): value is string | number | boolean | null {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function aggregateData(
  data: DataRecord[],
  groupBy: string,
  aggregations: Array<{
    field: string;
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    outputField: string;
  }>
): DataRecord[] {
  const groups = new Map<string, DataRecord[]>();
  
  // Group records
  for (const record of data) {
    const key = String(record[groupBy] ?? 'unknown');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  }
  
  // Aggregate each group
  const results: DataRecord[] = [];
  
  for (const [key, records] of groups) {
    const aggregated: DataRecord = { [groupBy]: key };
    
    for (const agg of aggregations) {
      const values = records
        .map(r => r[agg.field])
        .filter((v): v is number => typeof v === 'number');
      
      switch (agg.operation) {
        case 'sum':
          aggregated[agg.outputField] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[agg.outputField] = values.length > 0 
            ? values.reduce((a, b) => a + b, 0) / values.length 
            : 0;
          break;
        case 'min':
          aggregated[agg.outputField] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          aggregated[agg.outputField] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case 'count':
          aggregated[agg.outputField] = records.length;
          break;
      }
    }
    
    results.push(aggregated);
  }
  
  return results;
}

export function clearCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
      console.log('ðŸ—‘ï¸ Cache cleared');
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

