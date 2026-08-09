import * as fs from 'fs';
import * as path from 'path';
import type { FailureSignature } from './failure_detector';
import type { NSILTrajectory } from './trajectory_logger';

export interface HarnessPromptState {
  id: string;
  name: string;
  directives: string[];
  updated_at: string;
  version: number;
}

export interface HarnessSubagentState {
  id: string;
  name: string;
  role: string;
  trigger: string;
  available_tools: string[];
  return_condition: string;
  confidence: number;
  updated_at: string;
  version: number;
}

export interface HarnessSkillState {
  id: string;
  name: string;
  purpose: string;
  steps: string[];
  success_criteria: string[];
  updated_at: string;
  version: number;
}

export interface HarnessMemoryState {
  id: string;
  category: string;
  text: string;
  evidence: string[];
  confidence: number;
  updated_at: string;
  version: number;
}

export interface ContinualHarnessState {
  prompt: HarnessPromptState;
  subagents: HarnessSubagentState[];
  skills: HarnessSkillState[];
  memory: HarnessMemoryState[];
  updated_at: string;
}

export interface ContinualHarnessAdaptation {
  prompt_edits: string[];
  subagent_edits: string[];
  skill_edits: string[];
  memory_edits: string[];
  state_path: string;
}

const now = () => new Date().toISOString();

const normalizeId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80);

export class ContinualHarnessAdapter {
  private statePath: string;
  private state: ContinualHarnessState;

  constructor(dataDir = 'data/evolved_state') {
    fs.mkdirSync(dataDir, { recursive: true });
    this.statePath = path.join(dataDir, 'continual_harness_state.json');
    this.state = this.load();
  }

  evolve(trajectories: NSILTrajectory[], failures: FailureSignature[] = []): ContinualHarnessAdaptation {
    const adaptation: ContinualHarnessAdaptation = {
      prompt_edits: [],
      subagent_edits: [],
      skill_edits: [],
      memory_edits: [],
      state_path: this.statePath,
    };

    this.ensurePromptDirective(
      'Operate reset-free: observe live signals, act, verify, refine, and continue without waiting for outside approval unless the user explicitly asks for a user-facing checkpoint.',
      adaptation.prompt_edits,
    );
    this.ensurePromptDirective(
      'For every user-entered or uploaded matter, mine the evidence gap, run adversarial verification, identify investable regional-city matches, and persist the trajectory for self-improvement.',
      adaptation.prompt_edits,
    );

    const sectorCounts = new Map<string, number>();
    const regionCounts = new Map<string, number>();
    for (const trajectory of trajectories) {
      const sector = trajectory.input?.sector || 'general';
      const region = trajectory.region_id || trajectory.input?.region || 'global';
      sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }

    this.upsertSubagent({
      id: 'regional_gap_miner',
      name: 'Regional Gap Miner',
      role: 'Find overlooked regional-city issues across macro, trade, infrastructure, workforce, climate, and market-access signals.',
      trigger: 'Run when a country, city, sector, uploaded report, or live global matter enters the system.',
      available_tools: ['live_global_matter_runner', 'external_data_integrations', 'regional_city_discovery', 'memory_store'],
      return_condition: 'Return ranked gaps with source provenance and score drivers.',
      confidence: 0.92,
    }, adaptation.subagent_edits);

    this.upsertSubagent({
      id: 'source_verifier',
      name: 'Source Verifier',
      role: 'Triangulate official and live sources before a recommendation is released.',
      trigger: 'Run when evidence count is low, source freshness is weak, or confidence exceeds source support.',
      available_tools: ['world_bank', 'imf', 'rest_countries', 'wikidata', 'global_search'],
      return_condition: 'Return verified sources, unresolved gaps, and confidence downgrade if sources are insufficient.',
      confidence: 0.9,
    }, adaptation.subagent_edits);

    this.upsertSubagent({
      id: 'investment_matchmaker',
      name: 'Investment Matchmaker',
      role: 'Match global capital needs to regional-city assets, programs, constraints, and GDP pathways.',
      trigger: 'Run after the Regional Gap Miner produces accepted matters.',
      available_tools: ['regional_city_discovery', 'partner_intelligence', 'problem_to_solution_graph', 'nsil_orchestrator'],
      return_condition: 'Return match thesis, counterpart class, risk allocation, and execution phases.',
      confidence: 0.88,
    }, adaptation.subagent_edits);

    this.upsertSkill({
      id: 'triangulate_official_sources',
      name: 'Triangulate Official Sources',
      purpose: 'Prevent unsupported claims by grounding every material recommendation in official or live-source evidence.',
      steps: [
        'Identify the country, sector, and issue category.',
        'Query official macro/development sources and live search connectors.',
        'Reject filler evidence; retain title, source, URL, timestamp, and snippet.',
        'Downgrade confidence when evidence is stale, absent, or contradictory.',
      ],
      success_criteria: ['At least two source classes are attempted', 'Every released matter has provenance', 'Missing evidence is explicit'],
    }, adaptation.skill_edits);

    this.upsertSkill({
      id: 'rank_regional_city_match',
      name: 'Rank Regional City Match',
      purpose: 'Score investable regional cities against sector fit, overlooked opportunity, infrastructure, market pressure, and GDP pathway.',
      steps: [
        'Scan regional city candidates across all sectors.',
        'Compute sector fit, infrastructure readiness, investment momentum, and overlooked opportunity.',
        'Blend global-market pressure and country indicators into the score.',
        'Persist the score drivers and rejected alternatives.',
      ],
      success_criteria: ['Score drivers sum to final score', 'Rejected candidates remain auditable', 'The pathway links to GDP or export growth'],
    }, adaptation.skill_edits);

    this.upsertSkill({
      id: 'reset_free_refinement',
      name: 'Reset-Free Refinement',
      purpose: 'Apply Continual Harness adaptation without resetting the run or waiting for an outside reviewer.',
      steps: [
        'Append every action and recommendation to trajectory history.',
        'Detect failures, stalls, contradictions, and source gaps from the trajectory window.',
        'CRUD prompt directives, subagents, skills, and memory.',
        'Use the evolved state on the next run immediately.',
      ],
      success_criteria: ['State persists to disk', 'Next run reads evolved state', 'No outside approval gate blocks refinement'],
    }, adaptation.skill_edits);

    for (const failure of failures.slice(0, 25)) {
      this.upsertMemory({
        id: `failure_${normalizeId(failure.affected_component)}_${normalizeId(failure.failure_type)}`,
        category: 'failure_signature',
        text: `${failure.failure_type}: ${failure.pattern_description}. Fix: ${failure.recommended_fix}`,
        evidence: failure.trajectory_ids,
        confidence: Math.max(0.5, Math.min(1, failure.severity)),
      }, adaptation.memory_edits);
    }

    for (const [sector, count] of sectorCounts) {
      if (count < 2) continue;
      this.upsertMemory({
        id: `sector_window_${normalizeId(sector)}`,
        category: 'trajectory_window',
        text: `${sector} has appeared in ${count} recent NSIL trajectories; prioritize cross-case pattern mining before new recommendations.`,
        evidence: trajectories
          .filter((trajectory) => trajectory.input?.sector === sector)
          .map((trajectory) => trajectory.session_id)
          .slice(0, 12),
        confidence: Math.min(0.95, 0.55 + count * 0.05),
      }, adaptation.memory_edits);
    }

    for (const [region, count] of regionCounts) {
      if (count < 2) continue;
      this.upsertMemory({
        id: `region_window_${normalizeId(region)}`,
        category: 'trajectory_window',
        text: `${region} has repeated trajectory activity; reuse learned local constraints, source gaps, and investment-match patterns.`,
        evidence: trajectories
          .filter((trajectory) => (trajectory.region_id || trajectory.input?.region || 'global') === region)
          .map((trajectory) => trajectory.session_id)
          .slice(0, 12),
        confidence: Math.min(0.95, 0.55 + count * 0.05),
      }, adaptation.memory_edits);
    }

    this.state.updated_at = now();
    this.persist();
    return adaptation;
  }

