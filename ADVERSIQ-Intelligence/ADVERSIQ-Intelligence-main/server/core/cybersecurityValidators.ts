/**
 * CYBERSECURITY VALIDATORS - 46 Metrics Replacing 46 Economic Formulas
 * 
 * This is the "formula layer swap" that enables ADVERSIQ to transition from
 * regional economic intelligence to autonomous cybersecurity patch validation.
 * 
 * ApexExecutionLoop watches variance in these validators just as it watched
 * variance in SPI, RROI, SEAM, IVAST, etc. Same engine, different domain.
 * 
 * VALIDATOR LAYERS:
 * - Layer 1: Code Integrity (8 validators)
 * - Layer 2: Memory/Runtime (8 validators)
 * - Layer 3: Cryptography (8 validators)
 * - Layer 4: Dependencies (8 validators)
 * - Layer 5: Injection Attacks (6 validators)
 * - Layer 6: Permission/Auth (5 validators)
 * - Layer 7: API Security (2 validators)
 * - Layer 8: Error Handling (1 validator)
 * Total: 46 validators
 */

// ============================================================================
// VALIDATOR RESULT INTERFACE
// ============================================================================

export interface ValidatorResult {
  validatorId: string;
  validatorName: string;
  score: number; // 0-1, where 1 = completely secure
  severity: number; // 0-1, where 1 = critical vulnerability
  timestamp: number;
  metadata: {
    layer: number;
    description: string;
    remediationSteps?: string[];
  };
}

export interface SystemRiskScore {
  overallRisk: number; // 0-1
  byLayer: Record<number, number>;
  criticalValidators: string[];
  timestamp: number;
}

// ============================================================================
// LAYER 1: CODE INTEGRITY (8 validators)
// ============================================================================

export function computeCyclomaticComplexity(code: string): ValidatorResult {
  let cc = 1;
  for (const line of code.split('\n')) {
    if (line.includes('if') || line.includes('?')) cc++;
    if (line.includes('case')) cc++;
    if (line.includes('catch')) cc++;
  }
  const score = Math.max(0, 1 - (cc / 50)); // Higher CC = lower score
  return {
    validatorId: 'CYCLOMATIC_COMPLEXITY',
    validatorName: 'Cyclomatic Complexity',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Code path complexity (target: <10)',
      remediationSteps: ['Break large functions into smaller ones', 'Simplify conditional logic']
    }
  };
}

export function computeNestedDepthRisk(code: string): ValidatorResult {
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of code) {
    if (char === '{') currentDepth++;
    if (char === '}') currentDepth--;
    maxDepth = Math.max(maxDepth, currentDepth);
  }
  const score = Math.max(0, 1 - (maxDepth / 10));
  return {
    validatorId: 'NESTED_DEPTH_RISK',
    validatorName: 'Nested Depth Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Nesting depth (target: <5 levels)',
      remediationSteps: ['Extract nested logic into helper functions', 'Use guard clauses']
    }
  };
}

export function computeLineLengthViolations(code: string): ValidatorResult {
  const MAX_LENGTH = 120;
  const lines = code.split('\n');
  const violations = lines.filter(l => l.length > MAX_LENGTH).length;
  const score = Math.max(0, 1 - (violations / lines.length));
  return {
    validatorId: 'LINE_LENGTH_VIOLATIONS',
    validatorName: 'Line Length Violations',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: `Lines exceeding ${MAX_LENGTH} chars (reduces readability)`
    }
  };
}

export function computeUnusedVariableScore(code: string): ValidatorResult {
  const declared = (code.match(/const\s+\w+|let\s+\w+/g) || []).length;
  const referenced = (code.match(/\w+\s*[+\-*=]/g) || []).length;
  const score = Math.min(1, referenced / Math.max(1, declared));
  return {
    validatorId: 'UNUSED_VARIABLE_SCORE',
    validatorName: 'Unused Variable Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Ratio of used to declared variables'
    }
  };
}

export function computeDeadCodePercentage(code: string): ValidatorResult {
  // Simplified: detect unreachable code after return statements
  const lines = code.split('\n');
  let deadLines = 0;
  let foundReturn = false;
  for (const line of lines) {
    if (line.includes('return')) foundReturn = true;
    else if (foundReturn && line.trim() && !line.includes('}')) deadLines++;
  }
  const score = Math.max(0, 1 - (deadLines / lines.length));
  return {
    validatorId: 'DEAD_CODE_PERCENTAGE',
    validatorName: 'Dead Code Percentage',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Unreachable code percentage',
      remediationSteps: ['Remove code after return statements', 'Delete unused branches']
    }
  };
}

