# Push Notifications — настройка APNs (iOS) и FCM (Android)

Самый простой путь — единый бэкенд через **Firebase Cloud Messaging (FCM)**, который проксирует пуши и на iOS, и на Android. Так у вас один API для отправки.

## 1. Firebase проект

1. https://console.firebase.google.com/ → **Add project** → `EgoCore`.
2. Включите Google Analytics (опционально).

## 2. iOS — APNs ключ

1. Apple Developer → **Keys → +** → название `EgoCore Push`, отметьте **Apple Push Notifications service (APNs)** → Continue → Register → **скачайте `.p8`** (только один раз!).
2. Запишите **Key ID** (под названием) и **Team ID** (Membership).
3. Firebase Console → ваш проект → **Settings (шестерёнка) → Project settings → Cloud Messaging → Apple app configuration**.
4. Загрузите `.p8`, введите Key ID и Team ID.

## 3. iOS — добавьте iOS-app в Firebase
1. Project settings → **Your apps → Add app → iOS**.
2. Bundle ID: `ai.egocore.app`, App nickname: `EgoCore iOS`.
3. Скачайте `GoogleService-Info.plist` → положите в `ios/App/App/GoogleService-Info.plist`.
4. В Xcode добавьте его в проект (drag & drop в navigator под App, отметьте "Copy items if needed", Target: App).

**Если используете Firebase только для FCM**, нативный код можно НЕ добавлять — наш плагин `@capacitor/push-notifications` работает напрямую с APNs через iOS API, а FCM использует APNs внутри.

Если хотите получать **FCM-токен** на устройстве (а не нативный APNs token) — установите дополнительно:
```bash
npm install @capacitor-firebase/messaging
npx cap sync ios
```
И добавьте `pod 'FirebaseMessaging'` через `pod install`.

## 4. Android — добавьте Android-app в Firebase
1. Project settings → **Add app → Android**.
2. Package name: `ai.egocore.app`.
3. Скачайте `google-services.json` → положите в `android/app/google-services.json`.
4. В `android/build.gradle` (project level) добавьте в `dependencies` блока `buildscript`:
   ```gradle
   classpath 'com.google.gms:google-services:4.4.2'
   ```
5. В `android/app/build.gradle` (в конце файла):
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```
6. `npm run sync:android` → пересоберите.

## 5. Тестовый push

### Из Firebase Console
1. **Cloud Messaging → Send your first message** → текст, target — ваше iOS/Android приложение.
2. Получите токен устройства из логов приложения (мы выводим его в `console.log('Push token:', ...)` в `www/index.html`).
3. Send test message → введите токен.

### Через FCM HTTP v1 API (для бэкенда)
```bash
curl -X POST https://fcm.googleapis.com/v1/projects/PROJECT_ID/messages:send \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "DEVICE_TOKEN",
      "notification": {
        "title": "EgoCore",
        "body": "You have a new insight"
      },
      "data": {
        "url": "https://egocore.ai/inbox"
      }
    }
  }'
```

`data.url` — наша обёртка перехватывает поле `url` в payload (см. `www/index.html`) и переходит туда внутри приложения.

## 6. Передача токена на бэкенд

В `www/index.html` уже подготовлен hook:
```js
PushNotifications.addListener('registration', (token) => {
  fetch('https://egocore.ai/api/push/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.value, platform: Capacitor.getPlatform() })
  });
});
```
Раскомментируйте и реализуйте endpoint `/api/push/register` на бэкенде сайта, чтобы хранить токен → user mapping.

**Важно**: при использовании `server.url` сайт загружается напрямую и наш `www/index.html` не выполняется. Чтобы push-логика работала, либо:
- (a) добавьте такой же скрипт в html самого сайта (загрузите `@capacitor/push-notifications` через CDN или встройте в bundle),
- (b) перенесите регистрацию в **нативный код** (AppDelegate.swift / MainActivity.java) — мы оставили хуки для этого.

**Рекомендация**: вариант (a) проще, добавьте 10 строк JS в head сайта с условием `if (window.Capacitor?.isNativePlatform)`.
