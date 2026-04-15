/**
 * 
 * LOCATION INTELLIGENCE DOCUMENT GENERATOR
 * 
 * 
 * Transforms research results into institutional-grade documents:
 * - Country Profile Reports
 * - Investment Briefs
 * - Risk Assessment Documents
 * - Market Entry Guides
 * - Executive Summaries
 * 
 * Features:
 * - Professional formatting with headers and sections
 * - Citation support with footnotes
 * - Data tables and structured information
 * - PDF/HTML export ready
 * - Executive summaries and key findings
 */

import { type MultiSourceResult, type DataQualityReport, type SourceCitation } from './multiSourceResearchService_v2';
import { type EnhancedNarratives } from './narrativeSynthesisEngine';
import { type CityProfile } from '../data/globalLocationProfiles';

export interface DocumentSection {
  title: string;
  level: number;
  content: string;
  subsections?: DocumentSection[];
  citations?: string[];
  dataTable?: {
    headers: string[];
    rows: string[][];
  };
}

export interface GeneratedDocument {
  title: string;
  metadata: {
    generatedDate: string;
    location: string;
    completenessScore: number;
    totalSources: number;
  };
  sections: DocumentSection[];
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  citations: string[];
  appendices: Array<{
    title: string;
    content: string;
  }>;
}

class LocationIntelligenceDocumentGenerator {
  /**
   * Generate complete country profile report
   */
  generateCountryProfile(result: MultiSourceResult): GeneratedDocument {
    const { profile, narratives, sources, dataQuality } = result;
    const baseDoc = this.createBaseDocument(profile, 'Country Profile Report');

    baseDoc.sections = [
      this.createExecutiveOverviewSection(profile),
      this.createGeographicContextSection(profile, narratives),
      this.createEconomicAnalysisSection(profile, narratives),
      this.createGovernanceAndLeadershipSection(profile, narratives),
      this.createInfrastructureSection(profile, narratives),
      this.createDemographicsSection(profile),
      this.createKeySectorsSection(profile),
      this.createInvestmentFrameworkSection(profile, narratives)
    ];

    baseDoc.keyFindings = this.extractKeyFindings(profile, narratives, dataQuality);
    baseDoc.recommendations = this.generateInvestmentRecommendations();
    baseDoc.citations = this.formatCitations(sources);

    return baseDoc;
  }

  /**
   * Generate investment opportunity brief
   */
  generateInvestmentBrief(result: MultiSourceResult): GeneratedDocument {
    const { profile, narratives, sources } = result;
    const baseDoc = this.createBaseDocument(profile, 'Investment Opportunity Brief');

    baseDoc.sections = [
      this.createInvestmentExecutiveSummary(profile),
      this.createMarketOpportunitySection(profile, narratives),
      this.createCompetitiveAdvantageSection(profile),
      this.createRiskAnalysisSection(profile, narratives),
      this.createFinancialOutlookSection(profile, narratives),
      this.createImplementationRoadmapSection(),
      this.createPartnershipFrameworkSection()
    ];

    baseDoc.keyFindings = [
      `Strategic location in ${profile.region} with access to ${profile.globalMarketAccess}`,
      `Investment momentum score: ${profile.investmentMomentum}/100`,
      `Documented presence of ${profile.keySectors?.length || 0} key economic sectors`,
      `Regulatory friction index: ${profile.regulatoryFriction}/100`,
      `Infrastructure readiness: ${profile.infrastructureScore}/100`
    ];

    baseDoc.recommendations = [
      `Initiate direct engagement with ${profile.city} Investment Promotion Office`,
      `Conduct site visits to key industrial parks and special economic zones`,
      `Review current government investment incentive programs`,
      `Assess infrastructure readiness against specific business requirements`,
      `Establish preliminary partnerships with local business associations`
    ];

    baseDoc.citations = this.formatCitations(sources);
    return baseDoc;
  }

  /**
   * Generate risk assessment document
   */
  generateRiskAssessment(result: MultiSourceResult): GeneratedDocument {
    const { profile, sources } = result;
    const baseDoc = this.createBaseDocument(profile, 'Risk Assessment & Mitigation Strategy');

    baseDoc.sections = [
      this.createRiskExecutiveSummary(profile),
      this.createSystemicRisksSection(profile),
      this.createIdiosyncraticRisksSection(profile),
      this.createMitigationStrategiesSection(),
      this.createComplianceFrameworkSection(profile),
      this.createContingencyPlanningSection()
    ];

    baseDoc.keyFindings = [
      `Political Stability Score: ${profile.politicalStability}/100`,
      `Regulatory Friction Index: ${profile.regulatoryFriction}/100`,
      `Infrastructure Risk Score: ${100 - profile.infrastructureScore}/100`,
      `Market Development Stage: Emerging/Established`,
      `External Shock Vulnerability: Medium-High`
    ];

    baseDoc.recommendations = [
      `Implement phased market entry to reduce exposure during initial phase`,
      `Establish supply chain redundancy for critical inputs`,
      `Maintain currency hedging strategies for foreign exchange risk`,
      `Regular monitoring of political and regulatory developments`,
      `Develop scenario contingency plans for major adverse events`
    ];

    baseDoc.citations = this.formatCitations(sources);
    return baseDoc;
  }

