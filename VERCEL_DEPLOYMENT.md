# 🚀 Деплой на Vercel

## Шаг 1: Подготовка проекта

### 1.1. Установите Vercel CLI (опционально)

```bash
npm i -g vercel
```

### 1.2. Создайте `vercel.json` для конфигурации

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Шаг 2: Деплой через веб-интерфейс

### 2.1. Импорт проекта

1. Перейдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Выберите репозиторий `SmartTasbihGoals`
5. Нажмите "Import"

### 2.2. Настройка проекта

**Framework Preset:** Other

**Root Directory:** `./` (корень проекта)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist/public
```

**Install Command:**
```bash
npm install
```

### 2.3. Переменные окружения

Добавьте в Vercel Environment Variables:

```
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-secret-key
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs
OPENAI_API_KEY=your-openai-key
NODE_ENV=production
PORT=3000
```

### 2.4. Деплой

Нажмите "Deploy" и дождитесь завершения.

## Шаг 3: Настройка базы данных

### 3.1. Используйте Vercel Postgres (рекомендуется)

1. В панели Vercel → Storage → Create Database
2. Выберите Postgres
3. Скопируйте `DATABASE_URL`
4. Добавьте в Environment Variables

### 3.2. Применить миграции

После деплоя выполните:

```bash
# Через Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Или через Vercel Functions
# Создайте API endpoint для миграций
```

## Шаг 4: Получение URL

После деплоя вы получите URL вида:
```
https://smart-tasbih-goals.vercel.app
```

Этот URL понадобится для Telegram Mini App.

## Альтернатива: Деплой через CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# Войти
vercel login

# Деплой
vercel

# Продакшн деплой
vercel --prod
```

