/**
 * XE PRODUCTIONS — Lightweight Dynamic Asset & Video Range Server
 * Dynamically scans ./Videos/ for all .mp4 files via GET /api/videos
 * and streams video files with HTTP 206 Partial Content byte-range support.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VIDEOS_DIR = path.join(ROOT, 'Videos');
const MANIFEST_PATH = path.join(ROOT, 'videos-manifest.json');
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function scanVideos() {
  if (!fs.existsSync(VIDEOS_DIR)) return [];
  return fs
    .readdirSync(VIDEOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp4'))
    .map((entry) => {
      const fullPath = path.join(VIDEOS_DIR, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        filename: entry.name,
        src: `./Videos/${encodeURIComponent(entry.name)}`,
        bytes: stat.size,
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' }));
}

function syncManifest() {
  const videos = scanVideos();
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ videos }, null, 2) + '\n', 'utf8');
  } catch (_) {
    // Non-fatal if filesystem is read-only
  }
  return videos;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // Dynamic live directory discovery endpoint
  if (pathname === '/api/videos') {
    const videos = scanVideos();
    const payload = JSON.stringify({ videos });
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Content-Length': Buffer.byteLength(payload),
    });
    return res.end(payload);
  }

  // Static file resolution with path traversal guard
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolvedPath = path.resolve(ROOT, relativePath);

  if (!resolvedPath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }

  const stat = fs.statSync(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Support HTTP Range requests for smooth HTML5 video playback & scrubbing
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }
    const start = match[1] ? parseInt(match[1], 10) : 0;
    const end = match[2] ? Math.min(parseInt(match[2], 10), stat.size - 1) : stat.size - 1;

    if (start >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return res.end();
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
    });
    return fs.createReadStream(resolvedPath, { start, end }).pipe(res);
  }

  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
  });
  return fs.createReadStream(resolvedPath).pipe(res);
});

const initialVideos = syncManifest();
server.listen(PORT, HOST, () => {
  console.log(`XE_PRODUCTIONS_SERVER_READY http://${HOST}:${PORT} (${initialVideos.length} videos indexed)`);
});
