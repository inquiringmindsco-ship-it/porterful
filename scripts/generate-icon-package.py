#!/usr/bin/env python3
"""
Generate Porterful app-icon package from the approved master PNG.
Source: ~/Downloads/porterful aws logo.png
Outputs to public/ with versioned filenames and updates manifest/layout.
"""
import os
import json
import shutil
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = Path.home() / "Downloads" / "porterful aws logo.png"
VERSION = "v3-20260914"

# Background color per spec: black premium rounded-square icon.
BG = (17, 17, 17)  # #111111 — Porterful dark

def ensure_source():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Approved icon source missing: {SOURCE}")


def make_square_icon(src: Image.Image, size: int, padding_ratio=0.12, maskable=False):
    """
    Create a square PNG icon with the P centered on a dark background.
    For maskable, keep the P within the 40% safe-zone circle (scale down a bit).
    """
    # Start with solid dark background
    out = Image.new("RGBA", (size, size), BG + (255,))

    # Effective content area
    if maskable:
        # 40% safe-zone radius = 0.4 * size/2 = 0.2*size; use content box of 0.36*size margin
        margin = int(size * 0.36)
    else:
        margin = int(size * padding_ratio)

    box = size - 2 * margin
    if box <= 0:
        box = size
        margin = 0

    # Resize source preserving aspect ratio
    src_ratio = src.width / src.height
    if src_ratio >= 1:
        new_w = box
        new_h = int(box / src_ratio)
    else:
        new_h = box
        new_w = int(box * src_ratio)

    thumb = src.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    out.paste(thumb, (x, y), thumb if thumb.mode == "RGBA" else None)
    return out


def save_png(img: Image.Image, path: Path):
    img.save(path, "PNG", optimize=True)


def make_favicon_ico(sizes=[16, 32, 48, 64]):
    src = Image.open(SOURCE).convert("RGBA")
    ico_images = []
    for s in sizes:
        icon = make_square_icon(src, s, padding_ratio=0.10)
        ico_images.append(icon)
    return ico_images


def main():
    ensure_source()
    src = Image.open(SOURCE).convert("RGBA")

    # Remove old versioned files to avoid clutter
    for old in PUBLIC.glob("*v2-*.png"):
        old.unlink()
    for old in PUBLIC.glob("*v2-*.ico"):
        old.unlink()
    for old in PUBLIC.glob("*v3-*.png"):
        old.unlink()
    for old in PUBLIC.glob("*v3-*.ico"):
        old.unlink()

    # Master sizes
    outputs = {
        f"porterful-app-icon-master-{VERSION}.png": (1024, 1024, 0.08),
        f"apple-touch-icon-{VERSION}.png": (180, 180, 0.10),
        f"icon-192-{VERSION}.png": (192, 192, 0.10),
        f"icon-512-{VERSION}.png": (512, 512, 0.10),
        f"icon-maskable-{VERSION}.png": (512, 512, 0.0),  # special handling below
    }

    for filename, (size, _, padding) in outputs.items():
        maskable = filename.startswith("icon-maskable")
        img = make_square_icon(src, size, padding_ratio=padding, maskable=maskable)
        save_png(img, PUBLIC / filename)

    # Also write unversioned canonical names for direct URLs (manifest still uses versioned)
    # Keep both to be safe: apple-touch-icon.png is expected by iOS Safari
    (PUBLIC / f"apple-touch-icon-{VERSION}.png").rename(PUBLIC / f"apple-touch-icon-{VERSION}.png")
    # Actually, write unversioned copies too so legacy requests work.
    save_png(make_square_icon(src, 1024, 0.08), PUBLIC / "porterful-app-icon-master.png")
    save_png(make_square_icon(src, 180, 0.10), PUBLIC / "apple-touch-icon.png")
    save_png(make_square_icon(src, 192, 0.10), PUBLIC / "icon-192.png")
    save_png(make_square_icon(src, 512, 0.10), PUBLIC / "icon-512.png")
    save_png(make_square_icon(src, 512, 0.0, maskable=True), PUBLIC / "icon-maskable.png")
    save_png(make_square_icon(src, 512, 0.10), PUBLIC / "icon.png")

    # Favicons
    save_png(make_square_icon(src, 32, 0.10), PUBLIC / "favicon-32x32.png")
    save_png(make_square_icon(src, 16, 0.10), PUBLIC / "favicon-16x16.png")
    save_png(make_square_icon(src, 32, 0.10), PUBLIC / "favicon-porterful-32.png")
    save_png(make_square_icon(src, 16, 0.10), PUBLIC / "favicon-porterful-16.png")

    # ICO (multi-resolution)
    ico_images = make_favicon_ico([16, 32, 48, 64])
    ico_path = PUBLIC / "favicon.ico"
    ico_images[0].save(ico_path, "ICO", sizes=[(img.width, img.height) for img in ico_images], optimize=True)
    shutil.copy(ico_path, PUBLIC / "favicon-porterful.ico")

    # SVG fallback pointing at the new PNG
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#111111"/>
  <image href="/icon-512.png" width="512" height="512"/>
</svg>'''
    (PUBLIC / "icon.svg").write_text(svg)

    # Update manifest.json
    manifest_path = PUBLIC / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    manifest["icons"] = [
        {"src": f"/icon-192.png?v={VERSION}", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": f"/icon-512.png?v={VERSION}", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": f"/icon-maskable.png?v={VERSION}", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        {"src": f"/porterful-app-icon-master.png?v={VERSION}", "sizes": "1024x1024", "type": "image/png", "purpose": "any"},
    ]
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

    # Update layout.tsx icon version constant (handles any previous version)
    layout_path = ROOT / "src" / "app" / "layout.tsx"
    content = layout_path.read_text()
    content = re.sub(r"const ICON_VERSION = 'v\d+-\d{8}'", f"const ICON_VERSION = '{VERSION}'", content)
    layout_path.write_text(content)

    # Add explicit metadata icons/openGraph/twitter if missing
    metadata_start = content.find("export const metadata: Metadata = {")
    if metadata_start != -1:
        # Insert minimal metadataBase/openGraph/twitter after description line
        old_block = """export const metadata: Metadata = {
  title: {
    default: 'Porterful — Music, Merch, and Direct Support',
    template: '%s | Porterful'
  },
  description: 'Music, merch, and direct support for independent artists.',
}"""
        new_block = """export const metadata: Metadata = {
  metadataBase: new URL('https://porterful.com'),
  title: {
    default: 'Porterful — Music, Merch, and Direct Support',
    template: '%s | Porterful'
  },
  description: 'Music, merch, and direct support for independent artists.',
  openGraph: {
    type: 'website',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful — Music, Merch, and Direct Support',
    description: 'Music, merch, and direct support for independent artists.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful — Music, Merch, and Direct Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful — Music, Merch, and Direct Support',
    description: 'Music, merch, and direct support for independent artists.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, type: 'image/x-icon', sizes: 'any' },
      { url: `/favicon-32x32.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '32x32' },
      { url: `/favicon-16x16.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '16x16' },
      { url: `/icon.svg?v=${ICON_VERSION}`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Porterful',
  },
}"""
        if old_block in content:
            content = content.replace(old_block, new_block)
            layout_path.write_text(content)

    print("Icon package generated and metadata updated.")
    paths = list(PUBLIC.glob("*porterful*")) + list(PUBLIC.glob("*icon*")) + list(PUBLIC.glob("*favicon*")) + list(PUBLIC.glob("*apple*"))
    for p in sorted(paths):
        if p.is_file():
            print(f"  {p.name}: {p.stat().st_size} bytes")


if __name__ == "__main__":
    main()
