import React, { useState } from 'react';
import { Briefcase, Search, Filter, MapPin, TrendingUp, Building2, DollarSign, Zap } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  type: 'Government Incentive' | 'Partnership Opportunity' | 'Property Listing' | 'Acquisition Target' | 'Special Program';
  country: string;
  sector: string;
  value: string;
  description: string;
  deadline?: string;
  terms: string[];
  contact?: string;
  tags: string[];
}

const DealMarketplace: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const deals: Deal[] = [
    // GOVERNMENT INCENTIVES
    {
      id: 'inc-1',
      title: 'Vietnam FDI Tax Holiday Program',
      type: 'Government Incentive',
      country: 'Vietnam',
      sector: 'Manufacturing',
      value: 'Up to 15 years tax exemption',
      description: 'Foreign Direct Investment tax exemption for manufacturing projects in high-priority sectors including semiconductors, electronics, and automotive',
      deadline: '2026-12-31',
      terms: ['Min $5M investment', 'High-tech focus', 'Export-oriented', 'Job creation targets'],
      tags: ['FDI', 'Tax', 'Manufacturing']
    },
    {
      id: 'inc-2',
      title: 'Poland EU R&D Grant Program',
      country: 'Poland',
      type: 'Government Incentive',
      sector: 'Technology',
      value: '$500k - $2M per project',
      description: 'EU-backed research and development grants for technology companies establishing innovation hubs in Poland',
      deadline: '2025-06-30',
      terms: ['EU co-funding 50%', 'Polish team required', '2-3 year projects', 'IP rights negotiable'],
      tags: ['R&D', 'EU Funds', 'Innovation']
    },
    {
      id: 'inc-3',
      title: 'UAE 100% Foreign Ownership',
      country: 'UAE',
      type: 'Government Incentive',
      sector: 'Multiple',
      value: 'Zero corporate tax + full ownership',
      description: 'Free Zone Authority program allowing 100% foreign ownership in UAE Free Zones with zero corporate tax',
      terms: ['UAE Free Zone', '10-year visa sponsorship', 'No profit repatriation restrictions'],
      tags: ['Ownership', 'Tax', 'Gateway']
    },

    // PARTNERSHIP OPPORTUNITIES
    {
      id: 'part-1',
      title: 'Alibaba Malaysia E-commerce JV',
      type: 'Partnership Opportunity',
      country: 'Malaysia',
      sector: 'E-commerce',
      value: '$20-50M investment',
      description: 'Alibaba seeking JV partner for Southeast Asian e-commerce platform with focus on cross-border logistics',
      deadline: '2025-08-15',
      terms: ['50/50 equity split', 'Alibaba handles tech', 'Partner drives regional biz dev', '5-year minimum commitment'],
      contact: 'partnerships@alibaba.com.my',
      tags: ['Alibaba', 'E-commerce', 'ASEAN']
    },
    {
      id: 'part-2',
      title: 'Samsung Component Supply Partnership',
      type: 'Partnership Opportunity',
      country: 'Vietnam',
      sector: 'Manufacturing',
      value: '$50-150M revenue opportunity',
      description: 'Samsung seeking Tier-1 component suppliers for semiconductor manufacturing facility in Vietnam',
      deadline: '2025-09-30',
      terms: ['ISO 9001 required', 'QA certifications', 'Just-in-time delivery', '3-year supply contracts'],
      contact: 'supply-chain@samsung.vn',
      tags: ['Samsung', 'Semiconductors', 'Supply Chain']
    },

    // PROPERTY LISTINGS
    {
      id: 'prop-1',
      title: 'Bangkok Tech Hub Office Campus',
      type: 'Property Listing',
      country: 'Thailand',
      sector: 'Real Estate',
      value: '$45M or $8k/sqm lease',
      description: '100,000 sqm office campus in Bangkok\'s tech district with built-in fiber connectivity and co-working facilities',
      terms: ['Grade A building', 'LEED certified', '5-year lease terms available', 'Flexible space configurations'],
      tags: ['Office', 'Bangkok', 'Flexibility']
    },
    {
      id: 'prop-2',
      title: 'Hanoi Manufacturing Zone Plot',
      type: 'Property Listing',
      country: 'Vietnam',
      sector: 'Real Estate',
      value: '$15M for 25-hectare plot',
      description: 'Industrial zone plot in Hanoi with utilities, transport links, and government SEZ designation',
      deadline: '2025-07-15',
      terms: ['25 hectares', 'Pre-utilities', 'Road access', 'Government-backed land lease'],
      tags: ['Industrial', 'Vietnam', 'Hanoi']
    },

    // ACQUISITION TARGETS
    {
      id: 'acq-1',
      title: 'Indonesia Logistics Startup Acquisition',
      type: 'Acquisition Target',
      country: 'Indonesia',
      sector: 'Logistics',
      value: '$40-60M valuation',
      description: 'Fast-growing last-mile delivery startup with 2,000+ drivers and 15% monthly growth. Revenue $8M annually.',
      deadline: '2025-12-31',
      terms: ['Series B round ongoing', 'Founder retain stake', 'Management retention required'],
      tags: ['Logistics', 'Indonesia', 'Growth']
    },
    {
      id: 'acq-2',
      title: 'Mexico Manufacturing Plant Acquisition',
      type: 'Acquisition Target',
      country: 'Mexico',
      sector: 'Manufacturing',
      value: '$25M for facility + customer base',
      description: 'USMCA-compliant automotive parts manufacturer with established customer relationships',
      terms: ['USMCA certified', 'ISO 14001 environmental', 'Existing customer contracts', '80% capacity utilization'],
      tags: ['Manufacturing', 'Mexico', 'USMCA']
    },

    // SPECIAL PROGRAMS
    {
      id: 'prog-1',
      title: 'Singapore Accelerator Program',
      type: 'Special Program',
      country: 'Singapore',
      sector: 'Technology',
      value: '$500k grant + $1M venture access',
      description: 'Government-backed accelerator for foreign tech startups establishing R&D centers in Singapore',
      deadline: '2025-05-31',
      terms: ['3-month program', 'Mentorship', 'Demo day + investor connections', 'Tech talent sponsorship'],
      tags: ['Accelerator', 'Singapore', 'Tech']
    },
    {
      id: 'prog-2',
      title: 'India Make-in-India Program',
      type: 'Special Program',
      country: 'India',
      sector: 'Manufacturing',
      value: '5-10% production incentive',
      description: 'PLI (Production-Linked Incentive) scheme offering subsidies for specific manufacturing sectors',
      deadline: '2025-10-31',
      terms: ['Sector-specific (auto, pharma, etc)', 'Incremental production', 'Domestic value-add requirement'],
      tags: ['India', 'Manufacturing', 'Incentive']
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const typeMatch = selectedType === 'all' || deal.type === selectedType;
    const countryMatch = selectedCountry === 'all' || deal.country === selectedCountry;
    const searchMatch = searchTerm === '' || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && countryMatch && searchMatch;
  });

  const dealTypes = ['all', ...new Set(deals.map(d => d.type))];
  const countries = ['all', ...new Set(deals.map(d => d.country))];

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Global Deals & Opportunities Marketplace
          </h2>
          <p className="text-stone-600">
            Discover government incentives, partnerships, properties, acquisition targets, and support programs worldwide
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search deals, keywords, sectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Deal Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
              >
                {dealTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-stone-500">
            Showing {filteredDeals.length} of {deals.length} opportunities
          </div>
        </div>

        {/* DEALS LIST */}
        <div className="grid gap-4">
          {filteredDeals.map(deal => (
            <div
              key={deal.id}
              onClick={() => setSelectedDeal(deal)}
              className="bg-white rounded-lg border border-stone-200 p-4 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      deal.type === 'Government Incentive' ? 'bg-green-100 text-green-800' :
                      deal.type === 'Partnership Opportunity' ? 'bg-blue-100 text-blue-800' :
                      deal.type === 'Property Listing' ? 'bg-yellow-100 text-yellow-800' :
                      deal.type === 'Acquisition Target' ? 'bg-purple-100 text-purple-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {deal.type}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {deal.country}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-1">{deal.title}</h3>
                  <p className="text-sm text-stone-600 mb-3">{deal.description}</p>

                  <div className="flex items-center gap-3 text-sm mb-2">
                    <div className="flex items-center gap-1 text-blue-600 font-bold">
                      <DollarSign className="w-4 h-4" /> {deal.value}
                    </div>
                    <div className="text-stone-500">Sector: {deal.sector}</div>
                    {deal.deadline && <div className="text-red-600 text-xs">Deadline: {deal.deadline}</div>}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {deal.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 whitespace-nowrap">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DETAIL MODAL */}
        {selectedDeal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-stone-200 sticky top-0 bg-white flex items-center justify-between">
                <h2 className="text-2xl font-bold text-stone-900">{selectedDeal.title}</h2>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="text-2xl text-stone-400 hover:text-stone-600"
                >
                  ✗
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Type</div>
                    <div className="text-sm font-bold text-stone-900">{selectedDeal.type}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Value</div>
                    <div className="text-sm font-bold text-blue-600">{selectedDeal.value}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Country</div>
                    <div className="text-sm font-bold text-stone-900">{selectedDeal.country}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">Sector</div>
                    <div className="text-sm font-bold text-stone-900">{selectedDeal.sector}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Description</div>
                  <p className="text-sm text-stone-700">{selectedDeal.description}</p>
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Key Terms</div>
                  <ul className="space-y-1">
                    {selectedDeal.terms.map((term, idx) => (
                      <li key={idx} className="text-sm text-stone-700 pl-5 relative">
                        <span className="absolute left-0">*</span> {term}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedDeal.deadline && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Application Deadline</div>
                    <div className="text-sm font-bold text-red-900">{selectedDeal.deadline}</div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                    Express Interest
                  </button>
                  <button className="flex-1 px-4 py-3 border border-stone-200 rounded-lg font-bold text-stone-700 hover:bg-stone-100">
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealMarketplace;

