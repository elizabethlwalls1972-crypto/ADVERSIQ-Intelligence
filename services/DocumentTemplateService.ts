import { DecisionPacket } from './DecisionPipeline';

export interface TemplateSection {
  heading: string;
  bullets?: string[];
  paragraphs?: string[];
  table?: { label: string; value: string }[];
}

export interface DocumentTemplate {
  type: 'loi' | 'mou' | 'nda' | 'term-sheet' | 'policy-brief';
  title: string;
  subtitle?: string;
  meta?: Record<string, string>;
  sections: TemplateSection[];
}

const fmtDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }) + ' UTC';
  } catch {
    return iso;
  }
};

export const DocumentTemplateService = {
  loi(packet: DecisionPacket): DocumentTemplate {
    return {
      type: 'loi',
      title: 'Letter of Engagement',
      subtitle: packet.scenario.location,
      meta: {
        runId: packet.runId,
        generated: fmtDate(packet.generatedAt),
        validity: '30 days from generation'
      },
      sections: [
        {
          heading: 'Introduction & Intent',
          paragraphs: [
            'This letter confirms the mutual intent of the undersigned investors to collaborate on the referenced opportunity.',
            packet.scenario.intent?.length ? `Focus: ${packet.scenario.intent.join('; ')}` : 'Focus: joint evaluation of the opportunity and capital plan.'
          ]
        },
        {
          heading: 'Opportunity Overview',
          bullets: [
            `Location: ${packet.scenario.location || 'Location data required'}`,
            packet.scenario.intent?.join('; ') || 'Scenario summary provided separately.'
          ]
        },
        {
          heading: 'Proposed Collaboration',
          bullets: [
            'Joint diligence and structuring with shared workplan.',
            'Mutual access to relevant data, experts, and site reviews.',
            'Objective: produce a co-authored investment memo and go/no-go decision.'
          ]
        },
        {
          heading: 'Capital & Roles (Non-binding)',
          table: [
            { label: 'Indicative capital', value: 'Pending diligence-calibrated capital allocation' },
            { label: 'Lead responsibilities', value: 'Lead investor to coordinate diligence and IC materials' },
            { label: 'Co-investor role', value: 'Review, challenge, and co-author memo; prepare side letters if needed' }
          ]
        },
        {
          heading: 'Diligence & Workplan',
          bullets: packet.actions.length
            ? packet.actions.map(a => `${a.title} - ${a.due || 'Due date required'} (${a.owner || 'Owner assignment required'})`)
            : ['Agree week-by-week plan; identify data room contents; schedule site review.']
        },
        {
          heading: 'Key Conditions',
          bullets: [
            'Satisfactory diligence (financial, legal, operational).',
            'Investment committee approvals for both parties.',
            'Negotiation of definitive agreements and side letters as applicable.'
          ]
        },
        {
          heading: 'Confidentiality & Exclusivity',
          bullets: [
            'Information shared under mutual confidentiality; no public disclosures without consent.',
            'No exclusivity implied unless separately agreed in writing.'
          ]
        },
        {
          heading: 'Next Steps',
          table: [
            { label: 'Kickoff', value: 'Confirm workplan owners and timeline' },
            { label: 'Data room', value: 'Exchange required documents checklist' },
            { label: 'IC prep', value: 'Draft joint investment memo outline and responsibilities' }
          ]
        },
        {
          heading: 'Acceptance (Non-binding)',
          bullets: [
            'This letter is non-binding except for confidentiality provisions.',
            'Acknowledged by the parties to proceed with the collaboration described above.'
          ]
        }
      ]
    };
  },

  mou(packet: DecisionPacket): DocumentTemplate {
    return {
      type: 'mou',
      title: 'Memorandum of Understanding',
      subtitle: packet.scenario.location,
      sections: [
        { heading: 'Purpose', paragraphs: ['Establish cooperation framework and governance for the joint workstream.'] },
        { heading: 'Scope', bullets: packet.scenario.intent },
        { heading: 'Governance', bullets: packet.controls.map(c => `${c.metric}: ${c.threshold} -> ${c.action}`) },
        { heading: 'Responsibilities', table: packet.actions.map(a => ({ label: a.title, value: a.owner || 'Owner assignment required' })) },
        { heading: 'Term & Exit', bullets: ['Initial term 12 months; renewable upon performance.', 'Exit triggers: breach of controls or failure to meet evidence gates.'] },
        { heading: 'Confidentiality', bullets: ['Mutual confidentiality; data used solely for agreed evaluation and execution.'] }
      ]
    };
  },

  nda(packet: DecisionPacket): DocumentTemplate {
    return {
      type: 'nda',
      title: 'Non-Disclosure Agreement',
      sections: [
        { heading: 'Parties', paragraphs: ['Disclosing and Receiving Parties as per mandate; tied to run ' + packet.runId] },
        { heading: 'Definition of Confidential Information', bullets: ['All packet data, evidence artifacts, exports, and governance records.'] },
        { heading: 'Use Restrictions', bullets: ['Use solely for evaluation and execution of the scoped opportunity.'] },
        { heading: 'Term', bullets: ['Survives 3 years from last disclosure or as required by law.'] },
        { heading: 'Security', bullets: ['Maintain telemetry and provenance; report breaches within 72 hours.'] },
        { heading: 'Return/Destruction', bullets: ['Upon request or termination, destroy or return all confidential materials.'] }
      ]
    };
  },

  termSheet(packet: DecisionPacket): DocumentTemplate {
    return {
      type: 'term-sheet',
      title: 'Term Sheet',
      sections: [
        { heading: 'Overview', bullets: [`Run ID: ${packet.runId}`, `Location: ${packet.scenario.location || 'Location data required'}`] },
        { heading: 'Economics', bullets: ['Capital plan tied to evidence gates; escrow releases upon milestone acceptance.'] },
        { heading: 'Governance', bullets: packet.controls.map(c => `${c.metric}: ${c.threshold} -> ${c.action}`) },
        { heading: 'Milestones', table: packet.actions.map(a => ({ label: a.title, value: `${a.due || 'Due date required'} | Gate: ${a.criteria || 'Evidence required'}` })) },
        { heading: 'Conditions Precedent', bullets: ['Signed governance mandate', 'Operational telemetry active', 'Trustee appointed'] },
        { heading: 'Closing Conditions', bullets: ['Evidence pack accepted', 'Controls satisfied', 'Approvals recorded'] }
      ]
    };
  },

  policyBrief(packet: DecisionPacket): DocumentTemplate {
    return {
      type: 'policy-brief',
      title: 'Policy Brief',
      subtitle: packet.scenario.location,
      sections: [
        { heading: 'Context', paragraphs: packet.scenario.intent.length ? [packet.scenario.intent.join('; ')] : ['Policy context aligned to scenario intent.'] },
        { heading: 'Signals', bullets: packet.controls.map(c => `${c.metric}: ${c.threshold}`) },
        { heading: 'Recommendations', bullets: packet.actions.map(a => a.title) },
        { heading: 'Evidence & Oversight', bullets: packet.evidence },
        { heading: 'Next Steps', bullets: packet.actions.map(a => `${a.title} (${a.due || 'Due date required'})`) }
      ]
    };
  }
};

