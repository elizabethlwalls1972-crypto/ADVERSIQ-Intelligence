/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * RELOCATION PATHWAY ENGINE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Turns a vague "we want to expand overseas" into a concrete 90-day action plan
 * with milestones, dependencies, risk gates, and owner assignments.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface PathwayMilestone {
  id: string;
  phase: 'pre-decision' | 'entity-setup' | 'operational-launch' | 'steady-state';
  title: string;
  description: string;
  dayRange: [number, number]; // [start, end] relative to project start
  owner: string;
  dependencies: string[]; // ids of prerequisite milestones
  riskLevel: 'low' | 'medium' | 'high';
  deliverables: string[];
}

export interface PathwayRequest {
  originCountry: string;
  targetCountry: string;
  companySize: 'startup' | 'sme' | 'enterprise';
  industry: string;
  functionsToRelocate: string[];
  headcountTarget: number;
  urgency: 'standard' | 'accelerated' | 'urgent';
}

export interface RelocationPathway {
  id: string;
  name: string;
  originCountry: string;
  targetCountry: string;
  totalDurationDays: number;
  phases: Array<{
    name: string;
    dayRange: [number, number];
    milestones: PathwayMilestone[];
  }>;
  criticalPath: string[];
  riskGates: Array<{ milestone: string; gate: string; failAction: string }>;
  estimatedCost: { currency: string; low: number; high: number; breakdown: Record<string, number> };
  regulatoryRequirements: string[];
  timeline: string; // human-readable summary
}

// â"€â"€â"€ Milestone Templates â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const PRE_DECISION_MILESTONES: PathwayMilestone[] = [
  { id: 'pd-1', phase: 'pre-decision', title: 'Stakeholder Alignment Workshop', description: 'Align leadership on objectives, budget, timeline, and success criteria for the relocation.', dayRange: [1, 5], owner: 'CEO / Board', dependencies: [], riskLevel: 'medium', deliverables: ['Signed project charter', 'Budget approval', 'Success metrics defined'] },
  { id: 'pd-2', phase: 'pre-decision', title: 'Location Shortlist Analysis', description: 'Use NSIL intelligence to evaluate 3-5 target locations against weighted criteria.', dayRange: [3, 12], owner: 'Strategy Lead', dependencies: ['pd-1'], riskLevel: 'low', deliverables: ['Location scoring matrix', 'Site visit schedule', 'Risk assessment per location'] },
  { id: 'pd-3', phase: 'pre-decision', title: 'Site Visit & Ground-Truth Validation', description: 'Physical visit to top 2 locations. Meet government officials, inspect sites, interview local workforce.', dayRange: [13, 20], owner: 'Ops Director + Legal', dependencies: ['pd-2'], riskLevel: 'medium', deliverables: ['Site visit report', 'Ground-truth validation', 'Local contact list'] },
  { id: 'pd-4', phase: 'pre-decision', title: 'Final Location Decision', description: 'Board-level decision on target location with signed commitment and budget allocation.', dayRange: [21, 25], owner: 'Board', dependencies: ['pd-3'], riskLevel: 'high', deliverables: ['Board resolution', 'Budget commitment', 'Project timeline approved'] },
];

const ENTITY_SETUP_MILESTONES: PathwayMilestone[] = [
  { id: 'es-1', phase: 'entity-setup', title: 'Legal Entity Registration', description: 'Register local subsidiary/branch with relevant government agencies. Engage local legal counsel.', dayRange: [26, 40], owner: 'Legal Counsel', dependencies: ['pd-4'], riskLevel: 'medium', deliverables: ['Company registration certificate', 'Tax registration', 'Legal opinion'] },
  { id: 'es-2', phase: 'entity-setup', title: 'Incentive & Tax Application', description: 'Apply for investment incentives (e.g., PEZA, BOI, SEZ benefits). Submit required documentation.', dayRange: [30, 50], owner: 'Finance Director', dependencies: ['es-1'], riskLevel: 'medium', deliverables: ['Incentive application', 'Projected savings model', 'Compliance requirements'] },
  { id: 'es-3', phase: 'entity-setup', title: 'Office / Site Procurement', description: 'Secure office space or industrial site. Negotiate lease terms. Arrange fit-out.', dayRange: [35, 55], owner: 'Facilities Manager', dependencies: ['es-1'], riskLevel: 'low', deliverables: ['Signed lease', 'Fit-out plan', 'IT infrastructure design'] },
  { id: 'es-4', phase: 'entity-setup', title: 'Banking & Financial Setup', description: 'Open local bank accounts. Set up payroll, payment systems, and transfer channels.', dayRange: [35, 50], owner: 'Finance Director', dependencies: ['es-1'], riskLevel: 'low', deliverables: ['Bank accounts opened', 'Payroll system configured', 'FX arrangements'] },
];

