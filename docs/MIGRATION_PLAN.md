# WallyMates iOS — план полной миграции с Android

> Составлен 2026-10-07 по исходникам Android `C:\projects\worldmates` (vc84 / 1.64.0)
> и текущему iOS `C:\projects\ios-messenger` (Expo 52 / RN 0.76, последний коммит 2026-07-29).
> Этот файл одновременно план и трекер: по мере переноса отмечаем статус прямо здесь.

**Легенда статусов:** ✅ перенесено · 🟡 частично / только UI-заглушка · ⬜ не начато ·
💰 нужен платный Apple Developer ($99/год) · 🍎 на iOS иначе / невозможно, нужна замена

---

## 0. Что есть на старте

### 0.1 Объём Android
| Что | Сколько |
|---|---|
| Kotlin-файлов | 559 (~213 000 строк) |
| Activity (экранов верхнего уровня) | 57 |
| REST-эндпоинтов (Retrofit) | ~450 в 23 интерфейсах `Node*Api` |
| Socket.IO событий | ~120 |
| Строк локализации | 5 139 × 3 языка (en/ru/uk) |
| Тем оформления | 40 `ThemeVariant` + стили пузырей, анимации, анимированные фоны |
| Шрифтов | 25 (res/font) |
| Звуков | 19 WAV (9 уведомлений + 8 in-chat + 2 lottie-набора) |
| Lottie | 16 (талисман Shitzu, эмоции, лоадер) |

### 0.2 Что уже есть в iOS (≈18 000 строк TS)
- ✅ Авторизация: сплэш, выбор языка, логин, регистрация, восстановление пароля, верификация кода, подтверждение нового устройства.
- ✅ Список чатов (личные), экран сообщений (текст, редактирование, удаление, typing, seen, подгрузка истории).
- ✅ E2EE личных чатов v6 (Static X3DH + AES-256-GCM), self-sync, кеш расшифрованного — порт с Windows, сверено с Android.
- ✅ Socket.IO (только websocket — из-за PM2 cluster), presence, device service.
- ✅ Дизайн-токены Classic перенесены, i18n en/ru/uk (391 ключ), Sandbox UI v4 (частично).
- 🟡 Звонки, Истории, Группы, Каналы, Профиль, Настройки — **только вёрстка без API** (заглушки).
- 🟡 Поиск, Сохранённые, Заметки, Групповой чат — экраны-плейсхолдеры «Скоро».
- ✅ CI: GitHub Actions собирает неподписанный .ipa → Sideloadly.

**Итог: перенесено ~5–7% функциональности.** Всё остальное — ниже.

### 0.3 ⚠️ Срочное, до начала работы
1. **Репозиторий `dncdante911/IOS-mess` публичный, а в `src/constants/api.ts` закоммичены `SERVER_KEY` и `SITE_ENCRYPT_KEY` открытым текстом** (с первого коммита `0cf0cf72`). **Проверено: это тот же ключ, что в Android `local.properties` — он живой. Ротировать на сервере; из кода iOS он уже убран (2026-10-07), но остаётся в истории git. Дальше секреты в iOS только через `app.config.ts` + EAS/GitHub Secrets + обфускация как в Android `SecretsProvider`, но не в git.
2. В рабочей копии удалён (не закоммичен) старый `IOS_PORTING_ROADMAP.md`. Этот файл его заменяет; правила из старого (никаких захардкоженных строк и цветов) сохранены в §2.

---

## 1. Ключевые решения

### 1.1 Стек: остаёмся на React Native + Expo (prebuild), НЕ переписываем на Swift
Почему:
- **Нет Mac.** Swift/SwiftUI без Xcode — это только CI-сборки вслепую. RN-код можно гонять на Windows: `npx expo run:android` в эмуляторе Android — тот же JS, 90% UI и логики проверяется без iOS. На iOS (через CI → Sideloadly) проверяется только платформенное.
- **Windows-клиент на TypeScript** (`C:\projects\windows-messenger`, ~77 000 строк) — уже готовая TS-реализация почти всей бизнес-логики: `api.ts` (352 функции, 6 045 строк), `e2ee.ts`, `signalService.ts`, `senderKeyService.ts`, `groupE2EE.ts`, `socket.ts`, `types.ts` (1 240 строк), `i18n.ts`. Её переносим почти дословно, заменив браузерные API (`localStorage`, `crypto.subtle`, IndexedDB). Это экономит месяцы.
- **Эталон поведения — Android**, эталон TS-кода — Windows. При расхождении верим Android и проверяем бэкенд в `C:\projects\nodejs`.

### 1.2 Разработка без платного Apple-аккаунта: что отваливается
Бесплатный Apple ID + Sideloadly: профиль живёт 7 дней, нет push, нет VoIP, нет associated domains, нет App Groups (нужны для расширений).

| Функция | Без $99 | С $99 |
|---|---|---|
| Push-уведомления (APNs) | ❌ уведомления только пока приложение открыто | ✅ |
| Входящий звонок при закрытом приложении (PushKit + CallKit) | ❌ | ✅ |
| Расшифровка E2EE прямо в пуше (Notification Service Extension) | ❌ | ✅ |
| Universal links `worldmates.club/...` | ❌ (работает только `worldmates://`) | ✅ |
| Демонстрация экрана (Broadcast Upload Extension) | ❌ | ✅ |
| TestFlight / App Store | ❌ | ✅ |

**Рекомендация:** весь план, кроме пунктов 💰, делаем на бесплатном аккаунте. Подписку берём к фазе 4 (уведомления/звонки) — без неё мессенджер на iOS фактически не получает сообщения в фоне.

### 1.3 Фундаментальные отличия iOS, которые меняют архитектуру
- 🍎 **Нет фонового сокета.** `MessageNotificationService` (foreground service, 2 345 строк), `BootReceiver`, `ServiceRestartReceiver`, `ServiceWatchdogWorker`, `NotificationKeepAliveManager` — на iOS невозможны. Замена: сокет живёт только пока приложение активно; в фоне — **APNs через FCM** (бэкенд уже шлёт FCM через firebase-admin v14 — достаточно, чтобы iOS регистрировал FCM-токен с `platform: 'ios'`, и загрузить APNs-ключ в Firebase).
- 🍎 **WorkManager → BGTaskScheduler** (`expo-background-task`): запуск не гарантирован. Чистку секретных чатов (`SecretChatCleanupWorker`) делать при каждом старте/возврате приложения + по таймеру внутри, а не полагаться на фон.
- 🍎 **APK-апдейтер** (`update/AppUpdateManager.kt`, 701 строка) — не переносится. Замена: баннер «вышла новая сборка» + ссылка (Sideloadly / TestFlight).
- 🍎 **Android AccountManager** (`data/auth/WorldMatesAuthenticator*`) — не нужен; мультиаккаунт хранится в Keychain.
- 🍎 **Платные цифровые товары** (Premium, Stars, платные каналы, донаты): при раздаче через App Store Apple требует In-App Purchase. Пока сайдлоад — оставляем текущие платёжки; перед App Store — отдельная задача (§13).

