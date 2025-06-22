import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryForm } from '@/components/category/CategoryForm';
import { categoryService } from '@/services/categoryService';
import { CategoryWithStats } from '@/types/category';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Categories.module.scss';

export const Categories: React.FC = () => {
  const { user } = useAuth();
  const [loveCategories, setLoveCategories] = useState<CategoryWithStats[]>([]);
  const [normalCategories, setNormalCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories(true);
      console.log('Raw API response:', response);
      const data = response.categories;
      console.log('Categories array:', data);
      console.log('First category example:', data[0]);
      
      // カテゴリを分類
      const loves = data.filter(cat => cat.is_love_category);
      const normals = data.filter(cat => !cat.is_love_category);
      
      console.log('Categories loaded:', {
        total: data.length,
        loves: loves.length,
        normals: normals.length,
        rawData: data
      });
      
      setLoveCategories(loves);
      setNormalCategories(normals);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError('カテゴリの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: CategoryWithStats) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      await loadCategories();
    } catch (err: any) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert('カテゴリの削除に失敗しました');
      }
    }
  };

  const handleFormSubmit = async () => {
    await loadCategories();
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>💕</div>
            <p>愛を込めて読み込み中...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className={styles.mainContent}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>💔</div>
            <p>{error}</p>
            <button onClick={loadCategories} className={styles.retryButton}>
              もう一度試す
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <span className={styles.icon}>📁</span>
            カテゴリ管理
          </h1>
          <p className={styles.pageSubtitle}>
            取引を分類するカテゴリを管理しましょう
          </p>
        </div>

        {/* Love カテゴリ */}
        {loveCategories.length > 0 && (
          <section className={styles.categorySection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.loveIcon}>💕</span>
              Love カテゴリ
            </h2>
            <p className={styles.sectionDescription}>
              愛にまつわる特別なカテゴリです
            </p>
            <div className={styles.categoryGrid}>
              {loveCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isLove={true}
                  canEdit={false}
                  canDelete={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* すべてのカテゴリ */}
        <section className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <span className={styles.icon}>📁</span>
                すべてのカテゴリ
              </h2>
              <p className={styles.sectionDescription}>
                支出を管理するためのカテゴリ一覧です
              </p>
            </div>
            <Button
              onClick={handleCreateCategory}
              icon="➕"
              size="md"
              variant="primary"
            >
              新しいカテゴリを作成
            </Button>
          </div>
          
          {normalCategories.length > 0 ? (
            <div className={styles.categoryGrid}>
              {normalCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  canEdit={!category.is_default}
                  canDelete={!category.is_default}
                  onEdit={!category.is_default ? handleEditCategory : undefined}
                  onDelete={!category.is_default ? handleDeleteCategory : undefined}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📁</div>
              <p className={styles.emptyText}>
                カテゴリがありません
              </p>
              <p className={styles.emptySubtext}>
                新しいカテゴリを作成して取引を整理しましょう
              </p>
            </div>
          )}
        </section>

        {/* カテゴリ作成・編集フォーム */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </PageLayout>
  );
};