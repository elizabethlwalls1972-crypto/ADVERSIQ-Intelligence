/**
 * NSIL BRAIN PANEL - Visual interface for the NSIL Intelligence Hub
 * 
 * This component displays:
 * - 5 Persona analysis cards
 * - Input validation status
 * - Counterfactual scenarios
 * - Monte Carlo distribution
 * - Unified recommendation
 */

import React, { useState, useMemo } from 'react';
import { ReportParameters } from '../types';
import { NSILIntelligenceHub, IntelligenceReport, QuickAssessment } from '../services/NSILIntelligenceHub';
import { FullPersonaAnalysis } from '../services/PersonaEngine';

interface NSILBrainPanelProps {
  parameters: Partial<ReportParameters>;
  onRecommendation?: (recommendation: IntelligenceReport['recommendation']) => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const PersonaCard: React.FC<{
  persona: 'skeptic' | 'advocate' | 'regulator' | 'accountant' | 'operator';
  analysis: FullPersonaAnalysis;
}> = ({ persona, analysis }) => {
  const config = {
    skeptic: {
      title: 'The Skeptic',
      icon: '',
      color: 'red',
      description: 'Finds deal-killers and hidden risks'
    },
    advocate: {
      title: 'The Advocate',
      icon: '',
      color: 'green',
      description: 'Identifies opportunities and synergies'
    },
    regulator: {
      title: 'The Regulator',
      icon: '',
      color: 'blue',
      description: 'Checks legal and compliance requirements'
    },
    accountant: {
      title: 'The Accountant',
      icon: '',
      color: 'yellow',
      description: 'Validates financial viability'
    },
    operator: {
      title: 'The Operator',
      icon: 'as(TM)i',
      color: 'purple',
      description: 'Tests execution feasibility'
    }
  };
  
  const cfg = config[persona];
  
  // Get key metrics based on persona type
  const getMetrics = () => {
    switch (persona) {
      case 'skeptic': {
        const skepticData = analysis.skeptic;
        return {
          primary: `${skepticData.dealKillers.length} deal-killers`,
          secondary: `${skepticData.hiddenRisks.length} hidden risks`,
          status: skepticData.overallConcernLevel,
          items: [
            ...skepticData.dealKillers.map(d => ({ label: d.title, severity: d.severity })),
            ...skepticData.hiddenRisks.map(r => ({ label: r.title, severity: r.severity }))
          ]
        };
      }
      case 'advocate': {
        const advocateData = analysis.advocate;
        return {
          primary: `${advocateData.upsidePotential.length} opportunities`,
          secondary: `${advocateData.synergies.length} synergies`,
          status: advocateData.overallOpportunityLevel,
          items: [
            ...advocateData.upsidePotential.map(u => ({ label: u.title, severity: 'positive' as const })),
            ...advocateData.synergies.map(s => ({ label: s.title, severity: 'positive' as const }))
          ]
        };
      }
      case 'regulator': {
        const regulatorData = analysis.regulator;
        return {
          primary: `${regulatorData.complianceRequirements.length} requirements`,
          secondary: regulatorData.clearanceEstimate,
          status: regulatorData.sanctionsRisks.length > 0 ? 'critical' : 'clear',
          items: [
            ...regulatorData.legalIssues.map(l => ({ label: l.title, severity: l.severity })),
            ...regulatorData.sanctionsRisks.map(s => ({ label: s.title, severity: s.severity }))
          ]
        };
      }
      case 'accountant': {
        const accountantData = analysis.accountant;
        return {
          primary: accountantData.financialViability,
          secondary: `Break-even: ${accountantData.breakEvenAnalysis.timeToBreakeven}`,
          status: accountantData.financialViability,
          items: [
            ...accountantData.cashflowConcerns.map(c => ({ label: c.title, severity: c.severity })),
            ...accountantData.economicDurability.map(e => ({ label: e.title, severity: e.severity }))
          ]
        };
      }
      case 'operator': {
        const operatorData = analysis.operator;
        return {
          primary: operatorData.implementationRealism,
          secondary: `${operatorData.requiredCapabilities.length} capabilities needed`,
          status: operatorData.implementationRealism,
          items: [
            ...operatorData.executionRisks.map(e => ({ label: e.title, severity: e.severity })),
            ...operatorData.teamGaps.map(t => ({ label: t.title, severity: t.severity }))
          ]
        };
      }
    }
  };
  
  const metrics = getMetrics();
  
  const getStatusColor = (status: string) => {
    if (['critical', 'unviable', 'unrealistic', 'high'].includes(status)) return 'bg-red-500';
    if (['warning', 'marginal', 'challenging', 'medium'].includes(status)) return 'bg-yellow-500';
    if (['positive', 'strong', 'straightforward', 'low', 'clear', 'exceptional'].includes(status)) return 'bg-green-500';
    return 'bg-stone-500';
  };
  
  return (
    <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <h4 className="font-bold text-white">{cfg.title}</h4>
          <p className="text-xs text-stone-400">{cfg.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(metrics.status)}`}>
          {metrics.status}
        </span>
        <span className="text-sm text-stone-300">{metrics.primary}</span>
      </div>
      
      <p className="text-sm text-stone-400 mb-3">{metrics.secondary}</p>
      
      {metrics.items.length > 0 && (
        <div className="space-y-1">
          {metrics.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(item.severity)}`}></span>
              <span className="text-stone-300">{item.label}</span>
            </div>
          ))}
          {metrics.items.length > 3 && (
            <p className="text-xs text-stone-500">+{metrics.items.length - 3} more</p>
          )}
        </div>
      )}
    </div>
  );
};

