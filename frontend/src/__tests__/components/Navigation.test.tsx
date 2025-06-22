import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Navigation } from '../../components/common/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/auth';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  display_name: 'テストユーザー',
  is_active: true,
  email_verified: true,
  love_theme_preference: 'default',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockAuth = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  updateUser: vi.fn(),
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuth),
}));

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation when authenticated', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );

    expect(screen.getByText('Money Dairy Lovers')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('取引')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('レポート')).toBeInTheDocument();
  });

  it('renders user name when available', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );

    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('ログアウト');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockAuth.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('renders navigation links correctly', () => {
    render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );

    const dashboardLink = screen.getByRole('link', { name: /ダッシュボード/ });
    const transactionsLink = screen.getByRole('link', { name: /取引/ });
    const categoriesLink = screen.getByRole('link', { name: /カテゴリ/ });
    const reportsLink = screen.getByRole('link', { name: /レポート/ });

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(transactionsLink).toHaveAttribute('href', '/transactions');
    expect(categoriesLink).toHaveAttribute('href', '/categories');
    expect(reportsLink).toHaveAttribute('href', '/reports');
  });

  it('does not render when not authenticated', () => {
    // Mock unauthenticated state
    vi.mocked(useAuth).mockReturnValueOnce({
      ...mockAuth,
      user: null,
      isAuthenticated: false,
    });
    
    const { container } = render(
      <TestWrapper>
        <Navigation />
      </TestWrapper>
    );

    // Navigation should not render anything when not authenticated
    const nav = container.querySelector('nav');
    expect(nav).toBeNull();
  });
});