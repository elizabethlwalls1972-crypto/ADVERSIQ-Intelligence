/**
 * LIVE DATA SERVICE
 * 
 * Integrates real external APIs for live market intelligence:
 * - World Bank API: GDP, population, trade data
 * - Exchange Rate API: Live currency rates
 * - REST Countries: Country metadata
 * 
 * This replaces the pseudo-random seeded data with REAL data sources.
 */

export interface WorldBankIndicator {
  indicator: string;
  country: string;
  value: number | null;
  year: number;
  source: string;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
}

export interface CountryData {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  gdp: number | null;
  currencies: string[];
  languages: string[];
  timezones: string[];
  borders: string[];
  source: string;
}

export interface LiveMarketData {
  country: string;
  gdpCurrent: number | null;
  gdpGrowth: number | null;
  population: number | null;
  tradeBalance: number | null;
  fdiInflows: number | null;
  inflation: number | null;
  exchangeRate: number | null;
  easeOfBusiness?: number | null;
  unemployment?: number | null;
  lastUpdated: string;
  sources: string[];
}

// Cache to avoid excessive API calls
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour

const getCached = <T>(key: string): T | null => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  dataCache.set(key, { data, timestamp: Date.now() });
};

/**
 * WORLD BANK API
 * Free, no API key required
 * Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 */
export class WorldBankAPI {
  private static BASE_URL = 'https://api.worldbank.org/v2';
  
  // Indicator codes
  static INDICATORS = {
    GDP_CURRENT: 'NY.GDP.MKTP.CD',           // GDP (current US$)
    GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',         // GDP growth (annual %)
    POPULATION: 'SP.POP.TOTL',               // Population total
    TRADE_BALANCE: 'NE.RSB.GNFS.CD',         // Trade balance
    FDI_INFLOWS: 'BX.KLT.DINV.CD.WD',        // FDI net inflows
    INFLATION: 'FP.CPI.TOTL.ZG',             // Inflation (CPI %)
    UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',          // Unemployment (%)
    EASE_OF_BUSINESS: 'IC.BUS.EASE.XQ',      // Ease of doing business rank
  };

  static async getIndicator(countryCode: string, indicator: string): Promise<WorldBankIndicator | null> {
    const cacheKey = `wb-${countryCode}-${indicator}`;
    const cached = getCached<WorldBankIndicator>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.BASE_URL}/country/${countryCode}/indicator/${indicator}?format=json&date=2020:2024&per_page=5`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // World Bank returns [metadata, data] array
      if (!data[1] || data[1].length === 0) return null;
      
      // Get most recent non-null value
      const validEntry = data[1].find((entry: any) => entry.value !== null);
      if (!validEntry) return null;
      
      const result: WorldBankIndicator = {
        indicator: validEntry.indicator.id,
        country: validEntry.country.value,
        value: validEntry.value,
        year: parseInt(validEntry.date),
        source: 'World Bank Open Data API'
      };
      
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`World Bank API error for ${countryCode}/${indicator}:`, error);
      return null;
    }
  }

  static async getCountryProfile(countryCode: string): Promise<LiveMarketData> {
    const [gdpCurrent, gdpGrowth, population, tradeBalance, fdiInflows, inflation, easeOfBusiness, unemployment] = await Promise.all([
      this.getIndicator(countryCode, this.INDICATORS.GDP_CURRENT),
      this.getIndicator(countryCode, this.INDICATORS.GDP_GROWTH),
      this.getIndicator(countryCode, this.INDICATORS.POPULATION),
      this.getIndicator(countryCode, this.INDICATORS.TRADE_BALANCE),
      this.getIndicator(countryCode, this.INDICATORS.FDI_INFLOWS),
      this.getIndicator(countryCode, this.INDICATORS.INFLATION),
      this.getIndicator(countryCode, this.INDICATORS.EASE_OF_BUSINESS),
      this.getIndicator(countryCode, this.INDICATORS.UNEMPLOYMENT),
    ]);

    return {
      country: gdpCurrent?.country || countryCode,
      gdpCurrent: gdpCurrent?.value || null,
      gdpGrowth: gdpGrowth?.value || null,
      population: population?.value || null,
      tradeBalance: tradeBalance?.value || null,
      fdiInflows: fdiInflows?.value || null,
      inflation: inflation?.value || null,
      exchangeRate: null, // Filled by ExchangeRateAPI
      easeOfBusiness: easeOfBusiness?.value || null,
      unemployment: unemployment?.value || null,
      lastUpdated: new Date().toISOString(),
      sources: ['World Bank Open Data API']
    };
  }
}

/**
 * EXCHANGE RATE API
 * Free tier available
 * Using exchangerate-api.com (free, no key needed for basic)
 */
export class ExchangeRateAPI {
  private static BASE_URL = 'https://open.er-api.com/v6/latest';

  static async getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
    const cacheKey = `exchange-${baseCurrency}`;
    const cached = getCached<ExchangeRates>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.BASE_URL}/${baseCurrency}`);
      if (!response.ok) return null;

      const data = await response.json();
      
      const result: ExchangeRates = {
        base: data.base_code,
        date: data.time_last_update_utc,
        rates: data.rates,
        source: 'Open Exchange Rates API'
      };

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Exchange Rate API error:', error);
      return null;
    }
  }

  static async getRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    const rates = await this.getRates(fromCurrency);
    if (!rates) return null;
    return rates.rates[toCurrency] || null;
  }
}

