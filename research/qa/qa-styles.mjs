// Minimal CDP client: read computed styles of selected elements.
// Usage: node qa-styles.mjs <url> <json-file-with-selectors>
const [, , url, specFile] = process.argv;
const specs = JSON.parse(await import('fs').then((m) => m.readFileSync(specFile, 'utf8')));
// Aufruf mit --local: Locators der eigenen Runtime (specs.localSelectors) statt der Original-Locators.
if (process.argv.includes('--local') && specs.localSelectors) specs.selectors = specs.localSelectors;

const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = list.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};

await new Promise((r) => (ws.onopen = r));
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 6000));

const script = `(() => {
  const props = ${JSON.stringify(specs.props)};
  const out = {};
  for (const [name, sel] of Object.entries(${JSON.stringify(specs.selectors)})) {
    const el = document.querySelector(sel);
    if (!el) { out[name] = null; continue; }
    const cs = getComputedStyle(el);
    const rec = {};
    for (const p of props) rec[p] = cs.getPropertyValue(p);
    rec['__rect'] = JSON.stringify(el.getBoundingClientRect());
    out[name] = rec;
  }
  return out;
})()`;

const result = await send('Runtime.evaluate', { expression: script, returnByValue: true });
console.log(JSON.stringify(result.result.value, null, 1));
ws.close();
