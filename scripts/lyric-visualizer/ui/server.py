#!/usr/bin/env python3
"""
Porterful Visualizer Studio — Local UI Server
v0.1 Phase 1 — Localhost-only creator interface

Runs at 127.0.0.1:8765
Only serves local users. No public access.
"""

import json
import os
import re
import subprocess
import sys
import threading
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
INPUT_DIR = os.path.join(REPO_DIR, 'input')
GENERATOR = os.path.join(REPO_DIR, 'generate-synced-video.py')
JOBS_DIR = os.path.join(SCRIPT_DIR, 'jobs')
TEMPLATES_JSON = os.path.join(SCRIPT_DIR, 'templates.json')

os.makedirs(JOBS_DIR, exist_ok=True)

# Whitelists
ALLOWED_TEMPLATES = {
    'classic-lyric', 'cover-pulse', 'minimal-wave',
    'release-promo', 'support-this-artist'
}
ALLOWED_FORMATS = {'9x16', '16x9', '1x1', '9:16', '16:9', '1:1'}
ALLOWED_LYRIC_KINDS = {'text', 'srt', 'lrc'}

# Active jobs (in-memory only)
jobs = {}


def sanitize_filename(name: str) -> str:
    """Remove unsafe characters from output filename."""
    return re.sub(r'[^a-zA-Z0-9._-]', '_', name).strip('_')[:80]


def is_safe_input_path(path: str) -> bool:
    """Path must be inside INPUT_DIR (no traversal)."""
    abs_path = os.path.abspath(os.path.join(INPUT_DIR, path))
    abs_input = os.path.abspath(INPUT_DIR)
    return abs_path.startswith(abs_input + os.sep) and os.path.exists(abs_path)


def load_templates():
    with open(TEMPLATES_JSON, 'r') as f:
        return json.load(f)


def list_input_files():
    """List safe files in input/ directory."""
    result = {'audio': [], 'cover': [], 'lyrics': []}
    if not os.path.isdir(INPUT_DIR):
        return result
    for filename in sorted(os.listdir(INPUT_DIR)):
        ext = os.path.splitext(filename)[1].lower()
        filepath = os.path.join(INPUT_DIR, filename)
        if not os.path.isfile(filepath):
            continue
        if ext in ('.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'):
            result['audio'].append(filename)
        elif ext in ('.jpg', '.jpeg', '.png', '.webp'):
            result['cover'].append(filename)
        elif ext in ('.txt', '.srt', '.lrc'):
            result['lyrics'].append(filename)
    return result


