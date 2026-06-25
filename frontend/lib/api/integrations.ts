import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
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

export const calendarApi = {
  getAuthUrl: () =>
    apiFetch<{ success: boolean; url: string }>('/api/v1/calendar/auth'),

  getStatus: () =>
    apiFetch<{ success: boolean; connected: boolean; email: string | null }>('/api/v1/calendar/status'),

  disconnect: () =>
    apiFetch<{ success: boolean; message: string }>('/api/v1/calendar/disconnect', { method: 'POST' }),

  createEvent: (data: { summary: string; description?: string; startTime: string; endTime: string }) =>
    apiFetch<{ success: boolean; event: any }>('/api/v1/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const whatsappApi = {
  sendTest: () =>
    apiFetch<{ success: boolean; message: string }>('/api/v1/whatsapp/test', { method: 'POST' }),

  send: (to: string, message: string) =>
    apiFetch<{ success: boolean; message: string }>('/api/v1/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ to, message }),
    }),

  sendReminder: (taskId: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/v1/whatsapp/remind/${taskId}`, { method: 'POST' }),
};
