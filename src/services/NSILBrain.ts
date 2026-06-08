// src/services/NSILBrain.ts
// NSIL Neuro-Synaptic Intelligence Layer — Client-side brain service

export class NSILBrain {
  private apiBase: string;
  private sessionId: string;
  private contextBuffer: string[] = [];
  private isThinking: boolean = false;
  private pendingThoughts: string[] = [];
  private onThoughtCallback?: (thought: string) => void;
  private proactiveScanInterval: ReturnType<typeof setInterval> | null = null;

  constructor(apiBase: string = '/api') {
    this.apiBase = apiBase.replace(/\/$/, '');
    this.sessionId = `nsil_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.startProactiveScanning();
  }

  // ============ CORE INTELLIGENCE OPERATIONS ============

  async chat(message: string, mode: string = 'standard'): Promise<any> {
    const response = await fetch(`${this.apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: this.contextBuffer.join('\n'),
        mode,
        sessionId: this.sessionId,
      }),
    });
    
    const data = await response.json();
    
    // Add to context
    this.contextBuffer.push(`User: ${message}`);
    this.contextBuffer.push(`NSIL: ${data.response}`);
    
    // Clear pending thoughts since we've responded
    this.pendingThoughts = [];
    
    return data;
  }

  async search(query: string): Promise<any> {
    const response = await fetch(`${this.apiBase}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return response.json();
  }

  async getIntelligence(): Promise<any> {
    const response = await fetch(`${this.apiBase}/intelligence`);
    return response.json();
  }

  async getThreats(): Promise<any> {
    const response = await fetch(`${this.apiBase}/threats`);
    return response.json();
  }

  async analyze(data: any, type: string = 'comprehensive', context?: string): Promise<any> {
    const response = await fetch(`${this.apiBase}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, type, context }),
    });
    return response.json();
  }

  async scan(target: string, scanType: string = 'comprehensive'): Promise<any> {
    const response = await fetch(`${this.apiBase}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, scan_type: scanType }),
    });
    return response.json();
  }

  // ============ SELF-THINKING PROACTIVE ANALYSIS ============

  async onInput(userInput: string): Promise<void> {
    if (!userInput || userInput.length < 10) return;

    this.isThinking = true;

    try {
      // Anticipate what the user might need based on partial input
      const thought = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on this partial input: "${userInput}", what intelligence or analysis might the user be looking for? Anticipate their need in one sentence.`,
          context: this.contextBuffer.join('\n'),
          sessionId: this.sessionId,
        }),
      }).then(r => r.json()).then(d => d.response);

      this.pendingThoughts.push(thought);
      if (this.onThoughtCallback) {
        this.onThoughtCallback(thought);
      }
    } catch (e) {
      // Silent fail for proactive analysis
    } finally {
      this.isThinking = false;
    }
  }

  // ============ PROACTIVE SCANNING ============

  private startProactiveScanning() {
    // Scan for threats and intelligence every 5 minutes
    this.proactiveScanInterval = setInterval(async () => {
      try {
        const threats = await this.getThreats();
        const intelligence = await this.getIntelligence();
        
        if (threats || intelligence) {
          this.contextBuffer.push(`[PROACTIVE SCAN] Threats: ${threats?.threats?.slice(0, 100) || 'none'}`);
          this.contextBuffer.push(`[PROACTIVE SCAN] Intelligence: ${intelligence?.briefing?.slice(0, 100) || 'none'}`);
        }
      } catch (e) {
        // Silent fail
      }
    }, 300000); // 5 minutes
  }

  // ============ EVENT HANDLERS ============

  onThought(callback: (thought: string) => void) {
    this.onThoughtCallback = callback;
  }

  getPendingThoughts(): string[] {
    return this.pendingThoughts;
  }

  getContext(): string[] {
    return this.contextBuffer;
  }

  getStatus() {
    return {
      sessionId: this.sessionId,
      contextSize: this.contextBuffer.length,
      isThinking: this.isThinking,
      pendingThoughts: this.pendingThoughts.length,
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
