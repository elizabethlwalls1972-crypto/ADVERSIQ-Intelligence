/**
 * CaseStudyAnalyzer — Document content analysis for the consultant workflow.
 * Called when a user uploads a file: extracts entities, risks, opportunities,
 * financial figures, and regulatory flags. Produces a structured case summary
 * that feeds into the NSIL pipeline.
 */

export interface CaseAnalysis {
  filename: string;
  fileType: string;
  wordCount: number;
  entities: string[];
  financials: string[];
  risks: string[];
  opportunities: string[];
  regulatoryFlags: string[];
  keyThemes: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  complexityScore: number;   // 0–100
  analysedAt: string;
}

function extractEntities(text: string): string[] {
  // Extract capitalized multi-word proper nouns (organisations, places)
  const matches = text.match(/\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+/g) || [];
  return [...new Set(matches)].slice(0, 15);
}

function extractFinancials(text: string): string[] {
  const matches = text.match(/(?:USD|AUD|EUR|GBP|SGD)?\s?\$?[\d,]+(?:\.\d{1,2})?\s?(?:million|billion|M|B|k)?/gi) || [];
  return [...new Set(matches.map(m => m.trim()))].filter(m => m.length > 2).slice(0, 10);
}

function extractRisks(text: string): string[] {
  const riskKeywords = ['risk', 'threat', 'challenge', 'constraint', 'barrier', 'concern', 'uncertainty', 'volatile', 'exposure'];
  const sentences = text.split(/[.!?]/);
  return sentences
    .filter(s => riskKeywords.some(k => s.toLowerCase().includes(k)))
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200)
    .slice(0, 5);
}

function extractOpportunities(text: string): string[] {
  const oppKeywords = ['opportunity', 'growth', 'potential', 'expand', 'invest', 'partnership', 'synergy', 'advantage'];
  const sentences = text.split(/[.!?]/);
  return sentences
    .filter(s => oppKeywords.some(k => s.toLowerCase().includes(k)))
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200)
    .slice(0, 5);
}

function extractRegulatoryFlags(text: string): string[] {
  const regKeywords = ['GDPR', 'OFAC', 'sanctions', 'compliance', 'regulatory', 'licence', 'license', 'permit', 'ESG', 'AML', 'KYC', 'FATF'];
  return regKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
}

function detectSentiment(text: string): CaseAnalysis['sentiment'] {
  const positive = (text.match(/\b(?:growth|opportunity|strong|excellent|positive|benefit|advantage|success)\b/gi) || []).length;
  const negative = (text.match(/\b(?:risk|challenge|concern|decline|threat|loss|failure|uncertain)\b/gi) || []).length;
  if (positive > negative * 2) return 'positive';
  if (negative > positive * 2) return 'negative';
  if (positive > 0 && negative > 0) return 'mixed';
  return 'neutral';
}

class CaseStudyAnalyzerClass {
  analyze(filename: string, content: string): CaseAnalysis {
    const words = content.split(/\s+/).filter(Boolean);
    const ext = filename.split('.').pop()?.toLowerCase() || 'txt';

    return {
      filename,
      fileType: ext,
      wordCount: words.length,
      entities: extractEntities(content),
      financials: extractFinancials(content),
      risks: extractRisks(content),
      opportunities: extractOpportunities(content),
      regulatoryFlags: extractRegulatoryFlags(content),
      keyThemes: [],
      sentiment: detectSentiment(content),
      complexityScore: Math.min(100, Math.round(words.length / 50)),
      analysedAt: new Date().toISOString(),
    };
  }

  toConsultantSummary(analysis: CaseAnalysis): string {
    const parts: string[] = [
      `**Document Analysis: ${analysis.filename}**`,
      `Type: ${analysis.fileType.toUpperCase()} | Words: ${analysis.wordCount} | Sentiment: ${analysis.sentiment}`,
      '',
    ];

    if (analysis.entities.length > 0) {
      parts.push(`**Key Entities:** ${analysis.entities.slice(0, 6).join(', ')}`);
    }
    if (analysis.financials.length > 0) {
      parts.push(`**Financial Figures:** ${analysis.financials.slice(0, 5).join(', ')}`);
    }
    if (analysis.risks.length > 0) {
      parts.push(`**Identified Risks (${analysis.risks.length}):**`);
      analysis.risks.slice(0, 3).forEach(r => parts.push(`  • ${r}`));
    }
    if (analysis.opportunities.length > 0) {
      parts.push(`**Opportunities (${analysis.opportunities.length}):**`);
      analysis.opportunities.slice(0, 3).forEach(o => parts.push(`  • ${o}`));
    }
    if (analysis.regulatoryFlags.length > 0) {
      parts.push(`**Regulatory Flags:** ${analysis.regulatoryFlags.join(', ')}`);
    }

    return parts.join('\n');
  }
}

const CaseStudyAnalyzer = new CaseStudyAnalyzerClass();
export default CaseStudyAnalyzer;