  getState(): ContinualHarnessState {
    return this.state;
  }

  private ensurePromptDirective(directive: string, edits: string[]): void {
    if (!this.state.prompt.directives.includes(directive)) {
      this.state.prompt.directives.push(directive);
      this.state.prompt.version += 1;
      this.state.prompt.updated_at = now();
      edits.push(`prompt:add:${directive}`);
    }
  }

  private upsertSubagent(input: Omit<HarnessSubagentState, 'updated_at' | 'version'>, edits: string[]): void {
    const existing = this.state.subagents.find((item) => item.id === input.id);
    if (existing) {
      const changed = JSON.stringify({ ...existing, updated_at: undefined, version: undefined }) !== JSON.stringify(input);
      if (!changed) return;
      Object.assign(existing, input, { updated_at: now(), version: existing.version + 1 });
      edits.push(`subagent:update:${input.id}`);
      return;
    }
    this.state.subagents.push({ ...input, updated_at: now(), version: 1 });
    edits.push(`subagent:add:${input.id}`);
  }

  private upsertSkill(input: Omit<HarnessSkillState, 'updated_at' | 'version'>, edits: string[]): void {
    const existing = this.state.skills.find((item) => item.id === input.id);
    if (existing) {
      const changed = JSON.stringify({ ...existing, updated_at: undefined, version: undefined }) !== JSON.stringify(input);
      if (!changed) return;
      Object.assign(existing, input, { updated_at: now(), version: existing.version + 1 });
      edits.push(`skill:update:${input.id}`);
      return;
    }
    this.state.skills.push({ ...input, updated_at: now(), version: 1 });
    edits.push(`skill:add:${input.id}`);
  }

  private upsertMemory(input: Omit<HarnessMemoryState, 'updated_at' | 'version'>, edits: string[]): void {
    const existing = this.state.memory.find((item) => item.id === input.id);
    if (existing) {
      existing.text = input.text;
      existing.evidence = [...new Set([...existing.evidence, ...input.evidence])].slice(0, 25);
      existing.confidence = Math.max(existing.confidence, input.confidence);
      existing.updated_at = now();
      existing.version += 1;
      edits.push(`memory:update:${input.id}`);
      return;
    }
    this.state.memory.push({ ...input, updated_at: now(), version: 1 });
    edits.push(`memory:add:${input.id}`);
  }

  private load(): ContinualHarnessState {
    if (fs.existsSync(this.statePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8')) as ContinualHarnessState;
      } catch {
        // Fall through to a clean state if the file is corrupt.
      }
    }

    return {
      prompt: {
        id: 'adversiq_decision_verification_prompt',
        name: 'ADVERSIQ Decision Verification Operating Prompt',
        directives: [],
        updated_at: now(),
        version: 1,
      },
      subagents: [],
      skills: [],
      memory: [],
      updated_at: now(),
    };
  }

  private persist(): void {
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }
}
