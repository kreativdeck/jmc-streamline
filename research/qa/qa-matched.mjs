const [, , url, sel] = process.argv;
const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = list.find((t) => t.type === 'page' && t.url.startsWith('http'));
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res) => { const m = ++id; pending.set(m, res); ws.send(JSON.stringify({ id: m, method, params })); });
ws.onmessage = (e) => { const msg = JSON.parse(e.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); } };
await new Promise((r) => (ws.onopen = r));
for (const d of ['Page.enable','Runtime.enable','DOM.enable','CSS.enable']) await send(d);
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 6000));
const { root } = await send('DOM.getDocument', { depth: -1 });
const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
const matched = await send('CSS.getMatchedStylesForNode', { nodeId });
const interesting = /(color|background|border|padding|font-size|letter-spacing|line-height|radius)/;
const out = [];
for (const m of matched.matchedCSSRules || []) {
  const props = (m.rule.style.cssProperties || []).filter((p) => interesting.test(p.name) && !p.disabled);
  if (!props.length) continue;
  out.push({
    selector: m.rule.selectorList.text,
    origin: m.rule.origin,
    props: props.map((p) => `${p.name}: ${p.value}`),
  });
}
console.log(JSON.stringify(out, null, 1));
ws.close();
