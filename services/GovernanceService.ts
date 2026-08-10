
class SimpleEventEmitter {
  private listeners = new Map<string, Array<(...args: any[]) => void>>();

  on(event: string, listener: (...args: any[]) => void) {
    const existing = this.listeners.get(event) || [];
    existing.push(listener);
    this.listeners.set(event, existing);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void) {
    const existing = this.listeners.get(event);
    if (!existing) return this;
    this.listeners.set(event, existing.filter((l) => l !== listener));
    return this;
  }

  once(event: string, listener: (...args: any[]) => void) {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      listener(...args);
    };
    this.on(event, wrapper);
    return this;
  }

  emit(event: string, ...args: any[]) {
    const existing = this.listeners.get(event) || [];
    for (const listener of [...existing]) {
      try {
        listener(...args);
      } catch (error) {
        console.error('GovernanceService event listener error:', error);
      }
    }
    return this;
  }
}

export interface GovernancePolicy { id: string; name: string; rule: (ctx: any) => boolean; severity: 'block' | 'warn' | 'info'; }
export interface GovernanceDecision { allowed: boolean; violations: string[]; warnings: string[]; timestamp: string; }

export class GovernanceService extends SimpleEventEmitter {
  private policies: GovernancePolicy[] = [
    { id: 'p_no_secret_in_plan', name: 'No hardcoded secrets in plan', rule: (c) => !JSON.stringify(c).includes('sk-') && !JSON.stringify(c).includes('password='), severity: 'block' },
    { id: 'p_risk_ceiling', name: 'Risk must stay under ceiling', rule: (c) => (c.risk ?? 0) < 0.9, severity: 'block' },
    { id: 'p_human_review', name: 'High-impact actions need human review flag', rule: (c) => (c.impact !== 'critical') || c.humanReview === true, severity: 'warn' },
  ];

  addPolicy(p: GovernancePolicy) { this.policies.push(p); }
  removePolicy(id: string) { this.policies = this.policies.filter(p => p.id !== id); }

  evaluate(context: any): GovernanceDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    for (const p of this.policies) {
      let ok = true;
      try { ok = p.rule(context); } catch { ok = false; }
      if (!ok) {
        if (p.severity === 'block') violations.push(p.name);
        else warnings.push(p.name);
      }
    }
    const decision: GovernanceDecision = { allowed: violations.length === 0, violations, warnings, timestamp: new Date().toISOString() };
    this.emit('governed', decision);
    return decision;
  }
}
export default GovernanceService;
