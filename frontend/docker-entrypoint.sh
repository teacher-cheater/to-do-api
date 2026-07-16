#!/bin/sh
set -e

cd /app

# node_modules хранится в отдельном именованном Docker-volume (см.
# docker-compose.yml), а не пишется напрямую в примонтированную папку
# хоста — так быстрее (нет проблем с производительностью bind-mount на
# Mac/Windows) и исключает конфликт нативных бинарников между хостом и
# контейнером. Раз это отдельный volume — при первом запуске он пуст,
# и npm install отработает один раз.
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "==> Installing frontend dependencies (npm install)..."
  npm install
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example..."
  cp .env.example .env
fi

echo "==> Starting Nuxt dev server on 0.0.0.0:3000"
exec npm run dev -- --host 0.0.0.0 --port 3000
