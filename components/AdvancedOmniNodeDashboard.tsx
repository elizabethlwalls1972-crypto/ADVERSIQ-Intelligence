/**
 * Advanced Omni-Node Dashboard with Research & Mathematical Typesetting
 * 
 * Features:
 * - Real-time system status monitoring
 * - Research agent execution and formula visualization
 * - LaTeX/KaTeX rendering for mathematical equations
 * - Multi-domain research findings display
 */

import React, { useState, useEffect } from 'react';

interface ResearchFinding {
  agent: string;
  domain: string;
  summary: string;
  confidence: string;
  evidenceCount: number;
  formulas: Array<{
    latex: string;
    description: string;
    variables: Record<string, string>;
  }>;
  citations: string[];
  metadata: {
    researchedAt: string;
    processingTimeMs: number;
    dataSourcesUsed: string[];
  };
}

interface SystemStatus {
  online: boolean;
  bootTime: string;
  uptime: string;
  backgroundTasks: string[];
  telemetryCount: number;
}

/**
 * LaTeX Formula Component with KaTeX Support
 */
const LaTeXFormula: React.FC<{ latex: string; description?: string }> = ({ latex, description }) => {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // Load KaTeX if available
    if (typeof window !== 'undefined' && (window as any).katex) {
      try {
        (window as any).katex.render(latex, document.getElementById(`formula-${latex}`), {
          throwOnError: false,
          displayMode: true
        });
        setRendered(true);
      } catch (error) {
        console.error('KaTeX render error:', error);
      }
    }
  }, [latex]);

  return (
    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#1a1a2e', borderRadius: '5px' }}>
      {description && (
        <p style={{ fontSize: '0.9em', color: '#00cc66', marginBottom: '10px' }}>
          📐 {description}
        </p>
      )}
      <div
        id={`formula-${latex}`}
        style={{
          padding: '10px',
          backgroundColor: '#0a0e27',
          borderLeft: '3px solid #00ff88',
          overflow: 'auto',
          fontFamily: 'monospace'
        }}
      >
        {!rendered && (
          <span style={{ color: '#00cc66' }}>
            {"$$\\text{KaTeX not available. Raw: } "}{latex}{"$$"}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Research Finding Card Component
 */
const ResearchCard: React.FC<{ finding: ResearchFinding }> = ({ finding }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        marginBottom: '20px',
        borderLeft: '4px solid #00ff88',
        padding: '15px',
        backgroundColor: '#0f0f1e',
        borderRadius: '3px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#00ff88' }}>
            {finding.agent}
          </h3>
          <p style={{ margin: '0', fontSize: '0.85em', color: '#00cc66' }}>
            Domain: {finding.domain} • Confidence: {finding.confidence}
          </p>
        </div>
        <span style={{ color: '#00ff88', fontSize: '1.5em' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: '15px' }}>
          <p style={{ color: '#cccccc', lineHeight: '1.6' }}>
            {finding.summary}
          </p>

          {finding.formulas && finding.formulas.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>Key Formulas:</h4>
              {finding.formulas.map((formula, idx) => (
                <LaTeXFormula
                  key={idx}
                  latex={formula.latex}
                  description={formula.description}
                />
              ))}
            </div>
          )}

          {finding.citations && finding.citations.length > 0 && (
            <div style={{ marginTop: '15px', fontSize: '0.85em', color: '#999999' }}>
              <h4 style={{ color: '#00cc66' }}>References:</h4>
              {finding.citations.map((citation, idx) => (
                <p key={idx} style={{ margin: '5px 0' }}>
                  {idx + 1}. {citation}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main Dashboard Component
 */
export const AdvancedOmniNodeDashboard: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [research, setResearch] = useState<any>(null);
  const [researchQuery, setResearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([
    'economics', 'logistics', 'policy', 'environment', 'geopolitics'
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load KaTeX script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js';
    document.head.appendChild(script);
  }, []);

  // Fetch system status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/omni/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Execute research
  const handleResearch = async () => {
    if (!researchQuery.trim()) {
      setError('Please enter a research query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/research/conduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: researchQuery,
          domains: selectedDomains.length > 0 ? selectedDomains : undefined,
          context: { timestamp: new Date().toISOString() }
        })
      });

      if (!response.ok) throw new Error('Research failed');

      const data = await response.json();
      setResearch(data);
    } catch (err) {
      setError(`Research error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: 'monospace',
        backgroundColor: '#0a0e27',
        color: '#00ff88',
        padding: '20px',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}
    >
      <h1 style={{ textAlign: 'center', borderBottom: '2px solid #00ff88', paddingBottom: '20px' }}>
        ═══════════════════════════════════════════
        <br />
        ADVERSIQ OMNI-NODE | RESEARCH COMMAND CENTER
        <br />
        ═══════════════════════════════════════════
      </h1>

      {/* System Status Panel */}
      {status && (
        <div
          style={{
            marginTop: '20px',
            borderLeft: '3px solid #00ff88',
            padding: '15px',
            backgroundColor: '#0f0f1e',
            marginBottom: '30px'
          }}
        >
          <h2>🟢 SYSTEM STATUS</h2>
          <p>Status: {status.online ? 'ONLINE' : 'OFFLINE'}</p>
          <p>Uptime: {status.uptime}</p>
          <p>Background Tasks: {status.backgroundTasks.length}</p>
        </div>
      )}

      {/* Research Query Panel */}
      <div
        style={{
          marginBottom: '30px',
          borderLeft: '3px solid #00ff88',
          padding: '15px',
          backgroundColor: '#0f0f1e'
        }}
      >
        <h2>🔬 CONDUCT RESEARCH</h2>
        <textarea
          value={researchQuery}
          onChange={(e) => setResearchQuery(e.target.value)}
          placeholder="Enter research query (e.g., 'How does supply chain disruption affect mining economics in the Andes?')"
          style={{
            width: '100%',
            height: '80px',
            padding: '10px',
            backgroundColor: '#1a1a2e',
            color: '#00ff88',
            border: '1px solid #00cc66',
            fontFamily: 'monospace',
            marginBottom: '15px'
          }}
        />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#00cc66' }}>
            Select Domains:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {['economics', 'logistics', 'policy', 'environment', 'geopolitics'].map(domain => (
              <label key={domain} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDomains([...selectedDomains, domain]);
                    } else {
                      setSelectedDomains(selectedDomains.filter(d => d !== domain));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ textTransform: 'capitalize' }}>{domain}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#444444' : '#00ff88',
            color: loading ? '#666666' : '#0a0e27',
            border: 'none',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '3px'
          }}
        >
          {loading ? 'Researching...' : 'Execute Research'}
        </button>

        {error && <p style={{ color: '#ff4444', marginTop: '10px' }}>⚠️ {error}</p>}
      </div>

      {/* Research Results */}
      {research && (
        <div
          style={{
            marginTop: '30px',
            borderLeft: '3px solid #00ff88',
            padding: '15px',
            backgroundColor: '#0f0f1e'
          }}
        >
          <h2>📊 RESEARCH FINDINGS</h2>
          <p style={{ color: '#00cc66', marginBottom: '20px' }}>
            Query: "{research.query}" • Domains: {research.findingsCount} • Date: {new Date(research.researchDate).toLocaleString()}
          </p>

          {research.findings.map((finding: ResearchFinding, idx: number) => (
            <ResearchCard key={idx} finding={finding} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '50px', textAlign: 'center', color: '#00cc66', borderTop: '1px solid #00cc66', paddingTop: '20px' }}>
        <p>ADVERSIQ Autonomous Intelligence System v2.0</p>
        <p>Distributed Research Agents | Mathematical Typesetting | Federated Learning</p>
      </div>
    </div>
  );
};

export default AdvancedOmniNodeDashboard;
