import type { User } from '~/types/task';

export function useAuth() {
    const user = useState<User | null>('auth:user', () => null);
    const authChecked = useState<boolean>('auth:checked', () => false);
    const { request } = useApi();

    async function fetchUser() {
        try {
            const res = await request<{ data: User }>('/api/user');
            user.value = res.data;
        } catch {
            user.value = null;
        } finally {
            authChecked.value = true;
        }
    }

    async function login(email: string, password: string) {
        await request('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        await fetchUser();
    }

    async function logout() {
        try {
            await request('/api/auth/logout', { method: 'POST' });
        } finally {
            user.value = null;
        }
    }

    return { user, authChecked, fetchUser, login, logout };
}
function useApi() {
    async function request<T = any>(
        url: string,
        options: {
            method?: string;
            body?: unknown;
            headers?: Record<string, string>;
        } = {},
    ): Promise<T> {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            method: options.method ?? 'GET',
            headers,
            body:
                options.body !== undefined
                    ? JSON.stringify(options.body)
                    : undefined,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Request failed with status ${response.status}: ${errorText}`,
            );
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            return (await response.json()) as T;
        }

        return (await response.text()) as unknown as T;
    }

    return { request };
}
