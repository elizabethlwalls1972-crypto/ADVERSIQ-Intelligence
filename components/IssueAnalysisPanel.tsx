import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, TrendingUp, Users, FileText } from 'lucide-react';
import { type IssueAnalysis } from '../services/GlobalIssueResolver';

interface IssueAnalysisPanelProps {
  analysis: IssueAnalysis;
}

export const IssueAnalysisPanel: React.FC<IssueAnalysisPanelProps> = ({ analysis }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    causes: true,
    recommendations: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
      {/* NSIL Layers Visualization */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('nsil')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            <span className="font-semibold text-white">NSIL 7-Layer Analysis</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.nsil ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.nsil && (
          <div className="mt-3 space-y-2">
            {analysis.nsisLayers.map((layer) => (
              <div key={layer.layer} className="bg-slate-700/50 rounded p-3 text-sm">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-semibold text-white">Layer {layer.layer}: {layer.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{layer.analysis}</p>
                  </div>
                  <div className="ml-2 bg-blue-500/20 px-2 py-1 rounded text-xs text-blue-300">
                    {(layer.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Root Causes */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('causes')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-400" />
            <span className="font-semibold text-white">Root Causes & Contributing Factors</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.causes ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.causes && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Root Causes</p>
              <ul className="space-y-1">
                {analysis.rootCauses.map((cause, i) => (
                  <li key={i} className="text-sm text-slate-200 flex gap-2">
                    <span className="text-blue-400 font-semibold">{i + 1}.</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Contributing Factors</p>
              <ul className="space-y-1">
                {analysis.contributingFactors.map((factor, i) => (
                  <li key={i} className="text-sm text-slate-200 flex gap-2">
                    <span className="text-indigo-400">*</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Strategic Recommendations */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('recommendations')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="font-semibold text-white">Strategic Recommendations</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.recommendations ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.recommendations && (
          <div className="mt-3 space-y-2">
            {analysis.strategicRecommendations.map((rec, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/20 rounded p-3 text-sm">
                <p className="font-semibold text-green-300">Recommendation {i + 1}</p>
                <p className="text-green-100 text-xs mt-1">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Implementation Roadmap */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('roadmap')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" />
            <span className="font-semibold text-white">Implementation Roadmap</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.roadmap ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.roadmap && (
          <div className="mt-3 space-y-3">
            {analysis.implementationRoadmap.map((phase, i) => (
              <div key={i} className="bg-slate-700/50 rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{phase.phase}</p>
                    <p className="text-xs text-slate-400">{phase.duration}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1">Key Actions:</p>
                  <ul className="text-xs text-slate-300 space-y-1 ml-2">
                    {phase.keyActions.map((action, j) => (
                      <li key={j}>* {action}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-300 mb-1">Milestones:</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.milestones.map((milestone, j) => (
                      <span key={j} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {milestone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Mitigation */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('risks')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="font-semibold text-white">Risk Mitigation</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.risks ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.risks && (
          <div className="mt-3 space-y-2">
            {analysis.riskMitigation.map((risk, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-red-300">{risk.risk}</p>
                  <div className="flex gap-1">
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">{risk.probability}</span>
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">{risk.impact}</span>
                  </div>
                </div>
                <p className="text-red-100 text-xs">Mitigation: {risk.mitigation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Metrics */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('metrics')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            <span className="font-semibold text-white">Success Metrics</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.metrics ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.metrics && (
          <div className="mt-3 space-y-2">
            {analysis.successMetrics.map((metric, i) => (
              <div key={i} className="bg-cyan-500/10 border border-cyan-500/20 rounded p-3 text-sm">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-cyan-300">{metric.metric}</p>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs">{metric.target}</span>
                </div>
                <p className="text-cyan-100 text-xs">Timeframe: {metric.timeframe}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stakeholder Analysis */}
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={() => toggleSection('stakeholders')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            <span className="font-semibold text-white">Stakeholder Analysis</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.stakeholders ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.stakeholders && (
          <div className="mt-3 space-y-2">
            {analysis.stakeholderAnalysis.map((stakeholder, i) => (
              <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 rounded p-3 text-sm">
                <p className="font-semibold text-indigo-300">{stakeholder.stakeholder}</p>
                <div className="mt-1 space-y-1 text-xs text-indigo-100">
                  <p>Interest: {stakeholder.interest}</p>
                  <p>Leverage: {stakeholder.leverage}</p>
                  <p>Strategy: {stakeholder.strategy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Recommendations */}
      <div className="p-4">
        <button
          onClick={() => toggleSection('documents')}
          className="flex items-center justify-between w-full hover:bg-slate-700/50 px-3 py-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-amber-400" />
            <span className="font-semibold text-white">Recommended Documents</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.documents && (
          <div className="mt-3 space-y-1">
            {analysis.documentRecommendations.map((doc, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-sm text-amber-100 flex items-center gap-2">
                <FileText size={14} className="text-amber-400" />
                {doc}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Confidence Footer */}
      <div className="px-4 py-3 bg-slate-700/50 border-t border-slate-700 flex items-center justify-between text-sm">
        <span className="text-slate-300">Analysis Confidence</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all"
              style={{ width: `${analysis.overallConfidence * 100}%` }}
            />
          </div>
          <span className="text-blue-300 font-semibold text-xs">{(analysis.overallConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
