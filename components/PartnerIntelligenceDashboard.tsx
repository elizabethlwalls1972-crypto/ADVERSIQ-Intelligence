import React from 'react';
import { Target, Users, BarChart } from './Icons';

interface PartnerIntelligenceDashboardProps {
    params: any;
}

const PartnerIntelligenceDashboard: React.FC<PartnerIntelligenceDashboardProps> = ({ params }) => {
    return (
        <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Partner Intelligence Hub</h3>
                <p className="text-stone-500 text-sm max-w-md mt-2">
                    Advanced analytics for {params.organizationName || 'your organization'} are currently initializing. 
                    This dashboard will aggregate cross-module insights.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 opacity-60">
                <div className="bg-white p-4 rounded-lg border border-stone-200 h-32 flex items-center justify-center">
                    <div className="text-center">
                        <Users className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                        <span className="text-xs font-bold text-stone-400 uppercase">Network Density</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-stone-200 h-32 flex items-center justify-center">
                    <div className="text-center">
                        <BarChart className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                        <span className="text-xs font-bold text-stone-400 uppercase">Market Penetration</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerIntelligenceDashboard;

