import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getScopedClient } from '../config/supabase.js';
import { sendWhatsAppMessage, formatDeadlineReminder } from '../services/whatsapp.service.js';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Phone number and message are required' });
    }

    await sendWhatsAppMessage(to, message);
    res.json({ success: true, message: 'WhatsApp message sent' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendTestMessage = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone, name')
      .eq('id', req.userId!)
      .single();

    if (error || !profile?.phone) {
      return res.status(400).json({ success: false, message: 'No phone number found in your profile. Please add one first.' });
    }

    const testMessage = `👋 Hey ${profile.name || 'there'}! This is a test message from CampusFlow. Your WhatsApp notifications are working! 🎉`;
    await sendWhatsAppMessage(profile.phone, testMessage);

    res.json({ success: true, message: 'Test WhatsApp message sent!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendDeadlineReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const supabase = getScopedClient(req.token!);
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', req.userId!)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', req.userId!)
      .single();

    if (profileError || !profile?.phone) {
      return res.status(400).json({ success: false, message: 'No phone number in your profile' });
    }

    const message = formatDeadlineReminder(task.title, task.subject, task.deadline);
    await sendWhatsAppMessage(profile.phone, message);

    res.json({ success: true, message: 'Deadline reminder sent via WhatsApp' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
