import React from 'react';
import { BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import type { DecisionPacket } from '../services/DecisionPipeline';

interface NSILShowcaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: () => void;
    run?: RunSummary; // Live run summary (NSIL-GEN-1228A)
    packet?: DecisionPacket;
    generatedDate?: string;
}

interface RiskItem { risk: string; mitigation: string }
interface RunSummary {
    runId?: string;
    generatedAt?: string;
    overallScore?: number;
    synergyScore?: number;
    supplyChainDependency?: number;
    rroiScore?: number;
    liveObservations?: string[];
    nextMoves?: string[];
    riskRegister?: RiskItem[];
}

const NSILShowcaseModal: React.FC<NSILShowcaseModalProps> = ({ isOpen, onClose, run, packet, generatedDate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-6xl bg-white rounded-sm shadow-2xl border border-stone-200 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-bw-navy text-white p-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-bw-gold font-bold tracking-widest text-xs uppercase mb-3">
                            <Layers size={14} /> System Capability & Competitive Analysis
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">BWGA Ai - System Capability & Competitive Analysis Report</h2>
                        <p className="text-bw-gold text-sm max-w-3xl">A sovereign-grade reasoning layer that treats mandates as living simulations, produces explainable scores, and ties them to live deliverables.</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-bw-gold">
                            {['Governed Reasoning', '21-Formula Suite', 'Explainable & Traceable', 'Live Documents'].map((pill) => (
                                <span key={pill} className="px-3 py-1 rounded-sm bg-white/10 border border-bw-gold">{pill}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-sm font-semibold text-white/80 hover:text-white">Close</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
                    {/* Executive Summary */}
                    <section className="rounded-sm border border-stone-200 bg-white p-5">
                        <h3 className="text-lg font-bold text-stone-900 mb-2">Executive Summary</h3>
                        <p className="text-sm text-stone-700">
                            BWGA Ai operationalizes the NSIL framework to convert mandates into governed, computable simulations. It couples adversarial debate, counterfactual stress, and a 21-formula scoring suite with explainability contracts and live documents. The result is delivery-grade intelligence that can be audited, recomputed on change, and trusted by funding bodies and regulators.
                        </p>
                    </section>

                    {/* 10-Step Framework */}
                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                            <Sparkles size={16} className="text-bw-gold" /> Rigor from the Start: 10-Step Framework
                        </div>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-700">
                            <li><span className="font-semibold">Intake & Goals Capture</span> - objectives, stakeholders, constraints, and risk appetite.</li>
                            <li><span className="font-semibold">Guardrails</span> - policy, sanctions, ethics, and data-quality checks.</li>
                            <li><span className="font-semibold">Evidence Harvest</span> - normalize sources; bind citations for provenance.</li>
                            <li><span className="font-semibold">Contradiction Scan</span> - SPI(TM) preflight identifies incoherence and missing logic.</li>
                            <li><span className="font-semibold">Adversarial Debate</span> - role-based personas challenge assumptions; contradictions cannot pass silently.</li>
                            <li><span className="font-semibold">Counterfactual Lab</span> - shocks across rates, liquidity, partners, policy, and supply chain.</li>
                            <li><span className="font-semibold">Scoring & Explainability</span> - 21 formulas compute resilience; each score ships with drivers and citations.</li>
                            <li><span className="font-semibold">Decision Packet & Controls</span> - thresholds, actions, and monitoring hooks assembled for governance.</li>
                            <li><span className="font-semibold">Live Deliverables Binding</span> - LOI/NDA/Term Sheet/Briefs regenerate on change.</li>
                            <li><span className="font-semibold">Governance & Provenance</span> - approvals, change history, export guardrails, and audit trails.</li>
                        </ol>
                        <div className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-amber-900 text-xs">
                            <p className="font-bold">Rate & Liquidity Stress - Explicit Gates</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>Rates: +30bps / +90bps → DSCR/ICR thresholds gate recommendations.</li>
                                <li>Liquidity: FX/CSR/IRP lanes tested; funding staged with evidence packs.</li>
                            </ul>
                        </div>
                    </section>
                    <section className="rounded-sm border border-stone-200 bg-white p-5">
                        <h3 className="text-lg font-bold text-stone-900 mb-3">Core Innovation</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
                            {[{
                                title: 'Computable Intent',
                                body: 'Mandates become machine-legible without stripping nuance; every assumption is captured, challenged, and traced.'
                            }, {
                                title: 'Adversarial Governance',
                                body: 'Validate -> Debate -> Counterfactuals -> Score -> Synthesize -> Deliver. False confidence is blocked by design.'
                            }, {
                                title: 'Agentic Brain',
                                body: 'A persistent digital worker that advances the case, anticipates questions, and keeps a complete why-chain.'
                            }].map((item) => (
                                <div key={item.title} className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                    <p className="text-xs font-bold text-stone-900 mb-1">{item.title}</p>
                                    <p>{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                            <Sparkles size={16} className="text-bw-gold" /> Core Formula Suite
                        </div>
                        <h3 className="text-lg font-bold text-stone-900">21 Engines Purpose-Built for Judgment</h3>
                        <p className="text-sm text-stone-700">Five primary engines drive the stack, with sixteen derivative indices expanding coverage across alignment, risk, viability, capacity, velocity, and resilience.</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[{
                                title: 'SPI(TM) - Strategic Proof Index',
                                desc: 'Pressure-tests the mandate for internal contradictions and strategic coherence.'
                            }, {
                                title: 'RROI(TM) - Real Return on Intent',
                                desc: 'Scores intent against executable outcomes; exposes value at risk and leakage.'
                            }, {
                                title: 'SEAM(TM) - Symbiotic Ecosystem Alignment Model',
                                desc: 'Quantifies partner fit, mutualism, and ecosystem lift versus dependency.'
                            }, {
                                title: 'IVAS(TM) - Integrity, Viability, Accountability Score',
                                desc: 'Flags probity, compliance, and operational integrity gaps.'
                            }, {
                                title: 'SCF(TM) - Strategic Counterfactual Framework',
                                desc: 'Runs "what if" shocks to prove durability under stress.'
                            }].map((item) => (
                                <div key={item.title} className="rounded-sm border border-stone-200 p-3 bg-stone-50">
                                    <p className="text-[13px] font-bold text-stone-900">{item.title}</p>
                                    <p className="text-xs text-stone-700 mt-1">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-stone-600">Outcome: not a black box. Each score ships with definitions, drivers, pressure points, and evidence citations.</p>
                        <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-start gap-2">
                            <ShieldCheck size={16} className="mt-0.5" />
                            <div>
                                <p className="font-bold">Falsifiability baked in</p>
                                <p>If contradictions slip through, or if scores lack explainability or live recomputation, the claim fails. Governance is a safety rail, not a slogan.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Governed Reasoning Stack</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50 space-y-2">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">From mandate to model</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Intent Capture → computable mandate with constraints, risk appetite, and stakeholder map.</li>
                                    <li>Debate Engine → five personas argue the plan; contradictions are flagged, not buried.</li>
                                    <li>Counterfactual Lab → shocks for rates, liquidity, partners, policy, and supply chain.</li>
                                    <li>Scoring Layer → 21 formulas calculate exposure, leverage, and resilience.</li>
                                    <li>Learning Loop → outcomes feed back; accuracy improves over time.</li>
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50 space-y-2">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">From model to action</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Explainable outputs: every score comes with drivers, sources, and audit-ready rationale.</li>
                                    <li>Document Factory: LOI/NDA/Term Sheet/Policy Brief bind to the live model and regenerate on change.</li>
                                    <li>Governance gates: approvals, change history, and export guardrails.</li>
                                    <li>Provenance logging: evidence lockers and immutable audit trails on roadmap.</li>
                                </ul>
                                <div className="rounded-sm border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex items-start gap-2">
                                    <BookOpen size={16} className="mt-0.5" />
                                    <div>
                                        <p className="font-bold">Traceability by default</p>
                                        <p>Change one variable; the why-chain, scores, and deliverables refresh together. Nothing is detached from its evidence.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Positioning</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-sm font-semibold text-stone-900 mb-2">Legacy Collapse</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Consulting: static PDFs, slow recalculation.</li>
                                    <li>BI dashboards: visualization without governed reasoning.</li>
                                    <li>LLM copilots: unstructured, non-traceable outputs.</li>
                                    <li>Spreadsheets: brittle under change; no provenance.</li>
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-sm font-semibold text-stone-900 mb-2">Nexus Path</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Governed debate with adversarial checks and counterfactuals.</li>
                                    <li>Explainable scoring with attached evidence and assumptions.</li>
                                    <li>Live documents tied to the model; instant recomputation.</li>
                                    <li>Agentic Brain that advances the case proactively.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Live Run Evidence */}
                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Live Run Evidence (Case: {run?.runId || 'NSIL-GEN-1228A'})</h3>
                        <p className="text-xs text-stone-600">Generated: {generatedDate || run?.generatedAt || 'Recent'} • Location: {packet?.scenario?.location || 'Regional Hub'}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Signals & Metrics</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-stone-700">
                                    <div className="rounded-sm border border-stone-200 p-2 bg-white"><p className="font-semibold">Composite</p><p>{String(packet?.scores?.overall ?? run?.overallScore ?? '--')}</p></div>
                                    <div className="rounded-sm border border-stone-200 p-2 bg-white"><p className="font-semibold">Synergy</p><p>{String(packet?.scores?.synergy ?? run?.synergyScore ?? '--')}</p></div>
                                    <div className="rounded-sm border border-stone-200 p-2 bg-white"><p className="font-semibold">Dependency</p><p>{String(packet?.scores?.dependency ?? run?.supplyChainDependency ?? '--')}</p></div>
                                    <div className="rounded-sm border border-stone-200 p-2 bg-white"><p className="font-semibold">RROI</p><p>{String(packet?.scores?.rroi ?? run?.rroiScore ?? '--')}</p></div>
                                </div>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Diligence & Next Moves</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
                                    {(run?.liveObservations || []).slice(0,3).map((o: string) => (<li key={o}>{o}</li>))}
                                    {(run?.nextMoves || []).slice(0,2).map((m: string) => (<li key={m}>{m}</li>))}
                                </ul>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Risk Register</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
                                    {(run?.riskRegister || []).slice(0,4).map((r: RiskItem) => (<li key={r?.risk}><span className="font-semibold">{r?.risk}:</span> {r?.mitigation}</li>))}
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Controls (Packet)</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
                                    {(packet?.controls || []).slice(0,4).map((c) => (<li key={c.metric}><span className="font-semibold">{c.metric}:</span> {c.threshold} → {c.action}</li>))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Technical Proof (Beyond Concept)</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50 space-y-2">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Governed pipeline</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Deterministic payload assembly via ReportOrchestrator; validation of completeness before any score is emitted.</li>
                                    <li>Adversarial Shield checks sanctions/ethics/data quality and blocks unsafe runs.</li>
                                    <li>Counterfactual Lab stresses rates, liquidity, partner failure, policy shocks, and supply-chain interruptions with explicit deltas.</li>
                                    <li>Explainability contracts bind each score to drivers, assumptions, pressure points, and citations.</li>
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50 space-y-2">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Live outputs</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>21-formula suite (SPI, RROI, SEAM, IVAS, SCF + 16 indices) recomputes on change.</li>
                                    <li>Document Factory binds LOI/NDA/Term Sheet/Policy Brief to the live model; regeneration keeps redlines aligned.</li>
                                    <li>Simulation harness captures runtime data and guarantees repeatability for the same inputs.</li>
                                    <li>Health endpoint (/api/health) and SLO posture (99.5%+, P95 &lt; 300ms non-AI) defined for deployment.</li>
                                </ul>
                                <div className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-amber-900 text-xs mt-2">
                                    <p className="font-bold">Counterfactual Stress Examples</p>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>Rate shocks: +30bps / +90bps → DSCR/ICR thresholds gate recommendations.</li>
                                        <li>Liquidity stress: FXR/CSR/IRP lanes tested; escrow releases tied to evidence packs.</li>
                                        <li>Partner failure: remove critical node → SEAM drops; mitigations proposed before proceed.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 mb-1">Funding Fit</p>
                                <p>Architecture is modular for authn/authz, tenancy, immutable logging, export guardrails, and provenance lockers - ready for hardening spend.</p>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 mb-1">Proof of differentiation</p>
                                <p>Judgment-first agentic AI, governed debate, counterfactual scoring, and live document regeneration in one stack; not available in BI, LLM copilots, or static consultants.</p>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 mb-1">Export & evidence</p>
                                <p>ExportService ready for PDF/DOCX wiring; provenance logging hooks defined for signed URLs and evidence lockers.</p>
                            </div>
                        </div>
                    </section>

                    {/* BWGA Mission & Agentic Brain */}
                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-3">
                        <h3 className="text-lg font-bold text-stone-900">BWGA Mission & Context</h3>
                        <p className="text-sm text-stone-700">BWGA's mission is to mobilize delivery-grade intelligence that advances prosperity and public good. NSIL encodes mandates into governed simulations so decisions are explainable, auditable, and export-ready - bridging policy intent and executable outcomes.</p>
                    </section>

                    {/* Agentic Brain Proof */}
                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Agentic Brain - Proof of Operation</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Pipeline</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Plan → Tools → Memory → Verdict (MultiAgentOrchestrator).</li>
                                    <li>Persistent context and proactive preparation (agenticWorker); anticipates questions and assembles evidence.</li>
                                    <li>Governance rails applied at each step; unsafe or incomplete logic is blocked.</li>
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Traceability</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Debate transcripts, contradiction flags, counterfactual deltas, and score rationales logged.</li>
                                    <li>Deliverable provenance attached; export guardrails define signing and review steps.</li>
                                    <li>Falsifiability tests ensure explainability contracts exist for each score.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Competitive Analysis</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-700">
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-sm font-semibold text-stone-900 mb-2">Consulting / BI / LLM copilots</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Static deliverables; no live recomputation or counterfactual governance.</li>
                                    <li>No explainability contracts; weak provenance; outputs are not audit-ready.</li>
                                    <li>Task assistants, not judgment engines; agentic loops rarely governed.</li>
                                    <li>Fragmented: data viz + ad hoc prompts + offline slideware.</li>
                                </ul>
                            </div>
                            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                <p className="text-sm font-semibold text-stone-900 mb-2">Nexus / NSIL</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Governed debate + counterfactual lab + 21-formula scoring in one flow.</li>
                                    <li>Explainable, traceable outputs; evidence and assumptions travel with scores.</li>
                                    <li>Agentic Brain advances the case proactively with governance rails.</li>
                                    <li>Live documents regenerate on change; export pipeline is guardrail-ready.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-sm border border-stone-200 bg-white p-5 space-y-4">
                        <h3 className="text-lg font-bold text-stone-900">Deployment &amp; Trust Posture</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
                            {[{
                                title: 'Sovereign-Grade Controls',
                                body: 'Data segregation, audit trails, and sanctions/ethics checks baked into the workflow.'
                            }, {
                                title: 'Explainability Contracts',
                                body: 'Scores must include definitions, drivers, pressure points, and citations. If not, they fail validation.'
                            }, {
                                title: 'Enterprise Hardening',
                                body: 'Roadmap covers authn/authz, tenancy, immutable logging, export guardrails, and provenance lockers.'
                            }].map((item) => (
                                <div key={item.title} className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                                    <p className="text-xs font-bold text-stone-900 mb-1">{item.title}</p>
                                    <p>{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default NSILShowcaseModal;

