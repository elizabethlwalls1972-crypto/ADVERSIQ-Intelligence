// Learning & Self-Improvement API Routes
import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db.js';

const router = Router();

router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const [outcomes, adjustments, weights, suggestions] = await Promise.all([
      query('SELECT * FROM outcome_records ORDER BY created_at DESC LIMIT 100'),
      query('SELECT * FROM weight_adjustments ORDER BY created_at DESC LIMIT 50'),
      query('SELECT * FROM engine_weights'),
      query("SELECT * FROM improvement_suggestions WHERE status = 'proposed' ORDER BY created_at DESC"),
    ]);

    let predictionAccuracy = 0;
    if (outcomes.length > 0) {
      const correct = (outcomes as Array<{ predicted_spi: number; actual_status: string }>).filter(o => {
        const predictedGood = o.predicted_spi >= 60;
        const actualGood = o.actual_status === 'complete';
        return predictedGood === actualGood;
      }).length;
      predictionAccuracy = correct / outcomes.length;
    }

    const completed = (outcomes as Array<{ actual_status: string }>).filter(o => o.actual_status === 'complete').length;
    const successRate = outcomes.length > 0 ? completed / outcomes.length : 0;

    res.json({
      overview: {
        totalOutcomes: outcomes.length,
        predictionAccuracy: parseFloat((predictionAccuracy * 100).toFixed(1)),
        successRate: parseFloat((successRate * 100).toFixed(1)),
        totalWeightAdjustments: adjustments.length,
        pendingSuggestions: suggestions.length,
      },
      weights: (weights as Array<{ engine: string; weights: Record<string, number> }>).reduce((acc, w) => {
        acc[w.engine] = w.weights;
        return acc;
      }, {} as Record<string, Record<string, number>>),
      recentAdjustments: adjustments.slice(0, 10),
      pendingSuggestions: suggestions,
      trends: {
        recentAccuracy: predictionAccuracy,
      },
    });
  } catch (error) {
    console.error('Learning metrics error:', error);
    res.status(500).json({ error: 'Failed to load learning metrics' });
  }
});

