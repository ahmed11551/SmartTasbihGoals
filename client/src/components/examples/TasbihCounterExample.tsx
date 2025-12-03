import TasbihCounter from '../TasbihCounter';
import { getDhikrItemsByCategory } from '@/lib/dhikrUtils';

export default function TasbihCounterExample() {
  const azkarItems = getDhikrItemsByCategory('azkar');
  const item = azkarItems.find(item => item.slug.includes('subhanallah')) || azkarItems[0] || {
    id: 'example',
    category: 'azkar' as const,
    slug: 'subhanallah',
    titleAr: 'سُبْحَانَ اللَّهِ',
    titleRu: 'СубханАллах',
    titleEn: 'SubhanAllah',
    transcriptionCyrillic: 'СубханАллах',
    translation: 'Пречист Аллах',
  };

  return (
    <TasbihCounter
      item={item}
      targetCount={99}
      initialCount={33}
      isCountdown={true}
      onCountChange={(count, delta) => console.log(`Count: ${count}, Delta: ${delta}`)}
      onComplete={() => console.log('Goal completed!')}
    />
  );
}