### 1.4 Нативные модули (добавить в package.json, всё совместимо с Expo prebuild)
| Назначение | Android | iOS (RN) |
|---|---|---|
| БД с шифрованием | Room + SQLCipher | `@op-engineering/op-sqlite` (SQLCipher) |
| Быстрые настройки | DataStore | `react-native-mmkv` (с encryptionKey) |
| Секреты/ключи | Android Keystore, EncryptedSharedPreferences | `expo-secure-store` (Keychain) ✅ уже есть |
| Крипто | BouncyCastle | `@noble/*` ✅ уже есть; при тормозах — `react-native-quick-crypto` |
| 1:1 звонки | Stream WebRTC | `react-native-webrtc` (+ `@config-plugins/react-native-webrtc`) |
| Групповые звонки / эфиры | LiveKit Android | `@livekit/react-native` + `@livekit/react-native-webrtc` |
| CallKit / системный экран звонка | ConnectionService/FGS | `react-native-callkeep` + `react-native-voip-push-notification` 💰 |
| Видео | Media3/ExoPlayer (HLS, DASH) | `expo-video` (HLS нативно; DASH на iOS нет → сервер отдаёт HLS) |
| Аудио/музыка, lock screen | Media3 Session + MusicPlaybackService | `react-native-track-player` |
| Голосовые запись | VoiceRecorder (AAC) | `expo-audio` |
| Камера, кружки, QR | CameraX, ZXing | `react-native-vision-camera` (+ code scanner) |
| Картинки/GIF/WebP | Coil | `expo-image` ✅ уже есть |
| Lottie / .tgs стикеры | lottie-compose | `lottie-react-native` (.tgs = gzip → распаковка через `pako`) |
| Анимированные фоны, эффекты (Thanos, частицы) | Compose Canvas | `@shopify/react-native-skia` + `react-native-reanimated` ✅ |
| Карты, гео | Google Maps + Play Location | `react-native-maps` + `expo-location` |
| WebView (мини-приложения, Instant View) | WebView | `react-native-webview` |
| Сжатие видео | VideoCompressor | `react-native-compressor` |
| Биометрия | BiometricPrompt | `expo-local-authentication` ✅ уже есть |
| Телефоны | libphonenumber | `libphonenumber-js` |
| HTML-парсинг (превью ссылок, статьи) | jsoup | `node-html-parser` |
| Сегментация (виртуальный фон) | ML Kit selfie | нативный модуль на `VNGeneratePersonSegmentationRequest` (свой Expo Module, фаза 10) |
| Шейк, распознавание речи | ShakeDetector, SpeechRecognizer | `expo-sensors`, `expo-speech-recognition` |
| Контакты | ContactsContract | `expo-contacts` |
| Шаринг/сохранение в галерею | FileProvider, GallerySaver | `expo-sharing`, `expo-media-library` |
| Push | FCM | `@react-native-firebase/messaging` 💰 |
| Шрифты | res/font (25) | `expo-font` (бандлим .ttf) |

---

## 2. Правила разработки (обязательны)
1. Никаких захардкоженных строк — только `t('key')`. **Ключи берём те же, что в Android `strings.xml`** — так перенос локализации автоматизируется (§3.4).
2. Никаких захардкоженных цветов — только `useTheme()` / токены.
3. Новый экран = отдельная папка `src/features/<feature>/` (screen + store + api), по аналогии с `ui/<feature>/` Android.
4. Каждый коммит, закрывающий пункт, меняет его статус в этом файле.
5. Проверка: `npm run typecheck` + прогон на Android-эмуляторе (`npx expo run:android`) → CI-сборка .ipa → Sideloadly на iPhone.
6. При любом сомнении в API-контракте — смотреть маршрут в `C:\projects\nodejs`, а не угадывать.

---

## 3. Фаза 1 — Фундамент (ядро, без которого дальше никак)
Оценка: 2–3 недели. **Статус на 2026-10-07: ✅ фаза закрыта в коде; нужна проверка на устройстве (сборка с SQLCipher и ssl-pinning).**

### 3.0 Инструменты переноса (генераторы) — ✅
Перенос идёт не «переписыванием руками», а генерацией из исходников Android/Windows.
Перезапускать после изменений на Android/Windows, результат (`gen/`) руками не править.

| Скрипт | Что делает | Результат |
|---|---|---|
| `scripts/import-android-strings.mjs` | `strings.xml` (en/ru/uk) → TS, те же ключи, `%1$s`→`{1}`, plurals | `src/i18n/generated/*` — 5 172 ключа |
| `scripts/gen-android-api.mjs` | Retrofit-интерфейсы + data class + `Constants.kt` → TS | `src/core/android/gen/*` — 454 метода, 529 моделей, 73 enum |
| `scripts/gen-android-db.mjs` | Room-сущности и DAO → SQLCipher-БД | `src/core/db/gen/*` — 8 таблиц, 7 DAO |
| `scripts/port-windows-api.mjs` | Windows `api.ts` → RN (fetch, UploadFile, refresh) | `src/core/api.ts` — 341 функция |

Как пишется перенесённый с Android код:
```ts
// Kotlin: val r = NodeRetrofitClient.profileApi.getUserRating(userId)
//         if (r.apiStatus == 200) showKarma(r.rating?.karma)
import { NodeRetrofitClient } from '@/core/android';
const r = await NodeRetrofitClient.profileApi.getUserRating(userId);
if (r.apiStatus === 200) showKarma(r.rating?.karma);
```
Поля ответа — Kotlin-имена (camelCase), разбор JSON повторяет Gson (`core/android/gson.ts`:
`@SerializedName`, дефолты data class, `"12"`→12, enum по имени, ручные адаптеры
`ReactionsListDeserializer`/`LastMessageDeserializer`/backup-enum в `adapters.ts`).

### 3.1 Сетевой слой
- ✅ Windows `api.ts` → `src/core/api.ts` (341 функция): Electron IPC → fetch, File/Blob → `UploadFile {uri,name,type}` (RN стримит с диска), ручной `buildForm` (URLSearchParams в RN сломан), тосты → `core/platform/events`.
- ✅ Android Retrofit-зеркало `src/core/android` + `NodeRetrofitClient` с теми же свойствами (`api`, `groupApi`, `channelApi`, `profileApi`, …).
- ✅ Три базы как на Android: Node `:449` (`access-token` + `Accept-Language`), Strapi `cdn.worldmates.club` (`Bearer` токен — стикеры/эмодзи/GIF-паки), GIPHY.
- ✅ Медиа: загрузка multipart через бэкенд в **MinIO S3**; относительные пути → `absMediaUrl()`.
- ✅ Обновление токена при 401 — **одна** точка `core/session.ts → Session.refresh()` для всех трёх слоёв (axios, core/api, core/android). Раньше axios обновлял сам — при ротации refresh-токена параллельные обновления выбили бы сессию.
- ✅ Секреты: убраны из кода (публичный репо!), `app.config.js` шифрует AES-256-GCM как Android `build.gradle`, `security/secretsProvider.ts` расшифровывает; CI берёт из GitHub Secret `IOS_SECRETS_JSON`.
- ✅ `ServerFailoverManager` (порт Windows, на `core/platform/kv`).
- ✅ PHP-клиент не нужен: на Android `RetrofitClient` (PHP) удалён, всё через Node. Единственные `/api/v2/*` (история звонков) идут по абсолютному пути от `:449` с `access_token` — ровно как Retrofit на Android.
- 🟡 `ProxyConfigHolder` — хранение/синхронизация как на Android (`core/network.ts`); 🍎 применение прокси к запросам требует нативного модуля (`URLSessionConfiguration.connectionProxyDictionary`) — фаза 9.
- ✅ `NetworkQualityMonitor` (те же пороги и пинг `/api/health`, режимы FULL/THUMBNAILS/NONE, размер пачки), `NetworkTypeDetector` — `core/network.ts` на `@react-native-community/netinfo`. На iOS нет полосы `linkDownstreamBandwidthKbps` → оценка по типу сети/поколению сотовой связи; роуминг iOS не сообщает.
- ✅ `ErrorHandler` + `Result` (`core/errors.ts`, те же строки ошибок); `CrashReporter` + отправка при появлении сети (`core/crashReporter.ts`, `api/node/crash-report` + CRASH_SECRET). Нативные падения ObjC/Swift JS не ловит.
- ✅ Cert pinning (`core/certPinning.ts`, TrustKit): Root YR + ISRG Root X1 + YR2 + текущие leaf, сверено с живыми сертификатами. ⚠️ **В Android leaf-пины устарели** (`WLb9fS…`, `Weu6ei…` — сертификаты перевыпущены, промежуточный YR1→YR2) — Android жив только за счёт пина Root YR; обновить при следующем релизе Android.
- ⬜ Старые `src/api/*.ts` (axios) постепенно заменить вызовами `core/android` по мере переноса экранов.

