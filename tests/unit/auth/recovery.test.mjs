import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { createHash, webcrypto } from "node:crypto";

const require = createRequire(import.meta.url);
const { transformSync } = require("@babel/core");
const helperSource = readFileSync(new URL("../../../components/auth/recovery.js", import.meta.url), "utf8");
const ssoSource = readFileSync(new URL("../../../components/auth/sso.js", import.meta.url), "utf8");
const source = readFileSync(new URL("../../../pages/auth.js", import.meta.url), "utf8");
const executable = transformSync(
  helperSource.replace(/^export /gm, "") + "\n" + ssoSource.replace(/^export /gm, "") + "\n" + source.replace(/^import[\s\S]*?;\n/gm, "").replace(/^export default /gm, "").replace(/^export /gm, ""),
  { configFile: false, babelrc: false, plugins: [require.resolve("@babel/plugin-transform-react-jsx")] },
).code + "\n({ Auth, getServerSideProps });";

function harness({ captchaKey = "", response = () => ({ data: { st: true } }), runEffects = false, ssoConfig = () => ({ data: { st: true, enabled: false, login_url: null } }), search = "" } = {}) {
  const state = [];
  const requests = [];
  const sessions = [];
  const assignments = [];
  const effects = [];
  const initializedEffects = new Set();
  const refs = [];
  const proofValues = new Map();
  let index = 0;
  let effectIndex = 0;
  let refIndex = 0;
  let tree;
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat(Infinity) } }) },
    useState(initial) {
      const position = index++;
      if (!(position in state)) state[position] = initial;
      return [state[position], (value) => { state[position] = typeof value === "function" ? value(state[position]) : value; }];
    },
    useEffect(effect) { const position = effectIndex++; if (runEffects && !initializedEffects.has(position)) { initializedEffects.add(position); effects.push(effect); } },
    useRef(initial) { const position = refIndex++; if (!(position in refs)) refs[position] = { current: initial }; return refs[position]; },
    dynamic: () => "SmartCaptcha",
    Box: "Box",
    JacoRecoveryScreen: "JacoRecoveryScreen",
    process: { env: { NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY: captchaKey } },
    URLSearchParams,
    URL,
    TextEncoder,
    window: { crypto: webcrypto, sessionStorage: { getItem: (key) => proofValues.get(key) ?? null, setItem: (key, value) => proofValues.set(key, value), removeItem: (key) => proofValues.delete(key) }, location: { pathname: "/auth", search, assign: (url) => assignments.push(url) } },
    async getSsoConfig() { return ssoConfig(); },
    getTrustedSsoLoginUrl: (url) => url === "http://localhost:8080/auth/sso/login" ? url : "",
    async api_laravel(module, method, data, options) {
      requests.push(JSON.parse(JSON.stringify({ module, method, data, options })));
      return response(requests.at(-1));
    },
    storeAuthSession: (...args) => sessions.push(JSON.parse(JSON.stringify(args))),
  };
  const page = vm.runInNewContext(executable, context);
  const render = () => { index = 0; effectIndex = 0; refIndex = 0; tree = page.Auth(); };
  const props = () => tree.props.children.find((node) => node.type === "JacoRecoveryScreen").props;
  const invoke = async (name, ...args) => { await props()[name](...args); render(); };
  const submit = () => invoke("onSubmit", { preventDefault() {} });
  const captcha = async () => { props().securityContent.props.onSuccess("test-captcha"); render(); };
  const phone = (value) => invoke("onPhoneChange", value);
  const recovery = async (value = "89879340391") => { await invoke("onBack"); await phone(value); };
  const flushEffects = async () => { for (const effect of effects.splice(0)) effect(); await new Promise(setImmediate); render(); };
  render();
  return { ...page, requests, sessions, assignments, proofValues, props, invoke, submit, captcha, phone, recovery, flushEffects, context };
}

