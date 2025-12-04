// Sentry error tracking integration
// Опциональная интеграция - работает только если SENTRY_DSN установлен

let sentryInitialized = false;

export function initSentry() {
  // Проверяем наличие DSN
  const dsn = import.meta.env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN;
  
  if (!dsn || sentryInitialized) {
    return;
  }

  try {
    // Динамический импорт Sentry (чтобы не добавлять в bundle если не используется)
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE || process.env.NODE_ENV || 'production',
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: 0.1, // 10% транзакций
        replaysSessionSampleRate: 0.01, // 1% сессий
        replaysOnErrorSampleRate: 1.0, // 100% ошибок
      });
      sentryInitialized = true;
    }).catch(() => {
      // Sentry не установлен или ошибка импорта - игнорируем
    });
  } catch (error) {
    // Игнорируем ошибки инициализации
  }
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!sentryInitialized) return;
  
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    });
  } catch {
    // Игнорируем ошибки
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) return;
  
  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.captureMessage(message, level);
    });
  } catch {
    // Игнорируем ошибки
  }
}

