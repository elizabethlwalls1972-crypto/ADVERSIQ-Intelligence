/**
 * Problem-Solution Memory Engine
 * 
 * A persistent learning system that:
 * 1. Extracts problem patterns from user conversations
 * 2. Caches solutions and their effectiveness
 * 3. Allows users to save conversations with semantic tagging
 * 4. Resets session state between users but preserves learned knowledge
 * 5. Integrates learned patterns into the NSIL decision pipeline
 * 
 * This implements "continual improvement harness" from ADVERSIQ architecture
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Problem {
  id: string;
  domain: string; // 'coding', 'strategy', 'analysis', 'decision'
  pattern: string; // Core problem description
  symptoms: string[]; // Observable indicators
  rootCauses: string[];
  tags: string[]; // Semantic tags for matching
  firstIdentified: string;
  frequency: number; // How many times seen
  lastSeen: string;
}

export interface Solution {
  problemId: string;
  steps: string[];
  formulasUsed: string[]; // Which NSIL formulas apply
  timeToResolve: number; // milliseconds
  successRate: number; // 0-1, based on outcomes
  evidence: string[]; // Citations, test results, precedents
  applicableConditions: string[];
  sectorApplicability: Record<string, number>; // sector -> effectiveness
  lastApplied: string;
  applicationCount: number;
}

export interface SavedConversation {
  id: string;
  userId: string;
  timestamp: string;
  title: string;
  tags: string[];
  messages: ConversationMessage[];
  problemsIdentified: string[]; // Problem IDs referenced
  solutionsApplied: string[]; // Solution IDs used
  outcome: 'resolved' | 'partial' | 'unresolved' | 'escalated';
  learningsExtracted: string[];
  researchFindingsUsed: string[];
  isPublic: boolean; // Can be shared for learning
}

export interface ConversationMessage {
  role: 'user' | 'system' | 'research' | 'formula';
  content: string;
  timestamp: string;
  metadata?: {
    domain?: string;
    agentType?: string;
    formulasUsed?: string[];
    confidence?: number;
  };
}

export interface SemanticMatch {
  problemId: string;
  pattern: string;
  matchScore: number; // 0-1 cosine similarity
  applicableSolutions: Solution[];
}

/**
 * Problem-Solution Memory Engine
 * Core learning system that improves decision quality through experience
 */
export class ProblemSolutionMemoryEngine {
  private problems: Map<string, Problem> = new Map();
  private solutions: Map<string, Solution> = new Map();
  private conversations: Map<string, SavedConversation> = new Map();
  private problemIndex: Map<string, string[]> = new Map(); // tag -> [problemIds]
  private readonly MEMORY_PATH = path.resolve(process.cwd(), 'data', 'memory');
  private readonly PROBLEM_DB = path.join(this.MEMORY_PATH, 'problems.jsonl');
  private readonly SOLUTION_DB = path.join(this.MEMORY_PATH, 'solutions.jsonl');
  private readonly CONVERSATION_DB = path.join(this.MEMORY_PATH, 'conversations.jsonl');

  constructor() {
    this.initializeMemorySystem();
  }

  private initializeMemorySystem(): void {
    // Create memory directory if it doesn't exist
    if (!fs.existsSync(this.MEMORY_PATH)) {
      fs.mkdirSync(this.MEMORY_PATH, { recursive: true });
    }

    // Load existing memories
    this.loadProblems();
    this.loadSolutions();
    this.buildIndex();

    console.log(`[MEMORY] Engine initialized. ${this.problems.size} problems, ${this.solutions.size} solutions in memory`);
  }

  /**
   * Register a new problem or update existing
   */
  public registerProblem(
    domain: string,
    pattern: string,
    symptoms: string[],
    rootCauses: string[],
    tags: string[]
  ): Problem {
    // Check if similar problem exists
    const existingId = this.findSimilarProblem(pattern, tags);
    
    if (existingId) {
      const existing = this.problems.get(existingId)!;
      existing.frequency += 1;
      existing.lastSeen = new Date().toISOString();
      this.saveProblem(existing);
      console.log(`[MEMORY] Problem updated: ${existingId} (frequency: ${existing.frequency})`);
      return existing;
    }

    const problem: Problem = {
      id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain,
      pattern,
      symptoms,
      rootCauses,
      tags,
      firstIdentified: new Date().toISOString(),
      frequency: 1,
      lastSeen: new Date().toISOString()
    };

    this.problems.set(problem.id, problem);
    tags.forEach(tag => {
      if (!this.problemIndex.has(tag)) {
        this.problemIndex.set(tag, []);
      }
      this.problemIndex.get(tag)!.push(problem.id);
    });

    this.saveProblem(problem);
    console.log(`[MEMORY] New problem registered: ${problem.id}`);
    
    return problem;
  }

