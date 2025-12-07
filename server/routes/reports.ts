import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { prisma } from "../db-prisma";
import { logger } from "../lib/logger";
import { storage } from "../storage";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/v1/reports/daily
 * Возвращает ежедневный отчет пользователя
 * 
 * Response: {
 *   date: string, // YYYY-MM-DD
 *   goals_completed: Goal[],
 *   azkar_progress: DailyAzkar,
 *   total_dhikr_count: number
 * }
 */
router.get("/daily", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Получить дату из query параметра или использовать сегодняшнюю
    const dateParam = req.query.date as string | undefined;
    const reportDate = dateParam 
      ? new Date(dateParam).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Получить завершенные цели за этот день
    const goalsCompleted = await prisma.goal.findMany({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          gte: new Date(`${reportDate}T00:00:00.000Z`),
          lt: new Date(`${reportDate}T23:59:59.999Z`),
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Получить прогресс азкаров за этот день
    const azkarProgress = await storage.getDailyAzkar(userId, reportDate) || {
      userId,
      dateLocal: reportDate,
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      total: 0,
      isComplete: false,
      updatedAt: new Date(),
    };

    // Получить общее количество зикров за этот день
    const startOfDay = new Date(`${reportDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${reportDate}T23:59:59.999Z`);

    const dhikrLogs = await prisma.dhikrLog.findMany({
      where: {
        userId,
        atTs: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalDhikrCount = dhikrLogs.reduce((sum, log) => sum + log.delta, 0);

    res.json({
      date: reportDate,
      goals_completed: goalsCompleted,
      azkar_progress: {
        fajr: azkarProgress.fajr,
        dhuhr: azkarProgress.dhuhr,
        asr: azkarProgress.asr,
        maghrib: azkarProgress.maghrib,
        isha: azkarProgress.isha,
        total: azkarProgress.total,
        isComplete: azkarProgress.isComplete,
      },
      total_dhikr_count: totalDhikrCount,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/reports/daily:", error);
    next(error);
  }
});

/**
 * GET /api/v1/reports/activity-heatmap
 * Возвращает данные для тепловой карты активности за период
 * 
 * Query params:
 * - startDate: string (YYYY-MM-DD)
 * - endDate: string (YYYY-MM-DD)
 * - days: number (количество дней, по умолчанию 365)
 * 
 * Response: {
 *   data: Array<{ date: string, count: number }>
 * }
 */
router.get("/activity-heatmap", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Получить параметры периода
    const startDateParam = req.query.startDate as string | undefined;
    const endDateParam = req.query.endDate as string | undefined;
    const daysParam = req.query.days ? parseInt(req.query.days as string, 10) : 365;

    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // По умолчанию последние N дней
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysParam);
      startDate.setHours(0, 0, 0, 0);
    }

    // Получить все логи за период
    const dhikrLogs = await prisma.dhikrLog.findMany({
      where: {
        userId,
        atTs: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        atTs: true,
        delta: true,
      },
    });

    // Группировать по датам
    const activityByDate: Record<string, number> = {};
    
    for (const log of dhikrLogs) {
      const dateStr = new Date(log.atTs).toISOString().split('T')[0];
      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = 0;
      }
      activityByDate[dateStr] += log.delta;
    }

    // Создать массив всех дат в периоде
    const result: Array<{ date: string; count: number }> = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: activityByDate[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      data: result,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/reports/activity-heatmap:", error);
    next(error);
  }
});

export default router;

