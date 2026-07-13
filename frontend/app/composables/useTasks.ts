import type { Paginated, Task, TaskFilters } from '~/types/task';

export function useTasks() {
    const { request } = useApi();

    const tasks = useState<Task[]>('tasks:list', () => []);
    const meta = useState<Paginated<Task>['meta'] | null>(
        'tasks:meta',
        () => null,
    );
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchTasks(filters: TaskFilters = {}) {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                }
            });
            const query = params.toString();
            const res = await request<Paginated<Task>>(
                `/api/tasks${query ? `?${query}` : ''}`,
            );
            tasks.value = res.data;
            meta.value = res.meta;
        } catch (e: any) {
            error.value = e?.data?.message || 'Не удалось загрузить задачи.';
        } finally {
            loading.value = false;
        }
    }

    async function createTask(payload: Partial<Task>) {
        const res = await request<{ data: Task }>('/api/tasks', {
            method: 'POST',
            body: payload,
        });
        return res.data;
    }

    async function updateTask(id: number, payload: Partial<Task>) {
        const res = await request<{ data: Task }>(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: payload,
        });
        return res.data;
    }

    async function deleteTask(id: number) {
        await request(`/api/tasks/${id}`, { method: 'DELETE' });
    }

    return {
        tasks,
        meta,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
    };
}
