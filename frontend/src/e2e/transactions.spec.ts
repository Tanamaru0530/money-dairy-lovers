import { test, expect } from './setup';

test.describe('Transaction Flow', () => {
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
    
    // Mock categories API response
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            { id: '1', name: '食費', icon: '🍽️', color: '#FF6B6B', is_default: true, is_love_category: false },
            { id: '2', name: '交通費', icon: '🚗', color: '#4ECDC4', is_default: true, is_love_category: false },
            { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4', is_default: true, is_love_category: true },
            { id: '4', name: 'プレゼント', icon: '🎁', color: '#FF1493', is_default: true, is_love_category: true },
          ],
        }),
      });
    });
  });
  
  test('should display transaction list', async ({ page }) => {
    // Mock transactions API response
    await page.route('**/api/transactions*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: [
              {
                id: '1',
                amount: 3500,
                transaction_type: 'expense',
                sharing_type: 'personal',
                category: { id: '1', name: '食費', icon: '🍽️', color: '#FF6B6B' },
                description: 'ランチ',
                transaction_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
              },
              {
                id: '2',
                amount: 5000,
                transaction_type: 'expense',
                sharing_type: 'shared',
                category: { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4' },
                description: '記念日ディナー',
                transaction_date: new Date().toISOString().split('T')[0],
                love_rating: 5,
                created_at: new Date().toISOString(),
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              total_pages: 1,
            },
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions');
    
    // Should display transactions
    await expect(page.locator('text=ランチ')).toBeVisible();
    await expect(page.locator('text=¥3,500')).toBeVisible();
    await expect(page.locator('text=記念日ディナー')).toBeVisible();
    await expect(page.locator('text=¥5,000')).toBeVisible();
    
    // Love transaction should have special styling
    const loveTransaction = page.locator('text=記念日ディナー').locator('..');
    await expect(loveTransaction).toHaveClass(/love/);
  });
  
  test('should create a new transaction', async ({ page, loveTestData }) => {
    let transactionCreated = false;
    
    // Mock transaction creation
    await page.route('**/api/transactions', async route => {
      if (route.request().method() === 'POST') {
        transactionCreated = true;
        const data = route.request().postDataJSON();
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '123',
            ...data,
            category: { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4' },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions/new');
    
    // Fill in transaction form
    await page.fill('input[name="amount"]', loveTestData.transaction.amount.toString());
    await page.selectOption('select[name="category_id"]', '3'); // デート代
    await page.fill('textarea[name="description"]', loveTestData.transaction.description);
    
    // Select sharing type
    await page.locator('label:has-text("共有")').click();
    
    // Set love rating
    const ratingStars = page.locator('.love-rating .star');
    await ratingStars.nth(4).click(); // 5つ星
    
    // Submit form
    await page.locator('button:has-text("登録")').click();
    
    // Should redirect to transactions list
    await expect(page).toHaveURL(/\/transactions$/);
    
    // Verify transaction was created
    expect(transactionCreated).toBe(true);
  });
  
  test('should filter transactions by category', async ({ page }) => {
    // Mock filtered transactions API response
    await page.route('**/api/transactions*', async route => {
      const url = new URL(route.request().url());
      const categoryId = url.searchParams.get('category_id');
      
      if (categoryId === '3') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: [
              {
                id: '2',
                amount: 5000,
                transaction_type: 'expense',
                sharing_type: 'shared',
                category: { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4' },
                description: '記念日ディナー',
                transaction_date: new Date().toISOString().split('T')[0],
                love_rating: 5,
                created_at: new Date().toISOString(),
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              total_pages: 1,
            },
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions');
    
    // Click on category filter
    await page.selectOption('select[name="category"]', '3'); // デート代
    
    // Should only show love transactions
    await expect(page.locator('text=記念日ディナー')).toBeVisible();
    await expect(page.locator('text=ランチ')).not.toBeVisible();
  });
  
  test('should edit a transaction', async ({ page }) => {
    // Mock single transaction API response
    await page.route('**/api/transactions/1', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            amount: 3500,
            transaction_type: 'expense',
            sharing_type: 'personal',
            category_id: '1',
            description: 'ランチ',
            transaction_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            ...route.request().postDataJSON(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions/1/edit');
    
    // Update amount
    await page.fill('input[name="amount"]', '4000');
    
    // Update description
    await page.fill('textarea[name="description"]', 'ランチ（更新）');
    
    // Submit form
    await page.locator('button:has-text("更新")').click();
    
    // Should redirect to transactions list
    await expect(page).toHaveURL(/\/transactions$/);
  });
  
  test('should delete a transaction', async ({ page }) => {
    let transactionDeleted = false;
    
    // Mock delete transaction API
    await page.route('**/api/transactions/1', async route => {
      if (route.request().method() === 'DELETE') {
        transactionDeleted = true;
        await route.fulfill({
          status: 204,
        });
      }
    });
    
    // Mock transactions list
    await page.route('**/api/transactions*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: [
              {
                id: '1',
                amount: 3500,
                transaction_type: 'expense',
                sharing_type: 'personal',
                category: { id: '1', name: '食費', icon: '🍽️', color: '#FF6B6B' },
                description: 'ランチ',
                transaction_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              total_pages: 1,
            },
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions');
    
    // Click delete button
    await page.locator('button[aria-label="削除"]').first().click();
    
    // Confirm deletion in dialog
    await page.locator('button:has-text("削除する")').click();
    
    // Verify transaction was deleted
    expect(transactionDeleted).toBe(true);
  });
});