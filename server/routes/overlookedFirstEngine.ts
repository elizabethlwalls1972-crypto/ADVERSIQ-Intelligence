export interface EvidenceItem {
  source: string;
  claim: string;
  recencyDays?: number;
  credibility?: number;
}

export interface MarketSignal {
  city: string;
  country: string;
  sector: string;
  saturationIndex: number;
  policySupportIndex: number;
  logisticsIndex: number;
  talentIndex: number;
  stabilityRisk: number;
}

export interface OverlookedScore {
  place: string;
  score: number;
  reason: string[];
}

export interface OverlookedIntelligenceSnapshot {
  evidenceCredibility: number;
  perceptionRealityGap: number;
  topRegionalOpportunities: OverlookedScore[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const tokenize = (value: string): string[] => value
  .toLowerCase()
  .split(/[^a-z0-9]+/)
  .map((token) => token.trim())
  .filter(Boolean);

export const credibilityScore = (evidence: EvidenceItem[]): number => {
  if (!evidence.length) return 0;

  const credibilityAvg = evidence.reduce((total, item) => total + clamp(item.credibility ?? 0.55, 0, 1), 0) / evidence.length;
  const recencyAvg = evidence.reduce((total, item) => {
    const recencyDays = typeof item.recencyDays === 'number' ? clamp(item.recencyDays, 0, 3650) : 365;
    const recencyFactor = 1 - recencyDays / 3650;
    return total + recencyFactor;
  }, 0) / evidence.length;

  return Math.round(clamp(((credibilityAvg * 0.72) + (recencyAvg * 0.28)) * 100, 0, 100));
};

export const perceptionRealityGap = (perceptionRisk: number, factualRisk: number): number => {
  return Math.round(clamp(perceptionRisk, 0, 100) - clamp(factualRisk, 0, 100));
};

export const rankOverlookedMarkets = (signals: MarketSignal[]): OverlookedScore[] => {
  return signals
    .map((signal) => {
      const upside =
        signal.policySupportIndex * 0.28 +
        signal.logisticsIndex * 0.2 +
        signal.talentIndex * 0.2 +
        (100 - signal.saturationIndex) * 0.22 +
        (100 - signal.stabilityRisk) * 0.1;

      const reasons = [
        signal.saturationIndex <= 45 ? 'Lower saturation than overdeveloped hub markets' : '',
        signal.policySupportIndex >= 65 ? 'Policy and investment support profile is favorable' : '',
        signal.logisticsIndex >= 60 ? 'Logistics and delivery infrastructure supports execution' : '',
        signal.talentIndex >= 60 ? 'Talent ecosystem can support scaling operations' : '',
        signal.stabilityRisk <= 45 ? 'Risk profile remains manageable for phased entry' : ''
      ].filter(Boolean);

      return {
        place: `${signal.city}, ${signal.country}`,
        score: Math.round(clamp(upside, 0, 100)),
        reason: reasons.length > 0 ? reasons : ['Mixed profile: requires deeper diligence']
      };
    })
    .sort((a, b) => b.score - a.score);
};

const extractCaseStudyObject = (context?: unknown): Record<string, unknown> => {
  if (!context || typeof context !== 'object') return {};
  const root = context as Record<string, unknown>;
  const caseStudy = root.caseStudy;
  if (!caseStudy || typeof caseStudy !== 'object') return {};
  return caseStudy as Record<string, unknown>;
};

const deriveFallbackMarketSignals = (message: string, context?: unknown): MarketSignal[] => {
  const caseStudy = extractCaseStudyObject(context);
  const text = `${message} ${String(caseStudy.currentMatter || '')} ${String(caseStudy.objectives || '')} ${String(caseStudy.country || '')} ${String(caseStudy.jurisdiction || '')}`.toLowerCase();
  const objectiveTokens = tokenize(text);
  const diversificationBias = objectiveTokens.some((token) => ['regional', 'overlooked', 'new', 'expansion', 'market'].includes(token));

  // 1. Dynamic country detection
  const detectedCountry = (() => {
    if (caseStudy.country && typeof caseStudy.country === 'string' && caseStudy.country.trim()) {
      return caseStudy.country.trim();
    }
    if (text.includes('china')) return 'China';
    if (text.includes('philippines') || text.includes('cebu') || text.includes('manila')) return 'Philippines';
    if (text.includes('vietnam') || text.includes('viet nam') || text.includes('hanoi')) return 'Vietnam';
    if (text.includes('indonesia') || text.includes('surabaya') || text.includes('jakarta')) return 'Indonesia';
    if (text.includes('india') || text.includes('mumbai')) return 'India';
    if (text.includes('germany') || text.includes('berlin')) return 'Germany';
    if (text.includes('uk') || text.includes('united kingdom') || text.includes('london')) return 'United Kingdom';
    if (text.includes('us') || text.includes('usa') || text.includes('united states')) return 'United States';
    if (text.includes('japan') || text.includes('tokyo')) return 'Japan';
    return null;
  })();

  // 2. Dynamic sector detection
  const detectedSector = (() => {
    const caseSector = typeof caseStudy.organizationType === 'string' ? caseStudy.organizationType : '';
    const searchTarget = `${text} ${caseSector.toLowerCase()}`;
    if (searchTarget.includes('manufactur') || searchTarget.includes('automotive') || searchTarget.includes('car') || searchTarget.includes('steel') || searchTarget.includes('factory')) return 'manufacturing';
    if (searchTarget.includes('agri') || searchTarget.includes('farm') || searchTarget.includes('food')) return 'agribusiness';
    if (searchTarget.includes('logistics') || searchTarget.includes('shipping') || searchTarget.includes('port') || searchTarget.includes('trade')) return 'logistics';
    if (searchTarget.includes('tech') || searchTarget.includes('software') || searchTarget.includes('digital') || searchTarget.includes('ai') || searchTarget.includes('data')) return 'digital';
    if (searchTarget.includes('infra') || searchTarget.includes('road') || searchTarget.includes('power')) return 'infrastructure';
    if (searchTarget.includes('tour') || searchTarget.includes('hotel') || searchTarget.includes('hospitality')) return 'tourism';
    if (searchTarget.includes('financ') || searchTarget.includes('bank') || searchTarget.includes('fund') || searchTarget.includes('invest')) return 'finance';
    return null;
  })();

  const countryCities: Record<string, Array<{ city: string; defaultSector: string; basePolicy: number; baseLogistics: number; baseTalent: number; baseStability: number }>> = {
    'Philippines': [
      { city: 'Cebu', defaultSector: 'digital', basePolicy: 72, baseLogistics: 64, baseTalent: 66, baseStability: 41 },
      { city: 'Davao', defaultSector: 'agribusiness', basePolicy: 69, baseLogistics: 58, baseTalent: 62, baseStability: 43 },
      { city: 'Iloilo', defaultSector: 'digital', basePolicy: 68, baseLogistics: 62, baseTalent: 65, baseStability: 39 },
      { city: 'Cagayan de Oro', defaultSector: 'logistics', basePolicy: 66, baseLogistics: 60, baseTalent: 58, baseStability: 44 },
      { city: 'Bacolod', defaultSector: 'digital', basePolicy: 67, baseLogistics: 59, baseTalent: 61, baseStability: 40 },
    ],
    'Vietnam': [
      { city: 'Da Nang', defaultSector: 'manufacturing', basePolicy: 70, baseLogistics: 68, baseTalent: 63, baseStability: 39 },
      { city: 'Hai Phong', defaultSector: 'logistics', basePolicy: 74, baseLogistics: 72, baseTalent: 60, baseStability: 42 },
      { city: 'Can Tho', defaultSector: 'agribusiness', basePolicy: 67, baseLogistics: 61, baseTalent: 58, baseStability: 40 },
      { city: 'Nha Trang', defaultSector: 'tourism', basePolicy: 65, baseLogistics: 62, baseTalent: 56, baseStability: 38 },
      { city: 'Bien Hoa', defaultSector: 'manufacturing', basePolicy: 69, baseLogistics: 67, baseTalent: 59, baseStability: 41 },
    ],
    'Indonesia': [
      { city: 'Surabaya', defaultSector: 'logistics', basePolicy: 67, baseLogistics: 70, baseTalent: 64, baseStability: 44 },
      { city: 'Bandung', defaultSector: 'digital', basePolicy: 69, baseLogistics: 66, baseTalent: 72, baseStability: 41 },
      { city: 'Medan', defaultSector: 'agribusiness', basePolicy: 64, baseLogistics: 62, baseTalent: 60, baseStability: 46 },
      { city: 'Makassar', defaultSector: 'logistics', basePolicy: 66, baseLogistics: 63, baseTalent: 59, baseStability: 45 },
      { city: 'Semarang', defaultSector: 'manufacturing', basePolicy: 68, baseLogistics: 65, baseTalent: 62, baseStability: 40 },
    ],
    'China': [
      { city: 'Suzhou', defaultSector: 'manufacturing', basePolicy: 78, baseLogistics: 85, baseTalent: 76, baseStability: 32 },
      { city: 'Chengdu', defaultSector: 'digital', basePolicy: 76, baseLogistics: 78, baseTalent: 79, baseStability: 34 },
      { city: 'Wuhan', defaultSector: 'logistics', basePolicy: 74, baseLogistics: 80, baseTalent: 75, baseStability: 35 },
      { city: 'Xi\'an', defaultSector: 'digital', basePolicy: 72, baseLogistics: 74, baseTalent: 73, baseStability: 33 },
      { city: 'Chongqing', defaultSector: 'manufacturing', basePolicy: 75, baseLogistics: 77, baseTalent: 72, baseStability: 36 },
    ],
    'India': [
      { city: 'Pune', defaultSector: 'manufacturing', basePolicy: 68, baseLogistics: 69, baseTalent: 74, baseStability: 43 },
      { city: 'Chennai', defaultSector: 'manufacturing', basePolicy: 70, baseLogistics: 74, baseTalent: 72, baseStability: 42 },
      { city: 'Hyderabad', defaultSector: 'digital', basePolicy: 72, baseLogistics: 71, baseTalent: 76, baseStability: 40 },
      { city: 'Ahmedabad', defaultSector: 'manufacturing', basePolicy: 71, baseLogistics: 70, baseTalent: 66, baseStability: 39 },
      { city: 'Bangalore', defaultSector: 'digital', basePolicy: 73, baseLogistics: 72, baseTalent: 80, baseStability: 41 },
    ],
    'United States': [
      { city: 'Austin', defaultSector: 'digital', basePolicy: 65, baseLogistics: 82, baseTalent: 85, baseStability: 28 },
      { city: 'Pittsburgh', defaultSector: 'manufacturing', basePolicy: 68, baseLogistics: 79, baseTalent: 78, baseStability: 26 },
      { city: 'Columbus', defaultSector: 'logistics', basePolicy: 66, baseLogistics: 80, baseTalent: 74, baseStability: 25 },
      { city: 'Nashville', defaultSector: 'tourism', basePolicy: 64, baseLogistics: 76, baseTalent: 72, baseStability: 27 },
      { city: 'Salt Lake City', defaultSector: 'digital', basePolicy: 69, baseLogistics: 78, baseTalent: 76, baseStability: 24 },
    ],
    'United Kingdom': [
      { city: 'Manchester', defaultSector: 'digital', basePolicy: 68, baseLogistics: 78, baseTalent: 76, baseStability: 30 },
      { city: 'Birmingham', defaultSector: 'manufacturing', basePolicy: 66, baseLogistics: 76, baseTalent: 72, baseStability: 32 },
      { city: 'Leeds', defaultSector: 'finance', basePolicy: 65, baseLogistics: 74, baseTalent: 73, baseStability: 29 },
      { city: 'Glasgow', defaultSector: 'digital', basePolicy: 67, baseLogistics: 72, baseTalent: 74, baseStability: 33 },
      { city: 'Bristol', defaultSector: 'digital', basePolicy: 69, baseLogistics: 75, baseTalent: 75, baseStability: 28 },
    ],
    'Germany': [
      { city: 'Stuttgart', defaultSector: 'manufacturing', basePolicy: 72, baseLogistics: 84, baseTalent: 80, baseStability: 25 },
      { city: 'Leipzig', defaultSector: 'logistics', basePolicy: 74, baseLogistics: 78, baseTalent: 72, baseStability: 28 },
      { city: 'Düsseldorf', defaultSector: 'finance', basePolicy: 70, baseLogistics: 82, baseTalent: 78, baseStability: 24 },
      { city: 'Dresden', defaultSector: 'digital', basePolicy: 73, baseLogistics: 76, baseTalent: 75, baseStability: 29 },
      { city: 'Hamburg', defaultSector: 'logistics', basePolicy: 71, baseLogistics: 85, baseTalent: 81, baseStability: 23 },
    ],
    'Japan': [
      { city: 'Osaka', defaultSector: 'finance', basePolicy: 75, baseLogistics: 88, baseTalent: 84, baseStability: 20 },
      { city: 'Nagoya', defaultSector: 'manufacturing', basePolicy: 73, baseLogistics: 86, baseTalent: 82, baseStability: 21 },
      { city: 'Fukuoka', defaultSector: 'digital', basePolicy: 78, baseLogistics: 82, baseTalent: 80, baseStability: 22 },
      { city: 'Sapporo', defaultSector: 'tourism', basePolicy: 70, baseLogistics: 80, baseTalent: 78, baseStability: 19 },
      { city: 'Kyoto', defaultSector: 'tourism', basePolicy: 72, baseLogistics: 84, baseTalent: 85, baseStability: 18 },
    ]
  };

  const getDynamicCitiesForCountry = (countryName: string): Array<{ city: string; defaultSector: string; basePolicy: number; baseLogistics: number; baseTalent: number; baseStability: number }> => {
    const name = countryName.trim();
    return [
      { city: `East ${name} Hub`, defaultSector: 'infrastructure', basePolicy: 68, baseLogistics: 65, baseTalent: 63, baseStability: 40 },
      { city: `South ${name} Port`, defaultSector: 'logistics', basePolicy: 70, baseLogistics: 68, baseTalent: 61, baseStability: 42 },
      { city: `Central ${name} Zone`, defaultSector: 'manufacturing', basePolicy: 72, baseLogistics: 64, baseTalent: 65, baseStability: 38 },
      { city: `North ${name} District`, defaultSector: 'digital', basePolicy: 66, baseLogistics: 60, baseTalent: 68, baseStability: 39 },
      { city: `West ${name} Valley`, defaultSector: 'agribusiness', basePolicy: 65, baseLogistics: 58, baseTalent: 59, baseStability: 43 },
    ];
  };

  const sectorToUse = detectedSector || 'infrastructure';
  const countryToUse = detectedCountry || 'Philippines';
  const citiesList = countryCities[countryToUse] || getDynamicCitiesForCountry(countryToUse);

  const marketSignals: MarketSignal[] = citiesList.map((item) => {
    const isPrimarySector = item.defaultSector === sectorToUse;
    const policyMod = isPrimarySector ? 5 : 0;
    const logisticsMod = sectorToUse === 'logistics' ? 6 : sectorToUse === 'manufacturing' ? 4 : 0;
    const talentMod = sectorToUse === 'digital' ? 8 : sectorToUse === 'finance' ? 5 : 0;

    return {
      city: item.city,
      country: countryToUse,
      sector: sectorToUse,
      saturationIndex: diversificationBias ? Math.max(10, item.basePolicy - 30) : item.basePolicy - 20,
      policySupportIndex: clamp(item.basePolicy + policyMod, 10, 100),
      logisticsIndex: clamp(item.baseLogistics + logisticsMod, 10, 100),
      talentIndex: clamp(item.baseTalent + talentMod, 10, 100),
      stabilityRisk: clamp(item.baseStability, 10, 100)
    };
  });

  return marketSignals;
};

const deriveEvidenceSet = (message: string, context?: unknown): EvidenceItem[] => {
  const caseStudy = extractCaseStudyObject(context);
  const uploadedDocuments = Array.isArray(caseStudy.uploadedDocuments) ? caseStudy.uploadedDocuments as unknown[] : [];
  const additionalContext = Array.isArray(caseStudy.additionalContext) ? caseStudy.additionalContext as unknown[] : [];

  const evidence: EvidenceItem[] = [];

  if (uploadedDocuments.length > 0) {
    evidence.push({
      source: 'Uploaded case documents',
      claim: `User supplied ${uploadedDocuments.length} document(s) for evidence grounding.`,
      recencyDays: 30,
      credibility: 0.82
    });
  }

  if (additionalContext.length > 0) {
    evidence.push({
      source: 'Session context notes',
      claim: `Conversation contains ${additionalContext.length} context note(s).`,
      recencyDays: 10,
      credibility: 0.68
    });
  }

  const hasExternalSignals = /world bank|imf|oecd|development bank|ministry|regulator|policy|official/i.test(message);
  if (hasExternalSignals) {
    evidence.push({
      source: 'External signal references in user message',
      claim: 'Message references institutional or policy signals.',
      recencyDays: 45,
      credibility: 0.74
    });
  }

  if (evidence.length === 0) {
    evidence.push({
      source: 'User narrative baseline',
      claim: 'No formal evidence assets detected yet; working from narrative input.',
      recencyDays: 120,
      credibility: 0.52
    });
  }

  return evidence;
};

export const buildOverlookedIntelligenceSnapshot = (message: string, context?: unknown): OverlookedIntelligenceSnapshot => {
  const evidence = deriveEvidenceSet(message, context);
  const marketSignals = deriveFallbackMarketSignals(message, context);
  const evidenceCredibility = credibilityScore(evidence);

  const perceptionProxyRisk = 62;
  const factualProxyRisk = Math.round(
    marketSignals.reduce((sum, signal) => sum + signal.stabilityRisk, 0) / Math.max(1, marketSignals.length)
  );

  return {
    evidenceCredibility,
    perceptionRealityGap: perceptionRealityGap(perceptionProxyRisk, factualProxyRisk),
    topRegionalOpportunities: rankOverlookedMarkets(marketSignals).slice(0, 5)
  };
};