# Устранение ошибок 500

## Диагностика

### 1. Проверьте DATABASE_URL в Vercel

1. Откройте Vercel Dashboard → Ваш проект
2. Settings → Environment Variables
3. Убедитесь, что `DATABASE_URL` установлен для всех окружений (Production, Preview, Development)
4. Формат: `postgresql://user:password@host:5432/database?sslmode=require`

### 2. Проверьте логи Vercel

1. Vercel Dashboard → Deployments
2. Выберите последний деплой
3. Откройте Functions → Logs
4. Ищите ошибки типа:
   - "DATABASE_URL не установлен"
   - "Database connection failed"
   - "Prisma Client not generated"

### 3. Проверьте базу данных

База данных должна быть:
- Создана и доступна
- Миграции применены (`npx prisma migrate deploy`)
- Connection string правильный

### 4. Примените миграции

Если база данных новая или миграции не применены:

```bash
# Локально
npx prisma migrate deploy

# Или через Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

## Решение

1. **Добавьте DATABASE_URL в Vercel** (если отсутствует)
2. **Выполните Redeploy** после добавления переменных
3. **Проверьте логи** на наличие конкретных ошибок
4. **Примените миграции** если база данных новая

## Типичные ошибки

### "DATABASE_URL не установлен"
- **Решение:** Добавьте переменную в Vercel Dashboard

### "Database connection failed"
- **Решение:** Проверьте правильность connection string
- Убедитесь, что база данных доступна из интернета

### "Prisma Client not generated"
- **Решение:** Prisma Client генерируется автоматически через `postinstall`
- Если не работает, проверьте логи сборки

