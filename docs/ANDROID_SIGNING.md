# Подпись Android APK / AAB

## 1. Создайте upload keystore (один раз!)

```bash
keytool -genkey -v -keystore egocore-upload.keystore \
  -alias egocore -keyalg RSA -keysize 2048 -validity 10000
```

Заполните данные (CN можно `EgoCore`, OU/Organization — название компании).

**КРИТИЧНО**:
- Сохраните файл `egocore-upload.keystore` в безопасном месте (1Password, iCloud Keychain, шифрованный USB).
- Запишите оба пароля.
- Без этого keystore вы НЕ сможете публиковать обновления приложения (только удалять и создавать новое с новым package name).

## 2. Создайте `android/key.properties` (не коммитьте!)

```properties
storeFile=../../egocore-upload.keystore
storePassword=ВАШ_ПАРОЛЬ_KEYSTORE
keyAlias=egocore
keyPassword=ВАШ_ПАРОЛЬ_АЛИАСА
```

Файл уже в `.gitignore`.

## 3. Настройте подпись в `android/app/build.gradle`

Откройте `android/app/build.gradle` и **в начале файла** (перед `android {}`) добавьте:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Затем **внутри блока `android { ... }`** добавьте `signingConfigs` и измените `buildTypes.release`:

```gradle
android {
    // ... existing config ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

## 4. Сборка release AAB

```bash
npm run sync:android
cd android
./gradlew bundleRelease
```

Результат: `android/app/build/outputs/bundle/release/app-release.aab` — этот файл загружается в Play Console.

Чтобы проверить, что подпись валидна:
```bash
jarsigner -verify -verbose -certs app-release.aab
```

## 5. Google Play App Signing (рекомендуется)

При первой загрузке AAB Play Console предложит **opt-in в Play App Signing** — соглашайтесь. Google будет хранить **final signing key** у себя, а ваш keystore станет **upload key**. Это значит:
- Если потеряете upload key, Google поможет сбросить его через support.
- Final signing key никогда не покинет Google-инфру.

## 6. Версионирование

В `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "ai.egocore.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1
    versionName "1.0.0"
}
```

- **versionCode** — увеличивайте на 1 при каждом релизе (1, 2, 3, ...)
- **versionName** — semver (1.0.0, 1.0.1, 1.1.0, ...)
