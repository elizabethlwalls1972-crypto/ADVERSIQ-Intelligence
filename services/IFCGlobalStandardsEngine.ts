/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IFC GLOBAL STANDARDS ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WORLD LAW TRANSLATOR: Universal Standards → Gap Analysis → Local Compliance
 *
 * This engine implements the "Global Baseline + Local Search" model:
 *
 *   1. UNIVERSAL SKELETON (Global Standard)
 *      - IFC Performance Standards (PS1-PS8) - World Bank gold standard
 *      - UN Sustainable Development Goals (17 SDGs)
 *      - Equator Principles alignment
 *      → User meets 90%+ global compliance before knowing local law
 *
 *   2. GAP ANALYSIS (Where they fall short)
 *      - Check user inputs against each Performance Standard
 *      - Flag critical gaps that block investor confidence
 *      - Generate report with gaps clearly marked
 *
 *   3. GENETIC MIND (Finding Local Law)
 *      - Detect gap category (land, labour, environment, etc.)
 *      - Localize to user's country
 *      - Hunt specific local regulations to bridge gap
 *      - Provide actionable legal pathway
 *
 * Why this matters:
 *   - Universal Access: Anyone anywhere can start immediately
 *   - Investor Confidence: IFC > local law for global finance
 *   - Safety Net: Reports highlight red flags, protecting users
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { GlobalComplianceFramework, CountryComplianceProfile } from './GlobalComplianceFramework';

// ============================================================================
// PROJECT ASSESSMENT PARAMS TYPE
// ============================================================================

interface IFCProjectParams {
  country: string;
  sector: string;
  projectType: string;
  investmentSizeM: number;
  hasESMS?: boolean;
  hasESIA?: boolean;
  hasStakeholderPlan?: boolean;
  hasGrievanceMechanism?: boolean;
  hasLaborPolicies?: boolean;
  prohibitsChildLabor?: boolean;
  prohibitsForcedLabor?: boolean;
  hasOHSProgram?: boolean;
  hasResourceTargets?: boolean;
  hasWasteManagement?: boolean;
  hasPollutionPrevention?: boolean;
  hasCommunityHealthAssessment?: boolean;
  hasEmergencyPreparedness?: boolean;
  requiresLandAcquisition?: boolean;
  displacesCommunities?: boolean;
  hasResettlementPlan?: boolean;
  hasLivelihoodPlan?: boolean;
  nearCriticalHabitat?: boolean;
  hasBiodiversityPlan?: boolean;
  indigenousPresent?: boolean;
  hasFPIC?: boolean;
  hasIndigenousPlan?: boolean;
  culturalHeritagePresent?: boolean;
  hasChanceFindsProcedure?: boolean;
}

// ============================================================================
// IFC PERFORMANCE STANDARDS (PS1-PS8)
// ============================================================================

