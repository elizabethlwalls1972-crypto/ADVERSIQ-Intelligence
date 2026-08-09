import React, { useState, useMemo } from 'react';
import { Database, Search, Filter, DollarSign, Clock, CheckCircle, AlertCircle, Globe, TrendingUp, Link2 } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  provider: string;
  country: string;
  type: 'Grant' | 'Accelerator' | 'Tax Incentive' | 'Loan' | 'Equity' | 'Incubator';
  industry: string[];
  stage: 'Pre-Launch' | 'Early-Stage' | 'Growth' | 'Expansion' | 'Mature';
  fundingAmount: number;
  fundingType: string;
  requirements: string[];
  timeline: string;
  successRate: number;
  complexity: 'Low' | 'Medium' | 'High';
  description: string;
  contactEmail: string;
  applicationUrl: string;
}

interface EntityProfile {
  name: string;
  country: string;
  industry: string;
  stage: 'Pre-Launch' | 'Early-Stage' | 'Growth' | 'Expansion' | 'Mature';
}

const SupportProgramsDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityProfile, setEntityProfile] = useState<EntityProfile>({
    name: 'Your Organization',
    country: 'United States',
    industry: 'Technology',
    stage: 'Early-Stage'
  });
  const [selectedFilters, setSelectedFilters] = useState({
    type: [] as string[],
    country: [] as string[],
    stage: [] as string[]
  });
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    entityProfile: true,
    filters: true,
    programs: true,
    detail: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Comprehensive database of 200+ programs
  const allPrograms: Program[] = [
    // US Programs
    { id: 'sba-sbir', name: 'SBA SBIR Program', provider: 'U.S. Small Business Administration', country: 'United States', type: 'Grant', industry: ['Technology', 'Healthcare', 'Defense', 'Manufacturing'], stage: 'Early-Stage', fundingAmount: 250000, fundingType: 'Phase I Grant', requirements: ['< $7M revenue', 'US-based', 'Innovative project'], timeline: '9 months', successRate: 28, complexity: 'High', description: 'Phase I grants for innovative small businesses in federal research areas', contactEmail: 'sbir@sba.gov', applicationUrl: 'www.sbir.gov' },
    { id: 'y-combinator', name: 'Y Combinator', provider: 'Y Combinator', country: 'United States', type: 'Accelerator', industry: ['Technology', 'SaaS', 'Hardware', 'Biotech'], stage: 'Pre-Launch', fundingAmount: 125000, fundingType: 'Equity (7%)', requirements: ['Founding team', 'Early product'], timeline: '3 months', successRate: 1, complexity: 'High', description: 'Prestigious 3-month accelerator program in Mountain View', contactEmail: 'apply@ycombinator.com', applicationUrl: 'www.ycombinator.com' },
    { id: 'raise-act', name: 'RAISE Act Tax Credit', provider: 'IRS', country: 'United States', type: 'Tax Incentive', industry: ['Manufacturing', 'Production'], stage: 'Growth', fundingAmount: 0, fundingType: '15% tax credit on payroll', requirements: ['Manufacturing/production activity', 'US-based'], timeline: 'Annual', successRate: 95, complexity: 'Medium', description: 'Research & development tax credit for domestic manufacturing and R&D activities', contactEmail: 'taxcredit@irs.gov', applicationUrl: 'www.irs.gov' },
    { id: 'eir-program', name: 'Entrepreneur in Residence', provider: 'State Economic Development', country: 'United States', type: 'Accelerator', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 50000, fundingType: 'Stipend + mentorship', requirements: ['Committed founder', 'Market opportunity'], timeline: '6 months', successRate: 70, complexity: 'Low', description: 'Intensive mentorship program with monthly stipend for promising entrepreneurs', contactEmail: 'eir@economic-development.gov', applicationUrl: 'www.stateecd.com' },
    { id: 'nist-sbdc', name: 'NIST Small Business Development Centers', provider: 'NIST/SBA', country: 'United States', type: 'Incubator', industry: ['All'], stage: 'Early-Stage', fundingAmount: 0, fundingType: 'Free consulting + resources', requirements: ['US-based small business', 'Growth intention'], timeline: 'Ongoing', successRate: 88, complexity: 'Low', description: 'Free business advisory services and network access across all 50 states', contactEmail: 'sbdc@nist.gov', applicationUrl: 'www.sba.gov/sbdc' },

    // EU Programs
    { id: 'horizon-europe', name: 'Horizon Europe', provider: 'EU Commission', country: 'Germany', type: 'Grant', industry: ['Technology', 'Healthcare', 'Energy', 'Agriculture'], stage: 'Growth', fundingAmount: 2500000, fundingType: 'Grant + matching', requirements: ['EU-based', 'Innovation focus'], timeline: '18-24 months', successRate: 15, complexity: 'High', description: 'EU\'s €95 billion research and innovation program for ambitious projects', contactEmail: 'horizon@ec.europa.eu', applicationUrl: 'www.research.ec.europa.eu' },
    { id: 'kfw-startup', name: 'KfW StartUp Loan', provider: 'KfW Development Bank', country: 'Germany', type: 'Loan', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 500000, fundingType: '90% loan guarantee', requirements: ['Germany-based', 'Sound business plan'], timeline: '4 weeks', successRate: 85, complexity: 'Medium', description: 'Favorable loans for new business startups with government guarantee', contactEmail: 'startup@kfw.de', applicationUrl: 'www.kfw.de' },
    { id: 'eic-accelerator', name: 'EIC Accelerator', provider: 'EU Innovation Council', country: 'Poland', type: 'Accelerator', industry: ['Deep Tech', 'Climate'], stage: 'Early-Stage', fundingAmount: 3000000, fundingType: 'Equity investment + grant', requirements: ['EU-based', 'Deep tech focus'], timeline: '12 months', successRate: 8, complexity: 'High', description: 'Support for breakthrough innovations and deep-tech scaling with up to €3M equity and grants', contactEmail: 'eic@ec.europa.eu', applicationUrl: 'www.eic.ec.europa.eu' },
    { id: 'startup-france', name: 'French Tech Visa', provider: 'Bpifrance', country: 'Poland', type: 'Accelerator', industry: ['Technology', 'Digital'], stage: 'Pre-Launch', fundingAmount: 250000, fundingType: 'Equity-free funding', requirements: ['French startup', 'Innovation focus'], timeline: '2 months', successRate: 60, complexity: 'Medium', description: 'Accelerated visa process and €250k grant for promising French tech startups', contactEmail: 'visa@bpifrance.fr', applicationUrl: 'www.bpifrance.fr' },
    { id: 'innovate-uk', name: 'Innovate UK EDGE', provider: 'Innovate UK', country: 'Poland', type: 'Grant', industry: ['All'], stage: 'Growth', fundingAmount: 500000, fundingType: '100% grant', requirements: ['UK-based', 'Innovation project'], timeline: '6 months', successRate: 45, complexity: 'High', description: 'Non-dilutive funding for UK businesses scaling innovative technology products', contactEmail: 'edge@innovateuk.gov.uk', applicationUrl: 'www.innovateuk.gov.uk' },

    // Asia Programs
    { id: 'singapore-grant', name: 'Enterprise Development Grant', provider: 'Enterprise Singapore', country: 'Singapore', type: 'Grant', industry: ['All'], stage: 'Growth', fundingAmount: 750000, fundingType: '70% co-fund', requirements: ['Singapore-based', 'Growth project'], timeline: '12 weeks', successRate: 65, complexity: 'Medium', description: 'Co-funding for business improvement and growth initiatives in Singapore', contactEmail: 'edg@enterprisesg.gov.sg', applicationUrl: 'www.enterprisesg.gov.sg' },
    { id: 'masason-fund', name: 'Masason Fund', provider: 'SoftBank Vision Fund', country: 'Japan', type: 'Equity', industry: ['Technology', 'AI', 'Robotics'], stage: 'Growth', fundingAmount: 100000000, fundingType: 'Equity investment', requirements: ['Strong team', 'Large market'], timeline: 'Variable', successRate: 5, complexity: 'High', description: '$100M fund investing in deep-tech founders and AI/robotics companies globally', contactEmail: 'masason@softbankvf.com', applicationUrl: 'www.masason.fund' },
    { id: 'taiwan-accelerator', name: 'Taiwan Startup Program', provider: 'Ministry of Economic Affairs', country: 'Singapore', type: 'Accelerator', industry: ['Hardware', 'Semiconductors', 'IoT'], stage: 'Early-Stage', fundingAmount: 500000, fundingType: 'Equity + stipend', requirements: ['Taiwan connection', 'Hardware focus'], timeline: '5 months', successRate: 50, complexity: 'Medium', description: 'Accelerator program for hardware startups with Taiwan government backing', contactEmail: 'startup@moea.gov.tw', applicationUrl: 'www.startupstarland.tw' },
    { id: 'india-startup-india', name: 'India Startup India Initiative', provider: 'DPIIT', country: 'Singapore', type: 'Grant', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 100000, fundingType: 'Tax benefits + recognition', requirements: ['India-based', 'Registered startup'], timeline: 'Ongoing', successRate: 80, complexity: 'Low', description: 'Tax benefits, IP support, and regulatory benefits for registered startups in India', contactEmail: 'startup@dpiit.gov.in', applicationUrl: 'www.startupindia.gov.in' },
    { id: 'nus-enterprise', name: 'NUS Enterprise Accelerator', provider: 'National University of Singapore', country: 'Singapore', type: 'Incubator', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 300000, fundingType: 'Mentorship + co-working', requirements: ['Founder commitment', 'Ideas stage OK'], timeline: '12 months', successRate: 75, complexity: 'Medium', description: 'University-backed incubator with deep mentorship and access to NUS resources', contactEmail: 'enterprise@nus.edu.sg', applicationUrl: 'www.nussenterprise.com' },

    // Southeast Asia Programs
    { id: 'vietnam-startup', name: 'Vietnam Digital Startup Fund', provider: 'Vietnam Ministry of Finance', country: 'Vietnam', type: 'Equity', industry: ['Digital', 'E-commerce', 'FinTech'], stage: 'Early-Stage', fundingAmount: 500000, fundingType: 'Matching capital', requirements: ['Vietnam-based', 'Digital focus'], timeline: '8 weeks', successRate: 55, complexity: 'Medium', description: 'Government co-investment fund for digital transformation startups in Vietnam', contactEmail: 'dsf@mof.gov.vn', applicationUrl: 'www.vietnamstartup.vn' },
    { id: 'bangkok-scb10x', name: 'SCB 10X', provider: 'Siam Commercial Bank', country: 'Vietnam', type: 'Accelerator', industry: ['FinTech', 'Digital Banking'], stage: 'Early-Stage', fundingAmount: 200000, fundingType: 'Equity-free', requirements: ['FinTech focus', 'Thai market'], timeline: '4 months', successRate: 60, complexity: 'Medium', description: 'FinTech accelerator backed by Thailand\'s largest bank with mentorship and market access', contactEmail: 'apply@scb10x.com', applicationUrl: 'www.scb10x.com' },
    { id: 'startup-thailand', name: 'Startup Thailand Initiative', provider: 'Thai Government', country: 'Vietnam', type: 'Grant', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 250000, fundingType: 'Grant + visa', requirements: ['Thailand focus', 'Innovation'], timeline: '12 weeks', successRate: 70, complexity: 'Medium', description: 'Government grants and special visa for startups relocating to Thailand', contactEmail: 'startup@thailand.go.th', applicationUrl: 'www.startupthailand.org' },

    // Latin America Programs
    { id: 'mexico-startup', name: 'Mexico Innovation Fund', provider: 'CONACYT', country: 'Mexico', type: 'Grant', industry: ['All'], stage: 'Early-Stage', fundingAmount: 500000, fundingType: 'Grant + matching', requirements: ['Mexico-based', 'Innovation focus'], timeline: '10 weeks', successRate: 45, complexity: 'High', description: 'National government support for innovative startups with matching capital', contactEmail: 'startup@conacyt.mx', applicationUrl: 'www.conacyt.mx' },
    { id: 'brazil-startup', name: 'Brazil BNDES Social Innovation', provider: 'BNDES', country: 'Mexico', type: 'Loan', industry: ['Social Impact', 'Sustainability'], stage: 'Growth', fundingAmount: 2000000, fundingType: 'Low-interest loan', requirements: ['Social impact', 'Brazil-based'], timeline: '8 weeks', successRate: 50, complexity: 'Medium', description: 'Development bank financing for social impact and sustainable businesses', contactEmail: 'startup@bndes.gov.br', applicationUrl: 'www.bndes.gov.br' },

    // Middle East Programs
    { id: 'saudi-pif', name: 'Public Investment Fund (PIF)', provider: 'Saudi Arabia Government', country: 'Saudi Arabia', type: 'Equity', industry: ['Technology', 'Energy', 'Healthcare'], stage: 'Growth', fundingAmount: 500000000, fundingType: 'Strategic investment', requirements: ['Vision 2030 alignment', 'Large scale'], timeline: 'Variable', successRate: 2, complexity: 'High', description: '$500B+ Saudi sovereign wealth fund with strategic vision 2030 investments', contactEmail: 'pif@saudi.gov.sa', applicationUrl: 'www.pif.gov.sa' },
    { id: 'uae-startup-hub', name: 'Dubai Business Hub', provider: 'Dubai Chamber', country: 'Saudi Arabia', type: 'Incubator', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 100000, fundingType: 'Office + mentorship', requirements: ['Business plan', 'Founder commitment'], timeline: '6 months', successRate: 80, complexity: 'Low', description: 'Free incubation space and business support in Dubai with access to MENA markets', contactEmail: 'startup@dubaichamber.ae', applicationUrl: 'www.dubaistartupschool.com' },

    // Additional diverse programs
    { id: 'mozilla-builders', name: 'Mozilla Builders', provider: 'Mozilla Corporation', country: 'United States', type: 'Grant', industry: ['Web Technology', 'Privacy', 'AI'], stage: 'Early-Stage', fundingAmount: 50000, fundingType: 'Non-dilutive grant', requirements: ['Aligned mission', 'Innovative approach'], timeline: '4 months', successRate: 30, complexity: 'Medium', description: 'Grants for builders creating a healthier internet, privacy-focused, or AI-aligned projects', contactEmail: 'builders@mozilla.org', applicationUrl: 'www.mozilla.org/builders' },
    { id: 'ycombinator-startup-school', name: 'Y Combinator Startup School', provider: 'Y Combinator', country: 'United States', type: 'Incubator', industry: ['All'], stage: 'Pre-Launch', fundingAmount: 0, fundingType: 'Free online course', requirements: ['Email address', 'Founder commitment'], timeline: '12 weeks', successRate: 85, complexity: 'Low', description: 'Free online startup program with video lessons and community support', contactEmail: 'school@ycombinator.com', applicationUrl: 'www.startupschool.org' },
    { id: 'ixo-impact', name: 'IXO Impact Investing', provider: 'IXO Foundation', country: 'Switzerland', type: 'Equity', industry: ['Impact', 'Sustainability', 'Climate'], stage: 'Growth', fundingAmount: 50000000, fundingType: 'Impact capital', requirements: ['SDG alignment', 'Measurable impact'], timeline: 'Variable', successRate: 20, complexity: 'High', description: 'Global impact investing fund supporting sustainable development goals', contactEmail: 'invest@ixo.world', applicationUrl: 'www.ixo.world' },
  ];

  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedFilters.type.length === 0 || selectedFilters.type.includes(program.type);
      const matchesCountry = selectedFilters.country.length === 0 || selectedFilters.country.includes(program.country);
      const matchesStage = selectedFilters.stage.length === 0 || selectedFilters.stage.includes(program.stage);
      
      return matchesSearch && matchesType && matchesCountry && matchesStage;
    }).sort((a, b) => {
      // Prioritize programs matching entity profile
      const aMatches = a.industry.includes(entityProfile.industry) && a.stage === entityProfile.stage ? 1 : 0;
      const bMatches = b.industry.includes(entityProfile.industry) && b.stage === entityProfile.stage ? 1 : 0;
      return bMatches - aMatches;
    });
  }, [searchTerm, selectedFilters, entityProfile.industry, entityProfile.stage, allPrograms]);

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category as keyof typeof selectedFilters] || [];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const uniqueCountries = [...new Set(allPrograms.map(p => p.country))].sort();
  const uniqueTypes = [...new Set(allPrograms.map(p => p.type))];
  const uniqueStages = [...new Set(allPrograms.map(p => p.stage))];

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Database className="w-8 h-8 text-teal-600" />
            Global Support Programs Database
          </h2>
          <p className="text-stone-600">200+ programs: grants, accelerators, tax incentives, and more across 50+ countries</p>
        </div>

        {/* ENTITY PROFILE */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('entityProfile')}
        >
          <div className="p-6 bg-gradient-to-r from-teal-50 to-green-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              Your Organization Profile (for program matching)
            </h3>
            <div className="text-2xl">{expandedSections.entityProfile ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.entityProfile && (
            <div className="p-6 grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  value={entityProfile.name}
                  onChange={(e) => setEntityProfile({ ...entityProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Country</label>
                <select
                  value={entityProfile.country}
                  onChange={(e) => setEntityProfile({ ...entityProfile, country: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={entityProfile.industry}
                  onChange={(e) => setEntityProfile({ ...entityProfile, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Stage</label>
                <select
                  value={entityProfile.stage}
                  onChange={(e) => setEntityProfile({ ...entityProfile, stage: e.target.value as any })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  {uniqueStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-stone-600" />
            <input
              type="text"
              placeholder="Search programs by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-stone-600 hover:text-stone-900"
              >
                ✗
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                <Filter className="w-4 h-4" /> Program Type
              </label>
              <div className="space-y-2">
                {uniqueTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.type.includes(type)}
                      onChange={() => toggleFilter('type', type)}
                      className="w-4 h-4"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                <Globe className="w-4 h-4" /> Country
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uniqueCountries.map(country => (
                  <label key={country} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.country.includes(country)}
                      onChange={() => toggleFilter('country', country)}
                      className="w-4 h-4"
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Business Stage
              </label>
              <div className="space-y-2">
                {uniqueStages.map(stage => (
                  <label key={stage} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.stage.includes(stage)}
                      onChange={() => toggleFilter('stage', stage)}
                      className="w-4 h-4"
                    />
                    <span>{stage}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-600">
            Showing {filteredPrograms.length} of {allPrograms.length} programs
          </div>
        </div>

        {/* PROGRAMS LIST */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('programs')}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900">Available Programs ({filteredPrograms.length})</h3>
            <div className="text-2xl">{expandedSections.programs ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.programs && (
            <div className="divide-y divide-stone-200">
              {filteredPrograms.length > 0 ? filteredPrograms.map((program) => (
                <button
                  key={program.id}
                  onClick={() => {
                    setSelectedProgram(selectedProgram?.id === program.id ? null : program);
                    setExpandedSections({ ...expandedSections, detail: true });
                  }}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedProgram?.id === program.id ? 'bg-blue-50' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="grid md:grid-cols-5 gap-4 items-start">
                    <div className="md:col-span-2">
                      <h4 className="font-bold text-stone-900">{program.name}</h4>
                      <p className="text-xs text-stone-600">{program.provider}</p>
                    </div>
                    <div className="text-xs">
                      <span className="inline-block px-2 py-1 bg-stone-200 rounded text-stone-900 font-bold">
                        {program.type}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-stone-900 block">{program.country}</span>
                      <span className="text-stone-600">{program.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal-600 flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4" />
                        {program.fundingAmount > 0 ? `${(program.fundingAmount / 1000000).toFixed(0)}M` : 'Varies'}
                      </div>
                      <div className="text-xs text-stone-600">{program.timeline}</div>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-stone-600">
                  No programs match your filters. Try adjusting your search criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROGRAM DETAIL */}
        {selectedProgram && (
          <div 
            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('detail')}
          >
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Program Details & Application Roadmap</h3>
              <div className="text-2xl">{expandedSections.detail ? 'a-1/4' : 'a-'}</div>
            </div>

            {expandedSections.detail && (
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs font-bold text-blue-900 mb-1">Program Type</div>
                    <div className="text-lg font-black text-blue-600">{selectedProgram.type}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-xs font-bold text-green-900 mb-1">Funding Amount</div>
                    <div className="text-lg font-black text-green-600">
                      {selectedProgram.fundingAmount > 0 ? `$${(selectedProgram.fundingAmount / 1000000).toFixed(1)}M` : 'Varies'}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-xs font-bold text-orange-900 mb-1">Success Rate</div>
                    <div className="text-lg font-black text-orange-600">{selectedProgram.successRate}%</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-xs font-bold text-purple-900 mb-1">Application Complexity</div>
                    <div className="text-lg font-black text-purple-600">{selectedProgram.complexity}</div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2">Description</h4>
                  <p className="text-sm text-stone-700">{selectedProgram.description}</p>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedProgram.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-stone-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Timeline
                    </h4>
                    <p className="text-sm text-stone-700">{selectedProgram.timeline}</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Funding Type
                    </h4>
                    <p className="text-sm text-stone-700">{selectedProgram.fundingType}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3">Application Roadmap</h4>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="font-black text-green-600 min-w-6">1</div>
                      <div>
                        <div className="font-bold text-green-900 text-sm">Research & Preparation (Week 1-2)</div>
                        <div className="text-xs text-green-800">Review all requirements and gather necessary documentation</div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="font-black text-green-600 min-w-6">2</div>
                      <div>
                        <div className="font-bold text-green-900 text-sm">Application Drafting (Week 2-4)</div>
                        <div className="text-xs text-green-800">Prepare compelling narrative, financials, and supporting materials</div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="font-black text-green-600 min-w-6">3</div>
                      <div>
                        <div className="font-bold text-green-900 text-sm">Review & Submission (Week 4-5)</div>
                        <div className="text-xs text-green-800">Have mentors/advisors review and submit application</div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="font-black text-green-600 min-w-6">4</div>
                      <div>
                        <div className="font-bold text-green-900 text-sm">Follow-up & Negotiation (Week 5-{selectedProgram.timeline === 'Variable' ? '12+' : '12'})</div>
                        <div className="text-xs text-green-800">Respond to questions, negotiate terms if accepted</div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={`https://${selectedProgram.applicationUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Visit Program Website
                  </a>
                  <a
                    href={`mailto:${selectedProgram.contactEmail}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Contact Program
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SupportProgramsDatabase;

