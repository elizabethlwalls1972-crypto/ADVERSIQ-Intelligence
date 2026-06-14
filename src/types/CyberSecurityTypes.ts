/**
 * CyberSecurityTypes
 * 
 * Complete type system for cybersecurity threat detection and patching engine.
 * Replaces economic domain types (City, Matter, Sector) with cybersecurity equivalents
 * (Threat, Vulnerability, System).
 */

// ============================================================================
// CORE THREAT TYPES
// ============================================================================

/**
 * A detected threat or vulnerability in a system
 */
export interface Threat {
  id: string;
  title: string;
  description: string;
  severity: number; // 0-100 score
  threatType: 'exploit' | 'malware' | 'vulnerability' | 'suspicious-activity' | 'attack';
  indicators: ThreatIndicator[];
  targetSystems: string[];
  targetSoftware: Array<{ name: string; version?: string }>;
  timeDiscovered: Date;
  timeExpires?: Date;
  source: 'cvss' | 'stix' | 'telemetry' | 'isp' | 'community';
  cvssScore?: number;
  cveId?: string;
  exploitProbability?: number; // 0-1
  activelyExploited?: boolean;
  mitigations?: string[];
}

/**
 * Specific indicator of a threat (file hash, IP, domain, etc.)
 */
export interface ThreatIndicator {
  id: string;
  type: 'malware' | 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file' | 'cve';
  value: string;
  confidence: number; // 0-1
  source: string;
  lastSeen: Date;
  context?: string;
}

/**
 * A specific code vulnerability
 */
export interface Vulnerability {
  id: string;
  cveId?: string;
  title: string;
  description: string;
  cwe?: string; // CWE ID (e.g., CWE-89 for SQL Injection)
  cvssScore: number; // 0-10
  affectedSoftware: Array<{ name: string; version: string }>;
  publishedDate: Date;
  discoveryMethod: 'static-analysis' | 'dynamic-analysis' | 'manual-review' | 'external-report';
  complexity: 'low' | 'medium' | 'high';
  privilegesRequired: 'none' | 'low' | 'high';
  userInteraction: boolean;
  scope: 'unchanged' | 'changed';
  confidentialityImpact: 'none' | 'low' | 'high';
  integrityImpact: 'none' | 'low' | 'high';
  availabilityImpact: 'none' | 'low' | 'high';
  references: string[];
}

/**
 * An automatically generated or manually created patch
 */
export interface Patch {
  id: string;
  generatedAt: Date;
  targetVulnerability: string; // Vulnerability ID
  patchCode: string; // The actual code changes
  format: 'unified-diff' | 'json-patch' | 'typescript' | 'javascript';
  confidence: number; // 0-1, how confident in this patch
  validationScore?: number; // 0-100
  appliedSuccessfully?: boolean;
  testResults?: {
    unitTestsPassed: boolean;
    integrationTestsPassed: boolean;
    securityTestsPassed: boolean;
    performanceTestsPassed: boolean;
  };
  rollbackInfo?: {
    previousCode: string;
    rollbackDate?: Date;
    reason?: string;
  };
  deployedTo?: string[]; // System IDs where deployed
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'deployed';
  approverNotes?: string;
}

/**
 * A system being monitored and protected
 */
export interface TargetSystem {
  id: string;
  name: string;
  type: 'web-application' | 'backend-service' | 'api' | 'infrastructure' | 'database' | 'container';
  osType: 'linux' | 'windows' | 'macos' | 'ios' | 'android' | 'other';
  software: Array<{ name: string; version: string }>;
  publiclyAccessible: boolean;
  networkZone: 'dmz' | 'internal' | 'restricted' | 'isolated';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  discoveredVulnerabilities: string[]; // Vulnerability IDs
  appliedPatches: string[]; // Patch IDs
  lastScanned: Date;
  lastPatched?: Date;
  owner?: string; // Contact email
  location?: string; // Geographic or logical location
}

/**
 * A detected code quality issue
 */
export interface CodeIssue {
  id: string;
  type: 'vulnerability' | 'code-smell' | 'performance' | 'maintainability';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file: string;
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
  detectedBy: string; // Tool name
  detectionDate: Date;
  resolved?: boolean;
  resolutionMethod?: string;
}

// ============================================================================
// ANALYSIS & QUORUM TYPES
// ============================================================================

/**
 * Result of analyzing a threat or code
 */
export interface AnalysisResult {
  id: string;
  timestamp: Date;
  input: string; // Original threat description or code
  threatsIdentified: Threat[];
  vulnerabilitiesFound: Vulnerability[];
  confidenceLevel: number; // 0-1
  analysisMethod: 'llm' | 'static-analysis' | 'dynamic-analysis' | 'hybrid';
  executionTime: number; // ms
  notes?: string;
}

/**
 * Persona in the 5-agent quorum for cybersecurity decisions
 */
export interface CyberSecurityPersona {
  id: string;
  role: 'Exploiter' | 'Auditor' | 'Architect' | 'Tester' | 'Synthesiser';
  description: string;
  perspective: string; // What they focus on
  reasoning: string; // Their argument
  riskLevel: number; // 0-1, their risk tolerance
  patchApproval: 'approved' | 'rejected' | 'conditional';
  conditions?: string[];
  confidence: number; // 0-1
}

/**
 * Quorum debate record for a specific decision
 */
