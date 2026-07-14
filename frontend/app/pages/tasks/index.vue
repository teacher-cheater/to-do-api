<script setup lang="ts">
import type { Task, TaskStatus } from '~/types/task';

const { user, logout } = useAuth();
const {
    tasks,
    meta,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
} = useTasks();

const statusFilter = ref<TaskStatus | ''>('');
const search = ref('');
const sortBy = ref<'due_date' | 'status' | 'created_at' | 'title'>(
    'created_at',
);
const sortDir = ref<'asc' | 'desc'>('desc');
const page = ref(1);

const showForm = ref(false);
const editingTask = ref<Task | null>(null);
const saving = ref(false);
const serverErrors = ref<Record<string, string[]>>({});
const deletingId = ref<number | null>(null);

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

function load() {
    fetchTasks({
        status: statusFilter.value || undefined,
        search: search.value || undefined,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
        page: page.value,
        per_page: 10,
    });
}

watch([statusFilter, sortBy, sortDir], () => {
    page.value = 1;
    load();
});

watch(search, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        page.value = 1;
        load();
    }, 350);
});

watch(page, load);

onMounted(load);

function openCreate() {
    editingTask.value = null;
    serverErrors.value = {};
    showForm.value = true;
}

function openEdit(task: Task) {
    editingTask.value = task;
    serverErrors.value = {};
    showForm.value = true;
}

async function handleSubmit(payload: any) {
    saving.value = true;
    serverErrors.value = {};
    try {
        if (editingTask.value) {
            await updateTask(editingTask.value.id, payload);
        } else {
            await createTask(payload);
        }
        showForm.value = false;
        await load();
    } catch (err: any) {
        if (err?.response?.status === 422) {
            serverErrors.value = err.data?.errors || {};
        } else if (err?.response?.status === 403) {
            serverErrors.value = {
                general: ['У вас нет прав на изменение этой задачи.'],
            };
        } else {
            serverErrors.value = {
                general: ['Не удалось сохранить задачу. Попробуйте ещё раз.'],
            };
        }
    } finally {
        saving.value = false;
    }
}

async function handleDelete(task: Task) {
    if (!confirm(`Удалить задачу «${task.title}»?`)) return;
    deletingId.value = task.id;
    try {
        await deleteTask(task.id);
        await load();
    } catch {
        alert('Не удалось удалить задачу.');
    } finally {
        deletingId.value = null;
    }
}

async function handleLogout() {
    await logout();
    await navigateTo('/login');
}
</script>

<template>
    <div class="tasks-screen bg-grid">
        <header class="topbar">
            <div class="topbar-inner">
                <div class="brand">
                    <span class="dot" />
                    <span class="brand-text">Задачи</span>
                </div>
                <div class="topbar-right">
                    <span class="user-name">{{ user?.name }}</span>
                    <span v-if="user?.role === 'admin'" class="admin-badge"
                        >admin</span
                    >
                    <button class="link-btn" @click="handleLogout">
                        Выйти
                    </button>
                </div>
            </div>
        </header>

        <main class="content">
            <div class="toolbar">
                <input
                    v-model="search"
                    type="search"
                    placeholder="Поиск по заголовку…"
                    class="toolbar-search"
                />

                <select v-model="statusFilter" class="toolbar-select">
                    <option value="">Все статусы</option>
                    <option value="pending">Ожидает</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Готово</option>
                </select>

                <select v-model="sortBy" class="toolbar-select">
                    <option value="created_at">По дате создания</option>
                    <option value="due_date">По дедлайну</option>
                    <option value="status">По статусу</option>
                    <option value="title">По названию</option>
                </select>

                <button
                    class="toolbar-sort-btn"
                    @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
                >
                    {{ sortDir === 'asc' ? '↑' : '↓' }}
                </button>

                <button class="btn-primary" @click="openCreate">
                    + Задача
                </button>
            </div>

            <div v-if="loading" class="skeleton-list">
                <div v-for="i in 4" :key="i" class="skeleton-row" />
            </div>

            <div v-else-if="error" class="state-box state-box--error">
                {{ error }}
                <button class="retry-btn" @click="load">Повторить</button>
            </div>

            <div
                v-else-if="tasks.length === 0"
                class="state-box state-box--empty"
            >
                <p class="empty-title">Задач пока нет</p>
                <p class="empty-subtitle">
                    Добавьте первую задачу, чтобы начать планирование.
                </p>
                <button class="btn-primary" @click="openCreate">
                    + Задача
                </button>
            </div>

            <section v-else class="task-list">
                <TaskItem
                    v-for="task in tasks"
                    :key="task.id"
                    :task="task"
                    :class="{ 'is-deleting': deletingId === task.id }"
                    @edit="openEdit(task)"
                    @delete="handleDelete(task)"
                />
            </section>

            <div v-if="meta && meta.last_page > 1" class="pagination">
                <button class="page-btn" :disabled="page <= 1" @click="page--">
                    Назад
                </button>
                <span class="page-info"
                    >{{ meta.current_page }} / {{ meta.last_page }}</span
                >
                <button
                    class="page-btn"
                    :disabled="page >= meta.last_page"
                    @click="page++"
                >
                    Вперёд
                </button>
            </div>
        </main>

        <TaskForm
            v-if="showForm"
            :task="editingTask"
            :saving="saving"
            :server-errors="serverErrors"
            @submit="handleSubmit"
            @close="showForm = false"
        />
    </div>
