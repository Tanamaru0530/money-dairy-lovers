# Money Dairy Lovers - カップル向け家計簿アプリ 要件定義書 Part 1

## 1. プロジェクト概要

### 1.1 目的
カップル（2人）が共同で家計管理を行うためのWebアプリケーション「Money Dairy Lovers」。個人の支出管理と共有支出の管理を効率的に行い、お金に関する透明性とコミュニケーションを向上させる。愛情深いカップルが共に財務を管理し、将来の夢に向かって歩んでいくためのツール。

### 1.2 ターゲットユーザー
- 同棲・結婚しているカップル
- 共同でお金を管理したいカップル
- 家計の見える化を求めるカップル
- 将来に向けて貯金を頑張りたいカップル
- お金の話をオープンにしたいカップル

### 1.3 成功指標
- 日常的に使用される（週3回以上のログイン）
- 支出の記録習慣が身につく
- カップル間のお金に関する話し合いが増える
- 共有支出の透明性向上
- 貯金目標の達成率向上

### 1.4 プロジェクトのコンセプト
**「愛を育む家計簿」** - お金の管理を通じて二人の絆を深め、将来の夢を共有する温かいアプリケーション

## 2. 機能要件

### 2.1 認証・ユーザー管理

#### 2.1.1 ユーザー登録
- **機能**：新規ユーザーのアカウント作成
- **入力項目**：
  - メールアドレス（必須・ユニーク）
  - パスワード（必須・8文字以上・英数字記号含む）
  - 表示名（必須・20文字以内）
  - プロフィール画像（任意・最大2MB）
- **バリデーション**：
  - メールアドレス形式チェック
  - パスワード強度チェック
  - 重複メールアドレスチェック
- **処理**：
  - メールアドレス認証（認証メール送信）
  - パスワードハッシュ化保存
  - Love-themed ウェルカムメッセージ

#### 2.1.2 ログイン・ログアウト
- **機能**：既存ユーザーの認証
- **入力項目**：
  - メールアドレス
  - パスワード
- **機能詳細**：
  - JWTトークン発行（有効期限24時間）
  - リフレッシュトークン発行（有効期限30日）
  - 自動ログイン機能（Remember Me）
  - ログアウト時のトークン無効化
  - パートナーのログイン通知

#### 2.1.3 パートナー連携
- **機能**：2人のアカウントを関連付け
- **連携方法**：
  - 招待コード生成・共有（6桁英数字）
  - メールアドレスでの招待
  - QRコード生成（招待コード含む）
- **制限**：
  - 1人につき1人のパートナーのみ
  - 連携解除機能
  - 招待有効期限（48時間）

### 2.2 支出・収入管理

#### 2.2.1 取引記録
- **機能**：収支の記録・編集・削除
- **入力項目**：
  - 金額（必須・正の数値）
  - カテゴリ（必須・プリセット+カスタム）
  - 取引種別（収入/支出）
  - 取引タイプ（個人/共有）
  - 日付（必須・デフォルト今日）
  - メモ（任意・200文字以内）
  - 支払い方法（現金/クレジットカード/銀行振込/電子マネー）
  - 写真添付（任意・レシート等）
- **共有支出の場合**：
  - 支払者選択
  - 負担割合（50:50/金額指定/比率指定）
  - 分割方法（均等割り/金額指定/比率指定）

#### 2.2.2 カテゴリ管理
- **プリセットカテゴリ**：
  - 🍽️ 食費（外食、食材、飲み物）
  - 🚗 交通費（電車、バス、タクシー、ガソリン）
  - 🏠 住居費（家賃、光熱費、通信費）
  - 🎬 娯楽費（映画、ゲーム、趣味）
  - 👕 日用品（衣類、化粧品、雑貨）
  - 🏥 医療費（病院、薬、保険）
  - 💕 デート代（特別カテゴリ）
  - 🎁 プレゼント（特別カテゴリ）
  - 📚 その他
- **カスタムカテゴリ**：
  - ユーザー独自カテゴリ作成
  - アイコン・色設定（絵文字から選択）
  - カテゴリごとの予算設定
  - カテゴリの使用頻度統計

#### 2.2.3 定期取引
- **機能**：毎月発生する取引の自動登録
- **設定項目**：
  - 実行日（毎月X日）
  - 実行タイミング（月初/月末/給料日）
  - 頻度（毎月/隔月/四半期/年次）
  - 有効期限設定
  - 自動実行ON/OFF
- **通知機能**：
  - 実行前通知（前日）
  - 実行完了通知
  - 実行失敗通知

### 2.3 データ表示・分析

#### 2.3.1 ダッシュボード
- **表示内容**：
  - 今月の収支サマリー
  - 今月の支出ランキング（カテゴリ別）
  - 最近の取引履歴（最新10件）
  - 予算達成率（プログレスバー）
  - パートナーとの共有支出サマリー
  - Love統計（デート代、プレゼント代等）
- **Love要素**：
  - 二人の写真表示
  - 愛情メッセージ
  - 記念日カウントダウン
  - 目標達成お祝いアニメーション

#### 2.3.2 取引履歴
- **機能**：過去の全取引一覧表示
- **表示形式**：
  - タイムライン型表示
  - 日付別グルーピング
  - Love-themed カードデザイン
- **フィルター機能**：
  - 期間指定（今月/先月/カスタム期間）
  - カテゴリ絞り込み
  - 取引タイプ絞り込み（個人/共有）
  - 金額範囲指定
  - 支払者絞り込み
- **ソート機能**：
  - 日付（昇順/降順）
  - 金額（昇順/降順）
  - カテゴリ別
- **ページネーション**：20件/ページ

#### 2.3.3 レポート・グラフ
- **月次レポート**：
  - 収支推移グラフ（折れ線グラフ）
  - カテゴリ別支出割合（円グラフ）
  - 個人vs共有支出比較（棒グラフ）
  - 前月比較・成長率
  - Love支出分析（デート代推移等）
- **年次レポート**：
  - 月別収支推移
  - 年間カテゴリ別集計
  - 年間Love統計
  - 目標達成状況
- **カスタムレポート**：
  - 期間指定レポート生成
  - CSVエクスポート機能
  - PDFレポート生成
  - 二人の支出傾向分析

### 2.4 予算管理

#### 2.4.1 予算設定
- **設定レベル**：
  - 全体予算（月次/年次）
  - カテゴリ別予算
  - 個人/共有別予算
  - Love予算（デート代、プレゼント代）
- **アラート機能**：
  - 予算の80%到達時
  - 予算超過時
  - 月末予算残高通知
  - パートナーへの通知設定
- **視覚的表示**：
  - ハート型プログレスバー
  - 色分け（緑→黄→赤）
  - アニメーション効果

#### 2.4.2 目標設定
- **貯金目標**：
  - 目標金額設定
  - 達成期限設定
  - 進捗表示
  - マイルストーン設定
- **Love目標**：
  - デート予算
  - プレゼント予算
  - 記念日予算
  - 旅行積立
  - 結婚資金

### 2.5 共有機能

#### 2.5.1 パートナー間の情報共有
- **共有できる情報**：
  - 共有支出の詳細
  - 月次サマリー
  - 設定した目標の進捗
  - Love統計
  - 予算達成状況
- **プライバシー設定**：
  - 個人支出の詳細は非公開
  - 個人支出の合計金額のみ共有可能
  - 公開レベル設定（完全公開/部分公開/非公開）

#### 2.5.2 通知機能
- **通知タイプ**：
  - 共有支出の登録通知
  - 予算アラート
  - 月次レポート完成通知
  - パートナーの大きな支出通知
  - 目標達成お祝い通知
  - 記念日リマインダー
- **通知方法**：
  - アプリ内通知（Love-themedデザイン）
  - メール通知（設定可能）
  - プッシュ通知（オプション）

#### 2.5.3 コミュニケーション機能
- **支出メモ共有**：
  - 支出へのコメント機能
  - 絵文字リアクション
  - 写真共有
- **目標共有**：
  - 目標設定の相談機能
  - 進捗の共有・応援
  - 達成時のお祝いメッセージ

## 3. Love-themed 特別機能

### 3.1 記念日管理
- **記念日登録**：
  - 付き合った日
  - 結婚記念日
  - 誕生日
  - その他特別な日
- **記念日連動機能**：
  - 記念日前の予算アラート
  - 記念日支出の自動カテゴリ分け
  - 記念日の思い出写真表示

### 3.2 Love Analytics
- **分析項目**：
  - デート頻度・平均支出
  - プレゼント履歴
  - 二人の支出バランス
  - Love支出の季節性分析
- **レポート**：
  - 月次Loveレポート
  - 年間Love統計
  - 記念日支出サマリー

### 3.3 目標共有・応援機能
- **共同目標設定**：
  - 結婚資金
  - 新居購入資金
  - 旅行積立
  - その他二人の夢
- **進捗共有**：
  - 目標達成率の視覚化
  - マイルストーン達成お祝い
  - 励ましメッセージ機能
- **達成お祝い**：
  - 達成時のアニメーション
  - お祝いバッジ
  - 記念写真保存機能

  # Money Dairy Lovers - 要件定義書 Part 2（非機能・技術要件）

## 4. 非機能要件

### 4.1 パフォーマンス
- **レスポンス時間**：2秒以内（95%パーセンタイル）
- **ページロード時間**：3秒以内（初回）、1秒以内（リピート）
- **同時接続数**：100ユーザーまで対応
- **データ取得**：ページネーション実装
- **API スループット**：100 requests/minute/user
- **データベースクエリ**：平均100ms以内

### 4.2 セキュリティ
- **認証・認可**：
  - JWT + リフレッシュトークン
  - bcryptでパスワードハッシュ化
  - 多要素認証（オプション）
  - セッション管理
- **通信セキュリティ**：
  - HTTPS強制（全通信の暗号化）
  - HSTS有効化
  - CSRFトークン
- **データ保護**：
  - 入力値検証（すべての入力）
  - SQLインジェクション対策（ORM使用）
  - XSS対策
  - データベース暗号化
- **プライバシー保護**：
  - 個人データの適切な管理
  - GDPR準拠
  - データ匿名化オプション

### 4.3 可用性・信頼性
- **稼働率**：99%以上
- **バックアップ**：
  - 日次自動バックアップ
  - ポイントインタイムリカバリ
  - 地理的冗長化
- **障害復旧**：
  - RTO（目標復旧時間）：24時間以内
  - RPO（目標復旧ポイント）：1時間以内
- **エラーハンドリング**：
  - グレースフルデグラデーション
  - ユーザーフレンドリーなエラーメッセージ
  - エラーログ記録・監視

### 4.4 スケーラビリティ
- **水平スケーリング**：コンテナベースの設計
- **データベース**：読み取り専用レプリカ対応
- **CDN**：静的ファイル配信最適化
- **キャッシュ戦略**：Redis使用
- **負荷分散**：ALB使用

### 4.5 ユーザビリティ
- **レスポンシブデザイン**：スマートフォン・タブレット・PC対応
- **アクセシビリティ**：WCAG 2.1 AA準拠
- **多言語対応**：日本語・英語（将来拡張）
- **ブラウザ対応**：Chrome, Firefox, Safari, Edge（最新2バージョン）
- **オフライン対応**：PWA機能（将来拡張）

## 5. 技術要件

### 5.1 アーキテクチャ
- **フロントエンド**：React 19 + TypeScript + SCSS Modules
- **バックエンド**：FastAPI + Python 3.11 + SQLAlchemy + Alembic
- **データベース**：PostgreSQL 15
- **認証**：JWT + FastAPI Security + bcrypt
- **API設計**：RESTful API + OpenAPI (Swagger)
- **状態管理**：React 19 Context API + useReducer
- **ルーティング**：React Router DOM v6

### 5.2 プロジェクト構造
```
money-dairy-lovers/
├── frontend/
│   ├── src/
│   │   ├── components/          # 再利用可能コンポーネント
│   │   │   ├── common/          # 汎用コンポーネント
│   │   │   ├── forms/           # フォーム関連
│   │   │   ├── charts/          # グラフコンポーネント
│   │   │   └── love/            # Love-themed専用
│   │   ├── pages/              # ページコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── services/           # API呼び出し
│   │   ├── store/              # 状態管理
│   │   ├── types/              # TypeScript型定義
│   │   ├── styles/             # SCSS ファイル
│   │   │   ├── globals.scss    # グローバルスタイル
│   │   │   ├── variables.scss  # SCSS変数
│   │   │   └── components/     # コンポーネント別
│   │   ├── utils/              # ユーティリティ関数
│   │   ├── constants/          # 定数定義
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── icons/              # Love-themed アイコン
│   │   └── images/             # 画像ファイル
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── api/                # APIルート
│   │   │   ├── auth/           # 認証関連
│   │   │   ├── transactions/   # 取引関連
│   │   │   ├── categories/     # カテゴリ関連
│   │   │   ├── partnerships/   # パートナーシップ
│   │   │   ├── budgets/        # 予算管理
│   │   │   ├── reports/        # レポート
│   │   │   └── love/           # Love機能
│   │   ├── core/               # 設定・セキュリティ
│   │   │   ├── config.py       # 設定管理
│   │   │   ├── database.py     # DB接続
│   │   │   ├── security.py     # セキュリティ
│   │   │   └── deps.py         # 依存関係
│   │   ├── db/                 # データベース関連
│   │   │   ├── base.py         # ベースクラス
│   │   │   └── session.py      # セッション管理
│   │   ├── models/             # SQLAlchemyモデル
│   │   ├── schemas/            # Pydanticスキーマ
│   │   ├── services/           # ビジネスロジック
│   │   ├── utils/              # ユーティリティ
│   │   └── main.py             # FastAPIアプリケーション
│   ├── alembic/                # データベースマイグレーション
│   ├── tests/
│   │   ├── conftest.py         # テスト設定
│   │   ├── test_auth.py        # 認証テスト
│   │   ├── test_transactions.py # 取引テスト
│   │   └── test_love.py        # Love機能テスト
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/workflows/
│   ├── ci.yml                  # CI/CD
│   └── deploy.yml              # デプロイ
├── infrastructure/
│   ├── terraform/              # AWS インフラ設定
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── scripts/                # デプロイスクリプト
├── docs/                       # 詳細設計書
│   ├── api.md                  # API仕様書
│   ├── database.md             # DB設計書
│   └── deployment.md           # デプロイ手順
├── .env.example
├── .gitignore
└── README.md
```

### 5.3 環境変数設定
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/money_dairy_lovers
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/money_dairy_lovers_test

