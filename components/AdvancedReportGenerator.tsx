import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Download, Share2, RefreshCw, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Zap, Globe, Target, ShieldCheck, Layers, Settings, Eye,
  Printer, Mail, Calendar, Users, DollarSign, PieChart, MapPin, Clock,
  Activity, Award, ChevronRight, ChevronDown, Filter, Search
} from 'lucide-react';
import { ReportParameters, ReportPayload } from '../types';
import { ReportOrchestrator } from '../services/ReportOrchestrator';
import { GovernanceService } from '../services/GovernanceService';
import { ExportService } from '../services/ExportService';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedReportGeneratorProps {
  params: ReportParameters;
  onReportGenerated?: (payload: ReportPayload) => void;
  onClose?: () => void;
}

type ReportFormat = 'pdf' | 'ppt' | 'dashboard' | 'interactive';
type ViewMode = 'overview' | 'detailed' | 'analytics' | 'export';

const AdvancedReportGenerator: React.FC<AdvancedReportGeneratorProps> = ({
  params,
  onReportGenerated,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPayload, setReportPayload] = useState<ReportPayload | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('interactive');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive-summary']));
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const logProvenance = (action: string, details?: { tags?: string[] }) => {
    if (!params.id) return;
    GovernanceService.recordProvenance({
      reportId: params.id,
      artifact: 'report-export',
      action,
      actor: 'AdvancedReportGenerator',
      tags: details?.tags,
      source: 'ui'
    });
  };

  const reportRef = useRef<HTMLDivElement>(null);

  const generationSteps = [
    'Analyzing market intelligence',
    'Calculating risk assessments',
    'Evaluating partnership opportunities',
    'Generating strategic recommendations',
    'Compiling executive summary',
    'Finalizing report payload'
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStep(generationSteps[0]);

    try {
      // Simulate progress updates
      for (let i = 0; i < generationSteps.length; i++) {
        setCurrentStep(generationSteps[i]);
        setGenerationProgress(((i + 1) / generationSteps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const payload = await ReportOrchestrator.assembleReportPayload(params);
      setReportPayload(payload);
      GovernanceService.recordProvenance({
        reportId: params.id,
        artifact: 'report-payload',
        action: 'generation-complete',
        actor: 'AdvancedReportGenerator',
        source: 'ui'
      });
      onReportGenerated?.(payload);
      setViewMode('overview');
    } catch (error) {
      console.error('Report generation failed:', error);
      GovernanceService.recordProvenance({
        reportId: params.id,
        artifact: 'report-payload',
        action: 'generation-failed',
        actor: 'AdvancedReportGenerator',
        source: 'ui',
        tags: [String(error)]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const exportReport = async (format: ReportFormat) => {
    setExportError(null);
    setExportSuccess(null);
    try {
      const result = await ExportService.exportReport({
        reportId: params.id,
        format,
        payload: reportPayload
      });
      setExportSuccess(`Export ready: ${result.link}`);
    } catch (err: any) {
      setExportError(err?.message || 'Export failed');
    }
  };

  const gatedAction = async (name: string, tags?: string[]) => {
    setExportError(null);
    setExportSuccess(null);
    const check = await GovernanceService.ensureStage(params.id, 'approved');
    if (!check.ok) {
      setExportError(`Action blocked: approval stage must be at least 'approved'. Current stage: ${check.stage}`);
      logProvenance(`${name}-blocked`, { tags });
      return false;
    }
    logProvenance(`${name}-requested`, { tags });
    return true;
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral') => (
    <div className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-stone-600 text-sm font-medium">{title}</div>
        <div className="text-stone-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      {trend && (
        <div className={`text-xs flex items-center mt-1 ${
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' : 'text-stone-500'
        }`}>
          <TrendingUp size={12} className="mr-1" />
          {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
        </div>
      )}
    </div>
  );

  const renderSection = (id: string, title: string, icon: React.ReactNode, content: React.ReactNode, isExpanded: boolean = false) => (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-stone-900">{title}</h3>
        </div>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      <AnimatePresence>
        {expandedSections.has(id) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto">
              <div className="w-full h-full border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Generating Advanced Report</h3>
              <p className="text-stone-600 mb-4">{currentStep}</p>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-stone-500 mt-2">{Math.round(generationProgress)}% complete</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Advanced Report Generator</h1>
              <p className="text-stone-600">Comprehensive strategic analysis with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                realTimeUpdates
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Activity size={16} className="inline mr-2" />
              Live Updates {realTimeUpdates ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={generateReport}
              disabled={!params.organizationName || !params.country}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Zap size={16} />
              Generate Report
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        {reportPayload && (
          <div className="flex gap-1 mt-6 bg-stone-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
              { id: 'export', label: 'Export Options', icon: Download }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as ViewMode)}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  viewMode === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!reportPayload ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-stone-300 mb-4" />
            <h3 className="text-xl font-semibold text-stone-600 mb-2">Ready to Generate Report</h3>
            <p className="text-stone-500 mb-6">Click "Generate Report" to create a comprehensive strategic analysis</p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-stone-900">Market Intelligence</div>
                <div className="text-sm text-stone-600">Advanced analytics & forecasting</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-stone-900">Risk Assessment</div>
                <div className="text-sm text-stone-600">Comprehensive risk evaluation</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-stone-900">Strategic Recommendations</div>
                <div className="text-sm text-stone-600">AI-powered strategic guidance</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {viewMode === 'overview' && (
              <>
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  {renderMetricCard(
                    'Success Probability',
                    `${reportPayload.confidenceScores.overall}%`,
                    <Award size={20} />,
                    reportPayload.confidenceScores.overall > 75 ? 'up' : 'neutral'
                  )}
                  {renderMetricCard(
                    'Risk Level',
                    reportPayload.computedIntelligence.ethicsCheck.overallFlag,
                    <ShieldCheck size={20} />,
                    reportPayload.computedIntelligence.ethicsCheck.overallFlag === 'PASS' ? 'up' : 'down'
                  )}
                  {renderMetricCard(
                    'Market Opportunity',
                    `$${reportPayload.regionalProfile.demographics.gdpPerCapita.toLocaleString()}`,
                    <DollarSign size={20} />,
                    'up'
                  )}
                  {renderMetricCard(
                    'Timeline',
                    reportPayload.problemDefinition.urgency || 'Urgency not specified',
                    <Clock size={20} />,
                    'neutral'
                  )}
                </div>

                {/* Executive Summary */}
                {renderSection(
                  'executive-summary',
                  'Executive Summary',
                  <FileText size={20} className="text-blue-600" />,
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Strategic Assessment</h4>
                      <p className="text-blue-800">
                        {reportPayload.computedIntelligence.rroi.summary}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-stone-900 mb-2">Key Opportunities</h5>
                        <ul className="space-y-1">
                          {reportPayload.economicSignals.costAdvantages.slice(0, 3).map((advantage, idx) => (
                            <li key={idx} className="text-sm text-stone-600 flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-600" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-stone-900 mb-2">Critical Risks</h5>
                        <ul className="space-y-1">
                          {reportPayload.risks.regulatory.complianceRoadmap.slice(0, 3).map((risk, idx) => (
                            <li key={idx} className="text-sm text-stone-600 flex items-center gap-2">
                              <AlertTriangle size={14} className="text-red-600" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>,
                  true
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left">
                      <Mail size={20} className="text-blue-600 mb-2" />
                      <div className="font-semibold text-stone-900">Share Report</div>
                      <div className="text-sm text-stone-600">Send to stakeholders</div>
                    </button>
                    <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left">
                      <Printer size={20} className="text-green-600 mb-2" />
                      <div className="font-semibold text-stone-900">Print Summary</div>
                      <div className="text-sm text-stone-600">Generate PDF version</div>
                    </button>
                    <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left">
                      <Calendar size={20} className="text-purple-600 mb-2" />
                      <div className="font-semibold text-stone-900">Schedule Follow-up</div>
                      <div className="text-sm text-stone-600">Plan next steps</div>
                    </button>
                  </div>
                </div>

                {/* External Search Signals */}
                {reportPayload.computedIntelligence.externalSearchSignals?.length > 0 && (
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-900 mb-4">External Search Signals</h3>
                    <div className="space-y-4">
                      {reportPayload.computedIntelligence.externalSearchSignals.map((signal, idx) => (
                        <div key={idx} className="p-3 rounded-md border border-stone-200 bg-slate-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-stone-900">{signal.source.toUpperCase()}</span>
                            <span className={`text-xs font-semibold ${(signal.status === 'ok') ? 'text-green-700' : 'text-red-700'}`}>
                              {signal.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-stone-600 mt-1">Query: {signal.query || 'n/a'}</div>
                          {signal.error && <div className="text-xs text-red-600 mt-1">Error: {signal.error}</div>}
                          <ul className="mt-2 space-y-1">
                            {signal.results.slice(0, 3).map((item, resultIdx) => (
                              <li key={resultIdx} className="text-xs text-stone-700">
                                • <a href={item.url} target="_blank" rel="noreferrer" className="underline text-blue-600">{item.title || item.url}</a> — {item.snippet.slice(0, 80)}...
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {viewMode === 'detailed' && (
              <div className="space-y-6">
                {renderSection(
                  'market-analysis',
                  'Market Analysis',
                  <Globe size={20} className="text-green-600" />,
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-stone-900 mb-3">Regional Profile</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-600">Population:</span>
                            <span className="font-medium">{reportPayload.regionalProfile.demographics.population.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">GDP per Capita:</span>
                            <span className="font-medium">${reportPayload.regionalProfile.demographics.gdpPerCapita.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">Infrastructure Score:</span>
                            <span className="font-medium">{reportPayload.regionalProfile.infrastructure.transportation}/100</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-stone-900 mb-3">Economic Signals</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-600">Trade Exposure:</span>
                            <span className="font-medium">{reportPayload.economicSignals.tradeExposure}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">Tariff Sensitivity:</span>
                            <span className="font-medium">{reportPayload.economicSignals.tariffSensitivity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">Bottleneck Relief:</span>
                            <span className="font-medium">{reportPayload.economicSignals.bottleneckReliefPotential}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {renderSection(
                  'partnership-opportunities',
                  'Partnership Opportunities',
                  <Users size={20} className="text-blue-600" />,
                  <div className="space-y-4">
                    {reportPayload.computedIntelligence.symbioticPartners.map((partner, idx) => (
                      <div key={idx} className="border border-stone-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h6 className="font-semibold text-stone-900">{partner.entityName}</h6>
                            <div className="text-sm text-stone-600">{partner.entityType} * {partner.location}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{partner.symbiosisScore}%</div>
                            <div className="text-xs text-stone-500">Compatibility</div>
                          </div>
                        </div>
                        <p className="text-sm text-stone-700 mb-3">{partner.mutualBenefit}</p>
                        <div className="flex flex-wrap gap-2">
                          {partner.riskFactors.map((risk, riskIdx) => (
                            <span key={riskIdx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {renderSection(
                  'risk-assessment',
                  'Risk Assessment',
                  <ShieldCheck size={20} className="text-red-600" />,
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h6 className="font-semibold text-red-900 mb-2">Political Risks</h6>
                        <div className="text-sm text-red-800">
                          Stability Score: {reportPayload.risks.political.stabilityScore}/100
                        </div>
                        <div className="text-sm text-red-800">
                          Regional Conflict: {reportPayload.risks.political.regionalConflictRisk}%
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h6 className="font-semibold text-yellow-900 mb-2">Regulatory Risks</h6>
                        <div className="text-sm text-yellow-800">
                          Corruption Index: {reportPayload.risks.regulatory.corruptionIndex}
                        </div>
                        <div className="text-sm text-yellow-800">
                          Friction Score: {reportPayload.risks.regulatory.regulatoryFriction}
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h6 className="font-semibold text-orange-900 mb-2">Operational Risks</h6>
                        <div className="text-sm text-orange-800">
                          Supply Chain: {reportPayload.risks.operational.supplyChainDependency}%
                        </div>
                        <div className="text-sm text-orange-800">
                          Currency Risk: {reportPayload.risks.operational.currencyRisk}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'analytics' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* SPI Breakdown Chart */}
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <PieChart size={20} className="text-blue-600" />
                      Success Probability Index
                    </h3>
                    <div className="space-y-3">
                      {reportPayload.computedIntelligence.spi.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-stone-600">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${item.value}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RROI Components */}
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-green-600" />
                      Regional Readiness Index
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(reportPayload.computedIntelligence.rroi.components).map(([key, component]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-stone-600 capitalize">{component.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600 rounded-full"
                                style={{ width: `${component.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{component.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confidence Scores Radar */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-600" />
                    Confidence Scores Overview
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(reportPayload.confidenceScores).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{value}</div>
                        <div className="text-xs text-stone-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'export' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-4">Export Report</h3>
                  {exportError && (
                    <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                      {exportError}
                    </div>
                  )}
                  {exportSuccess && (
                    <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">
                      {exportSuccess}
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { format: 'pdf', label: 'PDF Report', desc: 'Comprehensive PDF with charts and analysis', icon: FileText },
                      { format: 'ppt', label: 'PowerPoint Presentation', desc: 'Executive presentation slides', icon: BarChart3 },
                      { format: 'dashboard', label: 'Interactive Dashboard', desc: 'Live web dashboard for stakeholders', icon: Activity },
                      { format: 'interactive', label: 'Interactive HTML', desc: 'Full interactive web report', icon: Globe }
                    ].map(({ format, label, desc, icon: Icon }) => (
                      <button
                        key={format}
                        onClick={() => exportReport(format as ReportFormat)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedFormat === format
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <Icon size={24} className="text-blue-600 mb-2" />
                        <div className="font-semibold text-stone-900">{label}</div>
                        <div className="text-sm text-stone-600">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="font-semibold text-stone-900 mb-4">Additional Options</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left"
                      onClick={() => { void gatedAction('email-report', ['email']); }}
                    >
                      <Mail size={20} className="text-blue-600 mb-2" />
                      <div className="font-semibold text-stone-900">Email Report</div>
                      <div className="text-sm text-stone-600">Send to specific recipients</div>
                    </button>
                    <button
                      className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left"
                      onClick={() => { void gatedAction('share-link', ['share']); }}
                    >
                      <Share2 size={20} className="text-green-600 mb-2" />
                      <div className="font-semibold text-stone-900">Share Link</div>
                      <div className="text-sm text-stone-600">Generate shareable link</div>
                    </button>
                    <button
                      className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-left"
                      onClick={() => { void gatedAction('customize-report', ['customize']); }}
                    >
                      <Settings size={20} className="text-purple-600 mb-2" />
                      <div className="font-semibold text-stone-900">Customize</div>
                      <div className="text-sm text-stone-600">Adjust report settings</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReportGenerator;