const OPERATIONAL_LAUNCH_MILESTONES: PathwayMilestone[] = [
  { id: 'ol-1', phase: 'operational-launch', title: 'Core Team Recruitment', description: 'Hire initial team: country manager, HR lead, technical leads. Begin broader recruitment.', dayRange: [45, 65], owner: 'HR Director', dependencies: ['es-3'], riskLevel: 'high', deliverables: ['Key hires signed', 'Recruitment pipeline active', 'Onboarding plan'] },
  { id: 'ol-2', phase: 'operational-launch', title: 'IT & Infrastructure Setup', description: 'Deploy IT systems, network, security, cloud access. Ensure connectivity to home office.', dayRange: [55, 70], owner: 'IT Director', dependencies: ['es-3'], riskLevel: 'medium', deliverables: ['Systems live', 'Security audit passed', 'VPN/connectivity tested'] },
  { id: 'ol-3', phase: 'operational-launch', title: 'Compliance & Regulatory Clearance', description: 'Obtain all operational permits, health & safety certification, data protection registration.', dayRange: [50, 70], owner: 'Compliance Officer', dependencies: ['es-1', 'es-3'], riskLevel: 'high', deliverables: ['Operating permits', 'H&S certificate', 'Data protection registration'] },
  { id: 'ol-4', phase: 'operational-launch', title: 'Soft Launch (Pilot Operations)', description: 'Begin operations with initial team. Run pilot processes. Gather feedback.', dayRange: [70, 80], owner: 'Country Manager', dependencies: ['ol-1', 'ol-2', 'ol-3'], riskLevel: 'medium', deliverables: ['Pilot operations report', 'Process feedback', 'Scaling readiness assessment'] },
];

