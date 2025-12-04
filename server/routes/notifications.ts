import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { botReplikaGet, botReplikaPost, botReplikaPatch, getUserIdForApi } from "../lib/bot-replika-api";

const router = Router();
router.use(requireAuth);

// GET /api/notifications - получить все уведомления
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const { read, limit } = req.query;
      let path = "/notifications";
      const params: string[] = [];
      if (read !== undefined) params.push(`read=${read}`);
      if (limit) params.push(`limit=${limit}`);
      if (params.length > 0) path += `?${params.join("&")}`;
      
      const data = await botReplikaGet<{ notifications?: unknown[] }>(path, apiUserId);
      res.json({ notifications: data.notifications || data });
    } catch (apiError: any) {
      logger.warn("Bot.e-replika.ru API unavailable:", apiError.message);
      res.json({ notifications: [] });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread - получить непрочитанные уведомления
router.get("/unread", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const data = await botReplikaGet<{ notifications?: unknown[] }>("/notifications/unread", apiUserId);
      res.json({ notifications: data.notifications || data });
    } catch (apiError: any) {
      logger.warn("Bot.e-replika.ru API unavailable:", apiError.message);
      res.json({ notifications: [] });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read - отметить уведомление как прочитанное
router.patch("/:id/read", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const data = await botReplikaPatch<{ notification?: unknown }>(
        `/notifications/${req.params.id}/read`,
        {},
        apiUserId
      );
      res.json({ notification: data.notification || data });
    } catch (apiError: any) {
      logger.warn("Bot.e-replika.ru API unavailable:", apiError.message);
      res.status(503).json({ error: "Notification update unavailable" });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/:id/read - альтернативный метод для отметки как прочитанное
router.post("/:id/read", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const data = await botReplikaPost<{ notification?: unknown }>(
        `/notifications/${req.params.id}/read`,
        {},
        apiUserId
      );
      res.json({ notification: data.notification || data });
    } catch (apiError: any) {
      logger.warn("Bot.e-replika.ru API unavailable:", apiError.message);
      res.status(503).json({ error: "Notification update unavailable" });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all - отметить все как прочитанные
router.patch("/read-all", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const data = await botReplikaPatch<{ count?: number }>("/notifications/read-all", {}, apiUserId);
      res.json({ count: data.count || 0 });
    } catch (apiError: any) {
      logger.warn("Bot.e-replika.ru API unavailable:", apiError.message);
      res.status(503).json({ error: "Notification update unavailable" });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

