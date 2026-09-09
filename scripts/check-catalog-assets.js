const fs = require('node:fs')
const path = require('node:path')

const sources = [
  'src/lib/products.ts',
  'src/lib/data.ts',
]

const assetPattern = /['"](\/[A-Za-z0-9_./-]+\.(?:avif|gif|jpe?g|png|svg|webp))['"]/gi
const missing = []

for (const source of sources) {
  const contents = fs.readFileSync(source, 'utf8')
  for (const match of contents.matchAll(assetPattern)) {
    const publicPath = path.join('public', match[1])
    if (!fs.existsSync(publicPath)) {
      missing.push(`${source}: ${match[1]}`)
    }
  }
}

if (missing.length > 0) {
  console.error('Catalog asset guard failed:')
  missing.forEach((entry) => console.error(`- ${entry}`))
  process.exit(1)
}

console.log('Catalog asset guard passed')
