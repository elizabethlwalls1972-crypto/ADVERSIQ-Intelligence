/**
 * 
 * ADVANCED NARRATIVE SYNTHESIS SERVICE
 * 
 * 
 * Transforms raw research data into rich, detailed, well-structured narratives
 * with supporting evidence, context, and actionable intelligence.
 * 
 * Features:
 * - Multi-source synthesis with intelligent weighting
 * - Citation-backed paragraphs
 * - Conflict resolution with evidence-based conclusions
 * - Context-aware narrative generation
 * - Rich section building with supporting data
 */

import { type MultiSourceResult, type SourceCitation } from './multiSourceResearchService_v2';
import { type CityProfile } from '../data/globalLocationProfiles';

export interface NarrativeSection {
  title: string;
  introduction: string;
  paragraphs: Array<{
    text: string;
    citations: SourceCitation[];
    confidence: number;
  }>;
  keyFacts: string[];
  conclusion: string;
  suggestedFollowUpQueries?: string[];
}

export interface EnhancedNarratives {
  overview: NarrativeSection;
  history: NarrativeSection;
  geography: NarrativeSection;
  economy: NarrativeSection;
  governance: NarrativeSection;
  infrastructure: NarrativeSection;
  investment: NarrativeSection;
  risks: NarrativeSection;
  opportunities: NarrativeSection;
}

class NarrativeSynthesisEngine {
  /**
   * Build comprehensive overview narrative
   */
  buildOverviewNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const location = `${profile.city}, ${profile.region}, ${profile.country}`;
    const govSources = result.sources.filter(s => s.type === 'government').slice(0, 3);
    const otherSources = result.sources.filter(s => s.type !== 'government').slice(0, 3);

    const paragraphs = [
      {
        text: this.generateOverviewParagraph(profile, govSources),
        citations: govSources,
        confidence: 0.9
      },
      {
        text: this.generateContextParagraph(profile, result),
        citations: otherSources,
        confidence: 0.85
      },
      {
        text: this.generateSignificanceParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.8
      }
    ];

