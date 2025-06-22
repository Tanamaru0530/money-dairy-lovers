# Money Dairy Lovers デプロイメントガイド

このガイドでは、Money Dairy Loversを自宅のUbuntu環境にデプロイする手順を説明します。

## 目次
1. [前提条件](#前提条件)
2. [Ubuntu環境の準備](#ubuntu環境の準備)
3. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
4. [メール送信の設定](#メール送信の設定)
5. [データの移行（オプション）](#データの移行オプション)
6. [自動起動の設定](#自動起動の設定)
7. [運用・メンテナンス](#運用メンテナンス)
8. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### ハードウェア要件
- CPU: 2コア以上
- メモリ: 2GB以上（推奨4GB）
- ストレージ: 20GB以上の空き容量

### ソフトウェア要件
- Ubuntu 20.04 LTS 以上
- インターネット接続（初期セットアップ時）
- SSHアクセス

### ネットワーク要件
- 固定IPアドレス（推奨）
- ポート開放: 22 (SSH), 3000 (Frontend), 8000 (Backend)

## Ubuntu環境の準備

### 1. Ubuntuマシンへの接続

```bash
# SSHでUbuntuマシンに接続
ssh username@ubuntu-ip-address
```

### 2. 必要なソフトウェアのインストール

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    openssl

# Dockerのインストール
# Docker GPGキーの追加
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Dockerリポジトリの追加
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engineのインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# Dockerサービスの起動と自動起動設定
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. Dockerグループの適用

```bash
# 一度ログアウトして再ログイン
exit

# 再度SSH接続
ssh username@ubuntu-ip-address

# Dockerが正しく動作することを確認
docker --version
docker compose version
```

## プロジェクトのセットアップ

### 1. プロジェクトファイルの転送

#### 方法A: GitHubからクローン（推奨）

```bash
# プロジェクトをクローン
cd ~
git clone https://github.com/yourusername/money-dairy-lovers.git
cd money-dairy-lovers
```

#### 方法B: ローカルから転送

Macまたは開発マシンで実行:
```bash
# プロジェクトディレクトリに移動
cd /path/to/money-dairy-lovers

# プロジェクトをUbuntuに転送（node_modulesなどを除外）
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'postgres_data' \
    --exclude '__pycache__' --exclude '*.pyc' --exclude 'dist' \
    . username@ubuntu-ip:~/money-dairy-lovers/
```

### 2. 本番環境設定ファイルの作成

```bash
cd ~/money-dairy-lovers

# 環境変数ファイルのコピー
cp .env.example .env.production

# SECRET_KEYの生成
SECRET_KEY=$(openssl rand -base64 32)
echo "Generated SECRET_KEY: $SECRET_KEY"

# .env.productionを編集
nano .env.production
```

`.env.production`の設定内容:
```env
# === 基本設定 ===
ENVIRONMENT=production

# === セキュリティ ===
SECRET_KEY=<上で生成されたSECRET_KEY>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# === データベース ===
DATABASE_URL=postgresql://postgres:StrongPassword123!@db:5432/money_dairy_lovers

# === URL設定（IPアドレスを置き換える） ===
BACKEND_URL=http://192.168.1.100:8000
FRONTEND_URL=http://192.168.1.100:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://192.168.1.100:3000,http://192.168.1.100:8000

# === メール設定（後述） ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_TLS=True
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# === その他 ===
REDIS_URL=redis://redis:6379/0
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf
ENABLE_LOVE_ANALYTICS=true
DEFAULT_LOVE_CATEGORIES=デート代,プレゼント,記念日
```

### 3. IPアドレスの確認と設定

```bash
# UbuntuマシンのIPアドレスを確認
hostname -I | awk '{print $1}'

# 表示されたIPアドレスを.env.productionのURL設定に反映
# BACKEND_URL=http://<YOUR_IP>:8000
# FRONTEND_URL=http://<YOUR_IP>:3000
```

### 4. アプリケーションの起動

```bash
# 本番環境でDockerコンテナを起動
docker compose --env-file .env.production up -d

# 起動状態の確認
docker compose ps

# ログの確認
docker compose logs -f
```

### 5. データベースマイグレーション

```bash
# マイグレーションの実行
docker compose exec backend alembic upgrade heads

# 初期データの投入（カテゴリなど）
docker compose exec backend python -m scripts.seed_categories
```

## メール送信の設定

### Gmailを使用する場合

1. **Googleアカウントの2段階認証を有効化**
   - https://myaccount.google.com/security にアクセス
   - 「2段階認証プロセス」を有効化

2. **アプリパスワードの生成**
   - https://myaccount.google.com/apppasswords にアクセス
   - 「アプリを選択」→「メール」を選択
   - 「デバイスを選択」→「その他」を選択し、「Money Dairy Lovers」と入力
   - 生成された16文字のパスワードをコピー

3. **.env.productionの更新**
   ```bash
   nano .env.production
   ```
   以下の設定を更新:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_TLS=True
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=生成された16文字のアプリパスワード
   ```

4. **設定の反映**
   ```bash
   docker compose restart backend
   ```

## データの移行（オプション）

### 既存環境からのデータ移行

開発環境や別のサーバーからデータを移行する場合:

1. **移行元でバックアップを作成**
   ```bash
   # 移行元のマシンで実行
   docker compose exec db pg_dump -U postgres money_dairy_lovers > backup.sql
   ```

2. **バックアップファイルを転送**
   ```bash
   # 移行元から実行
   scp backup.sql username@ubuntu-ip:~/money-dairy-lovers/
   ```

3. **Ubuntuマシンでリストア**
   ```bash
   # Ubuntuマシンで実行
   cd ~/money-dairy-lovers
   
   # 既存のデータベースを削除（注意！）
   docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS money_dairy_lovers;"
   docker compose exec db psql -U postgres -c "CREATE DATABASE money_dairy_lovers;"
   
   # バックアップをリストア
   docker compose exec -T db psql -U postgres money_dairy_lovers < backup.sql
   ```

## 自動起動の設定

### systemdサービスの作成

1. **サービスファイルの作成**
   ```bash
   sudo nano /etc/systemd/system/money-dairy-lovers.service
   ```

2. **以下の内容を記入**
   ```ini
   [Unit]
   Description=Money Dairy Lovers
   Requires=docker.service
   After=docker.service network-online.target
   Wants=network-online.target

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   User=YOUR_USERNAME
   Group=docker
   WorkingDirectory=/home/YOUR_USERNAME/money-dairy-lovers
   ExecStart=/usr/bin/docker compose --env-file .env.production up -d
   ExecStop=/usr/bin/docker compose down
   ExecReload=/usr/bin/docker compose restart
   StandardOutput=journal
   StandardError=journal

   [Install]
   WantedBy=multi-user.target
   ```

3. **サービスの有効化と起動**
   ```bash
   # systemdの再読み込み
   sudo systemctl daemon-reload
   
   # サービスの有効化（自動起動）
   sudo systemctl enable money-dairy-lovers.service
   
   # サービスの起動
   sudo systemctl start money-dairy-lovers.service
   
   # 状態確認
   sudo systemctl status money-dairy-lovers.service
   ```

## 運用・メンテナンス

### 日常的な運用コマンド

```bash
# サービスの状態確認
docker compose ps

# ログの確認
docker compose logs -f backend
docker compose logs -f frontend

# 再起動
docker compose restart

# 特定のサービスのみ再起動
docker compose restart backend
```

### バックアップ

1. **手動バックアップ**
   ```bash
   # バックアップディレクトリの作成
   mkdir -p ~/backups
   
   # データベースのバックアップ
   cd ~/money-dairy-lovers
   docker compose exec db pg_dump -U postgres money_dairy_lovers > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **自動バックアップ（cron）**
   ```bash
   # crontabの編集
   crontab -e
   
   # 毎日午前3時にバックアップ
   0 3 * * * cd /home/username/money-dairy-lovers && docker compose exec -T db pg_dump -U postgres money_dairy_lovers > /home/username/backups/backup_$(date +\%Y\%m\%d).sql
   ```

### アップデート

```bash
# 最新のコードを取得
cd ~/money-dairy-lovers
git pull origin main

# コンテナの再ビルドと起動
docker compose --env-file .env.production down
docker compose --env-file .env.production up -d --build

# マイグレーションの実行
docker compose exec backend alembic upgrade heads
```

### モニタリング

```bash
# リソース使用状況の確認
docker stats

# ディスク使用量の確認
df -h

# Dockerの不要なデータをクリーンアップ
docker system prune -a --volumes
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ポートが使用中
```bash
# 使用中のポートを確認
sudo lsof -i :3000
sudo lsof -i :8000

# 必要に応じてプロセスを終了
sudo kill -9 <PID>
```

#### 2. Dockerの権限エラー
```bash
# dockerグループに所属しているか確認
groups

# 所属していない場合は追加
sudo usermod -aG docker $USER
# 再ログインが必要
```

#### 3. データベース接続エラー
```bash
# PostgreSQLコンテナのログ確認
docker compose logs db

# データベースに直接接続
docker compose exec db psql -U postgres

# 接続テスト
docker compose exec backend python -c "from app.db.session import SessionLocal; db = SessionLocal(); print('DB接続成功')"
```

#### 4. メモリ不足
```bash
# メモリ使用状況の確認
free -h

# Dockerのメモリ制限を設定（docker-compose.ymlを編集）
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 512m
  db:
    mem_limit: 256m
```

#### 5. ファイアウォールの問題
```bash
# ファイアウォールの状態確認
sudo ufw status

# 必要なポートを開放
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend

# ファイアウォールを有効化
sudo ufw enable
```

### ログの確認方法

```bash
# 全サービスのログ
docker compose logs

# 特定サービスのログ
docker compose logs backend
docker compose logs frontend
docker compose logs db

# リアルタイムログ
docker compose logs -f

# 最新100行のみ
docker compose logs --tail=100
```

### 緊急時の対応

```bash
# 全サービスの停止
docker compose down

# コンテナとボリュームの削除（データも削除されるので注意！）
docker compose down -v

# 完全なリセット（最終手段）
docker system prune -a --volumes
```

## セキュリティに関する注意事項

1. **定期的なアップデート**
   - Ubuntu: `sudo apt update && sudo apt upgrade`
   - Docker: 最新版の使用を推奨

2. **強力なパスワードの使用**
   - データベースパスワード
   - SECRET_KEY
   - メールアプリパスワード

3. **ファイアウォールの設定**
   - 必要最小限のポートのみ開放
   - SSH接続は公開鍵認証を推奨

4. **バックアップの暗号化**
   - 重要なバックアップは暗号化して保存

5. **アクセスログの監視**
   - 定期的にログを確認
   - 不審なアクセスがないか確認

## サポート

問題が発生した場合は、以下の情報を含めて報告してください：

1. エラーメッセージ（`docker compose logs`の出力）
2. 実行したコマンド
3. .env.production の内容（パスワード部分は隠す）
4. システム情報（`uname -a`, `docker --version`）

---

💕 Happy Money Management with Love! 💕