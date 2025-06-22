import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LoveEvent, LoveEventFormData } from '@/types/love';
import styles from './LoveEventModal.module.scss';

interface LoveEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoveEventFormData) => Promise<void>;
  event?: LoveEvent;
}

export const LoveEventModal: React.FC<LoveEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  event
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LoveEventFormData>({
    defaultValues: event ? {
      event_type: event.event_type,
      name: event.name,
      event_date: event.event_date,
      is_recurring: event.is_recurring,
      recurrence_type: event.recurrence_type,
      description: event.description,
      reminder_days: event.reminder_days
    } : {
      event_type: 'anniversary',
      is_recurring: true,
      recurrence_type: 'yearly',
      reminder_days: 7
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: LoveEventFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{event ? '記念日を編集' : '記念日を追加'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label>記念日の種類</label>
            <select {...register('event_type', { required: '種類を選択してください' })}>
              <option value="anniversary">💑 記念日</option>
              <option value="birthday">🎂 誕生日</option>
              <option value="valentine">💝 バレンタイン</option>
              <option value="christmas">🎄 クリスマス</option>
              <option value="custom">🎉 その他</option>
            </select>
            {errors.event_type && <span className={styles.error}>{errors.event_type.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>記念日の名前</label>
            <input
              {...register('name', { required: '名前を入力してください' })}
              type="text"
              placeholder="例：付き合った記念日"
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>日付</label>
            <input
              {...register('event_date', { required: '日付を選択してください' })}
              type="date"
            />
            {errors.event_date && <span className={styles.error}>{errors.event_date.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                {...register('is_recurring')}
                type="checkbox"
              />
              <span>繰り返し設定</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>繰り返しタイプ</label>
            <select {...register('recurrence_type')}>
              <option value="yearly">毎年</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>リマインダー（何日前に通知）</label>
            <input
              {...register('reminder_days', { min: 0, max: 30 })}
              type="number"
              min="0"
              max="30"
            />
          </div>

          <div className={styles.formGroup}>
            <label>説明（任意）</label>
            <textarea
              {...register('description')}
              placeholder="この記念日についてのメモ"
              rows={3}
            />
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