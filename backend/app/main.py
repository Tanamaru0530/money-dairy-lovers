from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os

from app.core.config import settings
from app.utils.rate_limiter import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware
from app.api.auth import auth
from app.api.partnerships import partnerships
from app.api.categories.categories import router as categories_router
from app.api.transactions import transactions
from app.api.budgets import budgets
from app.api.dashboard import dashboard
from app.api.reports import reports
from app.api.love import love
from app.api import recurring_transactions
from app.api import users
from app.api import notifications

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("💕 Money Dairy Lovers backend starting up...")
    yield
    # Shutdown
    logger.info("💕 Money Dairy Lovers backend shutting down...")


app = FastAPI(
    title="Money Dairy Lovers API",
    description="カップル向け家計簿アプリ - 愛を育む家計管理API",
    version="1.0.0",
    lifespan=lifespan
)

# Rate limiting state を追加
app.state.limiter = limiter

# Rate limit exception handler を追加
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# セキュリティミドルウェアを追加
app.add_middleware(
    SecurityHeadersMiddleware,
    debug=(settings.ENVIRONMENT == "development")
)

# リクエストロギングミドルウェアを追加
app.add_middleware(RequestLoggingMiddleware)

# CORS設定（セキュリティ強化）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # 具体的なメソッドを指定
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],  # 必要なヘッダーのみ
)


# Add validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc}")
    logger.error(f"Request body: {exc.body}")
    logger.error(f"Errors: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)}
    )


# Add request logging middleware for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request details for login endpoint
    if request.url.path == "/api/v1/auth/login":
        logger.info(f"Login request - Method: {request.method}")
        logger.info(f"Login request - Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    # Log response status for login endpoint
    if request.url.path == "/api/v1/auth/login":
        logger.info(f"Login response - Status: {response.status_code}")
    
    return response


# ルートエンドポイント
@app.get("/")
async def root():
    return {
        "message": "💕 Welcome to Money Dairy Lovers API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ヘルスチェック
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "money-dairy-lovers-backend",
        "love": "💕"
    }

# API v1 ヘルスチェック
@app.get("/api/v1/health")
async def api_health_check():
    return {
        "status": "healthy",
        "service": "money-dairy-lovers-backend",
        "version": "v1",
        "love": "💕"
    }


# Love health check
@app.get("/health/love")
async def love_health_check():
    return {
        "status": "love is in the air",
        "love_level": "100%",
        "message": "愛は健在です 💕"
    }


# 静的ファイルのマウント（プロフィール画像用）
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# APIルーターの登録
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(partnerships.router, prefix=f"{settings.API_V1_STR}/partnerships", tags=["partnerships"])
app.include_router(categories_router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix=f"{settings.API_V1_STR}/budgets", tags=["budgets"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(love.router, prefix=f"{settings.API_V1_STR}/love", tags=["love"])
app.include_router(recurring_transactions.router, prefix=f"{settings.API_V1_STR}/recurring-transactions", tags=["recurring_transactions"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])