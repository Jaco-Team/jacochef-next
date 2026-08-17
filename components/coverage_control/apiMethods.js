import dayjs from "dayjs";

export const MODULE = "coverage_control";

export const METHODS = {
  GET_ALL: "get_all",
  GET_MATERIAL: "get_material",
  SAVE_MATERIAL: "save_material",
  SET_MATERIAL_ACTIVE: "set_material_active",
  DELETE_MATERIAL: "delete_material",
  SAVE_SUPPLIER: "save_supplier",
  DELETE_SUPPLIER: "delete_supplier",
  REQUEST_STOCK: "request_stock",
  GET_SUPPLIER_MATERIALS: "get_supplier_materials",
  EXPORT_EXCEL: "export_excel",
};

/** Prefer nested `data`, otherwise use the response itself. */
export function unwrapPayload(res) {
  if (!res || typeof res !== "object") return {};
  if (res.data != null && typeof res.data === "object" && !Array.isArray(res.data)) {
    return res.data;
  }
  return res;
}

export function getErrorText(res, fallback = "Ошибка запроса") {
  return res?.text || res?.message || fallback;
}

export function isSuccess(res) {
  return Boolean(res?.st);
}

/** Manual fields only — never send calculated values on save. */
export const MATERIAL_MANUAL_FIELDS = [
  "id",
  "name",
  "category_id",
  "unit_id",
  "calc_type",
  "packaging",
  "comment",
  "is_active",
];

export const SUPPLIER_MANUAL_FIELDS = [
  "id",
  "material_id",
  "supplier_id",
  "allocated_qty",
  "stock_at_supplier",
  "in_transit",
  "expected_arrival_date",
  "comment",
  "production_days",
  "logistics_days",
  "holiday_days",
  "safety_days",
  "price_current",
  "price_future",
  "price_future_comment",
];

export function pickFields(source, fields) {
  const out = {};
  if (!source || typeof source !== "object") return out;
  fields.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      out[key] = source[key];
    }
  });
  return out;
}

export function buildMaterialSavePayload(form) {
  return pickFields(form, MATERIAL_MANUAL_FIELDS);
}

export function buildSupplierSavePayload(form) {
  const payload = pickFields(form, SUPPLIER_MANUAL_FIELDS);
  const arrivalDate = payload.expected_arrival_date;

  if (arrivalDate) {
    const parsed = dayjs(arrivalDate);
    payload.expected_arrival_date = parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
  } else if (Object.prototype.hasOwnProperty.call(payload, "expected_arrival_date")) {
    payload.expected_arrival_date = null;
  }

  return payload;
}
