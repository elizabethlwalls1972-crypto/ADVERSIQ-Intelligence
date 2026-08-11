import { DecisionPipeline } from './DecisionPipeline';
import { ReportOrchestrator } from './ReportOrchestrator';
import { EventBus } from './EventBus';
import { bayesianDebateEngine } from './algorithms/BayesianDebateEngine';
import { VectorMemoryIndex } from './algorithms/VectorMemoryIndex';
import ConfidenceScorer from './ConfidenceScorer';
import { executeMonteCarlo } from '../core/MonteCarloEngine';
import type { ReportParameters, ReportPayload } from '../types';

export class IntelligenceRunManager {
  static async start(params: ReportParameters): Promise<{ packet: any; payload?: ReportPayload }> {
    // Notify listeners the run is starting
    EventBus.publish({ type: 'reportGenerationStarted', params } as any);

    // Start Decision Pipeline (lightweight gating + orchestration)
    EventBus.publish({ type: 'schedulerStarted' } as any);
    let packetResult: { packet: any; payload?: ReportPayload };
    try {
      packetResult = await DecisionPipeline.run(params);
      EventBus.publish({ type: 'taskExecuted', task: { name: 'DecisionPipeline' }, success: true, duration: 0 } as any);
    } catch (err) {
      EventBus.publish({ type: 'errorOccurred', error: err } as any);
      throw err;
    }

    const payload = packetResult.payload;
    if (payload) {
      EventBus.publish({ type: 'payloadAssembled', reportId: params.id || '', payload } as any);
    }

    // Run Bayesian Persona Debate in background
    (async () => {
      try {
        const debate = await bayesianDebateEngine.runDebate(params as any);
        const brief = {
          proceedSignal: debate.recommendation as any,
          topDrivers: (payload?.computedIntelligence?.spi?.drivers || []).slice(0, 5),
          topRisks: (payload?.risks || []).slice(0, 5).map((r: any) => r.risk || r),
          nextActions: []
        };
        EventBus.publish({ type: 'executiveBriefReady', reportId: params.id || '', brief } as any);
        EventBus.publish({ type: 'insightsGenerated', reportId: params.id || '', insights: [{ source: 'BayesianDebateEngine', debate }] } as any);
      } catch (e) {
        EventBus.publish({ type: 'errorReported', error: e } as any);
      }
    })();

    // Run Monte Carlo stress test (non-blocking)
    (async () => {
      try {
        const vector = payload?.computedIntelligence ? [payload.computedIntelligence.spi?.score || 0, payload.computedIntelligence.rroi?.score || 0] : [0, 0];
        const mc = executeMonteCarlo(vector as number[]);
        EventBus.publish({ type: 'taskExecuted', task: { name: 'MonteCarloStressEngine', result: mc }, success: true, duration: 0 } as any);
      } catch (e) {
        EventBus.publish({ type: 'errorReported', error: e } as any);
      }
    })();

    // Index into Vector Memory for retrieval
    (async () => {
      try {
        const index = new VectorMemoryIndex(128);
        try {
          await index.indexReportWithAI(params as any);
        } catch {
          index.indexReport(params as any);
        }
        EventBus.publish({ type: 'memoryUpdated', reportId: params.id || '', cases: [] } as any);
      } catch (e) {
        EventBus.publish({ type: 'errorReported', error: e } as any);
      }
    })();

    // Quick confidence scoring (best-effort)
    (async () => {
      try {
        const scorer = new ConfidenceScorer();
        const score = await scorer.scoreHypothesis('primary-recommendation', {} as any);
        EventBus.publish({ type: 'insightsGenerated', reportId: params.id || '', insights: [{ source: 'ConfidenceScorer', score }] } as any);
      } catch (e) {
        EventBus.publish({ type: 'errorReported', error: e } as any);
      }
    })();

    // Final publication of assembled payload and return
    EventBus.publish({ type: 'provenanceLogged', reportId: params.id || '', entry: { ts: Date.now(), note: 'Intelligence run completed' } } as any);
    return packetResult!;
  }
}

export default IntelligenceRunManager;