# JWT Security
SECRET_KEY=your-secret-key-here-32-characters-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Email (for notifications)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS (Production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=ap-northeast-1
AWS_S3_BUCKET=money-dairy-lovers-assets

# Application
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development

# Redis (Caching)
REDIS_URL=redis://localhost:6379/0

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf

# Love Features
ENABLE_LOVE_ANALYTICS=true
DEFAULT_LOVE_CATEGORIES=デート代,プレゼント,記念日
```

### 5.4 Docker設定詳細

#### 5.4.1 開発環境 (docker-compose.yml)
```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_ENVIRONMENT=development
    depends_on:
      - backend
    
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
      target: development
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/money_dairy_lovers
      - REDIS_URL=redis://redis:6379/0
      - ENVIRONMENT=development
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=money_dairy_lovers
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

#### 5.4.2 本番環境 (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    environment:
      - VITE_API_URL=${BACKEND_URL}
      - VITE_ENVIRONMENT=production
    restart: unless-stopped
    
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    restart: unless-stopped
    depends_on:
      - redis
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### 5.5 コード品質・テスト設定

#### 5.5.1 Frontend設定 (package.json)
```json
{
  "name": "money-dairy-lovers-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,scss}",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "react-query": "^3.39.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "sass": "^1.69.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0"
  }
}
```

#### 5.5.2 Backend設定 (pyproject.toml)
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "money-dairy-lovers-backend"
version = "0.1.0"
description = "Money Dairy Lovers Backend API"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.13.0",
    "psycopg2-binary>=2.9.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.0",
    "python-multipart>=0.0.6",
    "redis>=5.0.0",
    "celery>=5.3.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.25.0",
    "black>=23.0.0",
    "isort>=5.12.0",
    "mypy>=1.7.0",
    "pre-commit>=3.5.0",
]

[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
skip-string-normalization = true

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
known_first_party = ["app"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_redundant_casts = true
warn_unused_ignores = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_reexport = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = [
    "--cov=app",
    "--cov-report=html",
    "--cov-report=term-missing",
    "--cov-fail-under=80"
]
asyncio_mode = "auto"
```

### 5.6 開発ツール・設定

#### 5.6.1 TypeScript設定 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 5.6.2 Vite設定 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```
# Money Dairy Lovers - 要件定義書 Part 3（データベース・API設計）

## 6. データベース設計詳細

### 6.1 テーブル設計

#### 6.1.1 Users テーブル
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    love_theme_preference VARCHAR(50) DEFAULT 'default',
    notification_settings JSONB DEFAULT '{"email": true, "push": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active);
```

#### 6.1.2 Partnerships テーブル
```sql
CREATE TABLE partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive
    invitation_code VARCHAR(10) UNIQUE,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    love_anniversary DATE, -- 付き合った記念日
    relationship_type VARCHAR(50) DEFAULT 'dating', -- dating, engaged, married
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_partnership UNIQUE(user1_id, user2_id),
    CONSTRAINT different_users CHECK(user1_id != user2_id)
);

-- インデックス
CREATE INDEX idx_partnerships_user1 ON partnerships(user1_id);
CREATE INDEX idx_partnerships_user2 ON partnerships(user2_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_partnerships_invitation_code ON partnerships(invitation_code);
```

#### 6.1.3 Categories テーブル
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50), -- 絵文字アイコン
    color VARCHAR(7), -- HEX color code
    is_default BOOLEAN DEFAULT FALSE,
    is_love_category BOOLEAN DEFAULT FALSE, -- Love特別カテゴリ
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for default categories
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_is_default ON categories(is_default);
CREATE INDEX idx_categories_is_love ON categories(is_love_category);

-- デフォルトカテゴリ挿入
INSERT INTO categories (name, icon, color, is_default, is_love_category, sort_order) VALUES
('食費', '🍽️', '#FF6B6B', true, false, 1),
('交通費', '🚗', '#4ECDC4', true, false, 2),
('住居費', '🏠', '#45B7D1', true, false, 3),
('娯楽費', '🎬', '#96CEB4', true, false, 4),
('日用品', '👕', '#FFEAA7', true, false, 5),
('医療費', '🏥', '#DDA0DD', true, false, 6),
('デート代', '💕', '#FF69B4', true, true, 7),
('プレゼント', '🎁', '#FF1493', true, true, 8),
('記念日', '🎉', '#FF6347', true, true, 9),
('その他', '📚', '#95A5A6', true, false, 10);
```

#### 6.1.4 Transactions テーブル
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL, -- income, expense
    sharing_type VARCHAR(10) NOT NULL, -- personal, shared
    payment_method VARCHAR(20), -- cash, credit_card, bank_transfer, digital_wallet
    description TEXT,
    transaction_date DATE NOT NULL,
    receipt_image_url VARCHAR(500),
    love_rating INTEGER CHECK (love_rating >= 1 AND love_rating <= 5), -- Love度評価
    tags TEXT[], -- タグ配列
    location VARCHAR(200), -- 場所情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_amount CHECK(amount > 0)
);

-- インデックス
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type, sharing_type);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

#### 6.1.5 Shared_Transactions テーブル
```sql
CREATE TABLE shared_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    payer_user_id UUID NOT NULL REFERENCES users(id),
    split_type VARCHAR(20) DEFAULT 'equal', -- equal, amount, percentage
    user1_amount DECIMAL(12, 2),
    user2_amount DECIMAL(12, 2),
    notes TEXT, -- 分割に関するメモ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shared_transactions_transaction ON shared_transactions(transaction_id);
CREATE INDEX idx_shared_transactions_partnership ON shared_transactions(partnership_id);
CREATE INDEX idx_shared_transactions_payer ON shared_transactions(payer_user_id);
```

#### 6.1.6 Budgets テーブル
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE, -- 共有予算の場合
    category_id UUID REFERENCES categories(id), -- NULL for overall budget
    name VARCHAR(200) NOT NULL, -- 予算名
    amount DECIMAL(12, 2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly, custom
    start_date DATE NOT NULL,
    end_date DATE,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.0, -- アラート閾値（%）
    is_active BOOLEAN DEFAULT TRUE,
    is_love_budget BOOLEAN DEFAULT FALSE, -- Love予算フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_budget_amount CHECK(amount > 0),
    CONSTRAINT valid_alert_threshold CHECK(alert_threshold >= 0 AND alert_threshold <= 100)
);

-- インデックス
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_partnership_id ON budgets(partnership_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_active ON budgets(is_active);
```

#### 6.1.7 Recurring_Transactions テーブル
```sql
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL, -- income, expense
    sharing_type VARCHAR(10) NOT NULL, -- personal, shared
    payment_method VARCHAR(20),
    description TEXT,
    frequency VARCHAR(20) NOT NULL, -- monthly, weekly, yearly, custom
    interval_value INTEGER DEFAULT 1, -- 間隔（例：2ヶ月ごとなら2）
    day_of_month INTEGER, -- 1-31 for monthly
    day_of_week INTEGER, -- 0-6 for weekly (0=Monday)
    next_execution_date DATE NOT NULL,
    last_execution_date DATE,
    end_date DATE, -- 終了日（オプション）
    execution_count INTEGER DEFAULT 0, -- 実行回数
    max_executions INTEGER, -- 最大実行回数（オプション）
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_recurring_amount CHECK(amount > 0)
);

-- インデックス
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_execution ON recurring_transactions(next_execution_date);
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active);
```

#### 6.1.8 Love_Events テーブル（Love機能用）
```sql
CREATE TABLE love_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- anniversary, birthday, valentine, custom
    name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    recurrence_type VARCHAR(20), -- yearly, monthly, custom
    description TEXT,
    reminder_days INTEGER DEFAULT 7, -- 何日前に通知するか
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_love_events_partnership ON love_events(partnership_id);
CREATE INDEX idx_love_events_date ON love_events(event_date);
CREATE INDEX idx_love_events_type ON love_events(event_type);
```

#### 6.1.9 Notifications テーブル
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- budget_warning, budget_exceeded, partner_transaction, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- 追加データ（JSON形式）
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    action_url VARCHAR(500), -- アクション先URL
    expires_at TIMESTAMP WITH TIME ZONE, -- 通知の有効期限
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

### 6.2 ビュー定義

#### 6.2.1 取引サマリービュー
```sql
CREATE VIEW transaction_summary AS
SELECT 
    u.id as user_id,
    u.display_name,
    DATE_TRUNC('month', t.transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN t.transaction_type = 'expense' AND t.sharing_type = 'personal' THEN t.amount ELSE 0 END) as personal_expense,
    SUM(CASE WHEN t.transaction_type = 'expense' AND t.sharing_type = 'shared' THEN t.amount ELSE 0 END) as shared_expense
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.display_name, DATE_TRUNC('month', t.transaction_date);
```

#### 6.2.2 Love統計ビュー
```sql
CREATE VIEW love_statistics AS
SELECT 
    p.id as partnership_id,
    COUNT(t.id) as love_transaction_count,
    SUM(t.amount) as total_love_spending,
    AVG(t.amount) as avg_love_spending,
    AVG(t.love_rating) as avg_love_rating,
    DATE_TRUNC('month', t.transaction_date) as month
FROM partnerships p
JOIN transactions t ON (t.user_id = p.user1_id OR t.user_id = p.user2_id)
JOIN categories c ON t.category_id = c.id
WHERE c.is_love_category = true
GROUP BY p.id, DATE_TRUNC('month', t.transaction_date);
```

### 6.3 制約・トリガー

#### 6.3.1 更新日時自動更新トリガー
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガー設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. API設計仕様

### 7.1 認証関連エンドポイント

#### POST /api/auth/register
```yaml
summary: ユーザー登録
tags: [Authentication]
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          email:
            type: string
            format: email
            example: "user@example.com"
          password:
            type: string
            minLength: 8
            example: "SecurePass123!"
          display_name:
            type: string
            maxLength: 100
            example: "田中太郎"
          love_theme_preference:
            type: string
            enum: [default, pink, blue, custom]
            default: default
responses:
  201:
    description: Registration successful
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Registration successful. Please verify your email."
            user_id:
              type: string
              format: uuid
  400:
    description: Validation error
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
```

#### POST /api/auth/login
```yaml
summary: ユーザーログイン
tags: [Authentication]
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          email:
            type: string
            format: email
          password:
            type: string
responses:
  200:
    description: Login successful
    content:
      application/json:
        schema:
          type: object
          properties:
            access_token:
              type: string
            refresh_token:
              type: string
            token_type:
              type: string
              example: "bearer"
            expires_in:
              type: integer
              example: 1800
            user:
              $ref: '#/components/schemas/UserResponse'
```

### 7.2 取引関連エンドポイント

#### GET /api/transactions
```yaml
summary: 取引一覧取得
tags: [Transactions]
security:
  - BearerAuth: []
parameters:
  - name: page
    in: query
    schema:
      type: integer
      default: 1
      minimum: 1
  - name: limit
    in: query
    schema:
      type: integer
      default: 20
      minimum: 1
      maximum: 100
  - name: category_id
    in: query
    schema:
      type: string
      format: uuid
  - name: transaction_type
    in: query
    schema:
      type: string
      enum: [income, expense]
  - name: sharing_type
    in: query
    schema:
      type: string
      enum: [personal, shared]
  - name: date_from
    in: query
    schema:
      type: string
      format: date
  - name: date_to
    in: query
    schema:
      type: string
      format: date
  - name: search
    in: query
    schema:
      type: string
      maxLength: 200
  - name: love_rating
    in: query
    schema:
      type: integer
      minimum: 1
      maximum: 5
responses:
  200:
    description: Transactions retrieved successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            transactions:
              type: array
              items:
                $ref: '#/components/schemas/TransactionResponse'
            pagination:
              $ref: '#/components/schemas/PaginationInfo'
```

#### POST /api/transactions
```yaml
summary: 取引作成
tags: [Transactions]
security:
  - BearerAuth: []
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/TransactionCreate'
    multipart/form-data:
      schema:
        allOf:
          - $ref: '#/components/schemas/TransactionCreate'
          - type: object
            properties:
              receipt_image:
                type: string
                format: binary
responses:
  201:
    description: Transaction created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/TransactionResponse'
```

### 7.3 Love機能関連エンドポイント

#### GET /api/love/statistics
```yaml
summary: Love統計取得
tags: [Love Features]
security:
  - BearerAuth: []
parameters:
  - name: period
    in: query
    schema:
      type: string
      enum: [month, year, all]
      default: month
  - name: year
    in: query
    schema:
      type: integer
      example: 2025
  - name: month
    in: query
    schema:
      type: integer
      minimum: 1
      maximum: 12
responses:
  200:
    description: Love statistics retrieved successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            period:
              type: object
              properties:
                start_date:
                  type: string
                  format: date
                end_date:
                  type: string
                  format: date
                description:
                  type: string
            love_summary:
              type: object
              properties:
                total_love_spending:
                  type: number
                  format: decimal
                love_transaction_count:
                  type: integer
                avg_love_rating:
                  type: number
                  format: decimal
                favorite_love_category:
                  type: string
            love_categories:
              type: array
              items:
                type: object
                properties:
                  category:
                    $ref: '#/components/schemas/CategoryResponse'
                  amount:
                    type: number
                    format: decimal
                  percentage:
                    type: number
                    format: decimal
                  avg_rating:
                    type: number
                    format: decimal
            love_timeline:
              type: array
              items:
                type: object
                properties:
                  date:
                    type: string
                    format: date
                  amount:
                    type: number
                    format: decimal
                  rating:
                    type: number
                    format: decimal
```

#### POST /api/love/events
```yaml
summary: Love イベント作成
tags: [Love Features]
security:
  - BearerAuth: []
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          event_type:
            type: string
            enum: [anniversary, birthday, valentine, christmas, custom]
          name:
            type: string
            maxLength: 200
          event_date:
            type: string
            format: date
          is_recurring:
            type: boolean
            default: true
          recurrence_type:
            type: string
            enum: [yearly, monthly, custom]
          description:
            type: string
          reminder_days:
            type: integer
            default: 7
responses:
  201:
    description: Love event created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/LoveEventResponse'
```

### 7.4 スキーマ定義

#### User関連スキーマ
```yaml
components:
  schemas:
    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        display_name:
          type: string
        profile_image_url:
          type: string
          nullable: true
        love_theme_preference:
          type: string
        has_partner:
          type: boolean
        partnership:
          $ref: '#/components/schemas/PartnershipResponse'
          nullable: true
        created_at:
          type: string
          format: date-time

    PartnershipResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        partner:
          type: object
          properties:
            id:
              type: string
              format: uuid
            display_name:
              type: string
            profile_image_url:
              type: string
              nullable: true
        status:
          type: string
          enum: [pending, active, inactive]
        love_anniversary:
          type: string
          format: date
          nullable: true
        relationship_type:
          type: string
        created_at:
          type: string
          format: date-time
        activated_at:
          type: string
          format: date-time
          nullable: true
