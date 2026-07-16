# Dev-контейнер для Nuxt: устанавливает зависимости и запускает
# npm run dev. В отличие от backend, здесь не нужно ничего "скэффолдить"
# — наш package.json/nuxt.config.ts уже описывают полноценное
# приложение, не хватает только node_modules.
#
# Node 22 (а не 20) — Nuxt 4.x требует ^22.12.0 || ^24.11.0 || >=26.0.0,
# на Node 20 dev-сервер либо падает, либо зависает без ответа.
FROM node:22-alpine

WORKDIR /app

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
