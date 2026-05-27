export type OsintCategory = 'government' | 'statistics' | 'news' | 'business';

export interface OsintResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  category: OsintCategory;
}

const GOVERNMENT_DOMAINS = [
  '.gov', '.gov.au', '.gov.ph', '.gov.uk', '.gov.sg', '.go.jp', '.gov.my',
  '.gob.', '.gouv.', '.govt.', '.government', '.admin.ch', '.europa.eu'
];

const STATISTICS_DOMAINS = [
  'data.gov', 'data.gov.au', 'data.gov.ph', 'data.gov.uk', 'data.gov.sg',
  'abs.gov.au', 'psa.gov.ph', 'ons.gov.uk', 'census.gov', 'stat.go.jp',
  'singstat.gov.sg', 'dosm.gov.my', 'bps.go.id', 'statistics.'
];

const NEWS_DOMAINS = [
  'reuters.com', 'bloomberg.com', 'ft.com', 'economist.com', 'bbc.com',
  'aljazeera.com', 'nikkei.com', 'scmp.com', 'straitstimes.com', 'wsj.com',
  'cnbc.com', 'forbes.com', 'businessinsider.com'
];

const BUSINESS_DOMAINS = [
  'opencorporates.com', 'crunchbase.com', 'zoominfo.com', 'dnb.com',
  'sec.gov', 'asic.gov.au', 'fca.org.uk', 'companieshouse.gov.uk', 'sirketler.gov.tr'
];

const matchesDomain = (domain: string, list: string[]) =>
  list.some(d => domain.includes(d));

const categorizeDomain = (domain: string): OsintCategory => {
  if (matchesDomain(domain, GOVERNMENT_DOMAINS)) return 'government';
  if (matchesDomain(domain, STATISTICS_DOMAINS)) return 'statistics';
  if (matchesDomain(domain, NEWS_DOMAINS)) return 'news';
  if (matchesDomain(domain, BUSINESS_DOMAINS)) return 'business';
  return 'business';
};

const fetchSerper = async (query: string, numResults: number): Promise<OsintResult[]> => {
  const res = await fetch('/api/search/serper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, num: numResults })
  });
  if (!res.ok) return [];
  const data = await res.json();
  const results = Array.isArray(data.organic) ? data.organic : [];
  return results.map((item: any) => {
    const domain = item.link ? new URL(item.link).hostname : '';
    return {
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: domain,
      category: categorizeDomain(domain)
    } as OsintResult;
  });
};

const fetchDuckDuckGo = async (query: string, numResults: number): Promise<OsintResult[]> => {
  const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(ddgUrl);
  if (!res.ok) return [];
  const data = await res.json();
  const results: OsintResult[] = [];

  if (data.AbstractURL && data.AbstractText) {
    const domain = new URL(data.AbstractURL).hostname;
    results.push({
      title: data.Heading || query,
      link: data.AbstractURL,
      snippet: data.AbstractText,
      displayLink: domain,
      category: categorizeDomain(domain)
    });
  }

  const related = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
  for (const topic of related.slice(0, numResults)) {
    if (topic.FirstURL && topic.Text) {
      const domain = new URL(topic.FirstURL).hostname;
      results.push({
        title: topic.Text.substring(0, 100),
        link: topic.FirstURL,
        snippet: topic.Text,
        displayLink: domain,
        category: categorizeDomain(domain)
      });
    }
  }

  return results;
};

export async function osintSearch(
  query: string,
  filters: OsintCategory[] = ['government', 'statistics', 'news', 'business'],
  numResults = 10
): Promise<OsintResult[]> {
  if (!query.trim()) return [];
  let results: OsintResult[] = [];
  try {
    results = await fetchSerper(query, numResults);
  } catch {
    results = [];
  }
  if (results.length === 0) {
    try {
      results = await fetchDuckDuckGo(query, numResults);
    } catch {
      results = [];
    }
  }
  const filtered = results.filter(r => filters.includes(r.category));
  return filtered.slice(0, numResults);
}
