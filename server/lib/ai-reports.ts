import OpenAI from "openai";
import { prisma } from "../db-prisma";
import { storage } from "../storage";
import { logger } from "./logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SubscriptionTier = 'muslim' | 'mutahsin' | 'sahibAlWaqf';

interface UserAnalytics {
  habits: any[];
  tasks: any[];
  goals: any[];
  dhikrLogs: any[];
  badges: any[];
  categoryStreaks: any[];
  stats: {
    totalDhikrCount: number;
    goalsCompleted: number;
    currentStreak: number;
    todayCount: number;
  };
  period: 'week' | 'month' | 'quarter' | 'year';
}

/**
 * Сбор аналитики пользователя за период
 */
export async function collectUserAnalytics(
  userId: string,
  period: 'week' | 'month' | 'quarter' | 'year' = 'week'
): Promise<UserAnalytics> {
  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - periodDays);

  const [habits, tasks, goals, logs, badges, categoryStreaks] = await Promise.all([
    storage.getHabits(userId),
    storage.getTasks(userId),
    storage.getGoals(userId),
    storage.getDhikrLogs(userId, 10000),
    storage.getBadges(userId),
    prisma.categoryStreak.findMany({
      where: { userId },
    }),
  ]);

  // Фильтровать данные по периоду
  const filteredLogs = logs.filter((log: any) => {
    const logDate = new Date(log.atTs);
    return logDate >= periodStart;
  });

  const totalDhikrCount = filteredLogs.reduce((sum: number, log: any) => {
    if (log.eventType === 'tap' || log.eventType === 'bulk' || log.eventType === 'repeat') {
      return sum + log.delta;
    }
    return sum;
  }, 0);

  const goalsCompleted = goals.filter((g: any) => {
    if (g.status !== 'completed') return false;
    if (g.completedAt) {
      return new Date(g.completedAt) >= periodStart;
    }
    return false;
  }).length;

  const currentStreak = habits.length > 0
    ? Math.max(...habits.map((h: any) => h.currentStreak || 0), 0)
    : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = filteredLogs.filter((log: any) => {
    const logDate = new Date(log.atTs).toISOString().split('T')[0];
    return logDate === today;
  });
  const todayCount = todayLogs.reduce((sum: number, log: any) => sum + log.delta, 0);

  return {
    habits,
    tasks,
    goals,
    dhikrLogs: filteredLogs,
    badges,
    categoryStreaks,
    stats: {
      totalDhikrCount,
      goalsCompleted,
      currentStreak,
      todayCount,
    },
    period,
  };
}

/**
 * Генерация AI-отчета для тарифа "Муслим" (бесплатно)
 * - Еженедельный дайджест с основными метриками
 * - 1 общий инсайт
 */