test("available SSO starts only the trusted backend endpoint, without requiring phone, CAPTCHA or password", async () => {
  const page = harness({ runEffects: true, captchaKey: "test-key", ssoConfig: () => ({ data: { st: true, enabled: true, login_url: "http://localhost:8080/auth/sso/login" } }) });
  assert.equal(page.props().ssoChecking, true);
  await page.flushEffects();
  assert.equal(page.props().ssoChecking, false);
  assert.equal(page.props().ssoAvailable, true);
  await page.invoke("onSsoLogin");
  await page.invoke("onSsoLogin");
  assert.equal(page.assignments.length, 1);
  const target = new URL(page.assignments[0]);
  assert.equal(`${target.origin}${target.pathname}`, "http://localhost:8080/auth/sso/login");
  const proof = page.proofValues.get("chef_sso_login_verifier");
  assert.match(proof, /^[a-f0-9]{64}$/);
  assert.equal(target.searchParams.get("login_challenge"), createHash("sha256").update(proof, "utf8").digest("hex"));
  assert.equal(page.requests.length, 0);
  assert.equal(page.props().ssoStarting, true);
});

test("concurrent SSO clicks share the in-progress guard while browser proof is being hashed", async () => {
  const page = harness({ runEffects: true, ssoConfig: () => ({ data: { st: true, enabled: true, login_url: "http://localhost:8080/auth/sso/login" } }) });
  await page.flushEffects();
  const start = page.props().onSsoLogin;
  await Promise.all([start(), start()]);
  assert.equal(page.assignments.length, 1);
  assert.equal(page.proofValues.size, 1);
  assert.equal(page.requests.length, 0);
});

test("disabled per-tab storage prevents SSO navigation without disabling ordinary password login", async () => {
  const page = harness({ runEffects: true, ssoConfig: () => ({ data: { st: true, enabled: true, login_url: "http://localhost:8080/auth/sso/login" } }), response: () => ({ data: { st: false } }) });
  await page.flushEffects();
  page.context.window.sessionStorage.setItem = () => { throw new Error("Storage unavailable"); };
  await page.invoke("onSsoLogin");
  assert.equal(page.assignments.length, 0);
  assert.equal(page.props().ssoAvailable, false);
  assert.equal(page.props().ssoStarting, false);
  assert.equal(page.proofValues.size, 0);
  await page.phone("89879340391");
  await page.invoke("onLoginPasswordChange", "Password123");
  await page.submit();
  assert.equal(page.requests[0].method, "auth");
});

test("unconfigured, unavailable or untrusted SSO leaves ordinary login and recovery working", async () => {
  for (const config of [{ data: { st: true, enabled: false, login_url: null } }, { data: { st: true, enabled: true, login_url: "https://untrusted.invalid/auth/sso/login" } }, new Error("HTTP 404")]) {
    const page = harness({ runEffects: true, ssoConfig: () => { if (config instanceof Error) throw config; return config; }, response: () => ({ data: { st: false, text: "Обычная проверка пароля" } }) });
    await page.flushEffects();
    assert.equal(page.props().ssoChecking, false);
    assert.equal(page.props().ssoAvailable, false);
    assert.equal(page.props().error, "");
    await page.invoke("onSsoLogin");
    assert.equal(page.assignments.length, 0);
    await page.phone("89879340391");
    await page.invoke("onLoginPasswordChange", "Password123");
    await page.submit();
    assert.equal(page.requests[0].method, "auth");
    await page.invoke("onBack");
    assert.equal(page.props().step, "request");
  }
});

test("login maps only the known SSO callback failure to fixed copy without reflecting URL values", async () => {
  const known = harness({ runEffects: true, search: "?error=sso_failed&message=untrusted" });
  await known.flushEffects();
  assert.match(known.props().error, /Не удалось войти через SSO/);
  assert.doesNotMatch(known.props().error, /untrusted/);
  const other = harness({ runEffects: true, search: "?error=untrusted" });
  await other.flushEffects();
  assert.equal(other.props().error, "");
});

test("recovery defaults to SMS and rejects invalid phones without an API request", async () => {
  const page = harness();
  await page.recovery("123");
  assert.equal(page.props().channel, "sms");
  await page.submit();
  assert.equal(page.requests.length, 0);
  assert.equal(page.props().phoneError, true);
  assert.equal(page.props().error, "Введите номер в формате +7 или 8");
});

