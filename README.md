# Money Dairy Lovers 💕

カップル向け家計簿アプリケーション - 愛を育む家計管理ツール

## 概要

Money Dairy Loversは、カップルが共同で家計管理を行うためのWebアプリケーションです。個人の支出管理と共有支出の管理を効率的に行い、お金に関する透明性とコミュニケーションを向上させます。

## 主な機能

- 👥 **カップル連携** - パートナーとアカウントを連携して共同管理
- 💰 **支出・収入管理** - 個人/共有の収支を記録・管理
- 📊 **分析・レポート** - 支出傾向の可視化と分析
- 💕 **Love機能** - デート代やプレゼント代など特別な支出カテゴリ
- 🎯 **予算管理** - カテゴリ別・全体の予算設定と追跡
- 📱 **レスポンシブデザイン** - スマートフォン・タブレット・PC対応

## 技術スタック

### Frontend
- **React 19** - 最新のReactでモダンなUI構築
- **TypeScript** - 型安全な開発
- **Vite** - 高速な開発環境
- **SCSS Modules** - コンポーネントスコープのスタイリング

### Backend
- **FastAPI** - 高速で現代的なPython APIフレームワーク
- **Python 3.12** - 最新のPython
- **SQLAlchemy** - パワフルなORM
- **Alembic** - データベースマイグレーション
- **PostgreSQL 15** - 信頼性の高いリレーショナルデータベース

### Infrastructure
- **Docker** - コンテナ化された開発・本番環境
- **Docker Compose** - マルチコンテナアプリケーション管理
- **GitHub Actions** - CI/CDパイプライン

## 開発環境セットアップ

### 前提条件
- Docker Desktop
- Git
- お好みのコードエディタ（VS Code推奨）

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/yourusername/money-dairy-lovers.git
cd money-dairy-lovers
```

2. **環境変数の設定**
```bash
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

3. **Dockerコンテナの起動**
```bash
docker-compose up -d
```

4. **データベースマイグレーション**
```bash
docker-compose exec backend alembic upgrade head
```

5. **アプリケーションへのアクセス**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 開発コマンド

**Frontend開発**
```bash
# コンテナに入る
docker-compose exec frontend sh

# 依存関係のインストール
npm install

# 開発サーバー起動（ホットリロード対応）
npm run dev

# テスト実行
npm test

# ビルド
npm run build
```

**Backend開発**
```bash
# コンテナに入る
docker-compose exec backend bash

# 依存関係のインストール
pip install -r requirements.txt

# 開発サーバー起動（ホットリロード対応）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# テスト実行
pytest

# マイグレーション作成
alembic revision --autogenerate -m "migration message"

# マイグレーション実行
alembic upgrade head
```

## プロジェクト構造

```
money-dairy-lovers/
├── frontend/               # Reactアプリケーション
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── services/      # API通信
│   │   ├── store/         # 状態管理
│   │   ├── styles/        # グローバルスタイル
│   │   └── types/         # TypeScript型定義
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/               # FastAPI アプリケーション
│   ├── app/
│   │   ├── api/          # APIエンドポイント
│   │   ├── core/         # 設定・セキュリティ
│   │   ├── db/           # データベース関連
│   │   ├── models/       # SQLAlchemyモデル
│   │   ├── schemas/      # Pydanticスキーマ
│   │   └── services/     # ビジネスロジック
│   ├── alembic/          # マイグレーション
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml    # Docker設定
├── .github/workflows/    # CI/CD設定
├── docs/                 # ドキュメント
└── README.md
```

## 開発ガイドライン

### コード規約
- **Frontend**: ESLint + Prettier設定に従う
- **Backend**: Black + isort + mypy使用
- **コミット**: Conventional Commits形式

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

## テスト

```bash
# Frontend テスト
docker-compose exec frontend npm test

# Backend テスト
docker-compose exec backend pytest

# E2Eテスト
docker-compose exec frontend npm run test:e2e
```

## デプロイ

GitHub Actionsによる自動デプロイが設定されています。
- `develop`ブランチへのプッシュ → ステージング環境
- `main`ブランチへのプッシュ → 本番環境

## ライセンス

MIT License

## コントリビューション

プルリクエスト歓迎です！以下の手順でお願いします：
1. Issueを作成
2. Featureブランチを作成
3. コミット
4. プルリクエスト作成

## サポート

問題や質問がある場合は、GitHubのIssueを作成してください。