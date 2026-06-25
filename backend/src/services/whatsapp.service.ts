const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

const getConfig = () => ({
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
});

export const sendWhatsAppMessage = async (to: string, body: string): Promise<boolean> => {
  const { token, phoneNumberId } = getConfig();

  if (!token || !phoneNumberId) {
    console.warn('WhatsApp Cloud API not configured. Skipping message.');
    return false;
  }

  const formattedTo = to.startsWith('+') ? to.replace(/^\+/, '') : to;

  try {
    const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: 'text',
        text: { body },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    return true;
  } catch (error: any) {
    console.error('WhatsApp Cloud API error:', error);
    throw new Error(error.message || 'Failed to send WhatsApp message');
  }
};

export const formatDeadlineReminder = (taskTitle: string, subject: string | undefined, deadline: string): string => {
  const date = new Date(deadline);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `📚 CampusFlow Reminder\n\n`;
  message += `Your task "${taskTitle}"`;
  if (subject) message += ` (${subject})`;
  message += ` is due on ${formattedDate}.\n\n`;
  message += `Stay on top of your work! 💪`;

  return message;
};

export const formatNoticeBroadcast = (summary: string, eventDate?: string): string => {
  let message = `📢 CampusFlow Notice\n\n`;
  message += `${summary}\n`;
  if (eventDate) {
    message += `\n📅 Date: ${eventDate}`;
  }
  message += `\n\nStay informed! ✨`;
  return message;
};
