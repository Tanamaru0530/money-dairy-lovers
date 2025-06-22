from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from uuid import UUID
import logging

from app import schemas, models
from app.core.deps import get_db, get_current_user
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    Category,
    CategoryWithStats
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[CategoryWithStats])
def get_categories(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    include_stats: bool = False
) -> Any:
    """
    カテゴリ一覧を取得（デフォルト + ユーザーカスタム）
    """
    # デフォルトカテゴリとユーザーのカスタムカテゴリを取得
    categories = db.query(models.Category).filter(
        or_(
            models.Category.is_default == True,
            models.Category.user_id == current_user.id
        )
    ).order_by(models.Category.sort_order, models.Category.name).all()
    
    # 統計情報を含める場合
    if include_stats:
        logger.info(f"Getting categories with stats for user {current_user.id}")
        result = []
        for category in categories:
            # 各カテゴリの取引数と合計金額を計算
            # 取引が存在するか確認
            transaction_query = db.query(models.Transaction).filter(
                models.Transaction.category_id == category.id,
                models.Transaction.user_id == current_user.id
            )
            
            transaction_count = transaction_query.count()
            total_amount = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.category_id == category.id,
                models.Transaction.user_id == current_user.id
            ).scalar() or 0.0
            
            logger.debug(f"Category {category.name} (ID: {category.id}): count={transaction_count}, amount={total_amount}")
            
            category_dict = {
                "id": category.id,
                "name": category.name,
                "icon": category.icon,
                "color": category.color,
                "sort_order": category.sort_order,
                "is_default": category.is_default,
                "is_love_category": category.is_love_category,
                "user_id": category.user_id,
                "created_at": category.created_at,
                "transaction_count": transaction_count,
                "total_amount": float(total_amount)
            }
            result.append(category_dict)
        logger.info(f"Returning {len(result)} categories with stats")
        return result
    
    return categories


@router.get("/love", response_model=List[CategoryWithStats])
def get_love_categories(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love特別カテゴリのみを取得
    """
    categories = db.query(models.Category).filter(
        models.Category.is_love_category == True
    ).order_by(models.Category.sort_order).all()
    
    return categories


@router.get("/{category_id}", response_model=CategoryWithStats)
def get_category(
    *,
    db: Session = Depends(get_db),
    category_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    特定のカテゴリを取得
    """
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        or_(
            models.Category.is_default == True,
            models.Category.user_id == current_user.id
        )
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )
    
    # 統計情報を追加
    transaction_query = db.query(models.Transaction).filter(
        models.Transaction.category_id == category.id,
        models.Transaction.user_id == current_user.id
    )
    
    transaction_count = transaction_query.count()
    total_amount = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.category_id == category.id,
        models.Transaction.user_id == current_user.id
    ).scalar() or 0.0
    
    category_dict = {
        "id": category.id,
        "name": category.name,
        "icon": category.icon,
        "color": category.color,
        "sort_order": category.sort_order,
        "is_default": category.is_default,
        "is_love_category": category.is_love_category,
        "user_id": category.user_id,
        "created_at": category.created_at,
        "transaction_count": transaction_count,
        "total_amount": float(total_amount)
    }
    
    return category_dict


@router.post("/", response_model=Category)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: CategoryCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    カスタムカテゴリを作成
    """
    # 同じ名前のカテゴリが既に存在するかチェック
    existing = db.query(models.Category).filter(
        models.Category.name == category_in.name,
        models.Category.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="同じ名前のカテゴリが既に存在します"
        )
    
    # カテゴリを作成
    category = models.Category(
        **category_in.dict(),
        user_id=current_user.id,
        is_default=False,
        is_love_category=False
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category


@router.put("/{category_id}", response_model=Category)
def update_category(
    *,
    db: Session = Depends(get_db),
    category_id: UUID,
    category_update: CategoryUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    カスタムカテゴリを更新
    """
    # カテゴリを取得（ユーザーのカスタムカテゴリのみ更新可能）
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found or not editable"
        )
    
    # 更新
    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category


@router.delete("/{category_id}")
def delete_category(
    *,
    db: Session = Depends(get_db),
    category_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    カスタムカテゴリを削除
    """
    # カテゴリを取得（ユーザーのカスタムカテゴリのみ削除可能）
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found or not deletable"
        )
    
    # 関連する取引があるかチェック
    transaction_count = db.query(models.Transaction).filter(
        models.Transaction.category_id == category_id
    ).count()
    
    if transaction_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"このカテゴリは{transaction_count}件の取引で使用されているため削除できません"
        )
    
    db.delete(category)
    db.commit()
    
    return {"message": "カテゴリを削除しました"}