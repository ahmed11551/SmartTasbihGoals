import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Moon, 
  Heart, 
  Star, 
  Sparkles,
  Hand,
  ScrollText,
  Layers
} from 'lucide-react';
import type { Category } from '@/lib/types';
import { categoryLabels } from '@/lib/constants';

interface CategorySelectorProps {
  selected?: Category;
  onSelect?: (category: Category) => void;
  showAll?: boolean;
}

const categories: { id: Category; icon: typeof BookOpen; color: string }[] = [
  { id: 'azkar', icon: Sparkles, color: 'text-emerald-500' },
  { id: 'salawat', icon: Heart, color: 'text-pink-500' },
  { id: 'dua', icon: Moon, color: 'text-blue-500' },
  { id: 'surah', icon: BookOpen, color: 'text-amber-500' },
  { id: 'ayah', icon: ScrollText, color: 'text-orange-500' },
  { id: 'names99', icon: Star, color: 'text-purple-500' },
  { id: 'kalimat', icon: Hand, color: 'text-teal-500' },
  { id: 'general', icon: Layers, color: 'text-gray-500' },
];

export default function CategorySelector({ 
  selected, 
  onSelect,
  showAll = true 
}: CategorySelectorProps) {
  const displayCategories = showAll 
    ? categories 
    : categories.filter(c => c.id !== 'general');

  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {displayCategories.map(({ id, icon: Icon, color }) => (
        <button
          key={id}
          onClick={() => onSelect?.(id)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
            "hover-elevate active-elevate-2",
            selected === id 
              ? "bg-primary/10 ring-2 ring-primary" 
              : "bg-card"
          )}
          data-testid={`button-category-${id}`}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            selected === id ? "bg-primary/20" : "bg-muted"
          )}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <span className={cn(
            "text-xs font-medium text-center",
            selected === id ? "text-primary" : "text-muted-foreground"
          )}>
            {categoryLabels[id]}
          </span>
        </button>
      ))}
    </div>
  );
}
