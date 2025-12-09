import { useState, useEffect, useCallback } from 'react';
import type { TranscriptionType } from '@/lib/types';

type Language = 'ru' | 'en' | 'ar';

interface LocalizationSettings {
  language: Language;
  transcriptionType: TranscriptionType;
}

const STORAGE_KEY = 'smart-tasbih-localization';

const defaultSettings: LocalizationSettings = {
  language: 'ru',
  transcriptionType: 'cyrillic',
};

/**
 * Hook для управления настройками локализации
 * Сохраняет настройки в localStorage и предоставляет функции для их изменения
 */
export function useLocalization() {
  const [settings, setSettings] = useState<LocalizationSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          language: parsed.language || defaultSettings.language,
          transcriptionType: parsed.transcriptionType || defaultSettings.transcriptionType,
        };
      }
    } catch (error) {
      console.error('Failed to load localization settings:', error);
    }
    
    return defaultSettings;
  });

  // Загружаем настройки при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          language: parsed.language || defaultSettings.language,
          transcriptionType: parsed.transcriptionType || defaultSettings.transcriptionType,
        });
      }
    } catch (error) {
      console.error('Failed to load localization settings:', error);
    }
  }, []);

  // Сохраняем настройки в localStorage при изменении
  const saveSettings = useCallback((newSettings: Partial<LocalizationSettings>) => {
    if (typeof window === 'undefined') return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save localization settings:', error);
    }
  }, [settings]);

  const setLanguage = useCallback((language: Language) => {
    saveSettings({ language });
  }, [saveSettings]);

  const setTranscriptionType = useCallback((transcriptionType: TranscriptionType) => {
    saveSettings({ transcriptionType });
  }, [saveSettings]);

  return {
    language: settings.language,
    transcriptionType: settings.transcriptionType,
    setLanguage,
    setTranscriptionType,
    setSettings: saveSettings,
  };
}
