const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 30_000;
const MESSAGE_LIMIT = 200;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
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

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT id, content, created_at FROM fan_messages ORDER BY created_at DESC LIMIT ?'
    ).bind(MESSAGE_LIMIT).all();
    return json({
      messages: result.results.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
      })),
    });
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const content = normalizeMessage(body.content);
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` }, 400);
  }

  const rateLimit = await enforceRateLimit(request, env);
  if (!rateLimit.ok) return json({ error: rateLimit.error }, 429);

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
  }, 201);
}
