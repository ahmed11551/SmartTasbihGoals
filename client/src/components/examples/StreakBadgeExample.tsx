import StreakBadge from '../StreakBadge';

export default function StreakBadgeExample() {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <StreakBadge count={7} size="sm" />
      <StreakBadge count={15} size="md" />
      <StreakBadge count={30} size="lg" label="дней!" />
    </div>
  );
}