def run_generation(job_id: str, config: dict):
    """Run the generator in a background thread."""
    job_dir = os.path.join(JOBS_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    config_path = os.path.join(job_dir, 'config.json')
    output_path = os.path.join(job_dir, 'output.mp4')

    # Write config
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    jobs[job_id]['status'] = 'rendering'
    jobs[job_id]['configPath'] = config_path
    jobs[job_id]['outputPath'] = output_path
    jobs[job_id]['startedAt'] = os.popen('date -u +%Y-%m-%dT%H:%M:%SZ').read().strip()

    try:
        result = subprocess.run(
            ['python3', GENERATOR, config_path, output_path, '30'],
            capture_output=True,
            text=True,
            cwd=REPO_DIR,
            check=True
        )

        # Try to generate thumbnail
        thumb_path = os.path.join(job_dir, 'thumbnail.jpg')
        try:
            subprocess.run(
                ['ffmpeg', '-y', '-i', output_path,
                 '-ss', '00:00:01', '-vframes', '1',
                 '-q:v', '2', thumb_path],
                capture_output=True,
                cwd=REPO_DIR,
                check=True,
                timeout=10
            )
            if os.path.exists(thumb_path):
                jobs[job_id]['thumbnailPath'] = thumb_path
        except Exception:
            pass

        jobs[job_id]['status'] = 'complete'
        jobs[job_id]['completedAt'] = os.popen('date -u +%Y-%m-%dT%H:%M:%SZ').read().strip()

    except subprocess.CalledProcessError as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = e.stderr[-500:] if e.stderr else 'Generation failed'

    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Silent

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def _send_static(self, filepath, content_type):
        if not os.path.exists(filepath):
            self.send_error(404)
            return
        with open(filepath, 'rb') as f:
            body = f.read()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/' or path == '/index.html':
            self._send_static(os.path.join(SCRIPT_DIR, 'index.html'), 'text/html')
        elif path == '/styles.css':
            self._send_static(os.path.join(SCRIPT_DIR, 'styles.css'), 'text/css')
        elif path == '/app.js':
            self._send_static(os.path.join(SCRIPT_DIR, 'app.js'), 'application/javascript')
        elif path == '/templates.json':
            self._send_static(TEMPLATES_JSON, 'application/json')
        elif path == '/api/files':
            self._send_json(list_input_files())
        elif path == '/api/jobs':
            self._send_json(list(jobs.values()))
        elif path.startswith('/api/jobs/'):
            job_id = path.split('/')[-1]
            if job_id in jobs:
                self._send_json(jobs[job_id])
            else:
                self._send_json({'error': 'Job not found'}, 404)
        else:
            self.send_error(404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/generate':
            content_len = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_len).decode('utf-8')
            data = json.loads(body)

            # Validate
            template = data.get('template', 'classic-lyric')
            fmt = data.get('format', '9x16')
            audio_file = data.get('audio', '')
            cover_file = data.get('cover', '')
            lyrics_kind = data.get('lyricsKind', 'text')
            lyrics_text = data.get('lyricsText', '')
            lyrics_file = data.get('lyricsFile', '')
            artist = data.get('artist', '').strip()
            title = data.get('title', '').strip()
            output_name = data.get('outputName', '').strip()
            rights = data.get('rightsConfirmed', False)

            errors = []
            if template not in ALLOWED_TEMPLATES:
                errors.append('Invalid template')
            if fmt not in ALLOWED_FORMATS:
                errors.append('Invalid format')
            if not audio_file or not is_safe_input_path(audio_file):
                errors.append('Invalid audio file')
            if cover_file and not is_safe_input_path(cover_file):
                errors.append('Invalid cover image')
            if lyrics_kind not in ALLOWED_LYRIC_KINDS:
                errors.append('Invalid lyrics type')
            if lyrics_kind == 'text' and not lyrics_text.strip():
                errors.append('Lyrics text required')
            if lyrics_kind in ('srt', 'lrc') and (not lyrics_file or not is_safe_input_path(lyrics_file)):
                errors.append('Lyrics file required')
            if not artist:
                errors.append('Artist name required')
            if not title:
                errors.append('Track title required')
            if not rights:
                errors.append('Rights confirmation required')

            if errors:
                self._send_json({'error': errors[0], 'errors': errors}, 400)
                return

            # Build config
            job_id = str(uuid.uuid4())[:8]
            job_dir = os.path.join(JOBS_DIR, job_id)
            os.makedirs(job_dir, exist_ok=True)

            if lyrics_kind == 'text':
                lyrics_path = os.path.join(job_dir, 'lyrics.txt')
                with open(lyrics_path, 'w') as f:
                    f.write(lyrics_text)
                lyrics_file = lyrics_path  # absolute path
            else:
                lyrics_file = os.path.join('input', lyrics_file)

            if not output_name:
                output_name = f'{artist}-{title}-{fmt}'.replace(' ', '_')
            output_name = sanitize_filename(output_name)

            config = {
                'version': '0.1',
                'artist': artist,
                'title': title,
                'audio': os.path.join(INPUT_DIR, audio_file),
                'cover': os.path.join(INPUT_DIR, cover_file) if cover_file else '',
                'lyrics': lyrics_file,
                'lyricsFormat': lyrics_kind,
                'outputFormat': fmt,
                'outputFile': os.path.join(job_dir, 'output.mp4'),
                'template': template
            }

            jobs[job_id] = {
                'jobId': job_id,
                'status': 'queued',
                'artist': artist,
                'title': title,
                'template': template,
                'format': fmt,
                'createdAt': os.popen('date -u +%Y-%m-%dT%H:%M:%SZ').read().strip()
            }

            # Start generation in background
            t = threading.Thread(target=run_generation, args=(job_id, config))
            t.start()

            self._send_json({'jobId': job_id, 'status': 'queued'})
        else:
            self.send_error(404)


def main():
    port = 8765
    server = HTTPServer(('127.0.0.1', port), Handler)
    print(f'\n╔══════════════════════════════════════════════════════════╗')
    print(f'║  Porterful Visualizer Studio — Local UI                  ║')
    print(f'║  Running at: http://127.0.0.1:{port}/                   ║')
    print(f'║  Press Ctrl+C to stop                                    ║')
    print(f'╚══════════════════════════════════════════════════════════╝\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down...')
        server.shutdown()


if __name__ == '__main__':
    main()
