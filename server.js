'use strict';

// Fin Smart 2.0 backend — Node.js 18+; no third-party packages required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;

const ENV_FILE = path.join(ROOT, '.env');

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !Object.prototype.hasOwnProperty.call(process.env, match[1])) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}
loadEnv();
const PORT = Number(process.env.PORT || 3000);
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' };
const requests = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const MAX_BODY = 8_000;

function send(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers });
  res.end(JSON.stringify(data));
}
function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
}
function rateLimit(req) {
  const ip = (req.socket.remoteAddress || 'unknown').replace(/^::ffff:/, '');
  const now = Date.now();
  const entry = requests.get(ip) || { start: now, count: 0 };
  if (now - entry.start >= WINDOW_MS) { entry.start = now; entry.count = 0; }
  entry.count += 1;
  requests.set(ip, entry);
  return entry.count <= MAX_REQUESTS;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(new Error('Request is too large. Keep your question under 6,000 characters.')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('Request body must be valid JSON.')); }
    });
    req.on('error', reject);
  });
}
function extractText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text.trim();
  const out = [];
  for (const item of (payload.output || [])) {
    for (const content of (item.content || [])) if (content.type === 'output_text' && content.text) out.push(content.text);
  }
  return out.join('\n').trim();
}

const server = http.createServer(async (req, res) => {
  securityHeaders(res);
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { ok: true, configured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || 'gpt-5.4-mini' });
  }

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    if (!rateLimit(req)) return send(res, 429, { error: 'Too many requests. Please wait one minute and try again.' });
    if (!process.env.OPENAI_API_KEY) return send(res, 503, { error: 'AI is not configured yet. Add OPENAI_API_KEY to the server .env file and restart Fin Smart.' });
    let body;
    try { body = await readBody(req); } catch (err) { return send(res, 400, { error: err.message }); }
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question || question.length > 3000) return send(res, 400, { error: 'Enter a question between 1 and 3,000 characters.' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', signal: controller.signal,
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
          store: false,
          max_output_tokens: 700,
          input: [
            { role: 'system', content: [{ type: 'input_text', text: 'You are Fin Smart, an English-language financial education assistant for people in India. Explain budgeting, saving, banking, credit, tax concepts and investing basics in clear beginner-friendly language. Be cautious and balanced. Do not claim guaranteed returns, do not give personalised buy/sell recommendations, and do not ask for or process passwords, OTPs, UPI PINs, card numbers or account credentials. For current tax, legal, scheme or regulatory details, say that users must verify official sources. State that your answer is educational, not financial, tax or legal advice. If asked for a calculation, show assumptions and arithmetic.' }] },
            { role: 'user', content: [{ type: 'input_text', text: question }] }
          ]
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = response.status === 401 ? 'The AI provider rejected the server API key. Check OPENAI_API_KEY.' : response.status === 429 ? 'The AI provider rate limit or quota was reached. Try again later.' : 'The AI provider could not complete the request. Try again later.';
        return send(res, 502, { error: message });
      }
      const answer = extractText(data);
      if (!answer) return send(res, 502, { error: 'The AI provider returned an empty answer. Please try again.' });
      return send(res, 200, { answer, model: process.env.OPENAI_MODEL || 'gpt-5.4-mini' });
    } catch (err) {
      const message = err.name === 'AbortError' ? 'The AI request timed out. Please try again.' : 'Could not reach the AI provider. Check the server internet connection and try again.';
      return send(res, 502, { error: message });
    } finally {
      clearTimeout(timeout);
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
  let pathname;
  try { pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); } catch { return send(res, 400, { error: 'Invalid URL path.' }); }
  if (pathname.split('/').some(part => part.startsWith('.')) || ['/server.js','/package.json'].includes(pathname)) return send(res, 404, { error: 'Not found.' });
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) return send(res, 403, { error: 'Forbidden.' });
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); return res.end('Not found'); }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Fin Smart is running at http://localhost:${PORT}`);
  console.log(process.env.OPENAI_API_KEY ? 'AI backend: configured' : 'AI backend: not configured (add OPENAI_API_KEY to .env)');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
