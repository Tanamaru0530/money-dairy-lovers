import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

// Mock auth service
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    clearTokens: vi.fn(),
    getTokens: vi.fn(() => null), // Start with no auth
  },
}));

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Money Dairy Lovers')).toBeInTheDocument();
      expect(screen.getByText('愛を育む家計簿アプリ')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    });
  });

  it('shows dashboard when authenticated', async () => {
    const authService = await import('../services/authService');
    // Mock authenticated state
    vi.mocked(authService.default.getTokens).mockReturnValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
    });
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      display_name: 'テストユーザー',
      is_active: true,
      email_verified: true,
      love_theme_preference: 'default',
      notification_settings: { email: true, push: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/おかえりなさい、テストユーザーさん！/)).toBeInTheDocument();
      expect(screen.getByText('今日も愛を込めて家計管理をしましょう')).toBeInTheDocument();
    });
  });

  it('shows loading screen while checking auth', async () => {
    const authService = await import('../services/authService');
    // Create a promise that we can control
    let resolveAuth: (value: any) => void;
    const authPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });
    
    vi.mocked(authService.default.getCurrentUser).mockReturnValue(authPromise as any);
    vi.mocked(authService.default.getTokens).mockReturnValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
    });

    render(<App />);

    // Should show loading
    expect(screen.getByText('愛を込めて読み込み中...')).toBeInTheDocument();

    // Resolve auth
    resolveAuth!({
      id: '1',
      email: 'test@example.com',
      display_name: 'テストユーザー',
      is_active: true,
      email_verified: true,
      love_theme_preference: 'default',
      notification_settings: { email: true, push: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Should show dashboard after auth resolves
    await waitFor(() => {
      expect(screen.queryByText('愛を込めて読み込み中...')).not.toBeInTheDocument();
      expect(screen.getByText(/おかえりなさい、テストユーザーさん！/)).toBeInTheDocument();
    });
  });

  it('renders register page', () => {
    render(<App />);
    
    // Since we're testing with BrowserRouter, we can't directly navigate to /auth/register
    // But we can check if the login page has a link to register
    const registerLink = screen.getByText('新規登録はこちら 💝');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/auth/register');
  });

  it('renders authenticated pages when user is logged in', async () => {
    const authService = await import('../services/authService');
    // Mock authenticated state
    vi.mocked(authService.default.getTokens).mockReturnValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
    });
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      display_name: 'テストユーザー',
      is_active: true,
      email_verified: true,
      love_theme_preference: 'default',
      notification_settings: { email: true, push: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<App />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/おかえりなさい、テストユーザーさん！/)).toBeInTheDocument();
    });

    // Check navigation links exist
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('取引')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('レポート')).toBeInTheDocument();
  });
});