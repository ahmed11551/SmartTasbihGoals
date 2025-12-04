# Финальный чеклист деплоя на Vercel

## Перед деплоем

### 1. Переменные окружения в Vercel Dashboard

Перейдите в **Vercel Dashboard → Settings → Environment Variables** и добавьте:

```env
# ОБЯЗАТЕЛЬНО
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-secret-key-min-32-chars-long

# УЖЕ НАСТРОЕНО (можно оставить как есть)
TEST_TOKEN=test_token_123
BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs
TELEGRAM_BOT_TOKEN=8401186204:AAEnf7AsD1n8Nbfcp6fA6epuYJLchneteNs

# ОПЦИОНАЛЬНО (для AI функций)
OPENAI_API_KEY=your-openai-api-key-here

# АВТОМАТИЧЕСКИ
NODE_ENV=production
```

### 2. Создать базу данных PostgreSQL

**Варианты:**
- **Neon** (рекомендуется): https://neon.tech - бесплатный план
- **Supabase**: https://supabase.com - бесплатный план
- **Railway**: https://railway.app - $5 кредита/месяц
- **Своя БД**: любой PostgreSQL сервер

**После создания БД:**
1. Скопируйте connection string
2. Добавьте в `DATABASE_URL` в Vercel

### 3. Деплой на Vercel

1. Перейдите на https://vercel.com
2. **Add New Project** → Выберите репозиторий
3. Настройки:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run build:vercel`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`
4. Добавьте переменные окружения (см. пункт 1)
5. Нажмите **Deploy**

### 4. Применить миграции БД

После успешного деплоя:

```bash
# Через Vercel CLI
vercel env pull
npx prisma migrate deploy

# Или напрямую (если есть доступ к БД)
npx prisma migrate deploy
```

### 5. Проверка после деплоя

- [ ] Проверить что фронтенд загружается: `https://your-app.vercel.app`
- [ ] Проверить что API работает: `https://your-app.vercel.app/api/stats`
- [ ] Проверить регистрацию/авторизацию
- [ ] Проверить Telegram Mini App (если используется)

## Структура проекта для Vercel

```
api/
  index.ts          ← Serverless функция для всех API запросов
dist/
  public/           ← Статические файлы (после сборки)
vercel.json         ← Конфигурация Vercel
```

## Важные замечания

1. **Лимит деплоев:** Бесплатный план Vercel - 100 деплоев/день
2. **База данных:** Обязательно нужна внешняя PostgreSQL (Vercel не предоставляет БД)
3. **Миграции:** Применяются вручную после первого деплоя
4. **Telegram Bot:** Убедитесь что токен правильный и бот активен

## Решение проблем

### Ошибка: "Database connection failed"
- Проверьте `DATABASE_URL` в переменных окружения
- Убедитесь что БД доступна из интернета
- Проверьте firewall настройки БД

### Ошибка: "Prisma Client not generated"
- Миграции применяются автоматически через `postinstall`
- Если не работает, примените вручную: `npx prisma migrate deploy`

### Ошибка: "Routes not found"
- Проверьте что `api/index.ts` существует
- Проверьте `vercel.json` конфигурацию

## Готовность к деплою

- [x] Все TypeScript ошибки исправлены
- [x] Vercel конфигурация настроена
- [x] API функции готовы
- [x] Нет мок-данных
- [x] Все зависимости корректны
- [ ] Добавить переменные окружения
- [ ] Создать базу данных
- [ ] Применить миграции после деплоя

---

После выполнения всех пунктов приложение готово к использованию.

