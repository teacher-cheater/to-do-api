<script setup lang="ts">
const email = ref('demo@example.com');
const password = ref('password');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[]>>({});

const { login } = useAuth();

async function onSubmit() {
    errorMessage.value = null;
    fieldErrors.value = {};

    if (!email.value || !password.value) {
        errorMessage.value = 'Введите email и пароль.';
        return;
    }

    submitting.value = true;
    try {
        await login(email.value, password.value);
        await navigateTo('/tasks');
    } catch (err: any) {
        if (err?.response?.status === 422) {
            fieldErrors.value = err.data?.errors || {};
            errorMessage.value =
                err.data?.message || 'Проверьте введённые данные.';
        } else {
            errorMessage.value = 'Не удалось войти. Попробуйте ещё раз.';
        }
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <div class="login-screen bg-grid">
        <div class="login-card-wrap">
            <div class="login-brand">
                <span class="dot" />
                <span class="brand-text">Task tracker</span>
            </div>

            <div class="login-card">
                <h1 class="login-title">Вход</h1>
                <p class="login-subtitle">
                    Войдите, чтобы увидеть свои задачи.
                </p>

                <form class="login-form" @submit.prevent="onSubmit">
                    <div class="field">
                        <label class="field-label" for="email">Email</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            autocomplete="username"
                            class="field-input"
                        />
                        <p v-if="fieldErrors.email" class="field-error">
                            {{ fieldErrors.email[0] }}
                        </p>
                    </div>

                    <div class="field">
                        <label class="field-label" for="password">Пароль</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            class="field-input"
                        />
                        <p v-if="fieldErrors.password" class="field-error">
                            {{ fieldErrors.password[0] }}
                        </p>
                    </div>

                    <p v-if="errorMessage" class="form-error">
                        {{ errorMessage }}
                    </p>

                    <button
                        type="submit"
                        :disabled="submitting"
                        class="btn-primary btn-block"
                    >
                        {{ submitting ? 'Входим…' : 'Войти' }}
                    </button>
                </form>

                <p class="login-hint">
                    Демо-доступ: <span class="mono">demo@example.com</span> /
                    <span class="mono">password</span>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
}

.login-card-wrap {
    width: 100%;
    max-width: 400px;
}

.login-brand {
    margin-bottom: 32px;
    text-align: center;
}

.dot {
    display: inline-block;
    height: 8px;
    width: 8px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    vertical-align: middle;
    margin-right: 8px;
}

.brand-text {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-slate);
}

.login-card {
    background: #fff;
    border: 1px solid var(--color-line);
    border-radius: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    padding: 32px;
}

.login-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px;
}

.login-subtitle {
    font-size: 14px;
    color: var(--color-slate);
    margin: 0 0 24px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-slate);
    margin-bottom: 4px;
}

.field-input {
    width: 100%;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}

.field-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(201, 96, 28, 0.15);
}

.field-error {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--color-danger);
}

.form-error {
    margin: 0;
    font-size: 14px;
    color: var(--color-danger);
}

.btn-primary {
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-ink);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    padding: 10px 16px;
    transition: opacity 0.15s;
    cursor: pointer;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: default;
}
</style>
