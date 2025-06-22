import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AuthState, LoginRequest, RegisterRequest } from '@/types/auth'
import { User } from '@/types/user'
import authService from '@/services/authService'
import { tokenManager } from '@/services/api'

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const loadUser = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken()
      
      // 開発環境でのみログ出力
      if (import.meta.env.DEV) {
        console.log('AuthContext - loadUser - token exists:', !!token);
      }
      
      if (!token) {
        if (import.meta.env.DEV) {
          console.log('AuthContext - No token, setting unauthenticated');
        }
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      if (import.meta.env.DEV) {
        console.log('AuthContext - Getting current user...');
      }
      const user = await authService.getCurrentUser()
      
      // メールアドレスをマスクして表示
      if (import.meta.env.DEV && user?.email) {
        const [userPart, domain] = user.email.split('@');
        const maskedEmail = userPart ? `${userPart.charAt(0)}***@${domain}` : '***';
        console.log('AuthContext - User loaded with email:', maskedEmail);
      }
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('AuthContext - loadUser error');
      }
      tokenManager.clearTokens()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  const updateUserFromTokenRefresh = useCallback((userData: any) => {
    // トークンリフレッシュ後のユーザー情報更新
    if (userData) {
      setState(prev => ({ ...prev, user: userData }))
    }
  }, [])

  useEffect(() => {
    loadUser()
    
    // グローバルにupdateUserFromTokenRefreshを公開（トークンリフレッシュ時に使用）
    if (typeof window !== 'undefined') {
      (window as any).__updateUserFromTokenRefresh = updateUserFromTokenRefresh
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__updateUserFromTokenRefresh
      }
    }
  }, [loadUser, updateUserFromTokenRefresh])

  const login = async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const response = await authService.login(data)
      
      // ログインレスポンスからユーザー情報を取得
      const user = response.user
      
      // 開発環境でのみユーザー情報を確認
      if (import.meta.env.DEV) {
        console.log('AuthContext - Login response user:', {
          id: user?.id,
          displayName: user?.displayName || user?.display_name,
          email: user?.email ? `${user.email.charAt(0)}***@${user.email.split('@')[1]}` : undefined
        });
      }
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await authService.register(data)
      // After registration, log the user in
      await login({
        email: data.email,
        password: data.password,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await authService.logout()
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const refreshUser = async () => {
    await loadUser()
  }

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, user }))
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}