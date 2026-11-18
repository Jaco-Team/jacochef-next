export const SSO_FAILURE_MESSAGE = "Не удалось войти через SSO. Попробуйте ещё раз или используйте номер телефона и пароль.";
export const SSO_FAILURE_URL = "/auth?error=sso_failed";
export const SSO_VERIFIER_STORAGE_KEY = "chef_sso_login_verifier";

export async function prepareSsoLogin({ crypto, storage, loginUrl }) {
  try {
    storage.removeItem(SSO_VERIFIER_STORAGE_KEY);
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const verifier = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    storage.setItem(SSO_VERIFIER_STORAGE_KEY, verifier);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
    const target = new URL(loginUrl);
    target.searchParams.set("login_challenge", challenge);
    return target.href;
  } catch {
    try { storage.removeItem(SSO_VERIFIER_STORAGE_KEY); } catch {}
    throw new Error("SSO login unavailable");
  }
}

export function consumeSsoLoginVerifier(storage) {
  try {
    const value = storage.getItem(SSO_VERIFIER_STORAGE_KEY);
    return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) ? value : "";
  } finally {
    storage.removeItem(SSO_VERIFIER_STORAGE_KEY);
  }
}

export function getSsoFailureMessage(search) {
  return new URLSearchParams(search).get("error") === "sso_failed" ? SSO_FAILURE_MESSAGE : "";
}

export function readSsoLoginCode(search) {
  const params = new URLSearchParams(search);
  if (params.getAll("status").length !== 1 || params.get("status") !== "success" || params.getAll("login_code").length !== 1) return "";
  if (Array.from(params.keys()).some((key) => key !== "status" && key !== "login_code")) return "";
  const code = params.get("login_code");
  return /^[a-f0-9]{64}$/i.test(code) ? code : "";
}

export function isValidSsoSession(payload) {
  return payload?.st === true &&
    typeof payload.token === "string" && payload.token.trim().length > 0 &&
    typeof payload.token_type === "string" && payload.token_type.toLowerCase() === "bearer" &&
    payload.auth_mode === "token" &&
    Number.isInteger(payload.user_id) && payload.user_id > 0 &&
    typeof payload.login === "string" && payload.login.trim().length > 0 &&
    Object.prototype.hasOwnProperty.call(payload, "legacy_token") &&
    (payload.legacy_token === null || (typeof payload.legacy_token === "string" && payload.legacy_token.trim().length > 0)) &&
    typeof payload.expires_at === "string" && Number.isFinite(Date.parse(payload.expires_at)) &&
    Number.isFinite(payload.expire_days) && payload.expire_days > 0;
}

export async function completeSsoLogin({ search, scrubUrl, consumeVerifier, exchange, storeSession, navigate }) {
  try {
    const code = readSsoLoginCode(search);
    // Remove the short-lived code before any API request or asynchronous work.
    let verifier;
    try { scrubUrl(); } finally { verifier = consumeVerifier(); }
    if (!code || !/^[a-f0-9]{64}$/.test(verifier)) throw new Error("Invalid SSO callback");
    const response = await exchange(code, verifier);
    const payload = response?.data ?? response;
    if (!isValidSsoSession(payload)) throw new Error("Invalid SSO session");
    storeSession(payload, payload.login);
    navigate("/");
    return true;
  } catch {
    navigate(SSO_FAILURE_URL);
    return false;
  }
}
