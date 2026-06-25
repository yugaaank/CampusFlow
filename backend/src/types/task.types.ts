export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  add_to_calendar: boolean;
  created_at: string;
}

export interface CreateTaskDto {
  title: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  add_to_calendar?: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  subject?: string;
  description?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  add_to_calendar?: boolean;
}
