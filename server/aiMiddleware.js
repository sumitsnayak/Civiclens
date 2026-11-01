/**
 * Server Middleware for BharatCode AI Vision Integration
 * 
 * Provides:
 * GET  /api/ai/status  - Returns AI status, active model, and configuration state
 * POST /api/ai/analyze - Secure server-side call to BharatCode Model API
 */

import { BHARATCODE_CONFIG, callBharatCodeVision } from './bharatCodeService.js';

/**
 * Reads stream body as string with maximum size limit (25MB)
 * @param {import('http').IncomingMessage} req 
 * @returns {Promise<string>}
 */
export function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large. Maximum size is 25MB.'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

/**
 * Sends a JSON response with proper headers
 */
export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Handles /api/ai/status
 */
export function handleAiStatus(req, res) {
  sendJson(res, 200, {
    provider: 'BharatCode',
    model: BHARATCODE_CONFIG.model,
    configured: BHARATCODE_CONFIG.isConfigured,
    baseUrl: BHARATCODE_CONFIG.baseUrl,
  });
}

/**
 * Handles /api/ai/analyze
 */
export async function handleAiAnalyze(req, res) {
  try {
    const rawBody = await readBody(req);
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return sendJson(res, 400, {
          success: false,
          error: 'Invalid JSON request payload.',
        });
      }
    }

    const { image_base64, mime_type, image_url } = body;

    if (!image_base64 && !image_url) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing required parameter: either "image_base64" or "image_url" must be provided.',
      });
    }

    if (!BHARATCODE_CONFIG.isConfigured) {
      return sendJson(res, 503, {
        success: false,
        error: 'BharatCode API key is not configured on the server. Please set BHARATCODE_API_KEY in your environment or .env.local.',
        configured: false,
      });
    }

    const result = await callBharatCodeVision({
      imageBase64: image_base64,
      mimeType: mime_type,
      imageUrl: image_url,
    });

    return sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return sendJson(res, statusCode, {
      success: false,
      error: err.message || 'Internal server error processing vision analysis.',
      code: err.code,
    });
  }
}

/**
 * Connect/Express style middleware handler
 */
export function createAiMiddleware() {
  return async (req, res, next) => {
    // Handle CORS Preflight
    if (req.method === 'OPTIONS' && req.url && req.url.startsWith('/api/ai')) {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.end();
    }

    const url = (req.url || '').split('?')[0];

    if (url === '/api/ai/status' && req.method === 'GET') {
      return handleAiStatus(req, res);
    }

    if (url === '/api/ai/analyze' && req.method === 'POST') {
      return handleAiAnalyze(req, res);
    }

    if (next) {
      next();
    }
  };
}

