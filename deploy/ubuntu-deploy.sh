#!/bin/bash

echo "💕 Money Dairy Lovers - Ubuntu Deploy 💕"
echo "======================================="

# 作業ディレクトリ
DEPLOY_DIR="$HOME/money-dairy-lovers"

# リポジトリのクローン（または更新）
if [ -d "$DEPLOY_DIR" ]; then
    echo "📂 既存のディレクトリを更新中..."
    cd "$DEPLOY_DIR"
    git pull
else
    echo "📥 リポジトリをクローン中..."
    git clone https://github.com/yourusername/money-dairy-lovers.git "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 本番環境設定ファイルの作成
echo "⚙️  本番環境設定を作成中..."
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    
    # SECRET_KEY の生成
    SECRET_KEY=$(openssl rand -base64 32)
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env.production
    
    # ローカルIPアドレスの取得
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    echo "🌐 サーバーのIPアドレス: $LOCAL_IP"
    
    # URL設定の更新
    sed -i "s|BACKEND_URL=.*|BACKEND_URL=http://$LOCAL_IP:8000|" .env.production
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$LOCAL_IP:3000|" .env.production
    sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://$LOCAL_IP:3000,http://$LOCAL_IP:8000|" .env.production
    
    echo ""
    echo "📝 .env.production を編集してメール設定を追加してください:"
    echo "   nano .env.production"
    echo ""
    echo "   SMTP_HOST=smtp.gmail.com"
    echo "   SMTP_USER=your-email@gmail.com"
    echo "   SMTP_PASSWORD=your-app-password"
    echo ""
fi

# Docker Compose ファイルの確認
if [ ! -f docker-compose.yml ]; then
    echo "❌ docker-compose.yml が見つかりません"
    exit 1
fi

# Docker ネットワークの作成
echo "🌐 Docker ネットワークを作成中..."
docker network create money-dairy-lovers-network 2>/dev/null || true

# コンテナの起動
echo "🚀 コンテナを起動中..."
docker compose --env-file .env.production down
docker compose --env-file .env.production up -d

# ヘルスチェック
echo "🏥 ヘルスチェック中..."
sleep 15
if curl -f http://localhost:8000/health; then
    echo "✅ バックエンドが正常に起動しました"
else
    echo "⚠️  バックエンドの起動に問題があります"
    echo "ログを確認してください: docker compose logs backend"
fi

# アクセス情報の表示
echo ""
echo "🎉 デプロイ完了！"
echo ""
echo "📱 アクセスURL:"
echo "  - ローカル: http://localhost:3000"
echo "  - ネットワーク内: http://$LOCAL_IP:3000"
echo ""
echo "📊 サービス状態確認:"
echo "  docker compose ps"
echo ""
echo "📝 ログ確認:"
echo "  docker compose logs -f"
echo ""
echo "🛑 停止方法:"
echo "  docker compose down"