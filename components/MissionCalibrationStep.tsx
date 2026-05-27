import React from 'react';
import { ReportParameters } from '../types';
import { Sliders, Shield, Clock, Coins, Briefcase } from 'lucide-react';

interface MissionCalibrationStepProps {
    params: ReportParameters;
    onParamsChange: (key: keyof ReportParameters, value: any) => void;
}

const CAPABILITY_TAGS = [
    'Liquid Capital', 'Proprietary IP', 'Global Logistics', 'Regulatory Licenses',
    'Skilled Workforce', 'Raw Material Access', 'Gov Relations', 'Brand Equity'
];

const PROBLEM_ARCHITECTURES = [
    'Supply Chain Fragility', 'Market Saturation', 'Regulatory Barrier', 'Capital Inefficiency',
    'Talent Shortage', 'Technological Obsolescence', 'Geopolitical Exposure', 'Brand Erosion'
];

export const MissionCalibrationStep: React.FC<MissionCalibrationStepProps> = ({ params, onParamsChange }) => {
    
    const updateCalibration = (field: string, value: any) => {
        const current = params.calibration || { constraints: {}, capabilitiesHave: [], capabilitiesNeed: [] };
        // Deep merge logic simplified for this specific structure
        if (field === 'budgetCap') {
            onParamsChange('calibration', { ...current, constraints: { ...current.constraints, budgetCap: value } });
        } else if (field === 'problemArchitecture') {
            onParamsChange('problemStatement', value); // Mapping architecture to problem statement for simplicity or keeping separate
        } 
    };

    const toggleCapability = (type: 'capabilitiesHave' | 'capabilitiesNeed', item: string) => {
        // Since capability arrays might be top-level or inside calibration, let's assume we map them to top-level for now 
        // or strictly follow the type. The 'types.ts' defines partnerCapabilities but not explicit 'capabilitiesHave' in root.
        // We will store them in the 'calibration' object inside params (needs type update if strict, but assuming 'any' or flexible type from usage)
        
        const currentCalib = params.calibration || { capabilitiesHave: [], capabilitiesNeed: [] };
        const list = currentCalib[type] || [];
        const newList = list.includes(item) ? list.filter((i: string) => i !== item) : [...list, item];
        
        onParamsChange('calibration', { ...currentCalib, [type]: newList });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-lg"><Sliders className="w-5 h-5 text-stone-600" /></div>
                    <div>
                        <h3 className="font-bold text-stone-900">Mission Constraints</h3>
                        <p className="text-xs text-stone-500">Define the boundaries of your operation.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-2">
                            <Coins className="w-3 h-3" /> Budget Ceiling
                        </label>
                        <select 
                            className="w-full p-3 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-stone-900"
                            value={params.calibration?.constraints?.budgetCap || ''}
                            onChange={(e) => updateCalibration('budgetCap', e.target.value)}
                        >
                            <option value="">No Strict Cap</option>
                            <option value="Under $1M">Micro (&lt; $1M)</option>
                            <option value="Under $10M">Small (&lt; $10M)</option>
                            <option value="Under $50M">Mid-Market (&lt; $50M)</option>
                            <option value="Over $100M">Enterprise (&gt; $100M)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Execution Timeline
                        </label>
                        <select 
                            className="w-full p-3 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-stone-900"
                            value={params.expansionTimeline}
                            onChange={(e) => onParamsChange('expansionTimeline', e.target.value)}
                        >
                            <option value="Immediate">Immediate (0-3 Months)</option>
                            <option value="Short-term">Short-term (3-6 Months)</option>
                            <option value="Mid-term">Mid-term (6-12 Months)</option>
                            <option value="Long-term">Long-term (1-2 Years)</option>
                            <option value="Strategic">Strategic (3+ Years)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-lg"><Briefcase className="w-5 h-5 text-stone-600" /></div>
                    <div>
                        <h3 className="font-bold text-stone-900">Capability Asymmetry</h3>
                        <p className="text-xs text-stone-500">What do you bring, and what do you need?</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-3">Capabilities You Possess (Assets)</span>
                        <div className="flex flex-wrap gap-2">
                            {CAPABILITY_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleCapability('capabilitiesHave', tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        (params.calibration?.capabilitiesHave || []).includes(tag)
                                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                        : 'bg-white text-stone-500 border-stone-200 hover:border-green-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-stone-100 pt-6">
                        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide block mb-3">Capabilities You Need (Gaps)</span>
                        <div className="flex flex-wrap gap-2">
                            {CAPABILITY_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleCapability('capabilitiesNeed', tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        (params.calibration?.capabilitiesNeed || []).includes(tag)
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-stone-500 border-stone-200 hover:border-orange-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <label className="block text-sm font-bold text-stone-900 mb-2">Core Problem Architecture</label>
                <p className="text-xs text-stone-500 mb-4">Select the fundamental challenge driving this strategic move.</p>
                <div className="grid md:grid-cols-2 gap-3">
                    {PROBLEM_ARCHITECTURES.slice(0, 6).map(arch => (
                        <button
                            key={arch}
                            onClick={() => onParamsChange('problemStatement', arch)} // Simple mapping
                            className={`text-left p-3 rounded-lg border text-xs font-medium transition-all ${
                                params.problemStatement === arch
                                ? 'bg-stone-800 text-white border-stone-800'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                            }`}
                        >
                            {arch}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
