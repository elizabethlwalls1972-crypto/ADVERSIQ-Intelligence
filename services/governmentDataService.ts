/**
 * 
 * GOVERNMENT DATA & REGIONAL COMPARISON SERVICE
 * 
 * 
 * Real-time integration for:
 * 1. Current government leadership (presidents, governors, mayors, ministers)
 * 2. Government contact information and websites
 * 3. Regional comparison metrics across nearby locations
 * 4. Cross-country benchmarking data
 */

import { CityProfile } from '../data/globalLocationProfiles';

export interface GovernmentLeader {
  name: string;
  title: string;
  role: string;
  tenure: string;
  party?: string;
  email?: string;
  office?: string;
  website?: string;
  photoUrl?: string;
  imageUrl?: string; // Alias for photoUrl for compatibility
  verified: boolean;
  sourceUrl: string;
  lastUpdated: string;
  photoSourceUrl?: string; // Source of the photo
}

export interface GovernmentOffice {
  name: string;
  type: 'national' | 'regional' | 'local';
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface RegionalComparison {
  metric: string;
  currentLocation: {
    value: number | string;
    rank?: number; // rank among nearby locations
  };
  regionalAverage: number | string;
  regionalBest: {
    location: string;
    value: number | string;
  };
  regionalWorst: {
    location: string;
    value: number | string;
  };
  percentilRank?: number; // 0-100, where 100 is best
}

export interface RegionalComparisonSet {
  location: string;
  comparisons: RegionalComparison[];
  nearbyLocations: Array<{
    city: string;
    country: string;
    distance_km: number;
  }>;
  dataFreshness: string;
}

// Cache for government data to reduce API calls
const governmentDataCache = new Map<string, { data: GovernmentLeader[]; timestamp: number }>();
const regionalComparisonCache = new Map<string, { data: RegionalComparisonSet; timestamp: number }>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch current government leaders for a location
 * Sources: Wikipedia, Wikidata, Government websites, REST Countries API
 */
export async function fetchGovernmentLeaders(
  city: string,
  country: string
): Promise<GovernmentLeader[]> {
  const cacheKey = `${city}:${country}`;
  
  // Check cache first
  const cached = governmentDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const leaders: GovernmentLeader[] = [];

    // 1. Try Wikidata API for government leaders
    const wikidataResults = await fetchWikidataGovernment(country);
    leaders.push(...wikidataResults);

    // 2. Try REST Countries API for national government
    if (leaders.length === 0) {
      const countryData = await fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(r => r.json())
        .catch(() => []);
      
      if (Array.isArray(countryData) && countryData.length > 0) {
        const country_obj = countryData[0];
        // Extract government info if available
        if (country_obj.capital) {
          leaders.push({
            name: `Government of ${country}`,
            title: 'National Government',
            role: 'Head of State / Government',
            tenure: 'Current administration',
            website: country_obj.maps?.googleMaps || undefined,
            verified: false,
            sourceUrl: 'https://restcountries.com',
            lastUpdated: new Date().toISOString()
          });
        }
      }
    }

    // 3. Try Wikipedia for city/regional leaders
    const wikiLeaders = await fetchWikipediaGovernment(city, country);
    leaders.push(...wikiLeaders);

    // Cache the results
    governmentDataCache.set(cacheKey, { data: leaders, timestamp: Date.now() });
    
    return leaders;
  } catch (error) {
    console.error('Error fetching government leaders:', error);
    return [];
  }
}

/**
 * Fetch Wikidata government information
 */
async function fetchWikidataGovernment(country: string): Promise<GovernmentLeader[]> {
  try {
    // Query for heads of government and state
    const sparqlQuery = `
      SELECT ?person ?personLabel ?position ?positionLabel ?startDate ?endDate WHERE {
        ?country wdt:P131 wd:${getCountryWikidataId(country)}.
        ?person wdt:P39 ?position.
        ?position rdfs:label ?positionLabel.
        ?person rdfs:label ?personLabel.
        OPTIONAL { ?person wdt:P580 ?startDate }
        OPTIONAL { ?person wdt:P582 ?endDate }
        FILTER (LANG(?personLabel) = "en")
        FILTER (LANG(?positionLabel) = "en")
      }
      LIMIT 10
    `;

    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`
    ).then(r => r.json()).catch(() => ({ results: { bindings: [] } }));

    const leaders: GovernmentLeader[] = [];
    
    if (response.results?.bindings) {
      response.results.bindings.forEach((binding: Record<string, Record<string, string>>) => {
        leaders.push({
          name: binding.personLabel?.value || 'Unknown',
          title: binding.positionLabel?.value || 'Government Official',
          role: binding.positionLabel?.value || 'Official',
          tenure: formatWikidataTenure(binding.startDate?.value, binding.endDate?.value),
          verified: true,
          sourceUrl: `https://www.wikidata.org/wiki/${extractId(binding.person?.value)}`,
          lastUpdated: new Date().toISOString()
        });
      });
    }

    return leaders;
  } catch (error) {
    console.warn('Wikidata government fetch failed:', error);
    return [];
  }
}

