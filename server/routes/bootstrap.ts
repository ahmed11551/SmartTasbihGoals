import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { prisma } from "../db-prisma";
import { logger } from "../lib/logger";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/bootstrap
 * Возвращает состояние пользователя для инициализации интерфейса
 * Response: { user, active_goal, daily_azkar, recent_items[] }
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Получить пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        telegramId: true,
        firstName: true,
        subscriptionTier: true,
        locale: true,
        madhab: true,
        tz: true,
        notificationsEnabled: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Получить активную цель (первую активную цель или самую недавнюю)
    const activeGoal = await prisma.goal.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          where: {
            endedAt: null, // Незавершенные сессии
          },
          take: 1,
        },
      },
    });

    // Получить daily_azkar для сегодня
    const today = new Date().toISOString().split('T')[0];
    const dailyAzkar = await prisma.dailyAzkar.findUnique({
      where: {
        userId_dateLocal: {
          userId,
          dateLocal: today,
        }
      },
    });

    // Если daily_azkar нет, создаем с нулевыми значениями
    const dailyAzkarData = dailyAzkar || {
      userId,
      dateLocal: today,
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      total: 0,
      isComplete: false,
      updatedAt: new Date(),
    };

    // Получить последние items из недавних dhikr_log
    const recentLogs = await prisma.dhikrLog.findMany({
      where: { userId },
      orderBy: { atTs: 'desc' },
      take: 10,
      select: {
        itemId: true,
        category: true,
      },
      distinct: ['itemId', 'category'],
    });

    // TODO: Когда таблица items будет создана, получать items из неё
    // Пока возвращаем только itemId и category
    const recentItems = recentLogs
      .filter(log => log.itemId)
      .map(log => ({
        id: log.itemId!,
        category: log.category,
      }));

    res.json({
      user: {
        id: user.id,
        username: user.username,
        telegramId: user.telegramId,
        firstName: user.firstName,
        subscriptionTier: user.subscriptionTier,
        locale: user.locale,
        madhab: user.madhab,
        tz: user.tz,
        notificationsEnabled: user.notificationsEnabled,
      },
      active_goal: activeGoal ? {
        id: activeGoal.id,
        category: activeGoal.category,
        itemId: activeGoal.itemId,
        goalType: activeGoal.goalType,
        title: activeGoal.title,
        targetCount: activeGoal.targetCount,
        currentProgress: activeGoal.currentProgress,
        status: activeGoal.status,
        startDate: activeGoal.startDate.toISOString(),
        endDate: activeGoal.endDate?.toISOString(),
        linkedCounterType: activeGoal.linkedCounterType,
        repeatType: activeGoal.repeatType,
        lastResetDate: activeGoal.lastResetDate?.toISOString(),
        createdAt: activeGoal.createdAt.toISOString(),
        completedAt: activeGoal.completedAt?.toISOString(),
      } : null,
      daily_azkar: {
        userId: dailyAzkarData.userId,
        dateLocal: dailyAzkarData.dateLocal,
        fajr: dailyAzkarData.fajr,
        dhuhr: dailyAzkarData.dhuhr,
        asr: dailyAzkarData.asr,
        maghrib: dailyAzkarData.maghrib,
        isha: dailyAzkarData.isha,
        total: dailyAzkarData.total,
        isComplete: dailyAzkarData.isComplete,
        updatedAt: dailyAzkarData.updatedAt.toISOString(),
      },
      recent_items: recentItems,
    });
  } catch (error) {
    logger.error("Error in bootstrap endpoint:", error);
    next(error);
  }
});

export default router;

