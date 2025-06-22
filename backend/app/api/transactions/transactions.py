from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, extract
from datetime import date, datetime
from uuid import UUID
import base64
import os

from app import schemas, models
from app.core.deps import get_db, get_current_user
from app.core.config import settings
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionWithDetails,
    TransactionFilter
)
from app.api.partnerships.partnerships import get_user_partnership

router = APIRouter()


def save_receipt_image(file_content: bytes, user_id: UUID) -> str:
    """レシート画像を保存してURLを返す"""
    # ファイル名を生成
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"{user_id}_{timestamp}.jpg"
    
    # 保存先ディレクトリ
    upload_dir = "uploads/receipts"
    os.makedirs(upload_dir, exist_ok=True)
    
    # ファイルパス
    file_path = os.path.join(upload_dir, filename)
    
    # ファイルを保存
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # URLを返す（実際の環境では適切なURLに変更）
    return f"{settings.BACKEND_URL}/uploads/receipts/{filename}"


@router.get("/", response_model=dict)
def get_transactions(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    transaction_type: Optional[str] = None,
    sharing_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    love_rating: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = None
) -> Any:
    """
    取引一覧を取得
    """
    # 基本クエリ
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )
    
    # フィルタ適用
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(models.Transaction.transaction_type == transaction_type)
    if sharing_type:
        query = query.filter(models.Transaction.sharing_type == sharing_type)
    if date_from:
        query = query.filter(models.Transaction.transaction_date >= date_from)
    if date_to:
        query = query.filter(models.Transaction.transaction_date <= date_to)
    if love_rating:
        query = query.filter(models.Transaction.love_rating == love_rating)
    if search:
        query = query.filter(
            or_(
                models.Transaction.description.ilike(f"%{search}%"),
                models.Transaction.location.ilike(f"%{search}%")
            )
        )
    
    # ページネーション計算
    skip = (page - 1) * limit
    
    # 総件数を取得
    total_count = query.count()
    
    # 関連データを含めて取得
    transactions = query.options(
        joinedload(models.Transaction.category),
        joinedload(models.Transaction.shared_transaction).joinedload(models.SharedTransaction.payer)
    ).order_by(models.Transaction.transaction_date.desc()).offset(skip).limit(limit).all()
    
    # 結果を整形
    result = []
    for transaction in transactions:
        transaction_dict = {
            "id": transaction.id,
            "user_id": transaction.user_id,
            "category_id": transaction.category_id,
            "amount": transaction.amount,
            "transaction_type": transaction.transaction_type,
            "sharing_type": transaction.sharing_type,
            "payment_method": transaction.payment_method,
            "description": transaction.description,
            "transaction_date": transaction.transaction_date,
            "receipt_image_url": transaction.receipt_image_url,
            "love_rating": transaction.love_rating,
            "tags": transaction.tags,
            "location": transaction.location,
            "created_at": transaction.created_at,
            "updated_at": transaction.updated_at,
            "category": {
                "id": transaction.category.id,
                "name": transaction.category.name,
                "icon": transaction.category.icon,
                "color": transaction.category.color,
                "is_love_category": transaction.category.is_love_category
            }
        }
        
        # 共有取引情報を追加
        if transaction.shared_transaction:
            st = transaction.shared_transaction
            transaction_dict["shared_transaction"] = {
                "id": st.id,
                "transaction_id": st.transaction_id,
                "partnership_id": st.partnership_id,
                "payer_user_id": st.payer_user_id,
                "split_type": st.split_type,
                "user1_amount": st.user1_amount,
                "user2_amount": st.user2_amount,
                "notes": st.notes,
                "created_at": st.created_at
            }
            transaction_dict["payer"] = {
                "id": st.payer.id,
                "display_name": st.payer.display_name,
                "profile_image_url": st.payer.profile_image_url
            }
        
        result.append(transaction_dict)
    
    # ページネーション情報を含む結果を返す
    return {
        "transactions": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "total_pages": (total_count + limit - 1) // limit,
            "has_next": page * limit < total_count,
            "has_prev": page > 1
        }
    }


@router.get("/stats/monthly")
def get_monthly_stats(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    year: int = Query(..., ge=2020, le=2100),
    month: int = Query(..., ge=1, le=12)
) -> Any:
    """
    月次統計を取得
    """
    # 収入合計
    income_sum = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'income',
        extract('year', models.Transaction.transaction_date) == year,
        extract('month', models.Transaction.transaction_date) == month
    ).scalar()
    
    # 支出合計
    expense_sum = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        extract('year', models.Transaction.transaction_date) == year,
        extract('month', models.Transaction.transaction_date) == month
    ).scalar()
    
    # 個人支出
    personal_expense = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.sharing_type == 'personal',
        extract('year', models.Transaction.transaction_date) == year,
        extract('month', models.Transaction.transaction_date) == month
    ).scalar()
    
    # 共有支出
    shared_expense = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.sharing_type == 'shared',
        extract('year', models.Transaction.transaction_date) == year,
        extract('month', models.Transaction.transaction_date) == month
    ).scalar()
    
    # Love支出
    love_expense = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.love_rating.isnot(None),
        extract('year', models.Transaction.transaction_date) == year,
        extract('month', models.Transaction.transaction_date) == month
    ).scalar()
    
    return {
        "year": year,
        "month": month,
        "total_income": float(income_sum),
        "total_expense": float(expense_sum),
        "personal_expense": float(personal_expense),
        "shared_expense": float(shared_expense),
        "love_expense": float(love_expense),
        "balance": float(income_sum - expense_sum)
    }


