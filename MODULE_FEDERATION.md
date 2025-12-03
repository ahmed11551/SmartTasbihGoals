# Module Federation Setup

## Конфигурация

Фронтенд настроен как микрофронтенд через Module Federation (Vite Plugin).

### Экспортируемые модули

Фронтенд экспортирует следующие модули:

```typescript
// В хостовом приложении
import { TasbihCounter, GoalCard, DailyAzkarBar } from 'smartTasbih/components';
import App from 'smartTasbih/App';
```

### Использование в хостовом приложении

#### 1. Настройка Vite в хостовом приложении

```typescript
// vite.config.ts хостового приложения
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      remotes: {
        smartTasbih: 'http://localhost:5000/assets/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
      },
    }),
  ],
});
```

#### 2. Использование компонентов

```typescript
// В хостовом приложении
import React, { Suspense } from 'react';

const TasbihCounter = React.lazy(() => import('smartTasbih/components').then(m => ({ default: m.TasbihCounter })));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasbihCounter {...props} />
    </Suspense>
  );
}
```

#### 3. Использование всего приложения

```typescript
import SmartTasbihApp from 'smartTasbih/App';

function App() {
  return (
    <div>
      <h1>Main App</h1>
      <SmartTasbihApp />
    </div>
  );
}
```

## Экспортируемые компоненты

### Компоненты
- `TasbihCounter` - основной счетчик тасбиха
- `GoalCard` - карточка цели
- `DailyAzkarBar` - панель ежедневных азкаров
- `StreakBadge` - бейдж серии
- `StatsCard` - карточка статистики
- `BadgeCard` - карточка достижения

### Полное приложение
- `App` - главный компонент приложения со всей функциональностью

## API Интеграция

Микрофронтенд работает с бэкендом через:
- Переменная окружения: `VITE_API_URL` - базовый URL API
- Авторизация через токены или сессии
- Все API вызовы через `/api/*` эндпоинты

## Сборка

```bash
# Сборка для продакшена
npm run build

# Результат будет в dist/public/remoteEntry.js
```

## Развертывание

Микрофронтенд должен быть доступен по URL, указанному в `remotes` хостового приложения.

Пример:
```typescript
remotes: {
  smartTasbih: 'https://smarttasbih.example.com/assets/remoteEntry.js',
}
```

