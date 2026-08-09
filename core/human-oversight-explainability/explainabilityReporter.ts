// Explainability Reporter
// Generates detailed, user-facing reports for every autonomous cycle

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.resolve(__dirname, 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR);

export function generateExplainabilityReport(auditTrail: any[], problem: string) {
  const report = {
    problem,
    timestamp: new Date().toISOString(),
    steps: auditTrail.map((step, i) => ({
      step: i + 1,
      ...step
    }))
  };
  const filePath = path.join(REPORTS_DIR, `${Date.now()}_report.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  return filePath;
}

