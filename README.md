# EgoCore Mobile App

Нативная обёртка сайта **https://egocore.ai/** на базе [Capacitor 7](https://capacitorjs.com/) — одна кодовая база для iOS и Android.

---

## Архитектура

- **WebView-обёртка**: приложение грузит `https://egocore.ai/` напрямую через `server.url` в `capacitor.config.ts`. Любое обновление сайта мгновенно доступно в приложении без релиза.
- **Локальный shell** `www/index.html` — небольшая offline-страница на случай отсутствия сети.
- **Нативные плагины**:
  - `@capacitor/push-notifications` — пуши (APNs / FCM)
  - `@capgo/capacitor-native-biometric` — Face ID / Touch ID / отпечаток
  - `@capacitor/app`, `@capacitor/network`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/browser`
- **Deep / Universal Links**: `https://egocore.ai/*` открывается в приложении.

---

## Требования

| Платформа | Что нужно |
|---|---|
| iOS | macOS, Xcode 15+, Apple Developer аккаунт ($99/год), CocoaPods (`sudo gem install cocoapods`) |
| Android | Android Studio (Hedgehog или новее), JDK 17, Google Play Console аккаунт ($25 один раз) |
| Общее | Node.js 20+, npm 10+ |

---

## Быстрый старт (после клонирования)

```bash
npm install
npm run icons          # пересоздаёт иконки и сплэши из resources/ (опционально)
npm run sync           # копирует www/ и конфиг в native проекты
npm run open:ios       # открывает Xcode
npm run open:android   # открывает Android Studio
```

---

## Часть 1. Подготовка к Apple App Store

### 1.1. Apple Developer Account
1. Войдите на https://developer.apple.com/account/
2. Убедитесь, что подписка Apple Developer Program активна ($99/год).
3. В **Certificates, Identifiers & Profiles → Identifiers** нажмите **+**:
   - Тип: **App IDs → App**
   - Description: `EgoCore`
   - Bundle ID: **Explicit** = `ai.egocore.app`
   - Capabilities: включите **Push Notifications**, **Associated Domains**, **Sign in with Apple** (если нужно).

### 1.2. APNs ключ (для пушей)
1. **Keys → +** → название `EgoCore Push`, отметьте **Apple Push Notifications service (APNs)**.
2. Скачайте `.p8` файл (доступен только 1 раз!).
3. Запишите **Key ID** и **Team ID**.
4. Загрузите ключ в Firebase Console (см. `docs/PUSH_NOTIFICATIONS_SETUP.md`).

### 1.3. App Store Connect
1. https://appstoreconnect.apple.com/ → **My Apps → +**.
2. Platforms: **iOS**, Name: `EgoCore`, Primary Language: English (или русский), Bundle ID: `ai.egocore.app`, SKU: `egocore-app-001`.
3. Заполните разделы из `docs/APP_STORE_LISTING.md`.

### 1.4. Сборка в Xcode
1. На Mac в проекте: `npm run open:ios`.
2. В Xcode выберите проект **App** → Signing & Capabilities:
   - Team: ваш Apple Developer аккаунт
   - Bundle Identifier: `ai.egocore.app`
   - Включите capabilities: **Push Notifications**, **Background Modes → Remote notifications**, **Associated Domains** = `applinks:egocore.ai`
3. Установите CocoaPods зависимости:
   ```bash
   cd ios/App && pod install && cd ../..
   ```
4. Bump версии: в `ios/App/App.xcodeproj` через **General → Identity** или прямо в `project.pbxproj` (`MARKETING_VERSION` = 1.0.0, `CURRENT_PROJECT_VERSION` = 1).
5. **Product → Archive** (целевой Any iOS Device (arm64)).
6. После архивации Organizer: **Distribute App → App Store Connect → Upload**.
7. Через 10-30 минут билд появится в App Store Connect → TestFlight.

### 1.5. TestFlight тестирование
1. App Store Connect → ваше приложение → **TestFlight**.
2. Добавьте Internal Testers (email от вашей команды) — доступ без review.
3. External Testing требует Beta App Review (~24 часа).

### 1.6. Submit for Review
1. **App Store → iOS App → 1.0 Prepare for Submission**.
2. Заполните **App Review Information**:
   - Sign-in info (тестовый аккаунт, если требуется логин)
   - Notes: критичный пункт против отклонения, шаблон в `docs/APPLE_REVIEW_GUIDE.md`
3. Submit. Review обычно занимает 24-48 часов.

