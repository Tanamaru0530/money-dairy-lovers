import React, { useState } from 'react'
import styles from './AmountInput.module.scss'

interface AmountInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  className?: string
  error?: string
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  error
}) => {
  const [isComposing, setIsComposing] = useState(false)
  const [tempValue, setTempValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) {
      setTempValue(e.target.value)
      return
    }
    
    const inputValue = e.target.value
    const convertedValue = inputValue
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    const numericValue = convertedValue.replace(/[^\d]/g, '')
    
    onChange(numericValue === '' ? undefined : Number(numericValue))
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    const inputValue = e.currentTarget.value
    const convertedValue = inputValue
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    const numericValue = convertedValue.replace(/[^\d]/g, '')
    
    onChange(numericValue === '' ? undefined : Number(numericValue))
    setTempValue('')
  }

  return (
    <div className={`${styles.amountInputWrapper} ${className}`}>
      <span className={styles.currencySymbol}>¥</span>
      <input
        type="text"
        inputMode="numeric"
        className={`${styles.amountInput} ${error ? styles.hasError : ''}`}
        value={isComposing ? tempValue : (value?.toLocaleString() || '')}
        onChange={handleChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}