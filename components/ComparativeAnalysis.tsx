import React, { useState } from 'react';
import { ReportParameters } from '../types';
import { ArrowRight, AlertTriangle, CheckCircle, Scale, TrendingUp, TrendingDown, X, Minus } from 'lucide-react';

interface ComparativeAnalysisProps {
    reports: ReportParameters[];
    onClose: () => void;
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ reports, onClose }) => {
    const [selectedA, setSelectedA] = useState<string>('');
    const [selectedB, setSelectedB] = useState<string>('');

    const reportA = reports.find(r => r.id === selectedA);
    const reportB = reports.find(r => r.id === selectedB);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const calculateDelta = (valA: number, valB: number) => {
        const diff = valA - valB;
        return {
            val: Math.abs(diff),
            winner: diff > 0 ? 'A' : diff < 0 ? 'B' : 'Tie',
            sign: diff > 0 ? '+' : diff < 0 ? '-' : ''
        };
    };

    return (
        <div className="fixed inset-0 bg-stone-100 z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 p-6 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                        <Scale className="text-blue-600" /> Comparative Intelligence Engine
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">Causal Analysis: Why did one succeed where the other failed?</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900">
                    <X />
                </button>
            </header>

            {/* Selection Area */}
            <div className="bg-white border-b border-stone-200 p-4 grid grid-cols-2 gap-8 shrink-0">
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Subject A (Control)</label>
                    <select 
                        className="w-full p-2 border border-stone-300 rounded-md text-sm font-bold"
                        value={selectedA}
                        onChange={(e) => setSelectedA(e.target.value)}
                    >
                        <option value="">Select Historical Benchmark...</option>
                        {reports.map(r => (
                            <option key={r.id} value={r.id}>
                                [{r.outcome?.toUpperCase()}] {r.organizationName} - {r.country}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Subject B (Variable)</label>
                    <select 
                        className="w-full p-2 border border-stone-300 rounded-md text-sm font-bold"
                        value={selectedB}
                        onChange={(e) => setSelectedB(e.target.value)}
                    >
                        <option value="">Select Comparison Benchmark...</option>
                        {reports.map(r => (
                            <option key={r.id} value={r.id}>
                                [{r.outcome?.toUpperCase()}] {r.organizationName} - {r.country}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analysis Canvas */}
            <div className="flex-1 overflow-y-auto p-8">
                {reportA && reportB ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN (A) */}
                        <div className="col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-2 ${reportA.outcome === 'Success' ? 'bg-green-500' : reportA.outcome === 'Failure' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                            <h3 className="font-black text-xl text-stone-900 mb-1">{reportA.organizationName}</h3>
                            <div className="text-sm text-stone-500 mb-4">{reportA.country} * {reportA.industry[0]}</div>
                            
                            <div className="mb-6">
                                <div className="text-xs font-bold text-stone-400 uppercase">Outcome</div>
                                <div className={`text-2xl font-black ${reportA.outcome === 'Success' ? 'text-green-600' : reportA.outcome === 'Failure' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {reportA.outcome}
                                </div>
                                <p className="text-xs text-stone-600 mt-1 italic">"{reportA.outcomeReason}"</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>IVAS Score</span>
                                        <span>{reportA.opportunityScore.totalScore}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${getScoreColor(reportA.opportunityScore.totalScore)}`} style={{width: `${reportA.opportunityScore.totalScore}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>Risk Index</span>
                                        <span>{reportA.opportunityScore.riskFactors}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${getScoreColor(100 - reportA.opportunityScore.riskFactors)}`} style={{width: `${reportA.opportunityScore.riskFactors}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN (ANALYSIS) */}
                        <div className="col-span-4 flex flex-col gap-4">
                            <div className="bg-stone-900 text-white p-6 rounded-xl shadow-lg flex-1 flex flex-col justify-center text-center">
                                <h4 className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-4">Causal Divergence</h4>
                                
                                {/* Score Delta */}
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="text-right">
                                        <div className="text-xs text-stone-400">IVAS Delta</div>
                                        <div className="text-3xl font-bold">{Math.abs(reportA.opportunityScore.totalScore - reportB.opportunityScore.totalScore)}pts</div>
                                    </div>
                                    <div className="h-10 w-px bg-stone-700"></div>
                                    <div className="text-left">
                                        <div className="text-xs text-stone-400">Risk Delta</div>
                                        <div className="text-3xl font-bold">{Math.abs(reportA.opportunityScore.riskFactors - reportB.opportunityScore.riskFactors)}pts</div>
                                    </div>
                                </div>

                                <div className="text-sm leading-relaxed text-gray-300">
                                    {reportA.opportunityScore.totalScore > reportB.opportunityScore.totalScore ? (
                                        <>
                                            <span className="text-white font-bold">{reportA.organizationName}</span> outperformed due to a structural advantage in Market Potential, despite similar risk profiles.
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-white font-bold">{reportB.organizationName}</span> shows superior viability metrics. The failure of A is likely attributed to ignoring the <span className="text-red-400">{(reportA.opportunityScore.riskFactors - reportB.opportunityScore.riskFactors).toFixed(0)}% higher risk friction</span>.
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                                <h5 className="font-bold text-stone-800 text-sm mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-amber-500" />
                                    Knock-on Effect Detected
                                </h5>
                                <p className="text-xs text-stone-600">
                                    The difference in <strong>{reportA.country !== reportB.country ? 'Jurisdiction' : 'Execution Strategy'}</strong> resulted in a {Math.abs((reportA.actualReturnMultiplier || 1) - (reportB.actualReturnMultiplier || 1)).toFixed(1)}x divergence in ROI.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (B) */}
                        <div className="col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-2 ${reportB.outcome === 'Success' ? 'bg-green-500' : reportB.outcome === 'Failure' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                            <h3 className="font-black text-xl text-stone-900 mb-1">{reportB.organizationName}</h3>
                            <div className="text-sm text-stone-500 mb-4">{reportB.country} * {reportB.industry[0]}</div>
                            
                            <div className="mb-6">
                                <div className="text-xs font-bold text-stone-400 uppercase">Outcome</div>
                                <div className={`text-2xl font-black ${reportB.outcome === 'Success' ? 'text-green-600' : reportB.outcome === 'Failure' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {reportB.outcome}
                                </div>
                                <p className="text-xs text-stone-600 mt-1 italic">"{reportB.outcomeReason}"</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>IVAS Score</span>
                                        <span>{reportB.opportunityScore.totalScore}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${getScoreColor(reportB.opportunityScore.totalScore)}`} style={{width: `${reportB.opportunityScore.totalScore}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span>Risk Index</span>
                                        <span>{reportB.opportunityScore.riskFactors}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${getScoreColor(100 - reportB.opportunityScore.riskFactors)}`} style={{width: `${reportB.opportunityScore.riskFactors}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400">
                        <Scale size={64} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select two benchmarks to begin Causal Analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