export async function generateMuslimReport(analytics: UserAnalytics): Promise<{
  summary: string;
  insights: string[];
  metrics: Record<string, any>;
}> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "AI-отчеты недоступны. Настройте OPENAI_API_KEY.",
      insights: [],
      metrics: analytics.stats,
    };
  }

  try {
    const systemPrompt = `Ты - AI-аналитик для мусульманского приложения "Умный Тасбих". 
Твоя задача - создать краткий еженедельный дайджест с основными метриками и 1 общим инсайтом.

Формат ответа (JSON):
{
  "summary": "Краткое резюме за период (2-3 предложения)",
  "insights": ["Один общий инсайт на основе данных"],
  "metrics": {}
}

Отвечай на русском языке. Будь мотивирующим и поддерживающим.`;

    const userPrompt = `Проанализируй данные пользователя за ${analytics.period === 'week' ? 'неделю' : analytics.period === 'month' ? 'месяц' : analytics.period === 'quarter' ? 'квартал' : 'год'}:

Статистика:
- Всего зикров: ${analytics.stats.totalDhikrCount}
- Завершено целей: ${analytics.stats.goalsCompleted}
- Текущая серия: ${analytics.stats.currentStreak} дней
- Сегодня: ${analytics.stats.todayCount} зикров

Активные цели: ${analytics.goals.filter((g: any) => g.status === 'active').length}
Привычки: ${analytics.habits.length}
Задачи: ${analytics.tasks.length}
Бейджи: ${analytics.badges.filter((b: any) => b.isUnlocked).length}

Создай краткий дайджест и 1 общий инсайт.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(response);

    return {
      summary: parsed.summary || "Данные за период обработаны.",
      insights: parsed.insights || [],
      metrics: analytics.stats,
    };
  } catch (error) {
    logger.error("Error generating Muslim report:", error);
    return {
      summary: "Не удалось сгенерировать AI-отчет. Попробуйте позже.",
      insights: [],
      metrics: analytics.stats,
    };
  }
}

/**
 * Генерация AI-отчета для тарифа "Мутахсин" (PRO)
 * - Расширенная аналитика и тренды
 * - 3 персонализированные рекомендации
 */
export async function generateMutahsinReport(analytics: UserAnalytics): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
  trends: Record<string, any>;
  metrics: Record<string, any>;
}> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "AI-отчеты недоступны. Настройте OPENAI_API_KEY.",
      insights: [],
      recommendations: [],
      trends: {},
      metrics: analytics.stats,
    };
  }

  try {
    // Анализ трендов
    const dailyActivity: Record<string, number> = {};
    analytics.dhikrLogs.forEach((log: any) => {
      const date = new Date(log.atTs).toISOString().split('T')[0];
      if (!dailyActivity[date]) {
        dailyActivity[date] = 0;
      }
      if (log.eventType === 'tap' || log.eventType === 'bulk' || log.eventType === 'repeat') {
        dailyActivity[date] += log.delta;
      }
    });

    const activityValues = Object.values(dailyActivity);
    const avgDaily = activityValues.length > 0
      ? activityValues.reduce((a, b) => a + b, 0) / activityValues.length
      : 0;

    const systemPrompt = `Ты - AI-аналитик для мусульманского приложения "Умный Тасбих". 
Твоя задача - создать расширенный отчет с аналитикой, трендами и 3 персонализированными рекомендациями.

Формат ответа (JSON):
{
  "summary": "Расширенное резюме с анализом трендов (3-4 предложения)",
  "insights": ["Инсайт 1", "Инсайт 2", "Инсайт 3"],
  "recommendations": ["Рекомендация 1", "Рекомендация 2", "Рекомендация 3"],
  "trends": {}
}

Отвечай на русском языке. Будь конкретным и мотивирующим.`;

    const userPrompt = `Проанализируй данные пользователя за ${analytics.period === 'week' ? 'неделю' : analytics.period === 'month' ? 'месяц' : analytics.period === 'quarter' ? 'квартал' : 'год'}:

Статистика:
- Всего зикров: ${analytics.stats.totalDhikrCount}
- Завершено целей: ${analytics.stats.goalsCompleted}
- Текущая серия: ${analytics.stats.currentStreak} дней
- Среднедневная активность: ${Math.round(avgDaily)} зикров

Активные цели: ${analytics.goals.filter((g: any) => g.status === 'active').length}
Привычки: ${analytics.habits.length}
Задачи: ${analytics.tasks.length}
Бейджи: ${analytics.badges.filter((b: any) => b.isUnlocked).length}

Категорийные серии:
${analytics.categoryStreaks.map((s: any) => `- ${s.category}: ${s.currentStreak} дней`).join('\n')}

Создай расширенный отчет с трендами и 3 персонализированными рекомендациями.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(response);

    return {
      summary: parsed.summary || "Расширенный анализ за период.",
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      trends: {
        avgDailyActivity: Math.round(avgDaily),
        totalDays: Object.keys(dailyActivity).length,
        ...parsed.trends,
      },
      metrics: analytics.stats,
    };
  } catch (error) {
    logger.error("Error generating Mutahsin report:", error);
    return {
      summary: "Не удалось сгенерировать AI-отчет. Попробуйте позже.",
      insights: [],
      recommendations: [],
      trends: {},
      metrics: analytics.stats,
    };
  }
}

/**
 * Генерация AI-отчета для тарифа "Сахиб аль-Вакф" (Premium)
 * - Прогнозная аналитика
 * - Глубинные инсайты с выявлением взаимосвязей
 */
