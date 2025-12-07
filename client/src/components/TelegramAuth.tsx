import { useEffect, useState } from 'react';
import { getTelegramUser, isTelegramWebApp, getTelegramInitData } from '@/lib/telegram';
import { useQuery } from '@tanstack/react-query';
import { setAuthToken, setUserId, getUserId } from '@/lib/auth';

export default function TelegramAuth() {
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
    if (!isTelegramWebApp()) {
      return;
    }

    const data = getTelegramInitData();
    setInitData(data);
  }, []);

  // Авторизация через Telegram
  const { data: user } = useQuery({
    queryKey: ['telegram-auth', initData],
    queryFn: async () => {
      if (!isTelegramWebApp() || !initData) return null;

      const tgUser = getTelegramUser();
      if (!tgUser) return null;

      try {
        const response = await fetch('/api/telegram/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: tgUser.id,
            username: tgUser.username,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            photoUrl: tgUser.photo_url,
            initData, // Для валидации на бэкенде
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Установить токен и userId для API запросов
          if (data.user?.id) {
            setUserId(data.user.id, true);
            // Использовать тестовый токен для авторизации
            setAuthToken('test_token_123', true);
          }
          
          return data.user;
        }
      } catch (error) {
        // Ошибка обрабатывается через React Query
      }
      return null;
    },
    enabled: !!initData && isTelegramWebApp(),
    retry: false,
  });

  // Автоматическая гостеневая авторизация для пользователей без Telegram
  const { data: guestUser } = useQuery({
    queryKey: ['guest-auth'],
    queryFn: async () => {
      if (isTelegramWebApp()) return null; // Пропускаем для Telegram пользователей
      
      // Проверяем, есть ли уже авторизованный пользователь
      const existingUserId = getUserId();
      if (existingUserId && existingUserId !== 'default-user') {
        return null; // Уже авторизован
      }

      try {
        const response = await fetch('/api/auth/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.user?.id) {
            setUserId(data.user.id, true);
            setAuthToken('test_token_123', true);
            return data.user;
          }
        }
      } catch (error) {
        // Ошибка при создании гостя - используем дефолтного пользователя
        console.warn('Failed to create guest session, using default user:', error);
      }
      
      // Fallback: используем дефолтного пользователя
      const defaultUserId = 'default-user';
      setUserId(defaultUserId, true);
      setAuthToken('test_token_123', true);
      return { id: defaultUserId, username: 'Гость' };
    },
    enabled: !isTelegramWebApp(),
    retry: false,
    staleTime: Infinity, // Не обновлять гостевую сессию
  });

  // Компонент работает в фоне, не рендерит UI
  return null;
}

