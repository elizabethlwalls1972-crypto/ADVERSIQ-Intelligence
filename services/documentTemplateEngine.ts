export type DocumentLengthPreset = 'brief' | 'standard' | 'extended';

export interface StructuredDocumentIntake {
  objective: string;
  audience: string;
  jurisdiction: string;
  tone: string;
  deadline: string;
  mustInclude: string;
  constraints: string;
}

export const createDefaultIntake = (): StructuredDocumentIntake => ({
  objective: '',
  audience: '',
  jurisdiction: '',
  tone: 'Professional',
  deadline: '',
  mustInclude: '',
  constraints: ''
});

export const getMissingIntakeFields = (intake: StructuredDocumentIntake): string[] => {
  const required: Array<keyof StructuredDocumentIntake> = ['objective', 'audience', 'jurisdiction'];
  return required.filter((field) => !String(intake[field]).trim());
};

export const applyTemplateContext = (
  baseContent: string,
  intake: StructuredDocumentIntake,
  preset: DocumentLengthPreset
): string => {
  const profileBlock = [
    'DOCUMENT BRIEF (USER-DEFINED)',
    `Objective: ${intake.objective || 'Not specified'}`,
    `Audience: ${intake.audience || 'Not specified'}`,
    `Jurisdiction: ${intake.jurisdiction || 'Not specified'}`,
    `Tone: ${intake.tone || 'Professional'}`,
    `Deadline: ${intake.deadline || 'Not specified'}`,
    `Must Include: ${intake.mustInclude || 'None specified'}`,
    `Constraints: ${intake.constraints || 'None specified'}`,
  ].join('\n');

  const presetFooter =
    preset === 'brief'
      ? '\n\nDELIVERY MODE: Brief output requested. Keep executive-ready and concise.'
      : preset === 'extended'
        ? '\n\nDELIVERY MODE: Extended output requested. Include assumptions, risks, and implementation detail.'
        : '\n\nDELIVERY MODE: Standard output requested.';

  return `${profileBlock}\n\n${baseContent}${presetFooter}`;
};