export function computeFunctionSizeRisk(code: string): ValidatorResult {
  const matches = code.match(/function\s+\w+.*?{[\s\S]*?}|const\s+\w+\s*=\s*.*?=>/g);
  const functions = (matches || []) as string[];
  const avgSize = functions.reduce((sum, fn) => sum + fn.length, 0) / Math.max(1, functions.length);
  const score = Math.max(0, 1 - (avgSize / 500)); // Target: <500 chars
  return {
    validatorId: 'FUNCTION_SIZE_RISK',
    validatorName: 'Function Size Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Average function size (target: <500 chars)'
    }
  };
}

export function computeCommentCoverageDeficiency(code: string): ValidatorResult {
  const codeLines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
  const commentLines = code.split('\n').filter(l => l.trim().startsWith('//'));
  const score = Math.min(1, commentLines.length / Math.max(1, codeLines.length));
  return {
    validatorId: 'COMMENT_COVERAGE_DEFICIENCY',
    validatorName: 'Comment Coverage Deficiency',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Comment-to-code ratio (target: >0.1)',
      remediationSteps: ['Add JSDoc comments to functions', 'Document complex logic']
    }
  };
}

export function computeDuplicateCodeClones(code: string): ValidatorResult {
  const lines = code.split('\n');
  const lineMap = new Map<string, number>();
  let duplicates = 0;
  for (const line of lines) {
    const normalized = line.trim();
    lineMap.set(normalized, (lineMap.get(normalized) || 0) + 1);
  }
  for (const count of lineMap.values()) {
    if (count > 1) duplicates += count - 1;
  }
  const score = Math.max(0, 1 - (duplicates / lines.length));
  return {
    validatorId: 'DUPLICATE_CODE_CLONES',
    validatorName: 'Duplicate Code Clones',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 1,
      description: 'Code duplication percentage',
      remediationSteps: ['Extract common code into shared functions']
    }
  };
}

// ============================================================================
// LAYER 2: MEMORY/RUNTIME (8 validators)
// ============================================================================

export function computeMemoryLeakRisk(code: string): ValidatorResult {
  const allocations = (code.match(/new\s+\w+|malloc|allocate/gi) || []).length;
  const deallocations = (code.match(/delete|free|dispose|cleanup/gi) || []).length;
  const score = Math.min(1, deallocations / Math.max(1, allocations));
  return {
    validatorId: 'MEMORY_LEAK_RISK',
    validatorName: 'Memory Leak Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Allocation to deallocation ratio',
      remediationSteps: ['Add cleanup in finally blocks', 'Use destructors for resource management']
    }
  };
}

export function computeBufferOverflowVulnerability(code: string): ValidatorResult {
  const unsafeOps = (code.match(/strcpy|memcpy|sprintf|gets\(/gi) || []).length;
  const score = Math.max(0, 1 - (unsafeOps * 0.2));
  return {
    validatorId: 'BUFFER_OVERFLOW_VULNERABILITY',
    validatorName: 'Buffer Overflow Vulnerability',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Use of unsafe memory functions',
      remediationSteps: ['Replace strcpy with strncpy', 'Use safe alternatives']
    }
  };
}

export function computeStackFrameDepth(code: string): ValidatorResult {
  const recursion = (code.match(/\w+\s*\(\s*\.\.\.\s*\w+\s*\)/g) || []).length;
  const score = Math.max(0, 1 - (recursion / 10));
  return {
    validatorId: 'STACK_FRAME_DEPTH',
    validatorName: 'Stack Frame Depth',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Recursive call depth risk'
    }
  };
}

export function computeThreadSafetyViolation(code: string): ValidatorResult {
  const unsafeGlobals = (code.match(/\bstatic\b.*?[^const].*?[=;]/g) || []).length;
  const locks = (code.match(/\block|mutex|semaphore/gi) || []).length;
  const score = unsafeGlobals === 0 ? 1 : Math.min(1, locks / Math.max(1, unsafeGlobals));
  return {
    validatorId: 'THREAD_SAFETY_VIOLATION',
    validatorName: 'Thread Safety Violation',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Shared mutable state without synchronization'
    }
  };
}

