import { describe, expect, it } from 'vitest';
import { maskEmail, maskPhone, normalizeEmail, normalizePhone } from '../src/lib/validate';
import { mapHibpBreach } from '../src/providers/hibp';
import { buildReport } from '../src/services/report';

describe('validate + mask', () => {
  it('normalizes emails', () => {
    expect(normalizeEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
    expect(normalizeEmail('not-an-email')).toBeNull();
  });

  it('normalizes phones to +digits', () => {
    expect(normalizePhone('+1 (555) 123-4567')).toBe('+15551234567');
    expect(normalizePhone('8 999 123 45 67')).toBe('+89991234567');
    expect(normalizePhone('123')).toBeNull();
  });

  it('masks targets and never reveals the whole value', () => {
    expect(maskEmail('john@example.com')).toBe('j***@example.com');
    const masked = maskPhone('+15551234567');
    expect(masked).toContain('4567');
    expect(masked).not.toContain('5551');
  });
});

describe('mapHibpBreach', () => {
  it('maps API shape and strips HTML from description', () => {
    const item = mapHibpBreach({
      Name: 'LinkedIn',
      Title: 'LinkedIn',
      Domain: 'linkedin.com',
      BreachDate: '2012-05-05',
      PwnCount: 164_611_595,
      Description: 'In <a href="x">May 2016</a> LinkedIn data appeared.',
      DataClasses: ['Email addresses', 'Passwords'],
      IsVerified: true,
    });
    expect(item.source).toBe('Have I Been Pwned');
    expect(item.name).toBe('LinkedIn');
    expect(item.description).toBe('In May 2016 LinkedIn data appeared.');
    expect(item.dataClasses).toContain('Passwords');
  });
});

describe('buildReport', () => {
  it('produces password + 2FA advice when passwords leaked', () => {
    const report = buildReport({
      channel: 'email',
      target: 'john@example.com',
      providerAvailable: true,
      breaches: [
        {
          source: 'Have I Been Pwned',
          name: 'X',
          dataClasses: ['Email addresses', 'Passwords'],
        },
      ],
    });
    expect(report.target).toBe('j***@example.com'); // masked
    expect(report.breachCount).toBe(1);
    expect(report.recommendations.join(' ').toLowerCase()).toContain('парол');
    expect(report.dataClasses).toContain('Passwords');
  });

  it('adds a note when the provider is unavailable', () => {
    const report = buildReport({
      channel: 'phone',
      target: '+15551234567',
      providerAvailable: false,
      breaches: [],
    });
    expect(report.breachCount).toBe(0);
    expect(report.notes.join(' ')).toMatch(/не подключ/i);
  });

  it('flags demo data', () => {
    const report = buildReport({
      channel: 'email',
      target: 'a@b.com',
      providerAvailable: true,
      breaches: [{ source: 'demo', name: 'D', dataClasses: ['Names'], demo: true }],
    });
    expect(report.demo).toBe(true);
    expect(report.notes.join(' ')).toMatch(/демо/i);
  });
});
