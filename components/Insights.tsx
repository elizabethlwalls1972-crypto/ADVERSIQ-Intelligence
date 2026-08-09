import React from 'react';
import { Database, Filter, Scale, FileText } from 'lucide-react';

const steps = [
  { 
      id: '01',
      icon: <Database className="w-6 h-6" />,
      title: 'Historical Context Ingestion', 
      desc: 'The system ingests your mission parameters and instantly cross-references them against a century of economic case studies, identifying the root causes of failure for similar ventures before analysis begins.' 
  },
  { 
      id: '02',
      icon: <Filter className="w-6 h-6" />,
      title: 'Adversarial Stress-Testing', 
      desc: 'NSIL activates the Adversarial Input Shield and the Multi-Perspective Reasoner (skeptic, advocate, regulator, operator). We simulate real-world friction and arguments to expose hidden failure points before capital moves.' 
  },
  { 
      id: '03',
      icon: <Scale className="w-6 h-6" />,
      title: 'Arbitrage Quantification', 
      desc: 'Composite Score Engine v2 + IVAS(TM) + SPI(TM) + SCF compute readiness, velocity, and impact. We find "Asymmetry"a"high value, low visibility - and quantify the gap between market perception and actual potential.' 
  },
  { 
      id: '04',
      icon: <FileText className="w-6 h-6" />,
      title: 'Probabilistic Dossier', 
      desc: 'The output is not a generic report. It is a "Probability Dossier" containing a calculated success score and a deterministic roadmap to mitigate the exact failure points identified in the stress-testing phase.' 
  },
];

export const Insights: React.FC = () => {
    return (
    <section id="methodology" className="py-24 bg-bw-light border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <div className="lg:col-span-4">
                <h2 className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-3">Methodology</h2>
                <h3 className="text-4xl font-serif font-bold text-bw-navy mb-6">How the System Thinks.</h3>
                <p className="text-gray-600 mb-6 leading-[1.85]">
                    Most firms sell opinions. This system produces mathematical proof - turning strategic foresight into a repeatable, machine-backed loop instead of a one-off workshop.
                </p>
                <p className="text-gray-600 mb-6 leading-[1.85]">
                    It is not a static database; it is an active simulation environment. Autonomous agents model how your strategy collides with reala'world friction before capital moves, then feed those learnings back into the Core.
                </p>
                <p className="text-gray-600 mb-6 leading-[1.85]">
                    The result: <strong>evidencea'anchored reasoning</strong>, real-time <strong>governance guardrails</strong>, <strong>counterfactuals</strong>, and <strong>early-warning alerts</strong> mapped directly to your mission.
                </p>
                <div className="p-7 bg-bw-navy text-white rounded-2xl border border-white/10">
                    <div className="text-xl font-serif italic mb-4">"We don't find the safe bet. We calculate the mispriced one."</div>
                    <div className="text-xs font-bold text-bw-gold uppercase tracking-widest">- The Nexus Mandate</div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {steps.map((step) => (
                        <div key={step.id} className="relative group">
                            <div className="absolute -inset-2 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative p-6 rounded-2xl border border-black/5 bg-white shadow-sm group-hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-bw-light border border-black/5 rounded-xl flex items-center justify-center text-bw-navy group-hover:border-bw-gold transition-colors">
                                        {step.icon}
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-bw-navy/60">Step {step.id}</div>
                                        <h4 className="text-lg font-bold text-bw-navy mt-1">{step.title}</h4>
                                      </div>
                                    </div>
                                    <span className="text-3xl font-serif font-bold text-bw-gold/60">{step.id}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-[1.85]">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
            </section>
  );
};
