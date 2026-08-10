/**
 * ═══════════════════════════════════════════════════════════════════
 * UN Comtrade - Global Bilateral Trade Statistics
 * ═══════════════════════════════════════════════════════════════════
 * Free API - no key required for limited queries (v1 endpoint).
 * https://comtrade.un.org/data/doc/api
 *
 * Provides: annual import/export totals by country, top trading
 * partners, commodity breakdowns, and trade balance data.
 *
 * Country codes: UN M49 standard (mapped from country names below).
 * ═══════════════════════════════════════════════════════════════════
 */

/** UN M49 numeric country codes */
const COUNTRY_M49: Record<string, number> = {
  'philippines': 608, 'vietnam': 704, 'indonesia': 360, 'thailand': 764,
  'malaysia': 458, 'singapore': 702, 'australia': 36, 'india': 356,
  'china': 156, 'japan': 392, 'south korea': 410, 'korea': 410,
  'united states': 840, 'usa': 840, 'germany': 276,
  'united kingdom': 826, 'uk': 826, 'great britain': 826,
  'france': 250, 'italy': 380, 'spain': 724, 'netherlands': 528,
  'brazil': 76, 'mexico': 484, 'nigeria': 566, 'kenya': 404,
  'ghana': 288, 'south africa': 710, 'egypt': 818, 'ethiopia': 231,
  'uae': 784, 'united arab emirates': 784, 'saudi arabia': 682,
  'turkey': 792, 'pakistan': 586, 'bangladesh': 50, 'sri lanka': 144,
  'nepal': 524, 'myanmar': 104, 'cambodia': 116, 'laos': 418,
  'new zealand': 554, 'canada': 124, 'argentina': 32, 'chile': 152,
  'peru': 604, 'colombia': 170, 'ecuador': 218, 'venezuela': 862,
  'fiji': 242, 'papua new guinea': 598, 'solomon islands': 90,
  'russia': 643, 'ukraine': 804, 'poland': 616, 'sweden': 752,
  'norway': 578, 'denmark': 208, 'finland': 246, 'switzerland': 756,
  'israel': 376, 'iran': 364, 'iraq': 368, 'jordan': 400,
  'morocco': 504, 'algeria': 12, 'tunisia': 788, 'tanzania': 834,
  'mozambique': 508, 'angola': 24, 'zambia': 894, 'zimbabwe': 716,
};

export interface ComtradeTradeRow {
  year: number;
  flow: 'Exports' | 'Imports';
  partner: string;
  tradeValueUSD: number;
}

export interface ComtradeData {
  country: string;
  m49Code: number;
  year: number;
  totalExports: number;     // USD
  totalImports: number;     // USD
  tradeBalance: number;     // Exports - Imports
  topPartners: string[];
  tradeToGDPNote: string;
}

function formatUSD(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

export function countryToM49(country: string): number | null {
  return COUNTRY_M49[country.toLowerCase().trim()] ?? null;
}

export async function fetchComtradeData(
  country: string,
  year = 2023
): Promise<ComtradeData | null> {
  const m49 = countryToM49(country);
  if (!m49) return null;

  try {
    // v1 endpoint - free, no key, rate limited to 1 req/sec
    const url =
      `https://comtrade.un.org/api/get` +
      `?max=20&type=C&freq=A&px=HS&ps=${year}&r=${m49}&p=0&rg=all&cc=TOTAL&fmt=json`;

    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;

    const data = await res.json();
    const rows = (data.dataset || []) as Array<{
      TradeValue?: number;
      rgDesc?: string;
      ptTitle?: string;
      yr?: number;
    }>;

    if (rows.length === 0) return null;

    let totalExports = 0;
    let totalImports = 0;
    const partnerSet = new Set<string>();

    for (const row of rows) {
      const val = row.TradeValue || 0;
      const flow = row.rgDesc || '';
      if (flow.startsWith('Export')) totalExports += val;
      if (flow.startsWith('Import')) totalImports += val;
      if (row.ptTitle && row.ptTitle !== 'World' && row.ptTitle !== 'Areas, nes') {
        partnerSet.add(row.ptTitle);
      }
    }

    const balance = totalExports - totalImports;
    const topPartners = Array.from(partnerSet).slice(0, 5);

    return {
      country,
      m49Code: m49,
      year: rows[0]?.yr || year,
      totalExports,
      totalImports,
      tradeBalance: balance,
      topPartners,
      tradeToGDPNote: `Exports: ${formatUSD(totalExports)} | Imports: ${formatUSD(totalImports)} | Balance: ${balance >= 0 ? '+' : ''}${formatUSD(balance)} (UN Comtrade ${rows[0]?.yr || year})`,
    };
  } catch {
    return null;
  }
}
