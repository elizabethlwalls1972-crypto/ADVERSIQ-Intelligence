import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Zap, AlertCircle, CheckCircle, BarChart3, GitCompare, Download, Eye } from 'lucide-react';

interface Scenario {
  name: string;
  description: string;
  color: string;
  assumptions: {
    revenueGrowth: number;
    operatingMargin: number;
    capitalInvestment: number;
    timeToProfit: number;
    riskLevel: string;
  };
}

interface ScenarioResults {
  year1Revenue: number;
  year3Revenue: number;
  year5Revenue: number;
  cumulativeProfit: number;
  irr: number;
  paybackPeriod: number;
  riskScore: number;
}

const MultiScenarioPlanner: React.FC = () => {
  const [scenarios, setScenarios] = useState<{ [key: string]: Scenario }>({
    bestCase: {
      name: 'Best Case',
      description: 'Aggressive expansion with rapid market penetration',
      color: 'green',
      assumptions: {
        revenueGrowth: 0.45,
        operatingMargin: 0.35,
        capitalInvestment: 5000000,
        timeToProfit: 8,
        riskLevel: 'High'
      }
    },
    realistic: {
      name: 'Realistic',
      description: 'Balanced growth with moderate expansion',
      color: 'blue',
      assumptions: {
        revenueGrowth: 0.25,
        operatingMargin: 0.22,
        capitalInvestment: 3000000,
        timeToProfit: 14,
        riskLevel: 'Medium'
      }
    },
    worstCase: {
      name: 'Worst Case',
      description: 'Conservative scenario with market challenges',
      color: 'red',
      assumptions: {
        revenueGrowth: 0.08,
        operatingMargin: 0.10,
        capitalInvestment: 1500000,
        timeToProfit: 24,
        riskLevel: 'Low'
      }
    }
  });

  const [baselineRevenue] = useState(10000000);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['realistic', 'bestCase', 'worstCase']);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    scenarios: true,
    comparison: true,
    sensitivity: true,
    decisionSupport: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateScenarioResults = (scenario: Scenario): ScenarioResults => {
    const { revenueGrowth, operatingMargin, capitalInvestment, timeToProfit } = scenario.assumptions;

    const year1Revenue = baselineRevenue * (1 + revenueGrowth * 0.5);
    const year3Revenue = baselineRevenue * Math.pow(1 + revenueGrowth, 3);
    const year5Revenue = baselineRevenue * Math.pow(1 + revenueGrowth, 5);

    const year1Profit = year1Revenue * operatingMargin;
    const year3Profit = year3Revenue * operatingMargin;
    const year5Profit = year5Revenue * operatingMargin;

    const cumulativeProfit = year1Profit + year3Profit * 2 + year5Profit * 2 - capitalInvestment;

    const irr = calculateIRR(capitalInvestment, [year1Profit, year3Profit, year3Profit, year5Profit, year5Profit]) * 100;

    const paybackPeriod = capitalInvestment / (year1Profit || 1);

    const riskScore = scenario.assumptions.riskLevel === 'High' ? 75 : scenario.assumptions.riskLevel === 'Medium' ? 50 : 25;

    return {
      year1Revenue: Math.round(year1Revenue),
      year3Revenue: Math.round(year3Revenue),
      year5Revenue: Math.round(year5Revenue),
      cumulativeProfit: Math.round(cumulativeProfit),
      irr: Math.round(irr * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      riskScore
    };
  };

  const calculateIRR = (investment: number, cashFlows: number[]): number => {
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = -investment;
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j + 1);
      }
      if (Math.abs(npv) < 1000) break;
      rate = rate - npv / 1000000;
    }
    return rate;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getColorClass = (color: string): { bg: string; border: string; text: string; light: string } => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string; light: string } } = {
      green: { bg: 'bg-green-600', border: 'border-green-300', text: 'text-green-900', light: 'bg-green-50' },
      blue: { bg: 'bg-blue-600', border: 'border-blue-300', text: 'text-blue-900', light: 'bg-blue-50' },
      red: { bg: 'bg-red-600', border: 'border-red-300', text: 'text-red-900', light: 'bg-red-50' }
    };
    return colorMap[color] || colorMap['blue'];
  };

  const handleExportComparison = () => {
    let csv = 'Scenario Comparison\n\n';
    csv += 'Metric,' + selectedScenarios.map(s => scenarios[s].name).join(',') + '\n';
    
    const results = selectedScenarios.map(s => calculateScenarioResults(scenarios[s]));
    
    csv += 'Year 1 Revenue,' + results.map(r => r.year1Revenue).join(',') + '\n';
    csv += 'Year 3 Revenue,' + results.map(r => r.year3Revenue).join(',') + '\n';
    csv += 'Year 5 Revenue,' + results.map(r => r.year5Revenue).join(',') + '\n';
    csv += 'Cumulative Profit,' + results.map(r => r.cumulativeProfit).join(',') + '\n';
    csv += 'IRR (%),' + results.map(r => r.irr).join(',') + '\n';
    csv += 'Payback Period (years),' + results.map(r => r.paybackPeriod).join(',') + '\n';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'scenario-comparison.csv');
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
            <GitCompare className="w-8 h-8 text-purple-600" />
            Multi-Scenario Planning
          </h2>
          <p className="text-stone-600">Model and compare Best Case, Realistic, and Worst Case scenarios with full financial analysis</p>
        </div>

        {/* SCENARIO CONFIGURATION */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('scenarios')}
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Scenario Assumptions & Parameters
            </h3>
            <div className="text-2xl">{expandedSections.scenarios ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.scenarios && (
            <div className="p-6 space-y-6">
              {Object.entries(scenarios).map(([key, scenario]) => {
                const colors = getColorClass(scenario.color);
                return (
                  <div key={key} className={`${colors.light} border-2 ${colors.border} rounded-lg p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>
                        <h4 className={`text-lg font-bold ${colors.text}`}>{scenario.name}</h4>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScenarios([...selectedScenarios, key]);
                          } else {
                            setSelectedScenarios(selectedScenarios.filter(s => s !== key));
                          }
                        }}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                    <p className={`text-sm ${colors.text} mb-4`}>{scenario.description}</p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded border border-stone-200 p-3">
                        <label className="block text-xs font-bold text-stone-700 mb-1">Annual Revenue Growth</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="0.60"
                            step="0.01"
                            value={scenario.assumptions.revenueGrowth}
                            onChange={(e) => {
                              const newScenarios = { ...scenarios };
                              newScenarios[key].assumptions.revenueGrowth = parseFloat(e.target.value);
                              setScenarios(newScenarios);
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold text-stone-900 min-w-12 text-right">{(scenario.assumptions.revenueGrowth * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="bg-white rounded border border-stone-200 p-3">
                        <label className="block text-xs font-bold text-stone-700 mb-1">Operating Margin</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="0.50"
                            step="0.01"
                            value={scenario.assumptions.operatingMargin}
                            onChange={(e) => {
                              const newScenarios = { ...scenarios };
                              newScenarios[key].assumptions.operatingMargin = parseFloat(e.target.value);
                              setScenarios(newScenarios);
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold text-stone-900 min-w-12 text-right">{(scenario.assumptions.operatingMargin * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="bg-white rounded border border-stone-200 p-3">
                        <label className="block text-xs font-bold text-stone-700 mb-1">Capital Investment</label>
                        <input
                          type="number"
                          value={scenario.assumptions.capitalInvestment}
                          onChange={(e) => {
                            const newScenarios = { ...scenarios };
                            newScenarios[key].assumptions.capitalInvestment = parseFloat(e.target.value);
                            setScenarios(newScenarios);
                          }}
                          className="w-full px-2 py-1 text-xs border border-stone-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDE-BY-SIDE COMPARISON */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('comparison')}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Financial Comparison Matrix
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportComparison();
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">Export</span>
              </button>
              <div className="text-2xl">{expandedSections.comparison ? 'a-1/4' : 'a-'}</div>
            </div>
          </div>

          {expandedSections.comparison && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-stone-300">
                    <th className="text-left py-3 px-4 font-bold text-stone-900">Metric</th>
                    {selectedScenarios.map((s) => (
                      <th key={s} className="text-center py-3 px-4 font-bold">
                        <div className={`flex items-center justify-center gap-2`}>
                          <div className={`w-3 h-3 rounded-full ${getColorClass(scenarios[s].color).bg}`}></div>
                          {scenarios[s].name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {[
                    { label: 'Year 1 Revenue', key: 'year1Revenue', icon: TrendingUp },
                    { label: 'Year 3 Revenue', key: 'year3Revenue', icon: TrendingUp },
                    { label: 'Year 5 Revenue', key: 'year5Revenue', icon: TrendingUp },
                    { label: 'Cumulative Profit', key: 'cumulativeProfit', icon: CheckCircle },
                    { label: 'IRR (%)', key: 'irr', icon: TrendingUp },
                    { label: 'Payback Period (yrs)', key: 'paybackPeriod', icon: AlertCircle },
                    { label: 'Risk Score', key: 'riskScore', icon: AlertCircle }
                  ].map((metric) => (
                    <tr key={metric.key} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-bold text-stone-900">{metric.label}</td>
                      {selectedScenarios.map((s) => {
                        const result = calculateScenarioResults(scenarios[s]);
                        const value = (result as any)[metric.key];
                        const displayValue = metric.key.includes('year') || metric.key === 'cumulativeProfit' 
                          ? formatCurrency(value) 
                          : metric.key === 'paybackPeriod'
                          ? value.toFixed(1)
                          : value.toFixed(1);

                        return (
                          <td key={`${s}-${metric.key}`} className="text-center py-3 px-4 text-stone-900 font-semibold">
                            {displayValue}
                            {metric.key === 'irr' && '%'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SENSITIVITY ANALYSIS */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('sensitivity')}
        >
          <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Sensitivity Analysis (Realistic Scenario)
            </h3>
            <div className="text-2xl">{expandedSections.sensitivity ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.sensitivity && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-600 mb-4">Impact on 5-year cumulative profit if key variables change by +/-10%:</p>
              
              {['Revenue Growth', 'Operating Margin', 'Capital Investment'].map((variable, idx) => {
                const baselineResult = calculateScenarioResults(scenarios['realistic']);
                const baseline = baselineResult.cumulativeProfit;
                
                let impactPositive = baseline;
                let impactNegative = baseline;

                if (variable === 'Revenue Growth') {
                  const upScenario = { ...scenarios['realistic'] };
                  upScenario.assumptions.revenueGrowth *= 1.1;
                  impactPositive = calculateScenarioResults(upScenario).cumulativeProfit;
                  
                  const downScenario = { ...scenarios['realistic'] };
                  downScenario.assumptions.revenueGrowth *= 0.9;
                  impactNegative = calculateScenarioResults(downScenario).cumulativeProfit;
                } else if (variable === 'Operating Margin') {
                  const upScenario = { ...scenarios['realistic'] };
                  upScenario.assumptions.operatingMargin *= 1.1;
                  impactPositive = calculateScenarioResults(upScenario).cumulativeProfit;
                  
                  const downScenario = { ...scenarios['realistic'] };
                  downScenario.assumptions.operatingMargin *= 0.9;
                  impactNegative = calculateScenarioResults(downScenario).cumulativeProfit;
                } else {
                  const upScenario = { ...scenarios['realistic'] };
                  upScenario.assumptions.capitalInvestment *= 1.1;
                  impactPositive = calculateScenarioResults(upScenario).cumulativeProfit;
                  
                  const downScenario = { ...scenarios['realistic'] };
                  downScenario.assumptions.capitalInvestment *= 0.9;
                  impactNegative = calculateScenarioResults(downScenario).cumulativeProfit;
                }

                const changePositive = impactPositive - baseline;
                const changeNegative = impactNegative - baseline;
                const maxChange = Math.max(Math.abs(changePositive), Math.abs(changeNegative));

                return (
                  <div key={idx} className="bg-stone-50 rounded-lg border border-stone-200 p-4">
                    <h4 className="font-bold text-stone-900 mb-3">{variable}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs font-bold text-stone-700">+10%:</div>
                        <div className="flex-1 h-6 bg-white border border-stone-300 rounded relative overflow-hidden">
                          <div
                            className="h-full bg-green-500 absolute"
                            style={{ width: `${Math.max(0, (changePositive / maxChange) * 100 * 0.5 + 50)}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-right text-xs font-bold text-green-700">
                          {changePositive > 0 ? '+' : ''}{formatCurrency(changePositive)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs font-bold text-stone-700">-10%:</div>
                        <div className="flex-1 h-6 bg-white border border-stone-300 rounded relative overflow-hidden">
                          <div
                            className="h-full bg-red-500 absolute"
                            style={{ width: `${Math.max(0, (Math.abs(changeNegative) / maxChange) * 100 * 0.5 + 50)}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-right text-xs font-bold text-red-700">
                          {changeNegative > 0 ? '+' : ''}{formatCurrency(changeNegative)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DECISION SUPPORT */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('decisionSupport')}
        >
          <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Decision Support & Recommendations
            </h3>
            <div className="text-2xl">{expandedSections.decisionSupport ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.decisionSupport && (
            <div className="p-6 space-y-6">
              {selectedScenarios.map((s) => {
                const scenario = scenarios[s];
                const result = calculateScenarioResults(scenario);
                const colors = getColorClass(scenario.color);

                const recommendation = result.irr > 25 ? 'STRONG GO' 
                  : result.irr > 15 ? 'GO WITH CONDITIONS'
                  : result.irr > 5 ? 'PROCEED CAUTIOUSLY'
                  : 'RECONSIDER';

                const recommendationColor = recommendation === 'STRONG GO' ? 'bg-green-100 text-green-900'
                  : recommendation === 'GO WITH CONDITIONS' ? 'bg-blue-100 text-blue-900'
                  : recommendation === 'PROCEED CAUTIOUSLY' ? 'bg-yellow-100 text-yellow-900'
                  : 'bg-red-100 text-red-900';

                return (
                  <div key={s} className={`${colors.light} border-2 ${colors.border} rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-4">
                      <h4 className={`text-lg font-bold ${colors.text}`}>{scenario.name}</h4>
                      <div className={`${recommendationColor} px-3 py-1 rounded-lg font-bold text-sm`}>
                        {recommendation}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded p-3">
                        <div className="text-xs font-bold text-stone-700">5-Yr Cumulative Profit</div>
                        <div className={`text-xl font-black ${result.cumulativeProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(result.cumulativeProfit)}
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="text-xs font-bold text-stone-700">Internal Rate of Return</div>
                        <div className="text-xl font-black text-blue-600">{result.irr.toFixed(1)}%</div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="text-xs font-bold text-stone-700">Payback Period</div>
                        <div className="text-xl font-black text-purple-600">{result.paybackPeriod.toFixed(1)} years</div>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 text-sm">
                      <div className="font-bold text-stone-900 mb-2">Key Takeaways:</div>
                      <ul className="space-y-1 text-stone-700">
                        <li>* Year 5 revenue projected at {formatCurrency(result.year5Revenue)} ({((result.year5Revenue / baselineRevenue - 1) * 100).toFixed(0)}% growth)</li>
                        <li>* Break-even on capital investment in {result.paybackPeriod.toFixed(1)} years</li>
                        <li>* Risk level: {scenario.assumptions.riskLevel} (Score: {result.riskScore}/100)</li>
                        <li>* Recommend {recommendation === 'STRONG GO' ? 'proceeding immediately' 
                          : recommendation === 'GO WITH CONDITIONS' ? 'proceeding with risk mitigation'
                          : recommendation === 'PROCEED CAUTIOUSLY' ? 'further market validation'
                          : 'revisiting assumptions before committing'}</li>
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MultiScenarioPlanner;

