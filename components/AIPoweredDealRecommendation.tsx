import React, { useState, useMemo } from 'react';
import { Brain, Zap, TrendingUp, CheckCircle, AlertCircle, BarChart3, Download, RefreshCw } from 'lucide-react';

interface EntityProfile {
  name: string;
  industry: string;
  country: string;
  stage: string;
  revenue: number;
  investmentCapacity: number;
  riskTolerance: 'Low' | 'Medium' | 'High';
  geographicPreferences: string[];
  strategicFocus: string[];
}

interface Deal {
  id: string;
  name: string;
  type: string;
  country: string;
  industry: string;
  stage: string;
  value: number;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  roi: number;
  timeline: string;
}

interface Recommendation {
  deal: Deal;
  compatibilityScore: number;
  financialAlignment: number;
  strategicAlignment: number;
  riskAlignment: number;
  geographicAlignment: number;
  reasoning: string[];
  redFlags: string[];
  recommendation: 'STRONG GO' | 'GO' | 'CONSIDER' | 'PASS';
}

const AIPoweredDealRecommendation: React.FC = () => {
  const [entityProfile, setEntityProfile] = useState<EntityProfile>({
    name: 'Your Corporation',
    industry: 'Technology',
    country: 'United States',
    stage: 'Growth',
    revenue: 50000000,
    investmentCapacity: 10000000,
    riskTolerance: 'Medium',
    geographicPreferences: ['Southeast Asia', 'Europe', 'Latin America'],
    strategicFocus: ['Market Expansion', 'Technology Acquisition', 'Partnership']
  });

  const [deals] = useState<Deal[]>([
    {
      id: 'd1',
      name: 'Vietnam Tech Startup - Series A',
      type: 'Equity Investment',
      country: 'Vietnam',
      industry: 'Technology',
      stage: 'Early-Stage',
      value: 5000000,
      description: 'AI/ML platform for supply chain optimization',
      riskLevel: 'High',
      roi: 35,
      timeline: '18-24 months'
    },
    {
      id: 'd2',
      name: 'Poland Manufacturing Hub',
      type: 'Partnership',
      country: 'Poland',
      industry: 'Manufacturing',
      stage: 'Expansion',
      value: 8000000,
      description: 'Joint venture for European distribution',
      riskLevel: 'Medium',
      roi: 22,
      timeline: '24-36 months'
    },
    {
      id: 'd3',
      name: 'Brazil Fintech Platform',
      type: 'Equity Investment',
      country: 'Brazil',
      industry: 'Financial Services',
      stage: 'Growth',
      value: 12000000,
      description: 'Payment processing platform for Latin America',
      riskLevel: 'Medium',
      roi: 28,
      timeline: '12-18 months'
    },
    {
      id: 'd4',
      name: 'Mexico Manufacturing Facility',
      type: 'Asset Purchase',
      country: 'Mexico',
      industry: 'Manufacturing',
      stage: 'Expansion',
      value: 15000000,
      description: 'Nearshoring opportunity for US operations',
      riskLevel: 'Low',
      roi: 18,
      timeline: '6-12 months'
    },
    {
      id: 'd5',
      name: 'Singapore Tech Hub Partnership',
      type: 'Partnership',
      country: 'Singapore',
      industry: 'Technology',
      stage: 'Growth',
      value: 3000000,
      description: 'R&D center and innovation lab',
      riskLevel: 'Low',
      roi: 25,
      timeline: '12-18 months'
    },
    {
      id: 'd6',
      name: 'India Software Services',
      type: 'Service Agreement',
      country: 'India',
      industry: 'Technology Services',
      stage: 'Mature',
      value: 2000000,
      description: 'Outsourced software development',
      riskLevel: 'Medium',
      roi: 15,
      timeline: 'Ongoing'
    },
    {
      id: 'd7',
      name: 'UAE Trading Company',
      type: 'Equity Investment',
      country: 'Saudi Arabia',
      industry: 'Trade & Logistics',
      stage: 'Growth',
      value: 6000000,
      description: 'Regional distribution and trading hub',
      riskLevel: 'High',
      roi: 32,
      timeline: '24 months'
    },
    {
      id: 'd8',
      name: 'Germany Industrial Tech',
      type: 'Acquisition',
      country: 'Germany',
      industry: 'Industrial Technology',
      stage: 'Mature',
      value: 25000000,
      description: 'IoT solutions provider acquisition',
      riskLevel: 'Low',
      roi: 20,
      timeline: '6 months'
    }
  ]);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    profile: true,
    recommendations: true,
    analysis: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ML-based scoring algorithm
  const calculateRecommendations = useMemo(() => {
    return deals.map(deal => {
      // Financial Alignment (0-100)
      const financialAlignment = Math.max(0, 100 - Math.abs(
        (deal.value - entityProfile.investmentCapacity) / entityProfile.investmentCapacity * 50
      ));

      // Strategic Alignment (0-100)
      const strategicMatch = entityProfile.strategicFocus.some(focus =>
        deal.description.toLowerCase().includes(focus.toLowerCase()) ||
        deal.type.includes(focus)
      ) ? 40 : 0;
      const typeMatch = deal.type.toLowerCase().includes('partnership') ? 30 : 20;
      const strategicAlignment = Math.min(100, strategicMatch + typeMatch);

      // Risk Alignment (0-100)
      const riskMap: { [key: string]: { [key: string]: number } } = {
        'Low': { 'Low': 100, 'Medium': 50, 'High': 20 },
        'Medium': { 'Low': 70, 'Medium': 100, 'High': 60 },
        'High': { 'Low': 40, 'Medium': 70, 'High': 100 }
      };
      const riskAlignment = riskMap[entityProfile.riskTolerance][deal.riskLevel];

      // Geographic Alignment (0-100)
      const geographicAlignment = entityProfile.geographicPreferences.some(geo =>
        deal.country.toLowerCase().includes(geo.toLowerCase()) ||
        geo.toLowerCase().includes(deal.country.toLowerCase())
      ) ? 100 : 30;

      // Industry experience bonus
      const industryBonus = deal.industry === entityProfile.industry ? 20 : 0;

      // Overall Compatibility Score (weighted average)
      const compatibilityScore = Math.round(
        (financialAlignment * 0.25 + strategicAlignment * 0.25 + riskAlignment * 0.25 + geographicAlignment * 0.15 + industryBonus) / 1.15
      );

      // Reasoning
      const reasoning: string[] = [];
      if (strategicAlignment > 70) reasoning.push(`Strategic alignment strong: matches ${entityProfile.strategicFocus.join(', ')}`);
      if (financialAlignment > 80) reasoning.push(`Investment size well-suited to your capacity`);
      if (deal.roi > 25) reasoning.push(`High ROI potential at ${deal.roi}%`);
      if (geographicAlignment > 80) reasoning.push(`Geographic preference match`);
      if (deal.stage === entityProfile.stage) reasoning.push(`Maturity stage alignment`);

      // Red Flags
      const redFlags: string[] = [];
      if (deal.value > entityProfile.investmentCapacity * 1.5) redFlags.push(`Investment exceeds typical capacity`);
      if (deal.riskLevel === 'High' && entityProfile.riskTolerance === 'Low') redFlags.push(`Risk level higher than tolerance`);
      if (deal.timeline.includes('24') || deal.timeline.includes('36')) redFlags.push(`Long timeline may impact liquidity`);
      if (strategicAlignment < 40) redFlags.push(`Weak strategic alignment with stated focus`);

      // Recommendation logic
      let recommendation: 'STRONG GO' | 'GO' | 'CONSIDER' | 'PASS' = 'PASS';
      if (compatibilityScore >= 80 && deal.riskLevel !== 'High') recommendation = 'STRONG GO';
      else if (compatibilityScore >= 70 && redFlags.length === 0) recommendation = 'GO';
      else if (compatibilityScore >= 60 && redFlags.length <= 1) recommendation = 'CONSIDER';
      else recommendation = 'PASS';

      return {
        deal,
        compatibilityScore,
        financialAlignment,
        strategicAlignment,
        riskAlignment,
        geographicAlignment,
        reasoning,
        redFlags,
        recommendation
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [entityProfile, deals]);

  const strongGo = calculateRecommendations.filter(r => r.recommendation === 'STRONG GO');
  const go = calculateRecommendations.filter(r => r.recommendation === 'GO');
  const consider = calculateRecommendations.filter(r => r.recommendation === 'CONSIDER');

  const getRecommendationColor = (rec: string): string => {
    switch (rec) {
      case 'STRONG GO': return 'bg-green-100 border-green-400 text-green-900';
      case 'GO': return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'CONSIDER': return 'bg-yellow-100 border-yellow-400 text-yellow-900';
      default: return 'bg-red-100 border-red-400 text-red-900';
    }
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Brain className="w-8 h-8 text-violet-600" />
            AI-Powered Deal Recommendation Engine
          </h2>
          <p className="text-stone-600">ML-based partnership and deal matching using your entity profile and strategic priorities</p>
        </div>

        {/* ENTITY PROFILE */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('profile')}
        >
          <div className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-600" />
              Entity Profile for Matching
            </h3>
            <div className="text-2xl">{expandedSections.profile ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.profile && (
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
                <label className="block text-xs font-bold text-stone-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={entityProfile.industry}
                  onChange={(e) => setEntityProfile({ ...entityProfile, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Annual Revenue</label>
                <input
                  type="number"
                  value={entityProfile.revenue}
                  onChange={(e) => setEntityProfile({ ...entityProfile, revenue: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Investment Capacity</label>
                <input
                  type="number"
                  value={entityProfile.investmentCapacity}
                  onChange={(e) => setEntityProfile({ ...entityProfile, investmentCapacity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Risk Tolerance</label>
                <select
                  value={entityProfile.riskTolerance}
                  onChange={(e) => setEntityProfile({ ...entityProfile, riskTolerance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Stage</label>
                <select
                  value={entityProfile.stage}
                  onChange={(e) => setEntityProfile({ ...entityProfile, stage: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  <option>Early-Stage</option>
                  <option>Growth</option>
                  <option>Expansion</option>
                  <option>Mature</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-2">Geographic Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {['Southeast Asia', 'Europe', 'Latin America', 'North America', 'Middle East', 'Africa'].map(geo => (
                    <button
                      key={geo}
                      onClick={() => {
                        const prefs = entityProfile.geographicPreferences;
                        if (prefs.includes(geo)) {
                          setEntityProfile({ ...entityProfile, geographicPreferences: prefs.filter(p => p !== geo) });
                        } else {
                          setEntityProfile({ ...entityProfile, geographicPreferences: [...prefs, geo] });
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                        entityProfile.geographicPreferences.includes(geo)
                          ? 'bg-violet-600 text-white'
                          : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                      }`}
                    >
                      {geo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-2">Strategic Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {['Market Expansion', 'Technology Acquisition', 'Partnership', 'Cost Optimization', 'Talent Access'].map(focus => (
                    <button
                      key={focus}
                      onClick={() => {
                        const current = entityProfile.strategicFocus;
                        if (current.includes(focus)) {
                          setEntityProfile({ ...entityProfile, strategicFocus: current.filter(f => f !== focus) });
                        } else {
                          setEntityProfile({ ...entityProfile, strategicFocus: [...current, focus] });
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                        entityProfile.strategicFocus.includes(focus)
                          ? 'bg-violet-600 text-white'
                          : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS BY CATEGORY */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6">
            <h4 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strong Go
            </h4>
            <p className="text-3xl font-black text-green-600">{strongGo.length}</p>
            <p className="text-xs text-green-700 mt-1">Highly aligned opportunities</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-xl p-6">
            <h4 className="text-lg font-bold text-blue-900 mb-2">Go</h4>
            <p className="text-3xl font-black text-blue-600">{go.length}</p>
            <p className="text-xs text-blue-700 mt-1">Solid opportunities</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-2">Consider</h4>
            <p className="text-3xl font-black text-yellow-600">{consider.length}</p>
            <p className="text-xs text-yellow-700 mt-1">Requires deeper analysis</p>
          </div>
        </div>

        {/* RECOMMENDED DEALS */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              AI-Ranked Opportunity Pipeline ({calculateRecommendations.length})
            </h3>
            <div className="text-2xl">{expandedSections.recommendations ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.recommendations && (
            <div className="p-6 space-y-4">
              {calculateRecommendations.map((rec, idx) => (
                <div
                  key={rec.deal.id}
                  className={`p-4 border-2 rounded-lg ${getRecommendationColor(rec.recommendation)} space-y-3`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{rec.deal.name}</h4>
                      <p className="text-xs opacity-75">{rec.deal.country} * {rec.deal.industry} * {rec.deal.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black">{rec.compatibilityScore}%</div>
                      <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold mt-1">
                        {rec.recommendation}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-5 gap-2 text-xs">
                    <div>
                      <div className="font-bold opacity-75">Financial</div>
                      <div className="text-lg font-black">{Math.round(rec.financialAlignment)}%</div>
                    </div>
                    <div>
                      <div className="font-bold opacity-75">Strategic</div>
                      <div className="text-lg font-black">{Math.round(rec.strategicAlignment)}%</div>
                    </div>
                    <div>
                      <div className="font-bold opacity-75">Risk</div>
                      <div className="text-lg font-black">{Math.round(rec.riskAlignment)}%</div>
                    </div>
                    <div>
                      <div className="font-bold opacity-75">Geographic</div>
                      <div className="text-lg font-black">{Math.round(rec.geographicAlignment)}%</div>
                    </div>
                    <div>
                      <div className="font-bold opacity-75">Deal Value</div>
                      <div className="text-lg font-black">${(rec.deal.value / 1000000).toFixed(0)}M</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {rec.reasoning.length > 0 && (
                      <div>
                        <p className="text-xs font-bold opacity-75">Why this opportunity:</p>
                        <ul className="text-xs space-y-1">
                          {rec.reasoning.map((reason, i) => (
                            <li key={i}>* {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rec.redFlags.length > 0 && (
                      <div className="bg-white bg-opacity-40 p-2 rounded">
                        <p className="text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Considerations:
                        </p>
                        <ul className="text-xs space-y-1">
                          {rec.redFlags.map((flag, i) => (
                            <li key={i}>* {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-current border-opacity-20">
                    <button className="flex-1 px-3 py-1 bg-white bg-opacity-40 rounded text-xs font-bold hover:bg-opacity-60 transition-all">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-1 bg-white bg-opacity-40 rounded text-xs font-bold hover:bg-opacity-60 transition-all">
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIPoweredDealRecommendation;

