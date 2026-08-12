/**
 * FailurePatternRecognizer.ts
 *
 * Core service that records failure cases, derives reusable failure patterns
 * across domains, and proactively warns when a proposed plan or action is
 * about to repeat a known failure pattern.
 *
 * The recognizer maintains an in-memory knowledge base of failure patterns and
 * failure cases. Patterns are derived automatically whenever a new failure case
 * is added, keyed by domain, action, and failure mode. Matching is intentionally
 * heuristic so the service remains generic and dependency-free.
 */

/**
 * A reusable description of a failure pattern observed across one or more
 * failure cases.
 */
export interface FailurePattern {
  /** Unique stable identifier for the pattern. */
  id: string;
  /** Human-readable name of the failure pattern. */
  name: string;
  /** Longer description explaining when and why this failure occurs. */
  description: string;
  /** How many times this pattern has been observed. */
  frequency: number;
  /** Severity of the failure on a 0-1 scale (1 being catastrophic). */
  severity: number;
  /** The domain the pattern belongs to (e.g. "network", "auth", "deployment"). */
  domain: string;
  /** Keywords or action names that trigger the pattern. */
  triggers: string[];
  /** Expected negative consequences of the pattern firing. */
  consequences: string[];
  /** Recommended mitigations to prevent or reduce impact. */
  mitigations: string[];
}

/**
 * A single recorded instance of a failure that occurred during execution.
 */
export interface FailureCase {
  /** Unique identifier for this failure case. */
  id: string;
  /** ISO timestamp at which the failure was observed. */
  timestamp: string;
  /** The domain the failure case occurred in. */
  domain: string;
  /** The action or operation that was attempted. */
  action: string;
  /** What the outcome was expected to be. */
  expectedOutcome: string;
  /** What the outcome actually was. */
  actualOutcome: string;
  /** Categorization of the failure mode. */
  failureMode: string;
  /** Lesson learned / root cause captured for future reuse. */
  lesson: string;
}

/**
 * A recommendation about a single available action, including the inferred
 * risk and a human-readable recommendation.
 */
export interface ActionRecommendation {
  /** The action being recommended or flagged. */
  action: string;
  /** Risk score from 0 (safe) to 1 (very risky) based on known patterns. */
  risk: number;
  /** Human-readable recommendation: "proceed", "avoid", or "mitigate". */
  recommendation: string;
  /** Why this recommendation was produced. */
  reason: string;
}

/**
 * Result returned by {@link FailurePatternRecognizer.getFailureRisk}.
 */
export interface FailureRisk {
  /** Aggregate risk score from 0 (safe) to 1 (very risky). */
  risk: number;
  /** Patterns that matched the supplied plan. */
  patterns: FailurePattern[];
  /** Unique mitigations drawn from the matching patterns. */
  mitigations: string[];
}

/**
 * Options accepted by {@link FailurePatternRecognizer.addFailureCase}.
 */
export interface AddFailureCaseOptions {
  /** When true, a brand new pattern is created even for a novel failure mode. */
  createPattern?: boolean;
}

const DEFAULT_PATTERNS: FailurePattern[] = [
  {
    id: "fp-retry-without-backoff",
    name: "Retry without backoff",
    description:
      "Repeatedly retrying a failing operation with no backoff or jitter overwhelms downstream dependencies and can trigger cascading failures.",
    frequency: 0,
    severity: 0.7,
    domain: "network",
    triggers: ["retry", "reconnect", "poll"],
    consequences: [
      "Cascading timeouts across dependent services",
      "Resource exhaustion on the target system",
    ],
    mitigations: [
      "Use exponential backoff with jitter",
      "Add circuit breakers",
      "Limit maximum retry count",
    ],
  },
  {
    id: "fp-auth-bypass",
    name: "Authentication bypass",
    description:
      "Proceeding with a privileged operation without verifying authentication or authorization results in privilege escalation or data exposure.",
    frequency: 0,
    severity: 0.95,
    domain: "auth",
    triggers: ["delete", "modify", "export", "admin"],
    consequences: [
      "Unauthorized data modification",
      "Privilege escalation",
      "Compliance violation",
    ],
    mitigations: [
      "Verify authentication before every privileged action",
      "Enforce least-privilege checks",
      "Audit privileged operations",
    ],
  },
  {
    id: "fp-deployment-without-rollback",
    name: "Deployment without rollback",
    description:
      "Rolling out a change with no automated rollback path leaves the system unavailable if the deployment fails.",
    frequency: 0,
    severity: 0.85,
    domain: "deployment",
    triggers: ["deploy", "update", "migrate", "restart"],
    consequences: [
      "Extended downtime",
      "Inability to recover quickly",
      "Cascading deployment failures",
    ],
    mitigations: [
      "Prepare automated rollback before deploy",
      "Use canary or blue/green deployments",
      "Health-check the rollout continuously",
    ],
  },
];

