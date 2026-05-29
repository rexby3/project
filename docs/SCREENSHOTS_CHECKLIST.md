# Скриншоты для сторов — чек-лист

## App Store Connect

iOS требует скриншоты как минимум для **одного** размера iPhone. Один размер достаточен для submit, но рекомендую **два** для лучшего отображения на всех устройствах.

### Обязательные размеры
| Устройство | Pixel size | Используется для |
|---|---|---|
| iPhone 6.7"/6.9" (15/16 Pro Max) | 1290×2796 или 1320×2868 | iPhone 15/16 Pro Max, 14 Plus, 15/16 Plus |
| iPhone 6.5" (XS Max/11 Pro Max) | 1242×2688 или 1284×2778 | старые iPhone Pro Max |
| iPhone 5.5" (8 Plus) | 1242×2208 | необязательно для новых submission (с 2023) |
| iPad Pro 12.9" (3rd gen+) | 2048×2732 | если поддерживаете iPad |

Количество: 1-10 на каждый размер.
Формат: PNG или JPEG, RGB, без альфа-канала.
Можно добавить **App Preview видео** (15-30 сек, mp4/mov).

### Где взять
- **Реальные**: запустите приложение в Xcode Simulator → выберите нужное устройство → Cmd+S (screenshot).
- **Маркетинговые мокапы**: https://app-mockup.com/, https://previewed.app/, Figma + community templates.

## Google Play Console

### Обязательные графики
| Asset | Размер | Формат |
|---|---|---|
| App icon | 512×512 | 32-bit PNG, alpha |
| Feature graphic | 1024×500 | PNG/JPEG |
| Phone screenshots | min 320 px, max 3840 px, 16:9 или 9:16 | PNG/JPEG, 2-8 шт |
| 7" tablet | min 320 px | 1-8 шт (опционально) |
| 10" tablet | min 320 px | 1-8 шт (опционально) |

Промо-видео — YouTube link (опционально).

## Идеи для 5 ключевых скриншотов

1. **Hero**: главный экран сайта с текстом-overlay "Your AI for self"
2. **Conversation**: пример AI-диалога
3. **Feature 1**: ключевая фича продукта (журнал / прогресс / план)
4. **Feature 2**: персонализация / приватность
5. **Social proof / numbers**: "Trusted by 10,000 users" или цитаты

## Шаблон Feature Graphic (1024×500) для Google Play

Тёмный градиент фон (#0B0B0F → #1a1633), слева — логотип-плашка 256×256 с буквой E (см. resources/icon.png), справа — крупный текст:

```
EgoCore
Your AI for self.
```

Подзаголовок шрифтом мельче: `Reflect. Plan. Grow.`

Можно собрать в Figma или Canva (есть готовые шаблоны "Google Play Feature Graphic").

## Авто-генерация скриншотов (опционально)

Если хотите автоматизировать через CI:
- iOS: **fastlane snapshot** (https://docs.fastlane.tools/actions/snapshot/)
- Android: **fastlane screengrab**
- Кросс-платформа: **Maestro**

Для веб-обёртки обычно проще сделать скриншоты руками — экранов 5-7 штук, и сайт меняется чаще обёртки.
