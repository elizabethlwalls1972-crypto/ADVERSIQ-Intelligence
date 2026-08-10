import React, { useState } from 'react';
import { Brain, Zap, Shield, Clock, GitBranch, AlertTriangle, CheckCircle, XCircle, Loader2, BookOpen, Lightbulb, Target, TrendingUp, Activity } from 'lucide-react';

interface LIDAResponse {
  mandate: string;
  lidaCycle: {
    cycleNumber: number;
    timestamp: string;
    consciousContent: { ignition: boolean; strength: number };
    selectedAction: { name: string; utility: number };
    learningUpdate: { insights: string[] };
  };
  parsedInput: {
    domain: string;
    language: string;
    urgency: number;
    confidence: number;
    intent: string;
  };
  audit: {
    known: boolean;
    confidence: number;
    gaps: string[];
    sources: string[];
  };
  parallels: Array<{
    case: { description: string; successMetric: number };
    similarity: number;
    applicability: number;
    lessons: string[];
    risks: string[];
  }>;
  failureRisk: {
    risk: number;
    patterns: Array<{ name: string; severity: string }>;
    mitigations: string[];
  };
}

interface SelfLearningIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location: string;
  confidence: number;
  suggestedFix?: string;
  relatedPatterns: string[];
  timestamp: string;
}

interface SelfLearningSolution {
  id: string;
  issueId: string;
  approach: string;
  steps: string[];
  expectedOutcome: string;
  confidence: number;
  estimatedEffort: string;
  risks: string[];
  alternatives: string[];
  timestamp: string;
}

interface SelfLearningReport {
  cycleNumber: number;
  timestamp: string;
  dataSourcesRead: number;
  issuesDetected: number;
  solutionsGenerated: number;
  outcomesRecorded: number;
  learningRate: number;
  topIssues: SelfLearningIssue[];
  topSolutions: SelfLearningSolution[];
  knowledgeGaps: string[];
}

interface SelfLearningStatus {
  selfLearning: {
    cycleNumber: number;
    dataSources: string[];
    issuesDetected: number;
    solutionsGenerated: number;
    outcomesRecorded: number;
    knowledgeGaps: string[];
    learnedPatterns: Array<{
      pattern: string;
      frequency: number;
      successRate: number;
      lastSeen: string;
      solutions: string[];
    }>;
  };
  stats: {
    totalDataSources: number;
    totalSnapshots: number;
    totalIssues: number;
    totalSolutions: number;
    totalOutcomes: number;
    totalPatterns: number;
    learningRate: number;
  };
}

const LIDAPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LIDAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selfLearningInput, setSelfLearningInput] = useState('');
  const [selfLearningLoading, setSelfLearningLoading] = useState(false);
  const [selfLearningResult, setSelfLearningResult] = useState<SelfLearningReport | null>(null);
  const [selfLearningStatus, setSelfLearningStatus] = useState<SelfLearningStatus | null>(null);
  const [selfLearningIssues, setSelfLearningIssues] = useState<SelfLearningIssue[]>([]);
  const [selfLearningSolutions, setSelfLearningSolutions] = useState<SelfLearningSolution[]>([]);
  const [activeTab, setActiveTab] = useState<'lida' | 'self-learning'>('lida');

  const API_BASE = 'http://localhost:3001/api';

  const runLIDA = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/lida/mandate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandate: input }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: LIDAResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runSelfLearningCycle = async () => {
    if (!selfLearningInput.trim()) return;
    setSelfLearningLoading(true);

    try {
      let data: any;
      try {
        data = JSON.parse(selfLearningInput);
      } catch {
        data = { text: selfLearningInput };
      }

      const [cycleRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/lida/self-learning/cycle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        }),
        fetch(`${API_BASE}/lida/self-learning/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      if (!cycleRes.ok) throw new Error(`Cycle failed: ${cycleRes.status}`);
      if (!statusRes.ok) throw new Error(`Status failed: ${statusRes.status}`);

      const cycleData: SelfLearningReport = await cycleRes.json();
      const statusData: SelfLearningStatus = await statusRes.json();

      setSelfLearningResult(cycleData);
      setSelfLearningStatus(statusData);
      setSelfLearningIssues(cycleData.topIssues || []);
      setSelfLearningSolutions(cycleData.topSolutions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSelfLearningLoading(false);
    }
  };

  const loadSelfLearningStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/lida/self-learning/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SelfLearningStatus = await res.json();
      setSelfLearningStatus(data);
    } catch {
      // Silently fail - status is optional
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">LIDA Cognitive Architecture</h1>
            <p className="text-sm text-slate-500">
              Stan Franklin 2007 AGI Foundation — Applied to Strategic Intelligence
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('lida')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'lida'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" /> LIDA Cycle
          </button>
          <button
            onClick={() => setActiveTab('self-learning')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'self-learning'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" /> Self-Learning
          </button>
        </div>

        {activeTab === 'lida' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Enter any problem, question, or mandate
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., We need to expand our cloud platform into Southeast Asian markets..."
              className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={runLIDA}
            disabled={loading || !input.trim()}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running LIDA Cognitive Cycle...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run LIDA Analysis
              </>
            )}
          </button>
        </div>
        )}

        {activeTab === 'self-learning' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Enter data for self-learning analysis (JSON or plain text)
            </label>
            <textarea
              value={selfLearningInput}
              onChange={(e) => setSelfLearningInput(e.target.value)}
              placeholder="e.g., { &quot;errors&quot;: 5, &quot;latency&quot;: 2300, &quot;failures&quot;: [&quot;timeout&quot;, &quot;connection refused&quot;] }"
              className="w-full h-40 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
            />
          </div>

          <button
            onClick={runSelfLearningCycle}
            disabled={selfLearningLoading || !selfLearningInput.trim()}
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {selfLearningLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Self-Learning Cycle...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Run Self-Learning Analysis
              </>
            )}
          </button>

          {selfLearningStatus && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Self-Learning Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 uppercase">Cycle</p>
                  <p className="text-lg font-bold text-slate-900">{selfLearningStatus.selfLearning.cycleNumber}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 uppercase">Issues</p>
                  <p className="text-lg font-bold text-slate-900">{selfLearningStatus.selfLearning.issuesDetected}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 uppercase">Solutions</p>
                  <p className="text-lg font-bold text-slate-900">{selfLearningStatus.selfLearning.solutionsGenerated}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 uppercase">Learning Rate</p>
                  <p className="text-lg font-bold text-slate-900">{(selfLearningStatus.stats.learningRate * 100).toFixed(0)}%</p>
                </div>
              </div>
              {selfLearningStatus.selfLearning.knowledgeGaps.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-2">Knowledge Gaps</p>
                  <ul className="space-y-1">
                    {selfLearningStatus.selfLearning.knowledgeGaps.map((gap, i) => (
                      <li key={i} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {selfLearningIssues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Detected Issues
              </h3>
              {selfLearningIssues.map((issue, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{issue.category}</span>
                  </div>
                  <p className="text-sm text-slate-900 mb-2">{issue.description}</p>
                  <p className="text-xs text-slate-500">Confidence: {(issue.confidence * 100).toFixed(0)}%</p>
                  {issue.suggestedFix && (
                    <p className="text-xs text-blue-600 mt-1">Suggested: {issue.suggestedFix}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selfLearningSolutions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Generated Solutions
              </h3>
              {selfLearningSolutions.map((solution, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-900">{solution.approach}</p>
                    <span className="text-xs text-slate-500">{(solution.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Expected: {solution.expectedOutcome}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Effort: {solution.estimatedEffort}</span>
                    <span>•</span>
                    <span>{solution.steps.length} steps</span>
                  </div>
                  {solution.risks.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-500 font-medium mb-1">Risks:</p>
                      {solution.risks.map((risk, j) => (
                        <p key={j} className="text-xs text-red-600">• {risk}</p>
                      ))}
                    </div>
                  )}
                  {solution.alternatives.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 font-medium mb-1">Alternatives:</p>
                      {solution.alternatives.map((alt, j) => (
                        <p key={j} className="text-xs text-slate-600">• {alt}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Input Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Universal Input Processing
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Domain</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{result.parsedInput.domain}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Language</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{result.parsedInput.language}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Urgency</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{(result.parsedInput.urgency * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Confidence</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{(result.parsedInput.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Detected Intent</p>
              <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{result.parsedInput.intent}</p>
            </div>
          </div>

          {/* LIDA Cognitive Cycle */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              LIDA Cognitive Cycle #{result.lidaCycle.cycleNumber}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Consciousness Ignition</p>
                <p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2">
                  {result.lidaCycle.consciousContent.ignition ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                  {result.lidaCycle.consciousContent.ignition ? 'IGNITION' : 'No Ignition'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Broadcast Strength</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {(result.lidaCycle.consciousContent.strength * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Selected Action</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {result.lidaCycle.selectedAction?.name || 'none'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Action Utility</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {result.lidaCycle.selectedAction?.utility
                    ? (result.lidaCycle.selectedAction.utility * 100).toFixed(0) + '%'
                    : 'N/A'}
                </p>
              </div>
            </div>
            {result.lidaCycle.learningUpdate.insights.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Learning Insights</p>
                <ul className="space-y-1">
                  {result.lidaCycle.learningUpdate.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Self-Auditing Knowledge */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Self-Auditing Knowledge
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Known</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {result.audit.known ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Confidence</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {(result.audit.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            {result.audit.gaps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Knowledge Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {result.audit.gaps.map((gap, i) => (
                    <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historical Parallels */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Historical Parallels
            </h2>
            {result.parallels.length === 0 ? (
              <p className="text-sm text-slate-500">No historical parallels found.</p>
            ) : (
              <div className="space-y-3">
                {result.parallels.map((parallel, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900">
                        {parallel.case.description}
                      </p>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {parallel.applicability.toFixed(0)}% applicable
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                      <span>Similarity: {(parallel.similarity * 100).toFixed(0)}%</span>
                      <span>Success: {(parallel.case.successMetric * 100).toFixed(0)}%</span>
                    </div>
                    {parallel.lessons.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Lessons</p>
                        <ul className="space-y-1">
                          {parallel.lessons.map((lesson, j) => (
                            <li key={j} className="text-xs text-slate-700">• {lesson}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Failure Risk Assessment */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Failure Risk Assessment
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Risk Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {(result.failureRisk.risk * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Patterns Detected</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {result.failureRisk.patterns.length}
                </p>
              </div>
            </div>
            {result.failureRisk.patterns.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Failure Patterns</p>
                <div className="space-y-2">
                  {result.failureRisk.patterns.map((pattern, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-slate-900">{pattern.name}</span>
                      <span className="text-xs text-slate-500 capitalize">({pattern.severity})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.failureRisk.mitigations.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Mitigations</p>
                <ul className="space-y-1">
                  {result.failureRisk.mitigations.map((mitigation, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      {mitigation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { LIDAPage };
export default LIDAPage;
