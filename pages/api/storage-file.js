const STORAGE_BASE = "https://storage.yandexcloud.net";
const ALLOWED_BUCKETS = new Set(["bill", "bill-ex-items"]);

function getSingleQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function isSafeFileName(fileName) {
  if (!fileName || typeof fileName !== "string") {
    return false;
  }

  return !fileName.includes("/") && !fileName.includes("\\") && !fileName.includes("..");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const bucket = getSingleQueryValue(req.query.bucket);
  const fileName = getSingleQueryValue(req.query.file);

  if (!ALLOWED_BUCKETS.has(bucket) || !isSafeFileName(fileName)) {
    return res.status(400).json({ error: "invalid_storage_file" });
  }

  try {
    const upstream = await fetch(`${STORAGE_BASE}/${bucket}/${encodeURIComponent(fileName)}`, {
      method: "GET",
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "storage_fetch_failed",
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type");
    const contentLength = upstream.headers.get("content-length");
    const cacheControl = upstream.headers.get("cache-control");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    if (cacheControl) {
      res.setHeader("Cache-Control", cacheControl);
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).end(buf);
  } catch (error) {
    console.error("storage-file proxy error:", error);
    res.status(502).json({ error: "storage_proxy_failed" });
  }
}
