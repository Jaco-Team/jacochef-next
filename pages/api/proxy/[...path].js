// pages/api/proxy/[...path].js
export const config = { api: { bodyParser: false } };

const BACKEND = process.env.BACKEND_HTTP || "http://apitmp2.jacochef.ru:8000";

export default async function handler(req, res) {
  try {
    const parts = [].concat(req.query.path || []);
    const search = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const target = `${BACKEND}/${parts.join("/")}${search}`;

    // читаем тело
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    // прокидываем только нужные заголовки
    const headers = {};
    const allow = ["content-type", "authorization", "x-requested-with"];
    for (const [k, v] of Object.entries(req.headers)) {
      const key = k.toLowerCase();
      if (!allow.includes(key)) continue; // режем cookies, sec-*, accept-encoding и пр.
      headers[key] = Array.isArray(v) ? v.join(", ") : String(v);
    }

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
    });

    res.status(upstream.status);
    upstream.headers.forEach((val, key) => {
      const k = key.toLowerCase();
      if (k === "transfer-encoding" || k === "content-encoding") return;
      res.setHeader(key, val);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error("Proxy error:", e);
    res.status(502).json({ error: "proxy_failed", message: String(e) });
  }
}
