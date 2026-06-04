# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guided-tour.spec.ts >> Guided Tour — Clean Session >> Step 10 — Click Restart Tour restarts at step 1
- Location: tests/e2e/guided-tour.spec.ts:176:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Restart Guided Tour")')

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
    - main [ref=e21]:
      - paragraph [ref=e23]: Loading your settings…
    - contentinfo [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e29]: Porterful
          - paragraph [ref=e30]: Music. Directly from the artists.
        - generic [ref=e31]:
          - link "Music" [ref=e32] [cursor=pointer]:
            - /url: /music
          - link "Artists" [ref=e33] [cursor=pointer]:
            - /url: /artists
          - link "Contact" [ref=e34] [cursor=pointer]:
            - /url: /contact
          - link "Terms" [ref=e35] [cursor=pointer]:
            - /url: /terms
          - link "Privacy" [ref=e36] [cursor=pointer]:
            - /url: /privacy
          - link "Refunds" [ref=e37] [cursor=pointer]:
            - /url: /refund
          - link "Copyright" [ref=e38] [cursor=pointer]:
            - /url: /dmca
  - alert [ref=e39]
  - generic [ref=e43]:
    - generic [ref=e44]:
      - generic [ref=e45]:
        - paragraph [ref=e46]: Step 1 of 9
        - heading "Welcome to Porterful" [level=2] [ref=e47]
      - img [ref=e49]
    - paragraph [ref=e51]: Porterful helps creators turn music, content, artwork, and approved products into trackable commerce.
    - generic [ref=e52]:
      - button "Back" [disabled] [ref=e53]:
        - img [ref=e54]
        - text: Back
      - button "Resume Later" [ref=e56] [cursor=pointer]:
        - img [ref=e57]
        - text: Resume Later
      - button "Skip Tour" [ref=e60] [cursor=pointer]:
        - img [ref=e61]
        - text: Skip Tour
      - button "Next" [ref=e63] [cursor=pointer]:
        - text: Next
        - img [ref=e64]
```

# Test source

```ts
  90  |     await nextBtn.click();
  91  |     await page.waitForTimeout(800);
  92  | 
  93  |     // Click Back (button is disabled on step 1, but enabled on step 2)
  94  |     const backBtn = page.locator('button:has-text("Back")');
  95  |     // Back button should be enabled now
  96  |     await expect(backBtn).toBeVisible();
  97  |     await backBtn.click();
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
> 190 |     await restartBtn.click();
      |                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  191 |     await page.waitForTimeout(1200);
  192 | 
  193 |     // Tour overlay should appear
  194 |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  195 |     await expect(overlay).toBeVisible();
  196 | 
  197 |     // Should be step 1
  198 |     const step1Indicator = page.locator('text=/Step 1 of/i');
  199 |     await expect(step1Indicator).toBeVisible();
  200 |   });
  201 | 
  202 |   test('Step 11 — Resume Later sets paused state', async ({ page }) => {
  203 |     await page.goto('/dashboard/artist');
  204 |     await page.waitForLoadState('networkidle');
  205 |     await page.waitForTimeout(1000);
  206 | 
  207 |     // Advance a couple steps
  208 |     await page.locator('button:has-text("Next")').click();
  209 |     await page.waitForTimeout(800);
  210 | 
  211 |     const resumeLaterBtn = page.locator('button:has-text("Resume Later")');
  212 |     await expect(resumeLaterBtn).toBeVisible();
  213 |     await resumeLaterBtn.click();
  214 |     await page.waitForTimeout(800);
  215 | 
  216 |     // Check localStorage
  217 |     const ls = await page.evaluate((key) => {
  218 |       const raw = localStorage.getItem(key);
  219 |       return raw ? JSON.parse(raw) : null;
  220 |     }, TOUR_STORAGE_KEY);
  221 | 
  222 |     expect(ls).not.toBeNull();
  223 |     expect(ls.status).toBe('paused');
  224 | 
  225 |     // Resume button should appear
  226 |     const resumeBtn = page.locator('button:has-text("Resume guided tour")');
  227 |     await expect(resumeBtn).toBeVisible();
  228 |   });
  229 | 
  230 |   test('Step 12 — Resume continues from paused step', async ({ page }) => {
  231 |     await page.goto('/dashboard/artist');
  232 |     await page.waitForLoadState('networkidle');
  233 |     await page.waitForTimeout(1000);
  234 | 
  235 |     // Advance to step 2 then pause
  236 |     await page.locator('button:has-text("Next")').click();
  237 |     await page.waitForTimeout(800);
  238 | 
  239 |     const resumeLaterBtn = page.locator('button:has-text("Resume Later")');
  240 |     await resumeLaterBtn.click();
  241 |     await page.waitForTimeout(800);
  242 | 
  243 |     // Click Resume
  244 |     const resumeBtn = page.locator('button:has-text("Resume guided tour")');
  245 |     await resumeBtn.click();
  246 |     await page.waitForTimeout(1000);
  247 | 
  248 |     // Tour overlay should reappear
  249 |     const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  250 |     await expect(overlay).toBeVisible();
  251 | 
  252 |     // Should still be on step 2 (not reset to step 1)
  253 |     const step2Indicator = page.locator('text=/Step 2 of/i');
  254 |     await expect(step2Indicator).toBeVisible();
  255 |   });
  256 | });
  257 | 
```