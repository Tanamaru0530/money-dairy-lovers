# Money Dairy Lovers - Docker環境セットアップガイド

## 概要

Money Dairy Loversプロジェクトは、Docker Composeを使用して完全にコンテナ化された開発環境を提供します。

## 環境構成

### コンテナ構成

1. **Frontend** (React 19 + Vite)
   - ポート: 3000
   - ホットリロード対応
   - ヘルスチェック付き

2. **Backend** (FastAPI)
   - ポート: 8000
   - ホットリロード対応
   - ヘルスチェック付き

3. **Database** (PostgreSQL 15)
   - ポート: 5432
   - データ永続化
   - 自動バックアップ対応

4. **Cache** (Redis 7)
   - ポート: 6379
   - データ永続化
   - AOF (Append Only File) 有効

## セットアップ手順

### 1. 前提条件

- Docker Desktop インストール済み
- Git インストール済み
- Make コマンド使用可能（オプション）

### 2. 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/money-dairy-lovers.git
cd money-dairy-lovers

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集（必要に応じて）
# 特にPOSTGRES_PASSWORD, SECRET_KEYは変更推奨
```

### 3. 環境の起動

#### Makefileを使用する場合（推奨）

```bash
# 開発環境を起動
make up

# ログを確認
make logs

# 環境を停止
make down
```

#### Docker Composeを直接使用する場合

```bash
# 環境を起動
docker compose up -d

# ログを確認
docker compose logs -f

# 環境を停止
docker compose down
```

## 開発作業

### コンテナへのアクセス

```bash
# Backendコンテナに入る
make shell-backend
# または
docker compose exec backend bash

# Frontendコンテナに入る
make shell-frontend
# または
docker compose exec frontend sh

# データベースに接続
make shell-db
# または
docker compose exec db psql -U postgres -d money_dairy_lovers
```

### ホットリロード

- **Frontend**: ソースコードを変更すると自動的にブラウザがリロードされます
- **Backend**: ソースコードを変更すると自動的にサーバーが再起動されます

### データベース操作

```bash
# マイグレーション実行
make migrate
# または
docker compose exec backend alembic upgrade head

# マイグレーション作成
docker compose exec backend alembic revision --autogenerate -m "Add user table"

# データベースバックアップ
make backup

# データベースリストア
make restore
```

## トラブルシューティング

### ポートが使用中の場合

```bash
# 使用中のポートを確認
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# プロセスを終了
kill -9 <PID>
```

### コンテナが起動しない場合

```bash
# すべてをクリーンアップして再起動
make clean
make up

# または
docker compose down -v
docker system prune -af
docker compose up --build
```

### ヘルスチェックの確認

```bash
# コンテナの健康状態を確認
docker compose ps

# ヘルスチェックログを確認
docker inspect money-dairy-lovers-backend | grep -A 10 Health
```

## 環境変数

主要な環境変数（.env ファイル）:

- `POSTGRES_PASSWORD`: PostgreSQLのパスワード
- `SECRET_KEY`: JWT認証用の秘密鍵
- `DATABASE_URL`: データベース接続URL
- `REDIS_URL`: Redis接続URL
- `VITE_API_URL`: FrontendからBackendへのAPIエンドポイント

## バックアップとリストア

### 自動バックアップ

```bash
# 手動バックアップ
make backup

# バックアップファイルは backup/ ディレクトリに保存されます
ls -la backup/
```

### リストア手順

```bash
# リストアコマンドを実行
make restore

# プロンプトに従ってバックアップファイルを選択
```

## 本番環境

本番環境用の設定は `docker-compose.prod.yml` に定義されています。

```bash
# 本番環境を起動
docker compose -f docker-compose.prod.yml up -d

# または Makefileを使用
make prod-up
```

## セキュリティ注意事項

1. `.env` ファイルは絶対にGitにコミットしない
2. 本番環境では必ず強力なパスワードを使用
3. ファイアウォールで不要なポートをブロック
4. 定期的にDockerイメージを更新

## パフォーマンスチューニング

### Docker設定

Docker Desktopの設定で以下を推奨:
- Memory: 4GB以上
- CPUs: 2以上
- Disk image size: 20GB以上

### ボリューム最適化

開発環境では `node_modules` をボリュームマウントから除外してパフォーマンスを向上させています。

```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules  # node_modulesは除外
```

## よくある質問

### Q: ホットリロードが効かない
A: `CHOKIDAR_USEPOLLING=true` が環境変数に設定されているか確認してください。

### Q: データベースに接続できない
A: ヘルスチェックが完了するまで待ってください。`docker compose ps` で状態を確認できます。

### Q: メモリ不足エラーが出る
A: Docker Desktopのメモリ割り当てを増やしてください。

## 関連ドキュメント

- [アーキテクチャ設計](./architecture.md)
- [API仕様書](./api.md)
- [デプロイメント手順](./deployment.md)