// src/components/NSILIntelligenceDashboard.tsx
// Real-time intelligence dashboard powered by 9 agents
// Displays threats, news, briefings, and agent status

import React, { useState, useEffect } from 'react';

interface AgentStatus {
  id: string;
  role: string;
  status: 'active' | 'thinking' | 'idle';
}

interface IntelligenceItem {
  id: string;
  title: string;
  content: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
}

const NSILIntelligenceDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [threats, setThreats] = useState<IntelligenceItem[]>([]);
  const [news, setNews] = useState<IntelligenceItem[]>([]);
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'threats' | 'news' | 'briefing' | 'agents'>('threats');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get agent status
      const statusRes = await fetch('/api/status');
      const statusData = await statusRes.json();
      setAgents(statusData.agents.map((a: any) => ({ ...a, status: 'active' })));

      // Get threats
      const threatsRes = await fetch('/api/threats');
      const threatsData = await threatsRes.json();
      const threatsList = threatsData.threats.split('\n').slice(0, 5).map((t: string, i: number) => ({
        id: `threat_${i}`,
        title: t.split(':')[0] || 'Threat',
        content: t,
        severity: i % 3 === 0 ? 'critical' : i % 2 === 0 ? 'high' : 'medium',
        timestamp: new Date(),
        source: 'SENTINEL',
      }));
      setThreats(threatsList);

      // Get news/intelligence
      const newsRes = await fetch('/api/news');
      const newsData = await newsRes.json();
      const newsList = newsData.news.split('\n').slice(0, 5).map((n: string, i: number) => ({
        id: `news_${i}`,
        title: n.split(':')[0] || 'Intelligence',
        content: n,
        severity: 'medium' as const,
        timestamp: new Date(),
        source: 'NEXUS',
      }));
      setNews(newsList);

      // Get intelligence briefing
      const briefRes = await fetch('/api/intelligence');
      const briefData = await briefRes.json();
      setBriefing(briefData.briefing);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffcc00';
      case 'low': return '#44ff44';
      default: return '#00cec9';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#e0e0e0',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#1a1a2e',
          borderBottom: '1px solid #2a3a4a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '16px' }}>📊 NSIL Intelligence Dashboard</h1>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: loading ? '#1a1a2e' : '#00cec9',
            color: loading ? '#666' : '#0a0a0f',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '10px',
          }}
        >
          {loading ? '⚙️ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: '1px solid #2a3a4a',
          backgroundColor: '#0d0d12',
        }}
      >
        {(['threats', 'news', 'briefing', 'agents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              backgroundColor: selectedTab === tab ? '#1a3a3a' : '#0d0d12',
              color: selectedTab === tab ? '#00cec9' : '#666',
              borderBottom: selectedTab === tab ? '2px solid #00cec9' : '2px solid #2a3a4a',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: selectedTab === tab ? 'bold' : 'normal',
              textTransform: 'uppercase',
            }}
          >
            {tab === 'threats' && '⚠️ Threats'}
            {tab === 'news' && '📰 News'}
            {tab === 'briefing' && '📋 Briefing'}
            {tab === 'agents' && '🤖 Agents'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {selectedTab === 'threats' && (
          <div>
            <h2 style={{ marginTop: 0 }}>🚨 Active Threats</h2>
            {threats.length === 0 ? (
              <div style={{ color: '#888' }}>No threats detected</div>
            ) : (
              threats.map((threat) => (
                <div
                  key={threat.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#1a1a2e',
                    borderLeft: `4px solid ${getSeverityColor(threat.severity)}`,
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: getSeverityColor(threat.severity) }}>
                      {threat.title}
                    </span>
                    <span style={{ fontSize: '10px', color: '#888' }}>{threat.source}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                    {threat.content.substring(0, 200)}...
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{threat.timestamp.toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'news' && (
          <div>
            <h2 style={{ marginTop: 0 }}>📰 Intelligence News</h2>
            {news.length === 0 ? (
              <div style={{ color: '#888' }}>No news available</div>
            ) : (
              news.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#1a1a2e',
                    borderLeft: '4px solid #00cec9',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#00cec9' }}>{item.title}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>{item.source}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                    {item.content.substring(0, 200)}...
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{item.timestamp.toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'briefing' && (
          <div>
            <h2 style={{ marginTop: 0 }}>📋 Intelligence Briefing</h2>
            {briefing ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#1a1a2e',
                  borderRadius: '4px',
                  borderLeft: '4px solid #00ff00',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.5',
                  color: '#00ff00',
                }}
              >
                {briefing}
              </div>
            ) : (
              <div style={{ color: '#888' }}>No briefing available</div>
            )}
          </div>
        )}

        {selectedTab === 'agents' && (
          <div>
            <h2 style={{ marginTop: 0 }}>🤖 Agent Status</h2>
            {agents.length === 0 ? (
              <div style={{ color: '#888' }}>No agents loaded</div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '12px',
                }}
              >
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#1a1a2e',
                      borderRadius: '4px',
                      borderTop: '2px solid #00cec9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>{agent.id}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: agent.status === 'active' ? '#00ff00' : '#888',
                          color: '#000',
                          borderRadius: '2px',
                        }}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>{agent.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid #2a3a4a',
          backgroundColor: '#0d0d12',
          fontSize: '10px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>✅ NSIL Intelligence OS Running</span>
        <span>Agents: {agents.length} | Last Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default NSILIntelligenceDashboard;
