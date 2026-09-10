const assert = require('node:assert/strict')
const { chromium, devices } = require('playwright')

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const EXPECTED_PRODUCTS = [
  'noble-naturals-comb',
  'noble-naturals-oil-2oz',
  'noble-naturals-starter-kit',
]

function luminance(color) {
  const channels = color.match(/[0-9.]+/g)?.slice(0, 3).map(Number) || []
  assert.equal(channels.length, 3, `Could not parse color: ${color}`)
  const linear = channels.map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function ratio(foreground, background) {
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

async function verifyContrast(page, route) {
  const results = await page.locator('[data-contrast-text]').evaluateAll((elements) => elements.map((element) => {
    const surface = element.closest('[data-contrast-surface]')
    return {
      text: element.textContent?.trim() || element.tagName,
      foreground: getComputedStyle(element).color,
      background: surface ? getComputedStyle(surface).backgroundColor : '',
    }
  }))
  assert.ok(results.length > 0, `${route} exposes no contrast checkpoints`)
  for (const result of results) {
    assert.ok(ratio(result.foreground, result.background) >= 4.5, `${route}: low contrast for "${result.text}"`)
  }
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  const viewports = [
    { name: 'desktop', viewport: { width: 1440, height: 1000 } },
    { name: 'iPhone 12', ...devices['iPhone 12'] },
  ]

  try {
    for (const theme of ['light', 'dark']) {
      for (const viewport of viewports) {
        const context = await browser.newContext(viewport)
        await context.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme)
        const page = await context.newPage()

        await page.goto(`${BASE_URL}/store`, { waitUntil: 'networkidle' })
        assert.equal(await page.locator('html').getAttribute('class').then((value) => value?.includes(theme)), true)
        await page.waitForFunction((ids) => {
          const links = Array.from(document.querySelectorAll('a[href^="/product/"]'))
            .map((link) => link.getAttribute('href')?.split('/').pop())
            .filter(Boolean)
          return ids.every((id) => links.includes(id))
        }, EXPECTED_PRODUCTS)
        const productIds = await page.locator('a[href^="/product/"]').evaluateAll((links) => (
          [...new Set(links.map((link) => link.getAttribute('href')?.split('/').pop()).filter(Boolean))].sort()
        ))
        assert.deepEqual(productIds, [...EXPECTED_PRODUCTS].sort(), `${theme}/${viewport.name}: public product set drifted`)
        assert.doesNotMatch(await page.locator('body').innerText(), /Marvelous Black|Coming Home Tee|LIKENESS Signal Shirt/i)
        await verifyContrast(page, `/store (${theme}, ${viewport.name})`)

        await page.goto(`${BASE_URL}/brands`, { waitUntil: 'networkidle' })
        assert.match(await page.locator('body').innerText(), /Noble Naturals/i)
        assert.doesNotMatch(await page.locator('body').innerText(), /Marvelous Black|Coming Home Collection/i)
        await verifyContrast(page, `/brands (${theme}, ${viewport.name})`)

        await page.goto(`${BASE_URL}/product/noble-naturals-oil-2oz`, { waitUntil: 'networkidle' })
        await verifyContrast(page, `/product/noble-naturals-oil-2oz (${theme}, ${viewport.name})`)
        await context.close()
      }
    }
    console.log('PASS storefront catalog, theme contrast, and responsive matrix')
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