for (const channel of ["sms", "telegram", "voice"]) {
  test(`recovery and resend retain ${channel} and the queued-request message`, async () => {
    const page = harness();
    await page.recovery();
    await page.invoke("onChannelChange", channel);
    await page.submit();
    assert.deepEqual(page.requests[0], {
      module: "auth", method: "check_phone",
      data: { login: "89879340391", captcha_token: "", delivery_channel: channel },
      options: { throwErrors: true },
    });
    assert.equal(page.props().step, "code");
    assert.equal(page.props().recoveryMessage, "Запрос на отправку кода принят. Дождитесь сообщения.");
    await page.invoke("onResend");
    assert.equal(page.requests[1].data.delivery_channel, channel);
  });
}

const accountNotFoundMessage = "Аккаунт с таким номером не найден. Проверьте номер телефона — можно вводить через +7 или 8.";

test("a missing account stays on phone entry and exposes the server message beside the number", async () => {
  const page = harness({ response: () => ({ data: { st: false, error_code: "account_not_found", text: accountNotFoundMessage } }) });
  await page.recovery("+7 (999) 123-45-67");
  await page.invoke("onChannelChange", "telegram");
  await page.submit();
  assert.equal(page.props().step, "request");
  assert.equal(page.props().phone, "+7 (999) 123-45-67");
  assert.equal(page.props().channel, "telegram");
  assert.equal(page.props().phoneError, true);
  assert.equal(page.props().phoneErrorText, accountNotFoundMessage);
  assert.equal(page.props().recoveryMessage, "");
  assert.equal(page.props().resendAfter, 0);
  assert.equal(page.sessions.length, 0);
  await page.phone("8 (999) 765-43-21");
  assert.equal(page.props().phoneError, false);
  assert.equal(page.props().error, "");
});

test("a missing account discovered on resend returns to phone entry and clears stale recovery data", async () => {
  let calls = 0;
  const page = harness({ response: () => ({ data: ++calls === 1 ? { st: true, text: "Запрос на отправку кода принят. Дождитесь сообщения." } : { st: false, error_code: "account_not_found", text: accountNotFoundMessage } }) });
  await page.recovery();
  await page.submit();
  await page.invoke("onCodeChange", "123456");
  await page.submit();
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.invoke("onBack");
  await page.invoke("onResend");
  assert.equal(page.props().step, "request");
  assert.equal(page.props().phone, "89879340391");
  assert.equal(page.props().code, "");
  assert.equal(page.props().password, "");
  assert.equal(page.props().repeatedPassword, "");
  assert.equal(page.props().recoveryMessage, "");
  assert.equal(page.props().phoneErrorText, accountNotFoundMessage);
  assert.equal(page.props().resendAfter, 0);
});

test("HTTP account-not-found errors show the same phone feedback while preserving rate limiting", async () => {
  const page = harness({ response: () => { throw { response: { status: 404, headers: {}, data: { data: { st: false, error_code: "account_not_found", text: accountNotFoundMessage, retry_after: 90 } } } }; } });
  await page.recovery();
  await page.submit();
  assert.equal(page.props().step, "request");
  assert.equal(page.props().phoneErrorText, accountNotFoundMessage);
  assert.equal(page.props().retryAfter, 90);
  await page.phone("89997654321");
  await page.submit();
  assert.equal(page.requests.length, 1);
  assert.equal(page.props().retryAfter, 90);
});

test("delivery failures and malformed request responses do not advance to code entry", async () => {
  for (const payload of [{}, { st: false, error_code: "delivery_failed", text: "Не удалось отправить код. Попробуйте позже." }]) {
    const page = harness({ response: () => ({ data: payload }) });
    await page.recovery();
    await page.submit();
    assert.equal(page.props().step, "request");
    assert.equal(page.props().phoneError, false);
    assert.equal(page.props().error, payload.text || "Не удалось запросить код. Попробуйте позже.");
    assert.equal(page.props().recoveryMessage, "");
  }
});

for (const [phone, login] of [["8 (987) 934-03-91", "89879340391"], ["+7 (987) 934-03-91", "+79879340391"], ["7 987 934 03 91", "+79879340391"], ["9879340391", "+79879340391"]]) {
  test(`masked phone ${phone} preserves the exact expected API login prefix`, async () => {
    const page = harness();
    await page.recovery(phone);
    await page.submit();
    assert.equal(page.requests[0].data.login, login);
  });
}