  /**
   * Generate market entry guide
   */
  generateMarketEntryGuide(result: MultiSourceResult): GeneratedDocument {
    const { profile, sources } = result;
    const baseDoc = this.createBaseDocument(profile, 'Market Entry Implementation Guide');

    baseDoc.sections = [
      this.createMarketEntryOverviewSection(profile),
      this.createRegulatoryRequirementsSection(),
      this.createBusinessRegistrationSection(),
      this.createLaborAndEmploymentSection(profile),
      this.createTaxAndFinancialSection(),
      this.createOperationalSetupSection(profile),
      this.createLocalPartnershipGuideSection(),
      this.createTimelinesAndChecklistsSection(profile)
    ];

    baseDoc.keyFindings = [
      `Primary language: ${profile.demographics?.languages?.[0] || 'Check country data'}`,
      `Business hours: ${profile.businessHours}`,
      `Currency: ${profile.currency}`,
      `Ease of Doing Business Score: See World Bank rankings`,
      `Estimated market entry timeline: 3-6 months`
    ];

    baseDoc.recommendations = this.generateImplementationSteps();
    baseDoc.citations = this.formatCitations(sources);

    return baseDoc;
  }

  /**
   * Generate sector-specific analysis
   */
  generateSectorAnalysis(result: MultiSourceResult, sector: string): GeneratedDocument {
    const { profile, sources } = result;
    const baseDoc = this.createBaseDocument(
      profile,
      `${sector} Sector Analysis in ${profile.city}`
    );

    baseDoc.sections = [
      this.createSectorOverviewSection(profile, sector),
      this.createMarketSizeAndGrowthSection(),
      this.createValueChainAnalysisSection(),
      this.createCompetitiveAnalysisSection(),
      this.createSupplyAndDemandSection(),
      this.createSkillsAndLaborSection(),
      this.createSectorSpecificRisksSection(),
      this.createSectorOpportunitiesSection()
    ];

    baseDoc.keyFindings = [
      `${sector} is a key economic sector in ${profile.city}`,
      `Workforce availability: ${this.estimateWorkforceAvailability(profile)}`,
      `Infrastructure support: ${this.evaluateInfrastructureForSector(profile)}`,
      `Government support level: Assess through investment office`,
      `Supply chain integration: Regional and national level`
    ];

    baseDoc.recommendations = [
      `Conduct detailed market research within specific sub-sectors`,
      `Identify key suppliers, buyers, and competitors`,
      `Assess technology transfer and skill development opportunities`,
      `Evaluate clustering opportunities with similar companies`,
      `Determine optimal facility location within city`
    ];

    baseDoc.citations = this.formatCitations(sources);
    return baseDoc;
  }

  // 
  // SECTION BUILDERS
  // 

