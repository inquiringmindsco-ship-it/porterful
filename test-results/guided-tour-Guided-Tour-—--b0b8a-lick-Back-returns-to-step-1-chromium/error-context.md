# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guided-tour.spec.ts >> Guided Tour — Clean Session >> Step 5 — Click Back returns to step 1
- Location: tests/e2e/guided-tour.spec.ts:83:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Back")')
    - locator resolved to <button disabled type="button" class="inline-flex items-center gap-2 rounded-lg border border-[var(--pf-border)] px-3 py-2 text-sm text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)] disabled:cursor-not-allowed disabled:opacity-50">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    25 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "Porterful" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]: Porterful
      - generic [ref=e8]:
        - link "Music" [ref=e9] [cursor=pointer]:
          - /url: /music
          - text: Music
        - link "Artists" [ref=e10] [cursor=pointer]:
          - /url: /artists
          - text: Artists
        - link "Apply" [ref=e11] [cursor=pointer]:
          - /url: /apply
          - text: Apply
      - generic [ref=e12]:
        - link "Cart (0 items)" [ref=e13] [cursor=pointer]:
          - /url: /cart
          - img [ref=e14]
        - link "Sign In" [ref=e19] [cursor=pointer]:
          - /url: /login
  - generic [ref=e20]:
    - main [ref=e21]
    - contentinfo [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e32]: Porterful
          - paragraph [ref=e33]: Music. Directly from the artists.
        - generic [ref=e34]:
          - link "Music" [ref=e35] [cursor=pointer]:
            - /url: /music
          - link "Artists" [ref=e36] [cursor=pointer]:
            - /url: /artists
          - link "Contact" [ref=e37] [cursor=pointer]:
            - /url: /contact
          - link "Terms" [ref=e38] [cursor=pointer]:
            - /url: /terms
          - link "Privacy" [ref=e39] [cursor=pointer]:
            - /url: /privacy
          - link "Refunds" [ref=e40] [cursor=pointer]:
            - /url: /refund
          - link "Copyright" [ref=e41] [cursor=pointer]:
            - /url: /dmca
  - alert [ref=e42]
  - generic [ref=e46]:
    - generic [ref=e47]:
      - generic [ref=e48]:
        - paragraph [ref=e49]: Step 1 of 9
        - heading "Welcome to Porterful" [level=2] [ref=e50]
      - img [ref=e52]
    - paragraph [ref=e54]: Porterful helps creators turn music, content, artwork, and approved products into trackable commerce.
    - generic [ref=e55]:
      - button "Back" [disabled] [ref=e56]:
        - img [ref=e57]
        - text: Back
      - button "Resume Later" [ref=e59] [cursor=pointer]:
        - img [ref=e60]
        - text: Resume Later
      - button "Skip Tour" [ref=e63] [cursor=pointer]:
        - img [ref=e64]
        - text: Skip Tour
      - button "Next" [ref=e66] [cursor=pointer]:
        - text: Next
        - img [ref=e67]
