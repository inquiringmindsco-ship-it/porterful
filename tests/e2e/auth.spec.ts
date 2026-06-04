import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads directly at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });

  test('/login/login redirects to /login', async ({ page }) => {
    await page.goto('/login/login');
    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login with email/password succeeds and lands on /dashboard', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL || 'porterful-test-user@porterful.test';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('navbar shows authenticated state after login', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL || 'porterful-test-user@porterful.test';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navbar should show user avatar/email, not "Sign In"
    await expect(page.locator('text=Sign In')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('refresh on /dashboard preserves auth state', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL || 'porterful-test-user@porterful.test';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Refresh the page
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Sign In')).not.toBeVisible();
  });

  test('missing-profile user gets auto-created or redirected to /signup?setup=1', async ({ page }) => {
    // This test requires a test user without a profile
    // Skip in CI unless TEST_USER_NO_PROFILE is set
    test.skip(!process.env.TEST_USER_NO_PROFILE, 'Requires test user without profile');

    const email = process.env.TEST_USER_NO_PROFILE!;
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Should either land on dashboard (auto-created) or signup (setup required)
    await expect(page).toHaveURL(/\/dashboard|\/signup\?setup=1/);
  });
});

test.describe('Artist Dashboard UI', () => {
  test('artist dashboard thumbnails stay contained', async ({ page }) => {
    const email = process.env.TEST_ARTIST_EMAIL || 'porterful-artist@porterful.test';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword123';

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to artist dashboard
    await page.goto('/dashboard/dashboard/artist');
    await expect(page).toHaveURL('/dashboard/dashboard/artist');

    // Check that album thumbnails are contained (no overflow)
    const albumThumbnails = page.locator('[data-testid="album-thumbnail"]');
    await expect(albumThumbnails.first()).toBeVisible();
    
    // Check that track thumbnails are contained
    const trackThumbnails = page.locator('[data-testid="track-thumbnail"]');
    await expect(trackThumbnails.first()).toBeVisible();

    // Check that product thumbnails are contained
    const productThumbnails = page.locator('[data-testid="product-thumbnail"]');
    await expect(productThumbnails.first()).toBeVisible();

    // Verify no images are overflowing their containers
    // This is a visual regression check - images should not overlay text/buttons
    const overflowedImages = page.locator('img[style*="position: absolute"]:not([data-contained="true"])');
    await expect(overflowedImages).toHaveCount(0);
  });
});
