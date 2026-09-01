export function formatValue(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

export function formatNumber(value, digits = null) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return formatValue(value);
  if (digits == null) return String(num);
  return num.toFixed(digits);
}

export function supplierNames(item) {
  if (!item) return "—";
  if (typeof item.suppliers_label === "string" && item.suppliers_label) {
    return item.suppliers_label;
  }
  if (Array.isArray(item.suppliers) && item.suppliers.length) {
    return item.suppliers
      .map((s) => s?.name || s?.supplier_name)
      .filter(Boolean)
      .join(", ");
  }
  if (item.main_supplier_name) return item.main_supplier_name;
  return "—";
}

export function matchesFilters(item, filters) {
  if (!item) return false;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const hay = [item.name, item.category_name, item.comment, supplierNames(item)]
      .map((v) => String(v || "").toLowerCase())
      .join(" ");
    if (!hay.includes(search)) return false;
  }

  if (Array.isArray(filters.category_ids) && filters.category_ids.length) {
    const ids = filters.category_ids.map(String).filter((id) => id !== "all");
    if (ids.length && !ids.includes(String(item.category_id))) return false;
  }

  if (filters.supplier_id) {
    const sid = String(filters.supplier_id);
    const list = Array.isArray(item.suppliers) ? item.suppliers : [];
    const hit = list.some((s) => String(s?.supplier_id ?? s?.id) === sid || String(s?.id) === sid);
    if (!hit && String(item.main_supplier_id) !== sid) return false;
  }

  if (filters.critical) {
    const status = item.status;
    if (status !== "critical" && !item.is_critical) return false;
  }

  if (filters.no_supplier_stock) {
    if (!(item.status === "no_supplier_stock" || item.has_supplier_stock === false)) {
      return false;
    }
  }

  if (filters.no_usage) {
    if (!(item.status === "no_usage" || item.has_usage === false)) return false;
  }

  if (filters.stale_stock) {
    if (!(item.status === "stock_stale" || item.stock_stale === true)) return false;
  }

  if (filters.undistributed) {
    const remaining = Number(item.remaining);
    const freeNeed = Number(item.free_need);
    const flag =
      item.status === "need_not_allocated" ||
      item.status === "partially_allocated" ||
      (Number.isFinite(remaining) && remaining > 0) ||
      (Number.isFinite(freeNeed) && freeNeed > 0);
    if (!flag) return false;
  }

  if (filters.active_only && item.is_active === false) return false;

  return true;
}

export function emptyMaterialForm() {
  return {
    id: null,
    name: "",
    category_id: "",
    unit_id: "",
    calc_type: "",
    packaging: "",
    comment: "",
    is_active: true,
  };
}

export function emptySupplierForm(materialId = null) {
  return {
    id: null,
    material_id: materialId,
    supplier_id: "",
    allocated_qty: "",
    stock_at_supplier: "",
    in_transit: "",
    expected_arrival_date: "",
    comment: "",
    production_days: "",
    logistics_days: "",
    holiday_days: "",
    safety_days: "",
    price_current: "",
    price_future: "",
    price_future_comment: "",
  };
}
