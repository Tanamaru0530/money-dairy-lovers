import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, Mock, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '@/services/authService';
import { tokenManager } from '@/services/api';
import React from 'react';
import { createMockUser, createMockLoginResponse } from '@/test/factories';

// Mock authService
vi.mock('@/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    isAuthenticated: vi.fn(),
  }
}));

// Mock tokenManager
vi.mock('@/services/api', () => ({
  tokenManager: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
  api: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
}));

// Test component that uses useAuth
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = createMockUser({
    displayName: 'Test User',
    is_active: true,
    email_verified: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock console.error to suppress expected errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides authentication context', () => {
    (tokenManager.getAccessToken as Mock).mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
  });

  it('loads current user on mount when token exists', async () => {
    (tokenManager.getAccessToken as Mock).mockReturnValue('valid-token');
    (authService.getCurrentUser as Mock).mockResolvedValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });
  });

  it('handles login', async () => {
    const mockLoginResponse = createMockLoginResponse({
      user: mockUser,
    });
    
    (tokenManager.getAccessToken as Mock).mockReturnValue(null);
    (authService.login as Mock).mockResolvedValue(mockLoginResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });
  });

  it('handles logout', async () => {
    (tokenManager.getAccessToken as Mock).mockReturnValue('valid-token');
    (authService.getCurrentUser as Mock).mockResolvedValue(mockUser);
    (authService.logout as Mock).mockResolvedValue(undefined);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  it('handles failed user load', async () => {
    (tokenManager.getAccessToken as Mock).mockReturnValue('invalid-token');
    (authService.getCurrentUser as Mock).mockRejectedValue(new Error('Unauthorized'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  it('handles login error', async () => {
    (tokenManager.getAccessToken as Mock).mockReturnValue(null);
    (authService.login as Mock).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    loginButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });

  it.skip('refreshes token automatically', async () => {
    vi.useFakeTimers();
    
    const mockRefreshResponse = {
      access_token: 'refreshed-token',
      refresh_token: 'new-refresh-token',
      token_type: 'bearer',
    };
    
    (tokenManager.getAccessToken as Mock).mockReturnValue('valid-token');
    (authService.getCurrentUser as Mock).mockResolvedValue(mockUser);
    (authService.refreshToken as Mock).mockResolvedValue(mockRefreshResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Fast-forward 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000);
    
    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalled();
    });
    
    vi.useRealTimers();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});