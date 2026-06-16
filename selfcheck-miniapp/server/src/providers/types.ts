export interface BreachItem {
  /** Where this finding came from, e.g. "Have I Been Pwned". */
  source: string;
  /** Machine name of the breach, e.g. "LinkedIn". */
  name: string;
  title?: string;
  domain?: string;
  breachDate?: string;
  addedDate?: string;
  pwnCount?: number;
  /** What kind of data leaked: "Email addresses", "Passwords", ... */
  dataClasses: string[];
  description?: string;
  /** Whether the source considers the breach verified. */
  verified?: boolean;
  /** True for clearly-labelled SAMPLE data shown in demo mode. */
  demo?: boolean;
}

export interface EmailBreachProvider {
  name: string;
  available: boolean;
  check(email: string): Promise<BreachItem[]>;
}

export interface PhoneBreachProvider {
  name: string;
  available: boolean;
  check(phoneE164: string): Promise<BreachItem[]>;
}
