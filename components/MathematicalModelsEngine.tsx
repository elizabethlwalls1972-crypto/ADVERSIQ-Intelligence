import React, { useState } from 'react';
import { BarChart, TrendingUpIcon, ActivityIcon } from './Icons';

interface MathematicalModelsEngineProps {
    regionData: any;
    industryData: any;
    onModelResults?: (res: any) => void;
}

const MathematicalModelsEngine: React.FC<MathematicalModelsEngineProps> = ({ regionData, industryData }) => {
    const [activeModel, setActiveModel] = useState('gravity');

    const models = [
        { id: 'gravity', name: 'Gravity Model of Trade', desc: 'Predicts bilateral trade flows based on economic size and distance.' },
        { id: 'lq', name: 'Location Quotient (LQ)', desc: 'Quantifies how concentrated a particular industry is in a region compared to the nation.' },
        { id: 'shift_share', name: 'Shift-Share Analysis', desc: 'Determines what portion of regional economic growth is due to local competitiveness.' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart className="w-6 h-6 text-indigo-300" />
                    <h3 className="text-xl font-bold">Nexus Math Core</h3>
                </div>
                <p className="text-indigo-200 text-sm">Deterministic economic modeling suite.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {models.map(m => (
                    <button 
                        key={m.id}
                        onClick={() => setActiveModel(m.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                            activeModel === m.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                        <div className="font-bold text-stone-900 text-sm mb-1">{m.name}</div>
                        <div className="text-xs text-stone-500 line-clamp-2">{m.desc}</div>
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm min-h-[200px]">
                {activeModel === 'gravity' && (
                    <div className="space-y-4 animate-in fade-in">
                        <h4 className="font-bold text-stone-800 flex items-center gap-2"><TrendingUpIcon className="w-4 h-4 text-indigo-600"/> Gravity Model Simulation</h4>
                        <p className="text-sm text-stone-600">Simulating trade potential between <strong>{regionData.country || 'Origin'}</strong> and Global Markets...</p>
                        <div className="bg-stone-100 p-4 rounded text-center text-stone-400 text-xs font-mono">
                            F_ij = G * (M_i * M_j) / D_ij
                            <br/>Calculating Mass (GDP) and Distance variables...
                        </div>
                    </div>
                )}
                {activeModel === 'lq' && (
                    <div className="space-y-4 animate-in fade-in">
                        <h4 className="font-bold text-stone-800 flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-indigo-600"/> Location Quotient (LQ)</h4>
                        <p className="text-sm text-stone-600">Analyzing regional concentration for <strong>{industryData.industry?.[0] || 'Selected Industry'}</strong>.</p>
                        <div className="h-32 bg-stone-50 rounded border border-stone-200 flex items-center justify-center text-stone-400">
                            Regional Sector Employment Data Required
                        </div>
                    </div>
                )}
                {activeModel === 'shift_share' && (
                    <div className="space-y-4 animate-in fade-in">
                        <h4 className="font-bold text-stone-800 flex items-center gap-2"><BarChart className="w-4 h-4 text-indigo-600"/> Shift-Share Analysis</h4>
                        <p className="text-sm text-stone-600">Decomposing growth into National Share, Industry Mix, and Regional Shift.</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded text-center"><div className="text-xs font-bold text-stone-500">NS</div><div className="font-bold text-stone-800">--</div></div>
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded text-center"><div className="text-xs font-bold text-stone-500">IM</div><div className="font-bold text-stone-800">--</div></div>
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded text-center"><div className="text-xs font-bold text-stone-500">RS</div><div className="font-bold text-stone-800">--</div></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MathematicalModelsEngine;

