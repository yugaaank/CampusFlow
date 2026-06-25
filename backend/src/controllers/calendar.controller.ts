import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getScopedClient } from '../config/supabase.js';
import { getAuthUrl, getTokensFromCode, createCalendarEvent, getCalendarEmail, revokeTokens } from '../services/google-calendar.service.js';

export const getAuthUrlHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const url = getAuthUrl(userId);
    res.json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).json({ success: false, message: 'Missing code or state' });
    }

    const tokens = await getTokensFromCode(code as string);

    if (!tokens.refresh_token) {
      return res.status(400).json({ success: false, message: 'No refresh token received - please re-authorize' });
    }

    const calendarEmail = await getCalendarEmail(tokens.refresh_token);

    const supabase = getScopedClient(req.token!);
    const { error } = await supabase
      .from('profiles')
      .update({
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_email: calendarEmail,
      })
      .eq('id', userId as string);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/profile?calendar=connected`);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_email, google_calendar_refresh_token')
      .eq('id', req.userId!)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      connected: !!data?.google_calendar_refresh_token,
      email: data?.google_calendar_email || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disconnect = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_calendar_refresh_token')
      .eq('id', req.userId!)
      .single();

    if (profile?.google_calendar_refresh_token) {
      try {
        await revokeTokens(profile.google_calendar_refresh_token);
      } catch {
        // Token revocation may fail if already revoked
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        google_calendar_refresh_token: null,
        google_calendar_email: null,
      })
      .eq('id', req.userId!);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { summary, description, startTime, endTime } = req.body;

    if (!summary || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'summary, startTime, and endTime are required' });
    }

    const supabase = getScopedClient(req.token!);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_calendar_refresh_token')
      .eq('id', req.userId!)
      .single();

    if (profileError || !profile?.google_calendar_refresh_token) {
      return res.status(400).json({ success: false, message: 'Google Calendar not connected' });
    }

    const event = await createCalendarEvent(profile.google_calendar_refresh_token, {
      summary,
      description,
      startTime,
      endTime,
    });

    res.json({ success: true, event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
