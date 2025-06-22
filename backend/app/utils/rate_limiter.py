from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Redis を使用したレート制限
limiter = Limiter(key_func=get_remote_address)

# カスタムエラーハンドラー
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    レート制限超過時のカスタムエラーレスポンス
    """
    logger.warning(
        f"Rate limit exceeded for {get_remote_address(request)}: "
        f"{request.method} {request.url.path}"
    )
    
    return JSONResponse(
        status_code=429,
        content={
            "detail": "リクエストの制限に達しました。しばらく時間をおいてから再試行してください。",
            "error_code": "RATE_LIMIT_EXCEEDED",
            "retry_after": exc.retry_after,
        },
        headers={"Retry-After": str(exc.retry_after)}
    )

# レート制限の設定
class RateLimits:
    # 認証関連（厳しい制限）
    AUTH_LOGIN = "10/minute"           # ログイン試行
    AUTH_REGISTER = "5/minute"         # 新規登録
    AUTH_PASSWORD_RESET = "3/minute"   # パスワードリセット
    AUTH_REFRESH = "20/minute"         # トークンリフレッシュ
    
    # 一般API（通常の制限）
    API_READ = "60/minute"             # 読み取り操作
    API_WRITE = "30/minute"            # 書き込み操作
    API_DELETE = "10/minute"           # 削除操作
    
    # ファイルアップロード（厳しい制限）
    FILE_UPLOAD = "5/minute"           # ファイルアップロード
    
    # 重い処理（厳しい制限）
    REPORT_GENERATION = "5/minute"     # レポート生成
    BULK_OPERATIONS = "3/minute"       # 一括操作
    
    # パートナーシップ関連
    PARTNERSHIP_INVITE = "3/minute"    # パートナー招待
    PARTNERSHIP_ACCEPT = "5/minute"    # パートナー承認

def get_user_key(request: Request) -> str:
    """
    認証されたユーザーのキーを取得
    認証されていない場合はIPアドレスを使用
    """
    # JWTトークンからユーザーIDを取得する場合
    # 現在は簡単のためIPアドレスを使用
    return get_remote_address(request)

# ユーザーベースのリミッター
user_limiter = Limiter(key_func=get_user_key)

def create_rate_limiter(rate: str, per_user: bool = False):
    """
    レート制限デコレータを作成
    
    Args:
        rate: レート制限の設定 (例: "10/minute")
        per_user: ユーザーベースの制限かどうか
    """
    if per_user:
        return user_limiter.limit(rate)
    else:
        return limiter.limit(rate)