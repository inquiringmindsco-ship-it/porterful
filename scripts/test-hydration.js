/**
 * Hydration Guard — runs the required route-transition sequence and fails on any hydration error.
 * 
 * Run as: node scripts/test-hydration.js
 * 
 * Required flow (mobile, logged out, empty state):
 * 1. Homepage → 2. /artists → 3. /store → 4. /signup → 5. Homepage
 * 
 * Fail conditions (any of):
 * • React error #418 (hydration mismatch)
 * • React error #423 (Suspense boundary failure)
 * • "Hydration failed" in console
 * • "There was an error while hydrating" in console
 * • Full-root client render fallback
 * • Application Error on any route
 */

const { chromium, devices } = require('playwright');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'Mobile Safari (iPhone 12)', ...devices['iPhone 12'] },
  { name: 'Mobile Chrome (Pixel 5)', ...devices['Pixel 5'] },
];

const ROUTES = [
  { url: '/', name: 'Homepage' },
  { url: '/artists', name: '/artists' },
  { url: '/store', name: '/store' },
  { url: '/trending', name: '/trending' },
  { url: '/artist/rob-soule', name: '/artist/rob-soule' },
  {
    url: '/product/75006c54-3f40-4309-81a1-a85de8f34841',
    name: '/product/Coming Home Tee',
    verifyReadableHeading: true,
  },
  { url: '/signup', name: '/signup' },
  { url: '/', name: 'Homepage (return)' },
];

const FAIL_PATTERNS = [
  /Minified React error #418/,
  /Minified React error #423/,
  /Hydration failed/i,
  /There was an error while hydrating/i,
  /a client-side exception/i,
  /Application Error/i,
];

function relativeLuminance(rgb) {
  const channels = rgb.match(/[0-9.]+/g)?.slice(0, 3).map(Number) || [];
  if (channels.length !== 3) return null;
  const linear = channels.map(channel => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

async function runTest(browser, viewport) {
  const ctx = await browser.newContext({ ...viewport });
  const page = await ctx.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  for (const route of ROUTES) {
    errors.length = 0;
    await page.goto(BASE_URL + route.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    const matched = errors.filter(e => FAIL_PATTERNS.some(p => p.test(e)));
    const crash = (await page.textContent('body').catch(() => '')).includes('Application Error');
    let visualFailure = null;

    if (route.verifyReadableHeading) {
      const heading = page.locator('h1').first();
      const headingVisible = await heading.isVisible().catch(() => false);
      const colors = headingVisible
        ? await heading.evaluate(element => {
            const headingStyle = getComputedStyle(element);
            const themedRoot = element.closest('[style*="--pf-bg"]');
            const rootStyle = themedRoot ? getComputedStyle(themedRoot) : getComputedStyle(document.body);
            return { foreground: headingStyle.color, background: rootStyle.backgroundColor };
          })
        : null;
      const foreground = colors ? relativeLuminance(colors.foreground) : null;
      const background = colors ? relativeLuminance(colors.background) : null;
      const contrast = foreground === null || background === null
        ? 0
        : (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);

      if (!headingVisible || contrast < 4.5) {
        visualFailure = `Unreadable product heading (contrast ${contrast.toFixed(2)}:1)`;
      }
    }
    
    if (matched.length > 0 || crash || visualFailure) {
      await ctx.close();
      return {
        pass: false,
        route: route.name,
        errors: matched.length + (visualFailure ? 1 : 0),
        sample: visualFailure || matched[0]?.substring(0, 200) || 'crash',
      };
    }
  }
  
  await ctx.close();
  return { pass: true, route: 'all', errors: 0 };
}

async function main() {
  console.log('=== HYDRATION GUARD TEST ===\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Sequence: ${ROUTES.map(r => r.name).join(' → ')}\n`);
  
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  
  let allPass = true;
  
  for (const viewport of VIEWPORTS) {
    process.stdout.write(`Testing ${viewport.name}... `);
    const result = await runTest(browser, viewport);
    
    if (result.pass) {
      console.log('✅ PASS');
    } else {
      console.log(`❌ FAIL at ${result.route} (${result.errors} errors)`);
      console.log(`  Sample: ${result.sample}`);
      allPass = false;
    }
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(40));
  if (allPass) {
    console.log('✅ ALL PASS — hydration guard clean');
    process.exit(0);
  } else {
    console.log('❌ FAILURE — hydration errors detected');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
