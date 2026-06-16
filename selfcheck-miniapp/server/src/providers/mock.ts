import type { BreachItem, EmailBreachProvider, PhoneBreachProvider } from './types';

// Clearly-labelled SAMPLE data for local UI testing (MOCK_BREACHES=true).
// Never enabled in production.

const sampleEmailBreaches: BreachItem[] = [
  {
    source: 'Have I Been Pwned',
    name: 'ExampleForum',
    title: 'Example Forum',
    domain: 'example-forum.test',
    breachDate: '2017-03-14',
    addedDate: '2017-05-01',
    pwnCount: 8_393_093,
    dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
    description: 'ДЕМО-данные. Реальной утечки не существует — это пример для проверки интерфейса.',
    verified: true,
    demo: true,
  },
  {
    source: 'Have I Been Pwned',
    name: 'SampleShop',
    title: 'Sample Shop',
    domain: 'sample-shop.test',
    breachDate: '2020-11-02',
    addedDate: '2021-01-09',
    pwnCount: 1_204_550,
    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses'],
    description: 'ДЕМО-данные для демонстрации интерфейса.',
    verified: false,
    demo: true,
  },
];

const samplePhoneBreaches: BreachItem[] = [
  {
    source: 'demo',
    name: 'SampleLeak',
    title: 'Sample Leak',
    breachDate: '2019-06-20',
    dataClasses: ['Phone numbers', 'Names'],
    description: 'ДЕМО-данные. Это пример, а не реальная утечка.',
    demo: true,
  },
];

export function createMockEmailProvider(): EmailBreachProvider {
  return {
    name: 'demo',
    available: true,
    async check(): Promise<BreachItem[]> {
      return sampleEmailBreaches;
    },
  };
}

export function createMockPhoneProvider(): PhoneBreachProvider {
  return {
    name: 'demo',
    available: true,
    async check(): Promise<BreachItem[]> {
      return samplePhoneBreaches;
    },
  };
}