export interface IFCPerformanceStandard {
  id: string;
  name: string;
  shortName: string;
  description: string;
  keyRequirements: string[];
  assessmentQuestions: AssessmentQuestion[];
  applicableWhen: string;
  relatedSDGs: number[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  weight: number; // 1-10 importance
  requiredForCompliance: boolean;
}

export interface StandardAssessment {
  standardId: string;
  standardName: string;
  score: number; // 0-100
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  gaps: ComplianceGap[];
  strengths: string[];
  actionRequired: boolean;
}

export interface ComplianceGap {
  id: string;
  standard: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  businessImpact: string;
  localLawReference?: LocalLawReference;
  remediation: RemediationPath;
}

export interface LocalLawReference {
  country: string;
  lawName: string;
  lawCode: string;
  relevantArticles: string[];
  enforcingAgency: string;
  requiredActions: string[];
  typicalTimeline: string;
  estimatedCost: string;
}

export interface RemediationPath {
  steps: string[];
  estimatedDays: number;
  documents: string[];
  consultantsNeeded: string[];
  cost: 'low' | 'medium' | 'high';
}

export interface GlobalStandardsAssessment {
  projectId: string;
  country: string;
  sector: string;
  assessmentDate: string;
  overallScore: number;
  overallStatus: 'green' | 'yellow' | 'red';
  ifcAssessments: StandardAssessment[];
  sdgAlignment: SDGAlignment[];
  criticalGaps: ComplianceGap[];
  reportGenerable: boolean;
  reportConditions: string[];
  universalCompliance: number; // % meeting global baseline
  localGapCount: number;
  processingTimeMs: number;
}

export interface SDGAlignment {
  sdgNumber: number;
  sdgName: string;
  alignmentScore: number;
  contributions: string[];
  risks: string[];
}

// ============================================================================
// IFC PERFORMANCE STANDARDS DATABASE
// ============================================================================

const IFC_PERFORMANCE_STANDARDS: IFCPerformanceStandard[] = [
  {
    id: 'PS1',
    name: 'Assessment and Management of Environmental and Social Risks and Impacts',
    shortName: 'E&S Management System',
    description: 'Establish and maintain an Environmental and Social Management System (ESMS) appropriate to the nature and scale of the project.',
    keyRequirements: [
      'Environmental and Social Assessment',
      'Management Program with mitigation measures',
      'Organizational capacity and competency',
      'Emergency preparedness and response',
      'Stakeholder engagement',
      'Monitoring and review',
      'External communications and grievance mechanisms'
    ],
    assessmentQuestions: [
      { id: 'PS1-1', question: 'Do you have a documented Environmental and Social Management System?', category: 'ESMS', weight: 10, requiredForCompliance: true },
      { id: 'PS1-2', question: 'Have you conducted an Environmental and Social Impact Assessment (ESIA)?', category: 'Assessment', weight: 9, requiredForCompliance: true },
      { id: 'PS1-3', question: 'Do you have a stakeholder engagement plan?', category: 'Stakeholder', weight: 8, requiredForCompliance: true },
      { id: 'PS1-4', question: 'Is there an emergency response plan?', category: 'Emergency', weight: 7, requiredForCompliance: false },
      { id: 'PS1-5', question: 'Do you have a grievance mechanism for affected communities?', category: 'Grievance', weight: 8, requiredForCompliance: true },
      { id: 'PS1-6', question: 'Is there ongoing environmental monitoring?', category: 'Monitoring', weight: 7, requiredForCompliance: false }
    ],
    applicableWhen: 'All projects with potential environmental or social risks',
    relatedSDGs: [16, 17]
  },
  {
    id: 'PS2',
    name: 'Labor and Working Conditions',
    shortName: 'Labour Standards',
    description: 'Promote fair treatment, non-discrimination, and equal opportunity of workers. Protect workers from forced and child labor. Promote safe and healthy working conditions.',
    keyRequirements: [
      'Working conditions and employment terms',
      'Workers\' organizations',
      'Non-discrimination and equal opportunity',
      'Retrenchment (if applicable)',
      'Grievance mechanism',
      'Child labor prohibition',
      'Forced labor prohibition',
      'Occupational health and safety'
    ],
    assessmentQuestions: [
      { id: 'PS2-1', question: 'Do you have documented employment terms and conditions?', category: 'Employment', weight: 9, requiredForCompliance: true },
      { id: 'PS2-2', question: 'Is there a policy prohibiting child labor?', category: 'Child Labor', weight: 10, requiredForCompliance: true },
      { id: 'PS2-3', question: 'Is forced labor explicitly prohibited in your policies?', category: 'Forced Labor', weight: 10, requiredForCompliance: true },
      { id: 'PS2-4', question: 'Do you have an occupational health and safety program?', category: 'OHS', weight: 9, requiredForCompliance: true },
      { id: 'PS2-5', question: 'Are workers free to form or join unions?', category: 'Unions', weight: 7, requiredForCompliance: false },
      { id: 'PS2-6', question: 'Is there a worker grievance mechanism?', category: 'Grievance', weight: 8, requiredForCompliance: true }
    ],
    applicableWhen: 'All projects with employees or contracted workers',
    relatedSDGs: [1, 3, 5, 8, 10]
  },
  {
    id: 'PS3',
    name: 'Resource Efficiency and Pollution Prevention',
    shortName: 'Resource & Pollution',
    description: 'Avoid or minimize adverse impacts on human health and the environment by avoiding or minimizing pollution. Promote more sustainable use of resources.',
    keyRequirements: [
      'Resource efficiency (energy, water, materials)',
      'Greenhouse gas emissions',
      'Water consumption and quality',
      'Air emissions',
      'Waste management',
      'Hazardous materials management',
      'Pesticide use and management'
    ],
    assessmentQuestions: [
      { id: 'PS3-1', question: 'Do you have resource efficiency targets (energy, water)?', category: 'Efficiency', weight: 8, requiredForCompliance: true },
      { id: 'PS3-2', question: 'Do you measure and report greenhouse gas emissions?', category: 'GHG', weight: 8, requiredForCompliance: false },
      { id: 'PS3-3', question: 'Is there a waste management plan?', category: 'Waste', weight: 9, requiredForCompliance: true },
      { id: 'PS3-4', question: 'Is pollution prevention equipment in place?', category: 'Pollution', weight: 9, requiredForCompliance: true },
      { id: 'PS3-5', question: 'Are hazardous materials properly stored and handled?', category: 'Hazmat', weight: 9, requiredForCompliance: true }
    ],
    applicableWhen: 'All projects with environmental footprint',
    relatedSDGs: [6, 7, 9, 12, 13, 14, 15]
  },
  {
    id: 'PS4',
    name: 'Community Health, Safety, and Security',
    shortName: 'Community Safety',
    description: 'Anticipate and avoid adverse impacts on the health and safety of affected communities during the project life. Ensure safeguarding of personnel and property is carried out in a manner that avoids or minimizes risks.',
    keyRequirements: [
      'Community health and safety',
      'Infrastructure and equipment design safety',
      'Hazardous materials and community safety',
      'Ecosystem services',
      'Community exposure to disease',
      'Emergency preparedness',
      'Security personnel conduct'
    ],
    assessmentQuestions: [
      { id: 'PS4-1', question: 'Have you assessed impacts on community health and safety?', category: 'Health', weight: 9, requiredForCompliance: true },
      { id: 'PS4-2', question: 'Is there community emergency preparedness?', category: 'Emergency', weight: 8, requiredForCompliance: true },
      { id: 'PS4-3', question: 'Are security personnel trained in human rights?', category: 'Security', weight: 7, requiredForCompliance: false },
      { id: 'PS4-4', question: 'Is there a community health monitoring program?', category: 'Monitoring', weight: 7, requiredForCompliance: false }
    ],
    applicableWhen: 'Projects near communities or public infrastructure',
    relatedSDGs: [3, 6, 11, 16]
  },
  {
    id: 'PS5',
    name: 'Land Acquisition and Involuntary Resettlement',
    shortName: 'Land & Resettlement',
    description: 'Avoid or minimize displacement. Mitigate economic and social impacts from land acquisition. Improve or restore livelihoods and standards of living of displaced persons.',
    keyRequirements: [
      'Avoid involuntary resettlement where feasible',
      'Compensation at full replacement cost',
      'Resettlement Action Plan',
      'Livelihood Restoration Plan',
      'Community engagement throughout process',
      'Vulnerable group considerations',
      'Grievance mechanism'
    ],
    assessmentQuestions: [
      { id: 'PS5-1', question: 'Does your project require land acquisition?', category: 'Land', weight: 10, requiredForCompliance: true },
      { id: 'PS5-2', question: 'Will any persons or communities be displaced?', category: 'Displacement', weight: 10, requiredForCompliance: true },
      { id: 'PS5-3', question: 'Is there a Resettlement Action Plan?', category: 'RAP', weight: 10, requiredForCompliance: true },
      { id: 'PS5-4', question: 'Will compensation be at full replacement cost?', category: 'Compensation', weight: 9, requiredForCompliance: true },
      { id: 'PS5-5', question: 'Is there a Livelihood Restoration Plan?', category: 'Livelihood', weight: 9, requiredForCompliance: true }
    ],
    applicableWhen: 'Projects involving land acquisition or physical/economic displacement',
    relatedSDGs: [1, 2, 10, 11]
  },
  {
    id: 'PS6',
    name: 'Biodiversity Conservation and Sustainable Management of Living Natural Resources',
    shortName: 'Biodiversity',
    description: 'Protect and conserve biodiversity. Maintain ecosystem services. Promote sustainable management and use of living natural resources.',
    keyRequirements: [
      'Protection of critical and natural habitats',
      'No net loss / net gain of biodiversity',
      'Sustainable management of natural resources',
      'Supply chain assessment',
      'Invasive species management',
      'Ecosystem services protection'
    ],
    assessmentQuestions: [
      { id: 'PS6-1', question: 'Have you assessed biodiversity impacts?', category: 'Assessment', weight: 9, requiredForCompliance: true },
      { id: 'PS6-2', question: 'Is the project in or near a critical habitat?', category: 'Habitat', weight: 10, requiredForCompliance: true },
      { id: 'PS6-3', question: 'Is there a biodiversity management plan?', category: 'Management', weight: 8, requiredForCompliance: false },
      { id: 'PS6-4', question: 'Have ecosystem services been identified and protected?', category: 'Ecosystem', weight: 8, requiredForCompliance: false }
    ],
    applicableWhen: 'Projects in or near natural habitats or using living natural resources',
    relatedSDGs: [14, 15]
  },
  {
    id: 'PS7',
    name: 'Indigenous Peoples',
    shortName: 'Indigenous Peoples',
    description: 'Ensure full respect for indigenous peoples\' human rights, dignity, aspirations, culture, and livelihoods. Avoid or minimize adverse impacts. Foster good faith negotiation with affected communities.',
    keyRequirements: [
      'Free, Prior and Informed Consent (FPIC)',
      'Avoid impacts where feasible',
      'Culturally appropriate benefits',
      'Impact mitigation',
      'Ongoing engagement',
      'Grievance mechanism',
      'Indigenous Peoples Plan'
    ],
    assessmentQuestions: [
      { id: 'PS7-1', question: 'Are Indigenous Peoples present in the project area?', category: 'Presence', weight: 10, requiredForCompliance: true },
      { id: 'PS7-2', question: 'Has Free, Prior and Informed Consent (FPIC) been obtained?', category: 'FPIC', weight: 10, requiredForCompliance: true },
      { id: 'PS7-3', question: 'Is there an Indigenous Peoples Plan?', category: 'Plan', weight: 9, requiredForCompliance: true },
      { id: 'PS7-4', question: 'Are benefits culturally appropriate?', category: 'Benefits', weight: 8, requiredForCompliance: false }
    ],
    applicableWhen: 'Projects affecting Indigenous Peoples\' lands, resources, or livelihoods',
    relatedSDGs: [1, 2, 4, 10, 16]
  },
  {
    id: 'PS8',
    name: 'Cultural Heritage',
    shortName: 'Cultural Heritage',
    description: 'Protect cultural heritage from adverse impacts. Promote equitable sharing of benefits from use of cultural heritage in project activities.',
    keyRequirements: [
      'Chance finds procedure',
      'Critical cultural heritage protection',
      'Project use of cultural heritage consent',
      'Community consultation',
      'Cultural heritage management plan'
    ],
    assessmentQuestions: [
      { id: 'PS8-1', question: 'Is there cultural heritage in the project area?', category: 'Presence', weight: 9, requiredForCompliance: true },
      { id: 'PS8-2', question: 'Is there a chance finds procedure?', category: 'Procedure', weight: 8, requiredForCompliance: true },
      { id: 'PS8-3', question: 'Has community consultation occurred on cultural heritage?', category: 'Consultation', weight: 8, requiredForCompliance: false }
    ],
    applicableWhen: 'Projects that may affect tangible or intangible cultural heritage',
    relatedSDGs: [4, 11]
  }
];

// ============================================================================
// UN SUSTAINABLE DEVELOPMENT GOALS
// ============================================================================

const UN_SDGS: { number: number; name: string; description: string }[] = [
  { number: 1, name: 'No Poverty', description: 'End poverty in all its forms everywhere' },
  { number: 2, name: 'Zero Hunger', description: 'End hunger, achieve food security' },
  { number: 3, name: 'Good Health and Well-being', description: 'Ensure healthy lives and promote well-being' },
  { number: 4, name: 'Quality Education', description: 'Ensure inclusive and equitable quality education' },
  { number: 5, name: 'Gender Equality', description: 'Achieve gender equality and empower women' },
  { number: 6, name: 'Clean Water and Sanitation', description: 'Ensure availability of water and sanitation' },
  { number: 7, name: 'Affordable and Clean Energy', description: 'Ensure access to sustainable energy' },
  { number: 8, name: 'Decent Work and Economic Growth', description: 'Promote sustained economic growth' },
  { number: 9, name: 'Industry, Innovation, and Infrastructure', description: 'Build resilient infrastructure' },
  { number: 10, name: 'Reduced Inequalities', description: 'Reduce inequality within and among countries' },
  { number: 11, name: 'Sustainable Cities and Communities', description: 'Make cities inclusive and sustainable' },
  { number: 12, name: 'Responsible Consumption and Production', description: 'Ensure sustainable consumption' },
  { number: 13, name: 'Climate Action', description: 'Take urgent action to combat climate change' },
  { number: 14, name: 'Life Below Water', description: 'Conserve and sustainably use oceans' },
  { number: 15, name: 'Life on Land', description: 'Protect and restore terrestrial ecosystems' },
  { number: 16, name: 'Peace, Justice and Strong Institutions', description: 'Promote peaceful and inclusive societies' },
  { number: 17, name: 'Partnerships for the Goals', description: 'Strengthen means of implementation' }
];

// ============================================================================
// LOCAL LAW DATABASE (Examples for key countries)
// ============================================================================

interface LocalLawDatabase {
  [country: string]: {
    [standardId: string]: LocalLawReference[];
  };
}

const LOCAL_LAW_DATABASE: LocalLawDatabase = {
  'Vietnam': {
    'PS5': [
      {
        country: 'Vietnam',
        lawName: 'Vietnam Land Law 2013',
        lawCode: 'Law No. 45/2013/QH13',
        relevantArticles: ['Article 62 (Land Recovery)', 'Article 74-75 (Compensation)', 'Article 83 (Resettlement)'],
        enforcingAgency: 'Provincial People\'s Committee',
        requiredActions: ['File Form 3B with local People\'s Committee', 'Obtain land use rights certificate', 'Complete compensation assessment'],
        typicalTimeline: '6-18 months',
        estimatedCost: 'Variable based on land area and value'
      },
      {
        country: 'Vietnam',
        lawName: 'Decree 47/2014/ND-CP on Compensation',
        lawCode: 'Decree 47/2014/ND-CP',
        relevantArticles: ['Chapter II (Compensation Rates)', 'Chapter III (Support Policies)'],
        enforcingAgency: 'Department of Natural Resources and Environment',
        requiredActions: ['Conduct asset inventory', 'Calculate replacement cost', 'Establish grievance committee'],
        typicalTimeline: '3-6 months',
        estimatedCost: 'Based on market rates + 30% premium'
      }
    ],
    'PS2': [
      {
        country: 'Vietnam',
        lawName: 'Labor Code 2019',
        lawCode: 'Law No. 45/2019/QH14',
        relevantArticles: ['Article 8 (Prohibited Acts)', 'Chapter X (Occupational Safety)', 'Chapter XIII (Trade Unions)'],
        enforcingAgency: 'Ministry of Labour, Invalids and Social Affairs (MOLISA)',
        requiredActions: ['Register labor contract', 'Establish internal labor regulations', 'Register with social insurance'],
        typicalTimeline: '1-3 months',
        estimatedCost: 'Administrative fees + social insurance contributions'
      }
    ],
    'PS1': [
      {
        country: 'Vietnam',
        lawName: 'Law on Environmental Protection 2020',
        lawCode: 'Law No. 72/2020/QH14',
        relevantArticles: ['Chapter IV (EIA)', 'Article 30 (Environmental Protection Plan)', 'Chapter VIII (Waste)'],
        enforcingAgency: 'Ministry of Natural Resources and Environment (MONRE)',
        requiredActions: ['Submit Environmental Impact Assessment', 'Obtain Environmental Protection Commitment', 'Install monitoring equipment'],
        typicalTimeline: '3-12 months depending on project category',
        estimatedCost: 'EIA cost: $5,000-$50,000 depending on project scale'
      }
    ]
  },
  'Philippines': {
    'PS5': [
      {
        country: 'Philippines',
        lawName: 'Comprehensive Agrarian Reform Law (CARL)',
        lawCode: 'RA 6657 as amended by RA 9700',
        relevantArticles: ['Section 16 (Procedure)', 'Section 17 (Determination of Just Compensation)'],
        enforcingAgency: 'Department of Agrarian Reform (DAR)',
        requiredActions: ['File application with DAR', 'Conduct land survey', 'Complete Land Use Conversion approval'],
        typicalTimeline: '12-24 months',
        estimatedCost: 'Just compensation + conversion fees'
      }
    ],
    'PS1': [
      {
        country: 'Philippines',
        lawName: 'Philippine Environmental Impact Statement System',
        lawCode: 'PD 1586 and DAO 2003-30',
        relevantArticles: ['Section 4 (Environmentally Critical Projects)', 'Section 5 (ECC Requirements)'],
        enforcingAgency: 'Department of Environment and Natural Resources (DENR) - EMB',
        requiredActions: ['Submit Environmental Impact Statement', 'Obtain Environmental Compliance Certificate (ECC)', 'Conduct public consultations'],
        typicalTimeline: '6-12 months',
        estimatedCost: '$10,000-$100,000 for full EIS'
      }
    ],
    'PS2': [
      {
        country: 'Philippines',
        lawName: 'Philippine Labor Code',
        lawCode: 'PD 442 as amended',
        relevantArticles: ['Book III (Conditions of Employment)', 'Book IV (Health, Safety and Social Welfare)'],
        enforcingAgency: 'Department of Labor and Employment (DOLE)',
        requiredActions: ['Register with DOLE', 'Submit employment reports', 'Comply with OSH standards'],
        typicalTimeline: '1-2 months',
        estimatedCost: 'Registration fees + compliance costs'
      }
    ]
  },
  'Indonesia': {
    'PS5': [
      {
        country: 'Indonesia',
        lawName: 'Land Acquisition Law for Public Interest',
        lawCode: 'Law No. 2/2012',
        relevantArticles: ['Article 13-17 (Planning)', 'Article 27-39 (Acquisition)', 'Article 40-44 (Compensation)'],
        enforcingAgency: 'National Land Agency (BPN)',
        requiredActions: ['Prepare spatial plan', 'Complete public consultation', 'Obtain location permit'],
        typicalTimeline: '18-36 months',
        estimatedCost: 'Market rate + 20% premium + transaction costs'
      }
    ],
    'PS1': [
      {
        country: 'Indonesia',
        lawName: 'Environmental Protection and Management Law',
        lawCode: 'Law No. 32/2009 and PP 22/2021',
        relevantArticles: ['Article 22-33 (AMDAL)', 'Article 34-35 (UKL-UPL)'],
        enforcingAgency: 'Ministry of Environment and Forestry (KLHK)',
        requiredActions: ['Submit AMDAL documents', 'Conduct environmental feasibility study', 'Obtain environmental permit via OSS'],
        typicalTimeline: '3-9 months via OSS-RBA',
        estimatedCost: '$20,000-$150,000 for full AMDAL'
      }
    ]
  },
  'Thailand': {
    'PS1': [
      {
        country: 'Thailand',
        lawName: 'Enhancement and Conservation of National Environmental Quality Act',
        lawCode: 'B.E. 2535 (1992) as amended',
        relevantArticles: ['Section 46-51 (EIA Requirements)', 'Ministerial Notifications on EIA'],
        enforcingAgency: 'Office of Natural Resources and Environmental Policy and Planning (ONEP)',
        requiredActions: ['Submit EIA report', 'Obtain approval from Expert Review Committee', 'Implement Environmental Management Plan'],
        typicalTimeline: '6-12 months',
        estimatedCost: '$30,000-$200,000'
      }
    ]
  },
  'Singapore': {
    'PS1': [
      {
        country: 'Singapore',
        lawName: 'Environmental Protection and Management Act',
        lawCode: 'Cap. 94A',
        relevantArticles: ['Part IV (Trade Effluent)', 'Part V (Hazardous Substances)'],
        enforcingAgency: 'National Environment Agency (NEA)',
        requiredActions: ['Apply for relevant licenses', 'Submit pollution control equipment plans', 'Register toxic substances'],
        typicalTimeline: '1-3 months',
        estimatedCost: 'License fees + equipment costs'
      }
    ]
  }
};

// ============================================================================
// IFC GLOBAL STANDARDS ENGINE CLASS
// ============================================================================

export class IFCGlobalStandardsEngine {
  
