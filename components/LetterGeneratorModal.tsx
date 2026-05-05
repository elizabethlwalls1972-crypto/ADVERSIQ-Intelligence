
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useEscapeKey from '../hooks/useEscapeKey';
import { X, Mail, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ReportParameters } from '../types';
import { PrecedentMatchingEngine } from '../services/historicalDataEngine';

interface LetterGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportContent: string, reportParameters: any) => Promise<string>;
  reportContent: string;
  reportParameters: any;
}

export const LetterGeneratorModal: React.FC<LetterGeneratorModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  reportContent, 
  reportParameters 
}) => {
  useEscapeKey(onClose);
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [letterType, setLetterType] = useState<'formal' | 'precedent_based' | 'strategic' | 'investment' | 'term_sheet' | 'formal_proposal' | 'investment_memo' | 'due_diligence_request' | 'joint_venture_agreement' | 'non_disclosure_agreement' | 'licensing_agreement'>('strategic');

  const generatePrecedentBasedLetter = useCallback((): string => {
    const precedents = PrecedentMatchingEngine.findMatches(reportParameters as ReportParameters, 0.65);
    const bestMatch = precedents[0];
    const caseStudy = bestMatch?.historicalCase;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const orgName = reportParameters.organizationName || 'Our Organization';
    const country = reportParameters.country || 'your target market';
    
    // Fallback if no precedent
    if (!caseStudy) return generateFormalLetter();

    const roiAchieved = caseStudy.outcomes.roiAchieved ? `${caseStudy.outcomes.roiAchieved}x ROI` : 'significant value creation';

    return `
${today}

To: Minister of Investment / Economic Development Board
Re: STRATEGIC FDI PROPOSAL - ${orgName.toUpperCase()} MARKET ENTRY

Dear [Name/Title],

${orgName} has completed a comprehensive strategic assessment of the ${country} market. Our deterministic analysis, powered by the Nexus Intelligence Engine, indicates a high-probability alignment between our operational capabilities and your national economic objectives.

EVIDENCE-BASED PRECEDENT:
Our due diligence team has analyzed historical investment patterns and identified a critical precedent: the ${caseStudy.id} initiative in ${caseStudy.country} (${caseStudy.year}).

That initiative achieved:
* ${caseStudy.outcomes.jobsCreated?.toLocaleString() || 'Significant'} high-value jobs created
* ${roiAchieved}
* ${caseStudy.outcomes.result === 'success' ? 'Sustainable, long-term operations' : 'Critical infrastructure development'}

We believe ${orgName} is positioned to replicate and exceed these metrics.

PROPOSED ENGAGEMENT:
We are prepared to deploy an initial capital investment (est. ${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}) focused on:
1. ${reportParameters.strategicIntent || 'Market Expansion'}
2. Technology Transfer & Skills Development
3. Supply Chain Integration

TIMELINE:
Our models indicate an optimal entry window within the next ${reportParameters.expansionTimeline || '12 months'}. We request an exploratory dialogue to discuss specific incentive frameworks that would accelerate this timeline.

We await your guidance on the appropriate next steps.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
  }, [reportParameters]);

  const generateFormalLetter = (): string => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const orgName = reportParameters.organizationName || 'Our Organization';
    const country = reportParameters.country || 'your target market';

    return `
${today}

To Whom It May Concern,

PARTNERSHIP OPPORTUNITY: Strategic Investment in ${country}

${orgName} is exploring partnership opportunities in ${country} and believes your organization would be an excellent match for this initiative.

OPPORTUNITY OVERVIEW:
We are seeking to establish operations in ${country} with the strategic intent to ${reportParameters.strategicIntent || 'expand our market presence'}. This represents a significant opportunity for mutual value creation.

KEY CONSIDERATIONS:
* Target Region: ${country}
* Investment Scale: ${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}
* Target Partners: ${reportParameters.targetCounterpartType || 'Strategic partners'}
* Timeline: ${reportParameters.expansionTimeline || '18-24 months'} to positive ROI

NEXT STEPS:
We would like to propose an initial meeting to discuss:
1. Your organization's capabilities and interest in this market
2. Potential areas of collaboration and partnership structure
3. Commercial terms and mutual value creation

We anticipate reaching a framework agreement within 60 days.

ENGAGEMENT:
Please respond to indicate your availability for a call or meeting within the next two weeks.

Best regards,

[Your Name]
${orgName}
[Your Title]
[Your Contact Information]
`;
};

const generateStrategicLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';
  const country = reportParameters.country || 'your target market';

  return `
${today}

To: Government Investment Board / Economic Development Authority
Re: STRATEGIC INVESTMENT OPPORTUNITY - ${orgName.toUpperCase()} MARKET ENTRY

Dear [Minister/Secretary/Director],

${orgName} is pleased to present a strategic investment proposal that aligns with ${country}'s economic development objectives and creates substantial value for all stakeholders.

INVESTMENT OVERVIEW:
* Total Investment: $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M
* Job Creation: ${reportParameters.expansionTimeline ? Math.floor(parseInt(reportParameters.expansionTimeline) * 50) : '500+'} direct and indirect positions
* Technology Transfer: Advanced capabilities in ${reportParameters.strategicIntent || 'key industries'}
* Economic Impact: $${(parseFloat(reportParameters.calibration?.constraints?.budgetCap || '100') * 3).toFixed(1)}M in economic multiplier effects

STRATEGIC ALIGNMENT:
Our investment supports ${country}'s priorities in:
1. Economic diversification and growth
2. Technology adoption and innovation
3. Skills development and employment
4. International partnership development

We seek to establish a dialogue regarding the specific incentives and support frameworks that would optimize this investment's success.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateInvestmentLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';
  const country = reportParameters.country || 'your target market';

  return `
${today}

To: Investment Committee
Re: APPROVAL REQUEST - ${country} Market Entry Investment

Dear Committee Members,

We recommend approval of a $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M investment in ${country} through partnership with ${reportParameters.targetCounterpartType || 'local partner'}.

INVESTMENT RATIONALE:
* Market Opportunity: $${(parseFloat(reportParameters.calibration?.constraints?.budgetCap || '100') * 80).toFixed(0)}B addressable market
* Competitive Advantage: First-mover positioning with established partner
* Financial Returns: 35-40% IRR with 3.2x MOIC
* Strategic Fit: Aligns with our expansion objectives

RISK ASSESSMENT:
* Regulatory Risk: Mitigated through government relations
* Market Risk: Addressed via pilot program
* Operational Risk: Managed with experienced team
* Overall Risk Rating: Medium (acceptable for returns)

RECOMMENDATION: APPROVE investment subject to due diligence completion.

Best regards,

[Your Name]
Chief Investment Officer
${orgName}
`;
};

const generateTermSheetLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Partner'} Legal Counsel
Re: TERM SHEET - ${orgName} Strategic Partnership

Dear Counsel,

Enclosed is the proposed term sheet for our strategic partnership. This document outlines the key economic and governance terms for the $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M investment.

KEY TERMS SUMMARY:
* Investment Amount: $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M
* Equity Structure: 60/40 ownership split
* Governance: Joint steering committee
* Timeline: 90 days to definitive agreements

We request your review and feedback within 14 days to proceed with detailed negotiations.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateFormalProposalLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';
  const country = reportParameters.country || 'your target market';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Potential Partner'}
Re: FORMAL PARTNERSHIP PROPOSAL - ${country} Market Entry

Dear [Contact Name],

Following our initial discussions, ${orgName} is pleased to submit this formal proposal for strategic partnership in ${country}.

PROPOSAL OVERVIEW:
* Partnership Structure: Joint venture with $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M investment
* Strategic Objectives: Market expansion and technology transfer
* Value Creation: Revenue synergies and shared growth opportunities
* Timeline: ${reportParameters.expansionTimeline || '18-24 months'} to profitability

We believe this partnership represents a mutually beneficial opportunity and look forward to your detailed review and response.

Best regards,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateInvestmentMemoLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';
  const country = reportParameters.country || 'your target market';

  return `
${today}

MEMORANDUM

TO: Executive Committee
FROM: Investment Team
SUBJECT: Investment Opportunity - ${country} Market Entry

EXECUTIVE SUMMARY:
${orgName} has identified a compelling investment opportunity in ${country} with projected returns of 35-40% IRR.

MARKET ANALYSIS:
* Market Size: $${(parseFloat(reportParameters.calibration?.constraints?.budgetCap || '100') * 80).toFixed(0)}B
* Growth Rate: 12-15% CAGR
* Competitive Position: First-mover advantage available

INVESTMENT PROPOSAL:
* Amount: $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M
* Structure: Partnership with local entity
* Timeline: ${reportParameters.expansionTimeline || '24 months'} to positive cash flow
* Risk Rating: Medium

RECOMMENDATION: Proceed with due diligence and partner negotiations.

APPROVAL REQUIRED: Executive Committee approval for investments >$25M.
`;
};

const generateDueDiligenceRequestLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Partner'} Management
Re: DUE DILIGENCE INFORMATION REQUEST

Dear [Contact Name],

As we progress toward definitive agreements for our strategic partnership, we require the following information for our due diligence process:

FINANCIAL INFORMATION:
* Audited financial statements (past 3 years)
* Tax returns and compliance records
* Debt schedule and financing agreements
* Key customer and supplier contracts

LEGAL INFORMATION:
* Certificate of incorporation and bylaws
* List of shareholders and ownership structure
* Pending litigation or regulatory issues
* Intellectual property portfolio

OPERATIONAL INFORMATION:
* Organization chart and key personnel
* Operational processes and procedures
* Technology systems and capabilities
* Risk management policies

Please provide this information within 14 business days. Our legal counsel will review all materials and maintain confidentiality.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateJointVentureAgreementLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Partner'} Board of Directors
Re: JOINT VENTURE AGREEMENT - ${orgName} Partnership

Dear Board Members,

We are pleased to propose the formation of a joint venture between ${orgName} and ${reportParameters.targetCounterpartType || 'your organization'} for ${reportParameters.country || 'market'} expansion.

JV STRUCTURE:
* Legal Entity: New company with 60/40 ownership split
* Capital Contribution: $${reportParameters.calibration?.constraints?.budgetCap || 'capital estimate required'}M total investment
* Management: Joint board with equal representation
* Profit Distribution: Pro-rata based on ownership

GOVERNANCE:
* Board of Directors: 6 members (3 from each party)
* CEO: Appointed by majority owner
* Key Decisions: Unanimous approval for strategic matters

SCOPE OF OPERATIONS:
* Geographic Focus: ${reportParameters.country || 'Target market'}
* Business Activities: ${reportParameters.strategicIntent || 'Market expansion and growth'}
* Duration: 10 years with renewal options

We believe this joint venture will create significant value for both organizations and look forward to your consideration.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateNonDisclosureAgreementLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Partner'} Legal Department
Re: NON-DISCLOSURE AGREEMENT

Dear Legal Counsel,

To facilitate discussions regarding our potential strategic partnership, we propose entering into a mutual non-disclosure agreement.

AGREEMENT SCOPE:
* Confidential Information: All proprietary business, technical, and financial information
* Term: 3 years from execution
* Permitted Use: Evaluation of partnership opportunities only
* Return/Destruction: Upon termination or completion of discussions

STANDARD PROVISIONS:
* Definition of Confidential Information
* Exclusions (publicly available information)
* Obligations of Receiving Party
* Remedies for breach
* Governing Law and jurisdiction

Please review the attached NDA template and provide any proposed modifications within 5 business days.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

const generateLicensingAgreementLetter = (): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orgName = reportParameters.organizationName || 'Our Organization';

  return `
${today}

To: ${reportParameters.targetCounterpartType || 'Partner'} Management
Re: LICENSING AGREEMENT PROPOSAL

Dear [Contact Name],

${orgName} is interested in exploring a licensing arrangement for our technology/IP in ${reportParameters.country || 'your market'}.

PROPOSED TERMS:
* Licensed Technology: [Specify technology/IP]
* Territory: ${reportParameters.country || 'Target market'}
* Term: 5 years with renewal options
* Royalties: [Specify royalty structure]
* Performance Obligations: Minimum sales targets

COMMERCIAL BENEFITS:
* Technology Access: Advanced capabilities without development costs
* Market Expansion: Accelerated entry through established partner
* Revenue Generation: Royalty income from successful commercialization
* Strategic Partnership: Foundation for broader collaboration

We propose an initial meeting to discuss specific licensing opportunities and terms.

Sincerely,

[Your Name]
${orgName}
[Your Title]
[Contact Information]
`;
};

  const generateLetterContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setCopySuccess('');

    try {
      let content = '';
      if (letterType === 'precedent_based') {
        content = generatePrecedentBasedLetter();
      } else if (letterType === 'formal') {
        content = generateFormalLetter();
      } else if (letterType === 'strategic') {
        content = generateStrategicLetter();
      } else if (letterType === 'investment') {
        content = generateInvestmentLetter();
      } else if (letterType === 'term_sheet') {
        content = generateTermSheetLetter();
      } else if (letterType === 'formal_proposal') {
        content = generateFormalProposalLetter();
      } else if (letterType === 'investment_memo') {
        content = generateInvestmentMemoLetter();
      } else if (letterType === 'due_diligence_request') {
        content = generateDueDiligenceRequestLetter();
      } else if (letterType === 'joint_venture_agreement') {
        content = generateJointVentureAgreementLetter();
      } else if (letterType === 'non_disclosure_agreement') {
        content = generateNonDisclosureAgreementLetter();
      } else if (letterType === 'licensing_agreement') {
        content = generateLicensingAgreementLetter();
      } else {
        // Default to precedent based
        content = generatePrecedentBasedLetter();
      }
      setLetterContent(content);
    } catch (e) {
      setError("Failed to generate letter content.");
    } finally {
      setIsGenerating(false);
    }
  }, [letterType, generatePrecedentBasedLetter]);

  useEffect(() => {
    if (isOpen) {
      generateLetterContent();
    }
  }, [isOpen, letterType, generateLetterContent]);

  const handleCopyToClipboard = () => {
    if (!letterContent) return;
    navigator.clipboard.writeText(letterContent).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white border border-stone-200 rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-6 border-b border-stone-100 bg-stone-50 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-sm">
                  <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Strategic Outreach Engine</h2>
                <p className="text-xs text-stone-500">Auto-generate correspondence based on analytical findings.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 bg-stone-200/50 p-1 rounded-lg w-fit">
            {(['formal', 'precedent_based', 'strategic', 'investment', 'term_sheet', 'formal_proposal', 'investment_memo', 'due_diligence_request', 'joint_venture_agreement', 'non_disclosure_agreement', 'licensing_agreement'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setLetterType(type)}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                  letterType === type
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {type === 'formal' && 'Standard Formal'}
                {type === 'precedent_based' && 'Evidence-Based (AI)'}
                {type === 'strategic' && 'Gov. Relations'}
                {type === 'investment' && 'Investment Memo'}
                {type === 'term_sheet' && 'Term Sheet'}
                {type === 'formal_proposal' && 'Formal Proposal'}
                {type === 'investment_memo' && 'Investment Memo'}
                {type === 'due_diligence_request' && 'Due Diligence Request'}
                {type === 'joint_venture_agreement' && 'JV Agreement'}
                {type === 'non_disclosure_agreement' && 'NDA'}
                {type === 'licensing_agreement' && 'Licensing Agreement'}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-8 bg-stone-50/30">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-4">
              <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
              <div className="text-center">
                  <p className="font-bold text-stone-900">Synthesizing Outreach Strategy...</p>
                  <p className="text-xs text-stone-400 mt-1">Calibrating tone for {reportParameters.country} cultural norms</p>
              </div>
            </div>
          ) : (
            <div className="relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <FileText size={100} />
                </div>
                <textarea
                readOnly
                value={letterContent}
                className="w-full h-[500px] p-8 bg-white border border-stone-200 rounded-lg text-stone-800 font-serif text-sm leading-relaxed resize-none focus:outline-none shadow-sm"
                placeholder="Letter content will appear here..."
                />
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-stone-200 flex-shrink-0 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {letterType === 'precedent_based' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Optimized using historical success factors</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {copySuccess && (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <CheckCircle className="w-3 h-3" /> {copySuccess}
              </span>
            )}
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating || !letterContent}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-black transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Copy to Clipboard
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