```

# Test source

```ts
  1   | import { test, expect, BrowserContext, Page } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * PORTERFUL GUIDED TOUR — CLEAN SESSION VERIFICATION
  5   |  * 
  6   |  * Tests the artist onboarding tour from a completely fresh browser state.
  7   |  * localStorage is cleared before each test to simulate a first-time user.
  8   |  */
  9   | 
  10  | const TOUR_STORAGE_KEY = 'porterful.guided-tour.artist';
  11  | 
  12  | async function clearTourState(page: Page) {
  13  |   await page.evaluate((key) => {
  14  |     localStorage.removeItem(key);
  15  |   }, TOUR_STORAGE_KEY);
  16  | }
  17  | 
  18  | test.describe('Guided Tour — Clean Session', () => {
  19  |   test.beforeEach(async ({ page }) => {
  20  |     await page.goto('/');
  21  |     await clearTourState(page);
  22  |   });
  23  | 
  24  |   test('Step 1 — Tour auto-starts on first visit to /dashboard/artist', async ({ page }) => {
  25  |     await page.goto('/dashboard/artist');
  26  |     await page.waitForLoadState('networkidle');
  27  |     await page.waitForTimeout(1000);
  28  | 
  29  |     // Tour overlay should appear
  30  |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  31  |     await expect(overlay).toBeVisible({ timeout: 5000 });
  32  | 
  33  |     // Tour card with step indicator should be present
  34  |     const stepIndicator = page.locator('text=/Step 1 of/i');
  35  |     await expect(stepIndicator).toBeVisible();
  36  | 
  37  |     // Welcome title
  38  |     const title = page.locator('h2:has-text("Welcome to Porterful")');
  39  |     await expect(title).toBeVisible();
  40  |   });
  41  | 
  42  |   test('Step 2 — Backdrop dims the page', async ({ page }) => {
  43  |     await page.goto('/dashboard/artist');
  44  |     await page.waitForLoadState('networkidle');
  45  |     await page.waitForTimeout(1000);
  46  | 
  47  |     // Black/75 backdrop
  48  |     const backdrop = page.locator('div.bg-black\\/75');
  49  |     await expect(backdrop).toBeVisible();
  50  |   });
  51  | 
  52  |   test('Step 3 — Tour card shows title and body', async ({ page }) => {
  53  |     await page.goto('/dashboard/artist');
  54  |     await page.waitForLoadState('networkidle');
  55  |     await page.waitForTimeout(1000);
  56  | 
  57  |     const cardTitle = page.locator('h2:has-text("Welcome to Porterful")');
  58  |     await expect(cardTitle).toBeVisible();
  59  | 
  60  |     const cardBody = page.locator('text=Porterful helps creators');
  61  |     await expect(cardBody).toBeVisible();
  62  |   });
  63  | 
  64  |   test('Step 4 — Click Next advances to step 2', async ({ page }) => {
  65  |     await page.goto('/dashboard/artist');
  66  |     await page.waitForLoadState('networkidle');
  67  |     await page.waitForTimeout(1000);
  68  | 
  69  |     const nextBtn = page.locator('button:has-text("Next")');
  70  |     await expect(nextBtn).toBeVisible();
  71  |     await nextBtn.click();
  72  |     await page.waitForTimeout(800);
  73  | 
  74  |     // Should now show step 2
  75  |     const step2Indicator = page.locator('text=/Step 2 of/i');
  76  |     await expect(step2Indicator).toBeVisible();
  77  | 
  78  |     // Different title
  79  |     const title2 = page.locator('h2:has-text("Dashboard")');
  80  |     await expect(title2).toBeVisible();
  81  |   });
  82  | 
  83  |   test('Step 5 — Click Back returns to step 1', async ({ page }) => {
  84  |     await page.goto('/dashboard/artist');
  85  |     await page.waitForLoadState('networkidle');
  86  |     await page.waitForTimeout(1000);
  87  | 
  88  |     // Advance to step 2
  89  |     const nextBtn = page.locator('button:has-text("Next")');
  90  |     await nextBtn.click();
  91  |     await page.waitForTimeout(800);
  92  | 
  93  |     // Click Back (button is disabled on step 1, but enabled on step 2)
  94  |     const backBtn = page.locator('button:has-text("Back")');
  95  |     // Back button should be enabled now
  96  |     await expect(backBtn).toBeVisible();
> 97  |     await backBtn.click();
      |                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  98  |     await page.waitForTimeout(800);
  99  | 
  100 |     // Should show step 1 again
  101 |     const step1Indicator = page.locator('text=/Step 1 of/i');
  102 |     await expect(step1Indicator).toBeVisible();
  103 |   });
  104 | 
  105 |   test('Step 6 — Skip Tour closes overlay and marks completed', async ({ page }) => {
  106 |     await page.goto('/dashboard/artist');
  107 |     await page.waitForLoadState('networkidle');
  108 |     await page.waitForTimeout(1000);
  109 | 
  110 |     const skipBtn = page.locator('button:has-text("Skip Tour")');
  111 |     await expect(skipBtn).toBeVisible();
  112 |     await skipBtn.click();
  113 |     await page.waitForTimeout(800);
  114 | 
  115 |     // Overlay should be gone
  116 |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  117 |     await expect(overlay).not.toBeVisible();
  118 |   });
  119 | 
  120 |   test('Step 7 — localStorage has completed status', async ({ page }) => {
  121 |     await page.goto('/dashboard/artist');
  122 |     await page.waitForLoadState('networkidle');
  123 |     await page.waitForTimeout(1000);
  124 | 
  125 |     const skipBtn = page.locator('button:has-text("Skip Tour")');
  126 |     await skipBtn.click();
  127 |     await page.waitForTimeout(500);
  128 | 
  129 |     const ls = await page.evaluate((key) => {
  130 |       const raw = localStorage.getItem(key);
  131 |       return raw ? JSON.parse(raw) : null;
  132 |     }, TOUR_STORAGE_KEY);
  133 | 
  134 |     expect(ls).not.toBeNull();
  135 |     expect(ls.status).toBe('completed');
  136 |     expect(ls.scope).toBe('artist');
  137 |   });
  138 | 
  139 |   test('Step 8 — Refresh page, tour does NOT auto-start', async ({ page }) => {
  140 |     // First complete the tour
  141 |     await page.goto('/dashboard/artist');
  142 |     await page.waitForLoadState('networkidle');
  143 |     await page.waitForTimeout(1000);
  144 | 
  145 |     const skipBtn = page.locator('button:has-text("Skip Tour")');
  146 |     await skipBtn.click();
  147 |     await page.waitForTimeout(500);
  148 | 
  149 |     // Refresh
  150 |     await page.reload();
  151 |     await page.waitForLoadState('networkidle');
  152 |     await page.waitForTimeout(1500);
  153 | 
  154 |     // Overlay should NOT appear
  155 |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  156 |     await expect(overlay).not.toBeVisible();
  157 |   });
  158 | 
  159 |   test('Step 9 — Restart Tour button present on /settings/settings', async ({ page }) => {
  160 |     // Complete tour first
  161 |     await page.goto('/dashboard/artist');
  162 |     await page.waitForLoadState('networkidle');
  163 |     await page.waitForTimeout(1000);
  164 |     await page.locator('button:has-text("Skip Tour")').click();
  165 |     await page.waitForTimeout(500);
  166 | 
  167 |     // Navigate to settings
  168 |     await page.goto('/settings/settings');
  169 |     await page.waitForLoadState('networkidle');
  170 |     await page.waitForTimeout(1000);
  171 | 
  172 |     const restartBtn = page.locator('button:has-text("Restart Guided Tour")');
  173 |     await expect(restartBtn).toBeVisible();
  174 |   });
  175 | 
  176 |   test('Step 10 — Click Restart Tour restarts at step 1', async ({ page }) => {
  177 |     // Complete tour first
  178 |     await page.goto('/dashboard/artist');
  179 |     await page.waitForLoadState('networkidle');
  180 |     await page.waitForTimeout(1000);
  181 |     await page.locator('button:has-text("Skip Tour")').click();
  182 |     await page.waitForTimeout(500);
  183 | 
  184 |     // Go to settings and restart
  185 |     await page.goto('/settings/settings');
  186 |     await page.waitForLoadState('networkidle');
  187 |     await page.waitForTimeout(1000);
  188 | 
  189 |     const restartBtn = page.locator('button:has-text("Restart Guided Tour")');
  190 |     await restartBtn.click();
  191 |     await page.waitForTimeout(1200);
  192 | 
  193 |     // Tour overlay should appear
  194 |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  195 |     await expect(overlay).toBeVisible();
  196 | 
  197 |     // Should be step 1
```