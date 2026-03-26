/**
 *
 * Location Intelligence Service Logic
 *
 * PRODUCTION-READY
 * This file previously contained AWS Bedrock location intelligence logic. All AWS-specific code has been removed.
 */

import { type CityProfile } from '../data/globalLocationProfiles';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// ==================== TYPES ====================

export interface LocationResult {
  profile: CityProfile;
  sources: string[];
  summary: string;
  dataQuality: number;
}

export interface ResearchProgress {
      overlookedScore: 50,
      leaders: ai?.governance?.leader ? [{
        id: `leader-${Date.now()}`,
        name: ai.governance.leader.name || 'Unknown',
        role: ai.governance.leader.title || 'Leader',
        tenure: ai.governance.leader.since || 'Unknown',
        achievements: [],
        rating: 0,
        internationalEngagementFocus: false
      }] : [],

      investmentPrograms: intelligence.investment.incentives,
      keySectors: intelligence.economy.mainIndustries,
      foreignCompanies: intelligence.economy.tradePartners,
      departments: intelligence.government.departments,
      easeOfDoingBusiness: intelligence.investment.easeOfBusiness,
      globalMarketAccess: intelligence.economy.tradePartners.join(', '),
      latitude: 0, // Would need geocoding
      longitude: 0,
      infrastructureScore: 70,
      regulatoryFriction: 40,
      politicalStability: 65,
      laborPool: 70,
      costOfDoing: 60,
      investmentMomentum: 65,
      engagementScore: 60,
      overlookedScore: 50,
      leaders: intelligence.government.leader ? [{
        id: `leader-${Date.now()}`,
        name: intelligence.government.leader.name,
        role: intelligence.government.leader.title,
        tenure: intelligence.government.leader.since,
        achievements: [],
        rating: 0,
        internationalEngagementFocus: false
      }] : [],
      economics: {
        gdpLocal: intelligence.economy.gdp,
        gdpGrowthRate: intelligence.economy.gdpGrowth,
        employmentRate: intelligence.economy.unemployment,
        avgIncome: intelligence.economy.averageIncome,
        majorIndustries: intelligence.economy.mainIndustries,
        tradePartners: intelligence.economy.tradePartners
      },
      demographics: {
        population: intelligence.demographics.population,
        populationGrowth: intelligence.demographics.populationGrowth,
        medianAge: intelligence.demographics.medianAge,
        literacyRate: intelligence.demographics.literacyRate,
        languages: intelligence.demographics.languages
      },
      infrastructure: {
        airports: (Array.isArray(intelligence.infrastructure.airports) ? intelligence.infrastructure.airports : [])
          .map((a: string | { name: string; type: string; routes?: string }) => typeof a === 'string' ? { name: a, type: 'Airport' } : a) || [],
        seaports: (Array.isArray(intelligence.infrastructure.seaports) ? intelligence.infrastructure.seaports : [])
          .map((s: string | { name: string; capacity?: string; type: string }) => typeof s === 'string' ? { name: s, type: 'Port' } : s) || [],
        powerCapacity: intelligence.infrastructure.powerCapacity,
        internetPenetration: intelligence.infrastructure.internetPenetration,
        specialEconomicZones: []
      },
      timezone: intelligence.geography.timezone,
      currency: intelligence.economy.currency,
      climate: intelligence.geography.climate,
      areaSize: intelligence.geography.area,
      businessHours: '9:00 AM - 5:00 PM',
      _rawWikiExtract: intelligence.overview.significance
    };

    onProgress?.({ stage: 'Complete', progress: 100, message: 'AI research complete!' });

    return {
      profile,
      sources: ['OpenAI GPT-4', 'Real-time Intelligence Analysis'],
      summary: intelligence.overview.significance,
      dataQuality: 95
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[OpenAI] AI research failed:', errorMessage);
    onProgress?.({ stage: 'Fallback', progress: 10, message: 'AI unavailable, using public data...' });
    return null;
  }
}

// ==================== CLIENT-SIDE FALLBACK (NO BACKEND REQUIRED) ====================

