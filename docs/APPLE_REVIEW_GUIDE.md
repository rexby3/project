# Прохождение Apple Review — критично для WebView-обёртки

Apple guideline **4.2 Minimum Functionality** — основная причина отказа для веб-обёрток. Reviewer считает, что приложение "ничего не делает кроме как открывает сайт".

## Что мы уже сделали в обёртке

1. **Push Notifications** (`@capacitor/push-notifications`) — нативная функция, которой нет на сайте в браузере
2. **Face ID / Touch ID** (`@capgo/capacitor-native-biometric`) — нативный re-auth
3. **Universal Links** — нативный диспетчер deep-link'ов
4. **Network status + offline fallback** — нативное поведение при потере связи
5. **Native splash + iconography** — собственная брендовая идентичность
6. **Status bar / safe area** — нативное оформление

Этого достаточно для большинства review-команд, но обязательно **продемонстрируйте это в App Review Notes**.

## Шаблон App Review Notes

Вставьте этот текст в **App Store Connect → App Review Information → Notes**:

```
EgoCore is a native iOS application that provides exclusive functionality
beyond a web-only experience:

1. Native Push Notifications via APNs — users get reminders, follow-ups
   and new-message alerts that are NOT available via the website.
   Test: log in with the demo account, allow notifications when prompted.
   We will trigger a test push within 5 minutes — please verify it arrives.

2. Biometric Authentication (Face ID / Touch ID) — users can lock the app
   so that re-opening requires biometric re-auth.
   Test: in Settings → Privacy & Security inside the app, enable
   "Lock with Face ID", then background and reopen the app.

3. Universal Links — tapping https://egocore.ai/share/* links anywhere in
   iOS opens directly inside the EgoCore app.

4. Native offline experience — when the device is offline, a native
   fallback screen is shown with a retry action.

5. Account deletion is supported in-app at
   Settings → Account → Delete Account, fulfilling guideline 5.1.1(v).

Demo account:
  Email:    review@egocore.ai
  Password: <PASSWORD>

Contact for questions:
  Name:  <YOUR NAME>
  Email: hi@egocore.ai
  Phone: <YOUR PHONE>

Thank you for the review.
```

## Если всё-таки пришёл reject 4.2

1. **Прочитайте Resolution Center внимательно** — Apple обычно указывает конкретно, чего им не хватает.
2. **Не спорьте сразу** — добавьте ещё одну сильную нативную функцию (например, Share Extension или Widget) и переподайте.
3. Если уверены, что отказ ошибочный — **Reply** в Resolution Center или **Request Appeal** на App Review Board.

## Другие частые причины отказа и как их избежать

| Guideline | Причина | Что сделать |
|---|---|---|
| 5.1.1(v) | Нет удаления аккаунта в приложении | Сделать `https://egocore.ai/account-delete`, добавить ссылку из приложения |
| 2.1 | Краши при тесте | Тщательно потестируйте на TestFlight |
| 2.3.10 | Упоминание Android / других платформ в скриншотах | Удалите упоминания, оставьте только iOS |
| 4.0 | Низкое качество дизайна / битые элементы | Проверьте все экраны на 6.7" и iPad |
| 5.1.1 | Запрос permission без объяснения | Уже добавлены NSFaceIDUsageDescription, NSCameraUsageDescription и т.д. |
| 3.1.1 | Платная подписка не через Apple IAP | Если у вас есть подписки на сайте — либо удалите кнопки покупки в WebView для iOS, либо подключите Apple IAP |

## Особое внимание: подписки

Если на egocore.ai есть платные тарифы:
- **Apple требует IAP** для любого digital-контента. Webview-кнопка "Купить" может вызвать reject.
- Варианты:
  1. Скрыть кнопки покупки в WebView только для iOS (детект `Capacitor.getPlatform() === 'ios'` через UA-сниффинг или дополнительный заголовок).
  2. Подключить Apple In-App Purchase через плагин `@revenuecat/purchases-capacitor` или нативно.
  3. Использовать "External Link Account" (Apple разрешает это в некоторых категориях с 2024) — но это серая зона.
