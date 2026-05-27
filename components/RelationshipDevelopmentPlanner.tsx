import React, { useState } from 'react';
import { Users, Calendar, Zap, MessageCircle, Target, CheckCircle, AlertCircle, Clock, Handshake } from 'lucide-react';

interface RelationshipPhase {
  phase: number;
  title: string;
  duration: string;
  goals: string[];
  actions: string[];
  successMetrics: string[];
}

interface NegotiationPlaybook {
  stage: string;
  objective: string;
  tactics: string[];
  redFlags: string[];
  bestPractices: string[];
}

interface RelationshipDevelopmentPlannerProps {
  partnerName?: string;
  targetCountry?: string;
  dealValue?: number;
}

const RelationshipDevelopmentPlanner: React.FC<RelationshipDevelopmentPlannerProps> = ({
  partnerName = 'Strategic Partner',
  targetCountry = 'Target Market',
  dealValue = 50000000
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    phases: true,
    playbook: true,
    decisionMaking: false,
    cultural: false,
    timeline: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const relationshipPhases: RelationshipPhase[] = [
    {
      phase: 1,
      title: 'Discovery & Relationship Foundation',
      duration: 'Months 1-3',
      goals: [
        'Establish initial relationship with partner',
        'Build personal rapport with key stakeholders',
        'Understand partner\'s business model and priorities',
        'Identify decision-makers and influencers'
      ],
      actions: [
        'Schedule initial in-person meeting (2-3 days on-site)',
        'Conduct structured discovery interviews with 5-8 key contacts',
        'Share company overview and strategic vision',
        'Identify common interests and mutual value creation areas',
        'Exchange contact information and establish communication cadence'
      ],
      successMetrics: [
        'In-person meeting conducted',
        '5+ key stakeholders identified',
        'Weekly communication established',
        'Mutual interest in partnership confirmed'
      ]
    },
    {
      phase: 2,
      title: 'Deep Due Diligence & Trust Building',
      duration: 'Months 4-6',
      goals: [
        'Conduct comprehensive operational due diligence',
        'Validate partner capabilities and financial stability',
        'Build deeper personal relationships',
        'Identify potential pain points and synergies'
      ],
      actions: [
        'Request detailed financial statements and performance data',
        'Visit partner operations and meet management teams',
        'Host partner team at your headquarters',
        'Conduct reference calls with other partners',
        'Prepare preliminary term sheet outline',
        'Establish working groups for key functional areas'
      ],
      successMetrics: [
        'Financial data reviewed and validated',
        'Operational site visits completed',
        'Reference checks completed',
        'Trust level elevated based on initial findings'
      ]
    },
    {
      phase: 3,
      title: 'Commercial Alignment & Negotiation',
      duration: 'Months 7-12',
      goals: [
        'Align on commercial terms and deal structure',
        'Navigate differences and reach mutual agreement',
        'Prepare binding agreements',
        'Plan for transition and integration'
      ],
      actions: [
        'Conduct commercial negotiation workshops',
        'Share financial models and projections',
        'Escalate to C-level executives for final alignment',
        'Work with legal teams on term sheet and MOU',
        'Establish integration planning committee',
        'Plan executive signing ceremony'
      ],
      successMetrics: [
        'Term sheet agreed in principle',
        'MOU signed',
        'All key terms resolved',
        'Boards pre-approved structure'
      ]
    },
    {
      phase: 4,
      title: 'Formalization & Launch Preparation',
      duration: 'Months 13-18',
      goals: [
        'Finalize all legal documentation',
        'Secure regulatory approvals',
        'Assemble and mobilize teams',
        'Prepare for day 1 operations'
      ],
      actions: [
        'Complete legal documentation with counsel',
        'Submit regulatory filings and approvals',
        'Hire core leadership team',
        'Establish integration team structures',
        'Conduct joint board meeting',
        'Plan launch communications and press release'
      ],
      successMetrics: [
        'Final agreements signed',
        'Regulatory approvals received',
        'Leadership team in place',
        'First 100-day plan finalized'
      ]
    },
    {
      phase: 5,
      title: 'Operations Ramp & Relationship Stabilization',
      duration: 'Months 19-30',
      goals: [
        'Successfully launch operations',
        'Hit initial milestones',
        'Stabilize partnership dynamic',
        'Build long-term relationship foundation'
      ],
      actions: [
        'Execute first 100-day plan',
        'Achieve initial revenue targets',
        'Resolve operational issues quickly',
        'Hold monthly exec steering committee meetings',
        'Schedule quarterly partnership reviews',
        'Address conflicts through established governance'
      ],
      successMetrics: [
        'Operations launched on schedule',
        'Initial revenue targets met',
        'Team alignment strong',
        'Partnership satisfaction score > 8/10'
      ]
    }
  ];

  const negotiationPlaybook: NegotiationPlaybook[] = [
    {
      stage: 'Pre-Negotiation',
      objective: 'Establish positions and expectations',
      tactics: [
        'Research partner extensively (financials, culture, prior deals)',
        'Prepare BATNA (Best Alternative to Negotiated Agreement)',
        'Set internal negotiation boundaries and limits',
        'Identify partner\'s likely priorities and constraints',
        'Plan for escalation paths if needed'
      ],
      redFlags: [
        'Partner unwilling to share basic financial information',
        'Unclear decision-making authority',
        'Aggressive deadline pressure early on',
        'Refusal to engage in good-faith discussions'
      ],
      bestPractices: [
        'Know your walk-away point before negotiations',
        'Be transparent about your priorities',
        'Establish mutual ground rules for negotiation',
        'Create comfortable meeting environment'
      ]
    },
    {
      stage: 'Initial Negotiation',
      objective: 'Present positions and identify gaps',
      tactics: [
        'Present your view with supporting rationale',
        'Listen carefully to partner\'s position',
        'Ask clarifying questions without judgment',
        'Identify areas of agreement first',
        'Document positions in writing for clarity'
      ],
      redFlags: [
        'Partner takes extreme positions with no flexibility',
        'Personal attacks or emotional reactions',
        'Sudden changes in partner\'s legal representation',
        'Attempts to isolate you from support team'
      ],
      bestPractices: [
        'Focus on interests, not positions',
        'Assume good faith unless proven otherwise',
        'Keep negotiations cordial and professional',
        'Break into smaller working groups for specific topics'
      ]
    },
    {
      stage: 'Bridging Disagreements',
      objective: 'Find creative solutions to differences',
      tactics: [
        'Separate people from problems',
        'Look for win-win solutions (expand pie, not just divide)',
        'Use objective criteria to evaluate proposals',
        'Bring in neutral third party if stuck',
        'Take breaks and reflect on progress'
      ],
      redFlags: [
        'Negotiation is becoming positional/combative',
        'Personal relationships deteriorating',
        'Unilateral ultimatums being issued',
        'Key stakeholders refusing to engage'
      ],
      bestPractices: [
        'Generate multiple options before settling',
        'Use objective standards (market rates, historical precedent)',
        'Be willing to move on some issues to gain concessions elsewhere',
        'Celebrate small agreements and build momentum'
      ]
    },
    {
      stage: 'Finalizing Agreement',
      objective: 'Lock in terms and prepare for execution',
      tactics: [
        'Prepare written term sheet documenting all agreements',
        'Review with legal counsel for enforceability',
        'Get board/executive approvals on both sides',
        'Plan signing ceremony and public announcement',
        'Establish post-signing communication plan'
      ],
      redFlags: [
        'Partner trying to re-open settled terms',
        'Gaps between verbal agreements and written terms',
        'Lack of board support on partner side',
        'Key personnel changes at partner organization'
      ],
      bestPractices: [
        'Document every agreement in writing immediately',
        'Exchange drafts regularly to avoid surprises',
        'Get executive alignment before legal drafting',
        'Plan for contingencies if signing is delayed'
      ]
    }
  ];

  const decisionMakingProfiles = [
    {
      country: targetCountry,
      style: 'Consensus-Driven',
      description: 'Decisions made through group discussion; individual autonomy balanced with collective agreement',
      approach: [
        'Allow time for internal consultation',
        'Present options, not ultimatums',
        'Respect the group process',
        'Avoid putting decision-maker in position of losing face'
      ]
    },
    {
      country: 'Alternative Style',
      style: 'Hierarchical',
      description: 'Decision authority concentrated at top; lower levels implement decisions',
      approach: [
        'Identify and focus on the actual decision-maker',
        'Respect chain of command',
        'Provide clear information up the hierarchy',
        'Get buy-in from top authority'
      ]
    }
  ];

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Relationship Development Planner
          </h2>
          <p className="text-stone-600">Strategic guide for building and nurturing partnership with {partnerName}</p>
        </div>

        {/* 5-PHASE ROADMAP */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('phases')}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              5-Phase Relationship Development Timeline
            </h3>
            <div className="text-2xl">{expandedSections.phases ? '▾' : '▸'}</div>
          </div>

          {expandedSections.phases && (
            <div className="p-6 space-y-4">
              {relationshipPhases.map((phase, idx) => (
                <button
                  key={phase.phase}
                  onClick={() => setSelectedPhase(phase.phase)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPhase === phase.phase
                      ? 'bg-blue-50 border-blue-400 shadow-md'
                      : 'bg-stone-50 border-stone-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-stone-900">Phase {phase.phase}: {phase.title}</h4>
                      <p className="text-xs text-stone-600">{phase.duration}</p>
                    </div>
                    <div className="text-2xl font-black text-blue-600">{phase.phase}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SELECTED PHASE DETAIL */}
        {selectedPhase && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="text-2xl font-bold text-stone-900 mb-1">
                Phase {relationshipPhases[selectedPhase - 1]?.phase}: {relationshipPhases[selectedPhase - 1]?.title}
              </h3>
              <p className="text-stone-600">{relationshipPhases[selectedPhase - 1]?.duration}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Phase Goals
                  </h4>
                  <ul className="space-y-2">
                    {relationshipPhases[selectedPhase - 1]?.goals.map((goal, idx) => (
                      <li key={idx} className="text-sm text-stone-700 pl-4 relative">
                        <span className="absolute left-0 text-green-600 font-bold">✓</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Success Metrics
                  </h4>
                  <ul className="space-y-2">
                    {relationshipPhases[selectedPhase - 1]?.successMetrics.map((metric, idx) => (
                      <li key={idx} className="text-sm text-stone-700 pl-4 relative">
                        <span className="absolute left-0 text-blue-600 font-bold">•</span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Key Actions for This Phase
              </h4>
              <ul className="space-y-2">
                {relationshipPhases[selectedPhase - 1]?.actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-blue-800 pl-4 relative">
                    <span className="absolute left-0 font-bold">{idx + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* NEGOTIATION PLAYBOOK */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('playbook')}
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-purple-600" />
              Negotiation Playbook
            </h3>
            <div className="text-2xl">{expandedSections.playbook ? '▾' : '▸'}</div>
          </div>

          {expandedSections.playbook && (
            <div className="p-6 space-y-6">
              {negotiationPlaybook.map((play, idx) => (
                <div key={idx} className="border-b border-stone-200 last:border-b-0 pb-6 last:pb-0 space-y-4">
                  <h4 className="text-lg font-bold text-stone-900">{play.stage}</h4>
                  <p className="text-sm text-stone-700 font-bold">Objective: {play.objective}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold text-stone-900 mb-2 text-sm">Tactics:</div>
                      <ul className="space-y-1">
                        {play.tactics.map((tactic, i) => (
                          <li key={i} className="text-xs text-stone-700 pl-3 relative">
                            <span className="absolute left-0">*</span> {tactic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-stone-900 mb-2 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Red Flags:
                      </div>
                      <ul className="space-y-1">
                        {play.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-red-700 pl-3 relative">
                            <span className="absolute left-0">⚠ </span> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-bold text-green-900 mb-2 text-sm">✓ Best Practices:</div>
                    <ul className="space-y-1">
                      {play.bestPractices.map((practice, i) => (
                        <li key={i} className="text-xs text-green-800">* {practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DECISION-MAKING CONTEXT */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('decisionMaking')}
        >
          <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              Decision-Making Styles & Approach
            </h3>
            <div className="text-2xl">{expandedSections.decisionMaking ? '▾' : '▸'}</div>
          </div>

          {expandedSections.decisionMaking && (
            <div className="p-6 space-y-4">
              {decisionMakingProfiles.map((profile, idx) => (
                <div key={idx} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">{profile.country}: {profile.style}</h4>
                  <p className="text-sm text-orange-800 mb-3">{profile.description}</p>
                  <div className="text-xs text-orange-800 space-y-1">
                    {profile.approach.map((tip, i) => (
                      <div key={i} className="pl-3 relative">
                        <span className="absolute left-0">•</span> {tip}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMMUNICATION TIMELINE */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('timeline')}
        >
          <div className="p-6 bg-gradient-to-r from-teal-50 to-green-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Communication & Engagement Timeline
            </h3>
            <div className="text-2xl">{expandedSections.timeline ? '▾' : '▸'}</div>
          </div>

          {expandedSections.timeline && (
            <div className="p-6">
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 text-sm mb-1">Weekly</div>
                  <p className="text-xs text-teal-800">Executive-to-executive sync call (30 mins)</p>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 text-sm mb-1">Bi-Weekly</div>
                  <p className="text-xs text-teal-800">Functional working group meetings (finance, ops, legal)</p>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 text-sm mb-1">Monthly</div>
                  <p className="text-xs text-teal-800">Steering committee meeting with full leadership team</p>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 text-sm mb-1">Quarterly</div>
                  <p className="text-xs text-teal-800">Board-level update and strategic review</p>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 text-sm mb-1">As-Needed</div>
                  <p className="text-xs text-teal-800">Issue resolution calls, escalation management</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RelationshipDevelopmentPlanner;

