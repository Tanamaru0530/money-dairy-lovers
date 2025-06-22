#!/bin/bash

# 特定のテストファイルをDockerコンテナ内で実行するスクリプト

if [ $# -eq 0 ]; then
    echo "使用方法: ./scripts/test_one.sh <テストファイル名>"
    echo "例: ./scripts/test_one.sh test_auth"
    exit 1
fi

# カラー定義
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 テスト実行: tests/$1.py${NC}"
echo "=================================="

# Dockerコンテナ内でテストを実行
docker compose exec -T -e RUNNING_IN_DOCKER=1 backend pytest -v --tb=short "tests/$1.py"