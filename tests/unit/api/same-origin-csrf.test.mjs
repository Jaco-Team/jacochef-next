import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../../../src/api_new.js", import.meta.url), "utf8");

function harness(options = {}) {
  const origin = options.origin || "https://jacosoft-dop.ru";
  const apiBase = options.apiBase || "https://jacosoft-dop.ru/api";
  const requests = [];
  const cookies = [];
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
    Cookies: { set: (...args) => cookies.push(args) },
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
      location: { origin, protocol: new URL(origin).protocol },
      btoa: (value) => Buffer.from(value).toString("base64"),
    };
    context.document = document;
  }
  const executable =
    source.replace(/^import .+;$/gm, "").replace(/^export /gm, "") +
    "\n({ api, api_laravel, api_laravel_local, api_laravel_upload, api_laravel_local_upload, credentialsConfig, prepareBillingUploads, setBillingUploadCsrf, resetBillingUploadCsrf, storeAuthSession, getSsoConfig, getTrustedSsoLoginUrl });";
  const exports = vm.runInNewContext(executable, context);
  return { ...exports, axios, requests, document, FormData, storage, cookies };
}

const posts = (requests) => requests.filter((request) => request.method === "post");

test("SSO config uses a read-only GET on the configured API without a CSRF bootstrap", async () => {
  const payload = { data: { st: true, enabled: false, login_url: null } };
  const client = harness({ getHandler: () => ({ status: 200, data: payload }) });
  assert.deepEqual(await client.getSsoConfig(), payload);
  assert.equal(client.requests.length, 1);
  assert.equal(client.requests[0].method, "get");
  assert.equal(client.requests[0].url, "https://jacosoft-dop.ru/api/auth/sso/config");
});

test("SSO navigation trusts only the fixed configured backend web endpoint", () => {
  const client = harness({ apiBase: "https://api.example.invalid/api" });
  const expected = "https://api.example.invalid/auth/sso/login";
  assert.equal(client.getTrustedSsoLoginUrl(expected), expected);
  for (const value of [undefined, "", "/auth/sso/login", "//api.example.invalid/auth/sso/login", "javascript:alert(1)", "https://untrusted.invalid/auth/sso/login", "https://api.example.invalid/other", `${expected}?redirect=https://untrusted.invalid`, `${expected}#token`, "https://user:secret@api.example.invalid/auth/sso/login", "https://api.example.invalid.evil.invalid/auth/sso/login"]) assert.equal(client.getTrustedSsoLoginUrl(value), "");
  const relative = harness({ apiBase: "/api" });
  assert.equal(relative.getTrustedSsoLoginUrl("https://jacosoft-dop.ru/auth/sso/login"), "https://jacosoft-dop.ru/auth/sso/login");
});

test("auth session persists API-issued bearer and legacy credentials", () => {
  const client = harness();
  client.storeAuthSession({ token: "new-token", legacy_token: "issued-legacy", expires_at: "2026-11-01" }, "80000000000");
  assert.equal(client.storage.get("chef_auth_token"), "new-token");
  assert.equal(client.storage.get("token"), "issued-legacy");
  assert.equal(client.storage.get("auth_expires_at"), "2026-11-01");
  assert.equal(client.cookies[0][0], "token");
  assert.equal(client.cookies[0][1], "issued-legacy");
  assert.equal(client.cookies[0][2].secure, true);
  assert.equal(client.cookies[0][2].sameSite, "lax");
});

test("password reset bearer responses retain legacy compatibility on local HTTP", () => {
  const client = harness({ origin: "http://localhost:3000" });
  client.storeAuthSession({ token: "reset-token", user_id: 123 }, "80000000000");
  assert.equal(client.storage.get("token"), Buffer.from("80000000000-_-123").toString("base64"));
  assert.equal(client.cookies[0][2].secure, false);
});

test("auth session persistence is safe during SSR", () => {
  const client = harness({ ssr: true });
  client.storeAuthSession({ token: "new-token", legacy_token: "issued-legacy" }, "80000000000");
  assert.equal(client.storage.get("chef_auth_token"), "bearer-123");
  assert.equal(client.cookies.length, 0);
});
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


