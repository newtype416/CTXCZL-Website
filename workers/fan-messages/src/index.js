const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 30_000;
const MESSAGE_LIMIT = 200;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins(env).includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  return !origin || allowedOrigins(env).includes(origin);
}

function normalizeMessage(value) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function enforceRateLimit(request, env) {
  if (!env.RATE_LIMIT_SALT) return { ok: false, error: 'Message service is not configured.' };
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = await hash(`${env.RATE_LIMIT_SALT}:${ip}`);
  const now = Date.now();
  const previous = await env.DB.prepare('SELECT last_posted_at FROM fan_message_rate_limits WHERE rate_key = ?')
    .bind(rateKey)
    .first();

  if (previous && now - previous.last_posted_at < RATE_LIMIT_WINDOW_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - previous.last_posted_at)) / 1000);
    return { ok: false, error: `Please wait ${waitSeconds} seconds before posting again.` };
  }

  await env.DB.prepare(
    'INSERT INTO fan_message_rate_limits (rate_key, last_posted_at) VALUES (?, ?) ON CONFLICT(rate_key) DO UPDATE SET last_posted_at = excluded.last_posted_at'
  ).bind(rateKey, now).run();
  return { ok: true };
}

async function listMessages(env) {
  const result = await env.DB.prepare(
    'SELECT id, content, created_at FROM fan_messages ORDER BY created_at DESC LIMIT ?'
  ).bind(MESSAGE_LIMIT).all();

  return result.results.map((message) => ({
    id: message.id,
    content: message.content,
    createdAt: message.created_at,
  }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!isAllowedOrigin(request, env)) return json({ error: 'Origin is not allowed.' }, 403);
    if (url.pathname !== '/' && url.pathname !== '/api/fan-messages') return json({ error: 'Not found.' }, 404, cors);

    if (request.method === 'GET') {
      const messages = await listMessages(env);
      return json({ messages }, 200, cors);
    }

    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400, cors);
    }

    const content = normalizeMessage(body.content);
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return json({ error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` }, 400, cors);
    }

    const rateLimit = await enforceRateLimit(request, env);
    if (!rateLimit.ok) return json({ error: rateLimit.error }, 429, cors);

    const createdAt = new Date().toISOString();
    const inserted = await env.DB.prepare(
      'INSERT INTO fan_messages (content, created_at) VALUES (?, ?) RETURNING id, content, created_at'
    ).bind(content, createdAt).first();

    return json({
      message: {
        id: inserted.id,
        content: inserted.content,
        createdAt: inserted.created_at,
      },
    }, 201, cors);
  },
};