router.post('/outcome', async (req: Request, res: Response) => {
  try {
    const { reportId, predictedSpi, predictedRroi, predictedConfidence, actualStatus, userRating, timeToComplete, wasExported } = req.body;

    if (!reportId || !actualStatus) {
      return res.status(400).json({ error: 'reportId and actualStatus are required' });
    }

    await query(`
      INSERT INTO outcome_records (report_id, predicted_spi, predicted_rroi, predicted_confidence, actual_status, user_rating, time_to_complete, was_exported)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [reportId, predictedSpi || 0, predictedRroi || 0, predictedConfidence || 0, actualStatus, userRating || null, timeToComplete || null, wasExported || false]);

    const countResult = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM outcome_records');
    const totalOutcomes = parseInt(countResult?.count || '0');

    if (totalOutcomes >= 5 && totalOutcomes % 5 === 0) {
      await adjustWeights();
    }

    res.json({ success: true, totalOutcomes });
  } catch (error) {
    console.error('Record outcome error:', error);
    res.status(500).json({ error: 'Failed to record outcome' });
  }
});

async function adjustWeights(): Promise<void> {
  try {
    const outcomes = await query<{ predicted_spi: number; predicted_rroi: number; actual_status: string }>('SELECT predicted_spi, predicted_rroi, actual_status FROM outcome_records ORDER BY created_at DESC LIMIT 50');
    const completed = outcomes.filter(o => o.actual_status === 'complete');
    const abandoned = outcomes.filter(o => o.actual_status === 'abandoned');

    if (completed.length < 3 || abandoned.length < 2) return;

    const avgSpiCompleted = completed.reduce((s, o) => s + o.predicted_spi, 0) / completed.length;
    const avgSpiAbandoned = abandoned.reduce((s, o) => s + o.predicted_spi, 0) / abandoned.length;
    const spiDelta = avgSpiCompleted - avgSpiAbandoned;

    if (spiDelta < 5 && avgSpiCompleted > 60) {
      const currentWeights = await queryOne<{ weights: Record<string, number> }>("SELECT weights FROM engine_weights WHERE engine = 'SPI'");
      if (currentWeights) {
        const weights = { ...currentWeights.weights };
        const entries = Object.entries(weights).sort(([, a], [, b]) => b - a);
        const [topKey, topVal] = entries[0];
        const [bottomKey, bottomVal] = entries[entries.length - 1];
        const adjustment = Math.min(0.03, topVal * 0.1);
        const newVal = Math.max(0.02, topVal - adjustment);

        weights[topKey] = parseFloat(newVal.toFixed(4));
        weights[bottomKey] = parseFloat((bottomVal + adjustment).toFixed(4));

        const total = Object.values(weights).reduce((s, v) => s + v, 0);
        for (const key of Object.keys(weights)) {
          weights[key] = parseFloat((weights[key] / total).toFixed(4));
        }

        await query("UPDATE engine_weights SET weights = $1, adjustment_count = adjustment_count + 1, updated_at = NOW() WHERE engine = 'SPI'", [JSON.stringify(weights)]);
        await query(`
          INSERT INTO weight_adjustments (engine, field_name, old_value, new_value, reason, sample_size)
          VALUES ('SPI', $1, $2, $3, $4, $5)
        `, [topKey, topVal, newVal, `SPI over-predicting (delta=${spiDelta.toFixed(1)})`, outcomes.length]);
      }
    }

    const avgRroiCompleted = completed.reduce((s, o) => s + o.predicted_rroi, 0) / completed.length;
    const avgRroiAbandoned = abandoned.reduce((s, o) => s + o.predicted_rroi, 0) / abandoned.length;
    const rroiDelta = avgRroiCompleted - avgRroiAbandoned;

    if (rroiDelta < 5 && avgRroiCompleted > 60) {
      const currentWeights = await queryOne<{ weights: Record<string, number> }>("SELECT weights FROM engine_weights WHERE engine = 'RROI'");
      if (currentWeights) {
        const weights = { ...currentWeights.weights };
        const entries = Object.entries(weights).sort(([, a], [, b]) => b - a);
        const [topKey, topVal] = entries[0];
        const [bottomKey, bottomVal] = entries[entries.length - 1];
        const adjustment = Math.min(0.03, topVal * 0.1);
        const newVal = Math.max(0.02, topVal - adjustment);

        weights[topKey] = parseFloat(newVal.toFixed(4));
        weights[bottomKey] = parseFloat((bottomVal + adjustment).toFixed(4));

        const total = Object.values(weights).reduce((s, v) => s + v, 0);
        for (const key of Object.keys(weights)) {
          weights[key] = parseFloat((weights[key] / total).toFixed(4));
        }

        await query("UPDATE engine_weights SET weights = $1, adjustment_count = adjustment_count + 1, updated_at = NOW() WHERE engine = 'RROI'", [JSON.stringify(weights)]);
        await query(`
          INSERT INTO weight_adjustments (engine, field_name, old_value, new_value, reason, sample_size)
          VALUES ('RROI', $1, $2, $3, $4, $5)
        `, [topKey, topVal, newVal, `RROI over-predicting (delta=${rroiDelta.toFixed(1)})`, outcomes.length]);
      }
    }
  } catch (error) {
    console.error('Weight adjustment error:', error);
  }
}

router.get('/weights', async (_req: Request, res: Response) => {
  try {
    const [current, history] = await Promise.all([
      query('SELECT * FROM engine_weights'),
      query('SELECT * FROM weight_adjustments ORDER BY created_at DESC LIMIT 100'),
    ]);

    res.json({ current, history });
  } catch (error) {
    console.error('Get weights error:', error);
    res.status(500).json({ error: 'Failed to load weights' });
  }
});

router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'proposed';
    const suggestions = await query(
      'SELECT * FROM improvement_suggestions WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    res.json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to load suggestions' });
  }
});

export default router;
