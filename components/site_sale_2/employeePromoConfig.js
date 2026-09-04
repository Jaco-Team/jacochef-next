import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";

export function parseJsonField(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  return fallback;
}

function idsToCatalogItems(ids, catalog) {
  return parseJsonField(ids, [])
    .map((idOrObj) => {
      if (idOrObj && typeof idOrObj === "object") {
        const found = (catalog || []).find(
          (item) => parseInt(item.id, 10) === parseInt(idOrObj.id, 10),
        );
        return found || idOrObj;
      }

      return (catalog || []).find((item) => parseInt(item.id, 10) === parseInt(idOrObj, 10));
    })
    .filter(Boolean);
}

export function getEmptyEmployeePromoForm() {
  return {
    effective_date: formatDate(Date.now()),
    count_action: 1,
    promo_action: 1,
    type_sale: 3,
    promo_sale: 1,
    sale_type: 2,
    promo_conditions: 2,
    price_start: 0,
    price_end: 0,
    type_order: 1,
    where_order: 1,
    city: 0,
    point: 0,
    auto_text: true,
    promo_desc_true: "",
    promo_desc_false: "",
    time_start: "10:00",
    time_end: "21:30",
    addItem: null,
    addItemCount: 1,
    addItemPrice: 1,
    addItemAllPrice: 0,
    itemsAdd: [],
    itemsAddPrice: [],
    saleCat: [],
    saleItem: [],
    priceItem: null,
    conditionItems: [],
    conditionCat: [],
  };
}

export function hydrateEmployeePromoConfig(config, catalogs = {}) {
  if (!config) {
    return getEmptyEmployeePromoForm();
  }

  const items = catalogs.items || [];
  const cats = catalogs.cats || [];
  const promo_sale_list = catalogs.promo_sale_list || [];
  const itemsAdd = parseJsonField(config.promo_items_add, []);
  let addItemAllPrice = 0;

  itemsAdd.forEach((item) => {
    addItemAllPrice += parseInt(item.price, 10) || 0;
  });

  let promo_sale = config.promo_sale || 1;

  if (parseInt(config.promo_type, 10) === 2) {
    const found = promo_sale_list.find(
      (item) => parseInt(item.name, 10) === parseInt(config.count_promo, 10),
    );
    promo_sale = found ? found.id : config.promo_sale || 1;
  } else if (config.count_promo != null) {
    promo_sale = config.count_promo;
  }

  return {
    ...getEmptyEmployeePromoForm(),
    effective_date: config.effective_date
      ? formatDate(config.effective_date)
      : formatDate(Date.now()),
    count_action: config.promo_in_count ?? config.count_action ?? 1,
    promo_action: config.promo_action ?? 1,
    type_sale: config.promo_type_sale ?? 3,
    promo_sale,
    sale_type: config.promo_type ?? 2,
    promo_conditions: config.promo_conditions ?? 2,
    price_start: config.promo_summ ?? 0,
    price_end: config.promo_summ_to ?? 0,
    type_order: config.promo_type_order ?? 1,
    where_order: config.promo_where ?? 1,
    city: config.promo_city ?? 0,
    point: config.promo_point ?? 0,
    auto_text: false,
    promo_desc_true: config.about_promo_text || "",
    promo_desc_false: config.condition_promo_text || "",
    time_start: config.time_start || "10:00",
    time_end: config.time_end || "21:30",
    itemsAdd,
    itemsAddPrice: parseJsonField(config.promo_items_sale, []),
    addItemAllPrice,
    saleItem: idsToCatalogItems(config.promo_items, items),
    saleCat: idsToCatalogItems(config.promo_cat, cats),
    conditionItems: idsToCatalogItems(config.promo_conditions_items, items),
  };
}

export function buildEmployeePromoConfigPayload(state) {
  let count_promo = 0;

  if (parseInt(state.sale_type, 10) === 2) {
    const found = (state.promo_sale_list || []).find(
      (item) => parseInt(item.id, 10) === parseInt(state.promo_sale, 10),
    );
    count_promo = found ? found.name : state.promo_sale;
  } else {
    count_promo = parseInt(state.promo_sale, 10);
  }

  const conditionItems = (state.conditionItems || []).map((item) => item.id);
  const promo_items = (state.saleItem || []).map((item) => item.id);
  const promo_cat = (state.saleCat || []).map((item) => item.id);

  return {
    effective_date: dayjs(state.effective_date).format("YYYY-MM-DD"),
    promo_in_count: state.count_action,
    promo_action: state.promo_action,
    promo_type_sale: state.type_sale,
    count_promo,
    promo_type: state.sale_type,
    promo_conditions: state.promo_conditions,
    promo_summ: state.price_start,
    promo_summ_to: state.price_end,
    promo_type_order: state.type_order,
    promo_where: state.where_order,
    promo_city: state.city,
    promo_point: state.point,
    about_promo_text: state.promo_desc_true,
    condition_promo_text: state.promo_desc_false,
    time_start: state.time_start,
    time_end: state.time_end,
    promo_items: JSON.stringify(promo_items),
    promo_cat: JSON.stringify(promo_cat),
    promo_items_add: JSON.stringify(state.itemsAdd || []),
    promo_items_sale: JSON.stringify(state.itemsAddPrice || []),
    promo_conditions_items: JSON.stringify(conditionItems),
  };
}
