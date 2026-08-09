import type { ConsultantCapabilityProfile } from './consultantCapabilities.js';

export type AugmentedToolCategory =
  | 'research_intelligence'
  | 'document_authoring'
  | 'workflow_orchestration'
  | 'quality_assurance'
  | 'developer_augmentation'
  | 'knowledge_management';

export interface AugmentedAITool {
  id: string;
  name: string;
  category: AugmentedToolCategory;
  primaryUse: string;
  bwUseCase: string;
  deployment: 'cloud' | 'self_hosted' | 'hybrid';
  integrationPriority: 'high' | 'medium' | 'low';
}

export interface AugmentedLoopStep {
  title: 'Understand' | 'Interpret' | 'Reason' | 'Learn' | 'Assure';
  detail: string;
}

export interface AugmentedAISnapshot {
  model: 'augmented_ai_human_centered';
  mode: string;
  steps: AugmentedLoopStep[];
  humanControls: {
    decisionOwnerRequired: boolean;
    approvalOptions: Array<'accept' | 'modify' | 'reject'>;
    assuranceChecks: string[];
  };
}

const TOOL_REGISTRY: AugmentedAITool[] = [
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'developer_augmentation',
    primaryUse: 'Code drafting, refactoring, test generation, and contextual coding assistance.',
    bwUseCase: 'Accelerate feature development across case-study pipelines, document generation, and route logic.',
    deployment: 'cloud',
    integrationPriority: 'high'
  },
  {
    id: 'microsoft-copilot-m365',
    name: 'Microsoft 365 Copilot',
    category: 'document_authoring',
    primaryUse: 'Draft and refine business documents, emails, and executive briefings in Office workflows.',
    bwUseCase: 'Post-process BW-generated reports/letters into stakeholder-ready Word/Outlook outputs.',
    deployment: 'cloud',
    integrationPriority: 'high'
  },
  {
    id: 'google-gemini-workspace',
    name: 'Google Gemini for Workspace',
    category: 'document_authoring',
    primaryUse: 'Collaborative drafting and summarization in Docs/Sheets/Gmail workflows.',
    bwUseCase: 'Team editing and localization of generated case-study and letter drafts.',
    deployment: 'cloud',
    integrationPriority: 'medium'
  },
  {
    id: 'perplexity-enterprise',
    name: 'Perplexity Enterprise',
    category: 'research_intelligence',
    primaryUse: 'Source-grounded research synthesis with citations.',
    bwUseCase: 'Evidence-backed discovery for country, market, policy, and counterpart intelligence.',
    deployment: 'cloud',
    integrationPriority: 'high'
  },
  {
    id: 'elicit',
    name: 'Elicit',
    category: 'research_intelligence',
    primaryUse: 'Structured literature/evidence discovery and extraction.',
    bwUseCase: 'Support defensible evidence tables for reports and policy submissions.',
    deployment: 'cloud',
    integrationPriority: 'medium'
  },
  {
    id: 'langgraph',
    name: 'LangGraph',
    category: 'workflow_orchestration',
    primaryUse: 'Stateful graph execution with autonomous verification checkpoints.',
    bwUseCase: 'Implement autonomous assurance gates for case recommendations and high-impact document actions.',
    deployment: 'self_hosted',
    integrationPriority: 'high'
  },
  {
    id: 'humanloop',
    name: 'Humanloop',
    category: 'quality_assurance',
    primaryUse: 'Human feedback capture, prompt evaluation, and model quality tracking.',
    bwUseCase: 'Track accept/reject/modify feedback on consultant outputs and improve relevance over time.',
    deployment: 'cloud',
    integrationPriority: 'high'
  },
  {
    id: 'promptlayer',
    name: 'PromptLayer',
    category: 'quality_assurance',
    primaryUse: 'Prompt/version observability and response tracing.',
    bwUseCase: 'Audit prompt/response quality for regulated case-study and letter workflows.',
    deployment: 'cloud',
    integrationPriority: 'medium'
  },
  {
    id: 'label-studio',
    name: 'Label Studio',
    category: 'quality_assurance',
    primaryUse: 'Human labeling and review workflows for supervised improvement loops.',
    bwUseCase: 'Create quality benchmarks from high-performing consultant outputs and rejected drafts.',
    deployment: 'self_hosted',
    integrationPriority: 'medium'
  },
  {
    id: 'slack-ai',
    name: 'Slack AI',
    category: 'knowledge_management',
    primaryUse: 'Team knowledge retrieval and conversation summarization.',
    bwUseCase: 'Surface prior case decisions and rationale during live consultant sessions.',
    deployment: 'cloud',
    integrationPriority: 'low'
  },
  {
    id: 'atlassian-intelligence',
    name: 'Atlassian Intelligence',
    category: 'knowledge_management',
    primaryUse: 'Knowledge synthesis across Jira/Confluence workflows.',
    bwUseCase: 'Track delivery tasks from consultant recommendations into implementation workflows.',
    deployment: 'cloud',
    integrationPriority: 'medium'
  },
  {
    id: 'grammarly-business',
    name: 'Grammarly Business',
    category: 'document_authoring',
    primaryUse: 'Tone, clarity, and consistency enhancement for formal writing.',
    bwUseCase: 'Final pass on executive letters, board briefs, and external submissions.',
    deployment: 'cloud',
    integrationPriority: 'medium'
  }
];

