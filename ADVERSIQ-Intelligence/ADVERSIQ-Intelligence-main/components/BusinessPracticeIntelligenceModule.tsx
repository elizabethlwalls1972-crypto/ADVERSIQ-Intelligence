import React, { useState } from 'react';
import { BookOpen, Globe, Users, Zap, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface CountryProfile {
  country: string;
  region: string;
  decisionSpeed: string;
  decisionSpeedScore: number;
  hierarchy: string;
  hierarchyNotes: string;
  negotiationStyle: string;
  negotiationTips: string[];
  contractTerms: string;
  contractRisks: string[];
  paymentPractices: string;
  communicationNorms: string;
  communicationTips: string[];
  legalFramework: string;
  legalRisks: string[];
  corruptionLevel: string;
  corruptionExamples: string;
  relationshipImportance: string;
  relationshipTips: string[];
  redFlags: string[];
  greenFlags: string[];
  bestPractices: string[];
}

interface BusinessPracticeIntelligenceProps {
  selectedCountry?: string;
  onCountrySelected?: (country: string) => void;
}

const countryProfiles: { [key: string]: CountryProfile } = {
  'Vietnam': {
    country: 'Vietnam',
    region: 'Southeast Asia',
    decisionSpeed: 'SLOW',
    decisionSpeedScore: 35,
    hierarchy: 'HIGHLY HIERARCHICAL',
    hierarchyNotes: 'Strong command-and-control structure. Decisions filtered through multiple approval layers. Always identify decision-maker before proposing.',
    negotiationStyle: 'INDIRECT & RELATIONSHIP-DRIVEN',
    negotiationTips: [
      'Never rush. Initial meetings are about building rapport, not closing deals',
      'Avoid direct confrontation. Use intermediaries if disagreements arise',
      'Small gifts appropriate for relationship building (avoid anything with 4 items)',
      'Expect flexibility on terms - they prefer win-win arrangements'
    ],
    contractTerms: 'Formal, detailed contracts required but often renegotiated. Government contracts especially fluid until ink dries.',
    contractRisks: [
      'Contracts sometimes not honored if political winds shift',
      'Changing government policies can invalidate signed agreements',
      'FDI agreements subject to periodic review and renegotiation'
    ],
    paymentPractices: '60-90 day terms standard. Bank transfers preferred. Cash payments for smaller deals common but risky.',
    communicationNorms: 'Hierarchical (always cc: decision-maker). Written follow-ups required for all meetings. Emails need formal tone.',
    communicationTips: [
      'Always include highest-ranking contact in email chains',
      'Use formal titles and respectful language',
      'Follow up verbal meetings with detailed written summary',
      'Patience is virtue - expect slower response times'
    ],
    legalFramework: 'Foreign investment law reformed 2020, but still opaque enforcement. Labor laws strict but selectively enforced.',
    legalRisks: [
      'Rapid regulatory changes without prior notice',
      'Environmental compliance suddenly tightened',
      'Foreign ownership restrictions in sensitive sectors',
      'Labor disputes can escalate to government intervention'
    ],
    corruptionLevel: 'MODERATE-HIGH (CPI: 43/100)',
    corruptionExamples: 'Facilitation payments expected for customs clearance, land permits, tax audits. Usually modest ($500-2000 per transaction).',
    relationshipImportance: 'CRITICAL',
    relationshipTips: [
      'Invest 6-12 months in relationship building before major commitments',
      'Regular in-person visits expected. Video calls not sufficient',
      'Share meals regularly. Business conducted over dinner often successful',
      'Remember personal details about contacts and inquire in future meetings'
    ],
    redFlags: [
      'Partner cannot clearly explain government approval timeline',
      'Refusal to introduce you to government counterpart',
      'Pushing for quick signature without proper hierarchy alignment',
      'No previous successful partnerships with foreign companies',
      'Aggressive pressure to pay "facilitation fees" upfront'
    ],
    greenFlags: [
      'Clear government mandate/incentive program you\'re joining',
      'Multiple successful foreign partnerships (Japanese, Korean, etc.)',
      'Transparent on regulatory requirements and timelines',
      'Willing to involve you early in government meetings',
      'Long-term commitment shown (office, staff already in place)'
    ],
    bestPractices: [
      'Allocate 6+ months for feasibility phase before commitment',
      'Hire local advisor familiar with government relationships',
      'Build relationships with govt liaison person separately from partner',
      'Document all agreements in Vietnamese AND English with certified translations',
      'Plan for renegotiation cycles every 3-5 years'
    ]
  },

  'USA': {
    country: 'USA',
    region: 'North America',
    decisionSpeed: 'VERY FAST',
    decisionSpeedScore: 85,
    hierarchy: 'FLAT & MERITOCRATIC',
    hierarchyNotes: 'Direct decision-making authority often delegated. Empower people make independent calls. Cross-hierarchy communication normal.',
    negotiationStyle: 'DIRECT & LEGALLY-FOCUSED',
    negotiationTips: [
      'Be explicit and clear. Ambiguity creates legal liability',
      'Separate friendship from business. They appreciate professionalism',
      'Move fast - slow negotiations signal weakness or indecision',
      'Get everything in writing. Verbal agreements have no value'
    ],
    contractTerms: 'Detailed, legally binding. Subject to extensive due diligence. "Paper trail" mentality - document everything.',
    contractRisks: [
      'Litigation risk high if disputes arise. Legal costs substantial',
      'IP protection weak in some states - verify carefully',
      'Contract disputes can tie up capital for years'
    ],
    paymentPractices: '30-45 day terms standard. ACH transfers, checks standard. Credit cards used for smaller transactions.',
    communicationNorms: 'Direct, informal (often first-name basis). Email casual but professional. Meetings can be concise.',
    communicationTips: [
      'Get straight to point. Small talk minimal and optional',
      'Use email freely for decisions (no need for formal hierarchy)',
      'Expect rapid email responses within 24 hours',
      'Conference calls/Zoom standard - no need for in-person initially'
    ],
    legalFramework: 'Highly regulated. Transparent legal system. IP protected well. State variations significant.',
    legalRisks: [
      'Regulatory compliance complex - tax, labor, environmental all critical',
      'Litigation culture strong - disputes escalate to courts easily',
      'Compliance failures can result in criminal charges, not just civil fines'
    ],
    corruptionLevel: 'VERY LOW (CPI: 69/100)',
    corruptionExamples: 'Bribery extremely rare and prosecuted. Lobbying legal and transparent but expensive. Gifts typically prohibited.',
    relationshipImportance: 'LOW-MODERATE',
    relationshipTips: [
      'Relationships built on shared values and business results, not social bonding',
      'Trust demonstrated through competence and follow-through, not meals',
      'Distance maintained between personal and business relationships',
      'Long absence doesn\'t erode relationships if communication continues'
    ],
    redFlags: [
      'Unwillingness to put terms in writing',
      'Vague on regulatory requirements or compliance',
      'No clear legal entity/registration',
      'Partner has history of litigation',
      'Lack of insurance/bonding for the work'
    ],
    greenFlags: [
      'Clear track record with references you can verify independently',
      'Detailed compliance plan and risk mitigation',
      'Clear IP ownership and liability allocation',
      'Professional legal representation on both sides',
      'Regular financial and operational reporting offered upfront'
    ],
    bestPractices: [
      'Hire US legal counsel before signing anything significant',
      'Understand state vs federal jurisdiction for your industry',
      'Verify all claims independently (references, certifications, financials)',
      'Plan for tax optimization early (IRS structures can save significantly)',
      'Budget for compliance costs (10-15% of operating budget in regulated industries)'
    ]
  },

  'Germany': {
    country: 'Germany',
    region: 'Western Europe',
    decisionSpeed: 'SLOW',
    decisionSpeedScore: 40,
    hierarchy: 'STRUCTURED & CLEAR',
    hierarchyNotes: 'Everyone knows their role. Respect protocols. Cross-hierarchy decisions possible if formal channels followed.',
    negotiationStyle: 'FACTUAL & THOROUGH',
    negotiationTips: [
      'Prepare comprehensive data. Vague promises will lose you credibility',
      'Acknowledge weaknesses openly - it builds trust',
      'Expect exhaustive questioning. This isn\'t distrust, it\'s diligence',
      'Flexibility on price shows weakness. Deliver value, not discounts'
    ],
    contractTerms: 'Extremely detailed with extensive appendices. Process-oriented - every scenario considered.',
    contractRisks: [
      'Contracts extremely difficult to modify once signed',
      'Penalties for non-performance strictly enforced',
      'Labor agreements heavily regulated and costly to modify'
    ],
    paymentPractices: '30 days standard but often enforced strictly. Bank transfers, SEPA preferred.',
    communicationNorms: 'Formal (always use titles initially). Written communication preferred to email. Meetings precise and agenda-focused.',
    communicationTips: [
      'Use full titles and formal address until invited otherwise',
      'Agendas required for all meetings, circulated in advance',
      'Punctuality critical - being 5 minutes late signals disrespect',
      'Small talk minimal; move quickly to business'
    ],
    legalFramework: 'Excellent protection for contracts and IP. Labor regulations among strictest globally.',
    legalRisks: [
      'Labor costs very high and difficult to reduce',
      'Environmental compliance rigorous and expensive',
      'Works councils required in larger companies - can slow decisions'
    ],
    corruptionLevel: 'VERY LOW (CPI: 78/100)',
    corruptionExamples: 'Corruption virtually non-existent in formal business. Any bribery attempt likely to end partnership immediately.',
    relationshipImportance: 'MODERATE',
    relationshipTips: [
      'Relationships built on consistency and reliability, not socializing',
      'Respect personal time - don\'t expect availability outside business hours',
      'Regular visits demonstrate commitment but not required for maintenance',
      'Remember details about business preferences but not personal gossip'
    ],
    redFlags: [
      'Unwillingness to provide detailed financial/operational data',
      'Vague on technical specifications or quality standards',
      'No clear management structure or decision authority',
      'History of contract disputes or litigation',
      'Cutting corners on compliance or standards'
    ],
    greenFlags: [
      'Detailed process documentation available',
      'Transparent financial reporting (annual statements, tax returns)',
      'ISO certifications or equivalent quality standards',
      'Clear succession plan and management bench strength',
      'Long-term employee retention and low turnover'
    ],
    bestPractices: [
      'Allow 8-12 weeks for negotiation cycles (they don\'t hurry)',
      'Hire a German legal advisor - contract complexity high',
      'Understand co-determination laws if manufacturing/large operation',
      'Budget for labor costs conservatively (union scales likely apply)',
      'Plan for 24-month payback on capital investments (their benchmark)'
    ]
  },

  'China': {
    country: 'China',
    region: 'Asia-Pacific',
    decisionSpeed: 'FAST (when centrally directed)',
    decisionSpeedScore: 75,
    hierarchy: 'VERY HIERARCHICAL & POLITICAL',
    hierarchyNotes: 'Party/Government hierarchy matters as much as corporate hierarchy. Personal relationships (guanxi) often trump formal authority.',
    negotiationStyle: 'STRATEGIC & LONG-TERM FOCUSED',
    negotiationTips: [
      'Expect to be tested - they\'re assessing your commitment and character',
      'Don\'t reveal your full position early. Information is currency',
      'Patience is advantage. They can outwaita Western partner',
      'Government relationships more important than commercial terms'
    ],
    contractTerms: 'Contracts are starting points, not endpoints. Renegotiation expected as circumstances change.',
    contractRisks: [
      'IP theft risk high - many state-owned or politically-connected competitors',
      'Contract enforcement inconsistent, depends on political winds',
      'Foreign investment subject to "national security" review anytime',
      'Technology transfer often expected as condition for market access'
    ],
    paymentPractices: '90-120 day terms common. Bank transfers required. Some facilitation payments expected in state interactions.',
    communicationNorms: 'Formal hierarchy respected. Chinese language appreciated (even if translated). Government channels often used.',
    communicationTips: [
      'Use intermediaries for sensitive topics - direct criticism = loss of face',
      'Always cc: government liaison if any exist',
      'Accept hierarchy - don\'t try to bypass it',
      'Meetings often involve audience (observers not always identified)'
    ],
    legalFramework: 'Laws exist but interpreted politically. Foreign companies have fewer protections than state-owned enterprises.',
    legalRisks: [
      'Sudden policy reversals (e.g., tech restrictions, trade war measures)',
      'Foreign ownership caps in sensitive industries',
      'IP theft often state-sponsored or tolerated by authorities',
      'Rare but severe punishments for compliance violations (detention of executives possible)'
    ],
    corruptionLevel: 'HIGH (CPI: 45/100) but DECREASING',
    corruptionExamples: 'Systemic but increasingly formalized. Facilitation payments common. "Consulting fees" to connect you with officials standard.',
    relationshipImportance: 'CRITICAL',
    relationshipTips: [
      'Guanxi (relationships) often more important than the deal itself',
      'Regular in-person engagement essential (Chinese value face-to-face)',
      'Introduce yourself through mutual connections when possible',
      'Share meals and some personal information to build trust',
      'Remember that partners report to government - maintain diplomatic tone'
    ],
    redFlags: [
      'Partner has no visible government relationship',
      'Reluctance to discuss corporate structure or ownership',
      'Pressure to transfer IP or technology ahead of revenue',
      'No clear separation between state and private sector roles',
      'Partner unable to introduce you to real decision-maker'
    ],
    greenFlags: [
      'Clear government mandate/policy supporting the partnership',
      'Partner has consistent long-term relationships with foreign companies',
      'Transparent on market access conditions and timelines',
      'Willingness to engage government on your behalf',
      'Multi-year planning horizons (not just short-term profit focus)'
    ],
    bestPractices: [
      'Assume everything is monitored by government entities',
      'Hire political risk consultant familiar with your sector',
      'Treat IP as separable from core business (accept some tech transfer)',
      'Allocate 12+ months for relationship development before commitment',
      'Regular high-level visits necessary to maintain access',
      'Have exit strategy clear before entry (hard to unwind operations)'
    ]
  },

  'Saudi Arabia': {
    country: 'Saudi Arabia',
    region: 'Middle East',
    decisionSpeed: 'FAST (when approved by decision-maker)',
    decisionSpeedScore: 70,
    hierarchy: 'ROYAL/POLITICAL WITH WASTA',
    hierarchyNotes: 'Royal family and appointed ministers have absolute authority. "Wast- (connections) matters enormously.',
    negotiationStyle: 'RELATIONSHIP-CENTRIC & STATUS-AWARE',
    negotiationTips: [
      'First meetings about respect and understanding cultures - not deal terms',
      'Always accept hospitality offered (coffee, meals) as part of relationship',
      'Avoid direct contradiction - face is critical in Middle Eastern context',
      'Deal flexibility expected; fixed terms signal inflexibility'
    ],
    contractTerms: 'Formal but subject to royal decree changes. Issued contracts sometimes overridden by higher authority.',
    contractRisks: [
      'Sudden changes in direction if new decree issued',
      'Contracts sometimes voided if new leadership takes over agency',
      'Labor contract law changing rapidly (e.g., Saudization requirements)'
    ],
    paymentPractices: '60-90 days standard but often slips. Government contracts can take 18+ months to collect.',
    communicationNorms: 'Formal and hierarchical. Arabic language highly respected. Written communications more formal than in Western contexts.',
    communicationTips: [
      'Religious observances respected (no meetings during Friday prayers, Ramadan considerate)',
      'Separate business and social interactions initially',
      'Use formal titles and show deference to senior positions',
      'Expect communication through intermediaries if you don\'t know decision-maker'
    ],
    legalFramework: 'Shari\'ah law overlays all contracts. Regulatory environment increasingly transparent but still discretionary.',
    legalRisks: [
      'Shari\'ah compliance required for all financing (interest limits)',
      'Foreign workforce restrictions (Saudization quotas increasing)',
      'Labor disputes can escalate to religious courts',
      'Non-compliance with local culture/religion can result in severe penalties'
    ],
    corruptionLevel: 'MODERATE (CPI: 53/100)',
    corruptionExamples: 'Facilitation payments to mid-level officials common. Expectations for hiring government-connected "consultants".',
    relationshipImportance: 'CRITICAL',
    relationshipTips: [
      'Personal chemistry with decision-maker (often prince or senior minister) is deal or no-deal factor',
      'Initial meetings typically just relationship building',
      'Business conducted alongside cultural/religious discussions',
      'Respect prayer times and religious holidays',
      'Wasta (connections) often more important than competitive terms'
    ],
    redFlags: [
      'Partner cannot trace decision authority to specific royal or minister',
      'Promises made without clear government mandate',
      'No transparent explanation for why you were selected',
      'Pressure for upfront "consulting" payments before real engagement',
      'No clear timeline or "champion" for the initiative'
    ],
    greenFlags: [
      'Direct connection to ministry or royal office documented',
      'Multiple successful foreign partnerships visible',
      'Clear government program/initiative backing the deal',
      'Introduction made through trusted mutual connection',
      'Long-term vision communicated (not just short-term revenue)'
    ],
    bestPractices: [
      'Hire local advisor with royal/government connections (expensive but essential)',
      'Allocate 12-18 months for real negotiations',
      'Understand that "yes- often means "maybe"a"follow-up constantly',
      'Budget for high-level engagement (executive travel, extended stays)',
      'Plan for facilitation payments and consulting fees ($50K-$500K+ common)',
      'Have cultural training on Islam and Middle Eastern business norms'
    ]
  },

  'Japan': {
    country: 'Japan',
    region: 'Asia-Pacific',
    decisionSpeed: 'VERY SLOW',
    decisionSpeedScore: 25,
    hierarchy: 'SENIORITY-BASED & CONSENSUS-DRIVEN',
    hierarchyNotes: 'Seniority matters significantly. Decisions made by consensus, not by authority. Takes time.',
    negotiationStyle: 'CONSENSUS-FOCUSED & INDIRECT',
    negotiationTips: [
      'Never rush. Speed signals disrespect for process',
      'Consensus-building informal; decisions made before formal meetings',
      'Losing face is devastating - frame issues carefully',
      'Small gifts exchanged as part of building relationships'
    ],
    contractTerms: 'Detailed but often supplemented by handshake understandings. Written and unwritten agreements equally binding.',
    contractRisks: [
      'Implied obligations not in contract still binding',
      'Long-term relationship expectations sometimes exceed contract terms',
      'Changing partner (even to equivalent position) can reset trust'
    ],
    paymentPractices: '30 days standard and reliably honored. Bank transfers, checks standard.',
    communicationNorms: 'Formal and indirect. Silence can mean disagreement. Written communication preferred for major decisions.',
    communicationTips: [
      'Use formal titles and respectful language',
      'Indirect communication preferred (use intermediaries if disagreeing)',
      'Silence or vague responses often mean "no" or "still thinking"',
      'Written agreements preferred even after verbal commitment'
    ],
    legalFramework: 'Stable and predictable. IP protections strong. Labor laws strict.',
    legalRisks: [
      'Layoffs very difficult and expensive (lifetime employment culture)',
      'Imports sometimes face non-tariff barriers',
      'Some sectors restricted to Japanese companies'
    ],
    corruptionLevel: 'VERY LOW (CPI: 75/100)',
    corruptionExamples: 'Corruption virtually non-existent. Gift-giving ritualized but never financial.',
    relationshipImportance: 'CRITICAL',
    relationshipTips: [
      'Relationships built on trust and mutual respect, demonstrated over time',
      'Annual visits expected to maintain relationships',
      'Long-term commitment demonstrated (not just transactions)',
      'Very high switching costs once relationship established'
    ],
    redFlags: [
      'Partner pushing for fast decisions (not in Japanese culture)',
      'No clear decision-making process or timeline explained',
      'Reluctance to engage in background/reference checking',
      'Too much willingness to compromise (suggests desperation)',
      'No mention of internal consensus or approval process'
    ],
    greenFlags: [
      'Clear timeline communicated even if slow (e.g., "3 months for internal review")',
      'Transparent about decision-making process',
      'Multiple visits by partners to show commitment',
      'Long history of stable partnerships',
      'Introduction through mutual trusted connection'
    ],
    bestPractices: [
      'Budget 6-12 months minimum for entire negotiation and approval process',
      'Hire Japanese-speaking advisor familiar with corporate culture',
      'Plan for regular visits (budget 1-2 per year, 1-2 weeks each)',
      'Accept that "no" is often communicated very subtly - ask clarifying questions',
      'Once in partnership, very stable and long-term focused',
      'Respect consensus decision-making even if slower'
    ]
  }
};

const BusinessPracticeIntelligenceModule: React.FC<BusinessPracticeIntelligenceProps> = ({
  selectedCountry = 'Vietnam',
  onCountrySelected
}) => {
  const [activeCountry, setActiveCountry] = useState(selectedCountry);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    negotiation: true,
    operations: false,
    relationships: false,
    risks: false,
    bestPractices: false
  });

  const profile = countryProfiles[activeCountry] || countryProfiles['Vietnam'];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCountryChange = (country: string) => {
    setActiveCountry(country);
    onCountrySelected?.(country);
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Business Practice Intelligence
          </h2>
          <p className="text-stone-600">Deep operational profiles for informed partnership strategy</p>
        </div>

        {/* COUNTRY SELECTOR */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3 block">Select Country Profile</label>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.keys(countryProfiles).map(country => (
              <button
                key={country}
                onClick={() => handleCountryChange(country)}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeCountry === country
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* PROFILE OVERVIEW */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('overview')}
        >
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              {profile.country} - {profile.region}
            </h3>
            <div className="text-2xl">{expandedSections.overview ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.overview && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2">Decision Speed</div>
                  <div className="text-3xl font-black text-red-600 mb-2">{profile.decisionSpeed}</div>
                  <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-red-600 rounded-full" style={{ width: `${profile.decisionSpeedScore}%` }}></div>
                  </div>
                  <div className="text-xs text-red-700 mt-2">{profile.decisionSpeedScore}/100</div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Hierarchy Type</div>
                  <div className="font-bold text-blue-900 mb-2">{profile.hierarchy}</div>
                  <p className="text-xs text-blue-800 leading-relaxed">{profile.hierarchyNotes}</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Corruption Risk</div>
                  <div className="font-bold text-purple-900 mb-2">{profile.corruptionLevel}</div>
                  <p className="text-xs text-purple-800">{profile.corruptionExamples}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NEGOTIATION STRATEGY */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('negotiation')}
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Negotiation Strategy
            </h3>
            <div className="text-2xl">{expandedSections.negotiation ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.negotiation && (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Style</div>
                <div className="font-bold text-stone-900 mb-2">{profile.negotiationStyle}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Key Tips</div>
                {profile.negotiationTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-blue-600 font-bold flex-shrink-0 mt-0.5">*</div>
                    <p className="text-sm text-stone-700">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-xs font-bold text-yellow-900 uppercase tracking-wider mb-2">Contract Terms</div>
                <p className="text-sm text-yellow-900">{profile.contractTerms}</p>
              </div>

              {profile.contractRisks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Contract Risks
                  </div>
                  {profile.contractRisks.map((risk, idx) => (
                    <div key={idx} className="flex gap-2 items-start p-2 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-red-600 font-bold flex-shrink-0 mt-0.5">⚠</div>
                      <p className="text-sm text-red-800">{risk}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* OPERATIONS & PRACTICALITIES */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('operations')}
        >
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Operations & Practicalities
            </h3>
            <div className="text-2xl">{expandedSections.operations ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.operations && (
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Payment Practices</div>
                  <p className="text-sm text-blue-900">{profile.paymentPractices}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Legal Framework</div>
                  <p className="text-sm text-purple-900">{profile.legalFramework}</p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Communication Norms</div>
                  <p className="text-sm text-indigo-900 mb-2">{profile.communicationNorms}</p>
                  <ul className="space-y-1">
                    {profile.communicationTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-indigo-800">* {tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-2">Legal Risks</div>
                  <ul className="space-y-1">
                    {profile.legalRisks.slice(0, 3).map((risk, idx) => (
                      <li key={idx} className="text-xs text-orange-800">* {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RELATIONSHIP BUILDING */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('relationships')}
        >
          <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              Relationship Building ({profile.relationshipImportance})
            </h3>
            <div className="text-2xl">{expandedSections.relationships ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.relationships && (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-sm font-bold text-pink-900 mb-2">Importance Level: {profile.relationshipImportance}</div>
                <p className="text-sm text-pink-900">{profile.relationshipImportance === 'CRITICAL' 
                  ? 'Relationships are the foundation of all deals. Invest significant time and resources here.'
                  : 'Build relationships but focus more on business terms and competence.'
                }</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Relationship Tips</div>
                {profile.relationshipTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="text-pink-600 font-bold flex-shrink-0 mt-0.5">✓</div>
                    <p className="text-sm text-stone-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RED FLAGS & GREEN FLAGS */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('risks')}
        >
          <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Red Flags & Green Flags
            </h3>
            <div className="text-2xl">{expandedSections.risks ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.risks && (
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Red Flags (Deal Killers)
                </div>
                {profile.redFlags.map((flag, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-red-600 font-bold text-lg flex-shrink-0">✗</div>
                    <p className="text-sm text-red-900">{flag}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Green Flags (Go Signals)
                </div>
                {profile.greenFlags.map((flag, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-green-600 font-bold text-lg flex-shrink-0">✓</div>
                    <p className="text-sm text-green-900">{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BEST PRACTICES */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('bestPractices')}
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Best Practices for {profile.country}
            </h3>
            <div className="text-2xl">{expandedSections.bestPractices ? '▾' : '▸'}</div>
          </div>
          
          {expandedSections.bestPractices && (
            <div className="p-6 space-y-2">
              {profile.bestPractices.map((practice, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-purple-600 font-bold flex-shrink-0 text-lg">{idx + 1}.</div>
                  <p className="text-sm text-stone-700 pt-0.5">{practice}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BusinessPracticeIntelligenceModule;

