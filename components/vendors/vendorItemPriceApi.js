export const VENDOR_PRICE_API = {
  GET_CONTEXT: "get_vendor_price_context",
  LIST_ITEMS: "list_vendor_price_items",
  GET_ITEM_PACK_OPTIONS: "get_vendor_price_item_pack_options",
  UPSERT_ITEM: "upsert_vendor_price_item",
  CREATE_ITEM: "create_vendor_price_item",
  DELETE_ITEM: "delete_vendor_price_item",
};

export const VENDOR_PRICE_API_LEGACY = {
  [VENDOR_PRICE_API.GET_CONTEXT]: "get_all",
  [VENDOR_PRICE_API.LIST_ITEMS]: "get_vendor_items_price",
};

export function resolveVendorPriceApiMethod(method) {
  return VENDOR_PRICE_API_LEGACY[method] || method;
}
