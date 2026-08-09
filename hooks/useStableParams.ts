// Stable Params Hook — generates a stable string key from ReportParameters
// Use this to prevent unnecessary effect re-fires when params object reference changes
// but the actual meaningful values haven't changed.

import { useMemo } from 'react';
import type { ReportParameters } from '../types';

export function useStableParamsKey(params: ReportParameters): string {
  return useMemo(() => {
    return [
      params.organizationName,
      params.country,
      (params.industry || []).join(','),
      params.region,
      params.problemStatement?.slice(0, 100),
      (params.strategicIntent || []).join(','),
      params.dealSize,
      params.organizationType,
    ].join('|');
  }, [
    params.organizationName,
    params.country,
    params.industry,
    params.region,
    params.problemStatement,
    params.strategicIntent,
    params.dealSize,
    params.organizationType,
  ]);
}

export function useCopilotKey(params: ReportParameters): string {
  return useMemo(() => `${params.organizationName}|${params.country}`, [params.organizationName, params.country]);
}

export function useAgenticKey(params: ReportParameters): string {
  return useMemo(() => [
    params.organizationName,
    params.country,
    (params.industry || []).join(','),
    params.problemStatement?.slice(0, 50),
  ].join('|'), [
    params.organizationName,
    params.country,
    params.industry,
    params.problemStatement,
  ]);
}
