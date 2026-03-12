
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ReportParameters, SkillLevel } from '../types';
import { ORGANIZATION_TYPES, ORGANIZATION_SUBTYPES, REGIONS_AND_COUNTRIES, INDUSTRIES, STRATEGIC_OBJECTIVES, STRATEGIC_LENSES, INDUSTRY_NICHES, INTELLIGENCE_CATEGORIES, GLOBAL_DEPARTMENTS, GLOBAL_ROLES } from '../constants';
import { Zap, BrainCircuit, CheckCircle, Globe, X, Network, ShieldCheck, Users, FileText, MapPin, Target, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { ManualInputModal } from './ManualInputModal';
import { MissionCalibrationStep } from './MissionCalibrationStep';

interface GatewayProps {
    params: ReportParameters;
    onUpdate: (params: ReportParameters) => void;
    onComplete: () => void;
}

interface IntelligentSuggestions {
    intelligenceCategory: string;
    strategicOptions: {
        title: string;
        description: string;
        confidence: number;
        timeline: string;
        risk: string;
    }[];
    potentialPartners: { name: string; type: string; relevance: number; contact: string }[];
    alternativeApproaches: string[];
    riskConsiderations: string[];
    recommendedNextSteps: string[];
}

// --- DYNAMIC BENCHMARK DATABASE ---
const DYNAMIC_BENCHMARKS: Record<string, string[]> = {
    'Technology (Software/Hardware)': [
        "Silicon Valley (USA) - Global Innovation Capital",
        "Tel Aviv (Israel) - Cyber & Startup Ecosystem",
        "Bangalore (India) - IT Outsourcing Hub",
        "Shenzhen (China) - Hardware Innovation",
        "Berlin (Germany) - European Tech Hub",
        "Estonia - Digital Governance Model",
        "Singapore - Smart City Benchmark"
    ],
    'Default': [
        "Singapore - Global Business Hub",
        "Dubai (UAE) - Trade & Logistics",
        "London (UK) - Financial Center",
        "New York (USA) - Corporate HQ",
        "Estonia - Digital Governance",
        "Silicon Valley (USA) - Tech Innovation",
        "Shanghai (China) - Commerce & Trade"
    ]
};

// Strategic Intent Tags
const INTENT_TAGS = [
    // Market & Growth
    'New Market Entry',
    'Organic Expansion',
    'Geographic Diversification',
    'Market Consolidation',
    'Market Share Growth',
    'Brand Repositioning',
    // M&A and Partnerships
    'Mergers & Acquisitions',
    'Joint Venture / Partnership',
    'Strategic Alliance',
    'Divestiture / Spin-off',
    // Operations & Supply Chain
    'Supply Chain Resilience',
    'Operational Efficiency Improvement',
    'Digital Transformation',
    // R&D and Technology
    'R&D Collaboration',
    'Technology Transfer',
    'IP Licensing',
    // Finance & Investment
    'Capital Raising',
    'Investment Attraction',
    'Financial Restructuring',
    // People & Governance
    'Talent Acquisition',
    'Regulatory Engagement',
    'Crisis Management'
];

// Helper for Searchable Multi-Select
const MegaMultiSelect = ({ 
    options, 
    selected, 
    onToggle, 
    label, 
    placeholder 
}: { 
    options: string[], 
    selected: string[], 
    onToggle: (val: string) => void, 
    label: string, 
    placeholder: string 
}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => options.filter(o => o.toLowerCase().includes(search.toLowerCase())), [options, search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-stone-800 mb-1">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selected.map(val => (
                    <span key={val} className="px-2 py-1 bg-stone-800 text-white text-xs rounded flex items-center gap-1 shadow-sm">
                        {val} <button onClick={() => onToggle(val)} className="hover:text-red-300 ml-1">A - </button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={search}
                    onFocus={() => setIsOpen(true)}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 text-sm shadow-sm"
                    placeholder={placeholder}
                />
                {isOpen && (
                    <div className="absolute z-50 w-full bg-white border border-stone-200 shadow-2xl rounded-lg mt-1 max-h-60 overflow-y-auto overflow-x-hidden flex flex-col">
                        <div className="flex justify-between items-center p-2 border-b border-stone-100 bg-stone-50 sticky top-0 z-10">
                            <span className="text-xs font-bold text-stone-500 px-2">{filtered.length} Options</span>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-200 rounded-full">
                                <X className="w-4 h-4 text-stone-500" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {filtered.slice(0, 100).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { onToggle(opt); setSearch(''); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 flex justify-between border-b border-stone-50 last:border-0 break-words whitespace-normal ${selected.includes(opt) ? 'bg-blue-50 text-blue-800 font-bold' : 'text-stone-700'}`}
                                >
                                    <span className="break-words">{opt}</span>
                                    {selected.includes(opt) && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                                </button>
                            ))}
                            {filtered.length === 0 && <div className="p-3 text-sm text-stone-500">No matches found.</div>}
                            {filtered.length === 0 && search.trim().length > 2 && (
                                <div className="p-2 border-t border-stone-100">
                                    <button 
                                        onClick={() => { onToggle(search.trim()); setSearch(''); }}
                                        className="w-full text-left px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                                    >
                                        + Add "{search}" as a new entry
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t border-stone-200 bg-stone-50 sticky bottom-0 z-10">
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="w-full py-2 bg-stone-900 text-white rounded-md text-sm font-bold hover:bg-stone-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Gateway: React.FC<GatewayProps> = ({ params, onUpdate, onComplete }) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Manual Entry Modal State
    const [manualModal, setManualModal] = useState<{ isOpen: boolean; title: string; label: string; field: keyof ReportParameters | 'industry' }>({
        isOpen: false,
        title: '',
        label: '',
        field: 'region' // Default
    });

    // Intelligent Matching State
    const [showIntelligentMatching, setShowIntelligentMatching] = useState(false);
    const [showCustomIntent, setShowCustomIntent] = useState(false);
    const [customIntentValue, setCustomIntentValue] = useState("");

    useEffect(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step, containerRef]);

    const update = (field: keyof ReportParameters, value: any) => {
        onUpdate({ ...params, [field]: value });
    };

    const handleManualEntry = (field: keyof ReportParameters | 'industry', value: string) => {
        if (field === 'industry') {
            // Ensure industry is always an array
            const currentIndustries = Array.isArray(params.industry) ? params.industry : [];
            update('industry', [...currentIndustries, value]);
        } else {
            update(field as keyof ReportParameters, value);
        }
        setManualModal(prev => ({ ...prev, isOpen: false }));
    };

    const openManualModal = (title: string, label: string, field: keyof ReportParameters | 'industry') => {
        setManualModal({ isOpen: true, title, label, field });
    };

    const handleOrgTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({
            ...params,
            organizationType: e.target.value,
            organizationSubType: '',
            customOrganizationType: '',
            customOrganizationSubType: ''
        });
    };

    const toggleArrayItem = (field: keyof ReportParameters, item: string) => {
        const current = (params[field] as string[]) || [];
        const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        update(field, updated);
    };

    const getIntelligentSuggestions = (currentParams: ReportParameters): IntelligentSuggestions | null => {
        if (!currentParams.organizationType || !currentParams.userCountry || !currentParams.region) return null;

        const suggestions: IntelligentSuggestions = {
            intelligenceCategory: '',
            strategicOptions: [],
            potentialPartners: [],
            alternativeApproaches: [] as any[],
            riskConsiderations: [] as string[],
            recommendedNextSteps: [] as string[]
        };

        // Determine Intelligence Category
        if (currentParams.organizationType.includes('Government') && currentParams.region) {
            suggestions.intelligenceCategory = 'Government Relations';
        } else if (currentParams.organizationType.includes('Private') && currentParams.industry.length > 0) {
            suggestions.intelligenceCategory = 'Market Entry Strategy';
        } else {
            suggestions.intelligenceCategory = 'Strategic Partnership Development';
        }

        // Generate Strategic Options
        suggestions.strategicOptions = [
            {
                title: 'Direct Partnership Approach',
                description: 'Identify and engage specific partners in your target region',
                confidence: 85,
                timeline: '3-6 months',
                risk: 'Medium'
            },
            {
                title: 'Ecosystem Development',
                description: 'Build comprehensive support network including regulators, banks, and logistics',
                confidence: 78,
                timeline: '6-12 months',
                risk: 'Low'
            },
            {
                title: 'Market Testing Strategy',
                description: 'Start with pilot projects and expand based on results',
                confidence: 92,
                timeline: '2-4 months',
                risk: 'Low'
            }
        ];

        // Generate Potential Partners
        const regionPartners = {
            'Asia-Pacific': ['Singapore Economic Development Board', 'Japan External Trade Organization', 'South Korea Trade Center'],
            'Europe': ['European Commission', 'Germany Trade & Invest', 'UK Department for International Trade'],
            'Middle East': ['Dubai Chamber of Commerce', 'Saudi Arabia General Investment Authority', 'Qatar Investment Authority'],
            'Americas': ['US Commercial Service', 'Canada Trade Commissioner Service', 'Brazilian Development Bank']
        };

        const partners = regionPartners[currentParams.region as keyof typeof regionPartners] || ['Regional Development Agency', 'Trade Promotion Organization'];
        suggestions.potentialPartners = partners.map((name, index) => ({
            name,
            type: 'Government Agency',
            relevance: 85 + index * 5,
            contact: 'Available through diplomatic channels'
        }));

        // Alternative Approaches
        suggestions.alternativeApproaches = [
            'Joint Venture with Local Partner',
            'Acquisition of Existing Operation',
            'Greenfield Investment with Government Incentives',
            'Strategic Alliance Network',
            'Technology Licensing Agreement'
        ];

        // Risk Considerations
        suggestions.riskConsiderations = [
            'Regulatory approval timelines',
            'Cultural integration challenges',
            'Currency and economic stability',
            'Political relationship management',
            'Local partner reliability'
        ];

        // Recommended Next Steps
        suggestions.recommendedNextSteps = [
            'Schedule initial diplomatic meetings',
            'Conduct preliminary market research',
            'Engage local legal counsel',
            'Develop detailed project timeline',
            'Prepare initial investment memorandum'
        ];

        return suggestions;
    }

    // Intelligent Matching Logic (memoized)
    const intelligentSuggestions = useMemo(() => {
        return getIntelligentSuggestions(params);
    }, [params.organizationType, params.userCountry, params.region, params.industry]);

    useEffect(() => {
        if (params.organizationType && params.userCountry && params.region && intelligentSuggestions && !showIntelligentMatching) {
            // This logic is now handled outside of the Gateway component, in the final report.
        }
    }, [params.organizationType, params.userCountry, params.region, intelligentSuggestions, showIntelligentMatching]);

    const inputStyles = "w-full p-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all text-sm text-stone-900 shadow-sm placeholder-stone-400";
    const labelStyles = "block text-sm font-bold text-stone-800 mb-1 tracking-wide";

    const detailedSubTypes: Record<string, string[]> = {
        'Private': [
            'Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)',
            'S-Corporation', 'C-Corporation', 'B-Corporation', 'Venture-Backed Startup',
            'Family Office', 'Private Equity Firm', 'Venture Capital Firm'
        ],
        'Government': [
            'Federal / National Agency', 'State / Provincial Department', 'Municipal / Local Government',
            'Inter-Governmental Organization (IGO)', 'Government-Owned Corporation', 'Special Economic Zone Authority'
        ],
        'Non-Profit': [
            '501(c)(3) - Public Charity', '501(c)(4) - Social Welfare', '501(c)(6) - Business League',
            'Non-Governmental Organization (NGO)', 'Private Foundation', 'Community Trust'
        ],
        'Academic': ['University', 'Research Institute', 'Think Tank', 'Vocational College'],
        ...ORGANIZATION_SUBTYPES,
    };

    const subTypes = detailedSubTypes[params.organizationType] || [];
    const showCustomTypeInput = params.organizationType === 'Custom';
    const showCustomCategoryInput = params.organizationType && (params.organizationSubType === 'Custom' || subTypes.length === 0);

    const allNiches = useMemo(() => {
        const industry = params.industry[0];
        if (industry && INDUSTRY_NICHES[industry]) return INDUSTRY_NICHES[industry];
        return Object.values(INDUSTRY_NICHES).flat();
    }, [params.industry]);

    const allObjectives = useMemo(() => {
        return Object.values(STRATEGIC_OBJECTIVES).flat().map(o => o.label);
    }, []);

    useEffect(() => {
        if (!params.strategicMode) update('strategicMode', 'discovery');
    }, [params.strategicMode, update]);

    const renderStrategyAndDealStep = () => (
        <div className="animate-in fade-in duration-500 space-y-10">
            <div className="border-b border-stone-100 pb-6">
                <h2 className="text-2xl font-bold text-stone-900">Step 2: Strategy &amp; Deal Architecture</h2>
                <p className="text-stone-500">Configure your market entry and partner search scope. AI will generate cultural intelligence and competitive landscape analysis.</p>
            </div>

            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className={labelStyles}>Target Region / Market</label>
                        <select
                            value={params.region}
                            onChange={(e) => {
                                if (e.target.value === 'Custom') {
                                    openManualModal('Enter Target Region', 'Target Jurisdiction', 'region');
                                } else {
                                    update('region', e.target.value);
                                }
                            }}
                            className={inputStyles}
                        >
                            <option value="">Select Target Region...</option>
                            {REGIONS_AND_COUNTRIES.map((r) => (
                                <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                            <option value="Custom">Other / Custom...</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelStyles}>Primary Sector</label>
                        <select
                            className={inputStyles}
                            onChange={(e) => {
                                if (e.target.value === 'Custom') {
                                    openManualModal('Enter Industry', 'Primary Sector', 'industry');
                                } else {
                                    update('industry', [e.target.value]);
                                }
                            }}
                            value={params.industry[0] || ''}
                        >
                            <option value="">Select Industry...</option>
                            {INDUSTRIES.map((ind) => (
                                <option key={ind.id} value={ind.id}>{ind.title}</option>
                            ))}
                            <option value="Custom">Other / Custom...</option>
                        </select>
                    </div>
                </div>

                {params.industry.length > 0 && (
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                        <MegaMultiSelect
                            label="Niche Specialization (Refine Focus)"
                            options={allNiches}
                            selected={params.nicheAreas || []}
                            onToggle={(val) => toggleArrayItem('nicheAreas', val)}
                            placeholder="Search 100+ specialized niches..."
                        />
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mt-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-black" /> Strategic Mode
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[{ id: 'specific', title: 'Analyze Specific Target', desc: 'Deep due diligence on a known entity.' }, { id: 'discovery', title: 'Discover Partners', desc: 'Find new matches & opportunities.' }, { id: 'expansion', title: 'Market Expansion', desc: 'Relocation & ecosystem analysis.' }].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => update('strategicMode', mode.id as any)}
                                className={`p-4 rounded-lg border text-left transition-all break-words ${params.strategicMode === mode.id ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white border-stone-200 hover:bg-stone-50'}`}
                            >
                                <div className={`font-bold text-sm mb-1 break-words ${params.strategicMode === mode.id ? 'text-blue-800' : 'text-stone-900'}`}>{mode.title}</div>
                                <div className="text-xs text-stone-500 break-words">{mode.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 bg-stone-50 rounded-lg border border-stone-200 animate-in fade-in space-y-6">
                    {params.strategicMode === 'specific' && (
                        <div className="space-y-5">
                            <div>
                                <label className={labelStyles}>Target Entity Name</label>
                                <input
                                    type="text"
                                    value={params.targetPartner || ''}
                                    onChange={(e) => update('targetPartner', e.target.value)}
                                    className={inputStyles}
                                    placeholder="e.g. Tesla, Ministry of Energy..."
                                />
                            </div>
                        </div>
                    )}

                    {params.strategicMode === 'discovery' && (
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div>
                                    <label className={labelStyles}>Search Scope</label>
                                    <select value={params.searchScope || 'Regional'} onChange={(e) => update('searchScope', e.target.value)} className={inputStyles}>
                                        <option value="Local">Local (Selected Country)</option>
                                        <option value="Regional">Regional ({params.region})</option>
                                        <option value="Global">Global Search</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyles}>Deal Size / Scope</label>
                                    <select value={params.dealSize || ''} onChange={(e) => update('dealSize', e.target.value)} className={inputStyles}>
                                        <option value="">Select scale...</option>
                                        <option value="<100k">Pilot (&lt; $100k)</option>
                                        <option value="100k-1M">Micro ($100k - $1M)</option>
                                        <option value="1M-10M">Small ($1M - $10M)</option>
                                        <option value="10M-50M">Medium ($10M - $50M)</option>
                                        <option value="50M-250M">Large ($50M - $250M)</option>
                                        <option value="250M-1B">Major ($250M - $1B)</option>
                                        <option value=">1B">Mega (&gt; $1B)</option>
                                        <option value="Other">Other (Specify)</option>
                                    </select>
                                    {params.dealSize === 'Other' && (
                                        <input
                                            type="text"
                                            onChange={(e) => update('customDealSize', e.target.value)}
                                            className={`${inputStyles} mt-2 bg-yellow-50`}
                                            placeholder="Specify deal size..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-stone-200 space-y-4">
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <Network className="w-4 h-4 text-purple-600" /> Strategic Intent &amp; Context
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {INTENT_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleArrayItem('intentTags', tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                        (params.intentTags || []).includes(tag)
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                            : 'bg-white text-stone-600 border-stone-200 hover:border-purple-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowCustomIntent(!showCustomIntent)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    showCustomIntent ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                Other...
                            </button>
                        </div>

                        {showCustomIntent && (
                            <div className="flex gap-2 p-3 bg-gray-100 rounded-lg animate-in fade-in duration-300">
                                <input
                                    type="text"
                                    value={customIntentValue}
                                    onChange={(e) => setCustomIntentValue(e.target.value)}
                                    className="flex-grow p-2 border border-stone-300 rounded-md text-sm"
                                    placeholder="Specify custom intent..."
                                />
                                <button
                                    onClick={() => {
                                        if (customIntentValue.trim()) {
                                            toggleArrayItem('intentTags', customIntentValue.trim());
                                            setCustomIntentValue('');
                                            setShowCustomIntent(false);
                                        }
                                    }}
                                    className="px-4 py-2 bg-stone-800 text-white text-sm font-bold rounded-md hover:bg-stone-900"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        <div>
                            <label className={labelStyles}>Mission Context (Tell the System)</label>
                            <textarea
                                value={params.additionalContext || ''}
                                onChange={(e) => update('additionalContext', e.target.value)}
                                className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-stone-800"
                                placeholder="Describe specific goals, constraints, or unique requirements... (e.g. 'We need a partner with strong ESG credentials for a joint venture in renewable energy.')"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-stone-200 space-y-6">
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-600" /> Strategic Risk &amp; Priority Framework
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelStyles}>Priority Themes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Digital Transformation', 'Sustainability (ESG)', 'Innovation', 'Cost Leadership', 'Customer Experience', 'Operational Excellence', 'Talent Development', 'Regulatory Compliance'].map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => toggleArrayItem('priorityThemes', theme)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                (params.priorityThemes || []).includes(theme)
                                                    ? 'bg-red-600 text-white border-red-600'
                                                    : 'bg-white text-stone-600 border-stone-200 hover:border-red-300'
                                            }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelStyles}>Political Sensitivities</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Data Sovereignty', 'National Security', 'Labor Rights', 'Environmental Impact', 'Cultural Heritage', 'Political Stability', 'Sanctions Exposure'].map((sensitivity) => (
                                        <button
                                            key={sensitivity}
                                            onClick={() => toggleArrayItem('politicalSensitivities', sensitivity)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                (params.politicalSensitivities || []).includes(sensitivity)
                                                    ? 'bg-orange-600 text-white border-orange-600'
                                                    : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                                            }`}
                                        >
                                            {sensitivity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyles}>Partnership Support Needs</label>
                            <div className="flex flex-wrap gap-2">
                                {['Legal & Regulatory Support', 'Financial Advisory', 'Technical Expertise', 'Market Intelligence', 'Cultural Integration', 'Operational Support', 'Government Relations', 'Risk Management'].map((need) => (
                                    <button
                                        key={need}
                                        onClick={() => toggleArrayItem('partnershipSupportNeeds', need)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                            (params.partnershipSupportNeeds || []).includes(need)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-stone-600 border-stone-200 hover:border-blue-300'
                                        }`}
                                    >
                                        {need}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex justify-between">
                <button onClick={() => setStep(1)} className="text-stone-500 hover:text-stone-900 text-sm font-medium">&larr; Back to Identity</button>
                <button
                    onClick={() => setStep(3)}
                    disabled={!params.region || !params.industry.length}
                    className="px-8 py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-all shadow-md"
                >
                    Next: Calibration &rarr;
                </button>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="h-full w-full flex flex-col items-center justify-start bg-stone-50 p-6 md:p-10 lg:p-16 pb-32 overflow-y-auto overflow-x-hidden">
            <div className="max-w-4xl md:max-w-5xl lg:max-w-6xl w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden mb-16 shrink-0">
                
                <div className="bg-stone-900 text-white p-6 px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nexus Intelligence Report Generator</h1>
                        <p className="text-stone-400 text-sm">AI-Powered Setup with Document Intelligence & BW Consultant</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-8 h-1 rounded-full ${step >= 4 ? 'bg-white' : 'bg-stone-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 4 ? 'bg-white' : 'bg-stone-700'}`} />
                    </div>
                </div>

                <div className="p-10 md:p-16">

                    {/* STEP 1: IDENTITY PROFILE */}
                    {step === 1 && (
                        <div className="animate-in fade-in duration-500 space-y-10">
                            <div className="border-b border-stone-100 pb-6">
                                <h2 className="text-2xl font-bold text-stone-900">Step 1: Organization Identity</h2>
                                <p className="text-stone-500">Establish the identity driving this analysis. Upload supporting documents for deeper AI insights.</p>
                            </div>

                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                                <label className="block text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">Your Experience Level</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[{ id: 'novice', label: 'Novice', desc: 'I need guidance.' }, { id: 'experienced', label: 'Experienced', desc: 'Collaborate with me.' }, { id: 'expert', label: 'Expert', desc: 'Give me tools.' }].map((level) => (
                                        <button key={level.id} onClick={() => update('skillLevel', level.id as SkillLevel)} className={`p-4 rounded-xl border-2 text-left transition-all break-words ${params.skillLevel === level.id ? 'border-stone-800 bg-white shadow-md ring-1 ring-stone-800' : 'border-stone-200 hover:border-stone-400 text-stone-600 bg-white'}`}>
                                            <div className={`font-bold text-base mb-1 break-words ${params.skillLevel === level.id ? 'text-stone-900' : 'text-stone-800'}`}>{level.label}</div>
                                            <div className="text-xs text-stone-500 break-words">{level.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelStyles}>Organization Type</label>
                                        <select value={params.organizationType} onChange={handleOrgTypeChange} className={inputStyles}>
                                            <option value="">Select Type...</option>
                                            {ORGANIZATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            <option value="Custom">Other / Custom</option>
                                        </select>
                                        {showCustomTypeInput && <input type="text" value={params.customOrganizationType || ''} onChange={(e) => update('customOrganizationType', e.target.value)} className={`${inputStyles} mt-2 bg-yellow-50`} placeholder="Specify Organization Type..." />}
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Organization Sub-Type</label>
                                        <select value={params.organizationSubType || ''} onChange={e => update('organizationSubType', e.target.value)} className={inputStyles} disabled={!params.organizationType}>
                                            <option value="">Select Structure...</option>
                                            {subTypes.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            <option value="Custom">Other (Specify)</option>
                                        </select>
                                        {showCustomCategoryInput && <input type="text" value={params.customOrganizationSubType || ''} onChange={(e) => update('customOrganizationSubType', e.target.value)} className={`${inputStyles} mt-2 bg-yellow-50`} placeholder="Specify Structure..." />}
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Years in Operation</label>
                                        <select value={params.yearsOperation || ''} onChange={(e) => update('yearsOperation', e.target.value)} className={inputStyles}>
                                            <option value="">Select age...</option>
                                            <option value="<1">Pre-Seed / Idea Stage (&lt;1 year)</option>
                                            <option value="1-2">Startup (1-2 years)</option>
                                            <option value="3-5">Early Growth (3-5 years)</option>
                                            <option value="6-10">Scaling (6-10 years)</option>
                                            <option value="11-20">Established (11-20 years)</option>
                                            <option value="20+">Legacy (20+ years)</option>
                                            <option value="Other">Other (Specify)</option>
                                        </select>
                                        {params.yearsOperation === 'Other' && <input type="text" onChange={(e) => update('customYearsOperation', e.target.value)} className={`${inputStyles} mt-2 bg-yellow-50`} placeholder="Specify years..." />}
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Decision Authority Level</label>
                                        <select value={params.decisionAuthority || ''} onChange={(e) => update('decisionAuthority', e.target.value)} className={inputStyles}>
                                            <option value="">Select authority...</option>
                                            <option value="Founder/Owner">Founder / Owner</option>
                                            <option value="Executive">C-Suite / Executive</option>
                                            <option value="Board">Board Member</option>
                                            <option value="VP/Director">VP / Director</option>
                                            <option value="Manager">Department Manager / Head</option>
                                            <option value="Project Lead">Project / Program Lead</option>
                                            <option value="Analyst">Analyst / Specialist</option>
                                            <option value="Contributor">Individual Contributor</option>
                                            <option value="Consultant">External Advisor / Consultant</option>
                                            <option value="Other">Other (Specify)</option>
                                        </select>
                                        {params.decisionAuthority === 'Other' && <input type="text" onChange={(e) => update('customDecisionAuthority', e.target.value)} className={`${inputStyles} mt-2 bg-yellow-50`} placeholder="Specify authority level..." />}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div><label className={labelStyles}>Full Name</label><input type="text" value={params.userName} onChange={e => update('userName', e.target.value)} className={inputStyles} placeholder="e.g. Jane Doe" /></div>
                                    <div><label className={labelStyles}>Role / Title</label><input type="text" value={params.userDepartment} onChange={e => update('userDepartment', e.target.value)} className={inputStyles} placeholder="e.g. Minister of Trade" /></div>
                                    <div>
                                        <label className={labelStyles}>Organization Name</label>
                                        <input type="text" value={params.organizationName} onChange={(e) => update('organizationName', e.target.value)} className={inputStyles} placeholder="Enter organization name" />
                                    </div>
                                    <div>
                                        <label className={labelStyles}>Organization Address</label>
                                        <input type="text" value={params.organizationAddress || ''} onChange={(e) => update('organizationAddress', e.target.value)} className={inputStyles} placeholder="Street address, city, country" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>Headquarters Country</label>
                                    <select value={params.userCountry} onChange={(e) => update('userCountry', e.target.value)} className={inputStyles}>
                                        <option value="">Select Country...</option>
                                        {REGIONS_AND_COUNTRIES.flatMap(r => r.countries).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button onClick={() => openManualModal('Enter Country', 'Country Name', 'userCountry')} className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline">Enter manually</button>
                                </div>
                                <div>
                                    <label className={labelStyles}>Headquarters City</label>
                                    <input type="text" value={params.userCity || ''} onChange={e => update('userCity', e.target.value)} className={inputStyles} placeholder="e.g. Geneva" />
                                    <button onClick={() => openManualModal('Enter City', 'City Name', 'userCity')} className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline">Enter manually</button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>Industry Classification</label>
                                    <select value={params.industryClassification || ''} onChange={(e) => update('industryClassification', e.target.value)} className={inputStyles}>
                                        <option value="">Select Classification...</option>
                                        <option value="Primary">Primary (Agriculture, Mining)</option>
                                        <option value="Secondary">Secondary (Manufacturing)</option>
                                        <option value="Tertiary">Tertiary (Services)</option>
                                        <option value="Quaternary">Quaternary (Information, R&D)</option>
                                        <option value="Quinary">Quinary (High-level Services)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyles}>Organization Size</label>
                                    <select value={params.organizationSize || ''} onChange={(e) => update('organizationSize', e.target.value)} className={inputStyles}>
                                        <option value="">Select Size...</option>
                                        <option value="1-10">Micro (1-10 employees)</option>
                                        <option value="11-50">Startup (11-50 employees)</option>
                                        <option value="51-250">SMB (51-250 employees)</option>
                                        <option value="251-1000">Mid-Market (251-1,000 employees)</option>
                                        <option value="1001-5000">Large (1,001-5,000 employees)</option>
                                        <option value="5000+">Enterprise (5,000+ employees)</option>
                                        <option value="Government">Government Agency</option>
                                        <option value="Solo">Solo / Individual</option>
                                        <option value="Other">Other (Specify)</option>
                                    </select>
                                    {params.organizationSize === 'Other' && <input type="text" onChange={(e) => update('customOrganizationSize', e.target.value)} className={`${inputStyles} mt-2 bg-yellow-50`} placeholder="Specify organization size..." />}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>Primary Contact Email</label>
                                    <input type="email" value={params.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} className={inputStyles} placeholder="contact@organization.com" />
                                </div>
                                <div>
                                    <label className={labelStyles}>Primary Contact Phone</label>
                                    <input type="tel" value={params.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} className={inputStyles} placeholder="+1 (555) 123-4567" />
                                </div>
                            </div>

                            <div>
                                <label className={labelStyles}>Organization Website</label>
                                <input type="url" value={params.organizationWebsite || ''} onChange={e => update('organizationWebsite', e.target.value)} className={inputStyles} placeholder="https://www.organization.com" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>LinkedIn Profile</label>
                                    <input type="url" value={params.linkedinProfile || ''} onChange={e => update('linkedinProfile', e.target.value)} className={inputStyles} placeholder="https://linkedin.com/company/..." />
                                </div>
                                <div>
                                    <label className={labelStyles}>Twitter Handle</label>
                                    <input type="text" value={params.twitterHandle || ''} onChange={e => update('twitterHandle', e.target.value)} className={inputStyles} placeholder="@organization" />
                                </div>
                            </div>

                            <div>
                                <label className={labelStyles}>Organization Description</label>
                                <textarea value={params.organizationDescription || ''} onChange={e => update('organizationDescription', e.target.value)} className={`${inputStyles} h-24 resize-none`} placeholder="Brief description of your organization, mission, and key activities..." />
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>Secondary Contact Email</label>
                                    <input type="email" value={params.secondaryContactEmail || ''} onChange={e => update('secondaryContactEmail', e.target.value)} className={inputStyles} placeholder="secondary@organization.com" />
                                </div>
                                <div>
                                    <label className={labelStyles}>Secondary Contact Phone</label>
                                    <input type="tel" value={params.secondaryContactPhone || ''} onChange={e => update('secondaryContactPhone', e.target.value)} className={inputStyles} placeholder="+1 (555) 987-6543" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <label className={labelStyles}>Exact Employee Count</label>
                                    <input type="number" value={params.exactEmployeeCount || ''} onChange={e => update('exactEmployeeCount', e.target.value)} className={inputStyles} placeholder="e.g. 1250" />
                                </div>
                                <div>
                                    <label className={labelStyles}>Annual Revenue (USD)</label>
                                    <input type="text" value={params.annualRevenue || ''} onChange={e => update('annualRevenue', e.target.value)} className={inputStyles} placeholder="e.g. $50M" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-stone-100 flex justify-end">
                                <button onClick={() => setStep(2)} disabled={!params.organizationType || !params.userCountry} className="px-8 py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-all shadow-md">Next: Strategy & Deal Architecture &rarr;</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STRATEGY & DEAL ARCHITECTURE */}
                    {step === 2 && renderStrategyAndDealStep()}

                    {/* STEP 3: CALIBRATION */}
                    {step === 3 && (
                        <div className="animate-in fade-in duration-500 space-y-10">
                            <MissionCalibrationStep params={params} onParamsChange={update} />
                            
                            <div className="pt-6 border-t border-stone-100 flex justify-between">
                                <button onClick={() => setStep(2)} className="text-stone-500 hover:text-stone-900 text-sm font-medium">&larr; Back to Strategy</button>
                                <button onClick={() => setStep(4)} className="px-8 py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-all shadow-md">Next: Strategic Intelligence &rarr;</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: STRATEGIC INTELLIGENCE */}
                    {step === 4 && (
                        <div className="animate-in fade-in duration-500 space-y-10">
                            <div className="border-b border-stone-100 pb-6">
                                <h2 className="text-2xl font-bold text-stone-900">Step 4: Strategic Intelligence</h2>
                                <p className="text-stone-500">Define objectives and analytical methodologies. Access 100+ reference deals and partnership intelligence library.</p>
                            </div>

                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                                <MegaMultiSelect 
                                    label="Strategic Objectives (Multi-Select)" 
                                    options={allObjectives}
                                    selected={params.strategicObjectives || []}
                                    onToggle={(val) => toggleArrayItem('strategicObjectives', val)}
                                    placeholder="Search objectives (e.g. Market Entry, Crisis Mitigation)..."
                                />
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm mb-8">
                                <label className="block text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-indigo-600" /> Analytical Lenses</label>
                                <p className="text-sm text-indigo-700 mb-4">Select multiple methodologies for the Nexus Brain. BW Consultant will provide real-time guidance.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        ...STRATEGIC_LENSES,
                                        { id: 'blue_ocean', label: 'Blue Ocean Strategy', desc: 'Create uncontested market space and make the competition irrelevant.' },
                                        { id: 'value_chain', label: 'Value Chain Analysis', desc: 'Analyze activities to understand costs and find a competitive advantage.' },
                                        { id: 'vrio', label: 'VRIO Framework', desc: 'Assess resources for Value, Rarity, Imitability, and Organization.' },
                                        { id: 'scenario_planning', label: 'Scenario Planning', desc: 'Develop flexible long-term plans based on multiple future scenarios.' },
                                        { id: 'real_options', label: 'Real Options Analysis', desc: 'Value flexibility and strategic choices in investment decisions.' },
                                        { id: 'game_theory', label: 'Game Theory', desc: 'Model competitive interactions and predict outcomes.' }
                                    ].sort((a, b) => a.label.localeCompare(b.label))
                                    .map((lens) => (
                                        <button
                                            key={lens.id}
                                            onClick={() => toggleArrayItem('strategicLens', lens.id)}
                                            className={`p-4 rounded-xl border text-left transition-all break-words ${
                                                (params.strategicLens || []).includes(lens.id)
                                                ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                                                : 'bg-white/60 border-indigo-100 hover:bg-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm break-words">{lens.label}</span>
                                                {(params.strategicLens || []).includes(lens.id) && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-2" />}
                                            </div>
                                            <div className="text-xs text-stone-500 break-words">{lens.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between items-center border-t border-stone-100">
                                <button onClick={() => setStep(3)} className="text-stone-500 hover:text-stone-900 text-sm font-medium">&larr; Back to Calibration</button>
                                <button onClick={onComplete} className="px-10 py-4 bg-stone-900 text-white font-bold text-lg rounded-xl hover:bg-stone-800 transition-all shadow-lg transform hover:-translate-y-0.5">
                                    Proceed to 9-Step Guided Intake &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Entry Modal */}
            <ManualInputModal 
                isOpen={manualModal.isOpen}
                title={manualModal.title}
                label={manualModal.label}
                onClose={() => setManualModal(prev => ({ ...prev, isOpen: false }))}
                onSave={(val) => handleManualEntry(manualModal.field, val)}
            />
        </div>
    );
};

