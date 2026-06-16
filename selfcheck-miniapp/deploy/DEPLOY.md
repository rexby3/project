# Деплой SelfCheck (Docker + nginx + Let's Encrypt)

Изолированно от других проектов на сервере: контейнер слушает только
`127.0.0.1:8090`, наружу отдаётся через nginx по твоему поддомену с TLS.
Существующие vhosts/проекты не затрагиваются.

## 0. Что нужно заранее
- Поддомен (напр. `selfcheck.example.com`) с A-записью → IP сервера.
- Токен бота от [@BotFather](https://t.me/BotFather).
- (опц.) `HIBP_API_KEY` — для реальных утечек по email.
- (для кодов на email) SMTP-доступ: host / port / user / pass / from.

## 1. Положить код на сервер
Вариант A — через git:
```
ssh root@SERVER_IP
mkdir -p /opt && cd /opt
git clone -b claude/epic-wozniak-vncf26 https://github.com/rexby3/project.git selfcheck
cd selfcheck/selfcheck-miniapp
```
Вариант B — scp с мака (без логина в GitHub на сервере):
```
# выполняется на маке
scp -r ~/project/selfcheck-miniapp root@SERVER_IP:/opt/selfcheck
# затем на сервере: cd /opt/selfcheck
```

## 2. Docker (если ещё не стоит)
```
curl -fsSL https://get.docker.com | sh
docker --version
```

## 3. Конфиг `.env`
```
cp .env.example .env
nano .env
```
Минимум для боевого режима:
```
NODE_ENV=production
BOT_TOKEN=12345:AA...
WEBAPP_URL=https://selfcheck.example.com/
CODE_SALT=          # случайная строка: openssl rand -hex 32
HIBP_API_KEY=       # опционально, для реальных email-утечек
EMAIL_DELIVERY=smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=SelfCheck <no-reply@example.com>
MOCK_BREACHES=false
ALLOW_DEV_AUTH=false
EXPOSE_DEV_CODE=false
```

## 4. Запустить контейнер
```
docker compose up -d --build
docker compose logs -f      # ждём "HTTP server listening" и старт бота
curl -s http://127.0.0.1:8090/api/health
```

## 5. nginx + TLS
```
apt-get update && apt-get install -y nginx
cp deploy/nginx-selfcheck.conf /etc/nginx/sites-available/selfcheck.conf
sed -i 's/__DOMAIN__/selfcheck.example.com/' /etc/nginx/sites-available/selfcheck.conf
ln -s /etc/nginx/sites-available/selfcheck.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d selfcheck.example.com
```

## 6. Привязать к боту
В [@BotFather](https://t.me/BotFather):
- открой своего бота → **Bot Settings → Menu Button** (или команда `/setmenubutton`) →
  URL = `https://selfcheck.example.com/`, текст кнопки, напр. «Открыть SelfCheck».
- (для Mini App ссылки `t.me/<bot>/app`) **Configure Mini App** → тот же URL.

Открой бота в Telegram → кнопка меню → должно открыться приложение.

## Обновление
```
cd /opt/selfcheck/selfcheck-miniapp
git pull            # или повторный scp
docker compose up -d --build
```

## Остановить / откатить (старый проект не затрагивается)
```
docker compose down
```

## Проверка изоляции
- Контейнер виден только на localhost: `ss -ltnp | grep 8090` → адрес `127.0.0.1:8090`.
- Публично доступен только nginx (80/443) и только для твоего `server_name`.
