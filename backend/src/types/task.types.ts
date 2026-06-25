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
