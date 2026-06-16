# SelfCheck — Telegram Mini App для проверки своего цифрового следа

Мини-приложение в Telegram, которое показывает, **в каких известных утечках
засветились твои собственные данные** (email / телефон), и что с этим делать.

## Чем это НЕ является

Это **не «пробив»** и не поиск людей. Ключевое отличие зашито в архитектуру:

> **Отчёт отдаётся только после подтверждения владения.** Чтобы что-то узнать
> про email или номер, нужно ввести одноразовый код, который приходит на этот
> самый email / номер. Нет подтверждения — нет результата.

Поэтому через приложение **нельзя проверить чужого человека** — у тебя не будет
кода с его почты или телефона. Плюс мы принципиально не используем слитые
«серые» базы: для email применяется официальный [Have I Been Pwned](https://haveibeenpwned.com/),
а для телефонов по умолчанию источник не подключён (см. ниже).

## Как это работает

```
Telegram → бот открывает Mini App → web (React)
                                       │
                                       ▼
        1. ввод своего email/телефона
        2. POST /api/verify/request  → код на email (SMTP) или SMS (Twilio)
        3. POST /api/verify/confirm  → (tgUser, channel, target) помечается verified
        4. POST /api/check           → только для verified: запрос к провайдеру
                                       → отчёт: утечки + рекомендации
```

Каждый запрос несёт подписанный Telegram `initData`, который сервер проверяет
по токену бота (`server/src/telegram/initData.ts`). Это привязывает проверку к
реальному Telegram-аккаунту и питает rate-limit.

## Структура

```
selfcheck-miniapp/
├── server/                 # Fastify API + grammY бот (TypeScript)
│   ├── src/
│   │   ├── index.ts        # запуск HTTP + бота, раздача web-сборки
│   │   ├── bot.ts          # /start с кнопкой Web App
│   │   ├── config.ts       # конфиг из ENV (+ защита dev-флагов в проде)
│   │   ├── telegram/       # валидация initData, аутентификация запросов
│   │   ├── verification/   # генерация/доставка кодов, хранилище подтверждений
│   │   ├── providers/      # HIBP (email), заглушка телефона, демо-режим
│   │   ├── services/       # сборка отчёта + рекомендации
│   │   └── routes/         # /api/health, /api/verify/*, /api/check
│   └── test/               # vitest: initData, verification, report, hibp
└── web/                    # React + Vite Mini App
    └── src/                # форма → подтверждение кода → отчёт
```

## Быстрый старт (локально, без ключей)

```bash
cd selfcheck-miniapp
npm install
cp .env.example .env
# включи демо-режим, чтобы всё работало из браузера без ключей:
#   MOCK_BREACHES=true
#   ALLOW_DEV_AUTH=true
#   EXPOSE_DEV_CODE=true
#   BOT_TOKEN=  (можно пустым — бот просто не запустится, API работает)

npm run dev:server         # терминал 1 → http://localhost:8080
npm run dev:web            # терминал 2 → http://localhost:5173 (проксирует /api)
```

В dev-режиме открой http://localhost:5173. Чтобы фронт прошёл аутентификацию вне
Telegram, создай `web/.env.local`:

```
VITE_DEV_USER=1
```

Тогда запросы пойдут с заголовком `X-Dev-User` (его принимает только
`ALLOW_DEV_AUTH=true`). Код подтверждения вернётся прямо в ответе
(`EXPOSE_DEV_CODE=true`) и покажется в интерфейсе.

## Проверка качества

```bash
npm run typecheck          # tsc по server и web
npm run test               # vitest (server)
npm run build              # сборка web + бандл server
```

## Боевой запуск

1. Создай бота у [@BotFather](https://t.me/BotFather), получи `BOT_TOKEN`.
2. Залей web-сборку (или весь сервер) на HTTPS-домен. Сервер сам раздаёт
   `web/dist`, так что достаточно задеплоить `server` после `npm run build`.
3. В `.env` задай боевые значения и **выключи** все dev-флаги
   (`MOCK_BREACHES`, `ALLOW_DEV_AUTH`, `EXPOSE_DEV_CODE` = `false`; при
   `NODE_ENV=production` они и так принудительно выключаются).
4. Подключи источники и доставку:
   - `HIBP_API_KEY` — ключ Have I Been Pwned (email-утечки).
   - `EMAIL_DELIVERY=smtp` + `SMTP_*` (и `npm i nodemailer -w server`) — коды на email.
   - `SMS_DELIVERY=twilio` + `TWILIO_*` — коды по SMS.
5. У @BotFather укажи URL Mini App: `/setmenubutton` или Web App URL =
   `WEBAPP_URL`.
6. Запусти: `npm run build && npm start`.

## Источники данных и честные ограничения

| Канал | Источник по умолчанию | Статус |
|---|---|---|
| Email | Have I Been Pwned API | работает с `HIBP_API_KEY` |
| Телефон | заглушка (`providers/phone.ts`) | **возвращает пусто** |

Для телефонов нет чистого легального бесплатного API утечек. Поэтому по
умолчанию приложение честно говорит «источник не подключён», а не выдумывает
данные и не лезет в серые базы. Если у тебя есть доступ к **законному**
провайдеру — подключи его в `providers/phone.ts` (ключ через
`PHONE_PROVIDER_API_KEY`). Подтверждение владения номером (SMS-код) работает
в любом случае.

### Идеи для развития
- Pwned Passwords (k-anonymity) — проверка пароля без отправки его на сервер.
- Шаблоны запросов на удаление данных у агрегаторов (152-ФЗ / GDPR).
- Периодический ре-чек и пуш при появлении новых утечек.

## Приватность

- Полные email/номера **не возвращаются** клиенту — в отчёте они замаскированы.
- Коды подтверждения хранятся только как HMAC-хеш, с TTL и лимитом попыток.
- Состояние держится в памяти процесса; для продакшена с несколькими инстансами
  замени in-memory хранилища на Redis.
