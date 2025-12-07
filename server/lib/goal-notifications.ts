import { Goal } from '@prisma/client';
import { logger } from './logger';

/**
 * Расчет ежедневного плана для цели
 */
export function calculateDailyPlan(goal: Goal): number | null {
  if (goal.status === 'completed' || !goal.endDate) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(goal.endDate);
  const daysLeft = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const remaining = goal.targetCount - goal.currentProgress;

  return Math.ceil(remaining / daysLeft);
}

/**
 * Расчет количества оставшихся дней до дедлайна
 */
export function calculateDaysLeft(goal: Goal): number | null {
  if (!goal.endDate) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(goal.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return daysLeft;
}

/**
 * Проверка, отстает ли цель от графика
 */
export function isGoalLagging(goal: Goal): boolean {
  if (!goal.endDate || goal.status === 'completed') {
    return false;
  }

  const now = new Date();
  const endDate = new Date(goal.endDate);
  const startDate = new Date(goal.startDate);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const expectedProgress = Math.floor((goal.targetCount * daysPassed) / totalDays);
  const actualProgress = goal.currentProgress;

  // Отставание более чем на 20%
  return actualProgress < expectedProgress * 0.8;
}

/**
 * Генерация персонализированного сообщения о цели
 */
export function generateGoalNotificationMessage(params: {
  firstName?: string;
  goal: Goal;
  dailyPlan?: number | null;
  daysLeft?: number | null;
  isLagging?: boolean;
}): string {
  const { firstName, goal, dailyPlan, daysLeft, isLagging } = params;

  // Персонализация: имя пользователя
  const greeting = firstName 
    ? `Ас-саляму алейкум, ${firstName}! 👋`
    : 'Ас-саляму алейкум! 👋';

  // Основная информация о цели
  const progressPercent = Math.round((goal.currentProgress / goal.targetCount) * 100);
  const remaining = goal.targetCount - goal.currentProgress;

  let message = `${greeting}\n\n`;
  message += `📊 <b>Цель: ${goal.title}</b>\n`;
  message += `Прогресс: ${goal.currentProgress.toLocaleString()} из ${goal.targetCount.toLocaleString()} (${progressPercent}%)\n\n`;

  // Умный подсчет
  if (dailyPlan !== null && dailyPlan !== undefined && dailyPlan > 0) {
    message += `📅 <b>Ежедневный план:</b> ${dailyPlan.toLocaleString()}/день\n`;
  }

  if (daysLeft !== null && daysLeft !== undefined) {
    if (daysLeft < 0) {
      const absDaysLeft = Math.abs(daysLeft);
      message += `⏰ <b>Срок истек!</b> Просрочено на ${absDaysLeft} ${absDaysLeft === 1 ? 'день' : 'дней'}\n\n`;
    } else {
      message += `⏰ <b>Осталось ${daysLeft}</b> ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}\n\n`;
    }
  }

  // Мотивация при отставании
  if (isLagging && dailyPlan !== null && dailyPlan !== undefined) {
    const daysLeftValue = daysLeft !== null && daysLeft !== undefined ? daysLeft : 1;
    const currentDaily = Math.ceil(remaining / Math.max(1, daysLeftValue));
    message += `⚠️ <b>Вы отстаете от графика</b>\n`;
    message += `Чтобы достичь цель, нужно делать <b>${currentDaily.toLocaleString()}/день</b>\n`;
    message += `Не сдавайтесь! Давайте увеличим усилия! 💪\n\n`;
  } else if (dailyPlan !== null && dailyPlan !== undefined && remaining > 0) {
    message += `Для достижения цели осталось выполнить <b>${remaining.toLocaleString()}</b>\n`;
    if (daysLeft !== null && daysLeft !== undefined && daysLeft > 0) {
      message += `Ежедневный план: <b>${dailyPlan.toLocaleString()}/день</b> ✅\n\n`;
    }
  }

  // Мотивационное завершение
  message += `Продолжайте в том же духе! Машааллах! 🌟`;

  return message;
}

/**
 * Генерация сообщения о завершенной цели
 */
export function generateGoalCompletedMessage(params: {
  firstName?: string;
  goal: Goal;
}): string {
  const { firstName, goal } = params;

  const greeting = firstName 
    ? `Машааллах, ${firstName}! 🎉`
    : 'Машааллах! 🎉';

  let message = `${greeting}\n\n`;
  message += `🎯 <b>Цель выполнена!</b>\n\n`;
  message += `<b>${goal.title}</b>\n`;
  message += `Выполнено: ${goal.currentProgress.toLocaleString()} из ${goal.targetCount.toLocaleString()}\n\n`;
  message += `Альхамдулиллах! Продолжайте в том же духе! 🌟`;

  return message;
}

/**
 * Генерация сообщения о получении бейджа
 */
export function generateBadgeMessage(params: {
  firstName?: string;
  badgeTitle: string;
  badgeDescription: string;
  badgeIcon: string;
}): string {
  const { firstName, badgeTitle, badgeDescription, badgeIcon } = params;

  const greeting = firstName 
    ? `Поздравляем, ${firstName}! 🏆`
    : 'Поздравляем! 🏆';

  let message = `${greeting}\n\n`;
  message += `${badgeIcon} <b>Новый бейдж!</b>\n\n`;
  message += `<b>${badgeTitle}</b>\n`;
  message += `${badgeDescription}\n\n`;
  message += `Продолжайте развиваться! 💪`;

  return message;
}

