import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { contactHandler } from '../src/handler.js';

const origin = 'http://localhost:4321';
const fields = (lang = 'de') => ({ lang, name: 'Test <Name>', email: 'visitor@example.test', phone: '+49 123', message: 'Grüße & <script>alert(1)</script>', website: '' });

async function endpoint(t, sendMail) {
  const server = createServer(contactHandler({ sendMail, origins: [origin] }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return async (data = fields(), key = randomUUID(), extra = {}) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/contact`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': key, ...extra }, body: JSON.stringify(data),
    });
    return { status: response.status, ...(await response.json()) };
  };
}

for (const lang of ['de', 'en']) test(`${lang}: correct recipients, language, signature and escaped HTML`, async (t) => {
  const sent = [];
  const post = await endpoint(t, async (mail) => sent.push(mail));
  assert.equal((await post(fields(lang))).code, 'sent');
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to.address, 'contact@jmc-streamline.com');
  assert.equal(sent[0].replyTo.address, 'visitor@example.test');
  assert.equal(sent[1].to.address, 'visitor@example.test');
  assert.match(sent[0].subject, lang === 'de' ? /Neue Anfrage/ : /New enquiry/);
  assert.match(sent[1].text, lang === 'de' ? /Beste Grüße/ : /Best regards/);
  assert.match(sent[1].text, /Gremi des Fusters 33, Local 6\nES-07009 Palma/);
  assert.doesNotMatch(sent[1].text, /Apuntadors/);
  assert.match(sent[0].html, /&lt;script&gt;/);
  assert.doesNotMatch(sent[0].html, /<script>/);
});

test('reject invalid fields, header injection, bot field and foreign origin before sending', async (t) => {
  let sends = 0;
  const post = await endpoint(t, async () => sends++);
  for (const change of [{ lang: 'it' }, { email: 'bad' }, { name: 'Name\r\nBcc: evil@example.test' }, { message: '' }, { website: 'bot' }, { message: 'x'.repeat(10001) }]) {
    assert.equal((await post({ ...fields(), ...change })).status, 400);
  }
  assert.equal((await post(fields(), randomUUID(), { Origin: 'https://foreign.example.test' })).status, 403);
  assert.equal(sends, 0);
});

test('unconfigured SMTP returns an honest error', async (t) => {
  const post = await endpoint(t, null);
  assert.deepEqual(await post(), { status: 503, code: 'not_configured' });
});

test('concurrent and repeated submissions send each email only once; key reuse with changed data fails', async (t) => {
  let sends = 0;
  const post = await endpoint(t, async () => { sends++; });
  const key = randomUUID();
  const results = await Promise.all([post(fields(), key), post(fields(), key)]);
  assert.ok(results.every((r) => r.code === 'sent'));
  assert.equal((await post(fields(), key)).code, 'sent');
  assert.equal(sends, 2);
  assert.equal((await post({ ...fields(), message: 'changed' }, key)).status, 409);
});

test('confirmation failure can be retried without duplicating the admin email', async (t) => {
  const sent = [];
  let fail = true;
  const post = await endpoint(t, async (mail) => {
    if (mail.to.address === 'visitor@example.test' && fail) { fail = false; throw new Error('simulated SMTP failure'); }
    sent.push(mail);
  });
  const key = randomUUID();
  assert.deepEqual(await post(fields(), key), { status: 503, code: 'confirmation_failed' });
  assert.equal((await post(fields(), key)).code, 'sent');
  assert.equal(sent.length, 2);
  assert.equal(sent.filter((m) => m.to.address === 'contact@jmc-streamline.com').length, 1);
});

test('SMTP failure never reports success; requests are rate limited', async (t) => {
  const post = await endpoint(t, async () => { throw new Error('simulated failure'); });
  assert.deepEqual(await post(), { status: 503, code: 'send_failed' });
  for (let i = 0; i < 9; i++) await post();
  assert.deepEqual(await post(), { status: 429, code: 'rate_limited' });
});