### 3.2 Сессия и мультиаккаунт
- ✅ `core/session.ts` — синхронный `Session.accessToken` (аналог `UserSession.accessToken` для интерсепторов), подписка на смену токена.
- ✅ `core/platform/kv.ts` — синхронный KV (замена `localStorage`/SharedPreferences для не-секретных настроек), гидратация при старте.
- ✅ `UserSession` (`core/session.ts`) — все поля Android (PRO, срок PRO, registeredAt/isNewUser, canUseAnimatedBackground, статус-эмодзи/текст, баланс Stars, подписки на изменения), `saveSession`/`updateTokens`/`clearSession`, проактивный refresh за 60 с до истечения.
- ✅ `AccountManager` (`core/accountManager.ts`): 5/10 аккаунтов, добавление без переключения, переключение (токены аккаунта из Keychain, E2EE и сокет — под новый аккаунт), удаление, полный выход с очисткой кешей, синхронизация ротированного токена. Все исправления Android 2026-07-12/07-20/08-18 учтены.
- ✅ **Ключи E2EE раздельно на каждый аккаунт** (`setE2EEAccount`) — на iOS раньше была одна identity на устройство; ключи текущего аккаунта не переименовываются (защита истории). ⚠️ Осознанное отличие от Android: при выходе ключи E2EE НЕ стираются (именно это на Android 27.07.2026 уничтожило историю).
- ⬜ UI свичера аккаунтов (`AccountSwitcherDialog`) — фаза 3.
- ✅ `UserPreferencesRepository`, `CachePreferences`, `PerformanceManager` (`core/prefs.ts`), `StorageManager` (`core/storageManager.ts` — разбивка места и очистка для «Данные и память»).
- ✅ `WMApplication.onCreate()` → `core/app.ts`: тот же порядок инициализации, передний/фоновый план, хуки для «воркеров» (на iOS фон не гарантирован → задачи при выходе на передний план).

### 3.3 Локальная БД (offline-режим)
- ✅ `expo-sqlite` + SQLCipher (`app.json → useSQLCipher: true`), ключ 32 байта в Keychain — аналог `DatabaseKeyManager`.
- ✅ Все таблицы Room: `accounts`, `drafts`, `cached_messages`, `cached_chats`, `cached_channels`, `cached_channel_posts`, `chat_wallpapers`, `signal_plaintext_cache` + индексы; `AppDatabase.messageDao()` и т.д. с теми же методами; `Flow` → `LiveQuery.subscribe()`.
- ⚠️ Проверить на устройстве: что сборка с SQLCipher проходит в CI (`expo prebuild --clean`).
- ⬜ Offline: чтение + очередь отправки для 1:1 и каналов (логика `MessagesViewModel`/`ChatsViewModel`).

### 3.4 Локализация
- ✅ 5 172 ключа Android × en/ru/uk, `t(key, [args])` и `tp(key, count)` (плюралы uk/ru/en по CLDR). Android-строки перекрывают ручные — текст 1:1 как на Android.
- ✅ `LanguageManager` (флаги, самоназвания, `isLanguageSelected`); язык по умолчанию — украинский, как на Android (в iOS был русский).

### 3.5 Сокет — полное покрытие событий
- ✅ Все серверные события пробрасываются через `socket.onAny()` (раньше слушалось 55 из ~90). Каталог — `core/socket/events.ts` (`SocketIn` 90 / `SocketOut` 33).
- ✅ `token_expired` → refresh → повторный `join` с новым токеном; `connect()` больше не авторизует старым токеном.
- ✅ Переподключение без лимита попыток с адаптивной задержкой по качеству сети (как Android; iOS раньше сдавался после 5 попыток), принудительно — при возврате из фона и появлении сети (дебаунс 5 с), с проактивным refresh токена.
- ⬜ Обработчики звонков (`call:*`, `ice:*`) — фаза 8; групп/каналов (`group_*`, `channel:*`) — фазы 5–6.

---

## 4. Фаза 2 — Дизайн-система (чтобы всё дальше сразу было «как на Android»)
Оценка: 2–3 недели. Источник: `ui/theme/*`, `ui/preferences/*`, `ui/fonts/*`. **Статус на 2026-10-07: ✅ закрыта в коде; проверка на устройстве.**

Генератор: `scripts/gen-android-theme.mjs` → `src/theme/gen/` (50 тем + палитры + градиенты, 59 базовых цветов `Colors.kt`, 15 пресетов фона, 27 готовых паков, ключи локализованных названий).