```

#### Transaction関連スキーマ
```yaml
    TransactionCreate:
      type: object
      required:
        - amount
        - transaction_type
        - sharing_type
        - transaction_date
        - category_id
      properties:
        amount:
          type: number
          format: decimal
          minimum: 0.01
        transaction_type:
          type: string
          enum: [income, expense]
        sharing_type:
          type: string
          enum: [personal, shared]
        payment_method:
          type: string
          enum: [cash, credit_card, bank_transfer, digital_wallet]
        description:
          type: string
          maxLength: 200
        transaction_date:
          type: string
          format: date
        category_id:
          type: string
          format: uuid
        love_rating:
          type: integer
          minimum: 1
          maximum: 5
          nullable: true
        tags:
          type: array
          items:
            type: string
          maxItems: 10
        location:
          type: string
          maxLength: 200
        shared_info:
          type: object
          nullable: true
          properties:
            split_type:
              type: string
              enum: [equal, amount, percentage]
              default: equal
            user1_amount:
              type: number
              format: decimal
              nullable: true
            user2_amount:
              type: number
              format: decimal
              nullable: true
            notes:
              type: string
              maxLength: 500

    TransactionResponse:
      allOf:
        - $ref: '#/components/schemas/TransactionCreate'
        - type: object
          properties:
            id:
              type: string
              format: uuid
            user_id:
              type: string
              format: uuid
            category:
              $ref: '#/components/schemas/CategoryResponse'
            receipt_image_url:
              type: string
              nullable: true
            shared_info:
              type: object
              nullable: true
              properties:
                split_type:
                  type: string
                user1_amount:
                  type: number
                  format: decimal
                user2_amount:
                  type: number
                  format: decimal
                payer:
                  type: object
                  properties:
                    id:
                      type: string
                      format: uuid
                    display_name:
                      type: string
                notes:
                  type: string
            created_at:
              type: string
              format: date-time
            updated_at:
              type: string
              format: date-time

    CategoryResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        icon:
          type: string
        color:
          type: string
        is_default:
          type: boolean
        is_love_category:
          type: boolean
        transaction_count:
          type: integer
        total_amount:
          type: number
          format: decimal
        created_at:
          type: string
          format: date-time

    PaginationInfo:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        total_pages:
          type: integer
        has_next:
          type: boolean
        has_prev:
          type: boolean
```

### 7.5 エラーハンドリング

#### 標準エラーレスポンス
```yaml
    ErrorResponse:
      type: object
      properties:
        detail:
          oneOf:
            - type: string
            - type: array
              items:
                type: object
                properties:
                  type:
                    type: string
                  loc:
                    type: array
                    items:
                      oneOf:
                        - type: string
                        - type: integer
                  msg:
                    type: string
                  input:
                    type: object
        error_code:
          type: string
        timestamp:
          type: string
          format: date-time
        request_id:
          type: string
          format: uuid

    ValidationErrorResponse:
      type: object
      properties:
        detail:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string
              code:
                type: string
        error_code:
          type: string
          example: "VALIDATION_ERROR"
```

#### HTTPステータスコード一覧
```yaml
responses:
  400:
    description: Bad Request - リクエストが不正
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ValidationErrorResponse'
  401:
    description: Unauthorized - 認証が必要
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Could not validate credentials"
            error_code:
              type: string
              example: "UNAUTHORIZED"
  403:
    description: Forbidden - 権限不足
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Not enough permissions"
            error_code:
              type: string
              example: "FORBIDDEN"
  404:
    description: Not Found - リソースが見つからない
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Transaction not found"
            error_code:
              type: string
              example: "RESOURCE_NOT_FOUND"
  409:
    description: Conflict - データの競合
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Email already registered"
            error_code:
              type: string
              example: "CONFLICT"
  422:
    description: Unprocessable Entity - バリデーションエラー
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ValidationErrorResponse'
  429:
    description: Too Many Requests - レート制限
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Rate limit exceeded"
            error_code:
              type: string
              example: "RATE_LIMIT_EXCEEDED"
            retry_after:
              type: integer
              example: 60
  500:
    description: Internal Server Error - サーバーエラー
    content:
      application/json:
        schema:
          type: object
          properties:
            detail:
              type: string
              example: "Internal server error"
            error_code:
              type: string
              example: "INTERNAL_ERROR"
            request_id:
              type: string
              format: uuid
```

### 7.6 API レート制限・セキュリティ

#### レート制限設定
```yaml
rate_limits:
  authentication:
    login: "10/minute per IP"
    register: "5/minute per IP"
    refresh: "20/minute per user"
  
  general_api:
    default: "100/minute per user"
    list_endpoints: "50/minute per user"
    create_endpoints: "30/minute per user"
    upload_endpoints: "10/minute per user"
  
  love_features:
    love_statistics: "20/minute per user"
    love_events: "10/minute per user"
  
  reporting:
    generate_report: "5/minute per user"
    export_data: "3/minute per user"
```

#### セキュリティヘッダー
```yaml
security_headers:
  response_headers:
    X-Content-Type-Options: "nosniff"
    X-Frame-Options: "DENY"
    X-XSS-Protection: "1; mode=block"
    Strict-Transport-Security: "max-age=31536000; includeSubDomains"
    Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    X-Rate-Limit-Remaining: "95"
    X-Rate-Limit-Reset: "1625097600"
    X-Request-ID: "uuid-here"
  
  cors_settings:
    allowed_origins:
      - "http://localhost:3000"
      - "https://money-dairy-lovers.com"
    allowed_methods:
      - "GET"
      - "POST"
      - "PUT"
      - "DELETE"
      - "OPTIONS"
    allowed_headers:
      - "Authorization"
      - "Content-Type"
      - "X-Request-ID"
    expose_headers:
      - "X-Rate-Limit-Remaining"
      - "X-Rate-Limit-Reset"
    allow_credentials: true
    max_age: 3600
```

### 7.7 API バージョニング戦略

#### バージョン管理方針
```yaml
versioning:
  strategy: "URL Path Versioning"
  format: "/api/v{version}/"
  current_version: "v1"
  
  version_lifecycle:
    v1:
      status: "current"
      introduced: "2025-06-01"
      deprecation_notice: null
      end_of_life: null
    
  deprecation_policy:
    notice_period: "6 months"
    support_period: "12 months"
    migration_guide: "https://docs.money-dairy-lovers.com/migration"
  
  backward_compatibility:
    breaking_changes:
      - "Schema changes in response format"
      - "Authentication method changes"
      - "Endpoint URL changes"
    non_breaking_changes:
      - "Adding new optional fields"
      - "Adding new endpoints"
      - "Performance improvements"
```

### 7.8 API ドキュメント生成

#### OpenAPI設定
```yaml
openapi: 3.0.3
info:
  title: Money Dairy Lovers API
  description: |
    カップル向け家計簿アプリ「Money Dairy Lovers」のREST API
    
    ## 認証
    すべての認証が必要なエンドポイントでは、Bearer tokenを使用してください。
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    
    ## レート制限
    APIには利用制限があります。レスポンスヘッダーで残り回数を確認できます。
    
    ## エラーハンドリング
    すべてのエラーレスポンスは統一された形式で返されます。
    
    ## Love機能
    このAPIには、カップル向けの特別な機能が含まれています：
    - Love統計・分析
    - 記念日管理
    - 共有支出管理
    - デート予算管理
    
  version: "1.0.0"
  contact:
    name: Money Dairy Lovers Support
    email: support@money-dairy-lovers.com
    url: https://money-dairy-lovers.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:8000/api/v1
    description: Development server
  - url: https://api.money-dairy-lovers.com/v1
    description: Production server

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT Bearer token authentication.
        
        Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
```

### 7.9 API テスト仕様

#### テストカテゴリ
```yaml
test_categories:
  unit_tests:
    - "Individual endpoint logic"
    - "Request/response validation"
    - "Business logic validation"
    - "Database operations"
  
  integration_tests:
    - "End-to-end API workflows"
    - "Authentication flows"
    - "Love feature workflows"
    - "Partnership interactions"
  
  performance_tests:
    - "Response time measurements"
    - "Load testing (100 concurrent users)"
    - "Database query performance"
    - "Rate limiting behavior"
  
  security_tests:
    - "Authentication bypass attempts"
    - "SQL injection testing"
    - "XSS vulnerability testing"
    - "CORS policy validation"
  
  love_feature_tests:
    - "Love statistics calculation"
    - "Couple data sharing"
    - "Love event notifications"
    - "Anniversary reminders"
```

#### テストデータ
```yaml
test_data:
  test_users:
    couple1:
      user1:
        email: "taro@example.com"
        display_name: "太郎"
        love_theme_preference: "pink"
      user2:
        email: "hanako@example.com"
        display_name: "花子"
        love_theme_preference: "blue"
      partnership:
        relationship_type: "dating"
        love_anniversary: "2024-02-14"
  
  test_transactions:
    love_transactions:
      - amount: 5000
        category: "デート代"
        description: "映画デート"
        love_rating: 5
        sharing_type: "shared"
      - amount: 3000
        category: "プレゼント"
        description: "誕生日プレゼント"
        love_rating: 5
        sharing_type: "personal"
  
  test_categories:
    default_categories:
      - name: "食費"
        icon: "🍽️"
        color: "#FF6B6B"
        is_love_category: false
      - name: "デート代"
        icon: "💕"
        color: "#FF69B4"
        is_love_category: true
```

## 8. データベース最適化・運用

### 8.1 パフォーマンス最適化

#### インデックス戦略
```sql
-- 複合インデックス（クエリパフォーマンス向上）
CREATE INDEX idx_transactions_user_date_type ON transactions(user_id, transaction_date DESC, transaction_type);
CREATE INDEX idx_transactions_category_date ON transactions(category_id, transaction_date DESC);
CREATE INDEX idx_shared_transactions_partnership_date ON shared_transactions(partnership_id, created_at DESC);

-- 部分インデックス（アクティブデータのみ）
CREATE INDEX idx_transactions_active_user ON transactions(user_id, transaction_date DESC) 
WHERE transaction_date >= CURRENT_DATE - INTERVAL '2 years';

CREATE INDEX idx_budgets_active ON budgets(user_id, category_id, start_date, end_date) 
WHERE is_active = true;

-- Love機能専用インデックス
CREATE INDEX idx_love_transactions ON transactions(user_id, category_id, transaction_date DESC, love_rating)
WHERE love_rating IS NOT NULL;

-- 全文検索インデックス
CREATE INDEX idx_transactions_search ON transactions USING gin(to_tsvector('japanese', description));
```

#### クエリ最適化
```sql
-- よく使用されるクエリの最適化

-- 1. 月次サマリー取得（最適化版）
CREATE OR REPLACE FUNCTION get_monthly_summary(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS TABLE (
    total_income DECIMAL,
    total_expense DECIMAL,
    personal_expense DECIMAL,
    shared_expense DECIMAL,
    transaction_count INTEGER
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' AND t.sharing_type = 'personal' THEN t.amount ELSE 0 END), 0) as personal_expense,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' AND t.sharing_type = 'shared' THEN t.amount ELSE 0 END), 0) as shared_expense,
        COUNT(*)::INTEGER as transaction_count
    FROM transactions t
    WHERE t.user_id = p_user_id 
        AND EXTRACT(YEAR FROM t.transaction_date) = p_year
        AND EXTRACT(MONTH FROM t.transaction_date) = p_month;
END;
$ LANGUAGE plpgsql;

-- 2. カテゴリ別支出集計（最適化版）
CREATE OR REPLACE FUNCTION get_category_summary(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    category_icon VARCHAR,
    category_color VARCHAR,
    total_amount DECIMAL,
    transaction_count INTEGER,
    percentage DECIMAL
) AS $
DECLARE
    total_expense DECIMAL;
BEGIN
    -- 全体支出額を取得
    SELECT COALESCE(SUM(amount), 0) INTO total_expense
    FROM transactions 
    WHERE user_id = p_user_id 
        AND transaction_type = 'expense'
        AND transaction_date BETWEEN p_start_date AND p_end_date;
    
    RETURN QUERY
    SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id)::INTEGER as transaction_count,
        CASE 
            WHEN total_expense > 0 THEN (COALESCE(SUM(t.amount), 0) / total_expense * 100)
            ELSE 0
        END as percentage
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id 
        AND t.user_id = p_user_id 
        AND t.transaction_type = 'expense'
        AND t.transaction_date BETWEEN p_start_date AND p_end_date
    WHERE c.is_default = true OR c.user_id = p_user_id
    GROUP BY c.id, c.name, c.icon, c.color
    HAVING COUNT(t.id) > 0 OR c.is_default = true
    ORDER BY total_amount DESC;
END;
$ LANGUAGE plpgsql;
```

### 8.2 データベース監視・メンテナンス

#### 監視項目
```sql
-- 実行時間の長いクエリ監視
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- インデックス使用率監視
SELECT 
    indexrelname,
    relname,
    100 * idx_scan / (seq_scan + idx_scan) AS percent_of_times_index_used,
    n_tup_ins + n_tup_upd + n_tup_del AS num_writes,
    indexrelname AS index_name
FROM pg_stat_user_indexes 
ORDER BY percent_of_times_index_used ASC;

-- テーブルサイズ監視
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

#### 定期メンテナンス
```sql
-- 統計情報更新（日次実行）
ANALYZE;

-- インデックス再構築（週次実行）
REINDEX DATABASE money_dairy_lovers;

-- 不要データクリーンアップ（月次実行）
DELETE FROM notifications 
WHERE expires_at < NOW() - INTERVAL '30 days';

DELETE FROM partnerships 
WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '7 days';

-- VACUUM実行（週次実行）
VACUUM ANALYZE;
```

### 8.3 バックアップ・復旧戦略

#### バックアップ設定
```bash
#!/bin/bash
# daily_backup.sh

# 設定
DB_NAME="money_dairy_lovers"
DB_USER="postgres"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# フルバックアップ
pg_dump -U $DB_USER -h localhost -d $DB_NAME -F c -b -v -f $BACKUP_DIR/full_backup_$DATE.dump

# 増分バックアップ（WALファイル）
pg_receivewal -U $DB_USER -h localhost -D $BACKUP_DIR/wal/ --synchronous

# 古いバックアップ削除
find $BACKUP_DIR -name "full_backup_*.dump" -mtime +$RETENTION_DAYS -delete

# バックアップ完了通知
echo "Backup completed: full_backup_$DATE.dump" | mail -s "DB Backup Status" admin@money-dairy-lovers.com
```

#### 復旧手順
```bash
#!/bin/bash
# restore_database.sh

# 引数チェック
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="money_dairy_lovers"
DB_USER="postgres"

# データベース停止
sudo systemctl stop money-dairy-lovers-backend

# データベース復旧
dropdb -U $DB_USER $DB_NAME
createdb -U $DB_USER $DB_NAME
pg_restore -U $DB_USER -d $DB_NAME -v $BACKUP_FILE

# サービス再開
sudo systemctl start money-dairy-lovers-backend

echo "Database restoration completed"
```

# Money Dairy Lovers - 要件定義書 Part 4（UI/UX設計詳細）

## 9. UI/UX設計詳細

### 9.1 デザインシステム

