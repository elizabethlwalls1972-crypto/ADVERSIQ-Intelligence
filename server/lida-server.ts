import express, { Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

import lidaRoutes from './routes/lida.js';

const app = express();
const PORT = parseInt(String(process.env.LIDA_PORT || 3001), 10);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'lida' });
});

app.use('/api/lida', lidaRoutes);

// Serve the live dashboard so the whole system is visible in a browser
function serveDashboard(_req: Request, res: Response) {
  const f = path.join(__dirname, 'public', 'dashboard.html');
  if (fs.existsSync(f)) res.sendFile(f);
  else res.json({ status: 'ok', note: 'dashboard missing' });
}
app.get('/', serveDashboard);
app.get('/dashboard', serveDashboard);

// Full brain: orchestrate the real NSIL/LIDA brain components end-to-end
app.post('/api/lida/brain', async (req: Request, res: Response) => {
  const input = (req.body && req.body.input) ? req.body.input : 'Run a full autonomous cognitive pass.';
  try {
    const { LIDAController } = await import('./core/LIDAController.js');
    const { UniversalInputProcessor } = await import('./core/UniversalInputProcessor.js');
    const SelfAuditingKnowledge = (await import('./core/SelfAuditingKnowledge.js')).default;
    const { HistoricalParallelMatcher } = await import('./core/HistoricalParallelMatcher.js');
    const { FailurePatternRecognizer } = await import('./core/FailurePatternRecognizer.js');
    const SelfLearningAlgorithm = (await import('./core/SelfLearningAlgorithm.js')).default;

    const ctrl = new LIDAController();
    const uip = new UniversalInputProcessor();
    const audit = new SelfAuditingKnowledge();
    const hist = new HistoricalParallelMatcher();
    const fail = new FailurePatternRecognizer();
    const learner = new SelfLearningAlgorithm();

    const [parsedInput, selfAudit, lidaCycle, parallels, failureRisk] = await Promise.all([
      uip.processInput(input),
      audit.auditKnowledge(input),
      ctrl.runCycle(input),
      hist.findParallels(input),
      fail.getFailureRisk({ actions: [input] }),
    ]);

    const learningReport = await learner.runSelfLearningCycle({ text: input }, input);

    res.json({
      status: 'brain-ok',
      brain: {
        input,
        parsedInput,
        selfAudit,
        lidaCycle,
        historicalParallels: parallels,
        failureRisk,
        selfLearning: {
          issuesDetected: learningReport.issuesDetected,
          solutionsGenerated: learningReport.solutionsGenerated,
          learningRate: learningReport.learningRate,
        },
      },
    });
  } catch (e: any) {
    res.status(500).json({ status: 'brain-error', error: String(e && e.message ? e.message : e) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
ADVERSIQ LIDA Cognitive Architecture Server
  Status:    ONLINE
  Port:      ${PORT}
  Dashboard:  http://localhost:${PORT}/
  API:       http://localhost:${PORT}/api/lida
  Health:    http://localhost:${PORT}/api/health
  `);
});
