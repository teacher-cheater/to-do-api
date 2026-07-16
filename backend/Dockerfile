# Простой dev-контейнер: php artisan serve, а не php-fpm+nginx.
# Для реального прод-деплоя nginx+php-fpm были бы лучше (см.
# docs/DEPLOYMENT.md), но для локальной разработки и тестового задания
# один контейнер с "php artisan serve" — меньше движущихся частей.
FROM php:8.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        zip \
        curl \
        netcat-openbsd \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Берём готовый бинарник composer из официального образа, а не ставим
# через curl — быстрее и надёжнее.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