  /**
   * Run comprehensive global standards assessment
   * This is the "World Law Translator" - applies universal standards, finds gaps, bridges to local law
   */
  static assessProject(params: IFCProjectParams): GlobalStandardsAssessment {
    const startTime = Date.now();
    
    const ifcAssessments: StandardAssessment[] = [];
    const criticalGaps: ComplianceGap[] = [];
    const sdgAlignment: SDGAlignment[] = [];
    
    // ========================================================================
    // PHASE 1: UNIVERSAL SKELETON - Apply IFC Performance Standards
    // ========================================================================
    
    // PS1 Assessment
    const ps1 = this.assessPS1(params);
    ifcAssessments.push(ps1);
    criticalGaps.push(...ps1.gaps.filter(g => g.severity === 'critical'));
    
    // PS2 Assessment
    const ps2 = this.assessPS2(params);
    ifcAssessments.push(ps2);
    criticalGaps.push(...ps2.gaps.filter(g => g.severity === 'critical'));
    
    // PS3 Assessment
    const ps3 = this.assessPS3(params);
    ifcAssessments.push(ps3);
    criticalGaps.push(...ps3.gaps.filter(g => g.severity === 'critical'));
    
    // PS4 Assessment
    const ps4 = this.assessPS4(params);
    ifcAssessments.push(ps4);
    criticalGaps.push(...ps4.gaps.filter(g => g.severity === 'critical'));
    
    // PS5 Assessment (only if land acquisition involved)
    if (params.requiresLandAcquisition) {
      const ps5 = this.assessPS5(params);
      ifcAssessments.push(ps5);
      criticalGaps.push(...ps5.gaps.filter(g => g.severity === 'critical'));
    }
    
    // PS6 Assessment
    const ps6 = this.assessPS6(params);
    ifcAssessments.push(ps6);
    criticalGaps.push(...ps6.gaps.filter(g => g.severity === 'critical'));
    
    // PS7 Assessment (only if indigenous peoples present)
    if (params.indigenousPresent) {
      const ps7 = this.assessPS7(params);
      ifcAssessments.push(ps7);
      criticalGaps.push(...ps7.gaps.filter(g => g.severity === 'critical'));
    }
    
    // PS8 Assessment (only if cultural heritage present)
    if (params.culturalHeritagePresent) {
      const ps8 = this.assessPS8(params);
      ifcAssessments.push(ps8);
      criticalGaps.push(...ps8.gaps.filter(g => g.severity === 'critical'));
    }
    
    // ========================================================================
    // PHASE 2: GAP ANALYSIS - Find where they fall short
    // ========================================================================
    
    // Enrich gaps with local law references (Phase 3: Genetic Mind)
    for (const gap of criticalGaps) {
      const localLaw = this.findLocalLaw(params.country, gap.standard);
      if (localLaw) {
        gap.localLawReference = localLaw;
      }
    }
    
    // ========================================================================
    // PHASE 3: SDG ALIGNMENT
    // ========================================================================
    
    for (const sdg of UN_SDGS) {
      const alignment = this.assessSDGAlignment(sdg.number, params, ifcAssessments);
      sdgAlignment.push(alignment);
    }
    
    // ========================================================================
    // CALCULATE OVERALL SCORES
    // ========================================================================
    
    const compliantCount = ifcAssessments.filter(a => a.status === 'compliant').length;
    const totalAssessed = ifcAssessments.length;
    const universalCompliance = Math.round((compliantCount / totalAssessed) * 100);
    
    const overallScore = Math.round(
      ifcAssessments.reduce((sum, a) => sum + a.score, 0) / ifcAssessments.length
    );
    
    let overallStatus: 'green' | 'yellow' | 'red';
    if (criticalGaps.length === 0 && overallScore >= 70) {
      overallStatus = 'green';
    } else if (criticalGaps.length <= 2 && overallScore >= 50) {
      overallStatus = 'yellow';
    } else {
      overallStatus = 'red';
    }
    
    // Report is generable if no critical blocking gaps
    const reportGenerable = criticalGaps.filter(g => 
      g.standard === 'PS7' || // Indigenous rights FPIC is absolute
      (g.standard === 'PS5' && !params.hasResettlementPlan && params.displacesCommunities)
    ).length === 0;
    
    const reportConditions: string[] = [];
    if (!reportGenerable) {
      reportConditions.push('Critical compliance gaps must be addressed before report generation');
    }
    for (const gap of criticalGaps) {
      reportConditions.push(`FLAG: ${gap.description}`);
    }
    
    return {
      projectId: `IFC-${Date.now()}`,
      country: params.country,
      sector: params.sector,
      assessmentDate: new Date().toISOString(),
      overallScore,
      overallStatus,
      ifcAssessments,
      sdgAlignment,
      criticalGaps,
      reportGenerable,
      reportConditions,
      universalCompliance,
      localGapCount: criticalGaps.filter(g => g.localLawReference).length,
      processingTimeMs: Date.now() - startTime
    };
  }
  
