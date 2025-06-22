import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TransactionFormData } from '@/types/transaction';
import { CategoryWithStats } from '@/types/category';
import { AmountInput } from '@/components/common/AmountInput';
import { ValidationRules } from '@/utils/validation';
import styles from './TransactionForm.module.scss';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  categories: CategoryWithStats[];
  initialData?: Partial<TransactionFormData> & { receipt_image_url?: string };
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  categories,
  initialData,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSharedOptions, setShowSharedOptions] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    mode: 'onChange',  // バリデーションモードを明示的に設定
    defaultValues: {
      amount: initialData?.amount || undefined,
      transaction_type: initialData?.transaction_type || 'expense',
      sharing_type: initialData?.sharing_type || 'personal',
      transaction_date: initialData?.transaction_date || new Date().toISOString().split('T')[0],
      payment_method: initialData?.payment_method || 'cash',
      description: initialData?.description || '',
      tags: initialData?.tags || [],
      category_id: initialData?.category_id || '',
      receipt_image: initialData?.receipt_image || undefined,
      shared_info: {
        split_type: 'equal',
        user1_amount: undefined,
        user2_amount: undefined,
        notes: ''
      },
      ...initialData,
    },
  });

  const watchTransactionType = watch('transaction_type');
  const watchSharingType = watch('sharing_type');
  const watchAmount = watch('amount');
  const watchSplitType = watch('shared_info.split_type');
  

  useEffect(() => {
    setShowSharedOptions(watchSharingType === 'shared');
  }, [watchSharingType]);

  // 分割金額を自動計算
  useEffect(() => {
    if (watchSharingType === 'shared' && watchSplitType === 'equal' && watchAmount > 0) {
      const halfAmount = Number((watchAmount / 2).toFixed(2));
      setValue('shared_info.user1_amount', halfAmount);
      setValue('shared_info.user2_amount', halfAmount);
    }
  }, [watchAmount, watchSharingType, watchSplitType, setValue]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    // イベントの伝播を確実に止める
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 各ステップのバリデーション
    if (currentStep === 1) {
      const amount = watch('amount');
      if (!amount || amount <= 0) {
        return;
      }
    } else if (currentStep === 2) {
      const categoryId = watch('category_id');
      if (!categoryId) {
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    // Step 3でのみ送信を許可
    if (currentStep !== 3) {
      return;
    }
    
    await onSubmit(data);
  };

  // フォーム内でEnterキーを押した時の処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Step 3以外ですべてのEnterキーを無効化
    if (e.key === 'Enter' && currentStep !== 3) {
      e.preventDefault();
      return;
    }
    
    // Step 3でも、submitボタン以外でのEnterキーは無効化
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
      e.preventDefault();
    }
  };

  const amountSuggestions = [500, 1000, 2000, 3000, 5000, 10000];

  const renderStep1 = () => (
    <div className={styles.step}>
      <h3 className={styles.stepTitle}>💰 金額を入力</h3>
      <p className={styles.stepDescription}>キーボードで直接入力するか、下のボタンから選択してください</p>

      <div className={styles.amountInputContainer}>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: '金額を入力してください',
            validate: {
              positive: (value) => ValidationRules.positiveNumber(value, '金額') || true,
              range: (value) => ValidationRules.numberRange(value, 1, 99999999, '金額') || true
            }
          }}
          render={({ field }) => (
            <AmountInput
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
            />
          )}
        />
      </div>

      <div className={styles.amountSuggestions}>
        {amountSuggestions.map((amount) => (
          <button
            key={amount}
            type="button"
            className={styles.suggestionBtn}
            onClick={() => setValue('amount', amount)}
          >
            ¥{amount.toLocaleString()}
          </button>
        ))}
      </div>

      <div className={styles.transactionTypeSelector}>
        <label className={`${styles.typeOption} ${watchTransactionType === 'expense' ? styles.selected : ''}`}>
          <input
            {...register('transaction_type')}
            type="radio"
            value="expense"
            className={styles.hiddenInput}
          />
          <div className={styles.typeIcon}>💸</div>
          <div className={styles.typeTitle}>支出</div>
        </label>
        <label className={`${styles.typeOption} ${watchTransactionType === 'income' ? styles.selected : ''}`}>
          <input
            {...register('transaction_type')}
            type="radio"
            value="income"
            className={styles.hiddenInput}
          />
          <div className={styles.typeIcon}>💰</div>
          <div className={styles.typeTitle}>収入</div>
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.step}>
      <h3 className={styles.stepTitle}>📂 カテゴリを選択</h3>
      <p className={styles.stepDescription}>取引のカテゴリを選択してください</p>

      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <label
            key={category.id}
            className={`${styles.categoryOption} ${category.is_love_category ? styles.loveCategory : ''} ${
              watch('category_id') === category.id ? styles.selected : ''
            }`}
          >
            <input
              {...register('category_id', { required: 'カテゴリを選択してください' })}
              type="radio"
              value={category.id}
              className={styles.hiddenInput}
            />
            <div className={styles.categoryIcon} style={{ color: category.color || '#6B7280' }}>
              {category.icon || '📂'}
            </div>
            <div className={styles.categoryName}>{category.name}</div>
          </label>
        ))}
      </div>
      {errors.category_id && <p className={styles.error}>{errors.category_id.message}</p>}
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.step}>
        <h3 className={styles.stepTitle}>📝 詳細情報</h3>
        <p className={styles.stepDescription}>取引の詳細を入力してください</p>

      <div className={styles.sharingSelector}>
        <label className={`${styles.sharingOption} ${watchSharingType === 'personal' ? styles.selected : ''}`}>
          <input
            {...register('sharing_type')}
            type="radio"
            value="personal"
            className={styles.hiddenInput}
          />
          <div className={styles.sharingIcon}>👤</div>
          <div className={styles.sharingTitle}>個人</div>
          <div className={styles.sharingDescription}>自分だけの支出</div>
        </label>
        <label className={`${styles.sharingOption} ${watchSharingType === 'shared' ? styles.selected : ''}`}>
          <input
            {...register('sharing_type')}
            type="radio"
            value="shared"
            className={styles.hiddenInput}
          />
          <div className={styles.sharingIcon}>👫</div>
          <div className={styles.sharingTitle}>共有</div>
          <div className={styles.sharingDescription}>パートナーと共有</div>
        </label>
      </div>

      {showSharedOptions && (
        <div className={`${styles.sharedDetails} ${styles.active}`}>
          <h4 className={styles.detailsTitle}>共有設定</h4>
          <div className={styles.splitOptions}>
            <label className={`${styles.splitOption} ${watchSplitType === 'equal' ? styles.selected : ''}`}>
              <input
                {...register('shared_info.split_type')}
                type="radio"
                value="equal"
                className={styles.hiddenInput}
              />
              均等割り
            </label>
            <label className={`${styles.splitOption} ${watchSplitType === 'amount' ? styles.selected : ''}`}>
              <input
                {...register('shared_info.split_type')}
                type="radio"
                value="amount"
                className={styles.hiddenInput}
              />
              金額指定
            </label>
          </div>

          {watchSplitType === 'amount' && (
            <div className={styles.amountInputs}>
              <div className={styles.inputGroup}>
                <label>あなたの負担額</label>
                <Controller
                  name="shared_info.user1_amount"
                  control={control}
                  rules={{
                    min: { value: 0, message: '0円以上を入力してください' },
                  }}
                  render={({ field }) => (
                    <AmountInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.shared_info?.user1_amount?.message}
                    />
                  )}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>パートナーの負担額</label>
                <Controller
                  name="shared_info.user2_amount"
                  control={control}
                  rules={{
                    min: { value: 0, message: '0円以上を入力してください' },
                  }}
                  render={({ field }) => (
                    <AmountInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.shared_info?.user2_amount?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>メモ（任意）</label>
            <input
              {...register('shared_info.notes')}
              type="text"
              placeholder="分割に関するメモ"
              className={styles.input}
            />
          </div>
        </div>
      )}

      <div className={styles.inputGroup}>
        <label>日付</label>
        <input
          {...register('transaction_date', { required: '日付を選択してください' })}
          type="date"
          className={styles.input}
        />
        {errors.transaction_date && <p className={styles.error}>{errors.transaction_date.message}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label>支払い方法</label>
        <select {...register('payment_method')} className={styles.input}>
          <option value="cash">現金</option>
          <option value="credit_card">クレジットカード</option>
          <option value="bank_transfer">銀行振込</option>
          <option value="digital_wallet">電子マネー</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>メモ（任意）</label>
        <textarea
          {...register('description')}
          placeholder="取引に関するメモ"
          className={styles.input}
          rows={3}
        />
      </div>
    </div>
  );

  const steps = [renderStep1, renderStep2, renderStep3];

  // フォーム送信を明示的に制御するフラグ
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 明示的に送信ボタンを押した時のみ処理
    if (!isSubmitting) {
      return;
    }
    
    // Step 3でのみhandleSubmitを実行
    if (currentStep === 3) {
      handleSubmit(handleFormSubmit)();
    }
    
    // フラグをリセット
    setIsSubmitting(false);
  };
  
  const handleSubmitClick = () => {
    setIsSubmitting(true);
    // 次のイベントループで送信
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }, 0);
  };

  return (
    <form 
      onSubmit={onFormSubmit}
      onKeyDown={handleKeyDown}
      className={styles.transactionForm}>
      <div className={styles.formSteps}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`${styles.step} ${currentStep === step ? styles.active : ''} ${
              currentStep > step ? styles.completed : ''
            }`}
            onClick={() => currentStep > step && handleStepChange(step)}
          >
            <div className={styles.stepNumber}>{currentStep > step ? '✓' : step}</div>
            <div className={styles.stepTitle}>
              {step === 1 ? '金額' : step === 2 ? 'カテゴリ' : '詳細'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formContent}>
        <div className={`${styles.formStep} ${styles.active}`}>{steps[currentStep - 1]()}</div>

        <div className={styles.formNavigation}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className={`${styles.navBtn} ${styles.navBtnPrev}`}
            >
              戻る
            </button>
          )}

          <div className={styles.progressIndicator}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`${styles.progressDot} ${currentStep === step ? styles.active : ''} ${
                  currentStep > step ? styles.completed : ''
                }`}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className={`${styles.navBtn} ${styles.navBtnNext}`}
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={isLoading}
              className={`${styles.navBtn} ${styles.navBtnSubmit}`}
            >
              {isLoading ? '登録中...' : '登録する 💕'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};