  private createExecutiveOverviewSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Executive Overview',
      level: 1,
      content: `${profile.city} is a strategic urban center in ${profile.region}, ${profile.country}. ` +
        `The city serves as a hub for ${profile.knownFor?.slice(0, 2).join(' and ')} and demonstrates ` +
        `measurable capacity for regional and international commerce. This profile synthesizes data from ` +
        `authoritative government, international organization, and commercial sources to provide institutional-grade assessment.`,
      citations: ['Government sources', 'International organizations', 'Regional development data']
    };
  }

  private createGeographicContextSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Geographic Context & Location',
      level: 1,
      content: narratives.geography.paragraphs[0]?.text || `Located at ${profile.latitude}°N, ${profile.longitude}°E...`,
      subsections: [
        {
          title: 'Coordinates & Timezone',
          level: 2,
          content: `Latitude: ${profile.latitude}° | Longitude: ${profile.longitude}° | Timezone: ${profile.timezone}`
        },
        {
          title: 'Regional Position',
          level: 2,
          content: `${profile.city} is positioned within ${profile.region}, providing strategic access to ${profile.globalMarketAccess}. ` +
            `Geographic proximity to regional trade corridors and maritime routes supports logistics and commerce operations.`
        },
        {
          title: 'Climate & Environment',
          level: 2,
          content: `Climate Classification: ${profile.climate} | Area: ${profile.areaSize} | ` +
            `Environmental conditions affect infrastructure planning, agricultural potential, and operational resilience.`
        }
      ],
      dataTable: {
        headers: ['Metric', 'Value', 'Source'],
        rows: [
          ['Latitude', `${profile.latitude}°`, 'Geocoding Data'],
          ['Longitude', `${profile.longitude}°`, 'Geocoding Data'],
          ['Timezone', profile.timezone, 'Country Data'],
          ['Area Size', profile.areaSize, 'Geographic Surveys'],
          ['Climate', profile.climate, 'Environmental Data']
        ]
      }
    };
  }

  private createEconomicAnalysisSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    const econSection: DocumentSection = {
      title: 'Economic Profile & Analysis',
      level: 1,
      content: narratives.economy.paragraphs[0]?.text || 'Economic analysis derived from available regional data sources.',
      subsections: [
        {
          title: 'GDP & Growth',
          level: 2,
          content: `GDP: ${profile.economics?.gdpLocal || 'Not available for this location'} | ` +
            `Growth Rate: ${profile.economics?.gdpGrowthRate || 'Not available for this location'}`
        },
        {
          title: 'Major Industries',
          level: 2,
          content: `Key economic sectors include: ${profile.keySectors?.slice(0, 4).join(', ') || 'Multiple sectors'}. ` +
            `Each sector demonstrates documented capabilities and market presence in local economy.`
        },
        {
          title: 'Employment & Labor',
          level: 2,
          content: `Employment Rate: ${profile.economics?.employmentRate || 'Insufficient data'} | ` +
            `Labor Pool Score: ${profile.laborPool}/100 | ` +
            `Population: ${profile.demographics?.population || 'Not available for this location'}`
        },
        {
          title: 'Trade & Exports',
          level: 2,
          content: `Primary Trading Partners: ${profile.economics?.tradePartners?.slice(0, 3).join(', ') || 'Regional and international'} | ` +
            `Major Exports: ${profile.economics?.topExports?.slice(0, 3).join(', ') || 'See trade data'}`
        }
      ],
      dataTable: {
        headers: ['Economic Indicator', 'Value', 'Data Freshness'],
        rows: [
          ['GDP', profile.economics?.gdpLocal || 'N/A', 'Current Year'],
          ['Growth Rate', profile.economics?.gdpGrowthRate || 'N/A', 'Current Year'],
          ['Employment', profile.economics?.employmentRate || 'N/A', 'Latest Available'],
          ['Average Income', profile.economics?.avgIncome || 'N/A', 'Latest Available'],
          ['Export Volume', profile.economics?.exportVolume || 'N/A', 'Recent Data']
        ]
      }
    };

    return econSection;
  }

  private createGovernanceAndLeadershipSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    const leaders = profile.leaders || [];
    const leaderInfo = leaders.length > 0 && !leaders[0].name.includes('pending')
      ? `Current Leadership: ${leaders.map(l => `${l.name} (${l.role})`).join('; ')}`
      : 'Leadership information available through official government channels';

    return {
      title: 'Governance & Political Leadership',
      level: 1,
      content: narratives.governance.paragraphs[0]?.text || 'Governance structure information...',
      subsections: [
        {
          title: 'Government Structure',
          level: 2,
          content: `Administrative Structure: ${profile.departments?.join(', ') || 'City administration'} | ` +
            `Government Type: See country governance framework`
        },
        {
          title: 'Current Leadership',
          level: 2,
          content: leaderInfo
        },
        {
          title: 'Policy Environment',
          level: 2,
          content: `Political Stability Score: ${profile.politicalStability}/100 | ` +
            `Regulatory Friction: ${profile.regulatoryFriction}/100 | ` +
            `Policy Priorities: Assess through government websites and recent announcements`
        },
        {
          title: 'Administrative Contacts',
          level: 2,
          content: `For government interaction, contact local administrative offices. ` +
            `${profile.governmentLinks?.length > 0 ? 'Official links: ' + profile.governmentLinks.map(l => l.label).join('; ') : 'See official government website'}`
        }
      ]
    };
  }

  private createInfrastructureSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Infrastructure & Connectivity',
      level: 1,
      content: narratives.infrastructure.paragraphs[0]?.text || 'Infrastructure assessment...',
      subsections: [
        {
          title: 'Transportation',
          level: 2,
          content: `Airports: ${profile.infrastructure?.airports?.[0]?.name || 'No data available'} | ` +
            `Seaports: ${profile.infrastructure?.seaports?.[0]?.name || 'No data available'} | ` +
            `Infrastructure Score: ${profile.infrastructureScore}/100`
        },
        {
          title: 'Utilities & Power',
          level: 2,
          content: `Power Supply: ${profile.infrastructure?.powerCapacity || 'See utility provider'} | ` +
            `Reliability: Assess through operator records`
        },
        {
          title: 'Digital Infrastructure',
          level: 2,
          content: `Internet Penetration: ${profile.infrastructure?.internetPenetration || 'Not reported'} | ` +
            `Broadband Availability: Verify with telecom providers | ` +
            `Technology Support: Assess through business development organizations`
        }
      ],
      dataTable: {
        headers: ['Infrastructure Type', 'Status', 'Capacity/Quality'],
        rows: [
          ['Airports', profile.infrastructure?.airports?.[0]?.name || 'Not reported', 'Regional'],
          ['Seaports', profile.infrastructure?.seaports?.[0]?.name || 'Not reported', 'Regional'],
          ['Power', profile.infrastructure?.powerCapacity || 'Not reported', 'See utility provider'],
          ['Internet', profile.infrastructure?.internetPenetration || 'Not reported', 'Coverage expanding'],
          ['Roads/Transit', 'City network', 'Varies by area']
        ]
      }
    };
  }

  private createDemographicsSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Demographics & Population',
      level: 1,
      content: `${profile.city} has documented demographic characteristics that affect workforce availability, ` +
        `consumer market size, and long-term development potential.`,
      dataTable: {
        headers: ['Demographic Indicator', 'Value', 'Status'],
        rows: [
          ['Population', profile.demographics?.population || 'Data verification', 'Pending'],
          ['Population Growth', profile.demographics?.populationGrowth || 'Data verification', 'Pending'],
          ['Median Age', profile.demographics?.medianAge || 'Data verification', 'Pending'],
          ['Literacy Rate', profile.demographics?.literacyRate || 'Data verification', 'Pending'],
          ['Working Age Pop', profile.demographics?.workingAgePopulation || 'Data verification', 'Pending'],
          ['Languages', profile.demographics?.languages?.join(', ') || 'Check country', 'Verified']
        ]
      }
    };
  }

  private createKeySectorsSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Key Economic Sectors',
      level: 1,
      content: `${profile.city} economy is driven by ${profile.keySectors?.length} primary sectors, ` +
        `each with documented market presence and workforce specialization.`,
      subsections: profile.keySectors?.slice(0, 5).map((sector) => ({
        title: sector,
        level: 2,
        content: `${sector} represents a significant component of ${profile.city}'s economic base. ` +
          `Current employment, production capacity, and growth trajectory are documented through official sources.`
      })) || []
    };
  }

  private createInvestmentFrameworkSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Investment Framework & Opportunities',
      level: 1,
      content: narratives.investment.paragraphs[0]?.text || 'Investment opportunities...',
      subsections: [
        {
          title: 'Special Economic Zones',
          level: 2,
          content: `Zone Status: ${profile.infrastructure?.specialEconomicZones?.slice(0, 2).join('; ') || 'Contact investment office'} | ` +
            `Incentives: Tax holidays, import exemptions, infrastructure support`
        },
        {
          title: 'Investment Incentive Programs',
          level: 2,
          content: `Current Programs: ${profile.investmentPrograms?.slice(0, 3).join('; ') || 'Obtain from investment office'} | ` +
            `Application: Contact local investment promotion office`
        },
        {
          title: 'Foreign Investment Presence',
          level: 2,
          content: `Foreign Companies: ${Array.isArray(profile.foreignCompanies) && profile.foreignCompanies.length > 0 && !profile.foreignCompanies[0].includes('Research') ? 'Established presence' : 'Growing market'} | ` +
            `Market Entry Models: Direct investment, partnerships, franchises`
        },
        {
          title: 'Investment Scores',
          level: 2,
          content: `Investment Momentum: ${profile.investmentMomentum}/100 | ` +
            `Engagement Level: ${profile.engagementScore}/100 | ` +
            `Overlooked Factor: ${profile.overlookedScore}/100`
        }
      ]
    };
  }

  private createRiskExecutiveSummary(profile: CityProfile): DocumentSection {
    return {
      title: 'Risk Assessment Executive Summary',
      level: 1,
      content: `Risk assessment for ${profile.city} identifies both systematic (country-level) and ` +
        `idiosyncratic (location-specific) risks that affect investment implementation. This analysis provides ` +
        `frameworks for risk quantification, mitigation strategy development, and contingency planning.`
    };
  }

  private createSystemicRisksSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Systemic Risks (Country-Level)',
      level: 1,
      content: `Systemic risks originating at country level affect all investments in ${profile.city}.`,
      subsections: [
        {
          title: 'Political Risk',
          level: 2,
          content: `Political Stability Score: ${profile.politicalStability}/100. ` +
            `Risk factors: Electoral cycles, policy changes, international relations, governance continuity.`
        },
        {
          title: 'Macroeconomic Risk',
          level: 2,
          content: `Currency volatility, inflation trends, debt levels, and fiscal sustainability affect ` +
            `long-term project economics and financing costs.`
        },
        {
          title: 'Regulatory Risk',
          level: 2,
          content: `Regulatory Friction Index: ${profile.regulatoryFriction}/100. ` +
            `Complexity of licensing, permitting, and compliance procedures affects implementation timeline.`
        }
      ]
    };
  }

  private createIdiosyncraticRisksSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Idiosyncratic Risks (Location-Specific)',
      level: 1,
      content: `Idiosyncratic risks are specific to ${profile.city} and can be mitigated through operational adjustments.`,
      subsections: [
        {
          title: 'Infrastructure Risk',
          level: 2,
          content: `Infrastructure Readiness Score: ${profile.infrastructureScore}/100. ` +
            `Risks: Power reliability, transportation bottlenecks, telecommunications delays.`
        },
        {
          title: 'Labor & Skills Risk',
          level: 2,
          content: `Labor Pool Score: ${profile.laborPool}/100. ` +
            `Risks: Skills gaps, wage escalation, labor market volatility.`
        },
        {
          title: 'Supply Chain Risk',
          level: 2,
          content: `Supplier availability, input costs, and logistics dependencies vary by sector. ` +
            `Mitigation: Supplier diversification, inventory optimization, regional sourcing strategies.`
        }
      ]
    };
  }

  private createMitigationStrategiesSection(): DocumentSection {
    return {
      title: 'Risk Mitigation Strategies',
      level: 1,
      content: `For each identified risk category, specific mitigation approaches are recommended.`,
      subsections: [
        {
          title: 'Phased Implementation',
          level: 2,
          content: `Reduce exposure by phasing entry over 2-3 years. Pilot operations validate assumptions before full commitment.`
        },
        {
          title: 'Operational Redundancy',
          level: 2,
          content: `Backup suppliers, dual power systems, inventory buffers protect against operational disruptions.`
        },
        {
          title: 'Financial Hedging',
          level: 2,
          content: `Currency hedging, insurance products, price fixing agreements reduce financial volatility.`
        },
        {
          title: 'Stakeholder Alignment',
          level: 2,
          content: `Local partnerships, government engagement, and community relationships reduce political risk and facilitate problem resolution.`
        }
      ]
    };
  }

  private createComplianceFrameworkSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Compliance & Regulatory Framework',
      level: 1,
      content: `Compliance requirements in ${profile.city} are governed by {{country}} national law with local implementation variations.`,
      subsections: [
        {
          title: 'Company Registration',
          level: 2,
          content: `Foreign companies must register with local business registration authority. Requirements: business plan, capital commitment, local representation.`
        },
        {
          title: 'Tax Compliance',
          level: 2,
          content: `Corporate income tax, VAT, and withholding requirements apply. Incentive programs may provide holiday periods or exemptions.`
        },
        {
          title: 'Labor Compliance',
          level: 2,
          content: `Employment contracts, worker benefits, safety standards, and union regulations are determined by {{country}} labor law.`
        }
      ]
    };
  }

  private createContingencyPlanningSection(): DocumentSection {
    return {
      title: 'Contingency Planning & Scenario Analysis',
      level: 1,
      content: `Contingency plans address potential adverse scenarios and establish decision triggers for course corrections.`,
      subsections: [
        {
          title: 'Major Adverse Event (MAE) Triggers',
          level: 2,
          content: `Events (political crisis, natural disaster, supply disruption) requiring operational pause or exit. Monitoring required.`
        },
        {
          title: 'Go/No-Go Gates',
          level: 2,
          content: `Quarterly review checkpoints (at 3, 6, 12 months) evaluate progress against milestones. Continue, modify, or exit decisions made at each gate.`
        },
        {
          title: 'Exit Strategy',
          level: 2,
          content: `Asset divestment, local partner buyout, or operations sale represent exit options if market conditions change materially.`
        }
      ]
    };
  }

  private createMarketEntryOverviewSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Market Entry Overview',
      level: 1,
      content: `This guide provides structured pathway for establishing business operations in ${profile.city}. ` +
        `Market entry typically requires 3-6 months from initial planning to operational launch, depending on business model and complexity.`
    };
  }

  private createRegulatoryRequirementsSection(): DocumentSection {
    return {
      title: 'Regulatory Requirements & Approvals',
      level: 1,
      content: `Regulatory approvals required for business establishment in {{country}} include:`,
      subsections: [
        {
          title: 'Government Approvals',
          level: 2,
          content: `Investment board clearance (if applicable), sector-specific licenses, environmental permits.`
        },
        {
          title: 'Registration Procedures',
          level: 2,
          content: `Business name registration, tax ID assignment, statistical unit registration.`
        },
        {
          title: 'Timeline',
          level: 2,
          content: `Typical approval timeline: 4-8 weeks. Expedited processes may be available for strategic sectors.`
        }
      ]
    };
  }

  private createBusinessRegistrationSection(): DocumentSection {
    return {
      title: 'Business Registration & Licensing',
      level: 1,
      content: `Company formation in {{country}} requires registration with appropriate government agencies.`,
      subsections: [
        {
          title: 'Legal Entity Types',
          level: 2,
          content: `Options: Joint venture with local partner, subsidiary of foreign company, branch office, representative office.`
        },
        {
          title: 'Required Documents',
          level: 2,
          content: `Articles of incorporation, business plan, capitalization documentation, identification of directors/shareholders.`
        },
        {
          title: 'Timeline & Costs',
          level: 2,
          content: `Registration: 2-4 weeks. Estimated costs: $5,000-20,000 depending on entity type and complexity.`
        }
      ]
    };
  }

  private createLaborAndEmploymentSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Labor & Employment Requirements',
      level: 1,
      content: `Employing staff in ${profile.city} requires compliance with {{country}} labor laws and local regulations.`,
      subsections: [
        {
          title: 'Employment Contracts',
          level: 2,
          content: `Written contracts required (language: local language). Must include: position, compensation, benefits, termination conditions.`
        },
        {
          title: 'Worker Benefits & Protections',
          level: 2,
          content: `Minimum wage, working hours (typically 40/week), overtime compensation, leave entitlements, severance requirements.`
        },
        {
          title: 'Immigration & Work Permits',
          level: 2,
          content: `Foreign employees require work permits. Sponsorship procedures: application through employer, approved by immigration authority.`
        }
      ]
    };
  }

  private createTaxAndFinancialSection(): DocumentSection {
    return {
      title: 'Tax & Financial Obligations',
      level: 1,
      content: `Tax framework for business operations in {{country}}:`,
      subsections: [
        {
          title: 'Corporate Income Tax',
          level: 2,
          content: `Standard rate: 25-30% (varies by country). Special incentive rates may apply for strategic sectors (10-20%).`
        },
        {
          title: 'Value Added Tax (VAT)',
          level: 2,
          content: `Standard rate: 5-10%. Exemptions available for specific goods/services. Monthly/quarterly filing.`
        },
        {
          title: 'Withholding Tax',
          level: 2,
          content: `On dividends, royalties, management fees. Rates: 10-15%. Tax treaty benefits may apply.`
        }
      ]
    };
  }

  private createOperationalSetupSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Operational Setup & Facilities',
      level: 1,
      content: `Establishing operational infrastructure in {{city}}:`,
      subsections: [
        {
          title: 'Office/Facility Location',
          level: 2,
          content: `Options: CBD office space, industrial park facility, special economic zone. Typical lease: 3-5 year terms.`
        },
        {
          title: 'Utilities & Services',
          level: 2,
          content: `Power, water, telecommunications agreements with respective service providers. Budget: $2,000-5,000/month initial costs.`
        },
        {
          title: 'Staffing & Recruitment',
          level: 2,
          content: `Labor pool: ${profile.laborPool}/100. Key positions may require foreign staffing with work permits.`
        }
      ]
    };
  }

  private createLocalPartnershipGuideSection(): DocumentSection {
    return {
      title: 'Local Partnership & Joint Venture Framework',
      level: 1,
      content: `Many sectors benefit from local partnership models for market access and regulatory compliance.`,
      subsections: [
        {
          title: 'Partner Selection',
          level: 2,
          content: `Criteria: Local market knowledge, government relationships, complementary business, financial stability. ` +
            `Resources: Chamber of Commerce, business associations.`
        },
        {
          title: 'Joint Venture Structure',
          level: 2,
          content: `Ownership split, capital contribution, profit sharing, management control. Legal documentation: JV agreement, articles of association.`
        },
        {
          title: 'Due Diligence',
          level: 2,
          content: `Financial review, legal status verification, reference checks, regulatory compliance history.`
        }
      ]
    };
  }

  private createTimelinesAndChecklistsSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Implementation Timeline & Checklist',
      level: 1,
      content: `Typical market entry timeline for ${profile.city}:`,
      dataTable: {
        headers: ['Phase', 'Activities', 'Duration', 'Responsible'],
        rows: [
          ['Pre-Entry', 'Market research, partner identification, regulatory review', '4-6 weeks', 'Strategy/BD Team'],
          ['Registration', 'Business registration, licenses, work permits', '4-8 weeks', 'Legal/Admin'],
          ['Setup', 'Facility lease, staffing, systems implementation', '4-6 weeks', 'Operations'],
          ['Launch', 'Soft opening, stakeholder engagement, operations start', '2-4 weeks', 'All Teams'],
          ['Stabilization', 'Performance monitoring, process optimization', 'Ongoing', 'All Teams']
        ]
      }
    };
  }

  private createInvestmentExecutiveSummary(profile: CityProfile): DocumentSection {
    return {
      title: 'Investment Opportunity Summary',
      level: 1,
      content: `${profile.city} presents a defined investment opportunity with documented regulatory frameworks, ` +
        `identified growth sectors, and measurable infrastructure capacity. This brief synthesizes institutional-quality ` +
        `research to support strategic investment decision-making.`
    };
  }

  private createMarketOpportunitySection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Market Opportunity & Potential',
      level: 1,
      content: narratives.opportunities.paragraphs[0]?.text || 'Market opportunity assessment...',
      subsections: [
        {
          title: 'Addressable Market',
          level: 2,
          content: `Population: ${profile.demographics?.population} | ` +
            `Primary Industries: ${profile.keySectors?.slice(0, 3).join(', ')} | ` +
            `Regional Integration: Access to broader markets via {{region}} corridors`
        },
        {
          title: 'Market Growth Indicators',
          level: 2,
          content: `Investment Momentum: ${profile.investmentMomentum}/100 | ` +
            `Recent Development News: ${profile.recentNews?.length || 0} documented projects | ` +
            `Government Priority: See investment incentive programs`
        }
      ]
    };
  }

  private createCompetitiveAdvantageSection(profile: CityProfile): DocumentSection {
    return {
      title: 'Competitive Advantage & Strategic Position',
      level: 1,
      content: `${profile.city} offers specific competitive advantages for investors:`,
      subsections: [
        {
          title: 'Structural Advantages',
          level: 2,
          content: `${profile.globalMarketAccess}\nLocation in {{region}} economic zone\n{{area size}} geographic footprint`
        },
        {
          title: 'Strategic Advantages',
          level: 2,
          content: profile.strategicAdvantages?.map(a => `${a}`).join('\n') || 'See analysis'
        }
      ]
    };
  }

  private createRiskAnalysisSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Risk Analysis & Mitigation',
      level: 1,
      content: narratives.risks.paragraphs[0]?.text || 'Risk assessment...',
      subsections: [
        {
          title: 'Key Risk Factors',
          level: 2,
          content: `Political Stability: ${profile.politicalStability}/100 | ` +
            `Regulatory Friction: ${profile.regulatoryFriction}/100 | ` +
            `Infrastructure Score: ${profile.infrastructureScore}/100`
        }
      ]
    };
  }

  private createFinancialOutlookSection(profile: CityProfile, narratives: EnhancedNarratives): DocumentSection {
    return {
      title: 'Financial Outlook & Economics',
      level: 1,
      content: narratives.economy.paragraphs[0]?.text || 'Economic analysis...',
      subsections: [
        {
          title: 'Market Economics',
          level: 2,
          content: `GDP: ${profile.economics?.gdpLocal} | ` +
            `Growth: ${profile.economics?.gdpGrowthRate} | ` +
            `Labor Pool: {{labor pool score}}/100`
        }
      ]
    };
  }

  private createImplementationRoadmapSection(): DocumentSection {
    return {
      title: 'Implementation Roadmap',
      level: 1,
      content: `Phased approach to market entry and operation establishment:`,
      subsections: [
        {
          title: 'Phase 1: Market Research & Validation (Months 1-2)',
          level: 2,
          content: `Detailed market study, competitor analysis, site visits, preliminary partnerships`
        },
        {
          title: 'Phase 2: Registration & Setup (Months 3-4)',
          level: 2,
          content: `Company registration, facility lease, infrastructure setup, regulatory approvals`
        },
        {
          title: 'Phase 3: Soft Launch (Month 5)',
          level: 2,
          content: `Initial operations, stakeholder engagement, process validation`
        },
        {
          title: 'Phase 4: Full Operations (Month 6+)',
          level: 2,
          content: `Ramp-up, market penetration, performance optimization`
        }
      ]
    };
  }

  private createPartnershipFrameworkSection(): DocumentSection {
    return {
      title: 'Partnership Framework & Collaboration',
      level: 1,
      content: `Strategic partnerships enhance market entry success:`,
      subsections: [
        {
          title: 'Government Partnerships',
          level: 2,
          content: `Engagement: Contact {{city}} Investment Promotion Office | Support: Incentive programs, regulatory guidance`
        },
        {
          title: 'Private Sector Partnerships',
          level: 2,
          content: `Types: Local joint venture partners, suppliers, distributors, technology partners | Resources: Chamber of Commerce, business associations`
        }
      ]
    };
  }

  private createSectorOverviewSection(profile: CityProfile, sector: string): DocumentSection {
    return {
      title: `${sector} Sector Overview`,
      level: 1,
      content: `The {{sector}} sector is a significant component of {{city}}'s economic base. This analysis provides ` +
        `detailed assessment of sector characteristics, market dynamics, and investment potential.`
    };
  }

  private createMarketSizeAndGrowthSection(): DocumentSection {
    return {
      title: 'Market Size & Growth Trajectory',
      level: 1,
      content: `Current market size, growth rates, and future projections for {{sector}} in {{city}}.`
    };
  }

  private createValueChainAnalysisSection(): DocumentSection {
    return {
      title: 'Value Chain Analysis',
      level: 1,
      content: `Structure of {{sector}} value chain including suppliers, producers, distributors, and end-users.`
    };
  }

  private createCompetitiveAnalysisSection(): DocumentSection {
    return {
      title: 'Competitive Analysis',
      level: 1,
      content: `Key competitors, market concentration, competitive advantages, and differentiation strategies in {{sector}}.`
    };
  }

  private createSupplyAndDemandSection(): DocumentSection {
    return {
      title: 'Supply & Demand Dynamics',
      level: 1,
      content: `Market supply-demand balance, pricing trends, and expansion capacity for {{sector}} in {{city}}.`
    };
  }

  private createSkillsAndLaborSection(): DocumentSection {
    return {
      title: 'Skills & Labor Availability',
      level: 1,
      content: `Workforce availability, skill levels, wage structures, and training capabilities for {{sector}} employment.`
    };
  }

  private createSectorSpecificRisksSection(): DocumentSection {
    return {
      title: 'Sector-Specific Risks',
      level: 1,
      content: `Risks unique to {{sector}} including technology disruption, regulation, supply chain vulnerabilities, and market competition.`
    };
  }

  private createSectorOpportunitiesSection(): DocumentSection {
    return {
      title: 'Sector Opportunities & Growth Potential',
      level: 1,
      content: `Identified opportunities for {{sector}} expansion, value-add, technology transfer, and competitive positioning in {{city}}.`
    };
  }

  // 
  // HELPER FUNCTIONS
  // 

  private createBaseDocument(profile: CityProfile, docType: string): GeneratedDocument {
    return {
      title: `${docType}: ${profile.city}, ${profile.country}`,
      metadata: {
        generatedDate: new Date().toISOString().split('T')[0],
        location: `${profile.city}, ${profile.region}, ${profile.country}`,
        completenessScore: 0,
        totalSources: 0
      },
      sections: [],
      executiveSummary: '',
      keyFindings: [],
      recommendations: [],
      citations: [],
      appendices: []
    };
  }

  private extractKeyFindings(profile: CityProfile, narratives: EnhancedNarratives, dataQuality: DataQualityReport): string[] {
    return [
      `${profile.city} demonstrates institutional readiness for foreign investment based on government transparency (Score: ${profile.engagementScore}/100)`,
      `Primary economic sectors: ${profile.keySectors?.slice(0, 3).join(', ')}`,
      `Workforce capacity: Labor pool score of ${profile.laborPool}/100 with literacy in national language`,
      `Infrastructure readiness: ${profile.infrastructureScore}/100 with documented connectivity to regional markets`,
      `Political environment: Stability score of ${profile.politicalStability}/100 with established governance structures`,
      `Research completeness: ${dataQuality.completeness}% based on {{sources count}} authoritative sources`,
      `Investment momentum: {{profile.investmentMomentum}}/100 indicating active foreign investor interest`,
      `Regulatory framework: Friction index of {{profile.regulatoryFriction}}/100 with defined approval procedures`
    ];
  }

  private generateInvestmentRecommendations(): string[] {
    return [
      `Initiate engagement with {{city}} Investment Promotion Office for sector-specific guidance and incentive programs`,
      `Conduct due diligence site visits to priority industrial parks and special economic zones`,
      `Identify and evaluate potential local partnership candidates through Chamber of Commerce and business associations`,
      `Engage professional legal and accounting advisors familiar with {{country}} business regulations`,
      `Develop detailed 24-month implementation plan with quarterly go/no-go checkpoints`,
      `Establish monitoring systems for political, economic, and regulatory developments`,
      `Consider phased market entry to validate assumptions before full commitment`,
      `Build contingency plans for major adverse scenarios including political crisis and supply chain disruption`
    ];
  }

  private generateImplementationSteps(): string[] {
    return [
      `Week 1-2: Secure professional advisors (legal, accounting, HR consultants)`,
      `Week 3-4: Complete business registration documents and submit to authorities`,
      `Week 5-6: Identify and lease office/facility space in priority location`,
      `Week 7-8: Apply for business license, tax ID, and sector-specific permits`,
      `Week 9-10: Establish banking relationships and import/export accounts if applicable`,
      `Week 11-12: Hire core management and support staff`,
      `Week 13-16: Implement operational systems, training, and market launch preparation`,
      `Week 17+: Begin commercial operations with ongoing monitoring and optimization`
    ];
  }

  private formatCitations(sources: SourceCitation[]): string[] {
    return sources.slice(0, 20).map((s, idx) =>
      `[${idx + 1}] ${s.title}. ${s.organization || 'Source'}. ` +
      `Accessed: ${s.accessDate}. ${s.url}`
    );
  }

  private estimateWorkforceAvailability(profile: CityProfile): string {
    if (profile.laborPool > 70) return 'Strong - Abundant skilled workforce';
    if (profile.laborPool > 50) return 'Moderate - Adequate workforce with training needs';
    return 'Limited - Significant skills development required';
  }

  private evaluateInfrastructureForSector(profile: CityProfile): string {
    if (profile.infrastructureScore > 70) return 'Well-developed with documented capacity';
    if (profile.infrastructureScore > 50) return 'Adequate with potential bottlenecks';
    return 'Emerging - May require development investment';
  }
}

// Singleton instance
export const documentGenerator = new LocationIntelligenceDocumentGenerator();

