export const ALL_POINTS_ID = 0;

export const KITCHEN_QUEUE_TABS = {
  settings: "settings",
  overview: "overview",
  slots: "slots",
};

export const SLOT_MINUTES = ["00", "15", "30", "45"];

const TIME_PATTERN = /^([01]\d|2[0-3]):(00|15|30|45)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getErrorText(error, fallback) {
  return error?.message ? String(error.message) : fallback;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "";

  return String(value).replace(".", ",");
}

/** Значение параметра для показа в таблицах и истории. */
export function formatSettingValue(type, value, unit) {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "bool") return value === true || value === 1 || value === "1" ? "Да" : "Нет";

  const text = type === "time" ? String(value) : formatNumber(value);

  return unit ? `${text} ${unit}` : text;
}

/** Все времена суток с шагом 15 минут для выбора первого и последнего слота. */
export function buildTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    SLOT_MINUTES.forEach((minute) => {
      const time = `${String(hour).padStart(2, "0")}:${minute}`;
      options.push({ id: time, name: time });
    });
  }

  return options;
}

/** Проверка введённого значения параметра по типу и границам. Возвращает текст ошибки или пустую строку. */
export function validateSettingInput(setting, raw) {
  if (setting.type === "bool") return "";
  if (setting.type === "time")
    return TIME_PATTERN.test(String(raw)) ? "" : "Минуты: 00, 15, 30 или 45";

  const text = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (text === "") return "Укажите значение";

  const isWhole = /^-?\d+$/.test(text);
  if (setting.type === "int" && !isWhole) return "Нужно целое число";
  if (setting.type === "float" && !/^-?\d+(\.\d+)?$/.test(text)) return "Нужно число";

  const number = Number(text);
  if (number < setting.min || number > setting.max) {
    return `От ${formatNumber(setting.min)} до ${formatNumber(setting.max)}`;
  }

  return "";
}

/** Введённое значение в виде, который ждёт save_settings. */
export function toSettingPayloadValue(setting, raw) {
  if (setting.type === "bool") return raw === true;
  if (setting.type === "time") return String(raw);

  const number = Number(String(raw).trim().replace(",", "."));

  return setting.type === "int" ? Math.trunc(number) : number;
}

export function isDateKey(dayKey) {
  return DATE_PATTERN.test(String(dayKey));
}

export function formatDateKey(dayKey) {
  const [year, month, day] = String(dayKey).split("-");

  return `${day}.${month}.${year}`;
}

/** Часы редактора из списка слотов: ["10", "11", ...]. */
export function getHours(slots) {
  const hours = [];
  slots.forEach((time) => {
    const hour = String(time).slice(0, 2);
    if (!hours.includes(hour)) hours.push(hour);
  });

  return hours.sort();
}

export function getHourSlots(hour) {
  return SLOT_MINUTES.map((minute) => `${hour}:${minute}`);
}

export function slotKey(dayKey, time) {
  return `${dayKey}|${time}`;
}

/** Состояние ячейки часа по четырём слотам: пусто, одно число или разные значения. */
export function getHourState(values) {
  const first = values[0] ?? null;
  const same = values.every((value) => (value ?? null) === first);

  if (!same) return { kind: "mixed", value: null };
  if (first === null) return { kind: "empty", value: null };

  return { kind: "same", value: first };
}

/** Ввод в ячейку: только цифры, пустая строка очищает слот. */
export function parseSlotInput(raw, maxCount) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits === "") return null;

  return Math.min(Number(digits), maxCount);
}

/** Несохранённые ячейки в формате save_slots: [{day_key, slots}]. */
export function buildSlotItems(draft) {
  const byDay = {};
  Object.entries(draft).forEach(([key, value]) => {
    const [dayKey, time] = key.split("|");
    if (!byDay[dayKey]) byDay[dayKey] = {};
    byDay[dayKey][time] = value;
  });

  return Object.entries(byDay).map(([dayKey, slots]) => ({ day_key: dayKey, slots }));
}

export function formatDateTime(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);

  return match ? `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}` : text;
}