- ✅ Компоненты Material 3 — `react-native-paper` (тот же набор, что Compose M3: кнопки, свитчи, радио, диалоги, поля, AppBar). Тема Paper собирается из нашей схемы (`toPaperTheme`), уровни elevation → роли `surfaceContainer*`, как в Compose BOM 2026.
- ✅ `Theme.kt` → `src/theme/wmTheme.ts`: `createLight/DarkColorScheme` тем же алгоритмом (тональные поверхности = нейтральная основа + доля основного цвета), `ExtendedColors`, `effectiveDark` (prefersDark=false → всегда светлая).
- ✅ Все **50** `ThemeVariant` (в плане было 40 — на Android их уже 50), PRO/подписка, светлые/тёмные; `CYBERPUNK` скрыт из выбора, как на Android. `MATERIAL_YOU` скрыт (на iOS нет цветов обоев — Android тоже скрывает его на < 12).
- ✅ `Typography.kt` (`WMTypography`, `WMTextStyles`), `Shapes.kt` (`Shapes`, `WMShapes`), `WMTokens.kt` (`WMSpacing`, `WMCorners`, пружины `WMMotion` 1:1 из ExpressiveMotionTokens).
- ✅ `ThemeManager` + `ThemeRepository` + `ThemeProfileRepository` (`src/theme/themeManager.ts`): состояние, смена/сброс, системный режим, синхронизация на сервер с дебаунсом, подтягивание один раз на аккаунт, «поделиться кодом»/импорт. iOS использует профиль платформы `android` (бэкенд знает только android|windows; ключи тем/пузырей/фонов у iOS те же) — тема с Android-телефона приезжает на iPhone.
- ✅ Старый `useTheme()` (26 ранних экранов) теперь вычисляется из новой темы — они тоже следуют выбранной теме. Старая палитра на 7 тем (`theme/colors.ts`) удалена.
- ✅ `ThemeOneClickPacks` — 27 паков (бесплатные/PRO), применение одним тапом.
- ✅ 20 стилей пузырей `BubbleStyles.kt` → `components/bubbles/StyledBubble.tsx` (формы, тени, рамки, градиенты; COMIC и FOLDED — контуром на Skia; PULSE/SHIMMER — анимации Reanimated). `AdaptiveBubbleColor` → `theme/adaptiveBubbleColor.ts` (яркость обоев через Skia).
- ✅ 11 анимированных фонов `ChatAnimatedBackground.kt` → Skia Picture на UI-потоке; «случайные» позиции звёзд/частиц через `java.util.Random` с теми же seed — совпадают с Android. `AnimatedBgPrefs`, режим производительности отключает.
- ✅ `DefaultChatBackground` (mesh-градиент + гекс-точки, Skia), `BackgroundImage` (обои 30% / пресет 8% / по умолчанию), градиент темы.
- ✅ Шрифты: 25 шрифтов чата (`@expo-google-fonts`, только нужные начертания, ленивая загрузка), фирменные `AppFonts` (Exo 2 400/700, Russo One, Righteous, Orbitron 700), загрузка своего шрифта по URL, `SenderFontCache` (шрифт отправителя у других), 34 Unicode-стиля `FontStyle`/`FontStyleConverter`.
- ✅ `UIStylePreferences` (стиль списка, пузыри, быстрая реакция, вид каналов, шрифт, свои шрифты, онбординг), `AppModePreferences` (FULL/LITE), `SandboxPreferences` (4 тапа).
- ✅ Общие компоненты: `WMToast` + хост (тосты ядра тоже через него), `WMLoadingIndicator`/`WMBouncingDots`/`WMFullScreenLoading`/`WMInlineLoader`, `WMLoadingAnimation` (эквалайзер / точки в режиме производительности), `WMErrorScreen`/`WMErrorCard`, pull-to-refresh, `GradientButton`, `UnreadBadge`, `PulsingBadge`, `TypingIndicator`, `ExpressiveFAB`, `ExpressiveIconButton`, `GlassTopAppBar`, `ChatGlassCard`.
- ✅ Звуки: 17 WAV из `res/raw` (в iOS были пустые 44-байтные заглушки!) + рингтон/гудок звонка, синтезированные теми же тонами, что Windows `callSounds.ts` (`scripts/synth-call-sounds.mjs`); `SoundLibrary` с предпрослушиванием; звуки уведомлений зарегистрированы для push.
- ✅ Экран «Тема и оформление» (`features/themeSettings`): хаб 7 категорий, режим приложения, паки, основной UI (темы, сброс, поделиться/импорт, тёмная/системная, пресеты и своё фото фона, анимированный фон с PRO-замком и пробным периодом 5 дней, пузыри, шрифт чата + загрузка своего, стиль интерфейса, быстрая реакция), каналы (вид + плитка премиум-дизайна), звуки. Вход — Настройки → Тема.
- ✅ Онбординг `UIStyleOnboardingActivity` (режим → стиль списка), показывается один раз после первого входа.
- ✅ `QuickThemeToggle` (переключатель для бокового меню — подключить в фазе 3 вместе с drawer).
- ⏭️ Не переносится (на Android не используется): `CustomizationManager` (`MessageBubbleStyle`, `MessageAnimationStyle`, `FontVariant`), `Effects.kt` (`WMGradients/WMShadows/WMBlur/WMGlow`), `ShimmerEffect`, `WMSearchBar`, `GlassmorphicCard`, `UserAvatar` (composable).
- ⬜ Экраны «Рамки звонков» и «Рамки видеосообщений» — заглушки маршрутов; переносятся в фазах 8 и 3 вместе со звонками/кружками.
- ⬜ Экран «Дизайн премиум-каналов» — заглушка; фаза 6.
- 🟡 Lottie: ассеты (талисман Shitzu ×15, эмоции, лоадер) скопированы в `assets/lottie`, `lottie-react-native` установлен; использование — по месту в фазах 3/10 (боты).

---

## 5. Фаза 3 — Главный экран и личные чаты (ядро мессенджера)
Оценка: 5–7 недель. Самая большая фаза.

### 5.1 Главный экран (`ui/chats`, `ui/lite`)
- ✅ Данные: `ChatsViewModel` (кеш → REST, пагинация 50, превью E2EE v6/v1/v2, архив/скрытые на сервере, удаление ×3 с чисткой офлайн-кеша, бизнес-чаты, бейдж «Ответы», сокет), `GroupsViewModel.fetchGroups`, `ChannelsViewModel` (каталог, подписки + кеш `cached_channels`, подписка/отписка, 402), истории (личные + каналов), `LiveChannelTracker`, `PresenceTracker`.
- ✅ `ChatsScreenModern`: пейджер 4 вкладок ↔ полоса папок (синхронизация в обе стороны), шапка сворачивается при прокрутке, автообновление 6 с, FAB по вкладке, фон темы, снекбары, обновление как в `onResume`.
- ✅ Строки: `ModernChatCard`/`TelegramChatItem`/группы/`ChannelRepliesInboxItem`, каналы (`TelegramChannelItem`, `ChannelCard`, аватар, LIVE, подписка), `ChannelStoriesRow`, свайпы (`ChatSwipeActions`, жест сильнее пейджера), теги под чатом.
- ✅ Контекстное меню (`ChatContactMenu`) + псевдоним, `DeleteChatDialog`, `ChatLockManager`, скрытые/архив.
- ✅ Папки: `ChatOrganizationManager/UI` (лимит 10/50, теги, перенос), серверные/совместные (`ServerFolderViewModel`, `SharedFoldersSheet`: создать/изменить/поделиться/вступить/выйти/удалить).
- ✅ `UnifiedSearchDialog` (люди + каналы, каталог при пустом запросе).
- ✅ Боковое меню: шапка (12 пресетов с декором Skia / своё фото / тема), кольцо историй, лента историй, аккаунты, все разделы, тема одним касанием. Карточка APK-обновления на iOS не нужна.
- ✅ `AppBottomNavBar` (стеклянная таблетка, индикатор-пружина, аватар), `AccountSwitcherDialog`, «Добавить аккаунт» (вход без сброса сессии, перезапуск данных по смене userId).
- ✅ `ChannelRepliesActivity` (ответы на комментарии: пагинация, живые ответы, ответ из списка, KARMA_RESTRICTED).
- 🟡 `PremiumChannelListItem` — пока `ChannelCard`; настоящая карточка «Obsidian Gold» — с дизайн-системой премиум-каналов (фаза 6).
- 🟡 Lite-режим (`LiteMainScreen`, `LiteBottomBar`, `AppModeSelector`) — нужны история звонков и создание группы → в фазе 8.
- 🟡 Заглушки до своих фаз: вкладка «Контакты» (ContactPicker), создание группы/канала/истории, просмотр историй, редактирование группы, пункты меню (Новости, Бот-стор, Гео, Бизнес-каталог, Stars, Реклама, Возвраты, Тикеты, Черновики).
- ℹ️ Находка: в Android `ModernChatCard(isLocked)` никогда не передаётся из списка — значок замка на заблокированных чатах не показывается. Повторено 1:1.

