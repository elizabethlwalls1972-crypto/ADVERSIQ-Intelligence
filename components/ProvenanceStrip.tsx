import React, { useEffect, useState } from 'react';
import { ProvenanceEntry } from '../types';
import { GovernanceService } from '../services/GovernanceService';
import { EventBus } from '../services/EventBus';
import { Clock3, ActivitySquare } from 'lucide-react';
import { ReportViewer } from './ReportViewer';

interface ProvenanceStripProps {
  reportId?: string;
}

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const ProvenanceStrip: React.FC<ProvenanceStripProps> = ({ reportId }) => {
  const [entries, setEntries] = useState<ProvenanceEntry[]>([]);
  const [showSample, setShowSample] = useState(false);
  const SAMPLE_NSIL = `
  <analysis_report mode="Discovery">
    <executive_summary>
      <overall_score>86</overall_score>
      <key_findings>Strong regional fit;High partner synergy;Manageable regulatory risk;Attractive ROI profile</key_findings>
      <strategic_outlook>High-probability success with staged entry, partner-led execution, and targeted risk controls.</strategic_outlook>
    </executive_summary>
    <match_score value="82" confidence="High">
      <rationale>Mandate, sector, and capacity vectors align with top-quartile benchmarks in target region.</rationale>
    </match_score>
    <scenario name="Accelerated Entry" probability="45">
      <drivers>Policy tailwinds, Partner readiness, Supply chain access</drivers>
      <regional_impact>Rapid job creation with localized value chains and skills uplift.</regional_impact>
      <recommendation>Pilot with local JV; enable fast-track approvals.</recommendation>
    </scenario>
    <phase name="Pilot" duration="3m" cost="$0.5M">
      <milestones>JV signed, Site selected, Team onboarded</milestones>
      <resources>Core team, Legal counsel, Local ops lead</resources>
    </phase>
    <metadata>
      <case_id>NSIL-CASE-001</case_id>
      <generated_at>2026-01-01T00:00:00Z</generated_at>
      <version>v1.0</version>
      <confidence_level>High</confidence_level>
    </metadata>
  </analysis_report>`;

  useEffect(() => {
    if (!reportId) return;
    GovernanceService.getTimeline(reportId).then((timeline) => {
      setEntries(timeline.provenance.slice(-5));
    }).catch(() => setEntries([]));
  }, [reportId]);

  useEffect(() => {
    if (!reportId) return;
    const unsub = EventBus.subscribe('provenanceLogged', (event) => {
      if (event.reportId !== reportId) return;
      setEntries((prev) => [...prev.slice(-4), event.entry]);
    });
    return () => unsub();
  }, [reportId]);

  if (!reportId) {
    return (
      <div className="rounded-sm border border-stone-200 bg-stone-50 p-4 text-xs text-stone-700">
        <div className="flex items-center justify-between">
          <span>Preview how a live report looks with provenance.</span>
          <button
            className="bg-bw-navy text-white px-3 py-1 rounded-sm text-xs font-bold hover:bg-bw-gold hover:text-bw-navy transition-colors"
            onClick={() => setShowSample(true)}
          >
            Preview Sample Report
          </button>
        </div>
        {showSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSample(false)} />
            <div className="relative z-10 w-full max-w-4xl bg-white rounded-sm shadow-2xl border border-stone-200">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">Sample Intelligence Report</h3>
                <button onClick={() => setShowSample(false)} className="text-stone-600 hover:text-stone-900 text-xs">Close</button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <ReportViewer nsilContent={SAMPLE_NSIL} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-700 mb-2">
        <ActivitySquare size={14} className="text-bw-navy" /> Evidence Trail
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-stone-600">No provenance entries yet.</p>
      ) : (
        <ul className="text-xs text-stone-700 space-y-1">
          {entries.slice().reverse().map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <div>
                <span className="font-semibold">{e.action}</span> * {e.artifact}
                {e.tags && e.tags.length > 0 && (
                  <span className="text-stone-500"> * {e.tags.join(', ')}</span>
                )}
                <div className="text-stone-500">{e.actor}</div>
              </div>
              <div className="text-stone-500 flex items-center gap-1 whitespace-nowrap">
                <Clock3 size={12} /> {formatDate(e.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProvenanceStrip;

