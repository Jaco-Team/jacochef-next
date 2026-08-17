const pad = (value) => String(value).padStart(2, "0");

const formatParts = (totalSeconds) => {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const parts = [];

  if (hours) parts.push(`${hours} ч.`);
  if (minutes) parts.push(`${minutes} мин.`);
  if (seconds || !parts.length) parts.push(`${seconds} сек.`);

  return parts.join(" ");
};

const parseIsoDuration = (value) => {
  const match = value.match(
    /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i,
  );
  if (!match) return null;

  const [, days = 0, hours = 0, minutes = 0, seconds = 0] = match;
  return Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const parseClockDuration = (value) => {
  const parts = value.split(":").map(Number);
  if (!parts.length || parts.some((part) => !Number.isInteger(part) || part < 0)) return null;

  if (parts.length === 3 && parts[1] < 60 && parts[2] < 60) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2 && parts[1] < 60) {
    return parts[0] * 60 + parts[1];
  }

  return null;
};

const parseDurationSeconds = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^\d+(?:\.\d+)?$/.test(text)) return Number(text);
  if (/^P/i.test(text)) return parseIsoDuration(text);
  if (/^\d+(?::\d{1,2}){1,2}$/.test(text)) return parseClockDuration(text);

  return null;
};

export const formatDuration = (value) => {
  const seconds = parseDurationSeconds(value);
  return seconds == null ? String(value ?? "") : formatParts(seconds);
};

export const formatDurationRange = (value) => {
  const text = String(value ?? "").trim();
  const match = text.match(
    /^(\d+)\s*(ч\.?|час(?:а|ов)?\.?|м\.?|мин\.?|минут(?:а|ы)?\.?|h|m)\s*[-–—]\s*(\d+)\s*\2$/i,
  );
  if (!match) return text;

  const [, from, unit, to] = match;
  const normalizedUnit = /^(?:ч|час|h)/i.test(unit) ? "ч." : "мин.";
  return `${from}-${to} ${normalizedUnit}`;
};

export default formatDuration;
