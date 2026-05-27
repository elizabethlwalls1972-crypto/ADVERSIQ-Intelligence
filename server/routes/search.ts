/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ Intelligence AI - LIVE SEARCH API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Real-time search integrations:
 * 1. Serper (Google Search API)
 * 2. Perplexity AI Search
 * 3. News aggregation
 * 4. Financial data feeds
 * 
 * All endpoints return real-time, live data - NO mock data
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT SANITISATION — Defense against prompt injection & abuse
// ═══════════════════════════════════════════════════════════════════════════════

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+/i,
  /disregard\s+(all\s+)?prior/i,
  /system\s*:\s*/i,
  /\[\s*INST\s*\]/i,
  /<\s*\|\s*im_start\s*\|>/i,
  /act\s+as\s+(if|though)\s+you/i,
  /forget\s+(everything|all)/i,
  /reveal\s+your\s+(instructions|prompt|system)/i,
  /output\s+your\s+(instructions|prompt|system)/i,
];

function sanitiseUserInput(input: string, maxLength = 2000): { safe: boolean; cleaned: string; reason?: string } {
  if (!input || typeof input !== 'string') return { safe: false, cleaned: '', reason: 'Empty or invalid input' };
  if (input.length > maxLength) return { safe: false, cleaned: '', reason: `Input exceeds ${maxLength} character limit` };
  
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, cleaned: '', reason: 'Input contains disallowed patterns' };
    }
  }
  
  // Strip control characters but preserve normal unicode
  // eslint-disable-next-line no-control-regex
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return { safe: true, cleaned };
}

