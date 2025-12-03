import { useEffect, useState } from 'react';
import { getTelegramUser, isTelegramWebApp, getTelegramInitData } from '@/lib/telegram';
import { authApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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
          return data.user;
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
      }
      return null;
    },
    enabled: !!initData && isTelegramWebApp(),
    retry: false,
  });

  // Компонент работает в фоне, не рендерит UI
  return null;
}