</template>

<style scoped>
.tasks-screen {
    min-height: 100vh;
}

.topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid var(--color-line);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(6px);
}

.topbar-inner {
    max-width: 768px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
}

.dot {
    height: 8px;
    width: 8px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
}

.brand-text {
    font-family: var(--font-display);
    font-weight: 600;
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
}

.user-name {
    color: var(--color-slate);
}

.admin-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--color-ink);
    color: #fff;
    border-radius: var(--radius-full);
    padding: 2px 8px;
}

.link-btn {
    border: none;
    background: none;
    color: var(--color-slate);
}

.link-btn:hover {
    color: var(--color-ink);
}

.content {
    max-width: 768px;
    margin: 0 auto;
    padding: 32px 16px;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.toolbar-search {
    flex: 1;
    min-width: 176px;
    border: 1px solid var(--color-line);
    background: #fff;
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
}

.toolbar-search:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(201, 96, 28, 0.15);
}

.toolbar-select {
    border: 1px solid var(--color-line);
    background: #fff;
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
}

.toolbar-sort-btn {
    border: 1px solid var(--color-line);
    background: #fff;
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-family: var(--font-mono);
    color: var(--color-slate);
}

.toolbar-sort-btn:hover {
    color: var(--color-ink);
}

.btn-primary {
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-ink);
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: opacity 0.15s;
}

.btn-primary:hover {
    opacity: 0.9;
}

.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.skeleton-row {
    height: 3.5rem;
    border-radius: 0.75rem;
    background: #fff;
    border: 1px solid var(--color-line);
    animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.state-box {
    border-radius: 0.75rem;
    padding: 1.5rem 1rem;
    text-align: center;
    font-size: 0.875rem;
}

.state-box--error {
    border: 1px solid #fecaca;
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.state-box--empty {
    border: 1px dashed var(--color-line);
    background: #fff;
    padding: 3rem 1rem;
}

.retry-btn {
    display: block;
    margin: 0.5rem auto 0;
    border: none;
    background: none;
    text-decoration: underline;
    color: inherit;
}

.empty-title {
    margin: 0 0 0.25rem;
    color: var(--color-ink);
    font-weight: 500;
}

.empty-subtitle {
    margin: 0 0 1rem;
    color: var(--color-slate);
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.task-list :deep(.is-deleting) {
    opacity: 0.4;
    pointer-events: none;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    font-size: 0.875rem;
}

.page-btn {
    border: 1px solid var(--color-line);
    background: #fff;
    border-radius: var(--radius-md);
    padding: 0.35rem 0.75rem;
}

.page-btn:disabled {
    opacity: 0.4;
}

.page-info {
    font-family: var(--font-mono);
    color: var(--color-slate);
}
</style>
