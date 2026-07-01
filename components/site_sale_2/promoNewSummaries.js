import { formatDateName } from "./promoNewShared";

function findName(list, id) {
  return list?.find((item) => parseInt(item.id, 10) === parseInt(id, 10))?.name || "";
}

function formatShortList(items, limit = 2) {
  if (!items?.length) {
    return "не выбрано";
  }

  const names = items.map((item) => item.name).filter(Boolean);
  if (names.length <= limit) {
    return names.join(", ");
  }

  return `${names.slice(0, limit).join(", ")} +${names.length - limit}`;
}

export function getBenefitSummary(state) {
  const actionName = findName(state.promo_action_list, state.promo_action);

  if (parseInt(state.promo_action, 10) === 1) {
    const saleScope = findName(state.sale_list, state.type_sale);
    let size = state.promo_sale;

    if (parseInt(state.sale_type, 10) === 2) {
      size = findName(state.promo_sale_list, state.promo_sale);
    }

    const unit = parseInt(state.sale_type, 10) === 1 ? "₽" : "%";
    let target = saleScope;

    if (parseInt(state.type_sale, 10) === 1) {
      target = formatShortList(state.saleItem);
    }
    if (parseInt(state.type_sale, 10) === 2) {
      target = formatShortList(state.saleCat);
    }

    return `${actionName}: ${target}, ${size}${unit}`;
  }

  if (parseInt(state.promo_action, 10) === 2) {
    const count = state.itemsAdd?.length || 0;
    return count ? `${actionName}: ${count} поз.` : `${actionName}: позиции не добавлены`;
  }

  if (parseInt(state.promo_action, 10) === 3) {
    const count = state.itemsAddPrice?.length || 0;
    return count ? `${actionName}: ${count} поз.` : `${actionName}: позиции не добавлены`;
  }

  return actionName || "Не выбрано";
}

export function getConditionsSummary(state) {
  const conditionName = findName(state.promo_conditions_list, state.promo_conditions);

  if (parseInt(state.promo_conditions, 10) === 1) {
    return `${conditionName}: ${formatShortList(state.conditionItems)}`;
  }

  if (parseInt(state.promo_conditions, 10) === 2) {
    const from = state.price_start ?? 0;
    const to = state.price_end ?? 0;
    return `${conditionName}: от ${from} до ${to} ₽`;
  }

  return conditionName || "Не выбрано";
}

export function getScheduleSummary(state) {
  const preset = findName(state.date_promo_list, state.date_promo);
  const days = [
    state.day_1,
    state.day_2,
    state.day_3,
    state.day_4,
    state.day_5,
    state.day_6,
    state.day_7,
  ].filter(Boolean).length;

  const excluded = state.testDate?.length || 0;
  let summary = `${preset || "Период"} · ${state.time_start || ""}–${state.time_end || ""} · дни: ${days}/7`;

  if (excluded > 0) {
    summary += ` · исключений: ${excluded}`;
  }

  return summary;
}

export function getLocationSummary(state) {
  const orderType = findName(state.type_order_list, state.type_order);
  const where = findName(state.where_order_list, state.where_order);

  if (parseInt(state.where_order, 10) === 1 && parseInt(state.city, 10) > 0) {
    return `${orderType} · ${where}: ${findName(state.cities, state.city)}`;
  }

  if (parseInt(state.where_order, 10) === 2 && parseInt(state.point, 10) > 0) {
    return `${orderType} · ${where}: ${findName(state.points, state.point)}`;
  }

  return `${orderType} · ${where}: везде`;
}

export function getActionSummary(state) {
  const action = findName(state.where_promo_list, state.where_promo);

  if (!state.numberList) {
    return action;
  }

  const preview = String(state.numberList).trim();
  const short = preview.length > 28 ? `${preview.slice(0, 28)}…` : preview;
  return `${action} · ${short}`;
}

export function getExcludedDatesPreview(testDate = []) {
  if (!testDate.length) {
    return "Нет исключений";
  }

  return testDate
    .slice(0, 3)
    .map((item) => formatDateName(item))
    .join(", ")
    .concat(testDate.length > 3 ? ` +${testDate.length - 3}` : "");
}

export function getWeekdaysPreview(state) {
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const keys = ["day_1", "day_2", "day_3", "day_4", "day_5", "day_6", "day_7"];
  const active = keys.filter((key) => state[key]).map((_, index) => labels[index]);

  if (active.length === 7) {
    return "Каждый день";
  }

  if (!active.length) {
    return "Ни один день не выбран";
  }

  return active.join(", ");
}
