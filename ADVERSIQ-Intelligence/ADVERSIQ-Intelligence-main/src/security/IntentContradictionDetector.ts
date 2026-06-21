/**
 * INTENT CONTRADICTION DETECTOR
 * 
 * The Core DNA of ADVERSIQ Security
 * 
 * Traditional Security: "Does this match a known bad pattern?"
 * ADVERSIQ Security: "Does this code's INTENT contradict its stated PURPOSE?"
 * 
 * This is the fundamental building block that makes ADVERSIQ different.
 * Everything else builds on this one concept.
 */

import * as ts from 'typescript';
import * as esprima from 'esprima';

export interface Intent {
  primaryGoal: string;           // What is code trying to achieve?
  resourceAccess: ResourceAccess[]; // What resources does it touch?
  boundaryViolations: string[];  // What boundaries does it cross?
  hiddenBehaviors: string[];     // What is it hiding?
  cognitiveFlags: string[];      // Psychological tricks detected
  confidenceScore: number;       // How confident are we in this intent?
}

export interface ResourceAccess {
  type: 'file' | 'network' | 'memory' | 'process' | 'registry' | 'database';
  operation: 'read' | 'write' | 'execute' | 'delete' | 'modify';
  target: string;
  suspicious: boolean;
  reason: string;
}

export interface Context {
  statedPurpose: string;         // What does code CLAIM to do?
  expectedBehavior: string[];    // What SHOULD it do?
  permissions: string[];         // What is it ALLOWED to do?
  environment: string;           // Where is it running?
}

export interface Contradiction {
  detected: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  contradictions: ContradictionDetail[];
  overallScore: number;          // 0-100, higher = more suspicious
  recommendation: 'block' | 'investigate' | 'monitor' | 'allow';
}

export interface ContradictionDetail {
  type: string;
  description: string;
  evidence: string[];
  score: number;
}

