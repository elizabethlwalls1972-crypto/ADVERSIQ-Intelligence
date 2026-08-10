export interface IdentityReport {
  identity: string;
  timestamp: string;
}

export class RegionalIdentityDecoder {
  static async decode(params: any): Promise<IdentityReport> {
    return { identity: 'unknown', timestamp: new Date().toISOString() };
  }
}

export default { RegionalIdentityDecoder };
