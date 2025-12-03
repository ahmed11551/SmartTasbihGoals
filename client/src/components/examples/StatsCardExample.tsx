import StatsCard from '../StatsCard';
import { Sparkles, Target, Flame, Calendar } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <StatsCard
        title="Всего зикров"
        value={15420}
        icon={Sparkles}
        iconColor="text-emerald-500"
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Целей выполнено"
        value={8}
        icon={Target}
        iconColor="text-blue-500"
        subtitle="в этом месяце"
      />
      <StatsCard
        title="Серия дней"
        value={7}
        icon={Flame}
        iconColor="text-orange-500"
      />
      <StatsCard
        title="Сегодня"
        value={245}
        icon={Calendar}
        iconColor="text-purple-500"
      />
    </div>
  );
}
