import os
import magic
import hashlib
from typing import Tuple, Optional
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException

# 許可されるファイル形式
ALLOWED_MIME_TYPES = {
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
}

# ファイル拡張子マッピング
MIME_TO_EXTENSION = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf'
}

# 最大ファイルサイズ（バイト）
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file_content(file_content: bytes) -> Tuple[str, str]:
    """
    ファイル内容を検証し、MIMEタイプと適切な拡張子を返す
    
    Args:
        file_content: ファイルの内容（バイト）
        
    Returns:
        Tuple[mime_type, extension]: MIMEタイプと拡張子
        
    Raises:
        HTTPException: ファイルが無効な場合
    """
    # ファイルサイズチェック
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"ファイルサイズが制限を超えています。最大 {MAX_FILE_SIZE // (1024 * 1024)}MB まで"
        )
    
    if len(file_content) == 0:
        raise HTTPException(
            status_code=400,
            detail="ファイルが空です"
        )
    
    # ファイル内容からMIMEタイプを検出
    try:
        mime_type = magic.from_buffer(file_content, mime=True)
    except Exception:
        # python-magicが利用できない場合のフォールバック
        # ファイルシグネチャーから基本的な検証
        mime_type = detect_mime_from_signature(file_content)
    
    # 許可されたMIMEタイプかチェック
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"サポートされていないファイル形式です。許可されている形式: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # 適切な拡張子を取得
    extension = MIME_TO_EXTENSION.get(mime_type, '.bin')
    
    return mime_type, extension

def detect_mime_from_signature(file_content: bytes) -> str:
    """
    ファイルシグネチャーからMIMEタイプを検出（フォールバック）
    """
    if len(file_content) < 4:
        raise HTTPException(status_code=400, detail="ファイルが不正です")
    
    # JPEG
    if file_content[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    
    # PNG
    if file_content[:8] == b'\x89\x50\x4e\x47\x0d\x0a\x1a\x0a':
        return 'image/png'
    
    # GIF
    if file_content[:6] in [b'GIF87a', b'GIF89a']:
        return 'image/gif'
    
    # WebP
    if file_content[:4] == b'RIFF' and file_content[8:12] == b'WEBP':
        return 'image/webp'
    
    # PDF
    if file_content[:4] == b'%PDF':
        return 'application/pdf'
    
    raise HTTPException(status_code=400, detail="サポートされていないファイル形式です")

def generate_secure_filename(user_id: UUID, mime_type: str, original_content: bytes) -> str:
    """
    セキュアなファイル名を生成
    
    Args:
        user_id: ユーザーID
        mime_type: MIMEタイプ
        original_content: ファイル内容
        
    Returns:
        セキュアなファイル名
    """
    # ファイル内容のハッシュを生成（重複防止とセキュリティ強化）
    content_hash = hashlib.sha256(original_content).hexdigest()[:16]
    
    # タイムスタンプ
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    
    # 適切な拡張子
    extension = MIME_TO_EXTENSION.get(mime_type, '.bin')
    
    # セキュアなファイル名を生成
    filename = f"{user_id}_{timestamp}_{content_hash}{extension}"
    
    return filename

def sanitize_filename(filename: str) -> str:
    """
    ファイル名をサニタイズ
    """
    # 危険な文字を除去
    dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|', '\0']
    
    sanitized = filename
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')
    
    # 長さ制限
    if len(sanitized) > 255:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized

def create_secure_upload_directory(base_path: str, user_id: UUID) -> str:
    """
    セキュアなアップロードディレクトリを作成
    """
    # ユーザーごとのサブディレクトリ
    user_dir = os.path.join(base_path, str(user_id)[:8])  # UUIDの最初の8文字
    
    # ディレクトリが存在しない場合は作成
    os.makedirs(user_dir, mode=0o755, exist_ok=True)
    
    return user_dir

def scan_for_malware(file_content: bytes) -> bool:
    """
    基本的なマルウェアスキャン（将来的な拡張用）
    
    現在は基本的なチェックのみ実装
    実際の運用では ClamAV や VirusTotal API などを使用
    """
    # 実行可能ファイルの検出
    executable_signatures = [
        b'MZ',  # Windows PE
        b'\x7fELF',  # Linux ELF
        b'\xfe\xed\xfa',  # macOS Mach-O
        b'#!/',  # Script
    ]
    
    for signature in executable_signatures:
        if file_content.startswith(signature):
            return False  # 危険なファイル
    
    # JavaScript/HTMLインジェクションのチェック
    dangerous_patterns = [
        b'<script',
        b'javascript:',
        b'onload=',
        b'onerror=',
        b'<?php',
        b'<%',
    ]
    
    file_lower = file_content.lower()
    for pattern in dangerous_patterns:
        if pattern in file_lower:
            return False  # 危険なコンテンツ
    
    return True  # 安全