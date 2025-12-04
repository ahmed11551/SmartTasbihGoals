#!/bin/bash

# Скрипт для автоматической настройки Vercel

set -e

echo "=== Настройка Vercel для Smart Tasbih ==="
echo ""

# Проверка наличия Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Установка Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI установлен"
else
    echo "✅ Vercel CLI уже установлен"
fi

echo ""
echo "🔐 Авторизация в Vercel..."
echo "Вам нужно будет войти через браузер"
vercel login

echo ""
echo "📁 Подключение проекта к Vercel..."
vercel link

echo ""
echo "📝 Добавление переменных окружения..."
echo ""
echo "⚠️  ВАЖНО: Вам нужно будет вручную добавить следующие переменные в Vercel Dashboard:"
echo ""
echo "Обязательные:"
echo "  - DATABASE_URL (connection string от Supabase/Neon/Railway)"
echo "  - SESSION_SECRET (минимум 32 символа)"
echo ""
echo "Рекомендуемые:"
echo "  - TELEGRAM_BOT_TOKEN (токен от @BotFather)"
echo "  - OPENAI_API_KEY (для AI-ассистента)"
echo ""
echo "Уже настроенные (можно оставить значения по умолчанию):"
echo "  - TEST_TOKEN=test_token_123"
echo "  - BOT_REPLIKA_API_URL=https://Bot.e-replika.ru/docs"
echo ""
echo "Добавьте переменные через:"
echo "  Vercel Dashboard → Ваш проект → Settings → Environment Variables"
echo ""
echo "Или через CLI (после добавления значений):"
echo "  vercel env add DATABASE_URL production"
echo "  vercel env add SESSION_SECRET production"
echo "  vercel env add TELEGRAM_BOT_TOKEN production"
echo "  vercel env add OPENAI_API_KEY production"
echo ""

read -p "Нажмите Enter после добавления переменных окружения в Vercel Dashboard..."

echo ""
echo "🚀 Выполнение первого деплоя..."
vercel --prod

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "  1. Примените миграции БД:"
echo "     vercel env pull .env.local"
echo "     npx prisma migrate deploy"
echo ""
echo "  2. Проверьте работу приложения:"
echo "     Откройте URL из вывода выше"
echo ""
echo "  3. Настройте Telegram Mini App (если нужно):"
echo "     /setmenubutton в @BotFather"
echo "     URL: ваш-url-от-vercel"
echo ""

