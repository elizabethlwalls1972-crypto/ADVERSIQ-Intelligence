import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { Target, Trophy, TrendingUp } from 'lucide-react';

const CompetitorMap: React.FC<{ clientName?: string }> = ({ clientName = "Your Organization" }) => {
  
  // Mock Data representing strategic positioning
  const data = [
    { name: 'Global Incumbent A', x: 85, y: 70, z: 500, type: 'Competitor' }, // High Share, Mod Innovation
    { name: 'Regional Leader B', x: 60, y: 50, z: 300, type: 'Competitor' },
    { name: 'Disruptor C', x: 30, y: 90, z: 150, type: 'Competitor' },
    { name: 'Niche Player D', x: 20, y: 40, z: 80, type: 'Competitor' },
    { name: clientName, x: 45, y: 85, z: 250, type: 'Client' }, // Target position
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Competitive Landscape Radar
                </h3>
                <p className="text-sm text-stone-500">
                    Market Positioning: Innovation Velocity vs. Market Penetration
                </p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span> {clientName}
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-stone-400"></span> Incumbents
                </div>
            </div>
        </div>

        <div className="flex-1 p-6 relative">
            {/* Quadrant Labels */}
            <div className="absolute top-8 right-8 text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Dominant Leaders</div>
            <div className="absolute top-8 left-16 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">High-Growth Disruptors</div>
            <div className="absolute bottom-16 right-8 text-xs font-bold text-stone-400 uppercase tracking-widest">Legacy / Cash Cows</div>
            <div className="absolute bottom-16 left-16 text-xs font-bold text-stone-400 uppercase tracking-widest">Niche / Emerging</div>

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="Market Share" unit="%" label={{ value: 'Market Penetration', position: 'bottom', offset: 0, fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" name="Innovation" unit="pts" label={{ value: 'Innovation Velocity', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Revenue" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-white p-3 border border-stone-200 shadow-lg rounded-lg">
                                    <p className="font-bold text-sm text-stone-900">{data.name}</p>
                                    <p className="text-xs text-stone-500">Share: {data.x}% | Innov: {data.y}</p>
                                    <p className="text-xs text-stone-500">Rev Proxy: ${data.z}M</p>
                                </div>
                            );
                        }
                        return null;
                    }} />
                    <ReferenceLine x={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                    <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                    <Scatter name="Competitors" data={data} fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.type === 'Client' ? '#2563eb' : '#94a3b8'} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100 grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm h-fit">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h4 className="font-bold text-stone-900 text-sm">Winning Strategy</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Your high innovation score (85) allows you to flank "Regional Leader B". Avoid direct price war with "Global Incumbent A".
                    </p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm h-fit">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h4 className="font-bold text-stone-900 text-sm">Growth Vector</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Focus on the "High-Growth Disruptor" quadrant. Target the unserved 30% of market share that values tech over legacy stability.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CompetitorMap;

