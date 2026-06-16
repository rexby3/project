import type { Config } from '../config';
import { createHibpProvider } from './hibp';
import { createMockEmailProvider, createMockPhoneProvider } from './mock';
import { createStubPhoneProvider } from './phone';
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

  return {
    email: createHibpProvider(config.hibpApiKey),
    // Only the documented stub ships by default. Add real, lawful phone
    // providers here keyed off config.phoneProvider.
    phone: createStubPhoneProvider(),
  };
}
