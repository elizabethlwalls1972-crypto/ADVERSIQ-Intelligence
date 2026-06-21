/**
 * ADVERSIQ Cybersecurity Validators - Formula Suite
 * 
 * These 47 validators replace the economic formulas.
 * AlgorithmicMutator watches these for variance and autonomously rewrites them.
 * Each validator is a domain-specific function that produces a 0-100 score.
 * 
 * Structure: Input → Analysis → Numerical Score (0-100) → Gating Decision
 * Evolution: >15% variance triggers LLM mutation → rewrite → backtest → deploy
 */

// ============================================================================
// CORE VALIDATORS (1-21): Base code health and security metrics
// ============================================================================

/**
 * CyclomaticComplexity: Code branching complexity
 * Target: < 10 branches per function (lower is better)
 * Maps to: Easier to test, understand, exploit less likely
 */
export function CyclomaticComplexity(input: {
  branchCount: number;
  decisionPoints: number;
  nestingDepth: number;
}): number {
  const BASE = 100;
  const complexity = input.branchCount + input.decisionPoints * 0.5 + input.nestingDepth * 0.3;
  // Score decreases as complexity increases
  const score = Math.max(0, BASE - complexity * 4);
  return Math.round(score);
}

/**
 * MemoryLeakScore: Detection of unfreed memory and resource leaks
 * Target: 0 leaks detected (score = 100)
 */
export function MemoryLeakScore(input: {
  allocationsWithoutFree: number;
  unreachableObjects: number;
  fileHandlesUnclosed: number;
  socketConnectionsLeaked: number;
}): number {
  const leakCount = 
    input.allocationsWithoutFree + 
    input.unreachableObjects + 
    input.fileHandlesUnclosed * 0.5 + 
    input.socketConnectionsLeaked * 0.5;
  
  const score = Math.max(0, 100 - leakCount * 5);
  return Math.round(score);
}

/**
 * AttackSurfaceIndex: Count of exposed functions, variables, APIs
 * Target: Minimize public surface (higher score = smaller surface)
 */
export function AttackSurfaceIndex(input: {
  publicFunctions: number;
  publicVariables: number;
  externalAPIs: number;
  debugEndpoints: number;
}): number {
  const exposedCount = 
    input.publicFunctions * 2 + 
    input.publicVariables + 
    input.externalAPIs * 3 + 
    input.debugEndpoints * 10;
  
  const score = Math.max(0, 100 - exposedCount);
  return Math.round(score);
}

/**
 * PermissionBoundaryViolation: Privilege escalation risk detection
 * Target: 0 violations (score = 100)
 */
export function PermissionBoundaryViolation(input: {
  privilegeEscalationPaths: number;
  capabilityBoundaryViolations: number;
  roleBasedAccessViolations: number;
  sudoCallsUnchecked: number;
}): number {
  const violations = 
    input.privilegeEscalationPaths * 20 + 
    input.capabilityBoundaryViolations * 15 + 
    input.roleBasedAccessViolations * 10 + 
    input.sudoCallsUnchecked * 5;
  
  const score = Math.max(0, 100 - violations);
  return Math.round(score);
}

/**
 * ThreadSafetyScore: Detection of race conditions and thread safety issues
 * Target: All shared state protected (score = 100)
 */