export async function generateSahibAlWaqfReport(analytics: UserAnalytics): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
  predictions: string[];
  correlations: string[];
  trends: Record<string, any>;
  metrics: Record<string, any>;
}> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "AI-отчеты недоступны. Настройте OPENAI_API_KEY.",
      insights: [],
      recommendations: [],
      predictions: [],
      correlations: [],
      trends: {},
      metrics: analytics.stats,
    };
  }

  try {
    // Глубокий анализ данных
    const dailyActivity: Record<string, number> = {};
    const categoryActivity: Record<string, number> = {};
    
    analytics.dhikrLogs.forEach((log: any) => {
      const date = new Date(log.atTs).toISOString().split('T')[0];
      if (!dailyActivity[date]) {
        dailyActivity[date] = 0;
      }
      if (log.eventType === 'tap' || log.eventType === 'bulk' || log.eventType === 'repeat') {
        dailyActivity[date] += log.delta;
        const category = log.category || 'general';
        categoryActivity[category] = (categoryActivity[category] || 0) + log.delta;
      }
    });

    const activityValues = Object.values(dailyActivity);
    const avgDaily = activityValues.length > 0
      ? activityValues.reduce((a, b) => a + b, 0) / activityValues.length
      : 0;

    const topCategory = Object.entries(categoryActivity)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';

    const systemPrompt = `Ты - продвинутый AI-аналитик для мусульманского приложения "Умный Тасбих". 
Твоя задача - создать глубинный отчет с прогнозной аналитикой, выявлением взаимосвязей и персонализированными рекомендациями.

Формат ответа (JSON):
{
  "summary": "Глубинное резюме с анализом паттернов (4-5 предложений)",
  "insights": ["Инсайт 1", "Инсайт 2", "Инсайт 3", "Инсайт 4"],
  "recommendations": ["Рекомендация 1", "Рекомендация 2", "Рекомендация 3"],
  "predictions": ["Прогноз 1", "Прогноз 2"],
  "correlations": ["Взаимосвязь 1", "Взаимосвязь 2"],
  "trends": {}
}

Отвечай на русском языке. Будь глубоким, аналитическим и мотивирующим.`;

    const userPrompt = `Проанализируй данные пользователя за ${analytics.period === 'week' ? 'неделю' : analytics.period === 'month' ? 'месяц' : analytics.period === 'quarter' ? 'квартал' : 'год'}:

Статистика:
- Всего зикров: ${analytics.stats.totalDhikrCount}
- Завершено целей: ${analytics.stats.goalsCompleted}
- Текущая серия: ${analytics.stats.currentStreak} дней
- Среднедневная активность: ${Math.round(avgDaily)} зикров
- Топ категория: ${topCategory} (${categoryActivity[topCategory] || 0} зикров)

Активные цели: ${analytics.goals.filter((g: any) => g.status === 'active').length}
Привычки: ${analytics.habits.length}
Задачи: ${analytics.tasks.length}
Бейджи: ${analytics.badges.filter((b: any) => b.isUnlocked).length}

Категорийные серии:
${analytics.categoryStreaks.map((s: any) => `- ${s.category}: ${s.currentStreak} дней (максимум: ${s.longestStreak})`).join('\n')}

Активность по категориям:
${Object.entries(categoryActivity).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

Создай глубинный отчет с:
1. Анализом паттернов и трендов
2. Выявлением взаимосвязей между активностью и результатами
3. Прогнозами на будущее
4. Персонализированными рекомендациями`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(response);

    return {
      summary: parsed.summary || "Глубинный анализ за период.",
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      predictions: parsed.predictions || [],
      correlations: parsed.correlations || [],
      trends: {
        avgDailyActivity: Math.round(avgDaily),
        totalDays: Object.keys(dailyActivity).length,
        topCategory,
        categoryActivity,
        ...parsed.trends,
      },
      metrics: analytics.stats,
    };
  } catch (error) {
    logger.error("Error generating SahibAlWaqf report:", error);
    return {
      summary: "Не удалось сгенерировать AI-отчет. Попробуйте позже.",
      insights: [],
      recommendations: [],
      predictions: [],
      correlations: [],
      trends: {},
      metrics: analytics.stats,
    };
  }
}

/**
 * Генерация AI-отчета в зависимости от тарифа пользователя
 */
export async function generateAIReport(
  userId: string,
  period: 'week' | 'month' | 'quarter' | 'year' = 'week'
): Promise<any> {
  try {
    // Получить тариф пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    const tier: SubscriptionTier = (user?.subscriptionTier || 'muslim') as SubscriptionTier;

    // Собрать аналитику
    const analytics = await collectUserAnalytics(userId, period);

    // Генерировать отчет в зависимости от тарифа
    switch (tier) {
      case 'muslim':
        return {
          tier: 'muslim',
          period,
          ...await generateMuslimReport(analytics),
        };

      case 'mutahsin':
        return {
          tier: 'mutahsin',
          period,
          ...await generateMutahsinReport(analytics),
        };

      case 'sahibAlWaqf':
        return {
          tier: 'sahibAlWaqf',
          period,
          ...await generateSahibAlWaqfReport(analytics),
        };

      default:
        return {
          tier: 'muslim',
          period,
          ...await generateMuslimReport(analytics),
        };
    }
  } catch (error) {
    logger.error("Error generating AI report:", error);
    throw error;
  }
}

