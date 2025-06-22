# Money Dairy Lovers - デプロイメント手順書

## 概要

このドキュメントでは、Money Dairy Loversアプリケーションのデプロイメント手順について説明します。開発環境から本番環境まで、愛を込めたデプロイプロセスを解説します。

## 前提条件

### 必要なツール
- Docker Desktop (v20.10以上)
- Docker Compose (v2.0以上)
- AWS CLI (v2.0以上) - 本番環境の場合
- Git
- Node.js (v18以上)
- Python (v3.11以上)

### アクセス権限
- GitHubリポジトリへのアクセス権
- AWS アカウント（本番環境）
- DockerHub アカウント（オプション）

## 環境構成

### 環境一覧
1. **開発環境** (Development) - ローカル開発
2. **ステージング環境** (Staging) - 本番前検証
3. **本番環境** (Production) - 実運用

## 開発環境へのデプロイ

### 1. リポジトリのクローン
```bash
git clone https://github.com/money-dairy-lovers/money-dairy-lovers.git
cd money-dairy-lovers
```

### 2. 環境変数の設定
```bash
# .envファイルの作成
cp .env.example .env

# 必要に応じて.envファイルを編集
vim .env
```

**.env の設定例:**
```env
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/money_dairy_lovers
DATABASE_URL_TEST=postgresql://postgres:password@db:5432/money_dairy_lovers_test

# JWT
SECRET_KEY=your-secret-key-here-love-themed-32chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Frontend
VITE_API_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
```

### 3. Dockerコンテナの起動
```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 特定のサービスのログを確認
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. データベースの初期化
```bash
# データベースマイグレーションの実行
docker-compose exec backend alembic upgrade head

# 初期データの投入（開発用）
docker-compose exec backend python -m app.scripts.seed_data
```

### 5. アプリケーションへのアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

### 6. 開発環境の停止
```bash
# コンテナの停止
docker-compose down

# ボリュームも含めて削除（データも削除される）
docker-compose down -v
```

## ステージング環境へのデプロイ

### 1. AWS リソースの準備
```bash
# Terraformによるインフラ構築
cd infrastructure/terraform/staging
terraform init
terraform plan
terraform apply
```

### 2. ECRへのイメージプッシュ
```bash
# AWS ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin [ECR_URL]

# イメージのビルドとタグ付け
docker build -t money-dairy-lovers-backend ./backend
docker tag money-dairy-lovers-backend:latest [ECR_URL]/money-dairy-lovers-backend:staging

docker build -t money-dairy-lovers-frontend ./frontend
docker tag money-dairy-lovers-frontend:latest [ECR_URL]/money-dairy-lovers-frontend:staging

# イメージのプッシュ
docker push [ECR_URL]/money-dairy-lovers-backend:staging
docker push [ECR_URL]/money-dairy-lovers-frontend:staging
```

### 3. ECSサービスの更新
```bash
# タスク定義の更新
aws ecs register-task-definition --cli-input-json file://infrastructure/ecs/staging/backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://infrastructure/ecs/staging/frontend-task-definition.json

# サービスの更新
aws ecs update-service --cluster staging-cluster --service backend-service --task-definition backend:latest
aws ecs update-service --cluster staging-cluster --service frontend-service --task-definition frontend:latest
```

### 4. データベースマイグレーション
```bash
# ECSタスクでマイグレーション実行
aws ecs run-task --cluster staging-cluster --task-definition migration-task
```

## 本番環境へのデプロイ

### 1. 事前チェックリスト
- [ ] ステージング環境でのテスト完了
- [ ] データベースバックアップ取得
- [ ] ロールバック手順の確認
- [ ] 関係者への通知
- [ ] Love メトリクスの確認

### 2. GitHub Actions によるデプロイ
```bash
# mainブランチへのマージでデプロイが自動実行される
git checkout main
git merge develop
git push origin main
```

### 3. デプロイ監視
```bash
# GitHub Actions の状況確認
# https://github.com/money-dairy-lovers/money-dairy-lovers/actions

# CloudWatch ログの確認
aws logs tail /ecs/production/backend --follow
aws logs tail /ecs/production/frontend --follow
```

### 4. ヘルスチェック
```bash
# APIヘルスチェック
curl https://api.money-dairy-lovers.com/health

# Love機能のヘルスチェック
curl https://api.money-dairy-lovers.com/health/love
```

### 5. デプロイ後の確認
- [ ] アプリケーションの動作確認
- [ ] Love機能の動作確認
- [ ] パフォーマンスメトリクスの確認
- [ ] エラーログの確認
- [ ] ユーザーからのフィードバック確認

## ロールバック手順

### 1. 迅速なロールバック（ECS）
```bash
# 前のタスク定義にロールバック
aws ecs update-service --cluster production-cluster --service backend-service --task-definition backend:previous
aws ecs update-service --cluster production-cluster --service frontend-service --task-definition frontend:previous
```

### 2. データベースのロールバック
```bash
# Alembicでマイグレーションのロールバック
docker-compose exec backend alembic downgrade -1
```

### 3. 完全なロールバック
```bash
# 前のバージョンのタグをチェックアウト
git checkout v1.0.0