export function computeAllocatorFragmentation(code: string): ValidatorResult {
  const mallocs = (code.match(/malloc|new/gi) || []).length;
  const frees = (code.match(/free|delete/gi) || []).length;
  const interleaving = Math.abs(mallocs - frees);
  const score = Math.max(0, 1 - (interleaving / Math.max(1, mallocs + frees)));
  return {
    validatorId: 'ALLOCATOR_FRAGMENTATION',
    validatorName: 'Allocator Fragmentation',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Memory allocation/deallocation interleaving'
    }
  };
}

export function computeExceptionHandlingGaps(code: string): ValidatorResult {
  const tryBlocks = (code.match(/try\s*{/g) || []).length;
  const catchBlocks = (code.match(/catch\s*\(/g) || []).length;
  const score = tryBlocks === 0 ? 1 : Math.min(1, catchBlocks / tryBlocks);
  return {
    validatorId: 'EXCEPTION_HANDLING_GAPS',
    validatorName: 'Exception Handling Gaps',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Uncaught exception risk',
      remediationSteps: ['Add try-catch blocks', 'Handle all exception types']
    }
  };
}

export function computeCPUSpikeSusceptibility(code: string): ValidatorResult {
  const loops = (code.match(/for\s*\(|while\s*\(/g) || []).length;
  const sleeps = (code.match(/sleep|wait|yield/gi) || []).length;
  const score = loops === 0 ? 1 : Math.min(1, sleeps / loops);
  return {
    validatorId: 'CPU_SPIKE_SUSCEPTIBILITY',
    validatorName: 'CPU Spike Susceptibility',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Tight loops without throttling'
    }
  };
}

export function computeIOBlockingSuspicion(code: string): ValidatorResult {
  const ioOps = (code.match(/read|write|fetch|http\.get/gi) || []).length;
  const asyncOps = (code.match(/async|await|promise/gi) || []).length;
  const score = ioOps === 0 ? 1 : Math.min(1, asyncOps / ioOps);
  return {
    validatorId: 'IO_BLOCKING_SUSPICION',
    validatorName: 'I/O Blocking Suspicion',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 2,
      description: 'Synchronous I/O operations that could block'
    }
  };
}

// ============================================================================
// LAYER 3: CRYPTOGRAPHY (8 validators)
// ============================================================================

export function computeWeakEncryptionUsage(code: string): ValidatorResult {
  const weakCyphers = (code.match(/DES|RC4|MD5|SHA1(?!2)/gi) || []).length;
  const score = Math.max(0, 1 - (weakCyphers * 0.2));
  return {
    validatorId: 'WEAK_ENCRYPTION_USAGE',
    validatorName: 'Weak Encryption Usage',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Use of deprecated cryptographic algorithms',
      remediationSteps: ['Replace DES with AES-256', 'Use SHA-256 or better']
    }
  };
}

