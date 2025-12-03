import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { prisma } from "../db-prisma";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

const telegramAuthSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photoUrl: z.string().optional(),
  initData: z.string().optional(),
});

// Валидация данных от Telegram (для продакшена)
function validateTelegramData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return false;
  }
}

router.post("/auth", async (req, res, next) => {
  try {
    const parsed = telegramAuthSchema.parse(req.body);
    
    // В продакшене валидировать initData
    if (parsed.initData && process.env.TELEGRAM_BOT_TOKEN) {
      const isValid = validateTelegramData(parsed.initData, process.env.TELEGRAM_BOT_TOKEN);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid Telegram data" });
      }
    }
    
    // Создать или найти пользователя по Telegram ID
    const telegramId = `tg_${parsed.id}`;
    
    // Попробовать найти по ID (если был создан с таким ID)
    let user = await storage.getUser(telegramId);
    
    if (!user) {
      // Попробовать найти по username
      const telegramUsername = `tg_user_${parsed.id}`;
      user = await storage.getUserByUsername(telegramUsername);
    }
    
    if (!user) {
      // Создать нового пользователя
      // Для Telegram пользователей пароль не требуется, но Prisma требует
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const username = parsed.username 
        ? `tg_${parsed.username}` 
        : `tg_user_${parsed.id}`;
      
      // Создать через Prisma напрямую с указанным ID
      user = await prisma.user.create({
        data: {
          id: telegramId,
          username: username,
          password: await storage.hashPassword(randomPassword),
        },
      });
    }
    
    // Установить сессию
    req.session!.userId = user.id;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

export default router;

