const assert = require('node:assert/strict')

const baseUrl = (process.env.TEST_URL || '').replace(/\/$/, '')
if (!baseUrl) {
  console.error('Set TEST_URL to the exact Porterful preview URL.')
  process.exit(1)
}

const failures = []
let assertions = 0

async function request(path, options = {}) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(`${baseUrl}${path}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20_000),
        ...options,
      })
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function check(name, test) {
  assertions += 1
  try {
    await test()
    console.log(`PASS ${name}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${name}: ${message}`)
    console.error(`FAIL ${name}: ${message}`)
  }
}

function expectedLocation(path) {
  return `${baseUrl}${path}`
}

function absoluteLocation(location) {
  return new URL(location, baseUrl).toString()
}

async function main() {
  const publicRoutes = [
    '/',
    '/about',
    '/artists',
    '/blog',
    '/brands',
    '/collections/coming-home',
    '/contact',
    '/faq',
    '/privacy',
    '/refund',
    '/resources',
    '/signup',
    '/store',
    '/terms',
    '/trending',
  ]

  for (const path of publicRoutes) {
    await check(`${path} returns 200`, async () => {
      const response = await request(path)
      assert.equal(response.status, 200)
    })
  }

  const redirects = [
    ['/privacy/privacy', '/privacy'],
    ['/terms/terms', '/terms'],
    ['/faq/faq', '/faq'],
  ]

  for (const [source, destination] of redirects) {
    await check(`${source} redirects permanently`, async () => {
      const response = await request(source)
      assert.equal(response.status, 308)
      assert.equal(absoluteLocation(response.headers.get('location') || ''), expectedLocation(destination))
    })
  }

  for (const path of ['/dashboard', '/dashboard/artist', '/wallet']) {
    await check(`${path} requires authentication`, async () => {
      const response = await request(path)
      assert.equal(response.status, 307)
      const location = absoluteLocation(response.headers.get('location') || '')
      assert.match(location, new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/login\\?return=`))
    })
  }

  await check('anonymous wallet API is rejected', async () => {
    const response = await request('/api/wallet')
    assert.equal(response.status, 401)
  })

  await check('database schema health is fully passing', async () => {
    const response = await request('/api/health/schema')
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.equal(payload.ok, true)
    assert.equal(payload.summary?.failing, 0)
    assert.ok(payload.summary?.passing > 0)
  })

  await check('canonical health endpoint is fully passing', async () => {
    const response = await request('/api/health')
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.equal(payload.ok, true)
    assert.equal(payload.summary?.failing, 0)
  })

  await check('public product catalog contains only the Noble Naturals collection', async () => {
    const response = await request('/api/products?scope=store&limit=200')
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.ok(Array.isArray(payload.products))
    assert.deepEqual(
      payload.products.map((product) => product.id).sort(),
      ['noble-naturals-comb', 'noble-naturals-oil-2oz', 'noble-naturals-starter-kit'],
    )
    assert.ok(payload.products.every((product) => /noble naturals/i.test(product.artist)))
  })

  await check('inactive brands and archived products are absent from public pages', async () => {
    const [storeResponse, brandsResponse, inactiveBrandResponse] = await Promise.all([
      request('/store'),
      request('/brands'),
      request('/brands/marvelous-black'),
    ])
    assert.equal(storeResponse.status, 200)
    assert.equal(brandsResponse.status, 200)
    assert.equal(inactiveBrandResponse.status, 404)
    const publicHtml = `${await storeResponse.text()} ${await brandsResponse.text()}`
    assert.doesNotMatch(publicHtml, /Marvelous Black|Coming Home Tee|LIKENESS Signal Shirt/i)
    assert.match(publicHtml, /Noble Naturals/i)
  })

  await check('public artist directory returns artists', async () => {
    const response = await request('/api/artists')
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.ok(Array.isArray(payload.artists))
    assert.ok(payload.artists.length > 0)
  })

  await check('homepage data endpoint is healthy', async () => {
    const response = await request('/api/homepage-data')
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.ok(payload.counts?.publicArtists > 0)
    assert.ok(payload.counts?.activeTracks > 0)
  })

  await check('Rob Soule public artist page renders', async () => {
    const response = await request('/artist/rob-soule')
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, /Rob Soule/i)
  })

  await check('product detail metadata names the product', async () => {
    const catalogResponse = await request('/api/products?scope=store&limit=1')
    assert.equal(catalogResponse.status, 200)
    const catalog = await catalogResponse.json()
    const product = catalog.products?.[0]
    assert.ok(product?.id)
    assert.ok(product?.name)

    const response = await request(`/product/${encodeURIComponent(product.id)}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || ''
    assert.match(title, new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
    assert.notEqual(title, 'Porterful | Porterful')
  })

  await check('invalid contact submission is rejected without sending', async () => {
    const response = await request('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert.equal(response.status, 400)
  })

  const canonicalRoutes = ['/about', '/artists', '/contact', '/faq', '/privacy', '/store', '/terms', '/trending']
  for (const path of canonicalRoutes) {
    await check(`${path} declares its canonical URL`, async () => {
      const response = await request(path)
      const html = await response.text()
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
      assert.equal(canonical, `https://porterful.com${path}`)
    })
  }

  await check('security headers are present', async () => {
    const response = await request('/')
    assert.ok(response.headers.get('strict-transport-security'))
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.ok(response.headers.get('x-frame-options'))
    assert.ok(response.headers.get('referrer-policy'))
    assert.ok(response.headers.get('permissions-policy'))
  })

  await check('reserved metadata-like routes return 404', async () => {
    for (const path of ['/manifest.webmanifest', '/opengraph-image', '/twitter-image']) {
      const response = await request(path)
      assert.equal(response.status, 404, path)
    }
  })

  await check('public support copy uses the contact form', async () => {
    const paths = ['/blog', '/contact', '/faq', '/press-kit', '/privacy', '/terms']
    for (const path of paths) {
      const response = await request(path)
      const html = await response.text()
      assert.doesNotMatch(html, /(?:support|privacy|legal|press)@porterful\.com/i, path)
    }
  })

  await check('featured catalog contains no unsupported social-proof metrics', async () => {
    const response = await request('/trending')
    const html = await response.text()
    assert.doesNotMatch(html, /\+[0-9]+%|Real Sales Data|not fake numbers/i)
    assert.match(html, /Available now/i)
    assert.match(html, /Preview/i)
  })

  await check('every sitemap route responds successfully', async () => {
    const response = await request('/sitemap.xml')
    assert.equal(response.status, 200)
    const xml = await response.text()
    const paths = Array.from(xml.matchAll(/<loc>https:\/\/porterful\.com([^<]*)<\/loc>/g), (match) => match[1] || '/')
    assert.ok(paths.length > 0)
    for (const path of paths) {
      const routeResponse = await request(path)
      assert.equal(routeResponse.status, 200, path)
    }
  })

  console.log(`\n${assertions - failures.length}/${assertions} release checks passed for ${baseUrl}`)
  if (failures.length > 0) {
    console.error('\nRelease verification failed:')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
