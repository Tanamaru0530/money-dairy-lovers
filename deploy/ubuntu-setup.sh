#!/bin/bash

echo "💕 Money Dairy Lovers - Ubuntu Setup 💕"
echo "======================================"

# システムの更新
echo "📦 システムを更新中..."
sudo apt update && sudo apt upgrade -y

# Docker のインストール
echo "🐳 Docker をインストール中..."
# 古いバージョンを削除
sudo apt remove docker docker-engine docker.io containerd runc 2>/dev/null

# 必要なパッケージをインストール
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Docker の GPG キーを追加
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker リポジトリを追加
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine をインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 現在のユーザーを docker グループに追加
echo "👤 ユーザーを docker グループに追加中..."
sudo usermod -aG docker $USER

# Docker サービスを開始
echo "🚀 Docker サービスを開始中..."
sudo systemctl start docker
sudo systemctl enable docker

# Git のインストール
echo "📚 Git をインストール中..."
sudo apt install -y git

# ファイアウォールの設定
echo "🔥 ファイアウォールを設定中..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
sudo ufw allow 5432/tcp  # PostgreSQL (必要に応じて)

# 完了メッセージ
echo ""
echo "✅ セットアップ完了！"
echo ""
echo "⚠️  重要: Docker グループの変更を適用するため、一度ログアウトして再度ログインしてください"
echo ""
echo "次の手順:"
echo "1. exit でログアウト"
echo "2. 再度 SSH でログイン"
echo "3. ./ubuntu-deploy.sh を実行"