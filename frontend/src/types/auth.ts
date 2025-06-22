import { User } from './user'

// Re-export User for backward compatibility
export type { User } from './user'

// Authentication types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  display_name: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}