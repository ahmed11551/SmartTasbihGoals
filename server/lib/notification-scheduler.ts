import { prisma } from '../db-prisma';
import { logger } from './logger';
import { sendTelegramMessage } from './telegram-notifications';
import {
  calculateDailyPlan,
  calculateDaysLeft,
  isGoalLagging,
  generateGoalNotificationMessage,
} from './goal-notifications';

/**
 * Планировщик уведомлений для отправки умных уведомлений пользователям
 */
export class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Запуск планировщика (проверка каждый час)
   */
  start() {
    if (this.isRunning) {
      logger.warn('Notification scheduler is already running');
      return;
    }

    logger.info('Starting notification scheduler (checking every hour)');
    this.isRunning = true;

    // Проверка сразу при запуске (для тестирования)
    this.checkAndSendNotifications();

    // Проверка ежедневного сброса азкаров и автообновления целей
    this.checkDailyTasks();

    // Затем проверка каждый час
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
      // Проверка ежедневных задач каждый час (чтобы не пропустить полночь)
      this.checkDailyTasks();
    }, 60 * 60 * 1000); // 1 час
  }

  /**
   * Проверка ежедневных задач (сброс азкаров, автообновление целей)
   * Запускается каждый час, но выполняет задачи только при необходимости
   */
  private async checkDailyTasks() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Проверяем, наступила ли полночь (00:00-00:05)
      if (currentHour === 0 && currentMinute <= 5) {
        logger.info('Running daily tasks (azkar reset and goal renewal)...');

        // Ежедневный сброс азкаров
        try {
          const { resetDailyAzkar } = await import('./daily-azkar-reset');
          await resetDailyAzkar();
        } catch (error) {
          logger.error('Error in daily azkar reset:', error);
        }

        // Автоматическое возобновление повторяющихся целей
        try {
          const { renewRepeatingGoals } = await import('./goal-auto-renewal');
          await renewRepeatingGoals();
        } catch (error) {
          logger.error('Error in goal auto-renewal:', error);
        }
      }
    } catch (error) {
      logger.error('Error in daily tasks check:', error);
    }
  }

  /**
   * Остановка планировщика
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Notification scheduler stopped');
  }

  /**
   * Проверка и отправка уведомлений
   */
  private async checkAndSendNotifications() {
    try {
      logger.info('Checking for notifications to send...');

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDayOfWeek = this.getDayOfWeek(now);

      // Найти всех пользователей с включенными уведомлениями и Telegram ID
      const users = await prisma.user.findMany({
        where: {
          notificationsEnabled: true,
          telegramId: {
            not: null,
          },
        },
        include: {
          goals: {
            where: {
              status: 'active',
            },
          },
        },
      });

      logger.info(`Found ${users.length} users with notifications enabled`);

      for (const user of users) {
        try {
          // Проверить, нужно ли отправлять уведомление этому пользователю
          if (!this.shouldSendNotification(user, currentHour, currentMinute, currentDayOfWeek)) {
            continue;
          }

          // Получить активные цели пользователя
          const activeGoals = user.goals || [];

          if (activeGoals.length === 0) {
            continue; // Нет активных целей
          }

          // Отправить уведомление по каждой цели
          for (const goal of activeGoals) {
            await this.sendGoalNotification(user, goal);
          }

          logger.info(`Notifications sent to user ${user.id} (${user.username})`);
        } catch (error) {
          logger.error(`Error sending notifications to user ${user.id}:`, error);
        }
      }

      logger.info('Notification check completed');
    } catch (error) {
      logger.error('Error in notification scheduler:', error);
    }
  }

  /**
   * Проверка, нужно ли отправлять уведомление
   */
  private shouldSendNotification(
    user: any,
    currentHour: number,
    currentMinute: number,
    currentDayOfWeek: string
  ): boolean {
    if (!user.notificationTime) {
      return false;
    }

    // Проверить день недели
    const notificationDays = user.notificationDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (!notificationDays.includes(currentDayOfWeek)) {
      return false;
    }

    // Проверить время (с допуском ±5 минут)
    const [hours, minutes] = user.notificationTime.split(':').map(Number);
    const targetTime = hours * 60 + minutes;
    const currentTime = currentHour * 60 + currentMinute;
    const timeDiff = Math.abs(currentTime - targetTime);

    // Отправляем в течение 5 минут после назначенного времени
    return timeDiff <= 5;
  }

  /**
   * Получить день недели в формате 'mon', 'tue', etc.
   */
  private getDayOfWeek(date: Date): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  }

  /**
   * Отправка уведомления о цели
   */
  private async sendGoalNotification(user: any, goal: any) {
    if (!user.telegramId) {
      return;
    }

    try {
      const dailyPlan = calculateDailyPlan(goal);
      const daysLeft = calculateDaysLeft(goal);
      const isLagging = isGoalLagging(goal);

      const message = generateGoalNotificationMessage({
        firstName: user.firstName || undefined,
        goal,
        dailyPlan,
        daysLeft,
        isLagging,
      });

      const success = await sendTelegramMessage({
        chatId: user.telegramId,
        text: message,
      });

      // Логировать отправку
      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          goalId: goal.id,
          type: 'daily_plan',
          message,
          success,
          error: success ? null : 'Failed to send',
        },
      });

      if (success) {
        logger.info(`Notification sent to ${user.telegramId} for goal ${goal.id}`);
      } else {
        logger.warn(`Failed to send notification to ${user.telegramId} for goal ${goal.id}`);
      }
    } catch (error: any) {
      logger.error(`Error sending goal notification:`, error);

      // Логировать ошибку
      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          goalId: goal.id,
          type: 'daily_plan',
          message: '',
          success: false,
          error: error.message || 'Unknown error',
        },
      });
    }
  }

  /**
   * Отправка уведомления о завершенной цели (вызывается вручную)
   */
  async sendGoalCompletedNotification(userId: string, goal: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.telegramId || !user.notificationsEnabled) {
        return;
      }

      const { generateGoalCompletedMessage } = await import('./goal-notifications');
      const message = generateGoalCompletedMessage({
        firstName: user.firstName || undefined,
        goal,
      });

      const success = await sendTelegramMessage({
        chatId: user.telegramId,
        text: message,
      });

      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          goalId: goal.id,
          type: 'goal_completed',
          message,
          success,
        },
      });

      if (success) {
        logger.info(`Goal completed notification sent to ${user.telegramId}`);
      }
    } catch (error) {
      logger.error(`Error sending goal completed notification:`, error);
    }
  }

  /**
   * Отправка уведомления о бейдже (вызывается вручную)
   */
  async sendBadgeNotification(userId: string, badge: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.telegramId || !user.notificationsEnabled) {
        return;
      }

      const { generateBadgeMessage } = await import('./goal-notifications');
      const message = generateBadgeMessage({
        firstName: user.firstName || undefined,
        badgeTitle: badge.title,
        badgeDescription: badge.description,
        badgeIcon: badge.icon,
      });

      const success = await sendTelegramMessage({
        chatId: user.telegramId,
        text: message,
      });

      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          type: 'badge',
          message,
          success,
        },
      });

      if (success) {
        logger.info(`Badge notification sent to ${user.telegramId}`);
      }
    } catch (error) {
      logger.error(`Error sending badge notification:`, error);
    }
  }
}

// Singleton instance
export const notificationScheduler = new NotificationScheduler();

