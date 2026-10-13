import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../../../src/api_new.js", import.meta.url), "utf8");

function harness(options = {}) {
  const origin = options.origin || "https://jacosoft-dop.ru";
  const apiBase = options.apiBase || "https://jacosoft-dop.ru/api";
  const requests = [];
  const requestInterceptors = [];
  const responseInterceptors = [];
  const document = { cookie: options.cookie || "" };
  const storage = new Map([
    ["chef_auth_token", "bearer-123"],
    ["token", "legacy"],
  ]);
  const FormData = class {
    constructor() {
      this.entries = [];
    }
    append(name, value) {
      this.entries.push([name, value]);
    }
  };
  const axios = {
    interceptors: {
      request: {
        use(fn) {
          requestInterceptors.push(fn);
        },
      },
      response: {
        use(ok, fail) {
          responseInterceptors.push([ok, fail]);
        },
      },
    },
    getUri(config) {
      return config.baseURL && !/^https?:/.test(config.url)
        ? config.baseURL.replace(/\/$/, "") + "/" + config.url.replace(/^\//, "")
        : config.url;
    },
    get(url, config = {}) {
      return dispatch("get", url, undefined, config);
    },
    post(url, data, config = {}) {
      return dispatch("post", url, data, config);
    },
  };
  async function dispatch(method, url, data, initial) {
    let config = { ...initial, method, url };
    let promise = (async () => {
      for (const fn of requestInterceptors) config = await fn(config);
      requests.push({ method, url, data, config });
      try {
        if (method === "get") {
          if (options.getHandler) return await options.getHandler({ config, document });
          document.cookie = "XSRF-TOKEN=fresh%3Dtoken";
          return { status: 204, data: "", config };
        }
        if (options.postHandler) return await options.postHandler({ config, data });
        return { status: 200, data: { data: { st: true } }, config };
      } catch (error) {
        error.config = config;
        throw error;
      }
    })();
    for (const [ok, fail] of responseInterceptors) promise = promise.then(ok, fail);
    return promise;
  }
  const context = {
    axios,
    queryString: { stringify: JSON.stringify },
    URL,
    FormData,
    process: { env: { NEXT_PUBLIC_API_URL: apiBase } },
    console: { log() {} },
    localStorage: {
      getItem: (key) => storage.get(key) || "",
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  };
  if (!options.ssr) {
    context.window = {
      location: { origin },
      btoa: (value) => Buffer.from(value).toString("base64"),
    };
    context.document = document;
  }
  const executable =
    source.replace(/^import .+;$/gm, "").replace(/^export /gm, "") +
    "\n({ api, api_laravel, api_laravel_local, api_laravel_upload, api_laravel_local_upload, credentialsConfig });";
  const exports = vm.runInNewContext(executable, context);
  return { ...exports, axios, requests, document, FormData };
}

const posts = (requests) => requests.filter((request) => request.method === "post");
const gets = (requests) => requests.filter((request) => request.method === "get");

test("same-origin writes share one CSRF bootstrap and send session credentials", async () => {
  let release;
  const client = harness({
    cookie: "XSRF-TOKEN=stale-token",
    getHandler: ({ document }) =>
      new Promise((resolve) => {
        release = () => {
          document.cookie = "XSRF-TOKEN=fresh";
          resolve({ status: 204 });
        };
      }),
  });
  const first = client.api_laravel("auth", "auth", {}, { throwErrors: true });
  const second = client.api_laravel_upload("billing", "upload", "file");
  await new Promise(setImmediate);
  assert.equal(gets(client.requests).length, 1);
  assert.equal(posts(client.requests).length, 0);
  release();
  await Promise.all([first, second]);
  await client.api_laravel("test", "later");
  await client.axios.post("https://jacosoft-dop.ru/api/crm/export_segment", "payload", {
    ...client.credentialsConfig,
    responseType: "blob",
    headers: { Custom: "kept" },
  });

  assert.equal(gets(client.requests).length, 1);
  for (const request of posts(client.requests)) {
    assert.equal(request.config.withCredentials, true);
    assert.equal(request.config.withXSRFToken, true);
    assert.equal(request.config.xsrfCookieName, "XSRF-TOKEN");
    assert.equal(request.config.xsrfHeaderName, "X-XSRF-TOKEN");
  }
  assert.equal(client.requests[1].config.headers.Authorization, "Bearer bearer-123");
  const upload = client.requests.find((request) => request.data instanceof client.FormData);
  assert.deepEqual(
    upload.data.entries.map(([key]) => key),
    ["file", "method", "module", "version", "data"],
  );
  assert.equal(upload.config.headers["Content-Type"], "multipart/form-data");
  const direct = client.requests.at(-1);
  assert.equal(direct.config.responseType, "blob");
  assert.equal(direct.config.headers.Custom, "kept");
});

test("a failed bootstrap or a missing cookie blocks the write", async () => {
  for (const missingCookie of [false, true]) {
    const client = harness({
      getHandler: async () => {
        if (missingCookie) return { status: 204 };
        throw Error("CSRF bootstrap unavailable");
      },
    });
    await assert.rejects(client.api_laravel("auth", "auth", {}, { throwErrors: true }));
    await assert.rejects(client.axios.post("https://jacosoft-dop.ru/api/bill-items/upload", "file"));
    assert.equal(posts(client.requests).length, 0);
    assert.equal(gets(client.requests).length, 2);
  }
});

test("419 is not retried and the next attempt fetches a new cookie", async () => {
  const client = harness({
    postHandler: async () => {
      const error = Error("Expired");
      error.response = { status: 419 };
      throw error;
    },
  });
  await assert.rejects(client.api_laravel("auth", "auth", {}, { throwErrors: true }));
  assert.equal(posts(client.requests).length, 1);
  await assert.rejects(client.api_laravel("auth", "auth", {}, { throwErrors: true }));
  assert.equal(gets(client.requests).length, 2);
  assert.equal(posts(client.requests).length, 2);
});

test("cross-origin API and legacy PHP API keep bearer-only behaviour", async () => {
  const client = harness({ apiBase: "https://apichef2.jacochef.ru/api" });
  await client.api_laravel("auth", "auth");
  await client.api_laravel_local("test", "get_all");
  await client.api_laravel_upload("billing", "upload", "file");
  await client.api("legacy", "save");
  assert.equal(gets(client.requests).length, 0);
  for (const request of client.requests.slice(0, 3)) {
    assert.equal(request.config.withCredentials, false);
    assert.equal(request.config.withXSRFToken, false);
    assert.equal(request.config.headers.Authorization, "Bearer bearer-123");
  }
  assert.equal(client.requests.at(-1).url, "https://jacochef.ru/api/index_new.php");
});

test("local development uses the local CSRF endpoint only for local requests", async () => {
  const client = harness({
    origin: "http://localhost:8080",
    apiBase: "https://apichef2.jacochef.ru/api",
  });
  await client.api_laravel_local("test", "get_all");
  await client.api_laravel_local_upload("billing", "upload", "file");
  await client.api_laravel("test", "cross-origin");
  assert.equal(gets(client.requests).length, 1);
  assert.equal(client.requests[0].url, "http://localhost:8080/sanctum/csrf-cookie");
  assert.equal(client.requests[1].config.withXSRFToken, true);
  assert.equal(client.requests[2].config.withCredentials, true);
  assert.equal(client.requests[3].config.withCredentials, false);
});

test("SSR requests carry neither session credentials nor bearer token", async () => {
  const client = harness({ ssr: true });
  await client.api_laravel("test", "server");
  assert.equal(client.requests.length, 1);
  assert.equal(client.requests[0].config.withCredentials, false);
  assert.equal(client.requests[0].config.withXSRFToken, false);
  assert.equal(client.requests[0].config.headers.Authorization, undefined);
});

test("a vanished cookie triggers a new bootstrap", async () => {
  const client = harness();
  await client.api_laravel("test", "first");
  client.document.cookie = "";
  await client.api_laravel("test", "second");
  assert.equal(gets(client.requests).length, 2);
});
