#!/bin/bash

# Docker コンテナ内でテストを実行するスクリプト

# カラー定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Money Dairy Lovers - Backend Tests${NC}"
echo "=================================="

# Dockerコンテナが起動しているか確認
if ! docker compose ps | grep -q "backend.*Up"; then
    echo -e "${RED}❌ Docker コンテナが起動していません。${NC}"
    echo -e "${YELLOW}📦 Docker コンテナを起動します...${NC}"
    docker compose up -d backend
    sleep 5
fi

# テストデータベースが存在しない場合は作成
echo -e "${YELLOW}🗄️  テストデータベースを準備しています...${NC}"
docker compose exec -T db psql -U postgres -c "CREATE DATABASE money_dairy_lovers_test;" 2>/dev/null || true

# テストを実行
echo -e "${YELLOW}🚀 テストを実行します...${NC}"
echo ""

# 引数がある場合は特定のテストを実行、ない場合は全テストを実行
if [ $# -eq 0 ]; then
    docker compose exec -T -e RUNNING_IN_DOCKER=1 backend pytest -v --tb=short
else
    docker compose exec -T -e RUNNING_IN_DOCKER=1 backend pytest -v --tb=short "$@"
fi

# 終了コードを保存
EXIT_CODE=$?

echo ""
echo "=================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ テストが成功しました！${NC}"
else
    echo -e "${RED}❌ テストが失敗しました。${NC}"
fi

exit $EXIT_CODE