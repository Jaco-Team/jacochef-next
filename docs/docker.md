# Запуск jacochef-next в Docker

Проект поддерживает development-запуск с HMR и production-сборку Next.js в
режиме `standalone`. По умолчанию фронтенд доступен на `http://localhost:3000`,
а Laravel API ожидается на `http://localhost:8080`.

## Development

Скопируйте шаблон параметров и запустите контейнер:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build
docker compose ps
```

Исходники подключаются в контейнер через bind mount, а `node_modules` хранится
в отдельном Docker volume. Изменения кода применяются через HMR.

Полезные команды:

```bash
docker compose logs -f frontend
docker compose exec frontend npm run build
docker compose down
docker compose down -v
```

Если Laravel запущен не на порту `8080`, измените в `.env.docker`:

```dotenv
DOCKER_NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_HTTP=http://host.docker.internal:8000
```

`NEXT_PUBLIC_API_URL` используется браузером, поэтому адрес должен быть доступен
с компьютера пользователя. `BACKEND_HTTP` используется серверным API proxy
внутри контейнера; `localhost` в нём указывал бы на сам frontend-контейнер.

## Production

Публичные `NEXT_PUBLIC_*` значения встраиваются в приложение во время сборки.
Перед каждым release задавайте новый `IMAGE_TAG`:

```bash
docker compose --env-file .env.production -f compose.prod.yaml build --pull
docker compose --env-file .env.production -f compose.prod.yaml up -d
docker compose --env-file .env.production -f compose.prod.yaml ps
```

Минимальный production env:

```dotenv
NEXT_PUBLIC_API_URL=https://apichef.jacochef.ru/api
NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=
MUI_STYLE_ENGINE=sc
BACKEND_HTTP=http://host.docker.internal:8080
FRONTEND_HTTP_BIND=127.0.0.1
FRONTEND_HTTP_PORT=3000
IMAGE_TAG=2026-08-25.1
```

Production-контейнер запускается от непривилегированного пользователя `node` и
содержит только standalone server, статические файлы и `public`. TLS и домен
настраиваются во внешнем reverse proxy.