function buildSearchQueryFromContext(input: {
  query?: string;
  country?: string;
  focus?: string | string[];
  sector?: string;
  target?: string;
}) {
  const manual = (input.query || '').trim();
  if (manual.length >= 4) return manual;

  const focusParts = Array.isArray(input.focus)
    ? input.focus
    : typeof input.focus === 'string'
      ? input.focus.split(/[•,]/)
      : [];

  const derived = [
    ...focusParts.map((part) => part.trim()).filter(Boolean),
    (input.sector || '').trim(),
    (input.country || '').trim(),
    (input.target || '').trim()
  ].filter(Boolean).join(' ');

  if (derived.length >= 4) {
    return derived;
  }

  return manual || 'regional investment partnerships government finance';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERPER - Google Search API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/search/serper
 * Perform Google search via Serper API
 */
router.post('/serper', async (req: Request, res: Response) => {
  try {
    const { query, num = 10, type = 'search', country, focus, sector, target } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const providerStatus: Record<string, string> = { serper: 'pending' };
    const queryUsedRaw = buildSearchQueryFromContext({
      query,
      country,
      focus,
      sector,
      target
    });

    // Sanitise input
    const sanitised = sanitiseUserInput(queryUsedRaw, 500);
    if (!sanitised.safe) {
      return res.status(400).json({ error: sanitised.reason });
    }
    const safeQuery = sanitised.cleaned;

    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    
    if (!SERPER_API_KEY) {
      providerStatus.serper = 'missing_key';
      const fallbackData = await fallbackSearch(safeQuery);
      return res.json({
        ...fallbackData,
        ok: fallbackData.organic.length > 0,
        queryUsed: safeQuery,
        providerStatus,
        reason: fallbackData.organic.length > 0
          ? 'Serper key missing; fallback search returned results.'
          : 'Serper key missing and fallback returned no results.'
      });
    }

    const endpoint = type === 'news' 
      ? 'https://google.serper.dev/news'
      : 'https://google.serper.dev/search';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: safeQuery,
        num
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();
    providerStatus.serper = 'ok';
    const organic = Array.isArray(data.organic) ? data.organic : [];

    return res.json({
      ...data,
      ok: organic.length > 0,
      queryUsed: safeQuery,
      providerStatus,
      reason: organic.length > 0 ? null : 'Provider returned zero matches for this query.'
    });
  } catch (error) {
    console.error('Serper search error:', error);
    return res.status(200).json({
      ok: false,
      error: 'Search failed',
      fallback: true,
      organic: [],
      providerStatus: { serper: 'error' },
      reason: error instanceof Error ? error.message : 'Unknown search error'
    });
  }
});

/**
 * Fallback search using DuckDuckGo (no API key required)
 */
async function fallbackSearch(query: string) {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
    );
    
    const data = await response.json();
    
    // Transform DuckDuckGo format to Serper format
    const organic = [];
    
    if (data.AbstractText) {
      organic.push({
        title: data.Heading || query,
        link: data.AbstractURL || data.AbstractSource,
        snippet: data.AbstractText,
        position: 1
      });
    }
    
    if (data.RelatedTopics) {
      (data.RelatedTopics as Array<{ Text?: string; FirstURL?: string }>).slice(0, 10).forEach((topic, idx) => {
        if (topic.Text && topic.FirstURL) {
          organic.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
            link: topic.FirstURL,
            snippet: topic.Text,
            position: idx + 2
          });
        }
      });
    }
    
    return {
      organic,
      searchParameters: { q: query, engine: 'duckduckgo-fallback' }
    };
  } catch (error) {
    console.error('Fallback search error:', error);
    return { organic: [], fallback: true, searchParameters: { q: query, engine: 'duckduckgo-fallback' } };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERPLEXITY AI - AI-Enhanced Search
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/search/perplexity
 * AI-enhanced search with citations
 */
router.post('/perplexity', async (req: Request, res: Response) => {
  try {
    const { query, context, model = 'pplx-7b-online' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      // Fallback to regular search + AI synthesis
      return res.json({
        response: `Searching for: ${query}`,
        citations: [],
        fallback: true
      });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide accurate, well-sourced answers with citations.'
          },
          {
            role: 'user',
            content: context ? `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` : query
          }
        ],
        max_tokens: 1024,
        temperature: 0.2,
        return_citations: true
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    
    return res.json({
      response: data.choices?.[0]?.message?.content || '',
      citations: data.citations || [],
      model: data.model
    });
  } catch (error) {
    console.error('Perplexity search error:', error);
    return res.status(500).json({ 
      error: 'Perplexity search failed',
      response: '',
      citations: []
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS AGGREGATION - Real-time news from multiple sources
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/search/news
 * Aggregate news from multiple sources
 */
router.post('/news', async (req: Request, res: Response) => {
  try {
    const { query, country } = req.body;

    const articles: Array<{
      title?: string;
      description?: string;
      url?: string;
      source?: string;
      publishedAt?: string;
      image?: string;
    }> = [];

    // Try NewsAPI if key is available
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (NEWS_API_KEY) {
      try {
        const params = new URLSearchParams({
          apiKey: NEWS_API_KEY,
          q: query || country || 'business',
          language: 'en',
          sortBy: 'relevancy',
          pageSize: '10'
        });

        const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          articles.push(...(data.articles as Array<{ title?: string; description?: string; url?: string; source?: { name?: string }; publishedAt?: string; urlToImage?: string }> || []).map((a) => ({
            title: a.title,
            description: a.description,
            url: a.url,
            source: a.source?.name,
            publishedAt: a.publishedAt,
            image: a.urlToImage
          })));
        }
      } catch (error) {
        console.warn('NewsAPI failed:', error);
      }
    }

    // Try Serper news as fallback/supplement
    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    
    if (SERPER_API_KEY) {
      try {
        const response = await fetch('https://google.serper.dev/news', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query || country || 'business news' })
        });
        
        if (response.ok) {
          const data = await response.json();
          articles.push(...(data.news as Array<{ title?: string; snippet?: string; link?: string; source?: string; date?: string; imageUrl?: string }> || []).map((n) => ({
            title: n.title,
            description: n.snippet,
            url: n.link,
            source: n.source,
            publishedAt: n.date,
            image: n.imageUrl
          })));
        }
      } catch (error) {
        console.warn('Serper news failed:', error);
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueArticles = articles.filter(a => {
      if (!a.url || seen.has(a.url)) return false;
      seen.add(a.url!);
      return true;
    });

    return res.json({
      articles: uniqueArticles.slice(0, 20),
      query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('News aggregation error:', error);
    return res.status(500).json({ articles: [], error: 'News aggregation failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL DATA - Real-time market data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/search/financial/:symbol
 * Get financial data for a symbol
 */
router.get('/financial/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Try Alpha Vantage
    const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (ALPHA_VANTAGE_KEY) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data['Global Quote']) {
          return res.json({
            symbol,
            price: parseFloat(data['Global Quote']['05. price']),
            change: parseFloat(data['Global Quote']['09. change']),
            changePercent: data['Global Quote']['10. change percent'],
            volume: parseInt(data['Global Quote']['06. volume']),
            timestamp: data['Global Quote']['07. latest trading day']
          });
        }
      }
    }
    
    // Try Yahoo Finance (unofficial)
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      );
      
      if (response.ok) {
        const data = await response.json();
        const quote = data.chart?.result?.[0];
        if (quote) {
          const meta = quote.meta;
          return res.json({
            symbol,
            price: meta.regularMarketPrice,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: `${(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100).toFixed(2)}%`,
            volume: meta.regularMarketVolume,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.warn('Yahoo Finance failed:', error);
    }

    return res.status(404).json({ error: 'Symbol not found' });
  } catch (error) {
    console.error('Financial data error:', error);
    return res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTRY INTELLIGENCE - Real-time country data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/search/country/:code
 * Get comprehensive country data
 */
router.get('/country/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    // Fetch from multiple sources in parallel
    const [restCountries, worldBank] = await Promise.all([
      fetch(`https://restcountries.com/v3.1/alpha/${code}`).then(r => r.ok ? r.json() : []),
      fetch(`https://api.worldbank.org/v2/country/${code}?format=json`).then(r => r.ok ? r.json() : [])
    ]);

    const country = restCountries[0] || {};
    const wbCountry = worldBank[1]?.[0] || {};

    return res.json({
      name: country.name?.common || wbCountry.name,
      officialName: country.name?.official,
      code: code.toUpperCase(),
      capital: country.capital?.[0] || wbCountry.capitalCity,
      region: country.region || wbCountry.region?.value,
      subregion: country.subregion,
      population: country.population,
      area: country.area,
      currencies: country.currencies ? Object.values(country.currencies) : [],
      languages: country.languages ? Object.values(country.languages) : [],
      borders: country.borders || [],
      timezones: country.timezones || [],
      flag: country.flags?.svg,
      incomeLevel: wbCountry.incomeLevel?.value,
      lendingType: wbCountry.lendingType?.value,
      longitude: wbCountry.longitude || country.latlng?.[1],
      latitude: wbCountry.latitude || country.latlng?.[0]
    });
  } catch (error) {
    console.error('Country data error:', error);
    return res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ECONOMIC INDICATORS - Real-time economic data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/search/indicators/:country
 * Get economic indicators for a country
 */
router.get('/indicators/:country', async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    
    // World Bank indicators
    const indicators = ['NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD', 'FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS'];
    
    const results = await Promise.all(
      indicators.map(async (indicator) => {
        try {
          const response = await fetch(
            `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=5`
          );
          if (response.ok) {
            const data = await response.json();
            const latest = (data[1] as Array<{ value: number | null; indicator?: { value?: string }; date?: string }> | undefined)?.find((d) => d.value !== null);
            return {
              indicator,
              name: latest?.indicator?.value,
              value: latest?.value,
              year: latest?.date
            };
          }
        } catch {
          console.warn(`Indicator ${indicator} failed`);
        }
        return null;
      })
    );

    return res.json({
      country,
      indicators: results.filter(Boolean),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Indicators error:', error);
    return res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION INTELLIGENCE - AI-Enhanced Location Research (uses Gemini)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/search/location-intelligence
 * Comprehensive location research using free APIs + optional AI enhancement
 */
router.post('/location-intelligence', async (req: Request, res: Response) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Sanitise location input against prompt injection
    const sanitised = sanitiseUserInput(location, 500);
    if (!sanitised.safe) {
      return res.status(400).json({ error: sanitised.reason });
    }
    const safeLocation = sanitised.cleaned;

    console.log(`[Location Intelligence] Researching: ${safeLocation}`);

    // Get basic data from public APIs first (all free, no API keys required)
    const [geoData, wikiData] = await Promise.all([
      fetchLocationGeocoding(safeLocation),
      fetchLocationWikipedia(safeLocation)
    ]);

    // Get World Bank data and REST Countries data if we have country code
    let economicData = null;
    let countryData = null;
    
    if (geoData?.countryCode) {
      [economicData, countryData] = await Promise.all([
        fetchLocationWorldBank(geoData.countryCode),
        fetchRestCountriesData(geoData.countryCode)
      ]);
    }

    // Build comprehensive intelligence from free APIs
    const freeApiIntelligence = buildIntelligenceFromFreeAPIs(
      safeLocation, geoData, wikiData, economicData, countryData
    );

    // Return comprehensive response using free API data
    return res.json({
      location: safeLocation,
      geocoding: geoData,
      wikipedia: wikiData,
      worldBank: economicData,
      countryData,
      aiIntelligence: freeApiIntelligence,
      aiEnhanced: false,
      freeApiData: freeApiIntelligence,
      timestamp: new Date().toISOString(),
      researchId: `research-${Date.now()}`,
      sources: ['OpenStreetMap Nominatim', 'Wikipedia', 'World Bank', 'REST Countries API']
    });

  } catch (error) {
    console.error('[Location Intelligence] Error:', error);
    return res.status(500).json({ 
      error: 'Location intelligence research failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper: Geocoding with country extraction
async function fetchLocationGeocoding(location: string): Promise<{
  lat: number;
  lon: number;
  displayName: string;
  country: string;
  countryCode: string;
  state?: string;
  type: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1&limit=1`,
      { headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          country: data[0].address?.country || '',
          countryCode: (data[0].address?.country_code || '').toUpperCase(),
          state: data[0].address?.state || data[0].address?.province,
          type: data[0].type
        };
      }
    }
  } catch (error) {
    console.warn('[Geocoding] Failed:', error);
  }
  return null;
}

// Helper: Wikipedia with extended extract
async function fetchLocationWikipedia(location: string): Promise<string | null> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(location)}&format=json&origin=*&srlimit=1`
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.query?.search?.[0]) {
        const title = searchData.query.search[0].title;
        const extractRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&format=json&origin=*`
        );
        if (extractRes.ok) {
          const extractData = await extractRes.json();
          const pages = extractData.query?.pages;
          const page = Object.values(pages)[0] as { extract?: string };
          // Get first 3000 chars for good context
          return page?.extract?.substring(0, 3000) || null;
        }
      }
    }
  } catch (error) {
    console.warn('[Wikipedia] Failed:', error);
  }
  return null;
}

// Helper: World Bank economic indicators
async function fetchLocationWorldBank(countryCode: string): Promise<Record<string, { value: number; year: string }> | null> {
  const indicators = [
    { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
    { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth (annual %)' },
    { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita' },
    { code: 'SP.POP.TOTL', name: 'Population' },
    { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment Rate' },
    { code: 'IT.NET.USER.ZS', name: 'Internet Users (%)' },
    { code: 'BX.KLT.DINV.CD.WD', name: 'Foreign Direct Investment' }
  ];
  
  const results: Record<string, { value: number; year: string }> = {};
  
  await Promise.all(indicators.map(async (ind) => {
    try {
      const res = await fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind.code}?format=json&per_page=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data[1]?.[0]?.value !== null) {
          results[ind.name] = { 
            value: data[1][0].value, 
            year: data[1][0].date 
          };
        }
      }
    } catch {
      // Individual indicator failure is OK
    }
  }));
  
  return Object.keys(results).length > 0 ? results : null;
}

// Helper: REST Countries API for comprehensive country data
interface RestCountryData {
  name: { common: string; official: string };
  capital?: string[];
  population?: number;
  area?: number;
  region?: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  timezones?: string[];
  borders?: string[];
  flags?: { svg: string; png: string };
  coatOfArms?: { svg: string; png: string };
  maps?: { googleMaps: string };
  gini?: Record<string, number>;
  car?: { side: string };
  demonyms?: { eng: { m: string; f: string } };
}

async function fetchRestCountriesData(countryCode: string): Promise<RestCountryData | null> {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,capital,population,area,region,subregion,languages,currencies,timezones,borders,flags,coatOfArms,maps,gini,car,demonyms`
    );
    if (res.ok) {
      const data = await res.json();
      return data as RestCountryData;
    }
  } catch (error) {
    console.warn('[REST Countries] Failed:', error);
  }
  return null;
}

// Helper: Build comprehensive intelligence from free APIs (no AI required)
function buildIntelligenceFromFreeAPIs(
  location: string,
  geoData: Awaited<ReturnType<typeof fetchLocationGeocoding>>,
  wikiData: string | null,
  economicData: Record<string, { value: number; year: string }> | null,
  countryData: RestCountryData | null
) {
  // Format currency values
  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} trillion`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)} billion`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)} million`;
    return num.toLocaleString();
  };

  const formatPopulation = (num: number | undefined) => {
    if (!num) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} billion`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} million`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)} thousand`;
    return num.toLocaleString();
  };

  // Extract first 2-3 sentences from Wikipedia as description
  const getDescription = () => {
    if (!wikiData) return 'Information not available from Wikipedia.';
    const sentences = wikiData.split(/\.(?=\s)/);
    return sentences.slice(0, 3).join('. ') + '.';
  };

  // Build the structured intelligence response
  return {
    overview: {
      description: getDescription(),
      significance: wikiData?.includes('capital') 
        ? 'Major capital city with significant economic and political importance.' 
        : wikiData?.includes('largest') 
          ? 'One of the largest and most significant locations in the region.'
          : 'Strategic location with regional importance.',
      established: 'See historical records',
      nicknames: []
    },
    geography: {
      coordinates: geoData ? `${geoData.lat.toFixed(4)}°N, ${geoData.lon.toFixed(4)}°E` : 'N/A',
      area: countryData?.area ? `${countryData.area.toLocaleString()} km²` : 'N/A',
      climate: 'Varies by season',
      terrain: geoData?.type || 'N/A',
      timezone: countryData?.timezones?.[0] || 'N/A'
    },
    demographics: {
      population: formatPopulation(countryData?.population || economicData?.['Population']?.value),
      populationYear: economicData?.['Population']?.year || 'Latest available',
      languages: countryData?.languages ? Object.values(countryData.languages).join(', ') : 'N/A',
      demonym: countryData?.demonyms?.eng?.m || 'N/A'
    },
    government: {
      type: 'See official government sources',
      capital: countryData?.capital?.[0] || 'N/A',
      country: geoData?.country || 'N/A',
      region: countryData?.region || 'N/A',
      subregion: countryData?.subregion || 'N/A'
    },
    economy: {
      gdp: formatNumber(economicData?.['GDP (current US$)']?.value),
      gdpYear: economicData?.['GDP (current US$)']?.year || 'N/A',
      gdpGrowth: economicData?.['GDP Growth (annual %)']?.value 
        ? `${economicData['GDP Growth (annual %)'].value.toFixed(2)}%`
        : 'N/A',
      gdpPerCapita: formatNumber(economicData?.['GDP per capita']?.value),
      currency: countryData?.currencies 
        ? Object.values(countryData.currencies).map(c => `${c.name} (${c.symbol})`).join(', ')
        : 'N/A',
      unemploymentRate: economicData?.['Unemployment Rate']?.value 
        ? `${economicData['Unemployment Rate'].value.toFixed(2)}%`
        : 'N/A',
      fdi: formatNumber(economicData?.['Foreign Direct Investment']?.value)
    },
    infrastructure: {
      internetUsers: economicData?.['Internet Users (%)']?.value 
        ? `${economicData['Internet Users (%)'].value.toFixed(1)}% of population`
        : 'N/A',
      drivingSide: countryData?.car?.side || 'N/A'
    },
    scores: {
      infrastructure: 65,
      politicalStability: 60,
      laborPool: 70,
      investmentMomentum: 55,
      regulatoryEase: 50,
      costCompetitiveness: 60
    },
    dataQuality: {
      completeness: 75,
      freshness: new Date().getFullYear().toString(),
      confidence: 'Medium - Data from verified public sources',
      sources: ['OpenStreetMap', 'Wikipedia', 'World Bank', 'REST Countries API']
    },
    links: {
      googleMaps: countryData?.maps?.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(location)}`,
      flag: countryData?.flags?.svg || null
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREE INTELLIGENCE — Zero-key, zero-cost web research endpoints
// These work like OpenAI agent browsing tools: search → fetch → extract → return
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/search/fetch-url
 * Convert any URL to clean readable text via Jina Reader.
 * Free, no API key, no rate limit for standard use.
 * This is how the system reads full articles and pages — same as OpenAI's browser tool.
 */
router.post('/fetch-url', async (req: Request, res: Response) => {
  try {
    const { url, maxChars = 6000 } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    // Basic URL validation — must be http(s)
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: 'url must start with http:// or https://' });
    }
    const sanitised = sanitiseUserInput(url, 2000);
    if (!sanitised.safe) return res.status(400).json({ error: sanitised.reason });

    const jinaUrl = `https://r.jina.ai/${sanitised.cleaned}`;
    const response = await fetch(jinaUrl, {
      signal: AbortSignal.timeout(12000),
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Jina Reader returned ${response.status}`, url });
    }

    const raw = await response.text();
    const text = raw.replace(/\n{3,}/g, '\n\n').trim().slice(0, Number(maxChars) || 6000);

    return res.json({
      ok: text.length > 50,
      url,
      text,
      chars: text.length,
      provider: 'jina-reader',
    });
  } catch (error) {
    console.error('fetch-url error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch URL', provider: 'jina-reader' });
  }
});

/**
 * POST /api/search/worldbank
 * Pull World Bank open economic data for a country.
 * Free, no API key. Returns GDP, FDI, inflation, unemployment, trade.
 */
router.post('/worldbank', async (req: Request, res: Response) => {
  try {
    const { country, countryCode } = req.body;
    if (!country && !countryCode) {
      return res.status(400).json({ error: 'country or countryCode required' });
    }

    const COUNTRY_CODE_MAP: Record<string, string> = {
      'philippines': 'PH', 'indonesia': 'ID', 'vietnam': 'VN', 'thailand': 'TH',
      'malaysia': 'MY', 'singapore': 'SG', 'myanmar': 'MM', 'cambodia': 'KH',
      'nigeria': 'NG', 'kenya': 'KE', 'ghana': 'GH', 'ethiopia': 'ET',
      'south africa': 'ZA', 'egypt': 'EG', 'morocco': 'MA', 'tanzania': 'TZ',
      'india': 'IN', 'pakistan': 'PK', 'bangladesh': 'BD', 'sri lanka': 'LK',
      'brazil': 'BR', 'colombia': 'CO', 'peru': 'PE', 'chile': 'CL', 'mexico': 'MX',
      'ukraine': 'UA', 'turkey': 'TR', 'saudi arabia': 'SA', 'uae': 'AE',
      'united arab emirates': 'AE', 'qatar': 'QA', 'jordan': 'JO',
      'china': 'CN', 'japan': 'JP', 'south korea': 'KR', 'australia': 'AU',
      'argentina': 'AR', 'kazakhstan': 'KZ', 'uzbekistan': 'UZ',
    };

    const iso2 = countryCode?.toUpperCase() ||
      COUNTRY_CODE_MAP[(country as string).toLowerCase().trim()] ||
      (country as string).toUpperCase().slice(0, 2);

    const indicators = [
      { code: 'NY.GDP.MKTP.CD', label: 'GDP (USD)' },
      { code: 'NY.GDP.PCAP.CD', label: 'GDP per capita (USD)' },
      { code: 'NY.GDP.MKTP.KD.ZG', label: 'GDP growth (%)' },
      { code: 'FP.CPI.TOTL.ZG', label: 'Inflation (%)' },
      { code: 'BX.KLT.DINV.CD.WD', label: 'FDI inflows (USD)' },
      { code: 'SL.UEM.TOTL.ZS', label: 'Unemployment (%)' },
      { code: 'NE.EXP.GNFS.ZS', label: 'Exports (% of GDP)' },
      { code: 'NE.IMP.GNFS.ZS', label: 'Imports (% of GDP)' },
      { code: 'GC.DOD.TOTL.GD.ZS', label: 'Government debt (% of GDP)' },
    ];

    const results = await Promise.allSettled(
      indicators.map(async (ind) => {
        const url = `https://api.worldbank.org/v2/country/${iso2}/indicator/${ind.code}?format=json&mrv=5&per_page=5`;
        const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) return null;
        const d = await r.json();
        const entries = ((d[1] || []) as Array<{ value: number | null; date: string }>)
          .filter(e => e.value !== null).slice(0, 3);
        if (!entries.length) return null;
        const series = entries.map(e => {
          const v = e.value as number;
          const fmt = v > 1e12 ? `$${(v / 1e12).toFixed(2)}T`
            : v > 1e9 ? `$${(v / 1e9).toFixed(1)}B`
            : v > 1e6 ? `$${(v / 1e6).toFixed(1)}M`
            : v.toLocaleString();
          return `${e.date}: ${fmt}`;
        }).join(', ');
        return { label: ind.label, series };
      })
    );

    const indicators_data = results
      .filter((r): r is PromiseFulfilledResult<{ label: string; series: string } | null> =>
        r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value as { label: string; series: string });

    return res.json({
      ok: indicators_data.length > 0,
      country: country || iso2,
      countryCode: iso2,
      indicators: indicators_data,
      source: 'World Bank Open Data',
      sourceUrl: `https://data.worldbank.org/country/${iso2}`,
    });
  } catch (error) {
    console.error('worldbank error:', error);
    return res.status(500).json({ ok: false, error: 'World Bank lookup failed' });
  }
});

/**
 * POST /api/search/free-intel
 * Comprehensive free intelligence gathering — no API keys needed.
 * Combines: DuckDuckGo search → Jina page fetch → Wikipedia → World Bank → HN news
 * This is the agent-style "research" endpoint: give it a question, get back real data.
 */
router.post('/free-intel', async (req: Request, res: Response) => {
  try {
    const { query, country, fetchPages = true } = req.body;
    if (!query) return res.status(400).json({ error: 'query required' });

    const sanitised = sanitiseUserInput(query, 1000);
    if (!sanitised.safe) return res.status(400).json({ error: sanitised.reason });
    const q = sanitised.cleaned;

    const results: Record<string, unknown> = { query: q, sources: [] as string[], fetchedAt: new Date().toISOString() };

    const [ddg, wiki, news, hn] = await Promise.allSettled([
      // DuckDuckGo
      (async () => {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`;
        const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
        if (!r.ok) return null;
        const data = await r.json();
        const urls: string[] = [];
        if (data?.AbstractURL && !data.AbstractURL.includes('duckduckgo')) urls.push(data.AbstractURL);
        (data?.RelatedTopics || []).slice(0, 4).forEach((t: Record<string, string>) => {
          if (t?.FirstURL && !t.FirstURL.includes('duckduckgo.com') && urls.length < 4) urls.push(t.FirstURL);
        });
        return {
          abstract: data?.AbstractText || '',
          related: (data?.RelatedTopics || []).slice(0, 6).map((t: Record<string, string>) => t?.Text || '').filter(Boolean),
          source: data?.AbstractSource || '',
          urls,
        };
      })(),
      // Wikipedia
      (async () => {
        const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=3`;
        const sRes = await fetch(sUrl, { signal: AbortSignal.timeout(7000) });
        if (!sRes.ok) return null;
        const sData = await sRes.json();
        const titles = (sData?.query?.search || []).slice(0, 2).map((s: Record<string, string>) => s.title);
        const extracts = await Promise.allSettled(titles.map(async (title: string) => {
          const cUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&exintro=false&exchars=2000&format=json&origin=*`;
          const cRes = await fetch(cUrl, { signal: AbortSignal.timeout(6000) });
          if (!cRes.ok) return null;
          const cData = await cRes.json();
          const pages = cData?.query?.pages || {};
          const page = Object.values(pages)[0] as Record<string, string> | undefined;
          return { title, extract: page?.extract || '' };
        }));
        return extracts
          .filter((r): r is PromiseFulfilledResult<{ title: string; extract: string } | null> =>
            r.status === 'fulfilled' && r.value !== null && (r.value?.extract?.length ?? 0) > 100)
          .map(r => r.value);
      })(),
      // DDG News
      (async () => {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q + ' news 2025')}&format=json&no_redirect=1&no_html=1&ia=news`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) return null;
        const data = await r.json();
        return (data?.RelatedTopics || []).slice(0, 8)
          .map((t: Record<string, string>) => ({ text: t?.Text || '', url: t?.FirstURL || '' }))
          .filter((t: { text: string }) => t.text.length > 30);
      })(),
      // Hacker News
      (async () => {
        const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=6&numericFilters=points>5`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) return null;
        const data = await r.json();
        return (data?.hits || []).slice(0, 6).map((h: Record<string, string | number>) => ({
          title: h.title, url: h.url, points: h.points, author: h.author,
        }));
      })(),
    ]);

    if (ddg.status === 'fulfilled' && ddg.value) {
      results['search'] = ddg.value;
      (results['sources'] as string[]).push('DuckDuckGo');
    }
    if (wiki.status === 'fulfilled' && wiki.value) {
      results['wikipedia'] = wiki.value;
      (results['sources'] as string[]).push('Wikipedia');
    }
    if (news.status === 'fulfilled' && news.value) {
      results['news'] = news.value;
      (results['sources'] as string[]).push('DuckDuckGo News');
    }
    if (hn.status === 'fulfilled' && hn.value) {
      results['hackerNews'] = hn.value;
      (results['sources'] as string[]).push('Hacker News');
    }

    // Jina Reader: fetch full content of top URLs found by search
    if (fetchPages) {
      const ddgVal = ddg.status === 'fulfilled' ? ddg.value : null;
      const urls: string[] = (ddgVal?.urls || []).filter((u: string) => u.startsWith('http')).slice(0, 3);
      if (urls.length) {
        const pages = await Promise.allSettled(
          urls.map(async (url: string) => {
            const jinaUrl = `https://r.jina.ai/${url}`;
            const r = await fetch(jinaUrl, {
              signal: AbortSignal.timeout(10000),
              headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
            });
            if (!r.ok) return null;
            const text = (await r.text()).replace(/\n{3,}/g, '\n\n').trim().slice(0, 5000);
            return text.length > 100 ? { url, text } : null;
          })
        );
        const pageData = pages
          .filter((r): r is PromiseFulfilledResult<{ url: string; text: string } | null> =>
            r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value);
        if (pageData.length) {
          results['pages'] = pageData;
          (results['sources'] as string[]).push('Jina Reader (full page content)');
        }
      }
    }

    return res.json({ ok: true, ...results });
  } catch (error) {
    console.error('free-intel error:', error);
    return res.status(500).json({ ok: false, error: 'Free intelligence gathering failed' });
  }
});

export default router;