### 5.2 Экран переписки (`ui/messages`, ~22 000 строк)
Типы сообщений:
- ✅ текст · ⬜ форматированный текст (`formatting/*`: жирный/курсив/спойлер/моно/ссылки + `FormattingToolbar`)
- ⬜ фото / альбомы (`MediaAlbumComponent`) · ⬜ видео (`VideoMessageComponent`, `VideoFileMessageComponent`) · ⬜ видеокружки (`VideoMessageComponents` 777 строк + рамки `VideoMessageFrameStyle`)
- ⬜ голосовые (`VoiceRecorder`, волна, скорость) · ⬜ аудио/альбомы (`AudioAlbumComponent`) · ⬜ файлы (`FileMessageComponent`: настоящее имя, скачивание, открытие)
- ⬜ стикеры (Strapi, Telegram .tgs, встроенные паки) · ⬜ GIF (GIPHY) · ⬜ кастомные эмодзи / Fluent Emoji
- ⬜ геолокация (`LocationMessageBubble`) + live-локация (`LiveLocationManager`) · ⬜ контакт (`ContactMessageBubble`)
- ⬜ опросы (`PollMessageComponent`) · ⬜ превью ссылок (`LinkPreviewComponents`, `LinkPreviewUtils`) · ⬜ Instant View статей (`InstantViewActivity`, `HtmlArticleContent`)

Действия:
- ✅ редактирование, удаление · ⬜ ответ (reply) · ⬜ пересылка (`ForwardMessageDialog`) · ⬜ мультивыбор (`selection/*`)
- ⬜ реакции + «кто отреагировал» (`WhoReactedSheet`, формат grouped/flat — см. `ReactionsListDeserializer`) · ⬜ быстрая реакция двойным тапом (`QuickReactionAnimation`)
- ⬜ голосовые реакции (`VoiceReactionSheet/Bubble`)
- ⬜ закреп + баннер закрепа · ⬜ поиск по чату (вперёд/назад) · ⬜ медиа-поиск (`MediaSearchScreen`)
- ⬜ черновики (`DraftRepository`, экран `DraftsScreen`) · ⬜ отложенные сообщения (`ScheduledPickerDialog`, `ScheduledMessagesActivity`) · ⬜ напоминания (`ReminderPickerDialog` + `ReminderWorker` → локальное уведомление)
- ⬜ очистка истории у себя / у всех (`ClearHistoryDialog`) · ⬜ автоудаление медиа (`MediaAutoDeleteDialog`) · ⬜ блокировка пользователя
- ⬜ экспорт чата (`ExportChatComponent`) · ⬜ перевод сообщения · ⬜ AI-резюме чата (`AiSummarySheet`) · ⬜ Smart Replies
- ⬜ обои чата (пресет/своя картинка, `ChatWallpaperRepository`)
- ⬜ личные настройки чата (`PrivateChatSettingsNode`), никнеймы контактов (`ContactNicknameRepository`)
- ⬜ сохранённые сообщения (`SavedMessagesManager`, экран) · ⬜ заметки (`NotesActivity`)
- ⬜ эффект «Танос» при удалении (`ThanosEffect`, Skia)
- ⬜ голосовые комнаты в чате (`fetchActiveVoiceRoom/join/leave`)
- ⬜ статусы typing / recording / recording_video
- ⬜ шапка чата (`MessagesHeaderComponents`) с аватаром, статусом, меню

Поле ввода (`MessageInputComponents`, Telegram/Viber-стиль):
- 🟡 текст · ⬜ режимы ввода (`InputMode`) · ⬜ hands-free запись · ⬜ запись кружка · ⬜ `UnifiedMediaPicker` (1 633 строки) · ⬜ `CompactMediaMenu` · ⬜ `EmojiPicker` · ⬜ `StickerPicker` + подсказки стикеров (`StickerSuggestionStrip`) · ⬜ `GifPicker` · ⬜ `LocationPicker` · ⬜ `ContactPicker` · ⬜ `StrapiContentPicker` · ⬜ выбор качества видео (`VideoQualitySheet`) + сжатие · ⬜ фоторедактор (`PhotoEditorScreen` 1 055 строк)

Загрузка и медиа:
- ⬜ `MediaUploader` (крупные чанки — не повторять старый баг с флашем каждые 16 KB), `MediaLoadingManager`, `FileManager`, `EncryptedMediaHandler`
- ⬜ просмотрщики `MediaViewers` (1 356 строк): фото с зумом, видео, галерея
- ⬜ видеоплеер с лестницей качеств (`AdvancedVideoPlayer`, `StreamingVideoPlayer`)
- ⬜ настройки автозагрузки медиа

### 5.3 E2EE (`utils/signal`, `utils/e2ee`)
- ✅ v6 1:1 (Static X3DH, self-sync, перебор слотов)
- ⬜ v5 Sender Keys для групп (`SenderKeyV5Service`, `SignalGroupEncryptionService`, `SignalSenderKeyStore`) — порт с Windows `senderKeyService.ts` + `groupE2EE.ts` (включая `distributeKey()` — на Windows его отсутствие ломало группы)
- ⬜ GSK-шифрование групп (`GroupGskEncryptionService`)
- ⬜ резервная копия ключей (`KeyBackupCrypto`, экран `KeyBackupScreen`)
- ⬜ сверка отпечатков / защита от MITM (`CallFingerprint`, UI проверки)
- ⬜ шифрование медиа-файлов
- ⬜ боты — **без** E2EE (plaintext), как на Android
- ⛔ `DoubleRatchetManager.kt` — не переносить (Double Ratchet отклонён), только проверить, что ничего живого через него не идёт

### 5.4 Секретные чаты
- ⬜ `SecretChatManager`, таймер самоуничтожения (`SelfDestructTimerDialog`), чистка при каждом входе в приложение + BGTask.

### 5.5 ⭐ Карма — главная фишка (сквозная: профиль, чаты, каналы, Stars)
Источник правды — бэкенд `routes/users/karma-helper.js` + `rating.js`; Android — `UserRating.kt`,
`UserProfileActivity` (карточка кармы с прогрессом и кнопками голоса), `UserProfileMenu`
(`KarmaBadge`), `ModernChannelPostComponents` (бейджи кармы/доверия), `ChannelUIEffects`,
`ChannelRepliesActivity` (`KARMA_RESTRICTED`), `MessagesViewModel` (репутация собеседника).

Правила (сервер, клиент только отображает и шлёт голос):
- карма = лайки − дизлайки (только проверенные голоса активных аккаунтов);
- ≤ −50 → `warn` (визуальное предупреждение), ≤ −100 → `restricted` (нельзя отвечать другим в каналах, обычный комментарий можно);
- ≥ 100 → еженедельные Stars по тирам 100→3, 250→5, 450→7, 600→10, 850→12, 1000→15, 1250→17, 1500→20, 2000→25 (`weekly_stars`, `next_stars_at`);
- антиабуз: голосовать можно только за того, с кем переписывался/в общей группе; аккаунту ≥ 7 дней; ≤ 20 голосов/сутки; смена голоса раз в 24 ч; повторный тот же голос = снятие (toggle). Отказы: `KARMA_TOO_NEW`, `KARMA_COOLDOWN`, `KARMA_DAILY_LIMIT`, `KARMA_NO_CONTACT` (+ локализованное `error_message`).

