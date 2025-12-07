import { prisma } from '../db-prisma';
import { logger } from './logger';

/**
 * Автоматическое возобновление повторяющихся целей
 */
export async function renewRepeatingGoals(userId?: string): Promise<void> {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const whereClause: any = {
      status: 'completed',
      repeatType: { in: ['weekly', 'monthly'] },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    // Найти все завершенные повторяющиеся цели
    const completedGoals = await prisma.goal.findMany({
      where: whereClause,
    });

    logger.info(`Found ${completedGoals.length} completed repeating goals to check for renewal`);

    for (const goal of completedGoals) {
      if (!goal.completedAt || !goal.endDate) {
        continue;
      }

      const completedDate = new Date(goal.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      const endDate = new Date(goal.endDate);
      endDate.setHours(0, 0, 0, 0);

      // Проверить, нужно ли возобновить цель
      let shouldRenew = false;
      let newStartDate = new Date();
      let newEndDate = new Date();

      if (goal.repeatType === 'weekly') {
        // Возобновить каждую неделю после завершения
        const daysSinceCompletion = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        shouldRenew = daysSinceCompletion >= 7;
        
        if (shouldRenew) {
          newStartDate = new Date(completedDate);
          newStartDate.setDate(newStartDate.getDate() + 7);
          newEndDate = new Date(newStartDate);
          newEndDate.setDate(newEndDate.getDate() + 7);
        }
      } else if (goal.repeatType === 'monthly') {
        // Возобновить каждый месяц после завершения
        const completedMonth = completedDate.getMonth();
        const completedYear = completedDate.getFullYear();
        const nextMonth = completedMonth === 11 ? 0 : completedMonth + 1;
        const nextYear = completedMonth === 11 ? completedYear + 1 : completedYear;
        
        const nextMonthDate = new Date(nextYear, nextMonth, completedDate.getDate());
        shouldRenew = now >= nextMonthDate;

        if (shouldRenew) {
          newStartDate = nextMonthDate;
          newEndDate = new Date(nextMonthDate);
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        }
      }

      if (shouldRenew) {
        // Возобновить цель
        await prisma.goal.update({
          where: { id: goal.id },
          data: {
            status: 'active',
            currentProgress: 0,
            startDate: newStartDate,
            endDate: newEndDate,
            completedAt: null,
            lastResetDate: now,
          },
        });

        logger.info(
          `Goal ${goal.id} (${goal.title}) renewed: ${goal.repeatType} - New period: ${newStartDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`
        );
      }
    }
  } catch (error) {
    logger.error('Error renewing repeating goals:', error);
  }
}

/**
 * Запуск автоматического возобновления для конкретного пользователя
 */
export async function renewUserRepeatingGoals(userId: string): Promise<void> {
  await renewRepeatingGoals(userId);
}