#### 9.1.1 Love-themed カラーパレット
```scss
// === Primary Colors (温かみのあるピンク系) ===
$primary-50: #fdf2f8;   // 最も薄いピンク
$primary-100: #fce7f3;  // 薄いピンク
$primary-200: #fbcfe8;  // ライトピンク
$primary-300: #f9a8d4;  // ソフトピンク
$primary-400: #f472b6;  // ミディアムピンク
$primary-500: #ec4899;  // メインピンク（愛の色）
$primary-600: #db2777;  // ディープピンク
$primary-700: #be185d;  // ダークピンク
$primary-800: #9d174d;  // 濃いピンク
$primary-900: #831843;  // 最も濃いピンク

// === Secondary Colors (優しいブルー系) ===
$secondary-50: #eff6ff;   // 最も薄いブルー
$secondary-100: #dbeafe;  // 薄いブルー
$secondary-200: #bfdbfe;  // ライトブルー
$secondary-300: #93c5fd;  // ソフトブルー
$secondary-400: #60a5fa;  // ミディアムブルー
$secondary-500: #3b82f6;  // メインブルー（信頼の色）
$secondary-600: #2563eb;  // ディープブルー
$secondary-700: #1d4ed8;  // ダークブルー
$secondary-800: #1e40af;  // 濃いブルー
$secondary-900: #1e3a8a;  // 最も濃いブルー

// === Love Accent Colors ===
$love-red: #ff6b9d;      // 愛のレッド
$love-purple: #c44569;   // 愛のパープル
$love-gold: #f9ca24;     // 特別な日のゴールド
$love-rose: #ff9ff3;     // ローズピンク

// === Semantic Colors ===
$success: #10b981;       // 成功・達成
$warning: #f59e0b;       // 注意・警告
$error: #ef4444;         // エラー・危険
$info: #06b6d4;          // 情報

// === Neutral Colors ===
$gray-50: #f9fafb;       // 背景色
$gray-100: #f3f4f6;      // 薄いグレー
$gray-200: #e5e7eb;      // ライトグレー
$gray-300: #d1d5db;      // ボーダー色
$gray-400: #9ca3af;      // プレースホルダー
$gray-500: #6b7280;      // 補助テキスト
$gray-600: #4b5563;      // サブテキスト
$gray-700: #374151;      // メインテキスト
$gray-800: #1f2937;      // ダークテキスト
$gray-900: #111827;      // 最も濃いテキスト

// === Love Gradients ===
$gradient-love: linear-gradient(135deg, $primary-400, $primary-600);
$gradient-couple: linear-gradient(135deg, $primary-300, $secondary-300);
$gradient-success: linear-gradient(135deg, $success, #16a085);
$gradient-special: linear-gradient(135deg, $love-gold, #f39c12);
```

#### 9.1.2 Typography（愛らしいフォント設定）
```scss
// === Font Families ===
$font-primary: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
$font-heading: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', sans-serif;
$font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
$font-love: 'Comic Sans MS', 'Marker Felt', cursive; // Love専用フォント

// === Font Sizes ===
$text-xs: 0.75rem;      // 12px - 小さな注釈
$text-sm: 0.875rem;     // 14px - サブテキスト
$text-base: 1rem;       // 16px - 基本テキスト
$text-lg: 1.125rem;     // 18px - 強調テキスト
$text-xl: 1.25rem;      // 20px - 小見出し
$text-2xl: 1.5rem;      // 24px - 見出し
$text-3xl: 1.875rem;    // 30px - 大見出し
$text-4xl: 2.25rem;     // 36px - タイトル
$text-5xl: 3rem;        // 48px - ヒーロータイトル

// === Font Weights ===
$font-light: 300;       // ライト
$font-normal: 400;      // ノーマル
$font-medium: 500;      // ミディアム
$font-semibold: 600;    // セミボールド
$font-bold: 700;        // ボールド
$font-extrabold: 800;   // エクストラボールド

// === Line Heights ===
$leading-none: 1;       // タイトル用
$leading-tight: 1.25;   // 見出し用
$leading-snug: 1.375;   // ボタン用
$leading-normal: 1.5;   // 本文用
$leading-relaxed: 1.625; // 長文用
$leading-loose: 2;      // 余裕のある行間

// === Love Typography Classes ===
.love-text {
  font-family: $font-love;
  color: $primary-500;
  text-shadow: 0 1px 2px rgba($primary-500, 0.3);
}

.couple-heading {
  background: $gradient-couple;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: $font-bold;
}
```

#### 9.1.3 Love-themed スペーシングシステム
```scss
// === Spacing Scale ===
$spacing-px: 1px;       // 1px - 細い線
$spacing-0: 0;          // 0px - リセット
$spacing-1: 0.25rem;    // 4px - 極小
$spacing-2: 0.5rem;     // 8px - 小
$spacing-3: 0.75rem;    // 12px - 中小
$spacing-4: 1rem;       // 16px - 中
$spacing-5: 1.25rem;    // 20px - 中大
$spacing-6: 1.5rem;     // 24px - 大
$spacing-7: 1.75rem;    // 28px - 大きめ
$spacing-8: 2rem;       // 32px - 特大
$spacing-10: 2.5rem;    // 40px - 超大
$spacing-12: 3rem;      // 48px - 巨大
$spacing-16: 4rem;      // 64px - セクション間
$spacing-20: 5rem;      // 80px - ページ間
$spacing-24: 6rem;      // 96px - 特別な間隔

// === Love Spacing (特別な間隔) ===
$love-spacing-heart: 1.4rem;    // ハート型の間隔
$love-spacing-couple: 2.8rem;   // カップル間の間隔
$love-spacing-special: 3.5rem;  // 特別な日の間隔
```

#### 9.1.4 Border Radius（愛らしい角丸）
```scss
// === Border Radius ===
$radius-none: 0;           // 角丸なし
$radius-sm: 0.125rem;      // 2px - 微小
$radius-default: 0.25rem;  // 4px - 標準
$radius-md: 0.375rem;      // 6px - 中
$radius-lg: 0.5rem;        // 8px - 大
$radius-xl: 0.75rem;       // 12px - 特大
$radius-2xl: 1rem;         // 16px - 超大
$radius-3xl: 1.5rem;       // 24px - 巨大
$radius-full: 9999px;      // 完全な円

// === Love Radius (特別な角丸) ===
$radius-love: 1.25rem;     // Love要素専用
$radius-heart: 50%;        // ハート型ベース
$radius-couple: 2rem;      // カップル要素用
```

#### 9.1.5 Shadow System（愛らしい影）
```scss
// === Standard Shadows ===
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

// === Love Shadows ===
$shadow-love: 0 4px 14px 0 rgba($primary-500, 0.39);
$shadow-love-hover: 0 6px 20px 0 rgba($primary-500, 0.5);
$shadow-couple: 0 8px 25px -8px rgba($primary-300, 0.6);
$shadow-heart: 0 4px 12px 0 rgba($love-red, 0.4);
$shadow-special: 0 6px 20px 0 rgba($love-gold, 0.5);

// === Inner Shadows ===
$shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
$shadow-inner-love: inset 0 2px 4px 0 rgba($primary-500, 0.1);
```

### 9.2 Love-themed コンポーネント設計

#### 9.2.1 Button Components
```scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-3 $spacing-6;
  border-radius: $radius-love;
  font-weight: $font-medium;
  font-size: $text-base;
  line-height: $leading-tight;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;
  
  // Disabled state
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  // Love ripple effect
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.6s, height 0.6s, top 0.6s, left 0.6s;
    transform: translate(-50%, -50%);
  }
  
  &:active::before {
    width: 300px;
    height: 300px;
  }
  
  // Variants
  &--primary {
    background: $gradient-love;
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: $shadow-love-hover;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
  
  &--secondary {
    background: $gradient-couple;
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: $shadow-couple;
    }
  }
  
  &--outline-love {
    background: transparent;
    border: 2px solid $primary-500;
    color: $primary-500;
    
    &:hover:not(:disabled) {
      background: $primary-50;
      border-color: $primary-600;
      transform: translateY(-1px);
    }
  }
  
  &--ghost {
    background: transparent;
    color: $gray-700;
    
    &:hover:not(:disabled) {
      background: $gray-100;
      color: $gray-900;
    }
  }
  
  &--love-special {
    background: $gradient-special;
    color: white;
    font-family: $font-love;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.05);
      box-shadow: $shadow-special;
    }
  }
  
  // Sizes
  &--sm {
    padding: $spacing-2 $spacing-4;
    font-size: $text-sm;
    border-radius: $radius-md;
  }
  
  &--lg {
    padding: $spacing-4 $spacing-8;
    font-size: $text-lg;
    border-radius: $radius-xl;
  }
  
  &--xl {
    padding: $spacing-5 $spacing-10;
    font-size: $text-xl;
    border-radius: $radius-2xl;
  }
  
  // Love animations
  &--heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }
  
  &--love-glow {
    box-shadow: 0 0 20px rgba($primary-500, 0.6);
    animation: love-glow 2s ease-in-out infinite alternate;
  }
}

// Heart button (special love button)
.btn-heart {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: $gradient-love;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: $shadow-heart;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::before {
    content: '💕';
    position: absolute;
    font-size: 1.2rem;
  }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes love-glow {
  0% { box-shadow: 0 0 20px rgba($primary-500, 0.6); }
  100% { box-shadow: 0 0 30px rgba($primary-500, 0.8); }
}
```

#### 9.2.2 Input Components
```scss
.input-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  margin-bottom: $spacing-4;
  
  .label {
    font-size: $text-sm;
    font-weight: $font-medium;
    color: $gray-700;
    margin-bottom: $spacing-1;
    
    &--required::after {
      content: " *";
      color: $error;
    }
    
    &--love {
      color: $primary-600;
      font-weight: $font-semibold;
      
      &::before {
        content: "💕 ";
        margin-right: $spacing-1;
      }
    }
  }
  
  .input {
    display: block;
    width: 100%;
    padding: $spacing-3 $spacing-4;
    border: 2px solid $gray-200;
    border-radius: $radius-love;
    font-size: $text-base;
    line-height: $leading-normal;
    background-color: white;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: $primary-500;
      box-shadow: 0 0 0 3px rgba($primary-500, 0.1);
      background: $primary-50;
    }
    
    &--error {
      border-color: $error;
      background: #fef2f2;
      
      &:focus {
        border-color: $error;
        box-shadow: 0 0 0 3px rgba($error, 0.1);
      }
    }
    
    &--success {
      border-color: $success;
      background: #f0fdf4;
    }
    
    &--love {
      border-color: $primary-300;
      background: linear-gradient(135deg, white, $primary-50);
      
      &:focus {
        border-color: $primary-500;
        box-shadow: $shadow-love;
      }
    }
    
    &::placeholder {
      color: $gray-400;
      font-style: italic;
    }
  }
  
  // Input with icon
  .input-with-icon {
    position: relative;
    
    .input {
      padding-left: 3rem;
    }
    
    .input-icon {
      position: absolute;
      left: $spacing-3;
      top: 50%;
      transform: translateY(-50%);
      color: $gray-400;
      font-size: $text-lg;
      pointer-events: none;
      
      &--love {
        color: $primary-500;
      }
    }
  }
  
  // Amount input (special for money)
  .input-amount {
    font-family: $font-mono;
    font-size: $text-lg;
    font-weight: $font-semibold;
    text-align: right;
    padding-right: 3rem;
    
    &::before {
      content: "¥";
      position: absolute;
      right: $spacing-3;
      top: 50%;
      transform: translateY(-50%);
      color: $gray-500;
      font-weight: $font-normal;
    }
  }
  
  .help-text {
    font-size: $text-xs;
    color: $gray-500;
    
    &--love {
      color: $primary-600;
      
      &::before {
        content: "💡 ";
      }
    }
  }
  
  .error-message {
    font-size: $text-xs;
    color: $error;
    display: flex;
    align-items: center;
    gap: $spacing-1;
    
    &::before {
      content: "⚠️";
    }
  }
  
  .success-message {
    font-size: $text-xs;
    color: $success;
    display: flex;
    align-items: center;
    gap: $spacing-1;
    
    &::before {
      content: "✅";
    }
  }
}

// Love-themed select
.select-love {
  position: relative;
  
  select {
    appearance: none;
    background: linear-gradient(135deg, white, $primary-50);
    border: 2px solid $primary-300;
    border-radius: $radius-love;
    padding: $spacing-3 $spacing-4;
    padding-right: 3rem;
    width: 100%;
    font-size: $text-base;
    cursor: pointer;
    
    &:focus {
      border-color: $primary-500;
      box-shadow: $shadow-love;
      outline: none;
    }
  }
  
  &::after {
    content: "💕";
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
}
```

#### 9.2.3 Card Components
```scss
.card {
  background: white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &--love {
    background: linear-gradient(135deg, white, $primary-50);
    border: 1px solid $primary-200;
    
    &:hover {
      box-shadow: $shadow-love;
    }
  }
  
  &--couple {
    background: linear-gradient(135deg, $primary-50, $secondary-50);
    border: 1px solid $primary-200;
  }
  
  &--special {
    background: linear-gradient(135deg, white, #fef3c7);
    border: 2px solid $love-gold;
    
    &::before {
      content: "✨";
      position: absolute;
      top: $spacing-2;
      right: $spacing-2;
      font-size: $text-lg;
    }
  }
  
  .card-header {
    padding: $spacing-4 $spacing-6;
    border-bottom: 1px solid $gray-200;
    
    .card-title {
      margin: 0;
      font-size: $text-lg;
      font-weight: $font-semibold;
      color: $gray-900;
      
      &--love {
        color: $primary-600;
        font-family: $font-love;
      }
    }
    
    .card-subtitle {
      margin: $spacing-1 0 0 0;
      font-size: $text-sm;
      color: $gray-600;
    }
  }
  
  .card-content {
    padding: $spacing-6;
  }
  
  .card-footer {
    padding: $spacing-4 $spacing-6;
    background: $gray-50;
    border-top: 1px solid $gray-200;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// Transaction card (special design)
.transaction-card {
  @extend .card;
  margin-bottom: $spacing-3;
  
  .transaction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    
    .transaction-category {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      
      .category-icon {
        font-size: 1.5rem;
      }
      
      .category-name {
        font-weight: $font-medium;
        color: $gray-700;
      }
    }
    
    .transaction-amount {
      font-family: $font-mono;
      font-weight: $font-bold;
      font-size: $text-lg;
      
      &--income {
        color: $success;
        
        &::before {
          content: "+";
        }
      }
      
      &--expense {
        color: $error;
        
        &::before {
          content: "-";
        }
      }
      
      &--love {
        color: $primary-600;
        font-size: $text-xl;
        
        &::after {
          content: " 💕";
        }
      }
    }
  }
  
  .transaction-content {
    padding: 0 $spacing-4 $spacing-4;
    
    .transaction-description {
      color: $gray-600;
      font-size: $text-sm;
      margin-bottom: $spacing-2;
    }
    
    .transaction-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: $text-xs;
      color: $gray-500;
      
      .transaction-date {
        display: flex;
        align-items: center;
        gap: $spacing-1;
        
        &::before {
          content: "📅";
        }
      }
      
      .transaction-type {
        display: flex;
        align-items: center;
        gap: $spacing-1;
        
        &--shared::before {
          content: "👫";
        }
        
        &--personal::before {
          content: "👤";
        }
      }
    }
    
    .love-rating {
      display: flex;
      align-items: center;
      gap: $spacing-1;
      margin-top: $spacing-2;
      
      &::before {
        content: "Love度: ";
        font-size: $text-xs;
        color: $gray-500;
      }
      
      .star {
        color: $love-gold;
        
        &--empty {
          color: $gray-300;
        }
      }
    }
  }
}
```