Задачи:
- ✅ Модели и API — сгенерированы (`M.UserRating`, `M.MyRating`, `M.RatingDetail`, `NodeRetrofitClient.profileApi.getUserRating/rateUser`).
- ✅ Логика `src/features/karma/` — стор, классификация уровней, тиры Stars, разбор отказов, toggle-голос.
- ⬜ Карточка кармы в профиле (прогресс до следующего тира Stars, 👍/👎, мой голос, список оценивших).
- ⬜ `KarmaBadge` + бейдж доверия (`trust_level_emoji/color/label`) в меню профиля, в постах и комментариях каналов.
- ⬜ Баннер «низкая репутация» у собеседника в личном чате (информационный — писать можно).
- ⬜ `KARMA_RESTRICTED` при ответе в комментариях канала — ошибка в поле ввода, как на Android.
- ⬜ Начисление Stars за карму в кошельке Stars (история `stars_received`).

### 5.6 Функции, которые есть в релизном Windows (0.62.0), но нет в Android — тоже переносим
iOS = объединение Android + Windows. Источник — `C:\projects\windows-messenger\src`.
- ⬜ **События в группах** (`GroupEventModal.tsx`) — создание события с датой, карточка-событие в ленте группы.
- ⬜ **Универсальные жалобы** (`ReportModal.tsx`, `ChannelReportModal.tsx`) — на сообщение, профиль, канал/пост/комментарий, группу, историю; причины = `data/report-reasons.js` бэкенда, `POST /api/node/report` (на Android только частично; spam-report бэкенд с 2026-10-06).
- ⬜ **Магазин паков стикеров + режим автора** (`PackStoreModal.tsx`, `PackCatalogPanel.tsx`) — каталог, поиск, публикация своего пака.
- ⬜ **Кто прочитал** (`MessageSeenSheet.tsx`) — лист прочитавших сообщение.
- ⬜ **QR профиля** (`UserQRModal.tsx`, ecc=H с аватаром в центре) и **QR канала** (`ChannelQRModal.tsx`).
- ⬜ **Мини-плеер голосовых** (`VoiceMiniPlayer.tsx`) — закреплённая панель над чатом: пауза, перемотка, скорость.
- ⬜ **Локальные папки чатов** (`LocalFoldersScreen.tsx`, `FolderManager.tsx`, `FolderDock.tsx`) — сверить с Android `ChatOrganizationManager`, взять более полную версию.
- ⬜ **Очередь офлайн-отправки с группами и темами** (`offlineQueue.ts`) — на Android офлайн только 1:1/каналы; ботам — без E2EE.
- ⬜ **«Что нового»** (`WhatsNewModal.tsx` + `changelog.ts`) — показ изменений после обновления.
- ⬜ **Nova UI (бета-интерфейс)** (`NovaUiToggle.tsx`, палитра Nova) — переключатель в «Оформлении».
- ⬜ **Анимированные canvas-фоны премиум-каналов** (`ChannelCanvasBackground.tsx`) → Skia.
- ⬜ **Редактор inline-кнопок поста** (`PostButtonsEditor.tsx`, ≤5 рядов × 3 кнопки).
- ⬜ **Панель команд бота** (`BotCommandBar.tsx`) — автодополнение `/команд`.
- ⬜ **Фон шапки бокового меню** (`DrawerHeaderPicker.tsx`) — пресеты, PRO-пресеты, своё фото с точкой фокуса, затемнение и размытие (на Android — долгий тап по шапке).
- ⬜ **Компонент StarRating** (оценки звёздами — бизнес/боты) и **KarmaCard** — сверить с Android-версией карточки кармы.
- 🍎 Не переносится: `TitleBar`, `useKeyboardShortcuts`, `VerticalNav` (десктопные), автообновление Electron.

---

## 6. Фаза 4 — Уведомления 💰
Оценка: 2–3 недели. Без платного аккаунта делается только in-app часть.

- ⬜ In-app уведомления (баннер при открытом приложении, звук из `SoundLibrary`).
- ⬜ 💰 FCM-токен iOS → бэкенд (`platform: 'ios'`); регистрация на логин, отписка на логаут, дедуп (все 6 багов из Android-интеграции FCM учесть сразу).
- ⬜ 💰 Notification Service Extension (Swift, App Group + общий Keychain): расшифровка v6 в пуше, иначе показывать «Новое сообщение».
- ⬜ 💰 Действия в уведомлении: Ответить (text input, E2EE), Прочитано, Реакция (`UIStylePreferences.quickReaction`).
- ⬜ Группировка по чатам (thread-id), очистка при открытии чата и смахивании (учесть баг «застрявшей сводки» с Android).
- ⬜ Настройки уведомлений (`NotificationSettingsScreen`), приоритеты (`NotificationPriorityManager`), mute.
- ⬜ Бейдж на иконке.
- ⬜ Подтверждение входа с нового устройства из уведомления (`LoginVerificationActivity`).

---

## 7. Фаза 5 — Группы (`ui/groups`, ~14 000 строк, 72 эндпоинта)
Оценка: 4–5 недель.

- 🟡 Список групп — только вёрстка.
- ⬜ Групповой чат (переиспользуем экран сообщений + `initializeGroup`, участники, отправители, анонимный админ).
- ⬜ Темы/подгруппы в стиле Telegram (`SubgroupsUI` 1 250 строк, `switchTopic`).
- ⬜ Создание/редактирование (`CreateGroupDialog`, `EditGroupDialog`, `ChangeAvatarDialog`).
- ⬜ Детали группы (`GroupDetailsActivity` 1 432 строки, `ModernGroupDetailsComponents`).
- ⬜ Участники (`GroupMembersActivity`), роли, бан, приглашения (`InviteMembersUI`).
- ⬜ Админ-панель (`GroupAdminPanel`, `GroupAdvancedSettings` 1 177 строк), журнал действий (`GroupAdminLogs*`).
- ⬜ Статистика (`GroupStatisticsUI`).
- ⬜ Отложенные посты (`ScheduledPostsUI` 1 043 строки).
- ⬜ Розыгрыши (`GroupGiveawayUI`, `PublicGiveawayUI`).
- ⬜ QR: показать (`GroupQrDialog`), сканировать (`QrScannerActivity`), вступить по QR.
- ⬜ Закреплённые (`PinnedMessageBanner`), поиск (`GroupSearchBar`), опросы.
- ⬜ Тема группы (`GroupThemeEditor`, `GroupThemeManager`), настройки форматирования (`FormattingSettingsPanel`).
- ⬜ Онлайн участников (`GroupOnlineStatusManager`).
- ⬜ Ссылки-приглашения + превью-карточка группы.

---

## 8. Фаза 6 — Каналы (`ui/channels`, ~30 000 строк, 81 эндпоинт)
Оценка: 6–8 недель.

