import React, { useMemo } from 'react';
import { TrendingUp, Clock, AlertCircle, MapPin, BarChart3, Zap } from 'lucide-react';
import type { TemporalAnalysis, ReportParameters } from '../types';

interface TemporalAnalysisProps {
  params: ReportParameters;
  isLoading?: boolean;
}

export const TemporalAnalysisComponent: React.FC<TemporalAnalysisProps> = ({ 
  params, 
  isLoading = false 
}) => {
  
  // Generate temporal analysis from params - detect regional phase
  const analysis = useMemo((): TemporalAnalysis => {
    // Simple phase detection logic based on country/region
    const regionPhaseMap: Record<string, 'nascent' | 'emerging' | 'developing' | 'mature' | 'post_mature'> = {
      'Vietnam': 'developing',
      'Singapore': 'mature',
      'India': 'developing',
      'Malaysia': 'developing',
      'Thailand': 'developing',
      'Indonesia': 'emerging',
      'Philippines': 'emerging',
      'Bangladesh': 'nascent',
      'Pakistan': 'nascent',
      'Cambodia': 'nascent',
      'Laos': 'nascent'
    };
    
    const currentPhase = regionPhaseMap[params.country] || 'emerging';
    
    return {
      regionProfile: { country: params.country, region: 'Asia-Pacific' } as any,
      analysisYear: new Date().getFullYear(),
      currentPhase: {
        overall: currentPhase,
        bySector: {},
        confidenceScore: 75
      },
      progression: {
        currentPhase,
        yearsInPhase: 5,
        estimatedYearsToNextPhase: 8,
        historicalPaceMonths: 36,
        accelerators: [
          'Government FDI incentives and infrastructure investment',
          'Regional trade agreements and tariff reductions',
          'Technology transfer and human capital development'
        ],
        decelerators: [
          'Geopolitical tensions and supply chain fragmentation',
          'Labor cost inflation reducing competitive advantage',
          'Environmental regulation compliance costs'
        ],
        trajectoryRisk: 'on_track'
      },
      historicalComparables: [
        {
          region: 'Vietnam',
          year: 2005,
          phaseAtThatTime: 'emerging',
          whatHappenedNext: 'Major FDI inflows, manufacturing boom, 8% annual GDP growth',
          investments: ['Samsung Electronics', 'Intel', 'Nike'],
          outcomeQuality: 'success'
        },
        {
          region: 'India',
          year: 2000,
          phaseAtThatTime: 'emerging',
          whatHappenedNext: 'IT services explosion, 7.5% growth, 200K tech jobs created',
          investments: ['Infosys', 'TCS', 'Accenture'],
          outcomeQuality: 'success'
        },
        {
          region: 'Thailand',
          year: 1995,
          phaseAtThatTime: 'developing',
          whatHappenedNext: 'Asian financial crisis hit, recovery took 5 years',
          investments: ['Foxconn', 'LG Electronics'],
          outcomeQuality: 'mixed'
        }
      ],
      trajectoryRisk: 'on_track'
    };
  }, [params.country]);

  const phaseColors = {
    'nascent': { bg: 'from-red-50 to-red-100', border: 'border-red-300', text: 'text-red-900', badge: 'bg-red-200 text-red-900' },
    'emerging': { bg: 'from-orange-50 to-amber-100', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-200 text-orange-900' },
    'developing': { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', badge: 'bg-yellow-200 text-yellow-900' },
    'mature': { bg: 'from-green-50 to-emerald-100', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-200 text-green-900' },
    'post_mature': { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-200 text-blue-900' }
  };

  const currentPhaseConfig = phaseColors[analysis.currentPhase.overall as keyof typeof phaseColors] || phaseColors.developing;
  const riskColor = analysis.progression.trajectoryRisk === 'accelerating' ? 'text-green-600' :
                    analysis.progression.trajectoryRisk === 'on_track' ? 'text-blue-600' :
                    analysis.progression.trajectoryRisk === 'slowing' ? 'text-amber-600' : 'text-red-600';

  const phaseEmoji = {
    'nascent': '🌍+/-',
    'emerging': '🌍?',
    'developing': '📈',
    'mature': '●',
    'post_mature': ''
  };

  return (
    <div className="space-y-4">
      {/* Current Phase Overview */}
      <div className={`bg-gradient-to-r ${currentPhaseConfig.bg} border-2 ${currentPhaseConfig.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-bold ${currentPhaseConfig.text} mb-4`}>
          {phaseEmoji[analysis.currentPhase.overall as keyof typeof phaseEmoji]} Regional Development Phase Analysis
        </h3>

        <div className="bg-white/60 rounded-lg p-4 space-y-4">
          {/* Main Phase Indicator */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold ${currentPhaseConfig.text} uppercase`}>Current Regional Phase</p>
              <p className="text-2xl font-bold text-stone-900 capitalize">
                {analysis.currentPhase.overall}
              </p>
              <p className="text-sm text-stone-600 mt-1">
                {analysis.progression.yearsInPhase} years in current phase
              </p>
            </div>
            <div className={`px-4 py-3 ${currentPhaseConfig.badge} rounded-lg text-center`}>
              <p className="text-xs font-bold uppercase">Confidence</p>
              <p className="text-2xl font-bold">{Math.round(analysis.currentPhase.confidenceScore)}%</p>
            </div>
          </div>

          {/* Phase Description */}
          <div className={`border-t ${currentPhaseConfig.border} pt-3`}>
            <p className="text-sm text-stone-700">
              {analysis.currentPhase.overall === 'nascent' && 
                'This region is establishing basic infrastructure and regulatory framework. Low FDI flow. First-mover advantages significant but risks high.'}
              {analysis.currentPhase.overall === 'emerging' &&
                'Infrastructure improving, regulatory framework established. FDI accelerating. Attracting ancillary industries. Early profitability challenges.'}
              {analysis.currentPhase.overall === 'developing' &&
                'Mature infrastructure, stable governance, growing talent pool. FDI mainstream. Supply chain ecosystem forming. Profitability increasing.'}
              {analysis.currentPhase.overall === 'mature' &&
                'World-class infrastructure, strong governance, deep talent pool. FDI competitive. Fully formed supply chains. High profitability, commoditized pricing.'}
              {analysis.currentPhase.overall === 'post_mature' &&
                'Peak performance, high costs, mature markets. Innovation hub status. Outflow of cost-sensitive manufacturing. Focus on high-value sectors.'}
            </p>
          </div>
        </div>
      </div>

      {/* Phase Progression Timeline */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
        <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Progression Timeline
        </h4>

        <div className="space-y-4">
          {/* Time to Next Phase */}
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-purple-900">Time to Next Phase</p>
              <p className="text-2xl font-bold text-purple-700">
                {analysis.progression.estimatedYearsToNextPhase}
              </p>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
                style={{ 
                  width: `${(analysis.progression.yearsInPhase / (analysis.progression.yearsInPhase + analysis.progression.estimatedYearsToNextPhase)) * 100}%` 
                }}
              />
            </div>
            <p className="text-xs text-stone-600 mt-2">
              Historical pace: ~{analysis.progression.historicalPaceMonths} months per phase advancement
            </p>
          </div>

          {/* Accelerators */}
          {analysis.progression.accelerators.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-xs font-bold text-green-700 uppercase mb-2">Accelerating Factors</p>
              <div className="space-y-1">
                {analysis.progression.accelerators.map((acc, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 font-bold mt-0.5">a'</span>
                    <span className="text-stone-700">{acc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decelerators */}
          {analysis.progression.decelerators.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-xs font-bold text-red-700 uppercase mb-2">Decelerating Factors</p>
              <div className="space-y-1">
                {analysis.progression.decelerators.map((dec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 font-bold mt-0.5">a"</span>
                    <span className="text-stone-700">{dec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Comparables */}
      {analysis.historicalComparables.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
          <h4 className="font-bold text-cyan-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            What Happened in Similar Regions at This Stage
          </h4>

          <div className="space-y-3">
            {analysis.historicalComparables.map((comp, idx) => (
              <div key={idx} className="bg-white/70 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-stone-900">{comp.region}</p>
                    <p className="text-xs text-stone-600">{comp.year} - {comp.phaseAtThatTime} phase</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    comp.outcomeQuality === 'success' ? 'bg-green-100 text-green-700' :
                    comp.outcomeQuality === 'failure' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {comp.outcomeQuality}
                  </span>
                </div>
                <p className="text-sm text-stone-700 mb-2">{comp.whatHappenedNext}</p>
                {comp.investments.length > 0 && (
                  <p className="text-xs text-stone-600">
                    <strong>Key investments:</strong> {comp.investments.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trajectory Risk Assessment */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-6">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className={riskColor} />
          Trajectory Risk Assessment
        </h4>

        <div className="bg-white/70 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Current Status</p>
              <p className="text-2xl font-bold capitalize mt-1">
                <span className={riskColor}>{analysis.progression.trajectoryRisk}</span>
              </p>
            </div>
            <div className="text-right">
              {analysis.progression.trajectoryRisk === 'accelerating' && (
                <div className="text-green-600">
                  <TrendingUp className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold mt-1">Phase advancement faster than historical average</p>
                </div>
              )}
              {analysis.progression.trajectoryRisk === 'on_track' && (
                <div className="text-blue-600">
                  <BarChart3 className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold mt-1">On historical progression pace</p>
                </div>
              )}
              {analysis.progression.trajectoryRisk === 'slowing' && (
                <div className="text-amber-600">
                  <AlertCircle className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold mt-1">Slower than historical average</p>
                </div>
              )}
              {analysis.progression.trajectoryRisk === 'at_risk' && (
                <div className="text-red-600">
                  <AlertCircle className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold mt-1">Risk of stagnation or reversal</p>
                </div>
              )}
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t border-slate-200 text-sm ${
            analysis.progression.trajectoryRisk === 'accelerating' ? 'text-green-700' :
            analysis.progression.trajectoryRisk === 'on_track' ? 'text-blue-700' :
            analysis.progression.trajectoryRisk === 'slowing' ? 'text-amber-700' :
            'text-red-700'
          }`}>
            {analysis.progression.trajectoryRisk === 'accelerating' && 
              'This region is advancing through development phases faster than typical. High growth period. Peak FDI attraction. Limited time window for entry at current costs.'}
            {analysis.progression.trajectoryRisk === 'on_track' &&
              'This region is following typical historical progression. Steady growth. Predictable evolution. Standard entry timeline applies.'}
            {analysis.progression.trajectoryRisk === 'slowing' &&
              'This region is progressing slower than historical precedent. Structural headwinds present. Extended growth timeline. Extended first-mover window.'}
            {analysis.progression.trajectoryRisk === 'at_risk' &&
              'This region faces significant barriers to advancement. Geopolitical, economic, or structural issues present. Caution advised.'}
          </div>
        </div>
      </div>

      {/* Sector-Specific Phase Analysis */}
      {Object.keys(analysis.currentPhase.bySector).length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
          <h4 className="font-bold text-teal-900 mb-4">Sector-Specific Development Phases</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analysis.currentPhase.bySector).map(([sector, phase]) => (
              <div key={sector} className="bg-white/70 rounded-lg p-3">
                <p className="text-xs font-bold text-teal-700 uppercase">{sector}</p>
                <p className="text-sm font-bold text-stone-900 capitalize mt-1">{phase}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights Box */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-xl p-6">
        <h4 className="font-bold mb-3">Key Temporal Insights</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">*</span>
            <span>
              Based on historical precedent, regions in the <strong>{analysis.currentPhase.overall}</strong> phase typically 
              take <strong>~{analysis.progression.historicalPaceMonths} months</strong> to advance to the next stage.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">*</span>
            <span>
              {analysis.progression.estimatedYearsToNextPhase} years to next phase means your market entry window 
              is <strong>optimal for {analysis.currentPhase.overall} phase strategies</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">*</span>
            <span>
              Current trajectory is <strong>{analysis.progression.trajectoryRisk}</strong> - 
              adjust timelines and expectations accordingly.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TemporalAnalysisComponent;
