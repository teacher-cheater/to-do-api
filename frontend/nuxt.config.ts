export default defineNuxtConfig({
    compatibilityDate: '2026-13-07',
    devtools: { enabled: true },
    modules: [],
    ssr: false,

    app: {
        head: {
            title: 'To-Do',
            meta: [
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1',
                },
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
                },
            ],
        },
    },
    runtimeConfig: {
        public: {
            apiBase:
                process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
        },
    },
    typescript: {
        strict: true,
    },
});
