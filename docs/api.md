# Money Dairy Lovers - API仕様書

## 概要

Money Dairy Lovers APIは、カップル向け家計簿アプリケーションのバックエンドAPIです。RESTfulな設計に基づき、Love-themedな機能を提供します。

## API基本情報

### ベースURL
- 開発環境: `http://localhost:8000/api/v1`
- 本番環境: `https://api.money-dairy-lovers.com/v1`

### 認証方式
- JWT (JSON Web Token) Bearer認証
- ヘッダー形式: `Authorization: Bearer <token>`

### レスポンス形式
- Content-Type: `application/json`
- 文字エンコーディング: UTF-8

### エラーレスポンス
```json
{
  "detail": "エラーメッセージ",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## エンドポイント一覧

### 認証 (Authentication)

#### POST /auth/register
ユーザー登録

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "田中太郎"
}
```

**レスポンス (201 Created):**
```json
{
  "message": "Registration successful. Please verify your email.",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### POST /auth/login
ログイン

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**レスポンス (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "display_name": "田中太郎"
  }
}
```

#### POST /auth/refresh
トークンリフレッシュ

**リクエスト:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**レスポンス (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST /auth/logout
ログアウト

**レスポンス (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### GET /auth/me
現在のユーザー情報取得

**レスポンス (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "display_name": "田中太郎",
  "has_partner": true,
  "partnership": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "partner": {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "display_name": "田中花子"
    },
    "status": "active",
    "love_anniversary": "2024-02-14"
  }
}
```

### カテゴリ管理 (Categories)

#### GET /categories
カテゴリ一覧取得

**レスポンス (200 OK):**
```json
{
  "categories": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "食費",
      "icon": "🍽️",
      "color": "#FF6B6B",
      "is_default": true,
      "is_love_category": false,
      "transaction_count": 45,
      "total_amount": 65000
    },
    {
      "id": "234e5678-e89b-12d3-a456-426614174000",
      "name": "デート代",
      "icon": "💕",
      "color": "#FF69B4",
      "is_default": true,
      "is_love_category": true,
      "transaction_count": 12,
      "total_amount": 45000
    }
  ]
}
```

#### POST /categories
カテゴリ作成

**リクエスト:**
```json
{
  "name": "ペット費用",
  "icon": "🐕",
  "color": "#8B4513"
}
```

**レスポンス (201 Created):**
```json
{
  "id": "345e6789-e89b-12d3-a456-426614174000",
  "name": "ペット費用",
  "icon": "🐕",
  "color": "#8B4513",
  "is_default": false,
  "is_love_category": false,
  "transaction_count": 0,
  "total_amount": 0
}
```

#### PUT /categories/{category_id}
カテゴリ更新

**リクエスト:**
```json
{
  "name": "ペット関連費",
  "icon": "🐾",
  "color": "#D2691E"
}
```

**レスポンス (200 OK):**
カテゴリオブジェクト

#### DELETE /categories/{category_id}
カテゴリ削除

**レスポンス (204 No Content)**

### 取引管理 (Transactions)

#### GET /transactions
取引一覧取得

**パラメータ:**
- `page` (int): ページ番号 (デフォルト: 1)
- `limit` (int): 1ページの件数 (デフォルト: 20, 最大: 100)
- `category_id` (uuid): カテゴリID
- `transaction_type` (string): income | expense
- `sharing_type` (string): personal | shared
- `date_from` (date): 開始日
- `date_to` (date): 終了日
- `search` (string): 検索キーワード
- `love_rating` (int): Love評価 (1-5)

**レスポンス (200 OK):**
```json
{
  "transactions": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "amount": 3500,
      "transaction_type": "expense",
      "sharing_type": "shared",
      "payment_method": "credit_card",
      "description": "イタリアンレストランでディナー",
      "transaction_date": "2025-01-15",
      "category": {
        "id": "234e5678-e89b-12d3-a456-426614174000",
        "name": "デート代",
        "icon": "💕",
        "color": "#FF69B4",
        "is_love_category": true
      },
      "love_rating": 5,
      "tags": ["記念日", "イタリアン"],
      "location": "青山レストラン",
      "shared_info": {
        "split_type": "equal",
        "user1_amount": 1750,
        "user2_amount": 1750,
        "payer": {
          "id": "789e0123-e89b-12d3-a456-426614174000",
          "display_name": "田中太郎"
        }
      },
      "created_at": "2025-01-15T19:30:00Z",
      "updated_at": "2025-01-15T19:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### POST /transactions
取引作成

**リクエスト:**
```json
{
  "amount": 3500,
  "transaction_type": "expense",
  "sharing_type": "shared",
  "payment_method": "credit_card",
  "description": "イタリアンレストランでディナー",
  "transaction_date": "2025-01-15",
  "category_id": "234e5678-e89b-12d3-a456-426614174000",
  "love_rating": 5,
  "tags": ["記念日", "イタリアン"],
  "location": "青山レストラン",
  "shared_info": {
    "split_type": "equal"
  }
}
```

**レスポンス (201 Created):**
取引オブジェクト

#### GET /transactions/{transaction_id}
取引詳細取得

**レスポンス (200 OK):**
取引オブジェクト

#### PUT /transactions/{transaction_id}
取引更新

**リクエスト:**
取引作成と同じ形式

**レスポンス (200 OK):**
取引オブジェクト

#### DELETE /transactions/{transaction_id}
取引削除

**レスポンス (204 No Content)**

### パートナーシップ (Partnerships)

#### POST /partnerships/invite
パートナー招待

**レスポンス (200 OK):**
```json
{
  "invitation_code": "ABC123",
  "expires_at": "2025-01-17T00:00:00Z",
  "message": "招待コードを共有してください"
}
```

#### POST /partnerships/accept
招待受諾

**リクエスト:**
```json
{
  "invitation_code": "ABC123"
}
```

**レスポンス (200 OK):**
```json
{
  "message": "パートナーシップが確立されました",
  "partnership": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "partner": {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "display_name": "田中花子"
    },
    "status": "active"
  }
}
```

#### GET /partnerships
パートナーシップ情報取得

**レスポンス (200 OK):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "partner": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "display_name": "田中花子",
    "email": "hanako@example.com"
  },
  "status": "active",
  "love_anniversary": "2024-02-14",
  "relationship_type": "dating",
  "created_at": "2024-02-14T00:00:00Z"
}
```

#### PUT /partnerships/{partnership_id}
パートナーシップ更新

**リクエスト:**
```json
{
  "love_anniversary": "2024-02-14",
  "relationship_type": "married"
}
```

**レスポンス (200 OK):**
パートナーシップオブジェクト

### 予算管理 (Budgets)

#### GET /budgets
予算一覧取得

**パラメータ:**
- `is_active` (bool): アクティブな予算のみ

**レスポンス (200 OK):**
```json
{
  "budgets": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "今月の生活費",
      "amount": 200000,
      "period": "monthly",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "category": null,
      "current_amount": 125000,
      "percentage": 62.5,
      "alert_threshold": 80.0,
      "is_active": true,
      "is_love_budget": false
    },
    {
      "id": "234e5678-e89b-12d3-a456-426614174000",
      "name": "デート予算",
      "amount": 50000,
      "period": "monthly",
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "category": {
        "id": "234e5678-e89b-12d3-a456-426614174000",
        "name": "デート代",
        "icon": "💕"
      },
      "current_amount": 35000,
      "percentage": 70.0,
      "alert_threshold": 80.0,
      "is_active": true,
      "is_love_budget": true
    }
  ]
}
```

#### POST /budgets
予算作成

**リクエスト:**
```json
{
  "name": "旅行積立",
  "amount": 30000,
  "period": "monthly",
  "start_date": "2025-01-01",
  "category_id": null,
  "alert_threshold": 90.0,
  "is_love_budget": true
}
```

**レスポンス (201 Created):**
予算オブジェクト

#### GET /budgets/{budget_id}
予算詳細取得

**レスポンス (200 OK):**
予算オブジェクト（現在の使用状況含む）

#### PUT /budgets/{budget_id}
予算更新

**リクエスト:**
予算作成と同じ形式

**レスポンス (200 OK):**
予算オブジェクト

#### DELETE /budgets/{budget_id}
予算削除

**レスポンス (204 No Content)**

### レポート (Reports)

#### GET /reports/monthly
月次レポート取得

**パラメータ:**
- `year` (int): 年 (デフォルト: 今年)
- `month` (int): 月 (デフォルト: 今月)

**レスポンス (200 OK):**
```json
{
  "period": {
    "year": 2025,
    "month": 1,
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  },
  "summary": {
    "total_income": 500000,
    "total_expense": 325000,
    "balance": 175000,
    "personal_expense": 200000,
    "shared_expense": 125000,
    "transaction_count": 87
  },
  "category_breakdown": [
    {
      "category": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "食費",
        "icon": "🍽️",
        "color": "#FF6B6B"
      },
      "amount": 65000,
      "percentage": 20.0,
      "transaction_count": 32
    }
  ],
  "daily_trend": [
    {
      "date": "2025-01-01",
      "income": 0,
      "expense": 5500
    }
  ],
  "comparison": {
    "previous_month": {
      "total_expense": 310000,
      "difference": 15000,
      "percentage_change": 4.8
    }
  }
}
```

#### GET /reports/yearly
年次レポート取得

**パラメータ:**
- `year` (int): 年 (デフォルト: 今年)

**レスポンス (200 OK):**
```json
{
  "period": {
    "year": 2025,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  },
  "summary": {
    "total_income": 6000000,
    "total_expense": 3900000,
    "balance": 2100000,
    "average_monthly_expense": 325000
  },
  "monthly_breakdown": [
    {
      "month": 1,
      "income": 500000,
      "expense": 325000,
      "balance": 175000
    }
  ],
  "category_analysis": [
    {
      "category": {
        "id": "234e5678-e89b-12d3-a456-426614174000",
        "name": "デート代",
        "icon": "💕",
        "is_love_category": true
      },
      "total_amount": 540000,
      "average_monthly": 45000,
      "percentage": 13.8
    }
  ]
}
```

#### GET /reports/export
レポートエクスポート

**パラメータ:**
- `format` (string): csv | pdf
- `period` (string): monthly | yearly | custom
- `start_date` (date): 開始日 (customの場合)
- `end_date` (date): 終了日 (customの場合)

**レスポンス (200 OK):**
ファイルダウンロード

### Love機能 (Love Features)

#### GET /love/statistics
Love統計取得

**パラメータ:**
- `period` (string): month | year | all (デフォルト: month)
- `year` (int): 年
- `month` (int): 月

**レスポンス (200 OK):**
```json
{
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "description": "2025年1月"
  },
  "love_summary": {
    "total_love_spending": 85000,
    "love_transaction_count": 15,
    "avg_love_rating": 4.7,
    "favorite_love_category": "デート代"
  },
  "love_categories": [
    {
      "category": {
        "id": "234e5678-e89b-12d3-a456-426614174000",
        "name": "デート代",
        "icon": "💕"
      },
      "amount": 45000,
      "percentage": 52.9,
      "avg_rating": 4.8
    },
    {
      "category": {
        "id": "345e6789-e89b-12d3-a456-426614174000",
        "name": "プレゼント",
        "icon": "🎁"
      },
      "amount": 30000,
      "percentage": 35.3,
      "avg_rating": 5.0
    }
  ],
  "love_timeline": [
    {
      "date": "2025-01-14",
      "amount": 25000,
      "rating": 5.0,
      "description": "記念日ディナー"
    }
  ]
}
```

#### GET /love/events
Love イベント一覧取得

**レスポンス (200 OK):**
```json
{
  "events": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "event_type": "anniversary",
      "name": "付き合った記念日",
      "event_date": "2025-02-14",
      "is_recurring": true,
      "recurrence_type": "yearly",
      "description": "2年目の記念日",
      "reminder_days": 7,
      "is_active": true
    }
  ]
}
```

#### POST /love/events
Love イベント作成

**リクエスト:**
```json
{
  "event_type": "anniversary",
  "name": "プロポーズ記念日",
  "event_date": "2025-12-24",
  "is_recurring": true,
  "recurrence_type": "yearly",
  "description": "クリスマスイブにプロポーズ",
  "reminder_days": 14
}
```

**レスポンス (201 Created):**
Love イベントオブジェクト

#### GET /love/calendar
Love カレンダー取得

**パラメータ:**
- `year` (int): 年
- `month` (int): 月

**レスポンス (200 OK):**
```json
{
  "year": 2025,
  "month": 2,
  "events": [
    {
      "date": "2025-02-14",
      "events": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "付き合った記念日",
          "event_type": "anniversary",
          "icon": "💕"
        }
      ],
      "transactions": [
        {
          "id": "456e7890-e89b-12d3-a456-426614174000",
          "amount": 50000,
          "category": "デート代",
          "love_rating": 5
        }
      ]
    }
  ]
}
```

## HTTPステータスコード

| コード | 説明 | 使用例 |
|--------|------|--------|
| 200 | OK | 正常な取得・更新 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功 |
| 400 | Bad Request | 不正なリクエスト |
| 401 | Unauthorized | 認証が必要 |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが見つからない |
| 409 | Conflict | データの競合 |
| 422 | Unprocessable Entity | バリデーションエラー |
| 429 | Too Many Requests | レート制限超過 |
| 500 | Internal Server Error | サーバーエラー |

## レート制限

### 制限値
- 認証エンドポイント: 10回/分 (IP単位)
- 一般API: 100回/分 (ユーザー単位)
- ファイルアップロード: 10回/分 (ユーザー単位)

### レスポンスヘッダー
```
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1625097600
```

## セキュリティ

### CORS設定
```
Access-Control-Allow-Origin: http://localhost:3000, https://money-dairy-lovers.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

### セキュリティヘッダー
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## API バージョニング

### 現在のバージョン
- v1 (現行)

### バージョン管理方針
- URLパスにバージョンを含める (`/api/v1/`)
- 後方互換性を保つ
- 破壊的変更は新バージョンで提供
- 旧バージョンは最低12ヶ月サポート

## 今後の拡張予定

### v2で予定される機能
- GraphQL サポート
- WebSocket によるリアルタイム通知
- 外部サービス連携（銀行API等）
- AI による支出分析・予測

## お問い合わせ

API に関するお問い合わせは以下まで：
- Email: api-support@money-dairy-lovers.com
- GitHub Issues: https://github.com/money-dairy-lovers/api/issues

---

*Love を込めて開発された API です 💕*