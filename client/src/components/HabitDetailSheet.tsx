import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Target, 
  X, 
  BookOpen, 
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { getIconByName } from '@/lib/iconUtils';
import { habitCategories, difficultyLabels, type HabitTemplate } from '@/lib/habitsCatalog';

interface HabitDetailSheetProps {
  habit: HabitTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit?: () => void;
  onAddGoal?: () => void;
}

// Маппинг хадисов (можно расширить)
const hadithDatabase: Record<string, { text: string; source: string; benefit?: string }> = {
  'muslim-408': {
    text: 'Кто бы ни послал на меня салават, Аллах пошлёт ему десять благословений.',
    source: 'Муслим, 408',
    benefit: 'Салават приносит благословения и очищает сердце.',
  },
  'bukhari-1987': {
    text: 'Кто совершит намаз Духа из двенадцати ракаатов, Аллах построит для него дом в Раю.',
    source: 'аль-Бухари, 1987',
    benefit: 'Намаз Духа приносит большое вознаграждение и благословения.',
  },
  'muslim-720': {
    text: 'Кто совершит намаз Духа, тому запишется вознаграждение как за совершение умры.',
    source: 'Муслим, 720',
    benefit: 'Намаз Духа - это сунна, которая приносит большое вознаграждение.',
  },
  'bukhari-1981': {
    text: 'Лучший зикр - это "Ля иляха илля Ллах", а лучшая дуа - это "Альхамдулиллях".',
    source: 'аль-Бухари, 1981',
    benefit: 'Зикр очищает сердце и приближает к Аллаху.',
  },
  'muslim-2699': {
    text: 'Кто прочитает суру Аль-Мульк каждую ночь, Аллах защитит его от мучений могилы.',
    source: 'Муслим, 2699',
    benefit: 'Чтение суры Аль-Мульк защищает от мучений могилы.',
  },
  'bukhari-5017': {
    text: 'Кто прочитает суру Аль-Кахф в пятницу, тому будет свет между двумя пятницами.',
    source: 'аль-Бухари, 5017',
    benefit: 'Чтение суры Аль-Кахф в пятницу приносит свет и благословения.',
  },
};

export default function HabitDetailSheet({ 
  habit, 
  open, 
  onOpenChange, 
  onAddHabit, 
  onAddGoal 
}: HabitDetailSheetProps) {
  if (!habit) return null;

  const category = habitCategories.find(c => c.id === habit.category);
  const difficulty = difficultyLabels[habit.difficulty];
  const hadith = habit.hadithRef ? hadithDatabase[habit.hadithRef.toLowerCase()] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                {habit.title}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Иконка и категория */}
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category?.color}15` }}
              >
                {getIconByName(habit.iconName, "w-6 h-6")}
              </div>
              <div className="flex-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${category?.color}10`,
                    color: category?.color,
                  }}
                >
                  {category?.title}
                </Badge>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className={`w-1.5 h-1.5 rounded-full ${difficulty.color}`} 
                  />
                  <span className="text-xs text-muted-foreground">
                    {difficulty.label}
                  </span>
                  {habit.linkedToTasbih && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                      <CircleDot className="w-2 h-2" />
                      Тасбих
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Описание */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Описание</h3>
              <p className="text-sm leading-relaxed">{habit.description}</p>
            </div>

            {/* Хадис */}
            {hadith && (
              <>
                <Separator />
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1">Хадис</h3>
                      <p className="text-sm leading-relaxed italic mb-2">
                        "{hadith.text}"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hadith.source}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Польза */}
            {hadith?.benefit && (
              <>
                <Separator />
                <Card className="p-4 bg-green-500/5 border-green-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1 text-green-600">Польза</h3>
                      <p className="text-sm leading-relaxed text-green-700 dark:text-green-400">
                        {hadith.benefit}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Рекомендации */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Рекомендации</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {habit.suggestedRepeat !== 'never' && (
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>
                      Повтор: {habit.suggestedRepeat === 'daily' ? 'Ежедневно' : 
                              habit.suggestedRepeat === 'weekly' ? 'Еженедельно' : 
                              habit.suggestedRepeat === 'monthly' ? 'Ежемесячно' : 'Настроить'}
                    </span>
                  </div>
                )}
                {habit.suggestedTime && (
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Рекомендуемое время: {habit.suggestedTime}</span>
                  </div>
                )}
                {habit.targetCount && (
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Целевое количество: {habit.targetCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="p-4 border-t border-border space-y-2 bg-background">
            <div className="flex gap-2">
              {onAddHabit && (
                <Button
                  onClick={() => {
                    onAddHabit();
                    onOpenChange(false);
                  }}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Plus className="w-4 h-4" />
                  Добавить привычку
                </Button>
              )}
              {onAddGoal && (
                <Button
                  onClick={() => {
                    onAddGoal();
                    onOpenChange(false);
                  }}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Target className="w-4 h-4" />
                  Создать цель
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

