/**
 * Сервис для расчета дат по хиджре и конвертации между хиджрой и григорианским календарем
 * Использует e-Replika API для точных расчетов, с fallback на упрощенный алгоритм
 */

import { botReplikaRequest } from "./bot-replika-api";
import { logger } from "./logger";

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

export interface DateConversionResult {
  hijri: HijriDate;
  gregorian: Date;
}

/**
 * Конвертация григорианской даты в хиджру (умм аль-кура)
 * Использует e-Replika API с fallback на упрощенный алгоритм
 */
export async function convertToHijri(
  gregorianDate: Date,
  calendar: "ummalqura" | "islamic" = "ummalqura"
): Promise<HijriDate> {
  try {
    // Попытка использовать e-Replika API
    const apiUserId = "system";
    const result = await botReplikaRequest<{ hijri?: HijriDate; error?: string }>({
      method: "POST",
      path: "/hijri/convert",
      body: {
        date: gregorianDate.toISOString().split("T")[0],
        calendar,
      },
      userId: apiUserId,
    });

    if (result.hijri) {
      return result.hijri;
    }
  } catch (error: any) {
    logger.warn(`Failed to convert to Hijri via e-Replika API: ${error.message}`);
    // Fallback на упрощенный алгоритм
  }

  // Упрощенный алгоритм конвертации (для fallback)
  return convertToHijriSimple(gregorianDate);
}

/**
 * Конвертация хиджры в григорианскую дату
 */
export async function convertToGregorian(hijriDate: HijriDate): Promise<Date> {
  try {
    // Попытка использовать e-Replika API
    const apiUserId = "system";
    const result = await botReplikaRequest<{ gregorian?: string; error?: string }>({
      method: "POST",
      path: "/hijri/to-gregorian",
      body: {
        year: hijriDate.year,
        month: hijriDate.month,
        day: hijriDate.day,
      },
      userId: apiUserId,
    });

    if (result.gregorian) {
      return new Date(result.gregorian);
    }
  } catch (error: any) {
    logger.warn(`Failed to convert Hijri to Gregorian via e-Replika API: ${error.message}`);
    // Fallback на упрощенный алгоритм
  }

  // Упрощенный алгоритм конвертации (для fallback)
  return convertToGregorianSimple(hijriDate);
}

/**
 * Расчет даты булюга с учетом хиджры
 * Булюг наступает в определенном возрасте по хиджре, не по григорианскому календарю
 */
export async function calculateBulughDate(
  birthDate: Date,
  customBulughAge: number = 15
): Promise<Date> {
  try {
    // Конвертируем дату рождения в хиджру
    const hijriBirth = await convertToHijri(birthDate);
    
    // Добавляем возраст булюга в хиджре
    const bulughHijri: HijriDate = {
      year: hijriBirth.year + customBulughAge,
      month: hijriBirth.month,
      day: hijriBirth.day,
    };
    
    // Конвертируем обратно в григорианский календарь
    const bulughGregorian = await convertToGregorian(bulughHijri);
    
    return bulughGregorian;
  } catch (error: any) {
    logger.warn(`Failed to calculate bulugh date with Hijri: ${error.message}`);
    // Fallback на упрощенный расчет (просто добавляем годы)
    const fallbackDate = new Date(birthDate);
    fallbackDate.setFullYear(fallbackDate.getFullYear() + customBulughAge);
    return fallbackDate;
  }
}

/**
 * Упрощенная конвертация в хиджру (fallback)
 * Использует приблизительный коэффициент: 1 хиджрский год ≈ 0.97 григорианского
 */
function convertToHijriSimple(gregorianDate: Date): HijriDate {
  // Базовый год: 16 июля 622 г. н.э. = 1 мухаррам 1 г.х.
  const epoch = new Date(622, 6, 16); // Июль = месяц 6 (0-based)
  
  const daysSinceEpoch = Math.floor(
    (gregorianDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Приблизительно: 354.37 дней в хиджрском году
  const hijriYears = Math.floor(daysSinceEpoch / 354.37);
  const daysInYear = daysSinceEpoch % 354.37;
  
  // Приблизительные месяцы (29-30 дней каждый)
  const months = [
    { name: "Muharram", days: 30 },
    { name: "Safar", days: 29 },
    { name: "Rabi' al-awwal", days: 30 },
    { name: "Rabi' al-thani", days: 29 },
    { name: "Jumada al-awwal", days: 30 },
    { name: "Jumada al-thani", days: 29 },
    { name: "Rajab", days: 30 },
    { name: "Sha'ban", days: 29 },
    { name: "Ramadan", days: 30 },
    { name: "Shawwal", days: 29 },
    { name: "Dhu al-Qi'dah", days: 30 },
    { name: "Dhu al-Hijjah", days: 29 },
  ];
  
  let remainingDays = daysInYear;
  let month = 1;
  let day = 1;
  
  for (let i = 0; i < months.length; i++) {
    if (remainingDays < months[i].days) {
      month = i + 1;
      day = Math.floor(remainingDays) + 1;
      break;
    }
    remainingDays -= months[i].days;
  }
  
  return {
    year: 1 + hijriYears,
    month,
    day,
  };
}

/**
 * Упрощенная конвертация из хиджры в григорианскую дату (fallback)
 */
function convertToGregorianSimple(hijriDate: HijriDate): Date {
  // Базовый год: 16 июля 622 г. н.э. = 1 мухаррам 1 г.х.
  const epoch = new Date(622, 6, 16);
  
  // Приблизительно: 354.37 дней в хиджрском году
  const yearsInDays = (hijriDate.year - 1) * 354.37;
  
  // Приблизительные месяцы
  const months = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const monthsInDays = months
    .slice(0, hijriDate.month - 1)
    .reduce((sum, days) => sum + days, 0);
  
  const totalDays = yearsInDays + monthsInDays + (hijriDate.day - 1);
  const resultDate = new Date(epoch);
  resultDate.setDate(resultDate.getDate() + Math.floor(totalDays));
  
  return resultDate;
}

/**
 * Добавить годы по хиджре к дате
 */
export async function addHijriYears(
  date: Date,
  years: number
): Promise<Date> {
  const hijriDate = await convertToHijri(date);
  const newHijriDate: HijriDate = {
    year: hijriDate.year + years,
    month: hijriDate.month,
    day: hijriDate.day,
  };
  return convertToGregorian(newHijriDate);
}

