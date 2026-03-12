/**
 * 
 * CLIENT-SIDE OPENAI SERVICE
 * 
 *
 * Direct OpenAI API calls from browser - no backend required
 * Used for BW Intel Fact Sheet when backend is unavailable
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';

export interface OpenAIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface LocationIntelligence {
  overview: {
    displayName: string;
    significance: string;
    established: string;
  };
  demographics: {
    population: string;
    populationGrowth: string;
    medianAge: string;
    literacyRate: string;
    languages: string[];
  };
  economy: {
    gdp: string;
    gdpGrowth: string;
    unemployment: string;
    averageIncome: string;
    mainIndustries: string[];
    tradePartners: string[];
    currency: string;
  };
  government: {
    leader: {
      name: string;
      title: string;
      since: string;
    };
    departments: string[];
    type: string;
  };
  geography: {
    climate: string;
    area: string;
    timezone: string;
  };
  infrastructure: {
    powerCapacity: string;
    internetPenetration: string;
    airports: string[];
    seaports: string[];
  };
  competitiveAdvantages: string[];
  investment: {
    incentives: string[];
    easeOfBusiness: string;
  };
}

/**
 * Call OpenAI API directly from browser
 */
export async function callOpenAI(prompt: string, model = 'gpt-4-turbo-preview'): Promise<OpenAIResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage,
    model: data.model,
  };
}

/**
 * Generate comprehensive location intelligence using OpenAI
 */
export async function generateLocationIntelligence(location: string): Promise<LocationIntelligence> {
  const prompt = `You are a world-class intelligence analyst. Provide comprehensive, factual intelligence about: "${location}"

Return a detailed JSON response with REAL, CURRENT data (not placeholders). The JSON should include:

{
  "overview": {
    "displayName": "Official name",
    "significance": "Strategic importance and key facts",
    "established": "Foundation date or historical context"
  },
  "demographics": {
    "population": "Current population with latest available data",
    "populationGrowth": "Annual growth rate percentage",
    "medianAge": "Median age in years",
    "literacyRate": "Literacy rate percentage",
    "languages": ["Primary languages spoken"]
  },
  "economy": {
    "gdp": "GDP with latest figure and currency",
    "gdpGrowth": "Latest GDP growth rate",
    "unemployment": "Current unemployment rate",
    "averageIncome": "Average income per capita",
    "mainIndustries": ["Top industries"],
    "tradePartners": ["Major trading partners"],
    "currency": "Official currency"
  },
  "government": {
    "leader": {
      "name": "Current head of government/state",
      "title": "Official title",
      "since": "When they took office"
    },
    "departments": ["Key government ministries/departments"],
    "type": "Government system (democracy, monarchy, etc.)"
  },
  "geography": {
    "climate": "Climate description",
    "area": "Total area with unit",
    "timezone": "Timezone(s)"
  },
  "infrastructure": {
    "powerCapacity": "Electricity capacity if available",
    "internetPenetration": "Internet access percentage",
    "airports": ["Major airports"],
    "seaports": ["Major seaports"]
  },
  "competitiveAdvantages": ["Key competitive advantages for business/investment"],
  "investment": {
    "incentives": ["Investment incentives offered"],
    "easeOfBusiness": "Ease of doing business ranking or description"
  }
}

IMPORTANT: Use only factual, verifiable information. No placeholders like "N/A" or "Data not available". If information is uncertain, provide best available data with context. Return ONLY valid JSON.`;

  try {
    const response = await callOpenAI(prompt);

    // Extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    const intelligence = JSON.parse(jsonMatch[0]) as LocationIntelligence;

    // Validate required fields and provide fallbacks if needed
    return {
      overview: intelligence.overview || {
        displayName: location,
        significance: `Intelligence report for ${location}`,
        established: 'Historical records available'
      },
      demographics: intelligence.demographics || {
        population: 'Population data available',
        populationGrowth: 'Growth data tracked',
        medianAge: 'Demographic data available',
        literacyRate: 'Education metrics tracked',
        languages: ['Local languages spoken']
      },
      economy: intelligence.economy || {
        gdp: 'Economic data available',
        gdpGrowth: 'Growth metrics tracked',
        unemployment: 'Labor data available',
        averageIncome: 'Income data tracked',
        mainIndustries: ['Key industries active'],
        tradePartners: ['Trading partners engaged'],
        currency: 'Local currency'
      },
      government: intelligence.government || {
        leader: {
          name: 'Leadership information available',
          title: 'Government position',
          since: 'Current administration'
        },
        departments: ['Government ministries active'],
        type: 'Government system in place'
      },
      geography: intelligence.geography || {
        climate: 'Local climate conditions',
        area: 'Geographic area defined',
        timezone: 'Local timezone'
      },
      infrastructure: intelligence.infrastructure || {
        powerCapacity: 'Infrastructure developed',
        internetPenetration: 'Connectivity available',
        airports: ['Airports operational'],
        seaports: ['Ports active']
      },
      competitiveAdvantages: intelligence.competitiveAdvantages || ['Strategic advantages identified'],
      investment: intelligence.investment || {
        incentives: ['Investment opportunities available'],
        easeOfBusiness: 'Business environment established'
      }
    };

  } catch (error) {
    console.error('OpenAI location intelligence failed:', error);
    throw error;
  }
}

/**
 * Generate document/letter from intelligence data
 */
export async function generateDocument(
  intelligence: LocationIntelligence,
  documentType: 'letter' | 'report' | 'briefing',
  recipient?: string,
  purpose?: string
): Promise<string> {

  const context = `
Intelligence Data: ${JSON.stringify(intelligence, null, 2)}
Document Type: ${documentType}
Recipient: ${recipient || 'General audience'}
Purpose: ${purpose || 'Information sharing'}
  `;

  const prompt = `You are a professional intelligence analyst. Using the provided intelligence data, create a ${documentType} about ${intelligence.overview.displayName}.

Context:
${context}

${documentType === 'letter' ? `Write a formal business letter to ${recipient || 'the recipient'} introducing investment/business opportunities in ${intelligence.overview.displayName}.` : ''}

${documentType === 'report' ? `Create a comprehensive intelligence report analyzing ${intelligence.overview.displayName} for business and investment purposes.` : ''}

${documentType === 'briefing' ? `Prepare a executive briefing document summarizing key intelligence about ${intelligence.overview.displayName}.` : ''}

Use the intelligence data provided. Make it professional, factual, and actionable. Include relevant data points from demographics, economy, government, and infrastructure.

Format appropriately for the document type with proper headings, sections, and professional language.`;

  try {
    const response = await callOpenAI(prompt);
    return response.content;
  } catch (error) {
    console.error('Document generation failed:', error);
    throw error;
  }
}

export default {
  callOpenAI,
  generateLocationIntelligence,
  generateDocument,
};
