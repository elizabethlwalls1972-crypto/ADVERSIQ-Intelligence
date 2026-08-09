export type ConsultantOutputType = 'background' | 'next_step' | 'report' | 'letter' | 'case_pack' | 'unknown';
export type ConsultantNeedType = 'information' | 'solution' | 'report' | 'letter' | 'case_pack' | 'ambiguous';

export const detectConsultantOutputType = (message: string): ConsultantOutputType => {
  const text = message.toLowerCase();

  if (/\b(full report|board report|case study|dossier|submission|business case)\b/.test(text)) return 'report';
  if (/\b(letter|loi|mou|email draft|submission letter|cover letter)\b/.test(text)) return 'letter';
  if (/\b(pack|case pack|document pack|report \+ letters|full package)\b/.test(text)) return 'case_pack';
  if (/\b(background|overview|intel brief|briefing|research only)\b/.test(text)) return 'background';
  if (/\b(next step|recommendation|what should i do|quick answer|simple answer)\b/.test(text)) return 'next_step';

  return 'unknown';
};

export const detectConsultantNeedType = (message: string): ConsultantNeedType => {
  const outputType = detectConsultantOutputType(message);
  if (outputType === 'background') return 'information';
  if (outputType === 'next_step') return 'solution';
  if (outputType === 'report') return 'report';
  if (outputType === 'letter') return 'letter';
  if (outputType === 'case_pack') return 'case_pack';

  const text = message.toLowerCase();

  if (/\b(write|draft|prepare|create|produce|generate|build|compose|author)\b.{0,40}\b(letter|email|memo|memorandum|loi|mou|eoi|correspondence)\b/.test(text)) {
    return 'letter';
  }

  if (/\b(write|draft|prepare|create|produce|generate|build|put together|compose|author)\b.{0,40}\b(report|brief|document|proposal|submission|dossier|case study|business case|assessment|strategy)\b/.test(text)) {
    return 'report';
  }

  if (/\b(solve|solution|fix|recommend|what should|next move|next step|pathway|roadmap|plan|strategy|go-to-market|market entry|expand|enter|invest|investment|partnership|government engagement)\b/.test(text)) {
    return 'solution';
  }

  if (/\b(who is|what is|what are|where is|tell me about|explain|describe|background|overview|research|find out|understand|learn about)\b/.test(text)) {
    return 'information';
  }

  return 'ambiguous';
};

export const shouldAskNeedClarification = (message: string, intent: string): boolean => {
  const text = message.trim().toLowerCase();
  if (!text) return false;
  if (/^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|cool|great)[!.\s,?]*$/.test(text)) return false;
  if (intent === 'report_build') return false;

  const needType = detectConsultantNeedType(message);
  if (needType !== 'ambiguous') return false;

  // Ask only when the message is substantive enough to route into the OS, but
  // the user has not said whether they want information, a solution, or an output.
  const hasSubstantiveContext = text.split(/\s+/).filter(Boolean).length >= 8
    || /\b(city|country|market|company|government|mayor|agency|investment|business|project|deal|partner|risk|permit|funding)\b/.test(text);

  return hasSubstantiveContext;
};

export const buildNeedClarificationDirective = (message: string): string => {
  const text = message.trim().toLowerCase();
  if (/^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|cool|great)[!.\s,?]*$/.test(text)) {
    return '';
  }

  const needType = detectConsultantNeedType(message);
  const base = [
    'NEED ROUTING:',
    `- Detected user need: ${needType}.`,
    '- First answer the concrete question or acknowledge the concrete facts the user gave.',
    '- Then route the user into the ADVERSIQ OS capability ladder.',
  ];

  if (needType === 'information') {
    base.push('- Offer to go beyond information into a solution pathway, report, letter, or full case pack if useful.');
  } else if (needType === 'solution') {
    base.push('- Provide the initial solution pathway and ask whether to convert it into a report, letter, document pack, or stakeholder brief.');
  } else if (needType === 'report' || needType === 'letter' || needType === 'case_pack') {
    base.push('- Confirm the selected output path and identify the missing inputs needed to generate it accurately.');
  } else {
    base.push('- Ask one concise routing question: do they want information only, a recommended solution pathway, a report/brief, a letter/document, or a full case pack?');
  }

  return base.join('\n');
};

export const hasNeedRoutingPrompt = (text: string): boolean => {
  const hasInformationChoice = /\b(information only|information\s+or\s+something\s+more|looking\s+for\s+information)\b/i.test(text);
  const hasOutputChoice = /\b(solution pathway|recommended solution|report\/brief|report or brief|letter\/document|letter or document|full case pack|case pack)\b/i.test(text);
  return hasInformationChoice && hasOutputChoice;
};

export const buildNeedRoutingClose = (message: string, responseText = ''): string => {
  const text = message.trim().toLowerCase();
  if (!text || /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|cool|great)[!.\s,?]*$/.test(text)) {
    return '';
  }

  if (hasNeedRoutingPrompt(responseText)) {
    return '';
  }

  const needType = detectConsultantNeedType(message);
  if (needType === 'report') {
    return 'I can build this as a report/brief. Send the target audience, deadline, jurisdiction, and any source documents, and I will structure the verified report around them.';
  }
  if (needType === 'letter') {
    return 'I can build this as a letter/document. Send the recipient, sender role, objective, tone, deadline, and any facts that must be included.';
  }
  if (needType === 'case_pack') {
    return 'I can build this as a full case pack with report, stakeholder brief, and letters/documents. Send the audience, jurisdiction, deadline, and decision objective.';
  }

  const lead = needType === 'information'
    ? 'If you want more than information, choose the next path:'
    : 'Tell me which path you want next:';

  return `${lead} information only, recommended solution pathway, report/brief, letter/document, or full case pack. For the higher-value OS path, I will verify the facts, map stakeholders, test risks, and turn it into the output you need.`;
};

export const shouldRequireOutputClarification = (message: string, intent: string): boolean => {
  const text = message.toLowerCase();
  const explicitFormatSelectionRequest = /\b(choose format|output format|which format|pick a format|not sure which format|what format should i use|a\)|b\)|c\)|d\)|e\)|f\))\b/.test(text);
  if (!explicitFormatSelectionRequest) return false;

  const outputType = detectConsultantOutputType(message);
  if (outputType !== 'unknown') return false;

  return intent !== 'report_build';
};

export const buildOutputClarificationResponse = (): string => {
  return [
    'To give you a precise response, choose the output format first:',
    '',
    'A) Quick background insight (3–5 bullets)',
    'B) Concrete next-step recommendation',
    'C) Full report (board-ready)',
    'D) Letter/document draft',
    'E) Full case pack (report + letters)',
    'F) Not sure — recommend best format',
    '',
    'Then provide 5 items:',
    '1) Who you are (role + organisation)',
    '2) Location/jurisdiction',
    '3) Decision you need to make',
    '4) Deadline',
    '5) Audience (board, ministry, investor, partner, community)'
  ].join('\n');
};
