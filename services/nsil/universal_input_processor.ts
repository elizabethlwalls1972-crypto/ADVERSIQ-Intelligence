/**
 * UniversalInputProcessor - Accept any input (documents, questions, problems) globally
 * Handles: Multiple languages, document types, problem classifications, intent extraction
 * Output: Structured context for NSIL to operate on
 */

import fs from 'fs';
import path from 'path';

export interface UniversalInput {
  id: string;
  timestamp: string;
  source_type: 'document' | 'question' | 'problem' | 'data_file' | 'image' | 'audio' | 'spreadsheet';
  content: string; // Full extracted text
  raw_input?: any; // Original input if different from content
  
  metadata: {
    origin_country: string;
    origin_language: string;
    detected_language?: string;
    domain: string; // economics, infrastructure, health, education, agriculture, energy, etc
    problem_type: 'how_to' | 'why' | 'what_if' | 'fix_this' | 'improve_this' | 'diagnose' | 'forecast' | 'comparison';
    urgency: 'immediate' | 'weeks' | 'months' | 'strategic';
    person_context: 'policymaker' | 'entrepreneur' | 'researcher' | 'student' | 'ngo' | 'consultant' | 'investor' | 'unknown';
  };
  
  extracted_intent: {
    core_question: string;
    structured_query: string; // Machine-readable version
    constraints: string[];
    assets_they_have: string[];
    assets_they_need: string[];
    success_metric: string;
    timeline: string;
    budget_constraint?: string;
  };
  
  entities_identified: {
    locations: string[]; // Cities, regions, countries
    organizations: string[];
    people: string[];
    sectors: string[];
    technologies: string[];
    policies: string[];
  };
  
  context_signals: {
    has_historical_context: boolean;
    has_data_attached: boolean;
    references_specific_failures: boolean;
    asks_for_novelty: boolean;
    urgency_signals: string[]; // e.g., "deadline next quarter", "competitor pressure"
  };
}

export class UniversalInputProcessor {
  private data_dir: string;
  private processed_inputs: UniversalInput[] = [];
  
  constructor() {
    this.data_dir = path.join(process.cwd(), 'data', 'universal_inputs');
    this.ensure_data_dir();
  }
  
  private ensure_data_dir(): void {
    if (!fs.existsSync(this.data_dir)) {
      fs.mkdirSync(this.data_dir, { recursive: true });
    }
  }
  
