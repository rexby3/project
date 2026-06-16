import type { BreachItem, Report } from '../types';

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
}

function BreachCard({ item, showChips }: { item: BreachItem; showChips: boolean }): JSX.Element {
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
      {showChips && item.dataClasses.length > 0 && (
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
  const showCardChips = report.breaches.length <= 6;

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

      {report.dataClasses.length > 0 && (
        <section className="section">
          <h2 className="section__title">Какие данные засветились</h2>
          <div className="chips">
            {report.dataClasses.map((c) => (
              <span className="chip" key={c}>{c}</span>
            ))}
          </div>
        </section>
      )}

      {report.breaches.length > 0 && (
        <section className="section">
          <h2 className="section__title">Где засветились данные</h2>
          <ul className="breach-list">
            {report.breaches.map((b, i) => (
              <BreachCard item={b} showChips={showCardChips} key={`${b.source}:${b.name}:${i}`} />
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
