import { logger } from './logger';

interface PerformanceMetric {
  path: string;
  method: string;
  duration: number;
  timestamp: number;
  statusCode: number;
}

class PerformanceMetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // Хранить последние 1000 запросов
  private readonly PERCENTILE_95_TARGET = 150; // Целевой 95-й перцентиль в мс

  /**
   * Добавить метрику производительности
   */
  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Ограничиваем размер массива
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Получить 95-й перцентиль времени ответа за период
   */
  getPercentile95(periodMinutes: number = 60): number {
    const now = Date.now();
    const periodStart = now - (periodMinutes * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= periodStart);
    
    if (recentMetrics.length === 0) {
      return 0;
    }

    // Сортировать по длительности
    const sorted = recentMetrics
      .map(m => m.duration)
      .sort((a, b) => a - b);

    // Рассчитать индекс для 95-го перцентиля
    const index95 = Math.ceil(sorted.length * 0.95) - 1;
    
    return sorted[index95] || 0;
  }

  /**
   * Получить все метрики за период
   */
  getMetrics(periodMinutes: number = 60): PerformanceMetric[] {
    const now = Date.now();
    const periodStart = now - (periodMinutes * 60 * 1000);
    
    return this.metrics.filter(m => m.timestamp >= periodStart);
  }

  /**
   * Получить статистику по метрикам
   */
  getStats(periodMinutes: number = 60): {
    count: number;
    avg: number;
    min: number;
    max: number;
    percentile95: number;
    percentile99: number;
    belowTarget: number; // Количество запросов ниже целевого значения
    aboveTarget: number; // Количество запросов выше целевого значения
  } {
    const metrics = this.getMetrics(periodMinutes);
    
    if (metrics.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        percentile95: 0,
        percentile99: 0,
        belowTarget: 0,
        aboveTarget: 0,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    
    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = sum / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    
    const index95 = Math.ceil(durations.length * 0.95) - 1;
    const percentile95 = durations[index95] || 0;
    
    const index99 = Math.ceil(durations.length * 0.99) - 1;
    const percentile99 = durations[index99] || 0;

    const belowTarget = durations.filter(d => d < this.PERCENTILE_95_TARGET).length;
    const aboveTarget = durations.filter(d => d >= this.PERCENTILE_95_TARGET).length;

    return {
      count: metrics.length,
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      percentile95: Math.round(percentile95),
      percentile99: Math.round(percentile99),
      belowTarget,
      aboveTarget,
    };
  }

  /**
   * Проверить, превышает ли 95-й перцентиль целевое значение
   */
  isPerformanceGood(periodMinutes: number = 60): boolean {
    const percentile95 = this.getPercentile95(periodMinutes);
    return percentile95 <= this.PERCENTILE_95_TARGET;
  }

  /**
   * Логировать предупреждение, если производительность плохая
   */
  logPerformanceWarning(periodMinutes: number = 60) {
    const stats = this.getStats(periodMinutes);
    
    if (!this.isPerformanceGood(periodMinutes)) {
      logger.warn(`[PERFORMANCE] 95th percentile (${stats.percentile95}ms) exceeds target (${this.PERCENTILE_95_TARGET}ms)`, {
        percentile95: stats.percentile95,
        target: this.PERCENTILE_95_TARGET,
        periodMinutes,
        totalRequests: stats.count,
        aboveTarget: stats.aboveTarget,
      });
    }
  }
}

export const performanceMetrics = new PerformanceMetricsCollector();

/**
 * Middleware для сбора метрик производительности
 */
export function performanceMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    performanceMetrics.addMetric({
      path,
      method,
      duration,
      timestamp: Date.now(),
      statusCode,
    });

    // Логировать предупреждение каждые 100 запросов
    if (performanceMetrics.getMetrics().length % 100 === 0) {
      performanceMetrics.logPerformanceWarning(60);
    }
  });

  next();
}

