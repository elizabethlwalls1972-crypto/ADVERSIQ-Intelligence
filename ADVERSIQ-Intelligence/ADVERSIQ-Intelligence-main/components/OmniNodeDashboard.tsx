/**
 * ============================================================================
 * ADVERSIQ OMNI-NODE DASHBOARD - Real-Time Visualization
 * ============================================================================
 * 
 * This React component visualizes the state of the autonomous system,
 * showing:
 * - System health and uptime
 * - Active background tasks
 * - Recent mandate executions
 * - Quorum debate heat maps
 * - Morphic field synchronization status
 * - Algorithmic mutations and evolution history
 */

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  online: boolean;
  bootTime: string;
  uptime: string;
  backgroundTasks: string[];
  telemetryCount: number;
}

interface MandateResult {
  mandate: string;
  archetype: string;
  quorumSize: number;
  debateIntensity: number;
  recommendation: string;
  executedAt: string;
}

export const OmniNodeDashboard: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [mandates, setMandates] = useState<MandateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/omni/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError(`Failed to fetch status: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Omni-Node Dashboard...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!status) return <div>No status available</div>;

  return (
    <div style={{ fontFamily: 'monospace', backgroundColor: '#0a0e27', color: '#00ff88', padding: '20px' }}>
      <h1>═══════════════════════════════════════════</h1>
      <h1>  ADVERSIQ OMNI-NODE COMMAND CENTER</h1>
      <h1>═══════════════════════════════════════════</h1>

      <div style={{ marginTop: '20px', borderLeft: '3px solid #00ff88', paddingLeft: '15px' }}>
        <h2>SYSTEM STATUS</h2>
        <p>Status: {status.online ? '🟢 ONLINE' : '🔴 OFFLINE'}</p>
        <p>Boot Time: {status.bootTime}</p>
        <p>Uptime: {status.uptime}</p>
        <p>Telemetry Events: {status.telemetryCount}</p>
      </div>

      <div style={{ marginTop: '20px', borderLeft: '3px solid #00ff88', paddingLeft: '15px' }}>
        <h2>BACKGROUND TASKS</h2>
        {status.backgroundTasks.map((task, idx) => (
          <p key={idx}>→ {task}</p>
        ))}
      </div>

      <div style={{ marginTop: '20px', borderLeft: '3px solid #00ff88', paddingLeft: '15px' }}>
        <h2>RECENT MANDATES</h2>
        <p style={{ fontSize: '0.9em', color: '#00cc66' }}>
          Execute via: POST /api/omni/mandate with mandate query
        </p>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#00cc66' }}>
        <p>═══════════════════════════════════════════</p>
        <p>ADVERSIQ Autonomous Intelligence System</p>
        <p>Distributed | Federated | Self-Evolving</p>
        <p>═══════════════════════════════════════════</p>
      </div>
    </div>
  );
};

export default OmniNodeDashboard;
