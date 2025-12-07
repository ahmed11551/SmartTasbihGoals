import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Loader2, Bell, Clock, Calendar, Check, AlertCircle, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationSettingsApi, type NotificationSettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEEK_DAYS = [
  { id: 'mon', label: 'Пн' },
  { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' },
  { id: 'thu', label: 'Чт' },
  { id: 'fri', label: 'Пт' },
  { id: 'sat', label: 'Сб' },
  { id: 'sun', label: 'Вс' },
] as const;

export default function NotificationSettingsSheet({ open, onOpenChange }: NotificationSettingsSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [notificationDays, setNotificationDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [firstName, setFirstName] = useState('');

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: notificationSettingsApi.get,
    enabled: open,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setNotificationTime(settings.notificationTime || '09:00');
      setNotificationDays(settings.notificationDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
      setFirstName(settings.firstName || '');
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: notificationSettingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Настройки сохранены",
        description: "Изменения применены успешно",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки",
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: notificationSettingsApi.test,
    onSuccess: (data) => {
      toast({
        title: "Успешно!",
        description: data.message || "Тестовое уведомление отправлено! Проверьте Telegram.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить тестовое уведомление",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      notificationsEnabled,
      notificationTime,
      notificationDays,
      firstName: firstName.trim() || undefined,
    });
  };

  const toggleDay = (day: string) => {
    setNotificationDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const hasTelegram = settingsData?.settings.telegramId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Умные уведомления</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pb-20">
            {!hasTelegram && (
              <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Telegram не подключен
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Для получения уведомлений авторизуйтесь через Telegram WebApp
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Уведомления включены</Label>
                  <p className="text-xs text-muted-foreground">
                    Получать умные напоминания о целях в Telegram
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  disabled={!hasTelegram}
                />
              </div>

              {notificationsEnabled && hasTelegram && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ваше имя (для персонализации)</Label>
                    <Input
                      id="firstName"
                      placeholder="Ахмад"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Будет использоваться в сообщениях: "Ас-саляму алейкум, {firstName || 'имя'}!"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Время отправки</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={notificationTime}
                        onChange={(e) => setNotificationTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Уведомления будут приходить в это время каждый день
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Дни недели</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={cn(
                            "aspect-square rounded-lg border-2 transition-colors",
                            notificationDays.includes(day.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border hover:bg-muted"
                          )}
                        >
                          {notificationDays.includes(day.id) && (
                            <Check className="w-4 h-4 mx-auto" />
                          )}
                          <span className={cn(
                            "text-xs font-medium",
                            notificationDays.includes(day.id) ? "text-primary-foreground" : "text-foreground"
                          )}>
                            {day.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => testMutation.mutate()}
                    variant="outline"
                    className="w-full"
                    disabled={testMutation.isPending || !notificationsEnabled}
                  >
                    {testMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить тестовое уведомление
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasTelegram}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

