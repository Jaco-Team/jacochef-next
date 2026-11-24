export function normalizePromoPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const nationalNumber = /^[78]/.test(digits) ? digits.slice(1) : digits;

  return `8${nationalNumber.slice(0, 10)}`;
}

export function formatPromoPhone(value) {
  const normalized = normalizePromoPhone(value);

  if (!normalized) {
    return "";
  }

  const number = normalized.slice(1);
  let formatted = "8";

  if (number.length) {
    formatted += ` (${number.slice(0, 3)}`;
  }

  if (number.length >= 3) {
    formatted += ")";
  }

  if (number.length > 3) {
    formatted += ` ${number.slice(3, 6)}`;
  }

  if (number.length > 6) {
    formatted += `-${number.slice(6, 8)}`;
  }

  if (number.length > 8) {
    formatted += `-${number.slice(8, 10)}`;
  }

  return formatted;
}

export function normalizePromoEmail(value) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function isValidPromoEmail(value) {
  const email = normalizePromoEmail(value);

  return /^[^@]+@[^@.]+(?:\.[^@.]+)+$/.test(email);
}
