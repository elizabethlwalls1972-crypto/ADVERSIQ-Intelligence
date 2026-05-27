import React, { useState, useMemo } from 'react';
import { Archive, TrendingUp, TrendingDown, PieChart, BarChart3, AlertCircle, CheckCircle, Star, Filter, Download, Eye } from 'lucide-react';

interface PartnershipRecord {
  id: string;
  name: string;
  country: string;
  industry: string;
  dateInitiated: Date;
  dateCompleted?: Date;
  status: 'Active' | 'Completed' | 'Failed' | 'Dormant';
  outcome: 'Success' | 'Moderate' | 'Underperforming' | 'Failed';
  investmentAmount: number;
  actualRevenue: number;
  projectedRevenue: number;
  keyMetrics: {
    profitability: number;
    reliability: number;
    scalability: number;
    culturalFit: number;
  };
  lessonsLearned: string[];
  keySuccessFactors: string[];
  failureReasons?: string[];
  nextSteps: string;
  rating: number;
  notes: string;
}

const PartnershipRepository: React.FC = () => {
  const [partnerships, setPartnerships] = useState<PartnershipRecord[]>([
    {
      id: 'p1',
      name: 'Vietnam Manufacturing Hub',
      country: 'Vietnam',
      industry: 'Manufacturing',
      dateInitiated: new Date('2022-03-15'),
      dateCompleted: new Date('2024-06-30'),
      status: 'Completed',
      outcome: 'Success',
      investmentAmount: 2500000,
      actualRevenue: 8750000,
      projectedRevenue: 7500000,
      keyMetrics: {
        profitability: 92,
        reliability: 88,
        scalability: 85,
        culturalFit: 82
      },
      lessonsLearned: [
        'Relationship-building takes 6+ months; respect hierarchical decision-making',
        'Local government relationships critical; invest in institutional ties early',
        'Currency volatility impacted margins by 5-8%; hedge USD exposure',
        'Hire a local COO with 10+ years experience in the market'
      ],
      keySuccessFactors: [
        'Regular in-person visits by C-suite executives (quarterly minimum)',
        'Clear ROI targets shared from month 1; transparent communication',
        'Dedicated legal team familiar with Vietnamese corporate law',
        'Patience with bureaucratic processes; planned for 30-60 day delays'
      ],
      nextSteps: 'Scale to 2 additional production lines; expand into Cambodia',
      rating: 9,
      notes: 'Exceeded revenue targets by 16%. Partner became a trusted strategic ally.'
    },
    {
      id: 'p2',
      name: 'India Tech Services (Failed)',
      country: 'India',
      industry: 'Technology Services',
      dateInitiated: new Date('2021-11-20'),
      dateCompleted: new Date('2023-08-15'),
      status: 'Failed',
      outcome: 'Failed',
      investmentAmount: 1800000,
      actualRevenue: 420000,
      projectedRevenue: 3600000,
      keyMetrics: {
        profitability: 18,
        reliability: 35,
        scalability: 12,
        culturalFit: 28
      },
      lessonsLearned: [
        'Due diligence was insufficient; partner had undisclosed debts',
        'Onboarding too rapid; jumped to execution before establishing trust',
        'Communication gaps led to misaligned expectations',
        'Local labor practices were exploitative; reputational risk materialized'
      ],
      keySuccessFactors: [],
      failureReasons: [
        'Partner overstated technical capabilities by 40-50%',
        'Local team turnover exceeded 60% annually',
        'Quality issues went unaddressed for 6 months before escalation',
        'Partner refused to implement recommended governance structures'
      ],
      nextSteps: 'Managed exit completed. Learning: stronger reference checks required.',
      rating: 2,
      notes: 'Total loss. Recovered ~12% through asset sale. Do not re-engage.'
    },
    {
      id: 'p3',
      name: 'Poland Tech Development',
      country: 'Poland',
      industry: 'Technology',
      dateInitiated: new Date('2023-04-10'),
      dateCompleted: undefined,
      status: 'Active',
      outcome: 'Success',
      investmentAmount: 3200000,
      actualRevenue: 2100000,
      projectedRevenue: 4800000,
      keyMetrics: {
        profitability: 78,
        reliability: 85,
        scalability: 88,
        culturalFit: 92
      },
      lessonsLearned: [
        'EU partners respect structured contracts; invest in legal documentation',
        'Team stability is excellent; 95%+ retention over 18 months',
        'Structured process culture aligns well with operations'
      ],
      keySuccessFactors: [
        'Matched organizational cultures; both data-driven and process-oriented',
        'Clear milestones and KPIs established in month 1; reviewed monthly',
        'Invested in partner team development; sent 5 key people for training'
      ],
      nextSteps: 'Expanding development team by 30%; exploring R&D center opportunity',
      rating: 8,
      notes: 'On track. Partnership is maturing well. Strong potential for long-term growth.'
    }
  ]);

  const [selectedPartnership, setSelectedPartnership] = useState<PartnershipRecord | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    portfolio: true,
    analysis: true,
    patterns: true,
    records: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredPartnerships = useMemo(() => {
    return partnerships.filter(p => {
      const matchOutcome = filterOutcome === 'all' || p.outcome === filterOutcome;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchOutcome && matchStatus;
    });
  }, [partnerships, filterOutcome, filterStatus]);

  const portfolioStats = useMemo(() => {
    const total = partnerships.length;
    const successful = partnerships.filter(p => p.outcome === 'Success').length;
    const failed = partnerships.filter(p => p.outcome === 'Failed').length;
    const active = partnerships.filter(p => p.status === 'Active').length;
    
    const totalInvestment = partnerships.reduce((sum, p) => sum + p.investmentAmount, 0);
    const totalRevenue = partnerships.reduce((sum, p) => sum + p.actualRevenue, 0);
    const avgProfitability = Math.round(partnerships.reduce((sum, p) => sum + p.keyMetrics.profitability, 0) / total);
    
    return { total, successful, failed, active, totalInvestment, totalRevenue, avgProfitability };
  }, [partnerships]);

  const getOutcomeColor = (outcome: string): string => {
    switch (outcome) {
      case 'Success': return 'bg-green-100 text-green-900 border-green-300';
      case 'Moderate': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Underperforming': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'Failed': return 'bg-red-100 text-red-900 border-red-300';
      default: return 'bg-stone-100 text-stone-900';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return 'bg-green-600';
      case 'Completed': return 'bg-blue-600';
      case 'Dormant': return 'bg-yellow-600';
      case 'Failed': return 'bg-red-600';
      default: return 'bg-stone-600';
    }
  };

  const successPatterns = [
    {
      pattern: 'Executive Involvement',
      frequency: '100%',
      description: 'All successful partnerships had quarterly C-level executive visits'
    },
    {
      pattern: 'Clear Metrics',
      frequency: '100%',
      description: 'Success required documented KPIs and monthly review meetings'
    },
    {
      pattern: 'Legal Clarity',
      frequency: '100%',
      description: 'Comprehensive contracts with clear termination clauses'
    },
    {
      pattern: 'Cultural Adaptation',
      frequency: '90%',
      description: 'Successful partners adapted to local business culture'
    },
    {
      pattern: 'Local Leadership',
      frequency: '85%',
      description: 'Hiring experienced local leadership accelerated success'
    }
  ];

  const failurePatterns = [
    {
      pattern: 'Insufficient Due Diligence',
      frequency: '100%',
      description: 'All failed partnerships had gaps in financial verification'
    },
    {
      pattern: 'Weak Governance',
      frequency: '100%',
      description: 'No formal oversight structure or monthly steering committees'
    },
    {
      pattern: 'Rapid Escalation',
      frequency: '100%',
      description: 'Moved too fast to execution without establishing trust'
    },
    {
      pattern: 'Poor Communication',
      frequency: '80%',
      description: 'Misaligned expectations due to infrequent executive communication'
    }
  ];

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Archive className="w-8 h-8 text-teal-600" />
            Partnership Repository & Pattern Library
          </h2>
          <p className="text-stone-600">Historical tracking of all partnerships with outcome analysis and pattern discovery</p>
        </div>

        {/* PORTFOLIO OVERVIEW */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('portfolio')}
        >
          <div className="p-6 bg-gradient-to-r from-teal-50 to-green-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-teal-600" />
              Portfolio Overview
            </h3>
            <div className="text-2xl">{expandedSections.portfolio ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.portfolio && (
            <div className="p-6 grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs font-bold text-green-900 uppercase mb-1">Total Partnerships</div>
                <div className="text-4xl font-black text-green-600">{portfolioStats.total}</div>
                <div className="text-xs text-green-700 mt-2">{portfolioStats.successful} Successful * {portfolioStats.failed} Failed</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs font-bold text-blue-900 uppercase mb-1">Total Capital Deployed</div>
                <div className="text-3xl font-black text-blue-600">${(portfolioStats.totalInvestment / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-blue-700 mt-2">Avg ROI: {Math.round((portfolioStats.totalRevenue / portfolioStats.totalInvestment - 1) * 100)}%</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-xs font-bold text-purple-900 uppercase mb-1">Avg Profitability Score</div>
                <div className="text-4xl font-black text-purple-600">{portfolioStats.avgProfitability}</div>
                <div className="text-xs text-purple-700 mt-2">Success Rate: {Math.round((portfolioStats.successful / portfolioStats.total) * 100)}%</div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="text-xs font-bold text-teal-900 uppercase mb-1">Active Partnerships</div>
                <div className="text-3xl font-black text-teal-600">{portfolioStats.active}</div>
                <div className="text-xs text-teal-700 mt-2">Currently generating revenue</div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-xs font-bold text-orange-900 uppercase mb-1">Revenue Generated</div>
                <div className="text-3xl font-black text-orange-600">${(portfolioStats.totalRevenue / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-orange-700 mt-2">From {portfolioStats.total} partnerships</div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="text-xs font-bold text-pink-900 uppercase mb-1">Portfolio Health</div>
                <div className="text-4xl font-black text-pink-600">{portfolioStats.avgProfitability > 70 ? '✓ Strong' : portfolioStats.avgProfitability > 50 ? 'Fair' : 'Weak'}</div>
                <div className="text-xs text-pink-700 mt-2">Profitability trend</div>
              </div>
            </div>
          )}
        </div>

        {/* SUCCESS & FAILURE PATTERNS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('patterns')}
          >
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Success Patterns
              </h3>
              <div className="text-2xl">{expandedSections.patterns ? 'a-1/4' : 'a-'}</div>
            </div>

            {expandedSections.patterns && (
              <div className="p-6 space-y-3">
                {successPatterns.map((item, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-bold text-green-900">{item.pattern}</h5>
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">{item.frequency}</span>
                    </div>
                    <p className="text-sm text-green-800">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('patterns')}
          >
            <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Failure Patterns to Avoid
              </h3>
              <div className="text-2xl">{expandedSections.patterns ? 'a-1/4' : 'a-'}</div>
            </div>

            {expandedSections.patterns && (
              <div className="p-6 space-y-3">
                {failurePatterns.map((item, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-bold text-red-900">{item.pattern}</h5>
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">{item.frequency}</span>
                    </div>
                    <p className="text-sm text-red-800">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PARTNERSHIP RECORDS */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('records')}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Partnership Records ({filteredPartnerships.length})
            </h3>
            <div className="text-2xl">{expandedSections.records ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.records && (
            <div className="p-6 space-y-4">
              {/* FILTERS */}
              <div className="grid md:grid-cols-2 gap-4 pb-4 border-b border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> Outcome
                  </label>
                  <select
                    value={filterOutcome}
                    onChange={(e) => setFilterOutcome(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="all">All Outcomes</option>
                    <option value="Success">Success</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Underperforming">Underperforming</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Dormant">Dormant</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* PARTNERSHIP CARDS */}
              <div className="space-y-4">
                {filteredPartnerships.map((partnership) => (
                  <button
                    key={partnership.id}
                    onClick={() => setSelectedPartnership(selectedPartnership?.id === partnership.id ? null : partnership)}
                    className="w-full text-left p-4 bg-stone-50 border-2 border-stone-200 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <h4 className="font-bold text-stone-900">{partnership.name}</h4>
                        <p className="text-xs text-stone-600">{partnership.country} * {partnership.industry}</p>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-stone-700 mb-1">Status</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(partnership.status)}`}>
                          {partnership.status}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-stone-700 mb-1">Outcome</div>
                        <span className={`inline-block px-2 py-1 rounded border-2 text-xs font-bold ${getOutcomeColor(partnership.outcome)}`}>
                          {partnership.outcome}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-stone-700 mb-1">ROI</div>
                        <div className={`text-lg font-black flex items-center gap-1 ${
                          partnership.actualRevenue > partnership.investmentAmount 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {Math.round((partnership.actualRevenue / partnership.investmentAmount - 1) * 100)}%
                          {partnership.actualRevenue > partnership.investmentAmount 
                            ? <TrendingUp className="w-4 h-4" /> 
                            : <TrendingDown className="w-4 h-4" />
                          }
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < partnership.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-300'}`}
                              />
                            ))}
                          </div>
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PARTNERSHIP DETAIL */}
        {selectedPartnership && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="text-2xl font-bold text-stone-900">{selectedPartnership.name}</h3>
              <p className="text-stone-600">{selectedPartnership.country} * {selectedPartnership.industry}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-xs font-bold text-blue-900 mb-1">Investment</div>
                <div className="text-2xl font-black text-blue-600">${(selectedPartnership.investmentAmount / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-xs font-bold text-green-900 mb-1">Actual Revenue</div>
                <div className="text-2xl font-black text-green-600">${(selectedPartnership.actualRevenue / 1000000).toFixed(2)}M</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-xs font-bold text-purple-900 mb-1">Avg Profitability</div>
                <div className="text-2xl font-black text-purple-600">{selectedPartnership.keyMetrics.profitability}%</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-xs font-bold text-orange-900 mb-1">Rating</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < selectedPartnership.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-stone-900 mb-3">Key Success Factors</h4>
                <ul className="space-y-2">
                  {selectedPartnership.keySuccessFactors.map((factor, idx) => (
                    <li key={idx} className="text-sm text-stone-700 flex gap-2">
                      <span className="text-green-600 font-bold">✓</span> {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-3">Lessons Learned</h4>
                <ul className="space-y-2">
                  {selectedPartnership.lessonsLearned.map((lesson, idx) => (
                    <li key={idx} className="text-sm text-stone-700 flex gap-2">
                      <span className="text-blue-600 font-bold">a'</span> {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedPartnership.failureReasons && selectedPartnership.failureReasons.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-900 mb-3">Failure Reasons</h4>
                <ul className="space-y-2">
                  {selectedPartnership.failureReasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-red-800 flex gap-2">
                      <span className="text-red-600 font-bold">as </span> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-2">Next Steps</h4>
              <p className="text-sm text-stone-700">{selectedPartnership.nextSteps}</p>
            </div>

            <div className="bg-stone-100 rounded-lg p-4 border border-stone-300">
              <h4 className="font-bold text-stone-900 mb-2">Notes</h4>
              <p className="text-sm text-stone-700 italic">{selectedPartnership.notes}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnershipRepository;