---

## Часть 2. Подготовка к Google Play

### 2.1. Google Play Console
1. https://play.google.com/console/ → создайте аккаунт ($25 один раз).
2. **Create app** → название `EgoCore`, язык по умолчанию, тип: **App**, бесплатное.
3. Заполните **Dashboard → All tasks** (анкеты Content rating, Target audience, Data safety, Privacy policy).

### 2.2. Signing key
Сгенерируйте upload keystore (один раз):
```bash
keytool -genkey -v -keystore egocore-upload.keystore \
  -alias egocore -keyalg RSA -keysize 2048 -validity 10000
```
**Сохраните keystore и пароли в безопасном месте — без них вы не сможете обновлять приложение.**

Создайте `android/key.properties` (он в `.gitignore`):
```properties
storeFile=../../egocore-upload.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=egocore
keyPassword=YOUR_KEY_PASSWORD
```

В `android/app/build.gradle` добавьте signing config (см. `docs/ANDROID_SIGNING.md`).

### 2.3. Сборка release AAB
```bash
npm run sync:android
cd android
./gradlew bundleRelease
# Результат: android/app/build/outputs/bundle/release/app-release.aab
```

### 2.4. Загрузка в Play Console
1. **Release → Testing → Internal testing → Create new release**.
2. Загрузите `app-release.aab`, заполните release notes, сохраните, начните rollout.
3. Добавьте тестовую группу (свой email).
4. Получите opt-in ссылку, установите приложение через неё.

### 2.5. Production
1. После internal-тестирования: **Release → Production → Create new release**.
2. Заполните **Store listing** (см. `docs/GOOGLE_PLAY_LISTING.md`):
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon 512×512
   - Feature graphic 1024×500
   - Screenshots (phone + tablet 7"/10")
3. **Data safety**: ответы на анкету (см. `docs/PRIVACY_POLICY_TEMPLATE.md`).
4. **Content rating**: пройдите анкету.
5. **Target audience**: укажите возрастную аудиторию.
6. **App content → Government apps / Ads / News** — если применимо.
7. Submit. Review занимает обычно несколько часов — несколько дней.

---

## Часть 3. Privacy Policy и обязательные документы

Apple и Google требуют **публичный URL** на Privacy Policy на egocore.ai. Шаблон — `docs/PRIVACY_POLICY_TEMPLATE.md`. Минимум:

- https://egocore.ai/privacy
- https://egocore.ai/terms
- https://egocore.ai/account-delete (требование Apple guideline 5.1.1(v) и Google policy с 2024)

---

## Часть 4. Deep Links (Universal Links / App Links)

Чтобы ссылки `https://egocore.ai/...` открывались в приложении, а не в Safari/Chrome — нужно положить два файла на сайт:

- **iOS**: `https://egocore.ai/.well-known/apple-app-site-association`
- **Android**: `https://egocore.ai/.well-known/assetlinks.json`

Шаблоны — `docs/DEEP_LINKS_SETUP.md`.

---

## Часть 5. Версии и обновления

Обновление **самого сайта** не требует ничего — приложение грузит свежий контент при следующем запуске.

Обновление **обёртки** (новые плагины, иконки, нативные фичи):
1. Поднимите версию в:
   - `ios/App/App.xcodeproj` → MARKETING_VERSION / CURRENT_PROJECT_VERSION
   - `android/app/build.gradle` → `versionName` / `versionCode`
2. `npm run sync`
3. Archive в Xcode → upload в App Store Connect.
4. `./gradlew bundleRelease` → upload в Play Console.

---

## Структура проекта

```
.
├── android/                 # нативный Android проект (Gradle)
├── ios/                     # нативный iOS проект (Xcode)
├── www/                     # offline-fallback shell (HTML)
├── resources/               # исходники иконки и сплэша 1024+ px
├── scripts/                 # вспомогательные node-скрипты
├── capacitor.config.ts      # центральная конфигурация
├── package.json
└── docs/                    # шаблоны и чек-листы для сторов
    ├── APP_STORE_LISTING.md
    ├── GOOGLE_PLAY_LISTING.md
    ├── APPLE_REVIEW_GUIDE.md
    ├── DEEP_LINKS_SETUP.md
    ├── PRIVACY_POLICY_TEMPLATE.md
    ├── PUSH_NOTIFICATIONS_SETUP.md
    ├── ANDROID_SIGNING.md
    └── SCREENSHOTS_CHECKLIST.md
```