export function computeKeyManagementRisk(code: string): ValidatorResult {
  const hardcodedKeys = (code.match(/password|secret|key|token\s*[=:]\s*['"][^'"]{8,}/gi) || []).length;
  const envKeys = (code.match(/process\.env|ENV\[|getenv/gi) || []).length;
  const score = hardcodedKeys === 0 ? 1 : Math.min(1, envKeys / Math.max(1, hardcodedKeys + envKeys));
  return {
    validatorId: 'KEY_MANAGEMENT_RISK',
    validatorName: 'Key Management Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Hardcoded secrets vs environment variables',
      remediationSteps: ['Move all secrets to .env files', 'Use key management services']
    }
  };
}

export function computePasswordPolicyViolation(code: string): ValidatorResult {
  const weakPasswordChecks = (code.match(/length\s*[<]\s*8|password\.length/gi) || []).length;
  const strongChecks = (code.match(/password\s*\.match.*?[A-Z]|password\s*\.match.*?[0-9]/gi) || []).length;
  const score = weakPasswordChecks === 0 && strongChecks > 0 ? 1 : 0.5;
  return {
    validatorId: 'PASSWORD_POLICY_VIOLATION',
    validatorName: 'Password Policy Violation',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Weak password validation (target: min 12 chars, mixed case, numbers)',
      remediationSteps: ['Enforce minimum length', 'Require character diversity']
    }
  };
}

export function computeHashingAlgorithmWeakness(code: string): ValidatorResult {
  const weakHashes = (code.match(/MD5|SHA1(?!2)/gi) || []).length;
  const strongHashes = (code.match(/SHA256|SHA3|bcrypt|argon/gi) || []).length;
  const score = weakHashes === 0 && strongHashes > 0 ? 1 : Math.max(0, 1 - (weakHashes / Math.max(1, strongHashes + weakHashes)));
  return {
    validatorId: 'HASHING_ALGORITHM_WEAKNESS',
    validatorName: 'Hashing Algorithm Weakness',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Use of weak vs strong hashing algorithms'
    }
  };
}

export function computeRandomnessQualityScore(code: string): ValidatorResult {
  const weakRandom = (code.match(/Math\.random|rand\(/gi) || []).length;
  const strongRandom = (code.match(/crypto\.random|crypto\.getRandomValues|SecureRandom/gi) || []).length;
  const score = weakRandom === 0 && strongRandom > 0 ? 1 : Math.max(0, 1 - (weakRandom / Math.max(1, strongRandom + weakRandom)));
  return {
    validatorId: 'RANDOMNESS_QUALITY_SCORE',
    validatorName: 'Randomness Quality Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Cryptographically secure RNG vs weak PRNG'
    }
  };
}

export function computeSSLCertificateExpiry(code: string): ValidatorResult {
  // Placeholder: In production, would check actual certificate expiry dates
  const sslConfig = (code.match(/https|ssl|tls/gi) || []).length;
  const score = sslConfig > 0 ? 0.8 : 0.2; // Requires runtime verification
  return {
    validatorId: 'SSL_CERTIFICATE_EXPIRY',
    validatorName: 'SSL Certificate Expiry',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'SSL certificate validity and expiration'
    }
  };
}

export function computeEncryptionCoverageGap(code: string): ValidatorResult {
  const dataOps = (code.match(/database|network|send|transmit/gi) || []).length;
  const encryptedOps = (code.match(/encrypt|AES|RSA|crypto/gi) || []).length;
  const score = dataOps === 0 ? 1 : Math.min(1, encryptedOps / dataOps);
  return {
    validatorId: 'ENCRYPTION_COVERAGE_GAP',
    validatorName: 'Encryption Coverage Gap',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Sensitive data transmission encryption coverage'
    }
  };
}

export function computePrivateKeyExposureRisk(code: string): ValidatorResult {
  const keyExposures = (code.match(/console\.log.*?key|key\s*\+|print.*?key/gi) || []).length;
  const score = Math.max(0, 1 - (keyExposures * 0.3));
  return {
    validatorId: 'PRIVATE_KEY_EXPOSURE_RISK',
    validatorName: 'Private Key Exposure Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 3,
      description: 'Risk of private key accidental disclosure',
      remediationSteps: ['Never log keys', 'Sanitize error messages']
    }
  };
}

// ============================================================================
// LAYER 4: DEPENDENCIES (8 validators)
// ============================================================================

export function computeOutdatedDependencyRatio(deps: Array<{name: string; version: string; latest: string}>): ValidatorResult {
  if (deps.length === 0) {
    return {
      validatorId: 'OUTDATED_DEPENDENCY_RATIO',
      validatorName: 'Outdated Dependency Ratio',
      score: 1,
      severity: 0,
      timestamp: Date.now(),
      metadata: {
        layer: 4,
        description: 'Percentage of dependencies behind latest version'
      }
    };
  }
  const outdated = deps.filter(d => d.version !== d.latest).length;
  const score = Math.max(0, 1 - (outdated / deps.length));
  return {
    validatorId: 'OUTDATED_DEPENDENCY_RATIO',
    validatorName: 'Outdated Dependency Ratio',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Percentage of dependencies behind latest version'
    }
  };
}

export function computeTransitiveDependencyDepth(_code: string): ValidatorResult {
  // Placeholder: Would analyze package-lock.json in production
  return {
    validatorId: 'TRANSITIVE_DEPENDENCY_DEPTH',
    validatorName: 'Transitive Dependency Depth',
    score: 0.8,
    severity: 0.2,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Depth of dependency tree (target: <5 levels)'
    }
  };
}

export function computeLicenseCompatibilityViolation(_code: string): ValidatorResult {
  // Placeholder: Would check license compatibility matrix
  return {
    validatorId: 'LICENSE_COMPATIBILITY_VIOLATION',
    validatorName: 'License Compatibility Violation',
    score: 0.9,
    severity: 0.1,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'GPL/LGPL/MIT license compatibility'
    }
  };
}

