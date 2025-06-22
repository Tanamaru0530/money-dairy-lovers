import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-love' | 'ghost' | 'love-special';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  loveAnimation?: 'heartbeat' | 'love-glow';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loveAnimation,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        {
          [styles['btn--full-width']]: fullWidth,
          [styles['btn--loading']]: loading,
          [styles[`btn--${loveAnimation}`]]: loveAnimation,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={styles['btn__spinner']}>💕</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={styles['btn__icon']}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={styles['btn__icon']}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export const HeartButton: React.FC<ButtonProps> = (props) => {
  return (
    <button
      className={clsx(styles['btn-heart'], props.className)}
      disabled={props.disabled}
      {...props}
    >
      <span className={styles['btn-heart__icon']}>💕</span>
    </button>
  );
};

export default Button;