import React, { useState } from 'react';
import { Globe, TrendingUp, DollarSign, Zap, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface MarketComparison {
  country: string;
  taxRate: number;
  laborCost: number;
  infrastructureScore: number;
  regulatoryFriction: number;
  politicalStability: number;
  availableIncentives: string[];
  specialEconomicZones: boolean;
  nearshoreAdvantage: string;
  costOfDoing: number;
  laborPool: number;
}

const GlobalMarketComparison: React.FC = () => {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['Vietnam', 'Poland', 'Mexico', 'Singapore']);
  const [comparisonDimension, setComparisonDimension] = useState<'cost' | 'opportunity' | 'risk' | 'incentives'>('cost');
  const [newMarket, setNewMarket] = useState('');

  const marketData: Record<string, MarketComparison> = {
    'Vietnam': {
      country: 'Vietnam',
      taxRate: 10,
      laborCost: 3,
      infrastructureScore: 72,
      regulatoryFriction: 45,
      politicalStability: 65,
      availableIncentives: ['FDI Tax Holiday', 'Land Incentives', 'Tariff Exemptions'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'ASEAN hub',
      costOfDoing: 25000,
      laborPool: 95
    },
    'Poland': {
      country: 'Poland',
      taxRate: 19,
      laborCost: 12,
      infrastructureScore: 85,
      regulatoryFriction: 25,
      politicalStability: 78,
      availableIncentives: ['EU Grants', 'Tax Credits', 'R&D Subsidies'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'EU nearshoring',
      costOfDoing: 45000,
      laborPool: 85
    },
    'Mexico': {
      country: 'Mexico',
      taxRate: 30,
      laborCost: 8,
      infrastructureScore: 68,
      regulatoryFriction: 50,
      politicalStability: 55,
      availableIncentives: ['USMCA Benefits', 'Maquila Program', 'IPP'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'US market proximity',
      costOfDoing: 35000,
      laborPool: 90
    },
    'Singapore': {
      country: 'Singapore',
      taxRate: 5,
      laborCost: 45,
      infrastructureScore: 98,
      regulatoryFriction: 10,
      politicalStability: 95,
      availableIncentives: ['Pioneer Status', 'Expansion Grants', 'Tech Incentives'],
      specialEconomicZones: false,
      nearshoreAdvantage: 'ASEAN gateway',
      costOfDoing: 120000,
      laborPool: 60
    },
    'India': {
      country: 'India',
      taxRate: 30,
      laborCost: 2,
      infrastructureScore: 65,
      regulatoryFriction: 60,
      politicalStability: 70,
      availableIncentives: ['Make in India', 'PLI Scheme', 'GST Incentives'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'Talent pool',
      costOfDoing: 15000,
      laborPool: 98
    },
    'Brazil': {
      country: 'Brazil',
      taxRate: 34,
      laborCost: 15,
      infrastructureScore: 60,
      regulatoryFriction: 65,
      politicalStability: 60,
      availableIncentives: ['SUDENE Incentives', 'Tax Holidays'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'Latin America hub',
      costOfDoing: 50000,
      laborPool: 88
    },
    'UAE': {
      country: 'UAE',
      taxRate: 0,
      laborCost: 25,
      infrastructureScore: 95,
      regulatoryFriction: 20,
      politicalStability: 90,
      availableIncentives: ['100% Ownership', 'No Corporate Tax', 'Visa Incentives'],
      specialEconomicZones: true,
      nearshoreAdvantage: 'Middle East gateway',
      costOfDoing: 100000,
      laborPool: 70
    }
  };

  const addMarket = () => {
    if (newMarket && !selectedMarkets.includes(newMarket)) {
      setSelectedMarkets([...selectedMarkets, newMarket]);
      setNewMarket('');
    }
  };

  const removeMarket = (country: string) => {
    setSelectedMarkets(selectedMarkets.filter(m => m !== country));
  };

  const getScoreColor = (score: number, isLowBetter: boolean = false) => {
    const compareScore = isLowBetter ? 100 - score : score;
    if (compareScore >= 75) return 'text-green-600 bg-green-50';
    if (compareScore >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderComparisonTable = () => {
    const markets = selectedMarkets
      .map(m => marketData[m])
      .filter(m => m) as MarketComparison[];

    if (comparisonDimension === 'cost') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200">
                <th className="px-4 py-3 text-left font-bold text-stone-900">Market</th>
                <th className="px-4 py-3 text-center font-bold text-stone-900">Tax Rate</th>
                <th className="px-4 py-3 text-center font-bold text-stone-900">Avg Labor/hr</th>
                <th className="px-4 py-3 text-center font-bold text-stone-900">Startup Cost</th>
                <th className="px-4 py-3 text-center font-bold text-stone-900">Cost Index</th>
              </tr>
            </thead>
            <tbody>
              {markets.sort((a, b) => a.costOfDoing - b.costOfDoing).map(m => (
                <tr key={m.country} className="border-b border-stone-200 hover:bg-stone-50">
                  <td className="px-4 py-3 font-bold text-stone-900">{m.country}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded ${getScoreColor(m.taxRate, true)}`}>{m.taxRate}%</span></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded ${getScoreColor(m.laborCost * 10, true)}`}>${m.laborCost}</span></td>
                  <td className="px-4 py-3 text-center font-mono">${(m.costOfDoing / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-center">
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (m.costOfDoing / 150000) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (comparisonDimension === 'opportunity') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {markets.map(m => (
            <div key={m.country} className="p-4 border border-stone-200 rounded-lg bg-white">
              <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" /> {m.country}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Labor Pool</span>
                  <span className="font-bold">{m.laborPool}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Infrastructure</span>
                  <span className="font-bold">{m.infrastructureScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Nearshore Advantage</span>
                  <span className="font-bold text-blue-600">{m.nearshoreAdvantage}</span>
                </div>
                {m.specialEconomicZones && (
                  <div className="bg-green-50 px-2 py-1 rounded text-green-800 text-xs font-bold">✓ SEZ Available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (comparisonDimension === 'risk') {
      return (
        <div className="space-y-3">
          {markets.map(m => (
            <div key={m.country} className="p-4 border border-stone-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-900">{m.country}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${m.politicalStability > 75 ? 'bg-green-100 text-green-800' : m.politicalStability > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {m.politicalStability > 75 ? 'LOW RISK' : m.politicalStability > 60 ? 'MODERATE RISK' : 'HIGH RISK'}
                </span>
              </div>
              <div className="space-y-1 text-xs text-stone-600">
                <div>Political Stability: {m.politicalStability}/100</div>
                <div>Regulatory Friction: {m.regulatoryFriction}/100</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (comparisonDimension === 'incentives') {
      return (
        <div className="grid md:grid-cols-2 gap-4">
          {markets.map(m => (
            <div key={m.country} className="p-4 border border-stone-200 rounded-lg bg-white">
              <h4 className="font-bold text-stone-900 mb-3">{m.country}</h4>
              <div className="space-y-2">
                {m.availableIncentives.map((inc, idx) => (
                  <div key={idx} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-bold text-blue-800">
                    ✓ {inc}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Global Market Comparison
          </h2>
          <div className="text-xs text-stone-500">Compare cost, opportunity, risk, and incentives across regions</div>
        </div>

        {/* MARKET SELECTOR */}
        <div className="mb-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3 block">Select Markets to Compare</label>
          <div className="flex gap-2 mb-4">
            <select
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Add another market...</option>
              {Object.keys(marketData).map(country => (
                !selectedMarkets.includes(country) && (
                  <option key={country} value={country}>{country}</option>
                )
              ))}
            </select>
            <button
              onClick={addMarket}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedMarkets.map(market => (
              <div key={market} className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg text-sm font-bold text-blue-900 flex items-center gap-2">
                {market}
                <Trash2
                  className="w-4 h-4 cursor-pointer hover:text-red-600"
                  onClick={() => removeMarket(market)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* DIMENSION SELECTOR */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {[
            { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
            { id: 'opportunity', label: 'Opportunity', icon: TrendingUp },
            { id: 'risk', label: 'Risk Profile', icon: AlertCircle },
            { id: 'incentives', label: 'Incentives', icon: Zap }
          ].map(dim => (
            <button
              key={dim.id}
              onClick={() => setComparisonDimension(dim.id as any)}
              className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                comparisonDimension === dim.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <dim.icon className="w-4 h-4" />
              {dim.label}
            </button>
          ))}
        </div>

        {/* COMPARISON VIEW */}
        <div className="bg-white p-4 rounded-lg border border-stone-200 overflow-y-auto">
          {renderComparisonTable()}
        </div>
      </div>

      {/* ACTION PANEL */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-2">💡 Lowest Cost Option</h3>
          <p className="text-sm text-stone-600">
            India offers the lowest total cost of entry at ~$15k with exceptional labor pool (98%) and tailored government incentives.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-2">⭐ Best Overall Balance</h3>
          <p className="text-sm text-stone-600">
            Vietnam provides optimal cost-to-opportunity balance with strong infrastructure, government backing, and ASEAN positioning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalMarketComparison;

