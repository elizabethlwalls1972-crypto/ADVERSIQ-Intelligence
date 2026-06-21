import React, { useState } from 'react';
import { Zap, Plus, Trash2, TrendingUp, AlertCircle, CheckCircle, BarChart3, Globe, DollarSign } from 'lucide-react';

interface Partnership {
  id: string;
  partnerName: string;
  country: string;
  industry: string;
  startDate: string;
  investmentAmount: number;
  currentRevenue: number;
  projectedRevenue: number;
  status: 'Active' | 'At Risk' | 'Mature' | 'Declining';
  healthScore: number;
  keyStrengths: string[];
  challenges: string[];
}

interface ExpansionOpportunity {
  title: string;
  description: string;
  type: 'Geographic' | 'Product' | 'Operational' | 'Financial';
  estimatedValue: number;
  timeframe: string;
  effort: 'Low' | 'Medium' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface ExistingPartnershipAnalyzerProps {
  onAnalysisComplete?: (partnerships: Partnership[]) => void;
}

const ExistingPartnershipAnalyzer: React.FC<ExistingPartnershipAnalyzerProps> = ({
  onAnalysisComplete
}) => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    {
      id: '1',
      partnerName: 'SG Manufacturing Ltd',
      country: 'Singapore',
      industry: 'Manufacturing',
      startDate: '2020-06-15',
      investmentAmount: 15000000,
      currentRevenue: 45000000,
      projectedRevenue: 65000000,
      status: 'Active',
      healthScore: 82,
      keyStrengths: ['Strong market access', 'Efficient operations', 'Loyal customer base'],
      challenges: ['Rising labor costs', 'Competition from new entrants']
    },
    {
      id: '2',
      partnerName: 'Vietnam Trade Partners',
      country: 'Vietnam',
      industry: 'Distribution',
      startDate: '2019-03-22',
      investmentAmount: 8000000,
      currentRevenue: 32000000,
      projectedRevenue: 42000000,
      status: 'At Risk',
      healthScore: 58,
      keyStrengths: ['Large network', 'Low costs'],
      challenges: ['Governance disputes', 'Slower growth than expected', 'Key personnel turnover']
    },
    {
      id: '3',
      partnerName: 'Poland Tech Solutions',
      country: 'Poland',
      industry: 'Technology',
      startDate: '2021-09-10',
      investmentAmount: 22000000,
      currentRevenue: 28000000,
      projectedRevenue: 55000000,
      status: 'Mature',
      healthScore: 75,
      keyStrengths: ['Innovation hub', 'Strong talent', 'Geographic advantage'],
      challenges: ['Rapid market change', 'Need to scale infrastructure']
    }
  ]);

  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [showExpansionAnalysis, setShowExpansionAnalysis] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 border-green-200 text-green-900';
      case 'At Risk': return 'bg-red-50 border-red-200 text-red-900';
      case 'Mature': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'Declining': return 'bg-orange-50 border-orange-200 text-orange-900';
      default: return 'bg-stone-50 border-stone-200 text-stone-900';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateROI = (investment: number, revenue: number) => {
    return (((revenue - investment) / investment) * 100).toFixed(0);
  };

  const expansionOpportunities: ExpansionOpportunity[] = selectedPartnership ? [
    {
      title: 'Geographic Expansion',
      description: `Expand current operations from ${selectedPartnership.country} to adjacent markets with similar characteristics`,
      type: 'Geographic',
      estimatedValue: selectedPartnership.investmentAmount * 1.5,
      timeframe: '12-18 months',
      effort: 'Medium',
      riskLevel: 'Medium'
    },
    {
      title: 'Product Line Extension',
      description: 'Introduce complementary product lines to existing customer base in current market',
      type: 'Product',
      estimatedValue: selectedPartnership.currentRevenue * 0.3,
      timeframe: '6-9 months',
      effort: 'Low',
      riskLevel: 'Low'
    },
    {
      title: 'Operational Improvement',
      description: 'Implement cost optimization initiatives to improve margins by 5-8%',
      type: 'Operational',
      estimatedValue: selectedPartnership.currentRevenue * 0.08,
      timeframe: '3-6 months',
      effort: 'Medium',
      riskLevel: 'Low'
    },
    {
      title: 'Strategic Acquisition',
      description: 'Acquire smaller competitor to consolidate market position and eliminate competition',
      type: 'Financial',
      estimatedValue: selectedPartnership.investmentAmount * 2,
      timeframe: '18-24 months',
      effort: 'High',
      riskLevel: 'High'
    }
  ] : [];

  const renegotiationPoints = selectedPartnership ? [
    {
      category: 'Profit Sharing',
      current: '50/50',
      recommended: '55/45 (in your favor)',
      rationale: selectedPartnership.healthScore > 75 
        ? 'Strong performance justifies increased share'
        : 'Stabilize relationship with better terms'
    },
    {
      category: 'Governance Rights',
      current: 'Equal voting',
      recommended: 'Performance-based voting',
      rationale: 'Align incentives with KPIs'
    },
    {
      category: 'Capital Contribution',
      current: `$${(selectedPartnership.investmentAmount / 1000000).toFixed(0)}M`,
      recommended: `Adjust based on market growth (${selectedPartnership.projectedRevenue > selectedPartnership.currentRevenue * 1.3 ? '+' : ''}20%)`,
      rationale: 'Match capital to market opportunity'
    },
    {
      category: 'Term Length',
      current: 'Annual review',
      recommended: '3-year commitment with renewal options',
      rationale: 'Provides stability for growth investments'
    }
  ] : [];

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Existing Partnership Analyzer
          </h2>
          <p className="text-stone-600">Analyze current partnerships, identify expansion opportunities, and plan renegotiation strategies</p>
        </div>

        {!selectedPartnership ? (
          <>
            {/* PARTNERSHIP PORTFOLIO OVERVIEW */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Your Partnership Portfolio</h3>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Total Active Partnerships</div>
                  <div className="text-4xl font-black text-blue-600">{partnerships.length}</div>
                  <div className="text-xs text-blue-800 mt-2">Portfolio value: $${(partnerships.reduce((a, p) => a + p.investmentAmount, 0) / 1000000).toFixed(0)}M</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">Combined Revenue</div>
                  <div className="text-4xl font-black text-green-600">${(partnerships.reduce((a, p) => a + p.currentRevenue, 0) / 1000000).toFixed(0)}M</div>
                  <div className="text-xs text-green-800 mt-2">Average health: {(partnerships.reduce((a, p) => a + p.healthScore, 0) / partnerships.length).toFixed(0)}/100</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Expansion Potential</div>
                  <div className="text-4xl font-black text-purple-600">${(partnerships.reduce((a, p) => a + (p.projectedRevenue - p.currentRevenue), 0) / 1000000).toFixed(0)}M</div>
                  <div className="text-xs text-purple-800 mt-2">Projected 3-year uplift</div>
                </div>
              </div>

              {/* PARTNERSHIP CARDS */}
              <div className="space-y-3">
                {partnerships.map(partnership => (
                  <button
                    key={partnership.id}
                    onClick={() => setSelectedPartnership(partnership)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${getStatusColor(partnership.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{partnership.partnerName}</h4>
                        <p className="text-sm opacity-75">{partnership.country} * {partnership.industry}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-black ${getHealthScoreColor(partnership.healthScore)}`}>
                          {partnership.healthScore}
                        </div>
                        <div className="text-xs opacity-75">Health Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-sm">
                        <span className="opacity-75">Current Revenue:</span> <span className="font-bold">${(partnership.currentRevenue / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="text-sm">
                        <span className="opacity-75">ROI:</span> <span className="font-bold">{calculateROI(partnership.investmentAmount, partnership.currentRevenue)}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="opacity-75">Status:</span> <span className="font-bold">{partnership.status}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedPartnership(partnerships[0])}
                className="w-full mt-4 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Analyze First Partnership
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* BACK BUTTON */}
            <button
              onClick={() => setSelectedPartnership(null)}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              ← Back to Portfolio
            </button>

            {/* PARTNERSHIP DEEP DIVE */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">{selectedPartnership.partnerName}</h3>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold text-blue-900 uppercase mb-1">Investment</div>
                  <div className="text-2xl font-black text-blue-600">${(selectedPartnership.investmentAmount / 1000000).toFixed(0)}M</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs font-bold text-green-900 uppercase mb-1">Current Revenue</div>
                  <div className="text-2xl font-black text-green-600">${(selectedPartnership.currentRevenue / 1000000).toFixed(0)}M</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-bold text-purple-900 uppercase mb-1">Projected Revenue (Y3)</div>
                  <div className="text-2xl font-black text-purple-600">${(selectedPartnership.projectedRevenue / 1000000).toFixed(0)}M</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs font-bold text-orange-900 uppercase mb-1">ROI</div>
                  <div className="text-2xl font-black text-orange-600">{calculateROI(selectedPartnership.investmentAmount, selectedPartnership.currentRevenue)}%</div>
                </div>
              </div>

              {/* STRENGTHS & CHALLENGES */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-1">
                    {selectedPartnership.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-800">✓ {strength}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border ${selectedPartnership.healthScore < 70 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <h4 className={`font-bold ${selectedPartnership.healthScore < 70 ? 'text-red-900' : 'text-yellow-900'} mb-2 flex items-center gap-2`}>
                    <AlertCircle className="w-5 h-5" />
                    Challenges
                  </h4>
                  <ul className="space-y-1">
                    {selectedPartnership.challenges.map((challenge, idx) => (
                      <li key={idx} className={`text-sm ${selectedPartnership.healthScore < 70 ? 'text-red-800' : 'text-yellow-800'}`}>as  {challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* EXPANSION OPPORTUNITIES */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Expansion Opportunities
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {expansionOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-stone-900">{opp.title}</h4>
                      <span className="text-xs font-bold px-2 py-1 bg-stone-200 rounded">{opp.type}</span>
                    </div>
                    <p className="text-sm text-stone-700">{opp.description}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                      <div className="text-xs">
                        <span className="font-bold">Value: </span>${(opp.estimatedValue / 1000000).toFixed(0)}M
                      </div>
                      <div className="text-xs">
                        <span className="font-bold">Timeline: </span>{opp.timeframe}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold">Effort: </span>{opp.effort}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold">Risk: </span>{opp.riskLevel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RENEGOTIATION STRATEGY */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Renegotiation Strategy
              </h3>

              <div className="space-y-3">
                {renegotiationPoints.map((point, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-bold text-blue-900 mb-2">{point.category}</div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-bold text-stone-600">Current:</span>
                        <div className="text-stone-800">{point.current}</div>
                      </div>
                      <div>
                        <span className="font-bold text-green-600">Recommended:</span>
                        <div className="text-green-800">{point.recommended}</div>
                      </div>
                      <div>
                        <span className="font-bold text-purple-600">Rationale:</span>
                        <div className="text-purple-800 text-xs">{point.rationale}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                Generate Renegotiation Proposal
              </button>
            </div>

            {/* RISK ASSESSMENT */}
            {selectedPartnership.status === 'At Risk' && (
              <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-200 p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Partnership at Risk - Intervention Plan
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  <p>* Schedule executive-level meeting within 2 weeks to discuss performance gaps</p>
                  <p>* Review governance structure and decision-making authority alignment</p>
                  <p>* Consider bringing in mediator for conflict resolution if needed</p>
                  <p>* Develop turnaround plan with clear KPIs and timeline</p>
                  <p>* Prepare exit scenarios if turnaround is not feasible (6-month contingency)</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExistingPartnershipAnalyzer;

