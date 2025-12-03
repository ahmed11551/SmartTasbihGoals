import BadgeCard from '../BadgeCard';
import type { Badge } from '@/lib/types';

export default function BadgeCardExample() {
  // Пример данных для демо (badges пока не реализованы в API)
  const exampleBadges: Badge[] = [
    {
      id: 'example-1',
      type: 'streak',
      title: 'Первые 100',
      description: 'Выполните 100 зикров',
      level: 'copper',
      icon: 'Flame',
      isUnlocked: true,
      achievedAt: new Date().toISOString(),
    },
    {
      id: 'example-2',
      type: 'streak',
      title: 'Неделя подряд',
      description: '7 дней подряд',
      level: 'silver',
      icon: 'Calendar',
      isUnlocked: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {exampleBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          onClick={(b) => console.log('Badge clicked:', b.title)}
        />
      ))}
    </div>
  );
}
