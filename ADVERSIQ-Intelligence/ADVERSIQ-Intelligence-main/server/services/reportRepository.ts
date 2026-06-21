import { query, queryOne } from '../db.js';

export interface OutcomeRecord {
  report_id: string;
  predicted_spi: number;
  predicted_rroi: number;
  predicted_confidence: number;
  actual_status: 'complete' | 'abandoned';
  user_rating?: number;
  time_to_complete?: number;
  was_exported: boolean;
  created_at?: string;
}

export async function createOutcomeRecord(record: OutcomeRecord): Promise<void> {
  await query(
    `INSERT INTO outcome_records (report_id, predicted_spi, predicted_rroi, predicted_confidence, actual_status, user_rating, time_to_complete, was_exported)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [record.report_id, record.predicted_spi, record.predicted_rroi, record.predicted_confidence, record.actual_status, record.user_rating || null, record.time_to_complete || null, record.was_exported]
  );
}

export async function getLatestOutcomeRecords(limit = 100): Promise<OutcomeRecord[]> {
  return query<OutcomeRecord>(
    'SELECT * FROM outcome_records ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
}

export async function getEngineWeights(engine: string): Promise<{ engine: string; weights: Record<string, number>; adjustment_count: number } | null> {
  return queryOne('SELECT engine, weights, adjustment_count FROM engine_weights WHERE engine = $1', [engine]);
}

export async function updateEngineWeights(engine: string, weights: Record<string, number>): Promise<void> {
  await query('UPDATE engine_weights SET weights = $1, adjustment_count = adjustment_count + 1, updated_at = NOW() WHERE engine = $2', [JSON.stringify(weights), engine]);
}

export async function logWeightAdjustment(engine: string, fieldName: string, oldValue: number, newValue: number, reason: string, sampleSize: number): Promise<void> {
  await query(
    `INSERT INTO weight_adjustments (engine, field_name, old_value, new_value, reason, sample_size)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [engine, fieldName, oldValue, newValue, reason, sampleSize]
  );
}

export async function getImprovementSuggestions(status: 'proposed' | 'applied' | 'rejected' = 'proposed') {
  return query(
    `SELECT * FROM improvement_suggestions WHERE status = $1 ORDER BY created_at DESC`,
    [status]
  );
}

export async function proposeImprovementSuggestion(proposedBy: string, description: string): Promise<void> {
  await query(
    `INSERT INTO improvement_suggestions (proposed_by, description, status)
     VALUES ($1, $2, 'proposed')`,
    [proposedBy, description]
  );
}
