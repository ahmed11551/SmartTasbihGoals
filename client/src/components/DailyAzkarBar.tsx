import { cn } from '@/lib/utils';
import type { DailyAzkar, PrayerSegment } from '@/lib/types';
import { prayerLabels } from '@/lib/constants';
import { Check } from 'lucide-react';

interface DailyAzkarBarProps {
  dailyAzkar: DailyAzkar;
  targetPerPrayer?: number;
  onPrayerSelect?: (prayer: PrayerSegment) => void;
  selectedPrayer?: PrayerSegment;
}

const prayers: PrayerSegment[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function DailyAzkarBar({
  dailyAzkar,
  targetPerPrayer = 99,
  onPrayerSelect,
  selectedPrayer,
}: DailyAzkarBarProps) {
  const getPrayerProgress = (prayer: PrayerSegment): number => {
    return dailyAzkar[prayer as keyof Pick<DailyAzkar, 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>] || 0;
  };

  const isPrayerComplete = (prayer: PrayerSegment): boolean => {
    return getPrayerProgress(prayer) >= targetPerPrayer;
  };

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Салаваты после намаза</span>
        <span className="text-xs text-muted-foreground">
          {dailyAzkar.total} / {targetPerPrayer * 5}
        </span>
      </div>
      
      <div className="flex gap-1">
        {prayers.map((prayer) => {
          const progress = getPrayerProgress(prayer);
          const percentage = Math.min((progress / targetPerPrayer) * 100, 100);
          const isComplete = isPrayerComplete(prayer);
          const isSelected = selectedPrayer === prayer;

          return (
            <button
              key={prayer}
              onClick={() => onPrayerSelect?.(prayer)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                "hover-elevate active-elevate-2",
                isSelected && "ring-2 ring-primary",
                isComplete ? "bg-primary/10" : "bg-muted"
              )}
              data-testid={`button-prayer-${prayer}`}
            >
              <div className="relative w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                    isComplete ? "bg-primary" : "bg-chart-1"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center gap-1">
                {isComplete && (
                  <Check className="w-3 h-3 text-primary" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  isComplete ? "text-primary" : "text-muted-foreground"
                )}>
                  {prayerLabels[prayer]}
                </span>
              </div>
              
              <span className="text-[10px] text-muted-foreground">
                {progress}/{targetPerPrayer}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
