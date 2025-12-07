/**
 * AI сервис для оптимизации расписания восполнения Каза
 * Включает:
 * - Анализ истории намазов
 * - Генерацию персонализированного плана
 * - Мотивационные сообщения
 */

import OpenAI from "openai";
import { prisma } from "../db-prisma";
import { logger } from "./logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserPrayerHistory {
  date: string;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

interface OptimizedSchedule {
  recommendations: Array<{
    time: string;
    prayer: string;
    reason: string;
  }>;
  dailyPlan: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  estimatedCompletion: string; // Дата завершения
}

/**
 * Оптимизация расписания восполнения на основе истории
 */
export async function optimizeRepaymentSchedule(
  userId: string
): Promise<OptimizedSchedule> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback без AI
      return generateBasicSchedule(userId);
    }

    // Получаем данные пользователя
    const [qazaDebt, calendarEntries, dailyAzkar] = await Promise.all([
      prisma.qazaDebt.findUnique({
        where: { userId },
      }),
      prisma.qazaCalendarEntry.findMany({
        where: { userId },
        orderBy: { dateLocal: 'desc' },
        take: 30, // Последние 30 дней
      }),
      prisma.dailyAzkar.findMany({
        where: { userId },
        orderBy: { dateLocal: 'desc' },
        take: 30,
      }),
    ]);

    if (!qazaDebt) {
      throw new Error("Qaza debt not found");
    }

    // Анализируем паттерны
    const history: UserPrayerHistory[] = dailyAzkar.map(entry => ({
      date: entry.dateLocal,
      prayers: {
        fajr: entry.fajr > 0,
        dhuhr: entry.dhuhr > 0,
        asr: entry.asr > 0,
        maghrib: entry.maghrib > 0,
        isha: entry.isha > 0,
      },
    }));

    const prompt = `Проанализируй историю намазов пользователя и предложи оптимизированный план восполнения Каза.

История последних 30 дней:
${JSON.stringify(history.slice(0, 10), null, 2)}

Текущий долг:
- Фаджр: ${qazaDebt.fajrDebt - qazaDebt.fajrProgress}/${qazaDebt.fajrDebt}
- Зухр: ${qazaDebt.dhuhrDebt - qazaDebt.dhuhrProgress}/${qazaDebt.dhuhrDebt}
- Аср: ${qazaDebt.asrDebt - qazaDebt.asrProgress}/${qazaDebt.asrDebt}
- Магриб: ${qazaDebt.maghribDebt - qazaDebt.maghribProgress}/${qazaDebt.maghribDebt}
- Иша: ${qazaDebt.ishaDebt - qazaDebt.ishaProgress}/${qazaDebt.ishaDebt}

Предложи:
1. Рекомендуемые временные слоты для восполнения (например: после Фаджра +1 каза)
2. Ежедневный план восполнения
3. Ориентировочную дату завершения

Ответ в формате JSON:
{
  "recommendations": [
    {"time": "После Фаджра", "prayer": "фаджр", "reason": "..."},
    {"time": "После Асра", "prayer": "аср", "reason": "..."}
  ],
  "dailyPlan": {"fajr": 1, "dhuhr": 2, "asr": 2, "maghrib": 1, "isha": 1},
  "estimatedCompletion": "2025-03-15"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Ты помощник для мусульман, помогающий с восполнением пропущенных намазов. Отвечай на русском языке, будь мотивирующим и практичным.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Парсим JSON из ответа
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as OptimizedSchedule;
      }
    } catch (parseError) {
      logger.warn("Failed to parse AI response, using fallback");
    }

    return generateBasicSchedule(userId);
  } catch (error: any) {
    logger.error(`Error optimizing schedule: ${error.message}`);
    return generateBasicSchedule(userId);
  }
}

/**
 * Базовый план без AI (fallback)
 */
async function generateBasicSchedule(userId: string): Promise<OptimizedSchedule> {
  const qazaDebt = await prisma.qazaDebt.findUnique({
    where: { userId },
  });

  if (!qazaDebt) {
    throw new Error("Qaza debt not found");
  }

  const remaining = {
    fajr: qazaDebt.fajrDebt - qazaDebt.fajrProgress,
    dhuhr: qazaDebt.dhuhrDebt - qazaDebt.dhuhrProgress,
    asr: qazaDebt.asrDebt - qazaDebt.asrProgress,
    maghrib: qazaDebt.maghribDebt - qazaDebt.maghribProgress,
    isha: qazaDebt.ishaDebt - qazaDebt.ishaProgress,
  };

  const totalRemaining = Object.values(remaining).reduce((sum, val) => sum + val, 0);
  const dailyTotal = Math.max(1, Math.ceil(totalRemaining / 180)); // Примерно за 6 месяцев

  const dailyPlan = {
    fajr: Math.ceil((remaining.fajr / totalRemaining) * dailyTotal),
    dhuhr: Math.ceil((remaining.dhuhr / totalRemaining) * dailyTotal),
    asr: Math.ceil((remaining.asr / totalRemaining) * dailyTotal),
    maghrib: Math.ceil((remaining.maghrib / totalRemaining) * dailyTotal),
    isha: Math.ceil((remaining.isha / totalRemaining) * dailyTotal),
  };

  const daysToComplete = Math.ceil(totalRemaining / dailyTotal);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);

  return {
    recommendations: [
      {
        time: "После Фаджра",
        prayer: "фаджр",
        reason: "Восполняйте утренние намазы сразу после обязательного Фаджра",
      },
      {
        time: "После Асра",
        prayer: "аср, магриб",
        reason: "Хорошее время для восполнения дневных намазов",
      },
      {
        time: "В выходные",
        prayer: "все",
        reason: "Увеличьте количество восполняемых намазов в выходные",
      },
    ],
    dailyPlan,
    estimatedCompletion: completionDate.toISOString().split('T')[0],
  };
}

/**
 * Генерация мотивационного сообщения на основе прогресса
 */
export async function generateMotivationalMessage(
  progress: number,
  total: number
): Promise<string> {
  const milestones: Record<number, string> = {
    100: "Поздравляем! Первые 100 намазов восполнены! Пусть Аллах примет ваше поклонение.",
    500: "Ма ша Аллах! 500 намазов восполнено! Вы на правильном пути.",
    1000: "Невероятно! 1000 намазов восполнено! Пусть Аллах воздаст вам сполна.",
  };

  const percentage = Math.round((progress / total) * 100);
  
  if (percentage >= 50 && percentage < 100) {
    return "Вы прошли половину пути. Пусть Аллах укрепит вас и даст сил завершить начатое!";
  }

  if (percentage === 100) {
    return "Альхамдулиллах! Все намазы восполнены! Пусть Аллах примет ваше поклонение и запишет это в вашу книгу благих дел.";
  }

  for (const [milestone, message] of Object.entries(milestones)) {
    if (progress >= parseInt(milestone) && progress < parseInt(milestone) + 50) {
      return message;
    }
  }

  return "Продолжайте восполнять намазы. Каждый намаз приближает вас к цели. Ин ша Аллах, вы справитесь!";
}

/**
 * Обнаружение паттернов пропусков намазов
 */
export async function detectMissedPrayerPatterns(userId: string): Promise<string | null> {
  try {
    const dailyAzkar = await prisma.dailyAzkar.findMany({
      where: { userId },
      orderBy: { dateLocal: 'desc' },
      take: 30,
    });

    const missedCounts = {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    };

    for (const entry of dailyAzkar) {
      if (entry.fajr === 0) missedCounts.fajr++;
      if (entry.dhuhr === 0) missedCounts.dhuhr++;
      if (entry.asr === 0) missedCounts.asr++;
      if (entry.maghrib === 0) missedCounts.maghrib++;
      if (entry.isha === 0) missedCounts.isha++;
    }

    if (missedCounts.asr > 3) {
      return "Вы часто пропускаете Аср. Рекомендуем настроить напоминание на это время.";
    }

    if (missedCounts.fajr > 5) {
      return "Вы часто пропускаете Фаджр. Попробуйте ложиться спать раньше и ставить несколько будильников.";
    }

    return null;
  } catch (error: any) {
    logger.error(`Error detecting patterns: ${error.message}`);
    return null;
  }
}

