#!/bin/bash

echo "🐳 Запуск Smart Tasbih в Docker..."
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Проверка, запущен ли Docker daemon
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker daemon не запущен."
    echo "📋 Пожалуйста, запустите Docker Desktop и подождите, пока он полностью запустится."
    echo "   Затем запустите этот скрипт снова."
    exit 1
fi

echo "✅ Docker запущен!"
echo ""

# Остановка старых контейнеров и удаление volumes
echo "1. Остановка старых контейнеров..."
docker-compose down -v 2>/dev/null || docker compose down -v 2>/dev/null

echo ""
echo "2. Пересборка и запуск контейнеров..."
docker-compose build || docker compose build

echo ""
echo "3. Запуск контейнеров..."
docker-compose up -d || docker compose up -d

echo ""
echo "4. Ожидание запуска сервисов (15 секунд)..."
sleep 15

echo ""
echo "5. Проверка статуса контейнеров..."
docker-compose ps || docker compose ps

echo ""
echo "6. Просмотр логов приложения..."
echo "=================================="
docker-compose logs app --tail=20 || docker compose logs app --tail=20

echo ""
echo "=================================="
echo "✅ Готово!"
echo ""
echo "🌐 Приложение должно быть доступно на: http://localhost:5001"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов:    docker-compose logs -f app"
echo "   Остановка:         docker-compose down"
echo "   Перезапуск:        docker-compose restart"
echo ""
echo "⚠️  Если видите ошибки, проверьте:"
echo "   - База данных создалась: docker-compose logs postgres"
echo "   - Миграции применились: docker-compose logs app | grep -i migration"

