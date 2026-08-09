import React, { useState } from 'react';
import { ChevronDown, Plus, X, Building2, Zap, Shield, DollarSign } from 'lucide-react';
import { ReportParameters } from '../types';

interface EntityProfile {
  legalName: string;
  organizationType: string;
  country: string;
  yearFounded: number;
  headcount: number;
  revenueUSD: number;
  operatingMarkets: string[];
  coreBusiness: string;
  strategicAssets: string[];
  leverage: string[];
  financialCapacity: string;
  operationalCapabilities: string[];
  ipPatents: string[];
  realEstate: string[];
  keyRelationships: string[];
  marketPosition: string;
  teamExpertise: string[];
  creditRating?: string;
  customFields: Record<string, any>;
}

interface EntityDefinitionBuilderProps {
  onEntityDefined: (entity: EntityProfile) => void;
  initialEntity?: EntityProfile;
}

const EntityDefinitionBuilder: React.FC<EntityDefinitionBuilderProps> = ({ onEntityDefined, initialEntity }) => {
  const [entity, setEntity] = useState<EntityProfile>(initialEntity || {
    legalName: '',
    organizationType: '',
    country: '',
    yearFounded: new Date().getFullYear(),
    headcount: 0,
    revenueUSD: 0,
    operatingMarkets: [],
    coreBusiness: '',
    strategicAssets: [],
    leverage: [],
    financialCapacity: '',
    operationalCapabilities: [],
    ipPatents: [],
    realEstate: [],
    keyRelationships: [],
    marketPosition: '',
    teamExpertise: [],
    customFields: {}
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    financials: false,
    assets: false,
    leverage: false,
    capabilities: false,
    relationships: false,
    custom: false
  });

  const [newAsset, setNewAsset] = useState<Record<string, string>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addToArray = (field: keyof EntityProfile, value: string) => {
    if (Array.isArray(entity[field]) && value.trim()) {
      setEntity(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: keyof EntityProfile, index: number) => {
    if (Array.isArray(entity[field])) {
      setEntity(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const updateField = (field: keyof EntityProfile, value: any) => {
    setEntity(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onEntityDefined(entity);
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        
        {/* IDENTITY SECTION */}
        <div className="border-b border-stone-200">
          <button
            onClick={() => toggleSection('identity')}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-stone-900">01. Organization Identity</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.identity ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.identity && (
            <div className="p-6 bg-stone-50 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Legal Entity Name *</label>
                  <input
                    type="text"
                    value={entity.legalName}
                    onChange={(e) => updateField('legalName', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                    placeholder="Full legal name as registered"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Organization Type *</label>
                  <select
                    value={entity.organizationType}
                    onChange={(e) => updateField('organizationType', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="">Select type...</option>
                    <option value="Corporate">Corporate / Private</option>
                    <option value="Government">Government / Ministry</option>
                    <option value="NGO">NGO / Non-Profit</option>
                    <option value="Sovereign">Sovereign Wealth Fund</option>
                    <option value="Fund">Investment Fund</option>
                    <option value="Startup">Startup / Scaleup</option>
                    <option value="Consortium">Consortium / Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Country of Registration *</label>
                  <input
                    type="text"
                    value={entity.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="Country"
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Year Founded</label>
                  <input
                    type="number"
                    value={entity.yearFounded}
                    onChange={(e) => updateField('yearFounded', parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Core Business / Mission</label>
                <textarea
                  value={entity.coreBusiness}
                  onChange={(e) => updateField('coreBusiness', e.target.value)}
                  placeholder="What do you do? What is your core value proposition?"
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none h-16"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Headcount</label>
                  <input
                    type="number"
                    value={entity.headcount}
                    onChange={(e) => updateField('headcount', parseInt(e.target.value))}
                    placeholder="Total employees"
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Annual Revenue (USD)</label>
                  <input
                    type="number"
                    value={entity.revenueUSD}
                    onChange={(e) => updateField('revenueUSD', parseInt(e.target.value))}
                    placeholder="0"
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Operating Markets (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-market"
                    placeholder="e.g., Vietnam, Singapore, Germany"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-market') as HTMLInputElement;
                      if (input.value) {
                        addToArray('operatingMarkets', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entity.operatingMarkets.map((market, idx) => (
                    <div key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-2">
                      {market}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('operatingMarkets', idx)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Market Position</label>
                <select
                  value={entity.marketPosition}
                  onChange={(e) => updateField('marketPosition', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Market Leader">Market Leader (Top 3 in segment)</option>
                  <option value="Strong Player">Strong Player (Mid-tier)</option>
                  <option value="Growing">Growing / Challenger</option>
                  <option value="New Entrant">New Entrant / Startup</option>
                  <option value="Niche">Niche / Specialist</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* FINANCIAL CAPACITY SECTION */}
        <div className="border-b border-stone-200">
          <button
            onClick={() => toggleSection('financials')}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-bold text-stone-900">02. Financial Capacity & Resources</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.financials ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.financials && (
            <div className="p-6 bg-stone-50 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Financial Capacity</label>
                <select
                  value={entity.financialCapacity}
                  onChange={(e) => updateField('financialCapacity', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="<$10M">Under $10M (Bootstrap)</option>
                  <option value="$10-50M">$10M - $50M</option>
                  <option value="$50-100M">$50M - $100M</option>
                  <option value="$100-500M">$100M - $500M</option>
                  <option value="$500M-1B">$500M - $1B</option>
                  <option value=">$1B">Over $1B (Enterprise)</option>
                  <option value="Unlimited">Unlimited (Sovereign/Fund)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Credit Rating (if available)</label>
                <input
                  type="text"
                  value={entity.creditRating || ''}
                  onChange={(e) => updateField('creditRating', e.target.value)}
                  placeholder="e.g., A+, B-, Unrated"
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Funding Sources / Composition</label>
                <textarea
                  placeholder="Internal cashflow / Debt / Equity / Grants / Government / Other"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none h-16"
                />
              </div>
            </div>
          )}
        </div>

        {/* STRATEGIC ASSETS SECTION */}
        <div className="border-b border-stone-200">
          <button
            onClick={() => toggleSection('assets')}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-stone-900">03. Strategic Assets & IP</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.assets ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.assets && (
            <div className="p-6 bg-stone-50 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">IP & Patents (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-patent"
                    placeholder="e.g., Patent US#12345, Trademark, Trade Secret"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-patent') as HTMLInputElement;
                      if (input.value) {
                        addToArray('ipPatents', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {entity.ipPatents.map((ip, idx) => (
                    <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{ip}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('ipPatents', idx)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Real Estate & Facilities (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-property"
                    placeholder="e.g., HQ in Singapore (50k sqft), Factory in Vietnam"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-property') as HTMLInputElement;
                      if (input.value) {
                        addToArray('realEstate', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {entity.realEstate.map((property, idx) => (
                    <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{property}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('realEstate', idx)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Operational Capabilities (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-capability"
                    placeholder="e.g., Supply chain logistics, AI research, Manufacturing at scale"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-capability') as HTMLInputElement;
                      if (input.value) {
                        addToArray('operationalCapabilities', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entity.operationalCapabilities.map((cap, idx) => (
                    <div key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                      {cap}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('operationalCapabilities', idx)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LEVERAGE & RELATIONSHIPS SECTION */}
        <div className="border-b border-stone-200">
          <button
            onClick={() => toggleSection('leverage')}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-stone-900">04. Leverage Points & Relationships</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.leverage ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.leverage && (
            <div className="p-6 bg-stone-50 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Leverage Points (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-leverage"
                    placeholder="e.g., Government backing, First-mover advantage, Proprietary technology"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-leverage') as HTMLInputElement;
                      if (input.value) {
                        addToArray('leverage', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {entity.leverage.map((lev, idx) => (
                    <div key={idx} className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{lev}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('leverage', idx)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Key Strategic Relationships (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-relationship"
                    placeholder="e.g., Partner with Singapore Government, JV with Alibaba, Distribution via DHL"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-relationship') as HTMLInputElement;
                      if (input.value) {
                        addToArray('keyRelationships', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {entity.keyRelationships.map((rel, idx) => (
                    <div key={idx} className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{rel}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('keyRelationships', idx)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Team Expertise (Add)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="new-expertise"
                    placeholder="e.g., 20 years in semiconductors, AI PhD holders, Former Samsung executives"
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('new-expertise') as HTMLInputElement;
                      if (input.value) {
                        addToArray('teamExpertise', input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {entity.teamExpertise.map((exp, idx) => (
                    <div key={idx} className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs flex items-center justify-between">
                      <span>{exp}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray('teamExpertise', idx)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Save Entity Profile
          </button>
          <button className="px-6 py-3 border border-stone-200 rounded-lg font-bold text-stone-700 hover:bg-stone-100 transition-colors">
            Preview as Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntityDefinitionBuilder;

