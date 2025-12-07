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
import { Card } from '@/components/ui/card';
import { Loader2, User, LogOut, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { getUserId, setUserId, clearAuth, setAuthToken } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = getUserId();

  // Проверка авторизации пользователя
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await authApi.me();
        return response.user || null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!userId && open,
    retry: false,
  });

  // Мутация для входа
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await authApi.login(username, password);
      if (response.user?.id) {
        setUserId(response.user.id, true);
        if (response.token) {
          setAuthToken(response.token, true);
        }
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsLogin(false);
      setPassword('');
      toast({ title: 'Успешный вход' });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка входа',
        description: error?.message || 'Неверное имя пользователя или пароль',
        variant: 'destructive',
      });
    },
  });

  // Мутация для регистрации
  const registerMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await authApi.register(username, password);
      if (response.user?.id) {
        setUserId(response.user.id, true);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsLogin(false);
      setPassword('');
      toast({ title: 'Регистрация успешна' });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка регистрации',
        description: error?.message || 'Не удалось зарегистрироваться',
        variant: 'destructive',
      });
    },
  });

  // Мутация для выхода
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
      clearAuth();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.clear();
      setIsLogin(true);
      setUsername('');
      setPassword('');
      toast({ title: 'Выход выполнен' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
      } else {
        await registerMutation.mutateAsync({ username, password });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс формы при закрытии
  useEffect(() => {
    if (!open) {
      setPassword('');
      if (!userId) {
        setIsLogin(true);
      }
    }
  }, [open, userId]);

  const isAuthenticated = !!user && !!userId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>{isAuthenticated ? 'Мой профиль' : isLogin ? 'Вход' : 'Регистрация'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-20">
          {userLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : isAuthenticated ? (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label>Имя пользователя</Label>
                  <Input value={user.username || ''} disabled className="mt-2" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Выход...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !username.trim() || !password.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? 'Вход...' : 'Регистрация...'}
                    </>
                  ) : (
                    isLogin ? 'Войти' : 'Зарегистрироваться'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setPassword('');
                  }}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

