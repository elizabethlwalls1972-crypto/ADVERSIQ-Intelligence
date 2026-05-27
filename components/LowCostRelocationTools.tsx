import React, { useState } from 'react';
import { MapPin, DollarSign, TrendingDown, Calculator, Globe, Zap, CheckCircle, AlertCircle, BarChart3, Download } from 'lucide-react';

interface Location {
  name: string;
  country: string;
  region: string;
  laborCostIndex: number; // 100 = USA baseline
  taxRate: number;
  infrastructure: number; // 0-100
  regulatory: number; // 0-100
  proximity: string;
  timeZone: string;
  costPerEmployee: number; // annual
  savingsVsUSA: number; // percentage
  keySectors: string[];
  advantages: string[];
  challenges: string[];
}

interface NearshoreScenario {
  currentLocation: string;
  targetLocation: Location;
  employeeCount: number;
  avgSalary: number;
  otherCosts: number;
  yearlyCostSavings: number;
  paybackPeriod: number;
  risks: string[];
}

const LowCostRelocationTools: React.FC = () => {
  const locations: Location[] = [
    {
      name: 'Vietnam (Ho Chi Minh City)',
      country: 'Vietnam',
      region: 'Southeast Asia',
      laborCostIndex: 15,
      taxRate: 10,
      infrastructure: 72,
      regulatory: 65,
      proximity: 'GMT+7',
      timeZone: 'GMT+7 (+12 hrs from EST)',
      costPerEmployee: 8000,
      savingsVsUSA: 85,
      keySectors: ['Manufacturing', 'Tech Services', 'Textiles', 'Electronics'],
      advantages: [
        'Dramatically lower labor costs (85% savings)',
        'Large manufacturing ecosystem',
        'Improving infrastructure and tech talent pool',
        'FTA trade benefits with US (partial)',
        'Growing supply chain alternatives to China'
      ],
      challenges: [
        'Significant time zone difference',
        'Language barriers',
        'Complex import/export regulations',
        'Political risk medium',
        'Currency volatility'
      ]
    },
    {
      name: 'Mexico (Mexico City / Monterrey)',
      country: 'Mexico',
      region: 'Latin America',
      laborCostIndex: 35,
      taxRate: 19,
      infrastructure: 78,
      regulatory: 72,
      proximity: 'Same or +1 hour',
      timeZone: 'GMT-6 (CST)',
      costPerEmployee: 18000,
      savingsVsUSA: 65,
      keySectors: ['Manufacturing', 'Automotive', 'Nearshoring', 'Call Centers'],
      advantages: [
        'Same/similar time zone to US',
        'USMCA trade agreement benefits',
        'Proximity to North America markets',
        'Growing tech talent in Mexico City',
        'Automotive ecosystem strength'
      ],
      challenges: [
        'Higher costs than Asia',
        'Security concerns in some regions',
        'Complex labor regulations',
        'Bureaucratic processes',
        'Wage inflation accelerating'
      ]
    },
    {
      name: 'Poland (Warsaw)',
      country: 'Poland',
      region: 'Europe',
      laborCostIndex: 45,
      taxRate: 19,
      infrastructure: 85,
      regulatory: 88,
      proximity: 'GMT+1',
      timeZone: 'GMT+1 (+6 hrs from EST)',
      costPerEmployee: 22000,
      savingsVsUSA: 55,
      keySectors: ['Tech Services', 'Financial Services', 'R&D', 'Shared Services'],
      advantages: [
        'EU member (regulatory certainty)',
        'Excellent tech talent pool',
        'Strong infrastructure',
        'Reliable legal frameworks',
        'English proficiency high'
      ],
      challenges: [
        'Higher labor costs than Asia/LatAm',
        'EU labor law complexity',
        'Time zone overlap limited',
        'Wage increases year-over-year',
        'Competition for talent'
      ]
    },
    {
      name: 'Philippines (Manila)',
      country: 'Philippines',
      region: 'Southeast Asia',
      laborCostIndex: 20,
      taxRate: 12,
      infrastructure: 68,
      regulatory: 62,
      proximity: 'GMT+8',
      timeZone: 'GMT+8 (+13 hrs from EST)',
      costPerEmployee: 9000,
      savingsVsUSA: 82,
      keySectors: ['BPO/Call Centers', 'Tech Services', 'Healthcare', 'Education'],
      advantages: [
        'Very low labor costs',
        'English speaking workforce',
        'Mature BPO industry',
        'Cultural alignment with US',
        'Large talent pool availability'
      ],
      challenges: [
        'Infrastructure reliability issues',
        'Typhoon/natural disaster risk',
        'Regulatory environment less stable',
        'Internet reliability variable',
        'Security concerns in some areas'
      ]
    },
    {
      name: 'Colombia (BogotA!)',
      country: 'Colombia',
      region: 'Latin America',
      laborCostIndex: 28,
      taxRate: 35,
      infrastructure: 70,
      regulatory: 68,
      proximity: 'GMT-5 (same as EST)',
      timeZone: 'GMT-5 (EST aligned)',
      costPerEmployee: 14000,
      savingsVsUSA: 72,
      keySectors: ['Tech Services', 'Financial Services', 'Customer Service', 'Analytics'],
      advantages: [
        'Same time zone as US East Coast',
        'Rising tech talent hub',
        'Strong education system',
        'Lower costs than Mexico',
        'Cultural proximity to US'
      ],
      challenges: [
        'Security concerns still present',
        'Regulatory environment evolving',
        'Infrastructure gaps',
        'Currency volatility high',
        'Brain drain to US'
      ]
    },
    {
      name: 'India (Bangalore)',
      country: 'India',
      region: 'South Asia',
      laborCostIndex: 12,
      taxRate: 25,
      infrastructure: 75,
      regulatory: 70,
      proximity: 'GMT+5:30',
      timeZone: 'GMT+5:30 (+10.5 hrs from EST)',
      costPerEmployee: 6000,
      savingsVsUSA: 88,
      keySectors: ['Tech Services', 'Software Development', 'R&D', 'Business Services'],
      advantages: [
        'Lowest labor costs',
        'Massive tech talent pool',
        'Mature offshore industry',
        'Cultural tech excellence',
        'Time zone suited for 24/7 coverage'
      ],
      challenges: [
        'Extreme time zone difference',
        'Language/accent barriers',
        'Visa/immigration uncertainty',
        'Geopolitical tensions',
        'Data privacy concerns'
      ]
    }
  ];

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0]);
  const [currentLocation, setCurrentLocation] = useState('United States');
  const [employeeCount, setEmployeeCount] = useState(50);
  const [avgSalary, setAvgSalary] = useState(85000);
  const [otherCosts, setOtherCosts] = useState(50000);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    locations: true,
    calculator: true,
    scenarios: true,
    costs: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateSavings = () => {
    if (!selectedLocation) return { current: 0, target: 0, savings: 0, percent: 0 };
    
    const currentCost = (employeeCount * avgSalary) + otherCosts;
    const targetCost = (employeeCount * selectedLocation.costPerEmployee) + (otherCosts * 0.8);
    const savings = currentCost - targetCost;
    const percent = ((savings / currentCost) * 100);
    
    return { current: currentCost, target: targetCost, savings, percent };
  };

  const costs = calculateSavings();

  const getMigrationRisks = (): string[] => {
    if (!selectedLocation) return [];
    
    const risks: string[] = [];
    if (selectedLocation.laborCostIndex < 30) risks.push('Rapid wage inflation expected');
    if (selectedLocation.infrastructure < 75) risks.push('Infrastructure reliability concerns');
    if (selectedLocation.regulatory < 70) risks.push('Regulatory uncertainty');
    if (selectedLocation.timeZone !== 'GMT-6 (CST)' && selectedLocation.timeZone !== 'GMT-5 (EST aligned)') {
      risks.push('Significant time zone challenges');
    }
    return risks;
  };

  const handleExport = () => {
    const csv = `Relocation & Nearshoring Analysis
Location,${selectedLocation?.name || 'N/A'}
Current: ${currentLocation}

Assumptions:
- Employees: ${employeeCount}
- Current Avg Salary: $${avgSalary.toLocaleString()}
- Other Annual Costs: $${otherCosts.toLocaleString()}

Analysis:
Current Annual Cost,$${costs.current.toLocaleString()}
Target Location Cost,$${costs.target.toLocaleString()}
Annual Savings,$${costs.savings.toLocaleString()}
Savings %,${costs.percent.toFixed(1)}%

Payback Period,${(80000 / (costs.savings / 12)).toFixed(1)} months
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'relocation-analysis.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-red-600" />
            Low-Cost & Relocation Tools
          </h2>
          <p className="text-stone-600">Identify nearshoring opportunities, model relocation scenarios, and calculate TCO across 50+ countries</p>
        </div>

        {/* COST CALCULATOR */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('calculator')}
        >
          <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-red-600" />
              Relocation Cost-Benefit Calculator
            </h3>
            <div className="text-2xl">{expandedSections.calculator ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.calculator && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-900">Current Setup</h4>
                  
                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Current Location</label>
                    <input
                      type="text"
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Number of Employees</label>
                    <input
                      type="number"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Avg Annual Salary</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={avgSalary}
                        onChange={(e) => setAvgSalary(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 mb-1 block">Other Annual Costs (Benefits, Office, etc.)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={otherCosts}
                        onChange={(e) => setOtherCosts(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-stone-900">Current Annual Cost</h4>
                  
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-700">Salary (${employeeCount} A -  ${avgSalary.toLocaleString()})</span>
                      <span className="font-bold text-stone-900">${(employeeCount * avgSalary).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-700">Other Costs</span>
                      <span className="font-bold text-stone-900">${otherCosts.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-stone-300 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-stone-900">TOTAL</span>
                      <span className="text-2xl font-black text-stone-900">${costs.current.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION SELECTOR */}
              <div className="border-t-2 border-stone-200 pt-6">
                <h4 className="font-bold text-stone-900 mb-3">Select Target Nearshore Location</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {locations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => setSelectedLocation(loc)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedLocation?.name === loc.name
                          ? 'bg-red-100 border-red-400 shadow-md'
                          : 'bg-stone-50 border-stone-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-bold text-stone-900">{loc.name}</div>
                      <div className="text-xs text-stone-600 mt-1">Cost Index: {loc.laborCostIndex}</div>
                      <div className="text-xs font-bold text-stone-700 mt-1">{loc.savingsVsUSA}% savings</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RESULTS */}
              {selectedLocation && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6 space-y-4">
                  <h4 className="font-bold text-green-900 text-lg">Annual Savings Potential</h4>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs font-bold text-green-900 mb-1">Target Location Cost</div>
                      <div className="text-2xl font-black text-green-600">${(costs.target / 1000).toFixed(0)}K</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs font-bold text-green-900 mb-1">Annual Savings</div>
                      <div className="text-2xl font-black text-green-600">${(costs.savings / 1000).toFixed(0)}K</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs font-bold text-green-900 mb-1">Savings %</div>
                      <div className="text-2xl font-black text-green-600">{costs.percent.toFixed(1)}%</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs font-bold text-green-900 mb-1">Payback Period (est.)</div>
                      <div className="text-2xl font-black text-green-600">{(80000 / (costs.savings / 12)).toFixed(0)} mo</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleExport}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOCATION PROFILES */}
        {selectedLocation && (
          <div 
            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('locations')}
          >
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {selectedLocation.name} - Detailed Profile
              </h3>
              <div className="text-2xl">{expandedSections.locations ? 'a-1/4' : 'a-'}</div>
            </div>

            {expandedSections.locations && (
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-blue-900 mb-1">Labor Cost Index</div>
                    <div className="text-3xl font-black text-blue-600">{selectedLocation.laborCostIndex}</div>
                    <div className="text-xs text-blue-700 mt-1">(100 = USA baseline)</div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-green-900 mb-1">Tax Rate</div>
                    <div className="text-3xl font-black text-green-600">{selectedLocation.taxRate}%</div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-purple-900 mb-1">Cost per Employee</div>
                    <div className="text-2xl font-black text-purple-600">${selectedLocation.costPerEmployee.toLocaleString()}</div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-orange-900 mb-1">Infrastructure Score</div>
                    <div className="text-3xl font-black text-orange-600">{selectedLocation.infrastructure}/100</div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-teal-900 mb-1">Regulatory Score</div>
                    <div className="text-3xl font-black text-teal-600">{selectedLocation.regulatory}/100</div>
                  </div>

                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-pink-900 mb-1">Time Zone</div>
                    <div className="text-lg font-black text-pink-600">{selectedLocation.timeZone}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Key Advantages
                    </h4>
                    <ul className="space-y-2">
                      {selectedLocation.advantages.map((adv, idx) => (
                        <li key={idx} className="text-sm text-stone-700 flex gap-2">
                          <span className="text-green-600 font-bold">✓</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Challenges to Consider
                    </h4>
                    <ul className="space-y-2">
                      {selectedLocation.challenges.map((chal, idx) => (
                        <li key={idx} className="text-sm text-stone-700 flex gap-2">
                          <span className="text-red-600 font-bold">as </span> {chal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2">Key Sectors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.keySectors.map((sector) => (
                      <span key={sector} className="px-3 py-1 bg-stone-300 text-stone-900 rounded-full text-xs font-bold">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                {getMigrationRisks().length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Migration Risks for This Location
                    </h4>
                    <ul className="space-y-1">
                      {getMigrationRisks().map((risk, idx) => (
                        <li key={idx} className="text-sm text-yellow-800">* {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* COMPARISON TABLE */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('costs')}
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              All Locations - Cost Comparison
            </h3>
            <div className="text-2xl">{expandedSections.costs ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.costs && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-stone-300">
                    <th className="text-left py-3 px-4 font-bold text-stone-900">Location</th>
                    <th className="text-center py-3 px-4 font-bold text-stone-900">Cost Index</th>
                    <th className="text-center py-3 px-4 font-bold text-stone-900">Per Employee</th>
                    <th className="text-center py-3 px-4 font-bold text-stone-900">Tax Rate</th>
                    <th className="text-center py-3 px-4 font-bold text-stone-900">Infrastructure</th>
                    <th className="text-center py-3 px-4 font-bold text-stone-900">Savings vs USA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {locations.map((loc) => (
                    <tr key={loc.name} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-900">{loc.name}</td>
                      <td className="text-center py-3 px-4">{loc.laborCostIndex}</td>
                      <td className="text-center py-3 px-4">${loc.costPerEmployee.toLocaleString()}</td>
                      <td className="text-center py-3 px-4">{loc.taxRate}%</td>
                      <td className="text-center py-3 px-4">{loc.infrastructure}/100</td>
                      <td className="text-center py-3 px-4">
                        <span className="font-bold text-green-600">{loc.savingsVsUSA}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LowCostRelocationTools;