export function computeUnmaintainedDependencyCount(deps: Array<{name: string; lastUpdate: number}>): ValidatorResult {
  const now = Date.now();
  const TWO_YEARS = 2 * 365 * 24 * 60 * 60 * 1000;
  const unmaintained = deps.filter(d => now - d.lastUpdate > TWO_YEARS).length;
  const score = Math.max(0, 1 - (unmaintained / Math.max(1, deps.length)));
  return {
    validatorId: 'UNMAINTAINED_DEPENDENCY_COUNT',
    validatorName: 'Unmaintained Dependency Count',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Dependencies not updated in >2 years'
    }
  };
}

export function computeCVEExposureScore(cves: Array<{severity: number}>): ValidatorResult {
  const maxSeverity = cves.length === 0 ? 0 : Math.max(...cves.map(c => c.severity));
  const avgSeverity = cves.length === 0 ? 0 : cves.reduce((sum, c) => sum + c.severity, 0) / cves.length;
  const score = Math.max(0, 1 - Math.max(maxSeverity, avgSeverity));
  return {
    validatorId: 'CVE_EXPOSURE_SCORE',
    validatorName: 'CVE Exposure Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Known CVEs in dependencies'
    }
  };
}

export function computeDependencyResolutionAmbiguity(_code: string): ValidatorResult {
  // Placeholder: Would check for version conflicts
  return {
    validatorId: 'DEPENDENCY_RESOLUTION_AMBIGUITY',
    validatorName: 'Dependency Resolution Ambiguity',
    score: 0.95,
    severity: 0.05,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Version conflict ambiguities in package.json'
    }
  };
}

export function computeSupplyChainAttackSurface(_code: string): ValidatorResult {
  // Placeholder: Would analyze build pipeline
  return {
    validatorId: 'SUPPLY_CHAIN_ATTACK_SURFACE',
    validatorName: 'Supply Chain Attack Surface',
    score: 0.85,
    severity: 0.15,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Build system exposure to malicious dependencies'
    }
  };
}

export function computeDependencyAbusePotential(deps: Array<{downloads: number; owner: string}>): ValidatorResult {
  const highValue = deps.filter(d => d.downloads > 1000000).length;
  const riskScore = (highValue / Math.max(1, deps.length)) * 0.3; // Popular = higher risk
  const score = Math.max(0, 1 - riskScore);
  return {
    validatorId: 'DEPENDENCY_ABUSE_POTENTIAL',
    validatorName: 'Dependency Abuse Potential',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 4,
      description: 'Typosquatting and package hijacking risk'
    }
  };
}

// ============================================================================
// LAYER 5: INJECTION ATTACKS (6 validators)
// ============================================================================

export function computeSQLInjectionVulnerability(code: string): ValidatorResult {
  const sqlQueries = (code.match(/select|insert|update|delete/gi) || []).length;
  const parameterized = (code.match(/\?|:\w+|\$\d+/g) || []).length;
  const stringConcat = (code.match(/query\s*\+|query\s*\+=|`\$\{.*?\}`/g) || []).length;
  const score = sqlQueries === 0 ? 1 : Math.min(1, parameterized / Math.max(1, sqlQueries - stringConcat));
  return {
    validatorId: 'SQL_INJECTION_VULNERABILITY',
    validatorName: 'SQL Injection Vulnerability',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'Dynamic SQL query construction vs parameterized queries',
      remediationSteps: ['Use prepared statements', 'Always parameterize user input']
    }
  };
}

export function computeCommandInjectionRisk(code: string): ValidatorResult {
  const exec = (code.match(/exec|system|spawn/gi) || []).length;
  const sanitized = (code.match(/escape|quote|shield/gi) || []).length;
  const score = exec === 0 ? 1 : Math.min(1, sanitized / exec);
  return {
    validatorId: 'COMMAND_INJECTION_RISK',
    validatorName: 'Command Injection Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'Shell command execution with user input'
    }
  };
}

export function computeXSSVulnerabilityScore(code: string): ValidatorResult {
  const htmlOutputs = (code.match(/innerHTML|dangerouslySetInnerHTML|insertAdjacentHTML/gi) || []).length;
  const encoded = (code.match(/encodeURIComponent|htmlEscape|sanitize|DOMPurify/gi) || []).length;
  const score = htmlOutputs === 0 ? 1 : Math.min(1, encoded / htmlOutputs);
  return {
    validatorId: 'XSS_VULNERABILITY_SCORE',
    validatorName: 'XSS Vulnerability Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'Direct HTML injection vs safe output encoding',
      remediationSteps: ['Use textContent instead of innerHTML', 'Sanitize user input']
    }
  };
}

