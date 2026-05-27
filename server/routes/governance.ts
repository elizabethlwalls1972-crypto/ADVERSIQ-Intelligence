import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, '..', 'data');
const GOV_FILE = path.join(DATA_DIR, 'governance.json');

type ApprovalStage = 'draft' | 'review' | 'approved' | 'signed';

interface MandateRecord {
  reportId: string;
  mandateName?: string;
  owner?: string;
  stage: ApprovalStage;
  lastUpdated: string;
}

interface ApprovalRecord {
  id: string;
  reportId: string;
  stage: ApprovalStage;
  decision: 'approve' | 'reject' | 'revise';
  actor: string;
  role: string;
  notes?: string;
  attachment?: string;
  createdAt: string;
  versionId?: string;
}

interface ProvenanceEntry {
  id: string;
  reportId: string;
  artifact: string;
  action: string;
  actor: string;
  source?: string;
  checksum?: string;
  tags?: string[];
  createdAt: string;
  relatedApprovalId?: string;
}

interface GovernanceState {
  mandates: MandateRecord[];
  approvals: ApprovalRecord[];
  provenance: ProvenanceEntry[];
}

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const loadState = async (): Promise<GovernanceState> => {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(GOV_FILE, 'utf-8');
    return JSON.parse(raw) as GovernanceState;
  } catch {
    return { mandates: [], approvals: [], provenance: [] };
  }
};

const saveState = async (state: GovernanceState) => {
  await ensureDataDir();
  await fs.writeFile(GOV_FILE, JSON.stringify(state, null, 2));
};

const findMandate = (state: GovernanceState, reportId: string): MandateRecord => {
  const existing = state.mandates.find(m => m.reportId === reportId);
  if (existing) return existing;
  const record: MandateRecord = {
    reportId,
    stage: 'draft',
    lastUpdated: new Date().toISOString()
  };
  state.mandates.push(record);
  return record;
};

router.get('/:reportId/timeline', async (req: Request, res: Response) => {
  try {
    const state = await loadState();
    const reportId = req.params.reportId;
    const mandate = findMandate(state, reportId);
    const approvals = state.approvals.filter(a => a.reportId === reportId);
    const provenance = state.provenance.filter(p => p.reportId === reportId);
    res.json({ mandate, approvals, provenance });
  } catch (error) {
    console.error('Timeline fetch failed', error);
    res.status(500).json({ error: 'Failed to load timeline' });
  }
});

router.put('/:reportId/mandate', async (req: Request, res: Response) => {
  try {
    const state = await loadState();
    const reportId = req.params.reportId;
    const mandate = findMandate(state, reportId);
    mandate.stage = (req.body.stage as ApprovalStage) || mandate.stage;
    mandate.mandateName = req.body.mandateName ?? mandate.mandateName;
    mandate.owner = req.body.owner ?? mandate.owner;
    mandate.lastUpdated = new Date().toISOString();
    await saveState(state);
    res.json(mandate);
  } catch (error) {
    console.error('Mandate update failed', error);
    res.status(500).json({ error: 'Failed to update mandate' });
  }
});

router.get('/:reportId/stage', async (req: Request, res: Response) => {
  try {
    const state = await loadState();
    const mandate = findMandate(state, req.params.reportId);
    res.json({ stage: mandate.stage });
  } catch (error) {
    console.error('Stage fetch failed', error);
    res.status(500).json({ error: 'Failed to fetch stage' });
  }
});

router.post('/:reportId/approval', async (req: Request, res: Response) => {
  try {
    const state = await loadState();
    const reportId = req.params.reportId;
    const mandate = findMandate(state, reportId);
    mandate.stage = (req.body.stage as ApprovalStage) || mandate.stage;
    mandate.lastUpdated = new Date().toISOString();

    const approval: ApprovalRecord = {
      id: `APR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reportId,
      stage: mandate.stage,
      decision: req.body.decision || 'approve',
      actor: req.body.actor || 'unknown',
      role: req.body.role || 'executive',
      notes: req.body.notes,
      attachment: req.body.attachment,
      versionId: req.body.versionId,
      createdAt: new Date().toISOString()
    };

    state.approvals.push(approval);
    await saveState(state);
    res.status(201).json({ approval, mandate });
  } catch (error) {
    console.error('Approval save failed', error);
    res.status(500).json({ error: 'Failed to save approval' });
  }
});

router.post('/:reportId/provenance', async (req: Request, res: Response) => {
  try {
    const state = await loadState();
    const reportId = req.params.reportId;
    const mandate = findMandate(state, reportId);

    const entry: ProvenanceEntry = {
      id: `PRV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reportId,
      artifact: req.body.artifact || 'unknown',
      action: req.body.action || 'unknown',
      actor: req.body.actor || 'system',
      source: req.body.source,
      checksum: req.body.checksum,
      tags: req.body.tags,
      relatedApprovalId: req.body.relatedApprovalId,
      createdAt: new Date().toISOString()
    };

    state.provenance.push(entry);
    await saveState(state);
    res.status(201).json({ entry, mandate });
  } catch (error) {
    console.error('Provenance save failed', error);
    res.status(500).json({ error: 'Failed to save provenance' });
  }
});

export default router;
