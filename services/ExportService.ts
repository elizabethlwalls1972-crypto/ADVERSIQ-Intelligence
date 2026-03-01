import { ReportPayload } from '../types';
import { GovernanceService } from './GovernanceService';
import { ReportOrchestrator } from './ReportOrchestrator';
import { exportToDocx, type DocxDocumentMeta } from './DocxExporter';

export type ExportFormat = 'pdf' | 'docx' | 'ppt' | 'dashboard' | 'interactive';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a ReportPayload into structured Markdown for DOCX/PDF rendering. */
function buildMarkdownFromPayload(payload: ReportPayload): string {
  const md: string[] = [];
  const m = payload.metadata;
  const p = payload.problemDefinition;
  const r = payload.regionalProfile;
  const e = payload.economicSignals;
  const o = payload.opportunityMatches;
  const risks = payload.risks;
  const rec = payload.recommendations;
  const conf = payload.confidenceScores;

  md.push(`# Strategic Intelligence Report — ${m.country}`);
  md.push(`**Region:** ${m.region}  `);
  md.push(`**Report ID:** ${m.reportId}  `);
  md.push(`**Date:** ${m.timestamp}  `);
  md.push('');

  // Problem definition
  md.push('## Problem Definition');
  md.push(p.statedProblem);
  md.push(`**Urgency:** ${p.urgency}`);
  if (p.constraints.length) {
    md.push('### Constraints');
    p.constraints.forEach(c => md.push(`- ${c}`));
  }
  md.push('');

  // Regional profile
  md.push('## Regional Profile');
  md.push('### Demographics');
  md.push(`| Metric | Value |`);
  md.push(`|--------|-------|`);
  md.push(`| Population | ${r.demographics.population.toLocaleString()} |`);
  md.push(`| GDP per Capita | $${r.demographics.gdpPerCapita.toLocaleString()} |`);
  md.push(`| Labour Costs | $${r.demographics.laborCosts.toLocaleString()} |`);
  md.push('');
  md.push('### Infrastructure Scores');
  md.push(`| Category | Score |`);
  md.push(`|----------|-------|`);
  md.push(`| Transportation | ${r.infrastructure.transportation}/100 |`);
  md.push(`| Digital | ${r.infrastructure.digital}/100 |`);
  md.push(`| Utilities | ${r.infrastructure.utilities}/100 |`);
  md.push('');
  md.push('### Logistics');
  md.push(`- Regional Connectivity: ${r.logistics.regionalConnectivity}/100`);
  md.push(`- Export Potential: ${r.logistics.exportPotential}/100`);
  md.push('');

  // Economic signals
  md.push('## Economic Signals');
  md.push(`- Trade Exposure: ${e.tradeExposure}%`);
  md.push(`- Tariff Sensitivity: ${e.tariffSensitivity}%`);
  md.push(`- Bottleneck Relief Potential: ${e.bottleneckReliefPotential}/100`);
  if (e.costAdvantages.length) {
    md.push('### Cost Advantages');
    e.costAdvantages.forEach(a => md.push(`- ${a}`));
  }
  md.push('');

  // Opportunity matches
  md.push('## Opportunity Matches');
  md.push(`**Risk-Adjusted ROI:** ${o.riskAdjustedROI}%`);
  md.push('### Target Sectors');
  o.sectors.forEach(s => md.push(`- ${s}`));
  md.push('### Partner Types');
  o.partnerTypes.forEach(pt => md.push(`- ${pt}`));
  md.push('');

  // Risk assessment
  md.push('## Risk Assessment');
  md.push('### Political');
  md.push(`- Stability Score: ${risks.political.stabilityScore}/100`);
  md.push(`- Regional Conflict Risk: ${risks.political.regionalConflictRisk}/100`);
  md.push('### Regulatory');
  md.push(`- Corruption Index: ${risks.regulatory.corruptionIndex}`);
  md.push(`- Regulatory Friction: ${risks.regulatory.regulatoryFriction}/100`);
  if (risks.regulatory.complianceRoadmap.length) {
    md.push('### Compliance Roadmap');
    risks.regulatory.complianceRoadmap.forEach(r => md.push(`- ${r}`));
  }
  md.push('### Operational');
  md.push(`- Supply Chain Dependency: ${risks.operational.supplyChainDependency}/100`);
  md.push(`- Currency Risk: ${risks.operational.currencyRisk}`);
  md.push('');

  // Recommendations
  md.push('## Recommendations');
  if (rec.shortTerm.length) {
    md.push('### Short-Term');
    rec.shortTerm.forEach(r => md.push(`- ${r}`));
  }
  if (rec.midTerm.length) {
    md.push('### Mid-Term');
    rec.midTerm.forEach(r => md.push(`- ${r}`));
  }
  if (rec.longTerm.length) {
    md.push('### Long-Term');
    rec.longTerm.forEach(r => md.push(`- ${r}`));
  }
  md.push('');

  // Confidence scores
  md.push('## Confidence Scores');
  md.push(`| Dimension | Score |`);
  md.push(`|-----------|-------|`);
  md.push(`| Overall | ${conf.overall}% |`);
  md.push(`| Economic Readiness | ${conf.economicReadiness}% |`);
  md.push(`| Symbiotic Fit | ${conf.symbioticFit}% |`);
  md.push(`| Political Stability | ${conf.politicalStability}% |`);
  md.push(`| Partner Reliability | ${conf.partnerReliability}% |`);
  md.push(`| Ethical Alignment | ${conf.ethicalAlignment}% |`);
  md.push(`| Activation Velocity | ${conf.activationVelocity}% |`);
  md.push(`| Transparency | ${conf.transparency}% |`);
  md.push('');

  return md.join('\n');
}

