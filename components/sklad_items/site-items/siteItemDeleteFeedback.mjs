export function getDeleteError(response) {
  const usage = response?.usage ?? {};
  const active = Array.isArray(usage.active_relations) ? usage.active_relations : [];
  const history = Array.isArray(usage.history_relations) ? usage.history_relations : [];
  const counts = [];

  if (active.length) counts.push(`активные связи: ${active.length}`);
  if (history.length) counts.push(`история: ${history.length}`);

  const composition = [];
  if (active.some((relation) => relation?.source === "items_items_new")) {
    composition.push("используется в составе других товаров сайта");
  }
  if (history.some((relation) => relation?.source === "items_items_hist_new")) {
    composition.push("есть в истории состава других товаров сайта");
  }

  const message = response?.text || "Удаление запрещено";
  const details = [...composition, ...counts];
  return details.length ? `${message} (${details.join(", ")})` : message;
}