- 🟡 Детали канала — только вёрстка.
- ⬜ Список каналов, подписка, поиск, рекомендации (`RecommendedChannels*`).
- ⬜ Лента канала (`ChannelDetailsActivity` 4 137 строк): посты (`ModernChannelPostComponents` 2 186 строк), медиа, реакции, просмотры, продолжение с места прочтения, кнопка ↓, темы канала.
- ⬜ Комментарии (`ChannelCommentsSheet` 2 653 строки), инлайн-треды, модерация (`ChannelModerationDialog`, Detoxify на бэке), действия с комментатором (`CommentUserActionsSheet`).
- ⬜ Ответы канала (`ChannelRepliesActivity`).
- ⬜ Создание канала (`CreateChannelActivity` 1 185 строк), аватар, инфо (`ChannelInfoSheet`).
- ⬜ Админ-панель (`ChannelAdminPanelActivity` 1 953 строки) + чат обсуждения (linked discussion group).
- ⬜ Статистика (`ChannelStatisticsUI`, `ChannelStatsDashboard`, `PostAnalyticsSheet`) — графики (`victory-native` или Skia).
- ⬜ Резервная копия канала (`ChannelBackupUI`).
- ⬜ Платные подписки и пейволл (`ChannelMemberSubscription*`, `PaywallPurchaseSheet`), донаты (`ChannelDonateSheet`), подарочная подписка.
- ⬜ Premium-каналы: дизайн-система `channels/premium/*` (~6 000 строк: темы, пресеты, бейджи, уровни, hero-header, эмодзи-статусы, premium-реакции, трайал-баннер), `ChannelAppearanceActivity`, `PremiumChannelsThemeActivity`.
- ⬜ Отложенные посты канала.
- ⬜ Реклама в ленте (`ChannelFeedAdCompose`).
- ⬜ Эфиры канала (`ChannelLivestreamActivity` 1 355 строк + VM 745) — LiveKit, чат эфира, запись (`WebRTCStreamRecorder`) — связано с фазой 8.
- ⬜ Ссылки на каналы (deep link + карточка-превью).

---

## 9. Фаза 7 — Истории (`ui/stories`, ~5 000 строк, 22 эндпоинта)
Оценка: 2–3 недели.

- 🟡 Экран — только вёрстка.
- ⬜ Лента/ряд историй, просмотрщик (`StoryViewerActivity` 2 130 строк: жесты, прогресс, пауза, видео).
- ⬜ Создание (`CreateStoryDialog` 933 строки, редактор), истории каналов.
- ⬜ Реакции (`StoryReactionBar`), аналитика (`StoryAnalyticsSheet`), реклама в историях (`StoryAdOverlayCompose`).

---

## 10. Фаза 8 — Звонки (`ui/calls`, ~12 000 строк)
Оценка: 5–7 недель. Самая рискованная по нативке.

- 🟡 Экран звонков — только вёрстка.
- ⬜ История звонков (`CallHistoryActivity`, `CallHistoryRepository`).
- ⬜ 1:1 аудио/видео: `react-native-webrtc`, сигналинг через сокет (порт `WebRTCManager` 1 232 строки + `CallsViewModel` 2 082 строки), TURN/STUN `195.22.131.11` / `46.232.232.38`, ICE restart, перезапуск при смене сети (Wi-Fi ↔ LTE — на Android это было багом, учесть сразу), сверка отпечатка.
- ⬜ Экран звонка (`CallsActivity` 3 433 строки): меню ⋮, реакции (16+ анимированных), качество, переключение камеры, маршрут звука (динамик/Bluetooth/AirPods — `AVAudioSession` через `react-native-incall-manager`).
- ⬜ Входящий звонок, пока приложение открыто (`IncomingCallActivity`) — полноэкранный экран + рингтон.
- ⬜ 💰 Входящий при закрытом приложении: PushKit VoIP + CallKit (`react-native-callkeep`). Бэкенду нужен отдельный путь VoIP-пуша через APNs (FCM не умеет VoIP) — **задача на бэкенд**.
- ⬜ Групповые звонки (`GroupCallActivity`, `GroupStageCallLayout`, `IncomingGroupCallActivity`) — LiveKit.
- ⬜ Добавление участника в звонок (ad-hoc комната LiveKit), перевод звонка (`CallTransferManager`).
- ⬜ Картинка-в-картинке (iOS 15+ `AVPictureInPictureController` для видеозвонков — нужен нативный модуль; аудио в фоне — `UIBackgroundModes: audio, voip`).
- ⬜ Видеофильтры (`VideoFilterManager`), виртуальный фон (`VirtualBackgroundManager` → Vision, свой Expo Module), фоны звонка (`CallBackgroundsUi`), рамки (`CallFrameSettingsScreen`).
- ⬜ Запись звонка (`CallRecordingManager`).
- ⬜ 💰 Демонстрация экрана (`ScreenSharingManager`) → ReplayKit Broadcast Upload Extension.

---

## 11. Фаза 9 — Профиль, настройки, безопасность
Оценка: 4–5 недель.

### 11.1 Профиль (`ui/profile`)
- 🟡 Чужой профиль — вёрстка. ⬜ `UserProfileActivity` (1 785 строк): медиа, общие группы, действия, рейтинг (`UserRating`), бейдж верификации.
- ⬜ Мой профиль (`MyProfileScreen` 1 530 строк), витрина (`ProfileShowcaseSection`), галерея аватаров (мульти-аватар, сортировка), эмодзи-статус, форматированное био, кастомный статус.

### 11.2 Настройки (`ui/settings`)
- 🟡 Главная — базовая. ⬜ `SettingsHome` с поиском по настройкам, быстрым оформлением, PRO-плашкой.
- ⬜ Редактирование профиля, подписчики/подписки (`FollowListScreen`), мои группы.
- ⬜ Приватность (`PrivacySettingsScreen`), заблокированные + блок по идентификатору.
- ⬜ Данные и память (`DataAndStorageScreen`), очистка кеша (`MediaCacheCleanupWorker`).
- ⬜ Уведомления (см. фазу 4), рамки видеосообщений, рамки звонков.
- ⬜ AI-настройки (`AiSettingsScreen`, `AiKeysStore`, `AiHelper`).
- ⬜ Облачный бэкап (`CloudBackupManager`, `CloudBackupSettingsScreen`, диалоги, Dropbox OAuth → `expo-auth-session`), `BackupWorker` → BGTask + ручной запуск.
- ⬜ 🍎 Обновление приложения → только баннер новой сборки.
- ⬜ Язык.

### 11.3 Безопасность (`ui/settings/security`, `ui/security`)
- ⬜ Блокировка приложения PIN + Face ID (`AppLockActivity`, `PINScreen`, `BiometricAuthManager`) + размытие превью в переключателе приложений.
- ⬜ 2FA (TOTP, `TOTPGenerator`, QR для Google Authenticator) — и **обязательная** проверка 2FA при логине (на Android был пропуск).
- ⬜ Активные сеансы (`SessionsScreen`), удаление аккаунта с 45-дневной задержкой (`DeleteAccountScreen`), резервная копия ключей.
- ⬜ 🍎 `SecurityGuard` (проверка подписи APK) → на iOS заменить на jailbreak-detection (опционально, `jail-monkey`).

### 11.4 Вход/регистрация — дотянуть
- ⬜ Быстрая регистрация по телефону (`QuickRegisterActivity`), вход по коду (`LoginCodeScreen`), голосовой OTP, QR-вход с другого устройства, восстановление аккаунта (`RestoreAccountScreen`), выбор пола, ввод телефона с маской (`PhoneInputComponents`).

---

## 12. Фаза 10 — Экосистема и прочее
Оценка: 5–6 недель.