test("an incomplete OTP cannot advance; a complete OTP only advances locally without authenticating", async () => {
  const page = harness();
  await page.recovery();
  await page.submit();
  await page.invoke("onCodeChange", "123");
  await page.submit();
  assert.equal(page.props().step, "code");
  await page.invoke("onCodeChange", "012345");
  await page.submit();
  assert.equal(page.props().step, "password");
  assert.equal(page.requests.length, 1);
  assert.equal(page.sessions.length, 0);
});

test("new password requires matching upper/lowercase letters and a digit, matching the API", async () => {
  const page = harness();
  await page.recovery();
  await page.submit();
  await page.invoke("onCodeChange", "012345");
  await page.submit();
  for (const [password, repeat] of [["short1A", "short1A"], ["lowercase1", "lowercase1"], ["Upperlower", "Upperlower"], ["Password123", "Password124"]]) {
    await page.invoke("onPasswordChange", password);
    await page.invoke("onRepeatedPasswordChange", repeat);
    await page.submit();
    assert.equal(page.requests.length, 1);
    assert.equal(page.sessions.length, 0);
  }
});

test("only a successful server save creates a session; success waits for its login button before redirecting", async () => {
  const session = { st: true, token: "mock-token", user_id: 123 };
  const page = harness({ response: ({ method }) => ({ data: method === "save_new_pwd" ? session : { st: true } }) });
  await page.recovery();
  await page.submit();
  await page.invoke("onCodeChange", "012345");
  await page.submit();
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.submit();
  assert.deepEqual(page.requests[1].data, { login: "89879340391", code: "012345", pwd: "Password123" });
  assert.deepEqual(page.sessions, [[session, "89879340391"]]);
  assert.equal(page.props().step, "success");
  assert.equal(page.props().code, "");
  assert.equal(page.props().password, "");
  assert.equal(page.props().repeatedPassword, "");
  assert.equal(page.context.window.location.pathname, "/auth");
  await page.invoke("onLogin");
  assert.equal(page.context.window.location.pathname, "/");
});

test("wrong or expired OTP returns to empty focused OTP state, preserving typed passwords for retry", async () => {
  const page = harness({ response: ({ method }) => ({ data: method === "save_new_pwd" ? { st: false, text: "Код подтверждения неверен или истёк" } : { st: true } }) });
  await page.recovery();
  await page.submit();
  const errorKey = page.props().errorKey;
  await page.invoke("onCodeChange", "123456");
  await page.submit();
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.submit();
  assert.equal(page.props().step, "code");
  assert.equal(page.props().code, "");
  assert.equal(page.props().password, "Password123");
  assert.equal(page.props().repeatedPassword, "Password123");
  assert.equal(page.props().error, "Код подтверждения неверен или истёк");
  assert.ok(page.props().errorKey > errorKey);
  assert.equal(page.sessions.length, 0);
});

test("malformed or unsuccessful save responses never show success or persist a session", async () => {
  for (const payload of [undefined, {}, { st: false, text: "Ошибка обновления пароля" }]) {
    const page = harness({ response: ({ method }) => ({ data: method === "save_new_pwd" ? payload : { st: true } }) });
    await page.recovery();
    await page.submit();
    await page.invoke("onCodeChange", "123456");
    await page.submit();
    await page.invoke("onPasswordChange", "Password123");
    await page.invoke("onRepeatedPasswordChange", "Password123");
    await page.submit();
    assert.equal(page.props().step, "password");
    assert.equal(page.sessions.length, 0);
  }
});

test("resend and changing channels cannot bypass the shared server cooldown or reuse a CAPTCHA token", async () => {
  const page = harness({ captchaKey: "test-key", response: () => ({ data: { st: true, resend_after: 60 } }) });
  await page.recovery();
  await page.submit();
  assert.equal(page.requests.length, 0);
  await page.captcha();
  await page.submit();
  assert.equal(page.requests[0].data.captcha_token, "test-captcha");
  assert.equal(page.props().resendAfter, 60);
  assert.equal(page.props().securityBlocked, true);
  await page.invoke("onResend");
  assert.equal(page.requests.length, 1);
  await page.invoke("onChangeChannel");
  await page.invoke("onChannelChange", "telegram");
  await page.captcha();
  await page.submit();
  assert.equal(page.requests.length, 1);
});

