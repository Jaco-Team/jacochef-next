function normalizePhoneInput(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeRussianDigits(digits) {
  if (digits.length === 10) {
    return `7${digits}`;
  }

  if (/^[78]\d{10}$/.test(digits)) {
    return `7${digits.slice(1)}`;
  }

  return "";
}

function formatMobilePhone(normalized) {
  if (!/^79\d{9}$/.test(normalized)) {
    return "";
  }

  const local = normalized.slice(1);

  return `+7 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 8)}-${local.slice(8, 10)}`;
}

function formatLandlinePhone(normalized, areaCodeLength = 3) {
  if (!/^7\d{10}$/.test(normalized)) {
    return "";
  }

  const local = normalized.slice(1);
  const safeAreaCodeLength = areaCodeLength === 4 ? 4 : 3;
  const areaCode = local.slice(0, safeAreaCodeLength);
  const subscriber = local.slice(safeAreaCodeLength);

  if (!areaCode || !subscriber) {
    return "";
  }

  if (subscriber.length === 7) {
    return `+7 (${areaCode}) ${subscriber.slice(0, 3)}-${subscriber.slice(3, 5)}-${subscriber.slice(5, 7)}`;
  }

  if (subscriber.length === 6) {
    return `+7 (${areaCode}) ${subscriber.slice(0, 3)}-${subscriber.slice(3, 6)}`;
  }

  return `+7 (${areaCode}) ${subscriber}`;
}

function formatRussianPhone(digits, areaCodeLength) {
  const normalized = normalizeRussianDigits(digits);

  if (!normalized) {
    return "";
  }

  return formatMobilePhone(normalized) || formatLandlinePhone(normalized, areaCodeLength);
}

function getAreaCodeLength(fragment) {
  const areaCodeMatch = fragment.match(/\((\d{3,4})\)/);

  if (areaCodeMatch?.[1]) {
    return areaCodeMatch[1].length;
  }

  return null;
}

function formatPhoneFragment(fragment) {
  const extensionMatch = fragment.match(/(?:доб\.?|ext\.?)\s*(\d+)/i);
  const baseFragment = fragment.replace(/(?:доб\.?|ext\.?)\s*\d+/gi, "");
  const digits = baseFragment.replace(/\D/g, "");
  const russianFormatted = formatRussianPhone(digits, getAreaCodeLength(fragment));

  if (russianFormatted) {
    return extensionMatch?.[1] ? `${russianFormatted} доб. ${extensionMatch[1]}` : russianFormatted;
  }

  return fragment.trim();
}

export default function formatPhone(value) {
  const normalized = normalizePhoneInput(value);

  if (!normalized) {
    return "";
  }

  const formatted = normalized.replace(
    /(?:\+?\d[\d\s().-]{5,}\d(?:\s*(?:доб\.?|ext\.?)\s*\d+)*)/gi,
    (fragment) => formatPhoneFragment(fragment),
  );
  const baseNormalized = normalized.replace(/(?:доб\.?|ext\.?)\s*\d+/gi, "");
  const digits = baseNormalized.replace(/\D/g, "");
  const russianFormatted = formatRussianPhone(digits, getAreaCodeLength(normalized));

  if (russianFormatted) {
    const extensionMatch = normalized.match(/(?:доб\.?|ext\.?)\s*(\d+)/i);
    return extensionMatch?.[1] ? `${russianFormatted} доб. ${extensionMatch[1]}` : russianFormatted;
  }

  if (formatted !== normalized) {
    return formatted;
  }

  if (normalized.startsWith("+") && digits.length >= 7 && digits.length <= 15) {
    return `+${digits}`;
  }

  return normalized;
}
