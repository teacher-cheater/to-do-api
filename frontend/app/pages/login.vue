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
    <div>
        <h1>Вход</h1>
        <p>Войдите, чтобы увидеть свои задачи.</p>

        <form @submit.prevent="onSubmit">
            <div>
                <label for="email"> Email </label>
                <input
                    id="email"
                    v-model="email"
                    type="email"
                    autocomplete="username"
                />
                <p v-if="fieldErrors.email">
                    {{ fieldErrors.email[0] }}
                </p>
            </div>

            <div>
                <label for="password"> Пароль </label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    autocomplete="current-password"
                />
                <p v-if="fieldErrors.password">
                    {{ fieldErrors.password[0] }}
                </p>
            </div>

            <p v-if="errorMessage">
                {{ errorMessage }}
            </p>

            <button type="submit" :disabled="submitting">
                {{ submitting ? 'Входим…' : 'Войти' }}
            </button>
        </form>

        <p>
            Демо-доступ:
            <span>demo@example.com</span> /
            <span>password</span>
        </p>
    </div>
</template>
