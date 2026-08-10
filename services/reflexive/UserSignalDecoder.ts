export interface UserInputSnapshot {
  timestamp: string;
  input: string;
  context: any;
}

export interface UserSignalReport {
  signals: string[];
  confidence: number;
  timestamp: string;
}

export class UserSignalDecoder {
  static async decode(snapshot: UserInputSnapshot): Promise<UserSignalReport> {
    return {
      signals: [],
      confidence: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export default { UserSignalDecoder };
