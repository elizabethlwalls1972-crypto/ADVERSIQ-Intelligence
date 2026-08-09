import { RefinedIntake, SPIInput, IVASInput, SCFInput } from '../types';

export function mapToSPI(intake: RefinedIntake): SPIInput {
  return {
    riskTolerance: intake.constraints?.riskTolerance ?? 'medium',
    partnerCount: intake.counterparties?.length ?? 0,
    hasGovernmentLiaison: Boolean(intake.contacts?.governmentLiaison?.email || intake.contacts?.governmentLiaison?.phone),
  };
}

export function mapToIVAS(intake: RefinedIntake): IVASInput {
  // Simple seeds based on available identity/mission richness
  const identityRichness = [
    intake.identity.legalStructure,
    intake.identity.registrationCountry,
    intake.identity.industryClassification,
    intake.identity.yearsOperating,
  ].filter(Boolean).length;
  const missionRichness = (intake.mission.objectives?.length ?? 0) + (intake.mission.strategicIntent?.length ?? 0);
  return {
    activationFrictionSeed: Math.max(1, 10 - identityRichness),
    opportunityQuantumSeed: Math.max(1, 5 + missionRichness),
  };
}

export function mapToSCF(intake: RefinedIntake): SCFInput {
  const budget = intake.constraints?.budgetUSD ?? 0;
  return {
    baseDealValueUSD: budget > 0 ? budget : 50_000_000,
  };
}

export type DocReadiness = 'ready' | 'missing-fields' | 'unknown';

export function evaluateDocReadiness(intake: RefinedIntake): Record<string, DocReadiness> {
  const hasPartner = (intake.counterparties?.length ?? 0) > 0;
  const hasMarket = Boolean(intake.identity.registrationCountry);
  const hasBudget = typeof intake.constraints?.budgetUSD === 'number' && (intake.constraints?.budgetUSD ?? 0) > 0;

  return {
    'executive-summary': hasMarket ? 'ready' : 'missing-fields',
    'loi': hasPartner && hasMarket && hasBudget ? 'ready' : 'missing-fields',
    'risk-assessment': hasMarket && hasPartner ? 'ready' : 'missing-fields',
    'financial-model': hasBudget ? 'ready' : 'missing-fields',
    'entry-advisory': hasMarket ? 'ready' : 'missing-fields',
    'cultural-brief': hasMarket ? 'ready' : 'missing-fields',
    'blind-spot-audit': hasMarket ? 'ready' : 'missing-fields',
  };
}

