import React, { useState, useEffect } from 'react';
import { generateSymbioticMatches } from '../services/engine';
import { ReportParameters, SymbioticPartner } from '../types';
import { Users, Zap, MapPin, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

interface MatchmakingEngineProps {
    params: ReportParameters;
    autoRun?: boolean;
    compact?: boolean;
}

export default function MatchmakingEngine({ params, autoRun = false, compact = false }: MatchmakingEngineProps) {
    const [matches, setMatches] = useState<SymbioticPartner[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const runMatch = async () => {
        setLoading(true);
        try {
            const results = await generateSymbioticMatches(params);
            setMatches(results);
            setHasRun(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoRun && !hasRun) {
            runMatch();
        }
    }, [autoRun, hasRun]);

    if (loading) {
        return (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-800 animate-pulse">Scanning Global Entity Database...</h4>
                <p className="text-xs text-stone-500 mt-1">Cross-referencing {params.industry.join(', ')} vectors in {params.region || 'Global Market'}</p>
            </div>
        );
    }

    if (!hasRun && !loading) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-stone-300">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-900 mb-2">Partner Discovery Engine</h3>
                <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
                    Identify high-synergy partners based on your strategic intent and capabilities profile.
                </p>
                <button 
                    onClick={runMatch}
                    className="px-6 py-3 bg-stone-900 text-white font-bold rounded-lg text-sm hover:bg-black transition-colors shadow-lg"
                >
                    Run Match Algorithm
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!compact && (
                <div className="flex justify-between items-end border-b border-stone-200 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Symbiotic Matches
                        </h3>
                        <p className="text-xs text-stone-500 mt-1">Top {matches.length} entities aligned with {params.strategicIntent}</p>
                    </div>
                    <button onClick={runMatch} className="text-xs font-bold text-blue-600 hover:underline">Refresh Scan</button>
                </div>
            )}

            <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {matches.map((partner, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
                        
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{partner.entityType}</div>
                                <h4 className="font-bold text-stone-900 text-base leading-tight group-hover:text-blue-700 transition-colors">
                                    {partner.entityName}
                                </h4>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-green-600">{partner.symbiosisScore}%</div>
                                <div className="text-[9px] font-bold text-stone-400 uppercase">Fit Score</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-500 mb-4 pl-2">
                            <MapPin className="w-3 h-3" /> {partner.location}
                        </div>

                        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 mb-3 ml-2">
                            <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Asymmetry Logic</div>
                            <p className="text-xs text-stone-700 leading-relaxed italic">"{partner.asymmetryAnalysis}"</p>
                        </div>

                        {!compact && (
                            <div className="space-y-3 pl-2">
                                <div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Mutual Benefit</div>
                                    <p className="text-xs text-stone-600">{partner.mutualBenefit}</p>
                                </div>
                                {partner.riskFactors.length > 0 && (
                                    <div>
                                        <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Risk Factors</div>
                                        <div className="flex flex-wrap gap-1">
                                            {partner.riskFactors.map((risk, i) => (
                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100">
                                                    {risk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end pl-2">
                            <button className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                View Dossier <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
