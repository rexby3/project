import type { BreachItem, PhoneBreachProvider } from './types';

/**
 * Default phone provider.
 *
 * There is no clean, lawful, general-purpose free API for phone-number breach
 * lookups. Rather than fabricate results or scrape grey-market "probiv"
 * databases, the default returns an empty result and reports itself as
 * unavailable. Wire a lawful provider here (configured via PHONE_PROVIDER /
 * PHONE_PROVIDER_API_KEY) if you have access to one.
 */
export function createStubPhoneProvider(): PhoneBreachProvider {
  return {
    name: 'none',
    available: false,
    async check(): Promise<BreachItem[]> {
      return [];
    },
  };
}
