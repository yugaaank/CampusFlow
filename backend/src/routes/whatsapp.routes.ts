import { Router } from 'express';
import { sendMessage, sendTestMessage, sendDeadlineReminder } from '../controllers/whatsapp.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/send', verifyToken as any, sendMessage as any);
router.post('/test', verifyToken as any, sendTestMessage as any);
router.post('/remind/:taskId', verifyToken as any, sendDeadlineReminder as any);

export default router;
