export type ConsultantCapabilityMode = 'analysis' | 'case_study' | 'document_development' | 'gap_fill' | 'general_help';

export interface ConsultantCaseSignals {
  decisionOwner: string;
  organization: string;
  role: string;
  country: string;
  jurisdiction: string;
  objective: string;
  decision: string;
  deadline: string;
  audience: string;
  constraints: string;
  evidence: string;
}

export interface ConsultantGap {
  key: keyof ConsultantCaseSignals;
  label: string;
  severity: 'critical' | 'high' | 'medium';
  question: string;
}

export interface ConsultantCapabilityProfile {
  mode: ConsultantCapabilityMode;
  signals: ConsultantCaseSignals;
  gaps: ConsultantGap[];
  capabilityTags: string[];
  brief: string;
}

const EMPTY_SIGNALS: ConsultantCaseSignals = {
  decisionOwner: '',
  organization: '',
  role: '',
  country: '',
  jurisdiction: '',
  objective: '',
  decision: '',
  deadline: '',
  audience: '',
  constraints: '',
  evidence: ''
};

const toContextObject = (context: unknown): Record<string, unknown> => {
  return context && typeof context === 'object' ? (context as Record<string, unknown>) : {};
};

const getCaseStudyContext = (context: unknown): Record<string, unknown> => {
  const root = toContextObject(context);
  const caseStudy = root.caseStudy;
  return caseStudy && typeof caseStudy === 'object' ? (caseStudy as Record<string, unknown>) : {};
};

const asText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const firstNonEmpty = (...values: Array<unknown>): string => {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return '';
};

const cleanOrganizationText = (value: string): string => {
  return value
    .split(/\.(?=\s|$)/)[0]
    .split(/\b(objective|goal|deadline|audience|decision)\b/i)[0]
    .trim();
};

export const detectConsultantCapabilityMode = (message: string): ConsultantCapabilityMode => {
  const text = message.toLowerCase();

  if (/\b(case study|case file|case pack|full case)\b/.test(text)) return 'case_study';
  if (/\b(document|letter|brief|memo|report|draft|submission)\b/.test(text)) return 'document_development';
  if (/\b(fill in the gaps|gap|missing info|what is missing|complete this)\b/.test(text)) return 'gap_fill';
  if (/\b(analy[sz]e|analysis|evaluate|assess|compare|trade-off|scenario)\b/.test(text)) return 'analysis';

  return 'general_help';
};

