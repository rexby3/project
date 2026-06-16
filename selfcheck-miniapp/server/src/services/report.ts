import type { Channel } from '../lib/validate';
import { maskTarget } from '../lib/validate';
import type { BreachItem } from '../providers/types';

export interface Report {
  channel: Channel;
  target: string; // masked — we never echo the full value back
  providerAvailable: boolean;
  checkedAt: string;
  breachCount: number;
  breaches: BreachItem[];
  dataClasses: string[];
  recommendations: string[];
  notes: string[];
  demo: boolean;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function has(dataClasses: string[], needle: string): boolean {
  return dataClasses.some((c) => c.toLowerCase().includes(needle));
}

function buildRecommendations(channel: Channel, dataClasses: string[], breachCount: number): string[] {
  const recs: string[] = [];

  if (breachCount === 0) {
    recs.push('Утечек по этим данным не найдено в подключённых источниках. Это не гарантия, но хороший знак.');
    recs.push('Включите двухфакторную аутентификацию (2FA) на ключевых аккаунтах — почта, банк, госуслуги.');
    return recs;
  }

  if (has(dataClasses, 'password')) {
    recs.push('Смените пароли на затронутых сервисах и везде, где использовали такой же пароль.');
    recs.push('Используйте менеджер паролей и уникальный пароль для каждого сайта.');
  }
  recs.push('Включите 2FA везде, где возможно (предпочтительно приложение-аутентификатор, а не SMS).');

  if (has(dataClasses, 'email') && channel === 'email') {
    recs.push('Будьте внимательны к фишингу на этот адрес — мошенники часто используют утёкшие email.');
  }
  if (has(dataClasses, 'phone')) {
    recs.push('Остерегайтесь звонков и SMS «от банка/службы безопасности» — номер мог попасть в утечку.');
    recs.push('Рассмотрите защиту от SIM-swap у оператора (запрет смены SIM без личного визита).');
  }
  if (has(dataClasses, 'address') || has(dataClasses, 'physical')) {
    recs.push('Адрес мог утечь — осторожнее с доставками «наложенным платежом» и адресным фишингом.');
  }
  if (has(dataClasses, 'name')) {
    recs.push('Имя в связке с другими данными повышает риск соц. инженерии — перепроверяйте запросы данных.');
  }

  recs.push('Запросите удаление данных у сервисов, которыми больше не пользуетесь (152-ФЗ / GDPR).');
  return unique(recs);
}

export function buildReport(args: {
  channel: Channel;
  target: string;
  providerAvailable: boolean;
  breaches: BreachItem[];
}): Report {
  const { channel, target, providerAvailable, breaches } = args;
  const dataClasses = unique(breaches.flatMap((b) => b.dataClasses ?? []));
  const demo = breaches.some((b) => b.demo);

  const notes: string[] = [];
  if (!providerAvailable) {
    notes.push(
      channel === 'phone'
        ? 'Источник данных для номеров телефонов не подключён. Проверка владения прошла, но искать утечки пока негде — добавьте легальный провайдер в настройках.'
        : 'Источник данных для email не подключён (нет HIBP_API_KEY). Добавьте ключ, чтобы видеть реальные результаты.',
    );
  }
  if (demo) {
    notes.push('Включён демо-режим: показаны ПРИМЕРЫ данных, а не реальные утечки.');
  }

  return {
    channel,
    target: maskTarget(channel, target),
    providerAvailable,
    checkedAt: new Date().toISOString(),
    breachCount: breaches.length,
    breaches: breaches
      .slice()
      .sort((a, b) => (b.breachDate ?? '').localeCompare(a.breachDate ?? '')),
    dataClasses,
    recommendations: buildRecommendations(channel, dataClasses, breaches.length),
    notes,
    demo,
  };
}
