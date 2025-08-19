// pages/api/proxy/[...path].js  (или src/pages/...)
export const config = { api: { bodyParser: false } };

const BACKEND = process.env.BACKEND_HTTP || 'http://apitmp2.jacochef.ru:8000'; // HTTP!

export default async function handler(req, res) {
  try {
    const parts = [].concat(req.query.path || []);
    const url = new URL(req.url || '/', 'http://localhost'); // достаём ?query
    const target = `${BACKEND}/${parts.join('/')}${url.search}`;

    const body = await readBody(req);

    // переносим заголовки, исключая «hop-by-hop»
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (!v) continue;
      const key = k.toLowerCase();
      if (['host', 'content-length', 'connection', 'accept-encoding'].includes(key)) continue;
      headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }

    const resp = await fetch(target, {
      method: req.method,
      headers,
      body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : body,
    });

    // пробрасываем статус и заголовки
    res.status(resp.status);
    resp.headers.forEach((val, key) => {
      if (key.toLowerCase() === 'content-encoding') return;
      res.setHeader(key, val);
    });

    const buf = Buffer.from(await resp.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', detail: e?.message || String(e) });
  }
}

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(Buffer.alloc(0));
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}