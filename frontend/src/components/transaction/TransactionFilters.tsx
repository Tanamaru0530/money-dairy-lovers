import React, { useState } from 'react';
import { TransactionFilter } from '../../types/transaction';
import { CategoryWithStats } from '../../types/category';
import styles from './TransactionFilters.module.scss';

interface TransactionFiltersProps {
  categories: CategoryWithStats[];
  onFilterChange: (filters: TransactionFilter) => void;
  initialFilters?: TransactionFilter;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  categories,
  onFilterChange,
  initialFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilter>(initialFilters || {});

  const handleFilterChange = (key: keyof TransactionFilter, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length;

  return (
    <div className={styles.transactionFilters}>
      <button
        className={`${styles.filterToggle} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.filterIcon}>🔍</span>
        <span>フィルター</span>
        {activeFilterCount > 0 && (
          <span className={styles.filterBadge}>{activeFilterCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.filterPanel}>
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>検索</h4>
            <input
              type="text"
              placeholder="メモや場所で検索..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>取引タイプ</h4>
            <div className={styles.filterOptions}>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="transaction_type"
                  value=""
                  checked={!filters.transaction_type}
                  onChange={() => handleFilterChange('transaction_type', undefined)}
                />
                <span>すべて</span>
              </label>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="transaction_type"
                  value="income"
                  checked={filters.transaction_type === 'income'}
                  onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                />
                <span>💰 収入</span>
              </label>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="transaction_type"
                  value="expense"
                  checked={filters.transaction_type === 'expense'}
                  onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                />
                <span>💸 支出</span>
              </label>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>共有タイプ</h4>
            <div className={styles.filterOptions}>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="sharing_type"
                  value=""
                  checked={!filters.sharing_type}
                  onChange={() => handleFilterChange('sharing_type', undefined)}
                />
                <span>すべて</span>
              </label>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="sharing_type"
                  value="personal"
                  checked={filters.sharing_type === 'personal'}
                  onChange={(e) => handleFilterChange('sharing_type', e.target.value)}
                />
                <span>👤 個人</span>
              </label>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="sharing_type"
                  value="shared"
                  checked={filters.sharing_type === 'shared'}
                  onChange={(e) => handleFilterChange('sharing_type', e.target.value)}
                />
                <span>👫 共有</span>
              </label>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>カテゴリ</h4>
            <select
              value={filters.category_id || ''}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">すべてのカテゴリ</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>期間</h4>
            <div className={styles.dateInputs}>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className={styles.dateInput}
                placeholder="開始日"
              />
              <span className={styles.dateSeparator}>〜</span>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className={styles.dateInput}
                placeholder="終了日"
              />
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>金額範囲</h4>
            <div className={styles.amountInputs}>
              <input
                type="number"
                placeholder="最小"
                value={filters.min_amount || ''}
                onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                className={styles.amountInput}
              />
              <span className={styles.amountSeparator}>〜</span>
              <input
                type="number"
                placeholder="最大"
                value={filters.max_amount || ''}
                onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
                className={styles.amountInput}
              />
            </div>
          </div>


          <div className={styles.filterActions}>
            <button
              onClick={handleReset}
              className={`${styles.filterBtn} ${styles.filterBtnReset}`}
            >
              リセット
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={`${styles.filterBtn} ${styles.filterBtnApply}`}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};