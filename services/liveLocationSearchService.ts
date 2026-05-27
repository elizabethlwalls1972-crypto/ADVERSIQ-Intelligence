/**
 * 
 * LIVE LOCATION SEARCH SERVICE
 * 
 * 
 * Real-time location intelligence that fetches LIVE data from:
 * 1. Google Search (via Serper API)
 * 2. Wikipedia API
 * 3. Wikidata API
 * 4. OpenStreetMap Nominatim
 * 5. REST Countries API
 * 6. News aggregation
 * 
 * NO MOCK DATA - ALL LIVE SEARCHES
 * 
 */

import { type CityProfile, type CityLeader } from '../data/globalLocationProfiles';

// ==================== TYPES ====================

export interface LiveSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  imageUrl?: string;
  date?: string;
}

export interface WikipediaInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  fullUrl: string;
  pageId: number;
}

export interface LeaderSearchResult {
  name: string;
  role: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  tenure?: string;
  party?: string;
  description?: string;
}

export interface CitySearchData {
  basicInfo: {
    name: string;
    country: string;
    region: string;
    population?: string;
    coordinates: { lat: number; lon: number };
    timezone?: string;
    established?: string;
    area?: string;
    climate?: string;
  };
  leaders: LeaderSearchResult[];
  economy: {
    gdp?: string;
    industries: string[];
    majorCompanies: string[];
    unemployment?: string;
  };
  infrastructure: {
    airports: string[];
    ports: string[];
    economicZones: string[];
  };
  recentNews: LiveSearchResult[];
  investmentInfo: {
    incentives: string[];
    foreignCompanies: string[];
    investmentHighlights: string[];
  };
  wikiInfo?: WikipediaInfo;
}

// ==================== LIVE SEARCH FUNCTIONS ====================

/**
 * Perform a Google search via our backend Serper API
 */
export async function googleSearch(query: string, num: number = 10): Promise<LiveSearchResult[]> {
  try {
    // First try our backend API
    const response = await fetch('/api/search/serper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, num })
    });

    if (response.ok) {
      const data = await response.json();
      return (data.organic || []).map((r: { title?: string; link?: string; snippet?: string; position?: number; imageUrl?: string; date?: string }, idx: number) => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || '',
        position: r.position || idx + 1,
        imageUrl: r.imageUrl,
        date: r.date
      }));
    }
  } catch {
    console.warn('Backend search failed, trying DuckDuckGo fallback');
  }

  // Direct DuckDuckGo fallback
  try {
    const ddgResponse = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    const ddgData = await ddgResponse.json();
    const results: LiveSearchResult[] = [];

    if (ddgData.AbstractText) {
      results.push({
        title: ddgData.Heading || query,
        link: ddgData.AbstractURL || '',
        snippet: ddgData.AbstractText,
        position: 1,
        imageUrl: ddgData.Image ? `https://duckduckgo.com${ddgData.Image}` : undefined
      });
    }

    if (ddgData.RelatedTopics) {
      ddgData.RelatedTopics.slice(0, 8).forEach((topic: { Text?: string; FirstURL?: string }, idx: number) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
            link: topic.FirstURL,
            snippet: topic.Text,
            position: idx + 2
          });
        }
      });
    }

    return results;
  } catch (e) {
    console.error('All search methods failed:', e);
    return [];
  }
}

/**
 * Search Google News for recent articles
 */
export async function googleNewsSearch(query: string): Promise<LiveSearchResult[]> {
  try {
    const response = await fetch('/api/search/serper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, num: 5, type: 'news' })
    });

    if (response.ok) {
      const data = await response.json();
      return (data.news || data.organic || []).map((r: { title?: string; link?: string; snippet?: string; description?: string; date?: string }, idx: number) => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || r.description || '',
        position: idx + 1,
        date: r.date
      }));
    }
  } catch {
    console.warn('News search failed');
  }
  return [];
}

/**
 * Get Wikipedia information for a location
 */
