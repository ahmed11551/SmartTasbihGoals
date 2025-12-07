import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
  period?: 'week' | 'month' | 'year';
}

/**
 * Компонент тепловой карты активности (по аналогии с GitHub Contributions)
 */
export default function ActivityHeatmap({ data, period = 'year' }: ActivityHeatmapProps) {
  // Максимальное значение для нормализации цветов
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  // Функция для получения цвета по интенсивности
  const getColor = (count: number): string => {
    if (count === 0) return 'bg-muted/20';
    
    const intensity = count / maxCount;
    
    if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900/30';
    if (intensity < 0.5) return 'bg-green-400 dark:bg-green-800/50';
    if (intensity < 0.75) return 'bg-green-600 dark:bg-green-700/70';
    return 'bg-green-700 dark:bg-green-600';
  };

  // Группировать данные по неделям для удобного отображения
  const weeks = useMemo(() => {
    if (data.length === 0) return [];

    const weeksMap: Record<string, Array<{ date: string; count: number }>> = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      const key = `${year}-W${week}`;
      
      if (!weeksMap[key]) {
        weeksMap[key] = [];
      }
      weeksMap[key].push(item);
    });

    // Преобразовать в массив и отсортировать
    return Object.entries(weeksMap)
      .map(([week, items]) => ({
        week,
        items: items.sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => b.week.localeCompare(a.week));
  }, [data]);

  // Функция для получения номера недели
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Получить день недели из даты
  const getDayOfWeek = (dateStr: string): number => {
    const date = new Date(dateStr);
    return date.getDay(); // 0 = воскресенье, 6 = суббота
  };

  // Форматирование даты для tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  // Для упрощения, показываем последние 53 недели (год)
  const displayWeeks = weeks.slice(0, 53);
  const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Легенда дней недели */}
        <div className="flex flex-col gap-1 mr-2">
          <div className="h-4" /> {/* Отступ для выравнивания */}
          {dayLabels.map((label, index) => (
            <div
              key={label}
              className="h-3 text-xs text-muted-foreground text-right pr-2"
              style={{ 
                visibility: index % 2 === 0 ? 'visible' : 'hidden' // Показывать только четные для компактности
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Недели */}
        {displayWeeks.map((week) => (
          <div key={week.week} className="flex flex-col gap-1">
            {/* Заголовок недели (показывать редко) */}
            <div className="h-4 text-xs text-muted-foreground text-center">
              {displayWeeks.indexOf(week) % 8 === 0 && (
                <span className="text-[10px]">
                  {new Date(week.items[0]?.date || '').toLocaleDateString('ru-RU', { month: 'short' })}
                </span>
              )}
            </div>
            
            {/* Дни недели */}
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              // Найти день недели в данных этой недели
              const dayData = week.items.find(item => getDayOfWeek(item.date) === dayIndex);
              
              return (
                <div
                  key={`${week.week}-${dayIndex}`}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-primary cursor-pointer',
                    getColor(dayData?.count || 0)
                  )}
                  title={dayData 
                    ? `${formatDate(dayData.date)}: ${dayData.count} зикров`
                    : 'Нет активности'
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Меньше</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/20" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/30" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-800/50" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-700/70" />
          <div className="w-3 h-3 rounded-sm bg-green-700 dark:bg-green-600" />
        </div>
        <span>Больше</span>
        <span className="ml-auto">
          Максимум: {maxCount} зикров
        </span>
      </div>
    </div>
  );
}

