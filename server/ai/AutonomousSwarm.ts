import { generateLLMPrompt } from '../services/llmGateway.js';
import { ResearchAgentSwarm } from './ResearchAgentFramework.js';

/**
 * AutonomousSwarm: Enables personas to spawn sub-agents for missing research
 * When a debate reveals a knowledge gap, the swarm branch handles it autonomously
 * with recursive depth limits to prevent infinite loops.
 * 
 * Now integrated with specialized ResearchAgentSwarm for domain-specific analysis
 */
export class AutonomousSwarm {
  private readonly MAX_DEPTH = 3;
  private readonly RESEARCH_CACHE: Map<string, string> = new Map();
  private readonly researchSwarm: ResearchAgentSwarm;

  constructor() {
    this.researchSwarm = new ResearchAgentSwarm();
  }

  public async executeSubAgentBranch(
    persona: string,
    missingFact: string,
    context: string,
    depth: number = 0
  ): Promise<string> {
    const cacheKey = `${persona}:${missingFact}`;
    
    if (this.RESEARCH_CACHE.has(cacheKey)) {
      console.log(`[SWARM] Cache hit for ${persona} researching "${missingFact}"`);
      return this.RESEARCH_CACHE.get(cacheKey)!;
    }

    if (depth >= this.MAX_DEPTH) {
      console.log(`[SWARM] Max recursion depth (${this.MAX_DEPTH}) reached for "${missingFact}"`);
      return `[SYSTEM HALT] Research incomplete - max depth reached. Proceeding with probabilistic inference.`;
    }

    console.log(`[SWARM] ${persona} spawning Research Sub-Agent (Depth: ${depth + 1}/${this.MAX_DEPTH})`);
    console.log(`[SWARM] Mission: Verify "${missingFact}"`);

    const researchPrompt = `
You are a specialized research sub-agent operating within the ADVERSIQ system.
Your mandate: Find and synthesize the most relevant, factual information about:

"${missingFact}"

Context: ${context}

Requirements:
1. Be specific and cite sources where possible
2. If you don't have certain data, say so clearly
3. Provide confidence level (HIGH, MEDIUM, LOW) for your findings
4. Return raw data, not opinions

Synthesize into a concise summary (max 500 chars):
`;

    try {
      const result = await generateLLMPrompt(researchPrompt);
      const cleaned = result.trim();
      
      this.RESEARCH_CACHE.set(cacheKey, cleaned);
      console.log(`[SWARM RESOLVED] ${persona} verified: "${missingFact.substring(0, 30)}..."`);
      
      return cleaned;
    } catch (err) {
      console.error(`[SWARM ERROR] Sub-agent research failed:`, err);
      
      if (depth < this.MAX_DEPTH - 1) {
        console.log(`[SWARM] Retrying with refined query...`);
        return this.executeSubAgentBranch(persona, `${missingFact} (retry)`, context, depth + 1);
      }
      
      return `[RESEARCH FAILURE] Unable to verify "${missingFact}" after ${depth + 1} attempts.`;
    }
  }

  public async parallelResearch(
    persona: string,
    topics: string[],
    context: string
  ): Promise<Record<string, string>> {
    console.log(`[SWARM] ${persona} initiating parallel research on ${topics.length} topics`);
    
    const results: Record<string, string> = {};
    const promises = topics.map(topic => 
      this.executeSubAgentBranch(persona, topic, context, 0)
        .then(result => {
          results[topic] = result;
        })
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * Execute specialized research using domain experts
   * Returns findings with mathematical formulas
   */
  public async conductSpecializedResearch(
    query: string,
    domains?: string[],
    context?: Record<string, unknown>
  ): Promise<any> {
    console.log(`[SWARM] Conducting specialized multi-domain research: "${query}"`);
    
    const findings = await this.researchSwarm.executeMultiDomainResearch(
      query,
      context || {},
      domains
    );

    // Format findings for response
    return {
      query,
      researchDate: new Date().toISOString(),
      findingsCount: findings.length,
      findings: findings.map(f => ({
        agent: f.agent,
        domain: f.domain,
        summary: f.finding,
        confidence: `${(f.confidence * 100).toFixed(1)}%`,
        evidenceCount: f.evidenceCount,
        formulas: f.keyFormulas.map(formula => ({
          latex: formula.latex,
          description: formula.description,
          variables: formula.variables
        })),
        citations: f.citations.slice(0, 3),
        metadata: f.metadata
      }))
    };
  }

  public clearCache(): void {
    this.RESEARCH_CACHE.clear();
    console.log(`[SWARM] Research cache cleared`);
  }
}
