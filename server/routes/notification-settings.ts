import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { prisma } from "../db-prisma";
import { z } from "zod";
import { logger } from "../lib/logger";
import { sendTelegramMessage } from "../lib/telegram-notifications";

const router = Router();
router.use(requireAuth);

const updateSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  notificationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  notificationDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  firstName: z.string().min(1).max(100).optional(),
});

// GET /api/notification-settings - получить настройки уведомлений
router.get("/", async (req, res, next) => {
  try {
    // Авторизация отключена - всегда используем userId из заголовка или default-user
    const userId = getUserId(req) || (req as any).userId || "default-user";

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        notificationsEnabled: true,
        notificationTime: true,
        notificationDays: true,
        telegramId: true,
        firstName: true,
      },
    });

    // Если пользователь не найден, возвращаем дефолтные настройки
    if (!user) {
      return res.json({
        settings: {
          notificationsEnabled: true,
          notificationTime: '09:00',
          notificationDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          telegramId: null,
          firstName: null,
        },
      });
    }

    res.json({
      settings: {
        notificationsEnabled: user.notificationsEnabled ?? true,
        notificationTime: user.notificationTime || '09:00',
        notificationDays: user.notificationDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        telegramId: user.telegramId,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notification-settings - обновить настройки уведомлений
router.put("/", async (req, res, next) => {
  try {
    // Авторизация отключена - всегда используем userId из заголовка или default-user
    const userId = getUserId(req) || (req as any).userId || "default-user";

    const parsed = updateSettingsSchema.parse(req.body);

    const updateData: any = {};
    if (parsed.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = parsed.notificationsEnabled;
    }
    if (parsed.notificationTime !== undefined) {
      updateData.notificationTime = parsed.notificationTime;
    }
    if (parsed.notificationDays !== undefined) {
      updateData.notificationDays = parsed.notificationDays;
    }
    if (parsed.firstName !== undefined) {
      updateData.firstName = parsed.firstName;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        notificationsEnabled: true,
        notificationTime: true,
        notificationDays: true,
        telegramId: true,
        firstName: true,
      },
    });

    res.json({
      settings: {
        notificationsEnabled: user.notificationsEnabled ?? true,
        notificationTime: user.notificationTime || '09:00',
        notificationDays: user.notificationDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        telegramId: user.telegramId,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

// POST /api/notification-settings/test - тестовая отправка уведомления
router.post("/test", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramId: true,
        firstName: true,
        notificationsEnabled: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.telegramId) {
      return res.status(400).json({ 
        error: "Telegram ID not found", 
        message: "У вас не подключен Telegram. Авторизуйтесь через Telegram WebApp." 
      });
    }

    if (!user.notificationsEnabled) {
      return res.status(400).json({ 
        error: "Notifications disabled", 
        message: "Уведомления отключены. Включите их в настройках." 
      });
    }

    const greeting = user.firstName 
      ? `Ас-саляму алейкум, ${user.firstName}!`
      : 'Ас-саляму алейкум!';

    const testMessage = `${greeting}\n\n<b>Тестовое уведомление</b>\n\nЕсли вы получили это сообщение, значит уведомления настроены правильно!\n\nТеперь вы будете получать умные напоминания о ваших целях каждый день.`;

    const success = await sendTelegramMessage({
      chatId: user.telegramId,
      text: testMessage,
    });

    if (success) {
      res.json({ 
        success: true, 
        message: "Тестовое уведомление отправлено!" 
      });
    } else {
      res.status(500).json({ 
        error: "Failed to send test notification",
        message: "Не удалось отправить тестовое уведомление. Проверьте настройки бота." 
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

