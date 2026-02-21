#!/bin/bash

echo "🚀 UCSD Course Roadmap - Quick Start"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Starting PostgreSQL with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

echo "🔄 Pushing database schema..."
npm run db:push

echo "🌱 Seeding database with Math courses..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now run: npm run dev"
echo "📊 Or open Prisma Studio: npm run db:studio"
echo ""
