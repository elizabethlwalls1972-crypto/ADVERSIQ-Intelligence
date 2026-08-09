import React, { useMemo } from 'react';
import { 
    ShieldCheck, TrendingUp, AlertTriangle, Globe, Target, Users, MapPin, 
    CheckCircle, Cpu, BarChart3, FileText 
} from 'lucide-react';

interface ReportViewerProps {
  nsilContent: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ nsilContent }) => {
  const parsed = useMemo(() => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(nsilContent, "text/xml");

    const getText = (tag: string, parent: Element | Document = xmlDoc) =>
      parent.querySelector(tag)?.textContent || '';

    const getList = (tag: string, parent: Element | Document = xmlDoc) =>
      (parent.querySelector(tag)?.textContent || '').split(',').map(s => s.trim()).filter(Boolean);

    const getAttribute = (tag: string, attr: string, parent: Element | Document = xmlDoc) =>
      parent.querySelector(tag)?.getAttribute(attr) || '';

    const executiveSummary = xmlDoc.querySelector('executive_summary');
    const matchScore = xmlDoc.querySelector('match_score');
    const implementationRoadmap = xmlDoc.querySelector('implementation_roadmap');
    const metadata = xmlDoc.querySelector('metadata');

    return {
      // Executive Summary
      score: executiveSummary ? getText('overall_score', executiveSummary) : null,
      findings: executiveSummary ? getText('key_findings', executiveSummary).split(';') : [],
      outlook: executiveSummary ? getText('strategic_outlook', executiveSummary) : null,

      // Match Analysis
      matchVal: matchScore ? matchScore.getAttribute('value') : null,
      matchConf: matchScore ? matchScore.getAttribute('confidence') : null,
      matchRationale: matchScore ? getText('rationale', matchScore) : null,

      // Future Scenarios
      scenarios: Array.from(xmlDoc.querySelectorAll('scenario')).map(s => ({
        name: s.getAttribute('name'),
        prob: s.getAttribute('probability'),
        drivers: getList('drivers', s),
        impact: getText('regional_impact', s),
        rec: getText('recommendation', s)
      })),

      // Implementation Roadmap
      phases: Array.from(xmlDoc.querySelectorAll('phase')).map(p => ({
        name: p.getAttribute('name'),
        duration: p.getAttribute('duration'),
        cost: p.getAttribute('cost'),
        milestones: getList('milestones', p),
        resources: getList('resources', p)
      })),

      // Metadata
      caseId: metadata ? getText('case_id', metadata) : null,
      generatedAt: metadata ? getText('generated_at', metadata) : null,
      version: metadata ? getText('version', metadata) : null,
      confidenceLevel: metadata ? getText('confidence_level', metadata) : null,

      // Report mode
      mode: xmlDoc.querySelector('analysis_report')?.getAttribute('mode')
    };
  }, [nsilContent]);

  if (!parsed.score && !parsed.matchVal) {
    return (
        <div className="p-6 text-stone-500 italic bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs uppercase">Parser Status</span>
            </div>
            Waiting for valid NSIL data stream...
        </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-stone-900 animate-in fade-in duration-500">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 rounded-xl shadow-lg border border-stone-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2 font-serif text-white">NSIL Intelligence Report</h2>
            <div className="flex items-center gap-4 text-sm text-stone-300 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Mode: {parsed.mode || 'Discovery'}
              </span>
              {parsed.caseId && (
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Case: {parsed.caseId}
                </span>
              )}
            </div>
          </div>
          {parsed.confidenceLevel && (
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                parsed.confidenceLevel === 'High' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                parsed.confidenceLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {parsed.confidenceLevel} Confidence
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary Card */}
      {parsed.score && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Executive Summary
              </h3>
              <p className="text-sm text-stone-500 mt-1">Strategic Intelligence Overview</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-stone-900">{parsed.score}</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Overall Score</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <p className="text-sm text-blue-900 leading-relaxed font-medium">"{parsed.outlook}"</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase mb-3 tracking-wider">Key Strategic Findings</h4>
            <ul className="space-y-3">
              {parsed.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm bg-stone-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-stone-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Match Analysis */}
      {parsed.matchVal && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> Strategic Alignment
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              parsed.matchConf === 'High' ? 'bg-green-100 text-green-800' :
              parsed.matchConf === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {parsed.matchConf} Confidence
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-6xl font-black text-purple-700">{parsed.matchVal}%</div>
              <div className="text-xs font-bold text-purple-900 uppercase mt-2 tracking-widest">Synergy Score</div>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-stone-900 text-sm mb-2 uppercase tracking-wide">Alignment Rationale</h4>
              <p className="text-sm text-stone-600 leading-relaxed">{parsed.matchRationale}</p>
            </div>
          </div>
        </div>
      )}

      {/* Future Scenarios */}
      {parsed.scenarios.length > 0 && (
        <div className="bg-stone-900 text-white p-6 rounded-xl shadow-lg border border-stone-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" /> Predictive Scenario Analysis
          </h3>
          <div className="space-y-4">
            {parsed.scenarios.map((s, i) => (
              <div key={i} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-orange-400 text-lg">{s.name}</h4>
                  <span className="text-xs font-mono bg-black/50 px-3 py-1 rounded-full border border-white/10">{s.prob}% Probability</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Regional Impact</h5>
                    <p className="text-sm text-stone-300 leading-relaxed">{s.impact}</p>
                  </div>

                  <div className="flex items-start gap-3 text-sm bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                    <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-orange-300 uppercase block mb-1">Strategic Recommendation</span>
                      <p className="text-orange-100">{s.rec}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Roadmap */}
      {parsed.phases.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" /> Implementation Roadmap
          </h3>

          <div className="space-y-4">
            {parsed.phases.map((phase, i) => (
              <div key={i} className="border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold uppercase tracking-wide">
                        Phase {i + 1}
                        </span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-lg">{phase.name}</h4>
                  </div>
                  <div className="text-right text-xs font-mono text-stone-500 space-y-1">
                    <div className="flex items-center justify-end gap-1">
                        <span className="text-stone-400">Duration:</span> {phase.duration}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                        <span className="text-stone-400">Est. Cost:</span> {phase.cost}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Milestones</h5>
                    <ul className="space-y-1">
                      {phase.milestones.map((milestone, j) => (
                        <li key={j} className="text-sm text-stone-700 flex items-start gap-2">
                          <span className="text-green-500 font-bold">*</span>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Required Resources</h5>
                    <div className="flex flex-wrap gap-2">
                      {phase.resources.map((resource, j) => (
                        <span key={j} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded border border-stone-200">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

