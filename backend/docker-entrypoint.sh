#!/bin/sh
set -e

cd /var/www

# Эта папка на хосте содержит только "прикладной" код проекта
# (app/, database/, routes/api.php, bootstrap/app.php, config/cors.php,
# composer.json) — стандартных файлов Laravel-скелета (artisan,
# public/index.php, config/app.php и т.д.) в git специально нет, они
# сгенерированы и не несут уникальной информации о проекте.
#
# При первом запуске контейнер сам генерирует их во временную папку и
# копирует недостающее рядом с уже существующими файлами (-n = не
# перезаписывать то, что уже есть) — поэтому наш собственный
# composer.json, bootstrap/app.php, config/cors.php и весь app/ остаются
# нетронутыми, а всё остальное (то, чего не хватает) появляется.
if [ ! -f artisan ]; then
  echo "==> Laravel skeleton not found, scaffolding missing files (artisan, public/, config/, resources/...)..."
  composer create-project laravel/laravel:^12.0 /tmp/skeleton --no-interaction --prefer-dist --no-install --no-scripts
  rm -f /tmp/skeleton/composer.json /tmp/skeleton/composer.lock
  cp -rn /tmp/skeleton/. .
  rm -rf /tmp/skeleton
fi

echo "==> Installing PHP dependencies (composer install)..."
composer install --no-interaction --optimize-autoloader

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example..."
  cp .env.example .env
fi

php artisan key:generate --force
# Регистрирует сервис-провайдеры пакетов (в т.ч. Sanctum) вручную —
# наш composer.json не содержит хук "post-autoload-dump", который
# обычно делает это автоматически.
php artisan package:discover --ansi

echo "==> Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
until php -r "try { new PDO('mysql:host=${DB_HOST};port=${DB_PORT}', '${DB_USERNAME}', '${DB_PASSWORD}'); } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
  echo "    MySQL ещё не готов, ждём 2 секунды..."
  sleep 2
done
echo "==> MySQL доступен."

echo "==> Running migrations..."
php artisan migrate --force

# --seed только один раз: если запускать его на каждый рестарт
# контейнера, artisan db:seed попытается создать demo@example.com
# заново и упадёт на unique-ограничении email. Проверяем, есть ли уже
# хоть один пользователь в базе.
USER_COUNT=$(php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
    echo (int) \$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
} catch (Exception \$e) {
    echo 0;
}
")

if [ "$USER_COUNT" = "0" ]; then
  echo "==> Database is empty, seeding demo data..."
  php artisan db:seed --force
else
  echo "==> Database already has data, skipping seed."
fi

echo "==> Starting Laravel dev server on 0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000
