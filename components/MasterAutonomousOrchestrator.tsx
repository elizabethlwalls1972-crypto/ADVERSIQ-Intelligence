import React, { useState, useEffect } from 'react';
import { ReportParameters } from '../types';

interface MasterAutonomousOrchestratorProps {
  params: ReportParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOrchestrationComplete: (result: any) => void;
  isVisible: boolean;
}

interface OrchestrationStatus {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  systemStatus: any;
  confidence: number;
  processingTimeMs: number;
}

const MasterAutonomousOrchestrator: React.FC<MasterAutonomousOrchestratorProps> = ({
  params,
  onOrchestrationComplete,
  isVisible
}) => {
  const [status, setStatus] = useState<OrchestrationStatus>({
    isRunning: false,
    progress: 0,
    currentStep: '',
    systemStatus: null,
    confidence: 0,
    processingTimeMs: 0
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const startMasterOrchestration = async () => {
    setStatus({
      isRunning: true,
      progress: 0,
      currentStep: 'Initializing autonomous agents...',
      systemStatus: null,
      confidence: 0,
      processingTimeMs: 0
    });
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/autonomous/master-orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStatus(prev => ({
          ...prev,
          isRunning: false,
          progress: 100,
          currentStep: 'Orchestration completed successfully',
          systemStatus: data.systemStatus,
          confidence: data.confidence,
          processingTimeMs: data.processingTimeMs
        }));
        onOrchestrationComplete(data);
      } else {
        throw new Error(data.error || 'Orchestration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        currentStep: 'Orchestration failed'
      }));
    }
  };

  // Simulate progress updates during orchestration
  useEffect(() => {
    if (!status.isRunning) return;

    const steps = [
      'Initializing autonomous agents...',
      'Running deep thinking analysis...',
      'Executing autonomous research...',
      'Generating base report payload...',
      'Enhancing with intelligent document generation...',
      'Applying self-improvement optimizations...',
      'Updating persistent memory...',
      'Finalizing orchestration...'
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setStatus(prev => ({
          ...prev,
          progress: Math.min(90, (stepIndex + 1) / steps.length * 100),
          currentStep: steps[stepIndex]
        }));
        stepIndex++;
      } else {
        clearInterval(progressInterval);
      }
    }, 2000);

    return () => clearInterval(progressInterval);
  }, [status.isRunning]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              ⭐ Master Autonomous Orchestrator
            </h2>
            <button
              onClick={() => {/* Close modal */}}
              className="text-gray-400 hover:text-gray-600"
            >
              ✗
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">100% Performance Mode</h3>
              <p className="text-sm opacity-90">
                Activate all advanced autonomous agents for complete system optimization:
                Deep Thinking * Autonomous Research * Intelligent Document Generation * Self-Improvement
              </p>
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`text-sm font-medium ${status.isRunning ? 'text-blue-600' : result ? 'text-green-600' : error ? 'text-red-600' : 'text-gray-600'}`}>
                  {status.isRunning ? 'Running' : result ? 'Completed' : error ? 'Failed' : 'Ready'}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-600">{status.currentStep}</p>

              {status.processingTimeMs > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Processing time: {(status.processingTimeMs / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </div>

          {/* System Status */}
          {status.systemStatus && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">System Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(status.systemStatus).map(([key, value]) => {
                  if (key === 'overallPerformance' || key === 'lastUpdate') return null;
                  return (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-lg font-bold ${
                        value === 'active' ? 'text-green-600' :
                        value === 'idle' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {value === 'active' ? '✓' : value === 'idle' ? '⏳' : '✗'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Overall Performance</div>
                <div className="text-2xl font-bold text-blue-600">
                  {status.systemStatus.overallPerformance?.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Confidence Score */}
          {status.confidence > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Confidence Score</h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {status.confidence.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">
                  System confidence in orchestration results
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-red-800 mb-2">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {result && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Orchestration Results</h4>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800 font-medium">{result.message}</p>
                <div className="mt-2 text-sm text-green-700">
                  <p>* Deep Thinking Analysis: {result.autonomousEnhancements?.deepThinking ? 'Completed' : 'Pending'}</p>
                  <p>* Autonomous Research: {result.autonomousEnhancements?.researchInsights ? 'Completed' : 'Pending'}</p>
                  <p>* Document Enhancement: {result.autonomousEnhancements?.documentQuality ? 'Completed' : 'Pending'}</p>
                  <p>* Self-Improvement: {result.autonomousEnhancements?.selfImprovement ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!status.isRunning && !result && (
              <button
                onClick={startMasterOrchestration}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                🚀 Start 100% Orchestration
              </button>
            )}

            {result && (
              <button
                onClick={() => {/* Close and use results */}}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                🔒 Use Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAutonomousOrchestrator;
