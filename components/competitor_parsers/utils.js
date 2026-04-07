export function formatValue(value, fallback = "—") {
  if (!value) return fallback;
  return value;
}

export function getStatusLabel(status) {
  if (!status) return "Никогда не запускался";
  const map = {
    completed: "Успешно",
    completed_with_errors: "Завершен с ошибками",
    failed: "Ошибка",
  };
  return map[status] || status;
}
