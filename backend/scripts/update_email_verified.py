"""
開発環境用：既存ユーザーのメール確認フラグを更新するスクリプト
"""
import sys
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User


def update_email_verified():
    """全ユーザーのemail_verifiedフラグをTrueに更新"""
    db: Session = SessionLocal()
    try:
        # 全ユーザーを取得
        users = db.query(User).all()
        
        for user in users:
            if not user.email_verified:
                user.email_verified = True
                print(f"Updated email_verified for user: {user.email}")
        
        # 変更をコミット
        db.commit()
        print(f"\n✅ Updated {len(users)} users")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Updating email_verified flags for all users...")
    update_email_verified()