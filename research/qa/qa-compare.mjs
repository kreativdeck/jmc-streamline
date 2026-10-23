const [, , specFile, origUrl, localUrl, label] = process.argv;
import { readFileSync } from 'fs';
const specs = JSON.parse(readFileSync(specFile, 'utf8'));
const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = list.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res) => { const m = ++id; pending.set(m, res); ws.send(JSON.stringify({ id: m, method, params })); });
ws.onmessage = (e) => { const msg = JSON.parse(e.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); } };
await new Promise((r) => (ws.onopen = r));
await send('Page.enable'); await send('Runtime.enable');

// Original (Bricks/ACSS-Klassen) und eigene Tailwind-Runtime haben getrennte Locators:
// specs.selectors = Original, specs.localSelectors = lokale Seite (Struktur/data-Attribute).
async function collect(url, selectors) {
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 7000));
  const script = `(() => {
    const props = ${JSON.stringify(specs.props)};
    const out = {};
    for (const [name, sel] of Object.entries(${JSON.stringify(selectors)})) {
      const el = document.querySelector(sel);
      if (!el) { out[name] = null; continue; }
      const cs = getComputedStyle(el);
      const rec = {};
      for (const p of props) rec[p] = cs.getPropertyValue(p);
      out[name] = rec;
    }
    return out;
  })()`;
  const r = await send('Runtime.evaluate', { expression: script, returnByValue: true });
  return r.result.value;
}

const orig = await collect(origUrl, specs.selectors);
const local = await collect(localUrl, specs.localSelectors ?? specs.selectors);
const report = [];
for (const name of Object.keys(specs.localSelectors ?? specs.selectors)) {
  const o = orig[name], l = local[name];
  if (!o && !l) continue;
  if (!o || !l) { report.push(`${name}: ${!o ? 'orig missing' : 'local missing'}`); continue; }
  const diffs = [];
  for (const p of specs.props) {
    const a = o[p], b = l[p];
    if (a === b) continue;
    // ignore sub-pixel rounding differences
    const norm = (v) => v.replace(/(\d+\.\d+)px/g, (m, n) => (Math.round(parseFloat(n) * 10) / 10).toString() + 'px');
    if (norm(a) === norm(b)) continue;
    diffs.push(`    ${p}: orig=${a} | local=${b}`);
  }
  if (diffs.length) report.push(`${name}:\n` + diffs.join('\n'));
}
console.log(`==== ${label} ====`);
console.log(report.length ? report.join('\n') : 'all compared properties match');
ws.close();