export class IntentContradictionDetector {
  private readonly SUSPICIOUS_PATTERNS = {
    // Network operations
    network: [
      /fetch\s*\(/gi,
      /XMLHttpRequest/gi,
      /WebSocket/gi,
      /axios\./gi,
      /http\.request/gi,
      /net\.connect/gi,
    ],
    
    // File operations
    file: [
      /fs\.readFile/gi,
      /fs\.writeFile/gi,
      /fs\.unlink/gi,
      /open\s*\(/gi,
      /fopen/gi,
    ],
    
    // Process operations
    process: [
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
      /child_process/gi,
      /system\s*\(/gi,
      /popen/gi,
    ],
    
    // Obfuscation techniques
    obfuscation: [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /atob\s*\(/gi,
      /btoa\s*\(/gi,
      /String\.fromCharCode/gi,
      /unescape/gi,
    ],
    
    // Credential access
    credentials: [
      /password/gi,
      /token/gi,
      /api[_-]?key/gi,
      /secret/gi,
      /credential/gi,
      /auth/gi,
    ],
    
    // Data exfiltration
    exfiltration: [
      /document\.cookie/gi,
      /localStorage/gi,
      /sessionStorage/gi,
      /indexedDB/gi,
    ],
  };

  /**
   * CORE DNA FUNCTION: Extract what code is TRYING to do
   */
  public extractIntent(code: string, language: 'typescript' | 'javascript' | 'python' = 'javascript'): Intent {
    const intent: Intent = {
      primaryGoal: 'unknown',
      resourceAccess: [],
      boundaryViolations: [],
      hiddenBehaviors: [],
      cognitiveFlags: [],
      confidenceScore: 0,
    };

    try {
      // Parse code into AST
      const ast = language === 'python' 
        ? this.parsePython(code)
        : this.parseJavaScript(code);

      // Extract primary goal
      intent.primaryGoal = this.detectPrimaryGoal(code, ast);

      // Detect resource access
      intent.resourceAccess = this.detectResourceAccess(code);

      // Detect boundary violations
      intent.boundaryViolations = this.detectBoundaryViolations(code);

      // Detect hidden behaviors (obfuscation)
      intent.hiddenBehaviors = this.detectObfuscation(code);

      // Detect cognitive manipulation
      intent.cognitiveFlags = this.detectCognitiveBiases(code);

      // Calculate confidence score
      intent.confidenceScore = this.calculateConfidence(intent);

    } catch (error) {
      console.error('Intent extraction failed:', error);
      intent.primaryGoal = 'extraction_failed';
      intent.confidenceScore = 0;
    }

    return intent;
  }

  /**
   * CORE DNA FUNCTION: Compare intent against stated purpose
   */
  public validatePurpose(intent: Intent, context: Context): Contradiction {
    const contradictions: ContradictionDetail[] = [];

    // Check 1: Does intent match stated purpose?
    const purposeMatch = this.checkPurposeAlignment(intent, context);
    if (!purposeMatch.aligned) {
      contradictions.push({
        type: 'purpose_mismatch',
        description: purposeMatch.reason,
        evidence: purposeMatch.evidence,
        score: purposeMatch.severity,
      });
    }

    // Check 2: Does resource access exceed permissions?
    const permissionCheck = this.checkPermissions(intent, context);
    if (!permissionCheck.valid) {
      contradictions.push({
        type: 'permission_violation',
        description: permissionCheck.reason,
        evidence: permissionCheck.evidence,
        score: permissionCheck.severity,
      });
    }

    // Check 3: Are there hidden behaviors?
    if (intent.hiddenBehaviors.length > 0) {
      contradictions.push({
        type: 'obfuscation_detected',
        description: 'Code uses obfuscation techniques to hide behavior',
        evidence: intent.hiddenBehaviors,
        score: 80,
      });
    }

    // Check 4: Are there cognitive manipulation attempts?
    if (intent.cognitiveFlags.length > 0) {
      contradictions.push({
        type: 'cognitive_manipulation',
        description: 'Code attempts to manipulate human perception',
        evidence: intent.cognitiveFlags,
        score: 70,
      });
    }

    // Check 5: Excessive resource access for stated purpose
    const excessiveAccess = this.checkExcessiveAccess(intent, context);
    if (excessiveAccess.excessive) {
      contradictions.push({
        type: 'excessive_access',
        description: excessiveAccess.reason,
        evidence: excessiveAccess.evidence,
        score: excessiveAccess.severity,
      });
    }

    // Calculate overall contradiction score
    const overallScore = this.calculateContradictionScore(contradictions);

    // Determine recommendation
    const recommendation = this.determineRecommendation(overallScore, contradictions);

    return {
      detected: contradictions.length > 0,
      severity: this.determineSeverity(overallScore),
      contradictions,
      overallScore,
      recommendation,
    };
  }

  /**
   * Detect what code is primarily trying to achieve
   */
  private detectPrimaryGoal(code: string, ast: any): string {
    // Analyze function names, variable names, comments
    const goals: string[] = [];

    // Check for data access patterns
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.file)) {
      goals.push('file_access');
    }
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.network)) {
      goals.push('network_communication');
    }
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.process)) {
      goals.push('process_execution');
    }
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.credentials)) {
      goals.push('credential_access');
    }
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.exfiltration)) {
      goals.push('data_exfiltration');
    }

    return goals.length > 0 ? goals.join(', ') : 'computation';
  }

  /**
   * Detect all resource access operations
   */
  private detectResourceAccess(code: string): ResourceAccess[] {
    const resources: ResourceAccess[] = [];

    // Network access
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.network)) {
      resources.push({
        type: 'network',
        operation: 'read',
        target: 'external_server',
        suspicious: true,
        reason: 'Unexpected network communication',
      });
    }

    // File access
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.file)) {
      resources.push({
        type: 'file',
        operation: 'write',
        target: 'filesystem',
        suspicious: true,
        reason: 'Unexpected file system access',
      });
    }

    // Process execution
    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.process)) {
      resources.push({
        type: 'process',
        operation: 'execute',
        target: 'system_command',
        suspicious: true,
        reason: 'Unexpected process execution',
      });
    }

    return resources;
  }

  /**
   * Detect boundary violations (accessing things outside scope)
   */
  private detectBoundaryViolations(code: string): string[] {
    const violations: string[] = [];

    // Check for prototype pollution
    if (/\.__proto__/gi.test(code) || /\.constructor\.prototype/gi.test(code)) {
      violations.push('Prototype pollution attempt detected');
    }

    // Check for global scope pollution
    if (/window\./gi.test(code) || /global\./gi.test(code)) {
      violations.push('Global scope access detected');
    }

    // Check for parent directory traversal
    if (/\.\.\//gi.test(code)) {
      violations.push('Directory traversal attempt detected');
    }

    return violations;
  }

  /**
   * Detect obfuscation and hidden behaviors
   */
  private detectObfuscation(code: string): string[] {
    const hidden: string[] = [];

    if (this.matchesPatterns(code, this.SUSPICIOUS_PATTERNS.obfuscation)) {
      hidden.push('Code obfuscation detected (eval, Function constructor, base64)');
    }

    // Check for hex encoding
    if (/\\x[0-9a-f]{2}/gi.test(code)) {
      hidden.push('Hex-encoded strings detected');
    }

    // Check for unicode obfuscation
    if (/\\u[0-9a-f]{4}/gi.test(code)) {
      hidden.push('Unicode obfuscation detected');
    }

    return hidden;
  }

  /**
   * Detect cognitive bias exploitation
   */
  private detectCognitiveBiases(code: string): string[] {
    const flags: string[] = [];

    // Authority bias: Fake official-looking names
    if (/microsoft|google|amazon|official|secure|verified/gi.test(code)) {
      flags.push('Authority bias: Uses trusted brand names');
    }

    // Urgency bias: Time pressure language
    if (/urgent|immediate|now|expire|limited/gi.test(code)) {
      flags.push('Urgency bias: Creates false time pressure');
    }

    // Complexity bias: Overly complex code to hide intent
    const complexity = this.calculateComplexity(code);
    if (complexity > 50) {
      flags.push('Complexity bias: Unnecessarily complex code');
    }

    return flags;
  }

  /**
   * Check if intent aligns with stated purpose
   */
  private checkPurposeAlignment(intent: Intent, context: Context): {
    aligned: boolean;
    reason: string;
    evidence: string[];
    severity: number;
  } {
    // Example: "Logging library" shouldn't do network calls
    if (context.statedPurpose.toLowerCase().includes('log') && 
        intent.primaryGoal.includes('network')) {
      return {
        aligned: false,
        reason: 'Logging library performing network operations',
        evidence: [`Stated: ${context.statedPurpose}`, `Actual: ${intent.primaryGoal}`],
        severity: 90,
      };
    }

    // Example: "Display component" shouldn't access credentials
    if (context.statedPurpose.toLowerCase().includes('display') && 
        intent.primaryGoal.includes('credential')) {
      return {
        aligned: false,
        reason: 'Display component accessing credentials',
        evidence: [`Stated: ${context.statedPurpose}`, `Actual: ${intent.primaryGoal}`],
        severity: 95,
      };
    }

    return { aligned: true, reason: '', evidence: [], severity: 0 };
  }

  /**
   * Check if resource access exceeds permissions
   */
  private checkPermissions(intent: Intent, context: Context): {
    valid: boolean;
    reason: string;
    evidence: string[];
    severity: number;
  } {
    const violations: string[] = [];

    for (const resource of intent.resourceAccess) {
      const permissionKey = `${resource.type}:${resource.operation}`;
      if (!context.permissions.includes(permissionKey)) {
        violations.push(`Unauthorized ${resource.operation} on ${resource.type}`);
      }
    }

    if (violations.length > 0) {
      return {
        valid: false,
        reason: 'Code exceeds granted permissions',
        evidence: violations,
        severity: 85,
      };
    }

    return { valid: true, reason: '', evidence: [], severity: 0 };
  }

  /**
   * Check for excessive resource access
   */
  private checkExcessiveAccess(intent: Intent, context: Context): {
    excessive: boolean;
    reason: string;
    evidence: string[];
    severity: number;
  } {
    // Example: "Display 1 user profile" shouldn't query 1000 database records
    if (context.statedPurpose.toLowerCase().includes('display') && 
        intent.resourceAccess.length > 5) {
      return {
        excessive: true,
        reason: 'Excessive resource access for display operation',
        evidence: intent.resourceAccess.map(r => `${r.type}:${r.operation}`),
        severity: 75,
      };
    }

    return { excessive: false, reason: '', evidence: [], severity: 0 };
  }

  /**
   * Calculate overall contradiction score
   */
  private calculateContradictionScore(contradictions: ContradictionDetail[]): number {
    if (contradictions.length === 0) return 0;

    // Weighted average of contradiction scores
    const totalScore = contradictions.reduce((sum, c) => sum + c.score, 0);
    return Math.min(100, totalScore / contradictions.length);
  }

  /**
   * Determine severity level
   */
  private determineSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Determine recommendation
   */
  private determineRecommendation(
    score: number, 
    contradictions: ContradictionDetail[]
  ): 'block' | 'investigate' | 'monitor' | 'allow' {
    if (score >= 90) return 'block';
    if (score >= 70) return 'investigate';
    if (score >= 50) return 'monitor';
    return 'allow';
  }

  /**
   * Calculate confidence in intent extraction
   */
  private calculateConfidence(intent: Intent): number {
    let confidence = 100;

    // Reduce confidence if primary goal is unknown
    if (intent.primaryGoal === 'unknown') confidence -= 50;

    // Reduce confidence if obfuscation detected
    if (intent.hiddenBehaviors.length > 0) confidence -= 30;

    // Increase confidence if clear resource access patterns
    if (intent.resourceAccess.length > 0) confidence += 10;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Helper: Check if code matches suspicious patterns
   */
  private matchesPatterns(code: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(code));
  }

  /**
   * Helper: Calculate code complexity
   */
  private calculateComplexity(code: string): number {
    // Simple cyclomatic complexity approximation
    const branches = (code.match(/if|else|for|while|switch|case|\?/g) || []).length;
    const functions = (code.match(/function|=>/g) || []).length;
    return branches + functions;
  }

  /**
   * Helper: Parse JavaScript/TypeScript
   */
  private parseJavaScript(code: string): any {
    try {
      return esprima.parseScript(code, { tolerant: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Helper: Parse Python (simplified)
   */
  private parsePython(code: string): any {
    // Simplified Python parsing - would need proper Python parser
    return { type: 'python', code };
  }
}

/**
 * USAGE EXAMPLE:
 * 
 * const detector = new IntentContradictionDetector();
 * 
 * // Extract intent from suspicious code
 * const intent = detector.extractIntent(suspiciousCode);
 * 
 * // Validate against stated purpose
 * const context = {
 *   statedPurpose: 'Display user profile',
 *   expectedBehavior: ['read user data', 'render HTML'],
 *   permissions: ['database:read'],
 *   environment: 'web_browser'
 * };
 * 
 * const contradiction = detector.validatePurpose(intent, context);
 * 
 * if (contradiction.detected) {
 *   console.log(`THREAT DETECTED: ${contradiction.severity}`);
 *   console.log(`Recommendation: ${contradiction.recommendation}`);
 *   contradiction.contradictions.forEach(c => {
 *     console.log(`- ${c.type}: ${c.description}`);
 *   });
 * }
 */

// Made with Bob
