// Lightweight external data integrations with rate limiting.
// Purpose: centralize world-bank, numbeo, opencorporates, marine/flight connectors.

export interface WorldBankIndicators {
  gdp?: number;
  gdpYear?: number;
  gdpGrowth?: number;
  internetUsersPercent?: number;
}

export interface NumbeoCityData {
  crimeIndex?: number;
  safetyIndex?: number;
  avgRentOneBed?: number;
  costOfLivingIndex?: number;
}

export interface OpenCorporateRecord {
  name: string;
  companyNumber?: string;
  jurisdictionCode?: string;
  officers?: Array<{ name: string; role?: string }>;
  incorporationDate?: string;
  sourceUrl?: string;
}

// Simple in-memory rate limiter per-service
class RateLimiter {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillIntervalMs: number;

  constructor(capacity = 5, refillIntervalMs = 60_000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillIntervalMs = refillIntervalMs;
  }

  take(): boolean {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > this.refillIntervalMs) {
      const refillCount = Math.floor(elapsed / this.refillIntervalMs);
      this.tokens = Math.min(this.capacity, this.tokens + refillCount * this.capacity);
      this.lastRefill = now;
    }
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const worldBankLimiter = new RateLimiter(5, 60_000);
const numbeoLimiter = new RateLimiter(3, 60_000);
const opencorporatesLimiter = new RateLimiter(5, 60_000);
const marineLimiter = new RateLimiter(2, 60_000);

export function isExternalDataEnabled(): boolean {
  try {
    if (import.meta.env.VITE_ENABLE_EXTERNAL_DATA === 'true') return true;
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined' && process.env?.ENABLE_EXTERNAL_DATA === 'true') return true;
  return false;
}

export async function fetchWorldBankCountryIndicators(countryCode: string): Promise<WorldBankIndicators | null> {
  if (!worldBankLimiter.take()) return null;

  try {
    const gdpUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&per_page=1`;
    const res = await fetch(gdpUrl);
    const data = await res.json();
    if (data[1]?.[0]) {
      return { gdp: data[1][0].value, gdpYear: parseInt(data[1][0].date) };
    }
  } catch (err) {
    console.warn('[External] World Bank fetch failed:', err);
  }
  return null;
}

export async function fetchNumbeoCityData(cityName: string): Promise<NumbeoCityData | null> {
  if (!numbeoLimiter.take()) return null;

  try {
    // Requires API key (VITE_NUMBEO_API_KEY or NUMBEO_API_KEY)
    const key = import.meta.env.VITE_NUMBEO_API_KEY || process.env?.NUMBEO_API_KEY;
    if (!key) {
      // No API key available - return null (no mock data)
      console.log(`[External] Numbeo: No API key configured for ${cityName}. Skipping.`);
      return null;
    }

    // Numbeo API call
    try {
      const url = `https://www.numbeo.com/api/city_prices?api_key=${key}&city=${encodeURIComponent(cityName)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        crimeIndex: data.crime_index ?? null,
        safetyIndex: data.safety_index ?? null,
        avgRentOneBed: data.avg_rent_one_bed ?? null,
        costOfLivingIndex: data.cost_of_living_index ?? null,
      };
    } catch (err) {
      console.warn('[External] Numbeo API call failed:', err);
      return null;
    }
  } catch (err) {
    console.warn('[External] Numbeo fetch failed:', err);
    return null;
  }
}

export async function fetchOpenCorporatesCompany(companyName: string): Promise<OpenCorporateRecord | null> {
  if (!opencorporatesLimiter.take()) return null;

  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&per_page=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.results?.companies?.[0]?.company) {
      const c = data.results.companies[0].company;
      return {
        name: c.name,
        companyNumber: c.company_number,
        jurisdictionCode: c.jurisdiction_code,
        incorporationDate: c.incorporation_date,
        sourceUrl: c.opencorporates_url
      };
    }
  } catch (err) {
    console.warn('[External] OpenCorporates fetch failed:', err);
  }
  return null;
}

