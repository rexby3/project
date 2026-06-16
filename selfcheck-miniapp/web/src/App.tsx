import { useEffect, useState } from 'react';
import { ApiError, api, getServerConfig } from './api';
import { ReportView } from './components/Report';
import { haptic, isInsideTelegram } from './telegram';
import type { Channel, Report } from './types';

type Step = 'form' | 'verify' | 'report';

const ERROR_MESSAGES: Record<string, string> = {
  bad_channel: 'Выберите тип данных.',
  bad_target: 'Проверьте формат email или номера телефона.',
  bad_code_format: 'Код состоит из 6 цифр.',
  mismatch: 'Неверный код. Попробуйте ещё раз.',
  expired: 'Срок действия кода истёк. Запросите новый.',
  too_many_attempts: 'Слишком много попыток. Запросите новый код.',
  no_pending: 'Сначала запросите код.',
  rate_limited: 'Слишком часто. Подождите немного и попробуйте снова.',
  ownership_not_verified: 'Сначала подтвердите владение данными.',
  delivery_failed: 'Не удалось отправить код. Проверьте настройки доставки.',
  provider_failed: 'Источник данных временно недоступен.',
  missing_init_data: 'Откройте приложение внутри Telegram.',
};

function humanError(code: string): string {
  if (code.startsWith('auth_failed')) {
    return 'Не удалось подтвердить Telegram-сессию. Откройте приложение заново.';
  }
  return ERROR_MESSAGES[code] ?? 'Что-то пошло не так. Попробуйте ещё раз.';
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) return humanError(err.message);
  return 'Сеть недоступна. Проверьте соединение.';
}

export function App(): JSX.Element {
  const [step, setStep] = useState<Step>('form');
  const [channel, setChannel] = useState<Channel>('email');
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [requireVerification, setRequireVerification] = useState(true);

  useEffect(() => {
    getServerConfig()
      .then((c) => setRequireVerification(c.requireVerification))
      .catch(() => setRequireVerification(true));
  }, []);

  function reset(): void {
    setStep('form');
    setTarget('');
    setCode('');
    setReport(null);
    setError(null);
    setDevCode(null);
  }

  async function handleRequestCode(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.requestCode(channel, target);
      setDevCode(res.devCode ?? null);
      setStep('verify');
    } catch (err) {
      haptic('error');
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.confirmCode(channel, target, code);
      const res = await api.check(channel, target);
      haptic('success');
      setReport(res.report);
      setStep('report');
    } catch (err) {
      haptic('error');
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectCheck(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.check(channel, target);
      haptic('success');
      setReport(res.report);
      setStep('report');
    } catch (err) {
      haptic('error');
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>SelfCheck</h1>
        <p className="app__subtitle">Проверь, что о тебе утекло в сеть</p>
      </header>

      <div className="banner" role="note">
        {requireVerification ? (
          <>
            🔒 Проверять можно только <b>свои</b> данные. Отчёт открывается лишь после
            подтверждения кодом на твой email или номер.
          </>
        ) : (
          <>
            🔒 Показываем <b>факт</b> утечек из публичных баз (как Have I Been Pwned):
            где засветился адрес и какие данные. Сами пароли и записи не раскрываются.
          </>
        )}
      </div>

      {!isInsideTelegram() && (
        <div className="banner banner--warn">
          Приложение запущено вне Telegram. Для реальной работы открой его через бота.
        </div>
      )}

      {error && <div className="alert" role="alert">{error}</div>}

      {step === 'form' && (
        <form className="card" onSubmit={requireVerification ? handleRequestCode : handleDirectCheck}>
          <div className="segmented">
            <button
              type="button"
              className={channel === 'email' ? 'segmented__btn is-active' : 'segmented__btn'}
              onClick={() => setChannel('email')}
            >
              Email
            </button>
            <button
              type="button"
              className={channel === 'phone' ? 'segmented__btn is-active' : 'segmented__btn'}
              onClick={() => setChannel('phone')}
            >
              Телефон
            </button>
          </div>

          <label className="field">
            <span className="field__label">
              {channel === 'email' ? 'Твой email' : 'Твой номер телефона'}
            </span>
            <input
              className="field__input"
              type={channel === 'email' ? 'email' : 'tel'}
              inputMode={channel === 'email' ? 'email' : 'tel'}
              autoComplete={channel === 'email' ? 'email' : 'tel'}
              placeholder={channel === 'email' ? 'you@example.com' : '+7 999 123-45-67'}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </label>

          <button className="btn btn--primary" type="submit" disabled={loading || !target}>
            {loading
              ? requireVerification ? 'Отправляем…' : 'Проверяем…'
              : requireVerification ? 'Получить код' : 'Проверить'}
          </button>
          <p className="hint">
            {requireVerification
              ? 'Мы отправим одноразовый код, чтобы убедиться, что это твои данные.'
              : 'Покажем, в каких известных утечках встречается адрес и какие данные утекли.'}
          </p>
        </form>
      )}

      {step === 'verify' && (
        <form className="card" onSubmit={handleConfirm}>
          <p className="card__lead">
            Код отправлен на <b>{target}</b>. Введи его ниже.
          </p>
          {devCode && (
            <div className="banner banner--dev">DEV-режим: код — <b>{devCode}</b></div>
          )}
          <label className="field">
            <span className="field__label">Код подтверждения</span>
            <input
              className="field__input field__input--code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={loading || code.length !== 6}>
            {loading ? 'Проверяем…' : 'Подтвердить и проверить'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={reset} disabled={loading}>
            Изменить данные
          </button>
        </form>
      )}

      {step === 'report' && report && (
        <>
          <ReportView report={report} />
          <button className="btn btn--ghost" type="button" onClick={reset}>
            Проверить другие данные
          </button>
        </>
      )}

      <footer className="app__footer">
        Данные используются только для проверки и не сохраняются дольше необходимого.
      </footer>
    </div>
  );
}
