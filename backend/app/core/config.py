from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import secrets
import os


class Settings(BaseSettings):
    # Basic
    PROJECT_NAME: str = "Money Dairy Lovers"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """
        SECRET_KEYを検証・生成
        """
        if v:
            # 環境変数から取得できた場合
            if len(v) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters long")
            return v
        
        # 環境変数にない場合の処理
        env_secret = os.getenv("SECRET_KEY")
        if env_secret:
            if len(env_secret) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters long")
            return env_secret
        
        # 開発環境でのみ自動生成を許可
        environment = os.getenv("ENVIRONMENT", "development")
        if environment == "development":
            # 開発環境では警告を出しつつ一時的なキーを生成
            import warnings
            warnings.warn(
                "SECRET_KEY not set in environment variables. "
                "Using temporary key for development. "
                "Set SECRET_KEY environment variable for production.",
                UserWarning
            )
            return secrets.token_urlsafe(32)
        
        # 本番環境ではエラー
        raise ValueError(
            "SECRET_KEY environment variable is required for production. "
            "Please set a secure random key of at least 32 characters."
        )
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/money_dairy_lovers"
    DATABASE_URL_TEST: str = ""
    
    # CORS
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        # Get CORS origins from environment variable or use defaults
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
        return [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = ""
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@money-dairy-lovers.com"
    EMAILS_FROM_NAME: str = "Money Dairy Lovers"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File Upload
    MAX_FILE_SIZE: int = 5242880  # 5MB
    
    @property
    def ALLOWED_EXTENSIONS(self) -> List[str]:
        # Get allowed extensions from environment variable or use defaults
        extensions = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,pdf")
        return [ext.strip() for ext in extensions.split(",") if ext.strip()]
    
    # Love Features
    ENABLE_LOVE_ANALYTICS: bool = True
    
    @property
    def DEFAULT_LOVE_CATEGORIES(self) -> List[str]:
        # Get love categories from environment variable or use defaults
        categories = os.getenv("DEFAULT_LOVE_CATEGORIES", "デート代,プレゼント,記念日")
        return [cat.strip() for cat in categories.split(",") if cat.strip()]
    
    # URLs
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()