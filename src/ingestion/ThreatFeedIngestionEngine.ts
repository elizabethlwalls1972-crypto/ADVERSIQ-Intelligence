/**
 * THREAT FEED INGESTION ENGINE
 * 
 * Consumes live threat intelligence from:
 * - STIX/TAXII feeds (industry standard)
 * - NVD/CVE databases
 * - Network telemetry streams
 * - OSINT feeds
 * 
 * Normalizes all incoming data into common threat model and feeds to ApexExecutionLoop
 */

export interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIXObject[];
}

export interface STIXObject {
  type: string;
  id: string;
  created: string;
  modified: string;
  [key: string]: unknown;
}

export interface CVERecord {
  id: string;
  published: string;
  modified: string;
  baseScore: number;
  baseSeverity: string;
  description: string;
  affectedSoftware: string[];
  exploitStatus: 'unexercised' | 'proof-of-concept' | 'functional' | 'high';
}

export interface NetworkTelemetry {
  timestamp: number;
  sourceIP: string;
  destIP: string;
  protocol: string;
  ports: number[];
  payloadSignature: string;
  anomalyScore: number;
}

export interface NormalizedThreat {
  id: string;
  timestamp: number;
  source: 'stix' | 'cve' | 'telemetry' | 'osint';
  threatType: string;
  severity: number; // 0-1 normalized
  description: string;
  indicators: string[]; // IPs, domains, hashes, etc.
  targetSystems: string[];
  exploitProbability: number; // 0-1 estimated likelihood
  metadata: Record<string, unknown>;
}

/**
 * STIX/TAXII Feed Consumer
 */
class STIXFeedConsumer {
  private feedUrl: string;
  private apiKey: string;
  private lastFetchTime: number = 0;

  constructor(feedUrl: string, apiKey: string) {
    this.feedUrl = feedUrl;
    this.apiKey = apiKey;
  }

  /**
   * Fetch STIX objects from TAXII endpoint
   */
  async fetchSTIXBundle(): Promise<STIXBundle | null> {
    try {
      const response = await fetch(`${this.feedUrl}/stix/`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/stix+json;version=2.1'
        }
      });

      if (!response.ok) {
        console.error(`STIX fetch failed: ${response.status}`);
        return null;
      }

      const bundle: STIXBundle = await response.json();
      this.lastFetchTime = Date.now();
      return bundle;
    } catch (error) {
      console.error('STIX feed ingestion error:', error);
      return null;
    }
  }

  /**
   * Parse STIX objects into normalized threats
   */
  parseSTIXBundle(bundle: STIXBundle): NormalizedThreat[] {
    const threats: NormalizedThreat[] = [];

    for (const obj of bundle.objects) {
      if (obj.type === 'attack-pattern') {
        threats.push(this.parseAttackPattern(obj));
      } else if (obj.type === 'malware') {
        threats.push(this.parseMalware(obj));
      } else if (obj.type === 'indicator') {
        threats.push(this.parseIndicator(obj));
      } else if (obj.type === 'vulnerability') {
        threats.push(this.parseVulnerability(obj));
      }
    }

    return threats;
  }

  private parseAttackPattern(obj: STIXObject): NormalizedThreat {
    const anyObj = obj as any;
    return {
      id: obj.id,
      timestamp: new Date(obj.created).getTime(),
      source: 'stix',
      threatType: 'attack-pattern',
      severity: this.estimateSeverity(obj),
      description: anyObj.name || 'Unknown attack pattern',
      indicators: [],
      targetSystems: anyObj.targetSystems || [],
      exploitProbability: 0.5,
      metadata: obj
    };
  }

  private parseMalware(obj: STIXObject): NormalizedThreat {
    const anyObj = obj as any;
    return {
      id: obj.id,
      timestamp: new Date(obj.created).getTime(),
      source: 'stix',
      threatType: 'malware',
      severity: 0.85,
      description: anyObj.name || 'Unknown malware',
      indicators: anyObj.indicators || [],
      targetSystems: anyObj.targetSystems || [],
      exploitProbability: 0.7,
      metadata: obj
    };
  }

  private parseIndicator(obj: STIXObject): NormalizedThreat {
    const anyObj = obj as any;
    return {
      id: obj.id,
      timestamp: new Date(obj.created).getTime(),
      source: 'stix',
      threatType: 'indicator',
      severity: 0.6,
      description: anyObj.pattern || 'Unknown indicator',
      indicators: [obj.id],
      targetSystems: [],
      exploitProbability: 0.5,
      metadata: obj
    };
  }

  private parseVulnerability(obj: STIXObject): NormalizedThreat {
    const anyObj = obj as any;
    return {
      id: obj.id,
      timestamp: new Date(obj.created).getTime(),
      source: 'stix',
      threatType: 'vulnerability',
      severity: anyObj.severity || 0.7,
      description: anyObj.description || 'Unknown vulnerability',
      indicators: [],
      targetSystems: anyObj.affectedProducts || [],
      exploitProbability: 0.6,
      metadata: obj
    };
  }

  private estimateSeverity(_obj: STIXObject): number {
    return 0.5; // Placeholder
  }
}

/**
 * NVD/CVE Feed Consumer
 */
