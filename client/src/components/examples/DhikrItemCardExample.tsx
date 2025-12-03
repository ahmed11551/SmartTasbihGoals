import { useState } from 'react';
import DhikrItemCard from '../DhikrItemCard';
import { getAllDhikrItems } from '@/lib/dhikrUtils';
import type { DhikrItem } from '@/lib/types';

export default function DhikrItemCardExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = getAllDhikrItems();
  const firstItem = items[0];
  const secondItem = items[1] || items[0];

  if (!firstItem) {
    return <div className="p-4">Нет доступных зикров</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <DhikrItemCard
        item={firstItem}
        isSelected={selectedId === firstItem.id}
        onSelect={(item: DhikrItem) => setSelectedId(item.id)}
        onPlay={(item: DhikrItem) => console.log('Play:', item.titleRu)}
      />
      <DhikrItemCard
        item={secondItem}
        isSelected={selectedId === secondItem.id}
        onSelect={(item: DhikrItem) => setSelectedId(item.id)}
        compact
      />
    </div>
  );
}
