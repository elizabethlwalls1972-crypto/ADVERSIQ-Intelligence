export interface EchoReport {
  echoes: string[];
  timestamp: string;
}

export class InternalEchoDetector {
  static async detect(): Promise<EchoReport> {
    return { echoes: [], timestamp: new Date().toISOString() };
  }
}

export default { InternalEchoDetector };
