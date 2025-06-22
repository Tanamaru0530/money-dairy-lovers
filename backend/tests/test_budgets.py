import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from decimal import Decimal

from app.models.user import User
from app.models.category import Category
from app.models.budget import Budget
from app.models.transaction import Transaction


class TestBudgets:
    """予算APIのテストクラス"""
    
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
    
    @pytest.mark.asyncio
    async def test_create_budget(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict
    ):
        """予算作成のテスト"""
        response = await async_client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "name": "今月の食費予算",
                "amount": 50000,
                "period": "monthly",
                "start_date": str(date.today()),
                "category_id": str(test_category.id),
                "alert_threshold": 80,
                "is_love_budget": False
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "今月の食費予算"
        assert data["amount"] == 50000
        assert data["period"] == "monthly"
        assert data["category_id"] == str(test_category.id)
        assert data["alert_threshold"] == 80
        assert data["is_love_budget"] is False
        assert data["user_id"] == str(test_user.id)
    
    @pytest.mark.asyncio
    async def test_create_love_budget(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict
    ):
        """Love予算作成のテスト"""
        response = await async_client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "name": "デート予算",
                "amount": 30000,
                "period": "monthly",
                "start_date": str(date.today()),
                "alert_threshold": 90,
                "is_love_budget": True
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "デート予算"
        assert data["is_love_budget"] is True
    
    @pytest.mark.asyncio
    async def test_get_budgets(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算一覧取得のテスト"""
        # テスト用予算を作成
        budgets = []
        for i in range(3):
            budget = Budget(
                user_id=test_user.id,
                name=f"予算 {i + 1}",
                amount=Decimal(10000 * (i + 1)),
                period="monthly",
                start_date=date.today(),
                category_id=test_category.id if i % 2 == 0 else None,
                alert_threshold=80,
                is_active=True
            )
            budgets.append(budget)
        
        db_session.add_all(budgets)
        await db_session.commit()
        
        # 予算一覧を取得
        response = await async_client.get(
            "/api/v1/budgets",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        
        # 各予算に進捗情報が含まれているか確認
        for budget in data:
            assert "spent_amount" in budget
            assert "remaining_amount" in budget
            assert "usage_percentage" in budget
            assert "is_over_budget" in budget
            assert "is_alert_threshold_reached" in budget
            assert "days_remaining" in budget
    
    @pytest.mark.asyncio
    async def test_get_budget_with_progress(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算進捗計算のテスト"""
        # 予算を作成
        budget = Budget(
            user_id=test_user.id,
            name="テスト予算",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            category_id=test_category.id,
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # 取引を作成（予算の60%を使用）
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(6000),
            transaction_type="expense",
            sharing_type="personal",
            description="テスト支出",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        
        # 予算を取得
        response = await async_client.get(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["spent_amount"] == 6000
        assert data["remaining_amount"] == 4000
        assert data["usage_percentage"] == 60
        assert data["is_over_budget"] is False
        assert data["is_alert_threshold_reached"] is False  # 80%未満
    
    @pytest.mark.asyncio
    async def test_budget_alert_threshold(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算アラート閾値のテスト"""
        # 予算を作成（アラート閾値80%）
        budget = Budget(
            user_id=test_user.id,
            name="アラートテスト予算",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            category_id=test_category.id,
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # 取引を作成（予算の85%を使用）
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(8500),
            transaction_type="expense",
            sharing_type="personal",
            description="大きな支出",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        
        # 予算を取得
        response = await async_client.get(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["usage_percentage"] == 85
        assert data["is_alert_threshold_reached"] is True
        assert data["is_over_budget"] is False
    
    @pytest.mark.asyncio
    async def test_budget_over_limit(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算超過のテスト"""
        # 予算を作成
        budget = Budget(
            user_id=test_user.id,
            name="超過テスト予算",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            category_id=test_category.id,
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # 取引を作成（予算の120%を使用）
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(12000),
            transaction_type="expense",
            sharing_type="personal",
            description="予算超過の支出",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        
        # 予算を取得
        response = await async_client.get(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["usage_percentage"] == 120
        assert data["is_over_budget"] is True
        assert data["is_alert_threshold_reached"] is True
        assert data["remaining_amount"] == -2000
    
    @pytest.mark.asyncio
    async def test_update_budget(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算更新のテスト"""
        # 予算を作成
        budget = Budget(
            user_id=test_user.id,
            name="更新前",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # 予算を更新
        response = await async_client.put(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers,
            json={
                "name": "更新後",
                "amount": 20000,
                "alert_threshold": 90
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "更新後"
        assert data["amount"] == 20000
        assert data["alert_threshold"] == 90
    
    @pytest.mark.asyncio
    async def test_delete_budget(
        self,
        async_client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算削除のテスト"""
        # 予算を作成
        budget = Budget(
            user_id=test_user.id,
            name="削除される予算",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # 予算を削除
        response = await async_client.delete(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers
        )
        assert response.status_code == 204
        
        # 削除された予算を取得しようとする
        response = await async_client.get(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_budget_summary(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_category: Category,
        auth_headers: dict,
        db_session: AsyncSession
    ):
        """予算サマリー取得のテスト"""
        # 複数の予算を作成
        budgets = [
            Budget(
                user_id=test_user.id,
                name="予算1",
                amount=Decimal(20000),
                period="monthly",
                start_date=date.today(),
                category_id=test_category.id,
                alert_threshold=80,
                is_active=True
            ),
            Budget(
                user_id=test_user.id,
                name="予算2",
                amount=Decimal(30000),
                period="monthly",
                start_date=date.today(),
                alert_threshold=80,
                is_active=True
            )
        ]
        db_session.add_all(budgets)
        await db_session.commit()
        
        # 取引を作成
        transaction = Transaction(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal(15000),
            transaction_type="expense",
            sharing_type="personal",
            description="支出",
            transaction_date=date.today()
        )
        db_session.add(transaction)
        await db_session.commit()
        
        # サマリーを取得
        response = await async_client.get(
            "/api/v1/budgets/summary",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_budget"] == 50000
        assert data["total_spent"] == 15000
        assert data["total_remaining"] == 35000
        assert data["active_budgets_count"] == 2
        assert data["overall_usage_percentage"] == 30
        assert "alert_count" in data
        assert "over_budget_count" in data
    
    @pytest.mark.asyncio
    async def test_other_users_budget_access(
        self,
        async_client: AsyncClient,
        test_user: User,
        test_user2: User,
        auth_headers: dict,
        auth_headers2: dict,
        db_session: AsyncSession
    ):
        """他ユーザーの予算アクセス（失敗すべき）のテスト"""
        # test_userの予算を作成
        budget = Budget(
            user_id=test_user.id,
            name="プライベート予算",
            amount=Decimal(10000),
            period="monthly",
            start_date=date.today(),
            alert_threshold=80,
            is_active=True
        )
        db_session.add(budget)
        await db_session.commit()
        await db_session.refresh(budget)
        
        # test_user2でアクセスを試みる
        response = await async_client.get(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers2
        )
        assert response.status_code == 404
        
        # test_user2で更新を試みる
        response = await async_client.put(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers2,
            json={
                "name": "不正な更新"
            }
        )
        assert response.status_code == 404
        
        # test_user2で削除を試みる
        response = await async_client.delete(
            f"/api/v1/budgets/{budget.id}",
            headers=auth_headers2
        )
        assert response.status_code == 404