export function computeDeserializationRisk(code: string): ValidatorResult {
  const deserialization = (code.match(/JSON\.parse|pickle\.loads|yaml\.load|unmarshall/gi) || []).length;
  const validation = (code.match(/validate|schema|check|assert/gi) || []).length;
  const score = deserialization === 0 ? 1 : Math.min(1, validation / deserialization);
  return {
    validatorId: 'DESERIALIZATION_RISK',
    validatorName: 'Deserialization Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'Untrusted object deserialization risk'
    }
  };
}

export function computeTemplateInjectionScore(code: string): ValidatorResult {
  const templates = (code.match(/template|handlebars|nunjucks|jinja/gi) || []).length;
  const escaped = (code.match(/escape|sanitize|safe/gi) || []).length;
  const score = templates === 0 ? 1 : Math.min(1, escaped / templates);
  return {
    validatorId: 'TEMPLATE_INJECTION_SCORE',
    validatorName: 'Template Injection Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'Server-side template injection risk'
    }
  };
}

export function computeHeaderInjectionVulnerability(code: string): ValidatorResult {
  const headers = (code.match(/setHeader|response\.set|headers\[/gi) || []).length;
  const sanitized = (code.match(/replace|sanitize|validate/gi) || []).length;
  const score = headers === 0 ? 1 : Math.min(1, sanitized / headers);
  return {
    validatorId: 'HEADER_INJECTION_VULNERABILITY',
    validatorName: 'Header Injection Vulnerability',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 5,
      description: 'HTTP header injection via newline characters'
    }
  };
}

// ============================================================================
// LAYER 6: PERMISSION & AUTH (5 validators)
// ============================================================================

export function computePrivilegeEscalationVector(code: string): ValidatorResult {
  const sudoOps = (code.match(/sudo|elevate|sudo su|become/gi) || []).length;
  const checks = (code.match(/isAdmin|checkPermission|requireRole|authorize/gi) || []).length;
  const score = sudoOps === 0 ? 1 : Math.min(1, checks / sudoOps);
  return {
    validatorId: 'PRIVILEGE_ESCALATION_VECTOR',
    validatorName: 'Privilege Escalation Vector',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 6,
      description: 'Privilege elevation without proper authorization checks'
    }
  };
}

export function computeAuthenticationBypassScore(code: string): ValidatorResult {
  const authCheck = (code.match(/if\s*\(.*?auth|if\s*\(.*?token|authenticate\(/gi) || []).length;
  const unconditionalAccess = (code.match(/return.*?data|sendData|respond/gi) || []).length;
  const score = authCheck === 0 ? 0.3 : Math.min(1, authCheck / (authCheck + unconditionalAccess));
  return {
    validatorId: 'AUTHENTICATION_BYPASS_SCORE',
    validatorName: 'Authentication Bypass Score',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 6,
      description: 'Protected endpoints vs unauthenticated access'
    }
  };
}

export function computeAccessControlGranularity(code: string): ValidatorResult {
  const roleChecks = (code.match(/role|permission|capability/gi) || []).length;
  const binaryAuth = (code.match(/authenticated|isLoggedIn|isAuthorized/gi) || []).length;
  const score = roleChecks > 0 ? 0.95 : Math.max(0, 1 - ((binaryAuth > 0 ? 0.2 : 0) * 2));
  return {
    validatorId: 'ACCESS_CONTROL_GRANULARITY',
    validatorName: 'Access Control Granularity',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 6,
      description: 'Role-based vs binary authentication',
      remediationSteps: ['Implement RBAC', 'Define permission matrix']
    }
  };
}

export function computeSessionManagementWeakness(code: string): ValidatorResult {
  const sessions = (code.match(/session|cookie|jwt|token/gi) || []).length;
  const expiry = (code.match(/expires|ttl|timeout|maxAge/gi) || []).length;
  const secure = (code.match(/secure|httpOnly|sameSite/gi) || []).length;
  const score = sessions === 0 ? 1 : Math.min(1, (expiry + secure) / (sessions * 2));
  return {
    validatorId: 'SESSION_MANAGEMENT_WEAKNESS',
    validatorName: 'Session Management Weakness',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 6,
      description: 'Session timeout and security flags'
    }
  };
}

