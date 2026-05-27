import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Sliders, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

const ScenarioSimulator: React.FC = () => {
  const [variables, setVariables] = useState({
    marketGrowth: 5,
    inflation: 3,
    regulatoryFriction: 2,
    competitorAggression: 4
  });

  // Generate curve data based on variables
  const generateData = () => {
    const data = [];
    const baselineGrowth = 1.0 + (variables.marketGrowth / 100);
    const frictionDrag = 1.0 - (variables.regulatoryFriction / 100);
    const inflationDrag = 1.0 - (variables.inflation / 100);
    
    let baselineValue = 100;
    let stressedValue = 100;

    for (let year = 2024; year <= 2029; year++) {
      // Baseline calculation (Optimistic)
      baselineValue = baselineValue * baselineGrowth;
      
      // Stressed calculation (with friction and inflation)
      // Competitor aggression accelerates decay of advantage
      const compFactor = 1.0 - (variables.competitorAggression * 0.02); 
      stressedValue = stressedValue * baselineGrowth * frictionDrag * inflationDrag * compFactor;

      data.push({
        year,
        Baseline: Math.round(baselineValue),
        Stressed: Math.round(stressedValue),
        Delta: Math.round(baselineValue - stressedValue)
      });
    }
    return data;
  };

  const data = generateData();
  const currentROI = Math.round(data[data.length-1].Stressed - 100);

  return (
    <div className="h-full flex flex-col bg-stone-50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-stone-200 bg-white">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Strategic Simulation: Scenario Stress-Test
            </h3>
            <p className="text-sm text-stone-500 mt-1">
                Simulate market shocks to test the resilience of your strategic mandate.
            </p>
        </div>

        <div className="flex-1 p-6 grid lg:grid-cols-3 gap-8 overflow-y-auto">
            
            {/* Controls */}
            <div className="lg:col-span-1 space-y-8 bg-white p-6 rounded-xl border border-stone-200 h-fit">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-stone-700 uppercase">Market Growth Rate</label>
                        <span className="text-xs font-mono bg-green-100 text-green-800 px-2 rounded">{variables.marketGrowth}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="20" 
                        value={variables.marketGrowth}
                        onChange={(e) => setVariables({...variables, marketGrowth: parseInt(e.target.value)})}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-stone-700 uppercase">Inflation / Cost Shock</label>
                        <span className="text-xs font-mono bg-red-100 text-red-800 px-2 rounded">{variables.inflation}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="15" 
                        value={variables.inflation}
                        onChange={(e) => setVariables({...variables, inflation: parseInt(e.target.value)})}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-stone-700 uppercase">Regulatory Friction</label>
                        <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 rounded">{variables.regulatoryFriction}/10</span>
                    </div>
                    <input 
                        type="range" min="0" max="10" 
                        value={variables.regulatoryFriction}
                        onChange={(e) => setVariables({...variables, regulatoryFriction: parseInt(e.target.value)})}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-stone-700 uppercase">Competitor Aggression</label>
                        <span className="text-xs font-mono bg-stone-100 text-stone-800 px-2 rounded">{variables.competitorAggression}/10</span>
                    </div>
                    <input 
                        type="range" min="0" max="10" 
                        value={variables.competitorAggression}
                        onChange={(e) => setVariables({...variables, competitorAggression: parseInt(e.target.value)})}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                    />
                </div>

                <div className="pt-6 border-t border-stone-100">
                    <button 
                        onClick={() => setVariables({ marketGrowth: 5, inflation: 3, regulatoryFriction: 2, competitorAggression: 4 })}
                        className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" /> Reset to Baseline
                    </button>
                </div>
            </div>

            {/* Visuals */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                        <div className="text-xs text-stone-500 uppercase font-bold mb-1">Projected 5-Year Alpha</div>
                        <div className={`text-3xl font-black ${currentROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {currentROI > 0 ? '+' : ''}{currentROI}%
                        </div>
                        <div className="text-xs text-stone-400 mt-1">vs. Initial Capital</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                        <div className="text-xs text-stone-500 uppercase font-bold mb-1">Divergence Risk</div>
                        <div className="text-3xl font-black text-amber-600">
                            ${Math.round(data[data.length-1].Delta)}M
                        </div>
                        <div className="text-xs text-stone-400 mt-1">Value at Risk (VaR)</div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex-1 min-h-[300px]">
                    <h4 className="text-sm font-bold text-stone-900 mb-4">Capital Trajectory Forecast</h4>
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorStressed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="Baseline" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" />
                            <Area type="monotone" dataKey="Stressed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStressed)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                        <h5 className="text-xs font-bold text-amber-800 uppercase">Consultant's Note</h5>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            Under high-inflation scenarios, the "Stressed" model diverges significantly by 2026. Recommendation: Hedge currency exposure and lock in long-term supplier contracts within the first 6 months.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ScenarioSimulator;
