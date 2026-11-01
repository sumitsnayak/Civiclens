/**
 * CivicLens Standalone Production Server
 * 
 * Serves the compiled production frontend (`dist/`) and provides
 * secure server-side proxy routes for the BharatCode Model API.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAiMiddleware } from './aiMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

// Automatically load .env.local and .env if present
function loadEnvFile(filename) {
  const filePath = path.join(ROOT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key] && value) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const PORT = process.env.PORT || 5173;
const aiMiddleware = createAiMiddleware();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Route API requests to BharatCode middleware
  if (pathname.startsWith('/api/ai')) {
    return aiMiddleware(req, res, () => {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    });
  }

  // 2. Serve static files from dist/
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, pathname);
    
    // Safety check against directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    // Default to index.html for root or directories
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // SPA fallback: if file does not exist and doesn't have an extension, serve index.html
    if (!fs.existsSync(filePath)) {
      if (!path.extname(pathname)) {
        filePath = path.join(DIST_DIR, 'index.html');
      } else {
        res.statusCode = 404;
        return res.end('File not found');
      }
    }

    try {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const fileStream = fs.createReadStream(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      fileStream.pipe(res);
      return;
    } catch (err) {
      res.statusCode = 500;
      return res.end(`Server Error: ${err.message}`);
    }
  }

  // If dist doesn't exist yet
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h2>CivicLens Server Running</h2>
      <p>Frontend bundle not found. Please run <code>npm run build</code> first to generate the production build.</p>
      <p>API Endpoint: <code>/api/ai/status</code> is active.</p>
    </div>
  `);
});

server.listen(PORT, () => {
  console.log(`CivicLens production server listening on http://localhost:${PORT}`);
  console.log(`BharatCode Model API integration active with model: ${process.env.BHARATCODE_MODEL || 'qwen-3.8-27b'}`);
  console.log(`BharatCode API Key configured: ${Boolean(process.env.BHARATCODE_API_KEY)}`);
});

