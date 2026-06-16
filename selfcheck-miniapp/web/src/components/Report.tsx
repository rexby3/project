import type { BreachItem, Report } from '../types';

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
}

function BreachCard({ item }: { item: BreachItem }): JSX.Element {
  return (
    <li className="breach">
      <div className="breach__head">
        <span className="breach__title">{item.title ?? item.name}</span>
        {item.demo && <span className="tag tag--demo">демо</span>}
        {item.verified && !item.demo && <span className="tag tag--ok">подтверждено</span>}
      </div>
      {item.domain && <div className="breach__domain">{item.domain}</div>}
      <div className="breach__meta">
        {item.breachDate && <span>Утечка: {formatDate(item.breachDate)}</span>}
        {typeof item.pwnCount === 'number' && (
          <span>· {item.pwnCount.toLocaleString('ru-RU')} записей</span>
        )}
      </div>
      {item.dataClasses.length > 0 && (
        <div className="chips">
          {item.dataClasses.map((c) => (
            <span className="chip" key={c}>{c}</span>
          ))}
        </div>
      )}
      {item.description && <p className="breach__desc">{item.description}</p>}
    </li>
  );
}

export function ReportView({ report }: { report: Report }): JSX.Element {
  const clean = report.breachCount === 0;

  return (
    <div className="report">
      <div className={clean ? 'verdict verdict--ok' : 'verdict verdict--alert'}>
        <div className="verdict__icon">{clean ? '✅' : '⚠️'}</div>
        <div>
          <div className="verdict__title">
            {clean
              ? 'Утечек не найдено'
              : `Найдено утечек: ${report.breachCount}`}
          </div>
          <div className="verdict__sub">
            {report.channel === 'email' ? 'Email' : 'Телефон'}: {report.target}
          </div>
        </div>
      </div>

      {report.notes.map((note) => (
        <div className="banner banner--note" key={note}>{note}</div>
      ))}

      {report.breaches.length > 0 && (
        <section className="section">
          <h2 className="section__title">Где засветились данные</h2>
          <ul className="breach-list">
            {report.breaches.map((b) => (
              <BreachCard item={b} key={`${b.source}:${b.name}`} />
            ))}
          </ul>
        </section>
      )}

      {report.recommendations.length > 0 && (
        <section className="section">
          <h2 className="section__title">Что делать</h2>
          <ul className="recs">
            {report.recommendations.map((r) => (
              <li className="recs__item" key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