  /**
   * PS1: Environmental and Social Management System Assessment
   */
  private static assessPS1(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (params.hasESMS) { score += 30; strengths.push('Environmental and Social Management System in place'); }
    else { 
      gaps.push({
        id: 'PS1-GAP-1',
        standard: 'PS1',
        severity: 'critical',
        description: 'No Environmental and Social Management System (ESMS) documented',
        businessImpact: 'IFC and DFI financing will be blocked. ESG investors will decline.',
        remediation: {
          steps: ['Develop ESMS policy', 'Document procedures', 'Train staff', 'Implement monitoring'],
          estimatedDays: 60,
          documents: ['ESMS Policy', 'Procedures Manual', 'Training Records', 'Monitoring Plan'],
          consultantsNeeded: ['Environmental consultant', 'Social specialist'],
          cost: 'medium'
        }
      });
    }
    
    if (params.hasESIA) { score += 25; strengths.push('Environmental and Social Impact Assessment completed'); }
    else {
      gaps.push({
        id: 'PS1-GAP-2',
        standard: 'PS1',
        severity: 'major',
        description: 'No Environmental and Social Impact Assessment (ESIA) conducted',
        businessImpact: 'Unable to identify and mitigate project risks. Regulatory delays likely.',
        remediation: {
          steps: ['Commission ESIA study', 'Conduct baseline surveys', 'Hold public consultations', 'Document findings'],
          estimatedDays: 120,
          documents: ['ESIA Report', 'Baseline Studies', 'Consultation Records'],
          consultantsNeeded: ['ESIA consultant', 'Environmental specialist'],
          cost: 'high'
        }
      });
    }
    
    if (params.hasStakeholderPlan) { score += 20; strengths.push('Stakeholder engagement plan established'); }
    else {
      gaps.push({
        id: 'PS1-GAP-3',
        standard: 'PS1',
        severity: 'major',
        description: 'No stakeholder engagement plan',
        businessImpact: 'Community opposition risk. Social license to operate at risk.',
        remediation: {
          steps: ['Identify stakeholders', 'Develop engagement strategy', 'Establish communication channels'],
          estimatedDays: 30,
          documents: ['Stakeholder Map', 'Engagement Plan', 'Communication Protocol'],
          consultantsNeeded: ['Social specialist'],
          cost: 'low'
        }
      });
    }
    
    if (params.hasGrievanceMechanism) { score += 25; strengths.push('Grievance mechanism operational'); }
    else {
      gaps.push({
        id: 'PS1-GAP-4',
        standard: 'PS1',
        severity: 'major',
        description: 'No grievance mechanism for affected communities',
        businessImpact: 'Unable to address community concerns. Escalation risk.',
        remediation: {
          steps: ['Design grievance procedure', 'Establish intake channels', 'Train staff', 'Publicize mechanism'],
          estimatedDays: 30,
          documents: ['Grievance Procedure', 'Intake Forms', 'Resolution Tracking System'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS1',
      standardName: 'Assessment and Management of Environmental and Social Risks',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS2: Labor and Working Conditions Assessment
   */
  private static assessPS2(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (params.hasLaborPolicies) { score += 20; strengths.push('Written labor policies in place'); }
    
    if (params.prohibitsChildLabor) { score += 30; strengths.push('Child labor prohibition documented'); }
    else {
      gaps.push({
        id: 'PS2-GAP-1',
        standard: 'PS2',
        severity: 'critical',
        description: 'No explicit child labor prohibition policy',
        businessImpact: 'CRITICAL: Absolute requirement for ALL international financing and ethical investment',
        remediation: {
          steps: ['Draft child labor policy', 'Implement age verification', 'Train HR staff', 'Audit supply chain'],
          estimatedDays: 14,
          documents: ['Child Labor Policy', 'Age Verification Procedure', 'Supply Chain Audit Protocol'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    if (params.prohibitsForcedLabor) { score += 30; strengths.push('Forced labor prohibition documented'); }
    else {
      gaps.push({
        id: 'PS2-GAP-2',
        standard: 'PS2',
        severity: 'critical',
        description: 'No explicit forced labor prohibition policy',
        businessImpact: 'CRITICAL: Absolute requirement. US, UK, AU import bans for forced labor products.',
        remediation: {
          steps: ['Draft forced labor policy', 'Review working conditions', 'Audit recruitment practices', 'Document worker freedom'],
          estimatedDays: 14,
          documents: ['Forced Labor Policy', 'Recruitment Audit', 'Worker Freedom Assessment'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    if (params.hasOHSProgram) { score += 20; strengths.push('Occupational health and safety program operational'); }
    else {
      gaps.push({
        id: 'PS2-GAP-3',
        standard: 'PS2',
        severity: 'major',
        description: 'No occupational health and safety program',
        businessImpact: 'Worker injury risk. Regulatory penalties. Insurance issues.',
        remediation: {
          steps: ['Conduct hazard assessment', 'Develop OHS policy', 'Implement safety protocols', 'Train workers'],
          estimatedDays: 45,
          documents: ['OHS Policy', 'Hazard Assessment', 'Safety Protocols', 'Training Records'],
          consultantsNeeded: ['OHS specialist'],
          cost: 'medium'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS2',
      standardName: 'Labor and Working Conditions',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS3: Resource Efficiency and Pollution Prevention
   */
  private static assessPS3(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (params.hasResourceTargets) { score += 35; strengths.push('Resource efficiency targets set'); }
    else {
      gaps.push({
        id: 'PS3-GAP-1',
        standard: 'PS3',
        severity: 'minor',
        description: 'No documented resource efficiency targets',
        businessImpact: 'Missed cost savings. Weaker ESG profile.',
        remediation: {
          steps: ['Baseline resource usage', 'Set reduction targets', 'Implement monitoring'],
          estimatedDays: 30,
          documents: ['Resource Efficiency Plan', 'Monitoring Protocol'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    if (params.hasWasteManagement) { score += 35; strengths.push('Waste management plan implemented'); }
    else {
      gaps.push({
        id: 'PS3-GAP-2',
        standard: 'PS3',
        severity: 'major',
        description: 'No waste management plan',
        businessImpact: 'Environmental compliance risk. Permit issues.',
        remediation: {
          steps: ['Categorize waste streams', 'Establish handling procedures', 'Contract licensed disposal', 'Document chain of custody'],
          estimatedDays: 30,
          documents: ['Waste Management Plan', 'Disposal Contracts', 'Chain of Custody Records'],
          consultantsNeeded: ['Environmental consultant'],
          cost: 'medium'
        }
      });
    }
    
    if (params.hasPollutionPrevention) { score += 30; strengths.push('Pollution prevention measures in place'); }
    
    let status: StandardAssessment['status'];
    if (score >= 70) status = 'compliant';
    else if (score >= 40) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS3',
      standardName: 'Resource Efficiency and Pollution Prevention',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS4: Community Health, Safety, and Security
   */
  private static assessPS4(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (params.hasCommunityHealthAssessment) { score += 50; strengths.push('Community health assessment completed'); }
    else {
      gaps.push({
        id: 'PS4-GAP-1',
        standard: 'PS4',
        severity: 'major',
        description: 'No community health and safety assessment',
        businessImpact: 'Community opposition risk. Permit challenges.',
        remediation: {
          steps: ['Identify community risks', 'Assess health impacts', 'Develop mitigation measures'],
          estimatedDays: 45,
          documents: ['Community Health Assessment', 'Mitigation Plan'],
          consultantsNeeded: ['Public health specialist'],
          cost: 'medium'
        }
      });
    }
    
    if (params.hasEmergencyPreparedness) { score += 50; strengths.push('Emergency preparedness plan operational'); }
    else {
      gaps.push({
        id: 'PS4-GAP-2',
        standard: 'PS4',
        severity: 'major',
        description: 'No emergency preparedness plan',
        businessImpact: 'Community safety risk. Liability exposure.',
        remediation: {
          steps: ['Develop emergency plan', 'Establish communication systems', 'Train response teams', 'Conduct drills'],
          estimatedDays: 30,
          documents: ['Emergency Response Plan', 'Training Records', 'Drill Reports'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS4',
      standardName: 'Community Health, Safety, and Security',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS5: Land Acquisition and Involuntary Resettlement
   */
  private static assessPS5(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (!params.displacesCommunities) {
      score = 100;
      strengths.push('No physical or economic displacement');
      return {
        standardId: 'PS5',
        standardName: 'Land Acquisition and Involuntary Resettlement',
        score: 100,
        status: 'compliant',
        gaps: [],
        strengths,
        actionRequired: false
      };
    }
    
    if (params.hasResettlementPlan) { score += 40; strengths.push('Resettlement Action Plan prepared'); }
    else {
      gaps.push({
        id: 'PS5-GAP-1',
        standard: 'PS5',
        severity: 'critical',
        description: 'Displacement without Resettlement Action Plan',
        businessImpact: 'CRITICAL: DFI financing blocked. Human rights violation risk. Reputational damage.',
        remediation: {
          steps: ['Commission baseline survey', 'Census affected persons', 'Develop RAP with community', 'Establish compensation framework', 'Set up grievance mechanism'],
          estimatedDays: 180,
          documents: ['Resettlement Action Plan', 'Baseline Survey', 'Census Data', 'Compensation Framework', 'Grievance Procedure'],
          consultantsNeeded: ['Resettlement specialist', 'Social specialist', 'Legal counsel'],
          cost: 'high'
        }
      });
    }
    
    if (params.hasLivelihoodPlan) { score += 30; strengths.push('Livelihood Restoration Plan prepared'); }
    else {
      gaps.push({
        id: 'PS5-GAP-2',
        standard: 'PS5',
        severity: 'major',
        description: 'No Livelihood Restoration Plan for displaced persons',
        businessImpact: 'Failed resettlement outcomes. Ongoing community conflict.',
        remediation: {
          steps: ['Assess livelihood impacts', 'Identify restoration options', 'Develop support programs', 'Set monitoring indicators'],
          estimatedDays: 90,
          documents: ['Livelihood Restoration Plan', 'Impact Assessment', 'Monitoring Framework'],
          consultantsNeeded: ['Livelihood specialist'],
          cost: 'medium'
        }
      });
    }
    
    // Compensation at replacement cost
    score += 30; // Assumed if they got this far
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS5',
      standardName: 'Land Acquisition and Involuntary Resettlement',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS6: Biodiversity Conservation
   */
  private static assessPS6(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 50; // Baseline
    
    if (!params.nearCriticalHabitat) {
      score = 100;
      strengths.push('Not located in or near critical habitat');
      return {
        standardId: 'PS6',
        standardName: 'Biodiversity Conservation',
        score: 100,
        status: 'compliant',
        gaps: [],
        strengths,
        actionRequired: false
      };
    }
    
    if (params.hasBiodiversityPlan) { score += 50; strengths.push('Biodiversity management plan in place'); }
    else {
      gaps.push({
        id: 'PS6-GAP-1',
        standard: 'PS6',
        severity: 'critical',
        description: 'Project near critical habitat without biodiversity management plan',
        businessImpact: 'CRITICAL: IFC financing requires no net loss / net gain in critical habitats.',
        remediation: {
          steps: ['Commission biodiversity assessment', 'Identify habitat values', 'Develop conservation measures', 'Design offset strategy if needed'],
          estimatedDays: 120,
          documents: ['Biodiversity Assessment', 'Habitat Management Plan', 'Offset Strategy'],
          consultantsNeeded: ['Ecologist', 'Biodiversity specialist'],
          cost: 'high'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS6',
      standardName: 'Biodiversity Conservation',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS7: Indigenous Peoples
   */
  private static assessPS7(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 0;
    
    if (!params.indigenousPresent) {
      return {
        standardId: 'PS7',
        standardName: 'Indigenous Peoples',
        score: 100,
        status: 'not-applicable',
        gaps: [],
        strengths: ['No Indigenous Peoples in project area'],
        actionRequired: false
      };
    }
    
    if (params.hasFPIC) { score += 60; strengths.push('Free, Prior and Informed Consent obtained'); }
    else {
      gaps.push({
        id: 'PS7-GAP-1',
        standard: 'PS7',
        severity: 'critical',
        description: 'No Free, Prior and Informed Consent (FPIC) from Indigenous Peoples',
        businessImpact: 'ABSOLUTE BLOCKER: No DFI, ESG, or ethical investment possible without FPIC.',
        remediation: {
          steps: ['Engage community leaders', 'Document consent process', 'Allow adequate time for deliberation', 'Document consent or non-consent outcome'],
          estimatedDays: 180,
          documents: ['FPIC Process Documentation', 'Consent Records', 'Community Agreements'],
          consultantsNeeded: ['Indigenous rights specialist', 'Social specialist', 'Legal counsel'],
          cost: 'medium'
        }
      });
    }
    
    if (params.hasIndigenousPlan) { score += 40; strengths.push('Indigenous Peoples Plan developed'); }
    else if (params.indigenousPresent && !params.hasFPIC) {
      gaps.push({
        id: 'PS7-GAP-2',
        standard: 'PS7',
        severity: 'major',
        description: 'No Indigenous Peoples Plan',
        businessImpact: 'Cannot demonstrate commitment to ongoing engagement and benefit-sharing.',
        remediation: {
          steps: ['Develop plan with community participation', 'Define benefit-sharing arrangements', 'Establish ongoing engagement mechanism'],
          estimatedDays: 90,
          documents: ['Indigenous Peoples Plan', 'Benefit-Sharing Agreement', 'Engagement Protocol'],
          consultantsNeeded: ['Indigenous rights specialist'],
          cost: 'medium'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS7',
      standardName: 'Indigenous Peoples',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * PS8: Cultural Heritage
   */
  private static assessPS8(params: IFCProjectParams): StandardAssessment {
    const gaps: ComplianceGap[] = [];
    const strengths: string[] = [];
    let score = 50; // Baseline
    
    if (!params.culturalHeritagePresent) {
      return {
        standardId: 'PS8',
        standardName: 'Cultural Heritage',
        score: 100,
        status: 'not-applicable',
        gaps: [],
        strengths: ['No cultural heritage in project area'],
        actionRequired: false
      };
    }
    
    if (params.hasChanceFindsProcedure) { score += 50; strengths.push('Chance finds procedure in place'); }
    else {
      gaps.push({
        id: 'PS8-GAP-1',
        standard: 'PS8',
        severity: 'major',
        description: 'No chance finds procedure for cultural heritage',
        businessImpact: 'Risk of irreversible damage to heritage. Legal liability.',
        remediation: {
          steps: ['Develop chance finds procedure', 'Train site workers', 'Establish reporting chain'],
          estimatedDays: 14,
          documents: ['Chance Finds Procedure', 'Training Records'],
          consultantsNeeded: [],
          cost: 'low'
        }
      });
    }
    
    let status: StandardAssessment['status'];
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non-compliant';
    
    return {
      standardId: 'PS8',
      standardName: 'Cultural Heritage',
      score,
      status,
      gaps,
      strengths,
      actionRequired: gaps.length > 0
    };
  }
  
  /**
   * Find local law to bridge gap (The "Genetic Mind" function)
   */
  private static findLocalLaw(country: string, standardId: string): LocalLawReference | undefined {
    const countryLaws = LOCAL_LAW_DATABASE[country];
    if (!countryLaws) return undefined;
    
    const standardLaws = countryLaws[standardId];
    if (!standardLaws || standardLaws.length === 0) return undefined;
    
    return standardLaws[0]; // Return first applicable law
  }
  
  /**
   * Assess SDG alignment
   */
  private static assessSDGAlignment(sdgNumber: number, params: IFCProjectParams, ifcAssessments: StandardAssessment[]): SDGAlignment {
    const sdg = UN_SDGS.find(s => s.number === sdgNumber)!;
    const contributions: string[] = [];
    const risks: string[] = [];
    let score = 50; // Neutral baseline
    
    // Link IFC standards to SDGs
    const relatedStandards = IFC_PERFORMANCE_STANDARDS.filter(ps => ps.relatedSDGs.includes(sdgNumber));
    
    for (const standard of relatedStandards) {
      const assessment = ifcAssessments.find(a => a.standardId === standard.id);
      if (assessment) {
        if (assessment.status === 'compliant') {
          score += 10;
          contributions.push(`${standard.shortName} compliance supports SDG ${sdgNumber}`);
        } else if (assessment.status === 'non-compliant') {
          score -= 15;
          risks.push(`${standard.shortName} gaps undermine SDG ${sdgNumber} commitment`);
        }
      }
    }
    
    // Sector-specific contributions
    if (params.sector === 'renewable-energy' && [7, 13].includes(sdgNumber)) {
      score += 20;
      contributions.push('Renewable energy directly advances clean energy and climate action');
    }
    if (params.sector === 'education' && sdgNumber === 4) {
      score += 25;
      contributions.push('Education sector directly advances quality education');
    }
    if (params.sector === 'healthcare' && sdgNumber === 3) {
      score += 25;
      contributions.push('Healthcare sector directly advances good health');
    }
    
    return {
      sdgNumber,
      sdgName: sdg.name,
      alignmentScore: Math.max(0, Math.min(100, score)),
      contributions,
      risks
    };
  }
  
  /**
   * Get all IFC Performance Standards
   */
  static getAllStandards(): IFCPerformanceStandard[] {
    return [...IFC_PERFORMANCE_STANDARDS];
  }
  
  /**
   * Get all UN SDGs
   */
  static getAllSDGs(): typeof UN_SDGS {
    return [...UN_SDGS];
  }
  
  /**
   * Quick check if country has local law coverage
   */
  static hasLocalLawCoverage(country: string): boolean {
    return country in LOCAL_LAW_DATABASE;
  }
  
  /**
   * Get available local laws for a country
   */
  static getLocalLawCoverage(country: string): { standard: string; laws: LocalLawReference[] }[] {
    const countryLaws = LOCAL_LAW_DATABASE[country];
    if (!countryLaws) return [];
    
    return Object.entries(countryLaws).map(([standard, laws]) => ({
      standard,
      laws
    }));
  }
  
  /**
   * Get compliance summary for GlobalComplianceFramework integration
   */
  static getGlobalComplianceSummary(country: string): {
    ifcCoverage: boolean;
    countryProfile: CountryComplianceProfile | undefined;
    regionalBlocs: string[];
    applicableDFIs: string[];
  } {
    const countryProfile = GlobalComplianceFramework.getCountryProfile(country);
    const blocs = GlobalComplianceFramework.getCountryBlocs(country);
    
    return {
      ifcCoverage: this.hasLocalLawCoverage(country),
      countryProfile,
      regionalBlocs: blocs.map(b => b.acronym),
      applicableDFIs: ['IFC', 'ADB', 'World Bank', 'AIIB'] // Applicable to most countries
    };
  }
}

export default IFCGlobalStandardsEngine;