async function fetchLocationIntelligenceClientSide(
  query: string,
  onProgress?: (progress: ResearchProgress) => void
): Promise<LocationResult | null> {
  try {
    console.log('[Client] Starting client-side research for:', query);
    onProgress?.({ stage: 'Geocoding', progress: 10, message: 'Looking up location...' });

    // 1. Geocoding from OpenStreetMap Nominatim (free, no API key)
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`,
      { headers: { 'User-Agent': 'BWGA-Intelligence/1.0' } }
    );
    const geoData = await geoResponse.json();
    console.log('[Client] Geo data:', geoData);
    const geo = geoData[0];
    
    if (!geo) {
      console.error('[Client] Geocoding failed - no results for:', query);
      throw new Error(`Location not found: "${query}"`);
    }
    
    console.log('[Client] Geocoding successful:', geo.address?.country, geo.address?.state);

    const countryCode = (geo.address?.country_code || '').toUpperCase();
    const countryName = geo.address?.country || '';

    onProgress?.({ stage: 'Wikipedia', progress: 25, message: 'Fetching Wikipedia data...' });

    // 2. Wikipedia extract (free, no API key)
    let wikiExtract = '';
    try {
      const wikiSearchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`
      );
      const wikiSearchData = await wikiSearchRes.json();
      if (wikiSearchData.query?.search?.[0]) {
        const title = wikiSearchData.query.search[0].title;
        const extractRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&format=json&origin=*`
        );
        const extractData = await extractRes.json();
        const pages = extractData.query?.pages;
        const page = Object.values(pages)[0] as { extract?: string };
        wikiExtract = page?.extract?.substring(0, 2000) || '';
      }
    } catch (e) {
      console.warn('[Client] Wikipedia failed:', e);
    }

    onProgress?.({ stage: 'Economic Data', progress: 45, message: 'Fetching economic indicators...' });

    // 3. World Bank data (free, no API key)
    const worldBankIndicators = [
      { code: 'NY.GDP.MKTP.CD', name: 'gdp' },
      { code: 'NY.GDP.MKTP.KD.ZG', name: 'gdpGrowth' },
      { code: 'NY.GDP.PCAP.CD', name: 'gdpPerCapita' },
      { code: 'SP.POP.TOTL', name: 'population' },
      { code: 'SL.UEM.TOTL.ZS', name: 'unemployment' },
      { code: 'IT.NET.USER.ZS', name: 'internetUsers' }
    ];
    
    const economicData: Record<string, number> = {};
    if (countryCode) {
      await Promise.all(worldBankIndicators.map(async (ind) => {
        try {
          const res = await fetch(
            `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind.code}?format=json&per_page=1`
          );
          const data = await res.json();
          if (data[1]?.[0]?.value !== null && data[1]?.[0]?.value !== undefined) {
            economicData[ind.name] = data[1][0].value;
          }
        } catch { /* ignore individual failures */ }
      }));
    }

    onProgress?.({ stage: 'Country Data', progress: 65, message: 'Fetching country information...' });

    // 4. REST Countries data (free, no API key)
    let countryInfo: {
      name?: { common: string; official: string };
      capital?: string[];
      population?: number;
      area?: number;
      region?: string;
      subregion?: string;
      languages?: Record<string, string>;
      currencies?: Record<string, { name: string; symbol: string }>;
      timezones?: string[];
      flags?: { svg: string; png: string };
      maps?: { googleMaps: string };
    } = {};
    
    if (countryCode) {
      try {
        const countryRes = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,capital,population,area,region,subregion,languages,currencies,timezones,flags,maps`
        );
        if (countryRes.ok) {
          countryInfo = await countryRes.json();
        }
      } catch { /* ignore */ }
    }

    onProgress?.({ stage: 'Building Report', progress: 85, message: 'Compiling intelligence report...' });

    // Format helpers
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
      if (num >= 1e6) return `${(num / 1e6).toFixed(1)} million`;
      return num.toLocaleString();
    };

    // Build profile from collected data
    const profile: CityProfile = {
      id: `client-${Date.now()}`,
      country: countryName,
      region: geo.address?.state || geo.address?.province || countryInfo?.subregion || 'Unknown',
      city: query,
      entityType: 'location',
      entityName: query,
      established: 'See historical records',
      knownFor: [],
      strategicAdvantages: [],
      investmentPrograms: [],
      keySectors: [],
      foreignCompanies: [],
      departments: [],
      easeOfDoingBusiness: 'See World Bank rankings',
      globalMarketAccess: countryInfo?.region || 'Regional access',
      latitude: parseFloat(geo.lat) || 0,
      longitude: parseFloat(geo.lon) || 0,
      infrastructureScore: 55,
      regulatoryFriction: 50,
      politicalStability: 60,
      laborPool: 65,
      costOfDoing: 55,
      investmentMomentum: 50,
      engagementScore: 50,
      overlookedScore: 50,
      leaders: [],
      economics: {
        gdpLocal: formatNumber(economicData.gdp),
        gdpGrowthRate: economicData.gdpGrowth ? `${economicData.gdpGrowth.toFixed(2)}%` : 'N/A',
        employmentRate: economicData.unemployment ? `${economicData.unemployment.toFixed(1)}% unemployment` : 'N/A',
        avgIncome: formatNumber(economicData.gdpPerCapita),
        majorIndustries: [],
        tradePartners: []
      },
      demographics: {
        population: formatPopulation(countryInfo?.population || economicData.population),
        populationGrowth: 'N/A',
        medianAge: 'N/A',
        literacyRate: 'N/A',
        languages: countryInfo?.languages ? Object.values(countryInfo.languages) : []
      },
      infrastructure: {
        airports: [],
        seaports: [],
        powerCapacity: 'N/A',
        internetPenetration: economicData.internetUsers ? `${economicData.internetUsers.toFixed(1)}%` : 'N/A',
        specialEconomicZones: []
      },
      timezone: countryInfo?.timezones?.[0] || 'UTC',
      currency: countryInfo?.currencies 
        ? Object.values(countryInfo.currencies).map(c => `${c.name} (${c.symbol})`).join(', ')
        : 'N/A',
      climate: 'Varies by season',
      areaSize: countryInfo?.area ? `${countryInfo.area.toLocaleString()} km²` : 'N/A',
      businessHours: '9:00 AM - 5:00 PM',
      // flagUrl and googleMapsUrl removed to match CityProfile type
      _rawWikiExtract: wikiExtract
    };

    onProgress?.({ stage: 'Complete', progress: 100, message: 'Research complete!' });

    return {
      profile,
      sources: ['OpenStreetMap Nominatim', 'Wikipedia', 'World Bank', 'REST Countries'],
      summary: wikiExtract ? wikiExtract.split('.').slice(0, 2).join('.') + '.' : `Intelligence report for ${query}.`,
      dataQuality: 70
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Client] Direct API research failed:', errorMessage);
    console.error('[Client] Full error:', error);
    throw error;
  }
}

