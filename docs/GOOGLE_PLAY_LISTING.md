# Google Play Console — Listing

## Main store listing

### App name (30 chars)
`EgoCore — AI for self`

### Short description (80 chars)
```
Your AI companion for reflection, growth and clarity. Anywhere, anytime.
```

### Full description (4000 chars)
```
EgoCore is an AI-powered platform for personal growth, self-reflection and clarity.

WHAT YOU CAN DO
• Have meaningful conversations with an AI tuned to your goals
• Track reflections, insights and progress over time
• Get personalised suggestions and follow-ups
• Sync seamlessly across all your devices

WHY EGOCORE
• Beautifully simple, distraction-free interface
• Privacy-first: your data stays yours
• Built and maintained by a small focused team

SUPPORT
Email: hi@egocore.ai
Privacy: https://egocore.ai/privacy
Terms: https://egocore.ai/terms

EgoCore is independent and not affiliated with any third-party AI provider.
```

### Graphics
- **App icon**: 512×512 PNG (32-bit, alpha) — берётся из `resources/icon.png` (после `npm run icons`)
- **Feature graphic**: 1024×500 JPG/PNG — нужно сделать вручную (логотип + слоган на фоне). Шаблон в `SCREENSHOTS_CHECKLIST.md`
- **Phone screenshots**: 2-8 шт., 16:9 или 9:16, минимум 320 px по короткой стороне (рекомендую 1080×1920 или 1440×3120)
- **7-inch tablet** (опционально, но желательно): 2-8 шт.
- **10-inch tablet** (опционально): 2-8 шт.

### Category
- **App category**: Lifestyle (или Health & Fitness)
- **Tags**: до 5 тегов (выбираются из списка Play Console)

### Contact details
- Email: `hi@egocore.ai` (обязательно)
- Phone (опционально)
- Website: `https://egocore.ai/`

### Privacy policy
`https://egocore.ai/privacy` (обязательно перед публикацией)

---

## App content (обязательные анкеты)

1. **Privacy policy** — указать URL
2. **App access** — если в приложении есть гейтинг (логин), указать тестовый логин
3. **Ads** — содержит ли приложение рекламу (обычно No для веб-обёртки)
4. **Content rating** — пройти IARC-анкету
5. **Target audience** — возраст 13+ или 18+
6. **News app** — обычно No
7. **COVID-19 contact tracing** — No
8. **Data safety** — детальная анкета о собираемых данных (см. PRIVACY_POLICY_TEMPLATE.md)
9. **Government apps** — No
10. **Financial features** — обычно No
11. **Health features** — Yes если приложение для wellness
12. **Actor advertising ID** — No если не используете рекламу

---

## Data safety — типовые ответы для веб-обёртки с пушами

- **Does your app collect or share any of the required user data types?** Yes
- **Encrypted in transit**: Yes (HTTPS-only)
- **Provide a way to delete data**: Yes, URL: `https://egocore.ai/account-delete`

Категории данных:
- **Personal info → Email address**: Collected + Linked to user. Purpose: Account management.
- **App activity → App interactions**: Collected. Purpose: Analytics, App functionality.
- **Device or other IDs**: Collected (push token). Purpose: App functionality.

Скорректируйте под реальный набор полей, который собирает сайт.

---

## Release tracks

1. **Internal testing** — до 100 тестировщиков, релиз почти мгновенно
2. **Closed testing** — расширенная группа (нужен email-список или Google Group)
3. **Open testing** — публичная beta
4. **Production**

Рекомендую путь: Internal → Closed (50-100 чел) → Production.

---

## Версионирование

- **versionCode** — целое число, должно строго возрастать (1, 2, 3, ...)
- **versionName** — человекочитаемая строка (1.0.0, 1.0.1, ...)
