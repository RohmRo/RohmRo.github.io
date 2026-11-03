// Cloudflare Worker: safe proxy between the site chat and the Anthropic API.
// Deploy: Cloudflare dashboard -> Workers -> Create -> paste this file.
// Settings -> Variables: add secret ANTHROPIC_API_KEY. Optional var ALLOWED_ORIGIN (default below).
// Then put the worker URL in AI_ENDPOINT at the top of assets/chat.js. The API key never reaches the browser.
const MODEL = 'claude-haiku-5-5';
export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || 'https://rohmro.github.io';
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (req.headers.get('Origin') !== origin) return new Response('Forbidden', { status: 403, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-14)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));
    if (!messages.length || messages[0].role !== 'user') return new Response('No messages', { status: 400, headers: cors });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, system: String(body.system || '').slice(0, 8000), messages })
    });
    if (!r.ok) return new Response(JSON.stringify({ error: 'upstream ' + r.status }), { status: 502, headers: { ...cors, 'content-type': 'application/json' } });
    const j = await r.json();
    const reply = (j.content || []).map(c => c.text || '').join('');
    return new Response(JSON.stringify({ reply }), { headers: { ...cors, 'content-type': 'application/json' } });
  }
};
