import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
}

export interface CreateTaskDto {
  title: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskDto {
  title?: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  if (!('auth' in supabase) || typeof supabase.auth?.getSession !== 'function') return null;
  const { data } = await (supabase as any).auth.getSession();
  return data?.session?.access_token ?? null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API error');
  return json;
}

export const tasksApi = {
  getAll: (completed?: boolean) => {
    const qs = completed !== undefined ? `?completed=${completed}` : '';
    return apiFetch<{ success: boolean; tasks: Task[] }>(`/api/v1/tasks${qs}`);
  },
  getOne: (id: string) =>
    apiFetch<{ success: boolean; task: Task }>(`/api/v1/tasks/${id}`),
  create: (dto: CreateTaskDto) =>
    apiFetch<{ success: boolean; task: Task }>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: UpdateTaskDto) =>
    apiFetch<{ success: boolean; task: Task }>(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/v1/tasks/${id}`, {
      method: 'DELETE',
    }),
};
