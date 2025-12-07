import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Check,
  Calendar,
  Clock,
  Bell,
  Repeat,
  Link2,
  FileText,
  ChevronRight,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Habit, RepeatType, WeekDay, HabitCategory, HabitDifficulty, KnowledgeSubcategory } from '@/lib/types';
import type { HabitTemplate } from '@/lib/habitsCatalog';
import { habitCategories, repeatLabels } from '@/lib/habitsCatalog';
import { knowledgeSubcategories } from '@/lib/constants';
import { getIconByName } from '@/lib/iconUtils';

interface HabitCreationSheetProps {
  template?: HabitTemplate | null;
  editingHabit?: Habit | null;
  onSubmit: (habit: Partial<Habit>) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const weekDays: { id: WeekDay; label: string; short: string }[] = [
  { id: 'mon', label: 'Понедельник', short: 'Пн' },
  { id: 'tue', label: 'Вторник', short: 'Вт' },
  { id: 'wed', label: 'Среда', short: 'Ср' },
  { id: 'thu', label: 'Четверг', short: 'Чт' },
  { id: 'fri', label: 'Пятница', short: 'Пт' },
  { id: 'sat', label: 'Суббота', short: 'Сб' },
  { id: 'sun', label: 'Воскресенье', short: 'Вс' },
];

const calendars = [
  { id: 'personal', label: 'Личный', color: 'bg-blue-500' },
  { id: 'work', label: 'Рабочий', color: 'bg-purple-500' },
  { id: 'family', label: 'Семья', color: 'bg-green-500' },
  { id: 'islamic', label: 'Исламский', color: 'bg-emerald-600' },
];

export default function HabitCreationSheet({ 
  template, 
  editingHabit,
  onSubmit, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: HabitCreationSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [activeTab, setActiveTab] = useState<'habit' | 'reminder'>('habit');
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<HabitCategory>('dhikr');
  const [subcategory, setSubcategory] = useState<KnowledgeSubcategory | undefined>(undefined);
  const [iconName, setIconName] = useState('CircleDot');
  
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState('20:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState('21:00');
  
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatDays, setRepeatDays] = useState<WeekDay[]>([]);
  
  const [calendarId, setCalendarId] = useState('islamic');
  
  const [reminders, setReminders] = useState<{ id: string; time: string; enabled: boolean }[]>([]);
  
  const [linkedToTasbih, setLinkedToTasbih] = useState(false);
  const [targetCount, setTargetCount] = useState<number | undefined>(undefined);

  const initializeFromSource = (habit: Habit | null, tmpl: HabitTemplate | null) => {
    setActiveTab('habit');
    
    if (habit) {
      setTitle(habit.title);
      setNotes(habit.description || '');
      setUrl(habit.url || '');
      setCategory(habit.category);
      setSubcategory(habit.subcategory);
      setIconName(habit.iconName);
      setHasTime(!!habit.time);
      setTime(habit.time || '20:00');
      setIsAllDay(habit.isAllDay);
      setStartDate(habit.startDate ? new Date(habit.startDate) : new Date());
      setEndDate(habit.endDate ? new Date(habit.endDate) : undefined);
      setEndTime(habit.endTime || '21:00');
      setRepeatType(habit.repeatType);
      const daysToSet = habit.repeatType === 'daily' && (!habit.repeatDays || habit.repeatDays.length === 0)
        ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as WeekDay[]
        : (habit.repeatDays || []);
      setRepeatDays(daysToSet);
      setCalendarId(habit.calendarId || 'islamic');
      setReminders(habit.reminders || []);
      setLinkedToTasbih(habit.linkedToTasbih);
      setTargetCount(habit.targetCount);
    } else if (tmpl) {
      setTitle(tmpl.title);
      setNotes(tmpl.description);
      setUrl('');
      setCategory(tmpl.category);
      setSubcategory(undefined); // Шаблоны не имеют подкатегорий
      setIconName(tmpl.iconName);
      setHasTime(!!tmpl.suggestedTime);
      setTime(tmpl.suggestedTime || '20:00');
      setIsAllDay(false);
      setStartDate(new Date());
      setEndDate(undefined);
      setEndTime('21:00');
      setRepeatType(tmpl.suggestedRepeat);
      setRepeatDays([]);
      setCalendarId('islamic');
      setReminders(tmpl.suggestedTime ? [{ id: '1', time: tmpl.suggestedTime, enabled: true }] : []);
      setLinkedToTasbih(tmpl.linkedToTasbih || false);
      setTargetCount(tmpl.targetCount);
    } else {
      setTitle('');
      setNotes('');
      setUrl('');
      setCategory('dhikr');
      setSubcategory(undefined);
      setIconName('CircleDot');
      setHasTime(false);
      setTime('20:00');
      setIsAllDay(false);
      setStartDate(new Date());
      setEndDate(undefined);
      setEndTime('21:00');
      setRepeatType('daily');
      setRepeatDays([]);
      setCalendarId('islamic');
      setReminders([]);
      setLinkedToTasbih(false);
      setTargetCount(undefined);
    }
  };

  useEffect(() => {
    initializeFromSource(editingHabit || null, template || null);
  }, [editingHabit, template, open]);

  // Очищаем subcategory если категория не knowledge
  useEffect(() => {
    if (category !== 'knowledge') {
      setSubcategory(undefined);
    }
  }, [category]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    if (endDate && endDate < startDate) {
      return;
    }
    
    let effectiveRepeatType = repeatType;
    let effectiveRepeatDays = repeatDays;
    
    if (repeatType === 'daily' || repeatType === 'weekly') {
      if (repeatDays.length === 0) {
        effectiveRepeatDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as WeekDay[];
        effectiveRepeatType = 'daily';
      } else if (repeatDays.length === 7) {
        effectiveRepeatType = 'daily';
      } else {
        effectiveRepeatType = 'weekly';
      }
    }

    const habit: Partial<Habit> = {
      templateId: template?.id,
      category,
      subcategory: category === 'knowledge' ? subcategory : undefined, // Только для knowledge
      title: title.trim(),
      description: notes.trim() || undefined,
      iconName,
      difficulty: editingHabit?.difficulty || template?.difficulty || 'easy',
      repeatType: effectiveRepeatType,
      repeatDays: effectiveRepeatDays,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      time: hasTime ? time : undefined,
      endTime: hasTime && !isAllDay ? endTime : undefined,
      isAllDay,
      reminders: reminders.filter(r => r.enabled),
      calendarId,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
      linkedToTasbih,
      targetCount,
      currentStreak: editingHabit?.currentStreak ?? 0,
      longestStreak: editingHabit?.longestStreak ?? 0,
      completedDates: editingHabit?.completedDates ?? [],
      createdAt: editingHabit?.createdAt ?? new Date().toISOString(),
      isActive: editingHabit?.isActive ?? true,
    };

    onSubmit(habit);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setUrl('');
    setCategory('dhikr');
    setSubcategory(undefined);
    setIconName('CircleDot');
    setHasTime(false);
    setTime('20:00');
    setIsAllDay(false);
    setStartDate(new Date());
    setEndDate(undefined);
    setRepeatType('daily');
    setRepeatDays([]);
    setCalendarId('islamic');
    setReminders([]);
    setLinkedToTasbih(false);
    setTargetCount(undefined);
  };

  const addReminder = () => {
    const newId = String(Date.now());
    setReminders([...reminders, { id: newId, time: '09:00', enabled: true }]);
  };

  const updateReminder = (id: string, time: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, time } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleWeekDay = (day: WeekDay) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  const selectedCalendar = calendars.find(c => c.id === calendarId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}

      <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setOpen(false)}
            className="shrink-0"
            data-testid="button-close-habit-sheet"
          >
            Отмена
          </Button>
          
          <h2 className="font-semibold text-center flex-1 truncate">
            {editingHabit ? 'Редактирование' : 'Новое'}
          </h2>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="shrink-0"
            data-testid="button-save-habit"
          >
            <Check className="w-4 h-4 mr-1" />
            Готово
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'habit' | 'reminder')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4" style={{ width: 'calc(100% - 32px)' }}>
            <TabsTrigger value="habit" data-testid="tab-habit">Привычка</TabsTrigger>
            <TabsTrigger value="reminder" data-testid="tab-reminder">Напоминание</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(95vh-140px)]">
            <TabsContent value="habit" className="mt-0 p-4 space-y-4">
              <Card className="divide-y divide-border">
                <div className="p-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название"
                    className="border-0 p-0 text-base focus-visible:ring-0 h-auto"
                    data-testid="input-habit-title"
                  />
                </div>
                <div className="p-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Заметки"
                    className="border-0 p-0 resize-none min-h-[60px] focus-visible:ring-0"
                    data-testid="input-habit-notes"
                  />
                </div>
                <div className="p-4">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL"
                    type="url"
                    className="border-0 p-0 text-sm focus-visible:ring-0 h-auto text-primary"
                    data-testid="input-habit-url"
                  />
                </div>
              </Card>

              <Card className="divide-y divide-border">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span>Дни недели</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {repeatDays.length === 0 
                        ? 'Выберите дни' 
                        : repeatDays.length === 7 
                          ? 'Каждый день' 
                          : `${repeatDays.length} ${repeatDays.length === 1 ? 'день' : repeatDays.length < 5 ? 'дня' : 'дней'}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between gap-1">
                    {weekDays.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => toggleWeekDay(day.id)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all border ${
                          repeatDays.includes(day.id) 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                        data-testid={`day-${day.id}`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Время</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasTime && (
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-24 h-8 text-primary"
                        data-testid="input-habit-time"
                      />
                    )}
                    <Switch
                      checked={hasTime}
                      onCheckedChange={setHasTime}
                      data-testid="switch-habit-time"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5 text-muted-foreground" />
                    <span>Повтор</span>
                  </div>
                  <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
                    <SelectTrigger className="w-auto border-0 h-auto p-0 gap-1" data-testid="select-repeat-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(repeatLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Card className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${selectedCalendar?.color}`} />
                    <span>Календарь</span>
                  </div>
                  <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger className="w-auto border-0 h-auto p-0 gap-1" data-testid="select-calendar">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calendars.map((cal) => (
                        <SelectItem key={cal.id} value={cal.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${cal.color}`} />
                            {cal.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <span>Уведомления</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addReminder}
                      className="h-7 text-xs text-primary"
                      data-testid="button-add-reminder"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Добавить
                    </Button>
                  </div>
                  
                  {reminders.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Нет напоминаний</p>
                  ) : (
                    <div className="space-y-2">
                      {reminders.map((reminder, index) => (
                        <div key={reminder.id} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={reminder.time}
                            onChange={(e) => updateReminder(reminder.id, e.target.value)}
                            className="flex-1 h-8"
                            data-testid={`input-reminder-time-${index}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReminder(reminder.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            data-testid={`button-remove-reminder-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="divide-y divide-border">
                <div className="p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Другие параметры
                  </Label>
                </div>
                
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover-elevate"
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getIconByName(iconName, "w-5 h-5")}
                    </div>
                    <span>Категория</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{habitCategories.find(c => c.id === category)?.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {category === 'knowledge' && (
                  <div className="p-4 space-y-2">
                    <Label className="text-sm">Подкатегория</Label>
                    <div className="flex flex-wrap gap-2">
                      {knowledgeSubcategories.map((subcat) => (
                        <Button
                          key={subcat.id}
                          type="button"
                          variant={subcategory === subcat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSubcategory(subcategory === subcat.id ? undefined : subcat.id)}
                          className="flex items-center gap-2"
                          data-testid={`button-subcategory-${subcat.id}`}
                        >
                          {getIconByName(subcat.icon, "w-4 h-4")}
                          {subcat.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {linkedToTasbih && (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span>Целевое количество</span>
                    </div>
                    <Input
                      type="number"
                      value={targetCount || ''}
                      onChange={(e) => setTargetCount(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="100"
                      className="w-20 h-8 text-right"
                      data-testid="input-target-count"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Link2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span>Связать с тасбихом</span>
                      <p className="text-xs text-muted-foreground">Прогресс учитывается автоматически</p>
                    </div>
                  </div>
                  <Switch
                    checked={linkedToTasbih}
                    onCheckedChange={setLinkedToTasbih}
                    data-testid="switch-tasbih-link"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reminder" className="mt-0 p-4 space-y-4">
              <Card className="divide-y divide-border">
                <div className="p-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название"
                    className="border-0 p-0 text-base focus-visible:ring-0 h-auto"
                    data-testid="input-reminder-title"
                  />
                </div>
                <div className="p-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Заметки"
                    className="border-0 p-0 resize-none min-h-[60px] focus-visible:ring-0"
                    data-testid="input-reminder-notes"
                  />
                </div>
                <div className="p-4">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL"
                    type="url"
                    className="border-0 p-0 text-sm focus-visible:ring-0 h-auto text-primary"
                    data-testid="input-reminder-url"
                  />
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide block">
                  Дата и время
                </Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-muted-foreground" />
                      <span>Начало</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          data-testid="button-start-date"
                        >
                          {format(startDate, 'd MMM yyyy', { locale: ru })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-muted-foreground" />
                      <span>Конец</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          data-testid="button-end-date"
                        >
                          {endDate 
                            ? format(endDate, 'd MMM yyyy', { locale: ru })
                            : 'Выбрать'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => setEndDate(date)}
                          disabled={(date) => date < startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span>Время</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasTime && (
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-24 h-8"
                          data-testid="input-reminder-time-value"
                        />
                      )}
                      <Switch
                        checked={hasTime}
                        onCheckedChange={setHasTime}
                        data-testid="switch-reminder-time-enable"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span>Напоминания</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addReminder}
                    className="h-7 text-xs text-primary"
                    data-testid="button-add-reminder-tab"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Добавить
                  </Button>
                </div>
                
                {reminders.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет напоминаний</p>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((reminder, index) => (
                      <div key={reminder.id} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={reminder.time}
                          onChange={(e) => updateReminder(reminder.id, e.target.value)}
                          className="flex-1 h-8"
                          data-testid={`input-reminder-tab-time-${index}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReminder(reminder.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          data-testid={`button-remove-reminder-tab-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5 text-muted-foreground" />
                    <span>Повтор</span>
                  </div>
                  <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
                    <SelectTrigger className="w-auto border-0 h-auto p-0 gap-1" data-testid="select-reminder-repeat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(repeatLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Card className="divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${selectedCalendar?.color}`} />
                    <span>Календарь</span>
                  </div>
                  <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger className="w-auto border-0 h-auto p-0 gap-1" data-testid="select-reminder-calendar">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calendars.map((cal) => (
                        <SelectItem key={cal.id} value={cal.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${cal.color}`} />
                            {cal.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
