import { useState } from 'react';
import DhikrSelector from '../DhikrSelector';
import type { DhikrItem } from '@/lib/types';

export default function DhikrSelectorExample() {
  const [selected, setSelected] = useState<DhikrItem | undefined>();

  return (
    <div className="p-4">
      <DhikrSelector
        selectedItem={selected}
        onSelect={(item) => {
          setSelected(item);
          console.log('Selected:', item.titleRu);
        }}
      />
    </div>
  );
}
