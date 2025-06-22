import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helpText?: string;
  icon?: React.ReactNode;
  isLoveThemed?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  helpText,
  icon,
  isLoveThemed = false,
  fullWidth = true,
  className,
  required,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx(styles['input-group'], { [styles['input-group--full-width']]: fullWidth })}>
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(styles.label, {
            [styles['label--required']]: required,
            [styles['label--love']]: isLoveThemed,
          })}
        >
          {label}
        </label>
      )}
      
      <div className={clsx(styles['input-wrapper'], { [styles['input-with-icon']]: icon })}>
        {icon && (
          <span className={clsx(styles['input-icon'], {
            [styles['input-icon--love']]: isLoveThemed
          })}>
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            styles.input,
            {
              [styles['input--error']]: error,
              [styles['input--success']]: success,
              [styles['input--love']]: isLoveThemed,
              [styles['input--with-icon']]: icon,
            },
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className={styles['error-message']} role="alert">
          {error}
        </span>
      )}
      
      {success && !error && (
        <span className={styles['success-message']}>
          {success}
        </span>
      )}
      
      {helpText && !error && !success && (
        <span
          id={`${inputId}-help`}
          className={clsx(styles['help-text'], {
            [styles['help-text--love']]: isLoveThemed,
          })}
        >
          {helpText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';