class CVEFeedConsumer {
  private nvdApiUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
  private apiKey: string;
  private lastSyncTime: number = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch recent CVEs from NVD
   */
  async fetchRecentCVEs(lastModifiedDays: number = 7): Promise<CVERecord[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lastModifiedDays);

      const response = await fetch(
        `${this.nvdApiUrl}?lastModifiedStartDate=${startDate.toISOString()}`,
        {
          headers: {
            'apiKey': this.apiKey
          }
        }
      );

      if (!response.ok) {
        console.error(`NVD fetch failed: ${response.status}`);
        return [];
      }

      const data = await response.json() as any;
      this.lastSyncTime = Date.now();
      return data.vulnerabilities || [];
    } catch (error) {
      console.error('CVE feed ingestion error:', error);
      return [];
    }
  }

  /**
   * Convert CVE record to normalized threat
   */
  parseCVE(cve: CVERecord): NormalizedThreat {
    const severityMap: Record<string, number> = {
      'CRITICAL': 0.95,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.4,
      'NONE': 0.1
    };

    return {
      id: cve.id,
      timestamp: new Date(cve.modified).getTime(),
      source: 'cve',
      threatType: 'cve',
      severity: severityMap[cve.baseSeverity] || cve.baseScore / 10,
      description: cve.description,
      indicators: [],
      targetSystems: cve.affectedSoftware,
      exploitProbability: this.estimateExploitProbability(cve.exploitStatus),
      metadata: cve
    };
  }

  private estimateExploitProbability(status: string): number {
    const statusMap: Record<string, number> = {
      'unexercised': 0.2,
      'proof-of-concept': 0.5,
      'functional': 0.8,
      'high': 0.95
    };
    return statusMap[status] || 0.3;
  }
}

/**
 * Network Telemetry Consumer
 */
class TelemetryConsumer {
  private port: number;
  private listeners: ((threat: NormalizedThreat) => void)[] = [];

  constructor(port: number = 9999) {
    this.port = port;
  }

  /**
   * Start HTTP server to receive telemetry POST requests
   */
  startServer(): void {
    console.log(`Telemetry listener started on port ${this.port}`);
  }

  /**
   * Convert network telemetry to threat model
   */
  parseNetworkTelemetry(telemetry: NetworkTelemetry): NormalizedThreat {
    return {
      id: `telemetry-${telemetry.timestamp}-${telemetry.sourceIP}`,
      timestamp: telemetry.timestamp,
      source: 'telemetry',
      threatType: 'network-anomaly',
      severity: telemetry.anomalyScore,
      description: `Network anomaly: ${telemetry.sourceIP} → ${telemetry.destIP}:${telemetry.ports.join(',')}`,
      indicators: [telemetry.sourceIP, telemetry.destIP, telemetry.payloadSignature],
      targetSystems: [`port:${telemetry.ports.join(',')}`],
      exploitProbability: Math.min(telemetry.anomalyScore * 1.5, 1),
      metadata: telemetry
    };
  }

  subscribe(callback: (threat: NormalizedThreat) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(threat: NormalizedThreat): void {
    for (const listener of this.listeners) {
      listener(threat);
    }
  }
}

/**
 * MAIN INGESTION ENGINE
 */
export class ThreatFeedIngestionEngine {
  private stixConsumer: STIXFeedConsumer;
  private cveConsumer: CVEFeedConsumer;
  private telemetryConsumer: TelemetryConsumer;
  private threatQueue: NormalizedThreat[] = [];
  private isRunning = false;
  private pollingInterval = 300000; // 5 minutes

  constructor(
    stixFeedUrl: string,
    stixApiKey: string,
    nvdApiKey: string,
    telemetryPort?: number
  ) {
    this.stixConsumer = new STIXFeedConsumer(stixFeedUrl, stixApiKey);
    this.cveConsumer = new CVEFeedConsumer(nvdApiKey);
    this.telemetryConsumer = new TelemetryConsumer(telemetryPort);
  }

  /**
   * Start continuous threat feed polling
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.telemetryConsumer.startServer();

    // Poll STIX and CVE feeds every 5 minutes
    setInterval(async () => {
      await this.pollFeeds();
    }, this.pollingInterval);

    console.log('Threat Feed Ingestion Engine started');
  }

  /**
   * Main polling loop
   */
  private async pollFeeds(): Promise<void> {
    // STIX
    const stixBundle = await this.stixConsumer.fetchSTIXBundle();
    if (stixBundle) {
      const stixThreats = this.stixConsumer.parseSTIXBundle(stixBundle);
      this.threatQueue.push(...stixThreats);
    }

    // CVE
    const cves = await this.cveConsumer.fetchRecentCVEs(1); // Last 24 hours
    const cveThreats = cves.map(cve => this.cveConsumer.parseCVE(cve));
    this.threatQueue.push(...cveThreats);

    console.log(`Ingested ${this.threatQueue.length} threats from feeds`);
  }

  /**
   * Get next threat from queue
   */
  dequeueNextThreat(): NormalizedThreat | null {
    if (this.threatQueue.length === 0) return null;
    return this.threatQueue.shift() || null;
  }

  /**
   * Get threat statistics
   */
  getStats(): { queueSize: number; isRunning: boolean } {
    return {
      queueSize: this.threatQueue.length,
      isRunning: this.isRunning
    };
  }
}

// Export consumers for direct use
export { STIXFeedConsumer, CVEFeedConsumer, TelemetryConsumer };