const STEADY_STATE_MILESTONES: PathwayMilestone[] = [
  { id: 'ss-1', phase: 'steady-state', title: 'Full Operations Launch', description: 'Scale to target headcount. Full operational cadence. KPI tracking initiated.', dayRange: [80, 90], owner: 'Country Manager', dependencies: ['ol-4'], riskLevel: 'medium', deliverables: ['Full team onboarded', 'KPI dashboard live', 'Operational SLA active'] },
  { id: 'ss-2', phase: 'steady-state', title: '90-Day Review & Optimization', description: 'Comprehensive review of operations, costs, quality, and team performance. Adjust plan.', dayRange: [85, 95], owner: 'CEO + Country Manager', dependencies: ['ss-1'], riskLevel: 'low', deliverables: ['90-day review report', 'Optimization recommendations', 'Year 1 projection update'] },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class RelocationPathwayEngine {

  /** Generate a full relocation pathway for a given request */
  static generate(req: PathwayRequest): RelocationPathway {
    const speedMultiplier = req.urgency === 'urgent' ? 0.6 : req.urgency === 'accelerated' ? 0.8 : 1.0;
    const sizeComplexity = req.companySize === 'enterprise' ? 1.3 : req.companySize === 'sme' ? 1.0 : 0.8;

    const adjustDay = (d: number) => Math.round(d * speedMultiplier * sizeComplexity);
    const adjustRange = (r: [number, number]): [number, number] => [adjustDay(r[0]), adjustDay(r[1])];

    const adjustMilestone = (m: PathwayMilestone): PathwayMilestone => ({ ...m, dayRange: adjustRange(m.dayRange) });

    const phases = [
      { name: 'Pre-Decision & Due Diligence', milestones: PRE_DECISION_MILESTONES.map(adjustMilestone) },
      { name: 'Entity & Legal Setup', milestones: ENTITY_SETUP_MILESTONES.map(adjustMilestone) },
      { name: 'Operational Launch', milestones: OPERATIONAL_LAUNCH_MILESTONES.map(adjustMilestone) },
      { name: 'Steady State & Optimization', milestones: STEADY_STATE_MILESTONES.map(adjustMilestone) },
    ].map(p => ({ ...p, dayRange: [p.milestones[0].dayRange[0], p.milestones[p.milestones.length - 1].dayRange[1]] as [number, number] }));

    const lastDay = phases[phases.length - 1].dayRange[1];

    const criticalPath = ['pd-1', 'pd-2', 'pd-3', 'pd-4', 'es-1', 'es-3', 'ol-1', 'ol-4', 'ss-1'];
    const riskGates = [
      { milestone: 'pd-4', gate: 'Board must approve budget before entity setup begins', failAction: 'Pause project. Escalate to board chair.' },
      { milestone: 'es-1', gate: 'Legal entity registration must complete before hiring', failAction: 'Use EOR (Employer of Record) as interim bridge.' },
      { milestone: 'ol-3', gate: 'All permits must be obtained before operations start', failAction: 'Delay launch. Engage expediter.' },
    ];

    const baseCost = req.headcountTarget * (req.companySize === 'enterprise' ? 15000 : 10000);
    const estimatedCost = {
      currency: 'USD',
      low: Math.round(baseCost * 0.7),
      high: Math.round(baseCost * 1.4),
      breakdown: {
        legalAndRegistration: Math.round(baseCost * 0.08),
        officeAndFitout: Math.round(baseCost * 0.25),
        recruitment: Math.round(baseCost * 0.15),
        itInfrastructure: Math.round(baseCost * 0.12),
        travelAndSiteVisits: Math.round(baseCost * 0.05),
        contingency: Math.round(baseCost * 0.15),
        salariesFirst3Months: Math.round(baseCost * 0.20),
      },
    };

    const regulatoryRequirements = this.getRegulatory(req.targetCountry);

    return {
      id: `pathway-${req.originCountry}-${req.targetCountry}-${Date.now()}`,
      name: `${req.originCountry} â†' ${req.targetCountry} Relocation Pathway (${req.urgency})`,
      originCountry: req.originCountry,
      targetCountry: req.targetCountry,
      totalDurationDays: lastDay,
      phases,
      criticalPath,
      riskGates,
      estimatedCost,
      regulatoryRequirements,
      timeline: `${lastDay}-day pathway from ${req.originCountry} to ${req.targetCountry}. ${phases.length} phases, ${phases.reduce((s, p) => s + p.milestones.length, 0)} milestones. Estimated cost: $${estimatedCost.low.toLocaleString()}-$${estimatedCost.high.toLocaleString()} USD.`,
    };
  }

  /** Get regulatory requirements for a target country */
  private static getRegulatory(country: string): string[] {
    const regs: Record<string, string[]> = {
      'Philippines': [
        'SEC registration for foreign corporation',
        'PEZA or BOI registration for tax incentives',
        'Mayor\'s permit and business permit from LGU',
        'BIR (Bureau of Internal Revenue) registration',
        'SSS, PhilHealth, Pag-IBIG employer registration',
        'Special Investor Resident Visa (SIRV) for key personnel',
        'Data Privacy Act registration with NPC',
      ],
      'Australia': [
        'ASIC company registration (ACN/ABN)',
        'FIRB (Foreign Investment Review Board) approval if applicable',
        'State business license and council permits',
        'Tax file number and GST registration with ATO',
        'Superannuation fund registration',
        'Work visa sponsorship (subclass 482/494)',
        'Privacy Act compliance and data sovereignty',
      ],
      'Singapore': [
        'ACRA company registration',
        'EDB engagement for potential incentives',
        'Employment Pass applications for foreign staff',
        'CPF employer registration',
        'PDPA compliance',
        'Relevant sector licenses (MAS for finance, IMDA for telecom)',
      ],
      'Vietnam': [
        'Investment Registration Certificate (IRC)',
        'Enterprise Registration Certificate (ERC)',
        'Work permits for foreign employees',
        'Tax registration with General Dept of Taxation',
        'Social insurance registration',
        'Environmental impact assessment if manufacturing',
      ],
    };
    return regs[country] || [
      `Business registration with ${country} corporate registry`,
      'Tax registration with local revenue authority',
      'Work authorization for foreign personnel',
      'Local employment law compliance',
      'Data protection registration if applicable',
    ];
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(req: PathwayRequest): string {
    const pathway = this.generate(req);
    const lines: string[] = [`\n### â"€â"€ RELOCATION PATHWAY: ${pathway.name} â"€â"€`];
    lines.push(`**Duration:** ${pathway.totalDurationDays} days | **Cost:** $${pathway.estimatedCost.low.toLocaleString()}-$${pathway.estimatedCost.high.toLocaleString()}`);
    for (const phase of pathway.phases) {
      lines.push(`\n**${phase.name}** (Days ${phase.dayRange[0]}-${phase.dayRange[1]}):`);
      for (const m of phase.milestones) {
        lines.push(`  ${m.riskLevel === 'high' ? 'ðŸ"´' : m.riskLevel === 'medium' ? 'ðŸŸ¡' : 'ðŸŸ¢'} ${m.title} [${m.owner}] Days ${m.dayRange[0]}-${m.dayRange[1]}`);
      }
    }
    lines.push(`\n**Risk Gates:** ${pathway.riskGates.map(g => g.gate).join(' | ')}`);
    lines.push(`**Regulatory:** ${pathway.regulatoryRequirements.slice(0, 4).join(', ')}`);
    return lines.join('\n');
  }
}
