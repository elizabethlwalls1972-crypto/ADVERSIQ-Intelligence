
export class LocationResearchCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  set(loc: string, data: any, ttlMs = 3600000) { this.cache.set(loc.toLowerCase(), { data, expires: Date.now() + ttlMs }); }
  get(loc: string): any | null { const e = this.cache.get(loc.toLowerCase()); if (!e) return null; if (e.expires < Date.now()) { this.cache.delete(loc.toLowerCase()); return null; } return e.data; }
  has(loc: string): boolean { return this.get(loc) !== null; }
  async initialize(): Promise<void> {
    return;
  }
  async saveFullResult(loc: string, data: any): Promise<void> {
    this.set(loc, data);
  }
  async clearPartialResult(loc: string): Promise<void> {
    this.cache.delete(loc.toLowerCase());
  }
}

export const locationResearchCache = new LocationResearchCache();
export default LocationResearchCache;
