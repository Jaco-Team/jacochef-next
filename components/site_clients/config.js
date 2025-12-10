export const MONTHS = [
  { id: 1, name: "января" },
  { id: 2, name: "февраля" },
  { id: 3, name: "марта" },
  { id: 4, name: "апреля" },
  { id: 5, name: "мая" },
  { id: 6, name: "июня" },
  { id: 7, name: "июля" },
  { id: 8, name: "августа" },
  { id: 9, name: "сентября" },
  { id: 10, name: "октября" },
  { id: 11, name: "ноября" },
  { id: 12, name: "декабря" },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => ({ id: i + 1, name: i + 1 }));
