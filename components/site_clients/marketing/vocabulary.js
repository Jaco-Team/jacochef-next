const trafficMap = {
  yandex: "Яндекс",
  ya: "Я",
  google: "Google",
  bing: "Bing",
  organic: "Поиск",
  direct: "Прямые заходы",
  referral: "Переход",
  cpc: "Контекст",
  cpa: "CPA",
  email: "Email",
  social: "Соцсети",
  maps: "Карты",
  none: "Не определено",
};

export default function vocabulary(term) {
  if (!term) return term;
  const key = term.toString().toLowerCase().trim();
  return trafficMap[key] || term;
}
