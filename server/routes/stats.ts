import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, getUserId } from "../middleware/auth";
import { botReplikaGet, getUserIdForApi } from "../lib/bot-replika-api";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const apiUserId = getUserIdForApi(req);
      const data = await botReplikaGet<{ stats?: unknown; counts?: unknown }>("/api/stats", apiUserId);
      res.json({
        stats: data.stats || data,
        counts: data.counts || {},
      });
    } catch (apiError: any) {
      console.warn("Bot.e-replika.ru API unavailable, using local DB:", apiError.message);
      
      // Fallback: вычисляем статистику из локальной БД
      const [habits, tasks, goals, logs] = await Promise.all([
        storage.getHabits(userId),
        storage.getTasks(userId),
        storage.getGoals(userId),
        storage.getDhikrLogs(userId, 1000),
      ]);
      
      const totalDhikrCount = logs.reduce((sum: number, log: any) => sum + log.delta, 0);
      const goalsCompleted = goals.filter((g: any) => g.status === "completed").length;
      
      const currentStreak = habits.length > 0
        ? Math.max(...habits.map((h: any) => h.currentStreak), 0)
        : 0;
      
      const today = new Date().toISOString().split("T")[0];
      const todayLogs = logs.filter((log: any) => {
        const logDate = new Date(log.atTs).toISOString().split("T")[0];
        return logDate === today;
      });
      const todayCount = todayLogs.reduce((sum: number, log: any) => sum + log.delta, 0);
      
      res.json({
        stats: {
          totalDhikrCount,
          goalsCompleted,
          currentStreak,
          todayCount,
        },
        counts: {
          habits: habits.length,
          tasks: tasks.length,
          goals: goals.length,
          activeGoals: goals.filter((g: any) => g.status === "active").length,
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

