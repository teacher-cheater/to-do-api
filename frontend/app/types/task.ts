export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: number
  user_id: number
  title: string
  description: string | null
  due_date: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface TaskFilters {
  status?: TaskStatus | ''
  search?: string
  sort_by?: 'due_date' | 'status' | 'created_at' | 'title'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
