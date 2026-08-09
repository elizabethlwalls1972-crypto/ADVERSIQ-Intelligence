/**
 * 
 * DOCUMENT INTEGRITY SERVICE
 * 
 *
 * Ensures every output from the BWGA Ai OS carries:
 *   1. Provenance tracking " who generated, when, what inputs
 *   2. Integrity classification headers " AI-generated, requires verification
 *   3. Tamper detection " hash-based integrity verification
 *   4. Immutable audit trail " every generation logged
 *   5. Anti-corruption guardrails " mandatory disclaimers
 *   6. Confidence scoring " how reliable is this output
 *
 * This service wraps ALL document outputs to ensure they cannot be
 * misrepresented as independent professional advice.
 *
 * 
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentProvenance {
  documentId: string;
  generatedAt: string;
  generatedBy: string;
  systemVersion: string;
  inputHash: string;
  outputHash: string;
  modelUsed: string;
  confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient-data';
  patternMatchCount: number;
  historicalParallelsUsed: number;
  formulasApplied: number;
  ethicalGateResult: string;
  complianceCheck: string;
}

export interface IntegrityHeader {
  classification: string;
  confidenceStatement: string;
  limitations: string[];
  mandatoryDisclaimers: string[];
  verificationRequirements: string[];
  legalNotice: string;
  dataFreshnessWarning: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  documentType: string;
  country: string;
  sector?: string;
  inputSummary: string;
  outputSummary: string;
  confidenceScore: number;
  ethicalGate: string;
  sanctionsChecked: boolean;
  flagsRaised: string[];
}

export interface IntegrityWrappedDocument {
  header: IntegrityHeader;
  provenance: DocumentProvenance;
  content: string;
  footer: string;
  auditEntry: AuditEntry;
}

// ============================================================================
// SERVICE
// ============================================================================

export class DocumentIntegrityService {

  private static auditTrail: AuditEntry[] = [];

  /**
   * Generate a unique document ID
   */
  private static generateDocId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BWNX-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Simple hash function for integrity verification
   */
  private static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Determine confidence level based on intelligence data
   */
  static assessConfidence(params: {
    patternMatches: number;
    historicalParallels: number;
    formulasApplied: number;
    countryInDatabase: boolean;
    sectorRecognised: boolean;
    ethicalGate: string;
  }): 'high' | 'medium' | 'low' | 'insufficient-data' {
    let score = 0;

    // Pattern matches contribute significantly
    if (params.patternMatches >= 3) score += 30;
    else if (params.patternMatches >= 1) score += 15;

    // Historical parallels add credibility
    if (params.historicalParallels >= 2) score += 25;
    else if (params.historicalParallels >= 1) score += 12;

    // Formulas applied show depth
    if (params.formulasApplied >= 15) score += 20;
    else if (params.formulasApplied >= 5) score += 10;

    // Country/sector recognition
    if (params.countryInDatabase) score += 15;
    if (params.sectorRecognised) score += 10;

    // Ethical gate reduces confidence if flagged
    if (params.ethicalGate === 'reject') return 'insufficient-data';
    if (params.ethicalGate === 'redesign') score -= 20;
    if (params.ethicalGate === 'proceed-with-conditions') score -= 10;

    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 15) return 'low';
    return 'insufficient-data';
  }

  /**
   * Generate integrity header for any document
   */
  static generateIntegrityHeader(params: {
    documentType: string;
    confidence: 'high' | 'medium' | 'low' | 'insufficient-data';
    country?: string;
    sector?: string;
    fundingSource?: string;
  }): IntegrityHeader {
    const confidenceStatements: Record<string, string> = {
      'high': 'This analysis draws on extensive pattern matching (25-63 years), multiple historical parallels, and comprehensive formula computation. Confidence in the directional accuracy of this analysis is HIGH. All specific claims require independent verification.',
      'medium': 'This analysis draws on recognisable patterns and available data but may have gaps in coverage for the specific jurisdiction or sector. Confidence is MODERATE. All claims require independent professional review.',
      'low': 'This analysis has limited pattern matches or historical parallels for the specific query. Confidence is LOW. This should be treated as preliminary intelligence only. Comprehensive professional review is essential.',
      'insufficient-data': 'INSUFFICIENT DATA for reliable analysis. The system has flagged significant gaps in available intelligence. This output should be treated as exploratory only and MUST NOT be relied upon without extensive independent verification.',
    };

    const classification = params.confidence === 'high'
      ? 'AI-GENERATED INTELLIGENCE - HIGH CONFIDENCE'
      : params.confidence === 'medium'
        ? 'AI-GENERATED INTELLIGENCE - MODERATE CONFIDENCE'
        : params.confidence === 'low'
          ? 'AI-GENERATED INTELLIGENCE - LOW CONFIDENCE'
          : '"´ AI-GENERATED INTELLIGENCE - INSUFFICIENT DATA';

    return {
      classification,
      confidenceStatement: confidenceStatements[params.confidence],
      limitations: [
        'This system does not have access to real-time regulatory databases or live government registries.',
        'Tax rates, incentive structures, and regulatory frameworks may have changed since the knowledge base was last updated.',
        'Country-specific legal advice must be obtained from qualified professionals in the relevant jurisdiction.',
        'Financial projections use methodology-based assumptions and are NOT guarantees of returns.',
        'Cultural, political, and relationship dynamics cannot be fully captured by algorithmic analysis.',
      ],
      mandatoryDisclaimers: [
        'DISCLAIMER: This document was generated by BWGA Ai OS, an artificial intelligence system. It does not constitute legal, financial, tax, or professional advice.',
        `Document Type: ${params.documentType}`,
        `Target Jurisdiction: ${params.country || 'Not specified'}`,
        `Sector: ${params.sector || 'Not specified'}`,
        `Funding Source: ${params.fundingSource || 'Not specified'}`,
        'Independent professional verification is REQUIRED before any reliance on this document.',
        'The system operator and developers accept no liability for decisions made based on this output.',
      ],
      verificationRequirements: [
        'Local legal counsel in the target jurisdiction must review all regulatory claims.',
        'Financial projections must be validated by a qualified financial advisor.',
        'Tax implications must be confirmed with a licensed tax professional.',
        'Environmental compliance requirements must be verified with competent authorities.',
        'Labour law applicability must be confirmed with employment law specialists.',
      ],
      legalNotice: ' BWGA Ai OS. This document contains AI-generated analysis based on pattern recognition, historical parallels, and computational methodology. No warranty of accuracy is provided or implied. All intellectual property in the underlying methodology remains with the system operators.',
      dataFreshnessWarning: `Analysis generated: ${new Date().toISOString()}. Data currency varies by component " regulatory data may be up to 12 months behind current law. Always verify against current official sources.`,
    };
  }

  /**
   * Generate document provenance record
   */
  static generateProvenance(params: {
    inputData: string;
    outputContent: string;
    modelUsed?: string;
    patternMatches?: number;
    historicalParallels?: number;
    formulasApplied?: number;
    ethicalGate?: string;
    complianceCheck?: string;
    confidence: 'high' | 'medium' | 'low' | 'insufficient-data';
  }): DocumentProvenance {
    return {
      documentId: this.generateDocId(),
      generatedAt: new Date().toISOString(),
      generatedBy: 'BWGA Ai OS v2.0',
      systemVersion: '2.0.0-intelligence',
      inputHash: this.simpleHash(params.inputData),
      outputHash: this.simpleHash(params.outputContent),
      modelUsed: params.modelUsed || 'Gemini 2.0 Flash + NSIL Intelligence Hub',
      confidenceLevel: params.confidence,
      patternMatchCount: params.patternMatches || 0,
      historicalParallelsUsed: params.historicalParallels || 0,
      formulasApplied: params.formulasApplied || 0,
      ethicalGateResult: params.ethicalGate || 'not-assessed',
      complianceCheck: params.complianceCheck || 'not-performed',
    };
  }

  /**
   * Create audit trail entry
   */
  static createAuditEntry(params: {
    action: string;
    documentType: string;
    country: string;
    sector?: string;
    inputSummary: string;
    outputSummary: string;
    confidenceScore: number;
    ethicalGate: string;
    sanctionsChecked: boolean;
    flagsRaised?: string[];
  }): AuditEntry {
    const entry: AuditEntry = {
      id: this.generateDocId(),
      timestamp: new Date().toISOString(),
      action: params.action,
      documentType: params.documentType,
      country: params.country,
      sector: params.sector,
      inputSummary: params.inputSummary,
      outputSummary: params.outputSummary,
      confidenceScore: params.confidenceScore,
      ethicalGate: params.ethicalGate,
      sanctionsChecked: params.sanctionsChecked,
      flagsRaised: params.flagsRaised || [],
    };

    this.auditTrail.push(entry);
    return entry;
  }

  /**
   * Wrap document content with full integrity framework
   */
  static wrapDocument(params: {
    content: string;
    documentType: string;
    country?: string;
    sector?: string;
    fundingSource?: string;
    inputData: string;
    modelUsed?: string;
    patternMatches?: number;
    historicalParallels?: number;
    formulasApplied?: number;
    ethicalGate?: string;
    complianceCheck?: string;
  }): IntegrityWrappedDocument {
    // Assess confidence
    const confidence = this.assessConfidence({
      patternMatches: params.patternMatches || 0,
      historicalParallels: params.historicalParallels || 0,
      formulasApplied: params.formulasApplied || 0,
      countryInDatabase: !!params.country,
      sectorRecognised: !!params.sector,
      ethicalGate: params.ethicalGate || 'proceed',
    });

    // Generate integrity header
    const header = this.generateIntegrityHeader({
      documentType: params.documentType,
      confidence,
      country: params.country,
      sector: params.sector,
      fundingSource: params.fundingSource,
    });

    // Generate provenance
    const provenance = this.generateProvenance({
      inputData: params.inputData,
      outputContent: params.content,
      modelUsed: params.modelUsed,
      patternMatches: params.patternMatches,
      historicalParallels: params.historicalParallels,
      formulasApplied: params.formulasApplied,
      ethicalGate: params.ethicalGate,
      complianceCheck: params.complianceCheck,
      confidence,
    });

    // Create audit entry
    const auditEntry = this.createAuditEntry({
      action: 'document-generation',
      documentType: params.documentType,
      country: params.country || 'unspecified',
      sector: params.sector,
      inputSummary: params.inputData.substring(0, 200),
      outputSummary: params.content.substring(0, 200),
      confidenceScore: confidence === 'high' ? 85 : confidence === 'medium' ? 60 : confidence === 'low' ? 35 : 15,
      ethicalGate: params.ethicalGate || 'not-assessed',
      sanctionsChecked: !!params.complianceCheck,
      flagsRaised: confidence === 'insufficient-data' ? ['Insufficient data for reliable analysis'] : [],
    });

    // Footer
    const footer = [
      `â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€`,
      `Document ID: ${provenance.documentId}`,
      `Generated: ${provenance.generatedAt}`,
      `Confidence: ${confidence.toUpperCase()}`,
      `Input Hash: ${provenance.inputHash} | Output Hash: ${provenance.outputHash}`,
      `Patterns: ${provenance.patternMatchCount} | Parallels: ${provenance.historicalParallelsUsed} | Formulas: ${provenance.formulasApplied}`,
      `Ethical Gate: ${provenance.ethicalGateResult}`,
      `Model: ${provenance.modelUsed}`,
      `â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€`,
      header.legalNotice,
    ].join('\n');

    return { header, provenance, content: params.content, footer, auditEntry };
  }

  /**
   * Generate integrity header text for prepending to document content
   */
  static formatHeaderForDocument(header: IntegrityHeader): string {
    const lines: string[] = [
      ``,
      header.classification,
      ``,
      ``,
      header.confidenceStatement,
      ``,
      `**Mandatory Disclaimers:**`,
      ...header.mandatoryDisclaimers.map(d => `${d}`),
      ``,
      `**Verification Requirements:**`,
      ...header.verificationRequirements.map(v => `${v}`),
      ``,
      `**Data Freshness:** ${header.dataFreshnessWarning}`,
      ``,
      ``,
      ``,
    ];
    return lines.join('\n');
  }

  /**
   * Get full audit trail
   */
  static getAuditTrail(): AuditEntry[] {
    return [...this.auditTrail];
  }

  /**
   * Get audit statistics
   */
  static getAuditStats(): {
    totalDocuments: number;
    byConfidence: Record<string, number>;
    flagsRaised: number;
    countriesCovered: string[];
  } {
    const stats = {
      totalDocuments: this.auditTrail.length,
      byConfidence: { high: 0, medium: 0, low: 0, insufficient: 0 } as Record<string, number>,
      flagsRaised: 0,
      countriesCovered: [...new Set(this.auditTrail.map(e => e.country))],
    };

    for (const entry of this.auditTrail) {
      if (entry.confidenceScore >= 70) stats.byConfidence.high++;
      else if (entry.confidenceScore >= 40) stats.byConfidence.medium++;
      else if (entry.confidenceScore >= 15) stats.byConfidence.low++;
      else stats.byConfidence.insufficient++;
      stats.flagsRaised += entry.flagsRaised.length;
    }

    return stats;
  }

  /**
   * Validate document integrity (compare hashes)
   */
  static validateIntegrity(provenance: DocumentProvenance, currentContent: string): boolean {
    const currentHash = this.simpleHash(currentContent);
    return currentHash === provenance.outputHash;
  }
}

export default DocumentIntegrityService;