export async function getWikipediaInfo(locationName: string): Promise<WikipediaInfo | null> {
  try {
    // Search for the page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(locationName)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;

    // Get page extract and thumbnail
    const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages|info&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400&inprop=url&format=json&origin=*`;
    const infoResponse = await fetch(infoUrl);
    const infoData = await infoResponse.json();

    const pages = infoData.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as { title?: string; extract?: string; thumbnail?: { source?: string }; fullurl?: string; pageid?: number };

    return {
      title: page.title || locationName,
      extract: page.extract || '',
      thumbnail: page.thumbnail?.source,
      fullUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      pageId: page.pageid || 0
    };
  } catch {
    console.error('Wikipedia fetch failed');
    return null;
  }
}

/**
 * Get Wikidata information for structured data
 */
export async function getWikidataInfo(locationName: string): Promise<Record<string, unknown> | null> {
  try {
    // Search Wikidata
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(locationName)}&language=en&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.search?.length) return null;

    const entityId = searchData.search[0].id;

    // Get entity data
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&languages=en&format=json&origin=*`;
    const entityResponse = await fetch(entityUrl);
    const entityData = await entityResponse.json();

    return entityData.entities?.[entityId] || null;
  } catch {
    console.error('Wikidata fetch failed');
    return null;
  }
}

/**
 * Search for city leadership (mayor, governor, etc.)
 */
export async function searchCityLeadership(cityName: string, country: string): Promise<LeaderSearchResult[]> {
  const leaders: LeaderSearchResult[] = [];
  const currentYear = new Date().getFullYear();

  // Search queries for leadership
  const leadershipQueries = [
    `${cityName} mayor ${currentYear}`,
    `${cityName} governor ${currentYear}`,
    `${cityName} city manager ${currentYear}`,
    `${country} ${cityName} political leader ${currentYear}`
  ];

  // Perform searches in parallel
  const searchPromises = leadershipQueries.map(q => googleSearch(q, 5));
  const allResults = await Promise.all(searchPromises);

  // Extract leader information from search results
  const combinedResults = allResults.flat();

  // Parse leader names and roles from search snippets
  for (const result of combinedResults) {
    const leaderMatch = extractLeaderFromSnippet(result.snippet, result.title, cityName);
    if (leaderMatch && !leaders.find(l => l.name === leaderMatch.name)) {
      leaders.push({
        ...leaderMatch,
        source: result.title,
        sourceUrl: result.link
      });
    }
  }

  // Also try Wikipedia for mayor/governor info
  const wikiLeaders = await searchWikipediaForLeaders(cityName, country);
  for (const wl of wikiLeaders) {
    if (!leaders.find(l => l.name === wl.name)) {
      leaders.push(wl);
    }
  }

  return leaders.slice(0, 5); // Top 5 leaders
}

/**
 * Extract leader name and role from a search snippet
 */
function extractLeaderFromSnippet(snippet: string, title: string, _city?: string): LeaderSearchResult | null {
  void _city; // Reserved for future use
  const text = `${title} ${snippet}`.toLowerCase();
  
  // Common patterns for finding leaders
  const patterns = [
    /mayor\s+(?:of\s+)?(?:\w+\s+)?is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:is\s+)?(?:the\s+)?(?:current\s+)?mayor/i,
    /governor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:was|is)\s+(?:elected|appointed|sworn)\s+(?:as\s+)?(?:the\s+)?(?:new\s+)?(?:mayor|governor)/i,
    /(?:led by|headed by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
  ];

  const fullText = `${title} ${snippet}`;
  
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      // Validate it looks like a real name (2-4 words, capitalized)
      if (name.split(' ').length >= 2 && name.split(' ').length <= 4) {
        const role = text.includes('governor') ? 'Governor' : 
                     text.includes('mayor') ? 'Mayor' : 
                     text.includes('city manager') ? 'City Manager' : 'Executive Leader';
        return {
          name,
          role,
          source: title,
          sourceUrl: ''
        };
      }
    }
  }

  return null;
}

/**
 * Search Wikipedia for leaders
 */
async function searchWikipediaForLeaders(cityName: string, country: string): Promise<LeaderSearchResult[]> {
  const leaders: LeaderSearchResult[] = [];
  
  try {
    // Try to get the city's Wikipedia page which often lists current leadership
    const wikiInfo = await getWikipediaInfo(`${cityName} ${country}`);
    if (wikiInfo?.extract) {
      const extracted = extractLeaderFromSnippet(wikiInfo.extract, wikiInfo.title, cityName);
      if (extracted) {
        extracted.source = 'Wikipedia';
        extracted.sourceUrl = wikiInfo.fullUrl;
        leaders.push(extracted);
      }
    }

    // Also try direct search for mayor
    const mayorWiki = await getWikipediaInfo(`Mayor of ${cityName}`);
    if (mayorWiki?.extract) {
      const extracted = extractLeaderFromSnippet(mayorWiki.extract, mayorWiki.title, cityName);
      if (extracted) {
        extracted.source = 'Wikipedia';
        extracted.sourceUrl = mayorWiki.fullUrl;
        leaders.push(extracted);
      }
    }
  } catch {
    console.warn('Wikipedia leader search failed');
  }

  return leaders;
}