export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface SearchResultBatch {
  query: string;
  results: SearchResultItem[];
  source: 'duckduckgo' | 'gnews' | 'contextualweb' | 'bing';
  status: 'ok' | 'failed';
  error?: string;
}

const searchLimiter = new RateLimiter(10, 60_000);

export async function fetchDuckDuckGoSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'duckduckgo', status: 'failed', error: 'rate_limit' };
  }

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`; // instant answer

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const snippet = data?.AbstractText || data?.RelatedTopics?.[0]?.Text || '';
    const results: SearchResultItem[] = [];

    if (snippet) {
      results.push({ title: data.Heading || query, snippet, url: data?.AbstractURL || '', source: 'duckduckgo' });
    }

    return { query, results, source: 'duckduckgo', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'duckduckgo', status: 'failed', error: String(err) };
  }
}

type GNewsArticle = { title?: string; description?: string; content?: string; url?: string; publishedAt?: string };

export async function fetchGNewsSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'gnews', status: 'failed', error: 'rate_limit' };
  }
  const token = import.meta.env.VITE_GNEWS_API_KEY || process.env?.GNEWS_API_KEY;
  if (!token) {
    return { query, results: [], source: 'gnews', status: 'failed', error: 'no_key' };
  }

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&token=${token}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results: SearchResultItem[] = ((data.articles as GNewsArticle[]) || []).map((a) => ({
      title: a.title || '',
      snippet: a.description || a.content || '',
      url: a.url || '',
      source: 'gnews',
      publishedAt: a.publishedAt
    }));
    return { query, results, source: 'gnews', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'gnews', status: 'failed', error: String(err) };
  }
}

export async function fetchContextualWebSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: 'rate_limit' };
  }
  const key = import.meta.env.VITE_CONTEXTUALWEB_API_KEY || process.env?.CONTEXTUALWEB_API_KEY;
  if (!key) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: 'no_key' };
  }

  const url = `https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI?q=${encodeURIComponent(query)}&pageNumber=1&pageSize=10&autoCorrect=true`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    type ContextualItem = { title?: string; description?: string; url?: string; datePublished?: string };
    const results: SearchResultItem[] = ((data.value as ContextualItem[]) || []).map((item) => ({
      title: item.title || '',
      snippet: item.description || '',
      url: item.url || '',
      source: 'contextualweb',
      publishedAt: item.datePublished
    }));
    return { query, results, source: 'contextualweb', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: String(err) };
  }
}

export async function fetchBingSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'bing', status: 'failed', error: 'rate_limit' };
  }
  const key = import.meta.env.VITE_BING_SEARCH_API_KEY || process.env?.BING_SEARCH_API_KEY;
  if (!key) {
    return { query, results: [], source: 'bing', status: 'failed', error: 'no_key' };
  }

  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`;
  try {
    const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    type BingWebResult = { name?: string; snippet?: string; url?: string; dateLastCrawled?: string };
    const results: SearchResultItem[] = ((data.webPages?.value as BingWebResult[]) || []).map((item) => ({
      title: item.name || '',
      snippet: item.snippet || '',
      url: item.url || '',
      source: 'bing',
      publishedAt: item.dateLastCrawled
    }));
    return { query, results, source: 'bing', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'bing', status: 'failed', error: String(err) };
  }
}

export async function aggregateGlobalSearch(query: string): Promise<SearchResultBatch[]> {
  const results: SearchResultBatch[] = [];
  results.push(await fetchDuckDuckGoSearch(query));
  results.push(await fetchGNewsSearch(query));
  results.push(await fetchContextualWebSearch(query));
  results.push(await fetchBingSearch(query));
  return results;
}

export async function fetchMarineTrafficPortActivity(_portNameOrCountry: string): Promise<Record<string, unknown> | null> {
  if (!marineLimiter.take()) return null;
  return null;
}

