import { useState, useCallback, FormEvent, ChangeEvent, FocusEvent } from 'react';

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface ValidationRule {
  required?: boolean | { value: boolean; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  validate?: ((value: any) => boolean | string) | Record<string, (value: any) => boolean | string>;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules;
  onSubmit: (values: T) => void | Promise<void>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit';
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (name: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (name: keyof T) => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  reset: () => void;
  validateField: (name: keyof T) => string | undefined;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  mode = 'onBlur',
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Internal validate function that takes values as parameter
  const validateFieldWithValues = useCallback(
    (name: keyof T, currentValues: T): string | undefined => {
      const value = currentValues[name as string];
      const rules = validationRules[name as string];
      
      if (!rules) return undefined;

      // Required validation
      if (rules.required) {
        const isEmpty = value === '' || value === null || value === undefined;
        if (isEmpty) {
          if (typeof rules.required === 'object') {
            return rules.required.message;
          }
          return 'このフィールドは必須です';
        }
      }

      // Skip other validations if field is empty and not required
      if (!value && !rules.required) return undefined;

      // MinLength validation
      if (rules.minLength && typeof value === 'string') {
        const minLength = typeof rules.minLength === 'object' ? rules.minLength.value : rules.minLength;
        const message = typeof rules.minLength === 'object' ? rules.minLength.message : `${minLength}文字以上入力してください`;
        if (value.length < minLength) {
          return message;
        }
      }

      // MaxLength validation
      if (rules.maxLength && typeof value === 'string') {
        const maxLength = typeof rules.maxLength === 'object' ? rules.maxLength.value : rules.maxLength;
        const message = typeof rules.maxLength === 'object' ? rules.maxLength.message : `${maxLength}文字以内で入力してください`;
        if (value.length > maxLength) {
          return message;
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string') {
        const isPatternObject = typeof rules.pattern === 'object' && !(rules.pattern instanceof RegExp);
        const pattern = isPatternObject ? (rules.pattern as any).value : rules.pattern as RegExp;
        const message = isPatternObject ? (rules.pattern as any).message : '正しい形式で入力してください';
        if (pattern && !pattern.test(value)) {
          return message;
        }
      }

      // Min validation (for numbers)
      if (rules.min && typeof value === 'number') {
        const min = typeof rules.min === 'object' ? rules.min.value : rules.min;
        const message = typeof rules.min === 'object' ? rules.min.message : `${min}以上の値を入力してください`;
        if (value < min) {
          return message;
        }
      }

      // Max validation (for numbers)
      if (rules.max && typeof value === 'number') {
        const max = typeof rules.max === 'object' ? rules.max.value : rules.max;
        const message = typeof rules.max === 'object' ? rules.max.message : `${max}以下の値を入力してください`;
        if (value > max) {
          return message;
        }
      }

      // Custom validation
      if (rules.validate) {
        if (typeof rules.validate === 'function') {
          const result = rules.validate(value);
          if (typeof result === 'string') return result;
          if (!result) return '入力値が正しくありません';
        } else {
          // Multiple custom validators
          for (const validatorName in rules.validate) {
            const validator = rules.validate[validatorName];
            const result = validator(value);
            if (typeof result === 'string') return result;
            if (!result) return '入力値が正しくありません';
          }
        }
      }

      return undefined;
    },
    [validationRules]
  );

  // Validate a single field using current values
  const validateField = useCallback(
    (name: keyof T): string | undefined => {
      return validateFieldWithValues(name, values);
    },
    [values, validateFieldWithValues]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateFieldWithValues(field as keyof T, values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateFieldWithValues]);

  // Handle input change
  const handleChange = useCallback(
    (name: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value, type } = e.target;
      let newValue: any = value;

      // Handle checkbox
      if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      }
      // Handle number input
      else if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      }

      setValuesState((prev) => ({ ...prev, [name]: newValue }));
      setIsDirty(true);

      // Validate on change if mode is onChange
      if (mode === 'onChange') {
        // Need to validate with the new value since state hasn't updated yet
        const updatedValues = { ...values, [name]: newValue };
        const error = validateFieldWithValues(name, updatedValues);
        if (error !== undefined) {
          setErrors((prev) => ({ ...prev, [name as string]: error }));
        } else {
          // Clear the error if validation passes
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name as string];
            return newErrors;
          });
        }
      }
    },
    [mode, values, validateFieldWithValues]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (name: keyof T) => (_e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [name as string]: true }));

      // Validate on blur if mode is onBlur or onChange
      if (mode === 'onBlur' || mode === 'onChange') {
        const error = validateField(name);
        setErrors((prev) => ({ ...prev, [name as string]: error }));
      }
    },
    [mode, validateField]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Mark all fields as touched
      const allTouched: FormTouched = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate form
      const isValid = validateForm();
      if (!isValid) return;

      // Submit form
      setIsSubmitting(true);
      
      // Use setTimeout to ensure state update happens before async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Set single value
  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  // Set single error
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  // Clear single error
  const clearError = useCallback((name: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Reset form to initial state
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    reset,
    validateField,
    validateForm,
  };
}