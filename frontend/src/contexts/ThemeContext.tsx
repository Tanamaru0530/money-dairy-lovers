import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export type ThemeMode = 'light' | 'dark'
export type ThemeColor = 'default' | 'pink' | 'blue' | 'custom'

interface ThemeContextType {
  themeMode: ThemeMode
  themeColor: ThemeColor
  setThemeMode: (mode: ThemeMode) => void
  setThemeColor: (color: ThemeColor) => void
  toggleThemeMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [themeColor, setThemeColor] = useState<ThemeColor>('default')

  // ユーザーの設定を反映
  useEffect(() => {
    if (user?.loveThemePreference) {
      setThemeColor(user.loveThemePreference as ThemeColor)
    }
  }, [user])

  // ローカルストレージからテーマモードを読み込み
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode
    if (savedMode) {
      setThemeMode(savedMode)
    } else {
      // システムの設定を確認
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeMode(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // テーマの変更を反映
  useEffect(() => {
    const root = document.documentElement
    
    // テーマモードのクラスを設定
    root.classList.remove('light', 'dark')
    root.classList.add(themeMode)
    
    // テーマカラーのクラスを設定
    root.classList.remove('theme-default', 'theme-pink', 'theme-blue', 'theme-custom')
    root.classList.add(`theme-${themeColor}`)
    
    // データ属性も設定（互換性のため）
    root.setAttribute('data-theme-mode', themeMode)
    root.setAttribute('data-theme-color', themeColor)
    
    // ローカルストレージに保存
    localStorage.setItem('themeMode', themeMode)
    
    // デバッグ用
    console.log('Theme updated:', { themeMode, themeColor, classes: root.className })
  }, [themeMode, themeColor])

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = {
    themeMode,
    themeColor,
    setThemeMode,
    setThemeColor,
    toggleThemeMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}