test("previous login CAPTCHA requirement does not block local OTP continuation or final save", async () => {
  const page = harness({ captchaKey: "test-key", response: ({ method }) => ({ data: method === "auth" ? { st: false, captcha_required: true } : { st: true } }) });
  await page.phone("89879340391");
  await page.invoke("onLoginPasswordChange", "Password123");
  await page.submit();
  await page.invoke("onBack");
  await page.captcha();
  await page.submit();
  assert.equal(page.props().securityBlocked, true);
  await page.invoke("onCodeChange", "123456");
  await page.submit();
  assert.equal(page.props().step, "password");
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.submit();
  assert.equal(page.props().step, "success");
  assert.equal(page.sessions.length, 1);
});

test("HTTP429 Retry-After blocks handlers and remains active when navigating away and back", async () => {
  const page = harness({ response: () => { throw { response: { status: 429, headers: { "retry-after": "90" }, data: { data: { st: false } } } }; } });
  await page.recovery();
  await page.submit();
  assert.equal(page.props().retryAfter, 90);
  await page.submit();
  await page.invoke("onLogin");
  await page.invoke("onBack");
  await page.submit();
  assert.equal(page.requests.length, 1);
  assert.equal(page.props().retryAfter, 90);
});

test("changing phone, channel or challenge clears stale OTP and password fields", async () => {
  for (const action of ["onPhoneChange", "onChannelChange", "onChangeChannel", "onResend"]) {
    const page = harness();
    await page.recovery();
    await page.submit();
    await page.invoke("onCodeChange", "123456");
    await page.submit();
    await page.invoke("onPasswordChange", "Password123");
    await page.invoke("onRepeatedPasswordChange", "Password123");
    await page.invoke(action, action === "onPhoneChange" ? "+79879340391" : action === "onChannelChange" ? "telegram" : undefined);
    assert.equal(page.props().code, "");
    assert.equal(page.props().password, "");
    assert.equal(page.props().repeatedPassword, "");
  }
});

test("login retains the legacy broader phone validation instead of the recovery-only mobile-nine rule", async () => {
  const page = harness({ response: () => ({ data: { st: false } }) });
  await page.phone("80000000000");
  await page.invoke("onLoginPasswordChange", "Password123");
  await page.submit();
  assert.equal(page.requests[0].method, "auth");
});

test("auth page disables public caching without injecting CORS headers", async () => {
  const headers = {};
  await harness().getServerSideProps({ res: { setHeader: (name, value) => { headers[name] = value; } } });
  assert.deepEqual(headers, { "Cache-Control": "private, no-store, max-age=0" });
});

test("gallery is development-only, uses no-store, and cannot fake real authentication through query parameters", () => {
  const preview = readFileSync(new URL("../../../pages/auth/recovery-preview.js", import.meta.url), "utf8");
  assert.match(preview, /NODE_ENV !== "development"/);
  assert.match(preview, /notFound: true/);
  assert.match(preview, /private, no-store/);
  assert.doesNotMatch(source, /router.query|searchParams|initialStep/);
});