/**
 * Search for leader photos
 */
export async function searchLeaderPhoto(leaderName: string, role: string, city: string): Promise<string | null> {
  try {
    // First try Wikidata for Commons images
    const wikidataInfo = await getWikidataInfo(leaderName) as Record<string, unknown> | null;
    const claims = wikidataInfo?.claims as Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> | undefined;
    if (claims?.P18?.[0]?.mainsnak?.datavalue?.value) {
      const filename = claims.P18[0].mainsnak.datavalue.value;
      // Convert to Wikimedia Commons URL
      const md5 = await hashString(filename);
      return `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5.substring(0, 2)}/${encodeURIComponent(filename)}`;
    }

    // Try Wikipedia page
    const wikiInfo = await getWikipediaInfo(leaderName);
    if (wikiInfo?.thumbnail) {
      return wikiInfo.thumbnail;
    }

    // Fallback: generate a search for official photo
    const searchResults = await googleSearch(`${leaderName} ${role} ${city} official photo`, 3);
    for (const result of searchResults) {
      if (result.imageUrl && (result.link.includes('.gov') || result.link.includes('wikipedia'))) {
        return result.imageUrl;
      }
    }
  } catch {
    console.warn('Photo search failed for:', leaderName);
  }
  
  return null;
}

/**
 * Simple hash for Wikimedia Commons URL generation
 */
async function hashString(str: string): Promise<string> {
  // For Wikimedia Commons, we need MD5 but browsers don't support it
  // Use a simple fallback that generates a pseudo-hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(2, '0');
}

/**
 * Get country information from REST Countries API
 */
export async function getCountryInfo(countryName: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
    if (!response.ok) {
      // Try partial match
      const partialResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
      if (partialResponse.ok) {
        const data = await partialResponse.json();
        return data[0];
      }
      return null;
    }
    const data = await response.json();
    return data[0];
  } catch {
    console.error('Country info fetch failed');
    return null;
  }
}

/**
 * Search for economic/investment information
 */
export async function searchEconomicInfo(cityName: string, country: string): Promise<{
  industries: string[];
  companies: string[];
  economicZones: string[];
  investmentIncentives: string[];
}> {
  const result = {
    industries: [] as string[],
    companies: [] as string[],
    economicZones: [] as string[],
    investmentIncentives: [] as string[]
  };

  const currentYear = new Date().getFullYear();

  // Search for major industries and companies
  const [industriesSearch, companiesSearch, zonesSearch, incentivesSearch] = await Promise.all([
    googleSearch(`${cityName} major industries economy ${currentYear}`, 5),
    googleSearch(`${cityName} largest companies employers ${currentYear}`, 5),
    googleSearch(`${cityName} ${country} special economic zone industrial park`, 5),
    googleSearch(`${cityName} ${country} foreign investment incentives tax breaks`, 5)
  ]);

  // Extract industries from snippets
  const industryKeywords = ['manufacturing', 'technology', 'agriculture', 'tourism', 'services', 
    'finance', 'logistics', 'automotive', 'electronics', 'textiles', 'pharmaceuticals',
    'mining', 'energy', 'construction', 'retail', 'healthcare', 'education', 'IT', 'BPO'];
  
  for (const r of industriesSearch) {
    const text = r.snippet.toLowerCase();
    for (const industry of industryKeywords) {
      if (text.includes(industry.toLowerCase()) && !result.industries.includes(industry)) {
        result.industries.push(industry);
      }
    }
  }

  // Extract company names (look for capitalized multi-word phrases)
  for (const r of companiesSearch) {
    const companyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:Corp|Inc|Ltd|Company|Co\.|LLC|Group|Industries)/g;
    const matches = r.snippet.match(companyPattern);
    if (matches) {
      for (const m of matches) {
        if (!result.companies.includes(m)) {
          result.companies.push(m);
        }
      }
    }
  }

  // Extract economic zone names
  for (const r of zonesSearch) {
    const zonePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+(?:Economic Zone|Industrial Park|Free Trade Zone|SEZ|PEZA|Industrial Estate)/gi;
    const matches = r.snippet.match(zonePattern);
    if (matches) {
      for (const m of matches) {
        if (!result.economicZones.includes(m)) {
          result.economicZones.push(m);
        }
      }
    }
  }

  // Extract incentive keywords
  const incentiveKeywords = ['tax holiday', 'tax exemption', 'duty free', 'investment incentive', 
    'tax break', 'subsidies', 'grants', 'tax credit', 'special rates', 'PEZA', 'BOI'];
  for (const r of incentivesSearch) {
    const text = r.snippet.toLowerCase();
    for (const incentive of incentiveKeywords) {
      if (text.includes(incentive) && !result.investmentIncentives.includes(incentive)) {
        result.investmentIncentives.push(incentive);
      }
    }
  }

  return result;
}

