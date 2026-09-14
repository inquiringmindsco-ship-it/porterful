#!/usr/bin/env python3
"""
Generate Porterful social preview card (1200x630) using the approved app icon.
Does NOT regenerate/reinterpret the P symbol; it places the owner-approved icon
on a premium dark landscape canvas with the brand name and tagline.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = Path.home() / "Downloads" / "porterful aws logo.png"
OUT = PUBLIC / "og-image-v3.png"

BG = (17, 17, 17)
ACCENT = (198, 167, 94)  # metallic gold


def get_font(size):
    # Prefer SF Pro / system fonts; fall back to a default if unavailable
    candidates = [
        "/System/Library/Fonts/SFProDisplay-Bold.otf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            pass
    return ImageFont.load_default()


def main():
    src = Image.open(SOURCE).convert("RGBA")

    # Canvas
    canvas = Image.new("RGBA", (1200, 630), BG + (255,))
    draw = ImageDraw.Draw(canvas)

    # Place approved icon on left, large but not touching edges
    icon_size = 360
    icon = src.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    icon_x = 120
    icon_y = (630 - icon_size) // 2
    canvas.paste(icon, (icon_x, icon_y), icon)

    # Text
    title_font = get_font(72)
    tag_font = get_font(32)
    url_font = get_font(24)

    title = "Porterful"
    tag = "Music, Merch, and Direct Support"
    url = "porterful.com"

    # Measure and position to the right of icon
    text_x = icon_x + icon_size + 80
    text_y = 630 // 2 - 60

    draw.text((text_x, text_y), title, font=title_font, fill=(255, 255, 255, 255))
    draw.text((text_x, text_y + 90), tag, font=tag_font, fill=(200, 200, 200, 255))

    # URL at bottom center
    bbox = draw.textbbox((0, 0), url, font=url_font)
    url_w = bbox[2] - bbox[0]
    draw.text(((1200 - url_w) // 2, 560), url, font=url_font, fill=ACCENT + (255,))

    # Save
    canvas.save(OUT, "PNG", optimize=True)
    print(f"Social card saved: {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
