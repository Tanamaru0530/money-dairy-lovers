import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.category import Category


class TestCategories:
    """カテゴリAPIのテストクラス"""
    
    @pytest.fixture
    async def default_categories(self, db_session: AsyncSession) -> list[Category]:
        """デフォルトカテゴリのフィクスチャ"""
        categories = [
            Category(name="食費", icon="🍽️", color="#FF6B6B", is_default=True, is_love_category=False),
            Category(name="交通費", icon="🚗", color="#4ECDC4", is_default=True, is_love_category=False),
            Category(name="住居費", icon="🏠", color="#45B7D1", is_default=True, is_love_category=False),
            Category(name="デート代", icon="💕", color="#FF69B4", is_default=True, is_love_category=True),
            Category(name="プレゼント", icon="🎁", color="#FF1493", is_default=True, is_love_category=True),
        ]
        db_session.add_all(categories)
        await db_session.commit()
        return categories
    
    @pytest.mark.asyncio
    async def test_get_categories(
        self,
        async_client: AsyncClient,
        test_user: User,
        default_categories: list[Category],
        auth_headers: dict
    ):
        """カテゴリ一覧取得のテスト"""
        response = await async_client.get(
            "/api/v1/categories",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) == 5
        
        # デフォルトカテゴリが含まれていることを確認
        category_names = [cat["name"] for cat in data["categories"]]
        assert "食費" in category_names
        assert "デート代" in category_names
        
        # Love カテゴリのフラグを確認
        love_categories = [cat for cat in data["categories"] if cat["is_love_category"]]
        assert len(love_categories) == 2
    
    @pytest.mark.asyncio
    async def test_create_custom_category(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict
    ):
        """カスタムカテゴリ作成のテスト"""
        response = await async_client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "趣味",
                "icon": "🎮",
                "color": "#9B59B6"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "趣味"
        assert data["icon"] == "🎮"
        assert data["color"] == "#9B59B6"
        assert data["is_default"] is False
        assert data["is_love_category"] is False
        assert data["user_id"] == str(test_user.id)
    
    @pytest.mark.asyncio
    async def test_create_duplicate_category_name(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """重複カテゴリ名での作成（失敗すべき）のテスト"""
        # カスタムカテゴリを作成
        category = Category(
            name="既存カテゴリ",
            icon="📁",
            color="#34495E",
            is_default=False,
            user_id=test_user.id
        )
        db_session.add(category)
        await db_session.commit()
        
        # 同じ名前で作成を試みる
        response = await async_client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "既存カテゴリ",
                "icon": "📂",
                "color": "#2C3E50"
            }
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_update_custom_category(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """カスタムカテゴリ更新のテスト"""
        # カスタムカテゴリを作成
        category = Category(
            name="更新前",
            icon="📁",
            color="#34495E",
            is_default=False,
            user_id=test_user.id
        )
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        
        # カテゴリを更新
        response = await async_client.put(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers,
            json={
                "name": "更新後",
                "icon": "📂",
                "color": "#2C3E50"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "更新後"
        assert data["icon"] == "📂"
        assert data["color"] == "#2C3E50"
    
    @pytest.mark.asyncio
    async def test_update_default_category(
        self,
        async_client: AsyncClient,
        test_user: User,
        default_categories: list[Category],
        auth_headers: dict
    ):
        """デフォルトカテゴリ更新（失敗すべき）のテスト"""
        default_category = default_categories[0]  # 食費
        
        response = await async_client.put(
            f"/api/v1/categories/{default_category.id}",
            headers=auth_headers,
            json={
                "name": "変更された食費",
                "icon": "🍱"
            }
        )
        assert response.status_code == 403
        assert "Cannot modify default category" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_delete_custom_category(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """カスタムカテゴリ削除のテスト"""
        # カスタムカテゴリを作成
        category = Category(
            name="削除されるカテゴリ",
            icon="🗑️",
            color="#E74C3C",
            is_default=False,
            user_id=test_user.id
        )
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        
        # カテゴリを削除
        response = await async_client.delete(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers
        )
        assert response.status_code == 204
        
        # 削除されたカテゴリを取得しようとする
        response = await async_client.get(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_default_category(
        self,
        async_client: AsyncClient,
        test_user: User,
        default_categories: list[Category],
        auth_headers: dict
    ):
        """デフォルトカテゴリ削除（失敗すべき）のテスト"""
        default_category = default_categories[0]  # 食費
        
        response = await async_client.delete(
            f"/api/v1/categories/{default_category.id}",
            headers=auth_headers
        )
        assert response.status_code == 403
        assert "Cannot delete default category" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_category_statistics(
        self,
        async_client: AsyncClient,
        test_user: User,
        default_categories: list[Category],
        auth_headers: dict
    ):
        """カテゴリ統計取得のテスト"""
        # カテゴリごとの統計情報が含まれているか確認
        response = await async_client.get(
            "/api/v1/categories",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # 各カテゴリに統計情報が含まれているか確認
        for category in data["categories"]:
            assert "transaction_count" in category
            assert "total_amount" in category
            assert isinstance(category["transaction_count"], int)
            assert isinstance(category["total_amount"], (int, float))
    
    @pytest.mark.asyncio
    async def test_create_category_invalid_data(
        self,
        async_client: AsyncClient,
        auth_headers: dict
    ):
        """無効なデータでのカテゴリ作成のテスト"""
        # 名前が空
        response = await async_client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "",
                "icon": "📁",
                "color": "#34495E"
            }
        )
        assert response.status_code == 422
        
        # 無効な色コード
        response = await async_client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "テストカテゴリ",
                "icon": "📁",
                "color": "invalid-color"
            }
        )
        assert response.status_code == 422
        
        # 名前が長すぎる
        response = await async_client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "あ" * 101,  # 100文字を超える
                "icon": "📁",
                "color": "#34495E"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_other_users_category_access(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_user2: User,
        auth_headers: dict,
        auth_headers2: dict,
        db_session: AsyncSession
    ):
        """他ユーザーのカテゴリアクセス（失敗すべき）のテスト"""
        # test_userのカスタムカテゴリを作成
        category = Category(
            name="プライベートカテゴリ",
            icon="🔒",
            color="#95A5A6",
            is_default=False,
            user_id=test_user.id
        )
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        
        # test_user2でアクセスを試みる
        response = await async_client.get(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers2
        )
        assert response.status_code == 404
        
        # test_user2で更新を試みる
        response = await async_client.put(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers2,
            json={
                "name": "不正な更新"
            }
        )
        assert response.status_code == 404
        
        # test_user2で削除を試みる
        response = await async_client.delete(
            f"/api/v1/categories/{category.id}",
            headers=auth_headers2
        )
        assert response.status_code == 404