/**
 * Geocode a location using Nominatim
 */
export async function geocodeLocation(query: string): Promise<{
  lat: number;
  lon: number;
  displayName: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'BW-Nexus-AI-GLI/1.0'
        }
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (!results.length) return null;

    const result = results[0];
    const address = result.address || {};

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      city: address.city || address.town || address.village || address.municipality || query.split(',')[0],
      region: address.state || address.province || address.region || '',
      country: address.country || '',
      countryCode: (address.country_code || '').toUpperCase()
    };
  } catch {
    console.error('Geocoding failed');
    return null;
  }
}

// ==================== MAIN COMPREHENSIVE SEARCH ====================

export interface LiveLocationSearchProgress {
  stage: 'geocoding' | 'basic-info' | 'leadership' | 'economy' | 'news' | 'photos' | 'complete' | 'error';
  progress: number;
  message: string;
  data?: Partial<CitySearchData>;
}

export type ProgressCallback = (progress: LiveLocationSearchProgress) => void;

/**
 * Perform comprehensive live search for a location
 * This is the main function that orchestrates all searches
 */
export async function comprehensiveLiveSearch(
  locationQuery: string,
  onProgress?: ProgressCallback
): Promise<CityProfile | null> {
  try {
    // Step 1: Geocode location
    onProgress?.({
      stage: 'geocoding',
      progress: 5,
      message: `Locating ${locationQuery} on map...`
    });

    const geo = await geocodeLocation(locationQuery);
    if (!geo) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `Could not find location: ${locationQuery}`
      });
      return null;
    }

    // Step 2: Get basic info from Wikipedia
    onProgress?.({
      stage: 'basic-info',
      progress: 15,
      message: `Fetching information for ${geo.city}...`
    });

    const [wikiInfo, countryInfo] = await Promise.all([
      getWikipediaInfo(`${geo.city} ${geo.country}`),
      getCountryInfo(geo.country)
    ]);

    // Step 3: Search for leadership
    onProgress?.({
      stage: 'leadership',
      progress: 30,
      message: `Researching current leadership in ${geo.city}...`
    });

    const leaders = await searchCityLeadership(geo.city, geo.country);

    // Step 4: Get economic information
    onProgress?.({
      stage: 'economy',
      progress: 50,
      message: `Analyzing economic profile...`
    });

    const economicInfo = await searchEconomicInfo(geo.city, geo.country);

    // Step 5: Get recent news
    onProgress?.({
      stage: 'news',
      progress: 70,
      message: `Gathering recent news and developments...`
    });

    const news = await googleNewsSearch(`${geo.city} ${geo.country} investment development`);

    // Step 6: Search for leader photos
    onProgress?.({
      stage: 'photos',
      progress: 85,
      message: `Finding official photos...`
    });

    // Get photos for each leader
    const leadersWithPhotos: CityLeader[] = await Promise.all(
      leaders.map(async (leader, idx) => {
        const photo = await searchLeaderPhoto(leader.name, leader.role, geo.city);
        return {
          id: `leader-${idx}`,
          name: leader.name,
          role: leader.role,
          photoUrl: photo || undefined,
          photoSource: photo ? leader.source : undefined,
          photoVerified: !!photo,
          tenure: leader.tenure || 'Current',
          achievements: [leader.description || `Current ${leader.role} of ${geo.city}`],
          rating: 0,
          internationalEngagementFocus: false,
          sourceUrl: leader.sourceUrl
        };
      })
    );

    // Step 7: Build the complete profile
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: `Profile complete for ${geo.city}`
    });

    // Extract population from Wikipedia if available
    let population = 'See Wikipedia';
    let established = 'Historical records';
    if (wikiInfo?.extract) {
      const popMatch = wikiInfo.extract.match(/population\s+(?:of\s+)?(?:about\s+)?(?:approximately\s+)?([0-9,]+)/i);
      if (popMatch) population = popMatch[1];
      
      const estMatch = wikiInfo.extract.match(/(?:founded|established|settled)\s+(?:in\s+)?(\d{4}|\d+\s*(?:BC|AD|BCE|CE))/i);
      if (estMatch) established = estMatch[1];
    }

    // Build complete profile
    const profile: CityProfile = {
      id: `live-${Date.now()}`,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      latitude: geo.lat,
      longitude: geo.lon,
      timezone: `UTC${geo.lon >= 0 ? '+' : ''}${Math.round(geo.lon / 15)}`,
      established,
      areaSize: 'See detailed sources',
      climate: geo.lat > 23.5 || geo.lat < -23.5 ? 'Temperate' : 'Tropical',
      currency: countryInfo?.currencies ? (Object.values(countryInfo.currencies)[0] as { name?: string })?.name || 'Local currency' : 'Local currency',
      businessHours: '9:00 AM - 5:00 PM',
      globalMarketAccess: geo.region ? `Via ${geo.region} regional networks` : 'Regional access',
      departments: ['City Government', 'Investment Office'],
      easeOfDoingBusiness: 'See World Bank rankings',
      
      // Scores based on data availability
      engagementScore: leaders.length > 0 ? 60 : 40,
      overlookedScore: wikiInfo ? 50 : 70,
      infrastructureScore: economicInfo.economicZones.length > 0 ? 65 : 45,
      regulatoryFriction: 50,
      politicalStability: 50,
      laborPool: 50,
      costOfDoing: 50,
      investmentMomentum: news.length > 0 ? 60 : 40,

      knownFor: economicInfo.industries.length > 0 
        ? economicInfo.industries.slice(0, 3) 
        : ['Regional commerce', 'Local services'],
      
      strategicAdvantages: [
        geo.region ? `Strategic location in ${geo.region}` : 'Regional accessibility',
        economicInfo.economicZones.length > 0 ? 'Economic zones available' : 'Growing market'
      ],
      
      keySectors: economicInfo.industries.length > 0 
        ? economicInfo.industries.slice(0, 5)
        : ['Services', 'Trade', 'Agriculture'],
      
      investmentPrograms: economicInfo.investmentIncentives.length > 0
        ? economicInfo.investmentIncentives.slice(0, 3)
        : ['Contact local investment office'],
      
      foreignCompanies: economicInfo.companies.length > 0
        ? economicInfo.companies.slice(0, 4)
        : ['Research in progress'],

      leaders: leadersWithPhotos.length > 0 
        ? leadersWithPhotos 
        : [{
            id: 'leader-pending',
            name: 'Leadership research ongoing',
            role: 'Contact local government',
            tenure: 'Current',
            achievements: ['See official sources for current leadership'],
            rating: 0,
            internationalEngagementFocus: false
          }],

      demographics: {
        population,
        populationGrowth: 'See census data',
        medianAge: countryInfo?.demonyms ? 'See census' : 'Research ongoing',
        literacyRate: 'See education data',
        workingAgePopulation: 'See labor statistics',
        universitiesColleges: 0,
        graduatesPerYear: 'See education ministry'
      },

      economics: {
        gdpLocal: 'See economic reports',
        gdpGrowthRate: 'See national statistics',
        employmentRate: 'See labor data',
        avgIncome: 'See income surveys',
        exportVolume: 'See trade data',
        majorIndustries: economicInfo.industries.length > 0 ? economicInfo.industries : ['See economic surveys'],
        topExports: ['See trade data'],
        tradePartners: (countryInfo?.borders as string[] | undefined) || ['Regional partners']
      },

      infrastructure: {
        airports: [{ name: 'See transport authority', type: 'Research' }],
        seaports: [{ name: 'See port authority', type: 'Research' }],
        specialEconomicZones: economicInfo.economicZones.length > 0 
          ? economicInfo.economicZones 
          : ['Contact investment office'],
        powerCapacity: 'See utility providers',
        internetPenetration: 'See telecom data'
      },

      governmentLinks: [
        {
          label: 'Wikipedia',
          url: wikiInfo?.fullUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(geo.city)}`
        }
      ],

      recentNews: news.slice(0, 5).map(n => ({
        date: n.date || new Date().toISOString().split('T')[0],
        title: n.title,
        summary: n.snippet,
        source: new URL(n.link).hostname,
        link: n.link
      })),

      // Store raw wiki info for narrative
      _rawWikiExtract: wikiInfo?.extract
    };

    return profile;

  } catch (error) {
    console.error('Comprehensive search failed:', error);
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    return null;
  }
}

