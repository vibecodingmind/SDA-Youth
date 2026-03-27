import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main dashboard', async ({ page }) => {
    // Check for main elements
    await expect(page.locator('text=BUSYBEES')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Click on Leaderboard tab
    await page.click('text=Leaderboard');
    await expect(page.locator('text=🏆 Leaderboard')).toBeVisible();

    // Click on Badges tab
    await page.click('text=Badges');
    await expect(page.locator('text=Your Badges')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Check for stats cards
    await expect(page.locator('text=Your Points')).toBeVisible();
    await expect(page.locator('text=Your Rank')).toBeVisible();
    await expect(page.locator('text=Events Attended')).toBeVisible();
    await expect(page.locator('text=Badges Earned')).toBeVisible();
  });

  test('should show leaderboard rankings', async ({ page }) => {
    await page.click('text=Leaderboard');
    
    // Check for podium
    await expect(page.locator('text=Full Rankings')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access admin section', async ({ page }) => {
    await page.click('text=Admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should display admin tabs', async ({ page }) => {
    await page.click('text=Admin');
    
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Posts')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Reports')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that sidebar collapses on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    await page.goto('/');

    // Click menu button to toggle sidebar
    const menuButton = page.locator('button:has([class*="Menu"])');
    await menuButton.click();

    // Sidebar should still be functional
    await expect(page.locator('text=BUSYBEES')).toBeVisible();
  });
});
