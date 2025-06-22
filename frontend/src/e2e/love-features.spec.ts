import { test, expect } from './setup';

test.describe('Love Features', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication with partner
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    
    // Mock user API response with partner
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
  
  test('should display love statistics', async ({ page }) => {
    // Mock love statistics API
    await page.route('**/api/love/statistics*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: {
            start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
            description: '今月',
          },
          love_summary: {
            total_love_spending: 45000,
            love_transaction_count: 8,
            avg_love_rating: 4.5,
            favorite_love_category: 'デート代',
          },
          love_categories: [
            {
              category: { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4' },
              amount: 35000,
              percentage: 77.8,
              avg_rating: 4.6,
            },
            {
              category: { id: '4', name: 'プレゼント', icon: '🎁', color: '#FF1493' },
              amount: 10000,
              percentage: 22.2,
              avg_rating: 4.2,
            },
          ],
          love_timeline: [
            { date: '2024-03-01', amount: 5000, rating: 5 },
            { date: '2024-03-05', amount: 3000, rating: 4 },
            { date: '2024-03-10', amount: 15000, rating: 5 },
            { date: '2024-03-14', amount: 10000, rating: 5 },
            { date: '2024-03-20', amount: 8000, rating: 4 },
            { date: '2024-03-25', amount: 4000, rating: 3 },
          ],
        }),
      });
    });
    
    await page.goto('http://localhost:3000/love');
    
    // Check love summary
    await expect(page.locator('h1:has-text("Love Analytics")')).toBeVisible();
    await expect(page.locator('text=¥45,000')).toBeVisible();
    await expect(page.locator('text=8回のLove支出')).toBeVisible();
    await expect(page.locator('text=平均評価: 4.5')).toBeVisible();
    
    // Check love categories breakdown
    await expect(page.locator('text=デート代 (77.8%)')).toBeVisible();
    await expect(page.locator('text=¥35,000')).toBeVisible();
    
    // Check love timeline chart
    await expect(page.locator('.love-timeline-chart')).toBeVisible();
  });
  
  test('should manage love events', async ({ page }) => {
    // Mock love events API
    await page.route('**/api/love/events*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            events: [
              {
                id: '1',
                event_type: 'anniversary',
                name: '付き合った記念日',
                event_date: '2024-02-14',
                is_recurring: true,
                recurrence_type: 'yearly',
                description: '最初のデートの日',
                reminder_days: 7,
                is_active: true,
              },
              {
                id: '2',
                event_type: 'birthday',
                name: 'パートナーの誕生日',
                event_date: '2024-06-15',
                is_recurring: true,
                recurrence_type: 'yearly',
                reminder_days: 14,
                is_active: true,
              },
            ],
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/love/events');
    
    // Check event list
    await expect(page.locator('h2:has-text("Love Events")')).toBeVisible();
    await expect(page.locator('text=付き合った記念日')).toBeVisible();
    await expect(page.locator('text=2月14日')).toBeVisible();
    await expect(page.locator('text=パートナーの誕生日')).toBeVisible();
    await expect(page.locator('text=6月15日')).toBeVisible();
    
    // Add new event button
    await expect(page.locator('button:has-text("イベントを追加")')).toBeVisible();
  });
  
  test('should create a love event', async ({ page }) => {
    let eventCreated = false;
    
    // Mock event creation
    await page.route('**/api/love/events', async route => {
      if (route.request().method() === 'POST') {
        eventCreated = true;
        const data = route.request().postDataJSON();
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '3',
            ...data,
            created_at: new Date().toISOString(),
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/love/events/new');
    
    // Fill in event form
    await page.selectOption('select[name="event_type"]', 'custom');
    await page.fill('input[name="name"]', '初デート記念日');
    await page.fill('input[name="event_date"]', '2024-01-15');
    await page.fill('textarea[name="description"]', '初めて二人でデートした日');
    
    // Set reminder
    await page.fill('input[name="reminder_days"]', '7');
    
    // Enable recurring
    await page.check('input[name="is_recurring"]');
    await page.selectOption('select[name="recurrence_type"]', 'yearly');
    
    // Submit form
    await page.locator('button:has-text("作成")').click();
    
    // Should redirect to events list
    await expect(page).toHaveURL(/\/love\/events$/);
    
    // Verify event was created
    expect(eventCreated).toBe(true);
  });
  
  test('should display love goals', async ({ page }) => {
    // Mock love goals API
    await page.route('**/api/love/goals*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          goals: [
            {
              id: '1',
              name: '結婚資金',
              target_amount: 3000000,
              current_amount: 1200000,
              percentage: 40,
              target_date: '2025-12-31',
              is_shared: true,
              is_active: true,
            },
            {
              id: '2',
              name: '旅行資金（ハワイ）',
              target_amount: 500000,
              current_amount: 350000,
              percentage: 70,
              target_date: '2024-08-01',
              is_shared: true,
              is_active: true,
            },
          ],
        }),
      });
    });
    
    await page.goto('http://localhost:3000/love/goals');
    
    // Check goals display
    await expect(page.locator('h2:has-text("Love Goals")')).toBeVisible();
    
    // Wedding fund goal
    await expect(page.locator('text=結婚資金')).toBeVisible();
    await expect(page.locator('text=¥1,200,000 / ¥3,000,000')).toBeVisible();
    await expect(page.locator('text=40%')).toBeVisible();
    
    // Travel fund goal
    await expect(page.locator('text=旅行資金（ハワイ）')).toBeVisible();
    await expect(page.locator('text=¥350,000 / ¥500,000')).toBeVisible();
    await expect(page.locator('text=70%')).toBeVisible();
    
    // Progress bars with love theme
    const progressBars = page.locator('.love-progress-bar');
    await expect(progressBars).toHaveCount(2);
  });
  
  test('should rate a love transaction', async ({ page }) => {
    // Mock single transaction API
    await page.route('**/api/transactions/1', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            amount: 5000,
            transaction_type: 'expense',
            sharing_type: 'shared',
            category_id: '3',
            category: { id: '3', name: 'デート代', icon: '💕', color: '#FF69B4', is_love_category: true },
            description: '記念日ディナー',
            transaction_date: new Date().toISOString().split('T')[0],
            love_rating: null,
            created_at: new Date().toISOString(),
          }),
        });
      } else if (route.request().method() === 'PATCH') {
        const data = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            love_rating: data.love_rating,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });
    
    await page.goto('http://localhost:3000/transactions/1');
    
    // Check for love rating section
    await expect(page.locator('text=Love度評価')).toBeVisible();
    
    // Click 5 stars
    const stars = page.locator('.love-rating-stars .star');
    await stars.nth(4).click(); // 5th star (5 rating)
    
    // Confirmation message
    await expect(page.locator('text=Love度を評価しました！')).toBeVisible();
  });
  
  test('should display partner activity feed', async ({ page }) => {
    // Mock partner activity API
    await page.route('**/api/love/activities*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [
            {
              id: '1',
              type: 'transaction',
              user: { display_name: 'Partner User' },
              action: 'created',
              target: 'デート代の支出',
              amount: 5000,
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '2',
              type: 'goal',
              user: { display_name: 'Partner User' },
              action: 'contributed',
              target: '結婚資金',
              amount: 50000,
              timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: '3',
              type: 'love_rating',
              user: { display_name: 'Partner User' },
              action: 'rated',
              target: '記念日ディナー',
              rating: 5,
              timestamp: new Date(Date.now() - 10800000).toISOString(),
            },
          ],
        }),
      });
    });
    
    await page.goto('http://localhost:3000/love/activities');
    
    // Check activity feed
    await expect(page.locator('h2:has-text("Partner Activities")')).toBeVisible();
    
    // Check activities
    await expect(page.locator('text=Partner Userがデート代の支出を作成しました')).toBeVisible();
    await expect(page.locator('text=¥5,000')).toBeVisible();
    
    await expect(page.locator('text=Partner Userが結婚資金に貢献しました')).toBeVisible();
    await expect(page.locator('text=¥50,000')).toBeVisible();
    
    await expect(page.locator('text=Partner Userが記念日ディナーを評価しました')).toBeVisible();
    await expect(page.locator('.star.active')).toHaveCount(5);
  });
});