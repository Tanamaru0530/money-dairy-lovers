#!/bin/bash

echo "💕 Money Dairy Lovers - データ移行 💕"
echo "===================================="

# Ubuntu サーバーの情報
read -p "Ubuntu サーバーのIPアドレス: " UBUNTU_IP
read -p "Ubuntu サーバーのユーザー名 [ubuntu]: " UBUNTU_USER
UBUNTU_USER=${UBUNTU_USER:-ubuntu}

# 現在のデータをバックアップ
echo "💾 現在のデータをバックアップ中..."
BACKUP_FILE="backup_migration_$(date +%Y%m%d_%H%M%S).sql"
docker compose exec db pg_dump -U postgres money_dairy_lovers > "$BACKUP_FILE"

if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
    echo "❌ バックアップに失敗しました"
    exit 1
fi

echo "✅ バックアップ完了: $BACKUP_FILE"

# プロジェクトファイルを転送
echo "📦 プロジェクトファイルを転送中..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'postgres_data' \
    --exclude '__pycache__' --exclude '*.pyc' --exclude 'dist' \
    . "${UBUNTU_USER}@${UBUNTU_IP}:~/money-dairy-lovers/"

# バックアップファイルを転送
echo "📤 データベースバックアップを転送中..."
scp "$BACKUP_FILE" "${UBUNTU_USER}@${UBUNTU_IP}:~/money-dairy-lovers/"

# Ubuntu側でのセットアップスクリプトを作成
cat > remote-setup.sh << 'EOF'
#!/bin/bash
cd ~/money-dairy-lovers

# Dockerが起動していることを確認
if ! docker info > /dev/null 2>&1; then
    echo "❌ Dockerが起動していません"
    exit 1
fi

# .env.production が存在しない場合は作成
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    SECRET_KEY=$(openssl rand -base64 32)
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env.production
fi

# IPアドレスを取得して設定
LOCAL_IP=$(hostname -I | awk '{print $1}')
sed -i "s|BACKEND_URL=.*|BACKEND_URL=http://$LOCAL_IP:8000|" .env.production
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$LOCAL_IP:3000|" .env.production

# コンテナを起動
docker compose --env-file .env.production up -d

# データベースの準備を待つ
echo "⏳ データベースの準備を待っています..."
sleep 10

# バックアップをリストア
BACKUP_FILE=$(ls -t backup_migration_*.sql | head -1)
if [ -f "$BACKUP_FILE" ]; then
    echo "📥 データをリストア中..."
    docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS money_dairy_lovers;"
    docker compose exec -T db psql -U postgres -c "CREATE DATABASE money_dairy_lovers;"
    docker compose exec -T db psql -U postgres money_dairy_lovers < "$BACKUP_FILE"
    echo "✅ データのリストア完了"
fi

echo "🎉 移行完了！"
echo "アクセスURL: http://$LOCAL_IP:3000"
EOF

# リモートセットアップスクリプトを転送して実行
echo "🚀 Ubuntu側でセットアップを実行中..."
scp remote-setup.sh "${UBUNTU_USER}@${UBUNTU_IP}:~/money-dairy-lovers/"
ssh "${UBUNTU_USER}@${UBUNTU_IP}" "cd ~/money-dairy-lovers && chmod +x remote-setup.sh && ./remote-setup.sh"

# クリーンアップ
rm remote-setup.sh

echo ""
echo "✅ 移行完了！"
echo ""
echo "📱 アクセス情報:"
echo "  Ubuntu サーバー: http://${UBUNTU_IP}:3000"
echo ""
echo "⚠️  注意事項:"
echo "  1. .env.production でメール設定を行ってください"
echo "  2. ファイアウォールでポート3000, 8000を開放してください"
echo "  3. 定期的なバックアップを設定してください"