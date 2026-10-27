/**
 * Позиции и промокод баннера задаются независимо: изменение одного поля
 * больше не очищает другое. Существующие баннеры сохраняются как есть.
 */
export function applyBannerAutocomplete(thisBan, field, value) {
  return { ...thisBan, [field]: value };
}
