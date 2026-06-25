import { Router } from 'express';
import { getAuthUrlHandler, handleCallback, getStatus, disconnect, createEvent } from '../controllers/calendar.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/auth', verifyToken as any, getAuthUrlHandler as any);
router.get('/callback', handleCallback as any);
router.get('/status', verifyToken as any, getStatus as any);
router.post('/disconnect', verifyToken as any, disconnect as any);
router.post('/events', verifyToken as any, createEvent as any);

export default router;
