from app.db.session import SessionLocal
from app.models.category import Category
from app.models.user import User
from app.core.config import settings
from app.core.security import get_password_hash


def init_db() -> None:
    db = SessionLocal()
    
    # Create test user if not exists
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            display_name="Test User",
            is_active=True,
            email_verified=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    
    # Create default categories if not exists
    default_categories_count = db.query(Category).filter(Category.is_default == True).count()
    
    if default_categories_count == 0:
        default_categories = [
            {"name": "食費", "icon": "🍽️", "color": "#FF6B6B", "is_default": True, "is_love_category": False, "sort_order": 1},
            {"name": "交通費", "icon": "🚗", "color": "#4ECDC4", "is_default": True, "is_love_category": False, "sort_order": 2},
            {"name": "住居費", "icon": "🏠", "color": "#45B7D1", "is_default": True, "is_love_category": False, "sort_order": 3},
            {"name": "娯楽費", "icon": "🎬", "color": "#96CEB4", "is_default": True, "is_love_category": False, "sort_order": 4},
            {"name": "日用品", "icon": "👕", "color": "#FFEAA7", "is_default": True, "is_love_category": False, "sort_order": 5},
            {"name": "医療費", "icon": "🏥", "color": "#DDA0DD", "is_default": True, "is_love_category": False, "sort_order": 6},
            {"name": "デート代", "icon": "💕", "color": "#FF69B4", "is_default": True, "is_love_category": True, "sort_order": 7},
            {"name": "プレゼント", "icon": "🎁", "color": "#FF1493", "is_default": True, "is_love_category": True, "sort_order": 8},
            {"name": "記念日", "icon": "🎉", "color": "#FF6347", "is_default": True, "is_love_category": True, "sort_order": 9},
            {"name": "その他", "icon": "📚", "color": "#95A5A6", "is_default": True, "is_love_category": False, "sort_order": 10},
        ]
        
        for cat_data in default_categories:
            category = Category(**cat_data)
            db.add(category)
        
        db.commit()
        print("Default categories created successfully!")
    
    db.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized!")