/**
 * REST COUNTRIES API
 * Free, no API key required
 * https://restcountries.com/
 */
export class RestCountriesAPI {
  private static BASE_URL = 'https://restcountries.com/v3.1';

  static async getCountry(countryName: string): Promise<CountryData | null> {
    const cacheKey = `country-${countryName.toLowerCase()}`;
    const cached = getCached<CountryData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.BASE_URL}/name/${encodeURIComponent(countryName)}?fullText=false`);
      if (!response.ok) return null;

      const data = await response.json();
      if (!data || data.length === 0) return null;

      const country = data[0];
      
      const result: CountryData = {
        name: country.name?.common || countryName,
        capital: country.capital?.[0] || 'Unknown',
        region: country.region || 'Unknown',
        subregion: country.subregion || 'Unknown',
        population: country.population || 0,
        gdp: null, // Not available from this API
        currencies: Object.keys(country.currencies || {}),
        languages: Object.values(country.languages || {}),
        timezones: country.timezones || [],
        borders: country.borders || [],
        source: 'REST Countries API'
      };

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('REST Countries API error:', error);
      return null;
    }
  }

  static async getCountryCode(countryName: string): Promise<string | null> {
    const country = await this.getCountry(countryName);
    if (!country) return null;
    
    // Try to derive ISO code from name
    const codeMap: Record<string, string> = {
      'United States': 'USA',
      'United Kingdom': 'GBR',
      'Germany': 'DEU',
      'France': 'FRA',
      'Japan': 'JPN',
      'China': 'CHN',
      'India': 'IND',
      'Brazil': 'BRA',
      'Mexico': 'MEX',
      'Canada': 'CAN',
      'Australia': 'AUS',
      'South Korea': 'KOR',
      'Vietnam': 'VNM',
      'Indonesia': 'IDN',
      'Thailand': 'THA',
      'Malaysia': 'MYS',
      'Singapore': 'SGP',
      'Poland': 'POL',
      'Netherlands': 'NLD',
      'Spain': 'ESP',
      'Italy': 'ITA',
      'Saudi Arabia': 'SAU',
      'UAE': 'ARE',
      'South Africa': 'ZAF',
      'Nigeria': 'NGA',
      'Egypt': 'EGY',
      'Turkey': 'TUR',
      'Russia': 'RUS',
    };
    
    return codeMap[countryName] || countryName.substring(0, 3).toUpperCase();
  }
}

/**
 * UNIFIED DATA SERVICE
 * Combines all APIs into a single interface
 */
export class LiveDataService {
  /**
   * Get comprehensive live data for a country
   */
  static async getCountryIntelligence(countryName: string): Promise<{
    profile: CountryData | null;
    economics: LiveMarketData | null;
    currency: { rate: number; base: string } | null;
    dataQuality: {
      hasRealData: boolean;
      sources: string[];
      lastUpdated: string;
    };
  }> {
    const countryCode = await RestCountriesAPI.getCountryCode(countryName);
    
    const [profile, economics, exchangeRates] = await Promise.all([
      RestCountriesAPI.getCountry(countryName),
      countryCode ? WorldBankAPI.getCountryProfile(countryCode) : null,
      ExchangeRateAPI.getRates('USD')
    ]);

    const currencyCode = profile?.currencies[0];
    const currencyRate = currencyCode && exchangeRates ? exchangeRates.rates[currencyCode] : null;

    const sources: string[] = [];
    if (profile) sources.push('REST Countries API');
    if (economics?.gdpCurrent) sources.push('World Bank Open Data');
    if (exchangeRates) sources.push('Open Exchange Rates');

    return {
      profile,
      economics,
      currency: currencyRate ? { rate: currencyRate, base: 'USD' } : null,
      dataQuality: {
        hasRealData: sources.length > 0,
        sources,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Get real GDP data for Monte Carlo inputs
   */
  static async getRealGDP(countryName: string): Promise<number> {
    const countryCode = await RestCountriesAPI.getCountryCode(countryName);
    if (!countryCode) return 50_000_000_000; // Fallback: $50B
    
    const gdpData = await WorldBankAPI.getIndicator(countryCode, WorldBankAPI.INDICATORS.GDP_CURRENT);
    return gdpData?.value || 50_000_000_000;
  }

  /**
   * Get real population for scoring
   */
  static async getRealPopulation(countryName: string): Promise<number> {
    const countryCode = await RestCountriesAPI.getCountryCode(countryName);
    if (!countryCode) return 50_000_000; // Fallback: 50M
    
    const popData = await WorldBankAPI.getIndicator(countryCode, WorldBankAPI.INDICATORS.POPULATION);
    return popData?.value || 50_000_000;
  }

  /**
   * Get real FDI inflows for market sizing
   */
  static async getRealFDI(countryName: string): Promise<number> {
    const countryCode = await RestCountriesAPI.getCountryCode(countryName);
    if (!countryCode) return 10_000_000_000; // Fallback: $10B
    
    const fdiData = await WorldBankAPI.getIndicator(countryCode, WorldBankAPI.INDICATORS.FDI_INFLOWS);
    return fdiData?.value || 10_000_000_000;
  }
}

export default LiveDataService;

