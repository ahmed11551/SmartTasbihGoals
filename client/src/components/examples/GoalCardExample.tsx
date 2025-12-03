import GoalCard from '../GoalCard';
import type { Goal } from '@/lib/types';

export default function GoalCardExample() {
  // Пример данных для демо
  const exampleGoal1: Goal = {
    id: 'example-1',
    userId: 'example',
    category: 'azkar',
    goalType: 'recite',
    title: 'Читать СубханАллах',
    targetCount: 1000,
    currentProgress: 750,
    status: 'active',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const exampleGoal2: Goal = {
    id: 'example-2',
    userId: 'example',
    category: 'salawat',
    goalType: 'recite',
    title: 'Салаваты',
    targetCount: 10000,
    currentProgress: 5432,
    status: 'active',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-4 p-4">
      <GoalCard
        goal={exampleGoal1}
        onContinue={(g) => console.log('Continue goal:', g.title)}
        onEdit={(g) => console.log('Edit goal:', g.title)}
      />
      <GoalCard
        goal={exampleGoal2}
        compact
        onContinue={(g) => console.log('Continue goal:', g.title)}
      />
    </div>
  );
}
