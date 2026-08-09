/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 9: SAFETY & GUARDRAILS PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Input classifier (prompt injection, PII, jailbreak detection).
 * Output filter (hallucinated numbers, dangerous advice, disclaimer enforcement).
 * PII redaction for logs.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThreatClass = 'safe' | 'prompt_injection' | 'jailbreak' | 'pii_leak' | 'harmful_request' | 'data_exfiltration';

export interface SafetyCheck {
  passed: boolean;
  threatClass: ThreatClass;
  confidence: number;
  details: string;
  redactedInput?: string;
}

export interface OutputSafetyCheck {
  passed: boolean;
  issues: string[];
  disclaimerNeeded: boolean;
  redactedOutput?: string;
}

// ─── PII Patterns ───────────────────────────────────────────────────────────

const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' },
  { name: 'phone_au', pattern: /\b(?:\+?61|0)\s?\d{1,2}\s?\d{4}\s?\d{4}\b/g, replacement: '[PHONE_REDACTED]' },
  { name: 'phone_intl', pattern: /\b\+?\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g, replacement: '[PHONE_REDACTED]' },
  { name: 'tfn', pattern: /\b\d{3}\s?\d{3}\s?\d{3}\b/g, replacement: '[TFN_REDACTED]' },
  { name: 'abn', pattern: /\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b/g, replacement: '[ABN_REDACTED]' },
  { name: 'credit_card', pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CC_REDACTED]' },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
  { name: 'passport', pattern: /\b[A-Z]{1,2}\d{7,8}\b/g, replacement: '[PASSPORT_REDACTED]' },
];

// ─── Prompt Injection Detection ─────────────────────────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /forget\s+(everything|all|your)\s+(you|instructions)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*(you|your|override|ignore)/i,
  /\bDAN\b.*\bmode\b/i,
  /jailbreak/i,
  /pretend\s+you\s+(are|can|have)/i,
  /bypass\s+(your|the|all)\s+(rules|filters|safety|restrictions)/i,
  /reveal\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions)/i,
  /what\s+(?:are|is)\s+your\s+(?:system|initial)\s+(?:prompt|instructions)/i,
  /act\s+as\s+(?:if|though)\s+you\s+(?:are|have)\s+no\s+(?:rules|restrictions)/i,
  /do\s+anything\s+now/i,
  /enable\s+developer\s+mode/i,
];

const HARMFUL_REQUEST_PATTERNS: RegExp[] = [
  /how\s+to\s+(?:hack|exploit|crack|break\s+into)/i,
  /create\s+(?:malware|virus|trojan|ransomware)/i,
  /money\s+laundering\s+(?:steps|methods|techniques)/i,
  /insider\s+trading\s+(?:tips|how|recommendations)/i,
  /manipulate\s+(?:stock|market|financial\s+statements)/i,
  /evade?\s+(?:tax|taxes|detection|authorities)/i,
  /forge\s+(?:documents?|signatures?|identit)/i,
];

// ─── Input Safety Check ─────────────────────────────────────────────────────

export function checkInputSafety(input: string): SafetyCheck {
  // 1. Check for prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        passed: false,
        threatClass: 'prompt_injection',
        confidence: 0.9,
        details: `Prompt injection detected: "${pattern.source}"`,
        redactedInput: redactPII(input),
      };
    }
  }

  // 2. Check for harmful requests
  for (const pattern of HARMFUL_REQUEST_PATTERNS) {
    if (pattern.test(input)) {
      return {
        passed: false,
        threatClass: 'harmful_request',
        confidence: 0.85,
        details: `Potentially harmful request detected: "${pattern.source}"`,
        redactedInput: redactPII(input),
      };
    }
  }

  // 3. Check for PII in input (warn, don't block)
  let hasPII = false;
  for (const pii of PII_PATTERNS) {
    if (pii.pattern.test(input)) {
      hasPII = true;
      break;
    }
  }

  if (hasPII) {
    return {
      passed: true, // Allow but flag
      threatClass: 'pii_leak',
      confidence: 0.8,
      details: 'Input contains PII — will be redacted in logs',
      redactedInput: redactPII(input),
    };
  }

  return {
    passed: true,
    threatClass: 'safe',
    confidence: 0.95,
    details: 'No safety issues detected',
  };
}

// ─── Output Safety Check ────────────────────────────────────────────────────

