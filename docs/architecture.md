# Money Dairy Lovers - アーキテクチャ設計

## 概要

Money Dairy Loversは、カップル向けの家計簿アプリケーションです。愛を育みながら二人で家計管理を行うことを目的とし、モダンなWebアーキテクチャを採用しています。

## システムアーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + SCSS Modules                       │
│  - SPA (Single Page Application)                           │
│  - Love-themed UI Components                               │
│  - React Router DOM v6                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
├─────────────────────────────────────────────────────────────┤
│  FastAPI + Python 3.11                                      │
│  - RESTful API                                             │
│  - JWT Authentication                                       │
│  - OpenAPI Documentation                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15                                              │
│  - Relational Data Model                                   │
│  - Love-themed Extensions                                   │
│  - Transactional Support                                   │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### フロントエンド アーキテクチャ

```
frontend/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── common/         # 汎用コンポーネント
│   │   │   ├── Navigation/
│   │   │   ├── ErrorBoundary/
│   │   │   ├── LoadingSpinner/
│   │   │   └── Toast/
│   │   ├── forms/          # フォーム関連コンポーネント
│   │   ├── charts/         # グラフコンポーネント
│   │   └── love/           # Love機能専用コンポーネント
│   ├── pages/              # ページコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── services/           # API通信層
│   ├── store/              # 状態管理（Context API）
│   ├── types/              # TypeScript型定義
│   ├── styles/             # グローバルスタイル
│   └── utils/              # ユーティリティ関数
```

#### 主要な設計パターン

1. **コンポーネント設計**
   - Atomic Design の原則に基づいた階層構造
   - 単一責任原則に従った小さなコンポーネント
   - Love-themed デザインシステムの統一

2. **状態管理**
   - React 19 Context API + useReducer
   - 認証状態の集中管理
   - ローカル状態とグローバル状態の適切な分離

3. **API通信**
   - Axiosベースのサービス層
   - 自動トークンリフレッシュ
   - エラーハンドリングの一元化

### バックエンド アーキテクチャ

```
backend/
├── app/
│   ├── api/                # APIエンドポイント
│   │   ├── auth/          # 認証関連
│   │   ├── transactions/  # 取引管理
│   │   ├── categories/    # カテゴリ管理
│   │   ├── partnerships/  # パートナーシップ
│   │   ├── budgets/       # 予算管理
│   │   ├── reports/       # レポート生成
│   │   └── love/          # Love機能
│   ├── core/              # コア機能
│   │   ├── config.py      # 設定管理
│   │   ├── database.py    # DB接続
│   │   ├── security.py    # セキュリティ
│   │   └── deps.py        # 依存性注入
│   ├── models/            # SQLAlchemyモデル
│   ├── schemas/           # Pydanticスキーマ
│   ├── services/          # ビジネスロジック
│   └── utils/             # ユーティリティ
```

#### 主要な設計パターン

1. **レイヤードアーキテクチャ**
   - プレゼンテーション層（API）
   - ビジネスロジック層（Services）
   - データアクセス層（Models）

2. **依存性注入**
   - FastAPIのDependsを活用
   - テスタブルな設計
   - 疎結合の実現

3. **Repository パターン**
   - データアクセスの抽象化
   - SQLAlchemy ORMの活用
   - トランザクション管理

## データベース設計

### ER図

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Users     │     │  Partnerships    │     │   Users     │
├─────────────┤     ├──────────────────┤     ├─────────────┤
│ id          │←────│ user1_id         │────→│ id          │
│ email       │     │ user2_id         │     │ email       │
│ display_name│     │ status           │     │ display_name│
│ ...         │     │ love_anniversary │     │ ...         │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                     │                        │
       │                     │                        │
       ▼                     ▼                        ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│Transactions │     │  Love_Events     │     │ Categories  │
├─────────────┤     ├──────────────────┤     ├─────────────┤
│ id          │     │ id               │     │ id          │
│ user_id     │     │ partnership_id   │     │ name        │
│ category_id │     │ event_type       │     │ icon        │
│ amount      │     │ event_date       │     │ is_love     │
│ love_rating │     └──────────────────┘     └─────────────┘
└─────────────┘
```

### 主要テーブル

1. **users** - ユーザー情報
2. **partnerships** - パートナーシップ情報
3. **partnership_invitations** - 招待管理（別テーブル化）
4. **categories** - カテゴリマスタ
5. **transactions** - 取引データ
6. **shared_transactions** - 共有取引情報
7. **budgets** - 予算設定
8. **love_events** - Love記念日管理

## セキュリティ設計

### 認証・認可

1. **JWT (JSON Web Token)**
   - アクセストークン（30分）
   - リフレッシュトークン（30日）
   - 自動リフレッシュ機能

2. **パスワード管理**
   - bcryptによるハッシュ化
   - 8文字以上、英数字記号必須

3. **API セキュリティ**
   - HTTPS通信の強制
   - CORS設定
   - レート制限

### データ保護

1. **プライバシー設計**
   - 個人支出の詳細は非公開
   - 共有支出のみパートナーと共有
   - Love統計の選択的公開

2. **データ暗号化**
   - 通信時：TLS/SSL
   - 保存時：PostgreSQL暗号化

## スケーラビリティ設計

### 水平スケーリング

```
                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Frontend │       │Frontend │       │Frontend │
   │Instance │       │Instance │       │Instance │
   └─────────┘       └─────────┘       └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API GW    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Backend  │       │Backend  │       │Backend  │
   │Instance │       │Instance │       │Instance │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │   (Primary) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Read Replica│
                    └─────────────┘
```

### キャッシング戦略

1. **Redis キャッシュ**
   - セッション管理
   - 頻繁にアクセスされるデータ
   - Love統計の一時保存

2. **CDN活用**
   - 静的ファイル配信
   - 画像アセット
   - Love-themed アイコン

## パフォーマンス最適化

### フロントエンド

1. **React 19 最適化**
   - Code Splitting
   - Lazy Loading
   - メモ化の活用

2. **バンドル最適化**
   - Tree Shaking
   - 圧縮・最小化
   - チャンク分割

### バックエンド

1. **クエリ最適化**
   - インデックス設計
   - N+1問題の回避
   - 集計クエリの最適化

2. **非同期処理**
   - FastAPIの非同期サポート
   - バックグラウンドタスク
   - Celeryによるジョブキュー（将来）

## 監視・運用

### モニタリング

1. **アプリケーション監視**
   - エラーログ収集
   - パフォーマンスメトリクス
   - Love機能利用統計

2. **インフラ監視**
   - サーバーリソース
   - データベース性能
   - ネットワーク遅延

### バックアップ戦略

1. **データベース**
   - 日次フルバックアップ
   - WALによる増分バックアップ
   - ポイントインタイムリカバリ

2. **アプリケーション**
   - Dockerイメージのバージョン管理
   - 設定ファイルのGit管理
   - Love memories の安全な保存

## 開発環境

### Docker構成

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db, redis]
    
  db:
    image: postgres:15-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
```

### 開発ツール

1. **コード品質**
   - ESLint + Prettier（Frontend）
   - Black + isort + mypy（Backend）
   - pre-commit hooks

2. **テスト**
   - Jest + Testing Library（Frontend）
   - pytest + coverage（Backend）
   - E2Eテスト

## まとめ

Money Dairy Loversのアーキテクチャは、カップルの愛を育む家計管理という目的に最適化されています。スケーラブルで保守性の高い設計により、将来の機能拡張にも柔軟に対応できる構造となっています。

Love-themed な機能を技術的に実現しながら、セキュリティとプライバシーを確保し、カップルが安心して使えるプラットフォームを提供します。💕