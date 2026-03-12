import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Layers, BookOpen, Brain } from 'lucide-react';

interface NSILShowcasePageProps {
    onBack: () => void;
    onStart: () => void;
}

const NSILShowcasePage: React.FC<NSILShowcasePageProps> = ({ onBack, onStart }) => {
    return (
        <div className="h-full w-full bg-stone-50 flex items-start justify-center p-6 pt-16 pb-24 font-sans overflow-y-auto">
            <div className="max-w-6xl w-full bg-white shadow-2xl border border-stone-200 rounded-sm overflow-hidden flex flex-col">
                <section className="bg-bw-navy text-white p-12">
                    <div className="flex items-center gap-2 text-bw-gold font-bold tracking-widest text-xs uppercase mb-4">
                        <Layers size={14} /> NSIL Formula Showcase
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Governed Intelligence Built on 21 Proprietary Formulas</h1>
                    <p className="text-bw-gold font-semibold max-w-3xl">A sovereign-grade reasoning layer that treats mandates as living simulations, produces explainable scores, and ties them to live deliverables.</p>
                    <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wide text-bw-gold">
                        <span className="px-3 py-1 rounded-sm bg-white/10 border border-bw-gold">Governed Reasoning</span>
                        <span className="px-3 py-1 rounded-sm bg-white/10 border border-bw-gold">21-Formula Suite</span>
                        <span className="px-3 py-1 rounded-sm bg-white/10 border border-bw-gold">Explainable & Traceable</span>
                        <span className="px-3 py-1 rounded-sm bg-white/10 border border-bw-gold">Live Documents</span>
                    </div>
                </section>

                <section className="p-10 border-t border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">What Makes NSIL Different</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Computable Intent</p>
                            <p>Mandates become machine-legible without stripping nuance; every assumption is captured, challenged, and traced.</p>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Adversarial Governance</p>
                            <p>Validate a' Debate a> Counterfactuals a> Score a> Synthesize a' Deliver. False confidence is blocked by design.</p>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Agentic Brain</p>
                            <p>A persistent digital worker that advances the case, anticipates questions, and keeps a complete why-chain.</p>
                        </div>
                    </div>
                </section>

                <section className="p-10 border-t border-stone-200">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-stone-700 uppercase tracking-wide">
                        <Sparkles size={16} className="text-bw-gold" /> Core Formula Suite
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">21 Engines Purpose-Built for Judgment</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="rounded-sm border border-stone-200 p-6 bg-white space-y-3">
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
                        </div>
                        <div className="rounded-sm border border-stone-200 p-6 bg-white space-y-3">
                            <p className="text-sm font-semibold text-stone-900">How the formulas are governed</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-stone-700">
                                <li>Inputs are screened by the Adversarial Shield for contradictions, sanctions, ethics, and data quality.</li>
                                <li>Multi-perspective debate (Skeptic, Advocate, Regulator, Accountant, Operator) builds the evidence pack.</li>
                                <li>Counterfactual Lab quantifies sensitivity deltas before any score is released.</li>
                                <li>Explainability contracts bind every score to its why-chain and provenance.</li>
                            </ul>
                            <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-start gap-2">
                                <ShieldCheck size={16} className="mt-0.5" />
                                <div>
                                    <p className="font-bold">Falsifiability baked in</p>
                                    <p>If contradictions slip through, or if scores lack explainability or live recomputation, the claim fails. Governance is a safety rail, not a slogan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="p-10 border-t border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">Governed Reasoning Stack</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-stone-700">
                        <div className="rounded-sm border border-stone-200 p-6 bg-stone-50 space-y-2">
                            <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">From mandate to model</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Intent Capture a' computable mandate with constraints, risk appetite, and stakeholder map.</li>
                                <li>Debate Engine a' five personas argue the plan; contradictions are flagged, not buried.</li>
                                <li>Counterfactual Lab a' shocks for rates, liquidity, partners, policy, and supply chain.</li>
                                <li>Scoring Layer a' 21 formulas calculate exposure, leverage, and resilience.</li>
                                <li>Learning Loop a' outcomes feed back; accuracy improves over time.</li>
                            </ul>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-6 bg-white space-y-2">
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

                <section className="p-10 border-t border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">Proof & Positioning</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-stone-700">
                        <div className="rounded-sm border border-stone-200 p-6 bg-stone-50">
                            <p className="text-sm font-semibold text-stone-900 mb-2">Legacy Collapse</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Consulting: static PDFs, slow recalculation.</li>
                                <li>BI dashboards: visualization without governed reasoning.</li>
                                <li>LLM copilots: unstructured, non-traceable outputs.</li>
                                <li>Spreadsheets: brittle under change; no provenance.</li>
                            </ul>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-6 bg-white">
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

                <section className="p-10 border-t border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">Deployment & Trust Posture</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-700">
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Sovereign-Grade Controls</p>
                            <p>Data segregation, audit trails, and sanctions/ethics checks baked into the workflow.</p>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Explainability Contracts</p>
                            <p>Scores must include definitions, drivers, pressure points, and citations. If not, they fail validation.</p>
                        </div>
                        <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
                            <p className="text-xs font-bold text-stone-900 mb-1">Enterprise Hardening</p>
                            <p>Roadmap covers authn/authz, tenancy, immutable logging, export guardrails, and provenance lockers.</p>
                        </div>
                    </div>
                </section>

                <section className="p-10 border-t border-stone-200 bg-stone-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Ready to see it govern your mandate?</p>
                            <p className="text-sm text-stone-700 max-w-2xl">Kick off with a fresh mission to watch NSIL compute your mandate, run the 21-formula suite, and regenerate deliverables live.</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                <a href="/docs/NSIL_FORMULAS.md" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-2"><BookOpen size={14} /> View Formula Spec</a>
                                <span className="text-stone-400">|</span>
                                <a href="/BW_NEXUS_AI_FULL_TECHNICAL_BRIEF_AND_AUDIT.md" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-2"><Brain size={14} /> Open Technical Brief</a>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={onBack}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-stone-700 border border-stone-300 py-3 px-4 rounded-sm font-bold text-sm uppercase tracking-wide hover:bg-stone-100 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Command Center
                            </button>
                            <button
                                onClick={onStart}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-bw-navy text-white py-3 px-4 rounded-sm font-bold text-sm uppercase tracking-wide hover:bg-bw-gold hover:text-bw-navy transition-colors"
                            >
                                Launch NSIL Workflow <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default NSILShowcasePage;

