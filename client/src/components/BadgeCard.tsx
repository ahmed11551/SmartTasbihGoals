import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Heart, 
  Star, 
  Sparkles,
  Trophy,
  Medal,
  Award,
  Lock
} from 'lucide-react';
import type { Badge, BadgeLevel } from '@/lib/types';

interface BadgeCardProps {
  badge: Badge;
  onClick?: (badge: Badge) => void;
}

const badgeIcons: Record<string, typeof Trophy> = {
  prayer_streak: Trophy,
  quran_reader: BookOpen,
  dhikr_master: Sparkles,
  salawat_lover: Heart,
  default: Award,
};

const levelColors: Record<BadgeLevel, { bg: string; border: string; icon: string }> = {
  copper: {
    bg: 'bg-amber-700/10',
    border: 'border-amber-700/30',
    icon: 'text-amber-700',
  },
  silver: {
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
    icon: 'text-gray-400',
  },
  gold: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-500',
  },
};

const levelLabels: Record<BadgeLevel, string> = {
  copper: 'Бронза',
  silver: 'Серебро',
  gold: 'Золото',
};

export default function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const Icon = badgeIcons[badge.type] || badgeIcons.default;
  const colors = levelColors[badge.level];
  const progress = badge.progress && badge.target 
    ? (badge.progress / badge.target) * 100 
    : 0;

  return (
    <Card
      className={cn(
        "p-4 text-center space-y-2 hover-elevate cursor-pointer",
        !badge.isUnlocked && "opacity-60"
      )}
      onClick={() => onClick?.(badge)}
      data-testid={`card-badge-${badge.id}`}
    >
      <div className={cn(
        "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
        "border-2",
        colors.bg,
        colors.border
      )}>
        {badge.isUnlocked ? (
          <Icon className={cn("w-8 h-8", colors.icon)} />
        ) : (
          <Lock className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      <div>
        <h4 className={cn(
          "font-semibold text-sm",
          badge.isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {badge.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {badge.description}
        </p>
      </div>

      {badge.isUnlocked ? (
        <div className="flex items-center justify-center gap-1">
          <Medal className={cn("w-3 h-3", colors.icon)} />
          <span className={cn("text-xs font-medium", colors.icon)}>
            {levelLabels[badge.level]}
          </span>
        </div>
      ) : (
        badge.progress !== undefined && badge.target && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground">
              {badge.progress.toLocaleString()} / {badge.target.toLocaleString()}
            </span>
          </div>
        )
      )}

      {badge.achievedAt && (
        <p className="text-[10px] text-muted-foreground">
          {new Date(badge.achievedAt).toLocaleDateString('ru-RU')}
        </p>
      )}
    </Card>
  );
}
