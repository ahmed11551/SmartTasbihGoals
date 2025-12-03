import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  count: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StreakBadge({ 
  count, 
  label = 'дней подряд',
  size = 'md',
  className 
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1 px-2 py-1',
    md: 'text-base gap-1.5 px-3 py-1.5',
    lg: 'text-lg gap-2 px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
        "border border-amber-500/30",
        sizeClasses[size],
        className
      )}
      data-testid="badge-streak"
    >
      <Flame className={cn(iconSizes[size], "text-orange-500")} />
      <span className="font-semibold text-orange-600 dark:text-orange-400">
        {count}
      </span>
      <span className="text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
