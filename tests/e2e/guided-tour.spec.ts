import { test, expect, BrowserContext, Page } from '@playwright/test';

/**
 * PORTERFUL GUIDED TOUR — CLEAN SESSION VERIFICATION
 * 
 * Tests the artist onboarding tour from a completely fresh browser state.
 * localStorage is cleared before each test to simulate a first-time user.
 */

const TOUR_STORAGE_KEY = 'porterful.guided-tour.artist';

async function clearTourState(page: Page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, TOUR_STORAGE_KEY);
}

test.describe('Guided Tour — Clean Session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearTourState(page);
  });

  test('Step 1 — Tour auto-starts on first visit to /dashboard/artist', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Tour overlay should appear
    const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
    await expect(overlay).toBeVisible({ timeout: 5000 });

    // Tour card with step indicator should be present
    const stepIndicator = page.locator('text=/Step 1 of/i');
    await expect(stepIndicator).toBeVisible();

    // Welcome title
    const title = page.locator('h2:has-text("Welcome to Porterful")');
    await expect(title).toBeVisible();
  });

  test('Step 2 — Backdrop dims the page', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Black/75 backdrop
    const backdrop = page.locator('div.bg-black\\/75');
    await expect(backdrop).toBeVisible();
  });

  test('Step 3 — Tour card shows title and body', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const cardTitle = page.locator('h2:has-text("Welcome to Porterful")');
    await expect(cardTitle).toBeVisible();

    const cardBody = page.locator('text=Porterful helps creators');
    await expect(cardBody).toBeVisible();
  });

  test('Step 4 — Click Next advances to step 2', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const nextBtn = page.locator('button:has-text("Next")');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await page.waitForTimeout(800);

    // Should now show step 2
    const step2Indicator = page.locator('text=/Step 2 of/i');
    await expect(step2Indicator).toBeVisible();

    // Different title
    const title2 = page.locator('h2:has-text("Dashboard")');
    await expect(title2).toBeVisible();
  });

  test('Step 5 — Click Back returns to step 1', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Advance to step 2
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();
    await page.waitForTimeout(800);

    // Click Back (button is disabled on step 1, but enabled on step 2)
    const backBtn = page.locator('button:has-text("Back")');
    // Back button should be enabled now
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForTimeout(800);

    // Should show step 1 again
    const step1Indicator = page.locator('text=/Step 1 of/i');
    await expect(step1Indicator).toBeVisible();
  });

  test('Step 6 — Skip Tour closes overlay and marks completed', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const skipBtn = page.locator('button:has-text("Skip Tour")');
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();
    await page.waitForTimeout(800);

    // Overlay should be gone
    const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
    await expect(overlay).not.toBeVisible();
  });

  test('Step 7 — localStorage has completed status', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const skipBtn = page.locator('button:has-text("Skip Tour")');
    await skipBtn.click();
    await page.waitForTimeout(500);

    const ls = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, TOUR_STORAGE_KEY);

    expect(ls).not.toBeNull();
    expect(ls.status).toBe('completed');
    expect(ls.scope).toBe('artist');
  });

  test('Step 8 — Refresh page, tour does NOT auto-start', async ({ page }) => {
    // First complete the tour
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const skipBtn = page.locator('button:has-text("Skip Tour")');
    await skipBtn.click();
    await page.waitForTimeout(500);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Overlay should NOT appear
    const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
    await expect(overlay).not.toBeVisible();
  });

  test('Step 9 — Restart Tour button present on /settings/settings', async ({ page }) => {
    // Complete tour first
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Skip Tour")').click();
    await page.waitForTimeout(500);

    // Navigate to settings
    await page.goto('/settings/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const restartBtn = page.locator('button:has-text("Restart Guided Tour")');
    await expect(restartBtn).toBeVisible();
  });

  test('Step 10 — Click Restart Tour restarts at step 1', async ({ page }) => {
    // Complete tour first
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Skip Tour")').click();
    await page.waitForTimeout(500);

    // Go to settings and restart
    await page.goto('/settings/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const restartBtn = page.locator('button:has-text("Restart Guided Tour")');
    await restartBtn.click();
    await page.waitForTimeout(1200);

    // Tour overlay should appear
    const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
    await expect(overlay).toBeVisible();

    // Should be step 1
    const step1Indicator = page.locator('text=/Step 1 of/i');
    await expect(step1Indicator).toBeVisible();
  });

  test('Step 11 — Resume Later sets paused state', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Advance a couple steps
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(800);

    const resumeLaterBtn = page.locator('button:has-text("Resume Later")');
    await expect(resumeLaterBtn).toBeVisible();
    await resumeLaterBtn.click();
    await page.waitForTimeout(800);

    // Check localStorage
    const ls = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, TOUR_STORAGE_KEY);

    expect(ls).not.toBeNull();
    expect(ls.status).toBe('paused');

    // Resume button should appear
    const resumeBtn = page.locator('button:has-text("Resume guided tour")');
    await expect(resumeBtn).toBeVisible();
  });

  test('Step 12 — Resume continues from paused step', async ({ page }) => {
    await page.goto('/dashboard/artist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Advance to step 2 then pause
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(800);

    const resumeLaterBtn = page.locator('button:has-text("Resume Later")');
    await resumeLaterBtn.click();
    await page.waitForTimeout(800);

    // Click Resume
    const resumeBtn = page.locator('button:has-text("Resume guided tour")');
    await resumeBtn.click();
    await page.waitForTimeout(1000);

    // Tour overlay should reappear
    const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
    await expect(overlay).toBeVisible();

    // Should still be on step 2 (not reset to step 1)
    const step2Indicator = page.locator('text=/Step 2 of/i');
    await expect(step2Indicator).toBeVisible();
  });
});
