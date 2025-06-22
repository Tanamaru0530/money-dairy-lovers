# 💕 Money Dairy Lovers - カップル向け家計簿アプリ

カップルで一緒に家計管理を楽しむための愛にあふれたWebアプリケーション。

![Love Theme](https://img.shields.io/badge/Love-Theme-ff69b4)
![React](https://img.shields.io/badge/React-19-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)

## 🌟 特徴

### 💑 カップル向け機能
- **Love Goals**: 二人の目標設定と達成管理
- **共有支出管理**: デート代や生活費の分担を簡単に
- **Love Analytics**: 愛の支出分析とレポート
- **記念日管理**: 大切な日を忘れない

### 📊 基本機能
- 収支の記録・管理
- カテゴリ別支出分析
- 月次・年次レポート
- 予算設定とアラート
- 定期取引の自動登録

### 🎨 Love-themed デザイン
- 愛らしいピンク系のカラースキーム
- ハートやカップルをモチーフにしたUI
- 使うたびに幸せになるデザイン

## 🚀 クイックスタート

### 前提条件
- Docker Desktop
- Git
- Node.js 18+ (開発時)
- Python 3.11+ (開発時)

### インストール

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/money-dairy-lovers.git
cd money-dairy-lovers
```

2. 環境変数の設定
```bash
cp .env.example .env
# .env ファイルを編集して必要な設定を行う
```

3. Dockerコンテナの起動
```bash
docker compose up -d
```

4. データベースのセットアップ
```bash
# マイグレーション実行
docker compose exec backend alembic upgrade heads

# 初期データ投入
docker compose exec backend python -m scripts.seed_categories
```

5. アプリケーションにアクセス
```
http://localhost:3000
```

## 📚 ドキュメント

- [デプロイメントガイド](DEPLOYMENT_GUIDE.md) - Ubuntu環境での本番デプロイ手順
- [要件定義書](CLAUDE.md) - 詳細な機能仕様とシステム設計

## 🛠️ 技術スタック

### フロントエンド
- **React 19**: 最新の React with TypeScript
- **Vite**: 高速な開発環境
- **SCSS Modules**: コンポーネントスコープのスタイリング
- **Chart.js**: 美しいグラフ表示
- **React Hook Form**: フォーム管理

### バックエンド
- **FastAPI**: 高性能な Python Web フレームワーク
- **SQLAlchemy**: ORM
- **Alembic**: データベースマイグレーション
- **JWT**: セキュアな認証
- **Pydantic**: データバリデーション

### インフラ
- **PostgreSQL 15**: メインデータベース
- **Redis**: キャッシュとセッション管理
- **Docker**: コンテナ化
- **Nginx**: リバースプロキシ（本番環境）

## 💻 開発

### 開発環境のセットアップ

```bash
# バックエンドの依存関係インストール
cd backend
pip install -r requirements.txt

# フロントエンドの依存関係インストール
cd ../frontend
npm install
```

### 開発サーバーの起動

```bash
# Docker を使用
docker compose up

# または個別に起動
# バックエンド
cd backend
uvicorn app.main:app --reload

# フロントエンド
cd frontend
npm run dev
```

### テストの実行

```bash
# バックエンドテスト
cd backend
pytest

# フロントエンドテスト
cd frontend
npm test
```

## 📧 メール設定

Gmail を使用する場合の設定手順：

1. [2段階認証を有効化](https://myaccount.google.com/security)
2. [アプリパスワードを生成](https://myaccount.google.com/apppasswords)
3. `.env` ファイルに設定を追加

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🏗️ プロジェクト構造

```
money-dairy-lovers/
├── frontend/               # React 19 アプリケーション
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── services/      # API通信
│   │   ├── store/         # 状態管理 (Context API)
│   │   ├── styles/        # SCSS スタイル
│   │   └── types/         # TypeScript型定義
│   └── Dockerfile
├── backend/               # FastAPI アプリケーション
│   ├── app/
│   │   ├── api/          # APIエンドポイント
│   │   ├── core/         # 設定・セキュリティ
│   │   ├── models/       # SQLAlchemyモデル
│   │   ├── schemas/      # Pydanticスキーマ
│   │   └── services/     # ビジネスロジック
│   ├── alembic/          # マイグレーション
│   └── Dockerfile
├── deploy/               # デプロイメント関連
│   ├── ubuntu-setup.sh   # Ubuntu環境セットアップ
│   └── ubuntu-deploy.sh  # デプロイスクリプト
└── docker-compose.yml    # Docker設定
```

## 🔒 セキュリティ

- すべての通信は HTTPS（本番環境）
- パスワードは bcrypt でハッシュ化
- JWT によるステートレス認証
- CORS 設定による適切なアクセス制御
- SQL インジェクション対策済み

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まず Issue を作成して変更内容を議論してください。

1. Fork する
2. Feature ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Request を作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 💖 謝辞

- すべての愛するカップルたちへ
- オープンソースコミュニティへの感謝
- 素晴らしいライブラリとツールの作者たち

---

Made with 💕 by Money Dairy Lovers Team