/**
 * Recognizer that tracks failure patterns across domains and proactively warns
 * when a plan is about to repeat a known failure pattern.
 *
 * @public
 */
export class FailurePatternRecognizer {
  private readonly patterns: Map<string, FailurePattern> = new Map();
  private readonly cases: FailureCase[] = [];
  private readonly patternsByDomain: Map<string, Set<string>> = new Map();

  constructor() {
    for (const pattern of DEFAULT_PATTERNS) {
      this.registerPattern(pattern);
    }
  }

  /**
   * Analyze an execution history and surface the failure patterns it exhibits.
   *
   * Each entry in `history` is expected to be an object describing an action and
   * its outcome. The method matches entries against both the supplied history and
   * the internally tracked patterns (by trigger overlap and domain) and returns
   * the most relevant patterns, ordered by relevance.
   *
   * @param history - Array of historical execution events.
   * @returns Patterns detected within the supplied history.
   * @throws {TypeError} When `history` is null or not an array.
   */
  public async detectFailurePatterns(history: any[]): Promise<FailurePattern[]> {
    if (history === null || history === undefined) {
      throw new TypeError("detectFailurePatterns: 'history' is required");
    }
    if (!Array.isArray(history)) {
      throw new TypeError("detectFailurePatterns: 'history' must be an array");
    }

    const matchedIds = new Set<string>();
    const results: FailurePattern[] = [];

    for (const entry of history) {
      if (entry === null || typeof entry !== "object") {
        continue;
      }

      const domain = this.normalize(entry.domain) ?? this.normalize(entry.step);
      const action = this.normalize(entry.action);
      const outcome = this.normalize(entry.actualOutcome) ?? this.normalize(entry.outcome);

      if (domain !== null && this.isFailureOutcome(outcome)) {
        for (const pattern of this.matchingPatterns(domain, action, entry.failureMode)) {
          if (!matchedIds.has(pattern.id)) {
            matchedIds.add(pattern.id);
            results.push({ ...pattern });
          }
        }
      }
    }

    this.scoreByRelevance(results, history);
    results.sort((a, b) => b.frequency - a.frequency || b.severity - a.severity);
    return results;
  }

  /**
   * Assess the risk that a proposed plan will repeat a known failure pattern.
   *
   * The plan is expected to either expose a list of `actions`/`steps` or be one
   * of those objects directly. The returned risk is the highest severity among
   * all matching patterns, normalized to a 0-1 scale.
   *
   * @param plan - A plan object describing the actions to be executed.
   * @returns Aggregate risk, the matching patterns, and unique mitigations.
   * @throws {TypeError} When `plan` is null or not an object.
   */
  public async getFailureRisk(plan: any): Promise<FailureRisk> {
    if (plan === null || plan === undefined) {
      throw new TypeError("getFailureRisk: 'plan' is required");
    }
    if (typeof plan !== "object" || Array.isArray(plan)) {
      throw new TypeError("getFailureRisk: 'plan' must be an object");
    }

    const steps: any[] = this.extractSteps(plan);
    const matched: FailurePattern[] = [];
    const matchedIds = new Set<string>();
    let maxSeverity = 0;

    for (const step of steps) {
      if (step === null || typeof step !== "object") {
        continue;
      }
      const domain = this.normalize(step.domain) ?? this.normalize(step.step);
      const action = this.normalize(step.action);
      for (const pattern of this.matchingPatterns(domain, action, step.failureMode)) {
        if (!matchedIds.has(pattern.id)) {
          matchedIds.add(pattern.id);
          matched.push({ ...pattern });
          if (pattern.severity > maxSeverity) {
            maxSeverity = pattern.severity;
          }
        }
      }
    }

    const mitigations = Array.from(new Set(matched.flatMap((p) => p.mitigations)));

    return {
      risk: maxSeverity,
      patterns: matched,
      mitigations,
    };
  }

