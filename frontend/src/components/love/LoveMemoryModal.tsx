import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './LoveMemoryModal.module.scss';

interface LoveMemoryFormData {
  title: string;
  description: string;
  event_id?: string;
  transaction_id?: string;
}

interface LoveMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoveMemoryFormData) => Promise<void>;
  events?: Array<{ id: string; name: string }>;
}

export const LoveMemoryModal: React.FC<LoveMemoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  events = []
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LoveMemoryFormData>();

  const handleFormSubmit = async (data: LoveMemoryFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save memory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>💕 思い出を追加</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label>タイトル</label>
            <input
              {...register('title', { required: 'タイトルを入力してください' })}
              type="text"
              placeholder="例：初めてのデート"
            />
            {errors.title && <span className={styles.error}>{errors.title.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>思い出の詳細</label>
            <textarea
              {...register('description', { required: '詳細を入力してください' })}
              placeholder="この日の思い出を記録しましょう..."
              rows={5}
            />
            {errors.description && <span className={styles.error}>{errors.description.message}</span>}
          </div>

          {events.length > 0 && (
            <div className={styles.formGroup}>
              <label>関連する記念日（任意）</label>
              <select {...register('event_id')}>
                <option value="">選択してください</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.photoUploadHint}>
            <div className={styles.hintIcon}>📸</div>
            <p>写真アップロード機能は準備中です</p>
            <p className={styles.hintSubtext}>もうしばらくお待ちください</p>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};