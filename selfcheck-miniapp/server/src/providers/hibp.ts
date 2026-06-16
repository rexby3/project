import type { BreachItem, EmailBreachProvider } from './types';

export interface HibpBreach {
  Name: string;
  Title?: string;
  Domain?: string;
  BreachDate?: string;
  AddedDate?: string;
  PwnCount?: number;
  Description?: string;
  DataClasses?: string[];
  IsVerified?: boolean;
}

function stripHtml(input: string | undefined): string | undefined {
  if (!input) return undefined;
  return input.replace(/<[^>]*>/g, '').trim();
}

/** Pure mapper from the HIBP API shape to our BreachItem (unit-tested). */
export function mapHibpBreach(b: HibpBreach): BreachItem {
  return {
    source: 'Have I Been Pwned',
    name: b.Name,
    title: b.Title ?? b.Name,
    domain: b.Domain,
    breachDate: b.BreachDate,
    addedDate: b.AddedDate,
    pwnCount: b.PwnCount,
    dataClasses: b.DataClasses ?? [],
    description: stripHtml(b.Description),
    verified: b.IsVerified,
  };
}

export function createHibpProvider(apiKey: string | null): EmailBreachProvider {
  return {
    name: 'Have I Been Pwned',
    available: Boolean(apiKey),
    async check(email: string): Promise<BreachItem[]> {
      if (!apiKey) throw new Error('hibp_not_configured');

      const url =
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}` +
        `?truncateResponse=false`;

      const res = await fetch(url, {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'selfcheck-miniapp',
          accept: 'application/json',
        },
      });

      // 404 = account not found in any breach (a good outcome).
      if (res.status === 404) return [];
      if (res.status === 401) throw new Error('hibp_unauthorized');
      if (res.status === 429) throw new Error('hibp_rate_limited');
      if (!res.ok) throw new Error(`hibp_error_${res.status}`);

      const data = (await res.json()) as HibpBreach[];
      return data.map(mapHibpBreach);
    },
  };
}
