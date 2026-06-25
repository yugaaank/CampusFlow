import { Router } from 'express';
import { sendWhatsAppMessage, formatDeadlineReminder, formatNoticeBroadcast } from '../services/whatsapp.service.js';

const router = Router();

// POST /api/v1/webhooks/deadline — triggered by n8n for deadline reminders
router.post('/deadline', async (req, res) => {
  try {
    const { studentName, phone, taskTitle, deadline, subject } = req.body;

    if (!phone || !taskTitle) {
      return res.status(400).json({ success: false, message: 'phone and taskTitle are required' });
    }

    const message = formatDeadlineReminder(taskTitle, subject, deadline);
    const sent = await sendWhatsAppMessage(phone, message);

    res.json({ success: true, sent, message: 'Deadline reminder processed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/webhooks/notice — triggered by n8n for notice broadcasts
router.post('/notice', async (req, res) => {
  try {
    const { noticeText, summary, eventDate, phoneList } = req.body;

    if (!phoneList || !Array.isArray(phoneList) || phoneList.length === 0) {
      return res.status(400).json({ success: false, message: 'phoneList array is required' });
    }

    const message = formatNoticeBroadcast(summary || noticeText, eventDate);

    const results = await Promise.allSettled(
      phoneList.map((phone: string) => sendWhatsAppMessage(phone, message))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({ success: true, sent, failed, total: phoneList.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
