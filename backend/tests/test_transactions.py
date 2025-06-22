import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime
from decimal import Decimal

from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction


class TestTransactions:
    """取引APIのテストクラス"""
    
    @pytest.fixture
    async def test_category(self, db_session: AsyncSession) -> Category:
        """テスト用カテゴリのフィクスチャ"""
        category = Category(
            name="食費",
            icon="🍽️",
            color="#FF6B6B",
            is_default=True,
            is_love_category=False
        )
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        return category
    
    @pytest.fixture
    async def test_love_category(self, db_session: AsyncSession) -> Category:
        """テスト用Loveカテゴリのフィクスチャ"""
        category = Category(
            name="デート代",
            icon="💕",
            color="#FF69B4",
            is_default=True,
            is_love_category=True
        )
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        return category
    
    @pytest.mark.asyncio
    async def test_create_transaction(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict
    ):
        """取引作成のテスト"""
        response = await async_client.post(
            "/api/v1/transactions",
            headers=auth_headers,
            json={
                "amount": 1500,
                "category_id": str(test_category.id),
                "transaction_type": "expense",
                "sharing_type": "personal",
                "payment_method": "cash",
                "description": "ランチ代",
                "transaction_date": str(date.today())
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 1500
        assert data["category_id"] == str(test_category.id)
        assert data["transaction_type"] == "expense"
        assert data["sharing_type"] == "personal"
        assert data["description"] == "ランチ代"
        assert data["user_id"] == str(test_user.id)
    
    @pytest.mark.asyncio
    async def test_create_love_transaction(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_love_category: Category,
        auth_headers: dict
    ):
        """Love取引作成のテスト"""
        response = await async_client.post(
            "/api/v1/transactions",
            headers=auth_headers,
            json={
                "amount": 5000,
                "category_id": str(test_love_category.id),
                "transaction_type": "expense",
                "sharing_type": "shared",
                "payment_method": "credit_card",
                "description": "映画デート",
                "transaction_date": str(date.today()),
                "love_rating": 5
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 5000
        assert data["love_rating"] == 5
        assert data["category"]["is_love_category"] is True
    
    @pytest.mark.asyncio
    async def test_get_transactions(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """取引一覧取得のテスト"""
        # テスト用取引を作成
        transactions = []
        for i in range(5):
            transaction = Transaction(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal(1000 * (i + 1)),
                transaction_type="expense",
                sharing_type="personal",
                description=f"テスト取引 {i + 1}",
                transaction_date=date.today()
            )
            transactions.append(transaction)
        
        db_session.add_all(transactions)
        await db_session.commit()
        
        # 取引一覧を取得
        response = await async_client.get(
            "/api/v1/transactions",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert len(data["items"]) == 5
        assert data["page"] == 1
        assert data["limit"] == 20
    
    @pytest.mark.asyncio
    async def test_get_transactions_with_filters(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        test_love_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """フィルター付き取引一覧取得のテスト"""
        # 通常取引とLove取引を作成
        normal_transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(2000),
            transaction_type="expense",
            sharing_type="personal",
            description="通常の取引",
            transaction_date=date.today()
        )
        
        love_transaction = Transaction(
            user_id=test_user.id,
            category_id=test_love_category.id,
            amount=Decimal(5000),
            transaction_type="expense",
            sharing_type="shared",
            description="Love取引",
            transaction_date=date.today(),
            love_rating=5
        )
        
        db_session.add_all([normal_transaction, love_transaction])
        await db_session.commit()
        
        # カテゴリでフィルター
        response = await async_client.get(
            f"/api/v1/transactions?category_id={test_love_category.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["love_rating"] == 5
        
        # sharing_typeでフィルター
        response = await async_client.get(
            "/api/v1/transactions?sharing_type=shared",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["sharing_type"] == "shared"
    
    @pytest.mark.asyncio
    async def test_update_transaction(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """取引更新のテスト"""
        # テスト用取引を作成
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(1000),
            transaction_type="expense",
            sharing_type="personal",
            description="更新前",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        await db_session.refresh(transaction)
        
        # 取引を更新
        response = await async_client.put(
            f"/api/v1/transactions/{transaction.id}",
            headers=auth_headers,
            json={
                "amount": 2000,
                "description": "更新後",
                "love_rating": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 2000
        assert data["description"] == "更新後"
        assert data["love_rating"] == 3
    
    @pytest.mark.asyncio
    async def test_delete_transaction(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """取引削除のテスト"""
        # テスト用取引を作成
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(1000),
            transaction_type="expense",
            sharing_type="personal",
            description="削除される取引",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        await db_session.refresh(transaction)
        
        # 取引を削除
        response = await async_client.delete(
            f"/api/v1/transactions/{transaction.id}",
            headers=auth_headers
        )
        assert response.status_code == 204
        
        # 削除された取引を取得しようとする
        response = await async_client.get(
            f"/api/v1/transactions/{transaction.id}",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_other_users_transaction(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_user2: User,
        test_category: Category,
        auth_headers: dict,
        auth_headers2: dict,
        db_session: AsyncSession
    ):
        """他ユーザーの取引更新（失敗すべき）のテスト"""
        # test_userの取引を作成
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(1000),
            transaction_type="expense",
            sharing_type="personal",
            description="他人の取引",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        await db_session.refresh(transaction)
        
        # test_user2で更新を試みる
        response = await async_client.put(
            f"/api/v1/transactions/{transaction.id}",
            headers=auth_headers2,
            json={
                "amount": 2000,
                "description": "不正な更新"
            }
        )
        assert response.status_code == 404  # 他人の取引は見えない
    
    @pytest.mark.asyncio
    async def test_create_transaction_invalid_data(
        self,
        async_client: AsyncClient,
        test_category: Category,
        auth_headers: dict
    ):
        """無効なデータでの取引作成のテスト"""
        # 負の金額
        response = await async_client.post(
            "/api/v1/transactions",
            headers=auth_headers,
            json={
                "amount": -1000,
                "category_id": str(test_category.id),
                "transaction_type": "expense",
                "sharing_type": "personal",
                "transaction_date": str(date.today())
            }
        )
        assert response.status_code == 422
        
        # 無効なtransaction_type
        response = await async_client.post(
            "/api/v1/transactions",
            headers=auth_headers,
            json={
                "amount": 1000,
                "category_id": str(test_category.id),
                "transaction_type": "invalid",
                "sharing_type": "personal",
                "transaction_date": str(date.today())
            }
        )
        assert response.status_code == 422
        
        # love_ratingが範囲外
        response = await async_client.post(
            "/api/v1/transactions",
            headers=auth_headers,
            json={
                "amount": 1000,
                "category_id": str(test_category.id),
                "transaction_type": "expense",
                "sharing_type": "personal",
                "transaction_date": str(date.today()),
                "love_rating": 6  # 1-5の範囲外
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_get_transaction_statistics(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        test_love_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """取引統計取得のテスト"""
        # 複数の取引を作成
        transactions = [
            Transaction(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal(2000),
                transaction_type="expense",
                sharing_type="personal",
                transaction_date=date.today()
            ),
            Transaction(
                user_id=test_user.id,
                category_id=test_love_category.id,
                amount=Decimal(5000),
                transaction_type="expense",
                sharing_type="shared",
                transaction_date=date.today(),
                love_rating=5
            ),
            Transaction(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal(10000),
                transaction_type="income",
                sharing_type="personal",
                transaction_date=date.today()
            )
        ]
        
        db_session.add_all(transactions)
        await db_session.commit()
        
        # 統計を取得
        response = await async_client.get(
            "/api/v1/transactions/statistics",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_income"] == 10000
        assert data["total_expense"] == 7000
        assert data["balance"] == 3000
        assert data["transaction_count"] == 3