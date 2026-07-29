import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const messageFile = resolve('..', 'FANS', '\u7559\u8a00\u8bb0\u5f55.txt');
const contactMessageFile = resolve('..', 'Contact Me', '\u8bbf\u5ba2\u7559\u8a00\u65e5\u5fd7.txt');

const beijingDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getBeijingTimestamp(date = new Date()) {
  const parts = Object.fromEntries(
    beijingDateFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function parseMessages(content) {
  const messagePattern = /(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)\t([\s\S]*?)(?=\r?\n\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?\t|$)/g;
  return [...content.matchAll(messagePattern)]
    .map(([, createdAt, body]) => ({ createdAt, content: body.replace(/[\r\n\t]+/g, ' ').trim() }))
    .filter(({ content: message }) => message.length > 0);
}
function fanMessagesPlugin() {
  return {
    name: 'fan-messages',
    configureServer(server) {
      server.middlewares.use('/api/fan-messages', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const content = await readFile(messageFile, 'utf8');
            const messages = parseMessages(content)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 200);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ messages }));
          } catch (error) {
            if (error.code === 'ENOENT') {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ messages: [] }));
            } else {
              res.statusCode = 500;
              res.end();
            }
          }
          return;
        }

        if (req.method === 'POST') {
          let raw = '';
          req.on('data', (chunk) => { raw += chunk; });
          req.on('end', async () => {
            try {
              const { content } = JSON.parse(raw);
              const message = String(content || '').replace(/[\r\n\t]+/g, ' ').trim();
              if (!message || message.length > 1000) throw new Error('Invalid message');
              const createdAt = getBeijingTimestamp();
              await mkdir(dirname(messageFile), { recursive: true });
              await appendFile(messageFile, `${createdAt}\t${message}\n`, 'utf8');
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ message: { createdAt, content: message } }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid message' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}


function contactMessagesPlugin() {
  const handleRequest = (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end();
      return;
    }

    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', async () => {
      try {
        const { content } = JSON.parse(raw);
        const message = String(content || '').replace(/\r\n?/g, '\n').trim();
        if (!message || message.length > 1000) throw new Error('Invalid message');

        const createdAt = getBeijingTimestamp();
        await mkdir(dirname(contactMessageFile), { recursive: true });
        await appendFile(contactMessageFile, `[${createdAt}]\n${message}\n\n`, 'utf8');

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ saved: true, createdAt }));
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Invalid message' }));
      }
    });
  };

  return {
    name: 'contact-messages',
    configureServer(server) {
      server.middlewares.use('/api/contact-messages', handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact-messages', handleRequest);
    },
  };
}

export default defineConfig({
  plugins: [react(), fanMessagesPlugin(), contactMessagesPlugin()],
  server: {
    port: 3000,
    host: true
  }
});