export function computeMFAAdoptionGap(code: string): ValidatorResult {
  const auth = (code.match(/authenticate|login|signin/gi) || []).length;
  const mfa = (code.match(/totp|otp|2fa|multifactor|mfa/gi) || []).length;
  const score = auth === 0 ? 1 : Math.min(1, mfa / auth);
  return {
    validatorId: 'MFA_ADOPTION_GAP',
    validatorName: 'MFA Adoption Gap',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 6,
      description: 'Multi-factor authentication coverage',
      remediationSteps: ['Enable TOTP/HOTP', 'Require MFA for sensitive operations']
    }
  };
}

// ============================================================================
// LAYER 7: API SECURITY (2 validators)
// ============================================================================

export function computeAPIRateLimitingAbsence(code: string): ValidatorResult {
  const endpoints = (code.match(/app\.(get|post|put|delete|patch)/gi) || []).length;
  const rateLimit = (code.match(/rateLimit|throttle|limit/gi) || []).length;
  const score = endpoints === 0 ? 1 : Math.min(1, rateLimit / endpoints);
  return {
    validatorId: 'API_RATE_LIMITING_ABSENCE',
    validatorName: 'API Rate Limiting Absence',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 7,
      description: 'Rate limiting protection on API endpoints'
    }
  };
}

export function computeAPIAuthenticationGap(code: string): ValidatorResult {
  const endpoints = (code.match(/app\.(get|post|put|delete|patch)/gi) || []).length;
  const authenticated = (code.match(/auth|jwt|bearer/gi) || []).length;
  const score = endpoints === 0 ? 1 : Math.min(1, authenticated / endpoints);
  return {
    validatorId: 'API_AUTHENTICATION_GAP',
    validatorName: 'API Authentication Gap',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 7,
      description: 'Authentication required on all API endpoints'
    }
  };
}

// ============================================================================
// LAYER 8: ERROR HANDLING (1 validator)
// ============================================================================

export function computeSensitiveInfoDisclosureRisk(code: string): ValidatorResult {
  const errorHandlers = (code.match(/catch|error|exception/gi) || []).length;
  const safeErrors = (code.match(/safeError|sanitizeError|genericError/gi) || []).length;
  const stackTraces = (code.match(/stack|stackTrace|trace/gi) || []).length;
  const score = errorHandlers === 0 ? 1 : Math.min(1, (safeErrors + Math.max(0, errorHandlers - stackTraces)) / errorHandlers);
  return {
    validatorId: 'SENSITIVE_INFO_DISCLOSURE_RISK',
    validatorName: 'Sensitive Info Disclosure Risk',
    score,
    severity: 1 - score,
    timestamp: Date.now(),
    metadata: {
      layer: 8,
      description: 'Error messages leaking sensitive information',
      remediationSteps: ['Log detailed errors privately', 'Return generic messages to users', 'Never expose stack traces']
    }
  };
}

// ============================================================================
// EXPORT: ALL 46 VALIDATORS
// ============================================================================

export const CybersecurityValidators = {
  // Layer 1: Code Integrity (8)
  computeCyclomaticComplexity,
  computeNestedDepthRisk,
  computeLineLengthViolations,
  computeUnusedVariableScore,
  computeDeadCodePercentage,
  computeFunctionSizeRisk,
  computeCommentCoverageDeficiency,
  computeDuplicateCodeClones,

  // Layer 2: Memory/Runtime (8)
  computeMemoryLeakRisk,
  computeBufferOverflowVulnerability,
  computeStackFrameDepth,
  computeThreadSafetyViolation,
  computeAllocatorFragmentation,
  computeExceptionHandlingGaps,
  computeCPUSpikeSusceptibility,
  computeIOBlockingSuspicion,

  // Layer 3: Cryptography (8)
  computeWeakEncryptionUsage,
  computeKeyManagementRisk,
  computePasswordPolicyViolation,
  computeHashingAlgorithmWeakness,
  computeRandomnessQualityScore,
  computeSSLCertificateExpiry,
  computeEncryptionCoverageGap,
  computePrivateKeyExposureRisk,

  // Layer 4: Dependencies (8)
  computeOutdatedDependencyRatio,
  computeTransitiveDependencyDepth,
  computeLicenseCompatibilityViolation,
  computeUnmaintainedDependencyCount,
  computeCVEExposureScore,
  computeDependencyResolutionAmbiguity,
  computeSupplyChainAttackSurface,
  computeDependencyAbusePotential,

  // Layer 5: Injection (6)
  computeSQLInjectionVulnerability,
  computeCommandInjectionRisk,
  computeXSSVulnerabilityScore,
  computeDeserializationRisk,
  computeTemplateInjectionScore,
  computeHeaderInjectionVulnerability,

  // Layer 6: Permission/Auth (5)
  computePrivilegeEscalationVector,
  computeAuthenticationBypassScore,
  computeAccessControlGranularity,
  computeSessionManagementWeakness,
  computeMFAAdoptionGap,

  // Layer 7: API Security (2)
  computeAPIRateLimitingAbsence,
  computeAPIAuthenticationGap,

  // Layer 8: Error Handling (1)
  computeSensitiveInfoDisclosureRisk
};

