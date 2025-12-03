import { useState } from 'react';
import TasbihCounter from '@/components/TasbihCounter';
import DailyAzkarBar from '@/components/DailyAzkarBar';
import DhikrSelector from '@/components/DhikrSelector';
import StreakBadge from '@/components/StreakBadge';
import GoalCard from '@/components/GoalCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Settings2, Target, ChevronRight, History, Play, Volume2 } from 'lucide-react';
import type { DhikrItem, PrayerSegment, TranscriptionType } from '@/lib/types';
import { Link } from 'wouter';
import { useGoals } from '@/hooks/use-api';
import { useDailyAzkar, useStats } from '@/hooks/use-api';
import { getTodayDhikrItem, getDhikrItemsByCategory } from '@/lib/dhikrUtils';

interface RecentAction {
  id: string;
  item: DhikrItem;
  count: number;
  rounds: number;
  timestamp: Date;
}

export default function TasbihPage() {
  const { data: goals = [] } = useGoals();
  const { data: stats } = useStats();
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyAzkarData } = useDailyAzkar(today);

  // Получаем зикр дня или первый доступный
  const defaultDhikr = getTodayDhikrItem() || getDhikrItemsByCategory('azkar')[0] || {
    id: 'default',
    category: 'azkar' as const,
    slug: 'subhanallah',
    titleAr: 'سُبْحَانَ اللَّهِ',
    titleRu: 'СубханАллах',
    titleEn: 'SubhanAllah',
    transcriptionCyrillic: 'СубханАллах',
    translation: 'Пречист Аллах',
  };
  
  const [selectedItem, setSelectedItem] = useState<DhikrItem>(defaultDhikr);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerSegment>('none');
  const [currentCount, setCurrentCount] = useState(0);
  const [currentRounds, setCurrentRounds] = useState(0);
  const [counterKey, setCounterKey] = useState(() => Date.now().toString());
  const [showTranscription, setShowTranscription] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [transcriptionType, setTranscriptionType] = useState<TranscriptionType>('cyrillic');
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);

  const activeGoals = goals.filter((g: any) => g.status === 'active').slice(0, 2);
  const currentStreak = stats?.stats?.currentStreak || 0;
  
  const dailyAzkar = dailyAzkarData || {
    userId: '',
    dateLocal: today,
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    total: 0,
    isComplete: false,
  };

  const handlePrayerSelect = (prayer: PrayerSegment) => {
    setSelectedPrayer(prayer);
    setCurrentCount(0);
    setCurrentRounds(0);
    setCounterKey(Date.now().toString());
    const salawatItems = getDhikrItemsByCategory('salawat');
    const salawatItem = salawatItems[0] || defaultDhikr;
    setSelectedItem({
      ...salawatItem,
      titleRu: `Салаваты после ${prayer}`,
    });
  };

  const handleCountChange = (count: number, delta: number, rounds: number) => {
    setCurrentCount(count);
    setCurrentRounds(rounds);
    
    if (count > 0 && delta > 0) {
      setRecentActions(prev => {
        const existingIndex = prev.findIndex(a => a.item.id === selectedItem.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            count,
            rounds,
            timestamp: new Date(),
          };
          return updated;
        }
        return [
          {
            id: Date.now().toString(),
            item: selectedItem,
            count,
            rounds,
            timestamp: new Date(),
          },
          ...prev.slice(0, 4),
        ];
      });
    }
  };

  const handleComplete = () => {
    console.log('Goal completed!');
  };

  const handleContinueRecent = (action: RecentAction) => {
    setSelectedItem(action.item);
    setCurrentCount(action.count);
    setCurrentRounds(action.rounds);
    setCounterKey(Date.now().toString());
  };

  const handleDhikrSelect = (item: DhikrItem) => {
    setSelectedItem(item);
    setCurrentCount(0);
    setCurrentRounds(0);
    setCounterKey(Date.now().toString());
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          <h1 className="font-display font-semibold text-lg">Умный Тасбих</h1>
          
          <div className="flex items-center gap-2">
            <StreakBadge count={currentStreak} size="sm" label="" />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-tasbih-settings">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Настройки тасбиха</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="audio-player">Воспроизведение</Label>
                    </div>
                    <Switch
                      id="audio-player"
                      checked={showAudioPlayer}
                      onCheckedChange={setShowAudioPlayer}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transcription">Транскрипция</Label>
                    <Switch
                      id="transcription"
                      checked={showTranscription}
                      onCheckedChange={setShowTranscription}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="translation">Перевод</Label>
                    <Switch
                      id="translation"
                      checked={showTranslation}
                      onCheckedChange={setShowTranslation}
                    />
                  </div>

                  {showTranscription && (
                    <div className="space-y-2">
                      <Label>Тип транскрипции</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={transcriptionType === 'cyrillic' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => setTranscriptionType('cyrillic')}
                        >
                          Кириллица
                        </Button>
                        <Button
                          variant={transcriptionType === 'latin' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => setTranscriptionType('latin')}
                        >
                          Латиница
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div className="py-4">
          <DailyAzkarBar
            dailyAzkar={dailyAzkar}
            targetPerPrayer={99}
            selectedPrayer={selectedPrayer}
            onPrayerSelect={handlePrayerSelect}
          />
        </div>

        <div className="px-4 mb-4 space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">Быстрый выбор</span>
          <DhikrSelector
            selectedItem={selectedItem}
            onSelect={handleDhikrSelect}
          />
        </div>

        <div className="py-4">
          <TasbihCounter
            item={selectedItem}
            initialCount={currentCount}
            initialRounds={currentRounds}
            counterKey={counterKey}
            onCountChange={handleCountChange}
            onComplete={handleComplete}
            showTranscription={showTranscription}
            showTranslation={showTranslation}
            showAudioPlayer={showAudioPlayer}
            transcriptionType={transcriptionType}
          />
        </div>

        {recentActions.length > 0 && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Последние действия</span>
            </div>
            
            <div className="space-y-2">
              {recentActions.slice(0, 3).map((action) => (
                <Card 
                  key={action.id} 
                  className="p-3 hover-elevate cursor-pointer active:scale-[0.98] transition-transform touch-manipulation"
                  onClick={() => handleContinueRecent(action)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleContinueRecent(action);
                    }
                  }}
                  data-testid={`recent-action-${action.id}`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.item.titleRu}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{action.count} счёт</span>
                        {action.rounds > 0 && (
                          <span className="text-gold">• {action.rounds} кр.</span>
                        )}
                        <span>• {formatTimeAgo(action.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                      <Play className="w-3 h-3" />
                      <span>Продолжить</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeGoals.length > 0 && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Ваши ближайшие цели</span>
              </div>
              <Link href="/goals">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Все цели
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  compact
                  onContinue={(g) => {
                    if (g.item) {
                      setSelectedItem(g.item);
                      setCurrentCount(0);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