  /**
   * Register solution for a problem
   */
  public registerSolution(
    problemId: string,
    steps: string[],
    formulasUsed: string[],
    timeToResolve: number,
    successRate: number,
    evidence: string[],
    applicableConditions: string[]
  ): Solution {
    const solution: Solution = {
      problemId,
      steps,
      formulasUsed,
      timeToResolve,
      successRate,
      evidence,
      applicableConditions,
      sectorApplicability: {},
      lastApplied: new Date().toISOString(),
      applicationCount: 1
    };

    this.solutions.set(problemId, solution);
    this.saveSolution(solution);
    console.log(`[MEMORY] Solution registered for problem: ${problemId}`);
    
    return solution;
  }

  /**
   * Find problems similar to a new one (semantic matching)
   */
  public findRelevantProblems(
    userQuery: string,
    domain?: string,
    tags?: string[]
  ): SemanticMatch[] {
    const matches: SemanticMatch[] = [];

    // Exact tag match
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const problemIds = this.problemIndex.get(tag) || [];
        problemIds.forEach(id => {
          const problem = this.problems.get(id)!;
          const matchScore = this.calculateSemanticSimilarity(userQuery, problem.pattern);
          if (matchScore > 0.6) {
            matches.push({
              problemId: id,
              pattern: problem.pattern,
              matchScore,
              applicableSolutions: [this.solutions.get(id)!].filter(Boolean)
            });
          }
        });
      });
    }

    // Full text search if no tag matches
    if (matches.length === 0) {
      this.problems.forEach((problem, id) => {
        if (domain && problem.domain !== domain) return;
        const matchScore = this.calculateSemanticSimilarity(userQuery, problem.pattern);
        if (matchScore > 0.5) {
          matches.push({
            problemId: id,
            pattern: problem.pattern,
            matchScore,
            applicableSolutions: [this.solutions.get(id)!].filter(Boolean)
          });
        }
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  /**
   * Save a conversation for future reference
   */
  public saveConversation(
    userId: string,
    title: string,
    tags: string[],
    messages: ConversationMessage[],
    problemsIdentified: string[],
    solutionsApplied: string[],
    outcome: 'resolved' | 'partial' | 'unresolved' | 'escalated',
    learningsExtracted: string[],
    researchFindingsUsed: string[],
    isPublic: boolean = false
  ): SavedConversation {
    const conversation: SavedConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      title,
      tags,
      messages,
      problemsIdentified,
      solutionsApplied,
      outcome,
      learningsExtracted,
      researchFindingsUsed,
      isPublic
    };

    this.conversations.set(conversation.id, conversation);
    this.saveConversationToDB(conversation);
    console.log(`[MEMORY] Conversation saved: ${conversation.id} (${messages.length} messages)`);

    return conversation;
  }

  /**
   * Update solution effectiveness based on outcome
   */
  public updateSolutionEffectiveness(
    solutionId: string,
    succeeded: boolean,
    sector?: string,
    actualTimeMs?: number
  ): void {
    const solution = this.solutions.get(solutionId);
    if (!solution) return;

    solution.applicationCount += 1;
    solution.lastApplied = new Date().toISOString();

    // Update success rate
    const oldSuccess = solution.successRate;
    solution.successRate = (oldSuccess * (solution.applicationCount - 1) + (succeeded ? 1 : 0)) / solution.applicationCount;

    // Update sector applicability
    if (sector) {
      const oldScore = solution.sectorApplicability[sector] || 0.5;
      solution.sectorApplicability[sector] = (oldScore + (succeeded ? 0.1 : -0.05));
    }

    // Update time estimate
    if (actualTimeMs) {
      solution.timeToResolve = (solution.timeToResolve + actualTimeMs) / 2;
    }

    this.saveSolution(solution);
    console.log(`[MEMORY] Solution updated: ${solutionId} (success rate: ${(solution.successRate * 100).toFixed(1)}%)`);
  }

  /**
   * Get conversation history (with session reset awareness)
   */
  public getConversationHistory(userId?: string): SavedConversation[] {
    if (userId) {
      return Array.from(this.conversations.values()).filter(c => c.userId === userId);
    }
    return Array.from(this.conversations.values());
  }

  /**
   * Clear session (reset between users but preserve learned knowledge)
   */
  public clearUserSession(userId: string): void {
    // Remove user's conversations from active memory (but keep in DB)
    const userConvs = Array.from(this.conversations.entries())
      .filter(([_, conv]) => conv.userId === userId)
      .map(([id, _]) => id);
    
    userConvs.forEach(id => this.conversations.delete(id));
    console.log(`[MEMORY] User session cleared: ${userId}. Knowledge base preserved.`);
  }

  /**
   * Get memory statistics
   */
  public getMemoryStats(): {
    problemsLearned: number;
    solutionsAvailable: number;
    conversationsSaved: number;
    averageSuccessRate: number;
    mostFrequentProblems: Problem[];
  } {
    const successRates = Array.from(this.solutions.values()).map(s => s.successRate);
    const avgSuccess = successRates.length > 0 ? successRates.reduce((a, b) => a + b) / successRates.length : 0;
    const mostFrequent = Array.from(this.problems.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      problemsLearned: this.problems.size,
      solutionsAvailable: this.solutions.size,
      conversationsSaved: this.conversations.size,
      averageSuccessRate: avgSuccess,
      mostFrequentProblems: mostFrequent
    };
  }

  /**
   * Integration with NSIL pipeline - suggest formulas based on learned patterns
   */
  public suggestFormulasForProblem(problemId: string): string[] {
    const solution = this.solutions.get(problemId);
    if (!solution) return [];
    return solution.formulasUsed;
  }

  /**
   * Semantic similarity calculation (simple cosine similarity on words)
   */
  private calculateSemanticSimilarity(text1: string, text2: string): number {
    const normalize = (s: string) => s.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words1 = normalize(text1);
    const words2 = normalize(text2);
    
    const intersection = words1.filter(w => words2.includes(w)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Find similar problem by pattern and tags
   */
  private findSimilarProblem(pattern: string, tags: string[]): string | null {
    // Check exact tag matches first
    for (const tag of tags) {
      const ids = this.problemIndex.get(tag) || [];
      for (const id of ids) {
        const problem = this.problems.get(id)!;
        const similarity = this.calculateSemanticSimilarity(pattern, problem.pattern);
        if (similarity > 0.8) {
          return id;
        }
      }
    }
    return null;
  }

  /**
   * Persistence layer - load from disk
   */
  private loadProblems(): void {
    if (!fs.existsSync(this.PROBLEM_DB)) return;
    
    const lines = fs.readFileSync(this.PROBLEM_DB, 'utf-8').split('\n').filter(Boolean);
    lines.forEach(line => {
      try {
        const problem = JSON.parse(line) as Problem;
        this.problems.set(problem.id, problem);
      } catch (e) {
        console.error('Failed to parse problem:', e);
      }
    });
  }

  private loadSolutions(): void {
    if (!fs.existsSync(this.SOLUTION_DB)) return;
    
    const lines = fs.readFileSync(this.SOLUTION_DB, 'utf-8').split('\n').filter(Boolean);
    lines.forEach(line => {
      try {
        const solution = JSON.parse(line) as Solution;
        this.solutions.set(solution.problemId, solution);
      } catch (e) {
        console.error('Failed to parse solution:', e);
      }
    });
  }

  private saveProblem(problem: Problem): void {
    const line = JSON.stringify(problem) + '\n';
    fs.appendFileSync(this.PROBLEM_DB, line);
  }

  private saveSolution(solution: Solution): void {
    const line = JSON.stringify(solution) + '\n';
    fs.appendFileSync(this.SOLUTION_DB, line);
  }

  private saveConversationToDB(conversation: SavedConversation): void {
    const line = JSON.stringify(conversation) + '\n';
    fs.appendFileSync(this.CONVERSATION_DB, line);
  }

  private buildIndex(): void {
    this.problems.forEach(problem => {
      problem.tags.forEach(tag => {
        if (!this.problemIndex.has(tag)) {
          this.problemIndex.set(tag, []);
        }
        this.problemIndex.get(tag)!.push(problem.id);
      });
    });
  }
}

export const memoryEngine = new ProblemSolutionMemoryEngine();
