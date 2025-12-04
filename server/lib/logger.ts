// Централизованное логирование для сервера
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === 'production') {
    // В production логируем только error и warn
    return level === 'error' || level === 'warn';
  }
  // В development логируем всё
  return true;
}

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

