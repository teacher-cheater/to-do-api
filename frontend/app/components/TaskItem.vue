<script setup lang="ts">
import type { Task } from '~/types/task';

defineProps<{ task: Task }>();
const emit = defineEmits<{ (e: 'edit'): void; (e: 'delete'): void }>();

const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    in_progress: 'В работе',
    completed: 'Готово',
};

const statusClass: Record<string, string> = {
    pending: 'is-pending',
    in_progress: 'is-progress',
    completed: 'is-done',
};

function formatDate(value: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
    });
}
</script>

<template>
    <div class="task-row">
        <span class="status-dot" :class="statusClass[task.status]" />

        <div class="task-main">
            <p class="task-title">{{ task.title }}</p>
            <p v-if="task.description" class="task-desc">
                {{ task.description }}
            </p>
        </div>

        <span v-if="task.due_date" class="task-date">
            {{ formatDate(task.due_date) }}
        </span>

        <span class="task-status">{{ statusLabels[task.status] }}</span>

        <div class="task-actions">
            <button class="action-btn" @click="emit('edit')">Изменить</button>
            <button
                class="action-btn action-btn--danger"
                @click="emit('delete')"
            >
                Удалить
            </button>
        </div>
    </div>
</template>

<style scoped>
.task-row {
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid var(--color-line);
    background: #fff;
    border-radius: 12px;
    padding: 12px 16px;
    transition: border-color 0.15s;
}

.task-row:hover {
    border-color: rgba(21, 26, 35, 0.2);
}

.task-row:hover .task-actions {
    opacity: 1;
}

.status-dot {
    flex-shrink: 0;
    height: 10px;
    width: 10px;
    border-radius: var(--radius-full);
}
.status-dot.is-pending {
    background: var(--color-pending);
}
.status-dot.is-progress {
    background: var(--color-progress);
}
.status-dot.is-done {
    background: var(--color-done);
}

.task-main {
    min-width: 0;
    flex: 1;
}

.task-title {
    margin: 0;
    font-weight: 500;
    font-size: 14px;
    color: var(--color-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.task-desc {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--color-slate);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.task-date {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-slate);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-full);
    padding: 2px 10px;
}

.task-status {
    flex-shrink: 0;
    width: 80px;
    font-size: 12px;
    color: var(--color-slate);
}

.task-actions {
    flex-shrink: 0;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;
}

.action-btn {
    border: none;
    background: none;
    border-radius: var(--radius-md);
    padding: 4px 8px;
    font-size: 12px;
    color: var(--color-slate);
}

.action-btn:hover {
    color: var(--color-ink);
    background: var(--color-paper);
}

.action-btn--danger {
    color: var(--color-danger);
}

.action-btn--danger:hover {
    background: var(--color-danger-bg);
}

@media (max-width: 640px) {
    .task-date,
    .task-status {
        display: none;
    }
}
</style>
