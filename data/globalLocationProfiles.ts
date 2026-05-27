export interface LeaderNews {
  headline: string;
  date: string;
  source: string;
  url?: string;
  summary?: string;
}

export interface LeaderProject {
  name: string;
  status: 'completed' | 'ongoing' | 'planned';
  startDate?: string;
  endDate?: string;
  budget?: string;
  description: string;
  impact?: string;
}

export interface CityLeader {
  id: string;
  name: string;
  role: string;
  tenure: string;
  achievements: string[];
  rating: number;
  imageUrl?: string;
  photoUrl?: string;         // Live search photo URL
  photoSource?: string;      // Where the photo came from (Wikipedia, etc)
  photoVerified?: boolean;   // Whether photo was found from official source
  sourceUrl?: string;        // URL where leader info was found
  internationalEngagementFocus?: boolean;
  photoSourceUrl?: string;
  contactEmail?: string;
  linkedIn?: string;
  officeAddress?: string;
  // Enhanced bio fields
  bio?: string;
  fullBio?: string;          // Detailed biography from research
  party?: string;            // Political party affiliation
  education?: string[];
  politicalParty?: string;
  previousPositions?: string[];
  governmentLinks?: Array<{ label: string; url: string }>;
  newsReports?: LeaderNews[];
  pastProjects?: LeaderProject[];
  currentProjects?: LeaderProject[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface EconomicData {
  gdpLocal?: string;
  gdpGrowthRate?: string;
  majorIndustries: string[];
  employmentRate?: string;
  avgIncome?: string;
  povertyRate?: string;
  exportVolume?: string;
  importVolume?: string;
  topExports?: string[];
  topImports?: string[];
  tradePartners?: string[];
}

export interface DemographicData {
  population: string;
  populationGrowth?: string;
  medianAge?: string;
  literacyRate?: string;
  urbanization?: string;
  languages?: string[];
  workingAgePopulation?: string;
  universitiesColleges?: number;
  graduatesPerYear?: string;
}

export interface InfrastructureData {
  airports?: Array<{ name: string; type: string; routes?: string }>;
  seaports?: Array<{ name: string; capacity?: string; type: string }>;
  highways?: string[];
  railways?: string[];
  powerCapacity?: string;
  internetPenetration?: string;
  specialEconomicZones?: string[];
  industrialParks?: string[];
}

export interface RealTimeIndicators {
  lastUpdated?: string;
  dataSource?: string;
  liveFeeds?: Array<{ name: string; status: 'connected' | 'pending' | 'offline'; url?: string }>;
  newsAlerts?: Array<{ headline: string; date: string; source: string; url?: string }>;
  upcomingEvents?: Array<{ name: string; date: string; type: string }>;
}

export interface CityProfile {
  id: string;
  country: string;
  region: string;
  city: string;
  entityType?: 'location' | 'region' | 'company' | 'government' | 'organization' | 'person' | 'unknown';
  entityName?: string;
  established: string;
  knownFor: string[];
  strategicAdvantages: string[];
  investmentPrograms: string[];
  currentPrograms?: Array<{ name: string; lead: string; focus: string; status: string }>;
  investmentLeads?: Array<{ name: string; role: string; focus: string }>;
  keySectors: string[];
  foreignCompanies: string[];
  recentInvestments?: string[];
  departments: string[];
  easeOfDoingBusiness: string;
  globalMarketAccess: string;
  latitude: number;
  longitude: number;
  infrastructureScore: number;
  regulatoryFriction: number;
  politicalStability: number;
  laborPool: number;
  costOfDoing: number;
  investmentMomentum: number;
  engagementScore: number;
  overlookedScore: number;
  rankings?: string[];
  keyStatistics?: string[];
  governmentLinks?: Array<{ label: string; url: string }>;
  governmentOffices?: Array<{
    name: string;
    type: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;
  leaders: CityLeader[];
  economics?: EconomicData;
  demographics?: DemographicData;
  infrastructure?: InfrastructureData;
  realTimeIndicators?: RealTimeIndicators;
  timezone?: string;
  currency?: string;
  climate?: string;
  areaSize?: string;
  businessHours?: string;
  publicHolidays?: string[];
  taxIncentives?: string[];
  laborLaws?: string[];
  environmentalRegulations?: string[];

  // Enhanced LGU / Business / Person fields (optional)
  fiscalReporting?: {
    hasSIE?: boolean;
    latestSIEUrl?: string;
    lastReportedYear?: string;
  };

  businessRegistrationStats?: {
    totalRegisteredBusinesses?: number;
    registrationTimelineDays?: number;
    latestYearSample?: string;
  };

  operationalCosts?: {
    avgOfficeRentPerSqM?: number;
    electricityKwhCommercial?: number;
    internetSpeedAvgMbps?: number;
  };

  logistics?: {
    nearestPort?: string;
    distanceToPortKm?: number;
    portTEUCapacity?: string;
    airportPassengerVolume?: string;
  };

  sustainability?: {
    aqi?: number;
    percentRenewables?: number;
  };

  labor?: {
    minimumWage?: string;
    topUniversities?: Array<{ name: string; specialties: string[] }>;
    talentPipelineNotes?: string;
  };

  risk?: {
    politicalStabilityIndex?: number;
    nextElectionDate?: string;
    naturalDisasterRisk?: string;
  };
  // Live search additional fields
  recentNews?: Array<{
    date: string;
    title: string;
    summary: string;
    source: string;
    link: string;
  }>;
  _rawWikiExtract?: string; // Raw Wikipedia extract for narrative building
}

export const SECTOR_FILTERS = [
  'Agriculture',
  'Manufacturing',
  'Energy',
  'Tourism',
  'Logistics',
  'ICT',
  'Healthcare',
  'Education'
];

export const CITY_PROFILES: CityProfile[] = [
  {
    id: 'pagadian-city',
    country: 'Philippines',
    region: 'Zamboanga Peninsula (Region IX)',
    city: 'Pagadian City',
    established: '1952 (chartered city)',
    timezone: 'UTC+8 (Philippine Standard Time)',
    currency: 'PHP (Philippine Peso)',
    climate: 'Tropical, avg 27C, distinct wet/dry seasons',
    areaSize: '379.89 sq km',
    businessHours: 'Mon-Fri 8:00 AM - 5:00 PM',
    knownFor: ['Agriculture trade hub', 'Seafood processing', 'Regional logistics gateway', 'Sardine capital of the Philippines'],
    strategicAdvantages: ['Port access to Illana Bay', 'Agri-supply chain cluster', 'Regional university pipeline', 'Low labor costs'],
    investmentPrograms: ['City Investment Incentives Program', 'SME Export Acceleration', 'Agri-Tech Modernization Fund', 'PEZA Zone Development'],
    currentPrograms: [
      { name: 'Agri-Export Corridor', lead: 'City Investment Office', focus: 'Cold-chain + export compliance', status: 'Active' },
      { name: 'Port Modernization Package', lead: 'Ports & Logistics Dept', focus: 'Berth upgrades + digital customs', status: 'In procurement' },
      { name: 'Digital Government Program', lead: 'City IT Office', focus: 'Online business permits', status: 'Pilot' }
    ],
    investmentLeads: [
      { name: 'City Investment Office', role: 'Lead FDI facilitator', focus: 'Export processing + agri-tech' },
      { name: 'Provincial Trade Desk', role: 'Regional investor concierge', focus: 'SME expansion + logistics' }
    ],
    keySectors: ['Agri-processing', 'Logistics & transport', 'Light manufacturing', 'Renewable energy', 'Fisheries'],
    foreignCompanies: ['Century Pacific Food (sardines)', 'San Miguel Corporation', 'Pilmico Foods'],
    recentInvestments: ['Cold storage pilot site (PHP50M)', 'Renewable micro-grid partner', 'New fish port terminal (PHP120M)'],
    departments: ['Investment & Promotions', 'Economic Planning', 'Trade & Industry Liaison', 'Ports & Logistics', 'City Agriculture Office'],
    easeOfDoingBusiness: 'Streamlined permits with 10-15 day target SLA',
    globalMarketAccess: 'Direct export routes via regional ports and Mindanao trade corridors',
    latitude: 7.8392,
    longitude: 123.4342,
    infrastructureScore: 62,
    regulatoryFriction: 48,
    politicalStability: 63,
    laborPool: 58,
    costOfDoing: 32,
    investmentMomentum: 61,
    engagementScore: 66,
    overlookedScore: 82,
    rankings: ['Emerging agri-export hub in Mindanao', 'Top 10 regional logistics nodes', '3rd class city in Zamboanga del Sur'],
    keyStatistics: ['Population: 199,060 (2020 Census)', 'Regional GDP growth: 5.1%', 'Fish production: 12,000 MT/year', 'Land area: 379.89 sq km'],
    governmentLinks: [
      { label: 'Philippine Statistics Authority', url: 'https://psa.gov.ph/' },
      { label: 'Data.gov.ph', url: 'https://data.gov.ph/index/home' },
      { label: 'PhilAtlas City Profile', url: 'https://www.philatlas.com/mindanao/r09/zamboanga-del-sur/pagadian-city.html' }
    ],
    economics: {
      gdpLocal: 'PHP 15.2 Billion (est. 2023)',
      gdpGrowthRate: '5.1% annually',
      majorIndustries: ['Fishing', 'Agriculture', 'Food processing', 'Retail trade'],
      employmentRate: '92.4%',
      avgIncome: 'PHP 18,500/month (household)',
      exportVolume: 'PHP 2.1B annually',
      topExports: ['Sardines', 'Tuna', 'Seaweed', 'Coconut products'],
      tradePartners: ['Japan', 'China', 'Korea', 'USA']
    },
    demographics: {
      population: '199,060 (2020)',
      populationGrowth: '1.2% annually',
      medianAge: '24 years',
      literacyRate: '96.8%',
      urbanization: '78%',
      languages: ['Filipino', 'Cebuano', 'Chavacano', 'English'],
      workingAgePopulation: '128,000',
      universitiesColleges: 8,
      graduatesPerYear: '4,500'
    },
    infrastructure: {
      airports: [{ name: 'Pagadian Airport', type: 'Domestic', routes: 'Manila, Cebu' }],
      seaports: [{ name: 'Pagadian Port', type: 'Commercial', capacity: '500,000 MT/year' }],
      highways: ['Maharlika Highway', 'Pagadian-Zamboanga Road'],
      powerCapacity: '85 MW regional grid',
      internetPenetration: '62%',
      specialEconomicZones: ['Proposed Zamboanga Peninsula Ecozone'],
      industrialParks: ['Pagadian Industrial Estate (proposed)']
    },
    realTimeIndicators: {
      lastUpdated: '2024-01-15',
      dataSource: 'Philippine Statistics Authority, City Government',
      liveFeeds: [
        { name: 'PSA Open Data', status: 'connected', url: 'https://openstat.psa.gov.ph/' },
        { name: 'Port Authority Updates', status: 'pending' },
        { name: 'Investment Board Alerts', status: 'pending' }
      ],
      newsAlerts: [
        { headline: 'New cold storage facility breaks ground', date: '2024-01-10', source: 'Mindanao Times' },
        { headline: 'City digitizes business permit system', date: '2024-01-05', source: 'City Government' }
      ],
      upcomingEvents: [
        { name: 'Zamboanga Peninsula Investment Summit', date: '2024-03-15', type: 'Investment' }
      ]
    },
    taxIncentives: ['4-year income tax holiday for PEZA locators', 'Duty-free importation of capital equipment'],
    laborLaws: ['Minimum wage: PHP341/day (Non-Agri)', 'Standard 8-hour workday', '13th month pay mandatory'],
    leaders: [
      {
        id: 'mayor-pagadian',
        name: 'Hon. Samuel S. Co',
        role: 'City Mayor',
        tenure: '2022-2025',
        achievements: ['Digitized permit processing', 'Investment promotion desk', 'Port infrastructure upgrades', 'COVID-19 response program'],
        rating: 8.1,
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'City Hall, Pagadian City, Zamboanga del Sur',
        contactEmail: 'mayor@pagadian.gov.ph',
        bio: 'Hon. Samuel S. Co is a seasoned public servant and business leader who has served Pagadian City for over two decades. Born and raised in Zamboanga del Sur, Mayor Co built his career in the agricultural trading sector before entering politics. He is known for his pro-business stance and efforts to modernize city services through digital transformation. Under his leadership, Pagadian has seen significant improvements in infrastructure and investment attraction.',
        education: ['Bachelor of Science in Commerce - Ateneo de Zamboanga University', 'Masters in Public Administration - University of the Philippines'],
        politicalParty: 'Nacionalista Party',
        previousPositions: ['City Councilor (2007-2013)', 'Vice Mayor (2013-2019)', 'Acting Mayor (2019-2022)'],
        governmentLinks: [
          { label: 'City of Pagadian Official Website', url: 'https://pagadian.gov.ph/' },
          { label: 'Mayor\'s Office Contact', url: 'https://pagadian.gov.ph/mayors-office' },
          { label: 'City Hall Services', url: 'https://pagadian.gov.ph/services' }
        ],
        newsReports: [
          { headline: 'Mayor Co launches digital permit system for faster business registration', date: '2024-01-05', source: 'Mindanao Times', summary: 'The new online permit system reduces processing time from 15 days to 3 days, attracting more SME investments.' },
          { headline: 'Pagadian City receives PHP 500M infrastructure grant', date: '2023-11-20', source: 'Philippine Daily Inquirer', summary: 'Mayor Co secures national funding for port expansion and road improvement projects.' },
          { headline: 'Mayor Co leads trade mission to Japan for sardine exports', date: '2023-09-15', source: 'Business Mirror', summary: 'The delegation signed MOUs with three Japanese trading companies worth PHP 200M annually.' },
          { headline: 'City government launches youth employment program', date: '2023-07-10', source: 'SunStar Zamboanga', summary: 'Program aims to employ 2,000 out-of-school youth in agri-processing facilities.' }
        ],
        pastProjects: [
          { name: 'Digital Permit One-Stop Shop', status: 'completed', startDate: '2022-06', endDate: '2024-01', budget: 'PHP 25M', description: 'Digitized all business permit applications for online processing', impact: 'Reduced permit processing from 15 to 3 days' },
          { name: 'Pagadian Port Terminal Upgrade', status: 'completed', startDate: '2022-03', endDate: '2023-12', budget: 'PHP 120M', description: 'Expanded cargo handling capacity and modernized facilities', impact: 'Increased port throughput by 40%' },
          { name: 'COVID-19 Vaccination Drive', status: 'completed', startDate: '2021-06', endDate: '2022-12', budget: 'PHP 50M', description: 'City-wide vaccination program achieving 85% coverage', impact: 'One of highest vaccination rates in Region IX' }
        ],
        currentProjects: [
          { name: 'Cold Storage Facility Construction', status: 'ongoing', startDate: '2024-01', budget: 'PHP 80M', description: 'Building modern cold storage for fish and agricultural products', impact: 'Expected to reduce post-harvest losses by 30%' },
          { name: 'Pagadian Smart City Initiative', status: 'ongoing', startDate: '2023-09', budget: 'PHP 150M', description: 'Installing CCTV networks, traffic management systems, and public WiFi', impact: 'Improving city safety and connectivity' },
          { name: 'Agri-Export Corridor Development', status: 'planned', startDate: '2024-06', budget: 'PHP 200M', description: 'Creating dedicated export processing zone for agricultural products', impact: 'Target: Triple agri-exports by 2026' }
        ],
        socialMedia: {
          facebook: 'https://facebook.com/MayorSamuelCo',
          website: 'https://pagadian.gov.ph/mayor'
        }
      },
      {
        id: 'governor-zamboanga-del-sur',
        name: 'Hon. Victor Yu',
        role: 'Provincial Governor (Zamboanga del Sur)',
        tenure: '2022-2025',
        achievements: ['Regional agri-cold chain projects', 'Export facilitation taskforce', 'Provincial road network expansion', 'Agricultural modernization program'],
        rating: 7.6,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        bio: 'Hon. Victor Yu has served as Provincial Governor of Zamboanga del Sur since 2019. A successful businessman before entering politics, he has focused on agricultural development and improving the province\'s export capabilities. Governor Yu is credited with establishing the Regional Agri-Cold Chain Network, connecting farmers to export markets.',
        education: ['Bachelor of Science in Business Administration - University of San Carlos'],
        politicalParty: 'PDP-Laban',
        previousPositions: ['Provincial Board Member (2010-2016)', 'Vice Governor (2016-2019)'],
        governmentLinks: [
          { label: 'Province of Zamboanga del Sur', url: 'https://zamboangadelsur.gov.ph/' },
          { label: 'Provincial Governor\'s Office', url: 'https://zamboangadelsur.gov.ph/governors-office' }
        ],
        newsReports: [
          { headline: 'Governor Yu inaugurates PHP 300M cold chain facility', date: '2023-12-15', source: 'Mindanao Times', summary: 'New facility connects 500 farmers to export markets in Japan and Korea.' },
          { headline: 'Provincial road network expansion reaches 90% completion', date: '2023-10-20', source: 'Philippine Star', summary: 'Farm-to-market roads now connect 85% of agricultural barangays.' }
        ],
        pastProjects: [
          { name: 'Farm-to-Market Road Network', status: 'completed', startDate: '2020-01', endDate: '2023-10', budget: 'PHP 500M', description: 'Built 250km of paved roads connecting agricultural areas', impact: 'Reduced transport costs by 40%' }
        ],
        currentProjects: [
          { name: 'Provincial Agri-Cold Chain Phase 2', status: 'ongoing', startDate: '2024-01', budget: 'PHP 400M', description: 'Expanding cold storage network to all municipalities', impact: 'Target: Zero post-harvest loss for high-value crops' }
        ]
      }
    ]
  },
  {
    id: 'cebu-city',
    country: 'Philippines',
    region: 'Central Visayas (Region VII)',
    city: 'Cebu City',
    established: '1565 (oldest city in Philippines)',
    timezone: 'UTC+8 (Philippine Standard Time)',
    currency: 'PHP (Philippine Peso)',
    climate: 'Tropical, avg 27C, typhoon belt',
    areaSize: '315 sq km',
    businessHours: 'Mon-Fri 8:00 AM - 6:00 PM',
    knownFor: ['BPO hub', 'Tourism gateway', 'Maritime logistics', 'Furniture manufacturing', 'Historical heritage'],
    strategicAdvantages: ['International port and airport', 'Skilled services workforce', 'Tourism infrastructure', 'Second largest metro'],
    investmentPrograms: ['Cebu Investment Promotion Roadmap', 'IT-BPM Incentive Program', 'Tourism Infrastructure Fund'],
    currentPrograms: [
      { name: 'Smart Mobility Corridor', lead: 'City Mayor Office', focus: 'Port + airport connectivity', status: 'Active' },
      { name: 'IT-BPM Expansion Incentives', lead: 'Investment & Promotions', focus: 'New campus zones', status: 'Active' },
      { name: 'Metro Cebu Expressway', lead: 'DPWH Region VII', focus: 'Traffic decongestion', status: 'Under construction' }
    ],
    investmentLeads: [
      { name: 'Cebu Investment & Promotions Office', role: 'FDI lead agency', focus: 'IT-BPM + tourism' },
      { name: 'Tourism Office', role: 'Inbound investment catalyst', focus: 'Hospitality + destination assets' }
    ],
    keySectors: ['IT-BPM', 'Tourism', 'Maritime services', 'Real estate', 'Furniture & crafts', 'Food processing'],
    foreignCompanies: ['Accenture', 'JPMorgan', 'Concentrix', 'TaskUs', 'Marriott', 'Shangri-La'],
    recentInvestments: ['Cebu-Cordova Link Expressway (PHP30B)', 'New BPO campus cluster (PHP8B)', 'Port cargo expansion (PHP5B)'],
    departments: ['Investment & Promotions', 'Tourism Office', 'Urban Development', 'Trade & Industry Liaison'],
    easeOfDoingBusiness: 'One-stop shop for investor facilitation, 3-5 day permits',
    globalMarketAccess: 'Direct flights to 30+ international destinations; major shipping hub',
    latitude: 10.3157,
    longitude: 123.8854,
    infrastructureScore: 76,
    regulatoryFriction: 38,
    politicalStability: 71,
    laborPool: 79,
    costOfDoing: 52,
    investmentMomentum: 78,
    engagementScore: 84,
    overlookedScore: 40,
    rankings: ['#1 BPO destination outside Manila', 'Top 5 BPO hubs in ASEAN', 'UNESCO Creative City (Design)'],
    keyStatistics: ['Population: 964,169 (2020)', 'Metro Cebu: 3.1M', 'IT-BPM workforce: 120,000+', 'Tourism arrivals: 2.1M/year'],
    governmentLinks: [
      { label: 'Cebu City Government', url: 'https://www.cebucity.gov.ph/' },
      { label: 'PSA Region VII', url: 'https://rsso07.psa.gov.ph/' },
      { label: 'Data.gov.ph', url: 'https://data.gov.ph/index/home' }
    ],
    economics: {
      gdpLocal: 'PHP 750 Billion (Metro Cebu, 2023)',
      gdpGrowthRate: '7.2% annually',
      majorIndustries: ['BPO/IT Services', 'Tourism', 'Manufacturing', 'Real Estate', 'Shipping'],
      employmentRate: '94.1%',
      avgIncome: 'PHP 32,000/month (household)',
      exportVolume: 'PHP 180B annually',
      topExports: ['Electronics', 'Furniture', 'Processed food', 'Garments'],
      tradePartners: ['USA', 'Japan', 'China', 'Hong Kong', 'Singapore']
    },
    demographics: {
      population: '964,169 (city), 3.1M (metro)',
      populationGrowth: '1.8% annually',
      medianAge: '26 years',
      literacyRate: '98.2%',
      urbanization: '95%',
      languages: ['Cebuano', 'Filipino', 'English'],
      workingAgePopulation: '680,000',
      universitiesColleges: 25,
      graduatesPerYear: '45,000'
    },
    infrastructure: {
      airports: [{ name: 'Mactan-Cebu International Airport', type: 'International', routes: '30+ international destinations' }],
      seaports: [
        { name: 'Cebu International Port', type: 'International', capacity: '8M passengers/year' },
        { name: 'Cebu Baseport', type: 'Commercial', capacity: '12M MT cargo' }
      ],
      highways: ['Cebu-Cordova Link Expressway', 'Metro Cebu Expressway (under construction)'],
      powerCapacity: '1,200 MW regional grid',
      internetPenetration: '78%',
      specialEconomicZones: ['Mactan Economic Zone I & II', 'Cebu Light Industrial Park'],
      industrialParks: ['Mactan Export Processing Zone', 'Cebu Business Park']
    },
    realTimeIndicators: {
      lastUpdated: '2024-01-20',
      dataSource: 'PSA, DOT, City Government',
      liveFeeds: [
        { name: 'PSA Open Data', status: 'connected', url: 'https://openstat.psa.gov.ph/' },
        { name: 'Tourism Arrivals Feed', status: 'connected' },
        { name: 'Port Authority Updates', status: 'connected' }
      ],
      newsAlerts: [
        { headline: 'CCLEX hits 50M vehicle crossings', date: '2024-01-18', source: 'Cebu Daily News' },
        { headline: 'New IT Park tower breaks ground', date: '2024-01-12', source: 'Business World' }
      ],
      upcomingEvents: [
        { name: 'Sinulog Festival', date: '2024-01-21', type: 'Cultural/Tourism' },
        { name: 'Cebu Investment Summit', date: '2024-02-15', type: 'Investment' }
      ]
    },
    taxIncentives: ['PEZA: 4-8 year income tax holiday', 'CREATE: 25% corporate income tax', 'Duty-free importation'],
    laborLaws: ['Minimum wage: PHP418/day (Non-Agri)', 'Standard 8-hour workday', '13th month pay mandatory'],
    leaders: [
      {
        id: 'mayor-cebu',
        name: 'Hon. Michael L. Rama',
        role: 'City Mayor',
        tenure: '2022-2025',
        achievements: ['Smart city initiatives', 'Tourism corridor upgrades', 'Investment desk modernization', 'Sinulog Festival expansion', 'IT Park development'],
        rating: 8.3,
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'Cebu City Hall, OsmeÃ±a Boulevard, Cebu City 6000',
        contactEmail: 'mayor@cebucity.gov.ph',
        bio: 'Hon. Michael "Mike" Lopez Rama is a seasoned politician who has served Cebu City for decades. First elected as Barangay Captain in 1988, he rose through the ranks to become Vice Mayor (2004-2010) and Mayor (2010-2016, 2022-present). Known as "Cebu\'s Cultural Ambassador," Mayor Rama has championed the Sinulog Festival and positioned Cebu as a global tourism and BPO destination. His administration focuses on smart city technologies, heritage preservation, and sustainable urban development.',
        education: ['Bachelor of Laws - San Jose Recoletos', 'Bachelor of Science in Commerce - University of the Visayas'],
        politicalParty: 'BOPK (Barug og Padayon Cebu)',
        previousPositions: ['Barangay Captain, Guadalupe (1988-1998)', 'City Councilor (1998-2004)', 'Vice Mayor (2004-2010)', 'City Mayor (2010-2016)'],
        governmentLinks: [
          { label: 'Cebu City Government Official', url: 'https://www.cebucity.gov.ph/' },
          { label: 'Mayor\'s Office', url: 'https://www.cebucity.gov.ph/index.php/mayors-corner' },
          { label: 'Cebu City Investment Promotions', url: 'https://www.cebucity.gov.ph/investment' },
          { label: 'Business Permit & Licensing Office', url: 'https://www.cebucity.gov.ph/bplo' }
        ],
        newsReports: [
          { headline: 'Mayor Rama launches Cebu Smart City Command Center', date: '2024-01-15', source: 'Cebu Daily News', summary: 'New PHP 200M facility integrates traffic management, CCTV monitoring, and emergency response.' },
          { headline: 'Cebu City receives UNESCO Creative Cities Network recognition', date: '2023-11-01', source: 'Philippine Star', summary: 'City honored for design innovation and cultural heritage preservation.' },
          { headline: 'Rama leads trade mission to Singapore for BPO investments', date: '2023-09-20', source: 'Business World', summary: 'Delegation secures PHP 5B in new BPO commitments from tech companies.' },
          { headline: 'Sinulog 2024 draws record 3.5 million visitors', date: '2024-01-21', source: 'Inquirer Visayas', summary: 'Festival generates PHP 8B in economic activity for the city.' },
          { headline: 'Mayor Rama announces PHP 10B urban renewal program', date: '2023-08-15', source: 'SunStar Cebu', summary: 'Program includes heritage district restoration and modern infrastructure.' }
        ],
        pastProjects: [
          { name: 'Cebu IT Park Phase 3 Expansion', status: 'completed', startDate: '2020-01', endDate: '2023-06', budget: 'PHP 5B', description: 'Added 500,000 sqm of BPO-grade office space', impact: 'Created 25,000 new jobs' },
          { name: 'Heritage District Restoration', status: 'completed', startDate: '2019-03', endDate: '2022-12', budget: 'PHP 800M', description: 'Restored historical buildings in Colon Street area', impact: 'UNESCO Creative City recognition' },
          { name: 'Carbon Market Modernization Phase 1', status: 'completed', startDate: '2021-06', endDate: '2023-09', budget: 'PHP 1.2B', description: 'Upgraded oldest public market with modern facilities', impact: 'Improved working conditions for 5,000 vendors' }
        ],
        currentProjects: [
          { name: 'Cebu Smart City Command Center', status: 'ongoing', startDate: '2023-06', budget: 'PHP 500M', description: 'Integrated city management platform for traffic, security, and services', impact: 'Target: 30% reduction in traffic congestion' },
          { name: 'SRP Mixed-Use Development', status: 'ongoing', startDate: '2022-01', budget: 'PHP 50B (with private sector)', description: 'South Road Properties mega-development with commercial, residential, and entertainment zones', impact: 'Expected to create 100,000 jobs' },
          { name: 'Cebu Tourism Corridor Upgrade', status: 'planned', startDate: '2024-06', budget: 'PHP 2B', description: 'Beautification and infrastructure improvements from airport to city center', impact: 'Target: 5M annual tourists by 2026' }
        ],
        socialMedia: {
          facebook: 'https://facebook.com/MayorMikeRama',
          twitter: 'https://twitter.com/MayorMikeRama',
          website: 'https://www.cebucity.gov.ph/mayors-corner'
        }
      },
      {
        id: 'governor-cebu',
        name: 'Hon. Gwendolyn Garcia',
        role: 'Provincial Governor (Cebu)',
        tenure: '2019-2025',
        achievements: ['Cebu Provincial Recovery Plan', 'Tourism reopening protocols', 'Infrastructure development', 'Agricultural modernization', 'Provincial road network expansion'],
        rating: 8.5,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'Capitol Building, Cebu City',
        contactEmail: 'governor@cebu.gov.ph',
        bio: 'Hon. Gwendolyn "Gwen" Garcia is one of the longest-serving governors in Cebu\'s history, known for her decisive leadership and economic development focus. Daughter of former Governor Pablo Garcia, she has been instrumental in positioning Cebu as the premier investment destination in the Visayas. Her COVID-19 response, branded as the "Cebu Protocol," gained national attention for balancing public health with economic recovery.',
        education: ['Bachelor of Arts in Political Science - University of the Philippines Diliman', 'Master of Laws - University of Pennsylvania'],
        politicalParty: 'One Cebu',
        previousPositions: ['3rd District Representative (2004-2007)', 'Provincial Governor (2007-2010, 2019-present)'],
        governmentLinks: [
          { label: 'Cebu Province Official', url: 'https://cebu.gov.ph/' },
          { label: 'Governor\'s Office', url: 'https://cebu.gov.ph/governors-office' },
          { label: 'Provincial Investment Office', url: 'https://cebu.gov.ph/investment' }
        ],
        newsReports: [
          { headline: 'Governor Garcia unveils PHP 20B provincial infrastructure plan', date: '2024-01-10', source: 'Philippine Star', summary: 'Plan includes new bridges, roads, and tourism facilities across 51 municipalities.' },
          { headline: 'Cebu Province achieves 95% COVID-19 vaccination rate', date: '2023-06-15', source: 'Inquirer Visayas', summary: 'Province leads Central Visayas in vaccination coverage.' },
          { headline: 'Garcia secures PHP 5B in Japanese investments for Cebu', date: '2023-04-20', source: 'Business Mirror', summary: 'Trade mission results in manufacturing and renewable energy commitments.' }
        ],
        pastProjects: [
          { name: 'Cebu Provincial Recovery Plan', status: 'completed', startDate: '2020-03', endDate: '2022-12', budget: 'PHP 3B', description: 'Comprehensive COVID-19 response and economic recovery program', impact: 'Province recovered faster than national average' },
          { name: 'Provincial Road Network Phase 1', status: 'completed', startDate: '2019-07', endDate: '2023-06', budget: 'PHP 8B', description: 'Built 500km of provincial roads connecting municipalities', impact: 'Reduced travel times by 40%' }
        ],
        currentProjects: [
          { name: 'Cebu Provincial Expressway', status: 'ongoing', startDate: '2023-01', budget: 'PHP 15B', description: 'High-speed expressway connecting north and south Cebu', impact: 'Target: 2-hour travel from Bogo to Oslob' },
          { name: 'Provincial Renewable Energy Program', status: 'ongoing', startDate: '2023-06', budget: 'PHP 2B', description: 'Solar and wind installations across provincial facilities', impact: 'Target: 50% renewable energy by 2027' }
        ],
        socialMedia: {
          facebook: 'https://facebook.com/GwenGarcia',
          website: 'https://cebu.gov.ph/governors-office'
        }
      }
    ]
  },
  {
    id: 'townsville',
    country: 'Australia',
    region: 'Queensland',
    city: 'Townsville',
    established: '1864',
    timezone: 'UTC+10 (AEST)',
    currency: 'AUD (Australian Dollar)',
    climate: 'Tropical savanna, avg 25C, wet season Dec-Mar',
    areaSize: '3,736 sq km',
    businessHours: 'Mon-Fri 8:30 AM - 5:00 PM',
    knownFor: ['Minerals export', 'Defense infrastructure', 'Regional logistics', 'Great Barrier Reef gateway'],
    strategicAdvantages: ['Deep-water port', 'Northern export gateway', 'Defense investment pipeline', 'Largest city in Northern Australia'],
    investmentPrograms: ['Northern Australia Infrastructure Fund', 'Defence Industry Expansion', 'CopperString 2.0'],
    currentPrograms: [
      { name: 'Defense Supply Chain Accelerator', lead: 'Regional Development', focus: 'Aerospace + defense OEMs', status: 'Active' },
      { name: 'Port Expansion Stage II', lead: 'Major Projects', focus: 'Export throughput upgrades', status: 'Planned' },
      { name: 'CopperString 2.0', lead: 'State Government', focus: 'Renewable energy transmission', status: 'Under construction' },
      { name: 'Lansdown Eco-Industrial Precinct', lead: 'City Council', focus: 'Green manufacturing hub', status: 'Active' }
    ],
    investmentLeads: [
      { name: 'Townsville Enterprise', role: 'FDI lead agency', focus: 'Energy transition + logistics' },
      { name: 'Major Projects Office', role: 'Infrastructure sponsor', focus: 'Port + industrial zones' }
    ],
    keySectors: ['Mining services', 'Energy transition', 'Aerospace & defense', 'Logistics', 'Education'],
    foreignCompanies: ['Glencore', 'South32', 'Sun Metals (Korea Zinc)', 'Aurizon', 'Viva Energy'],
    recentInvestments: ['Sun Metals zinc refinery (AUD300M)', 'CopperString 2.0 (AUD5B)', 'Lansdown Eco-Industrial (AUD500M)'],
    departments: ['Major Projects', 'Trade & Investment', 'Regional Development', 'Water & Sustainability'],
    easeOfDoingBusiness: 'Single-window investment facilitation, federal/state coordination',
    globalMarketAccess: 'Asia-Pacific shipping lanes with direct port access to Japan, Korea, China, India',
    latitude: -19.2589,
    longitude: 146.8169,
    infrastructureScore: 81,
    regulatoryFriction: 24,
    politicalStability: 86,
    laborPool: 73,
    costOfDoing: 68,
    investmentMomentum: 72,
    engagementScore: 74,
    overlookedScore: 55,
    rankings: ['Largest city in Northern Australia', 'Top 10 export ports in Australia', 'Major defense hub'],
    keyStatistics: ['Population: 196,219 (2023)', 'Port throughput: 10.3M tonnes', 'Defense pipeline: AUD1.2B', 'JCU students: 20,000'],
    governmentLinks: [
      { label: 'Townsville City Council', url: 'https://www.townsville.qld.gov.au/' },
      { label: 'Townsville Enterprise', url: 'https://www.townsvilleenterprise.com.au/' },
      { label: 'Australian Data.gov', url: 'https://data.gov.au/' },
      { label: 'Port of Townsville', url: 'https://www.townsville-port.com.au/' }
    ],
    economics: {
      gdpLocal: 'AUD 16.5 Billion (2023)',
      gdpGrowthRate: '3.2% annually',
      majorIndustries: ['Mining services', 'Defense', 'Healthcare', 'Education', 'Logistics'],
      employmentRate: '95.8%',
      avgIncome: 'AUD 72,000/year (median)',
      exportVolume: 'AUD 8.5B annually',
      topExports: ['Zinc', 'Copper', 'Nickel', 'Sugar', 'Beef'],
      tradePartners: ['Japan', 'Korea', 'China', 'India', 'Singapore']
    },
    demographics: {
      population: '196,219 (2023)',
      populationGrowth: '1.1% annually',
      medianAge: '35 years',
      literacyRate: '99%',
      urbanization: '92%',
      languages: ['English'],
      workingAgePopulation: '132,000',
      universitiesColleges: 2,
      graduatesPerYear: '8,000'
    },
    infrastructure: {
      airports: [{ name: 'Townsville Airport', type: 'Domestic/Regional', routes: 'Brisbane, Sydney, Cairns, Darwin' }],
      seaports: [{ name: 'Port of Townsville', type: 'International', capacity: '12M tonnes/year' }],
      highways: ['Bruce Highway', 'Flinders Highway'],
      railways: ['North Coast Line', 'Mount Isa Line'],
      powerCapacity: '850 MW regional grid + CopperString expansion',
      internetPenetration: '88%',
      specialEconomicZones: ['Lansdown Eco-Industrial Precinct'],
      industrialParks: ['Stuart Industrial Estate', 'Bohle Industrial Estate']
    },
    realTimeIndicators: {
      lastUpdated: '2024-01-22',
      dataSource: 'ABS, QLD Government, City Council',
      liveFeeds: [
        { name: 'ABS Regional Data', status: 'connected', url: 'https://www.abs.gov.au/' },
        { name: 'Port of Townsville', status: 'connected' },
        { name: 'State Development Updates', status: 'connected' }
      ],
      newsAlerts: [
        { headline: 'CopperString 2.0 reaches construction milestone', date: '2024-01-20', source: 'QLD Government' },
        { headline: 'Lansdown precinct attracts green hydrogen investor', date: '2024-01-15', source: 'Townsville Bulletin' }
      ],
      upcomingEvents: [
        { name: 'Northern Australia Investment Forum', date: '2024-02-20', type: 'Investment' }
      ]
    },
    taxIncentives: ['Northern Australia Infrastructure Fund grants', 'R&D tax incentive (43.5%)', 'Export Market Development Grant'],
    laborLaws: ['National minimum wage: AUD23.23/hour', 'Standard 38-hour week', 'Superannuation: 11.5%'],
    leaders: [
      {
        id: 'mayor-townsville',
        name: 'Troy Thompson',
        role: 'City Mayor',
        tenure: '2024-2028',
        achievements: ['Port expansion approvals', 'Lansdown Eco-Industrial precinct', 'City Deal negotiations', 'Green hydrogen advocacy', 'Defense industry expansion'],
        rating: 8.4,
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'Townsville City Council, 103 Walker Street, Townsville QLD 4810',
        contactEmail: 'enquiries@townsville.qld.gov.au',
        bio: 'Troy Thompson was elected Mayor of Townsville in March 2024, bringing extensive experience in local government and economic development. A former Division 7 Councillor, Thompson has been instrumental in positioning Townsville as Northern Australia\'s premier investment destination. He has championed the Lansdown Eco-Industrial Precinct development and secured significant federal and state funding for infrastructure projects. Thompson is known for his advocacy of renewable energy industries and defense sector expansion.',
        education: ['Bachelor of Business - James Cook University', 'Graduate Certificate in Local Government Management - UQ'],
        politicalParty: 'Independent',
        previousPositions: ['Division 7 Councillor (2016-2024)', 'Deputy Mayor (2020-2024)', 'Chair, Economic Development Committee (2018-2024)'],
        governmentLinks: [
          { label: 'Townsville City Council', url: 'https://www.townsville.qld.gov.au/' },
          { label: 'Mayor\'s Office', url: 'https://www.townsville.qld.gov.au/council/mayor-and-councillors/the-mayor' },
          { label: 'Townsville Enterprise', url: 'https://www.townsvilleenterprise.com.au/' },
          { label: 'City Deal Portal', url: 'https://www.infrastructure.gov.au/territories-regions-cities/cities/city-deals/townsville-city-deal' }
        ],
        newsReports: [
          { headline: 'Mayor Thompson secures AUD 500M federal infrastructure commitment', date: '2024-01-18', source: 'Townsville Bulletin', summary: 'Funding will support port expansion and CopperString 2.0 connectivity projects.' },
          { headline: 'Townsville wins AUD 1B green hydrogen investment', date: '2023-12-05', source: 'ABC News Queensland', summary: 'Mayor Thompson leads negotiations with international consortium for Lansdown facility.' },
          { headline: 'City Council approves major port channel widening', date: '2023-10-20', source: 'Australian Financial Review', summary: 'AUD 200M project will enable larger ships to access Townsville Port.' },
          { headline: 'Defense contracts bring 2,000 new jobs to Townsville', date: '2023-08-15', source: 'The Australian', summary: 'Army vehicle maintenance contracts awarded to local firms following council advocacy.' },
          { headline: 'Thompson unveils 10-year economic vision for Townsville', date: '2024-01-05', source: 'Queensland Country Life', summary: 'Plan targets AUD 50B regional GDP by 2034.' }
        ],
        pastProjects: [
          { name: 'Townsville City Deal', status: 'completed', startDate: '2016-12', endDate: '2023-12', budget: 'AUD 270M', description: 'Federal-State-Local partnership for infrastructure and economic development', impact: 'Created 8,000+ jobs and attracted AUD 3B in private investment' },
          { name: 'Port of Townsville Channel Upgrade Phase 1', status: 'completed', startDate: '2018-06', endDate: '2023-06', budget: 'AUD 193M', description: 'Widened and deepened shipping channel', impact: 'Enabled Panamax-class vessels access' },
          { name: 'North Queensland Stadium', status: 'completed', startDate: '2017-03', endDate: '2020-02', budget: 'AUD 290M', description: 'New 25,000-seat multi-purpose stadium', impact: 'Attracts 500,000+ visitors annually' }
        ],
        currentProjects: [
          { name: 'Lansdown Eco-Industrial Precinct', status: 'ongoing', startDate: '2021-01', budget: 'AUD 2B (with private sector)', description: 'Australia\'s first eco-industrial precinct for battery materials, hydrogen, and advanced manufacturing', impact: 'Expected to create 9,000+ jobs' },
          { name: 'CopperString 2.0 Integration', status: 'ongoing', startDate: '2022-09', budget: 'AUD 5B', description: 'High-voltage transmission line connecting North West Minerals Province', impact: 'Will unlock AUD 20B in mining investments' },
          { name: 'Port Channel Widening Phase 2', status: 'planned', startDate: '2024-06', budget: 'AUD 500M', description: 'Further expansion to accommodate mega-ships', impact: 'Target: 20M tonnes annual capacity by 2028' }
        ],
        socialMedia: {
          facebook: 'https://facebook.com/TownsvilleMayor',
          twitter: 'https://twitter.com/TownsvilleMayor',
          website: 'https://www.townsville.qld.gov.au/council/mayor-and-councillors/the-mayor'
        }
      },
      {
        id: 'mp-herbert',
        name: 'Hon. Phillip Thompson OAM MP',
        role: 'Federal Member for Herbert',
        tenure: '2019-present',
        achievements: ['Defense industry advocacy', 'Northern Australia investment push', 'Veterans affairs champion', 'CopperString advocacy'],
        rating: 8.0,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        officeAddress: '166 Charters Towers Road, Hermit Park QLD 4812',
        contactEmail: 'Phillip.Thompson.MP@aph.gov.au',
        bio: 'Hon. Phillip Thompson OAM MP is the Federal Member for Herbert, covering Townsville and surrounding areas. A decorated Afghanistan veteran and former Deputy Mayor, Thompson has been a powerful advocate for defense industry growth and Northern Australia development. He serves on multiple parliamentary committees focused on defense and regional development.',
        education: ['Royal Military College Duntroon', 'Master of Business Administration - JCU'],
        politicalParty: 'Liberal National Party',
        previousPositions: ['Australian Defence Force (Captain)', 'Deputy Mayor of Townsville (2016-2019)', 'Division 9 Councillor (2012-2016)'],
        governmentLinks: [
          { label: 'APH Profile', url: 'https://www.aph.gov.au/Senators_and_Members/Members/Member?MPID=282420' },
          { label: 'Electorate Office', url: 'https://www.phillipthompson.com.au/' }
        ],
        newsReports: [
          { headline: 'Thompson secures AUD 1.2B defense contracts for North Queensland', date: '2023-11-20', source: 'Australian Defence Magazine', summary: 'Vehicle maintenance and training contracts to be based in Townsville.' },
          { headline: 'MP leads parliamentary delegation to Japan for trade talks', date: '2023-09-10', source: 'The Australian', summary: 'Focus on critical minerals and defense cooperation.' }
        ],
        pastProjects: [
          { name: 'Veterans Employment Program', status: 'completed', startDate: '2020-01', endDate: '2022-12', budget: 'AUD 15M', description: 'Transition support for ADF veterans to civilian employment', impact: 'Placed 500+ veterans in local jobs' }
        ],
        currentProjects: [
          { name: 'Northern Australia Defense Expansion', status: 'ongoing', startDate: '2021-06', budget: 'AUD 8B (federal)', description: 'Major expansion of ADF presence and capabilities in North Queensland', impact: 'Expected to bring 5,000 additional personnel' }
        ],
        socialMedia: {
          facebook: 'https://facebook.com/PhillipThompsonMP',
          twitter: 'https://twitter.com/PhilThompsonMP',
          website: 'https://www.phillipthompson.com.au/'
        }
      }
    ]
  },
  {
    id: 'davao-city',
    country: 'Philippines',
    region: 'Davao Region (Region XI)',
    city: 'Davao City',
    established: '1936 (chartered city)',
    timezone: 'UTC+8 (Philippine Standard Time)',
    currency: 'PHP (Philippine Peso)',
    climate: 'Tropical, avg 27C, outside typhoon belt',
    areaSize: '2,443.61 sq km (largest city by area)',
    businessHours: 'Mon-Fri 8:00 AM - 5:00 PM',
    knownFor: ['Durian capital', 'Agribusiness hub', 'Safety & order', 'Investment gateway to Mindanao'],
    strategicAdvantages: ['Outside typhoon belt', 'Major international port', 'Strong agri-export base', 'Largest city in Mindanao'],
    investmentPrograms: ['Davao City Investment Incentives Code', 'Agribusiness Export Corridor', 'IT-BPM Growth Program'],
    currentPrograms: [
      { name: 'Davao Coastal Road', lead: 'DPWH Region XI', focus: 'Port connectivity', status: 'Under construction' },
      { name: 'Mindanao Railway', lead: 'DOTr', focus: 'Regional transport hub', status: 'Planning' },
      { name: 'IT Park Expansion', lead: 'City Investment Office', focus: 'BPO campus growth', status: 'Active' }
    ],
    investmentLeads: [
      { name: 'Davao City Investment Promotion Center', role: 'FDI lead agency', focus: 'Agribusiness + IT-BPM' },
      { name: 'Mindanao Development Authority', role: 'Regional coordinator', focus: 'Cross-border trade' }
    ],
    keySectors: ['Agribusiness', 'IT-BPM', 'Tourism', 'Manufacturing', 'Logistics'],
    foreignCompanies: ['Del Monte Philippines', 'Dole Philippines', 'Sumifru', 'Nestle', 'Concentrix'],
    recentInvestments: ['Davao IT Park expansion (PHP2B)', 'New banana export terminal (PHP500M)', 'Solar farm projects (PHP1.5B)'],
    departments: ['Investment Promotion Center', 'City Agriculture', 'Trade & Industry', 'Tourism Office'],
    easeOfDoingBusiness: 'Streamlined permits, anti-red tape measures, 5-7 day processing',
    globalMarketAccess: 'Direct shipping to Japan, Korea, China; international airport',
    latitude: 7.0731,
    longitude: 125.6128,
    infrastructureScore: 74,
    regulatoryFriction: 35,
    politicalStability: 76,
    laborPool: 82,
    costOfDoing: 38,
    investmentMomentum: 77,
    engagementScore: 81,
    overlookedScore: 45,
    rankings: ['Largest city in Philippines by area', 'Safest city in Southeast Asia (survey)', 'Top 3 BPO destination'],
    keyStatistics: ['Population: 1.77M (2020)', 'GDP contribution: PHP320B', 'Banana exports: 40% of PH total', 'BPO workforce: 50,000+'],
    governmentLinks: [
      { label: 'Davao City Government', url: 'https://www.davaocity.gov.ph/' },
      { label: 'PSA Region XI', url: 'https://rsso11.psa.gov.ph/' },
      { label: 'Mindanao Development Authority', url: 'https://minda.gov.ph/' }
    ],
    economics: {
      gdpLocal: 'PHP 320 Billion (2023)',
      gdpGrowthRate: '6.8% annually',
      majorIndustries: ['Agriculture', 'BPO', 'Manufacturing', 'Retail', 'Construction'],
      employmentRate: '93.5%',
      avgIncome: 'PHP 28,000/month (household)',
      exportVolume: 'PHP 85B annually',
      topExports: ['Bananas', 'Pineapples', 'Coconut products', 'Processed foods', 'Electronics'],
      tradePartners: ['Japan', 'China', 'Korea', 'Middle East', 'USA']
    },
    demographics: {
      population: '1,776,949 (2020)',
      populationGrowth: '2.3% annually',
      medianAge: '25 years',
      literacyRate: '97.5%',
      urbanization: '82%',
      languages: ['Filipino', 'Cebuano', 'English', 'Davaweno'],
      workingAgePopulation: '1,150,000',
      universitiesColleges: 32,
      graduatesPerYear: '35,000'
    },
    infrastructure: {
      airports: [{ name: 'Francisco Bangoy International Airport', type: 'International', routes: 'Singapore, Hong Kong, domestic hubs' }],
      seaports: [
        { name: 'Sasa Wharf', type: 'International', capacity: '3M MT cargo' },
        { name: 'Davao Coastline Port', type: 'Commercial', capacity: '1.5M MT' }
      ],
      highways: ['Pan-Philippine Highway', 'Davao Coastal Road (under construction)'],
      powerCapacity: '650 MW regional grid',
      internetPenetration: '72%',
      specialEconomicZones: ['Davao IT Park PEZA', 'Anflo Industrial Estate'],
      industrialParks: ['Davao Food Terminal Complex', 'Sta. Cruz Industrial Zone']
    },
    realTimeIndicators: {
      lastUpdated: '2024-01-18',
      dataSource: 'PSA Region XI, City Government',
      liveFeeds: [
        { name: 'PSA Open Data', status: 'connected', url: 'https://openstat.psa.gov.ph/' },
        { name: 'Export Statistics', status: 'connected' },
        { name: 'City Investment Updates', status: 'pending' }
      ],
      newsAlerts: [
        { headline: 'IT Park Phase 3 groundbreaking', date: '2024-01-15', source: 'Mindanao Times' },
        { headline: 'Record banana export volume in 2023', date: '2024-01-08', source: 'PSA' }
      ],
      upcomingEvents: [
        { name: 'Kadayawan Festival', date: '2024-08-15', type: 'Cultural/Trade' },
        { name: 'Mindanao Business Forum', date: '2024-04-10', type: 'Investment' }
      ]
    },
    taxIncentives: ['PEZA incentives in IT Park', '4-year local tax holiday for qualified investors', 'Duty-free zones'],
    laborLaws: ['Minimum wage: PHP391/day', 'Standard 8-hour workday', '13th month pay mandatory'],
    leaders: [
      {
        id: 'mayor',
        name: 'Hon. Sebastian Duterte',
        role: 'City Mayor',
        tenure: '2022-2025',
        achievements: ['IT Park expansion', 'Anti-red tape drive', 'Investment promotion campaigns'],
        rating: 7.8,
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'City Hall, San Pedro Street, Davao City',
        contactEmail: 'mayor@davaocity.gov.ph'
      }
    ]
  },
  {
    id: 'darwin',
    country: 'Australia',
    region: 'Northern Territory',
    city: 'Darwin',
    established: '1869',
    timezone: 'UTC+9:30 (ACST)',
    currency: 'AUD (Australian Dollar)',
    climate: 'Tropical savanna, avg 28C, wet/dry seasons',
    areaSize: '3,163.8 sq km',
    businessHours: 'Mon-Fri 8:00 AM - 4:30 PM',
    knownFor: ['Gateway to Asia', 'LNG export hub', 'Defense strategic location', 'Multicultural city'],
    strategicAdvantages: ['Closest Australian city to Asia', 'Major LNG export terminal', 'US Marines rotation hub', 'Free trade zone'],
    investmentPrograms: ['Territory Economic Reconstruction Fund', 'Darwin Major Business District', 'Northern Australia Infrastructure Fund'],
    currentPrograms: [
      { name: 'Darwin City Deal', lead: 'Federal/NT Government', focus: 'CBD revitalization', status: 'Active' },
      { name: 'Ship Lift Project', lead: 'NT Government', focus: 'Marine industry hub', status: 'Under construction' },
      { name: 'Port Expansion', lead: 'Darwin Port', focus: 'Trade capacity growth', status: 'Planning' }
    ],
    investmentLeads: [
      { name: 'Invest NT', role: 'FDI lead agency', focus: 'Energy + defense + agribusiness' },
      { name: 'Darwin Major Business District', role: 'CBD development', focus: 'Commercial precinct' }
    ],
    keySectors: ['LNG & Energy', 'Defense', 'Agribusiness', 'Tourism', 'Maritime services'],
    foreignCompanies: ['Inpex (Japan)', 'Santos', 'Shell', 'ConocoPhillips', 'Landbridge (port operator)'],
    recentInvestments: ['Ichthys LNG (AUD50B completed)', 'Darwin Ship Lift (AUD400M)', 'Sun Cable (proposed AUD30B)'],
    departments: ['Invest NT', 'Major Projects', 'Trade & Tourism', 'Defence Industry'],
    easeOfDoingBusiness: 'Streamlined approvals, NT Government support programs',
    globalMarketAccess: 'Direct shipping to Asia, gateway port for Northern Australia exports',
    latitude: -12.4634,
    longitude: 130.8456,
    infrastructureScore: 78,
    regulatoryFriction: 28,
    politicalStability: 85,
    laborPool: 68,
    costOfDoing: 72,
    investmentMomentum: 70,
    engagementScore: 72,
    overlookedScore: 58,
    rankings: ['Gateway city to Asia-Pacific', 'Major LNG export hub', 'Strategic defense location'],
    keyStatistics: ['Population: 148,801 (2023)', 'LNG exports: AUD8B annually', 'US Marines rotation: 2,500', 'Tourism: 1.2M visitors'],
    governmentLinks: [
      { label: 'Invest Northern Territory', url: 'https://invest.nt.gov.au/' },
      { label: 'City of Darwin', url: 'https://www.darwin.nt.gov.au/' },
      { label: 'NT Government', url: 'https://nt.gov.au/' },
      { label: 'Darwin Port', url: 'https://www.darwinport.com.au/' }
    ],
    economics: {
      gdpLocal: 'AUD 12.8 Billion (Greater Darwin, 2023)',
      gdpGrowthRate: '2.8% annually',
      majorIndustries: ['LNG/Energy', 'Defense', 'Government', 'Tourism', 'Construction'],
      employmentRate: '94.2%',
      avgIncome: 'AUD 85,000/year (median, highest in Australia)',
      exportVolume: 'AUD 15B annually (NT total)',
      topExports: ['LNG', 'Live cattle', 'Minerals', 'Seafood'],
      tradePartners: ['Japan', 'China', 'Indonesia', 'Vietnam', 'Singapore']
    },
    demographics: {
      population: '148,801 (2023)',
      populationGrowth: '0.8% annually',
      medianAge: '33 years',
      literacyRate: '99%',
      urbanization: '88%',
      languages: ['English', 'Indigenous languages', 'Greek', 'Filipino'],
      workingAgePopulation: '102,000',
      universitiesColleges: 1,
      graduatesPerYear: '3,500'
    },
    infrastructure: {
      airports: [{ name: 'Darwin International Airport', type: 'International', routes: 'Singapore, Bali, Dili, domestic cities' }],
      seaports: [{ name: 'Port of Darwin', type: 'International', capacity: '4M tonnes/year + LNG' }],
      highways: ['Stuart Highway', 'Arnhem Highway'],
      railways: ['Adelaide-Darwin Railway (Ghan)'],
      powerCapacity: '550 MW + LNG generation',
      internetPenetration: '82%',
      specialEconomicZones: ['Darwin Free Trade Zone (proposed)'],
      industrialParks: ['East Arm Industrial Precinct', 'Berrimah Business Park']
    },
    realTimeIndicators: {
      lastUpdated: '2024-01-21',
      dataSource: 'ABS, NT Government',
      liveFeeds: [
        { name: 'ABS Regional Data', status: 'connected', url: 'https://www.abs.gov.au/' },
        { name: 'NT Economy Updates', status: 'connected' },
        { name: 'Port of Darwin', status: 'connected' }
      ],
      newsAlerts: [
        { headline: 'Ship Lift construction milestone reached', date: '2024-01-19', source: 'NT News' },
        { headline: 'Sun Cable seeking new investors', date: '2024-01-10', source: 'AFR' }
      ],
      upcomingEvents: [
        { name: 'NT Resources Week', date: '2024-05-15', type: 'Industry' },
        { name: 'Darwin Festival', date: '2024-08-08', type: 'Cultural' }
      ]
    },
    taxIncentives: ['Northern Australia Infrastructure Fund', 'Major Project Status fast-tracking', 'Payroll tax rebates'],
    laborLaws: ['National minimum wage: AUD23.23/hour', 'Standard 38-hour week', 'Superannuation: 11.5%'],
    leaders: [
      {
        id: 'mayor',
        name: 'Kon Vatskalis',
        role: 'Lord Mayor',
        tenure: '2021-2025',
        achievements: ['Darwin City Deal implementation', 'CBD revitalization', 'Business attraction campaigns'],
        rating: 8.0,
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        internationalEngagementFocus: true,
        officeAddress: 'Darwin Civic Centre, Harry Chan Avenue',
        contactEmail: 'council@darwin.nt.gov.au'
      },
      {
        id: 'cm',
        name: 'Hon. Eva Lawler',
        role: 'Chief Minister of Northern Territory',
        tenure: '2023-present',
        achievements: ['Economic diversification agenda', 'Defense industry focus', 'Renewable energy push'],
        rating: 7.6,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop'
      }
    ]
  }
];