### 9.3 Love-themed 画面設計

#### 9.3.1 Love Dashboard（愛のダッシュボード）
```scss
.love-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, $primary-50, $secondary-50);
  padding: $spacing-6;
  
  .love-header {
    text-align: center;
    margin-bottom: $spacing-8;
    
    .couple-greeting {
      font-size: $text-3xl;
      font-weight: $font-bold;
      background: $gradient-couple;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: $spacing-2;
      
      &::before {
        content: "💕 ";
      }
      
      &::after {
        content: " 💕";
      }
    }
    
    .love-subtitle {
      font-size: $text-lg;
      color: $gray-600;
      font-style: italic;
    }
    
    .anniversary-countdown {
      margin-top: $spacing-4;
      padding: $spacing-4;
      background: white;
      border-radius: $radius-love;
      box-shadow: $shadow-love;
      display: inline-block;
      
      .countdown-label {
        font-size: $text-sm;
        color: $gray-500;
      }
      
      .countdown-value {
        font-size: $text-2xl;
        font-weight: $font-bold;
        color: $primary-600;
        
        &::after {
          content: " 日 ❤️";
        }
      }
    }
  }
  
  .love-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-6;
    margin-bottom: $spacing-8;
    
    .summary-card {
      @extend .card--love;
      padding: $spacing-6;
      text-align: center;
      
      .summary-icon {
        font-size: 3rem;
        margin-bottom: $spacing-3;
      }
      
      .summary-title {
        font-size: $text-sm;
        color: $gray-600;
        margin-bottom: $spacing-2;
      }
      
      .summary-value {
        font-size: $text-2xl;
        font-weight: $font-bold;
        font-family: $font-mono;
        
        &--income {
          color: $success;
        }
        
        &--expense {
          color: $primary-600;
        }
        
        &--balance {
          color: $secondary-600;
        }
        
        &--love {
          color: $love-red;
        }
      }
      
      .summary-change {
        font-size: $text-xs;
        margin-top: $spacing-1;
        
        &--positive {
          color: $success;
          
          &::before {
            content: "↗️ +";
          }
        }
        
        &--negative {
          color: $error;
          
          &::before {
            content: "↘️ ";
          }
        }
      }
    }
  }
  
  .love-content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: $spacing-6;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
  
  .love-chart-section {
    .chart-card {
      @extend .card--love;
      padding: $spacing-6;
      
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-4;
        
        .chart-title {
          font-size: $text-lg;
          font-weight: $font-semibold;
          color: $gray-900;
          
          &::before {
            content: "📊 ";
          }
        }
        
        .chart-period {
          font-size: $text-sm;
          color: $gray-500;
        }
      }
      
      .chart-container {
        position: relative;
        height: 300px;
        
        canvas {
          border-radius: $radius-lg;
        }
      }
    }
  }
  
  .love-sidebar {
    .sidebar-section {
      margin-bottom: $spacing-6;
      
      .section-title {
        font-size: $text-lg;
        font-weight: $font-semibold;
        color: $gray-900;
        margin-bottom: $spacing-4;
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }
    }
    
    .recent-transactions {
      .section-title::before {
        content: "💰";
      }
      
      .transaction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-3;
        background: white;
        border-radius: $radius-lg;
        margin-bottom: $spacing-2;
        box-shadow: $shadow-sm;
        
        &--love {
          background: linear-gradient(135deg, $primary-50, white);
          border-left: 4px solid $primary-500;
        }
        
        .item-info {
          .item-category {
            font-weight: $font-medium;
            color: $gray-700;
            font-size: $text-sm;
          }
          
          .item-description {
            color: $gray-500;
            font-size: $text-xs;
          }
          
          .item-date {
            color: $gray-400;
            font-size: $text-xs;
          }
        }
        
        .item-amount {
          font-family: $font-mono;
          font-weight: $font-semibold;
          
          &--expense {
            color: $error;
          }
          
          &--income {
            color: $success;
          }
          
          &--love {
            color: $primary-600;
          }
        }
      }
    }
    
    .love-goals {
      .section-title::before {
        content: "🎯";
      }
      
      .goal-item {
        background: white;
        border-radius: $radius-lg;
        padding: $spacing-4;
        margin-bottom: $spacing-3;
        box-shadow: $shadow-sm;
        
        &--love {
          background: linear-gradient(135deg, white, $love-gold);
          border: 2px solid $love-gold;
        }
        
        .goal-name {
          font-weight: $font-medium;
          color: $gray-700;
          margin-bottom: $spacing-2;
        }
        
        .goal-progress {
          .progress-bar {
            width: 100%;
            height: 8px;
            background: $gray-200;
            border-radius: $radius-full;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background: $gradient-love;
              border-radius: $radius-full;
              transition: width 0.5s ease;
            }
          }
          
          .progress-text {
            display: flex;
            justify-content: space-between;
            margin-top: $spacing-1;
            font-size: $text-xs;
            color: $gray-500;
          }
        }
      }
    }
  }
}
```

#### 9.3.2 Love Transaction Form（愛の取引入力フォーム）
```scss
.love-transaction-form {
  background: linear-gradient(135deg, $primary-50, white);
  min-height: 100vh;
  padding: $spacing-6;
  
  .form-header {
    text-align: center;
    margin-bottom: $spacing-8;
    
    .form-title {
      font-size: $text-3xl;
      font-weight: $font-bold;
      color: $primary-600;
      margin-bottom: $spacing-2;
      
      &::before {
        content: "💝 ";
      }
    }
    
    .form-subtitle {
      color: $gray-600;
      font-style: italic;
    }
  }
  
  .form-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: $radius-2xl;
    box-shadow: $shadow-love;
    overflow: hidden;
    
    .form-steps {
      display: flex;
      background: $primary-100;
      
      .step {
        flex: 1;
        padding: $spacing-4;
        text-align: center;
        position: relative;
        
        &.active {
          background: $primary-500;
          color: white;
        }
        
        &.completed {
          background: $success;
          color: white;
          
          &::after {
            content: "✓";
          }
        }
        
        .step-number {
          display: block;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          color: $primary-500;
          margin: 0 auto $spacing-2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: $font-bold;
        }
        
        .step-title {
          font-size: $text-sm;
          font-weight: $font-medium;
        }
      }
    }
    
    .form-content {
      padding: $spacing-8;
      
      .form-step {
        display: none;
        
        &.active {
          display: block;
          animation: fadeInUp 0.5s ease;
        }
        
        .step-title {
          font-size: $text-xl;
          font-weight: $font-semibold;
          color: $gray-900;
          margin-bottom: $spacing-6;
          text-align: center;
        }
        
        .step-description {
          color: $gray-600;
          text-align: center;
          margin-bottom: $spacing-6;
        }
      }
      
      // Step 1: Amount
      .amount-step {
        .amount-input-container {
          position: relative;
          margin-bottom: $spacing-6;
          
          .currency-symbol {
            position: absolute;
            left: $spacing-4;
            top: 50%;
            transform: translateY(-50%);
            font-size: $text-2xl;
            color: $primary-500;
            font-weight: $font-bold;
          }
          
          .amount-input {
            width: 100%;
            padding: $spacing-4 $spacing-4 $spacing-4 3rem;
            border: 3px solid $primary-200;
            border-radius: $radius-love;
            font-size: $text-2xl;
            font-family: $font-mono;
            font-weight: $font-bold;
            text-align: center;
            background: linear-gradient(135deg, white, $primary-50);
            
            &:focus {
              border-color: $primary-500;
              box-shadow: $shadow-love;
              outline: none;
            }
          }
        }
        
        .amount-suggestions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: $spacing-2;
          
          .suggestion-btn {
            padding: $spacing-3;
            border: 2px solid $primary-200;
            background: white;
            border-radius: $radius-lg;
            font-family: $font-mono;
            font-weight: $font-medium;
            color: $primary-600;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: $primary-500;
              background: $primary-50;
              transform: translateY(-2px);
            }
          }
        }
      }
      
      // Step 2: Category & Type
      .category-step {
        .transaction-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: $spacing-4;
          margin-bottom: $spacing-6;
          
          .type-option {
            padding: $spacing-4;
            border: 2px solid $gray-200;
            border-radius: $radius-love;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &.selected {
              border-color: $primary-500;
              background: $primary-50;
            }
            
            .type-icon {
              font-size: 2rem;
              margin-bottom: $spacing-2;
            }
            
            .type-title {
              font-weight: $font-semibold;
              color: $gray-700;
            }
          }
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: $spacing-3;
          
          .category-option {
            padding: $spacing-3;
            border: 2px solid $gray-200;
            border-radius: $radius-lg;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            
            &.selected {
              border-color: $primary-500;
              background: $primary-50;
              transform: scale(1.05);
            }
            
            &.love-category {
              border-color: $love-red;
              background: linear-gradient(135deg, white, #ffe4e6);
              
              &.selected {
                border-color: $love-red;
                background: linear-gradient(135deg, #ffe4e6, #fecaca);
              }
            }
            
            .category-icon {
              font-size: 1.5rem;
              margin-bottom: $spacing-1;
            }
            
            .category-name {
              font-size: $text-sm;
              font-weight: $font-medium;
              color: $gray-700;
            }
          }
        }
      }
      
      // Step 3: Details
      .details-step {
        .sharing-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: $spacing-4;
          margin-bottom: $spacing-6;
          
          .sharing-option {
            padding: $spacing-4;
            border: 2px solid $gray-200;
            border-radius: $radius-love;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &.selected {
              border-color: $primary-500;
              background: $primary-50;
            }
            
            .sharing-icon {
              font-size: 2rem;
              margin-bottom: $spacing-2;
            }
            
            .sharing-title {
              font-weight: $font-semibold;
              color: $gray-700;
            }
            
            .sharing-description {
              font-size: $text-sm;
              color: $gray-500;
              margin-top: $spacing-1;
            }
          }
        }
        
        .shared-details {
          display: none;
          padding: $spacing-4;
          background: $secondary-50;
          border-radius: $radius-lg;
          margin-bottom: $spacing-6;
          
          &.active {
            display: block;
            animation: slideDown 0.3s ease;
          }
          
          .details-title {
            font-weight: $font-semibold;
            color: $gray-700;
            margin-bottom: $spacing-3;
            
            &::before {
              content: "👫 ";
            }
          }
          
          .split-options {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: $spacing-2;
            margin-bottom: $spacing-4;
            
            .split-option {
              padding: $spacing-2;
              border: 1px solid $gray-300;
              border-radius: $radius-md;
              text-align: center;
              cursor: pointer;
              font-size: $text-sm;
              
              &.selected {
                border-color: $secondary-500;
                background: white;
              }
            }
          }
          
          .payer-selector {
            .payer-title {
              font-size: $text-sm;
              color: $gray-600;
              margin-bottom: $spacing-2;
            }
            
            .payer-options {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: $spacing-2;
              
              .payer-option {
                padding: $spacing-2;
                border: 1px solid $gray-300;
                border-radius: $radius-md;
                text-align: center;
                cursor: pointer;
                
                &.selected {
                  border-color: $secondary-500;
                  background: white;
                }
              }
            }
          }
        }
        
        .love-rating {
          margin-bottom: $spacing-6;
          
          .rating-title {
            font-weight: $font-semibold;
            color: $gray-700;
            margin-bottom: $spacing-3;
            text-align: center;
            
            &::before {
              content: "💕 ";
            }
          }
          
          .rating-stars {
            display: flex;
            justify-content: center;
            gap: $spacing-2;
            
            .star {
              font-size: 2rem;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &.active {
                color: $love-gold;
                transform: scale(1.2);
              }
              
              &.inactive {
                color: $gray-300;
              }
              
              &:hover {
                transform: scale(1.3);
              }
            }
          }
          
          .rating-labels {
            display: flex;
            justify-content: space-between;
            margin-top: $spacing-2;
            font-size: $text-xs;
            color: $gray-500;
          }
        }
      }
      
      .form-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: $spacing-8;
        
        .nav-btn {
          @extend .btn;
          
          &--prev {
            @extend .btn--outline-love;
          }
          
          &--next {
            @extend .btn--primary;
          }
          
          &--submit {
            @extend .btn--love-special;
            font-size: $text-lg;
            padding: $spacing-4 $spacing-8;
            
            &::after {
              content: " 💕";
            }
          }
        }
        
        .progress-indicator {
          display: flex;
          align-items: center;
          gap: $spacing-1;
          
          .progress-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $gray-300;
            
            &.active {
              background: $primary-500;
            }
            
            &.completed {
              background: $success;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
```

