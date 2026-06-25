import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// All task routes require authentication
router.use(verifyToken as any);

router.get('/', getTasks as any);
router.get('/:id', getTask as any);
router.post('/', createTask as any);
router.put('/:id', updateTask as any);
router.delete('/:id', deleteTask as any);

export default router;