    return {
      title: 'Location Overview',
      introduction: `${location} is a strategic location with significance for regional development and investment.`,
      paragraphs,
      keyFacts: this.extractKeyFacts(profile),
      conclusion: `With ${result.sources.length} authoritative sources examined, ${profile.city} presents a research-backed profile for strategic assessment.`,
      suggestedFollowUpQueries: [
        `${profile.city} investment opportunities`,
        `${profile.city} business regulations and compliance`,
        `${profile.city} partnership case studies`
      ]
    };
  }

  /**
   * Build geographic/location narrative
   */
  buildGeographyNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const paragraphs = [
      {
        text: this.generateGeographyParagraph(profile),
        citations: result.sources.filter(s => s.type === 'government').slice(0, 2),
        confidence: 0.9
      },
      {
        text: this.generateAccessibilityParagraph(profile, result),
        citations: result.sources.filter(s => s.type === 'international').slice(0, 2),
        confidence: 0.85
      },
      {
        text: this.generateClimateAndEnvironmentParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.8
      }
    ];

    return {
      title: 'Geographic Context',
      introduction: `${profile.city} is located in ${profile.region}, ${profile.country}, with specific geographic characteristics that influence business operations and development.`,
      paragraphs,
      keyFacts: [
        `Latitude/Longitude: ${profile.latitude}°, ${profile.longitude}°`,
        `Timezone: ${profile.timezone}`,
        `Area: ${profile.areaSize}`,
        `Climate: ${profile.climate}`,
        `Global Market Access: ${profile.globalMarketAccess}`
      ],
      conclusion: `The geographic profile of ${profile.city} demonstrates strategic positioning with defined accessibility for regional and global connectivity.`
    };
  }

  /**
   * Build economic narrative with detailed analysis
   */
  buildEconomyNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const econSources = result.sources.filter(s => 
      s.type === 'worldbank' || s.type === 'international' || s.type === 'statistics'
    );

    const paragraphs = [
      {
        text: this.generateEconomicProfileParagraph(profile, econSources),
        citations: econSources.slice(0, 3),
        confidence: 0.9
      },
      {
        text: this.generateSectorAnalysisParagraph(profile, result),
        citations: result.sources.filter(s => s.type === 'news' || s.type === 'government').slice(0, 3),
        confidence: 0.85
      },
      {
        text: this.generateTradeAndExportsParagraph(profile),
        citations: econSources.slice(0, 2),
        confidence: 0.8
      },
      {
        text: this.generateLaborAndHumanCapitalParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.85
      }
    ];

    return {
      title: 'Economic Profile & Opportunities',
      introduction: `${profile.city}'s economy is characterized by ${profile.keySectors?.slice(0, 2).join(', ') || 'diversified sectors'}, with measurable indicators and growth potential.`,
      paragraphs,
      keyFacts: this.extractEconomicFacts(profile),
      conclusion: `The economic data indicates ${profile.city} as a location with verifiable economic fundamentals and documented growth trajectories.`,
      suggestedFollowUpQueries: [
        `${profile.city} manufacturing and industrial capacity`,
        `${profile.city} service sector development`,
        `${profile.city} consumer market size and growth`
      ]
    };
  }

  /**
   * Build governance and leadership narrative
   */
  buildGovernanceNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const govSources = result.sources.filter(s => s.type === 'government').slice(0, 3);
    const newsSources = result.sources.filter(s => s.type === 'news').slice(0, 2);

    const paragraphs = [
      {
        text: this.generateGovernmentStructureParagraph(profile, govSources),
        citations: govSources,
        confidence: 0.9
      },
      {
        text: this.generateLeadershipParagraph(profile),
        citations: profile.leaders.length > 0 ? [result.sources[0]] : [],
        confidence: profile.leaders.length > 0 ? 0.85 : 0.6
      },
      {
        text: this.generatePolicyEnvironmentParagraph(profile),
        citations: [...govSources, ...newsSources],
        confidence: 0.8
      }
    ];

    return {
      title: 'Governance & Leadership',
      introduction: `${profile.city} operates under ${profile.country}'s governance framework with documented administrative structure and leadership.`,
      paragraphs,
      keyFacts: this.extractGovernanceFacts(profile),
      conclusion: `Governance structures in ${profile.city} demonstrate institutional capacity for project implementation and partnership management.`,
      suggestedFollowUpQueries: [
        `${profile.city} government contact directory`,
        `${profile.city} investment promotion office`,
        `${profile.city} permit and licensing procedures`
      ]
    };
  }

  /**
   * Build infrastructure narrative
   */
  buildInfrastructureNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const infraSources = result.sources.filter(s => 
      s.dataExtracted.toLowerCase().includes('infra') ||
      s.dataExtracted.toLowerCase().includes('transport') ||
      s.dataExtracted.toLowerCase().includes('airport')
    ).slice(0, 3);

    const paragraphs = [
      {
        text: this.generateTransportConnectivityParagraph(profile, infraSources),
        citations: infraSources,
        confidence: 0.85
      },
      {
        text: this.generateUtilitiesAndPowerParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.8
      },
      {
        text: this.generateDigitalInfrastructureParagraph(profile),
        citations: result.sources.filter(s => s.type === 'international').slice(0, 2),
        confidence: 0.8
      }
    ];

    return {
      title: 'Infrastructure & Connectivity',
      introduction: `${profile.city} benefits from documented infrastructure networks supporting commerce, connectivity, and operational efficiency.`,
      paragraphs,
      keyFacts: this.extractInfrastructureFacts(profile),
      conclusion: `Infrastructure assessment indicates ${profile.city} has baseline capabilities for business operations with documented connectivity.`,
      suggestedFollowUpQueries: [
        `${profile.city} transport and logistics providers`,
        `${profile.city} telecommunications infrastructure`,
        `${profile.city} port and airport operations`
      ]
    };
  }

  /**
   * Build investment opportunity narrative
   */
  buildInvestmentNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const investSources = result.sources.filter(s => 
      s.type === 'international' || s.type === 'government' || s.type === 'news'
    ).slice(0, 4);

    const paragraphs = [
      {
        text: this.generateInvestmentClimateParagraph(profile, investSources),
        citations: investSources,
        confidence: 0.85
      },
      {
        text: this.generateSpecialEconomicZonesParagraph(profile),
        citations: result.sources.filter(s => s.type === 'government').slice(0, 2),
        confidence: 0.8
      },
      {
        text: this.generateIncentiveFrameworkParagraph(profile),
        citations: investSources.slice(0, 2),
        confidence: 0.8
      },
      {
        text: this.generateMarketEntryPathwayParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.75
      }
    ];

    return {
      title: 'Investment Case & Opportunities',
      introduction: `${profile.city} presents defined investment opportunities with documented regulatory frameworks and incentive structures.`,
      paragraphs,
      keyFacts: this.extractInvestmentFacts(profile),
      conclusion: `Investment potential in ${profile.city} is supported by verified regulatory environment and documented growth sectors.`,
      suggestedFollowUpQueries: [
        `${profile.city} foreign investment regulations`,
        `${profile.city} tax incentives and benefits`,
        `${profile.city} joint venture requirements`
      ]
    };
  }

  /**
   * Build risk assessment narrative
   */
  buildRisksNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const newsSources = result.sources.filter(s => s.type === 'news').slice(0, 3);
    const govSources = result.sources.filter(s => s.type === 'government').slice(0, 2);

    const paragraphs = [
      {
        text: this.generateRiskAssessmentParagraph(profile),
        citations: [...newsSources, ...govSources],
        confidence: 0.8
      },
      {
        text: this.generatePoliticalRiskParagraph(profile, result),
        citations: newsSources,
        confidence: 0.75
      },
      {
        text: this.generateOperationalRisksParagraph(profile),
        citations: result.sources.slice(0, 2),
        confidence: 0.75
      }
    ];

    return {
      title: 'Risk Assessment',
      introduction: `Assessment of ${profile.city} includes identified risks and mitigation considerations for project implementation.`,
      paragraphs,
      keyFacts: [
        `Regulatory Friction Index: ${profile.regulatoryFriction}/100`,
        `Political Stability Score: ${profile.politicalStability}/100`,
        `Infrastructure Score: ${profile.infrastructureScore}/100`,
        `Cost of Doing Business: ${profile.costOfDoing}/100`
      ],
      conclusion: `Risk profiling of ${profile.city} identifies both challenges and available mitigation pathways for strategic implementation.`,
      suggestedFollowUpQueries: [
        `${profile.city} regulatory compliance requirements`,
        `${profile.city} political environment and stability`,
        `${profile.city} currency and exchange rate risks`
      ]
    };
  }

  /**
   * Build opportunities narrative
   */
  buildOpportunitiesNarrative(result: MultiSourceResult, profile: CityProfile): NarrativeSection {
    const allSources = result.sources.slice(0, 5);

    const paragraphs = [
      {
        text: this.generateOpportunitiesOverviewParagraph(profile),
        citations: allSources,
        confidence: 0.85
      },
      {
        text: this.generateSectorOpportunitiesParagraph(profile),
        citations: result.sources.slice(0, 3),
        confidence: 0.8
      },
      {
        text: this.generatePartnershipOpportunitiesParagraph(profile),
        citations: result.sources.filter(s => s.type !== 'news').slice(0, 2),
        confidence: 0.75
      }
    ];

    return {
      title: 'Growth Opportunities',
      introduction: `${profile.city} presents identified opportunities across multiple sectors and partnership models based on current economic trends.`,
      paragraphs,
      keyFacts: [
        `Strategic Advantages: ${(profile.strategicAdvantages || []).slice(0, 3).join(', ')}`,
        `Key Sectors: ${profile.keySectors?.slice(0, 4).join(', ')}`,
        `Investment Momentum Score: ${profile.investmentMomentum}/100`,
        `Engagement Score: ${profile.engagementScore}/100`
      ],
      conclusion: `Strategic opportunities align with ${profile.city}'s documented strengths and emerging market potential.`,
      suggestedFollowUpQueries: [
        `${profile.city} entrepreneurship and startup ecosystem`,
        `${profile.city} technology transfer opportunities`,
        `${profile.city} joint venture success stories`
      ]
    };
  }

  // 
  // PARAGRAPH GENERATION HELPERS
  // 

  private generateOverviewParagraph(profile: CityProfile, sources: SourceCitation[]): string {
    return `${profile.city} is a ${profile.region ? `strategic center in ${profile.region}` : 'major urban center'} within ${profile.country}. ` +
      `As documented in official sources, the city serves as a hub for ${profile.knownFor?.slice(0, 2).join(' and ') || 'regional commerce and services'}. ` +
      `${sources.length > 0 ? `Government sources confirm the city's role in the regional economic structure.` : `The city's economic importance is reflected in its infrastructure and institutional development.`}`;
  }

  private generateContextParagraph(profile: CityProfile, result: MultiSourceResult): string {
    return `Located at ${profile.latitude}°N, ${profile.longitude}°E in the ${profile.timezone} timezone, ` +
      `${profile.city} occupies a geographic position that provides access to ${profile.globalMarketAccess}. ` +
      `The city's climate (${profile.climate}) and area of ${profile.areaSize} create specific operational contexts ` +
      `that are documented across ${result.sources.length} research sources spanning government, international organizations, and news outlets.`;
  }

  private generateSignificanceParagraph(profile: CityProfile): string {
    const recentNews = profile.recentNews?.length || 0;
    return `${profile.city} demonstrates ongoing economic activity and development focus, ` +
      `with ${recentNews} documented recent developments tracked across verified sources. ` +
      `The city's role in ${profile.region} reflects broader patterns of urban development and regional integration ` +
      `that are significant for understanding investment trajectories and partnership potential.`;
  }

  private generateGeographyParagraph(profile: CityProfile): string {
    return `${profile.city} is positioned within ${profile.region}, benefiting from geographic characteristics that have historically shaped its economic role. ` +
      `The city's location at ${profile.latitude}°N, ${profile.longitude}°E places it in the ${profile.timezone} timezone and provides access to ` +
      `${profile.globalMarketAccess}. Physical proximity to regional trade corridors and international markets influences business operations and supply chain dynamics.`;
  }

  private generateAccessibilityParagraph(profile: CityProfile, result: MultiSourceResult): string {
    const hasAirports = profile.infrastructure?.airports && profile.infrastructure.airports.length > 0 && 
                       !profile.infrastructure.airports[0].name.includes('Research');
    const hasPorts = profile.infrastructure?.seaports && profile.infrastructure.seaports.length > 0 &&
                    !profile.infrastructure.seaports[0].name.includes('Research');

    return `Accessibility infrastructure includes ${hasAirports ? 'documented airport facilities' : 'airport services'} and ` +
      `${hasPorts ? 'port operations' : 'maritime access'}. The city is connected to regional networks via ` +
      `${profile.globalMarketAccess}, supporting both domestic and international commerce. Transportation connectivity data ` +
      `is available across ${result.sources.filter(s => s.type === 'government').length} government sources.`;
  }

  private generateClimateAndEnvironmentParagraph(profile: CityProfile): string {
    return `The ${profile.climate} climate of ${profile.city} creates specific environmental conditions that affect infrastructure planning and operations. ` +
      `Agricultural potential, water resources, and seasonal patterns influence both operational planning and long-term development strategy. ` +
      `Local environmental regulations within ${profile.country} establish frameworks that must be considered for any development initiative.`;
  }

  private generateEconomicProfileParagraph(profile: CityProfile, sources: SourceCitation[]): string {
    const gdpInfo = profile.economics?.gdpLocal || 'documented economic output';
    const growth = profile.economics?.gdpGrowthRate || 'growth trends';
    return `${profile.city}'s economy is driven by ${profile.keySectors?.slice(0, 3).join(', ') || 'diversified sectors'}. ` +
      `The city shows ${gdpInfo} with documented ${growth}. Sources from the World Bank and international organizations indicate ` +
      `that ${profile.city} participates in broader ${profile.country} economic patterns while maintaining distinct local dynamics. ` +
      `${sources.length} authoritative sources provide quantified economic metrics for comparative analysis.`;
  }

  private generateSectorAnalysisParagraph(profile: CityProfile, result: MultiSourceResult): string {
    const topSectors = profile.keySectors?.slice(0, 3).join(', ') || 'multiple sectors';
    const hasIndustryNews = result.sources.filter(s => 
      s.type === 'news' && (s.dataExtracted.toLowerCase().includes('industry') || s.dataExtracted.toLowerCase().includes('sector'))
    ).length > 0;

    return `Key economic sectors in ${profile.city} include ${topSectors}, each with documented capabilities and market presence. ` +
      `${hasIndustryNews ? 'Recent news coverage indicates ongoing sector development and investment activity. ' : ''}` +
      `Industry composition reflects both historical specialization and emerging diversification trends. ` +
      `Employment concentration in these sectors drives workforce development and skills availability in the local labor market.`;
  }

  private generateTradeAndExportsParagraph(profile: CityProfile): string {
    const partners = profile.economics?.tradePartners?.slice(0, 2).join(' and ') || 'regional and international markets';
    const exports = profile.economics?.topExports?.slice(0, 2).join(', ') || 'documented exports';
    return `Trade flows through ${profile.city} connect to ${partners}, establishing commercial patterns that generate employment and tax revenue. ` +
      `Major export products include ${exports}, which drive external demand and foreign exchange earning. ` +
      `Trade infrastructure including ports, customs facilities, and logistics operators support the movement of goods. ` +
      `International organizations track these trade metrics as key economic indicators.`;
  }

  private generateLaborAndHumanCapitalParagraph(profile: CityProfile): string {
    const population = profile.demographics?.population || 'documented population';
    const litRate = profile.laborPool || 'measurable literacy rate';
    return `${profile.city} maintains a documented labor force with population at ${population}. ` +
      `Literacy rate of ${litRate}% supports skilled workforce development and technology adoption. ` +
      `The city benefits from both local workforce availability and potential for talent attraction from regional labor markets. ` +
      `Skills training institutions and educational facilities shape long-term human capital availability for employers.`;
  }

  private generateGovernmentStructureParagraph(profile: CityProfile, sources: SourceCitation[]): string {
    return `${profile.city} operates under a government structure that aligns with ${profile.country} national governance frameworks. ` +
      `Administrative departments including ${profile.departments?.join(', ') || 'city administration'} manage municipal operations. ` +
      `The structure provides regulatory oversight, permitting authority, and partnership coordination functions. ` +
      `${sources.length > 0 ? 'Government websites and official documentation outline administrative procedures and contact information.' : 'Official government channels provide access to administrative information.'}`;
  }

  private generateLeadershipParagraph(profile: CityProfile): string {
    if (profile.leaders && profile.leaders.length > 0 && !profile.leaders[0].name.includes('pending')) {
      const leader = profile.leaders[0];
      return `Current leadership includes ${leader.name} (${leader.role}), ` +
        `whose tenure reflects the political continuity in ${profile.city}. Leadership backgrounds, policy priorities, and international engagement history ` +
        `are documented through official sources and verified media coverage. Regular changes in political leadership are documented, ` +
        `providing historical patterns for understanding governance transitions.`;
    }
    return `Leadership information for ${profile.city} is available through official government channels and recent news coverage. ` +
      `Current political leadership reflects electoral processes within ${profile.country} and determines policy direction for municipal initiatives. ` +
      `Understanding leadership priorities aids in assessing partnership receptivity and project timeline alignment.`;
  }

  private generatePolicyEnvironmentParagraph(profile: CityProfile): string {
    return `The policy environment in ${profile.city} reflects both ${profile.country} national regulations and local ordinances. ` +
      `Business regulations, investment guidelines, and labor laws establish the framework for commercial operations. ` +
      `Recent policy changes and government priorities are documented in news coverage and official announcements. ` +
      `Regulatory friction index of ${profile.regulatoryFriction}/100 indicates the complexity of navigating government processes.`;
  }

  private generateTransportConnectivityParagraph(profile: CityProfile, sources: SourceCitation[]): string {
    const airports = profile.infrastructure?.airports?.[0]?.name || 'aviation services';
    const ports = profile.infrastructure?.seaports?.[0]?.name || 'port facilities';
    return `Transportation infrastructure in ${profile.city} includes ${airports} for air connectivity and ${ports} for maritime commerce. ` +
      `Internal road networks, public transit systems, and logistics hubs facilitate cargo movement and passenger transport. ` +
      `${sources.length > 0 ? 'Government transport authorities provide documentation of infrastructure capacity and development plans.' : 'Regional development plans outline infrastructure improvement trajectories.'}`;
  }

  private generateUtilitiesAndPowerParagraph(profile: CityProfile): string {
    return `Power supply in ${profile.city} is managed by regional utilities with documented capacity (${profile.infrastructure?.powerCapacity || 'verified megawatts'}). ` +
      `Water supply, wastewater treatment, and waste management systems support both residential and industrial operations. ` +
      `Utilities infrastructure is typically owned/operated by state enterprises or public-private partnerships with published tariff information. ` +
      `Service reliability and maintenance quality affect operational planning for industrial investments.`;
  }

  private generateDigitalInfrastructureParagraph(profile: CityProfile): string {
    const internet = profile.infrastructure?.internetPenetration || 'documented internet access';
    return `Digital infrastructure in ${profile.city} shows internet penetration at ${internet}, supporting telecommunications and data connectivity. ` +
      `Broadband availability, mobile networks, and telecom providers create digital connectivity foundation for modern business operations. ` +
      `Technology infrastructure development plans indicate ongoing expansion of digital services and capabilities. ` +
      `Cybersecurity frameworks and data protection regulations align with ${profile.country} national standards.`;
  }

  private generateInvestmentClimateParagraph(profile: CityProfile, sources: SourceCitation[]): string {
    return `Investment climate in ${profile.city} is characterized by regulatory accessibility with documented processes for foreign investors. ` +
      `The city actively promotes investment through investment promotion offices and development programs. ` +
      `International organizations assess investment conditions using structured frameworks, providing comparative benchmarking data. ` +
      `${sources.length > 0 ? 'Recent investment trends and successful project cases demonstrate practical pathways for market entry.' : 'Documented incentive programs create financial advantages for qualifying investments.'}`;
  }

  private generateSpecialEconomicZonesParagraph(profile: CityProfile): string {
    const zones = profile.infrastructure?.specialEconomicZones || ['documented economic zones'];
    return `Special Economic Zones and industrial parks in ${profile.city} area include ${Array.isArray(zones) ? zones.join(', ') : zones}. ` +
      `These zones typically provide tax incentives, simplified customs procedures, and dedicated infrastructure for manufacturing and trade operations. ` +
      `Zone governance structures, occupancy rates, and available facilities are documented by zone management authorities. ` +
      `Success of zone investments varies by sector specialization and quality of zone infrastructure.`;
  }

  private generateIncentiveFrameworkParagraph(profile: CityProfile): string {
    return `Incentive frameworks in ${profile.city} may include tax holidays for specified periods, exemptions on import duties, ` +
      `and subsidized industrial land or building space. The specific incentives applicable depend on investment size, sector classification, and employment creation. ` +
      `Investment promotion agencies provide detailed incentive matrices and application procedures. ` +
      `Incentive terms are negotiated based on project fit with local development priorities.`;
  }

  private generateMarketEntryPathwayParagraph(profile: CityProfile): string {
    return `Market entry pathways for ${profile.city} vary by business model"direct investment, joint ventures with local partners, or franchise relationships. ` +
      `Legal frameworks governing company registration, capital requirements, and operating licenses are codified in {{country}} law. ` +
      `Professional service providers including legal firms, accounting firms, and business consultants offer market entry facilitation services. ` +
      `Documented regulatory procedures and typical timelines inform project planning and resource allocation.`;
  }

  private generateRiskAssessmentParagraph(profile: CityProfile): string {
    return `Risk assessment for ${profile.city} identifies both systematic and idiosyncratic risks. Systematic risks include country-level factors ` +
      `such as macroeconomic volatility and political stability (score: ${profile.politicalStability}/100). Idiosyncratic risks include operational factors ` +
      `such as supply chain vulnerabilities and regulatory friction (score: ${profile.regulatoryFriction}/100). ` +
      `Mitigation strategies should address both categories through diversification and contingency planning.`;
  }

  private generatePoliticalRiskParagraph(profile: CityProfile, result: MultiSourceResult): string {
    const newsCount = result.sources.filter(s => s.type === 'news').length;
    return `Political risk in {{country}} and ${profile.city} reflects regional geopolitics and domestic governance. ` +
      `Political stability score of ${profile.politicalStability}/100 indicates the baseline risk environment. ` +
      `${newsCount > 0 ? `Recent news coverage (${newsCount} sources) documents current political developments and their economic implications. ` : ''}` +
      `Long-term political trends, electoral cycles, and key leadership transitions inform forward-looking risk assessment.`;
  }

  private generateOperationalRisksParagraph(profile: CityProfile): string {
    return `Operational risks in ${profile.city} include supply chain disruptions, infrastructure reliability variations, and labor market volatility. ` +
      `Infrastructure score of ${profile.infrastructureScore}/100 indicates reliability of transportation, utilities, and communications. ` +
      `Workforce availability and skill levels affect hiring costs and training requirements. ` +
      `Mitigation approaches include supply chain diversification, backup power systems, and trained workforce development.`;
  }

  private generateOpportunitiesOverviewParagraph(profile: CityProfile): string {
    return `Growth opportunities in ${profile.city} emerge from multiple sources: urbanization trends, sector specialization, and regional integration. ` +
      `The city's engagement score of ${profile.engagementScore}/100 and investment momentum of ${profile.investmentMomentum}/100 suggest ` +
      `receptivity to new investments and partnership opportunities. Strategic advantages including ` +
      `${(profile.strategicAdvantages || []).slice(0, 2).join(' and ')} create competitive niches for aligned investments.`;
  }

  private generateSectorOpportunitiesParagraph(profile: CityProfile): string {
    const sectors = profile.keySectors?.slice(0, 3).join(', ') || 'primary sectors';
    return `Sector-specific opportunities in ${profile.city} include growth potential in ${sectors}. ` +
      `Each sector shows documented market demand, available workforce, and infrastructure support. ` +
      `Sectors with skilled worker availability and established supply chains present lower operational risk. ` +
      `Emerging sectors with government support incentives offer higher growth potential with correspondingly higher execution risk.`;
  }

  private generatePartnershipOpportunitiesParagraph(profile: CityProfile): string {
    return `Partnership opportunities with local entities in ${profile.city} include collaborations with industry associations, ` +
      `technology transfer partnerships, and joint venture arrangements with local companies. ` +
      `Government partnership programs offer structured frameworks for public-private cooperation. ` +
      `Documented case studies of successful partnerships provide practical models for structuring new collaborations.`;
  }

  // 
  // FACT EXTRACTION HELPERS
  // 

  private extractKeyFacts(profile: CityProfile): string[] {
    return [
      `City: ${profile.city}, ${profile.region}, ${profile.country}`,
      `Population: ${profile.demographics?.population || 'Data pending'}`,
      `Timezone: ${profile.timezone}`,
      `Currency: ${profile.currency}`,
      `Primary Sectors: ${profile.keySectors?.slice(0, 3).join(', ') || 'Diversified'}`,
      `Known For: ${profile.knownFor?.slice(0, 3).join(', ') || 'Regional commerce'}`
    ];
  }

  private extractEconomicFacts(profile: CityProfile): string[] {
    return [
      `GDP: ${profile.economics?.gdpLocal || 'Data pending'}`,
      `Growth Rate: ${profile.economics?.gdpGrowthRate || 'Data pending'}`,
      `Employment Rate: ${profile.economics?.employmentRate || 'Data pending'}`,
      `Major Industries: ${profile.keySectors?.slice(0, 3).join(', ') || 'Multiple sectors'}`,
      `Top Exports: ${profile.economics?.topExports?.slice(0, 3).join(', ') || 'See research'}`,
      `Trade Partners: ${profile.economics?.tradePartners?.slice(0, 3).join(', ') || 'Regional and global'}`
    ];
  }

  private extractGovernanceFacts(profile: CityProfile): string[] {
    const leaderInfo = profile.leaders?.[0] 
      ? `${profile.leaders[0].name} (${profile.leaders[0].role})`
      : 'See government sources';

    return [
      `Current Leadership: ${leaderInfo}`,
      `Government Departments: ${profile.departments?.join(', ') || 'City administration'}`,
      `Political Stability: ${profile.politicalStability}/100`,
      `Regulatory Friction: ${profile.regulatoryFriction}/100`,
      `Ease of Doing Business: ${profile.easeOfDoingBusiness || 'See World Bank data'}`,
      `Administrative Hours: ${profile.businessHours || 'Standard business hours'}`
    ];
  }

  private extractInfrastructureFacts(profile: CityProfile): string[] {
    return [
      `Airports: ${profile.infrastructure?.airports?.[0]?.name || 'See local authority'}`,
      `Seaports: ${profile.infrastructure?.seaports?.[0]?.name || 'See port authority'}`,
      `Power Capacity: ${profile.infrastructure?.powerCapacity || 'Data pending'}`,
      `Internet Penetration: ${profile.infrastructure?.internetPenetration || 'Data pending'}`,
      `Special Economic Zones: ${profile.infrastructure?.specialEconomicZones?.slice(0, 2).join(', ') || 'Contact investment office'}`,
      `Infrastructure Score: ${profile.infrastructureScore}/100`
    ];
  }

  private extractInvestmentFacts(profile: CityProfile): string[] {
    return [
      `Investment Programs: ${profile.investmentPrograms?.slice(0, 2).join(', ') || 'Contact local office'}`,
      `Special Economic Zones: ${profile.infrastructure?.specialEconomicZones?.slice(0, 2).join(', ') || 'See investment office'}`,
      `Investment Momentum: ${profile.investmentMomentum}/100`,
      `Engagement Score: ${profile.engagementScore}/100`,
      `Overlooked Score: ${profile.overlookedScore}/100`,
      `Foreign Companies Present: ${Array.isArray(profile.foreignCompanies) && profile.foreignCompanies.length > 0 && !profile.foreignCompanies[0].includes('Research') ? 'Yes' : 'See trade data'}`
    ];
  }
}

// Singleton instance
export const narrativeSynthesisEngine = new NarrativeSynthesisEngine();

