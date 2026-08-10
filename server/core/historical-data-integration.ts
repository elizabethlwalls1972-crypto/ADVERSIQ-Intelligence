
import * as fs from 'fs'; import * as path from 'path';
export class HistoricalDataIntegration {
  private dir = path.join(process.cwd(), 'data', 'lida', 'historical');
  async loadAll(): Promise<any[]> {
    if (!fs.existsSync(this.dir)) return [];
    return fs.readdirSync(this.dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(this.dir, f), 'utf-8')));
  }
  mergeWithLive(historical: any[], live: any[]): any[] { return [...historical, ...live]; }
}
export default HistoricalDataIntegration;
