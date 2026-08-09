/**
 * HISTORICAL DATA INTEGRATION MODULE
 * 
 * Provides intelligent data ingestion from multiple sources:
 * - CSV files with type inference
 * - JSON files with schema detection
 * - API endpoints with pagination and caching
 * - Data quality assessment and normalization
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ingestCSV, ingestJSON, ingestAPI, cleanData, assessDataQuality, normalizeData, aggregateData, clearCache, type DataRecord } from './etlPipeline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IngestionResult {
  status: 'success' | 'error';
  source: string;
  recordCount: number;
  data: DataRecord[];
  quality?: {
    qualityScore: number;
    issues: string[];
  };
  error?: string;
}

export async function ingestData(source: string): Promise<IngestionResult> {
  console.log(`ðŸ“¥ Ingesting data from: ${source}`);
  
  try {
    let rawData: DataRecord[];
    
    // Determine source type and ingest accordingly
    if (source.endsWith('.csv')) {
      rawData = await ingestCSV(source);
    } else if (source.endsWith('.json')) {
      rawData = await ingestJSON(source);
    } else if (source.startsWith('http://') || source.startsWith('https://')) {
      rawData = await ingestAPI(source);
    } else {
      // Try to find file in data folder
      const dataDir = path.resolve(__dirname, '../../data');
      
      // Try CSV first
      try {
        const csvPath = path.join(dataDir, `${source}.csv`);
        rawData = await ingestCSV(csvPath);
      } catch {
        // Try JSON
        try {
          const jsonPath = path.join(dataDir, `${source}.json`);
          rawData = await ingestJSON(jsonPath);
        } catch {
          // Try as region/domain identifier for global data
          const globalDataPath = path.join(dataDir, 'global', `${source}.json`);
          try {
            rawData = await ingestJSON(globalDataPath);
          } catch {
            // Return empty dataset for unknown sources
            console.warn(`No data source found for: ${source}`);
            rawData = [];
          }
        }
      }
    }
    
    // Clean the data
    const cleanedData = cleanData(rawData);
    
    // Assess quality
    const qualityReport = cleanedData.length > 0 
      ? assessDataQuality(cleanedData)
      : { qualityScore: 0, issues: ['No data available'] };
    
    console.log(`âœ… Ingested ${cleanedData.length} records (Quality: ${qualityReport.qualityScore.toFixed(0)}%)`);
    
    return {
      status: 'success',
      source,
      recordCount: cleanedData.length,
      data: cleanedData,
      quality: {
        qualityScore: qualityReport.qualityScore,
        issues: qualityReport.issues
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`âŒ Failed to ingest data from ${source}:`, errorMessage);
    
    return {
      status: 'error',
      source,
      recordCount: 0,
      data: [],
      error: errorMessage
    };
  }
}

export async function ingestMultipleSources(sources: string[]): Promise<IngestionResult[]> {
  const results = await Promise.all(sources.map(source => ingestData(source)));
  return results;
}

export async function ingestAndNormalize(
  source: string,
  schema: {
    fields: Array<{
      source: string;
      target: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      required?: boolean;
      default?: unknown;
    }>;
  }
): Promise<IngestionResult & { normalizedData: DataRecord[] }> {
  const result = await ingestData(source);
  
  if (result.status === 'error' || result.data.length === 0) {
    return { ...result, normalizedData: [] };
  }
  
  const normalizedData = normalizeData(result.data, schema);
  
  return {
    ...result,
    normalizedData
  };
}

export async function ingestAndAggregate(
  source: string,
  groupBy: string,
  aggregations: Array<{
    field: string;
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    outputField: string;
  }>
): Promise<IngestionResult & { aggregatedData: DataRecord[] }> {
  const result = await ingestData(source);
  
  if (result.status === 'error' || result.data.length === 0) {
    return { ...result, aggregatedData: [] };
  }
  
  const aggregatedData = aggregateData(result.data, groupBy, aggregations);
  
  return {
    ...result,
    aggregatedData
  };
}

export { cleanData, assessDataQuality, normalizeData, aggregateData, clearCache };

