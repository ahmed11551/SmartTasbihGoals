/**
 * Улучшенный сервис для расчета Каза (пропущенных намазов)
 * Согласно полному ТЗ, включает:
 * - Расчет по хиджре
 * - Генерацию календарных записей
 * - Валидацию периодов
 */

import { prisma } from "../db-prisma";
import { calculateBulughDate, convertToHijri, convertToGregorian } from "./hijri-calculator";
import { logger } from "./logger";
import { differenceInDays, addDays, format, parse, eachDayOfInterval } from "date-fns";

interface QazaCalculationParams {
  gender: 'male' | 'female';
  birthDate?: string;
  birthYear?: number;
  bulughAge?: number;
  prayerStartDate?: string;
  prayerStartYear?: number;
  todayAsStart?: boolean;
  madhab?: 'hanafi' | 'shafii' | 'maliki' | 'hanbali';
  // Женские данные
  haidDaysPerMonth?: number;
  childbirthCount?: number;
  nifasDaysPerChildbirth?: number;
  haydNifasPeriods?: Array<{ startDate: string; endDate: string; type: 'hayd' | 'nifas' }>;
  // Сафар
  totalTravelDays?: number;
  safarDays?: Array<{ startDate: string; endDate: string }>;
  // Ручной период
  manualPeriod?: { years: number; months: number };
}

interface QazaCalculationResult {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
  dhuhrSafar?: number;
  asrSafar?: number;
  ishaSafar?: number;
  effectiveDays: number;
  excludedDays: number;
  totalDays: number;
  bulughDate?: Date;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Основная функция расчета долга по Каза
 */
export async function calculateQazaDebtImproved(
  params: QazaCalculationParams
): Promise<QazaCalculationResult> {
  const bulughAge = params.bulughAge || 15;
  const madhab = params.madhab || 'hanafi';
  
  let startDate: Date;
  let bulughDate: Date | undefined;
  
  // Шаг 1: Расчет даты булюга (с учетом хиджры)
  if (params.birthDate) {
    const birth = new Date(params.birthDate);
    bulughDate = await calculateBulughDate(birth, bulughAge);
    startDate = bulughDate;
  } else if (params.birthYear) {
    const birth = new Date(params.birthYear, 0, 1);
    bulughDate = await calculateBulughDate(birth, bulughAge);
    startDate = bulughDate;
  } else if (params.manualPeriod) {
    // Ручной период - используем текущую дату минус период
    startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - params.manualPeriod.years);
    startDate.setMonth(startDate.getMonth() - params.manualPeriod.months);
  } else {
    throw new Error("Необходимо указать дату рождения или ручной период");
  }
  
  // Шаг 2: Определение даты окончания периода
  const endDate = params.todayAsStart 
    ? new Date() 
    : (params.prayerStartDate 
      ? new Date(params.prayerStartDate) 
      : (params.prayerStartYear 
        ? new Date(params.prayerStartYear, 0, 1) 
        : new Date()));
  
  // Шаг 3: Расчет общего количества дней
  const totalDays = params.manualPeriod
    ? params.manualPeriod.years * 365 + params.manualPeriod.months * 30
    : Math.max(0, differenceInDays(endDate, startDate));
  
  // Шаг 4: Расчет исключений
  let excludedDays = 0;
  
  // Для женщин: хайд и нифас
  if (params.gender === 'female') {
    const totalMonths = totalDays / 30.44;
    const haidDaysPerMonth = params.haidDaysPerMonth || 7;
    const haidDays = Math.floor(totalMonths * haidDaysPerMonth);
    
    const childbirthCount = params.childbirthCount || 0;
    const nifasDaysPerChildbirth = params.nifasDaysPerChildbirth || 40;
    const nifasDays = childbirthCount * nifasDaysPerChildbirth;
    
    excludedDays += haidDays + nifasDays;
    
    // Учитываем конкретные периоды
    if (params.haydNifasPeriods) {
      for (const period of params.haydNifasPeriods) {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        const daysExcluded = Math.max(0, differenceInDays(end, start));
        excludedDays += daysExcluded;
      }
    }
  }
  
  // Сафар (путешествие)
  let totalTravelDays = params.totalTravelDays || 0;
  if (params.safarDays) {
    for (const period of params.safarDays) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const daysTravel = Math.max(0, differenceInDays(end, start));
      totalTravelDays += daysTravel;
      excludedDays += daysTravel;
    }
  }
  
  // Шаг 5: Эффективные дни
  const effectiveDays = Math.max(0, totalDays - excludedDays);
  
  // Шаг 6: Расчет долга по намазам
  const missedPrayers = {
    fajr: effectiveDays,
    dhuhr: effectiveDays,
    asr: effectiveDays,
    maghrib: effectiveDays,
    isha: effectiveDays,
    witr: madhab === 'hanafi' ? effectiveDays : 0,
  };
  
  const safarPrayers = {
    dhuhrSafar: totalTravelDays,
    asrSafar: totalTravelDays,
    ishaSafar: totalTravelDays,
  };
  
  return {
    ...missedPrayers,
    ...safarPrayers,
    effectiveDays,
    excludedDays,
    totalDays,
    bulughDate,
    period: {
      start: startDate,
      end: endDate,
    },
  };
}

/**
 * Генерация календарных записей для "карты долга"
 */
export async function generateDebtCalendarEntries(
  userId: string,
  calculationResult: QazaCalculationResult
): Promise<void> {
  try {
    const { period } = calculationResult;
    const days = eachDayOfInterval({
      start: period.start,
      end: period.end,
    });
    
    // Создаем записи для каждого дня (по умолчанию все дни с долгом)
    for (const day of days) {
      const dateLocal = format(day, 'yyyy-MM-dd');
      
      await prisma.qazaCalendarEntry.upsert({
        where: {
          userId_dateLocal: {
            userId,
            dateLocal,
          },
        },
        create: {
          userId,
          dateLocal,
          isDebtDay: true, // По умолчанию все дни с долгом
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
          witr: false,
        },
        update: {
          // Обновляем только isDebtDay, если запись уже существует
          isDebtDay: true,
        },
      });
    }
    
    logger.info(`Generated ${days.length} calendar entries for user ${userId}`);
  } catch (error: any) {
    logger.error(`Error generating calendar entries: ${error.message}`);
    throw error;
  }
}

/**
 * Валидация пересечений периодов
 */
export function validatePeriods(
  periods: Array<{ startDate: string; endDate: string }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (let i = 0; i < periods.length; i++) {
    const period1 = periods[i];
    const start1 = new Date(period1.startDate);
    const end1 = new Date(period1.endDate);
    
    if (start1 > end1) {
      errors.push(`Период ${i + 1}: дата начала больше даты окончания`);
    }
    
    for (let j = i + 1; j < periods.length; j++) {
      const period2 = periods[j];
      const start2 = new Date(period2.startDate);
      const end2 = new Date(period2.endDate);
      
      // Проверка пересечения
      if (
        (start1 <= start2 && end1 >= start2) ||
        (start2 <= start1 && end2 >= start1)
      ) {
        errors.push(
          `Периоды ${i + 1} и ${j + 1} пересекаются: ${period1.startDate}-${period1.endDate} и ${period2.startDate}-${period2.endDate}`
        );
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

