import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Users, Target } from 'lucide-react';
import type { ReportParameters } from '../types';
import { PrecedentMatchingEngine } from '../services/historicalDataEngine';

interface HistoricalContextProps {
  params: ReportParameters;
  isLoading?: boolean;
}

export const HistoricalContextComponent: React.FC<HistoricalContextProps> = ({ 
  params, 
  isLoading = false 
}) => {
  
  // Generate precedent matches from params
  const precedentMatches = useMemo(() => {
    // Keep threshold broad enough to surface early precedent matches from sparse intake.
    return PrecedentMatchingEngine.findMatches(params, 0.3);
  }, [params]);

  const bestMatch = precedentMatches[0];

  if (!bestMatch) {
    return (
      <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-dashed border-stone-300 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-stone-400 mx-auto mb-3" />
        <p className="text-stone-600 font-semibold">No Historical Precedents Found</p>
        <p className="text-xs text-stone-500 mt-1">Unable to find similar historical cases in the Nexus Archive.</p>
        <p className="text-xs text-stone-400 mt-4">Try broadening your region or sector selection.</p>
      </div>
    );
  }

  const similarityScore = bestMatch.similarity.overall;
  const confidenceColor = bestMatch.confidenceLevel === 'high' ? 'green' :
                          bestMatch.confidenceLevel === 'medium' ? 'amber' : 'red';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header - Most Similar Case */}
      <div className={`bg-gradient-to-r from-${confidenceColor === 'green' ? 'emerald' : confidenceColor === 'amber' ? 'amber' : 'red'}-50 to-white border-2 border-${confidenceColor === 'green' ? 'emerald' : confidenceColor === 'amber' ? 'amber' : 'red'}-100 rounded-xl p-6 shadow-sm`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
              <span className="text-xl">📚</span> Historical Precedent Identified
            </h3>
            <p className="text-sm text-stone-600">
              Closest structural match: <span className="font-semibold text-stone-900">{bestMatch.historicalCase.title}</span>
            </p>
          </div>
          <div className={`px-4 py-2 bg-white border border-${confidenceColor === 'green' ? 'emerald' : confidenceColor === 'amber' ? 'amber' : 'red'}-200 text-${confidenceColor === 'green' ? 'emerald' : confidenceColor === 'amber' ? 'amber' : 'red'}-800 rounded-lg font-bold text-sm shadow-sm`}>
            {Math.round(similarityScore)}% Similarity
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-4 border border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Entity & Sector</p>
                <p className="text-sm font-bold text-stone-900">
                    {bestMatch.historicalCase.entity} * {bestMatch.historicalCase.sector}
                </p>
                <p className="text-xs text-stone-500">
                    {bestMatch.historicalCase.country}, {bestMatch.historicalCase.year}
                </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Strategy Executed</p>
                <p className="text-sm text-stone-700 font-medium">{bestMatch.historicalCase.strategy}</p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
            <div className="text-center p-2 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Investment</span>
              </div>
              <p className="text-sm font-bold text-stone-900">
                ${bestMatch.historicalCase.investmentSizeMillionUSD}M
              </p>
            </div>
            <div className="text-center p-2 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700 uppercase">Jobs</span>
              </div>
              <p className="text-sm font-bold text-stone-900">
                {(bestMatch.historicalCase.outcomes.jobsCreated || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-2 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 uppercase">Actual ROI</span>
              </div>
              <p className="text-sm font-bold text-stone-900">
                {bestMatch.historicalCase.outcomes.roiAchieved?.toFixed(1)}x
              </p>
            </div>
          </div>
        </div>

        {/* Outcome Badge */}
        <div className="mt-4 flex items-center gap-2">
          {bestMatch.historicalCase.outcomes.result === 'success' ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">
              <CheckCircle className="w-3 h-3" />
              <span>Historic Result: Success</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              <span>Historic Result: {bestMatch.historicalCase.outcomes.result.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Success Factors / Warnings */}
        <div className="space-y-4">
            {bestMatch.applicableFactors.successFactors.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4" />
                    Replicable Success Factors
                </h4>
                <ul className="space-y-2">
                    {bestMatch.applicableFactors.successFactors.slice(0, 4).map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-emerald-800 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{factor}</span>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            {bestMatch.applicableFactors.warnings.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Warnings & Lessons
                </h4>
                <ul className="space-y-2">
                    {bestMatch.applicableFactors.warnings.slice(0, 4).map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-red-800 leading-relaxed">
                        <span className="text-red-500 font-bold mt-0.5">as </span>
                        <span>{warning}</span>
                    </li>
                    ))}
                </ul>
                </div>
            )}
        </div>

        {/* Timeline & Probability */}
        <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Probability Assessment
                </h4>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-500">Success Probability (Historical Baseline)</span>
                        <span className="text-lg font-bold text-stone-900">{Math.round(bestMatch.probabilityOfSuccess)}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-1000"
                            style={{ width: `${bestMatch.probabilityOfSuccess}%` }}
                        />
                        </div>
                    </div>

                    <div className="text-[10px] text-stone-500 leading-relaxed border-t border-stone-100 pt-3">
                        <p>
                        This probability is derived from {bestMatch.historicalCase.outcomes.result === 'success' ? 'a successful' : 'a challenging'} historical case with {Math.round(bestMatch.similarity.overall)}% similarity to your current vector.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Clock className="w-4 h-4" />
                    Execution Timeline
                </h4>
                <div className="space-y-2 text-xs text-blue-800">
                    {bestMatch.applicableFactors.timingConsiderations.map((consideration, idx) => (
                    <p key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">*</span>
                        {consideration}
                    </p>
                    ))}
                    {bestMatch.timeToMaturity && (
                    <p className="flex items-start gap-2 mt-3 pt-3 border-t border-blue-200 font-semibold">
                        <span className="text-blue-600"></span>
                        <span>
                        Expected maturity: {Math.floor(bestMatch.timeToMaturity)} - {Math.floor(bestMatch.timeToMaturity + 1.5)} years
                        </span>
                    </p>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Alternative Matches */}
      {precedentMatches.length > 1 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
          <h4 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider text-stone-500">Other Relevant Precedents</h4>
          <div className="space-y-2">
            {precedentMatches.slice(1, 4).map((match, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer">
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-900">{match.historicalCase.title}</p>
                  <p className="text-[10px] text-stone-500">
                    {match.historicalCase.country}, {match.historicalCase.year} * {match.historicalCase.outcomes.result.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Match</p>
                  <p className="text-xs font-bold text-stone-700">{Math.round(match.similarity.overall)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalContextComponent;
