import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.user import User


class TestAuth:
    """認証APIのテストクラス"""
    
    @pytest.mark.asyncio
    async def test_register_user(self, async_client: AsyncClient):
        """ユーザー登録のテスト"""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "Test123!@#",
                "display_name": "Test User",
                "love_theme_preference": "default"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["display_name"] == "Test User"
        assert "id" in data
        assert "hashed_password" not in data
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client: AsyncClient, test_user):
        """重複メールアドレスでの登録テスト"""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,
                "password": "Test123!@#",
                "display_name": "Another User"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, async_client: AsyncClient):
        """弱いパスワードでの登録テスト"""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "weak@example.com",
                "password": "weak",
                "display_name": "Weak Password User",
                "love_theme_preference": "default"
            }
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        assert any("at least 8 characters" in str(error) for error in errors)
    
    @pytest.mark.asyncio
    async def test_login_valid_credentials(self, async_client: AsyncClient, test_user):
        """正しい認証情報でのログインテスト"""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user.email
    
    @pytest.mark.asyncio
    async def test_login_invalid_password(self, async_client: AsyncClient, test_user):
        """間違ったパスワードでのログインテスト"""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client: AsyncClient):
        """存在しないユーザーでのログインテスト"""
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_current_user(self, async_client: AsyncClient, test_user, auth_headers):
        """現在のユーザー情報取得テスト"""
        response = await async_client.get(
            "/api/v1/auth/me",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["display_name"] == test_user.display_name
    
    @pytest.mark.asyncio
    async def test_get_current_user_unauthorized(self, async_client: AsyncClient):
        """認証なしでのユーザー情報取得テスト"""
        response = await async_client.get("/api/v1/auth/me")
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_refresh_token(self, async_client: AsyncClient, test_user):
        """リフレッシュトークンのテスト"""
        # まずログイン
        login_response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user.email,
                "password": "TestPassword123!"
            }
        )
        refresh_token = login_response.json()["refresh_token"]
        
        # リフレッシュトークンを使用
        response = await async_client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, async_client: AsyncClient):
        """無効なリフレッシュトークンのテスト"""
        response = await async_client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_logout(self, async_client: AsyncClient, auth_headers):
        """ログアウトのテスト"""
        response = await async_client.post(
            "/api/v1/auth/logout",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"
    
    def test_password_hashing(self):
        """パスワードハッシュ化のテスト"""
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        
        # ハッシュ化されたパスワードは元のパスワードと異なる
        assert hashed != password
        
        # 正しいパスワードで検証すると True
        assert verify_password(password, hashed) is True
        
        # 間違ったパスワードで検証すると False
        assert verify_password("WrongPassword", hashed) is False
    
    @pytest.mark.asyncio
    async def test_inactive_user_login(self, async_client: AsyncClient, db_session: AsyncSession):
        """非アクティブユーザーのログインテスト"""
        # 非アクティブユーザーを作成
        inactive_user = User(
            email="inactive@example.com",
            hashed_password=get_password_hash("InactivePass123!"),
            display_name="Inactive User",
            is_active=False,
            love_theme_preference="default"
        )
        db_session.add(inactive_user)
        await db_session.commit()
        
        # ログイン試行
        response = await async_client.post(
            "/api/v1/auth/login",
            data={
                "username": "inactive@example.com",
                "password": "InactivePass123!"
            }
        )
        assert response.status_code == 400
        assert "Inactive user" in response.json()["detail"]