from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app import models
import logging

logger = logging.getLogger(__name__)


def initialize_user_data(db: Session, user_id: str) -> None:
    """
    新規ユーザー用の初期データを作成
    """
    try:
        # 1. カスタムカテゴリの作成（ユーザー用のデフォルトカテゴリ）
        # 注: システムのデフォルトカテゴリ（is_default=True）は既に存在するため、ここでは作成しない
        
        # 2. サンプルLove Goalsの作成
        create_sample_love_goals(db, user_id)
        
        # 3. ウェルカムメッセージ用の取引を作成（オプション）
        # create_welcome_transaction(db, user_id)
        
        db.commit()
        logger.info(f"Successfully initialized data for user {user_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to initialize data for user {user_id}: {str(e)}")
        # エラーが発生してもユーザー登録自体は成功させる
        pass


def create_sample_love_goals(db: Session, user_id: str) -> None:
    """
    サンプルのLove Goalsを作成
    """
    # 今月の開始日
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    
    # サンプルLove Goals
    sample_goals = [
        {
            "name": "月のデート代 💕",
            "amount": Decimal("20000"),
            "period": "monthly",
            "start_date": start_of_month,
            "end_date": None,  # 月次なので終了日なし
            "is_love_budget": True,
            "alert_threshold": 80.0,
            "is_active": True
        },
        {
            "name": "記念日プレゼント資金 🎁",
            "amount": Decimal("30000"),
            "period": "custom",
            "start_date": today,
            "end_date": today + timedelta(days=90),  # 3ヶ月後
            "is_love_budget": True,
            "alert_threshold": 80.0,
            "is_active": True
        },
        {
            "name": "将来の結婚資金 💍",
            "amount": Decimal("1000000"),
            "period": "custom",
            "start_date": today,
            "end_date": today + timedelta(days=730),  # 2年後
            "is_love_budget": True,
            "alert_threshold": 80.0,
            "is_active": True
        }
    ]
    
    for goal_data in sample_goals:
        goal = models.Budget(
            user_id=user_id,
            **goal_data
        )
        db.add(goal)
    
    logger.info(f"Created {len(sample_goals)} sample Love Goals for user {user_id}")


def create_welcome_transaction(db: Session, user_id: str) -> None:
    """
    ウェルカムメッセージ用のサンプル取引を作成（オプション）
    """
    # Loveカテゴリを取得
    love_category = db.query(models.Category).filter(
        models.Category.is_default == True,
        models.Category.is_love_category == True,
        models.Category.name == "デート代"
    ).first()
    
    if not love_category:
        logger.warning("Love category 'デート代' not found, skipping welcome transaction")
        return
    
    # ウェルカム取引を作成
    welcome_transaction = models.Transaction(
        user_id=user_id,
        category_id=love_category.id,
        amount=Decimal("0"),
        transaction_type="expense",
        sharing_type="personal",
        description="Money Dairy Loversへようこそ！💕 愛のある家計管理を始めましょう",
        transaction_date=date.today(),
        love_rating=5
    )
    
    db.add(welcome_transaction)
    logger.info(f"Created welcome transaction for user {user_id}")