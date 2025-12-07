import { logger } from './logger';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

interface SendMessageParams {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

/**
 * Отправка сообщения в Telegram через Bot API
 */
export async function sendTelegramMessage(params: SendMessageParams): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode || 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Failed to send Telegram message:', {
        status: response.status,
        error: errorData,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Проверка, доступен ли Telegram Bot API
 */
export async function checkTelegramAvailability(): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/getMe`);
    return response.ok;
  } catch {
    return false;
  }
}

