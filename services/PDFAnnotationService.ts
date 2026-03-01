/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — PDF ANNOTATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Creates annotated response documents from uploaded source material.
 *
 * For each analysed passage from an uploaded document, this service builds
 * a two-column annotated PDF using jsPDF (already installed):
 *
 *   ┌─────────────────────────────────┐   ╔═══════════════════════════════════╗
 *   │ SOURCE PASSAGE                  │───▶║ BW OS ANALYSIS CALLOUT           ║
 *   │ (highlighted with red border)   │   ║ Key finding / recommendation      ║
 *   └─────────────────────────────────┘   ╚═══════════════════════════════════╝
 *
 * Output: .pdf blob download — "BWGA-Annotated-[title].pdf"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import jsPDF from 'jspdf';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SourceAnnotation {
  /** Short label for this passage (e.g. "Lesson 3 — Poor Regions Stay Poor") */
  label: string;
  /** The verbatim or summarised passage being annotated */
  sourceText: string;
  /** The OS analysis / response for this passage */
  analysisText: string;
  /** Optional engine(s) that produced the analysis */
  engineSources?: string[];
  /** Severity / importance level for border colour */
  severity?: 'critical' | 'high' | 'medium' | 'insight';
}

export interface AnnotatedDocumentParams {
  documentTitle: string;
  documentType: string;
  jurisdiction: string;
  preparedFor: string;
  reportId: string;
  annotations: SourceAnnotation[];
  executiveSummary?: string;
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const COLOURS = {
  critical: [220, 38, 38] as [number, number, number],   // red
  high:     [234, 88, 12] as [number, number, number],   // orange
  medium:   [161, 98, 7]  as [number, number, number],   // amber
  insight:  [37, 99, 235]  as [number, number, number],  // blue
  bwGold:   [180, 130, 40] as [number, number, number],  // brand gold
  bgSource:  [254, 249, 240] as [number, number, number], // warm source bg
  bgAnalysis:[240, 249, 254] as [number, number, number], // cool analysis bg
  textDark:  [20, 20, 20]   as [number, number, number],
  textMid:   [80, 80, 80]   as [number, number, number],
  lineGray:  [200, 200, 200] as [number, number, number],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function setTextColour(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

/**
 * Wrap text to fit within maxWidth at current font size.
 * Returns array of lines.
 */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

/** Estimate rendered height of wrapped text block (mm) */
function textBlockHeight(lines: string[], lineHeightMm: number): number {
  return lines.length * lineHeightMm;
}

// ─── Cover page ───────────────────────────────────────────────────────────────

function drawCoverPage(doc: jsPDF, params: AnnotatedDocumentParams): void {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Dark header band
  setFill(doc, [18, 24, 38]);
  doc.rect(0, 0, W, 52, 'F');

  // Gold accent bar
  setFill(doc, COLOURS.bwGold);
  doc.rect(0, 52, W, 2.5, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setTextColour(doc, COLOURS.bwGold);
  doc.text('BW GLOBAL ADVISORY', 18, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTextColour(doc, [160, 160, 160]);
  doc.text('NEXUS AI  •  NSIL AGENTIC RUNTIME', 18, 26);

  // Classification badge
  setFill(doc, [220, 38, 38]);
  doc.roundedRect(W - 52, 14, 36, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setTextColour(doc, [255, 255, 255]);
  doc.text('CONFIDENTIAL', W - 50, 19.8);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setTextColour(doc, COLOURS.textDark);
  const titleLines = wrapText(doc, `ANNOTATED ANALYSIS: ${params.documentTitle.toUpperCase()}`, W - 36);
  doc.text(titleLines, 18, 72);

  const afterTitle = 72 + textBlockHeight(titleLines, 8);

  // Sub-line
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setTextColour(doc, COLOURS.textMid);
  doc.text(`Document type: ${params.documentType}   •   Jurisdiction: ${params.jurisdiction}`, 18, afterTitle + 8);

  // Metadata table
  const metaY = afterTitle + 26;
  const metaItems = [
    ['Prepared for', params.preparedFor],
    ['Prepared by', 'BW Global Advisory — NEXUS AI'],
    ['Report ID', params.reportId],
    ['Date', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Annotations', `${params.annotations.length} passages analysed`],
    ['Engines activated', 'NSIL · HistoricalMatcher · PartnerIntelligence · AdversarialReasoning · CounterfactualEngine'],
  ];

  setFill(doc, [245, 247, 250]);
  doc.rect(18, metaY - 5, W - 36, metaItems.length * 9 + 6, 'F');
  setDraw(doc, COLOURS.lineGray);
  doc.setLineWidth(0.3);
  doc.rect(18, metaY - 5, W - 36, metaItems.length * 9 + 6, 'S');

  doc.setFontSize(8);
  metaItems.forEach(([label, value], i) => {
    const y = metaY + i * 9;
    doc.setFont('helvetica', 'bold');
    setTextColour(doc, COLOURS.textMid);
    doc.text(label, 22, y);
    doc.setFont('helvetica', 'normal');
    setTextColour(doc, COLOURS.textDark);
    const valLines = wrapText(doc, value, W - 90);
    doc.text(valLines[0] ?? '', 72, y);
  });

  // Executive summary if provided
  if (params.executiveSummary) {
    const esY = metaY + metaItems.length * 9 + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setTextColour(doc, COLOURS.textDark);
    doc.text('EXECUTIVE SUMMARY', 18, esY);

    setFill(doc, COLOURS.bgSource);
    setDraw(doc, COLOURS.bwGold);
    doc.setLineWidth(0.5);

    const esLines = wrapText(doc, params.executiveSummary, W - 40);
    const esH = textBlockHeight(esLines, 5.2) + 10;
    doc.roundedRect(18, esY + 4, W - 36, esH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColour(doc, COLOURS.textDark);
    doc.text(esLines, 23, esY + 11);
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setTextColour(doc, COLOURS.textMid);
  doc.text('BW Global Advisory Pty Ltd  •  bwglobaladvisory.com  •  NSIL Agentic Runtime v4', 18, H - 10);
  doc.text(`${params.reportId}  •  Page 1`, W - 40, H - 10);
}

// ─── Annotation page ──────────────────────────────────────────────────────────

/**
 * Draw one annotation block (source passage + callout box) on the current page.
 * Returns the Y position after the block.
 */
function drawAnnotationBlock(
  doc: jsPDF,
  annotation: SourceAnnotation,
  index: number,
  startY: number,
  pageNumber: number,
  totalAnnotations: number,
): number {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const MARGIN = 14;
  const colWidth = (W - MARGIN * 2 - 12) / 2; // 12mm gap between columns
  const leftX = MARGIN;
  const rightX = MARGIN + colWidth + 12;
  const sourceColW = colWidth - 4;
  const analysisColW = colWidth - 4;
  const lineH = 5;
  const minBlockH = 40;

  const sev = annotation.severity ?? 'insight';
  const borderCol = COLOURS[sev];

  // ── Source text lines ──
  doc.setFontSize(8);
  const sourceLabelLines = wrapText(doc, annotation.label, sourceColW);
  const sourceBodyLines = wrapText(doc, `"${annotation.sourceText}"`, sourceColW - 2);
  const sourceH = Math.max(minBlockH,
    textBlockHeight(sourceLabelLines, lineH) + 4 +
    textBlockHeight(sourceBodyLines, 4.8) + 12
  );

  // ── Analysis text lines ──
  const analysisBodyLines = wrapText(doc, annotation.analysisText, analysisColW - 4);
  const engineLine = annotation.engineSources?.join(' · ') ?? '';
  const engLines = engineLine ? wrapText(doc, engineLine, analysisColW - 4) : [];
  const analysisH = Math.max(minBlockH,
    textBlockHeight(analysisBodyLines, 4.8) +
    (engLines.length ? textBlockHeight(engLines, 4.4) + 6 : 0) + 14
  );

  const blockH = Math.max(sourceH, analysisH);

  // ── Page overflow check ──
  if (startY + blockH > H - 20) {
    doc.addPage();
    startY = 18;
    // Thin page header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setTextColour(doc, COLOURS.bwGold);
    doc.text('BW GLOBAL ADVISORY  •  ANNOTATED ANALYSIS', MARGIN, 10);
    doc.setFont('helvetica', 'normal');
    setTextColour(doc, COLOURS.textMid);
    doc.text(`Page ${pageNumber}`, W - MARGIN - 12, 10);
    setDraw(doc, COLOURS.lineGray);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 12, W - MARGIN, 12);
    startY = 18;
  }

  // ── Annotation number badge ──
  setFill(doc, borderCol);
  doc.circle(leftX + 4, startY + 4, 3.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setTextColour(doc, [255, 255, 255]);
  doc.text(`${index + 1}`, leftX + (index + 1 < 10 ? 2.8 : 1.6), startY + 5.4);

  // ── SOURCE box (left column) ──
  setFill(doc, COLOURS.bgSource);
  setDraw(doc, borderCol);
  doc.setLineWidth(1.2);
  doc.roundedRect(leftX + 9, startY, sourceColW - 5, blockH, 2, 2, 'FD');
  // Left accent stripe
  setFill(doc, borderCol);
  doc.roundedRect(leftX + 9, startY, 3, blockH, 1, 1, 'F');

  // Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setTextColour(doc, borderCol);
  doc.text(sourceLabelLines, leftX + 15, startY + 7);

  const labelH = textBlockHeight(sourceLabelLines, lineH);
  doc.setLineWidth(0.2);
  setDraw(doc, COLOURS.lineGray);
  doc.line(leftX + 14, startY + labelH + 8, leftX + sourceColW + 3, startY + labelH + 8);

  // Source body
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.8);
  setTextColour(doc, COLOURS.textDark);
  doc.text(sourceBodyLines, leftX + 15, startY + labelH + 14);

  // ── Connector line + arrow ──
  const connY = startY + blockH / 2;
  const connX1 = leftX + 9 + sourceColW - 5;
  const connX2 = rightX;
  setDraw(doc, borderCol);
  doc.setLineWidth(0.8);
  doc.line(connX1, connY, connX2, connY);
  // Arrowhead
  doc.line(connX2 - 3, connY - 2, connX2, connY);
  doc.line(connX2 - 3, connY + 2, connX2, connY);

  // ── ANALYSIS callout box (right column) ──
  setFill(doc, COLOURS.bgAnalysis);
  setDraw(doc, [37, 99, 235]);
  doc.setLineWidth(1.2);
  doc.roundedRect(rightX, startY, analysisColW + 4, blockH, 2, 2, 'FD');
  // Top accent stripe
  setFill(doc, [37, 99, 235]);
  doc.roundedRect(rightX, startY, analysisColW + 4, 3, 1, 1, 'F');

  // "OS ANALYSIS" chip
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  setTextColour(doc, [37, 99, 235]);
  doc.text('OS ANALYSIS', rightX + 4, startY + 11);

  setDraw(doc, COLOURS.lineGray);
  doc.setLineWidth(0.2);
  doc.line(rightX + 3, startY + 13, rightX + analysisColW + 1, startY + 13);

  // Analysis body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  setTextColour(doc, COLOURS.textDark);
  doc.text(analysisBodyLines, rightX + 4, startY + 19);

  // Engine sources
  if (engLines.length) {
    const engY = startY + 19 + textBlockHeight(analysisBodyLines, 4.8) + 5;
    doc.setFont('helvetica', 'oblique');
    doc.setFontSize(6.5);
    setTextColour(doc, [100, 130, 180]);
    doc.text(`Engines: ${engLines[0]}`, rightX + 4, engY);
  }

  return startY + blockH + 10;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate and download an annotated response PDF.
 *
 * @example
 * PDFAnnotationService.generate({
 *   documentTitle: 'Philippines Regional Development',
 *   documentType: 'Policy Research Volume',
 *   jurisdiction: 'Philippines',
 *   preparedFor: 'Government Member',
 *   reportId: 'BWGA-2026-PH-001',
 *   executiveSummary: '...',
 *   annotations: [
 *     {
 *       label: 'Lesson 3 — Poor Regions Stay Poor',
 *       sourceText: 'No major changes have occurred in Philippine economic geography...',
 *       analysisText: 'NSIL scores this as a structural lock-in pattern. Historical parallel: Indonesia coastal-inland divergence 1998–2006...',
 *       engineSources: ['NSIL', 'HistoricalMatcher'],
 *       severity: 'critical',
 *     },
 *   ],
 * });
 */
export class PDFAnnotationService {
  static generate(params: AnnotatedDocumentParams): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // ── Cover page ──
    drawCoverPage(doc, params);

    // ── Annotation pages ──
    doc.addPage();

    // Section header
    const W = doc.internal.pageSize.getWidth();
    const MARGIN = 14;

    setFill(doc, [18, 24, 38]);
    doc.rect(0, 0, W, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColour(doc, COLOURS.bwGold);
    doc.text('BW GLOBAL ADVISORY  •  ANNOTATED ANALYSIS', MARGIN, 10);
    doc.setFont('helvetica', 'normal');
    setTextColour(doc, [160, 160, 160]);
    doc.text(`${params.annotations.length} PASSAGES ANNOTATED`, W - MARGIN - 38, 10);

    let y = 22;
    let currentPage = 2;

    for (let i = 0; i < params.annotations.length; i++) {
      const prevY = y;
      y = drawAnnotationBlock(doc, params.annotations[i], i, y, currentPage, params.annotations.length);
      // If we moved to a new page, increment counter
      if (y < prevY) currentPage++;
    }

    // ── Total pages footer on last page ──
    const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
    for (let p = 2; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setTextColour(doc, COLOURS.textMid);
      doc.text(`${params.reportId}  •  Page ${p} of ${totalPages}`, W - MARGIN - 22, doc.internal.pageSize.getHeight() - 6);
      doc.text('CONFIDENTIAL  —  BW Global Advisory Pty Ltd', MARGIN, doc.internal.pageSize.getHeight() - 6);
    }

    // Download
    const safeName = params.documentTitle.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40);
    doc.save(`BWGA-Annotated-${safeName}.pdf`);
  }

  /**
   * Build annotation objects from a CaseStudyAnalysis + brain response.
   * Convenience method for BWConsultantOS upload handler.
   */
  static buildAnnotationsFromAnalysis(params: {
    sourcePassages: Array<{ label: string; text: string }>;
    brainResponses: Array<{ analysis: string; engines: string[]; severity?: 'critical' | 'high' | 'medium' | 'insight' }>;
  }): SourceAnnotation[] {
    return params.sourcePassages.map((p, i) => ({
      label: p.label,
      sourceText: p.text.length > 300 ? p.text.slice(0, 297) + '…' : p.text,
      analysisText: params.brainResponses[i]?.analysis ?? 'Analysis pending.',
      engineSources: params.brainResponses[i]?.engines ?? [],
      severity: params.brainResponses[i]?.severity ?? 'insight',
    }));
  }
}

export default PDFAnnotationService;
