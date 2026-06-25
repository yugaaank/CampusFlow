import type { Response } from 'express';
import { supabase } from '../config/supabase.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { CreateTaskDto, UpdateTaskDto } from '../types/task.types.js';

// GET /api/v1/tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { completed } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, tasks: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/tasks/:id
export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/tasks
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, subject, description, deadline, priority, add_to_calendar }: CreateTaskDto = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: userId,
        title,
        subject: subject || null,
        description: description || null,
        deadline: deadline || null,
        priority: priority || 'medium',
        add_to_calendar: add_to_calendar || false,
        completed: false,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, task: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates: UpdateTaskDto = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Task not found or update failed' });
    }

    res.json({ success: true, task: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
