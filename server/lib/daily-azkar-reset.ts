import { prisma } from '../db-prisma';
import { logger } from './logger';

/**
 * Ежедневный сброс прогресса азкаров для всех пользователей
 * Запускается в 00:00 по локальному времени каждого пользователя
 * 
 * ВАЖНО: В продакшене эта функция должна запускаться через cron job
 * на уровне инфраструктуры (Vercel Cron, AWS EventBridge и т.д.)
 * или через планировщик задач, который может учитывать часовые пояса пользователей
 */
export async function resetDailyAzkar(): Promise<void> {
  logger.info('Starting daily azkar reset...');
  
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Получить всех пользователей с активными азкарами за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStrSevenDaysAgo = sevenDaysAgo.toISOString().split('T')[0];

    const usersWithAzkar = await prisma.user.findMany({
      where: {
        dailyAzkar: {
          some: {
            dateLocal: {
              gte: dateStrSevenDaysAgo,
            }
          }
        }
      },
      select: {
        id: true,
        tz: true,
      }
    });

    logger.info(`Found ${usersWithAzkar.length} users with recent azkar activity`);

    let resetCount = 0;

    for (const user of usersWithAzkar) {
      try {
        // Проверить, нужно ли сбрасывать для этого пользователя
        // (в зависимости от его часового пояса)
        const userTz = user.tz || 'UTC';
        
        // В упрощенной версии просто создаем/обновляем запись для сегодня
        // В полной версии нужно проверять, наступила ли полночь в часовом поясе пользователя
        const existingAzkar = await prisma.dailyAzkar.findUnique({
          where: {
            userId_dateLocal: {
              userId: user.id,
              dateLocal: dateStr,
            }
          }
        });

        if (!existingAzkar) {
          // Создать новую запись для сегодняшнего дня с нулевыми значениями
          await prisma.dailyAzkar.create({
            data: {
              userId: user.id,
              dateLocal: dateStr,
              fajr: 0,
              dhuhr: 0,
              asr: 0,
              maghrib: 0,
              isha: 0,
              total: 0,
              isComplete: false,
            },
          });
          resetCount++;
        } else {
          // Если запись существует, но была создана вчера, сбросить счетчики
          const existingDate = new Date(existingAzkar.updatedAt);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          if (existingDate < yesterday) {
            await prisma.dailyAzkar.update({
              where: {
                userId_dateLocal: {
                  userId: user.id,
                  dateLocal: dateStr,
                }
              },
              data: {
                fajr: 0,
                dhuhr: 0,
                asr: 0,
                maghrib: 0,
                isha: 0,
                total: 0,
                isComplete: false,
              },
            });
            resetCount++;
          }
        }
      } catch (userError) {
        logger.error(`Error resetting azkar for user ${user.id}:`, userError);
        // Продолжаем для других пользователей
      }
    }

    logger.info(`Daily azkar reset completed. Reset ${resetCount} users.`);
  } catch (error) {
    logger.error('Error in daily azkar reset:', error);
    throw error;
  }
}

/**
 * Функция для интеграции в notification-scheduler
 * Запускается ежедневно в 00:00 UTC
 * 
 * ПРИМЕЧАНИЕ: Для правильной работы с часовыми поясами пользователей
 * в продакшене рекомендуется использовать внешний cron job,
 * который может запускаться для каждого часового пояса отдельно
 */
export async function scheduleDailyAzkarReset(): Promise<void> {
  try {
    await resetDailyAzkar();
  } catch (error) {
    logger.error('Failed to schedule daily azkar reset:', error);
  }
}

