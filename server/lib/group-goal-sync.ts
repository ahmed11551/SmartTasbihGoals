import { prisma } from '../db-prisma';
import { logger } from './logger';

/**
 * Обновление прогресса групповых целей при использовании тасбиха
 * @param userId - ID пользователя
 * @param category - Категория зикра
 * @param itemId - ID конкретного элемента зикра
 * @param delta - Приращение прогресса
 */
export async function updateGroupGoalsProgress(
  userId: string,
  category: string,
  itemId: string | null | undefined,
  delta: number
): Promise<void> {
  if (delta <= 0) return;

  try {
    // Найти все активные групповые цели пользователя
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            goals: {
              where: {
                status: 'active',
                linkedCounterType: category,
              },
            },
          },
        },
      },
    });

    // Обновить прогресс для каждой групповой цели
    for (const membership of userGroups) {
      for (const groupGoal of membership.group.goals) {
        // Проверяем соответствие itemId
        if (groupGoal.itemId && groupGoal.itemId !== itemId) {
          continue;
        }

        // Найти или создать прогресс пользователя для этой цели
        const progress = await prisma.groupGoalProgress.upsert({
          where: {
            groupGoalId_userId: {
              groupGoalId: groupGoal.id,
              userId,
            },
          },
          create: {
            groupGoalId: groupGoal.id,
            userId,
            currentProgress: delta,
            lastUpdated: new Date(),
          },
          update: {
            currentProgress: {
              increment: delta,
            },
            lastUpdated: new Date(),
          },
        });

        // Обновить общий прогресс групповой цели
        const allProgress = await prisma.groupGoalProgress.findMany({
          where: { groupGoalId: groupGoal.id },
        });

        const totalProgress = allProgress.reduce((sum, p) => sum + p.currentProgress, 0);
        const isCompleted = totalProgress >= groupGoal.targetCount;

        await prisma.groupGoal.update({
          where: { id: groupGoal.id },
          data: {
            currentProgress: totalProgress,
            status: isCompleted ? 'completed' : 'active',
            completedAt: isCompleted ? new Date() : groupGoal.completedAt,
          },
        });

        logger.info(
          `Group goal progress updated: ${groupGoal.id} (${groupGoal.title}) - User ${userId}: ${progress.currentProgress - delta} → ${progress.currentProgress}, Total: ${totalProgress}/${groupGoal.targetCount}${isCompleted ? ' [COMPLETED]' : ''}`
        );
      }
    }
  } catch (error) {
    logger.error(`Error updating group goals progress:`, error);
  }
}

