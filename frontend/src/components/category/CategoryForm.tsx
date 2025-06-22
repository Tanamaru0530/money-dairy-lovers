import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CategoryWithStats, CategoryCreate, CategoryUpdate } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import styles from './CategoryForm.module.scss';

interface CategoryFormProps {
  category?: CategoryWithStats | null;
  onSubmit: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

const PRESET_ICONS = [
  '🍕', '🍔', '🍜', '🍱', '☕', '🍺',
  '🏥', '💊', '🩺', '🏃', '🏋️', '⚽',
  '🏡', '🏢', '🏪', '🏦', '🏫', '🏛️',
  '🚗', '🚕', '🚌', '🚇', '✈️', '🚲',
  '👔', '👗', '👠', '👜', '💄', '💍',
  '📚', '📱', '💻', '🎮', '🎬', '🎵',
  '🎁', '🎉', '🎊', '🎈', '🎂', '🎄',
  '💰', '💸', '💳', '🏧', '📈', '📊'
];

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FD79A8', '#A29BFE', '#6C5CE7', '#00B894', '#00CEC9', '#0984E3',
  '#E17055', '#FDCB6E', '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '📁');
  const [selectedColor, setSelectedColor] = useState(category?.color || '#9CA3AF');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '📁',
      color: category?.color || '#9CA3AF',
      sort_order: category?.sort_order || 0,
    },
  });

  useEffect(() => {
    setValue('icon', selectedIcon);
    setValue('color', selectedColor);
  }, [selectedIcon, selectedColor, setValue]);

  const onFormSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      if (category) {
        // 更新
        const updateData: CategoryUpdate = {
          name: data.name,
          icon: data.icon,
          color: data.color,
          sort_order: data.sort_order,
        };
        await categoryService.updateCategory(category.id, updateData);
      } else {
        // 作成
        const createData: CategoryCreate = {
          name: data.name,
          icon: data.icon,
          color: data.color,
          sort_order: data.sort_order,
        };
        await categoryService.createCategory(createData);
      }

      onSubmit();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(category ? 'カテゴリの更新に失敗しました' : 'カテゴリの作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {category ? 'カテゴリを編集' : '新しいカテゴリを作成'}
          </h2>
          <button onClick={onCancel} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
          {error && (
            <div className={styles.errorBanner}>
              {error}
            </div>
          )}

          <div className={styles.formSection}>
            <Input
              label="カテゴリ名"
              placeholder="例：外食費、趣味・娯楽"
              error={errors.name?.message}
              {...register('name', {
                required: 'カテゴリ名を入力してください',
                minLength: {
                  value: 1,
                  message: 'カテゴリ名は1文字以上で入力してください',
                },
                maxLength: {
                  value: 100,
                  message: 'カテゴリ名は100文字以内で入力してください',
                },
              })}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>アイコン</label>
            <div className={styles.iconGrid}>
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`${styles.iconOption} ${selectedIcon === icon ? styles.selected : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>カラー</label>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorOption} ${selectedColor === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <div className={styles.colorPreview}>
              <div
                className={styles.previewBox}
                style={{ backgroundColor: selectedColor }}
              >
                <span className={styles.previewIcon}>{selectedIcon}</span>
              </div>
              <span className={styles.previewText}>{watch('name') || 'カテゴリ名'}</span>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline-love"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={category ? '💾' : '➕'}
            >
              {category ? '更新する' : '作成する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};