import type { User } from '~/types/task';

export function useAuth() {
    const user = useState<User | null>('auth:user', () => null);
    const authChecked = useState<boolean>('auth:checked', () => false);
    const token = useAuthToken();
    const { request } = useApi();

    async function fetchUser() {
        if (!token.value) {
            user.value = null;
            authChecked.value = true;
            return;
        }

        try {
            const res = await request<{ data: User }>('/api/user');
            user.value = res.data;
        } catch {
            user.value = null;
            token.value = null;
        } finally {
            authChecked.value = true;
        }
    }

    async function login(email: string, password: string) {
        const res = await request<{ data: User; token: string }>(
            '/api/auth/login',
            {
                method: 'POST',
                body: { email, password },
            },
        );
        token.value = res.token;
        user.value = res.data;
        authChecked.value = true;
    }

    async function logout() {
        try {
            await request('/api/auth/logout', { method: 'POST' });
        } finally {
            token.value = null;
            user.value = null;
        }
    }

    return { user, authChecked, fetchUser, login, logout };
}
