import { createHash } from 'node:crypto';
import { messages, validate } from './mail.js';

export function contactHandler({ sendMail, origins, trustProxy = false }) {
  // Short-lived memory only; no submission database or message bodies in logs.
  const deliveries = new Map();
  const attempts = new Map();
  const ttl = 10 * 60 * 1000;
  const respond = (res, status, code) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ code }));
  };
  return async (req, res) => {
    if (req.url !== '/api/contact') return respond(res, 404, 'not_found');
    if (req.method !== 'POST') return respond(res, 405, 'method_not_allowed');
    if (!origins.includes(req.headers.origin)) return respond(res, 403, 'forbidden');
    if (req.headers['content-type']?.split(';')[0] !== 'application/json') return respond(res, 415, 'invalid_request');
    const now = Date.now();
    for (const [key, item] of deliveries) if (item.expires < now && !item.pending) deliveries.delete(key);
    for (const [key, item] of attempts) if (item.expires < now) attempts.delete(key);
    const ip = trustProxy ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress;
    const count = attempts.get(ip) || { count: 0, expires: now + ttl };
    attempts.set(ip, count);
    if (++count.count > 10) return respond(res, 429, 'rate_limited');
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(key)) return respond(res, 400, 'invalid_request');
    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 20000) return respond(res, 413, 'invalid_request');
        chunks.push(chunk);
      }
      const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (input.website) return respond(res, 400, 'invalid_request');
      const fields = validate(input);
      if (!fields) return respond(res, 400, 'invalid_request');
      if (!sendMail) return respond(res, 503, 'not_configured');
      const fingerprint = createHash('sha256').update(JSON.stringify(fields)).digest('hex');
      let delivery = deliveries.get(key);
      if (delivery && delivery.fingerprint !== fingerprint) return respond(res, 409, 'invalid_request');
      if (!delivery) {
        if (deliveries.size >= 1000) return respond(res, 429, 'rate_limited');
        delivery = { fingerprint, admin: false, confirmation: false, expires: now + ttl, pending: null };
        deliveries.set(key, delivery);
      }
      if (!delivery.pending) {
        delivery.pending = (async () => {
          const [admin, confirmation] = messages(fields);
          if (!delivery.admin) { await sendMail(admin); delivery.admin = true; }
          if (!delivery.confirmation) { await sendMail(confirmation); delivery.confirmation = true; }
        })();
      }
      try {
        await delivery.pending;
        respond(res, 200, 'sent');
      } catch {
        respond(res, 503, delivery.admin ? 'confirmation_failed' : 'send_failed');
      } finally {
        delivery.pending = null;
      }
    } catch {
      if (!res.headersSent) respond(res, 400, 'invalid_request');
    }
  };
}