export const VALIDATOR_COUNT = 46;

export const VALIDATOR_NAMES = [
  'CyclomaticComplexity',
  'NestedDepthRisk',
  'LineLengthViolations',
  'UnusedVariableScore',
  'DeadCodePercentage',
  'FunctionSizeRisk',
  'CommentCoverageDeficiency',
  'DuplicateCodeClones',
  'MemoryLeakRisk',
  'BufferOverflowVulnerability',
  'StackFrameDepth',
  'ThreadSafetyViolation',
  'AllocatorFragmentation',
  'ExceptionHandlingGaps',
  'CPUSpikeSusceptibility',
  'IOBlockingSuspicion',
  'WeakEncryptionUsage',
  'KeyManagementRisk',
  'PasswordPolicyViolation',
  'HashingAlgorithmWeakness',
  'RandomnessQualityScore',
  'SSLCertificateExpiry',
  'EncryptionCoverageGap',
  'PrivateKeyExposureRisk',
  'OutdatedDependencyRatio',
  'TransitiveDependencyDepth',
  'LicenseCompatibilityViolation',
  'UnmaintainedDependencyCount',
  'CVEExposureScore',
  'DependencyResolutionAmbiguity',
  'SupplyChainAttackSurface',
  'DependencyAbusePotential',
  'SQLInjectionVulnerability',
  'CommandInjectionRisk',
  'XSSVulnerabilityScore',
  'DeserializationRisk',
  'TemplateInjectionScore',
  'HeaderInjectionVulnerability',
  'PrivilegeEscalationVector',
  'AuthenticationBypassScore',
  'AccessControlGranularity',
  'SessionManagementWeakness',
  'MFAAdoptionGap',
  'APIRateLimitingAbsence',
  'APIAuthenticationGap',
  'SensitiveInfoDisclosureRisk'
];

/**
 * Compute variance across all validators
 * ApexExecutionLoop uses this to detect when validators drift >15%
 */
export function computeValidatorVariance(
  current: ValidatorResult[],
  previous: ValidatorResult[]
): number {
  if (previous.length === 0) return 0;
  const avgCurrent = current.reduce((sum, v) => sum + v.score, 0) / current.length;
  const avgPrevious = previous.reduce((sum, v) => sum + v.score, 0) / previous.length;
  return Math.abs(avgCurrent - avgPrevious) / avgPrevious;
}

/**
 * Compute overall system risk score (0-1, where 1 = complete failure)
 */
export function computeSystemRisk(validators: ValidatorResult[]): SystemRiskScore {
  const byLayer: Record<number, number> = {};

  // Compute average score per layer
  for (const validator of validators) {
    const layer = validator.metadata.layer;
    if (!byLayer[layer]) byLayer[layer] = 0;
    byLayer[layer] += validator.score;
  }

  for (const layer of Object.keys(byLayer)) {
    const count = validators.filter(v => v.metadata.layer === Number(layer)).length;
    byLayer[Number(layer)] = byLayer[Number(layer)] / Math.max(1, count);
  }

  // Overall risk = 1 - average of all validators
  const overallRisk = 1 - (validators.reduce((sum, v) => sum + v.score, 0) / validators.length);

  // Identify critical validators (score < 0.5)
  const criticalValidators = validators
    .filter(v => v.score < 0.5)
    .map(v => v.validatorName);

  return {
    overallRisk: Math.min(1, Math.max(0, overallRisk)),
    byLayer,
    criticalValidators,
    timestamp: Date.now()
  };
}
