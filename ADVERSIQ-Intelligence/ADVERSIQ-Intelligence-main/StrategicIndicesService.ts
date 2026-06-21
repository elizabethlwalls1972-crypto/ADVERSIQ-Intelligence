import { ReportParameters, RegionProfile } from '../types';

/**
 * StrategicIndicesService
 * Implements Phase 2 of the Mathematical Integrity Roadmap.
 * Focuses on CRI (Country Risk Index) and TCO (Total Cost of Ownership).
 */
export const StrategicIndicesService = {
  /**
   * CRI - Country Risk Index
   * Replaces random seeding with a composite of regulatory, political, and economic signals.
   */
  calculateCRI: (params: ReportParameters, profile: RegionProfile): number => {
    const weights = {
      political: 0.35,
      regulatory: 0.30,
      economic: 0.25,
      freshness: 0.10
    };

    // Extract scores from the region profile or default to mid-range if data is missing
    const polScore = profile.politicalStability ?? 50;
    const regScore = profile.regulatoryQuality ?? 50;
    const ecoScore = profile.economicReadiness ?? 50;
    
    // Data Freshness Penalty (from your provenance tagging requirement)
    const daysSinceUpdate = (Date.now() - (profile.lastUpdated ?? Date.now())) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 100 - (daysSinceUpdate / 3.65)); // Decays over a year

    const baseCRI = (
      (polScore * weights.political) +
      (regScore * weights.regulatory) +
      (ecoScore * weights.economic) +
      (freshnessScore * weights.freshness)
    );

    // Apply Ethics Safeguard (Sanctions check)
    const sanctionsPenalty = params.ethicsSafeguardsEnabled && profile.isSanctioned ? 0.4 : 1.0;

    return Math.round(baseCRI * sanctionsPenalty);
  },

  /**
   * TCO - Total Cost of Ownership
   * Calculates the true cost of regional expansion beyond just CapEx.
   */
  calculateTCO: (params: ReportParameters): { 
    total: number; 
    breakdown: { capex: number; opex: number; compliance: number; friction: number } 
  } => {
    const investment = params.financialProfile?.investmentAmount ?? 0;
    const sectorFriction = params.marketProfile?.industryFrictionFactor ?? 0.15;

    const capex = investment * 0.7; // Equipment, facilities
    const opex = (investment * 0.2) * (params.financialProfile?.timelineMonths ?? 12 / 12);
    
    // Compliance costs scale with regulatory quality
    const compliance = investment * 0.05 * (1 + (sectorFriction * 2));
    
    // Friction costs (Permit delays, bureaucracy)
    const friction = investment * (sectorFriction * 0.5);

    const total = capex + opex + compliance + friction;

    return {
      total,
      breakdown: {
        capex: Math.round(capex),
        opex: Math.round(opex),
        compliance: Math.round(compliance),
        friction: Math.round(friction)
      }
    };
  }
};
