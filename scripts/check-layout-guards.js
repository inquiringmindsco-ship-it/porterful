/**
 * Layout Guard — prevents route group layouts from rendering document roots.
 * 
 * Rule: Only src/app/layout.tsx may render <html>, <head>, or <body>.
 * Any other layout.tsx found containing these tags will fail the build.
 * 
 * Run as: node scripts/check-layout-guards.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_LAYOUT = path.resolve(__dirname, '../src/app/layout.tsx');
const APPS_DIR = path.resolve(__dirname, '../src/app');

// Find all layout.tsx files except root
function findLayouts(dir, layouts = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .next, .git
      if (!['node_modules', '.next', '.git', '.vercel'].includes(entry.name)) {
        const layoutPath = path.join(fullPath, 'layout.tsx');
        if (fs.existsSync(layoutPath)) {
          layouts.push(layoutPath);
        }
        findLayouts(fullPath, layouts);
      }
    }
  }
  return layouts;
}

const allLayouts = findLayouts(APPS_DIR);
const violations = [];

for (const layoutPath of allLayouts) {
  // Skip root layout (it SHOULD have html/body)
  if (path.resolve(layoutPath) === ROOT_LAYOUT) continue;
  
  const content = fs.readFileSync(layoutPath, 'utf8');
  
  // Check for document-level tags
  const hasHtml = /<html[\s>]/.test(content);
  const hasHead = /<head[\s>]/.test(content);
  const hasBody = /<body[\s>]/.test(content);
  
  if (hasHtml || hasHead || hasBody) {
    violations.push({
      path: path.relative(APPS_DIR, layoutPath),
      tags: [
        ...(hasHtml ? ['<html>'] : []),
        ...(hasHead ? ['<head>'] : []),
        ...(hasBody ? ['<body>'] : []),
      ].join(', ')
    });
  }
}

if (violations.length > 0) {
  console.error('❌ LAYOUT GUARD VIOLATION — Document roots found in route group layouts:\n');
  violations.forEach(v => {
    console.error(`  • ${v.path} — contains: ${v.tags}`);
  });
  console.error('\nOnly src/app/layout.tsx may render <html>, <head>, or <body>.');
  console.error('Route group layouts must render fragments (<>) or semantic divs only.');
  process.exit(1);
} else {
  console.log('✅ Layout guard passed — no document roots in route group layouts');
  process.exit(0);
}