# Deep Links / Universal Links / App Links

Чтобы ссылки `https://egocore.ai/...` открывались в приложении (а не в Safari/Chrome), нужно положить **два файла на сайт** и подтвердить владение доменом.

## iOS — Universal Links

### 1. Файл на сайте
Путь: **https://egocore.ai/.well-known/apple-app-site-association**
(никаких редиректов, HTTPS, Content-Type: `application/json`)

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.ai.egocore.app",
        "paths": [
          "*"
        ]
      }
    ]
  }
}
```

`TEAMID` — ваш Apple Team ID (10 символов, видно в Apple Developer → Membership).

### 2. В Xcode
Signing & Capabilities → **+ Capability → Associated Domains** → добавьте:
```
applinks:egocore.ai
```

### 3. Проверка
```bash
curl -I https://egocore.ai/.well-known/apple-app-site-association
# Должен быть Content-Type: application/json, HTTP/2 200, без редиректов
```
В iOS-симуляторе: Notes → впишите `https://egocore.ai/about` → long-press → Open in EgoCore.

## Android — App Links

### 1. Получите SHA-256 fingerprint вашего upload-keystore
```bash
keytool -list -v -keystore egocore-upload.keystore -alias egocore | grep SHA256
```
Скопируйте hex-строку (типа `AA:BB:CC:...`).

**И/ИЛИ** возьмите fingerprint Google Play App Signing:
Play Console → ваше приложение → **Setup → App integrity → App signing key certificate** → SHA-256.
(Рекомендую использовать оба ключа — upload и Play signing.)

### 2. Файл на сайте
Путь: **https://egocore.ai/.well-known/assetlinks.json**
(HTTPS, Content-Type: `application/json`, без редиректов)

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ai.egocore.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

Если используете несколько ключей, добавьте все SHA-256 в массив.

### 3. Уже настроено в манифесте
В `android/app/src/main/AndroidManifest.xml` есть intent-filter с `autoVerify="true"` на `https://egocore.ai`. Android при первой установке сходит за `assetlinks.json` и при успешной проверке начнёт автоматически открывать ссылки в приложении.

### 4. Проверка
```bash
adb shell pm get-app-links ai.egocore.app
# Должна быть строка "egocore.ai: verified"
```
Google's tool: https://developers.google.com/digital-asset-links/tools/generator

## Где разместить файлы на egocore.ai

Если egocore.ai на Next.js/Vercel — положите файлы в:
```
public/.well-known/apple-app-site-association
public/.well-known/assetlinks.json
```
И добавьте route или `next.config` chunk, чтобы AASA отдавался без расширения с `Content-Type: application/json`. Пример для Next.js:

```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
};
```

Для Cloudflare/обычного hosting — просто загрузите файлы по этим путям и убедитесь, что MIME выставлен правильно.
