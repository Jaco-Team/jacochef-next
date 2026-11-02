import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { transformSync } = require("@babel/core");
const helperSource = readFileSync(new URL("../../../components/auth/recovery.js", import.meta.url), "utf8");
const source = readFileSync(new URL("../../../pages/registration.js", import.meta.url), "utf8");
const executable = transformSync(
  helperSource.replace(/^export /gm, "") + "\n" + source.replace(/^import[\s\S]*?;\n/gm, "").replace(/^export default /gm, "").replace(/^export /gm, ""),
  { configFile: false, babelrc: false, plugins: [require.resolve("@babel/plugin-transform-react-jsx")] },
).code + "\n({ Registration, getServerSideProps });";

function harness({ captchaKey = "", response = () => ({ data: { st: true } }) } = {}) {
  const state = [];
  const requests = [];
  const sessions = [];
  let index = 0;
  let tree;
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat(Infinity) } }) },
    useState(initial) {
      const position = index++;
      if (!(position in state)) state[position] = initial;
      return [state[position], (value) => { state[position] = typeof value === "function" ? value(state[position]) : value; }];
    },
    useEffect() {},
    dynamic: () => "SmartCaptcha",
    Box: "Box",
    JacoRecoveryScreen: "JacoRecoveryScreen",
    process: { env: { NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY: captchaKey } },
    window: { location: { pathname: "/registration" } },
    async api_laravel(module, method, data, options) {
      requests.push(JSON.parse(JSON.stringify({ module, method, data, options })));
      return response(requests.at(-1));
    },
    storeAuthSession: (...args) => sessions.push(JSON.parse(JSON.stringify(args))),
  };
  const page = vm.runInNewContext(executable, context);
  const render = () => { index = 0; tree = page.Registration(); };
  const props = () => tree.props.children.find((node) => node.type === "JacoRecoveryScreen").props;
  const invoke = async (name, ...args) => { await props()[name](...args); render(); };
  const submit = () => invoke("onSubmit", { preventDefault() {} });
  const phone = (value = "89879340391") => invoke("onPhoneChange", value);
  render();
  return { ...page, requests, sessions, props, invoke, submit, phone, context };
}

test("registration opens on the recovery request step with SMS and rejects invalid phones locally", async () => {
  const page = harness();
  assert.equal(page.props().step, "request");
  assert.equal(page.props().channel, "sms");
  assert.equal(page.props().loginPassword, undefined);
  assert.equal(page.props().onSsoLogin, undefined);
  await page.phone("123");
  await page.submit();
  assert.equal(page.requests.length, 0);
  assert.equal(page.props().phoneError, true);
  assert.equal(page.props().error, "Введите номер в формате +7 или 8");
});

for (const channel of ["sms", "telegram", "voice"]) {
  test(`registration request and resend send delivery_channel ${channel}`, async () => {
    const page = harness();
    await page.phone();
    await page.invoke("onChannelChange", channel);
    await page.submit();
    assert.deepEqual(page.requests[0], {
      module: "auth", method: "check_phone",
      data: { login: "89879340391", captcha_token: "", delivery_channel: channel },
      options: { throwErrors: true },
    });
    assert.equal(page.props().step, "code");
    await page.invoke("onResend");
    assert.equal(page.requests[1].data.delivery_channel, channel);
  });
}

test("a missing account keeps the request step and shows the server message beside the phone", async () => {
  const message = "Аккаунт с таким номером не найден. Проверьте номер телефона — можно вводить через +7 или 8.";
  const page = harness({ response: () => ({ data: { st: false, error_code: "account_not_found", text: message } }) });
  await page.phone();
  await page.submit();
  assert.equal(page.props().step, "request");
  assert.equal(page.props().phoneError, true);
  assert.equal(page.props().phoneErrorText, message);
  assert.equal(page.sessions.length, 0);
});

test("successful save stores the session once, shows success and then goes home", async () => {
  const session = { st: true, token: "mock-token", user_id: 123 };
  const page = harness({ response: ({ method }) => ({ data: method === "save_new_pwd" ? session : { st: true } }) });
  await page.phone();
  await page.submit();
  await page.invoke("onCodeChange", "012345");
  await page.submit();
  assert.equal(page.props().step, "password");
  assert.equal(page.requests.length, 1);
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.submit();
  assert.deepEqual(page.requests[1], {
    module: "auth", method: "save_new_pwd",
    data: { login: "89879340391", code: "012345", pwd: "Password123" },
    options: { throwErrors: true },
  });
  assert.deepEqual(page.sessions, [[session, "89879340391"]]);
  assert.equal(page.props().step, "success");
  assert.equal(page.context.window.location.pathname, "/registration");
  await page.invoke("onLogin");
  assert.equal(page.context.window.location.pathname, "/");
  assert.equal(page.sessions.length, 1);
});

test("wrong or expired OTP returns to an empty code step", async () => {
  const page = harness({ response: ({ method }) => ({ data: method === "save_new_pwd" ? { st: false, text: "Код подтверждения неверен или истёк" } : { st: true } }) });
  await page.phone();
  await page.submit();
  await page.invoke("onCodeChange", "123456");
  await page.submit();
  await page.invoke("onPasswordChange", "Password123");
  await page.invoke("onRepeatedPasswordChange", "Password123");
  await page.submit();
  assert.equal(page.props().step, "code");
  assert.equal(page.props().code, "");
  assert.equal(page.props().error, "Код подтверждения неверен или истёк");
  assert.equal(page.sessions.length, 0);
});

test("the request step login link navigates to the auth page", async () => {
  const page = harness();
  await page.invoke("onLogin");
  assert.equal(page.context.window.location.pathname, "/auth");
  assert.equal(page.requests.length, 0);
  assert.equal(page.sessions.length, 0);
});

test("registration page disables public caching without injecting CORS headers", async () => {
  const headers = {};
  await harness().getServerSideProps({ res: { setHeader: (name, value) => { headers[name] = value; } } });
  assert.deepEqual(headers, { "Cache-Control": "private, no-store, max-age=0" });
});
