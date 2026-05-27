import React, { useState, useEffect, useMemo } from "react";
import { Globe, FileText, Target, Zap, Activity, CheckCircle, Cpu, ArrowRight, Sparkles } from 'lucide-react';
import DocumentGenerationSuite from './DocumentGenerationSuite';
import { RefinedIntake } from '../types';
import { evaluateDocReadiness } from '../services/intakeMapping';

const SCENARIOS = [
    {
        id: 1,
        title: "Market Entry: Renewable Energy",
        context: { region: "Southeast Asia", industry: "Solar & Wind", capital: "$150M USD" },
        report: {
            docTitle: "Strategic Viability Assessment: SEA Energy Grid",
            summary: "Current grid instability in Vietnam and Philippines presents a high-value arbitrage opportunity for independent power producers (IPP).",
            rationale: "High solar irradiance combined with new Feed-in-Tariff (FiT) policies creates optimal entry window."
        },
        logs: [
            "Initializing Nexus Core v4.0...", "Ingesting context: SEA Energy Grid...",
            "Drafting Executive Summary...", "Scanning regulatory frameworks...",
            "Identifying high-asymmetry partners...", "Calculating IVAS scores...", "Finalizing Dossier..."
        ],
        matches: [
            { name: "Mekong Clean Power", location: "Vietnam", score: 94, readiness: "Priority" },
            { name: "Philippine Agro-Solar", location: "Philippines", score: 86, readiness: "High" }
        ]
    },
    {
        id: 2,
        title: "Supply Chain Resilience",
        context: { region: "Eastern Europe", industry: "Manufacturing", capital: "$75M USD" },
        report: {
            docTitle: "Supply Chain De-Risking: Euro-Zone Mfg",
            summary: "Rising labor costs in East Asia necessitate a near-shoring strategy. Poland and Romania offer 40% lower opex with EU market access.",
            rationale: "Tier-2 supplier networks in Gdansk show 91% compatibility with assembly requirements."
        },
        logs: [
            "Switching Context: Euro-Zone Logistics...", "Synthesizing labor arbitrage data...",
            "Mapping Tier-2 supplier networks...", "Detecting latent industrial assets...",
            "Drafting Strategic Rationale...", "Optimizing for Activation Velocity..."
        ],
        matches: [
            { name: "Gdansk Maritime Services", location: "Poland", score: 91, readiness: "Priority" },
            { name: "Bucharest Tech Park", location: "Romania", score: 84, readiness: "High" }
        ]
    }
];