export function checkOutputSafety(output: string, queryCategory?: string): OutputSafetyCheck {
  const issues: string[] = [];
  let disclaimerNeeded = false;

  // 1. Check for leaked system prompt indicators
  const systemLeakPatterns = [
    /my\s+system\s+prompt\s+is/i,
    /I\s+was\s+(?:initially\s+)?instructed\s+to/i,
    /my\s+(?:initial|original)\s+instructions/i,
  ];
  for (const pattern of systemLeakPatterns) {
    if (pattern.test(output)) {
      issues.push('Potential system prompt leak detected');
    }
  }

  // 2. Check for specific financial/legal advice without disclaimers
  const advicePatterns = [
    { pattern: /you\s+should\s+(?:definitely\s+)?(?:buy|sell|invest|divest)/i, advice: 'financial' },
    { pattern: /I\s+recommend\s+(?:buying|selling|investing)/i, advice: 'financial' },
    { pattern: /this\s+is\s+(?:legal|not\s+illegal|perfectly\s+fine)/i, advice: 'legal' },
    { pattern: /you\s+(?:can|should)\s+(?:legally|safely)\s+(?:ignore|avoid|evade)/i, advice: 'legal' },
  ];

  for (const { pattern, advice } of advicePatterns) {
    if (pattern.test(output)) {
      disclaimerNeeded = true;
      issues.push(`Direct ${advice} advice detected — disclaimer required`);
    }
  }

  // 3. Check for hallucinated-looking precise numbers (suspiciously specific)
  const suspiciousNumbers = output.match(/\$\d{1,3}(?:,\d{3})+\.\d{2}\b/g) || [];
  if (suspiciousNumbers.length > 5) {
    issues.push('Unusually many precise dollar amounts — may be hallucinated figures');
  }

  // 4. Check for PII in output
  for (const pii of PII_PATTERNS) {
    if (pii.pattern.test(output)) {
      issues.push(`PII (${pii.name}) detected in output`);
    }
  }

  // Financial and legal outputs always need disclaimers
  if (queryCategory === 'financial' || queryCategory === 'legal') {
    disclaimerNeeded = true;
  }

  return {
    passed: issues.filter(i => !i.includes('disclaimer')).length === 0,
    issues,
    disclaimerNeeded,
    redactedOutput: issues.some(i => i.includes('PII')) ? redactPII(output) : undefined,
  };
}

// ─── PII Redaction ──────────────────────────────────────────────────────────

export function redactPII(text: string): string {
  let redacted = text;
  for (const pii of PII_PATTERNS) {
    // Reset regex lastIndex since we use /g flag
    pii.pattern.lastIndex = 0;
    redacted = redacted.replace(pii.pattern, pii.replacement);
  }
  return redacted;
}

// ─── Disclaimer Templates ───────────────────────────────────────────────────

export const DISCLAIMERS = {
  financial: '\n\n---\n*Disclaimer: This analysis is for informational purposes only and does not constitute financial advice. Consult a qualified financial advisor before making investment decisions.*',
  legal: '\n\n---\n*Disclaimer: This information is general in nature and should not be relied upon as legal advice. Consult a qualified legal professional for advice specific to your situation.*',
  general: '\n\n---\n*Disclaimer: This analysis is generated by AI and should be verified independently before acting on it.*',
};

export function appendDisclaimer(output: string, category: string): string {
  const disclaimer = DISCLAIMERS[category as keyof typeof DISCLAIMERS] || DISCLAIMERS.general;
  // Don't append if already present
  if (output.includes('Disclaimer:')) return output;
  return output + disclaimer;
}

// ─── Combined Pipeline ──────────────────────────────────────────────────────

export function runSafetyPipeline(
  input: string,
  output: string,
  category?: string
): { inputCheck: SafetyCheck; outputCheck: OutputSafetyCheck; finalOutput: string } {
  const inputCheck = checkInputSafety(input);
  const outputCheck = checkOutputSafety(output, category);

  let finalOutput = output;

  // Block if input was harmful
  if (!inputCheck.passed && inputCheck.threatClass === 'harmful_request') {
    finalOutput = "I can't assist with that request as it may involve activities that are unethical or illegal. I'm here to help with legitimate business consulting and analysis.";
  } else if (!inputCheck.passed && inputCheck.threatClass === 'prompt_injection') {
    finalOutput = "I detected an attempt to manipulate my instructions. I'll continue operating with my standard guidelines. How can I help with your business question?";
  }

  // Append disclaimer if needed
  if (outputCheck.disclaimerNeeded && inputCheck.passed) {
    finalOutput = appendDisclaimer(finalOutput, category || 'general');
  }

  return { inputCheck, outputCheck, finalOutput };
}
