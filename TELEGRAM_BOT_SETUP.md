# 🤖 Создание Telegram Mini App бота

## Шаг 1: Создание бота через BotFather

### 1.1. Найти BotFather

1. Откройте Telegram
2. Найдите `@BotFather` в поиске
3. Нажмите "Start"

### 1.2. Создать нового бота

Отправьте команду:
```
/newbot
```

**Шаги:**
1. Введите имя бота (например: "Умный Тасбих")
2. Введите username бота (должен заканчиваться на `bot`, например: `SmartTasbihBot`)
3. BotFather выдаст вам **токен бота** (сохраните его!)

Пример токена:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 1.3. Настроить Mini App

Отправьте команду:
```
/setmenubutton
```

Выберите вашего бота, затем:
1. Введите текст кнопки (например: "Открыть приложение")
2. Введите URL вашего Vercel приложения:
   ```
   https://your-app.vercel.app
   ```

### 1.4. Настроить команды бота

Отправьте:
```
/setcommands
```

Выберите вашего бота и введите команды:
```
start - Начать работу с ботом
help - Помощь
app - Открыть приложение
```

## Шаг 2: Интеграция с фронтендом

### 2.1. Установить Telegram WebApp SDK

```bash
npm install @twa-dev/sdk
```

### 2.2. Создать компонент для Telegram

Создайте файл `client/src/lib/telegram.ts`:

```typescript
// Проверка что мы в Telegram
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && 
         (window as any).Telegram?.WebApp !== undefined;
}

// Получить WebApp объект
export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

// Инициализация Telegram WebApp
export function initTelegramWebApp() {
  if (typeof window === 'undefined') return;
  
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;

  // Расширить на весь экран
  tg.expand();
  
  // Включить закрытие через кнопку
  tg.enableClosingConfirmation();
  
  // Настроить тему
  tg.setHeaderColor('#ffffff');
  tg.setBackgroundColor('#ffffff');
  
  return tg;
}

// Получить данные пользователя
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
}

// Отправить данные на бэкенд
export function sendDataToBackend(data: any) {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  tg.sendData(JSON.stringify(data));
}

// Показать главную кнопку
export function showMainButton(text: string, onClick: () => void) {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
}

// Скрыть главную кнопку
export function hideMainButton() {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  tg.MainButton.hide();
}

// Показать Back кнопку
export function showBackButton(onClick: () => void) {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
}

// Закрыть приложение
export function closeTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg) return;
  
  tg.close();
}
```

### 2.3. Обновить `client/index.html`

Добавьте Telegram WebApp скрипт:

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Умный Тасбих</title>
    <!-- Telegram WebApp SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.4. Обновить `client/src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTelegramWebApp } from "./lib/telegram";

// Инициализация Telegram WebApp
if (typeof window !== 'undefined') {
  initTelegramWebApp();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2.5. Создать компонент для Telegram Auth

Создайте `client/src/components/TelegramAuth.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { getTelegramUser, isTelegramWebApp } from '@/lib/telegram';
import { authApi } from '@/lib/api';

export default function TelegramAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTelegramWebApp()) {
      setLoading(false);
      return;
    }

    const tgUser = getTelegramUser();
    if (!tgUser) {
      setLoading(false);
      return;
    }

    // Авторизация через Telegram
    const authenticate = async () => {
      try {
        // Отправить данные пользователя на бэкенд
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tgUser.id,
            username: tgUser.username,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            photoUrl: tgUser.photo_url,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  if (!isTelegramWebApp()) {
    return null; // Не показывать в обычном браузере
  }

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return null; // Компонент работает в фоне
}
```

## Шаг 3: Обновление бэкенда для Telegram

### 3.1. Добавить Telegram auth endpoint

Создайте `server/routes/telegram.ts`:

```typescript
import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

const telegramAuthSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photoUrl: z.string().optional(),
});

router.post("/auth/telegram", async (req, res, next) => {
  try {
    const parsed = telegramAuthSchema.parse(req.body);
    
    // Создать или найти пользователя по Telegram ID
    const userId = `tg_${parsed.id}`;
    let user = await storage.getUser(userId);
    
    if (!user) {
      // Создать нового пользователя
      user = await storage.createUser({
        id: userId,
        username: parsed.username || `user_${parsed.id}`,
        password: '', // Telegram auth не требует пароля
      });
    }
    
    // Установить сессию
    req.session!.userId = user.id;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 3.2. Добавить роут в `server/routes.ts`

```typescript
import telegramRoutes from "./routes/telegram";

// В registerRoutes:
app.use("/api/telegram", telegramRoutes);
```

### 3.3. Валидация данных от Telegram

Для продакшена нужно валидировать данные через Telegram:

```typescript
import crypto from 'crypto';

function validateTelegramData(data: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(data);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

## Шаг 4: Обновить App.tsx для Telegram

```typescript
import TelegramAuth from "@/components/TelegramAuth";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <TelegramAuth /> {/* Добавить компонент */}
          <div className="min-h-screen bg-background">
            <Router />
            <BottomNav />
          </div>
          <Toaster />
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

## Шаг 5: Настройка Vercel для Telegram

### 5.1. Добавить домен в Vercel

1. Vercel Dashboard → Settings → Domains
2. Добавьте домен (опционально)

### 5.2. Настроить CORS для Telegram

В `server/index.ts` добавьте:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://web.telegram.org',
    'https://telegram.org',
  ],
  credentials: true,
}));
```

## Шаг 6: Тестирование

### 6.1. Локальное тестирование

1. Запустите приложение локально
2. Используйте ngrok для туннеля:
   ```bash
   ngrok http 5000
   ```
3. Используйте ngrok URL в BotFather

### 6.2. Продакшн тестирование

1. Деплой на Vercel
2. Используйте Vercel URL в BotFather
3. Откройте бота в Telegram
4. Нажмите кнопку меню

## Полезные команды BotFather

```
/mybots - Управление ботами
/setmenubutton - Настроить кнопку меню
/setcommands - Настроить команды
/setdescription - Описание бота
/setabouttext - О боте
/setuserpic - Аватар бота
```

## Дополнительные возможности

### Haptic Feedback

```typescript
import { getTelegramWebApp } from '@/lib/telegram';

// Вибрация
getTelegramWebApp()?.HapticFeedback?.impactOccurred('medium');
```

### Уведомления

```typescript
// Показать уведомление
getTelegramWebApp()?.showAlert('Сообщение');
```

### Закрытие приложения

```typescript
import { closeTelegramWebApp } from '@/lib/telegram';

// Закрыть Mini App
closeTelegramWebApp();
```

