import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import styles from './Modal.module.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}