#### 9.3.3 Love Timeline（愛の取引履歴）
```scss
.love-timeline {
  background: linear-gradient(to bottom, $primary-50, $secondary-50);
  min-height: 100vh;
  padding: $spacing-6;
  
  .timeline-header {
    text-align: center;
    margin-bottom: $spacing-8;
    
    .timeline-title {
      font-size: $text-3xl;
      font-weight: $font-bold;
      color: $primary-600;
      margin-bottom: $spacing-2;
      
      &::before {
        content: "💕 ";
      }
      
      &::after {
        content: " の思い出";
      }
    }
    
    .timeline-filters {
      display: flex;
      justify-content: center;
      gap: $spacing-4;
      margin-top: $spacing-6;
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: $spacing-2;
        
        .filter-label {
          font-size: $text-sm;
          color: $gray-600;
          text-align: center;
        }
        
        .filter-select {
          @extend .select-love;
          min-width: 150px;
        }
      }
    }
  }
  
  .timeline-container {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom, $primary-300, $secondary-300);
      transform: translateX(-50%);
    }
    
    .timeline-section {
      margin-bottom: $spacing-8;
      
      .section-date {
        text-align: center;
        margin-bottom: $spacing-6;
        
        .date-badge {
          display: inline-block;
          padding: $spacing-2 $spacing-4;
          background: white;
          border: 2px solid $primary-300;
          border-radius: $radius-full;
          font-weight: $font-semibold;
          color: $primary-600;
          box-shadow: $shadow-md;
          position: relative;
          z-index: 10;
        }
      }
      
      .timeline-items {
        .timeline-item {
          display: flex;
          margin-bottom: $spacing-6;
          position: relative;
          
          &:nth-child(odd) {
            flex-direction: row;
            
            .item-content {
              margin-left: $spacing-8;
            }
            
            .item-connector {
              right: auto;
              left: 50%;
              transform: translateX(-50%);
            }
          }
          
          &:nth-child(even) {
            flex-direction: row-reverse;
            
            .item-content {
              margin-right: $spacing-8;
            }
            
            .item-connector {
              left: auto;
              right: 50%;
              transform: translateX(50%);
            }
          }
          
          .item-connector {
            position: absolute;
            top: $spacing-4;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            border: 4px solid $primary-500;
            z-index: 10;
            
            &--love {
              border-color: $love-red;
              background: $love-red;
              
              &::after {
                content: '💕';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 8px;
              }
            }
            
            &--income {
              border-color: $success;
            }
            
            &--expense {
              border-color: $error;
            }
          }
          
          .item-content {
            flex: 1;
            background: white;
            border-radius: $radius-xl;
            padding: $spacing-4;
            box-shadow: $shadow-md;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: $shadow-lg;
            }
            
            &--love {
              background: linear-gradient(135deg, white, $primary-50);
              border: 2px solid $primary-200;
              
              &:hover {
                box-shadow: $shadow-love;
              }
            }
            
            &--special {
              background: linear-gradient(135deg, white, #fef3c7);
              border: 2px solid $love-gold;
              position: relative;
              
              &::before {
                content: '✨';
                position: absolute;
                top: $spacing-2;
                right: $spacing-2;
                font-size: $text-lg;
              }
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: $spacing-3;
              
              .item-category {
                display: flex;
                align-items: center;
                gap: $spacing-2;
                
                .category-icon {
                  font-size: 1.5rem;
                }
                
                .category-name {
                  font-weight: $font-semibold;
                  color: $gray-700;
                }
              }
              
              .item-amount {
                font-family: $font-mono;
                font-weight: $font-bold;
                font-size: $text-lg;
                
                &--income {
                  color: $success;
                  
                  &::before {
                    content: '+¥';
                  }
                }
                
                &--expense {
                  color: $error;
                  
                  &::before {
                    content: '-¥';
                  }
                }
                
                &--love {
                  color: $love-red;
                  font-size: $text-xl;
                  
                  &::before {
                    content: '💕¥';
                  }
                }
              }
            }
            
            .item-description {
              color: $gray-600;
              margin-bottom: $spacing-3;
              font-style: italic;
              
              &--love {
                color: $primary-700;
                font-weight: $font-medium;
              }
            }
            
            .item-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: $text-sm;
              color: $gray-500;
              
              .meta-info {
                display: flex;
                gap: $spacing-4;
                
                .payment-method {
                  display: flex;
                  align-items: center;
                  gap: $spacing-1;
                  
                  &::before {
                    content: '💳';
                  }
                }
                
                .sharing-type {
                  display: flex;
                  align-items: center;
                  gap: $spacing-1;
                  
                  &--shared::before {
                    content: '👫';
                  }
                  
                  &--personal::before {
                    content: '👤';
                  }
                }
              }
              
              .item-actions {
                display: flex;
                gap: $spacing-2;
                
                .action-btn {
                  padding: $spacing-1 $spacing-2;
                  border: 1px solid $gray-300;
                  background: white;
                  border-radius: $radius-md;
                  cursor: pointer;
                  font-size: $text-xs;
                  transition: all 0.3s ease;
                  
                  &:hover {
                    border-color: $primary-500;
                    color: $primary-600;
                  }
                  
                  &--edit::before {
                    content: '✏️ ';
                  }
                  
                  &--delete::before {
                    content: '🗑️ ';
                  }
                }
              }
            }
            
            .love-rating {
              margin-top: $spacing-3;
              padding-top: $spacing-3;
              border-top: 1px solid $gray-200;
              
              .rating-label {
                font-size: $text-xs;
                color: $gray-500;
                margin-bottom: $spacing-1;
              }
              
              .rating-stars {
                display: flex;
                gap: $spacing-1;
                
                .star {
                  font-size: $text-sm;
                  
                  &--active {
                    color: $love-gold;
                  }
                  
                  &--inactive {
                    color: $gray-300;
                  }
                }
              }
            }
            
            .receipt-image {
              margin-top: $spacing-3;
              
              .image-thumbnail {
                width: 60px;
                height: 60px;
                border-radius: $radius-md;
                object-fit: cover;
                cursor: pointer;
                transition: all 0.3s ease;
                
                &:hover {
                  transform: scale(1.1);
                }
              }
            }
          }
        }
      }
    }
  }
  
  .timeline-summary {
    background: white;
    border-radius: $radius-xl;
    padding: $spacing-6;
    margin-top: $spacing-8;
    box-shadow: $shadow-love;
    text-align: center;
    
    .summary-title {
      font-size: $text-lg;
      font-weight: $font-semibold;
      color: $gray-900;
      margin-bottom: $spacing-4;
      
      &::before {
        content: '📊 ';
      }
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: $spacing-4;
      
      .stat-item {
        .stat-value {
          font-family: $font-mono;
          font-size: $text-xl;
          font-weight: $font-bold;
          color: $primary-600;
        }
        
        .stat-label {
          font-size: $text-sm;
          color: $gray-600;
          margin-top: $spacing-1;
        }
      }
    }
  }
}
```

### 9.4 レスポンシブデザイン

#### 9.4.1 ブレークポイント戦略
```scss
// === Breakpoints ===
$breakpoint-xs: 475px;    // 小さなスマートフォン
$breakpoint-sm: 640px;    // スマートフォン
$breakpoint-md: 768px;    // タブレット
$breakpoint-lg: 1024px;   // ラップトップ
$breakpoint-xl: 1280px;   // デスクトップ
$breakpoint-2xl: 1536px;  // 大型デスクトップ

// === Mixins ===
@mixin mobile-xs {
  @media (max-width: #{$breakpoint-xs - 1px}) {
    @content;
  }
}

@mixin mobile {
  @media (max-width: #{$breakpoint-sm - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoint-sm}) and (max-width: #{$breakpoint-lg - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}

@mixin large-desktop {
  @media (min-width: #{$breakpoint-xl}) {
    @content;
  }
}

// === Container System ===
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-4;
  
  @include mobile {
    padding: 0 $spacing-3;
  }
  
  @include tablet {
    max-width: $breakpoint-md;
    padding: 0 $spacing-6;
  }
  
  @include desktop {
    max-width: $breakpoint-lg;
    padding: 0 $spacing-8;
  }
  
  @include large-desktop {
    max-width: $breakpoint-xl;
  }
}

// === Grid System ===
.grid {
  display: grid;
  gap: $spacing-4;
  
  &--1 { grid-template-columns: 1fr; }
  &--2 { grid-template-columns: repeat(2, 1fr); }
  &--3 { grid-template-columns: repeat(3, 1fr); }
  &--4 { grid-template-columns: repeat(4, 1fr); }
  
  @include mobile {
    grid-template-columns: 1fr !important;
    gap: $spacing-3;
  }
  
  @include tablet {
    &--3 { grid-template-columns: repeat(2, 1fr); }
    &--4 { grid-template-columns: repeat(2, 1fr); }
  }
}
```

#### 9.4.2 Love-themed Mobile Optimization
```scss
// === Mobile Love Optimizations ===
@include mobile {
  .love-dashboard {
    padding: $spacing-4;
    
    .love-header {
      margin-bottom: $spacing-6;
      
      .couple-greeting {
        font-size: $text-2xl;
      }
      
      .anniversary-countdown {
        .countdown-value {
          font-size: $text-xl;
        }
      }
    }
    
    .love-summary-grid {
      gap: $spacing-4;
      
      .summary-card {
        padding: $spacing-4;
        
        .summary-icon {
          font-size: 2rem;
        }
        
        .summary-value {
          font-size: $text-xl;
        }
      }
    }
    
    .love-content-grid {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }
  }
  
  .love-transaction-form {
    padding: $spacing-4;
    
    .form-container {
      .form-steps {
        .step {
          padding: $spacing-2;
          
          .step-number {
            width: 24px;
            height: 24px;
            font-size: $text-sm;
          }
          
          .step-title {
            font-size: $text-xs;
          }
        }
      }
      
      .form-content {
        padding: $spacing-4;
        
        .amount-step {
          .amount-input {
            font-size: $text-xl;
          }
          
          .amount-suggestions {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .category-step {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      }
    }
  }
  
  .love-timeline {
    padding: $spacing-4;
    
    .timeline-container {
      &::before {
        left: $spacing-4;
      }
      
      .timeline-section {
        .timeline-items {
          .timeline-item {
            flex-direction: row !important;
            
            .item-content {
              margin-left: $spacing-8 !important;
              margin-right: 0 !important;
            }
            
            .item-connector {
              left: $spacing-4 !important;
              right: auto !important;
              transform: translateX(-50%) !important;
            }
          }
        }
      }
    }
  }
}

// === Touch Optimizations ===
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .input {
    min-height: 44px;
  }
  
  .transaction-card {
    .item-actions {
      .action-btn {
        min-height: 40px;
        min-width: 40px;
      }
    }
  }
  
  .love-rating {
    .rating-stars {
      .star {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
```

### 9.5 アクセシビリティ（A11y）

#### 9.5.1 Focus Management
```scss
// === Focus Styles ===
.focusable {
  &:focus {
    outline: 3px solid $primary-500;
    outline-offset: 2px;
    border-radius: $radius-sm;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
  
  &:focus-visible {
    outline: 3px solid $primary-500;
    outline-offset: 2px;
  }
}

// === Skip Links ===
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: $primary-600;
  color: white;
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-md;
  text-decoration: none;
  font-weight: $font-semibold;
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}

// === Screen Reader Only ===
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// === High Contrast Mode ===
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 1px solid $gray-400;
  }
  
  .input {
    border: 2px solid $gray-600;
  }
}

// === Reduced Motion ===
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 9.5.2 ARIA Implementation
```scss
// === ARIA Styles ===
[aria-invalid="true"] {
  border-color: $error !important;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba($error, 0.2) !important;
  }
}

[aria-expanded="true"] {
  .dropdown-icon {
    transform: rotate(180deg);
  }
}

[aria-selected="true"] {
  background-color: $primary-100;
  color: $primary-800;
}

[aria-pressed="true"] {
  background-color: $primary-600;
  color: white;
}

