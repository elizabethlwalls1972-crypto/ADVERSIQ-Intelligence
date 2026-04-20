import React, { useState, useEffect } from 'react';
import { GlobalCityData, AlternativeLocationMatch } from '../types';
import { GLOBAL_CITY_DATABASE } from '../constants';
import { Globe, ShieldCheck, MapPin, Loader2, ArrowRight } from 'lucide-react';

interface AlternativeLocationMatcherProps {
  originalLocation: GlobalCityData;
  requirements: {
    minPopulation?: number;
    maxCost?: number;
    minInfrastructure?: number;
    preferredRegion?: string;
    businessFocus?: string[];
  };
  onMatchesFound?: (matches: AlternativeLocationMatch) => void;
}

const AlternativeLocationMatcher: React.FC<AlternativeLocationMatcherProps> = ({
  originalLocation,
  requirements,
  onMatchesFound
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<AlternativeLocationMatch | null>(null);
  const [searchCriteria, setSearchCriteria] = useState(requirements);

  const calculateMatchScore = (candidate: GlobalCityData, original: GlobalCityData): number => {
    let score = 0;
    let maxScore = 0;

    // Population match (if specified)
    if (searchCriteria.minPopulation) {
      maxScore += 20;
      if (candidate.population >= searchCriteria.minPopulation) {
        score += 20;
      } else {
        score += (candidate.population / searchCriteria.minPopulation) * 20;
      }
    }

    // Cost competitiveness (if specified)
    if (searchCriteria.maxCost !== undefined) {
      maxScore += 15;
      const costScore = Math.max(0, 10 - candidate.talentPool.laborCosts);
      if (costScore >= searchCriteria.maxCost) {
        score += 15;
      } else {
        score += (costScore / searchCriteria.maxCost) * 15;
      }
    }

    // Infrastructure quality
    maxScore += 25;
    const infraScore = (
      candidate.infrastructure.transportation +
      candidate.infrastructure.digital +
      candidate.infrastructure.utilities
    ) / 3;
    const requiredInfra = searchCriteria.minInfrastructure || 7;
    if (infraScore >= requiredInfra) {
      score += 25;
    } else {
      score += (infraScore / requiredInfra) * 25;
    }

    // Business environment
    maxScore += 20;
    const businessScore = (
      candidate.businessEnvironment.easeOfDoingBusiness +
      candidate.businessEnvironment.corruptionIndex +
      candidate.businessEnvironment.regulatoryQuality
    ) / 3;
    score += (businessScore / 10) * 20;

    // Regional preference
    maxScore += 10;
    if (!searchCriteria.preferredRegion || candidate.region === searchCriteria.preferredRegion) {
      score += 10;
    } else {
      // Partial credit for same continent
      score += 5;
    }

    // Market access
    maxScore += 10;
    const marketScore = (
      candidate.marketAccess.domesticMarket +
      candidate.marketAccess.exportPotential
    ) / 2;
    score += (marketScore / 10) * 10;

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  };

  const generateMatchReasons = (candidate: GlobalCityData, original: GlobalCityData): string[] => {
    const reasons: string[] = [];

    if (candidate.infrastructure && original.infrastructure && candidate.infrastructure.transportation > original.infrastructure.transportation) {
      reasons.push('Superior transportation infrastructure');
    }
    if (candidate.talentPool && original.talentPool && candidate.talentPool.laborCosts < original.talentPool.laborCosts) {
      reasons.push('Lower operational costs');
    }
    if (candidate.businessEnvironment && original.businessEnvironment && candidate.businessEnvironment.corruptionIndex > original.businessEnvironment.corruptionIndex) {
      reasons.push('Better governance and lower corruption');
    }
    if (candidate.marketAccess && original.marketAccess && candidate.marketAccess.exportPotential > original.marketAccess.exportPotential) {
      reasons.push('Stronger export market access');
    }
    if (candidate.talentPool && original.talentPool && candidate.talentPool.educationLevel > original.talentPool.educationLevel) {
      reasons.push('Higher quality education system');
    }

    return reasons;
  };

  const generateImprovementAreas = (candidate: GlobalCityData, original: GlobalCityData): string[] => {
    const areas: string[] = [];

    if (candidate.population < (original.population || 0) * 0.5) {
      areas.push('Smaller market size may limit domestic opportunities');
    }
    if (candidate.businessEnvironment && original.businessEnvironment && candidate.businessEnvironment.regulatoryQuality < original.businessEnvironment.regulatoryQuality) {
      areas.push('More complex regulatory environment');
    }
    if (candidate.infrastructure && original.infrastructure && candidate.infrastructure.digital < original.infrastructure.digital) {
      areas.push('Less developed digital infrastructure');
    }
    if (candidate.talentPool && original.talentPool && candidate.talentPool.skillsAvailability < original.talentPool.skillsAvailability) {
      areas.push('Potential skills gap in specialized areas');
    }

    return areas;
  };

  const generateTransitionChallenges = (candidate: GlobalCityData, original: GlobalCityData): string[] => {
    const challenges: string[] = [];

    if (candidate.region !== original.region) {
      challenges.push('Cross-regional relocation logistics');
    }
    if (candidate.businessEnvironment && original.businessEnvironment && Math.abs(candidate.businessEnvironment.regulatoryQuality - original.businessEnvironment.regulatoryQuality) > 2) {
      challenges.push('Regulatory environment adaptation');
    }
    if (candidate.talentPool && original.talentPool && candidate.talentPool.laborCosts < original.talentPool.laborCosts * 0.7) {
      challenges.push('Potential quality vs cost trade-offs');
    }
    challenges.push('Local partnership and network development');
    challenges.push('Cultural and business practice adaptation');

    return challenges;
  };

  const findAlternativeLocations = async () => {
    setIsSearching(true);

    try {
      const candidates = Object.values(GLOBAL_CITY_DATABASE)
        .filter(city => city.city !== originalLocation?.city)
        .map(city => ({
          location: city,
          matchScore: calculateMatchScore(city, originalLocation || { city: '', region: '', population: 0, talentPool: { laborCosts: 0 }, infrastructure: { transportation: 0, digital: 0, utilities: 0 }, businessEnvironment: { easeOfDoingBusiness: 0, corruptionIndex: 0, regulatoryQuality: 0 }, marketAccess: { domesticMarket: 0, exportPotential: 0 } } as any),
          matchReasons: generateMatchReasons(city, originalLocation || {} as any),
          improvementAreas: generateImprovementAreas(city, originalLocation || {} as any),
          transitionChallenges: generateTransitionChallenges(city, originalLocation || {} as any)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5 matches

      const relocationStrategy = {
        timeline: '18-24 months',
        resourceRequirements: [
          'Legal and regulatory compliance team',
          'Local partnership development',
          'Infrastructure assessment and planning',
          'Workforce transition and training',
          'Supply chain reconfiguration'
        ],
        riskMitigation: [
          'Phased transition approach',
          'Parallel operations during transition',
          'Local market expertise acquisition',
          'Regulatory compliance assurance',
          'Stakeholder communication plan'
        ],
        successProbability: candidates[0]?.matchScore > 80 ? 85 :
                           candidates[0]?.matchScore > 70 ? 75 :
                           candidates[0]?.matchScore > 60 ? 65 : 55
      };

      const alternativeMatch: AlternativeLocationMatch = {
        originalLocation: originalLocation || {} as any,
        matchedLocations: candidates,
        relocationStrategy
      };

      setMatches(alternativeMatch);
      if (onMatchesFound) {
        onMatchesFound(alternativeMatch);
      }

    } catch (error) {
      console.error('Alternative location matching failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setSearchCriteria(requirements);
  }, [requirements]);

  const updateCriteria = (key: string, value: any) => {
    setSearchCriteria(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
          <Globe className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900">Alternative Location Matcher</h3>
          <p className="text-stone-500 text-xs">AI-driven site selection & comparative analysis.</p>
        </div>
      </div>

      {/* Search Criteria */}
      <div className="mb-6 bg-stone-50 p-4 rounded-lg border border-stone-100">
        <h4 className="text-xs font-bold text-stone-500 uppercase mb-4 tracking-wider">Search Parameters</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Minimum Population
            </label>
            <input
              type="number"
              value={searchCriteria.minPopulation || ''}
              onChange={(e) => updateCriteria('minPopulation', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 1000000"
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Max Labor Cost (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={searchCriteria.maxCost || ''}
              onChange={(e) => updateCriteria('maxCost', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 7"
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Min Infrastructure (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={searchCriteria.minInfrastructure || ''}
              onChange={(e) => updateCriteria('minInfrastructure', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 7"
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Preferred Region
            </label>
            <select
              value={searchCriteria.preferredRegion || ''}
              onChange={(e) => updateCriteria('preferredRegion', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">Any Region</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="Middle East & North Africa">Middle East & North Africa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={findAlternativeLocations}
          disabled={isSearching}
          className="w-full bg-stone-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-black disabled:bg-stone-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isSearching ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Analyzing Global Database...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Execute Global Scan
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {matches && (
        <div className="space-y-6">
          {/* Top Match Highlight */}
          <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-800 uppercase">Optimal Alternative Identified</h4>
          </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-bold text-lg text-stone-900">{matches.matchedLocations[0].location.city}</h5>
                  <p className="text-xs text-stone-500 font-medium uppercase">{matches.matchedLocations[0].location.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-600">
                    {matches.matchedLocations[0].matchScore.toFixed(1)}%
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase">Match Score</div>
                </div>
              </div>
              <div className="text-xs text-stone-600 leading-relaxed mt-2">
                <span className="font-bold text-stone-800">Key Drivers:</span> {matches.matchedLocations[0].matchReasons.join(', ')}
              </div>
            </div>
          </div>

          {/* All Matches Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
             <table className="w-full text-left text-xs">
                 <thead className="bg-stone-50 text-stone-500 font-bold uppercase">
                     <tr>
                         <th className="p-3">Rank</th>
                         <th className="p-3">City</th>
                         <th className="p-3">Score</th>
                         <th className="p-3 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-100">
                     {matches.matchedLocations.map((match, i) => (
                         <tr key={match.location.city} className="hover:bg-stone-50">
                             <td className="p-3 font-mono text-stone-400">#{i + 1}</td>
                             <td className="p-3 font-bold text-stone-800">{match.location.city}</td>
                             <td className="p-3">
                                <span className={`font-bold ${
                                    match.matchScore >= 80 ? 'text-emerald-600' :
                                    match.matchScore >= 70 ? 'text-blue-600' : 'text-amber-600'
                                }`}>{match.matchScore.toFixed(0)}%</span>
                             </td>
                             <td className="p-3 text-right">
                                 <button className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 justify-end">
                                     Details <ArrowRight size={12}/>
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>

          {/* Relocation Strategy */}
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-3">Strategic Playbook</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-blue-900 text-xs mb-2">Timeline & Resources</h5>
                <div className="text-xs text-blue-800 space-y-1">
                  <div><span className="font-semibold">Timeline:</span> {matches.relocationStrategy.timeline}</div>
                  <div><span className="font-semibold">Probability:</span> {matches.relocationStrategy.successProbability}%</div>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-blue-900 text-xs mb-2">Risk Mitigation</h5>
                <ul className="text-xs text-blue-800 space-y-1">
                  {matches.relocationStrategy.riskMitigation.slice(0, 3).map((mitigation, i) => (
                    <li key={i}>* {mitigation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!matches && !isSearching && (
        <div className="text-center py-12 text-stone-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-xs">Configure criteria to run global simulation.</p>
        </div>
      )}
    </div>
  );
};

export default AlternativeLocationMatcher;
