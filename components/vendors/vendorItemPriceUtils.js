import { formatMoney } from "./vendorFormUtils";

export const calcUnitPrice = (fullPrice, recPq) => {
  const packPrice = parseFloat(fullPrice);
  const packQty = parseFloat(recPq);

  if (!packQty || Number.isNaN(packQty) || Number.isNaN(packPrice)) {
    return "";
  }

  return (packPrice / packQty).toFixed(2);
};

export const formatPackVolume = (item) => {
  const qty = item?.rec_pq;
  if (qty === null || qty === undefined || qty === "" || qty === 0 || qty === "0") {
    return "Не указан";
  }

  const unit = item?.ei_name || "шт";
  return `${qty} ${unit}`;
};

export const formatUnitPriceLabel = (item) => {
  const unitPrice = item?.price || calcUnitPrice(item?.full_price, item?.rec_pq);
  if (!unitPrice) {
    return "Не указана";
  }

  const unit = item?.ei_name || "шт";
  return `${String(unitPrice).replace(".", ",")} ₽/${unit}`;
};

export const formatPackPriceLabel = (value) => formatMoney(value);

export const buildPriceItemPayload = (item) => ({
  item_id: item.item_id,
  full_price: item.full_price,
  rec_pq: item.rec_pq,
  price: item.price || calcUnitPrice(item.full_price, item.rec_pq),
});

export const createEmptyAddDraft = () => ({
  item_id: "",
  full_price: "",
  rec_pq: "",
  pqs: [],
  price: "",
  ei_name: "шт",
});

export const enrichPriceItems = (priceItems = [], vendorItems = []) => {
  const vendorItemsById = new Map(vendorItems.map((entry) => [Number(entry.item_id), entry]));

  return (priceItems || []).map((item) => {
    const vendorItem = vendorItemsById.get(Number(item.item_id));
    const declarations = Array.isArray(vendorItem?.declarations)
      ? vendorItem.declarations
      : Array.isArray(item.declarations)
        ? item.declarations
        : [];

    return {
      ...item,
      cat_name: item.cat_name || vendorItem?.cat_name || "",
      declarations,
      declarations_count:
        typeof item.declarations_count === "number" ? item.declarations_count : declarations.length,
    };
  });
};

export const mergeVendorItemWithPrice = (vendorItem, priceItem) => ({
  ...vendorItem,
  item_id: vendorItem?.item_id ?? priceItem?.item_id,
  name: priceItem?.name || vendorItem?.item_name || vendorItem?.name || "Товар",
  name_for_vendor: priceItem?.name_for_vendor || "",
  cat_name: vendorItem?.cat_name || priceItem?.cat_name || "",
  declarations: vendorItem?.declarations || priceItem?.declarations || [],
  declarations_count: Array.isArray(vendorItem?.declarations)
    ? vendorItem.declarations.length
    : priceItem?.declarations_count || 0,
  full_price: priceItem?.full_price,
  rec_pq: priceItem?.rec_pq,
  price: priceItem?.price,
  ei_name: priceItem?.ei_name,
  pqs: priceItem?.pqs || [],
});

export const buildCatalogSelectOptions = (allItems = [], excludedItemIds = new Set()) =>
  allItems
    .filter((item) => !excludedItemIds.has(Number(item.id)))
    .map((item) => ({
      id: String(item.id),
      name: item.cat_name
        ? `${item.name || `Товар #${item.id}`} · ${item.cat_name}`
        : item.name || `Товар #${item.id}`,
    }));
