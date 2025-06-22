import React, { useState, useRef } from 'react';
import styles from './ImageUpload.module.scss';

interface ImageUploadProps {
  value?: string;
  onChange: (base64Image: string | undefined) => void;
  maxSize?: number; // in MB
  accept?: string;
  existingImageUrl?: string;
  error?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/gif',
  existingImageUrl,
  error,
}) => {
  const [preview, setPreview] = useState<string | null>(value || existingImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      alert(`ファイルサイズは${maxSize}MB以下にしてください`);
      return;
    }

    // ファイル形式チェック
    const acceptedTypes = accept.split(',').map(type => type.trim());
    if (!acceptedTypes.includes(file.type)) {
      alert('対応している画像形式：JPG, PNG, GIF');
      return;
    }

    setIsLoading(true);

    try {
      // Base64に変換
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('画像の読み込みに失敗しました:', error);
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.imageUpload}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt="レシート画像" className={styles.preview} />
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
            aria-label="画像を削除"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.uploadArea} onClick={handleClick}>
          {isLoading ? (
            <div className={styles.loading}>アップロード中...</div>
          ) : (
            <>
              <div className={styles.uploadIcon}>📷</div>
              <div className={styles.uploadText}>
                レシート画像をアップロード
                <span className={styles.uploadHint}>
                  クリックまたはドラッグ&ドロップ
                </span>
              </div>
              <div className={styles.uploadInfo}>
                JPG, PNG, GIF（最大{maxSize}MB）
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};