# 再デプロイ
./scripts/deploy-production.sh v1.0.0
```

## 監視とアラート

### 1. CloudWatch アラーム設定
```json
{
  "AlarmName": "love-api-high-error-rate",
  "MetricName": "4XXError",
  "Threshold": 10,
  "ComparisonOperator": "GreaterThanThreshold",
  "EvaluationPeriods": 2,
  "Period": 300
}
```

### 2. ログ監視
```bash
# エラーログの監視
aws logs filter-log-events --log-group-name /ecs/production/backend --filter-pattern "ERROR"

# Love機能の使用状況監視
aws logs filter-log-events --log-group-name /ecs/production/backend --filter-pattern "love_rating"
```

## トラブルシューティング

### よくある問題と対処法

#### 1. コンテナが起動しない
```bash
# ログを確認
docker-compose logs backend

# 一般的な原因：
# - 環境変数の設定ミス
# - ポートの競合
# - データベース接続エラー
```

#### 2. データベース接続エラー
```bash
# データベースの状態確認
docker-compose ps db

# 接続テスト
docker-compose exec backend python -c "from app.core.database import engine; engine.connect()"
```

#### 3. マイグレーションエラー
```bash
# マイグレーション履歴の確認
docker-compose exec backend alembic history

# 特定のリビジョンへ移動
docker-compose exec backend alembic upgrade [revision]
```

#### 4. Love機能の不具合
```bash
# Love関連のログを確認
docker-compose logs backend | grep -i love

# Love統計の再計算
docker-compose exec backend python -m app.scripts.recalculate_love_stats
```

## セキュリティ考慮事項

### 1. シークレット管理
- AWS Secrets Manager を使用
- 環境変数にシークレットを直接記載しない
- Love-themed シークレット名を使用

### 2. ネットワークセキュリティ
- VPC内でのプライベート通信
- セキュリティグループの最小権限設定
- Love API へのレート制限

### 3. データ保護
- データベースの暗号化
- バックアップの暗号化
- Love memories の安全な保存

## バックアップとリストア

### 1. 自動バックアップ
```bash
# 日次バックアップスクリプト
0 2 * * * /scripts/backup-love-data.sh
```

### 2. 手動バックアップ
```bash
# データベースのバックアップ
pg_dump -h localhost -U postgres money_dairy_lovers > backup_$(date +%Y%m%d).sql

# アップロードファイルのバックアップ
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/uploads/
```

### 3. リストア手順
```bash
# データベースのリストア
psql -h localhost -U postgres money_dairy_lovers < backup_20250115.sql

# ファイルのリストア
tar -xzf uploads_backup_20250115.tar.gz -C /
```

## メンテナンスモード

### 1. メンテナンスモードの有効化
```bash
# メンテナンスページの表示
docker-compose exec frontend npm run maintenance:on

# APIをメンテナンスモードに
docker-compose exec backend python -m app.scripts.maintenance --enable
```

### 2. メンテナンス中の作業
- データベースの最適化
- インデックスの再構築
- Love統計の再計算
- キャッシュのクリア

### 3. メンテナンスモードの解除
```bash
# 通常モードに戻す
docker-compose exec frontend npm run maintenance:off
docker-compose exec backend python -m app.scripts.maintenance --disable
```

## CI/CD パイプライン

### GitHub Actions ワークフロー
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests with love
        run: |
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy with love
        run: |
          ./scripts/deploy-production.sh
```

## デプロイチェックリスト

### デプロイ前
- [ ] すべてのテストがパス
- [ ] コードレビュー完了
- [ ] Love機能の動作確認
- [ ] ステージング環境での検証完了
- [ ] データベースバックアップ取得
- [ ] ロールバック計画の確認

### デプロイ中
- [ ] デプロイスクリプトの実行
- [ ] ログの監視
- [ ] ヘルスチェックの確認
- [ ] メトリクスの監視

### デプロイ後
- [ ] 機能テストの実施
- [ ] パフォーマンステスト
- [ ] ユーザー影響の確認
- [ ] Love統計の確認
- [ ] 関係者への完了通知

## まとめ

Money Dairy Loversのデプロイメントは、カップルの大切なデータを扱うため、慎重かつ愛情を持って行う必要があります。このガイドに従って、安全で確実なデプロイメントを実現してください。

デプロイに関する質問や問題がある場合は、以下にお問い合わせください：
- Slack: #money-dairy-lovers-deploy
- Email: devops@money-dairy-lovers.com

---

*愛を込めて、確実にデプロイしましょう 💕*