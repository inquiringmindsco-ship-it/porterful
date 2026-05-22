# Porterful Homepage Mobile Scroll Fix

## Problem
Mobile scroll on porterful.com homepage (SystemSelector) was freezing when swiping up. The page uses CSS scroll-snap with a fixed container and full-viewport sections.

## Root Causes Found

### 1. `e.preventDefault()` on wheel events fighting native scroll
The wheel handler called `preventDefault()` with `{ passive: false }`, manually overriding the browser's native scroll. This created scroll jank and on some mobile browsers caused freezing.

### 2. `100vh` doesn't account for mobile Safari address bar
Mobile Safari includes the address bar in `100vh`, making sections taller than the actual visible viewport. This caused:
- Sections to overflow
- Snap points to misalign with visible area
- `scrollTo(index * window.innerHeight)` to land at wrong positions

### 3. Missing `WebkitOverflowScrolling: 'touch'`
No momentum scrolling enabled for iOS Safari, making scroll feel sticky/unresponsive.

### 4. `scrollSnapAlign: 'center'` causing misalignment
With `100vh` sections, `center` alignment creates offset snap points. `start` is more reliable for full-viewport sections.

## Fixes Applied

1. **Dynamic viewport height**: Added `const [vh, setVh] = useState(window.innerHeight)` with resize/orientation listeners. All `100vh` references now use `${vh}px`.

2. **Passive wheel handler**: Changed from `{ passive: false }` with `preventDefault()` to `{ passive: true }`. Let CSS scroll-snap handle the actual scroll — JS only nudges direction.

3. **Added `WebkitOverflowScrolling: 'touch'`**: Enabled momentum scrolling on iOS.

4. **Changed `scrollSnapAlign: 'center'` to `'start'`**: Snap points now align to top of each section.

5. **Improved touch handling**: Added velocity detection (duration + delta) to ignore momentum flicks. Lowered threshold from 50px to 40px. Added debounce timeout.

## Files Modified
- `src/components/SystemSelector.tsx`

## Testing Notes
- Test on iOS Safari (main affected browser)
- Test on Android Chrome
- Verify scroll snap works with both swipe and wheel
- Verify section heights match viewport after address bar shows/hides