export function ThreadSafetyScore(input: {
  unprotectedSharedWrites: number;
  deadlockRisks: number;
  lockOrderViolations: number;
  dataRaceDetections: number;
}): number {
  const issues = 
    input.unprotectedSharedWrites * 20 + 
    input.deadlockRisks * 15 + 
    input.lockOrderViolations * 10 + 
    input.dataRaceDetections * 5;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * BufferOverflowRisk: Unsafe memory operations detection
 * Target: 0 unsafe operations (score = 100)
 */
export function BufferOverflowRisk(input: {
  uncheckedMemoryCopies: number;
  unboundedStringOperations: number;
  fixedBufferWrites: number;
  unsafePointerCasts: number;
}): number {
  const risks = 
    input.uncheckedMemoryCopies * 20 + 
    input.unboundedStringOperations * 15 + 
    input.fixedBufferWrites * 10 + 
    input.unsafePointerCasts * 5;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * SQLInjectionVulnerability: Dynamic SQL string detection
 * Target: All queries parameterized (score = 100)
 */
export function SQLInjectionVulnerability(input: {
  unparameterizedQueries: number;
  stringConcatenatedSQL: number;
  dynamicWhereClausesUnsafe: number;
  userInputInQueryDirect: number;
}): number {
  const risks = 
    input.unparameterizedQueries * 25 + 
    input.stringConcatenatedSQL * 20 + 
    input.dynamicWhereClausesUnsafe * 10 + 
    input.userInputInQueryDirect * 15;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * CryptographicWeakness: Detection of weak algorithms
 * Target: Only strong algorithms (AES, SHA256+, etc) (score = 100)
 */
export function CryptographicWeakness(input: {
  md5Usage: number;
  sha1Usage: number;
  weakCipherSuites: number;
  hardcodedKeys: number;
  insufficientKeyLength: number;
}): number {
  const weaknesses = 
    input.md5Usage * 30 + 
    input.sha1Usage * 25 + 
    input.weakCipherSuites * 20 + 
    input.hardcodedKeys * 40 + 
    input.insufficientKeyLength * 15;
  
  const score = Math.max(0, 100 - weaknesses);
  return Math.round(score);
}

/**
 * DependencyVulnerability: Known CVEs in imported packages
 * Target: 0 known vulnerable dependencies (score = 100)
 */
export function DependencyVulnerability(input: {
  highCVECount: number;
  mediumCVECount: number;
  lowCVECount: number;
  unmaintainedDependencies: number;
  outdatedVersions: number;
}): number {
  const risk = 
    input.highCVECount * 30 + 
    input.mediumCVECount * 10 + 
    input.lowCVECount * 2 + 
    input.unmaintainedDependencies * 20 + 
    input.outdatedVersions * 5;
  
  const score = Math.max(0, 100 - risk);
  return Math.round(score);
}

/**
 * InputValidationGap: User input validation coverage
 * Target: All inputs validated (score = 100)
 */
export function InputValidationGap(input: {
  unvalidatedInputPaths: number;
  missingLengthChecks: number;
  missingTypeValidation: number;
  missingRangeChecks: number;
}): number {
  const gaps = 
    input.unvalidatedInputPaths * 25 + 
    input.missingLengthChecks * 10 + 
    input.missingTypeValidation * 15 + 
    input.missingRangeChecks * 10;
  
  const score = Math.max(0, 100 - gaps);
  return Math.round(score);
}

/**
 * AuthenticationBypass: Missing or weak authentication checks
 * Target: All endpoints secured (score = 100)
 */
export function AuthenticationBypass(input: {
  unsecuredEndpoints: number;
  defaultCredentialsRemaining: number;
  disabledAuthMechanisms: number;
  weakAuthChallenges: number;
}): number {
  const risks = 
    input.unsecuredEndpoints * 30 + 
    input.defaultCredentialsRemaining * 25 + 
    input.disabledAuthMechanisms * 20 + 
    input.weakAuthChallenges * 15;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * DataExfiltrationRisk: Sensitive data in logs and responses
 * Target: No sensitive data exposed (score = 100)
 */
export function DataExfiltrationRisk(input: {
  sensitiveDataLogged: number;
  apiResponsesWithPII: number;
  errorMessagesWithSecrets: number;
  debugOutputExposed: number;
}): number {
  const risks = 
    input.sensitiveDataLogged * 30 + 
    input.apiResponsesWithPII * 25 + 
    input.errorMessagesWithSecrets * 35 + 
    input.debugOutputExposed * 20;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * DeserializationRisk: Unsafe deserialization and gadget chains
 * Target: 0 unsafe deserialization (score = 100)
 */
export function DeserializationRisk(input: {
  unsafeDeserializationCalls: number;
  gadgetChainRisks: number;
  objectInputStreamUsage: number;
  pickleUsageWithUntrustedData: number;
}): number {
  const risks = 
    input.unsafeDeserializationCalls * 30 + 
    input.gadgetChainRisks * 25 + 
    input.objectInputStreamUsage * 20 + 
    input.pickleUsageWithUntrustedData * 15;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * PathTraversalVulnerability: Directory traversal and path manipulation
 * Target: All paths validated (score = 100)
 */
export function PathTraversalVulnerability(input: {
  uncheckedFileOperations: number;
  directoryTraversalPaths: number;
  symlinkFollowing: number;
  insufficientPathNormalization: number;
}): number {
  const risks = 
    input.uncheckedFileOperations * 20 + 
    input.directoryTraversalPaths * 25 + 
    input.symlinkFollowing * 15 + 
    input.insufficientPathNormalization * 10;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * XSSVulnerability: DOM-based and reflected XSS risk
 * Target: All output escaped (score = 100)
 */
export function XSSVulnerability(input: {
  unescapedDOMOperations: number;
  reflectedUserInput: number;
  innerHTMLUsage: number;
  dangerouslySetInnerHTML: number;
}): number {
  const risks = 
    input.unescapedDOMOperations * 25 + 
    input.reflectedUserInput * 20 + 
    input.innerHTMLUsage * 15 + 
    input.dangerouslySetInnerHTML * 30;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * CSRFTokenMissing: Cross-site request forgery protection
 * Target: All state-changing requests protected (score = 100)
 */
export function CSRFTokenMissing(input: {
  unprotectedPostRequests: number;
  missingCSRFTokens: number;
  insufficientOriginValidation: number;
  sameSiteNotSet: number;
}): number {
  const risks = 
    input.unprotectedPostRequests * 25 + 
    input.missingCSRFTokens * 20 + 
    input.insufficientOriginValidation * 15 + 
    input.sameSiteNotSet * 10;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * HardcodedSecrets: API keys, credentials in source
 * Target: 0 secrets in code (score = 100)
 */
export function HardcodedSecrets(input: {
  hardcodedAPIKeys: number;
  hardcodedPasswords: number;
  hardcodedConnectionStrings: number;
  hardcodedTokens: number;
}): number {
  const secrets = 
    input.hardcodedAPIKeys * 30 + 
    input.hardcodedPasswords * 30 + 
    input.hardcodedConnectionStrings * 25 + 
    input.hardcodedTokens * 25;
  
  const score = Math.max(0, 100 - secrets);
  return Math.round(score);
}

/**
 * SSLVerificationBypass: Certificate validation and HTTPS configuration
 * Target: All SSL/TLS verified (score = 100)
 */
export function SSLVerificationBypass(input: {
  certificateVerificationDisabled: number;
  selfSignedCertificatesAccepted: number;
  insecureHTTPUsage: number;
  hostnameVerificationDisabled: number;
}): number {
  const risks = 
    input.certificateVerificationDisabled * 40 + 
    input.selfSignedCertificatesAccepted * 25 + 
    input.insecureHTTPUsage * 30 + 
    input.hostnameVerificationDisabled * 25;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * ExceptionInformationLeak: Stack traces and error messages
 * Target: No sensitive info in errors (score = 100)
 */
export function ExceptionInformationLeak(input: {
  stackTracesExposed: number;
  databaseErrorsInResponse: number;
  pathDisclosuresInErrors: number;
  versionInfoInErrors: number;
}): number {
  const leaks = 
    input.stackTracesExposed * 20 + 
    input.databaseErrorsInResponse * 25 + 
    input.pathDisclosuresInErrors * 15 + 
    input.versionInfoInErrors * 10;
  
  const score = Math.max(0, 100 - leaks);
  return Math.round(score);
}

/**
 * LoggingLevelExcessive: Debug/verbose logging in production
 * Target: No debug logs in production (score = 100)
 */
export function LoggingLevelExcessive(input: {
  debugLogsInProduction: number;
  verboseLoggingEnabled: number;
  sensitiveDataInLogs: number;
  performanceDegradationFromLogging: number;
}): number {
  const issues = 
    input.debugLogsInProduction * 25 + 
    input.verboseLoggingEnabled * 15 + 
    input.sensitiveDataInLogs * 30 + 
    input.performanceDegradationFromLogging * 10;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * ErrorHandlingGap: Unhandled exceptions and error propagation
 * Target: All errors handled (score = 100)
 */
export function ErrorHandlingGap(input: {
  unhandledExceptions: number;
  unhandledPromiseRejections: number;
  swallowedExceptions: number;
  missingFinallyBlocks: number;
}): number {
  const gaps = 
    input.unhandledExceptions * 30 + 
    input.unhandledPromiseRejections * 25 + 
    input.swallowedExceptions * 15 + 
    input.missingFinallyBlocks * 10;
  
  const score = Math.max(0, 100 - gaps);
  return Math.round(score);
}

// ============================================================================
// ADVANCED VALIDATORS (22-33): Complex vulnerability patterns
// ============================================================================

/**
 * DeserializationChain: Gadget chain exploitation potential
 * Target: No dangerous gadget chains (score = 100)
 */
export function DeserializationChain(input: {
  knownGadgetChains: number;
  potentialChainCombinations: number;
  reflectionBasedDeserialization: number;
}): number {
  const risk = 
    input.knownGadgetChains * 40 + 
    input.potentialChainCombinations * 15 + 
    input.reflectionBasedDeserialization * 20;
  
  const score = Math.max(0, 100 - risk);
  return Math.round(score);
}

/**
 * ReflectionAbuse: Unsafe reflection and dynamic code execution
 * Target: No unsafe reflection (score = 100)
 */
export function ReflectionAbuse(input: {
  reflectionWithUserInput: number;
  dynamicCodeExecution: number;
  evalUsage: number;
  unsafeClassForName: number;
}): number {
  const risks = 
    input.reflectionWithUserInput * 30 + 
    input.dynamicCodeExecution * 40 + 
    input.evalUsage * 50 + 
    input.unsafeClassForName * 25;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * TypeConfusion: Type coercion vulnerabilities
 * Target: Strict type checking enabled (score = 100)
 */
export function TypeConfusion(input: {
  implicitTypeConversions: number;
  weakEquityComparisons: number;
  typeJugglingVulnerabilities: number;
  mixedTypeOperations: number;
}): number {
  const issues = 
    input.implicitTypeConversions * 10 + 
    input.weakEquityComparisons * 20 + 
    input.typeJugglingVulnerabilities * 30 + 
    input.mixedTypeOperations * 5;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * PrototypePolluationRisk: Object prototype manipulation
 * Target: Prototype sealed/frozen (score = 100)
 */
export function PrototypePolluationRisk(input: {
  prototypePropertyAssignments: number;
  constructorOverrides: number;
  unsafeObjectMerges: number;
  deepCloneVulnerabilities: number;
}): number {
  const risks = 
    input.prototypePropertyAssignments * 30 + 
    input.constructorOverrides * 25 + 
    input.unsafeObjectMerges * 20 + 
    input.deepCloneVulnerabilities * 15;
  
  const score = Math.max(0, 100 - risks);
  return Math.round(score);
}

/**
 * CompilerWarningCount: Ignored compiler warnings
 * Target: 0 warnings (score = 100)
 */
export function CompilerWarningCount(input: {
  warningsIgnored: number;
  suppressedWarnings: number;
  unusedVariables: number;
  deprecatedAPIUsage: number;
}): number {
  const warnings = 
    input.warningsIgnored * 15 + 
    input.suppressedWarnings * 10 + 
    input.unusedVariables * 3 + 
    input.deprecatedAPIUsage * 5;
  
  const score = Math.max(0, 100 - warnings);
  return Math.round(score);
}

/**
 * StaticAnalysisViolations: Linting and static analyzer failures
 * Target: 0 violations (score = 100)
 */
export function StaticAnalysisViolations(input: {
  securityLintViolations: number;
  complexityViolations: number;
  styleViolations: number;
  coverageGaps: number;
}): number {
  const violations = 
    input.securityLintViolations * 25 + 
    input.complexityViolations * 10 + 
    input.styleViolations * 2 + 
    input.coverageGaps * 30;
  
  const score = Math.max(0, 100 - violations);
  return Math.round(score);
}

/**
 * CodeDuplication: Duplicated security-critical code
 * Target: DRY principle observed (score = 100)
 */
export function CodeDuplication(input: {
  duplicatedValidationLogic: number;
  duplicatedAuthenticationCode: number;
  duplicatedErrorHandling: number;
  clonedSecurityPatterns: number;
}): number {
  const duplication = 
    input.duplicatedValidationLogic * 20 + 
    input.duplicatedAuthenticationCode * 25 + 
    input.duplicatedErrorHandling * 15 + 
    input.clonedSecurityPatterns * 20;
  
  const score = Math.max(0, 100 - duplication);
  return Math.round(score);
}

/**
 * CommentToDcRatio: Underdocumented critical code
 * Target: Critical code well-commented (score = 100)
 */
export function CommentToDcRatio(input: {
  criticalCodeUndocumented: number;
  securityDecisionsUnexplained: number;
  algorithmicComplexityUndocumented: number;
}): number {
  const issues = 
    input.criticalCodeUndocumented * 20 + 
    input.securityDecisionsUnexplained * 25 + 
    input.algorithmicComplexityUndocumented * 15;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * TestCoverageCriticalPath: Low coverage on security-critical paths
 * Target: >90% coverage on critical paths (score = 100)
 */
export function TestCoverageCriticalPath(input: {
  uncoveredAuthenticationPaths: number;
  uncoveredValidationLogic: number;
  uncoveredErrorHandling: number;
  uncoveredCryptographicCode: number;
}): number {
  const gaps = 
    input.uncoveredAuthenticationPaths * 30 + 
    input.uncoveredValidationLogic * 20 + 
    input.uncoveredErrorHandling * 15 + 
    input.uncoveredCryptographicCode * 25;
  
  const score = Math.max(0, 100 - gaps);
  return Math.round(score);
}

/**
 * ComponentVersionSkew: Version mismatch and compatibility issues
 * Target: Consistent versioning (score = 100)
 */
export function ComponentVersionSkew(input: {
  dependencyVersionConflicts: number;
  incompatibleUpdatesMissed: number;
  securityPatchesNotApplied: number;
}): number {
  const skew = 
    input.dependencyVersionConflicts * 15 + 
    input.incompatibleUpdatesMissed * 10 + 
    input.securityPatchesNotApplied * 30;
  
  const score = Math.max(0, 100 - skew);
  return Math.round(score);
}

/**
 * DeprecatedFunctionUsage: Calls to deprecated or removed APIs
 * Target: No deprecated calls (score = 100)
 */
export function DeprecatedFunctionUsage(input: {
  deprecatedAPICalls: number;
  removedFunctionUsage: number;
  unmaintainedLibraryDependencies: number;
}): number {
  const deprecated = 
    input.deprecatedAPICalls * 10 + 
    input.removedFunctionUsage * 20 + 
    input.unmaintainedLibraryDependencies * 25;
  
  const score = Math.max(0, 100 - deprecated);
  return Math.round(score);
}

/**
 * PerformanceDegradation: DoS-prone inefficiencies
 * Target: Linear or better complexity (score = 100)
 */
export function PerformanceDegradation(input: {
  exponentialComplexityPaths: number;
  infiniteLoopPotential: number;
  resourceExhaustionRisks: number;
  unoptimizedQueries: number;
}): number {
  const issues = 
    input.exponentialComplexityPaths * 30 + 
    input.infiniteLoopPotential * 40 + 
    input.resourceExhaustionRisks * 25 + 
    input.unoptimizedQueries * 15;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

// ============================================================================
// EXTENDED VALIDATORS (34-47): System-level security and integrity
// ============================================================================

/**
 * CodeSignatureChangeDetection: Unauthorized code modifications
 * Target: No untracked changes (score = 100)
 */
export function CodeSignatureChangeDetection(input: {
  unauthorizedCodeChanges: number;
  bypassedCodeReview: number;
  unsignedCommits: number;
}): number {
  const changes = 
    input.unauthorizedCodeChanges * 40 + 
    input.bypassedCodeReview * 30 + 
    input.unsignedCommits * 20;
  
  const score = Math.max(0, 100 - changes);
  return Math.round(score);
}

/**
 * BinaryBloatScore: Optimized binary/deployment size
 * Target: Minimal attack surface (score = 100)
 */
export function BinaryBloatScore(input: {
  binarySizeIncrease: number;
  debugSymbolsIncluded: number;
  unnecessaryDependencies: number;
}): number {
  // Lower is better - score based on optimization
  const bloat = Math.min(100, input.binarySizeIncrease / 100 + 
    input.debugSymbolsIncluded * 20 + 
    input.unnecessaryDependencies * 10);
  
  const score = Math.max(0, 100 - bloat);
  return Math.round(score);
}

/**
 * StackFrameIntegrity: Stack corruption detection
 * Target: No stack corruption (score = 100)
 */
export function StackFrameIntegrity(input: {
  stackBufferOverflows: number;
  stackReturnPointerCorruption: number;
  stackCanaryViolations: number;
  framePointerAbuse: number;
}): number {
  const corruption = 
    input.stackBufferOverflows * 40 + 
    input.stackReturnPointerCorruption * 50 + 
    input.stackCanaryViolations * 30 + 
    input.framePointerAbuse * 25;
  
  const score = Math.max(0, 100 - corruption);
  return Math.round(score);
}

/**
 * HeapIntegrity: Heap metadata validation
 * Target: No heap corruption (score = 100)
 */
export function HeapIntegrity(input: {
  heapMetadataCorruption: number;
  useAfterFree: number;
  doubleFree: number;
  heapBufferOverflow: number;
}): number {
  const corruption = 
    input.heapMetadataCorruption * 40 + 
    input.useAfterFree * 35 + 
    input.doubleFree * 30 + 
    input.heapBufferOverflow * 35;
  
  const score = Math.max(0, 100 - corruption);
  return Math.round(score);
}

/**
 * ASLRCompatibility: Address Space Layout Randomization ready
 * Target: ASLR compatible (score = 100)
 */
export function ASLRCompatibility(input: {
  positionDependentCode: number;
  hardcodedAddresses: number;
  aslrBypass: number;
}): number {
  const issues = 
    input.positionDependentCode * 30 + 
    input.hardcodedAddresses * 25 + 
    input.aslrBypass * 40;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * PICExecutable: Position-independent code enabled
 * Target: PIC enabled (score = 100)
 */
export function PICExecutable(input: {
  nonPICCode: number;
  relocatableCodeMissing: number;
}): number {
  const issues = 
    input.nonPICCode * 40 + 
    input.relocatableCodeMissing * 30;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * StackCanaryScore: Stack overflow detection (stack smashing protector)
 * Target: All buffers protected (score = 100)
 */
export function StackCanaryScore(input: {
  unprotectedBuffers: number;
  canaryChecksMissing: number;
  canaryValueWeak: number;
}): number {
  const issues = 
    input.unprotectedBuffers * 30 + 
    input.canaryChecksMissing * 25 + 
    input.canaryValueWeak * 20;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * DEPEnabled: Data Execution Prevention enabled
 * Target: DEP enforced (score = 100)
 */
export function DEPEnabled(input: {
  depDisabled: number;
  executableDataSections: number;
  depBypass: number;
}): number {
  const issues = 
    input.depDisabled * 50 + 
    input.executableDataSections * 40 + 
    input.depBypass * 30;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * SELinuxContext: Mandatory access controls (SELinux)
 * Target: Proper SELinux context (score = 100)
 */
export function SELinuxContext(input: {
  selinuxDisabled: number;
  permissiveMode: number;
  missingContextLabels: number;
  policyViolations: number;
}): number {
  const issues = 
    input.selinuxDisabled * 40 + 
    input.permissiveMode * 30 + 
    input.missingContextLabels * 15 + 
    input.policyViolations * 20;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * AppArmorProfile: Application sandboxing
 * Target: AppArmor profile enforced (score = 100)
 */
export function AppArmorProfile(input: {
  appArmorDisabled: number;
  complaintMode: number;
  insufficientRestrictions: number;
}): number {
  const issues = 
    input.appArmorDisabled * 40 + 
    input.complaintMode * 25 + 
    input.insufficientRestrictions * 20;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * CapabilityMinimization: Principle of least privilege
 * Target: Minimal capabilities granted (score = 100)
 */
export function CapabilityMinimization(input: {
  excessiveCapabilities: number;
  unnecessaryPrivileges: number;
  capabilityNotDropped: number;
}): number {
  const issues = 
    input.excessiveCapabilities * 25 + 
    input.unnecessaryPrivileges * 20 + 
    input.capabilityNotDropped * 30;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * FilePermissionOverreach: World-readable sensitive files
 * Target: Minimal file permissions (score = 100)
 */
export function FilePermissionOverreach(input: {
  worldReadableSensitiveFiles: number;
  worldWritableSensitiveFiles: number;
  overpermissionedConfigs: number;
  keyFilePermissions: number;
}): number {
  const issues = 
    input.worldReadableSensitiveFiles * 30 + 
    input.worldWritableSensitiveFiles * 40 + 
    input.overpermissionedConfigs * 20 + 
    input.keyFilePermissions * 25;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * ProcessIsolation: Privilege separation and process isolation
 * Target: Isolated processes (score = 100)
 */
export function ProcessIsolation(input: {
  runAsRootUnnecessarily: number;
  insufficientProcessSeparation: number;
  sharedSecurityContext: number;
}): number {
  const issues = 
    input.runAsRootUnnecessarily * 40 + 
    input.insufficientProcessSeparation * 25 + 
    input.sharedSecurityContext * 30;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

/**
 * ContainerSecurityContext: Container security settings
 * Target: Hardened security context (score = 100)
 */
export function ContainerSecurityContext(input: {
  privilegedContainer: number;
  rootContainerUser: number;
  missingSecurityContext: number;
  insufficientResourceLimits: number;
}): number {
  const issues = 
    input.privilegedContainer * 40 + 
    input.rootContainerUser * 35 + 
    input.missingSecurityContext * 25 + 
    input.insufficientResourceLimits * 15;
  
  const score = Math.max(0, 100 - issues);
  return Math.round(score);
}

// ============================================================================
// SCORING AGGREGATION & GATING
// ============================================================================

/**
 * AggregateSecurityScore: Composite of all 47 validators
 * Used by: AlgorithmicMutator (if < 70, trigger mutation search)
 * Used by: QuorumGatekeeper (decide if patch is viable)
 * Used by: ApexExecutionLoop (gate deployment)
 */
export function AggregateSecurityScore(input: {
  core: number[]; // CyclomaticComplexity through ErrorHandlingGap (21 values)
  advanced: number[]; // DeserializationChain through PerformanceDegradation (12 values)
  extended: number[]; // CodeSignatureChangeDetection through ContainerSecurityContext (14 values)
}): {
  aggregateScore: number;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSING';
  gatingDecision: boolean;
  recommendedActions: string[];
} {
  const coreAvg = input.core.reduce((a, b) => a + b, 0) / input.core.length || 50;
  const advancedAvg = input.advanced.reduce((a, b) => a + b, 0) / input.advanced.length || 50;
  const extendedAvg = input.extended.reduce((a, b) => a + b, 0) / input.extended.length || 50;

  // Weight: core 50%, advanced 30%, extended 20%
  const aggregate = coreAvg * 0.5 + advancedAvg * 0.3 + extendedAvg * 0.2;

  let category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSING';
  let gatingDecision: boolean;
  let recommendedActions: string[] = [];

  if (aggregate >= 90) {
    category = 'PASSING';
    gatingDecision = true;
  } else if (aggregate >= 75) {
    category = 'LOW';
    gatingDecision = true;
    recommendedActions.push('Review and address low-priority issues before production deployment');
  } else if (aggregate >= 60) {
    category = 'MEDIUM';
    gatingDecision = false;
    recommendedActions.push('Significant security issues detected. Requires remediation before deployment.');
    recommendedActions.push('Trigger AlgorithmicMutator for automatic patch generation.');
  } else if (aggregate >= 40) {
    category = 'HIGH';
    gatingDecision = false;
    recommendedActions.push('Critical vulnerabilities present. Do not deploy.');
    recommendedActions.push('Escalate to security team for manual remediation.');
  } else {
    category = 'CRITICAL';
    gatingDecision = false;
    recommendedActions.push('EMERGENCY: System is unsafe. Quarantine immediately.');
    recommendedActions.push('Full security audit required. Do not deploy to any environment.');
  }

  return {
    aggregateScore: Math.round(aggregate),
    category,
    gatingDecision,
    recommendedActions
  };
}

export type CyberValidatorCategory = 'core' | 'advanced' | 'extended';

export interface CyberValidatorRegistryEntry {
  id: string;
  name: string;
  category: CyberValidatorCategory;
  run: (input: Record<string, number>) => number;
}

export const CYBER_VALIDATOR_REGISTRY: CyberValidatorRegistryEntry[] = [
  { id: 'CyclomaticComplexity', name: 'Cyclomatic Complexity', category: 'core', run: (input) => CyclomaticComplexity(input as Parameters<typeof CyclomaticComplexity>[0]) },
  { id: 'MemoryLeakScore', name: 'Memory Leak Score', category: 'core', run: (input) => MemoryLeakScore(input as Parameters<typeof MemoryLeakScore>[0]) },
  { id: 'AttackSurfaceIndex', name: 'Attack Surface Index', category: 'core', run: (input) => AttackSurfaceIndex(input as Parameters<typeof AttackSurfaceIndex>[0]) },
  { id: 'PermissionBoundaryViolation', name: 'Permission Boundary Violation', category: 'core', run: (input) => PermissionBoundaryViolation(input as Parameters<typeof PermissionBoundaryViolation>[0]) },
  { id: 'ThreadSafetyScore', name: 'Thread Safety Score', category: 'core', run: (input) => ThreadSafetyScore(input as Parameters<typeof ThreadSafetyScore>[0]) },
  { id: 'BufferOverflowRisk', name: 'Buffer Overflow Risk', category: 'core', run: (input) => BufferOverflowRisk(input as Parameters<typeof BufferOverflowRisk>[0]) },
  { id: 'SQLInjectionVulnerability', name: 'SQL Injection Vulnerability', category: 'core', run: (input) => SQLInjectionVulnerability(input as Parameters<typeof SQLInjectionVulnerability>[0]) },
  { id: 'CryptographicWeakness', name: 'Cryptographic Weakness', category: 'core', run: (input) => CryptographicWeakness(input as Parameters<typeof CryptographicWeakness>[0]) },
  { id: 'DependencyVulnerability', name: 'Dependency Vulnerability', category: 'core', run: (input) => DependencyVulnerability(input as Parameters<typeof DependencyVulnerability>[0]) },
  { id: 'InputValidationGap', name: 'Input Validation Gap', category: 'core', run: (input) => InputValidationGap(input as Parameters<typeof InputValidationGap>[0]) },
  { id: 'AuthenticationBypass', name: 'Authentication Bypass', category: 'core', run: (input) => AuthenticationBypass(input as Parameters<typeof AuthenticationBypass>[0]) },
  { id: 'DataExfiltrationRisk', name: 'Data Exfiltration Risk', category: 'core', run: (input) => DataExfiltrationRisk(input as Parameters<typeof DataExfiltrationRisk>[0]) },
  { id: 'DeserializationRisk', name: 'Deserialization Risk', category: 'core', run: (input) => DeserializationRisk(input as Parameters<typeof DeserializationRisk>[0]) },
  { id: 'PathTraversalVulnerability', name: 'Path Traversal Vulnerability', category: 'core', run: (input) => PathTraversalVulnerability(input as Parameters<typeof PathTraversalVulnerability>[0]) },
  { id: 'XSSVulnerability', name: 'XSS Vulnerability', category: 'core', run: (input) => XSSVulnerability(input as Parameters<typeof XSSVulnerability>[0]) },
  { id: 'CSRFTokenMissing', name: 'CSRF Token Missing', category: 'core', run: (input) => CSRFTokenMissing(input as Parameters<typeof CSRFTokenMissing>[0]) },
  { id: 'HardcodedSecrets', name: 'Hardcoded Secrets', category: 'core', run: (input) => HardcodedSecrets(input as Parameters<typeof HardcodedSecrets>[0]) },
  { id: 'SSLVerificationBypass', name: 'SSL Verification Bypass', category: 'core', run: (input) => SSLVerificationBypass(input as Parameters<typeof SSLVerificationBypass>[0]) },
  { id: 'ExceptionInformationLeak', name: 'Exception Information Leak', category: 'core', run: (input) => ExceptionInformationLeak(input as Parameters<typeof ExceptionInformationLeak>[0]) },
  { id: 'LoggingLevelExcessive', name: 'Logging Level Excessive', category: 'core', run: (input) => LoggingLevelExcessive(input as Parameters<typeof LoggingLevelExcessive>[0]) },
  { id: 'ErrorHandlingGap', name: 'Error Handling Gap', category: 'core', run: (input) => ErrorHandlingGap(input as Parameters<typeof ErrorHandlingGap>[0]) },
  { id: 'DeserializationChain', name: 'Deserialization Chain', category: 'advanced', run: (input) => DeserializationChain(input as Parameters<typeof DeserializationChain>[0]) },
  { id: 'ReflectionAbuse', name: 'Reflection Abuse', category: 'advanced', run: (input) => ReflectionAbuse(input as Parameters<typeof ReflectionAbuse>[0]) },
  { id: 'TypeConfusion', name: 'Type Confusion', category: 'advanced', run: (input) => TypeConfusion(input as Parameters<typeof TypeConfusion>[0]) },
  { id: 'PrototypePolluationRisk', name: 'Prototype Pollution Risk', category: 'advanced', run: (input) => PrototypePolluationRisk(input as Parameters<typeof PrototypePolluationRisk>[0]) },
  { id: 'CompilerWarningCount', name: 'Compiler Warning Count', category: 'advanced', run: (input) => CompilerWarningCount(input as Parameters<typeof CompilerWarningCount>[0]) },
  { id: 'StaticAnalysisViolations', name: 'Static Analysis Violations', category: 'advanced', run: (input) => StaticAnalysisViolations(input as Parameters<typeof StaticAnalysisViolations>[0]) },
  { id: 'CodeDuplication', name: 'Code Duplication', category: 'advanced', run: (input) => CodeDuplication(input as Parameters<typeof CodeDuplication>[0]) },
  { id: 'CommentToDcRatio', name: 'Comment To DC Ratio', category: 'advanced', run: (input) => CommentToDcRatio(input as Parameters<typeof CommentToDcRatio>[0]) },
  { id: 'TestCoverageCriticalPath', name: 'Test Coverage Critical Path', category: 'advanced', run: (input) => TestCoverageCriticalPath(input as Parameters<typeof TestCoverageCriticalPath>[0]) },
  { id: 'ComponentVersionSkew', name: 'Component Version Skew', category: 'advanced', run: (input) => ComponentVersionSkew(input as Parameters<typeof ComponentVersionSkew>[0]) },
  { id: 'DeprecatedFunctionUsage', name: 'Deprecated Function Usage', category: 'advanced', run: (input) => DeprecatedFunctionUsage(input as Parameters<typeof DeprecatedFunctionUsage>[0]) },
  { id: 'PerformanceDegradation', name: 'Performance Degradation', category: 'advanced', run: (input) => PerformanceDegradation(input as Parameters<typeof PerformanceDegradation>[0]) },
  { id: 'CodeSignatureChangeDetection', name: 'Code Signature Change Detection', category: 'extended', run: (input) => CodeSignatureChangeDetection(input as Parameters<typeof CodeSignatureChangeDetection>[0]) },
  { id: 'BinaryBloatScore', name: 'Binary Bloat Score', category: 'extended', run: (input) => BinaryBloatScore(input as Parameters<typeof BinaryBloatScore>[0]) },
  { id: 'StackFrameIntegrity', name: 'Stack Frame Integrity', category: 'extended', run: (input) => StackFrameIntegrity(input as Parameters<typeof StackFrameIntegrity>[0]) },
  { id: 'HeapIntegrity', name: 'Heap Integrity', category: 'extended', run: (input) => HeapIntegrity(input as Parameters<typeof HeapIntegrity>[0]) },
  { id: 'ASLRCompatibility', name: 'ASLR Compatibility', category: 'extended', run: (input) => ASLRCompatibility(input as Parameters<typeof ASLRCompatibility>[0]) },
  { id: 'PICExecutable', name: 'PIC Executable', category: 'extended', run: (input) => PICExecutable(input as Parameters<typeof PICExecutable>[0]) },
  { id: 'StackCanaryScore', name: 'Stack Canary Score', category: 'extended', run: (input) => StackCanaryScore(input as Parameters<typeof StackCanaryScore>[0]) },
  { id: 'DEPEnabled', name: 'DEP Enabled', category: 'extended', run: (input) => DEPEnabled(input as Parameters<typeof DEPEnabled>[0]) },
  { id: 'SELinuxContext', name: 'SELinux Context', category: 'extended', run: (input) => SELinuxContext(input as Parameters<typeof SELinuxContext>[0]) },
  { id: 'AppArmorProfile', name: 'AppArmor Profile', category: 'extended', run: (input) => AppArmorProfile(input as Parameters<typeof AppArmorProfile>[0]) },
  { id: 'CapabilityMinimization', name: 'Capability Minimization', category: 'extended', run: (input) => CapabilityMinimization(input as Parameters<typeof CapabilityMinimization>[0]) },
  { id: 'FilePermissionOverreach', name: 'File Permission Overreach', category: 'extended', run: (input) => FilePermissionOverreach(input as Parameters<typeof FilePermissionOverreach>[0]) },
  { id: 'ProcessIsolation', name: 'Process Isolation', category: 'extended', run: (input) => ProcessIsolation(input as Parameters<typeof ProcessIsolation>[0]) },
  { id: 'ContainerSecurityContext', name: 'Container Security Context', category: 'extended', run: (input) => ContainerSecurityContext(input as Parameters<typeof ContainerSecurityContext>[0]) },
];

export function getCyberValidator(id: string): CyberValidatorRegistryEntry | undefined {
  return CYBER_VALIDATOR_REGISTRY.find((entry) => entry.id === id);
}

export function runCyberValidator(id: string, input: Record<string, number>): number | undefined {
  return getCyberValidator(id)?.run(input);
}

export function runCyberValidationSuite(inputs: Record<string, Record<string, number>>): Record<string, number> {
  const results: Record<string, number> = {};
  for (const [validatorId, input] of Object.entries(inputs)) {
    const score = runCyberValidator(validatorId, input);
    if (typeof score === 'number') {
      results[validatorId] = score;
    }
  }
  return results;
}

export function aggregateValidationSuite(results: Record<string, number>) {
  const core = CYBER_VALIDATOR_REGISTRY
    .filter((entry) => entry.category === 'core')
    .map((entry) => results[entry.id] ?? 50);
  const advanced = CYBER_VALIDATOR_REGISTRY
    .filter((entry) => entry.category === 'advanced')
    .map((entry) => results[entry.id] ?? 50);
  const extended = CYBER_VALIDATOR_REGISTRY
    .filter((entry) => entry.category === 'extended')
    .map((entry) => results[entry.id] ?? 50);

  return AggregateSecurityScore({ core, advanced, extended });
}

