# App Store Connect — Listing

Чек-лист данных, которые надо заполнить в **App Store Connect → ваше приложение**.

## App Information
- **Name**: `EgoCore` (макс 30 символов)
- **Subtitle**: придумайте короткое УТП до 30 символов, например `AI for your inner self`
- **Category**: Primary — `Lifestyle` или `Health & Fitness` (выберите, что точнее под продукт), Secondary — `Productivity`
- **Content Rights**: Does your app contain, show, or access third-party content? — выберите Yes только если на сайте есть UGC.
- **Age Rating**: пройдите анкету (учтите наличие AI-генерации, если есть)

## Pricing and Availability
- **Price**: Free (или платная подписка через In-App Purchase — отдельная настройка)
- **Availability**: все страны (или ограничьте на старте)

## App Privacy
Заполняется **до** submit. Минимально честный набор для веб-обёртки:
- **Data Linked to You**: Email Address (если есть логин), Device ID (для пушей), Usage Data (если используете аналитику)
- **Data Used to Track You**: обычно `Not Used` (только если показываете SDK-рекламу со сторонним трекингом)
- **Push Token**: укажите как `Device ID → linked → app functionality`
- Подробные ответы — после изучения вашего сайта; см. `PRIVACY_POLICY_TEMPLATE.md`.

## Version Information (1.0)

### Promotional Text (170 chars, можно менять без re-review)
```
EgoCore is your AI companion for personal growth. Reflect, plan and grow — anywhere, anytime.
```

### Description (4000 chars)
```
EgoCore — AI-powered platform for personal growth, self-reflection and clarity.

WHAT YOU CAN DO
• Have meaningful conversations with an AI tuned for your goals
• Track your reflections, insights and progress
• Get personalised suggestions and follow-ups
• Sync across all your devices via your EgoCore account

WHY EGOCORE
• Beautiful, distraction-free interface
• Private and secure — your data belongs to you
• Built by a small, focused team

SUPPORT
Questions or feedback: hi@egocore.ai
Privacy: https://egocore.ai/privacy
Terms: https://egocore.ai/terms
```
(Перепишите под реальный позиционинг продукта — это шаблон.)

### Keywords (100 chars, через запятую без пробелов)
```
ai,coach,journal,reflection,mindset,growth,wellness,productivity,clarity,goals
```

### Support URL
`https://egocore.ai/support` (создайте страницу, если её ещё нет)

### Marketing URL (опционально)
`https://egocore.ai/`

### Copyright
`© 2026 EgoCore`

## App Review Information
- **Sign-in required**: Yes если на сайте логин обязателен
- **Demo Account**: email + пароль тестового аккаунта
- **Contact**: ваше имя, email, телефон (для срочной связи с review-команды)
- **Notes**: см. `APPLE_REVIEW_GUIDE.md` — критично против отказа по 4.2.

## Version Release
- **Manually release this version** (рекомендую) — релиз нажмёте сами после Approved.

## Screenshots
Чек-лист — `SCREENSHOTS_CHECKLIST.md`. Минимум обязательны:
- **6.7"** iPhone 15 Pro Max — 1290×2796 (или 1320×2868 для 16 Pro Max)
- **6.5"** iPhone 11 Pro Max — 1242×2688
- **5.5"** iPhone 8 Plus — 1242×2208 (всё ещё требуется для старых приложений; для новых submission может быть необязателен)
- **iPad 12.9"** — 2048×2732 (если поддерживаете iPad; если не поддерживаете — в Xcode уберите iPad как target)