const MODE_TOOL_PRIORITY: Record<string, AugmentedToolCategory[]> = {
  analysis: ['research_intelligence', 'quality_assurance', 'knowledge_management'],
  case_study: ['workflow_orchestration', 'research_intelligence', 'document_authoring'],
  document_development: ['document_authoring', 'quality_assurance', 'knowledge_management'],
  gap_fill: ['workflow_orchestration', 'quality_assurance', 'research_intelligence'],
  general_help: ['document_authoring', 'research_intelligence', 'developer_augmentation']
};

const severitySummary = (critical: number, high: number, medium: number): string => {
  return `${critical} critical, ${high} high, ${medium} medium`; 
};

export const getAugmentedAITools = (category?: AugmentedToolCategory): AugmentedAITool[] => {
  if (!category) return TOOL_REGISTRY;
  return TOOL_REGISTRY.filter((tool) => tool.category === category);
};

export const getRecommendedAugmentedToolsForMode = (mode: string): AugmentedAITool[] => {
  const preferred = MODE_TOOL_PRIORITY[mode] || MODE_TOOL_PRIORITY.general_help;
  const scored = TOOL_REGISTRY
    .map((tool) => ({
      tool,
      score: (preferred.includes(tool.category) ? 3 : 0)
        + (tool.integrationPriority === 'high' ? 2 : tool.integrationPriority === 'medium' ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.tool);

  return scored.slice(0, 6);
};

export const buildAugmentedAISnapshot = (
  profile: ConsultantCapabilityProfile
): AugmentedAISnapshot => {
  const critical = profile.gaps.filter((gap) => gap.severity === 'critical').length;
  const high = profile.gaps.filter((gap) => gap.severity === 'high').length;
  const medium = profile.gaps.filter((gap) => gap.severity === 'medium').length;

  const topGap = profile.gaps[0]?.question || 'No immediate blocking gaps identified.';
  const decisionContext = profile.signals.decision || 'Decision context still emerging from user input.';

  return {
    model: 'augmented_ai_human_centered',
    mode: profile.mode,
    steps: [
      {
        title: 'Understand',
        detail: `Ingested case signals from user/context with gap profile: ${severitySummary(critical, high, medium)}.`
      },
      {
        title: 'Interpret',
        detail: `Interpreted user intent as '${profile.mode}' and mapped evidence/constraints for this decision context: ${decisionContext}`
      },
      {
        title: 'Reason',
        detail: `Generated next-best-action guidance and document/case recommendations with focus on top gap: ${topGap}`
      },
      {
        title: 'Learn',
        detail: 'The system stores outcome signals and recommendation feedback to improve future relevance without blocking execution.'
      },
      {
        title: 'Assure',
        detail: 'Ethics, compliance, and contextual checks run as autonomous gates before execution; user-facing checkpoints occur only when explicitly requested.'
      }
    ],
    humanControls: {
      decisionOwnerRequired: true,
      approvalOptions: ['accept', 'modify', 'reject'],
      assuranceChecks: [
        'Regulatory and jurisdiction fit',
        'Evidence traceability and source quality',
        'Stakeholder impact and reputational risk',
        'Execution feasibility versus timeline and constraints'
      ]
    }
  };
};
