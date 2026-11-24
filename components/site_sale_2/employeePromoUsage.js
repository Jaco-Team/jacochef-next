export function getEmployeePromoUsageStats(history = []) {
  const list = Array.isArray(history) ? history : [];

  const employeeIds = new Set();
  const pointIds = new Set();
  const promoNames = new Set();
  let lastIssuedAt = null;
  let lastIssuedRaw = "";

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  let issuedToday = 0;

  list.forEach((row) => {
    if (row?.employee_user_id != null) {
      employeeIds.add(String(row.employee_user_id));
    }

    if (row?.point_id != null && parseInt(row.point_id, 10) > 0) {
      pointIds.add(String(row.point_id));
    }

    if (row?.promo_name) {
      promoNames.add(String(row.promo_name));
    }

    if (row?.issue_date === todayKey) {
      issuedToday += 1;
    }

    if (row?.issued_at) {
      const ts = new Date(String(row.issued_at).replace(" ", "T")).getTime();
      if (!Number.isNaN(ts) && (lastIssuedAt == null || ts > lastIssuedAt)) {
        lastIssuedAt = ts;
        lastIssuedRaw = row.issued_at;
      }
    }
  });

  return {
    total: list.length,
    employees: employeeIds.size,
    points: pointIds.size,
    promos: promoNames.size,
    issuedToday,
    lastIssuedLabel: lastIssuedRaw ? formatEmployeePromoDateTime(lastIssuedRaw) : "",
  };
}

export function formatEmployeePromoDateTime(value) {
  if (!value) {
    return "—";
  }

  const raw = String(value);
  const date = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  if (raw.length <= 10) {
    return `${dd}.${mm}.${yyyy}`;
  }

  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

export function findCatalogName(catalog, id, emptyLabel = "—") {
  if (id == null || parseInt(id, 10) <= 0) {
    return emptyLabel;
  }

  const found = (catalog || []).find((item) => parseInt(item.id, 10) === parseInt(id, 10));
  return found?.name || `#${id}`;
}