test("raw invoice upload uses current CSRF and bearer headers for the trusted same-origin API", async () => {
  const client = harness();
  const zone = { options: { url: "https://jacosoft-dop.ru/api/bill-items/upload" } };
  await client.prepareBillingUploads([zone]);
  assert.equal(gets(client.requests).length, 1);
  client.document.cookie = "XSRF-TOKEN=latest%3Dtoken";
  const headers = {};
  const xhr = {
    readyState: 1,
    withCredentials: false,
    setRequestHeader(name, value) { headers[name] = value; },
  };
  assert.equal(client.setBillingUploadCsrf(zone, {}, xhr), true);
  assert.equal(xhr.withCredentials, true);
  assert.deepEqual(headers, {
    "X-XSRF-TOKEN": "latest=token",
    Authorization: "Bearer bearer-123",
  });
  client.resetBillingUploadCsrf(zone, { status: 419 });
  await client.prepareBillingUploads([zone]);
  assert.equal(gets(client.requests).length, 2);
});

test("invalid invoice CSRF cookie aborts before raw POST without exposing credentials", async () => {
  const client = harness();
  const events = [];
  const zone = {
    options: { url: "https://jacosoft-dop.ru/api/bill-ex-items/upload" },
    emit(name, ...args) { events.push([name, ...args]); },
  };
  await client.prepareBillingUploads([zone]);
  client.document.cookie = "XSRF-TOKEN=%ZZ";
  const file = {};
  const xhr = {
    readyState: 1,
    aborted: false,
    abort() { this.aborted = true; this.readyState = 0; },
    setRequestHeader() { throw Error("must not send a header"); },
  };
  assert.equal(client.setBillingUploadCsrf(zone, file, xhr), false);
  assert.equal(xhr.aborted, true);
  assert.equal(file.status, "error");
  assert.equal(file.chefCsrfFailure, true);
  assert.deepEqual(events.map(([name]) => name), ["error", "complete"]);
  assert.equal(events[0][2].includes("%ZZ"), false);
});

test("cross-origin invoice upload sends fresh bearer only to the configured API endpoint", async () => {
  const client = harness({ apiBase: "https://apichef2.jacochef.ru/api" });
  const zone = { options: { url: "https://apichef2.jacochef.ru/api/bill-items/upload" } };
  await client.prepareBillingUploads([zone]);
  assert.equal(gets(client.requests).length, 0);
  client.storage.set("chef_auth_token", "updated-token");
  const headers = {};
  const xhr = {
    readyState: 1,
    withCredentials: false,
    setRequestHeader(name, value) { headers[name] = value; },
  };
  assert.equal(client.setBillingUploadCsrf(zone, {}, xhr), true);
  assert.deepEqual(headers, { Authorization: "Bearer updated-token" });
  assert.equal(xhr.withCredentials, false);
});

test("unknown upload origins and unrelated API paths receive no bearer or CSRF header", async () => {
  const client = harness({ apiBase: "https://apichef2.jacochef.ru/api" });
  for (const url of [
    "https://attacker.example/api/bill-items/upload",
    "https://apichef2.jacochef.ru/other/bill-items/upload",
    "https://apichef2.jacochef.ru/api/unrelated",
    "http://localhost:8080/api/bill-items/upload",
  ]) {
    const zone = { options: { url } };
    await client.prepareBillingUploads([zone]);
    const headers = {};
    const xhr = {
      readyState: 1,
      withCredentials: false,
      setRequestHeader(name, value) { headers[name] = value; },
    };
    assert.equal(client.setBillingUploadCsrf(zone, {}, xhr), true);
    assert.deepEqual(headers, {});
    assert.equal(xhr.withCredentials, false);
  }
  assert.equal(gets(client.requests).length, 0);
});

test("cross-origin upload without bearer is blocked before document save", async () => {
  const client = harness({ apiBase: "https://apichef2.jacochef.ru/api" });
  client.storage.delete("chef_auth_token");
  const zone = { options: { url: "https://apichef2.jacochef.ru/api/bill-ex-items/upload" } };
  await assert.rejects(client.prepareBillingUploads([zone]));
  assert.equal(gets(client.requests).length, 0);
});