  /**
   * Record a new failure case and fold it into the pattern knowledge base.
   *
   * If a pattern already exists for the same domain + action + failure mode it
   * is updated (frequency incremented, severity recomputed). Otherwise a new
   * pattern is created from the case's lesson unless `createPattern` is false.
   *
   * @param failureCase - The failure case to persist.
   * @param options - Optional behavior flags.
   * @throws {TypeError} When `failureCase` is missing or malformed.
   */
  public async addFailureCase(
    failureCase: FailureCase,
    options: AddFailureCaseOptions = {}
  ): Promise<void> {
    if (failureCase === null || failureCase === undefined) {
      throw new TypeError("addFailureCase: 'failureCase' is required");
    }
    if (typeof failureCase !== "object" || Array.isArray(failureCase)) {
      throw new TypeError("addFailureCase: 'failureCase' must be an object");
    }
    for (const field of ["id", "timestamp", "domain", "action", "failureMode"] as const) {
      if (this.normalize(failureCase[field]) === null) {
        throw new TypeError(`addFailureCase: 'failureCase.${field}' is required`);
      }
    }

    if (this.cases.some((c) => c.id === failureCase.id)) {
      return;
    }

    this.cases.push({ ...failureCase });

    const existing = this.findPatternForCase(failureCase);
    if (existing) {
      existing.frequency += 1;
      existing.severity = this.computeSeverity(existing, failureCase);
      existing.mitigations = Array.from(
        new Set([...existing.mitigations, ...this.lessonToMitigations(failureCase.lesson)])
      );
      return;
    }

    if (options.createPattern === false) {
      return;
    }

    const pattern: FailurePattern = {
      id: `fp-derived-${failureCase.domain}-${this.sanitizeSlug(failureCase.action)}-${this.sanitizeSlug(
        failureCase.failureMode
      )}`,
      name: `${this.titleCase(failureCase.action)} failure (${failureCase.failureMode})`,
      description: this.buildDescription(failureCase),
      frequency: 1,
      severity: this.computeSeverity(null, failureCase),
      domain: failureCase.domain,
      triggers: this.deriveTriggers(failureCase),
      consequences: this.lessonToConsequences(failureCase),
      mitigations: this.lessonToMitigations(failureCase.lesson),
    };

    this.registerPattern(pattern);
  }

  /**
   * Return all known failure patterns recorded for a given domain.
   *
   * @param domain - The domain to filter patterns by.
   * @returns Matching patterns (shallow copies), ordered by severity.
   * @throws {TypeError} When `domain` is empty.
   */
  public async getPatternsForDomain(domain: string): Promise<FailurePattern[]> {
    const normalized = this.normalize(domain);
    if (normalized === null) {
      throw new TypeError("getPatternsForDomain: 'domain' is required");
    }

    const ids = this.patternsByDomain.get(normalized) ?? new Set<string>();
    const results = Array.from(ids, (id) => this.patterns.get(id)).filter(
      (p): p is FailurePattern => p !== undefined
    );
    results.sort((a, b) => b.severity - a.severity || b.frequency - a.frequency);
    return results.map((p) => ({ ...p }));
  }

  /**
   * Examine a set of available actions and recommend which to avoid given the
   * supplied execution context, returning a recommendation per action.
   *
   * Each recommendation carries a risk score derived from known patterns whose
   * triggers overlap with the action. Actions whose risk is high are flagged
   * "avoid"; risky actions are flagged "mitigate" with the relevant mitigations;
   * low-risk actions are flagged "proceed".
   *
   * @param availableActions - Candidate actions the agent could take.
   * @param context - Contextual information (e.g. domain, step) to drive matching.
   * @returns One recommendation per available action, sorted by risk ascending.
   * @throws {TypeError} When `availableActions` is not an array.
   */
  public async avoidKnownFailures(
    availableActions: any[],
    context: any
  ): Promise<ActionRecommendation[]> {
    if (!Array.isArray(availableActions)) {
      throw new TypeError("avoidKnownFailures: 'availableActions' must be an array");
    }
    const ctx = context && typeof context === "object" ? context : {};

    return availableActions
      .map((action): ActionRecommendation => {
        const actionStr = this.actionToString(action);
        if (actionStr.length === 0) {
          return {
            action: this.actionToString(action, true),
            risk: 1,
            recommendation: "avoid",
            reason: "Action could not be interpreted; skipping is safest.",
          };
        }

        const patterns = this.matchingPatterns(
          this.normalize(ctx.domain),
          actionStr,
          this.normalize(ctx.failureMode)
        );

        const risk =
          patterns.length === 0
            ? 0
            : Math.min(
                1,
                patterns.reduce((acc, p) => acc + p.severity, 0) / patterns.length
              );

        let recommendation: "avoid" | "mitigate" | "proceed";
        let reason: string;

        if (risk >= 0.8) {
          recommendation = "avoid";
          reason = `Action matches a known high-severity failure pattern (${patterns
            .map((p) => p.name)
            .join("; ")})`;
        } else if (risk > 0) {
          recommendation = "mitigate";
          reason = `Action matches known failure pattern(s): ${patterns
            .map((p) => p.name)
            .join("; ")}. Mitigations: ${patterns.flatMap((p) => p.mitigations).join("; ") || "none recorded"}`;
        } else {
          recommendation = "proceed";
          reason = "No known failure pattern matches this action.";
        }

        return { action: actionStr, risk, recommendation, reason };
      })
      .sort((a, b) => a.risk - b.risk);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Persist a pattern into the knowledge base and index it by domain.
   */
  private registerPattern(pattern: FailurePattern): void {
    this.patterns.set(pattern.id, { ...pattern });
    const bucket = this.patternsByDomain.get(pattern.domain) ?? new Set<string>();
    bucket.add(pattern.id);
    this.patternsByDomain.set(pattern.domain, bucket);
  }

  /**
   * Find a stored pattern that matches the domain, action, and failure mode of
   * a failure case. Returns the first match or undefined.
   */
  private findPatternForCase(failureCase: FailureCase): FailurePattern | undefined {
    const domain = this.normalize(failureCase.domain);
    if (domain === null) {
      return undefined;
    }
    const ids = this.patternsByDomain.get(domain);
    if (!ids) {
      return undefined;
    }
    const action = this.normalize(failureCase.action);
    const failureMode = this.normalize(failureCase.failureMode);

    for (const id of ids) {
      const pattern = this.patterns.get(id);
      if (!pattern) {
        continue;
      }
      const triggerMatch =
        action !== null && pattern.triggers.some((t) => t.toLowerCase() === action.toLowerCase());
      if (triggerMatch) {
        return pattern;
      }
    }

    // Fall back to failure-mode overlap if no exact action match.
    if (failureMode !== null) {
      for (const id of ids) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
          continue;
        }
        if (pattern.name.toLowerCase().includes(failureMode)) {
          return pattern;
        }
      }
    }