export default function MatchmakingDemo() {
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [phase, setPhase] = useState(0); 
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const [typedTitle, setTypedTitle] = useState("");
    const [typedSummary, setTypedSummary] = useState("");
    const [showMatches, setShowMatches] = useState(false);
    const [showDocGeneration, setShowDocGeneration] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<typeof SCENARIOS[0]["matches"][0] | null>(null);
    
    const currentScenario = SCENARIOS[scenarioIndex];

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        let titleInterval: ReturnType<typeof setInterval>;
        let summaryInterval: ReturnType<typeof setInterval>;

        const runSimulation = async () => {
            setPhase(0); setShowMatches(false); setTypedTitle(""); setTypedSummary(""); setVisibleLogs([]);
            
            await new Promise(r => setTimeout(r, 500));
            setVisibleLogs(prev => [...prev, `> SYSTEM: New Mission Received`]);
            await new Promise(r => setTimeout(r, 400));
            setVisibleLogs(prev => [...prev, `> PARAMS: ${currentScenario.context.industry} | ${currentScenario.context.region}`]);
            
            setPhase(1);
            setVisibleLogs(prev => [...prev, `> AGENT: Strategist drafting executive brief...`]);
            
            let titleIdx = 0;
            const fullTitle = currentScenario.report.docTitle;
            titleInterval = setInterval(() => {
                setTypedTitle(fullTitle.substring(0, titleIdx));
                titleIdx++;
                if (titleIdx > fullTitle.length) clearInterval(titleInterval);
            }, 30);
            
            await new Promise(r => setTimeout(r, 1000));

            let sumIdx = 0;
            const fullSum = currentScenario.report.summary;
            summaryInterval = setInterval(() => {
                setTypedSummary(fullSum.substring(0, sumIdx));
                sumIdx++;
                if (sumIdx > fullSum.length) clearInterval(summaryInterval);
            }, 15);

            await new Promise(r => setTimeout(r, 1500));
            setPhase(2);
            for (let i = 3; i < currentScenario.logs.length; i++) {
                await new Promise(r => setTimeout(r, 600));
                setVisibleLogs(prev => [...prev, `> ${currentScenario.logs[i]}`]);
            }

            setPhase(3);
            setShowMatches(true);
            setVisibleLogs(prev => [...prev, `> DOSSIER COMPLETE.`]);

            timeout = setTimeout(() => {
                setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
            }, 8000);
        };

        runSimulation();
        return () => { clearTimeout(timeout); clearInterval(titleInterval); clearInterval(summaryInterval); };
    }, [currentScenario, scenarioIndex]);

    // Build minimal intake from current scenario & selected match for gating
    const intake: RefinedIntake = useMemo(() => ({
        identity: {
            entityName: currentScenario.context.industry,
            registrationCountry: currentScenario.context.region,
            industryClassification: 'Partnership'
        },
        mission: { strategicIntent: ['entry'], objectives: ['establish partnership'], timelineHorizon: '6-18m' },
        counterparties: selectedMatch ? [{ name: selectedMatch.name, country: selectedMatch.location, relationshipStage: 'intro' }] : [],
        constraints: { budgetUSD: 100_000_000, riskTolerance: 'medium' },
        proof: { documents: [] },
        contacts: {}
    }), [currentScenario, selectedMatch]);

    const readiness = useMemo(() => evaluateDocReadiness(intake), [intake]);
    const canLaunchSuite = readiness['executive-summary'] === 'ready' || readiness['entry-advisory'] === 'ready';

    if (showDocGeneration && selectedMatch) {
        return (
            <div className="w-full">
                <button 
                    onClick={() => { setShowDocGeneration(false); setSelectedMatch(null); }}
                    className="mb-4 flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                    ← Back to Matching
                </button>
                <DocumentGenerationSuite 
                    entityName={currentScenario.context.industry}
                    targetPartnerName={selectedMatch.name}
                    targetMarket={currentScenario.context.region}
                    dealValue={100000000}
                />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col md:flex-row h-[500px] border border-slate-200 rounded-2xl overflow-hidden shadow-lg font-sans">
            {/* Left: System Log Panel - Blues & Greys Theme */}
            <div className="w-full md:w-1/3 bg-slate-900 text-slate-100 p-6 overflow-auto border-r border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    <span className="ml-auto text-[10px] font-mono text-slate-500 tracking-wider">NEXUS_OS_v4.1</span>
                </div>
                <div className="mb-8 pl-2 border-l-2 border-blue-600/40">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Engine Status</h3>
                    <div className="flex items-center gap-3">
                        {phase === 1 || phase === 2 ? <Activity className="w-5 h-5 text-blue-400 animate-pulse" /> : phase === 3 ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Cpu className="w-5 h-5 text-slate-600" />}
                        <span className={`text-lg font-mono font-bold ${phase === 1 || phase === 2 ? 'text-blue-400' : phase === 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {phase === 0 ? "STANDBY" : phase === 1 ? "DRAFTING" : phase === 2 ? "MATCHING" : "COMPLETE"}
                        </span>
                    </div>
                </div>
                <div className="flex-grow font-mono text-[10px] leading-relaxed space-y-2 overflow-hidden text-blue-300/90 max-h-[350px]">
                    {visibleLogs.map((log, i) => (
                        <div key={i} className="animate-in fade-in border-l-2 border-transparent pl-2 hover:border-blue-700/50 transition-colors truncate">
                            <span className="opacity-40 mr-2 text-blue-200">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>{log}
                        </div>
                    ))}
                    {(phase === 1 || phase === 2) && <div className="animate-pulse text-blue-400 pl-2">_</div>}
                </div>
            </div>

            {/* Right: Dossier Panel - Clean Blue/Grey Design */}
            <div className="w-full md:w-2/3 flex flex-col bg-white">
                <div className={`w-full bg-gradient-to-r from-slate-50 to-blue-50 shadow-sm rounded-sm border-b border-slate-200 min-h-[400px] flex flex-col transition-all duration-700 transform ${phase > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-3 opacity-60">
                                <Globe className="w-3 h-3 text-slate-500" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Nexus Intelligence Dossier</span>
                            </div>
                            <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight min-h-[3rem]">{typedTitle}</h2>
                        </div>
                        {phase === 3 && <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider animate-in fade-in">Verified</div>}
                    </div>
                    <div className="p-6 flex-grow space-y-6 overflow-y-auto">
                        <div className={`transition-opacity duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="w-3 h-3 text-blue-500" /> Executive Summary</h4>
                            <p className="text-xs text-slate-700 leading-relaxed font-serif border-l-2 border-blue-400 pl-3 min-h-[3rem] bg-blue-50/40 p-3 rounded">{typedSummary}</p>
                        </div>
                        <div className={`transition-all duration-700 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-3 h-3 text-slate-600" /> Strategic Rationale</h4>
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">{currentScenario.report.rationale}</p>
                        </div>
                        {showMatches && (
                            <div className="animate-in slide-in-from-bottom-2 fade-in">
                                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Target className="w-3 h-3 text-slate-600" /> Identified Partners</h4>
                                <div className="space-y-2">
                                    {currentScenario.matches.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded hover:border-blue-400 transition-all bg-white shadow-sm hover:shadow-md hover:bg-blue-50/50">
                                            <div>
                                                <div className="font-bold text-xs text-slate-900">{m.name}</div>
                                                <div className="text-[9px] text-slate-500 uppercase">{m.location} * {m.readiness}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-blue-600">{m.score}</div>
                                                    <div className="text-[8px] text-slate-400 font-bold uppercase">Score</div>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedMatch(m); setShowDocGeneration(true); }}
                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Final Report Action */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-slate-500/10 border border-blue-300/30 rounded-lg">
                                    <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        Ready to Build Final Report?
                                    </h4>
                                    <p className="text-xs text-slate-600 mb-3">Generate comprehensive documents for selected partners</p>
                                    <button
                                        onClick={() => { if (canLaunchSuite) { setShowDocGeneration(true); setSelectedMatch(currentScenario.matches[0]); } }}
                                        className={`w-full py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 ${canLaunchSuite ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-300 text-slate-600 cursor-not-allowed'}`}
                                        title={canLaunchSuite ? 'Launch Document Suite' : 'Provide minimal details to unlock launch'}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Launch Document Suite
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    {!canLaunchSuite && (
                                        <div className="mt-2 text-[10px] text-amber-700">Hint: add partner and market to unlock readiness.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

