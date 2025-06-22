#!/usr/bin/env python
"""パスワードリセットスクリプト"""
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User

def reset_password(email: str, new_password: str):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found")
            return False
        
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        print(f"Password updated successfully for {email}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_password.py <email> <new_password>")
        sys.exit(1)
    
    email = sys.argv[1]
    new_password = sys.argv[2]
    
    if reset_password(email, new_password):
        print("Success!")
    else:
        print("Failed!")
        sys.exit(1)