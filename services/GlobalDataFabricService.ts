export type SignalType = 'policy' | 'macro' | 'trade' | 'infrastructure' | 'sanctions' | 'procurement';

export interface GlobalSignal {
  id: string;
  type: SignalType;
  country: string;
  jurisdiction: string;
  title: string;
  value: number;
  unit: string;
  source: string;
  timestamp: string;
  confidence: number;
  freshnessHours: number;
}

export interface DataFabricSnapshot {
  country: string;
  jurisdiction: string;
  generatedAt: string;
  overallConfidence: number;
  overallFreshnessHours: number;
  signals: GlobalSignal[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export class GlobalDataFabricService {
  static normalizeCountry(input: string): string {
    const v = input.trim().toLowerCase();
    if (!v) return 'unspecified';
    if (v === 'uk') return 'united kingdom';
    if (v === 'usa' || v === 'us') return 'united states';
    if (v === 'uae') return 'united arab emirates';
    return v;
  }

  static normalizeJurisdiction(input: string, country: string): string {
    const j = input.trim().toLowerCase();
    if (j) return j;
    return this.normalizeCountry(country);
  }

  static buildSnapshot(country: string, jurisdiction: string, context: string[] = []): DataFabricSnapshot {
    const normalizedCountry = this.normalizeCountry(country || 'unspecified');
    const normalizedJurisdiction = this.normalizeJurisdiction(jurisdiction || '', normalizedCountry);

    const hasComplianceSignal = context.some((line) => /compliance|regulat|law|policy|sanction/i.test(line));
    const hasTradeSignal = context.some((line) => /trade|export|import|logistics|corridor/i.test(line));
    const hasMacroSignal = context.some((line) => /gdp|inflation|interest|currency|financ/i.test(line));

    const now = new Date();

    const signals: GlobalSignal[] = [
      {
        id: `policy-${normalizedCountry}`,
        type: 'policy',
        country: normalizedCountry,
        jurisdiction: normalizedJurisdiction,
        title: 'Policy and regulatory baseline pulse',
        value: hasComplianceSignal ? 78 : 64,
        unit: 'score',
        source: 'GlobalDataFabric',
        timestamp: now.toISOString(),
        confidence: hasComplianceSignal ? 0.86 : 0.72,
        freshnessHours: hasComplianceSignal ? 4 : 12
      },
      {
        id: `macro-${normalizedCountry}`,
        type: 'macro',
        country: normalizedCountry,
        jurisdiction: normalizedJurisdiction,
        title: 'Macro stability pulse',
        value: hasMacroSignal ? 74 : 61,
        unit: 'score',
        source: 'GlobalDataFabric',
        timestamp: now.toISOString(),
        confidence: hasMacroSignal ? 0.82 : 0.69,
        freshnessHours: hasMacroSignal ? 6 : 18
      },
      {
        id: `trade-${normalizedCountry}`,
        type: 'trade',
        country: normalizedCountry,
        jurisdiction: normalizedJurisdiction,
        title: 'Trade and corridor pulse',
        value: hasTradeSignal ? 76 : 62,
        unit: 'score',
        source: 'GlobalDataFabric',
        timestamp: now.toISOString(),
        confidence: hasTradeSignal ? 0.84 : 0.67,
        freshnessHours: hasTradeSignal ? 5 : 20
      }
    ];

    const overallConfidence = clamp(
      signals.reduce((sum, signal) => sum + signal.confidence, 0) / signals.length,
      0,
      1
    );
    const overallFreshnessHours = Math.round(
      signals.reduce((sum, signal) => sum + signal.freshnessHours, 0) / signals.length
    );

    return {
      country: normalizedCountry,
      jurisdiction: normalizedJurisdiction,
      generatedAt: now.toISOString(),
      overallConfidence,
      overallFreshnessHours,
      signals
    };
  }
}
