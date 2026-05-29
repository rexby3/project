# Legal & support pages for egocore.ai

Готовые страницы, которые **обязательны** для публикации в App Store и Google Play.
Оформлены в тёмной теме под цвета EgoCore. Тексты — рабочие черновики,
перед публикацией проверьте под реальные практики и желательно у юриста.

## Файлы и куда их разместить

| Файл | Должен открываться по URL |
|---|---|
| `privacy.html` | `https://egocore.ai/privacy` |
| `terms.html` | `https://egocore.ai/terms` |
| `account-delete.html` | `https://egocore.ai/account-delete` |
| `support.html` | `https://egocore.ai/support` |

## Как разместить

### Если egocore.ai на Next.js
Положите как статические файлы в `public/` и настройте маршруты,
либо создайте страницы-роуты `app/privacy/page.tsx` и т.п., вставив контент.
Проще всего — положить html в `public/privacy.html` и т.д., но тогда URL будет
с `.html`. Чтобы был чистый `/privacy` — настройте rewrite в `next.config.js`:

```js
async rewrites() {
  return [
    { source: '/privacy', destination: '/privacy.html' },
    { source: '/terms', destination: '/terms.html' },
    { source: '/account-delete', destination: '/account-delete.html' },
    { source: '/support', destination: '/support.html' },
  ];
}
```

### Если статический хостинг / Nginx
Загрузите файлы и сделайте так, чтобы `/privacy` отдавал `privacy.html`
(в Nginx: `try_files $uri $uri.html $uri/ =404;`).

## Перед публикацией обязательно заполните плейсхолдеры

- `[COMPANY LEGAL ADDRESS]` в `privacy.html`
- Проверьте email-адреса (`hi@egocore.ai`, `privacy@egocore.ai`) — они должны реально работать
- Уточните раздел про подписки в `terms.html`, если есть платные тарифы
