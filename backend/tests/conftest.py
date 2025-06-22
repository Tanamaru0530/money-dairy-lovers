import asyncio
from typing import AsyncGenerator, Generator
import os

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User

# テスト用データベースURL
# Docker環境内で実行される場合はそのまま使用、そうでなければlocalhostに変更
if os.getenv("RUNNING_IN_DOCKER"):
    TEST_DATABASE_URL = settings.DATABASE_URL_TEST.replace("postgresql://", "postgresql+asyncpg://")
else:
    TEST_DATABASE_URL = "postgresql+asyncpg://postgres:your-secure-password-here@localhost:5432/money_dairy_lovers_test"

# テスト用のデータベースエンジン
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

# テスト用のセッションメーカー
TestingSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """イベントループのフィクスチャ"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """テスト用データベースセッションのフィクスチャ"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
        await session.close()


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """テスト用HTTPクライアントのフィクスチャ"""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    # ASGITransportを使用してAsyncClientを作成
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """テスト用ユーザーのフィクスチャ"""
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        display_name="Test User",
        is_active=True,
        email_verified=True,
        love_theme_preference="default"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_user2(db_session: AsyncSession) -> User:
    """テスト用ユーザー2のフィクスチャ"""
    user = User(
        email="testuser2@example.com",
        hashed_password=get_password_hash("TestPassword456!"),
        display_name="Test User 2",
        is_active=True,
        email_verified=True,
        love_theme_preference="default"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """認証ヘッダーのフィクスチャ"""
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def auth_headers2(test_user2: User) -> dict:
    """認証ヘッダー2のフィクスチャ"""
    access_token = create_access_token(data={"sub": test_user2.email})
    return {"Authorization": f"Bearer {access_token}"}