import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { prisma } from "../db-prisma";
import { logger } from "../lib/logger";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

const learnMarkSchema = z.object({
  goal_id: z.string().uuid(),
});

/**
 * POST /api/v1/learn/mark
 * Отметка о заучивании цели
 * 
 * Body: { goal_id: string }
 * 
 * Response: { goal: Goal }
 */
router.post("/mark", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { goal_id } = learnMarkSchema.parse(req.body);

    // Проверить, что цель существует и принадлежит пользователю
    const goal = await prisma.goal.findFirst({
      where: {
        id: goal_id,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Проверить, что цель типа 'learn'
    if (goal.goalType !== 'learn') {
      return res.status(400).json({ 
        error: "Invalid goal type",
        message: "Только цели типа 'learn' могут быть отмечены как выученные",
      });
    }

    // Обновить статус цели на 'completed'
    const updatedGoal = await prisma.goal.update({
      where: { id: goal_id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Создать событие learn_mark в dhikr_log, если есть активная сессия
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        goalId: goal_id,
        endedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (activeSession) {
      try {
        await prisma.dhikrLog.create({
          data: {
            userId,
            sessionId: activeSession.id,
            goalId: goal_id,
            category: goal.category,
            itemId: goal.itemId || null,
            eventType: 'learn_mark',
            delta: 0,
            valueAfter: goal.currentProgress,
            prayerSegment: activeSession.prayerSegment,
            atTs: new Date(),
            tz: 'UTC', // TODO: использовать tz пользователя
          },
        });
      } catch (logError) {
        logger.warn("Failed to create learn_mark log:", logError);
        // Не прерываем выполнение, если не удалось создать лог
      }
    }

    res.json({ goal: updatedGoal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    logger.error("Error in POST /api/v1/learn/mark:", error);
    next(error);
  }
});

export default router;

