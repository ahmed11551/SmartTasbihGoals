// Система локализации и переводов

import translations, { type Language, type Translations } from './translations';
import { useLocalization } from '@/hooks/use-localization';

/**
 * Получить перевод для текущего языка
 */
export function useTranslation() {
  const { language } = useLocalization();
  const t = translations[language];

  /**
   * Получить перевод по пути (например: 'common.save' -> 'Сохранить')
   */
  const translate = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Если ключ не найден, возвращаем сам ключ
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Замена параметров в строке (например: "Hello {name}" -> "Hello John")
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return {
    t,
    language,
    translate,
  };
}

/**
 * Хелпер для получения переводов вне компонентов
 */
export function getTranslation(language: Language, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Экспорт всех переводов для использования в компонентах
 */
export { translations };
export type { Language, Translations };
