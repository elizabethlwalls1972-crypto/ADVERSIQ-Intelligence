export type ConsultantOutputType = 'background' | 'next_step' | 'report' | 'letter' | 'case_pack' | 'unknown';

export const detectConsultantOutputType = (message: string): ConsultantOutputType => {
  const text = message.toLowerCase();

  if (/\b(full report|board report|case study|dossier|submission|business case)\b/.test(text)) return 'report';
  if (/\b(letter|loi|mou|email draft|submission letter|cover letter)\b/.test(text)) return 'letter';
  if (/\b(pack|case pack|document pack|report \+ letters|full package)\b/.test(text)) return 'case_pack';
  if (/\b(background|overview|intel brief|briefing|research only)\b/.test(text)) return 'background';
  if (/\b(next step|recommendation|what should i do|quick answer|simple answer)\b/.test(text)) return 'next_step';

  return 'unknown';
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