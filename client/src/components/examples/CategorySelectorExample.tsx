import { useState } from 'react';
import CategorySelector from '../CategorySelector';
import type { Category } from '@/lib/types';

export default function CategorySelectorExample() {
  const [selected, setSelected] = useState<Category>('azkar');

  return (
    <CategorySelector
      selected={selected}
      onSelect={(category) => {
        setSelected(category);
        console.log(`Selected category: ${category}`);
      }}
    />
  );
}