    return undefined;
  }

  /**
   * Return patterns whose triggers or domain match the supplied action. The
   * `domain` is used to scope matching when available.
   */
  private matchingPatterns(
    domain: string | null,
    action: string | null,
    failureMode: any
  ): FailurePattern[] {
    const failureModeNorm = this.normalize(failureMode);
    const matches: FailurePattern[] = [];

    for (const pattern of this.patterns.values()) {
      let hit = false;
      if (action !== null && pattern.triggers.some((t) => this.containsKeyword(t, action))) {
        hit = true;
      }
      if (
        !hit &&
        failureModeNorm !== null &&
        pattern.name.toLowerCase().includes(failureModeNorm)
      ) {
        hit = true;
      }
      if (!hit && domain !== null && pattern.domain === domain) {
        if (action !== null && pattern.triggers.some((t) => this.containsKeyword(t, action))) {
          hit = true;
        }
      }
      if (hit) {
        matches.push(pattern);
      }
    }

    return matches;
  }

  /**
   * Extract a list of step objects from a plan structure.
   */
  private extractSteps(plan: any): any[] {
    const candidates: any[] = [];
    if (Array.isArray(plan.actions)) {
      candidates.push(...plan.actions);
    } else if (Array.isArray(plan.steps)) {
      candidates.push(...plan.steps);
    } else if (Array.isArray(plan.tasks)) {
      candidates.push(...plan.tasks);
    } else if (Array.isArray(plan)) {
      candidates.push(...plan);
    } else {
      candidates.push(plan);
    }
    return candidates;
  }

  /**
   * Compute an aggregate severity (0-1) for a pattern based on a failure case.
   */
  private computeSeverity(pattern: FailurePattern | null, failureCase: FailureCase): number {
    const lesson = this.normalize(failureCase.lesson) ?? "";
    const lowered = lesson.toLowerCase();
    let severity = 0.5;
    if (lowered.includes("catastrophic") || lowered.includes("breach")) {
      severity = 0.95;
    } else if (lowered.includes("downtime") || lowered.includes("unavailable")) {
      severity = 0.8;
    } else if (lowered.includes("delayed") || lowered.includes("degraded")) {
      severity = 0.6;
    } else if (lowered.includes("minor") || lowered.includes("cosmetic")) {
      severity = 0.3;
    }
    if (pattern) {
      return Math.min(1, (pattern.severity * pattern.frequency + severity) / (pattern.frequency + 1));
    }
    return severity;
  }

  /**
   * Build a description for a derived pattern from a failure case.
   */
  private buildDescription(failureCase: FailureCase): string {
    const expected = this.normalize(failureCase.expectedOutcome) ?? "succeed";
    const actual = this.normalize(failureCase.actualOutcome) ?? "failed";
    return `Action "${failureCase.action}" in domain "${failureCase.domain}" was expected to ${expected} but ${actual}. Failure mode: ${failureCase.failureMode}.`;
  }

  /**
   * Derive trigger keywords for a derived pattern from a failure case.
   */
  private deriveTriggers(failureCase: FailureCase): string[] {
    const triggers = [this.normalize(failureCase.action), this.normalize(failureCase.failureMode)];
    const extras = this.tokensFrom(this.normalize(failureCase.lesson) ?? "").filter(
      (t) => t.length >= 4 && !["this", "that", "with", "from", "have", "they", "them"].includes(t)
    );
    return Array.from(new Set([...triggers, ...extras].filter((t): t is string => t !== null)));
  }

  /**
   * Best-effort extraction of consequences from a failure case lesson.
   */
  private lessonToConsequences(failureCase: FailureCase): string[] {
    const lesson = this.normalize(failureCase.lesson) ?? "";
    const lowered = lesson.toLowerCase();
    const consequences: string[] = [];
    if (lowered.includes("downtime")) consequences.push("Service downtime");
    if (lowered.includes("breach")) consequences.push("Security breach");
    if (lowered.includes("loss")) consequences.push("Data loss");
    if (lowered.includes("escalat")) consequences.push("Incident escalation");
    if (lowered.includes("delay")) consequences.push("Delayed delivery");
    if (consequences.length === 0) consequences.push("Operational impact");
    return consequences;
  }

  /**
   * Convert a lesson into concrete mitigation bullets.
   */
  private lessonToMitigations(lesson: string): string[] {
    const normalized = this.normalize(lesson) ?? "";
    if (normalized.length === 0) {
      return ["Document and review the root cause"];
    }
    if (normalized.length <= 120) {
      return [normalized];
    }
    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return sentences.length > 1 ? sentences : [normalized];
  }

  /**
   * Convert a (possibly non-string) action into a normalized action string.
   */
  private actionToString(action: any, rawFallback = false): string {
    if (action === null || action === undefined) {
      return "";
    }
    if (typeof action === "string") {
      return action.trim();
    }
    if (typeof action === "object") {
      const candidate =
        this.normalize(action.action) ??
        this.normalize(action.name) ??
        this.normalize(action.type) ??
        this.normalize(action.command);
      if (candidate !== null) {
        return candidate;
      }
      if (rawFallback) {
        try {
          return JSON.stringify(action).slice(0, 80);
        } catch {
          return "[object Object]";
        }
      }
      return "";
    }
    if (rawFallback) {
      return String(action);
    }
    return "";
  }

  /**
   * Normalize a value into a lowercase string, or null when blank/unusable.
   */
  private normalize(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (typeof value === "object") {
      if ("toString" in value && typeof value.toString === "function") {
        const str = value.toString().trim().toLowerCase();
        return str.length > 0 ? str : null;
      }
      return null;
    }
    return null;
  }

  /**
   * Case-insensitive substring test.
   */
  private containsKeyword(haystack: string, needle: string): boolean {
    return haystack.toLowerCase().includes(needle.toLowerCase());
  }

  /**
   * Determine whether an outcome string represents a failure.
   */
  private isFailureOutcome(outcome: string | null): boolean {
    if (outcome === null) {
      return false;
    }
    const markers = [
      "fail",
      "errored",
      "error",
      "timeout",
      "denied",
      "breach",
      "crash",
      "exception",
      "lost",
      "degraded",
      "rejected",
      "expired",
      "invalid",
      "unauthorized",
    ];
    return markers.some((m) => outcome.includes(m));
  }

  /**
   * Produce a URL-safe slug from a string.
   */
  private sanitizeSlug(value: string): string {
    return this.normalize(value)
      ?.replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ?? "case";
  }

  /**
   * Convert a string to Title Case.
   */
  private titleCase(value: string): string {
    const normalized = this.normalize(value);
    if (!normalized) {
      return "Failure";
    }
    return normalized
      .split(/\s+/)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(" ");
  }

  /**
   * Tokenize a string into lowercase tokens.
   */
  private tokensFrom(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((t) => t.length > 0);
  }

  /**
   * Score patterns by how frequently their triggers appear in history.
   */
  private scoreByRelevance(patterns: FailurePattern[], history: any[]): void {
    for (const pattern of patterns) {
      let hits = 0;
      for (const entry of history) {
        if (entry === null || typeof entry !== "object") {
          continue;
        }
        const action = this.normalize(entry.action);
        if (action !== null && pattern.triggers.some((t) => this.containsKeyword(t, action))) {
          hits += 1;
        }
      }
      pattern.frequency = Math.max(pattern.frequency, hits);
    }
  }
}

export default FailurePatternRecognizer;
