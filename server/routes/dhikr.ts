import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, getUserId } from "../middleware/auth";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

const BOT_REPLIKA_API_URL = process.env.BOT_REPLIKA_API_URL || "https://Bot.e-replika.ru/docs";
const TEST_TOKEN = process.env.TEST_TOKEN || "test_token_123";

// Получить каталог дуа и азкаров из Bot.e-replika.ru
router.get("/catalog", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Запрос к Bot.e-replika.ru API
    const response = await fetch(`${BOT_REPLIKA_API_URL}/catalog`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TEST_TOKEN}`,
        "X-User-Id": userId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Если API недоступен, возвращаем ошибку
      return res.status(response.status).json({
        error: "Failed to fetch catalog from Bot.e-replika.ru",
        message: `API returned status ${response.status}`,
      });
    }

    const catalog = await response.json();
    res.json({ catalog });
  } catch (error: any) {
    console.error("Error fetching catalog from Bot.e-replika.ru:", error);
    
    // Если ошибка сети или API недоступен, возвращаем понятную ошибку
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Bot.e-replika.ru API unavailable",
        message: "Не удалось подключиться к API Bot.e-replika.ru. Проверьте BOT_REPLIKA_API_URL.",
      });
    }
    
    next(error);
  }
});

// Получить каталог по категории
router.get("/catalog/:category", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const category = req.params.category; // dua, azkar, salawat, kalima

    // Запрос к Bot.e-replika.ru API
    const response = await fetch(`${BOT_REPLIKA_API_URL}/catalog/${category}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TEST_TOKEN}`,
        "X-User-Id": userId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch catalog category",
        message: `API returned status ${response.status}`,
      });
    }

    const data = await response.json();
    res.json({ items: data.items || data });
  } catch (error: any) {
    console.error(`Error fetching catalog category ${category}:`, error);
    
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "Bot.e-replika.ru API unavailable",
        message: "Не удалось подключиться к API Bot.e-replika.ru.",
      });
    }
    
    next(error);
  }
});

router.get("/logs", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await storage.getDhikrLogs(userId, limit);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

router.get("/logs/session/:sessionId", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const logs = await storage.getDhikrLogsBySession(req.params.sessionId, userId);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

router.post("/logs", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = req.body;
    const log = await storage.createDhikrLog(userId, parsed);
    res.status(201).json({ log });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

router.get("/daily-azkar/:dateLocal", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const azkar = await storage.getDailyAzkar(userId, req.params.dateLocal);
    if (!azkar) {
      return res.status(404).json({ error: "Daily azkar not found" });
    }
    res.json({ azkar });
  } catch (error) {
    next(error);
  }
});

router.post("/daily-azkar", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = req.body;
    const azkar = await storage.upsertDailyAzkar(userId, parsed);
    res.json({ azkar });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    next(error);
  }
});

export default router;