export interface QuorumDebate {
  id: string;
  subject: string; // What's being decided
  personas: CyberSecurityPersona[];
  votes: {
    approve: number;
    reject: number;
    abstain: number;
  };
  consensusReached: boolean;
  finalDecision: 'approved' | 'rejected' | 'needs-modification';
  decisionRationale: string;
  executionTime: number; // ms
  timestamp: Date;
}

/**
 * Generation phase for autonomous operations
 */
export type GenerationPhase =
  | 'idle'
  | 'intake'
  | 'analysis'
  | 'threat-detection'
  | 'vulnerability-scan'
  | 'quorum-debate'
  | 'patch-generation'
  | 'patch-validation'
  | 'deployment'
  | 'complete';

/**
 * Full payload for threat analysis
 */
export interface ThreatAnalysisPayload {
  id: string;
  threatDescription: string;
  systemContext?: {
    systems: TargetSystem[];
    recentPatches?: Patch[];
    knownVulnerabilities?: Vulnerability[];
  };
  analysisConfig?: {
    depth: 'quick' | 'standard' | 'deep';
    focusAreas?: string[];
    skipSystems?: string[];
  };
  confidenceScores?: {
    threatDetection: number;
    exploitProbability: number;
    patchViability: number;
  };
  computedIntelligence?: {
    identifiedThreats: Threat[];
    recommendedPatches: Patch[];
    deploymentStrategy: DeploymentStrategy;
  };
}

/**
 * Strategy for deploying patches across systems
 */
export interface DeploymentStrategy {
  phased: boolean;
  phases?: Array<{
    phaseNumber: number;
    systemsInvolved: string[];
    duration: number; // minutes
    rollbackThreshold: number; // 0-1, when to rollback
  }>;
  rollbackPlan: RollbackPlan;
  communicationPlan?: {
    stakeholders: string[];
    notifications: boolean;
    updateFrequency: 'realtime' | 'hourly' | 'daily';
  };
}

/**
 * Rollback procedure if patch fails
 */
export interface RollbackPlan {
  enabled: boolean;
  autoTrigger: boolean;
  triggers?: {
    failedTests: boolean;
    performanceDegradation: boolean;
    monitoringAlerts: boolean;
  };
  estimatedTime: number; // minutes
  verificationSteps: string[];
}

// ============================================================================
// REPORTING & METRICS
// ============================================================================

/**
 * Security posture report
 */
export interface SecurityPostureReport {
  timestamp: Date;
  systems: TargetSystem[];
  totalThreats: number;
  threatsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  totalVulnerabilities: number;
  vulnerabilitiesFixed: number;
  patchComplianceRate: number; // 0-1
  averageTimeToRemediatee: number; // hours
  recentThreats: Threat[];
  recommendations: string[];
}

/**
 * Autonomous operation record
 */
export interface AutonomousOperationRecord {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  threatsDetected: number;
  patchesGenerated: number;
  patchesDeployed: number;
  deploymentsSuccessful: number;
  deploymentsFailed: number;
  incidents: OperationIncident[];
  log: string[]; // Audit trail
}

/**
 * Incident during autonomous operation
 */
export interface OperationIncident {
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action: string; // What the system did
  humanReviewRequired: boolean;
}

/**
 * Self-improvement suggestion from learning
 */
export interface SelfImprovementSuggestion {
  id: string;
  suggestedBy: 'AlgorithmicMutator' | 'QuorumGatekeeper' | 'SelfEvolvingAlgorithm';
  category: 'formula-adjustment' | 'persona-tuning' | 'threshold-optimization' | 'feature-request';
  description: string;
  expectedBenefit: string;
  implementationCost: 'low' | 'medium' | 'high';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'implemented';
  implementedDate?: Date;
}

// ============================================================================
// ALERT & EVENT TYPES
// ============================================================================

/**
 * Real-time alert for security events
 */
export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  alertType: string; // e.g., "sql-injection-attempt", "privilege-escalation"
  source: string; // System ID
  details: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  mitigationApplied: boolean;
  mitigationDetails?: string;
}

/**
 * Event in the autonomous system lifecycle
 */
export interface SystemEvent {
  id: string;
  timestamp: Date;
  eventType:
    | 'threat-detected'
    | 'vulnerability-found'
    | 'patch-generated'
    | 'patch-deployed'
    | 'deployment-failed'
    | 'rollback-triggered'
    | 'quorum-decision'
    | 'formula-mutation'
    | 'self-improvement-applied';
  actor: string; // Agent or component that triggered event
  subject: string; // What was acted upon
  details: Record<string, unknown>;
  status: 'success' | 'failure' | 'pending';
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Overall system configuration
 */
export interface CyberSecuritySystemConfig {
  enableAutonomousPatching: boolean;
  enableQuorumDebate: boolean;
  enableSelfHealing: boolean;
  threatSeverityThreshold: number; // Only respond to threats >= this severity
  patchingStrategy: 'aggressive' | 'cautious' | 'manual-approval';
  maxConcurrentDeployments: number;
  rollbackEnabled: boolean;
  alertingEnabled: boolean;
  alertingChannels: Array<{
    type: 'email' | 'slack' | 'webhook' | 'sms';
    destination: string;
    minSeverity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  maintenanceWindow?: {
    dayOfWeek: number; // 0-6
    startHour: number;
    durationHours: number;
  };
}

/**
 * System health metrics
 */
export interface SystemHealth {
  timestamp: Date;
  threatsUnderControl: boolean;
  vulnerabilitiesPatched: number;
  pendingPatches: number;
  failedDeployments: number;
  systemsMonitored: number;
  responseTimeMs: number;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  lastSuccessfulScan: Date;
  nextScheduledScan: Date;
}
