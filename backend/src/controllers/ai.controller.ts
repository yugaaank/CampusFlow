import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { getScopedClient } from '../config/supabase.js';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key', // Ensure GROQ_API_KEY is in .env
});

export const summarizeNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { noticeText } = req.body;

    if (!noticeText) {
      return res.status(400).json({ success: false, message: 'Notice text is required' });
    }

    const prompt = `
You are an AI assistant for a college productivity app called CampusFlow.
The user has provided a college notice below. Extract the following information and output it EXACTLY in this JSON format (do not wrap in markdown blocks, just return raw JSON):

{
  "summary": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "eventDate": "YYYY-MM-DD" (or null if no specific date)
}

College Notice:
"""
${noticeText}
"""
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const studyBuddy = async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ success: false, message: 'Lecture notes are required' });
    }

    const prompt = `
You are an AI Study Buddy for a college productivity app called CampusFlow.
The user has provided their lecture notes below. Extract the following study materials and output it EXACTLY in this JSON format (do not wrap in markdown blocks, just return raw JSON):

{
  "summary": "A concise 2-3 paragraph summary of the notes.",
  "flashcards": [
    { "front": "Question/Concept 1", "back": "Answer/Definition 1" },
    { "front": "Question/Concept 2", "back": "Answer/Definition 2" }
  ],
  "quizzes": [
    {
      "question": "Sample multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    }
  ]
}

Make sure to generate at least 5 flashcards and 3 quiz questions based strictly on the notes.

Lecture Notes:
"""
${notes}
"""
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const dailyBriefing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const supabase = getScopedClient(req.token);
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('title, priority, deadline')
      .eq('completed', false);

    if (error) throw error;

    if (!tasks || tasks.length === 0) {
      return res.json({ success: true, data: { briefing: "You have no pending tasks! Great job catching up. Take some time to relax or get ahead." } });
    }

    const taskList = tasks.map((t: any) => `- ${t.title} (Priority: ${t.priority}, Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'None'})`).join('\\n');

    const prompt = `
You are an encouraging AI assistant for a college productivity app called CampusFlow.
The user has the following pending tasks:
${taskList}

Write a short, engaging, and highly motivating 2-3 sentence daily briefing. Focus on what's important (high priority or upcoming deadlines). Use emojis.
Output exactly in JSON format:
{ "briefing": "Your encouraging briefing here." }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
