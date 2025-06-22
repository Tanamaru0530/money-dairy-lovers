import { test, expect } from './setup';

test.describe('Dashboard Display', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    
    // Mock user API response
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '123',
          email: 'test@example.com',
          display_name: 'Test User',
          has_partner: true,
          partnership: {
            id: '456',
            partner: {
              id: '789',
              display_name: 'Partner User',
              email: 'partner@example.com',
            },
            status: 'active',
            love_anniversary: '2024-02-14',
            relationship_type: 'dating',
          },
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });
  });
  
  test('should display monthly summary', async ({ page }) => {
    // Mock dashboard summary API
    await page.route('**/api/dashboard/summary*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: {
            start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          },
          summary: {
            total_income: 250000,
            total_expense: 180000,
            balance: 70000,
            personal_expense: 80000,
            shared_expense: 100000,
            love_expense: 45000,
            transaction_count: 42,
          },
          love_summary: {
            total_love_spending: 45000,
            love_transaction_count: 8,
            avg_love_rating: 4.5,
            favorite_love_category: 'デート代',
          },
        }),
      });
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check summary cards
    await expect(page.locator('text=収入')).toBeVisible();
    await expect(page.locator('text=¥250,000')).toBeVisible();
    
    await expect(page.locator('text=支出')).toBeVisible();
    await expect(page.locator('text=¥180,000')).toBeVisible();
    
    await expect(page.locator('text=残高')).toBeVisible();
    await expect(page.locator('text=¥70,000')).toBeVisible();
    
    // Check love summary
    await expect(page.locator('text=Love支出')).toBeVisible();
    await expect(page.locator('text=¥45,000')).toBeVisible();
  });
  
  test('should display category breakdown chart', async ({ page }) => {
    // Mock category breakdown API
    await page.route('**/api/dashboard/categories*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            { category: { name: '食費', icon: '🍽️', color: '#FF6B6B' }, amount: 45000, percentage: 25 },
            { category: { name: '交通費', icon: '🚗', color: '#4ECDC4' }, amount: 30000, percentage: 16.7 },
            { category: { name: 'デート代', icon: '💕', color: '#FF69B4' }, amount: 35000, percentage: 19.4 },
            { category: { name: '日用品', icon: '👕', color: '#FFEAA7' }, amount: 20000, percentage: 11.1 },
            { category: { name: 'その他', icon: '📚', color: '#95A5A6' }, amount: 50000, percentage: 27.8 },
          ],
        }),
      });
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check if chart container exists
    await expect(page.locator('.chart-container canvas')).toBeVisible();
    
    // Check category labels
    await expect(page.locator('text=食費 (25%)')).toBeVisible();
    await expect(page.locator('text=デート代 (19.4%)')).toBeVisible();
  });
  
  test('should display recent transactions', async ({ page }) => {
    // Mock recent transactions API
    await page.route('**/api/transactions?limit=10*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          transactions: [
            {
              id: '1',
              amount: 1200,
              transaction_type: 'expense',
              sharing_type: 'personal',
              category: { name: '食費', icon: '🍽️', color: '#FF6B6B' },
              description: 'コンビニ',
              transaction_date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              amount: 5000,
              transaction_type: 'expense',
              sharing_type: 'shared',
              category: { name: 'デート代', icon: '💕', color: '#FF69B4', is_love_category: true },
              description: '映画デート',
              transaction_date: new Date().toISOString().split('T')[0],
              love_rating: 5,
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '3',
              amount: 250000,
              transaction_type: 'income',
              sharing_type: 'personal',
              category: { name: '給料', icon: '💰', color: '#10B981' },
              description: '月給',
              transaction_date: new Date().toISOString().split('T')[0],
              created_at: new Date(Date.now() - 7200000).toISOString(),
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            total_pages: 1,
          },
        }),
      });
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check recent transactions section
    await expect(page.locator('h2:has-text("最近の取引")')).toBeVisible();
    
    // Check transaction items
    await expect(page.locator('text=コンビニ')).toBeVisible();
    await expect(page.locator('text=-¥1,200')).toBeVisible();
    
    await expect(page.locator('text=映画デート')).toBeVisible();
    await expect(page.locator('text=-¥5,000')).toBeVisible();
    
    await expect(page.locator('text=月給')).toBeVisible();
    await expect(page.locator('text=+¥250,000')).toBeVisible();
    
    // Check "View All" link
    await expect(page.locator('a:has-text("すべて見る")')).toBeVisible();
  });
  
  test('should display budget progress', async ({ page }) => {
    // Mock budget progress API
    await page.route('**/api/budgets/current*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          budgets: [
            {
              id: '1',
              name: '月間予算',
              amount: 200000,
              spent: 180000,
              remaining: 20000,
              percentage: 90,
              category: null,
              is_love_budget: false,
            },
            {
              id: '2',
              name: 'デート予算',
              amount: 50000,
              spent: 35000,
              remaining: 15000,
              percentage: 70,
              category: { name: 'デート代', icon: '💕', color: '#FF69B4' },
              is_love_budget: true,
            },
          ],
        }),
      });
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check budget progress section
    await expect(page.locator('h2:has-text("予算進捗")')).toBeVisible();
    
    // Check overall budget
    await expect(page.locator('text=月間予算')).toBeVisible();
    await expect(page.locator('text=¥180,000 / ¥200,000')).toBeVisible();
    await expect(page.locator('text=90%')).toBeVisible();
    
    // Check love budget
    await expect(page.locator('text=デート予算')).toBeVisible();
    await expect(page.locator('text=¥35,000 / ¥50,000')).toBeVisible();
    await expect(page.locator('text=70%')).toBeVisible();
    
    // Progress bars should be visible
    await expect(page.locator('.progress-bar')).toHaveCount(2);
  });
  
  test('should display love anniversary countdown', async ({ page }) => {
    // Calculate days until next anniversary
    const today = new Date();
    const currentYear = today.getFullYear();
    let anniversary = new Date(currentYear, 1, 14); // February 14
    
    if (anniversary < today) {
      anniversary = new Date(currentYear + 1, 1, 14);
    }
    
    const daysUntil = Math.ceil((anniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check anniversary countdown
    await expect(page.locator('.anniversary-countdown')).toBeVisible();
    await expect(page.locator(`text=記念日まであと${daysUntil}日`)).toBeVisible();
  });
  
  test('should navigate to different sections from dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on "Add Transaction" button
    await page.locator('a:has-text("取引を追加")').click();
    await expect(page).toHaveURL(/\/transactions\/new/);
    
    // Go back to dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on "View All Transactions"
    await page.locator('a:has-text("すべて見る")').first().click();
    await expect(page).toHaveURL(/\/transactions/);
    
    // Go back to dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on "Manage Budget"
    await page.locator('a:has-text("予算管理")').click();
    await expect(page).toHaveURL(/\/budgets/);
  });
});