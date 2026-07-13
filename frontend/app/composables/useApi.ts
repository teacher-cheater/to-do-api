export function useApi() {
    const config = useRuntimeConfig();
    const base = config.public.apiBase as string;

    function readCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? decodeURIComponent(match[2]) : null;
    }

    async function ensureCsrfCookie() {
        await $fetch('/sanctum/csrf-cookie', {
            baseURL: base,
            credentials: 'include',
        });
    }

    async function request<T = any>(
        path: string,
        opts: Record<string, any> = {},
    ): Promise<T> {
        const method = (opts.method || 'GET').toUpperCase();

        if (method !== 'GET') {
            await ensureCsrfCookie();
        }

        const xsrfToken = readCookie('XSRF-TOKEN');

        try {
            return await $fetch<T>(path, {
                baseURL: base,
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                    ...(opts.headers || {}),
                },
                ...opts,
            });
        } catch (err: any) {
            if (err?.response?.status === 401) {
                await navigateTo('/login');
            }
            throw err;
        }
    }

    return { request };
}