const QuickStatusBadge: React.FC<{ assessment: QuickAssessment }> = ({ assessment }) => {
  const colors = {
    green: 'bg-green-500/20 border-green-500 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    orange: 'bg-orange-500/20 border-orange-500 text-orange-400',
    red: 'bg-red-500/20 border-red-500 text-red-400'
  };
  
  return (
    <div className={`px-4 py-3 rounded-lg border ${colors[assessment.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Trust Score</span>
        <span className="text-2xl font-bold">{assessment.trustScore}%</span>
      </div>
      <p className="text-sm">{assessment.headline}</p>
      {assessment.nextStep && (
        <p className="text-xs mt-2 opacity-80">→ {assessment.nextStep}</p>
      )}
    </div>
  );
};

const RecommendationCard: React.FC<{ recommendation: IntelligenceReport['recommendation'] }> = ({ recommendation }) => {
  const actionColors = {
    'proceed': 'bg-green-500/20 border-green-500 text-green-400',
    'proceed-with-caution': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    'revise-and-retry': 'bg-orange-500/20 border-orange-500 text-orange-400',
    'do-not-proceed': 'bg-red-500/20 border-red-500 text-red-400'
  };
  
  const actionLabels = {
    'proceed': 'PROCEED',
    'proceed-with-caution': 'PROCEED WITH CAUTION',
    'revise-and-retry': 'REVISE & RETRY',
    'do-not-proceed': 'DO NOT PROCEED'
  };
  
  return (
    <div className={`rounded-lg border p-6 ${actionColors[recommendation.action]}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">{actionLabels[recommendation.action]}</h3>
          <p className="text-sm opacity-80">Confidence: {recommendation.confidence}%</p>
        </div>
        <div className="text-5xl font-bold">{recommendation.confidence}%</div>
      </div>
      
      <p className="mb-4">{recommendation.summary}</p>
      
      {recommendation.criticalActions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <span>as!</span> Critical Actions
          </h4>
          <ul className="space-y-1">
            {recommendation.criticalActions.map((action, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-amber-500">a'</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {recommendation.keyRisks.length > 0 && (
          <div>
            <h4 className="font-bold mb-2 text-red-400">Key Risks</h4>
            <ul className="space-y-1">
              {recommendation.keyRisks.slice(0, 3).map((risk, idx) => (
                <li key={idx} className="text-xs text-stone-300">* {risk}</li>
              ))}
            </ul>
          </div>
        )}
        
        {recommendation.keyOpportunities.length > 0 && (
          <div>
            <h4 className="font-bold mb-2 text-green-400">Key Opportunities</h4>
            <ul className="space-y-1">
              {recommendation.keyOpportunities.slice(0, 3).map((opp, idx) => (
                <li key={idx} className="text-xs text-stone-300">* {opp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NSILBrainPanel: React.FC<NSILBrainPanelProps> = ({ 
  parameters, 
  onRecommendation 
}) => {
  const [fullReport, setFullReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'personas' | 'scenarios' | 'validation'>('overview');
  
  // Compute quick assessment synchronously using useMemo (no setState needed)
  const quickAssessment = useMemo(() => {
    if (parameters && Object.keys(parameters).length > 0) {
      return NSILIntelligenceHub.quickAssess(parameters);
    }
    return null;
  }, [parameters]);
  
  const runFullAnalysis = async () => {
    setLoading(true);
    try {
      const report = await NSILIntelligenceHub.runFullAnalysis(parameters);
      setFullReport(report);
      onRecommendation?.(report.recommendation);
    } catch (error) {
      console.error('Intelligence analysis failed:', error);
    }
    setLoading(false);
  };
  
  return (
    <div className="bg-stone-900 rounded-lg border border-stone-700 overflow-hidden">
      {/* Header */}
      <div className="bg-stone-800 px-6 py-4 border-b border-stone-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📊 </span>
              NSIL Intelligence Hub
            </h2>
            <p className="text-sm text-stone-400">Multi-Perspective Analysis Engine</p>
          </div>
          
          <button
            onClick={runFullAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Run Full Analysis'}
          </button>
        </div>
        
        {/* Quick Status */}
        {quickAssessment && (
          <div className="mt-4">
            <QuickStatusBadge assessment={quickAssessment} />
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-stone-700">
        {['overview', 'personas', 'scenarios', 'validation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {!fullReport && !loading && (
          <div className="text-center py-12 text-stone-400">
            <p className="text-xl mb-2">📋</p>
            <p>Click "Run Full Analysis" to activate the intelligence engine</p>
            <p className="text-sm mt-2">
              The 5 personas will analyze your inputs from different perspectives
            </p>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-stone-400">Running multi-persona analysis...</p>
            <p className="text-sm text-stone-500">Skeptic * Advocate * Regulator * Accountant * Operator</p>
          </div>
        )}
        
        {fullReport && !loading && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <RecommendationCard recommendation={fullReport.recommendation} />
                
                {/* Processing Stats */}
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span>i Processed in {fullReport.processingTime}ms</span>
                  <span>📊 {fullReport.componentsRun.length} components</span>
                  <span>📊 {fullReport.applicableInsights.length} insights applied</span>
                </div>
              </div>
            )}
            
            {/* Personas Tab */}
            {activeTab === 'personas' && fullReport.personaAnalysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PersonaCard persona="skeptic" analysis={fullReport.personaAnalysis} />
                  <PersonaCard persona="advocate" analysis={fullReport.personaAnalysis} />
                  <PersonaCard persona="regulator" analysis={fullReport.personaAnalysis} />
                  <PersonaCard persona="accountant" analysis={fullReport.personaAnalysis} />
                  <PersonaCard persona="operator" analysis={fullReport.personaAnalysis} />
                </div>
                
                {/* Debate Synthesis */}
                {fullReport.personaAnalysis.synthesis.disagreements.length > 0 && (
                  <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                    <h4 className="font-bold text-white mb-3">⭐ Debate Summary</h4>
                    {fullReport.personaAnalysis.synthesis.disagreements.map((disagreement, idx) => (
                      <div key={idx} className="mb-3">
                        <p className="text-sm text-stone-300 mb-2">{disagreement.topic}</p>
                        <div className="flex flex-wrap gap-2">
                          {disagreement.positions.map((pos, pidx) => (
                            <span key={pidx} className="text-xs bg-stone-700 px-2 py-1 rounded">
                              <strong>{pos.persona}:</strong> {pos.position}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Scenarios Tab */}
            {activeTab === 'scenarios' && fullReport.counterfactual && (
              <div className="space-y-6">
                {/* Monte Carlo Distribution */}
                <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                  <h4 className="font-bold text-white mb-3">📈 Monte Carlo Simulation</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-stone-400">P10 (Pessimistic)</p>
                      <p className="text-lg font-bold text-red-400">
                        ${(fullReport.counterfactual.monteCarlo.distribution.p10 / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-stone-400">P50 (Expected)</p>
                      <p className="text-lg font-bold text-amber-400">
                        ${(fullReport.counterfactual.monteCarlo.distribution.p50 / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-stone-400">P90 (Optimistic)</p>
                      <p className="text-lg font-bold text-green-400">
                        ${(fullReport.counterfactual.monteCarlo.distribution.p90 / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-stone-400">
                    <p>📄 Probability of Loss: {fullReport.counterfactual.monteCarlo.probabilityOfLoss.toFixed(1)}%</p>
                    <p>⭐ Probability of Target Return: {fullReport.counterfactual.monteCarlo.probabilityOfTargetReturn.toFixed(1)}%</p>
                  </div>
                </div>
                
                {/* Alternative Scenarios */}
                <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                  <h4 className="font-bold text-white mb-3">📄" Alternative Scenarios</h4>
                  <div className="space-y-3">
                    {fullReport.counterfactual.alternativeScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-stone-700/50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{scenario.name}</span>
                          <span className="text-xs bg-stone-600 px-2 py-1 rounded">
                            {scenario.probability}% probability
                          </span>
                        </div>
                        <p className="text-sm text-stone-400 mb-2">{scenario.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.keyDifferences.slice(0, 2).map((diff, idx) => (
                            <span key={idx} className="text-xs text-stone-500">* {diff}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Regret Analysis */}
                <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                  <h4 className="font-bold text-white mb-3">📄 Regret Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-400">Do-Nothing Cost</p>
                      <p className="text-white font-medium">
                        ${(fullReport.counterfactual.regretAnalysis.doNothingCost / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400">Reversibility Window</p>
                      <p className="text-white font-medium">
                        {fullReport.counterfactual.regretAnalysis.reversibilityWindow}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone-400">
                    {fullReport.counterfactual.regretAnalysis.opportunityCost}
                  </p>
                </div>
              </div>
            )}
            
            {/* Validation Tab */}
            {activeTab === 'validation' && (
              <div className="space-y-6">
                {/* Overall Trust */}
                <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white">●!i Input Validation Shield</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      fullReport.inputValidation.overallStatus === 'trusted' ? 'bg-green-500/20 text-green-400' :
                      fullReport.inputValidation.overallStatus === 'cautionary' ? 'bg-yellow-500/20 text-yellow-400' :
                      fullReport.inputValidation.overallStatus === 'suspicious' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {fullReport.inputValidation.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-400">Trust Score</span>
                      <span className="text-white">{fullReport.inputValidation.overallTrust}%</span>
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          fullReport.inputValidation.overallTrust >= 70 ? 'bg-green-500' :
                          fullReport.inputValidation.overallTrust >= 50 ? 'bg-yellow-500' :
                          fullReport.inputValidation.overallTrust >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${fullReport.inputValidation.overallTrust}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Validation Results */}
                <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                  <h4 className="font-bold text-white mb-3">Validation Results</h4>
                  <div className="space-y-2">
                    {fullReport.inputValidation.validationResults.map((result, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className={`w-2 h-2 rounded-full ${
                          result.flag === 'clean' ? 'bg-green-500' :
                          result.flag === 'warning' ? 'bg-yellow-500' :
                          result.flag === 'concern' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></span>
                        <span className="text-stone-400">{result.field}:</span>
                        <span className="text-stone-300">{result.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pattern Matches */}
                {fullReport.inputValidation.patternMatches.length > 0 && (
                  <div className="bg-stone-800 rounded-lg p-4 border border-stone-700">
                    <h4 className="font-bold text-white mb-3">as i Pattern Matches</h4>
                    <div className="space-y-2">
                      {fullReport.inputValidation.patternMatches.map((pattern, idx) => (
                        <div key={idx} className={`p-3 rounded text-sm ${
                          pattern.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          <strong>{pattern.pattern}:</strong> {pattern.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fingerprint */}
                <div className="text-xs text-stone-500 text-center">
                  Input Fingerprint: {fullReport.inputValidation.inputFingerprint}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NSILBrainPanel;

