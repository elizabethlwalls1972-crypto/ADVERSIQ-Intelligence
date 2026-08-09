import React, { useState, useEffect } from 'react';
import { ReportParameters, RROI_Index, RROI_Component } from '../types';
import { generateRROI } from '../services/engine';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface RROIDiagnosticStepProps {
    params: ReportParameters;
}

const RROIDiagnosticStep: React.FC<RROIDiagnosticStepProps> = ({ params }) => {
    const [rroi, setRroi] = useState<RROI_Index | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!params.country || !params.industry.length) return;
            setLoading(true);
            try {
                const result = await generateRROI(params);
                setRroi(result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [params.country, params.industry]);

    if (!params.country) return null;

    if (loading || !rroi) {
        return (
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                    <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-stone-500 font-bold uppercase">Calculating Regional Readiness...</p>
                </div>
            </div>
        );
    }

    const getBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-blue-500';
        return 'bg-amber-500';
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    RROI Diagnostic
                </h3>
                <div className="text-2xl font-black text-stone-900">
                    {rroi.overallScore}<span className="text-sm font-medium text-stone-400">/100</span>
                </div>
            </div>

            <p className="text-xs text-stone-600 mb-6 italic border-l-2 border-blue-200 pl-3">
                "{rroi.summary}"
            </p>

            <div className="space-y-4">
                {Object.entries(rroi.components).map(([key, comp]) => {
                    const c = comp as RROI_Component;
                    return (
                    <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-stone-700 uppercase">{c.name}</span>
                            <span className="font-mono text-stone-500">{c.score}</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-1">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${getBarColor(c.score)}`} 
                                style={{ width: `${c.score}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-stone-400 truncate">{c.analysis}</p>
                    </div>
                )})}
            </div>
        </div>
    );
};

export default RROIDiagnosticStep;
