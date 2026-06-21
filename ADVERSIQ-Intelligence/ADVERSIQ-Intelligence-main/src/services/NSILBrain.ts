// src/services/NSILBrain.ts
// NSIL — Neuro-Synaptic Intelligence Layer — Client-side orchestration engine
// All decisions run through ADVERSIQ Decision Verification System

export class NSILBrain {
  private apiBase: string;
  readonly sessionId: string;
  private contextBuffer: string[] = [];
  private isThinking: boolean = false;
  private pendingThoughts: string[] = [];
  private proactiveInsights: string[] = [];
  private onThoughtCallback?: (thought: string) => void;
  private onInsightCallback?: (insight: string) => void;
  private onStatusCallback?: (status: { isThinking: boolean; agents: string[] }) => void;
  private proactiveScanInterval: ReturnType<typeof setInterval> | null = null;
  private activeAgents: Set<string> = new Set();

  constructor(apiBase: string = '/api') {
    this.apiBase = apiBase.replace(/\/$/, '');
    this.sessionId = `nsil_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.startProactiveScanning();
    this.initializeAgents();
  }

  private initializeAgents() {
    const agents = ['ATLAS', 'CIPHER', 'SENTINEL', 'ORACLE', 'NEXUS', 'AEGIS', 'PHANTOM', 'REDTEAM', 'SUSAN'];
    agents.forEach(a => this.activeAgents.add(a));
  }

  // ============ CORE INTELLIGENCE OPERATIONS ============

  async chat(message: string, mode: string = 'standard', agent: string = 'SUSAN'): Promise<any> {
    this.isThinking = true;
    this.emitThought(`💭 ${agent} analyzing: "${message.slice(0, 50)}..."`);
    
    try {
      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: this.contextBuffer.slice(-10).join('\n'),
          mode,
          agent,
          sessionId: this.sessionId,
        }),
      });
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      
      // Add to context buffer (max 50 entries)
      this.contextBuffer.push(`${agent}: ${message}`);
      this.contextBuffer.push(`Response: ${data.response}`);
      if (this.contextBuffer.length > 50) {
        this.contextBuffer = this.contextBuffer.slice(-50);
      }
      
      return data;
    } catch (err) {
      console.error('Chat error:', err);
      throw err;
    } finally {
      this.isThinking = false;
    }
  }
  // ============ INTELLIGENCE METHODS ============

  async search(query: string): Promise<any> {
    this.emitThought(`🔍 Searching: "${query}"`);
    const response = await fetch(`${this.apiBase}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, depth: 'deep' }),
    });
    return response.json();
  }

  async getIntelligence(): Promise<any> {
    this.emitThought('📊 Generating intelligence briefing...');
    const response = await fetch(`${this.apiBase}/intelligence`);
    return response.json();
  }

  async getThreats(): Promise<any> {
    this.emitThought('⚠️ Assessing threats...');
    const response = await fetch(`${this.apiBase}/threats`);
    return response.json();
  }

  async getNews(): Promise<any> {
    this.emitThought('📰 Fetching intelligence news...');
    const response = await fetch(`${this.apiBase}/news`);
    return response.json();
  }

  // ============ ANALYSIS METHODS ============

  async analyze(data: any, type: string = 'comprehensive', context?: string): Promise<any> {
    this.emitThought(`🔬 Analyzing data (${type})...`);
    const response = await fetch(`${this.apiBase}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, type, context }),
    });
    return response.json();
  }

  async scan(target: string, scanType: string = 'comprehensive'): Promise<any> {
    this.emitThought(`🔍 Multi-agent scan on "${target}"...`);
    const response = await fetch(`${this.apiBase}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, scan_type: scanType }),
    });
    return response.json();
  }

  async debate(topic: string, rounds: number = 2): Promise<any> {
    this.emitThought(`⚔️ Starting debate: "${topic}" (${rounds} rounds)...`);
    const response = await fetch(`${this.apiBase}/debate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, rounds: Math.min(rounds, 4) }),
    });
    return response.json();
  }

  async consensus(topic: string, agents?: string[]): Promise<any> {
    this.emitThought(`🤝 Building consensus on "${topic}"...`);
    const response = await fetch(`${this.apiBase}/consensus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        agents: agents || ['ATLAS', 'SENTINEL', 'ORACLE', 'AEGIS'],
      }),
    });
    return response.json();
  }

  // ============ OSINT & INTELLIGENCE ============

  async osint(target: string, type: string = 'general'): Promise<any> {
    this.emitThought(`🕵️ OSINT on "${target}"...`);
    const response = await fetch(`${this.apiBase}/osint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type }),
    });
    return response.json();
  }

  async scrape(url: string): Promise<any> {
    this.emitThought(`🌐 Scraping "${url}"...`);
    const response = await fetch(`${this.apiBase}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return response.json();
  }

  // ============ ADVANCED OPERATIONS ============

  async morphic(query: string, field: string = 'global'): Promise<any> {
    this.emitThought(`🌀 Morphic analysis on "${query}"...`);
    const response = await fetch(`${this.apiBase}/morphic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, field }),
    });
    return response.json();
  }

  async adaptive(input: string, learningType: string = 'general'): Promise<any> {
    this.emitThought(`📈 Adaptive learning (${learningType})...`);
    const response = await fetch(`${this.apiBase}/adaptive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, learning_type: learningType }),
    });
    return response.json();
  }

  async ethicalGate(action: string, context?: string): Promise<any> {
    this.emitThought(`⚖️ Ethical evaluation...`);
    const response = await fetch(`${this.apiBase}/ethical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, context }),
    });
    return response.json();
  }

  // ============ MEMORY OPERATIONS ============

  async getMemory(): Promise<any> {
    const response = await fetch(`${this.apiBase}/memory`);
    return response.json();
  }

  async saveMemory(key: string, data: any): Promise<any> {
    const response = await fetch(`${this.apiBase}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    });
    return response.json();
  }

  // ============ MATCHMAKING (SUSAN EXCLUSIVE) ============

  async matchmake(person1: any, person2: any, context?: string): Promise<any> {
    this.emitThought(`💑 Evaluating compatibility between ${person1?.name} and ${person2?.name}...`);
    const response = await fetch(`${this.apiBase}/matchmake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person1, person2, context }),
    });
    return response.json();
  }

  // ============ REPORT WRITING (SUSAN EXCLUSIVE) ============

  async writeReport(title: string, topic: string, length: string = 'medium', style: string = 'formal', context?: string): Promise<any> {
    this.emitThought(`📄 Generating ${length} report: "${title}"...`);
    const response = await fetch(`${this.apiBase}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, topic, length, style, context }),
    });
    return response.json();
  }

  // ============ LETTER WRITING (SUSAN EXCLUSIVE) ============

  async writeLetter(letterType: string, recipient: string, subject: string, context?: string, tone: string = 'formal'): Promise<any> {
    this.emitThought(`✉️ Writing ${letterType} letter to ${recipient}...`);
    const response = await fetch(`${this.apiBase}/letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter_type: letterType, recipient, subject, context, tone }),
    });
    return response.json();
  }

  // ============ SELF-THINKING PROACTIVE ANALYSIS ============

  async onInput(userInput: string): Promise<void> {
    if (!userInput || userInput.length < 10) return;
    this.emitThought(`💭 SUSAN anticipating based on: "${userInput.slice(0, 40)}..."`);
  }

  // ============ PROACTIVE SCANNING ============

  private startProactiveScanning() {
    // Scan for threats and intelligence every 5 minutes
    this.proactiveScanInterval = setInterval(async () => {
      try {
        this.emitThought('🔄 Background scan in progress...');
        const threats = await this.getThreats();
        const intelligence = await this.getIntelligence();
        
        if (threats?.threats) {
          this.contextBuffer.push(`[SCAN] Threats detected`);
        }
        if (intelligence?.briefing) {
          this.contextBuffer.push(`[SCAN] Intelligence updated`);
        }
      } catch (e) {
        // Silent fail
      }
    }, 300000); // 5 minutes
  }

  // ============ EVENT HANDLERS ============

  private emitThought(thought: string) {
    this.pendingThoughts.push(thought);
    if (this.onThoughtCallback) {
      this.onThoughtCallback(thought);
    }
  }

  onThought(callback: (thought: string) => void) {
    this.onThoughtCallback = callback;
  }

  onInsight(callback: (insight: string) => void) {
    this.onInsightCallback = callback;
  }

  getPendingThoughts(): string[] {
    return this.pendingThoughts;
  }

  getContext(): string[] {
    return this.contextBuffer;
  }

  getActiveAgents(): string[] {
    return Array.from(this.activeAgents);
  }

  getStatus() {
    return {
      sessionId: this.sessionId,
      contextSize: this.contextBuffer.length,
      isThinking: this.isThinking,
      pendingThoughts: this.pendingThoughts.length,
      activeAgents: this.getActiveAgents(),
      proactiveScanning: this.proactiveScanInterval !== null,
    };
  }

  destroy() {
    if (this.proactiveScanInterval) {
      clearInterval(this.proactiveScanInterval);
    }
  }
}

export default NSILBrain;
