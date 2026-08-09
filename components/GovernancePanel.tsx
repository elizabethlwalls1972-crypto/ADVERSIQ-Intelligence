import React, { useEffect, useMemo, useState } from 'react';
import { 
  ApprovalRecord, 
  MandateRecord, 
  ProvenanceEntry,
  ApprovalStage,
  ApprovalDecision,
  ApproverRole
} from '../types';
import { GovernanceService } from '../services/GovernanceService';
import { EventBus } from '../services/EventBus';
import { ShieldCheck, FileCheck2, Clock3 } from 'lucide-react';

interface GovernancePanelProps {
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

const GovernancePanel: React.FC<GovernancePanelProps> = ({ reportId }) => {
  const [mandate, setMandate] = useState<MandateRecord | undefined>();
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [provenance, setProvenance] = useState<ProvenanceEntry[]>([]);
  const [actor, setActor] = useState('');
  const [role, setRole] = useState<ApproverRole>('executive');
  const [stage, setStage] = useState<ApprovalStage>('review');
  const [decision, setDecision] = useState<ApprovalDecision>('approve');
  const [notes, setNotes] = useState('');

  // Load persisted timeline on mount or when report changes
  useEffect(() => {
    if (!reportId) return;
    GovernanceService.getTimeline(reportId).then((data) => {
      setApprovals(data.approvals);
      setProvenance(data.provenance);
      setMandate(data.mandate);
    }).catch(() => {
      setApprovals([]);
      setProvenance([]);
    });
  }, [reportId]);

  // Live updates from EventBus
  useEffect(() => {
    if (!reportId) return;
    const unsubApproval = EventBus.subscribe('approvalUpdated', (event) => {
      if (event.reportId !== reportId) return;
      setApprovals((prev) => [...prev, event.approval]);
      if (event.mandate) setMandate(event.mandate);
    });
    const unsubProv = EventBus.subscribe('provenanceLogged', (event) => {
      if (event.reportId !== reportId) return;
      setProvenance((prev) => [...prev, event.entry]);
      if (event.mandate) setMandate(event.mandate);
    });
    return () => {
      unsubApproval();
      unsubProv();
    };
  }, [reportId]);

  const stageLabel = useMemo(() => mandate?.stage || 'draft', [mandate]);
  const stageColor = useMemo(() => {
    switch (stageLabel) {
      case 'signed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  }, [stageLabel]);

  const recordApproval = async () => {
    if (!reportId || !actor) return;
    const approval = await GovernanceService.recordApproval({
      reportId,
      stage,
      decision,
      actor,
      role,
      notes: notes || undefined
    });
    setApprovals((prev) => [...prev, approval]);
    setNotes('');
  };

  const recordProvenance = async () => {
    if (!reportId || !actor) return;
    const entry = await GovernanceService.recordProvenance({
      reportId,
      artifact: 'manual-entry',
      action: 'note',
      actor,
      tags: ['manual'],
      source: 'governance-panel'
    });
    setProvenance((prev) => [...prev, entry]);
  };

  if (!reportId) return null;

  return (
    <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-700">
            <ShieldCheck size={14} className="text-bw-navy" /> Governance &amp; Provenance
          </div>
          <p className="text-stone-600 text-sm">Stage and audit trail for live documents.</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-sm border ${stageColor}`}>
          Stage: {stageLabel}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-stone-200 rounded-sm p-4 bg-stone-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-2">
            <FileCheck2 size={14} /> Approvals
          </div>
          <div className="grid md:grid-cols-2 gap-2 mb-3 text-xs">
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Your name"
              className="border border-stone-200 rounded-sm px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <select value={role} onChange={(e) => setRole(e.target.value as ApproverRole)} className="border border-stone-200 rounded-sm px-2 py-1 text-sm flex-1">
                <option value="executive">Executive</option>
                <option value="legal">Legal</option>
                <option value="compliance">Compliance</option>
                <option value="consultant">Consultant</option>
                <option value="operator">Operator</option>
              </select>
              <select value={stage} onChange={(e) => setStage(e.target.value as ApprovalStage)} className="border border-stone-200 rounded-sm px-2 py-1 text-sm">
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="signed">Signed</option>
              </select>
              <select value={decision} onChange={(e) => setDecision(e.target.value as ApprovalDecision)} className="border border-stone-200 rounded-sm px-2 py-1 text-sm">
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="revise">Revise</option>
              </select>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="border border-stone-200 rounded-sm px-2 py-1 text-sm md:col-span-2"
              rows={2}
            />
            <div className="flex gap-2 md:col-span-2">
              <button
                onClick={recordApproval}
                disabled={!actor}
                className="px-3 py-1 rounded-sm text-xs font-semibold bg-bw-navy text-white disabled:opacity-50"
              >
                Record approval
              </button>
              <button
                onClick={recordProvenance}
                disabled={!actor}
                className="px-3 py-1 rounded-sm text-xs font-semibold bg-white border border-stone-200 text-stone-700 disabled:opacity-50"
              >
                Add provenance note
              </button>
            </div>
          </div>
          {approvals.length === 0 ? (
            <p className="text-xs text-stone-600">No approvals recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-xs text-stone-700">
              {approvals.slice(-3).reverse().map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{a.decision} * {a.stage}</div>
                    <div className="text-stone-600">{a.actor} ({a.role})</div>
                    {a.notes && <div className="text-stone-500">{a.notes}</div>}
                  </div>
                  <div className="text-stone-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock3 size={12} /> {formatDate(a.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-stone-200 rounded-sm p-4 bg-stone-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-2">
            <Clock3 size={14} /> Provenance
          </div>
          {provenance.length === 0 ? (
            <p className="text-xs text-stone-600">No provenance entries yet.</p>
          ) : (
            <ul className="space-y-2 text-xs text-stone-700">
              {provenance.slice(-5).reverse().map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{p.action}</div>
                    <div className="text-stone-600">{p.artifact} * {p.actor}</div>
                    {p.tags && p.tags.length > 0 && (
                      <div className="text-[11px] text-stone-500">Tags: {p.tags.join(', ')}</div>
                    )}
                  </div>
                  <div className="text-stone-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock3 size={12} /> {formatDate(p.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernancePanel;