/**
 * Fetch Wikipedia government information
 */
async function fetchWikipediaGovernment(city: string, country: string): Promise<GovernmentLeader[]> {
  try {
    // Search for city and government-related articles
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        `${city} ${country} mayor governor president`
      )}&format=json&origin=*`
    ).then(r => r.json()).catch(() => ({ query: { search: [] } }));

    const leaders: GovernmentLeader[] = [];

    if (searchResponse.query?.search) {
      // Get details from top results
      const topResults = searchResponse.query.search.slice(0, 3); // Check top 3 results

      for (const result of topResults) {
        const pageResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            result.title
          )}&prop=extracts|pageimages&explaintext=true&piprop=original&format=json&origin=*`
        ).then(r => r.json()).catch(() => ({ query: { pages: {} } }));

        const pages = pageResponse.query?.pages || {};
        const pageId = Object.keys(pages)[0];

        if (pageId && pages[pageId]?.extract) {
          const extract = pages[pageId].extract;
          const imageUrl = pages[pageId]?.original?.source;

          // Try to extract current mayor/governor/leader
          const mayorMatch = extract.match(/(?:Mayor|Governor|President|Prime Minister)(?:.*?)is\s+([A-Z][a-z\s]+)/i);
          if (mayorMatch) {
            const leaderName = mayorMatch[1].trim();
            const title = mayorMatch[0].split(/\s+/)[0];

            // Try to get photo for this leader
            let photoUrl = imageUrl;
            if (!photoUrl && leaderName) {
              // Try to get photo from leader's Wikipedia page
              try {
                const leaderPageResponse = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(leaderName)}&prop=pageimages&piprop=original&format=json&origin=*`
                ).then(r => r.json()).catch(() => ({ query: { pages: {} } }));

                const leaderPages = leaderPageResponse.query?.pages || {};
                const leaderPageId = Object.keys(leaderPages)[0];
                if (leaderPageId && leaderPages[leaderPageId]?.original?.source) {
                  photoUrl = leaderPages[leaderPageId].original.source;
                }
              } catch (photoError) {
                console.warn('Failed to fetch leader photo:', photoError);
              }
            }

            leaders.push({
              name: leaderName,
              title: title,
              role: title,
              tenure: 'Current',
              photoUrl: photoUrl,
              imageUrl: photoUrl, // Alias for compatibility
              photoSourceUrl: photoUrl ? `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}` : undefined,
              verified: true,
              sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }

    return leaders;
  } catch (error) {
    console.warn('Wikipedia government fetch failed:', error);
    return [];
  }
}

/**
 * Get regional comparison metrics for a location
 */
export async function getRegionalComparisons(
  profile: CityProfile,
  nearbyLocations: CityProfile[]
): Promise<RegionalComparisonSet> {
  const cacheKey = `${profile.city}:${profile.country}`;
  
  // Check cache first
  const cached = regionalComparisonCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const comparisons: RegionalComparison[] = [];

  // Infrastructure Score Comparison
  if (profile.infrastructureScore !== undefined) {
    const infraScores = nearbyLocations
      .map(l => ({ city: l.city, score: l.infrastructureScore || 50 }))
      .sort((a, b) => b.score - a.score);
    
    comparisons.push({
      metric: 'Infrastructure Score',
      currentLocation: {
        value: profile.infrastructureScore,
        rank: infraScores.findIndex(l => l.city === profile.city) + 1
      },
      regionalAverage: Math.round(
        infraScores.reduce((sum, l) => sum + l.score, 0) / infraScores.length
      ),
      regionalBest: {
        location: infraScores[0]?.city || 'N/A',
        value: infraScores[0]?.score || 0
      },
      regionalWorst: {
        location: infraScores[infraScores.length - 1]?.city || 'N/A',
        value: infraScores[infraScores.length - 1]?.score || 0
      },
      percentilRank: Math.round(
        ((infraScores.length - (infraScores.findIndex(l => l.city === profile.city) + 1)) / infraScores.length) * 100
      )
    });
  }

  // Political Stability Comparison
  if (profile.politicalStability !== undefined) {
    const stabScores = nearbyLocations
      .map(l => ({ city: l.city, score: l.politicalStability || 50 }))
      .sort((a, b) => b.score - a.score);
    
    comparisons.push({
      metric: 'Political Stability',
      currentLocation: {
        value: profile.politicalStability,
        rank: stabScores.findIndex(l => l.city === profile.city) + 1
      },
      regionalAverage: Math.round(
        stabScores.reduce((sum, l) => sum + l.score, 0) / stabScores.length
      ),
      regionalBest: {
        location: stabScores[0]?.city || 'N/A',
        value: stabScores[0]?.score || 0
      },
      regionalWorst: {
        location: stabScores[stabScores.length - 1]?.city || 'N/A',
        value: stabScores[stabScores.length - 1]?.score || 0
      },
      percentilRank: Math.round(
        ((stabScores.length - (stabScores.findIndex(l => l.city === profile.city) + 1)) / stabScores.length) * 100
      )
    });
  }

  // Investment Momentum Comparison
  if (profile.investmentMomentum !== undefined) {
    const momScores = nearbyLocations
      .map(l => ({ city: l.city, score: l.investmentMomentum || 50 }))
      .sort((a, b) => b.score - a.score);
    
    comparisons.push({
      metric: 'Investment Momentum',
      currentLocation: {
        value: profile.investmentMomentum,
        rank: momScores.findIndex(l => l.city === profile.city) + 1
      },
      regionalAverage: Math.round(
        momScores.reduce((sum, l) => sum + l.score, 0) / momScores.length
      ),
      regionalBest: {
        location: momScores[0]?.city || 'N/A',
        value: momScores[0]?.score || 0
      },
      regionalWorst: {
        location: momScores[momScores.length - 1]?.city || 'N/A',
        value: momScores[momScores.length - 1]?.score || 0
      },
      percentilRank: Math.round(
        ((momScores.length - (momScores.findIndex(l => l.city === profile.city) + 1)) / momScores.length) * 100
      )
    });
  }

  // Labor Pool Comparison
  if (profile.laborPool !== undefined) {
    const laborScores = nearbyLocations
      .map(l => ({ city: l.city, score: l.laborPool || 50 }))
      .sort((a, b) => b.score - a.score);
    
    comparisons.push({
      metric: 'Labor Pool Quality',
      currentLocation: {
        value: profile.laborPool,
        rank: laborScores.findIndex(l => l.city === profile.city) + 1
      },
      regionalAverage: Math.round(
        laborScores.reduce((sum, l) => sum + l.score, 0) / laborScores.length
      ),
      regionalBest: {
        location: laborScores[0]?.city || 'N/A',
        value: laborScores[0]?.score || 0
      },
      regionalWorst: {
        location: laborScores[laborScores.length - 1]?.city || 'N/A',
        value: laborScores[laborScores.length - 1]?.score || 0
      },
      percentilRank: Math.round(
        ((laborScores.length - (laborScores.findIndex(l => l.city === profile.city) + 1)) / laborScores.length) * 100
      )
    });
  }

  const comparisonSet: RegionalComparisonSet = {
    location: `${profile.city}, ${profile.country}`,
    comparisons,
    nearbyLocations: nearbyLocations.map(l => ({
      city: l.city,
      country: l.country,
      distance_km: calculateDistance(
        profile.latitude || 0,
        profile.longitude || 0,
        l.latitude || 0,
        l.longitude || 0
      )
    })).sort((a, b) => a.distance_km - b.distance_km),
    dataFreshness: new Date().toISOString()
  };

  // Cache the result
  regionalComparisonCache.set(cacheKey, { data: comparisonSet, timestamp: Date.now() });

  return comparisonSet;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Get Wikidata country ID (simplified - just a few key countries)
 */
function getCountryWikidataId(country: string): string {
  const countryMap: Record<string, string> = {
    'Philippines': 'Q928',
    'United States': 'Q30',
    'Japan': 'Q17',
    'Australia': 'Q408',
    'United Kingdom': 'Q145',
    'Germany': 'Q183',
    'France': 'Q142',
    'India': 'Q668',
    'China': 'Q148',
    'Brazil': 'Q155'
  };
  return countryMap[country] || 'Q0'; // Q0 is used when country has no explicit mapping
}

/**
 * Extract ID from Wikidata URL
 */
function extractId(url: string): string {
  const match = url?.match(/Q\d+/);
  return match ? match[0] : 'unknown';
}

/**
 * Format Wikidata tenure information
 */
function formatWikidataTenure(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Current';
  
  const start = new Date(startDate).getFullYear();
  if (!endDate) return `Since ${start}`;
  
  const end = new Date(endDate).getFullYear();
  return `${start} - ${end}`;
}

/**
 * Clear cache (useful for manual refresh)
 */
export function clearGovernmentDataCache(): void {
  governmentDataCache.clear();
  regionalComparisonCache.clear();
}

