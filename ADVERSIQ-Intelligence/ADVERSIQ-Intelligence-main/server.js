// ADVERSIQ Intelligence - Local Development Server
// Simple Express server to serve the landing page and demo interface

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for demo threat data
app.get('/api/threats', (req, res) => {
  res.json({
    active: 3,
    total: 127,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    recent: [
      {
        id: 'CVE-2026-1234',
        severity: 'critical',
        description: 'Buffer overflow in OpenSSL 3.2.x',
        status: 'deployed',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        responseTime: '23 minutes'
      },
      {
        id: 'CVE-2026-5678',
        severity: 'high',
        description: 'SQL injection in PostgreSQL driver',
        status: 'validating',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        responseTime: '5 minutes'
      },
      {
        id: 'CVE-2026-9012',
        severity: 'high',
        description: 'XSS vulnerability in React Router',
        status: 'detected',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        responseTime: '8 minutes'
      }
    ]
  });
});

// API endpoint for mesh status
app.get('/api/mesh/status', (req, res) => {
  res.json({
    nodesOnline: 12,
    nodesTotal: 12,
    health: 99.97,
    uptime: '45 days 3 hours',
    consensusFailures: 0,
    federatedLearningSync: 100,
    lastUpdate: new Date().toISOString()
  });
});

// API endpoint for system stats
app.get('/api/stats', (req, res) => {
  res.json({
    threatsDetected: 1247,
    patchesDeployed: 1189,
    successRate: 95.3,
    averageResponseTime: '18 minutes',
    riskScore: 0.23,
    uptime: 99.97
  });
});

// API endpoint for activity feed
app.get('/api/activity', (req, res) => {
  res.json({
    activities: [
      {
        type: 'patch_deployed',
        message: 'CVE-2026-1234 detected → patch validated → deployed',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        details: 'Mesh consensus: 11/12 nodes agree. Propagation time: 0.8 seconds'
      },
      {
        type: 'threat_detected',
        message: 'New critical threat detected in OpenSSL',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        details: 'Cognitive purification: 2.3s, Quorum validation: 8.7s'
      },
      {
        type: 'model_update',
        message: 'Federated learning model updated',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        details: 'New threat patterns learned from Node 5. Accuracy: 94.2%'
      },
      {
        type: 'consensus_reached',
        message: 'Mesh consensus reached for patch deployment',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        details: '12/12 nodes voted. Decision: Deploy patch immediately'
      }
    ]
  });
});

// API endpoint for chat (natural language interface demo)
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple demo responses based on keywords
  let response = '';
  
  if (message.toLowerCase().includes('threat')) {
    response = 'Found 3 active threats. 1 critical (CVE-2026-1234) already deployed, 2 high severity threats currently validating. Average response time: 18 minutes.';
  } else if (message.toLowerCase().includes('mesh') || message.toLowerCase().includes('health')) {
    response = '12 nodes online, 99.97% uptime, 0 consensus failures. Federated learning sync: 100% complete. All systems operational.';
  } else if (message.toLowerCase().includes('simulate') || message.toLowerCase().includes('attack')) {
    response = 'Running simulation... Mesh detected and neutralized zero-day attack in 18 minutes. Confidence: 94.2%. All nodes updated with new defensive patterns.';
  } else if (message.toLowerCase().includes('status') || message.toLowerCase().includes('how')) {
    response = 'ADVERSIQ is operating at peak performance. 1,247 threats detected, 1,189 patches deployed (95.3% success rate). Current risk score: 0.23 (very low). System uptime: 99.97%.';
  } else {
    response = 'I\'m ADVERSIQ, your autonomous cybersecurity defense system. I can help you monitor threats, check mesh health, view deployment status, and simulate attacks. What would you like to know?';
  }
  
  res.json({ response });
});

// API endpoint for threat upload (demo)
app.post('/api/threats/upload', (req, res) => {
  const threat = req.body;
  
  res.json({
    success: true,
    message: `Threat ${threat.id || 'unknown'} uploaded successfully`,
    threatId: threat.id || `THREAT-${Date.now()}`,
    status: 'processing',
    estimatedTime: '15-30 minutes'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          🛡️  ADVERSIQ Intelligence Server                  ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Landing Page: http://localhost:${PORT}`);
  console.log(`🔌 API Endpoints:`);
  console.log(`   - GET  /api/threats`);
  console.log(`   - GET  /api/mesh/status`);
  console.log(`   - GET  /api/stats`);
  console.log(`   - GET  /api/activity`);
  console.log(`   - POST /api/chat`);
  console.log(`   - POST /api/threats/upload`);
  console.log(`\n🚀 Press Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down ADVERSIQ server...');
  process.exit(0);
});

// Made with Bob
