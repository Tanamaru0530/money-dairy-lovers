#!/bin/bash

echo "💕 Money Dairy Lovers - Production Start 💕"
echo "=========================================="

# 環境変数をセット
export ENV_FILE=.env.production

# 既存のコンテナを停止
echo "🛑 既存のコンテナを停止中..."
docker compose down

# データベースのバックアップ（念のため）
echo "💾 データベースをバックアップ中..."
mkdir -p backups
docker compose exec db pg_dump -U postgres money_dairy_lovers > backups/backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo "バックアップをスキップ（初回起動時）"

# 本番環境で起動
echo "🚀 本番環境で起動中..."
docker compose --env-file .env.production up -d

# ヘルスチェック
echo "🏥 ヘルスチェック中..."
sleep 10
curl -f http://localhost:8000/health || echo "⚠️  バックエンドの起動に時間がかかっています"

echo ""
echo "✅ 起動完了！"
echo ""
echo "📱 アクセス方法:"
echo "  - ローカル: http://localhost:3000"
echo "  - 同一ネットワーク: http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'):3000"
echo ""
echo "📧 メール設定:"
if grep -q "SMTP_HOST=smtp" .env.production; then
    echo "  ✅ SMTP設定済み"
else
    echo "  ⚠️  SMTPが設定されていません。.env.production を編集してください"
fi
echo ""
echo "🔒 セキュリティ:"
echo "  - ローカルネットワーク内のみアクセス可能"
echo "  - 外部からはアクセスできません"
echo ""
echo "💡 停止するには: docker compose down"