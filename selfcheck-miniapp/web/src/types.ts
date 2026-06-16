export type Channel = 'email' | 'phone';

export interface BreachItem {
  source: string;
  name: string;
  title?: string;
  domain?: string;
  breachDate?: string;
  addedDate?: string;
  pwnCount?: number;
  dataClasses: string[];
  description?: string;
  verified?: boolean;
  demo?: boolean;
}

export interface Report {
  channel: Channel;
  target: string;
  providerAvailable: boolean;
  checkedAt: string;
  breachCount: number;
  breaches: BreachItem[];
  dataClasses: string[];
  recommendations: string[];
  notes: string[];
  demo: boolean;
}

export interface RequestCodeResponse {
  ok: boolean;
  expiresInSeconds?: number;
  devCode?: string;
}

export interface ConfirmResponse {
  ok: boolean;
  verified?: boolean;
}

export interface CheckResponse {
  ok: boolean;
  report: Report;
}
