export function useAuthToken() {
    return useState<string | null>('auth:token', () => null);
}

export function useApi() {
    const config = useRuntimeConfig();
    const base = config.public.apiBase as string;
    const token = useAuthToken();

    async function request<T = any>(
        path: string,
        opts: Record<string, any> = {},
    ): Promise<T> {
        try {
            return await $fetch<T>(path, {
                baseURL: base,
                headers: {
                    Accept: 'application/json',
                    ...(token.value
                        ? { Authorization: `Bearer ${token.value}` }
                        : {}),
                    ...(opts.headers || {}),
                },
                ...opts,
            });
        } catch (err: any) {
            if (err?.response?.status === 401) {
                token.value = null;
                await navigateTo('/login');
            }
            throw err;
        }
    }

    return { request };
}