@router.get("/{transaction_id}", response_model=TransactionWithDetails)
def get_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    特定の取引を取得
    """
    transaction = db.query(models.Transaction).options(
        joinedload(models.Transaction.category),
        joinedload(models.Transaction.shared_transaction).joinedload(models.SharedTransaction.payer)
    ).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    # 結果を整形
    transaction_dict = {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "category_id": transaction.category_id,
        "amount": transaction.amount,
        "transaction_type": transaction.transaction_type,
        "sharing_type": transaction.sharing_type,
        "payment_method": transaction.payment_method,
        "description": transaction.description,
        "transaction_date": transaction.transaction_date,
        "receipt_image_url": transaction.receipt_image_url,
        "love_rating": transaction.love_rating,
        "tags": transaction.tags,
        "location": transaction.location,
        "created_at": transaction.created_at,
        "updated_at": transaction.updated_at,
        "category": {
            "id": transaction.category.id,
            "name": transaction.category.name,
            "icon": transaction.category.icon,
            "color": transaction.category.color,
            "is_love_category": transaction.category.is_love_category
        }
    }
    
    # 共有取引情報を追加
    if transaction.shared_transaction:
        st = transaction.shared_transaction
        transaction_dict["shared_transaction"] = {
            "id": st.id,
            "transaction_id": st.transaction_id,
            "partnership_id": st.partnership_id,
            "payer_user_id": st.payer_user_id,
            "split_type": st.split_type,
            "user1_amount": st.user1_amount,
            "user2_amount": st.user2_amount,
            "notes": st.notes,
            "created_at": st.created_at
        }
        transaction_dict["payer"] = {
            "id": st.payer.id,
            "display_name": st.payer.display_name,
            "profile_image_url": st.payer.profile_image_url
        }
    
    return transaction_dict


@router.post("/", response_model=TransactionWithDetails)
def create_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_in: TransactionCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    取引を作成
    """
    # カテゴリの存在確認
    category = db.query(models.Category).filter(
        models.Category.id == transaction_in.category_id,
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
    
    # 取引を作成
    transaction = models.Transaction(
        user_id=current_user.id,
        amount=transaction_in.amount,
        transaction_type=transaction_in.transaction_type,
        sharing_type=transaction_in.sharing_type,
        category_id=transaction_in.category_id,
        transaction_date=transaction_in.transaction_date,
        payment_method=transaction_in.payment_method,
        description=transaction_in.description,
        love_rating=transaction_in.love_rating,
        tags=transaction_in.tags,
        location=transaction_in.location
    )
    
    # レシート画像がある場合
    if transaction_in.receipt_image:
        try:
            # Base64デコード
            image_data = base64.b64decode(transaction_in.receipt_image)
            # 画像を保存
            receipt_url = save_receipt_image(image_data, current_user.id)
            transaction.receipt_image_url = receipt_url
        except Exception as e:
            # エラーログを記録（実際の実装では適切なログ記録を行う）
            pass
    
    db.add(transaction)
    db.flush()  # IDを取得するため
    
    # 共有取引の場合
    if transaction_in.sharing_type == 'shared' and transaction_in.shared_info:
        # パートナーシップの確認
        partnership = get_user_partnership(db, current_user.id)
        if not partnership:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="パートナーシップが設定されていません"
            )
        
        # 共有取引情報を作成
        shared_info = transaction_in.shared_info
        shared_transaction = models.SharedTransaction(
            transaction_id=transaction.id,
            partnership_id=partnership.id,
            payer_user_id=current_user.id,
            split_type=shared_info.split_type,
            notes=shared_info.notes
        )
        
        # 分割金額を計算
        if shared_info.split_type == 'equal':
            shared_transaction.user1_amount = transaction.amount / 2
            shared_transaction.user2_amount = transaction.amount / 2
        elif shared_info.split_type == 'amount':
            shared_transaction.user1_amount = shared_info.user1_amount
            shared_transaction.user2_amount = shared_info.user2_amount
        
        db.add(shared_transaction)
    
    db.commit()
    db.refresh(transaction)
    
    # 取得して返す
    return get_transaction(db=db, transaction_id=transaction.id, current_user=current_user)


@router.put("/{transaction_id}", response_model=TransactionWithDetails)
def update_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: UUID,
    transaction_update: TransactionUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    取引を更新
    """
    # 取引を取得
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    # 更新
    update_data = transaction_update.dict(exclude_unset=True, exclude={'shared_info'})
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    # 共有取引情報の更新
    if transaction.sharing_type == 'shared' and transaction_update.shared_info:
        shared_transaction = db.query(models.SharedTransaction).filter(
            models.SharedTransaction.transaction_id == transaction_id
        ).first()
        
        if shared_transaction:
            shared_info = transaction_update.shared_info
            if shared_info.split_type:
                shared_transaction.split_type = shared_info.split_type
            if shared_info.notes is not None:
                shared_transaction.notes = shared_info.notes
            
            # 分割金額を再計算
            if shared_info.split_type == 'equal':
                shared_transaction.user1_amount = transaction.amount / 2
                shared_transaction.user2_amount = transaction.amount / 2
            elif shared_info.split_type == 'amount' and shared_info.user1_amount and shared_info.user2_amount:
                shared_transaction.user1_amount = shared_info.user1_amount
                shared_transaction.user2_amount = shared_info.user2_amount
    
    db.commit()
    db.refresh(transaction)
    
    return get_transaction(db=db, transaction_id=transaction_id, current_user=current_user)


@router.delete("/{transaction_id}")
def delete_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    取引を削除
    """
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return {"message": "取引を削除しました"}