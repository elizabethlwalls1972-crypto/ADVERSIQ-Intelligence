import { ReportParameters } from '../types';

export interface ConsultantGateResult {
  isReady: boolean;
  missing: string[];
  summary: {
    who: string;
    where: string;
    objective: string;
    audience: string;
    deadline: string;
  };
}

const clean = (value?: string | null) => (value || '').trim();

export const ConsultantGateService = {
  evaluate(params: ReportParameters): ConsultantGateResult {
    const who = clean(params.userName) || clean(params.organizationName);
    const where = clean(params.country) || clean(params.userCountry) || clean(params.region);
    const objective = clean(params.problemStatement) || params.strategicObjectives?.filter(Boolean).join(', ') || params.strategicIntent?.filter(Boolean).join(', ') || '';
    const audience = params.targetCounterpartType?.filter(Boolean).join(', ') || params.stakeholderPerspectives?.filter(Boolean).join(', ') || clean(params.userDepartment);
    const deadline = clean(params.expansionTimeline) || clean(params.analysisTimeframe);

    const missing: string[] = [];

    if (!who) missing.push('Who: decision owner or organization identity');
    if (!where) missing.push('Where: country or region context');
    if (!objective || objective.length < 20) missing.push('What: clear objective/problem statement');
    if (!audience) missing.push('For whom: decision audience or counterpart');
    if (!deadline) missing.push('When: timeline/deadline');

    return {
      isReady: missing.length === 0,
      missing,
      summary: {
        who: who || 'missing',
        where: where || 'missing',
        objective: objective || 'missing',
        audience: audience || 'missing',
        deadline: deadline || 'missing'
      }
    };
  }
};
