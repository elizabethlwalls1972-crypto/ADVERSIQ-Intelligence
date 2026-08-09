import React, { useState, useEffect } from 'react';
import { ReportParameters, SEAM_Blueprint } from '../types';
import { generateSEAM } from '../services/engine';
import { Network, Users, Zap, AlertTriangle } from 'lucide-react';

interface SEAMEcosystemStepProps {
    params: ReportParameters;
}

const SEAMEcosystemStep: React.FC<SEAMEcosystemStepProps> = ({ params }) => {
    const [seam, setSeam] = useState<SEAM_Blueprint | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!params.country || !params.industry.length) return;
            setLoading(true);
            try {
                const result = await generateSEAM(params);
                setSeam(result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [params.country, params.industry]);

    if (loading || !seam) return null;

    return (
        <div className="bg-stone-900 text-white p-6 rounded-xl shadow-lg border border-stone-700 h-full relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-stone-700 pb-4">
                    <Network className="w-6 h-6 text-purple-400" />
                    <div>
                        <h3 className="text-lg font-bold">SEAM Ecosystem</h3>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Health: {seam.ecosystemHealth}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                        <Users className="w-3 h-3" /> Key Strategic Nodes
                    </h4>
                    <div className="grid gap-2">
                        {seam.partners.map((p, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors">
                                <div>
                                    <div className="text-xs font-bold text-stone-200">{p.name}</div>
                                    <div className="text-[10px] text-stone-500">{p.role}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${p.synergy > 85 ? 'text-green-400' : 'text-purple-400'}`}>
                                        {p.synergy}%
                                    </div>
                                    <div className="text-[9px] text-stone-600 uppercase">Synergy</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {seam.gaps.length > 0 && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                            <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Critical Gaps
                            </h4>
                            <ul className="space-y-1">
                                {seam.gaps.map((gap, i) => (
                                    <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                                        <span className="mt-1 opacity-50">*</span> {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SEAMEcosystemStep;
