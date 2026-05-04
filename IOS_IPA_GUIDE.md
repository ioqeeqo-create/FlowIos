# Flow iOS: сервер (шлюз), проверки и сборка IPA

**Репозиторий приложения на GitHub:** [github.com/ioqeeqo-create/FlowIos](https://github.com/ioqeeqo-create/FlowIos)

**Сборка IPA в Actions** включается **один раз**: файл workflow в репо не залит автоматически (у CLI-токена не было scope `workflow`). Сделай **либо** в браузере на GitHub: **Add file → Create new file** → путь `.github/workflows/ios-ipa-unsigned.yml` → вставь YAML из локального файла **`docs/ci-ios-ipa-unsigned.yml`**, начиная со строки `name: iOS unsigned IPA` (верхние комментарии-инструкции не копируй) → Commit. **Либо** выполни `gh auth refresh -h github.com -s workflow`, затем `git add .github/workflows/ios-ipa-unsigned.yml && git commit -m "ci: workflow" && git push` из клона FlowIos. После этого: **Actions → iOS unsigned IPA → Run workflow** → скачай артефакт `FlowIos-unsigned-ipa`.

## Часть A — что сделать на сервере

Нужен **VPS / домашний сервер с Linux** (или любой хост с **Node.js 18+**). На сервер **не** кладутся твои Spotify / Яндекс / VK токены в `.env` обязательно: их вводишь **в приложении**; на сервере задаётся только **секрет шлюза** и запускается процесс.

### 1. Клонировать шлюз

Отдельный репозиторий **`flow-mobile-gateway`**:  
https://github.com/ioqeeqo-create/flow-mobile-gateway

```bash
cd /opt/flow   # или свой путь
git clone https://github.com/ioqeeqo-create/flow-mobile-gateway.git
cd flow-mobile-gateway
npm ci
```

### 2. Переменные окружения

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `FLOW_MOBILE_GATEWAY_SECRET` | **Да** | Длинная случайная строка (общий «пароль» API между сервером и приложением). |
| `FLOW_MOBILE_GATEWAY_PORT` | Нет | Порт HTTP (по умолчанию **3950**). |

Пример одноразового запуска в консоли:

```bash
export FLOW_MOBILE_GATEWAY_SECRET='сгенерируй-32-символа-минимум-случайно'
export FLOW_MOBILE_GATEWAY_PORT=3950
npm start
```

Увидишь в логе что-то вроде: `[flow-mobile-gateway] http://0.0.0.0:3950 …` — процесс слушает все интерфейсы.

### 3. Фаервол и доступ с телефона

- Открой порт **3950** (или тот, что в `FLOW_MOBILE_GATEWAY_PORT`) в **ufw** / панели облака / роутере.
- В приложении укажи URL **как телефон достучится до сервера**: `http://ПУБЛИЧНЫЙ_IP:3950` или домен.

Проверка с любой машины:

```bash
curl -sS "http://IP:3950/health"
# ожидается JSON: {"ok":true,"service":"flow-mobile-gateway"}
```

`GET /health` **без** Bearer — публичный ping. Все маршруты **`/mobile/v1/*`** требуют заголовок:

`Authorization: Bearer <тот же FLOW_MOBILE_GATEWAY_SECRET>`

### 4. Держать шлюз запущенным (systemd, пример)

Файл `/etc/systemd/system/flow-mobile-gateway.service`:

```ini
[Unit]
Description=Flow mobile gateway
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/flow/flow-mobile-gateway
Environment=FLOW_MOBILE_GATEWAY_SECRET=ВСТАВЬ_СЕКРЕТ
Environment=FLOW_MOBILE_GATEWAY_PORT=3950
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now flow-mobile-gateway
sudo systemctl status flow-mobile-gateway
```

### 5. HTTPS (по желанию, но удобнее)

Поставь **nginx + Let’s Encrypt**, проксируй на `127.0.0.1:3950`. В приложении тогда URL вида `https://music-gw.твойдомен.ru` без порта.

### 6. Проверка шлюза с ПК (токены в env)

На машине, где есть клон **`flow-mobile-gateway`**:

```bash
cd flow-mobile-gateway
set FLOW_GATEWAY_URL=http://IP_СЕРВЕРА:3950
set FLOW_GATEWAY_SECRET=тот-же-секрет-что-на-сервере
set FLOW_TEST_QUERY=daft punk
set FLOW_SPOTIFY_TOKEN=...   # опционально, для hybrid/spotify
set FLOW_YANDEX_TOKEN=...    # для yandex
set FLOW_VK_TOKEN=...        # для vk
npm run test:gateway
```

Скрипт дергает `health`, `search` (hybrid), `resolve` первого трека и `probeSavedTokens` для Яндекс/VK.

Отдельно можно руками проверить поиск по источнику (пример тела JSON):

`POST http://IP:3950/mobile/v1/search`  
Заголовки: `Authorization: Bearer <секрет>`, `Content-Type: application/json`  
Тело (Яндекс):

```json
{
  "q": "test",
  "source": "yandex",
  "tokens": { "yandexToken": "OAuth_строка" }
}
```

Аналогично `source: "vk"` и `tokens.vkToken`, `source: "spotify"` и `tokens.spotifyToken`.

---

## Часть B — приложение: что ввести после установки IPA

1. **Настройки** → URL шлюза (как в части A) + **тот же секрет**, что `FLOW_MOBILE_GATEWAY_SECRET`.
2. Токены сервисов (Spotify / Яндекс / VK / SoundCloud — по необходимости).
3. Для **Яндекс** и **VK** нажми **«Проверить … (через шлюз)»**, пока не появится успех — иначе поиск/воспроизведение для этих источников заблокированы в приложении.

YouTube в шлюзе идёт через Invidious/Piped; полный паритет с десктопным Electron (Selenium VK, yt-dlp и т.д.) в этом репо для мобилки не заявлен.

---

## Часть C — как собрать IPA

Локально на **Windows** симулятор iOS не поднять; **IPA** собирают на **Mac (Xcode)** или в **CI (GitHub Actions, macOS)**.

### Вариант 1 — GitHub Actions: неподписанный IPA (без платного Apple Developer)

1. Репозиторий уже на GitHub: **[ioqeeqo-create/FlowIos](https://github.com/ioqeeqo-create/FlowIos)** (корень = приложение).
2. Один раз включи workflow (см. абзац вверху гайда про `docs/ci-ios-ipa-unsigned.yml` или `gh auth refresh -s workflow` + push).
3. **Actions** → **iOS unsigned IPA** → **Run workflow** (или пуш в `main`, если менялись пути из триггера в workflow).
4. Скачай артефакт **`FlowIos-unsigned-ipa`** → внутри **`FlowIos-unsigned.ipa`**.

Это **не** финальная подпись Apple: установка через **GBox / AltStore / Sideloadly** своим **Apple ID** (бесплатный профиль ~на 7 дней, потом переподпись).

Кратко **GBox**: скопировать IPA на iPhone → в GBox подписать → при необходимости **Настройки → Основные → VPN и управление устройством** → доверие сертификату разработчика.

### Вариант 2 — Mac + Xcode (рекомендуется, если есть Mac)

1. Установи **Xcode**, **CocoaPods** (`sudo gem install cocoapods` или через Homebrew).
2. В каталоге **`FlowIos`**:

   ```bash
   npm ci
   cd ios
   pod install
   cd ..
   ```

3. Открой **`ios/FlowIos.xcworkspace`** в Xcode.
4. **Signing & Capabilities** — выбери свою **Team** (платный аккаунт или бесплатный Apple ID для личного устройства).
5. Устройство: подключи iPhone → вверху схема **FlowIos** и твой телефон → **Product → Run** для отладки, или **Product → Archive** для архива и **Distribute App** (Ad Hoc / App Store Connect по твоей схеме).

Если **`xcodebuild` падает** — смотри лог: часто **`pod install`**, Hermes, неверная **схема** (`FlowIos`). Нужен **`package-lock.json`** для `npm ci` в CI.

### Полезные пути

| Что | Где |
|-----|-----|
| Экран настроек | `src/screens/SettingsScreen.tsx` |
| Шлюз (отдельный репо) | репозиторий `flow-mobile-gateway`, `server/index.js` |
| Тест шлюза | в корне репо → `npm run test:gateway` |
| Bundle ID | `com.flow.player` (`ios/.../project.pbxproj`) |
| ATS / фон / фото | `ios/FlowIos/Info.plist` |

Когда появится свой **App Store / Team ID**, настрой нормальную подпись в Xcode и при необходимости упрости workflow под **fastlane** или подписанный экспорт.
