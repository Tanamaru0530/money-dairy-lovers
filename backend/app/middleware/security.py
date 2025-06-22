from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import logging

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    セキュリティヘッダーを追加するミドルウェア
    """
    
    def __init__(self, app, debug: bool = False):
        super().__init__(app)
        self.debug = debug
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # セキュリティヘッダーを追加
        self._add_security_headers(response, request)
        
        return response
    
    def _add_security_headers(self, response: Response, request: Request) -> None:
        """
        レスポンスにセキュリティヘッダーを追加
        """
        # X-Content-Type-Options: MIMEタイプの推測を防ぐ
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # X-Frame-Options: クリックジャッキング攻撃を防ぐ
        response.headers["X-Frame-Options"] = "DENY"
        
        # X-XSS-Protection: XSS攻撃を防ぐ（古いブラウザ対応）
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer-Policy: リファラー情報の制御
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content-Security-Policy: XSS攻撃を防ぐ
        csp_policy = self._get_csp_policy(request)
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Strict-Transport-Security: HTTPS強制（本番環境のみ）
        if not self.debug and request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Permissions-Policy: 機能の使用を制限
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=(), "
            "accelerometer=(), ambient-light-sensor=()"
        )
        
        # X-Permitted-Cross-Domain-Policies: Flash/PDF関連の制限
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        
        # Cache-Control: 機密情報のキャッシュを防ぐ
        if self._is_sensitive_endpoint(request.url.path):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        # セキュリティ関連のカスタムヘッダー
        response.headers["X-Money-Dairy-Lovers"] = "Secure API"
        response.headers["X-API-Version"] = "v1"
        
        # 開発環境でのみデバッグ情報
        if self.debug:
            response.headers["X-Debug-Mode"] = "true"
    
    def _get_csp_policy(self, request: Request) -> str:
        """
        Content Security Policy を生成
        """
        # 基本ポリシー（厳格）
        base_policy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",  # React開発用に'unsafe-inline'を許可
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ]
        
        # 開発環境では制限を緩和
        if self.debug:
            # WebSocketとHMRを許可
            base_policy = [p.replace("connect-src 'self'", "connect-src 'self' ws: wss:") for p in base_policy]
            # 開発サーバーのアセットを許可
            base_policy = [p.replace("script-src 'self' 'unsafe-inline'", 
                                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'") for p in base_policy]
        
        return "; ".join(base_policy)
    
    def _is_sensitive_endpoint(self, path: str) -> bool:
        """
        機密情報を含むエンドポイントかどうかを判定
        """
        sensitive_patterns = [
            "/auth/",
            "/users/",
            "/transactions/",
            "/partnerships/",
            "/love/",
            "/reports/"
        ]
        return any(pattern in path for pattern in sensitive_patterns)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    リクエストのセキュリティログを記録するミドルウェア
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # セキュリティ関連の情報をログ記録
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "Unknown")
        
        # 認証関連エンドポイントでは詳細ログ
        if "/auth/" in request.url.path:
            logger.info(
                f"Auth request - IP: {client_ip}, "
                f"Path: {request.url.path}, "
                f"Method: {request.method}, "
                f"User-Agent: {user_agent[:50]}..."
            )
        
        # 疑わしいリクエストパターンを検出
        self._detect_suspicious_patterns(request, client_ip)
        
        response = await call_next(request)
        
        # レスポンスコードのログ記録
        if response.status_code >= 400:
            logger.warning(
                f"Error response - IP: {client_ip}, "
                f"Path: {request.url.path}, "
                f"Status: {response.status_code}"
            )
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """
        クライアントIPアドレスを取得（プロキシ対応）
        """
        # X-Forwarded-For ヘッダーを確認（信頼できるプロキシからのみ）
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # 最初のIPアドレスを使用
            return forwarded_for.split(",")[0].strip()
        
        # X-Real-IP ヘッダーを確認
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # 直接接続の場合
        return getattr(request.client, "host", "unknown")
    
    def _detect_suspicious_patterns(self, request: Request, client_ip: str) -> None:
        """
        疑わしいリクエストパターンを検出
        """
        path = request.url.path.lower()
        query = str(request.url.query).lower()
        
        # SQL インジェクション試行の検出
        sql_injection_patterns = [
            "union select", "drop table", "insert into", "delete from",
            "update set", "exec ", "script>", "javascript:", "vbscript:",
            "' or '", "' union", "' and '", "' having", "' group by"
        ]
        
        # XSS 試行の検出
        xss_patterns = [
            "<script", "</script>", "javascript:", "vbscript:", "onload=",
            "onerror=", "onclick=", "onmouseover=", "eval(", "alert("
        ]
        
        # パストラバーサル試行の検出
        path_traversal_patterns = [
            "../", "..\\", "%2e%2e", "%2f", "%5c", "..%2f", "..%5c"
        ]
        
        # 検出ロジック
        all_patterns = {
            "SQL Injection": sql_injection_patterns,
            "XSS": xss_patterns,
            "Path Traversal": path_traversal_patterns
        }
        
        for attack_type, patterns in all_patterns.items():
            for pattern in patterns:
                if pattern in path or pattern in query:
                    logger.warning(
                        f"Suspicious request detected - Type: {attack_type}, "
                        f"Pattern: {pattern}, IP: {client_ip}, "
                        f"Path: {request.url.path}, "
                        f"User-Agent: {request.headers.get('user-agent', 'Unknown')[:50]}"
                    )
                    break