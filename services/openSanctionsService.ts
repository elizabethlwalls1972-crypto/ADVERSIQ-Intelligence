/**
 * ═══════════════════════════════════════════════════════════════════
 * OpenSanctions - Global Sanctions & Politically Exposed Persons
 * ═══════════════════════════════════════════════════════════════════
 * Free API - no key required for basic entity lookup.
 * https://api.opensanctions.org
 *
 * Covers: OFAC SDN, EU Consolidated, UN Security Council, UK HMT,
 * INTERPOL Notices, World Bank Debarments, and 100+ other lists.
 *
 * Use for: partner due diligence, PEP screening, sanctions checks
 * before deal engagement.
 * ═══════════════════════════════════════════════════════════════════
 */

export interface SanctionsHit {
  id: string;
  name: string;
  schema: string;       // 'Person' | 'Organization' | 'Company' | etc.
  datasets: string[];   // e.g. ['us_ofac_sdn', 'eu_fsf', 'un_sc_sanctions']
  isSanctioned: boolean;
  isPEP: boolean;       // Politically Exposed Person
  position?: string;
  nationality?: string;
  summary: string;
}

export interface SanctionsScreenResult {
  query: string;
  totalHits: number;
  hits: SanctionsHit[];
  clearanceLevel: 'Clear' | 'Review Required' | 'High Risk' | 'Blocked';
  flaggedLists: string[];
}

const SANCTION_LIST_LABELS: Record<string, string> = {
  us_ofac_sdn: 'US OFAC SDN',
  us_ofac_cons: 'US OFAC Consolidated',
  eu_fsf: 'EU Financial Sanctions',
  gb_hmt_sanctions: 'UK HMT Sanctions',
  un_sc_sanctions: 'UN Security Council',
  interpol_red_notices: 'INTERPOL Red Notice',
  worldbank_debarments: 'World Bank Debarred',
  ch_seco_sanctions: 'Switzerland SECO',
  au_dfat_sanctions: 'Australia DFAT',
  ca_dfatd_sema_sanctions: 'Canada SEMA',
};

function deriveClearanceLevel(hits: SanctionsHit[]): SanctionsScreenResult['clearanceLevel'] {
  const sanctioned = hits.filter(h => h.isSanctioned);
  if (sanctioned.some(h => h.datasets.some(d => d.includes('ofac') || d.includes('un_sc')))) return 'Blocked';
  if (sanctioned.length > 0) return 'High Risk';
  if (hits.some(h => h.isPEP)) return 'Review Required';
  return 'Clear';
}

export async function screenEntitySanctions(
  name: string,
  schema?: 'Person' | 'Organization'
): Promise<SanctionsScreenResult> {
  const empty: SanctionsScreenResult = {
    query: name,
    totalHits: 0,
    hits: [],
    clearanceLevel: 'Clear',
    flaggedLists: [],
  };

  if (!name || name.trim().length < 3) return empty;

  try {
    const params = new URLSearchParams({ q: name.trim(), limit: '5' });
    if (schema) params.set('schema', schema);

    const res = await fetch(`https://api.opensanctions.org/entities/_search?${params}`, {
      signal: AbortSignal.timeout(7000),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return empty;

    const data = await res.json();
    const results = (data.results || []) as Array<{
      id?: string;
      caption?: string;
      schema?: string;
      datasets?: string[];
      properties?: {
        name?: string[];
        notes?: string[];
        position?: string[];
        nationality?: string[];
        topics?: string[];
      };
    }>;

    const hits: SanctionsHit[] = results.map(r => {
      const topics = r.properties?.topics || [];
      const isSanctioned = topics.includes('sanction') || (r.datasets || []).some(d => d.includes('sanction') || d.includes('ofac') || d.includes('sdn'));
      const isPEP = topics.includes('pep') || topics.includes('poi');

      return {
        id: r.id || '',
        name: r.caption || (r.properties?.name?.[0] ?? name),
        schema: r.schema || 'Unknown',
        datasets: r.datasets || [],
        isSanctioned,
        isPEP,
        position: r.properties?.position?.[0],
        nationality: r.properties?.nationality?.[0],
        summary: (r.properties?.notes?.[0] || r.properties?.position?.[0] || '').substring(0, 180),
      };
    });

    const allDatasets = hits.flatMap(h => h.datasets);
    const flaggedLists = [...new Set(allDatasets)]
      .filter(d => SANCTION_LIST_LABELS[d])
      .map(d => SANCTION_LIST_LABELS[d]);

    return {
      query: name,
      totalHits: (data.total?.value as number) || hits.length,
      hits,
      clearanceLevel: deriveClearanceLevel(hits),
      flaggedLists,
    };
  } catch {
    return empty;
  }
}
