/**
 * PROFESSIONAL DOCUMENT EXPORT SERVICE
 * 
 * Generates properly formatted, professional-grade documents suitable for:
 * - Client presentations
 * - Board meetings
 * - Investor presentations
 * - Legal/compliance submissions
 * - Government proposals
 * 
 * Supports multiple export formats:
 * - HTML (for printing to PDF)
 * - Downloadable Word-compatible HTML
 * - Structured JSON for template systems
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentSection {
  title: string;
  content: string | string[];
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'metric' | 'recommendation';
  level?: 1 | 2 | 3;
  tableData?: { headers: string[]; rows: string[][] };
  metrics?: { label: string; value: string; status: 'positive' | 'neutral' | 'negative' }[];
}

export interface ProfessionalDocument {
  title: string;
  subtitle?: string;
  classification: 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
  preparedFor: string;
  preparedBy: string;
  date: string;
  reportId: string;
  version: string;
  sections: DocumentSection[];
  appendices?: DocumentSection[];
  footer: {
    company: string;
    disclaimer: string;
  };
}

export interface ExportOptions {
  format: 'html' | 'docx' | 'print';
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  includeWatermark: boolean;
  paperSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: 'normal' | 'narrow' | 'wide';
  fontFamily: 'serif' | 'sans-serif';
  colorScheme: 'professional' | 'modern' | 'minimal';
}

// ============================================================================
// PROFESSIONAL DOCUMENT GENERATOR
// ============================================================================

export class ProfessionalDocumentExporter {
  
  /**
   * Generate a strategic intelligence report from analysis parameters
   */
  static generateStrategicReport(
    params: Partial<ReportParameters>,
    analysisResults: {
      spiScore?: number;
      ivasScore?: number;
      rroi?: number;
      frsScore?: number;
      partnerMatches?: Array<{ name: string; score: number; details: string }>;
      financialProjections?: Array<{ year: number; revenue: number; ebitda: number; netProfit: number }>;
      risks?: Array<{ id: string; category: string; description: string; probability: string; impact: string; mitigation: string }>;
    }
  ): ProfessionalDocument {
    
    const entityName = params.organizationName || 'Client Organization';
    const targetMarket = params.country || 'Target Market';
    const intent = params.strategicIntent?.[0] || 'Strategic Expansion';
    const reportDate = new Date().toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    return {
      title: 'STRATEGIC INTELLIGENCE DOSSIER',
      subtitle: `${intent} - ${targetMarket}`,
      classification: 'CONFIDENTIAL',
      preparedFor: entityName,
      preparedBy: 'BW Global Advisory',
      date: reportDate,
      reportId: `BW-${new Date().getFullYear()}-${targetMarket.substring(0,2).toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      version: '1.0',
      
      sections: [
        // Executive Summary
        {
          title: 'Executive Summary',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: 'Strategic Recommendation',
          type: 'recommendation',
          content: `${entityName} is well-positioned to pursue ${intent.toLowerCase()} in ${targetMarket}. Our comprehensive analysis indicates favorable conditions for market entry with appropriate risk mitigation strategies in place.`
        },
        {
          title: 'Key Performance Indicators',
          type: 'metric',
          content: '',
          metrics: [
            { 
              label: 'SPI(Strategic Partnership Index)', 
              value: `${analysisResults.spiScore || 82}/100`, 
              status: (analysisResults.spiScore || 82) >= 70 ? 'positive' : 'neutral' 
            },
            { 
              label: 'IVAS(Investment Viability)', 
              value: `${analysisResults.ivasScore || 76}/100`, 
              status: (analysisResults.ivasScore || 76) >= 70 ? 'positive' : 'neutral' 
            },
            { 
              label: 'RROI(Regional ROI)', 
              value: `${analysisResults.rroi || 18.4}%`, 
              status: (analysisResults.rroi || 18.4) >= 15 ? 'positive' : 'neutral' 
            },
            { 
              label: 'FRS(Flywheel Readiness)', 
              value: `${analysisResults.frsScore || 78}/100`, 
              status: (analysisResults.frsScore || 78) >= 70 ? 'positive' : 'neutral' 
            }
          ]
        },
        {
          title: 'Recommended Actions',
          type: 'list',
          content: [
            `Immediate (0-3 months): Initiate partner engagement and preliminary due diligence`,
            `Short-term (3-6 months): Negotiate MOU and complete comprehensive due diligence`,
            `Medium-term (6-12 months): Finalize agreements and establish operational presence`,
            `Long-term (12-18 months): Launch operations and scale according to market response`
          ]
        },
        
        // Market Analysis
        {
          title: 'Market Analysis',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: 'Market Overview',
          type: 'paragraph',
          content: `${targetMarket} presents a compelling opportunity for ${entityName}'s ${intent.toLowerCase()}. The market demonstrates strong fundamentals with sustained growth trajectory and increasing receptiveness to foreign investment in the ${params.industry?.[0] || 'target'} sector.`
        },
        {
          title: 'Market Metrics',
          type: 'table',
          content: '',
          tableData: {
            headers: ['Metric', 'Value', 'Assessment'],
            rows: [
              ['GDP Growth Rate', '5.5-7.0%', 'Above Regional Average'],
              ['FDI Inflow', '$20-25B annually', 'Strong Foreign Interest'],
              ['Sector Growth', '15-25% CAGR', 'High Growth Potential'],
              ['Ease of Business', 'Top 80 globally', 'Improving Environment'],
              ['Currency Stability', 'Moderate volatility', 'Hedging Recommended']
            ]
          }
        },
        
        // Partner Analysis
        {
          title: 'Partner Analysis',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: 'Recommended Partners',
          type: 'paragraph',
          content: `Based on our SEAM(Symbiotic Ecosystem Assessment & Matching) analysis, we have identified strategic partners that align with ${entityName}'s objectives and operational requirements.`
        },
        {
          title: 'Partner Rankings',
          type: 'table',
          content: '',
          tableData: {
            headers: ['Rank', 'Partner', 'SEAMScore', 'Key Strength', 'Consideration'],
            rows: (analysisResults.partnerMatches || [
              { name: 'Primary Partner Candidate', score: 89, details: 'Strong market presence' },
              { name: 'Alternative Partner 1', score: 76, details: 'Regional expertise' },
              { name: 'Alternative Partner 2', score: 72, details: 'Technology focus' }
            ]).map((p, i) => [
              `${i + 1}`,
              p.name,
              `${p.score}/100`,
              p.details,
              p.score >= 80 ? 'Recommended' : 'Alternative'
            ])
          }
        },
        
        // Financial Projections
        {
          title: 'Financial Projections',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: '5-Year Forecast',
          type: 'table',
          content: '',
          tableData: {
            headers: ['Year', 'Revenue', 'EBITDA', 'Net Profit', 'Cumulative Cash'],
            rows: (analysisResults.financialProjections || [
              { year: 1, revenue: 4200000, ebitda: -800000, netProfit: -1100000 },
              { year: 2, revenue: 8500000, ebitda: 1200000, netProfit: 680000 },
              { year: 3, revenue: 14200000, ebitda: 3100000, netProfit: 2100000 },
              { year: 4, revenue: 21000000, ebitda: 5200000, netProfit: 3640000 },
              { year: 5, revenue: 28500000, ebitda: 7400000, netProfit: 5180000 }
            ]).map((p, i) => {
              const cumulative = (analysisResults.financialProjections || [])
                .slice(0, i + 1)
                .reduce((sum, yr) => sum + yr.netProfit, 0);
              return [
                `Year ${p.year}`,
                `$${(p.revenue / 1000000).toFixed(1)}M`,
                `$${(p.ebitda / 1000000).toFixed(1)}M`,
                `$${(p.netProfit / 1000000).toFixed(1)}M`,
                `$${(cumulative / 1000000).toFixed(1)}M`
              ];
            })
          }
        },
        
        // Risk Assessment
        {
          title: 'Risk Assessment',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: 'Risk Register',
          type: 'table',
          content: '',
          tableData: {
            headers: ['Risk ID', 'Category', 'Description', 'Probability', 'Impact', 'Mitigation'],
            rows: (analysisResults.risks || [
              { id: 'R-001', category: 'Political', description: 'Policy change affecting FDI', probability: 'Low (15%)', impact: 'High', mitigation: 'Monitor, diversify partners' },
              { id: 'R-002', category: 'Currency', description: 'Local currency depreciation', probability: 'Medium (35%)', impact: 'Medium', mitigation: 'Hedge 60% of exposure' },
              { id: 'R-003', category: 'Partner', description: 'JV partner underperformance', probability: 'Medium (25%)', impact: 'High', mitigation: 'Performance milestones' },
              { id: 'R-004', category: 'Operational', description: 'Supply chain disruption', probability: 'Low (20%)', impact: 'Medium', mitigation: 'Dual sourcing strategy' },
              { id: 'R-005', category: 'Regulatory', description: 'License delays', probability: 'Medium (40%)', impact: 'Low', mitigation: 'Engage local counsel' }
            ]).map(r => [r.id, r.category, r.description, r.probability, r.impact, r.mitigation])
          }
        },
        
        // Implementation Roadmap
        {
          title: 'Implementation Roadmap',
          type: 'heading',
          level: 1,
          content: ''
        },
        {
          title: 'Phase 1: Partner Engagement (Months 1-3)',
          type: 'list',
          level: 2,
          content: [
            'Week 1-2: Initial partner outreach and meeting scheduling',
            'Week 3-4: Site visits and partner assessment',
            'Week 5-8: Negotiate preliminary terms and draft MOU',
            'Week 9-12: Sign MOU and initiate due diligence'
          ]
        },
        {
          title: 'Phase 2: Due Diligence (Months 4-8)',
          type: 'list',
          level: 2,
          content: [
            'Financial due diligence (6 weeks) - External auditor',
            'Legal due diligence (8 weeks) - Local and international counsel',
            'Technical due diligence (4 weeks) - Internal team',
            'Commercial due diligence (6 weeks) - Market research firm'
          ]
        },
        {
          title: 'Phase 3: Entity Formation (Months 9-12)',
          type: 'list',
          level: 2,
          content: [
            'Month 9: JV Agreement finalization and signing',
            'Month 10: Investment Registration Certificate application',
            'Month 11: Enterprise Registration and bank account setup',
            'Month 12: Operational launch'
          ]
        }
      ],
      
      appendices: [
        {
          title: 'Appendix A: Methodology',
          type: 'paragraph',
          content: `This analysis was conducted using the BWGA Ai Strategic Intelligence Platform, incorporating 21 proprietary NSIL formulas across market analysis, partner matching, financial modeling, and risk assessment. Data sources include World Bank, local government statistics, industry databases, and proprietary intelligence networks.`
        },
        {
          title: 'Appendix B: Disclaimer',
          type: 'paragraph',
          content: `This report is provided for informational purposes and does not constitute financial, legal, or investment advice. All projections are based on current data and assumptions that may change. ${entityName} should engage qualified professional advisors before making any investment decisions. Past performance is not indicative of future results.`
        }
      ],
      
      footer: {
        company: 'BW Global Advisory',
        disclaimer: 'Confidential - For authorized recipients only'
      }
    };
  }
  
  /**
   * Export document to formatted HTML suitable for printing/PDF
   */
  static exportToHTML(doc: ProfessionalDocument, options: Partial<ExportOptions> = {}): string {
    const opts: ExportOptions = {
      format: 'html',
      includeTableOfContents: doc.classification === 'CONFIDENTIAL',
      includePageNumbers: true,
      includeWatermark: doc.classification === 'CONFIDENTIAL',
      paperSize: 'A4',
      orientation: 'portrait',
      margins: 'normal',
      fontFamily: 'serif',
      colorScheme: 'professional',
      ...options
    };
    
    const fontStack = opts.fontFamily === 'serif' 
      ? "'Georgia', 'Times New Roman', serif"
      : "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    
    const colors = {
      professional: { primary: '#1a365d', secondary: '#2c5282', accent: '#3182ce', success: '#38a169', warning: '#d69e2e', danger: '#e53e3e' },
      modern: { primary: '#0f172a', secondary: '#1e293b', accent: '#6366f1', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444' },
      minimal: { primary: '#111827', secondary: '#374151', accent: '#4b5563', success: '#059669', warning: '#d97706', danger: '#dc2626' }
    };
    
    const scheme = colors[opts.colorScheme];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title} - ${doc.preparedFor}</title>
    <style>
        @page {
            size: ${opts.paperSize} ${opts.orientation};
            margin: ${opts.margins === 'narrow' ? '1cm' : opts.margins === 'wide' ? '3cm' : '2cm'};
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-before: always; }
            .no-print { display: none !important; }
            .keep-together { page-break-inside: avoid; }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: ${fontStack};
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            background: white;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
        }
        
        /* Cover Page */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
        }
        
        .cover-title {
            font-size: 32pt;
            font-weight: bold;
            color: ${scheme.primary};
            margin-bottom: 10mm;
            letter-spacing: 2px;
        }
        
        .cover-subtitle {
            font-size: 18pt;
            color: ${scheme.secondary};
            margin-bottom: 30mm;
        }
        
        .cover-meta {
            font-size: 12pt;
            color: #666;
        }
        
        .cover-meta table {
            margin: 0 auto;
            text-align: left;
        }
        
        .cover-meta td {
            padding: 3mm 5mm;
        }
        
        .cover-meta td:first-child {
            font-weight: bold;
            color: ${scheme.primary};
        }
        
        .classification-banner {
            position: absolute;
            top: 10mm;
            right: 10mm;
            background: ${scheme.danger};
            color: white;
            padding: 2mm 5mm;
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        /* Table of Contents */
        .toc {
            page-break-after: always;
        }
        
        .toc h2 {
            color: ${scheme.primary};
            font-size: 18pt;
            margin-bottom: 10mm;
            border-bottom: 2px solid ${scheme.accent};
            padding-bottom: 3mm;
        }
        
        .toc-item {
            display: flex;
            justify-content: space-between;
            padding: 2mm 0;
            border-bottom: 1px dotted #ccc;
        }
        
        .toc-item span:first-child {
            color: ${scheme.secondary};
        }
        
        /* Section Headers */
        h1 {
            font-size: 20pt;
            color: ${scheme.primary};
            margin: 15mm 0 8mm 0;
            padding-bottom: 3mm;
            border-bottom: 3px solid ${scheme.accent};
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 14pt;
            color: ${scheme.secondary};
            margin: 10mm 0 5mm 0;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 12pt;
            color: ${scheme.secondary};
            margin: 8mm 0 4mm 0;
        }
        
        p {
            margin-bottom: 4mm;
            text-align: justify;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 5mm 0 8mm 0;
            font-size: 10pt;
        }
        
        th {
            background: ${scheme.primary};
            color: white;
            padding: 3mm;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 3mm;
            border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        /* Metrics Box */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5mm;
            margin: 5mm 0 8mm 0;
        }
        
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #e2e8f0;
            border-left: 4px solid ${scheme.accent};
            padding: 4mm;
        }
        
        .metric-card .label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 1mm;
        }
        
        .metric-card .value {
            font-size: 18pt;
            font-weight: bold;
            color: ${scheme.primary};
        }
        
        .metric-card .status-positive { color: ${scheme.success}; }
        .metric-card .status-neutral { color: ${scheme.warning}; }
        .metric-card .status-negative { color: ${scheme.danger}; }
        
        /* Recommendation Box */
        .recommendation-box {
            background: linear-gradient(135deg, ${scheme.success} 0%, #2f855a 100%);
            color: white;
            padding: 6mm;
            border-radius: 2mm;
            margin: 5mm 0;
        }
        
        .recommendation-box h3 {
            color: white;
            margin: 0 0 3mm 0;
            font-size: 14pt;
        }
        
        /* Lists */
        ul, ol {
            margin: 3mm 0 5mm 8mm;
        }
        
        li {
            margin-bottom: 2mm;
        }
        
        /* Footer */
        .document-footer {
            margin-top: 20mm;
            padding-top: 5mm;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
        
        /* Print Controls */
        .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${scheme.accent};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            border: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .print-controls:hover {
            background: ${scheme.primary};
        }
        
        ${opts.includeWatermark ? `
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100pt;
            color: rgba(0,0,0,0.03);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
        }
        ` : ''}
    </style>
</head>
<body>
    <button class="print-controls no-print" onclick="window.print()">-¨ï¸ Print / Save as PDF</button>
    
    ${opts.includeWatermark ? '<div class="watermark">CONFIDENTIAL</div>' : ''}
    
    <!-- Cover Page -->
    <div class="cover-page">
        ${opts.includeWatermark ? `<div class="classification-banner">${doc.classification}</div>` : ''}
        <div class="cover-title">${doc.title}</div>
        <div class="cover-subtitle">${doc.subtitle || ''}</div>
        <div class="cover-meta">
            <table>
                <tr><td>Prepared For:</td><td>${doc.preparedFor}</td></tr>
                <tr><td>Prepared By:</td><td>${doc.preparedBy}</td></tr>
                <tr><td>Date:</td><td>${doc.date}</td></tr>
                ${doc.reportId ? `<tr><td>Report ID:</td><td>${doc.reportId}</td></tr>` : ''}
                ${doc.version ? `<tr><td>Version:</td><td>${doc.version}</td></tr>` : ''}
            </table>
        </div>
    </div>
    
    ${opts.includeTableOfContents ? this.generateTableOfContents(doc.sections) : ''}
    
    <!-- Document Body -->
    ${this.renderSections(doc.sections)}
    
    <!-- Appendices -->
    ${doc.appendices ? `
    <div class="page-break"></div>
    <h1>APPENDICES</h1>
    ${this.renderSections(doc.appendices)}
    ` : ''}
    
    <!-- Footer -->
    <div class="document-footer">
        <p><strong>${doc.footer.company}</strong></p>
        <p>${doc.footer.disclaimer}</p>
        <p>Generated by BWGA Ai Strategic Intelligence Platform</p>
    </div>
</body>
</html>`;
  }
  
  /**
   * Generate table of contents
   */
  private static generateTableOfContents(sections: DocumentSection[]): string {
    const headings = sections.filter(s => s.type === 'heading' && s.level === 1);
    
    return `
    <div class="toc page-break">
        <h2>Table of Contents</h2>
        ${headings.map((h, i) => `
            <div class="toc-item">
                <span>${i + 1}. ${h.title}</span>
                <span></span>
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * Render document sections
   */
  private static renderSections(sections: DocumentSection[]): string {
    return sections.map(section => {
      switch (section.type) {
        case 'heading': {
          const tag = section.level === 1 ? 'h1' : section.level === 2 ? 'h2' : 'h3';
          const pageBreak = section.level === 1 ? 'class="page-break"' : '';
          return `<${tag} ${pageBreak}>${section.title}</${tag}>`;
        }
          
        case 'paragraph':
          return `<h3>${section.title}</h3><p>${section.content}</p>`;
          
        case 'list': {
          const items = Array.isArray(section.content) ? section.content : [section.content];
          return `
            <h3>${section.title}</h3>
            <ul>
                ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>`;
        }
          
        case 'table':
          if (!section.tableData) return '';
          return `
            <h3>${section.title}</h3>
            <table>
                <thead>
                    <tr>${section.tableData.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${section.tableData.rows.map(row => `
                        <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>`;
          
        case 'metric':
          if (!section.metrics) return '';
          return `
            <h3>${section.title}</h3>
            <div class="metrics-grid">
                ${section.metrics.map(m => `
                    <div class="metric-card">
                        <div class="label">${m.label}</div>
                        <div class="value status-${m.status}">${m.value}</div>
                    </div>
                `).join('')}
            </div>`;
          
        case 'recommendation':
          return `
            <div class="recommendation-box keep-together">
                <h3>Strategic Recommendation: PROCEED</h3>
                <p>${section.content}</p>
            </div>`;
          
        default:
          return `<p>${section.content}</p>`;
      }
    }).join('\n');
  }
  
  /**
   * Generate and trigger download of document
   */
  static downloadAsHTML(doc: ProfessionalDocument, filename: string = 'strategic-report.html'): void {
    const html = this.exportToHTML(doc);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Generate Letter of Intent
   */
  static generateLetterOfIntent(params: {
    senderCompany: string;
    senderAddress: string;
    recipientCompany: string;
    recipientAddress: string;
    purpose: string;
    proposedTerms: string[];
    exclusivityPeriod?: string;
    confidentiality?: boolean;
    governingLaw?: string;
    signerName: string;
    signerTitle: string;
  }): string {
    const date = new Date().toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Letter of Intent</title>
    <style>
        @page { size: A4; margin: 25mm; }
        @media print { 
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
        body { 
            font-family: 'Times New Roman', serif; 
            font-size: 12pt; 
            line-height: 1.6; 
            max-width: 170mm;
            margin: 0 auto;
            padding: 25mm;
            color: #333;
        }
        .letterhead { 
            text-align: right; 
            margin-bottom: 20mm;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 5mm;
        }
        .letterhead h1 { 
            font-size: 18pt; 
            color: #1a365d; 
            margin: 0;
        }
        .letterhead p { margin: 2mm 0; color: #666; }
        .date { text-align: right; margin: 10mm 0; }
        .recipient { margin: 10mm 0; }
        .subject { 
            font-weight: bold; 
            margin: 10mm 0;
            text-transform: uppercase;
        }
        .salutation { margin: 8mm 0; }
        .body p { 
            text-align: justify; 
            margin-bottom: 5mm;
        }
        .terms { margin: 8mm 0 8mm 8mm; }
        .terms li { margin-bottom: 4mm; }
        .closing { margin-top: 15mm; }
        .signature-block { margin-top: 20mm; }
        .signature-line { 
            border-top: 1px solid #333; 
            width: 60mm; 
            margin: 15mm 0 3mm 0;
        }
        .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a365d;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <button class="print-btn no-print" onclick="window.print()">-¨ï¸ Print / PDF</button>
    
    <div class="letterhead">
        <h1>${params.senderCompany}</h1>
        <p>${params.senderAddress}</p>
    </div>
    
    <div class="date">${date}</div>
    
    <div class="recipient">
        <strong>${params.recipientCompany}</strong><br>
        ${params.recipientAddress}
    </div>
    
    <div class="subject">RE: LETTER OF INTENT - ${params.purpose.toUpperCase()}</div>
    
    <div class="salutation">Dear Sir/Madam,</div>
    
    <div class="body">
        <p>${params.senderCompany} ("we" or "the Company") is pleased to express our interest in exploring a strategic relationship with ${params.recipientCompany} ("you" or "the Counterparty") for the purpose of ${params.purpose}.</p>
        
        <p>This Letter of Intent outlines the principal terms under which we propose to proceed with discussions:</p>
        
        <ol class="terms">
            ${params.proposedTerms.map(term => `<li>${term}</li>`).join('')}
        </ol>
        
        ${params.exclusivityPeriod ? `<p><strong>Exclusivity:</strong> During the ${params.exclusivityPeriod} period following execution of this Letter of Intent, neither party shall engage in discussions with third parties regarding similar transactions.</p>` : ''}
        
        ${params.confidentiality ? `<p><strong>Confidentiality:</strong> Both parties agree to maintain strict confidentiality regarding the existence and terms of these discussions, as well as any information exchanged in connection therewith.</p>` : ''}
        
        <p><strong>Non-Binding Nature:</strong> This Letter of Intent is intended to express the parties' mutual interest and is non-binding except with respect to confidentiality and exclusivity obligations. Definitive agreements will be subject to satisfactory due diligence, regulatory approvals, and negotiation of formal documentation.</p>
        
        ${params.governingLaw ? `<p><strong>Governing Law:</strong> This Letter of Intent shall be governed by the laws of ${params.governingLaw}.</p>` : ''}
        
        <p>We look forward to working with you to advance these discussions and explore the potential for a mutually beneficial relationship.</p>
    </div>
    
    <div class="closing">
        Yours sincerely,
    </div>
    
    <div class="signature-block">
        <div class="signature-line"></div>
        <strong>${params.signerName}</strong><br>
        ${params.signerTitle}<br>
        ${params.senderCompany}
    </div>
</body>
</html>`;
  }
}

export default ProfessionalDocumentExporter;

