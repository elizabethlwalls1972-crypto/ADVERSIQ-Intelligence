import { useMemo, useState, useCallback } from 'react';
import { ReportParameters } from '../types';
import { AdvisorSnapshot } from '../services/ComprehensiveSystemModel';
import { buildAdvisorSnapshot } from '../services/GlobalIntelligenceEngine';
import { buildAdvisorInputFromParams } from '../services/buildAdvisorInputModel';

interface UseAdvisorSnapshotResult {
  snapshot: AdvisorSnapshot;
  refresh: () => void;
}

const useAdvisorSnapshot = (params: ReportParameters): UseAdvisorSnapshotResult => {
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((idx) => idx + 1);
  }, []);

  const snapshot = useMemo(() => {
    const advisorInput = buildAdvisorInputFromParams(params);
    return buildAdvisorSnapshot(advisorInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, refreshIndex]);

  return { snapshot, refresh };
};

export default useAdvisorSnapshot;

