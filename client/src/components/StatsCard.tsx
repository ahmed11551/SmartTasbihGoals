import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <Card className="p-4 relative overflow-visible" data-testid={`card-stats-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <Icon className={cn(
        "w-5 h-5 absolute top-4 right-4",
        iconColor
      )} />
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {(subtitle || trend) && (
          <div className="flex items-center gap-2">
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
