#!/bin/bash

# Скрипт запуска через Docker

echo "🐳 Запуск через Docker..."

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose не установлен. Установите Docker Desktop."
    exit 1
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из примера..."
    cp .env.example .env
    echo "✅ Файл .env создан. Отредактируйте его при необходимости."
fi

# Запуск через docker-compose
echo "🚀 Запуск контейнеров..."
docker-compose up -d

echo "✅ Приложение запущено!"
echo ""
echo "📱 Доступно на: http://localhost:5000"
echo ""
echo "📊 Просмотр логов: docker-compose logs -f"
echo "🛑 Остановка: docker-compose down"

