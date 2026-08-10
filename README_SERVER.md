# ADVERSIQ Intelligence - Local Server Setup

## Quick Start

### 1. Install Dependencies

```bash
cd ADVERSIQ-Intelligence/ADVERSIQ-Intelligence-main
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the Landing Page

Open your browser and navigate to:
```
http://localhost:3000
```

---

## What You'll See

### Landing Page Features

1. **Hero Section** - Professional introduction to ADVERSIQ
2. **Problem/Solution** - Why autonomous cybersecurity is needed
3. **7-Stage Pipeline** - Visual explanation of the system
4. **Technical Details** - Neuro-symbolic architecture explanation
5. **Creator Bio** - Information about Brayden Walls
6. **Target Audience** - Who this system is for
7. **Call-to-Action** - Enterprise deployment information

### Interactive Demo Features

The landing page includes interactive elements that connect to the local API:

- **Real-time threat monitoring** (simulated data)
- **Mesh status display** (12 nodes online)
- **Activity feed** (recent threat responses)
- **System statistics** (threats detected, patches deployed)

---

## API Endpoints (Demo)

The server provides these demo endpoints:

### GET /api/threats
Returns current threat status and recent threats
```json
{
  "active": 3,
  "total": 127,
  "recent": [...]
}
```

### GET /api/mesh/status
Returns mesh network status
```json
{
  "nodesOnline": 12,
  "health": 99.97,
  "uptime": "45 days 3 hours"
}
```

### GET /api/stats
Returns system statistics
```json
{
  "threatsDetected": 1247,
  "patchesDeployed": 1189,
  "successRate": 95.3
}
```

### GET /api/activity
Returns recent activity feed
```json
{
  "activities": [...]
}
```

### POST /api/chat
Natural language interface (demo)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me threat status"}'
```

### POST /api/threats/upload
Upload threat intelligence (demo)
```bash
curl -X POST http://localhost:3000/api/threats/upload \
  -H "Content-Type: application/json" \
  -d '{"id": "CVE-2026-1234", "severity": "critical"}'
```

---

## Development Mode

For auto-reload during development:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

---

## Accessing the System

### Web Interface
- **Landing Page:** http://localhost:3000
- **API Base:** http://localhost:3000/api

### Testing the API

You can test the API using curl, Postman, or your browser:

```bash
# Get threat status
curl http://localhost:3000/api/threats

# Get mesh status
curl http://localhost:3000/api/mesh/status

# Get system stats
curl http://localhost:3000/api/stats

# Chat with ADVERSIQ
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the mesh health?"}'
```

---

## How Users Will Access ADVERSIQ

### Production Deployment Options

#### 1. **Web Dashboard** (Primary Interface)
- URL: `https://your-company.adversiq.io` or `https://your-server:8443`
- Features:
  - Real-time threat monitoring
  - 3D visualization of mesh network
  - Drag-and-drop threat upload
  - Natural language interface
  - Activity feed and alerts
  - Configuration management

#### 2. **REST API** (Programmatic Access)
- Base URL: `https://api.adversiq.io/v1`
- Authentication: Bearer token (JWT)
- Use cases:
  - Integration with existing SIEM/SOAR
  - Automated threat submission
  - Custom dashboards
  - CI/CD pipeline integration

#### 3. **CLI Tool** (Command Line)
- Installation: `npm install -g adversiq-cli`
- Commands:
  ```bash
  adversiq login
  adversiq threats list
  adversiq mesh status
  adversiq logs tail
  ```
- Use cases:
  - DevOps automation
  - Scripting and automation
  - SSH access to servers
  - Quick status checks

#### 4. **Mobile Apps** (iOS/Android)
- Download from App Store / Google Play
- Features:
  - Push notifications for critical threats
  - Quick status overview
  - Approve/reject patch deployments
  - Voice commands
  - Biometric authentication

---

## User Workflow Examples

### Example 1: Security Analyst Monitoring Threats

1. Open web dashboard at `https://dashboard.adversiq.io`
2. View real-time threat feed on main screen
3. Click on threat to see details:
   - CVE information
   - Affected systems
   - Proposed patch
   - Validation results
4. System automatically deploys patch (no action needed)
5. Receive notification when complete