// === Live Regions ===
[aria-live] {
  &[aria-live="polite"] {
    .announcement {
      padding: $spacing-2 $spacing-4;
      background: $info;
      color: white;
      border-radius: $radius-md;
      margin: $spacing-2 0;
    }
  }
  
  &[aria-live="assertive"] {
    .alert {
      padding: $spacing-3 $spacing-4;
      background: $error;
      color: white;
      border-radius: $radius-md;
      margin: $spacing-2 0;
      font-weight: $font-semibold;
    }
  }
}
```

### 9.6 パフォーマンス最適化

#### 9.6.1 CSS最適化
```scss
// === CSS Performance ===
// Use transform and opacity for animations
.love-fade-enter {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.love-fade-enter-active {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

// Use will-change for optimized animations
.animated-element {
  will-change: transform, opacity;
}

// GPU acceleration for smooth animations
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

// Critical CSS loading strategy
.above-fold {
  // Inline critical styles here
  font-family: $font-primary;
  color: $gray-900;
  background: white;
}

// Lazy load non-critical styles
.below-fold {
  // Load after critical content
  font-family: $font-primary;
}
```

#### 9.6.2 Image Optimization
```scss
// === Image Performance ===
.love-image {
  max-width: 100%;
  height: auto;
  
  &[loading="lazy"] {
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
  }
  
  // Responsive images
  &--responsive {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  
  // Avatar images
  &--avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    
    @include mobile {
      width: 32px;
      height: 32px;
    }
  }
}

// Progressive image loading
.progressive-image {
  position: relative;
  overflow: hidden;
  
  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, $gray-200, $gray-100);
    filter: blur(5px);
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 0;
    }
  }
  
  .main-image {
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
  }
}
```

# Money Dairy Lovers - 要件定義書 Part 5（開発スケジュール・運用計画）

## 10. 開発スケジュール詳細

### 10.1 Phase 1: Love Foundation（愛の基盤）- 2週間

#### Week 1: 愛のプロジェクト初期化
**Day 1-2: Love Project Setup**
- [ ] **リポジトリ作成**
  - GitHub リポジトリ作成（money-dairy-lovers）
  - ブランチ戦略設定（main, develop, feature/*, hotfix/*）
  - Issue テンプレート作成（Love Bug Report, Love Feature Request）
  - Pull Request テンプレート作成
- [ ] **Love-themed プロジェクト構造作成**
  - ディレクトリ構造セットアップ
  - Love-themed README.md 作成
  - LICENSE ファイル追加
  - CONTRIBUTING.md 作成（Love Development Guidelines）
- [ ] **Docker Love Environment**
  - docker-compose.yml（開発環境用）
  - docker-compose.prod.yml（本番環境用）
  - 各サービスのDockerfile作成
  - Love-themed環境変数設定
- [ ] **Love Documentation**
  - .env.example（Love-themed コメント付き）
  - 開発セットアップガイド
  - Love-themed コーディング規約

**Day 3-4: Backend Love Foundation**
- [ ] **FastAPI Love Project 初期化**
  - FastAPI アプリケーション基本設定
  - Love-themed プロジェクト構造作成
  - 環境変数管理（Pydantic Settings）
  - Love-themed ロガー設定
- [ ] **Database Love Connection**
  - SQLAlchemy + Alembic 設定
  - PostgreSQL接続設定
  - Love-themed データベース初期化スクリプト
  - 基本的なヘルスチェックエンドポイント
- [ ] **Love Security Foundation**
  - JWT基本設定
  - CORS設定（Love-themed origins）
  - セキュリティミドルウェア設定
  - 基本的な認証構造

**Day 5-7: Frontend Love Foundation**
- [ ] **React 19 Love Setup**
  - React 19 + TypeScript + Vite 設定
  - Love-themed SCSS 環境構築
  - 基本的なディレクトリ構造作成
  - Love-themed 変数・スタイル定義
- [ ] **Love Navigation Setup**
  - React Router DOM v6 設定
  - 基本的なページ構造
  - Love-themed レイアウトコンポーネント
  - ナビゲーション基盤
- [ ] **Love API Client**
  - Axios設定とインターセプター
  - API client 基盤クラス
  - エラーハンドリング基盤
  - Love-themed API レスポンス型定義

#### Week 2: Love Authentication
**Day 8-10: Backend Love Auth**
- [ ] **User Love Model**
  - Userモデル作成（Love-themed fields追加）
  - Alembic マイグレーション作成
  - Love-themed デフォルトデータ
  - データベースインデックス設定
- [ ] **JWT Love Implementation**
  - JWT トークン生成・検証
  - リフレッシュトークン実装
  - Love-themed パスワードハッシュ化
  - セッション管理
- [ ] **Love Auth Endpoints**
  - POST /auth/register（Love-themed validation）
  - POST /auth/login（Love-themed response）
  - POST /auth/refresh
  - POST /auth/logout
  - GET /auth/me（Love-themed user info）

**Day 11-12: Frontend Love Auth**
- [ ] **Love Auth Context**
  - React 19 Context API 使用
  - 認証状態管理
  - Love-themed ユーザー情報管理
  - 自動ログイン機能
- [ ] **Love Auth Components**
  - Love-themed ログインフォーム
  - Love-themed 登録フォーム
  - プライベートルート設定
  - Love-themed エラーハンドリング
- [ ] **Love Token Management**
  - JWT トークン保存・取得
  - 自動リフレッシュ機能
  - ログアウト処理
  - Love-themed 認証フロー

**Day 13-14: Love CI/CD Foundation**
- [ ] **GitHub Actions Love Workflow**
  - CI/CD基本ワークフロー（.github/workflows/ci.yml）
  - React 19対応 Lint・テスト自動実行
  - Love-themed コードフォーマット設定
  - Docker イメージビルド自動化
- [ ] **Love Quality Gates**
  - Backend: Black + isort + mypy + pytest
  - Frontend: ESLint + Prettier + TypeScript + Jest
  - Love-themed テストカバレッジ設定
  - セキュリティスキャン基盤

### 10.2 Phase 2: Love Core Features（愛の核心機能）- 3週間

#### Week 3: Love Data Foundation
**Day 15-17: Love Database Design**
- [ ] **Love Database Models**
  - Categories モデル（Love categories含む）
  - Partnerships モデル（Love relationship info）
  - Transactions モデル（Love rating field）
  - Shared_Transactions モデル
- [ ] **Love Migrations**
  - Alembic マイグレーション作成
  - Love-themed インデックス設定
  - Love-themed 制約設定
  - パフォーマンス最適化
- [ ] **Love Seed Data**
  - Love-themed デフォルトカテゴリ作成
  - Love events テーブル
  - Love-themed テストデータ
  - 開発用ダミーデータ

**Day 18-21: Love Categories**
- [ ] **Love Categories API**
  - カテゴリCRUD API実装
  - Love categories 特別処理
  - Love-themed バリデーション
  - カテゴリ統計機能
- [ ] **Love Categories Frontend**
  - Love-themed カテゴリ管理画面
  - Love categories 特別表示
  - アイコン・色設定UI
  - Love-themed カスタムカテゴリ作成

#### Week 4: Love Transactions
**Day 22-24: Love Transaction API**
- [ ] **Love Transaction CRUD**
  - 取引作成・読み取り・更新・削除 API
  - Love rating システム実装
  - 共有支出計算機能
  - Love-themed バリデーション
- [ ] **Love Transaction Features**
  - Love transactions 特別処理
  - ページネーション実装
  - Love-themed フィルター機能
  - 画像アップロード機能

**Day 25-28: Love Transaction Frontend**
- [ ] **Love Transaction Form**
  - Love-themed ステップ式フォーム
  - Love rating 入力機能
  - 共有取引設定UI
  - Love-themed バリデーション
- [ ] **Love Transaction List**
  - Love-themed Timeline表示
  - Love transactions 特別デザイン
  - フィルター・検索UI
  - Love-themed ページネーション

#### Week 5: Love Partnership & Dashboard
**Day 29-31: Love Partnership**
- [ ] **Love Partnership API**
  - パートナー招待システム
  - Love-themed 招待コード生成
  - パートナーシップ管理API
  - Love events API
- [ ] **Love Partnership Frontend**
  - Love-themed 招待UI
  - QRコード生成機能
  - パートナーシップ管理画面
  - Love events 管理UI

**Day 32-35: Love Dashboard**
- [ ] **Love Dashboard API**
  - Love-themed ダッシュボードAPI
  - Love統計計算
  - 月次サマリー計算
  - Love trends 分析
- [ ] **Love Dashboard Frontend**
  - Love-themed ダッシュボード画面
  - Love統計表示
  - Love-themed グラフ・チャート
  - 愛のメッセージ機能

### 10.3 Phase 3: Love Analytics（愛の分析）- 2週間

#### Week 6: Love Reports
**Day 36-38: Love Report API**
- [ ] **Love Analytics Engine**
  - Love-themed レポートAPI
  - Love spending 分析
  - Love trends 計算
  - カップル比較分析
- [ ] **Love Statistics**
  - Love rating 統計
  - 記念日支出分析
  - Love categories 特別統計
  - Love goals 追跡

**Day 39-42: Love Visualization**
- [ ] **Love Charts Implementation**
  - Love-themed Chart.js設定
  - Love spending 円グラフ
  - Love trends 折れ線グラフ
  - Love rating 可視化
- [ ] **Love Reports UI**
  - Love-themed レポート画面
  - インタラクティブグラフ
  - Love insights 表示
  - カスタムレポート生成

#### Week 7: Love Budget Management
**Day 43-45: Love Budget API**
- [ ] **Love Budget System**
  - 予算設定・管理API
  - Love budget 特別処理
  - 予算vs実績計算
  - Love-themed アラート機能
- [ ] **Love Goals API**
  - Love goals 設定API
  - 目標進捗追跡
  - Love milestones 管理
  - 達成お祝い機能

**Day 46-49: Love Budget Frontend**
- [ ] **Love Budget UI**
  - Love-themed 予算設定画面
  - ハート型プログレスバー
  - Love budget 可視化
  - Love goals 管理UI
- [ ] **Love Export Features**
  - Love-themed CSVエクスポート
  - Love report PDFエクスポート
  - Love data バックアップ
  - Love memories エクスポート

### 10.4 Phase 4: Love Advanced Features（愛の高度機能）- 2週間

#### Week 8: Love Sharing & Recurring
**Day 50-52: Love Sharing Advanced**
- [ ] **Love Sharing Features**
  - 高度な共有取引機能
  - Love-themed 分割計算
  - Love debt 管理
  - Love-themed 清算機能
- [ ] **Love Communication**
  - 取引コメント機能
  - Love reactions システム
  - Love-themed 通知
  - 愛のメッセージ機能

**Day 53-56: Love Recurring & Automation**
- [ ] **Love Recurring Transactions**
  - 定期取引モデル・API
  - Love-themed 定期実行
  - Love events 自動登録
  - スマート予測機能
- [ ] **Love Automation UI**
  - 定期取引管理UI
  - Love events カレンダー
  - 自動化設定画面
  - Love-themed スケジューラー

#### Week 9: Love UX & Performance
**Day 57-59: Love Notifications**
- [ ] **Love Notification System**
  - Love-themed 通知システム
  - リアルタイム通知（WebSocket）
  - Love-themed メール通知
  - プッシュ通知基盤
- [ ] **Love Communication Hub**
  - Love-themed 通知センター
  - Love activities フィード
  - Love milestones 通知
  - Love-themed アラート

**Day 60-63: Love Performance**
- [ ] **Love Performance Optimization**
  - React 19パフォーマンス最適化
  - Love-themed 画像最適化
  - データベースクエリ最適化
  - Love-themed キャッシュ戦略
- [ ] **Love Testing & Quality**
  - Love-themed E2Eテスト
  - パフォーマンステスト
  - Love UX テスト
  - セキュリティテスト

### 10.5 Phase 5: Love Production（愛の本番化）- 1週間

#### Week 10: Love Deployment
**Day 64-66: Love AWS Infrastructure**
- [ ] **Love AWS Setup**
  - ECS Fargate クラスター作成
  - RDS PostgreSQL（Love data保護）
  - ALB・セキュリティグループ設定
  - Love-themed 監視設定
- [ ] **Love Infrastructure as Code**
  - Terraform Love infrastructure
  - Love-themed環境変数管理
  - SSL証明書・DNS設定
  - Love-themed バックアップ設定

**Day 67-70: Love Go-Live**
- [ ] **Love Deployment Pipeline**
  - GitHub Actions 本番デプロイ
  - Love-themed 環境設定
  - データマイグレーション
  - Love-themed 監視・アラート設定
- [ ] **Love Launch Preparation**
  - Love-themed ドキュメント最終化
  - Love user ガイド作成
  - Love-themed サポート体制
  - Love launch イベント準備

## 11. 成功基準・評価指標

### 11.1 Love Technical Success Criteria

#### 11.1.1 Love Functionality Achievement
- [ ] **Love Core Features完全動作**
  - 全ての愛の機能が仕様通りに動作
  - Love rating システム完全実装
  - Love partnership 機能フル稼働
  - Love analytics 正確な計算・表示
- [ ] **Love Authentication & Security**
  - React 19対応認証が正しく機能
  - Love-themed セキュリティ要件達成
  - JWT + リフレッシュトークン完全実装
  - Love data プライバシー保護

#### 11.1.2 Love Performance Excellence
- [ ] **Love Response Performance**
  - レスポンス時間: 2秒以内（95%パーセンタイル）
  - Love dashboard 表示: 1.5秒以内
  - Love transaction 作成: 1秒以内
  - Love analytics 計算: 3秒以内
- [ ] **Love Scalability**
  - 100組のカップル同時利用可能
  - Love data 処理スケーリング
  - Love image アップロード対応
  - データベース最適化完了

#### 11.1.3 Love Code Quality
- [ ] **Love Test Coverage**
  - Backend test coverage: 85%以上
  - Frontend test coverage: 80%以上
  - Love features E2E test: 95%以上
  - Love-themed integration test完全カバー
- [ ] **Love Code Standards**
  - React 19ベストプラクティス準拠
  - Love-themed ESLint + Prettier設定
  - TypeScript strict mode対応
  - Love-themed コメント・ドキュメント

### 11.2 Love Learning Success Criteria

#### 11.2.1 Love Technology Mastery
**React 19 + Modern Frontend**
- [ ] React 19新機能（ref as props、use API等）習得
- [ ] Love-themed SCSS設計パターン習得
- [ ] React 19パフォーマンス最適化技術
- [ ] Love UX実装パターン習得

**FastAPI + Backend Excellence**
- [ ] FastAPI高度な機能活用
- [ ] Love-themed API設計パターン
- [ ] SQLAlchemy ORM最適化技術
- [ ] Love data モデリング手法

**Love Infrastructure & DevOps**
- [ ] Docker + AWS本格運用経験
- [ ] GitHub Actions CI/CD構築
- [ ] Love-themed 監視・運用設計
- [ ] インフラ as Code実践

#### 11.2.2 Love Development Process
- [ ] **Love-themed Agile Development**
  - 愛情を込めた要件定義プロセス
  - Love-centered 設計思考
  - カップル視点でのUX設計
  - Love-driven 品質管理
- [ ] **Love Project Management**
  - 愛のある進捗管理
  - Love-themed リスク管理
  - カップル開発者の協調
  - Love success 測定手法

### 11.3 Love User Experience Success

#### 11.3.1 Love Usability Excellence
- [ ] **Love Intuitive Design**
  - 直感的な操作で取引登録（30秒以内）
  - Love features 発見性100%
  - エラーメッセージがカップルフレンドリー
  - Love-themed ヘルプ・ガイダンス
- [ ] **Love Mobile Experience**
  - スマートフォンでの愛の体験最適化
  - Touch-friendly Love interactions
  - Love-themed レスポンシブデザイン
  - モバイル Love performance 最適化

#### 11.3.2 Love Emotional Impact
- [ ] **Love Connection Enhancement**
  - カップル間のお金の透明性向上
  - Love communication 促進効果
  - 共同目標達成モチベーション向上
  - Love-themed 絆深化体験
- [ ] **Love Daily Usage**
  - 週3回以上のLove login達成
  - Love rating 入力習慣形成
  - Love goals 設定・追跡習慣
  - Love memories 蓄積・振り返り

### 11.4 Love Business Value

#### 11.4.1 Love Financial Management
- [ ] **Love Budget Achievement**
  - 月次予算達成率80%以上
  - Love budget 意識向上
  - 無駄遣い削減効果測定
  - Love savings 目標達成支援
- [ ] **Love Transparency**
  - 共有支出の100%可視化
  - Love spending パターン理解
  - カップル間のお金の話し合い増加
  - Love financial プランニング向上

#### 11.4.2 Love Relationship Value
- [ ] **Love Growth Metrics**
  - Love rating 平均値向上
  - Love events 記録・実行率
  - Love goals 共同達成率
  - Love memories 蓄積量

## 12. Love Risk Management & Mitigation

### 12.1 Love Technical Risks

#### 12.1.1 React 19 Love Challenges
**Risk**: React 19新機能習得・実装の複雑性
**Love Mitigation**:
- 愛を込めた段階的学習計画
- Love community サポート活用
- React 19互換性から始めて新機能追加
- Love-themed サンプル実装で練習

#### 12.1.2 Love UX Complexity
**Risk**: Love-themed UX設計の難易度
**Love Mitigation**:
- カップルユーザーテスト実施
- Love design system 段階的構築
- シンプルなLove interaction から開始
- Love-themed アクセシビリティ確保

#### 12.1.3 Love Performance Challenges
**Risk**: Love features による性能低下
**Love Mitigation**:
- Love data 効率的キャッシュ戦略
- Love images 最適化・CDN活用
- Love analytics 非同期処理
- React 19パフォーマンス機能活用

### 12.2 Love Development Risks

#### 12.2.1 Love Feature Scope Creep
**Risk**: Love機能追加によるスコープ拡大
**Love Mitigation**:
- Love MVP 厳格定義・遵守
- Love features 優先度明確化
- Love-themed 機能は後回し可能
- カップルニーズ中心の判断

#### 12.2.2 Love Quality vs Speed
**Risk**: 愛の品質と開発速度のバランス
**Love Mitigation**:
- Love-driven 品質基準設定
- 継続的な Love code review
- Love-themed 自動テスト充実
- Love user feedback 早期取得

### 12.3 Love Operational Risks

#### 12.3.1 Love Data Protection
**Risk**: カップルの大切なLove dataの保護
**Love Mitigation**:
- Love data 暗号化・バックアップ
- Love privacy 設定詳細化
- Love memories 安全な保存
- Love security 監査定期実施

#### 12.3.2 Love Service Continuity
**Risk**: Love service中断によるカップル影響
**Love Mitigation**:
- Love-friendly 障害対応手順
- Love data 冗長化・リカバリ
- Love user 事前通知体制
- Love support 24/7体制（重要時期）

## 13. Love Deployment Strategy

### 13.1 Love Environment Strategy

#### 13.1.1 Love Development Environment
```yaml
love_development:
  purpose: "愛のある開発・テスト環境"
  infrastructure:
    - Docker Compose (local love development)
    - Hot reload (love-driven development)
    - Love test data seeding
    - Love-themed debugging tools
  
  love_features:
    - Love rating testing
    - Love partnership simulation
    - Love analytics preview
    - Love notifications testing
```

#### 13.1.2 Love Staging Environment
```yaml
love_staging:
  purpose: "愛の本番前検証環境"
  infrastructure:
    - AWS ECS (production-like)
    - RDS (love data testing)
    - Love performance testing
    - Love security validation
  
  love_validation:
    - Love user acceptance testing
    - Love performance benchmarking
    - Love security penetration testing
    - Love data migration testing
```

#### 13.1.3 Love Production Environment
```yaml
love_production:
  purpose: "愛のある本番サービス環境"
  infrastructure:
    - AWS ECS Fargate (love scalability)
    - RDS Multi-AZ (love data protection)
    - CloudFront CDN (love performance)
    - Route 53 + SSL (love security)
  
  love_monitoring:
    - Love user experience monitoring
    - Love data integrity monitoring
    - Love performance alerting
    - Love security scanning
