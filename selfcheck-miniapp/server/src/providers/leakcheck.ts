import type { BreachItem, EmailBreachProvider, PhoneBreachProvider } from './types';

// Free public LeakCheck API. The public endpoint returns only breach
// PRESENCE metadata — source names, dates and the CATEGORIES of data each
// breach contained (e.g. "password", "email") — never the actual leaked
// values. We surface only that metadata.

interface LeakCheckSource {
  name?: string;
  date?: string;
}

interface LeakCheckResponse {
  success?: boolean;
  found?: number;
  fields?: string[];
  sources?: LeakCheckSource[];
  error?: string;
}

const FIELD_LABELS: Record<string, string> = {
  email: 'Email addresses',
  password: 'Passwords',
  hash: 'Password hashes',
  username: 'Usernames',
  phone: 'Phone numbers',
  name: 'Names',
  first_name: 'Names',
  last_name: 'Names',
  address: 'Physical addresses',
  ip: 'IP addresses',
  dob: 'Dates of birth',
  country: 'Country',
  city: 'City',
  zip: 'ZIP codes',
  origin: 'Source',
};

function mapFields(fields: string[]): string[] {
  const mapped = fields.map((f) => FIELD_LABELS[f] ?? f);
  return [...new Set(mapped)];
}

export async function leakCheckQuery(query: string): Promise<BreachItem[]> {
  const url = `https://leakcheck.io/api/public?check=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'selfcheck-miniapp' },
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 404) return [];
  if (res.status === 429) throw new Error('leakcheck_rate_limited');
  if (!res.ok) throw new Error(`leakcheck_error_${res.status}`);

  const data = (await res.json()) as LeakCheckResponse;

  if (data?.success === false) {
    if (/not\s*found/i.test(data.error ?? '')) return [];
    throw new Error(`leakcheck_${data.error ?? 'error'}`);
  }

  const classes = mapFields(Array.isArray(data?.fields) ? data.fields : []);
  const sources = (Array.isArray(data?.sources) ? data.sources : []).slice(0, 50);

  if (sources.length > 0) {
    return sources.map((s) => ({
      source: 'LeakCheck',
      name: s.name ?? 'Утечка',
      title: s.name,
      breachDate: s.date || undefined,
      dataClasses: classes,
    }));
  }

  if ((data?.found ?? 0) > 0) {
    return [
      {
        source: 'LeakCheck',
        name: `Найдено в утечках: ${data.found}`,
        dataClasses: classes,
      },
    ];
  }

  return [];
}

/** One provider instance usable for both email and phone (public API takes both). */
export function createLeakCheckProvider(): EmailBreachProvider & PhoneBreachProvider {
  return {
    name: 'LeakCheck',
    available: true,
    check: leakCheckQuery,
  };
}
