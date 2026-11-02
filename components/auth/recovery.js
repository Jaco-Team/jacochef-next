export const RECOVERY_CODE_LENGTH = 6;
export const RECOVERY_PHONE_ERROR = "Введите номер в формате +7 или 8";

export function parseRecoveryPhone(value) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!raw) return { display: "", apiValue: "", valid: false };
  if (raw === "+") return { display: "+", apiValue: "+", valid: false };
  if ((raw.startsWith("+") && !raw.startsWith("+7")) || !/^[789+]/.test(raw)) {
    return { display: raw, apiValue: raw.replace(/[^\d+]/g, ""), valid: false };
  }
  const prefix = raw.startsWith("8") ? "8" : "+7";
  const hasPrefix = /^[78]/.test(digits);
  const national = hasPrefix ? digits.slice(1) : digits;
  if (national.length > 10) return { display: `${prefix}${national}`, apiValue: `${prefix}${national}`, valid: false };
  const number = national.slice(0, 10);
  let display = prefix;
  if (number.length) display += ` (${number.slice(0, 3)}`;
  if (number.length > 3) display += `) ${number.slice(3, 6)}`;
  if (number.length > 6) display += `-${number.slice(6, 8)}`;
  if (number.length > 8) display += `-${number.slice(8, 10)}`;
  return {
    display,
    apiValue: `${prefix}${number}`,
    valid: /^9\d{9}$/.test(national),
  };
}

export function maskedRecoveryPhone(value) {
  const { apiValue } = parseRecoveryPhone(value);
  const prefix = apiValue.startsWith("8") ? "8" : "+7";
  const national = apiValue.replace(/\D/g, "").slice(1);
  return `${prefix} (${national.slice(0, 3)}) ***-**-${national.slice(-2)}`;
}

export function passwordRecoveryRules(password, repeatedPassword) {
  return {
    length: password.length >= 8,
    characters: /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password),
    match: password.length > 0 && password === repeatedPassword,
  };
}

export function isRecoveryCodeComplete(code) {
  return new RegExp(`^\\d{${RECOVERY_CODE_LENGTH}}$`).test(code);
}

export function isRecoveryCodeError(message) {
  return /код подтверждения неверен или истёк/i.test(String(message ?? ""));
}

export function formatRecoveryCountdown(seconds) {
  const remaining = Math.max(0, Math.ceil(Number(seconds) || 0));
  return `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
}
