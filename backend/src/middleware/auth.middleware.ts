import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Validate the token directly against Supabase Auth — no local JWT secret needed.
    // Supabase signs its own tokens, so we must ask Supabase to verify them.
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.userId = data.user.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};
