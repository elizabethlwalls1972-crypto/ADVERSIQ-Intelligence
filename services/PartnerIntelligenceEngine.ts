export interface PartnerCandidate {
  id: string;
  name: string;
  type: 'government' | 'bank' | 'corporate' | 'multilateral' | 'community';
  countries: string[];
  sectors: string[];
  baseScores?: Partial<Record<'pvi' | 'cis' | 'ccs' | 'rfi' | 'sra' | 'frs', number>>;
}

export interface PartnerScoreBreakdown {
  partnerFit: number;
  deliveryReliability: number;
  policyAlignment: number;
  localLegitimacy: number;
  pvi: number;
  cis: number;
  ccs: number;
  rfi: number;
  sra: number;
  frs: number;
  total: number;
}

export interface RankedPartner {
  partner: PartnerCandidate;
  score: PartnerScoreBreakdown;
  reasons: string[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export class PartnerIntelligenceEngine {
  static rankPartners(input: {
    country: string;
    sector: string;
    objective: string;
    constraints: string;
    candidates: PartnerCandidate[];
  }): RankedPartner[] {
    const normalizedCountry = input.country.trim().toLowerCase();
    const normalizedSector = input.sector.trim().toLowerCase();

    return input.candidates
      .map((candidate) => {
        const hasCountry = candidate.countries.some((country) => country.toLowerCase() === normalizedCountry);
        const hasSector = candidate.sectors.some((sector) => sector.toLowerCase().includes(normalizedSector) || normalizedSector.includes(sector.toLowerCase()));

        const base = {
          pvi: candidate.baseScores?.pvi ?? (hasSector ? 76 : 61),
          cis: candidate.baseScores?.cis ?? (candidate.type === 'government' || candidate.type === 'multilateral' ? 80 : 68),
          ccs: candidate.baseScores?.ccs ?? (hasCountry ? 79 : 63),
          rfi: candidate.baseScores?.rfi ?? (hasCountry ? 34 : 46),
          sra: candidate.baseScores?.sra ?? (candidate.type === 'corporate' ? 62 : 55),
          frs: candidate.baseScores?.frs ?? (candidate.type === 'bank' || candidate.type === 'multilateral' ? 82 : 66)
        };

        const partnerFit = clamp((base.pvi * 0.55) + ((hasSector ? 85 : 58) * 0.45), 0, 100);
        const deliveryReliability = clamp((base.frs * 0.5) + ((100 - base.sra) * 0.5), 0, 100);
        const policyAlignment = clamp((base.ccs * 0.6) + ((100 - base.rfi) * 0.4), 0, 100);
        const localLegitimacy = clamp((base.cis * 0.65) + ((hasCountry ? 84 : 56) * 0.35), 0, 100);

        const total = clamp(
          (partnerFit * 0.28) +
          (deliveryReliability * 0.24) +
          (policyAlignment * 0.24) +
          (localLegitimacy * 0.24),
          0,
          100
        );

        const reasons: string[] = [];
        if (hasCountry) reasons.push('Country operating match');
        if (hasSector) reasons.push('Sector capability match');
        if (policyAlignment >= 75) reasons.push('Strong policy alignment');
        if (deliveryReliability >= 75) reasons.push('Reliable delivery/finance profile');

        return {
          partner: candidate,
          score: {
            partnerFit: Math.round(partnerFit),
            deliveryReliability: Math.round(deliveryReliability),
            policyAlignment: Math.round(policyAlignment),
            localLegitimacy: Math.round(localLegitimacy),
            pvi: Math.round(base.pvi),
            cis: Math.round(base.cis),
            ccs: Math.round(base.ccs),
            rfi: Math.round(base.rfi),
            sra: Math.round(base.sra),
            frs: Math.round(base.frs),
            total: Math.round(total)
          },
          reasons
        };
      })
      .sort((a, b) => b.score.total - a.score.total);
  }
}
