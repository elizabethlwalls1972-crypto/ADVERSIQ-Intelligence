import React, { useState } from 'react';
import { FileText, Download, Copy, X, ChevronRight, Filter, Search } from 'lucide-react';
import { DOCUMENT_TEMPLATES, ENGAGEMENT_STRATEGIES } from '../constants/systemMetadata';

interface DocumentGeneratorProps {
  params: any;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ params, isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const filteredTemplates = DOCUMENT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(DOCUMENT_TEMPLATES.map(t => t.category)));

  const handleGenerateDocument = (template: typeof DOCUMENT_TEMPLATES[0]) => {
    // Generate document content based on template and params
    let content = generateDocumentContent(template, params);
    setGeneratedContent(content);
    setShowPreview(true);
  };

  const generateDocumentContent = (template: typeof DOCUMENT_TEMPLATES[0], data: any): string => {
    const date = new Date().toLocaleDateString();
    const companyName = data.companyName || 'Your Company';
    const contactEmail = data.email || 'contact@company.com';

    const baseContent = `
================================================================================
${template.name.toUpperCase()}
Generated: ${date}
================================================================================

TO: [Recipient Name/Organization]

FROM: ${companyName}
CONTACT: ${contactEmail}

================================================================================
`;

    const templates: Record<string, string> = {
      'partnership-inquiry': `
${baseContent}

Dear [Recipient],

We are writing to express our interest in exploring a strategic partnership with [Partner Organization].

ABOUT US:
---------
Organization: ${companyName}
Focus: ${data.industry || 'Strategic Partnerships'}
Location: ${data.country || 'Global'}
Contact: ${data.primaryOwner || 'Leadership Team'}

OUR CAPABILITIES:
-----------------
${data.competencies ? `* ${data.competencies}` : '* Industry expertise and proven track record'}
${data.technology ? `* Technology: ${data.technology}` : '* Advanced technology platform'}
${data.teamSize ? `* Team: ${data.teamSize} professionals` : '* Dedicated professional team'}

MARKET FOCUS:
-------------
${data.industry ? `* Industry: ${data.industry}` : '* Strategic industry focus'}
${data.segments ? `* Target Segments: ${data.segments}` : '* Enterprise and strategic segments'}
${data.tam ? `* Market Opportunity: ${data.tam}` : '* Significant market opportunity'}

WHY WE SHOULD PARTNER:
----------------------
[Key reason 1: Complementary capabilities that drive mutual value]
[Key reason 2: Access to new markets or customer segments]
[Key reason 3: Shared values and long-term strategic alignment]

NEXT STEPS:
-----------
We would welcome the opportunity to discuss how we can create value together.
Please let us know your availability for a brief introductory call in the coming weeks.

Thank you for considering this partnership opportunity.

Best regards,

${data.primaryOwner || 'Leadership'}
${companyName}
${contactEmail}

================================================================================
      `,

      'business-proposal': `
${baseContent}

EXECUTIVE SUMMARY:
------------------
This proposal outlines a strategic business opportunity that aligns with our shared objectives
and creates mutual value for both organizations.

COMPANY OVERVIEW:
-----------------
Organization: ${companyName}
Type: ${data.entityType || 'Strategic Organization'}
Location: ${data.country || 'Global'}
Primary Contact: ${data.primaryOwner || 'Leadership Team'}

MARKET OPPORTUNITY:
-------------------
Market: ${data.industry || 'Strategic Market'}
Total Addressable Market: ${data.tam || 'Significant'}
Market Growth Rate: ${data.growthRate || 'Positive trajectory'}
Target Segments: ${data.segments || 'Enterprise and strategic accounts'}

OUR COMPETITIVE ADVANTAGE:
---------------------------
Core Competencies:
${data.competencies ? `  * ${data.competencies}` : '  * Proven expertise and execution capability'}

Technology Stack:
${data.technology ? `  * ${data.technology}` : '  * Cutting-edge technology platform'}

Operations:
  * Team Size: ${data.teamSize || 'Experienced team'}
  * Key Processes: ${data.processes || 'Proven delivery methodologies'}

FINANCIAL PROJECTIONS:
-----------------------
Year 1 Revenue: ${data.revenue1 || '[To be specified]'}
Year 3 Target: ${data.revenue3 || '[To be specified]'}
Target Margin: ${data.marginTarget || '[To be specified]'}
Operating Budget: ${data.opexBudget || '[To be specified]'}

PARTNERSHIP PROPOSAL:
---------------------
[Specific opportunity or collaboration model]
[Expected outcomes and metrics]
[Timeline and milestones]

INVESTMENT/COMMITMENT REQUIRED:
-------------------------------
[What we need from you]
[What you can expect from us]
[Support structure]

NEXT STEPS:
-----------
1. Schedule exploratory meeting (Week 1)
2. Detailed discussion of terms (Week 2-3)
3. Contract negotiation (Week 4-6)
4. Partnership launch

Contact: ${contactEmail}

================================================================================
      `,

      'executive-summary': `
${baseContent}

${companyName}

================================================================================

OVERVIEW:
${data.companyName || 'We are a'} ${data.entityType || 'forward-thinking'} organization focused on ${data.industry || 'creating value'}.

WHAT WE DO:
-----------
${data.competencies || 'We provide strategic solutions that drive growth and create competitive advantage.'}

OUR MARKET:
-----------
Industry: ${data.industry || 'Strategic market'}
Target Segments: ${data.segments || 'Enterprise and high-value segments'}
Market Size: ${data.tam || 'Significant and growing'}
Growth Rate: ${data.growthRate || 'Positive trajectory'}

OUR COMPETITIVE ADVANTAGE:
--------------------------
* ${data.competencies || 'Deep expertise in our market'}
* ${data.technology || 'Proven technology and systems'}
* ${data.teamSize || 'Experienced and dedicated team'}

TRACTION & RESULTS:
-------------------
Year 1 Revenue: ${data.revenue1 || '[Growth metrics]'}
Projected Year 3: ${data.revenue3 || '[Growth trajectory]'}
Key Achievements: ${data.partners || '[Strategic accomplishments]'}

STRATEGIC PARTNERSHIPS:
-----------------------
${data.partners || 'Strategic partnerships with industry leaders'}

GOVERNANCE & COMPLIANCE:
------------------------
* Risk Management: ${data.risks || 'Comprehensive risk framework'}
* Compliance: ${data.compliance || 'Full regulatory compliance'}

CONTACT:
--------
${data.primaryOwner || 'Leadership Team'}
${companyName}
${contactEmail}

================================================================================
      `,

      'contact-engagement-letter': `
${baseContent}

Dear [Recipient Name],

I hope this message finds you well. I am reaching out because I believe there may be
a valuable opportunity for collaboration between ${companyName} and [Organization/You].

ABOUT ${companyName.toUpperCase()}:
${'-'.repeat(companyName.length + 6)}
We are a ${data.entityType || 'innovative'} organization specializing in ${data.industry || 'strategic solutions'}.
Our focus is on ${data.competencies || 'delivering exceptional value'} for our clients and partners.

Location: ${data.country || 'Global'}
Contact: ${data.primaryOwner || 'Leadership Team'}

WHY I'M REACHING OUT:
---------------------
Based on your work in ${data.segments || 'this space'}, I think there could be genuine mutual benefit in exploring:

1. Complementary capabilities: Our ${data.competencies || 'unique strengths'} could enhance your offerings
2. Market expansion: Access to ${data.segments || 'new customer segments'}} and growth opportunities  
3. Strategic alignment: Shared vision for ${data.industry || 'this market'}} leadership

WHAT WE BRING TO THE TABLE:
---------------------------
* Proven expertise: ${data.competencies || 'Deep knowledge and proven track record'}
* Capability: ${data.teamSize || 'Strong'} team with relevant experience
* Technology: ${data.technology || 'Advanced platform and systems'}}
* Track record: ${data.partners || 'Strong partnerships and collaborations'}}

MY PROPOSAL:
------------
Let's find a time for a brief 20-minute call to explore whether there's a fit.
No commitments - just a conversation about potential opportunities.

NEXT STEPS:
-----------
Please let me know your availability in the coming [1-2] weeks. I'm flexible and happy
to work around your schedule.

Looking forward to connecting.

Best regards,

${data.primaryOwner || 'Founder'}
${companyName}
${contactEmail}
${data.country || ''}

================================================================================
      `,

      // Default template
      default: `
${baseContent}

DOCUMENT TEMPLATE

Organization: ${companyName}
Type: ${data.entityType || 'Organization'}
Industry: ${data.industry || 'Strategic Focus'}
Location: ${data.country || 'Global'}
Contact: ${data.primaryOwner || 'Leadership'}
Email: ${contactEmail}

================================================================================

[Add your document content here]

Key sections can include:
* Executive summary
* Company overview
* Market opportunity
* Competitive advantage
* Financial projections
* Partnership opportunities
* Risk management
* Compliance and governance
* Contact information

================================================================================
      `
    };

    return templates[template.id] || templates.default;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6 text-white sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Document Generator</h2>
            <p className="text-green-100">
              Create professional documents for partner engagement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-800 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!showPreview ? (
          <>
            {/* Search and Filter */}
            <div className="p-6 bg-gray-50 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    !categoryFilter
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-1" />
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      categoryFilter === cat
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleGenerateDocument(template)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-green-300 transition text-left group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    Generate
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents found matching your search</p>
              </div>
            )}

            {/* Engagement Strategies Info */}
            <div className="px-6 py-4 bg-blue-50 border-t">
              <p className="text-xs font-semibold text-gray-700 mb-2">💡 Engagement Strategies:</p>
              <div className="text-xs text-gray-600 space-y-1">
                {ENGAGEMENT_STRATEGIES.slice(0, 3).map(strategy => (
                  <p key={strategy.id}><strong>{strategy.name}:</strong> {strategy.description}</p>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview */}
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedContent || ''));
                    element.setAttribute('download', `${selectedTemplate}-${new Date().getTime()}.txt`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent || '');
                    alert('Document copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[60vh] overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {generatedContent}
                </pre>
              </div>

              <p className="text-xs text-gray-500 text-center">
                💡 Customize this document with specific details about the recipient and tailor the messaging to your needs
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator;

