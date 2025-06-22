import { test as base } from '@playwright/test';

// Extend basic test by adding custom fixtures
export const test = base.extend({
  // Add authentication state
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication by setting localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    
    await use(page);
  },
  
  // Add love-themed test data
  loveTestData: async ({}, use) => {
    const testData = {
      user: {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test Lover',
      },
      partner: {
        email: 'partner@example.com',
        displayName: 'Partner Lover',
      },
      transaction: {
        amount: 5000,
        category: 'デート代',
        description: '記念日ディナー',
        loveRating: 5,
      },
    };
    
    await use(testData);
  },
});

export { expect } from '@playwright/test';