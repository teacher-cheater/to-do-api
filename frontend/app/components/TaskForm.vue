<script setup lang="ts">
import type { Task, TaskStatus } from '~/types/task';

const props = defineProps<{
    task?: Task | null;
    saving?: boolean;
    serverErrors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (
        e: 'submit',
        payload: {
            title: string;
            description: string;
            due_date: string;
            status: TaskStatus;
        },
    ): void;
    (e: 'close'): void;
}>();

const title = ref(props.task?.title ?? '');
const description = ref(props.task?.description ?? '');
const dueDate = ref(props.task?.due_date ?? '');
const status = ref<TaskStatus>(props.task?.status ?? 'pending');

const clientErrors = ref<Record<string, string>>({});

function validate(): boolean {
    clientErrors.value = {};

    const trimmed = title.value.trim();
    if (trimmed.length < 3 || trimmed.length > 255) {
        clientErrors.value.title =
            'Заголовок должен быть от 3 до 255 символов.';
    }

    if (dueDate.value && Number.isNaN(Date.parse(dueDate.value))) {
        clientErrors.value.due_date = 'Некорректная дата.';
    }

    if (!['pending', 'in_progress', 'completed'].includes(status.value)) {
        clientErrors.value.status = 'Недопустимый статус.';
    }

    return Object.keys(clientErrors.value).length === 0;
}

function onSubmit() {
    if (!validate()) return;
    emit('submit', {
        title: title.value.trim(),
        description: description.value.trim(),
        due_date: dueDate.value,
        status: status.value,
    });
}

function errorFor(field: string): string | null {
    return (
        clientErrors.value[field] || props.serverErrors?.[field]?.[0] || null
    );
}
</script>

<template>
    <div class="modal-overlay">
        <div class="backdrop" @click="emit('close')" />

        <div class="modal-card">
            <div class="modal-header">
                <h2 class="modal-title">
                    {{ task ? 'Редактировать задачу' : 'Новая задача' }}
                </h2>
                <button class="close-btn" @click="emit('close')">×</button>
            </div>

            <form class="modal-form" @submit.prevent="onSubmit">
                <div class="field">
                    <label class="field-label">Заголовок *</label>
                    <input
                        v-model="title"
                        type="text"
                        class="field-input"
                        placeholder="Например, «Подготовить отчёт»"
                    />
                    <p v-if="errorFor('title')" class="field-error">
                        {{ errorFor('title') }}
                    </p>
                </div>

                <div class="field">
                    <label class="field-label">Описание</label>
                    <textarea
                        v-model="description"
                        rows="3"
                        class="field-input field-textarea"
                    />
                </div>

                <div class="field-grid">
                    <div class="field">
                        <label class="field-label">Дедлайн</label>
                        <input
                            v-model="dueDate"
                            type="date"
                            class="field-input"
                        />
                        <p v-if="errorFor('due_date')" class="field-error">
                            {{ errorFor('due_date') }}
                        </p>
                    </div>

                    <div class="field">
                        <label class="field-label">Статус</label>
                        <select
                            v-model="status"
                            class="field-input field-select"
                        >
                            <option value="pending">Ожидает</option>
                            <option value="in_progress">В работе</option>
                            <option value="completed">Готово</option>
                        </select>
                    </div>
                </div>

                <p v-if="errorFor('general')" class="form-error">
                    {{ errorFor('general') }}
                </p>

                <div class="modal-actions">
                    <button
                        type="button"
                        class="btn-secondary"
                        @click="emit('close')"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        :disabled="saving"
                        class="btn-primary"
                    >
                        {{ saving ? 'Сохранение…' : 'Сохранить' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
}

.backdrop {
    position: absolute;
    inset: 0;
    background: rgba(21, 26, 35, 0.4);
}

.modal-card {
    position: relative;
    width: 100%;
    max-width: 448px;
    background: #fff;
    border: 1px solid var(--color-line);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    padding: 24px;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.modal-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.close-btn {
    border: none;
    background: none;
    font-size: 20px;
    line-height: 1;
    color: var(--color-slate);
}

.close-btn:hover {
    color: var(--color-ink);
}

.modal-form {
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

.field-textarea {
    resize: none;
}

.field-select {
    background: #fff;
}

.field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
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

.modal-actions {
    display: flex;
    gap: 12px;
    padding-top: 8px;
}

.btn-secondary,
.btn-primary {
    flex: 1;
    border-radius: var(--radius-md);
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    transition:
        opacity 0.15s,
        background-color 0.15s;
}

.btn-secondary {
    border: 1px solid var(--color-line);
    background: #fff;
    color: var(--color-slate);
}

.btn-secondary:hover {
    background: var(--color-paper);
}

.btn-primary {
    border: none;
    background: var(--color-ink);
    color: #fff;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: default;
}
</style>