### Example 2: DevOps Engineer Uploading Custom Threat

1. Open web dashboard
2. Navigate to "Upload Threat Intelligence"
3. Drag and drop CVE JSON file or STIX feed
4. System automatically:
   - Parses threat data
   - Runs cognitive purification
   - Generates patch
   - Validates with 46 validators
   - Deploys if consensus reached
5. View results in activity feed

### Example 3: CISO Reviewing Compliance

1. Open web dashboard
2. Navigate to "Compliance" section
3. View:
   - Audit trail (immutable ledger)
   - Patch deployment history
   - Risk score trends
   - Mesh health metrics
4. Export compliance report for auditors
5. Download cryptographically signed evidence

### Example 4: Developer Using API

```javascript
// Integrate ADVERSIQ into your application
const adversiq = require('adversiq-sdk');

// Initialize
const client = adversiq.init({
  apiKey: process.env.ADVERSIQ_API_KEY,
  endpoint: 'https://api.adversiq.io/v1'
});

// Monitor threats
client.threats.stream((threat) => {
  console.log(`New threat: ${threat.id}`);
  console.log(`Severity: ${threat.severity}`);
  console.log(`Status: ${threat.status}`);
});

// Upload custom threat
await client.threats.upload({
  id: 'CUSTOM-2026-001',
  severity: 'high',
  description: 'Custom vulnerability in internal API',
  affectedSystems: ['api-server-1', 'api-server-2']
});

// Get mesh status
const meshStatus = await client.mesh.getStatus();
console.log(`Nodes online: ${meshStatus.nodesOnline}`);
```

---

## System Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACCESS LAYER                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Web    │  │   API    │  │   CLI    │  │ Mobile │ │
│  │ Dashboard│  │          │  │   Tool   │  │  Apps  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│       │             │              │            │       │
└───────┼─────────────┼──────────────┼────────────┼───────┘
        │             │              │            │
┌───────┼─────────────┼──────────────┼────────────┼───────┐
│       │        ADVERSIQ CONTROL PLANE            │       │
│       │        (Your Infrastructure)             │       │
├───────┴─────────────┴──────────────┴────────────┴───────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Quantum Mesh Orchestrator                 │  │
│  │  • Node discovery and management                 │  │
│  │  • Consensus engine (Byzantine fault tolerant)   │  │
│  │  • Federated learning synchronization            │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────┴──────────────────────────┐  │
│  │              Mesh Communication Layer             │  │
│  │  • Encrypted P2P (TLS 1.3 + post-quantum)       │  │
│  │  • Gossip protocol for message propagation       │  │
│  │  • RAFT consensus for leader election            │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────┴──────────────────────────┐  │
│  │           ADVERSIQ Defense Nodes (1-1000+)        │  │
│  │                                                   │  │
│  │  Each node runs complete 7-stage pipeline:       │  │
│  │  1. Threat Ingestion (NVD, CVE, MITRE)          │  │
│  │  2. Cognitive Purification (Sparse Autoencoder)  │  │
│  │  3. Adversarial Quorum (5 agents)               │  │
│  │  4. 46 Validators (8 security layers)           │  │
│  │  5. Monte Carlo Simulation (1000+ scenarios)    │  │
│  │  6. Sandbox Compilation (isolated testing)      │  │
│  │  7. Cryptographic Dispatch (RSA-2048 signing)   │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                YOUR INFRASTRUCTURE                       │
│  • Kubernetes clusters                                  │
│  • Microservices                                        │
│  • Databases                                            │
│  • APIs                                                 │
│  • Legacy systems                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **View the landing page** - Open http://localhost:3000 in your browser
2. **Explore the API** - Test the demo endpoints
3. **Review documentation** - Read the deployment architecture docs
4. **Plan deployment** - Decide on production deployment model

---

## Support

- **Email:** brayden@bwglobaladvis.info
- **Documentation:** See DEPLOYMENT_ARCHITECTURE.md
- **Implementation:** See QUANTUM_MESH_IMPLEMENTATION.md
- **Status:** See PROJECT_STATUS_FINAL.md

---

**ADVERSIQ Intelligence**  
*The World's First Closed-Loop Autonomous Cybersecurity Defense System*