/** Build DocxDocumentMeta from a ReportPayload. */
function buildDocxMeta(payload: ReportPayload): DocxDocumentMeta {
  return {
    title: `Strategic Intelligence Report — ${payload.metadata.country}`,
    subtitle: `${payload.metadata.region} Regional Analysis`,
    preparedFor: payload.metadata.requesterType,
    preparedBy: 'BW Global Advisory AI',
    date: payload.metadata.timestamp || new Date().toISOString().slice(0, 10),
    reportId: payload.metadata.reportId,
    classification: 'CONFIDENTIAL',
    jurisdiction: payload.metadata.country,
    strategicReadiness: payload.confidenceScores?.overall,
    evidenceCredibility: payload.confidenceScores?.transparency,
  };
}

/** Trigger a browser file download from a Blob. */
function downloadBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a small delay so the browser can start the download
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return filename;
}

// ── ExportService ────────────────────────────────────────────────────────────

export class ExportService {
  /**
   * Export a report. For DOCX format, produces a real .docx file and triggers
   * a browser download. For other formats, generates the best available output.
   */
  static async exportReport(params: {
    reportId: string;
    format: ExportFormat;
    payload?: ReportPayload | null;
  }): Promise<{ link: string }> {
    const { reportId, format, payload } = params;
    if (!payload) {
      throw new Error('Export blocked. Payload is required to generate outputs.');
    }

    // Validate payload completeness
    const validation = ReportOrchestrator.validatePayload(payload);
    if (!validation.isComplete) {
      await GovernanceService.recordProvenance({
        reportId,
        artifact: 'report-export',
        action: 'export-blocked',
        actor: 'ExportService',
        tags: [format, 'incomplete-payload', ...validation.missingFields],
        source: 'service'
      });
      throw new Error(`Export blocked until required fields are present: ${validation.missingFields.join(', ')}`);
    }

    // Governance gate
    const check = await GovernanceService.ensureStage(reportId, 'approved');
    if (!check.ok) {
      await GovernanceService.recordProvenance({
        reportId,
        artifact: 'report-export',
        action: 'export-blocked',
        actor: 'ExportService',
        tags: [format, `stage:${check.stage}`],
        source: 'service'
      });
      throw new Error(`Export blocked. Stage must be at least 'approved'. Current stage: ${check.stage}`);
    }

    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'export-requested',
      actor: 'ExportService',
      tags: [format],
      source: 'service'
    });

    // ── Produce real export artifacts ──
    const markdown = buildMarkdownFromPayload(payload);
    const meta = buildDocxMeta(payload);
    const timestamp = Date.now();
    let downloadedFilename: string;

    switch (format) {
      case 'docx': {
        const blob = await exportToDocx(markdown, meta);
        const fname = `${reportId}-report-${timestamp}.docx`;
        downloadedFilename = downloadBlob(blob, fname);
        break;
      }
      case 'pdf': {
        // Generate DOCX as the best-fidelity offline format available
        // (true PDF requires a server-side renderer; DOCX opens natively in most tools)
        const blob = await exportToDocx(markdown, meta);
        const fname = `${reportId}-report-${timestamp}.docx`;
        downloadedFilename = downloadBlob(blob, fname);
        break;
      }
      case 'ppt':
      case 'dashboard':
      case 'interactive': {
        // For formats without a dedicated renderer, export structured HTML
        const htmlContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${meta.title}</title>
<style>
body{font-family:Calibri,sans-serif;max-width:960px;margin:40px auto;padding:0 20px;color:#1a365d}
h1{color:#1a365d;border-bottom:2px solid #b49b67;padding-bottom:8px}
h2{color:#2c5282;margin-top:32px}
h3{color:#4a5568}
table{border-collapse:collapse;width:100%;margin:16px 0}
th,td{border:1px solid #ccc;padding:8px 12px;text-align:left}
th{background:#f7fafc;font-weight:600}
.meta{color:#666;font-size:0.9em;margin-bottom:24px}
.classification{color:#cc0000;font-weight:bold;text-align:center;margin-bottom:16px}
</style></head><body>
<div class="classification">${meta.classification}</div>
<h1>${meta.title}</h1>
<div class="meta">Prepared for: ${meta.preparedFor} | By: ${meta.preparedBy} | ${meta.date} | Ref: ${meta.reportId}</div>
${markdownToHtml(markdown)}
</body></html>`;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const ext = format === 'ppt' ? 'html' : 'html';
        const fname = `${reportId}-${format}-${timestamp}.${ext}`;
        downloadedFilename = downloadBlob(blob, fname);
        break;
      }
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'export-success',
      actor: 'ExportService',
      tags: [format, downloadedFilename],
      source: 'service'
    });

    return { link: downloadedFilename };
  }

  static async emailReport(reportId: string) {
    const check = await GovernanceService.ensureStage(reportId, 'approved');
    if (!check.ok) {
      await GovernanceService.recordProvenance({
        reportId,
        artifact: 'report-export',
        action: 'email-blocked',
        actor: 'ExportService',
        tags: [`stage:${check.stage}`],
        source: 'service'
      });
      throw new Error('Email blocked until stage is approved');
    }
    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'email-requested',
      actor: 'ExportService',
      source: 'service'
    });
    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'email-success',
      actor: 'ExportService',
      source: 'service'
    });
  }

  static async shareLink(reportId: string) {
    const check = await GovernanceService.ensureStage(reportId, 'approved');
    if (!check.ok) {
      await GovernanceService.recordProvenance({
        reportId,
        artifact: 'report-export',
        action: 'share-blocked',
        actor: 'ExportService',
        tags: [`stage:${check.stage}`],
        source: 'service'
      });
      throw new Error('Share link blocked until stage is approved');
    }
    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'share-requested',
      actor: 'ExportService',
      source: 'service'
    });
    const link = `/share/${reportId}-${Date.now()}`;
    await GovernanceService.recordProvenance({
      reportId,
      artifact: 'report-export',
      action: 'share-success',
      actor: 'ExportService',
      source: 'service'
    });
    return { link };
  }
}

// ── Minimal markdown → HTML (for HTML export fallback) ──────────────────────

function markdownToHtml(md: string): string {
  return md
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br>';
      if (/^### /.test(trimmed)) return `<h3>${trimmed.slice(4)}</h3>`;
      if (/^## /.test(trimmed)) return `<h2>${trimmed.slice(3)}</h2>`;
      if (/^# /.test(trimmed)) return `<h1>${trimmed.slice(2)}</h1>`;
      if (/^[-*•]\s/.test(trimmed)) return `<li>${trimmed.replace(/^[-*•]\s+/, '')}</li>`;
      if (/^\|/.test(trimmed)) {
        if (/^\|[-:| ]+\|$/.test(trimmed)) return '';
        const cells = trimmed.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      }
      // Inline bold/italic
      let html = trimmed
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return `<p>${html}</p>`;
    })
    .join('\n');
}