- ⬜ **Боты** (`ui/bots`, ~6 000 строк): каталог (Bot Store), чат с ботом (клавиатуры, inline-кнопки, переключатель ⌨️/🔘, callback query), inline-боты (`InlineBotBar`), управление своими ботами, RSS-ленты, темы ботов, анимации (`BotAnimations`, `RandBotAnimations`), WallyBot-гид.
- ⬜ **Мини-приложения** (`MiniAppActivity` 947 строк) → `react-native-webview` + JS-мост.
- ⬜ **Бизнес** (`ui/business`): бизнес-профиль, часы работы, автоответ, быстрые ответы, ссылки, статистика, API-доступ, верификация, бизнес-чаты, справочник (`BusinessDirectory*`).
- ⬜ **Реклама** (`ui/ads`): кабинет, кампании, кошелёк Stars.
- ⬜ **Stars** (`StarsScreen` 811 строк), **Premium** (`PremiumScreen`), **Возвраты**, **Тикеты поддержки** (§13 про IAP).
- ⬜ **Гео** (`GeoDiscoveryActivity` — люди рядом, карта).
- ⬜ **Новости** (`NewsListActivity`, `NewsDetailActivity`, блог-API).
- ⬜ **Глобальный поиск** (`GlobalSearchActivity`, фильтры, медиа-поиск).
- ⬜ **Музыкальный плеер** (`AdvancedMusicPlayer` 912 строк, `LockScreenMusicPlayer`, `MusicPlaybackService`) → `react-native-track-player` с управлением с экрана блокировки.
- ⬜ **Верификация аккаунта** (`ui/verification`).
- ⬜ **Контакты** (`ContactRepository`, приглашение друзей).
- ⬜ **Голосовые команды** (`SpeechCommandManager`), **Shake-to-report** (`ShakeDetector` → баг-репорт `wm_bug_reports`).
- ⬜ **Жалобы на сообщения** (spam-report, `/api/node/report`).
- ⬜ **Deep links** (`WorldMatesDeepLinks`): `worldmates://` сразу, 💰 universal links `worldmates.club/...` позже. Ссылки на каналы/группы должны открываться в приложении, а не в вебе.
- ⬜ **Sandbox UI v4** — довести до паритета с Android (`ui/sandbox`, 12 экранов) или оставить dev-only.

---

## 13. Фаза 11 — Выпуск
- ⬜ 💰 Apple Developer Program, сертификаты, App ID, capability: Push, VoIP, App Groups, Associated Domains, Background Modes.
- ⬜ 💰 `apple-app-site-association` на `worldmates.club`.
- ⬜ App Store Review: In-App Purchase для Premium/Stars/платных каналов **или** раздача только через TestFlight/сайдлоад; аккаунт для ревьюера (по аналогии с Google Play, user_id 825); Privacy Manifest (`PrivacyInfo.xcprivacy`); экспорт-комплаенс шифрования (E2EE → `ITSAppUsesNonExemptEncryption` + годовой отчёт).
- ⬜ Иконки, сплэш, тексты разрешений на 3 языках (`InfoPlist.strings`).
- ⬜ Версионирование по той же схеме, что Android (`buildNumber` +1, `version` по правилам CLAUDE.md).

---

## 14. Задачи на бэкенд (`C:\projects\nodejs`)
- ⬜ Принимать FCM-токены с `platform: 'ios'`, отправлять APNs-совместимый payload (`apns.payload.aps` с `mutable-content: 1` для NSE, `thread-id`, `category`).
- ⬜ VoIP-пуш через APNs напрямую (`.p8` ключ, topic `com.worldmates.messenger.voip`) для входящих звонков.
- ⬜ Видео: убедиться, что для всех медиа есть HLS (DASH iOS не играет).
- ⬜ Голосовые: AAC/m4a играются на iOS; если где-то OGG/Opus — нужна перекодировка или нативный декодер.
- ⬜ `.tgs`/WebP-стикеры: проверить, что отдаются в формате, который `expo-image`/Lottie читают на iOS.

---

## 15. Сводка по срокам (один разработчик + Claude)
| Фаза | Содержание | Оценка |
|---|---|---|
| 1 | Фундамент, общий TS-слой, БД, i18n, сокет | 2–3 нед |
| 2 | Дизайн-система, темы, фоны, шрифты | 2–3 нед |
| 3 | Главный экран + личные чаты + E2EE | 5–7 нед |
| 4 | Уведомления 💰 | 2–3 нед |
| 5 | Группы | 4–5 нед |
| 6 | Каналы | 6–8 нед |
| 7 | Истории | 2–3 нед |
| 8 | Звонки | 5–7 нед |
| 9 | Профиль, настройки, безопасность | 4–5 нед |
| 10 | Боты, бизнес, реклама, Stars, музыка, прочее | 5–6 нед |
| 11 | Выпуск | 1–2 нед |
| **Итого** | | **≈ 38–52 недели** |

Фазы 5–7 и 9–10 можно частично параллелить. Фазы 1–3 — строго по порядку: на них стоит всё остальное.

## 16. Как работаем по этому файлу
1. Берём следующий ⬜ сверху вниз внутри текущей фазы.
2. Читаем соответствующий Android-файл (эталон поведения) и Windows-аналог (эталон TS-кода), при сомнениях — маршрут в бэкенде.
3. Переносим, проверяем на Android-эмуляторе + CI-сборка на iPhone.
4. Меняем статус здесь, в том же коммите. Если по ходу нашли то, чего нет в плане, — дописываем пункт.

## 17. Журнал
| Дата | Что сделано |
|---|---|
| 2026-10-07 | Составлен план. Найдено: публичный репо с закоммиченными SERVER_KEY/SITE_ENCRYPT_KEY. |
| 2026-10-07 | **Фаза 1, фундамент.** Генераторы: строки (5 172 ключа ×3), Android API-зеркало (454 метода, 529 моделей, Gson-совместимый разбор), Room → SQLCipher-БД (8 таблиц), Windows `api.ts` → RN (341 функция). Секреты убраны из кода → `app.config.js` + `secretsProvider` + CI-секрет. Единый refresh токена. Сокет: все события через `onAny`, каталог 123 событий, фикс авторизации старым токеном. Карма: логика `features/karma`. Ключ в публичном репо — **тот же, что в Android `local.properties`, т.е. живой** → ротировать. |
| 2026-10-07 | **Фаза 1 закрыта.** UserSession (все поля), AccountManager + раздельные ключи E2EE по аккаунтам, prefs/cache/performance/storage, WMApplication-инициализация, NetworkQualityMonitor/TypeDetector, ErrorHandler, CrashReporter, cert pinning (найдено: leaf-пины Android устарели), LanguageManager (дефолт uk), бесконечный адаптивный реконнект сокета, проактивный refresh. Добавлен раздел 5.6 — функции, которые есть только в Windows. |
| 2026-10-07 | **Фаза 2 закрыта.** Генератор тем (50 тем, 15 фонов, 27 паков), тема M3 (Paper) по алгоритму Theme.kt, синхронизация темы с Android-профилем, 20 стилей пузырей, 11 анимированных фонов (Skia, те же seed), фон по умолчанию, 25 шрифтов + свои + шрифт отправителя, 34 Unicode-стиля, звуки (вместо пустых заглушек) + рингтон как в Windows, общие компоненты, экран «Тема и оформление», онбординг. |
| 2026-10-08 | **Фаза 3, главный экран (5.1).** Порт `ChatsScreenModern` + host `ChatsActivity` (Main → ChatsHome вместо системного таббара), боковое меню, нижний бар, папки локальные и совместные, поиск, контекстное меню, свайпы, ответы на комментарии, сторы групп/каналов/историй. В ядро: вычисляемые свойства Kotlin-моделей (`core/android/computed.ts` — генератор их терял: `channels`, `groups`, `_apiStatus`…), `WMBottomSheet` (свой Portal.Host — Paper-диалоги иначе под Modal на iOS), `WMModalDrawer`, `WMTabRow`, `SweepGradientBox`. Осталось в 5.1: Lite, премиум-карточка канала. |
