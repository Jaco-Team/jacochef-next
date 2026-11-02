import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { createHash, webcrypto } from "node:crypto";

const require = createRequire(import.meta.url);
const { transformSync } = require("@babel/core");
const source = readFileSync(new URL("../../../components/auth/sso.js", import.meta.url), "utf8");
const { completeSsoLogin: completeSsoLoginImpl, consumeSsoLoginVerifier, prepareSsoLogin, getSsoFailureMessage, isValidSsoSession, readSsoLoginCode, SSO_FAILURE_MESSAGE, SSO_FAILURE_URL, SSO_VERIFIER_STORAGE_KEY } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const code = "a".repeat(64);
const verifier = "b".repeat(64);
const completeSsoLogin = (options) => completeSsoLoginImpl({ consumeVerifier: () => verifier, ...options });
const session = { st: true, token: "server-issued-token", token_type: "Bearer", auth_mode: "token", expires_at: "2026-12-01T12:00:00Z", expire_days: 60, user_id: 123, login: "89870000000", legacy_token: null };

function proofStorage(initial = verifier) {
  const values = new Map(initial === null ? [] : [[SSO_VERIFIER_STORAGE_KEY, initial]]);
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test("SSO initiation binds a random per-tab verifier to its SHA256 challenge without putting the verifier in a URL", async () => {
  const storage = proofStorage(null);
  const target = new URL(await prepareSsoLogin({ crypto: webcrypto, storage, loginUrl: "https://api.example.invalid/auth/sso/login" }));
  const proof = storage.getItem(SSO_VERIFIER_STORAGE_KEY);
  assert.match(proof, /^[a-f0-9]{64}$/);
  assert.equal(target.searchParams.get("login_challenge"), createHash("sha256").update(proof, "utf8").digest("hex"));
  assert.doesNotMatch(target.href, new RegExp(proof));
  assert.equal(target.origin, "https://api.example.invalid");
  const previous = proof;
  await prepareSsoLogin({ crypto: webcrypto, storage, loginUrl: "https://api.example.invalid/auth/sso/login" });
  assert.notEqual(storage.getItem(SSO_VERIFIER_STORAGE_KEY), previous);
});

test("SSO proof is consumed exactly once, including invalid values", () => {
  for (const initial of [verifier, "invalid", null]) {
    const storage = proofStorage(initial);
    assert.equal(consumeSsoLoginVerifier(storage), initial === verifier ? verifier : "");
    assert.equal(storage.values.size, 0);
    assert.equal(consumeSsoLoginVerifier(storage), "");
  }
});

test("SSO initiation fails closed and clears proof when storage or browser crypto is unavailable", async () => {
  const storage = proofStorage();
  await assert.rejects(prepareSsoLogin({ crypto: {}, storage, loginUrl: "https://api.example.invalid/auth/sso/login" }), /SSO login unavailable/);
  assert.equal(storage.values.size, 0);
  await assert.rejects(prepareSsoLogin({ crypto: webcrypto, storage: { removeItem() {}, setItem() { throw new Error("Storage disabled"); } }, loginUrl: "https://api.example.invalid/auth/sso/login" }), /SSO login unavailable/);
  const failedDigestStorage = proofStorage();
  await assert.rejects(prepareSsoLogin({ crypto: { getRandomValues: (bytes) => webcrypto.getRandomValues(bytes), subtle: { digest: async () => { throw new Error("Digest unavailable"); } } }, storage: failedDigestStorage, loginUrl: "https://api.example.invalid/auth/sso/login" }));
  assert.equal(failedDigestStorage.values.size, 0);
});

test("SSO callback accepts only one successful 64-hex login code, never URL credentials or redirect targets", () => {
  assert.equal(readSsoLoginCode(`?status=success&login_code=${code}`), code);
  assert.equal(readSsoLoginCode(`?status=success&login_code=${code.toUpperCase()}`), code.toUpperCase());
  for (const search of ["", "?status=error&code=login_failed", `?status=success&login_code=${code.slice(1)}`, `?status=success&login_code=${"g".repeat(64)}`, `?status=success&status=error&login_code=${code}`, `?status=success&login_code=${code}&login_code=${code}`, `?status=success&login_code=${code}&token=url-token`, `?status=success&login_code=${code}&redirect=https://untrusted.invalid`]) {
    assert.equal(readSsoLoginCode(search), "");
  }
});

test("SSO session validation requires the agreed server payload, including nullable legacy token", () => {
  assert.equal(isValidSsoSession(session), true);
  assert.equal(isValidSsoSession({ ...session, legacy_token: "server-legacy" }), true);
  for (const key of Object.keys(session)) {
    const incomplete = { ...session };
    delete incomplete[key];
    assert.equal(isValidSsoSession(incomplete), false, `Missing ${key} must not authenticate`);
  }
  for (const invalid of [{ st: false }, { token: " " }, { token_type: "Other" }, { auth_mode: "session" }, { user_id: 0 }, { user_id: "123" }, { login: "" }, { legacy_token: "" }, { expires_at: "invalid" }, { expire_days: 0 }]) {
    assert.equal(isValidSsoSession({ ...session, ...invalid }), false);
  }
});

test("SSO scrubs the callback URL before exchange and persists only server-issued credentials", async () => {
  const events = [];
  const result = await completeSsoLogin({
    search: `?status=success&login_code=${code}`,
    scrubUrl: () => events.push("scrub"),
    consumeVerifier: () => { events.push("consume-proof"); return verifier; },
    exchange: async (value, proof) => { assert.equal(events[0], "scrub"); assert.equal(value, code); assert.equal(proof, verifier); assert.deepEqual(events, ["scrub", "consume-proof"]); events.push("exchange"); return { data: session }; },
    storeSession: (payload, login) => { assert.deepEqual(payload, session); assert.equal(login, session.login); events.push("store"); },
    navigate: (url) => { assert.equal(url, "/"); events.push("navigate"); },
  });
  assert.equal(result, true);
  assert.deepEqual(events, ["scrub", "consume-proof", "exchange", "store", "navigate"]);
});

test("a login code without the initiating browser proof never exchanges or replaces an ordinary session", async () => {
  for (const proof of ["", undefined, null, "invalid"]) {
    let target;
    const result = await completeSsoLogin({ search: `?status=success&login_code=${code}`, scrubUrl() {}, consumeVerifier: () => proof, exchange: () => assert.fail("No exchange without proof"), storeSession: () => assert.fail("Existing session must remain untouched"), navigate: (url) => { target = url; } });
    assert.equal(result, false);
    assert.equal(target, SSO_FAILURE_URL);
  }
});

test("invalid callbacks are scrubbed and use the fixed friendly failure destination without exchanging", async () => {
  const events = [];
  const result = await completeSsoLogin({ search: "?status=error&code=untrusted-text#secret", scrubUrl: () => events.push("scrub"), exchange: () => assert.fail("No exchange for invalid callbacks"), storeSession: () => assert.fail("No storage on failure"), navigate: (url) => events.push(url) });
  assert.equal(result, false);
  assert.deepEqual(events, ["scrub", SSO_FAILURE_URL]);
});

test("failed, malformed or rejected exchanges never store credentials", async () => {
  for (const response of [undefined, {}, { st: false, text: "untrusted" }, { data: { ...session, token: "" } }]) {
    let target;
    assert.equal(await completeSsoLogin({ search: `?status=success&login_code=${code}`, scrubUrl() {}, exchange: async () => response, storeSession: () => assert.fail("No storage on failure"), navigate: (url) => { target = url; } }), false);
    assert.equal(target, SSO_FAILURE_URL);
  }
  let target;
  await completeSsoLogin({ search: `?status=success&login_code=${code}`, scrubUrl() {}, exchange: async () => { throw new Error("Provider unavailable"); }, storeSession: () => assert.fail("No storage on failure"), navigate: (url) => { target = url; } });
  assert.equal(target, SSO_FAILURE_URL);
});

test("a callback URL that cannot be scrubbed fails closed before API exchange", async () => {
  let target;
  let proofConsumed = false;
  await completeSsoLogin({ search: `?status=success&login_code=${code}`, scrubUrl: () => { throw new Error("History unavailable"); }, consumeVerifier: () => { proofConsumed = true; return verifier; }, exchange: () => assert.fail("Must scrub before exchanging"), storeSession: () => assert.fail("No storage on failure"), navigate: (url) => { target = url; } });
  assert.equal(proofConsumed, true);
  assert.equal(target, SSO_FAILURE_URL);
});

test("only the known SSO failure query renders fixed Russian copy", () => {
  assert.equal(getSsoFailureMessage("?error=sso_failed"), SSO_FAILURE_MESSAGE);
  assert.equal(getSsoFailureMessage("?error=arbitrary-message"), "");
  assert.equal(getSsoFailureMessage("?message=untrusted&error=other"), "");
});

test("callback StrictMode effect replay exchanges exactly once after scrubbing and never persists URL tokens", async () => {
  const componentSource = readFileSync(new URL("../../../components/auth/SsoCallback.jsx", import.meta.url), "utf8");
  const executable = transformSync(componentSource.replace(/^import[\s\S]*?;\n/gm, "").replace(/^export default /gm, ""), { configFile: false, babelrc: false, plugins: [require.resolve("@babel/plugin-transform-react-jsx")] }).code + "\nSsoCallback;";
  const effects = [];
  const requests = [];
  const stored = [];
  const navigations = [];
  const started = { current: false };
  const storage = proofStorage();
  const location = { search: `?status=success&login_code=${code}`, replace: (url) => navigations.push(url) };
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props, children }), Fragment: "Fragment" },
    useRef: () => started,
    useEffect: (effect) => effects.push(effect),
    Head: "Head", Box: "Box", CircularProgress: "CircularProgress", Typography: "Typography", JacoSurface: "JacoSurface",
    completeSsoLogin,
    consumeSsoLoginVerifier,
    window: { location, sessionStorage: storage, history: { replaceState: (_state, _title, url) => { assert.equal(url, "/auth/callback"); location.search = ""; } } },
    api_laravel: async (...args) => { assert.equal(location.search, ""); assert.equal(storage.values.size, 0); requests.push(JSON.parse(JSON.stringify(args))); return { data: session }; },
    storeAuthSession: (...args) => stored.push(args),
  };
  const Component = vm.runInNewContext(executable, context);
  Component();
  effects[0]();
  effects[0]();
  await new Promise(setImmediate);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], ["auth/sso", "exchange", { login_code: code, login_verifier: verifier }, { throwErrors: true }]);
  assert.deepEqual(stored, [[session, session.login]]);
  assert.deepEqual(navigations, ["/"]);
  assert.match(componentSource, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(componentSource, /console\.|router\.query|localStorage|access_token/);
});

test("callback SSR returns no code or credentials and sets private no-store plus no-referrer", async () => {
  const pageSource = readFileSync(new URL("../../../pages/auth/callback.js", import.meta.url), "utf8");
  const executable = transformSync(pageSource.replace(/^import[\s\S]*?;\n/gm, "").replace(/^export default /gm, "").replace(/^export /gm, ""), { configFile: false, babelrc: false, plugins: [require.resolve("@babel/plugin-transform-react-jsx")] }).code + "\ngetServerSideProps;";
  const getProps = vm.runInNewContext(executable, {});
  const headers = {};
  const result = await getProps({ query: { login_code: code }, res: { setHeader: (name, value) => { headers[name] = value; } } });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { props: {} });
  assert.deepEqual(headers, { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" });
});
