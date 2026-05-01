#!/usr/bin/env python3
"""
Porterful Lyric Visualizer v0.1 — Frame Generator
Uses Pillow to generate a static image with text overlay.
Avoids FFmpeg drawtext filter dependency issues.
"""

import sys
import json
from PIL import Image, ImageDraw, ImageFont

def generate_frame(config_path, output_path):
    with open(config_path, 'r') as f:
        cfg = json.load(f)
    
    # Get dimensions from output format
    fmt = cfg.get('outputFormat', '16x9')
    if fmt == '16x9':
        width, height = 1920, 1080
    elif fmt == '9x16':
        width, height = 1080, 1920
    elif fmt == '1x1':
        width, height = 1080, 1080
    else:
        width, height = 1920, 1080
    
    # Load cover image
    cover_path = cfg.get('cover', 'input/cover.jpg')
    try:
        cover = Image.open(cover_path).convert('RGB')
        # Resize to fill the frame (crop center)
        cover_ratio = cover.width / cover.height
        frame_ratio = width / height
        if cover_ratio > frame_ratio:
            new_width = int(cover.height * frame_ratio)
            left = (cover.width - new_width) // 2
            cover = cover.crop((left, 0, left + new_width, cover.height))
        else:
            new_height = int(cover.width / frame_ratio)
            top = (cover.height - new_height) // 2
            cover = cover.crop((0, top, cover.width, top + new_height))
        cover = cover.resize((width, height), Image.LANCZOS)
    except Exception as e:
        print(f"Warning: Could not load cover image: {e}")
        cover = Image.new('RGB', (width, height), '#08080B')
    
    # Create drawing context
    draw = ImageDraw.Draw(cover)
    
    # Try to load a font
    font_paths = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/System/Library/Fonts/Avenir.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    
    font_large = None
    font_medium = None
    font_small = None
    
    for fp in font_paths:
        try:
            font_large = ImageFont.truetype(fp, 72)
            font_medium = ImageFont.truetype(fp, 48)
            font_small = ImageFont.truetype(fp, 36)
            break
        except:
            continue
    
    if font_large is None:
        font_large = ImageFont.load_default()
        font_medium = font_large
        font_small = font_large
    
    # Artist name
    artist = cfg.get('artist', 'Unknown Artist')
    # Title
    title = cfg.get('title', 'Untitled')
    
    # Text positioning based on format
    if fmt == '9x16':
        # Vertical: text at bottom
        artist_y = int(height * 0.62)
        title_y = int(height * 0.68)
    elif fmt == '1x1':
        # Square: text at top
        artist_y = int(height * 0.08)
        title_y = int(height * 0.14)
    else:
        # Landscape: text at top
        artist_y = int(height * 0.08)
        title_y = int(height * 0.14)
    
    # Draw semi-transparent overlay for text readability
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    if fmt == '9x16':
        overlay_draw.rectangle([0, int(height*0.55), width, height], fill=(0, 0, 0, 180))
    else:
        overlay_draw.rectangle([0, 0, width, int(height*0.22)], fill=(0, 0, 0, 150))
    
    # Composite overlay onto cover
    cover = Image.alpha_composite(cover.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(cover)
    
    # Draw text
    # Artist name (gold accent)
    bbox = draw.textbbox((0, 0), artist, font=font_medium)
    text_w = bbox[2] - bbox[0]
    draw.text(((width - text_w) // 2, artist_y), artist, fill='#C6A75E', font=font_medium)
    
    # Title (white)
    bbox = draw.textbbox((0, 0), title, font=font_large)
    text_w = bbox[2] - bbox[0]
    draw.text(((width - text_w) // 2, title_y), title, fill='white', font=font_large)
    
    # Read lyrics (first 6 lines for display)
    lyrics_path = cfg.get('lyrics', '')
    if lyrics_path:
        try:
            with open(lyrics_path, 'r') as f:
                lines = [l.strip() for l in f.readlines() if l.strip()][:6]
            if lines:
                line_y = title_y + 100
                for line in lines:
                    bbox = draw.textbbox((0, 0), line, font=font_small)
                    text_w = bbox[2] - bbox[0]
                    draw.text(((width - text_w) // 2, line_y), line, fill='white', font=font_small)
                    line_y += 50
        except Exception as e:
            print(f"Warning: Could not read lyrics: {e}")
    
    # Save
    cover.save(output_path, 'JPEG', quality=95)
    print(f"Frame saved: {output_path} ({width}x{height})")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 generate-frame.py <config.json> <output.jpg>")
        sys.exit(1)
    generate_frame(sys.argv[1], sys.argv[2])