export const extractConsultantCaseSignals = (message: string, context?: unknown): ConsultantCaseSignals => {
  const caseStudy = getCaseStudyContext(context);
  const messageText = message.trim();

  const decisionOwner = firstNonEmpty(
    caseStudy.userName,
    messageText.match(/\b(?:my name is|i am|i'm)\s+([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,2})\b/i)?.[1]
  );

  const organization = firstNonEmpty(
    caseStudy.organizationName,
    messageText.match(/\b(?:organization|organisation|company|agency|institution|we are|i represent|from)\s*(?:is|:)?\s*([A-Z][A-Za-z0-9&.,\-\s]{2,80})\b/i)?.[1]
  );

  const role = firstNonEmpty(
    caseStudy.contactRole,
    messageText.match(/\b(?:role|position|title|i am the|i serve as)\s*(?:is|:)?\s*([A-Za-z\-/\s]{3,60})\b/i)?.[1]
  );

  const country = firstNonEmpty(
    caseStudy.country,
    messageText.match(/\b(?:country|in|from|operating in)\s+([A-Z][A-Za-z\s]{2,40})\b/i)?.[1]
  );

  const jurisdiction = firstNonEmpty(
    caseStudy.jurisdiction,
    messageText.match(/\b(?:jurisdiction|regulatory regime|legal framework)\s*(?:is|:)?\s*([A-Za-z\-/\s]{3,60})\b/i)?.[1],
    country
  );

  const objective = firstNonEmpty(
    caseStudy.objectives,
    messageText.match(/\b(?:objective|goal|we aim to|we want to|target is)\s*(?:is|:)?\s*([^\n.]{12,240})/i)?.[1]
  );

  const decision = firstNonEmpty(
    caseStudy.currentMatter,
    messageText.length >= 50 ? messageText : ''
  );

  const deadline = firstNonEmpty(
    caseStudy.decisionDeadline,
    messageText.match(/\b(?:deadline|due|by|before|timeline)\s*[:-]?\s*([^\n.]{3,80})/i)?.[1]
  );

  const audience = firstNonEmpty(
    caseStudy.targetAudience,
    messageText.match(/\b(?:audience|for|to)\s+(board|investors?|regulator[s]?|ministry|government|partners?|community|executive team)\b/i)?.[1]
  );

  const constraints = firstNonEmpty(
    caseStudy.constraints,
    /\b(constraint|budget|resource|legal|compliance|timeline|risk)\b/i.test(messageText) ? messageText : ''
  );

  const evidence = firstNonEmpty(
    Array.isArray(caseStudy.uploadedDocuments) ? String((caseStudy.uploadedDocuments as unknown[]).length > 0 ? 'Uploaded documents provided' : '') : '',
    /\b(evidence|source|annex|attachment|dataset|kpi|metric|http|www\.)\b/i.test(messageText) ? 'Evidence indicators provided in user text' : ''
  );

  return {
    ...EMPTY_SIGNALS,
    decisionOwner,
    organization: cleanOrganizationText(organization),
    role,
    country,
    jurisdiction,
    objective,
    decision,
    deadline,
    audience,
    constraints,
    evidence
  };
};

export const identifyConsultantGaps = (signals: ConsultantCaseSignals): ConsultantGap[] => {
  const gapMatrix: ConsultantGap[] = [
    {
      key: 'organization',
      label: 'Decision owner and organization',
      severity: 'critical',
      question: 'Who is making this decision, and which organization do they represent?'
    },
    {
      key: 'country',
      label: 'Country and jurisdiction',
      severity: 'critical',
      question: 'Which country and legal/regulatory jurisdiction should this follow?'
    },
    {
      key: 'objective',
      label: 'Outcome objective',
      severity: 'critical',
      question: 'What exact outcome are you trying to achieve, and how is success measured?'
    },
    {
      key: 'decision',
      label: 'Decision context and stakes',
      severity: 'high',
      question: 'What decision must be made now, and what happens if it is delayed or wrong?'
    },
    {
      key: 'deadline',
      label: 'Timeline/deadline',
      severity: 'high',
      question: 'What is the deadline for this decision or deliverable?'
    },
    {
      key: 'audience',
      label: 'Primary decision audience',
      severity: 'high',
      question: 'Who is the final audience (board, ministry, investor, regulator, partner)?'
    },
    {
      key: 'evidence',
      label: 'Evidence baseline',
      severity: 'medium',
      question: 'What evidence, documents, or data points should the case rely on?'
    }
  ];

  return gapMatrix.filter((gap) => !signals[gap.key] || signals[gap.key].length < (gap.key === 'decision' ? 40 : 3));
};

const buildModeDevelopmentGuide = (mode: ConsultantCapabilityMode): string => {
  switch (mode) {
    case 'analysis':
      return 'Deliver deep analysis from provided text: assumptions, options, risks, trade-offs, and a recommended path.';
    case 'case_study':
      return 'Build/expand a full case study structure: context, stakeholders, problem framing, options, recommendation, implementation, risk, and evidence traceability.';
    case 'document_development':
      return 'Develop document-ready outputs: outline, section content, executive summary, and send-ready drafts where requested.';
    case 'gap_fill':
      return 'Fill missing case fields with clearly-labeled assumptions and ask one highest-value question to close the biggest gap.';
    default:
      return 'Help naturally while still upgrading the case profile in the background from user-provided information.';
  }
};

const toSignalLine = (label: string, value: string): string => `- ${label}: ${value || 'Missing'}`;

export const deriveConsultantCapabilityProfile = (
  message: string,
  context?: unknown
): ConsultantCapabilityProfile => {
  const mode = detectConsultantCapabilityMode(message);
  const signals = extractConsultantCaseSignals(message, context);
  const gaps = identifyConsultantGaps(signals);
  const capabilityTags = [mode, gaps.length > 0 ? 'gap-aware' : 'gap-satisfied', signals.evidence ? 'evidence-aware' : 'evidence-missing'];

  const knownSignals = [
    toSignalLine('Decision owner', signals.decisionOwner),
    toSignalLine('Organization', signals.organization),
    toSignalLine('Country/Jurisdiction', [signals.country, signals.jurisdiction].filter(Boolean).join(' / ')),
    toSignalLine('Objective', signals.objective),
    toSignalLine('Decision context', signals.decision),
    toSignalLine('Deadline', signals.deadline),
    toSignalLine('Audience', signals.audience),
    toSignalLine('Constraints', signals.constraints),
    toSignalLine('Evidence', signals.evidence)
  ].join('\n');

  const topGaps = gaps.slice(0, 3).map((gap) => `- [${gap.severity}] ${gap.label}: ${gap.question}`).join('\n') || '- No immediate critical gaps detected.';

  const brief = [
    `CAPABILITY MODE: ${mode}`,
    `CAPABILITY GUIDE: ${buildModeDevelopmentGuide(mode)}`,
    '',
    'KNOWN CASE SIGNALS:',
    knownSignals,
    '',
    'TOP GAP CLOSURE TARGETS:',
    topGaps,
    '',
    'DELIVERY RULES:',
    '- Answer the user directly first.',
    '- If a gap blocks quality, ask one concise highest-value question only.',
    '- When assumptions are needed, label them explicitly as ASSUMPTION.'
  ].join('\n');

  return {
    mode,
    signals,
    gaps,
    capabilityTags,
    brief
  };
};