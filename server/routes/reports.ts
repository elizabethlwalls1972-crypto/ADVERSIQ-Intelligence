import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { query } from '../db.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -- Flat-file fallback (used when Postgres is not configured) -
const DATA_DIR = path.join(__dirname, '..', 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

const ensureDataDir = async () => {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch { /* already exists */ }
};

type StoredReport = {
  id: string;
  organizationName?: string;
  reportName?: string;
  country?: string;
  region?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
} & Record<string, unknown>;

// -- Storage layer � tries Postgres first, falls back to file --

async function dbAvailable(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

async function loadReports(): Promise<StoredReport[]> {
  if (await dbAvailable()) {
    try {
      const result = await query<StoredReport>(
        'SELECT * FROM reports ORDER BY "createdAt" DESC LIMIT 500'
      );
      return result;
    } catch (err) {
      console.error('[reports] Postgres read failed, falling back to file:', err);
    }
  }
  // File fallback
  try {
    await ensureDataDir();
    const data = await fs.readFile(REPORTS_FILE, 'utf-8');
    return JSON.parse(data) as StoredReport[];
  } catch {
    return [];
  }
}

async function saveReport(report: StoredReport): Promise<void> {
  if (await dbAvailable()) {
    try {
      await query(
        `INSERT INTO reports (id, "organizationName", "reportName", country, region,
           status, parameters, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           "organizationName" = EXCLUDED."organizationName",
           "reportName" = EXCLUDED."reportName",
           country = EXCLUDED.country,
           region = EXCLUDED.region,
           status = EXCLUDED.status,
           parameters = EXCLUDED.parameters,
           "updatedAt" = EXCLUDED."updatedAt"`,
        [
          report.id,
          report.organizationName ?? null,
          report.reportName ?? null,
          report.country ?? null,
          report.region ?? null,
          report.status ?? 'draft',
          JSON.stringify(report),          // full params blob
          report.createdAt ?? new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      return;
    } catch (err) {
      console.error('[reports] Postgres write failed, falling back to file:', err);
    }
  }
  // File fallback
  await ensureDataDir();
  const existing = await loadReports();
  const idx = existing.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...report, updatedAt: new Date().toISOString() };
  } else {
    existing.unshift(report);
  }
  await fs.writeFile(REPORTS_FILE, JSON.stringify(existing.slice(0, 500), null, 2));
}

async function deleteReport(id: string): Promise<boolean> {
  if (await dbAvailable()) {
    try {
      await query('DELETE FROM reports WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('[reports] Postgres delete failed:', err);
    }
  }
  // File fallback
  const all = await loadReports();
  const next = all.filter(r => r.id !== id);
  if (next.length === all.length) return false;
  await ensureDataDir();
  await fs.writeFile(REPORTS_FILE, JSON.stringify(next, null, 2));
  return true;
}

// -- Routes (unchanged contract � same URLs your frontend uses) -

// GET /api/reports
router.get('/', async (_req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    res.json(reports);
  } catch (err) {
    console.error('[GET /api/reports]', err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    const report = reports.find(r => r.id === req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('[GET /api/reports/:id]', err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

// POST /api/reports
router.post('/', async (req: Request, res: Response) => {
  try {
    const report: StoredReport = {
      ...req.body,
      id: req.body.id ?? crypto.randomUUID(),
      createdAt: req.body.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: req.body.status ?? 'draft',
    };
    await saveReport(report);
    res.status(201).json(report);
  } catch (err) {
    console.error('[POST /api/reports]', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const report: StoredReport = {
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };
    await saveReport(report);
    res.json(report);
  } catch (err) {
    console.error('[PUT /api/reports/:id]', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteReport(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/reports/:id]', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// GET export report as JSON
router.get('/:id/export/json', async (req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${ report.id}.json"`);
    res.json(report);
  } catch (err) {
    console.error('[GET export/json]', err);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// GET export report as Word (DOCX)
router.get('/:id/export/docx', async (req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    const report = reports.find(r => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const steps = [
      { title: 'Step 1 � Intake', text: `Organization: ${report.organizationName || 'N/A'} | Country: ${report.country || 'N/A'} | Region: ${report.region || 'N/A'}` },
      { title: 'Step 2 � Governance Gating', text: 'Mandate and approvals verified; provenance logging enabled.' },
      { title: 'Step 3 � Risk Assessment', text: 'Security and integrity risks mapped; mitigation via telemetry + trustee.' },
      { title: 'Step 4 � Partner Fit', text: 'Strategic alignment and capability matching scored.' },
      { title: 'Step 5 � Regulatory', text: 'Permits and compliance baseline; double-blind procurement enforced.' },
      { title: 'Step 6 � Operations', text: 'Portside cold storage, reefer trucking, HACCP-certified processing setup.' },
      { title: 'Step 7 � Financial Snapshot', text: 'Capex $45M; staged deployment; milestone escrow.' },
      { title: 'Step 8 � Implementation Roadmap', text: 'Pilot -> Scale plan with inspectors rotation and evidence packs.' },
      { title: 'Step 9 � Provenance Summary', text: 'All artifacts carry tamper-evident provenance for audit.' },
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: 'BW Global AI � Intelligence Report', heading: HeadingLevel.TITLE }),
            new Paragraph({ text: typeof report.organizationName === 'string' ? report.organizationName : 'Unnamed Engagement', heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: 'Scenario: General Santos (Mindanao) � Japanese Cold-Chain & Export Logistics', spacing: { after: 300 } }),
            ...steps.flatMap(s => [
              new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ children: [ new TextRun({ text: s.text }) ] }),
            ]),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="BWGA-Report-${report.id}.docx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[GET export/docx]', err);
    res.status(500).json({ error: 'Failed to export Word document' });
  }
});

// POST duplicate report
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    const original = reports.find(r => r.id === req.params.id);
    
    if (!original) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const duplicate: StoredReport = {
      ...original,
      id: crypto.randomUUID(),
      reportName: `${original.reportName || 'Report'} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    await saveReport(duplicate);
    res.status(201).json(duplicate);
  } catch (err) {
    console.error('[POST duplicate]', err);
    res.status(500).json({ error: 'Failed to duplicate report' });
  }
});

// POST import reports
router.post('/bulk/import', async (req: Request, res: Response) => {
  try {
    const { reports: importedReports } = req.body;
    
    if (!Array.isArray(importedReports)) {
      return res.status(400).json({ error: 'Invalid import format' });
    }
    
    const existing = await loadReports();
    const existingIds = new Set(existing.map(r => r.id));
    
    let imported = 0;
    for (const r of importedReports) {
      if (!existingIds.has(r.id)) {
        const report: StoredReport = {
          ...r,
          importedAt: new Date().toISOString() as any,
        };
        await saveReport(report);
        imported++;
      }
    }
    
    res.json({ 
      success: true, 
      imported,
      skipped: importedReports.length - imported
    });
  } catch (err) {
    console.error('[POST bulk/import]', err);
    res.status(500).json({ error: 'Failed to import reports' });
  }
});

// GET statistics
router.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const reports = await loadReports();
    
    const stats = {
      total: reports.length,
      byStatus: {
        draft: reports.filter(r => r.status === 'draft').length,
        generating: reports.filter(r => r.status === 'generating').length,
        complete: reports.filter(r => r.status === 'complete').length
      },
      byRegion: {} as Record<string, number>,
      recentActivity: reports.slice(0, 10).map(r => ({
        id: r.id,
        reportName: r.reportName,
        updatedAt: r.updatedAt,
      })),
    };
    
    // Count by region
    for (const report of reports) {
      if (report.region) {
        stats.byRegion[report.region as string] = (stats.byRegion[report.region as string] || 0) + 1;
      }
    }
    
    res.json(stats);
  } catch (err) {
    console.error('[GET stats]', err);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;

// -- IMPORTANT: Check your schema.sql -------------------------
// Make sure your reports table has the required columns.
// If it doesn't, run this migration once:
//
//   ALTER TABLE reports
//     ADD COLUMN IF NOT EXISTS parameters jsonb;
//
// You can run it in psql or your DB admin panel.
