# Финальный чеклист перед деплоем

## Что нужно сделать перед деплоем

### 1. Создать базу данных PostgreSQL

**Варианты (выберите один):**

#### A. Supabase (рекомендуется)
1. Перейдите на https://supabase.com
2. Войдите через GitHub (или создайте аккаунт)
3. Создайте новый проект (New Project)
4. Settings → Database → Connection string → URI
5. Скопируйте connection string и замените `[YOUR-PASSWORD]` на ваш пароль
6. Добавьте `?sslmode=require` в конец connection string

**Подробная инструкция:** См. `SUPABASE_SETUP.md`

#### B. Neon (альтернатива)
1. Перейдите на https://neon.tech
2. Создайте бесплатный аккаунт
3. Создайте новый проект
4. Скопируйте connection string (будет выглядеть как `postgresql://user:pass@host/dbname`)

#### C. Railway
1. Перейдите на https://railway.app
2. New Project → Database → PostgreSQL
3. Скопируйте DATABASE_URL

### 2. Подготовить переменные окружения

Скопируйте этот список и заполните значения:

```env
# ОБЯЗАТЕЛЬНО
DATABASE_URL=postgresql://user:password@host:5432/database  # ← Вставить connection string из шага 1
SESSION_SECRET=your-secret-key-min-32-chars-long           # ← Сгенерировать случайную строку (минимум 32 символа)

# УЖЕ НАСТРОЕНО (можно оставить как есть)
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs
TELEGRAM_BOT_TOKEN=8401186204:AAEnf7AsD1n8Nbfcp6fA6epuYJLchneteNs

# ОПЦИОНАЛЬНО (для AI функций)
OPENAI_API_KEY=your-openai-api-key-here                    # ← Если нужен AI ассистент

# АВТОМАТИЧЕСКИ (не нужно добавлять)
NODE_ENV=production
```

**Как сгенерировать SESSION_SECRET:**
```bash
# В терминале
openssl rand -base64 32
# Или используйте любой генератор случайных строк (минимум 32 символа)
```

### 3. Деплой на Vercel

1. Перейдите на https://vercel.com
2. Войдите через GitHub
3. **Add New Project** → Выберите репозиторий `SmartTasbihGoals`
4. Настройки проекта:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run build:vercel`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`
5. **Environment Variables** → Добавьте все переменные из шага 2
6. Нажмите **Deploy**

### 4. Применить миграции БД

После успешного деплоя:

**Вариант A: Через Vercel CLI**
```bash
# Установить Vercel CLI (если еще не установлен)
npm i -g vercel

# Войти в аккаунт
vercel login

# Перейти в папку проекта
cd /path/to/SmartTasbihGoals_pub-main

# Получить переменные окружения
vercel env pull .env.local

# Применить миграции
npx prisma migrate deploy
```

**Вариант B: Напрямую к БД**
```bash
# Если у вас есть прямой доступ к БД
export DATABASE_URL="your-connection-string"
npx prisma migrate deploy
```

**Вариант C: Через Prisma Studio (визуально)**
```bash
# Открыть Prisma Studio
npx prisma studio

# Вручную выполнить SQL из prisma/migrations/20250127000000_add_category_streaks/migration.sql
```

### 5. Проверка после деплоя

- [ ] Открыть `https://your-app.vercel.app` - должен загрузиться фронтенд
- [ ] Проверить API: `https://your-app.vercel.app/api/stats` - должен вернуть JSON
- [ ] Попробовать зарегистрироваться
- [ ] Проверить создание цели
- [ ] Проверить тасбих счетчик

## Быстрая проверка готовности

- [x] Все TypeScript ошибки исправлены
- [x] Vercel конфигурация настроена
- [x] API функции готовы
- [x] Нет мок-данных
- [x] Документация очищена
- [ ] Создать базу данных
- [ ] Добавить переменные окружения в Vercel
- [ ] Применить миграции после деплоя

## Порядок действий

1. **Создать БД** (5 минут)
2. **Подготовить переменные окружения** (2 минуты)
3. **Деплой на Vercel** (5-10 минут)
4. **Применить миграции** (2 минуты)
5. **Проверить работу** (5 минут)

**Общее время: ~20-25 минут**

## Если что-то пошло не так

### Ошибка: "Database connection failed"
- Проверьте `DATABASE_URL` - должен начинаться с `postgresql://`
- Убедитесь что БД доступна из интернета (не localhost)
- Проверьте firewall настройки БД

### Ошибка: "Prisma Client not generated"
- Миграции применяются автоматически, но если не работает:
  ```bash
  vercel env pull
  npx prisma generate
  npx prisma migrate deploy
  ```

### Ошибка: "Routes not found"
- Проверьте что `api/index.ts` существует
- Проверьте `vercel.json` конфигурацию

---

После выполнения всех пунктов приложение готово к использованию.

