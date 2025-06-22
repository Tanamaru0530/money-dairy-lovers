import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useForm } from './useForm';

describe('useForm Hook', () => {
  it('initializes with default values', () => {
    const initialValues = {
      email: 'test@example.com',
      password: '',
    };
    
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: vi.fn(),
    }));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it('handles input changes', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { email: '' },
      onSubmit: vi.fn(),
    }));
    
    act(() => {
      const onChange = result.current.handleChange('email');
      onChange({
        target: { name: 'email', value: 'new@example.com', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.values.email).toBe('new@example.com');
    expect(result.current.isDirty).toBe(true);
  });

  it('handles blur events', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { email: '' },
      onSubmit: vi.fn(),
    }));
    
    act(() => {
      const onBlur = result.current.handleBlur('email');
      onBlur({
        target: { name: 'email' }
      } as React.FocusEvent<HTMLInputElement>);
    });
    
    expect(result.current.touched.email).toBe(true);
  });

  it('validates required fields on submit', async () => {
    const onSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '' },
        validationRules: {
          email: { required: true }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors.email).toBe('このフィールドは必須です');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates with custom error messages', async () => {
    const onSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '' },
        validationRules: {
          email: { 
            required: { value: true, message: 'メールアドレスを入力してください' }
          }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors.email).toBe('メールアドレスを入力してください');
  });

  it('calls onSubmit when validation passes', async () => {
    const onSubmit = vi.fn();
    const values = { email: 'test@example.com' };
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: values,
        validationRules: {
          email: { required: true }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors).toEqual({});
    expect(onSubmit).toHaveBeenCalledWith(values);
  });

  it('validates pattern', async () => {
    const onSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: 'invalid-email' },
        validationRules: {
          email: { 
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '有効なメールアドレスを入力してください'
            }
          }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors.email).toBe('有効なメールアドレスを入力してください');
  });

  it('sets field value', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: vi.fn()
      })
    );
    
    act(() => {
      result.current.setValue('email', 'updated@example.com');
    });
    
    expect(result.current.values.email).toBe('updated@example.com');
    expect(result.current.values.password).toBe('');
    expect(result.current.isDirty).toBe(true);
  });

  it('sets field error', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { email: '' },
      onSubmit: vi.fn()
    }));
    
    act(() => {
      result.current.setError('email', 'Invalid email');
    });
    
    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.isValid).toBe(false);
  });

  it('sets multiple values', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: vi.fn()
      })
    );
    
    act(() => {
      result.current.setValues({
        email: 'new@example.com',
        password: 'newpassword'
      });
    });
    
    expect(result.current.values).toEqual({
      email: 'new@example.com',
      password: 'newpassword'
    });
  });

  it('resets form to initial values', () => {
    const initialValues = { email: 'initial@example.com' };
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: vi.fn()
    }));
    
    // Change values
    act(() => {
      result.current.setValue('email', 'changed@example.com');
      result.current.setError('email', 'Error');
      const onBlur = result.current.handleBlur('email');
      onBlur({
        target: { name: 'email' }
      } as React.FocusEvent<HTMLInputElement>);
    });
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it('validates field on blur when mode is onBlur', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: '' },
        validationRules: {
          email: { required: true }
        },
        onSubmit: vi.fn(),
        mode: 'onBlur'
      })
    );
    
    act(() => {
      const onBlur = result.current.handleBlur('email');
      onBlur({
        target: { name: 'email' }
      } as React.FocusEvent<HTMLInputElement>);
    });
    
    expect(result.current.errors.email).toBe('このフィールドは必須です');
  });

  it('validates field on change when mode is onChange', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: 'invalid' },
        validationRules: {
          email: { 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          }
        },
        onSubmit: vi.fn(),
        mode: 'onChange'
      })
    );
    
    act(() => {
      const onChange = result.current.handleChange('email');
      onChange({
        target: { name: 'email', value: 'still-invalid', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.errors.email).toBe('正しい形式で入力してください');
  });

  it('handles form submission state', async () => {
    const onSubmit = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { email: 'test@example.com' },
        onSubmit
      })
    );
    
    expect(result.current.isSubmitting).toBe(false);
    
    let submitPromise: Promise<void>;
    
    await act(async () => {
      submitPromise = result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
      
      // Force a re-render to check isSubmitting state
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    await act(async () => {
      await submitPromise!;
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('handles checkbox input type', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { agree: false },
      onSubmit: vi.fn(),
    }));
    
    act(() => {
      const onChange = result.current.handleChange('agree');
      onChange({
        target: { name: 'agree', checked: true, type: 'checkbox' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.values.agree).toBe(true);
  });

  it('handles number input type', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { age: 0 },
      onSubmit: vi.fn(),
    }));
    
    act(() => {
      const onChange = result.current.handleChange('age');
      onChange({
        target: { name: 'age', value: '25', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.values.age).toBe(25);
  });

  it('validates min and max for numbers', async () => {
    const onSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { age: 150 },
        validationRules: {
          age: { 
            min: { value: 18, message: '18歳以上である必要があります' },
            max: { value: 100, message: '100歳以下である必要があります' }
          }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors.age).toBe('100歳以下である必要があります');
  });

  it('validates minLength and maxLength', async () => {
    const onSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useForm({
        initialValues: { password: 'abc' },
        validationRules: {
          password: { 
            minLength: { value: 8, message: 'パスワードは8文字以上必要です' }
          }
        },
        onSubmit
      })
    );
    
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as any);
    });
    
    expect(result.current.errors.password).toBe('パスワードは8文字以上必要です');
  });

  it('clears single error', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { email: '', password: '' },
      onSubmit: vi.fn()
    }));
    
    act(() => {
      result.current.setError('email', 'Email error');
      result.current.setError('password', 'Password error');
    });
    
    act(() => {
      result.current.clearError('email');
    });
    
    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBe('Password error');
  });

  it('clears all errors', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { email: '', password: '' },
      onSubmit: vi.fn()
    }));
    
    act(() => {
      result.current.setError('email', 'Email error');
      result.current.setError('password', 'Password error');
    });
    
    act(() => {
      result.current.clearErrors();
    });
    
    expect(result.current.errors).toEqual({});
  });
});