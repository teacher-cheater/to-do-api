<script setup lang="ts">
import { navigateTo } from '#app';
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

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
    <div class="login-screen">
        <div class="login-card">
            <div class="login-header">
                <span class="brand">
                    <span class="dot"></span>
                    <span class="brand-text">TaskTracker</span>
                </span>
            </div>

            <h1 class="login-title">Вход</h1>
            <p class="login-subtitle">Войдите, чтобы увидеть свои задачи.</p>

            <form class="login-form" @submit.prevent="onSubmit">
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        class="form-input"
                        :class="{ 'is-error': fieldErrors.email }"
                        type="email"
                        placeholder="demo@example.com"
                        autocomplete="username"
                    />
                    <p v-if="fieldErrors.email" class="form-error">
                        {{ fieldErrors.email[0] }}
                    </p>
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Пароль</label>
                    <input
                        id="password"
                        v-model="password"
                        class="form-input"
                        :class="{ 'is-error': fieldErrors.password }"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                    />
                    <p v-if="fieldErrors.password" class="form-error">
                        {{ fieldErrors.password[0] }}
                    </p>
                </div>

                <div v-if="errorMessage" class="form-error-message">
                    {{ errorMessage }}
                </div>

                <button class="btn-login" type="submit" :disabled="submitting">
                    {{ submitting ? 'Входим…' : 'Войти' }}
                </button>
            </form>

            <div class="login-demo">
                <span class="demo-label">Демо-доступ:</span>
                <code class="demo-cred">demo@example.com</code>
                <span class="demo-sep">/</span>
                <code class="demo-cred">password</code>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-paper);
    background-image:
        linear-gradient(to right, var(--color-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-line) 1px, transparent 1px);
    background-size: 24px 24px;
    padding: 16px;
}

.login-card {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border: 1px solid var(--color-line);
    border-radius: 20px;
    padding: 32px 28px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.25s ease;
}

.login-card:hover {
    box-shadow: 0 16px 56px rgba(0, 0, 0, 0.12);
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand .dot {
    display: block;
    height: 10px;
    width: 10px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    flex-shrink: 0;
}

.brand-text {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--color-ink);
    letter-spacing: -0.5px;
}

.login-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 6px;
    text-align: center;
    letter-spacing: -0.5px;
}

.login-subtitle {
    font-size: 15px;
    color: var(--color-slate);
    margin: 0 0 28px;
    text-align: center;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.form-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-ink);
    letter-spacing: 0.3px;
}

.form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-family: var(--font-body);
    color: var(--color-ink);
    background: #fff;
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
    outline: none;
}

.form-input::placeholder {
    color: #b0b8b5;
}

.form-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(201, 96, 28, 0.12);
}

.form-input.is-error {
    border-color: var(--color-danger);
}

.form-input.is-error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.form-error {
    font-size: 12px;
    color: var(--color-danger);
    margin: 2px 0 0;
}

.form-error-message {
    font-size: 14px;
    color: var(--color-danger);
    background: var(--color-danger-bg);
    border: 1px solid #fecaca;
    border-radius: var(--radius-md);
    padding: 10px 14px;
    margin: 0;
}

.btn-login {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-ink);
    color: #fff;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition:
        opacity 0.2s,
        transform 0.1s;
    margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-login:active:not(:disabled) {
    transform: scale(0.98);
}

.btn-login:disabled {
    opacity: 0.5;
    cursor: default;
}

.login-demo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--color-line);
    flex-wrap: wrap;
}

.demo-label {
    font-size: 13px;
    color: var(--color-slate);
}

.demo-cred {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-ink);
    background: var(--color-paper);
    padding: 2px 8px;
    border-radius: 4px;
}

.demo-sep {
    color: var(--color-slate);
    font-size: 13px;
}

@media (max-width: 480px) {
    .login-card {
        padding: 24px 18px;
        border-radius: 16px;
    }

    .login-title {
        font-size: 24px;
    }

    .brand-text {
        font-size: 19px;
    }

    .login-demo {
        flex-direction: column;
        gap: 4px;
    }
}

@media (max-width: 360px) {
    .login-card {
        padding: 18px 14px;
    }

    .login-title {
        font-size: 20px;
    }

    .form-input {
        font-size: 13px;
        padding: 8px 12px;
    }
}
</style>