test("shared recovery reuses the delivery switch and keeps clean phone fields with error-only helpers", () => {
  const viewSource = readFileSync(new URL("../../../design-system/shared/ui/JacoRecoveryScreen.jsx", import.meta.url), "utf8");
  const viewExecutable = transformSync(
    helperSource.replace(/^export /gm, "") + "\n" + viewSource.replace(/^import[\s\S]*?;\n/gm, "").replace(/^export default /gm, "").replace(/^export /gm, ""),
    { configFile: false, babelrc: false, plugins: [require.resolve("@babel/plugin-transform-react-jsx")] },
  ).code + "\nJacoRecoveryScreen;";
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat(Infinity) } }), Fragment: "Fragment" },
    useId: () => "phone-preview",
  };
  for (const name of ["Box", "Button", "GlobalStyles", "IconButton", "InputAdornment", "Paper", "Typography", "ArrowBackIcon", "SmsOutlinedIcon", "TelegramIcon", "PhoneOutlinedIcon", "VisibilityOutlinedIcon", "VisibilityOffOutlinedIcon", "CheckCircleRoundedIcon", "CheckIcon", "LoginRoundedIcon", "JacoButton", "JacoTextInput", "JacoPeriodSwitch"]) context[name] = name;
  const View = vm.runInNewContext(viewExecutable, context);
  const findPhone = (node) => {
    if (!node || typeof node !== "object") return undefined;
    if (node.props?.name === "phone") return node.props;
    return node.props?.children.map(findPhone).find(Boolean);
  };
  for (const step of ["login", "request"]) {
    const normal = findPhone(View({ step }));
    assert.equal(normal.placeholder, "+7 (999) 123-45-67");
    assert.equal(normal.slotProps.htmlInput["aria-describedby"], undefined);
    assert.equal(normal.children.filter(Boolean).length, 0);
    const invalid = findPhone(View({ step, phoneError: true }));
    const helper = invalid.children.find(Boolean);
    assert.equal(invalid.slotProps.htmlInput["aria-describedby"], helper.props.id);
    assert.equal(helper.props.role, "alert");
    assert.deepEqual(helper.props.children, ["Введите номер в формате +7 или 8"]);
  }
  const accountError = findPhone(View({ step: "request", phoneError: true, phoneErrorText: accountNotFoundMessage, error: accountNotFoundMessage }));
  assert.deepEqual(accountError.children.find(Boolean).props.children, [accountNotFoundMessage]);
  const codeView = JSON.stringify(View({ step: "code", phone: "+79991234567" }));
  assert.match(codeView, /Код подтверждения для номера/);
  assert.doesNotMatch(codeView, /Код отправлен на/);
  const findSwitch = (node) => {
    if (!node || typeof node !== "object") return undefined;
    if (node.type === "JacoPeriodSwitch") return node.props;
    return node.props?.children.map(findSwitch).find(Boolean);
  };
  let changedChannel;
  const selector = findSwitch(View({ step: "request", channel: "telegram", loading: true, onChannelChange: (value) => { changedChannel = value; } }));
  assert.equal(selector.value, "telegram");
  assert.equal(selector.disabled, true);
  assert.deepEqual(Array.from(selector.items, (item) => item.value), ["sms", "telegram", "voice"]);
  assert.ok(selector.items.every((item) => item.label.props.children[0].props["aria-hidden"]));
  assert.ok(selector["aria-labelledby"]);
  assert.ok(selector["aria-describedby"]);
  selector.onChange({}, "voice");
  assert.equal(changedChannel, "voice");
  assert.equal(selector.tabSx["& > span"].display, "inline-flex");
  assert.equal(selector.tabSx["& > span"].alignItems, "center");
  assert.equal(selector.tabSx["& > span"].justifyContent, "center");
  const collectHelperCopies = (node) => {
    if (!node || typeof node !== "object") return [];
    if (node.type === "Typography" && node.props.sx?.gridArea === "1 / 1") return [node.props];
    return node.props?.children.flatMap(collectHelperCopies) || [];
  };
  for (const channel of ["sms", "telegram", "voice"]) {
    const copies = collectHelperCopies(View({ step: "request", channel }));
    assert.equal(copies.length, 3);
    const visible = copies.filter((copy) => copy.sx.visibility === "visible");
    assert.equal(visible.length, 1);
    assert.equal(visible[0].id, selector["aria-describedby"]);
    assert.equal(visible[0]["aria-live"], "polite");
    assert.equal(copies.filter((copy) => copy.id).length, 1);
    assert.ok(copies.filter((copy) => copy.sx.visibility === "hidden").every((copy) => copy["aria-hidden"] === true));
    assert.ok(copies.every((copy) => copy.sx.height === undefined && copy.sx.maxHeight === undefined));
  }
  const findSsoButton = (node) => {
    if (!node || typeof node !== "object") return undefined;
    if (node.type === "JacoButton" && node.props["aria-label"] === "Войти через SSO") return node.props;
    return node.props?.children.map(findSsoButton).find(Boolean);
  };
  for (const [ssoAvailable, ssoChecking, ssoStarting] of [[true, false, false], [false, false, false], [false, true, false], [true, false, true]]) {
    const button = findSsoButton(View({ step: "login", ssoAvailable, ssoChecking, ssoStarting }));
    assert.equal(button.type, "button");
    assert.equal(button.tone, "secondary");
    assert.equal(button.disabled, !ssoAvailable || ssoChecking);
    assert.equal(button.loading, ssoStarting);
  }
  assert.equal(findSsoButton(View({ step: "request", ssoAvailable: true })), undefined);
});
