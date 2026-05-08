const padTimePart = (value) => String(value).padStart(2, "0");

export default function formatTime(value, short = false) {
  if (value == null) return "—";

  const totalSeconds = Math.round(Number(value));
  if (!Number.isFinite(totalSeconds)) return "—";

  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (short) {
    if (hours > 0) {
      return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}`;
    }

    return `${padTimePart(minutes)}:${padTimePart(seconds)}`;
  }

  if (hours > 0) {
    const hourLabel = `${hours} ч`;
    const minuteLabel = minutes > 0 ? ` ${minutes} мин` : "";
    const secondLabel = seconds > 0 ? ` ${seconds} сек` : "";
    return `${hourLabel}${minuteLabel}${secondLabel}`;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes} мин ${seconds} сек` : `${minutes} мин`;
  }

  return `${seconds} сек`;
}
