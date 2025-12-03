import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calculator, Calendar, Target, Plus, Check } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { prayerLabels } from '@/lib/constants';

interface QazaDebt {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

interface QazaProgress {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export default function QazaCalculatorPage() {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [prayerStartYear, setPrayerStartYear] = useState('');
  
  const [debt, setDebt] = useState<QazaDebt>({
    fajr: 1825,
    dhuhr: 1825,
    asr: 1825,
    maghrib: 1825,
    isha: 1825,
    witr: 1825,
  });
  
  const [progress, setProgress] = useState<QazaProgress>({
    fajr: 245,
    dhuhr: 312,
    asr: 189,
    maghrib: 278,
    isha: 156,
    witr: 98,
  });

  const [manualInput, setManualInput] = useState({
    years: 5,
    months: 0,
  });

  const totalDebt = Object.values(debt).reduce((a, b) => a + b, 0);
  const totalProgress = Object.values(progress).reduce((a, b) => a + b, 0);
  const overallProgress = (totalProgress / totalDebt) * 100;

  const handleCalculate = () => {
    const totalDays = manualInput.years * 365 + manualInput.months * 30;
    const newDebt: QazaDebt = {
      fajr: totalDays,
      dhuhr: totalDays,
      asr: totalDays,
      maghrib: totalDays,
      isha: totalDays,
      witr: totalDays,
    };
    setDebt(newDebt);
    console.log('Calculated debt:', newDebt);
  };

  const handleMarkDone = (prayer: keyof QazaProgress) => {
    setProgress((prev) => ({
      ...prev,
      [prayer]: prev[prayer] + 1,
    }));
    console.log(`Marked ${prayer} as done`);
  };

  const prayers: (keyof QazaDebt)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-md mx-auto">
          <Link href="/goals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display font-semibold text-lg">Калькулятор Каза</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">Общий прогресс</h2>
              <p className="text-sm text-muted-foreground">
                {totalProgress.toLocaleString()} из {totalDebt.toLocaleString()} намазов
              </p>
            </div>
          </div>
          
          <Progress value={overallProgress} className="h-3" />
          
          <p className="text-center text-lg font-semibold text-primary">
            {overallProgress.toFixed(1)}% выполнено
          </p>
        </Card>

        <div className="flex gap-2">
          <Button
            variant={mode === 'manual' ? 'default' : 'secondary'}
            className="flex-1"
            onClick={() => setMode('manual')}
          >
            Ручной ввод
          </Button>
          <Button
            variant={mode === 'auto' ? 'default' : 'secondary'}
            className="flex-1"
            onClick={() => setMode('auto')}
          >
            Авторасчёт
          </Button>
        </div>

        {mode === 'manual' ? (
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Укажите период пропуска</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years">Лет</Label>
                <Input
                  id="years"
                  type="number"
                  min={0}
                  value={manualInput.years}
                  onChange={(e) => setManualInput(prev => ({ 
                    ...prev, 
                    years: Number(e.target.value) 
                  }))}
                  data-testid="input-years"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="months">Месяцев</Label>
                <Input
                  id="months"
                  type="number"
                  min={0}
                  max={11}
                  value={manualInput.months}
                  onChange={(e) => setManualInput(prev => ({ 
                    ...prev, 
                    months: Number(e.target.value) 
                  }))}
                  data-testid="input-months"
                />
              </div>
            </div>
            
            <Button className="w-full" onClick={handleCalculate} data-testid="button-calculate">
              Рассчитать долг
            </Button>
          </Card>
        ) : (
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Автоматический расчёт</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Пол</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthYear">Год рождения</Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="1990"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  data-testid="input-birth-year"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prayerStartYear">Год начала намаза</Label>
                <Input
                  id="prayerStartYear"
                  type="number"
                  placeholder="2020"
                  value={prayerStartYear}
                  onChange={(e) => setPrayerStartYear(e.target.value)}
                  data-testid="input-prayer-start-year"
                />
              </div>
              
              <Button className="w-full" onClick={handleCalculate} data-testid="button-calculate-auto">
                Рассчитать
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Для женщин будут учтены периоды освобождения от намаза
            </p>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Детализация по намазам</h3>
          
          <div className="space-y-3">
            {prayers.map((prayer) => {
              const remaining = debt[prayer] - progress[prayer];
              const prayerProgress = (progress[prayer] / debt[prayer]) * 100;
              
              return (
                <Card key={prayer} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {prayer === 'witr' ? 'Витр' : prayerLabels[prayer] || prayer}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      onClick={() => handleMarkDone(prayer)}
                      data-testid={`button-mark-${prayer}`}
                    >
                      <Plus className="w-3 h-3" />
                      +1
                    </Button>
                  </div>
                  
                  <Progress value={prayerProgress} className="h-2 mb-2" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Выполнено: {progress[prayer].toLocaleString()}</span>
                    <span>Осталось: {remaining.toLocaleString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <Button className="w-full gap-2" data-testid="button-create-qaza-goal">
          <Target className="w-4 h-4" />
          Создать цель восполнения
        </Button>
      </main>
    </div>
  );
}
