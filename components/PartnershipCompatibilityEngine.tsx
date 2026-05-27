import React, { useState } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, Heart, Shield, Target } from 'lucide-react';

interface CompatibilityDimension {
  name: string;
  weight: number;
  score: number;
  greenFlags: string[];
  redFlags: string[];
}

interface CompatibilityResult {
  overallScore: number;
  recommendation: 'Strong Go' | 'Proceed with Caution' | 'Hard Pass';
  dimensions: CompatibilityDimension[];
  synergies: string[];
  risks: string[];
  nextSteps: string[];
}

interface PartnershipCompatibilityProps {
  yourEntity: any;
  targetPartner: any;
}

const PartnershipCompatibilityEngine: React.FC<PartnershipCompatibilityProps> = ({
  yourEntity,
  targetPartner
}) => {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateCompatibility = () => {
    setLoading(true);

    // Simulate compatibility analysis
    setTimeout(() => {
      const dimensions: CompatibilityDimension[] = [
        {
          name: 'Strategic Alignment',
          weight: 25,
          score: 85,
          greenFlags: [
            'Both expanding into ASEAN',
            'Complementary value chains',
            'Shared risk tolerance'
          ],
          redFlags: []
        },
        {
          name: 'Financial Stability',
          weight: 20,
          score: 90,
          greenFlags: [
            'Both over $100M revenue',
            'Strong credit ratings',
            'Sustainable unit economics'
          ],
          redFlags: []
        },
        {
          name: 'Operational Compatibility',
          weight: 20,
          score: 72,
          greenFlags: [
            'Both use modern tech stack',
            'Complementary capabilities'
          ],
          redFlags: [
            'Different decision speeds',
            'Legacy system dependencies'
          ]
        },
        {
          name: 'Cultural & Values Fit',
          weight: 20,
          score: 78,
          greenFlags: [
            'Both committed to sustainability',
            'Similar governance standards'
          ],
          redFlags: [
            'Different communication styles'
          ]
        },
        {
          name: 'Legal & Regulatory',
          weight: 15,
          score: 88,
          greenFlags: [
            'Both have regulatory expertise',
            'No sanction conflicts',
            'Compatible IP frameworks'
          ],
          redFlags: []
        }
      ];

      const overallScore = Math.round(
        dimensions.reduce((sum, d) => sum + (d.score * d.weight / 100), 0)
      );

      const recommendation = overallScore >= 80 ? 'Strong Go' : overallScore >= 65 ? 'Proceed with Caution' : 'Hard Pass';

      setResult({
        overallScore,
        recommendation,
        dimensions,
        synergies: [
          'Combined market reach into 15 new territories',
          'Operational cost reduction of 18-22%',
          'Accelerated product development timeline',
          'Reduced capital requirements through JV structure'
        ],
        risks: [
          'Integration complexity with legacy systems',
          'Potential decision-making friction',
          'Currency exposure in volatile regions'
        ],
        nextSteps: [
          'Schedule C-suite alignment meeting',
          'Exchange detailed financials under NDA',
          'Conduct technical due diligence',
          'Draft MOU with key terms'
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Partnership Compatibility Assessment
          </h2>
          <p className="text-stone-600">
            Deep analysis of strategic, financial, operational, and cultural fit between entities
          </p>
        </div>

        {/* ENTITY INFO */}
        <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3">Your Entity</h3>
            <div className="space-y-2">
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-bold text-blue-900">{yourEntity?.legalName || 'Your Organization'}</div>
                <div className="text-xs text-blue-700">{yourEntity?.country || 'Location'} * {yourEntity?.industry || 'Industry'}</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3">Target Partner</h3>
            <div className="space-y-2">
              <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm font-bold text-purple-900">{targetPartner?.name || 'Partner Organization'}</div>
                <div className="text-xs text-purple-700">{targetPartner?.country || 'Location'} * {targetPartner?.type || 'Type'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        {!result && (
          <div className="p-6 text-center border-b border-stone-200">
            <button
              onClick={calculateCompatibility}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing Compatibility...' : 'Run Compatibility Analysis'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <>
            {/* OVERALL SCORE */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-stone-200">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs text-stone-600 uppercase font-bold tracking-wider mb-1">Compatibility Score</div>
                  <div className="text-5xl font-black text-stone-900">{result.overallScore}</div>
                  <div className="text-sm text-stone-600">/100</div>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    result.recommendation === 'Strong Go' ? 'bg-green-100 text-green-800' :
                    result.recommendation === 'Proceed with Caution' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.recommendation}
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    result.overallScore >= 80 ? 'bg-green-600' :
                    result.overallScore >= 65 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${result.overallScore}%` }}
                ></div>
              </div>
            </div>

            {/* DIMENSIONS */}
            <div className="p-6 space-y-4 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900">Compatibility Dimensions</h3>
              {result.dimensions.map((dim, idx) => (
                <div key={idx} className="p-4 border border-stone-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-stone-900">{dim.name}</h4>
                      <div className="text-xs text-stone-500">Weight: {dim.weight}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-stone-900">{dim.score}</div>
                      <div className="text-xs text-stone-500">/100</div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-2 rounded-full ${
                        dim.score >= 80 ? 'bg-green-500' :
                        dim.score >= 65 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    ></div>
                  </div>

                  {dim.greenFlags.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Green Flags
                      </div>
                      <ul className="space-y-1">
                        {dim.greenFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-green-700 pl-5 relative">
                            <span className="absolute left-0">✓</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dim.redFlags.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Red Flags
                      </div>
                      <ul className="space-y-1">
                        {dim.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-red-700 pl-5 relative">
                            <span className="absolute left-0">as </span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SYNERGIES & RISKS */}
            <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Key Synergies
                </h3>
                <ul className="space-y-2">
                  {result.synergies.map((synergy, idx) => (
                    <li key={idx} className="text-sm text-stone-700 pl-5 relative">
                      <span className="absolute left-0 text-green-600">+</span> {synergy}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Key Risks
                </h3>
                <ul className="space-y-2">
                  {result.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-stone-700 pl-5 relative">
                      <span className="absolute left-0 text-red-600">as </span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NEXT STEPS */}
            <div className="p-6">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Recommended Next Steps
              </h3>
              <div className="space-y-2">
                {result.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-stone-700">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-6 bg-stone-50 border-t border-stone-200 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                Generate Deal Dossier
              </button>
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 border border-stone-200 rounded-lg font-bold text-stone-700 hover:bg-stone-100"
              >
                New Analysis
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnershipCompatibilityEngine;

