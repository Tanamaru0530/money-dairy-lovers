import { test, expect } from './setup';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });
  
  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Money Dairy Lovers');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible();
  });
  
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('button:has-text("ログイン")').click();
    
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible();
    await expect(page.locator('text=パスワードを入力してください')).toBeVisible();
  });
  
  test('should login successfully with valid credentials', async ({ page, loveTestData }) => {
    // Fill in login form
    await page.fill('input[type="email"]', loveTestData.user.email);
    await page.fill('input[type="password"]', loveTestData.user.password);
    
    // Mock successful login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          token_type: 'bearer',
          user: {
            id: '123',
            email: loveTestData.user.email,
            display_name: loveTestData.user.displayName,
            is_active: true,
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
    });
    
    // Submit form
    await page.locator('button:has-text("ログイン")').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show user name in navigation
    await expect(page.locator(`text=${loveTestData.user.displayName}`)).toBeVisible();
  });
  
  test('should show error message for invalid credentials', async ({ page, loveTestData }) => {
    // Fill in login form
    await page.fill('input[type="email"]', loveTestData.user.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Mock failed login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'メールアドレスまたはパスワードが正しくありません',
        }),
      });
    });
    
    // Submit form
    await page.locator('button:has-text("ログイン")').click();
    
    // Should show error message
    await expect(page.locator('text=メールアドレスまたはパスワードが正しくありません')).toBeVisible();
  });
  
  test('should navigate to register page', async ({ page }) => {
    await page.locator('text=新規登録はこちら 💝').click();
    
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.locator('h1')).toContainText('アカウント作成');
  });
  
  test('should logout successfully', async ({ authenticatedPage }) => {
    // Mock current user response
    await authenticatedPage.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123',
          email: 'test@example.com',
          display_name: 'Test User',
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });
    
    // Navigate to dashboard
    await authenticatedPage.goto('http://localhost:3000/dashboard');
    
    // Click logout button
    await authenticatedPage.locator('button:has-text("ログアウト")').click();
    
    // Should redirect to login page
    await expect(authenticatedPage).toHaveURL(/\/auth\/login/);
    
    // Should clear localStorage
    const hasToken = await authenticatedPage.evaluate(() => {
      return !!window.localStorage.getItem('accessToken');
    });
    expect(hasToken).toBe(false);
  });
});