import { ReportParameters } from '../types';

const API_BASE = '/api/reports';

const getJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

const sendJson = async (url: string, method: 'POST' | 'PUT', body: unknown) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

export const ReportsService = {
  async list(): Promise<ReportParameters[]> {
    return getJson(API_BASE);
  },

  async get(id: string): Promise<ReportParameters | null> {
    try {
      const report = await getJson(`${API_BASE}/${id}`);
      return report as ReportParameters;
    } catch (error) {
      console.error('Failed to fetch report', error);
      return null;
    }
  },

  async create(report: ReportParameters): Promise<ReportParameters> {
    return sendJson(API_BASE, 'POST', report);
  },

  async update(id: string, report: Partial<ReportParameters>): Promise<ReportParameters> {
    return sendJson(`${API_BASE}/${id}`, 'PUT', report);
  },

  async upsert(report: ReportParameters): Promise<ReportParameters> {
    if (!report.id) {
      return this.create(report);
    }

    const existing = await this.get(report.id);
    if (existing) {
      return this.update(report.id, report);
    }
    return this.create(report);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      throw new Error(await res.text());
    }
  },

  async duplicate(id: string): Promise<ReportParameters> {
    return sendJson(`${API_BASE}/${id}/duplicate`, 'POST', {});
  }
};