```

### 13.2 Love Deployment Pipeline

#### 13.2.1 Love CI/CD Workflow
```yaml
name: Love Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  love_quality_check:
    name: "Love Quality Assurance"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: "💕 Love Code Quality Check"
        run: |
          # Love-themed linting
          npm run lint:love
          # Love feature testing
          npm run test:love-features
          # Love accessibility testing
          npm run test:a11y-love
  
  love_security_scan:
    name: "Love Security Protection"
    runs-on: ubuntu-latest
    steps:
      - name: "🔒 Love Data Security Scan"
        run: |
          # Love data protection validation
          npm audit --audit-level high
          # Love security dependency check
          snyk test --severity-threshold=high
  
  love_performance_test:
    name: "Love Performance Validation"
    runs-on: ubuntu-latest
    steps:
      - name: "⚡ Love Speed Testing"
        run: |
          # Love performance benchmarking
          npm run test:performance:love
          # Love load testing
          npm run test:load:couples
  
  love_deployment:
    name: "Love Production Deployment"
    needs: [love_quality_check, love_security_scan, love_performance_test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: "🚀 Deploy with Love"
        run: |
          # Love-themed deployment
          ./scripts/deploy-with-love.sh
          # Love health check
          ./scripts/love-health-check.sh
          # Love user notification
          ./scripts/notify-love-users.sh
```

### 13.3 Love Monitoring & Alerting

#### 13.3.1 Love Health Monitoring
```yaml
love_health_checks:
  application_health:
    - endpoint: "/health/love"
      interval: "30s"
      timeout: "5s"
      love_criteria:
        - response_time < 200ms
        - love_features_available: true
        - couple_data_accessible: true
  
  love_user_experience:
    - metric: "love_login_success_rate"
      threshold: "> 99%"
    - metric: "love_transaction_creation_time"
      threshold: "< 1s"
    - metric: "love_dashboard_load_time"
      threshold: "< 2s"
  
  love_business_metrics:
    - metric: "daily_love_active_couples"
      alert_threshold: "< 80% of baseline"
    - metric: "love_rating_average"
      alert_threshold: "< 4.0"
    - metric: "love_goal_completion_rate"
      alert_threshold: "< 60%"
```

#### 13.3.2 Love Alert Configuration
```yaml
love_alerts:
  critical_love_issues:
    - name: "Love Service Down"
      condition: "love_health_check_failed"
      notification:
        - slack: "#love-emergency"
        - email: "love-ops@money-dairy-lovers.com"
        - pager: "love-on-call"
    
    - name: "Love Data Corruption"
      condition: "love_data_integrity_failed"
      notification:
        - slack: "#love-data-emergency"
        - email: "love-data-team@money-dairy-lovers.com"
  
  love_performance_warnings:
    - name: "Love Response Slow"
      condition: "avg_response_time > 3s"
      notification:
        - slack: "#love-performance"
    
    - name: "Love User Experience Degraded"
      condition: "love_satisfaction_score < 4.0"
      notification:
        - slack: "#love-ux"
        - email: "love-product@money-dairy-lovers.com"
```

## 14. Love Maintenance & Evolution

### 14.1 Love Operational Procedures

#### 14.1.1 Love Daily Operations
```bash
#!/bin/bash
# Daily Love Operations Script

echo "💕 Starting Daily Love Operations..."

# Love health verification
echo "Checking Love health..."
curl -f https://api.money-dairy-lovers.com/health/love || exit 1

# Love data backup verification
echo "Verifying Love data backups..."
aws s3 ls s3://love-backups/$(date +%Y-%m-%d)/ || exit 1

# Love performance metrics
echo "Collecting Love performance metrics..."
./scripts/collect-love-metrics.sh

# Love user satisfaction check
echo "Checking Love user satisfaction..."
./scripts/check-love-satisfaction.sh

echo "✨ Daily Love Operations completed successfully!"
```

#### 14.1.2 Love Weekly Maintenance
```bash
#!/bin/bash
# Weekly Love Maintenance Script

echo "💝 Starting Weekly Love Maintenance..."

# Love database optimization
echo "Optimizing Love database..."
psql -d money_dairy_lovers -c "ANALYZE;"
psql -d money_dairy_lovers -c "VACUUM;"

# Love performance analysis
echo "Analyzing Love performance trends..."
./scripts/analyze-love-performance.sh

# Love feature usage analysis
echo "Analyzing Love feature usage..."
./scripts/analyze-love-features.sh

# Love security scan
echo "Running Love security scan..."
./scripts/love-security-scan.sh

echo "💖 Weekly Love Maintenance completed!"
```

### 14.2 Love Evolution Roadmap

#### 14.2.1 Love Feature Enhancements (Q2 2025)
- **Advanced Love Analytics**
  - Love spending AI predictions
  - Love behavior pattern recognition
  - Love goal optimization suggestions
  - Love financial health scoring

- **Love Social Features**
  - Love milestone sharing
  - Love goal challenges with other couples
  - Love community features
  - Love advice & tips sharing

#### 14.2.2 Love Technology Evolution (Q3 2025)
- **Love Mobile App**
  - React Native love app
  - Love push notifications
  - Love offline support
  - Love camera integration

- **Love AI Integration**
  - Love spending categorization AI
  - Love budget optimization AI
  - Love goal recommendation engine
  - Love relationship insights

#### 14.2.3 Love Integration Expansion (Q4 2025)
- **Love Banking Integration**
  - Love bank account connection
  - Love automatic transaction import
  - Love real-time balance updates
  - Love spending alerts

- **Love Ecosystem**
  - Love calendar integration
  - Love photo storage integration
  - Love location-based features
  - Love third-party app connections

### 14.3 Love Success Metrics & KPIs

#### 14.3.1 Love Technical KPIs
```yaml
love_technical_kpis:
  performance:
    - name: "Love Response Time"
      target: "< 2s (95th percentile)"
      measurement: "continuous"
    
    - name: "Love Availability"
      target: "> 99.5%"
      measurement: "monthly"
    
    - name: "Love Error Rate"
      target: "< 0.1%"
      measurement: "daily"
  
  quality:
    - name: "Love Code Coverage"
      target: "> 85%"
      measurement: "per release"
    
    - name: "Love Security Score"
      target: "A+ rating"
      measurement: "monthly"
    
    - name: "Love Performance Score"
      target: "> 90 (Lighthouse)"
      measurement: "weekly"
```

#### 14.3.2 Love Business KPIs
```yaml
love_business_kpis:
  engagement:
    - name: "Daily Active Love Couples"
      target: "growth 10% MoM"
      measurement: "daily"
    
    - name: "Love Feature Usage Rate"
      target: "> 80% feature adoption"
      measurement: "monthly"
    
    - name: "Love Rating Average"
      target: "> 4.2/5.0"
      measurement: "weekly"
  
  satisfaction:
    - name: "Love User Satisfaction"
      target: "> 4.5/5.0 NPS"
      measurement: "quarterly"
    
    - name: "Love Goal Achievement Rate"
      target: "> 70% goals completed"
      measurement: "monthly"
    
    - name: "Love Retention Rate"
      target: "> 85% monthly retention"
      measurement: "monthly"
```

## 15. Love Project Conclusion

### 15.1 Love Development Philosophy

このMoney Dairy Loversプロジェクトは、単なる家計簿アプリケーションを超えて、カップルの愛を育み、絆を深めるための特別なツールとして設計されています。

**Love-Driven Development**の理念の下、技術的な優秀性と愛情深いユーザー体験の両立を目指し、React 19の最新機能とFastAPIの堅牢性を組み合わせて、カップルにとって本当に価値のあるサービスを創造します。

### 15.2 Love Success Definition

プロジェクトの成功は以下の**Love Success Criteria**で定義されます：

1. **Technical Love Excellence**: 最新技術を愛情を込めて実装
2. **Love User Experience**: カップルの心を動かすUX実現
3. **Love Learning Achievement**: 開発者の愛ある成長達成
4. **Love Business Value**: カップルの幸せな未来への貢献

### 15.3 Love Development Journey

この70日間の愛ある開発ジャーニーを通じて、技術的なスキルアップだけでなく、愛を中心とした開発哲学、カップルのニーズを深く理解したプロダクト開発、そして持続可能な愛のあるソフトウェア運用の実践を経験することができます。

**愛を込めて開発された Money Dairy Lovers が、多くのカップルの幸せな未来に貢献することを願っています。** 💕

---

*"Love is not just about money, but money management with love creates a beautiful future together."*

## 16. 開発タスク進捗管理

### 16.1 実装完了項目 ✅

- [x] **プロジェクト初期設定**
  - Docker環境構築
  - Frontend (React + TypeScript + Vite)
  - Backend (FastAPI + PostgreSQL)
  - データベース接続
  - カテゴリー初期データ投入スクリプト

- [x] **認証機能**
  - ユーザー登録
  - ログイン/ログアウト
  - JWT認証
  - パスワードリセット画面
  - メール認証機能

- [x] **基本ページ構造**
  - ルーティング設定
  - プライベートルート
  - ナビゲーション（基本実装）
  - 利用規約・プライバシーポリシー
  - テーマ切り替え機能（ライト/ダークモード）

- [x] **取引管理**
  - CRUD エンドポイント実装
  - ページネーション
  - フィルタリング機能
  - 取引作成画面（カテゴリー選択、共有取引対応）
  - 取引一覧表示（検索・フィルター機能付き）
  - 定期取引機能

- [x] **ダッシュボード**
  - 月次収支サマリー表示
  - カテゴリ別支出グラフ（Chart.js）
  - 最近の取引履歴
  - Love Goals表示
  - 収支推移グラフ

- [x] **カテゴリー管理**
  - デフォルトカテゴリー（支出9個、収入6個）
  - カテゴリー一覧表示
  - カスタムカテゴリー作成・編集・削除
  - アイコン・色設定

- [x] **パートナーシップ機能**
  - 招待コード生成・連携
  - パートナー情報表示
  - 共有設定管理
  - パートナーシップ解除

- [x] **予算管理**
  - 予算設定（全体・カテゴリ別）
  - 進捗表示（プログレスバー）
  - 予算アラート機能
  - 月次予算管理画面

- [x] **レポート機能**
  - 月次レポート生成
  - カテゴリ分析
  - 収支推移グラフ
  - カスタム期間レポート

- [x] **設定機能**
  - プロフィール編集
  - パスワード変更
  - 通知設定
  - アカウント管理

- [x] **UI基盤**
  - Love-themed デザインシステム
  - 共通コンポーネント（Button, Input, Card等）
  - SCSS モジュール設定
  - レスポンシブデザイン

### 16.2 未実装タスク 📝

#### 高優先度 🔴

- [ ] **画像アップロード機能**
  - レシート画像のアップロード
  - 画像プレビュー機能
  - 画像サイズ制限・バリデーション
  - S3またはローカルストレージ対応

#### 中優先度 🟡

- [ ] **Love機能のフロントエンド完全実装**
  - 記念日管理画面
  - Love統計・分析ダッシュボード
  - デート代・プレゼント代の特別分析
  - Love イベントカレンダー
  - カップル共有メモリー機能

#### 低優先度 🟢

- [ ] **ナビゲーションの改善**
  - アクティブページ表示（ハイライト）
  - 通知バッジ機能
  - パートナー情報のナビゲーション表示
  - ブレッドクラム実装

- [ ] **パフォーマンス最適化**
  - 画像の遅延読み込み（Lazy Loading）
  - APIレスポンスのキャッシュ戦略
  - バンドルサイズ最適化
  - React.lazy()を使用したコード分割
  - 仮想スクロールの実装（大量データ表示時）

- [ ] **テスト実装**
  - ユニットテスト（Jest + React Testing Library）
  - 統合テスト（API連携テスト）
  - E2Eテスト（Playwright）
  - テストカバレッジ80%以上達成

- [ ] **その他の機能改善**
  - PWA対応（オフライン機能）
  - プッシュ通知
  - 多言語対応（i18n）
  - ダークモードの改善
  - アクセシビリティ改善（WCAG 2.1準拠）

### 16.3 技術的課題 🔧

- [ ] **データベース最適化**
  - インデックスの最適化（パフォーマンスチューニング）
  - N+1クエリの解消
  - データベースバックアップ戦略

- [ ] **API改善**
  - エラーレスポンスの統一（エラーコード体系）
  - APIドキュメント自動生成（OpenAPI）
  - Rate Limiting実装
  - WebSocket対応（リアルタイム通知）

- [ ] **セキュリティ強化**
  - CSRF対策の強化
  - XSS対策の検証
  - SQLインジェクション対策の検証
  - ファイルアップロードのセキュリティ

### 16.4 推定作業時間 ⏱️

- **高優先度タスク**: 約6-8時間
  - 画像アップロード機能: 6-8時間

- **中優先度タスク**: 約10-14時間
  - Love機能フロントエンド: 10-14時間

- **低優先度タスク**: 約20-30時間
  - ナビゲーション改善: 3-4時間
  - パフォーマンス最適化: 8-12時間
  - テスト実装: 10-15時間

**合計推定時間**: 35-50時間

### 16.5 実装の優先順位 🎯

1. **画像アップロード機能** - ユーザビリティ向上に直結
2. **Love機能のフロントエンド** - アプリの差別化要素
3. **テスト実装** - 品質保証とメンテナンス性向上
4. **パフォーマンス最適化** - ユーザー体験の向上
5. **ナビゲーション改善** - UI/UXの洗練

**- Money Dairy Lovers Development Team** 💝

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

# 開発時の重要ルール

## 型定義の命名規則
### バックエンド（Python/FastAPI）
- **すべて snake_case を使用**
  - 例: `user_id`, `transaction_type`, `is_default`, `created_at`
  - Pythonの標準的な命名規則に従う

### フロントエンド（TypeScript/React）
- **型定義では camelCase を使用**
  - 例: `userId`, `transactionType`, `isDefault`, `createdAt`
  - JavaScriptの標準的な命名規則に従う

### API通信時の変換
- **axios interceptor が自動変換を行う**
  - リクエスト時: camelCase → snake_case
  - レスポンス時: snake_case → camelCase
  - フロントエンドコードではcamelCaseのみを使用すること

### 型定義の場所
- **フロントエンド**: `/frontend/src/types/` 配下
- **バックエンド**: `/backend/app/schemas/` 配下

### 新しい型を追加する場合
1. バックエンドでPydanticスキーマを作成（snake_case）
2. フロントエンドでTypeScript型を作成（camelCase）
3. サービス層では必ずフロントエンドの型定義を使用
4. 互換性のための両方の命名規則サポートは避ける

## 影響調査の徹底
- API、サービス、型定義を変更する際は、必ず全ての使用箇所を検索して修正すること
- 特に以下の変更時は要注意：
  - サービスメソッドの返り値の型変更
  - APIレスポンスの構造変更（配列→オブジェクト等）
  - 共通コンポーネントのプロップス変更
  - 型定義の構造変更

## 影響調査の方法
1. `grep -r "対象名" frontend/src` で全使用箇所を検索
2. TypeScriptのコンパイルエラーを確認
3. 実際にアプリケーションを動かして動作確認
4. ブラウザのコンソールでエラーがないか確認

## 修正時の手順
1. 変更前に影響範囲を洗い出す
2. 全ての影響箇所をリストアップ
3. 一つずつ確実に修正
4. 修正後、全ての関連ページの動作確認