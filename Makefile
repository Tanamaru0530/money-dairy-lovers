# Money Dairy Lovers - Makefile
.PHONY: help up down restart logs ps build clean test migrate shell-backend shell-frontend shell-db backup restore

# デフォルトのターゲット
.DEFAULT_GOAL := help

# ヘルプ
help:
	@echo "💕 Money Dairy Lovers - Docker Commands"
	@echo "======================================"
	@echo "make up          - 開発環境を起動"
	@echo "make down        - 環境を停止"
	@echo "make restart     - 環境を再起動"
	@echo "make logs        - ログを表示"
	@echo "make ps          - コンテナの状態を確認"
	@echo "make build       - イメージを再ビルド"
	@echo "make clean       - すべてをクリーンアップ"
	@echo "make test        - テストを実行"
	@echo "make migrate     - DBマイグレーション実行"
	@echo "make shell-backend  - Backendコンテナに入る"
	@echo "make shell-frontend - Frontendコンテナに入る"
	@echo "make shell-db    - DBコンテナに入る"
	@echo "make backup      - DBバックアップ"
	@echo "make restore     - DBリストア"

# 開発環境起動
up:
	@echo "🚀 Starting development environment..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@mkdir -p backup
	docker compose up -d
	@echo "✅ Environment is running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# シンプルな開発環境起動（ヘルスチェックなし）
dev:
	@echo "🚀 Starting simple development environment..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@mkdir -p backup
	docker compose -f docker-compose.dev.yml up -d
	@echo "✅ Simple dev environment is running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# 環境停止
down:
	@echo "🛑 Stopping environment..."
	docker compose down

# 再起動
restart:
	@echo "🔄 Restarting environment..."
	docker compose restart

# ログ表示
logs:
	docker compose logs -f

# コンテナ状態確認
ps:
	docker compose ps

# ビルド
build:
	@echo "🔨 Building images..."
	docker compose build

# クリーンアップ
clean:
	@echo "🧹 Cleaning up..."
	docker compose down -v
	docker system prune -af

# テスト実行
test:
	@echo "🧪 Running tests..."
	docker compose exec backend pytest
	docker compose exec frontend npm test

# マイグレーション
migrate:
	@echo "🗄️ Running database migrations..."
	docker compose exec backend alembic upgrade head

# Backendシェル
shell-backend:
	docker compose exec backend bash

# Frontendシェル  
shell-frontend:
	docker compose exec frontend sh

# DBシェル
shell-db:
	docker compose exec db psql -U postgres -d money_dairy_lovers

# DBバックアップ
backup:
	@echo "💾 Creating database backup..."
	@BACKUP_FILE="backup/money_dairy_lovers_$$(date +%Y%m%d_%H%M%S).sql"
	docker compose exec -T db pg_dump -U postgres money_dairy_lovers > $$BACKUP_FILE
	@echo "✅ Backup saved to: $$BACKUP_FILE"

# DBリストア
restore:
	@echo "📥 Restoring database..."
	@echo "Available backups:"
	@ls -la backup/*.sql 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup filename (e.g., backup/money_dairy_lovers_20250617_120000.sql): " BACKUP_FILE; \
	if [ -f "$$BACKUP_FILE" ]; then \
		docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS money_dairy_lovers;" && \
		docker compose exec -T db psql -U postgres -c "CREATE DATABASE money_dairy_lovers;" && \
		docker compose exec -T db psql -U postgres money_dairy_lovers < $$BACKUP_FILE && \
		echo "✅ Database restored from: $$BACKUP_FILE"; \
	else \
		echo "❌ Backup file not found: $$BACKUP_FILE"; \
	fi

# 本番環境起動
prod-up:
	@echo "🚀 Starting production environment..."
	docker compose -f docker-compose.prod.yml up -d

# 本番環境停止
prod-down:
	@echo "🛑 Stopping production environment..."
	docker compose -f docker-compose.prod.yml down