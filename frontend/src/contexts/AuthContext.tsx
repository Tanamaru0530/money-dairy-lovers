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
      console.log('AuthContext - loadUser - token:', token ? 'exists' : 'none');
      
      if (!token) {
        console.log('AuthContext - No token, setting unauthenticated');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      console.log('AuthContext - Getting current user...');
      const user = await authService.getCurrentUser()
      console.log('AuthContext - User loaded:', user?.email);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.log('AuthContext - loadUser error:', error);
      tokenManager.clearTokens()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await authService.login(data)
      const user = await authService.getCurrentUser()
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