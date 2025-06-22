import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.scss';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'love' | 'couple' | 'special';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large' | 'love';
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'love';
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  hoverable = false,
  padding = 'medium',
  shadow = 'medium',
}) => {
  const isClickable = !!onClick || hoverable;
  
  return (
    <div
      className={clsx(
        styles.card,
        styles[`card--${variant}`],
        styles[`card--padding-${padding}`],
        styles[`card--shadow-${shadow}`],
        {
          [styles['card--clickable']]: isClickable,
        },
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  variant = 'default',
}) => {
  return (
    <div className={clsx(styles.cardHeader, styles[`cardHeader--${variant}`], className)}>
      {(title || subtitle) && (
        <div className={styles.cardHeaderContent}>
          {title && (
            <h3 className={clsx(styles.cardTitle, {
              [styles['cardTitle--love']]: variant === 'love',
            })}>
              {title}
            </h3>
          )}
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
      )}
      {children}
      {action && <div className={styles.cardHeaderAction}>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={clsx(styles.cardContent, className)}>{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  align = 'right',
}) => {
  return (
    <div
      className={clsx(
        styles.cardFooter,
        styles[`cardFooter--${align}`],
        className
      )}
    >
      {children}
    </div>
  );
};

// For backward compatibility
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';