// ==================== MAIN RESEARCH FUNCTION ====================

export async function researchLocation(
  query: string,
  onProgress?: (progress: ResearchProgress) => void
): Promise<LocationResult | null> {
  
  console.log('[Location Service] Starting location research for:', query);
  
  // Try server-side endpoint first (has AI synthesis)
  if (API_BASE) {
    try {
      onProgress?.({ stage: 'Connecting', progress: 5, message: 'Connecting to intelligence server...' });

      const result = await withTimeout(
        fetchLocationIntelligenceFromServer(query, onProgress),
        15000, // 15 second timeout for server
        'Server timeout'
      );

      if (result) {
        console.log('[Location Service] Server research successful');
        return result;
      }
    } catch (error) {
      console.log('[Location Service] Server unavailable:', error instanceof Error ? error.message : error);
    }
  }

  // Try OpenAI directly (best fallback - real intelligence)
  try {
    onProgress?.({ stage: 'AI Research', progress: 5, message: 'Generating intelligence with AI...' });

    const result = await withTimeout(
      fetchLocationIntelligenceWithOpenAI(query, onProgress),
      25000, // 25 second timeout for OpenAI
      'OpenAI timeout'
    );

    if (result) {
      console.log('[Location Service] OpenAI research successful');
      return result;
    }
  } catch (error) {
    console.log('[Location Service] OpenAI unavailable:', error instanceof Error ? error.message : error);
  }

  // Final fallback: Free public APIs (basic data only) - THIS SHOULD ALWAYS WORK
  try {
    onProgress?.({ stage: 'Public Data', progress: 5, message: 'Researching with public data APIs...' });

    const result = await withTimeout(
      fetchLocationIntelligenceClientSide(query, onProgress),
      30000,
      'Request timed out - please try again'
    );

    if (result) {
      console.log('[Location Service] Client-side research successful');
      return result;
    }
    
    console.error('[Location Service] Client-side returned null');
    onProgress?.({ stage: 'Error', progress: 0, message: 'Location not found - try a different search term' });
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Location Service] All research methods failed:', errorMessage, error);
    
    if (errorMessage.includes('Location not found')) {
      onProgress?.({ stage: 'Error', progress: 0, message: 'Location not found - try a different search term' });
    } else if (errorMessage.includes('timeout')) {
      onProgress?.({ stage: 'Error', progress: 0, message: 'Request timed out - please try again' });
    } else {
      onProgress?.({ stage: 'Error', progress: 0, message: `Research failed: ${errorMessage}` });
    }
    
    return null;
  }
}

// ==================== EXPORT ====================

export default researchLocation;

