import type { Config } from '../config';
import { createHibpProvider } from './hibp';
import { createLeakCheckProvider } from './leakcheck';
import { createMockEmailProvider, createMockPhoneProvider } from './mock';
import type { EmailBreachProvider, PhoneBreachProvider } from './types';

export interface Providers {
  email: EmailBreachProvider;
  phone: PhoneBreachProvider;
}

export function createProviders(config: Config): Providers {
  if (config.mockBreaches) {
    return {
      email: createMockEmailProvider(),
      phone: createMockPhoneProvider(),
    };
  }

  // Free breach-presence source (LeakCheck public API) for both channels.
  // If an HIBP key is configured, prefer it for email.
  const leak = createLeakCheckProvider();

  return {
    email: config.hibpApiKey ? createHibpProvider(config.hibpApiKey) : leak,
    phone: leak,
  };
}