  /**
   * Process any input: document, question, problem statement
   */
  public process_input(
    raw_input: string | any,
    origin_country: string,
    origin_language: string = 'en',
    person_context: any = {}
  ): UniversalInput {
    const input_id = `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract text from various formats
    const extracted_text = this.extract_text(raw_input);
    
    // Detect language if not provided
    const detected_language = this.detect_language(extracted_text);
    
    // Translate to English if needed (for processing)
    const english_text = detected_language === 'en' 
      ? extracted_text 
      : this.translate_to_english(extracted_text, detected_language);
    
    // Classify source type
    const source_type = this.classify_source_type(extracted_text);
    
    // Extract intent
    const extracted_intent = this.extract_intent(english_text);
    
    // Classify domain
    const domain = this.classify_domain(english_text, extracted_intent);
    
    // Classify problem type
    const problem_type = this.classify_problem_type(english_text, extracted_intent);
    
    // Detect urgency
    const urgency = this.detect_urgency(english_text);
    
    // Identify entities
    const entities_identified = this.identify_entities(english_text);
    
    // Detect context signals
    const context_signals = this.detect_context_signals(english_text, english_text);
    
    // Create structured input
    const processed_input: UniversalInput = {
      id: input_id,
      timestamp: new Date().toISOString(),
      source_type,
      content: english_text, // All processing happens on English version
      raw_input: extracted_text,
      
      metadata: {
        origin_country,
        origin_language,
        detected_language,
        domain,
        problem_type,
        urgency,
        person_context: person_context.role || 'unknown',
      },
      
      extracted_intent,
      entities_identified,
      context_signals,
    };
    
    // Store processed input
    this.store_processed_input(processed_input);
    this.processed_inputs.push(processed_input);
    
    return processed_input;
  }
  
  /**
   * Extract text from various formats
   */
  private extract_text(raw_input: any): string {
    if (typeof raw_input === 'string') {
      return raw_input;
    }
    
    if (typeof raw_input === 'object') {
      // Handle document objects
      if (raw_input.text) return raw_input.text;
      if (raw_input.content) return raw_input.content;
      if (raw_input.body) return raw_input.body;
      if (raw_input.question) return raw_input.question;
      
      // Fallback: JSON stringify
      return JSON.stringify(raw_input);
    }
    
    return String(raw_input);
  }
  
  /**
   * Detect language of input text
   * Simplified - in production, use language detection library
   */
  private detect_language(text: string): string {
    const lang_indicators: { [key: string]: string[] } = {
      'es': ['el ', 'la ', 'de ', 'que ', 'en ', 'es '],
      'pt': ['o ', 'a ', 'de ', 'que ', 'em ', 'para '],
      'zh': ['的', '一', '是', '在', '了', '人'],
      'hi': ['है', 'के', 'में', 'का', 'को', 'से'],
      'ar': ['في', 'من', 'هو', 'هي', 'إلى', 'عن'],
      'fr': ['le ', 'de ', 'un ', 'une ', 'et ', 'à '],
    };
    
    const text_lower = text.toLowerCase().substring(0, 500);
    let best_lang = 'en';
    let best_score = 0;
    
    for (const [lang, indicators] of Object.entries(lang_indicators)) {
      let score = 0;
      for (const indicator of indicators) {
        const matches = text_lower.split(indicator).length - 1;
        score += matches;
      }
      if (score > best_score) {
        best_score = score;
        best_lang = lang;
      }
    }
    
    return best_lang;
  }
  
  /**
   * Normalize non-English input for downstream extraction.
   */
  private translate_to_english(text: string, from_language: string): string {
    // Preserve source meaning; downstream AI providers can translate during analysis.
    console.log(`[Translation needed: ${from_language} → en]`);
    return text;
  }
  
  /**
   * Classify the source type of input
   */
  private classify_source_type(text: string): UniversalInput['source_type'] {
    const text_lower = text.toLowerCase();
    const word_count = text.split(/\s+/).length;
    
    // Heuristics
    if (text_lower.includes('xlsx') || text_lower.includes('csv') || text_lower.includes('sheet') || text.includes(',')) {
      return 'spreadsheet';
    }
    if (word_count > 500) {
      return 'document';
    }
    if (text_lower.includes('?') || text_lower.includes('how ') || text_lower.includes('what ') || text_lower.includes('why ')) {
      return 'question';
    }
    if (text_lower.includes('problem') || text_lower.includes('issue') || text_lower.includes('challenge')) {
      return 'problem';
    }
    if (text_lower.includes('image') || text_lower.includes('diagram') || text_lower.includes('chart')) {
      return 'image';
    }
    if (text_lower.includes('audio') || text_lower.includes('transcript')) {
      return 'audio';
    }
    
    return 'data_file';
  }
  
  /**
   * Extract structured intent from natural language
   */
  private extract_intent(text: string): UniversalInput['extracted_intent'] {
    const text_lower = text.toLowerCase();
    
    // Extract core question (first sentence typically)
    const sentences = text.split(/[.!?]\s+/);
    const core_question = sentences[0].trim();
    
    // Identify constraints (words like "must", "cannot", "limited", "constrained")
    const constraints: string[] = [];
    const constraint_patterns = [
      /must not (\w+(?:\s+\w+)*)/gi,
      /cannot (\w+(?:\s+\w+)*)/gi,
      /limited to (\w+(?:\s+\w+)*)/gi,
      /only (\w+(?:\s+\w+)*)/gi,
    ];
    
    for (const pattern of constraint_patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        constraints.push(match[1]);
      }
    }
    
    // Identify assets they have
    const assets_they_have: string[] = [];
    const asset_patterns = [
      /we have (\w+(?:\s+\w+)*)/gi,
      /our (\w+(?:\s+\w+)*)/gi,
      /existing (\w+(?:\s+\w+)*)/gi,
      /currently (\w+(?:\s+\w+)*)/gi,
    ];
    
    for (const pattern of asset_patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        assets_they_have.push(match[1]);
      }
    }
    
    // Identify assets they need
    const assets_they_need: string[] = [];
    const need_patterns = [
      /need (\w+(?:\s+\w+)*)/gi,
      /require (\w+(?:\s+\w+)*)/gi,
      /looking for (\w+(?:\s+\w+)*)/gi,
      /want to (\w+(?:\s+\w+)*)/gi,
    ];
    
    for (const pattern of need_patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        assets_they_need.push(match[1]);
      }
    }
    
    // Identify success metric
    let success_metric = 'Unspecified';
    const metric_patterns = [
      /goal.*?(\w+(?:\s+\w+)*)/gi,
      /target.*?(\d+%?|\d+x)/gi,
      /aim.*?(\w+(?:\s+\w+)*)/gi,
      /outcome.*?(\w+(?:\s+\w+)*)/gi,
    ];
    
    for (const pattern of metric_patterns) {
      const match = pattern.exec(text);
      if (match) {
        success_metric = match[1];
        break;
      }
    }
    
    // Extract timeline
    let timeline = 'Unspecified';
    const timeline_patterns = [
      /within (\d+\s+(?:days|weeks|months|years))/gi,
      /by (\w+\s+\d+)/gi,
      /deadline.*?(\d+\s+(?:days|weeks|months|years))/gi,
    ];
    
    for (const pattern of timeline_patterns) {
      const match = pattern.exec(text);
      if (match) {
        timeline = match[1];
        break;
      }
    }
    
    return {
      core_question,
      structured_query: core_question, // In production: parse to structured form
      constraints,
      assets_they_have,
      assets_they_need,
      success_metric,
      timeline,
    };
  }
  
  /**
   * Classify the domain of the problem
   */
  private classify_domain(text: string, intent: any): string {
    const text_lower = text.toLowerCase();
    
    const domain_keywords: { [key: string]: string[] } = {
      'economics': ['gdp', 'growth', 'investment', 'trade', 'export', 'import', 'currency', 'inflation'],
      'infrastructure': ['port', 'road', 'rail', 'electricity', 'water', 'telecommunications', 'airport'],
      'health': ['health', 'medical', 'disease', 'hospital', 'clinical', 'pharmaceutical'],
      'education': ['school', 'university', 'education', 'student', 'learning', 'skill'],
      'agriculture': ['farm', 'crop', 'agriculture', 'rural', 'farmer', 'soil'],
      'energy': ['power', 'energy', 'electricity', 'renewable', 'coal', 'oil', 'gas'],
      'manufacturing': ['factory', 'production', 'manufacturing', 'industrial', 'supply chain'],
      'technology': ['tech', 'digital', 'software', 'ai', 'data', 'innovation'],
      'finance': ['banking', 'finance', 'investment', 'loan', 'credit', 'capital'],
      'real_estate': ['property', 'real estate', 'housing', 'development', 'urban'],
    };
    
    let best_domain = 'general';
    let best_score = 0;
    
    for (const [domain, keywords] of Object.entries(domain_keywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text_lower.includes(keyword)) {
          score++;
        }
      }
      if (score > best_score) {
        best_score = score;
        best_domain = domain;
      }
    }
    
    return best_domain;
  }
  
  /**
   * Classify the problem type
   */
  private classify_problem_type(text: string, intent: any): UniversalInput['metadata']['problem_type'] {
    const text_lower = text.toLowerCase();
    
    if (text_lower.includes('how') || text_lower.includes('implement') || text_lower.includes('what steps')) {
      return 'how_to';
    }
    if (text_lower.includes('why') || text_lower.includes('reason') || text_lower.includes('cause')) {
      return 'why';
    }
    if (text_lower.includes('if') || text_lower.includes('assume') || text_lower.includes('scenario')) {
      return 'what_if';
    }
    if (text_lower.includes('fix') || text_lower.includes('solve') || text_lower.includes('problem')) {
      return 'fix_this';
    }
    if (text_lower.includes('improve') || text_lower.includes('better') || text_lower.includes('enhance')) {
      return 'improve_this';
    }
    if (text_lower.includes('diagnose') || text_lower.includes('what\'s wrong') || text_lower.includes('issue')) {
      return 'diagnose';
    }
    if (text_lower.includes('forecast') || text_lower.includes('predict') || text_lower.includes('future')) {
      return 'forecast';
    }
    if (text_lower.includes('compare') || text_lower.includes('versus') || text_lower.includes('vs')) {
      return 'comparison';
    }
    
    return 'fix_this';
  }
  
  /**
   * Detect urgency level
   */
  private detect_urgency(text: string): UniversalInput['metadata']['urgency'] {
    const text_lower = text.toLowerCase();
    
    if (text_lower.includes('urgent') || text_lower.includes('immediate') || text_lower.includes('asap') || 
        text_lower.includes('emergency') || text_lower.includes('crisis')) {
      return 'immediate';
    }
    if (text_lower.includes('week') || text_lower.includes('soon') || text_lower.includes('quick')) {
      return 'weeks';
    }
    if (text_lower.includes('month') || text_lower.includes('quarter') || text_lower.includes('next ')) {
      return 'months';
    }
    
    return 'strategic';
  }
  
  /**
   * Identify named entities in text
   */
  private identify_entities(text: string): UniversalInput['entities_identified'] {
    // In production: use NLP library (spaCy, OpenAI API, etc.)
    // For now: simple keyword matching
    
    const countries = ['philippines', 'brazil', 'india', 'australia', 'china', 'usa', 'germany', 'japan',
                      'mexico', 'indonesia', 'vietnam', 'thailand', 'argentina', 'south korea', 'canada'];
    const cities = ['manila', 'sao paulo', 'delhi', 'sydney', 'beijing', 'new york', 'london', 'tokyo',
                   'mexico city', 'jakarta', 'ho chi minh', 'bangkok', 'buenos aires', 'seoul', 'toronto'];
    
    const entities: UniversalInput['entities_identified'] = {
      locations: [],
      organizations: [],
      people: [],
      sectors: [],
      technologies: [],
      policies: [],
    };
    
    const text_lower = text.toLowerCase();
    
    // Extract locations
    for (const country of countries) {
      if (text_lower.includes(country)) {
        entities.locations.push(country);
      }
    }
    for (const city of cities) {
      if (text_lower.includes(city)) {
        entities.locations.push(city);
      }
    }
    
    // Extract sectors
    const sectors = ['manufacturing', 'agriculture', 'tech', 'finance', 'energy', 'health', 'education'];
    for (const sector of sectors) {
      if (text_lower.includes(sector)) {
        entities.sectors.push(sector);
      }
    }
    
    return entities;
  }
  
  /**
   * Detect context signals
   */
  private detect_context_signals(text: string, original_text: string): UniversalInput['context_signals'] {
    const text_lower = text.toLowerCase();
    
    return {
      has_historical_context: text_lower.includes('history') || text_lower.includes('past') || text_lower.includes('before'),
      has_data_attached: original_text.includes('.csv') || original_text.includes('.xlsx') || original_text.includes('data'),
      references_specific_failures: text_lower.includes('failed') || text_lower.includes('didn\'t work') || text_lower.includes('problem'),
      asks_for_novelty: text_lower.includes('new') || text_lower.includes('innovative') || text_lower.includes('approach'),
      urgency_signals: this.extract_urgency_signals(text),
    };
  }
  
  /**
   * Extract specific urgency signals
   */
  private extract_urgency_signals(text: string): string[] {
    const signals: string[] = [];
    
    const signal_patterns = [
      /deadline[:\s]+(\w+(?:\s+\w+)*)/gi,
      /due[:\s]+(\w+(?:\s+\w+)*)/gi,
      /competitor[:\s]+(\w+(?:\s+\w+)*)/gi,
      /pressure[:\s]+(\w+(?:\s+\w+)*)/gi,
      /critical[:\s]+(\w+(?:\s+\w+)*)/gi,
    ];
    
    for (const pattern of signal_patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        signals.push(match[0]);
      }
    }
    
    return signals;
  }
  
  /**
   * Store processed input to disk for audit trail
   */
  private store_processed_input(input: UniversalInput): void {
    const filename = path.join(this.data_dir, `${input.id}.json`);
    fs.writeFileSync(filename, JSON.stringify(input, null, 2));
  }
  
  /**
   * Get all processed inputs
   */
  public get_all_processed_inputs(): UniversalInput[] {
    return this.processed_inputs;
  }
  
  /**
   * Get processed input by ID
   */
  public get_processed_input(input_id: string): UniversalInput | null {
    return this.processed_inputs.find(i => i.id === input_id) || null;
  }
  
  /**
   * Get inputs by domain
   */
  public get_inputs_by_domain(domain: string): UniversalInput[] {
    return this.processed_inputs.filter(i => i.metadata.domain === domain);
  }
  
  /**
   * Get inputs by country
   */
  public get_inputs_by_country(country: string): UniversalInput[] {
    return this.processed_inputs.filter(i => i.metadata.origin_country === country);
  }
}

export default UniversalInputProcessor;
