import dayjs from "dayjs";

export const ORDER_POST_MODULE = "order_post_2";

export const KIND_VENDOR = "vendor";
export const KIND_COPY = "copy";

const STATUS_TONES = {
  0: { tone: "neutral", variant: "outlined" },
  1: { tone: "warning", variant: "soft" },
  2: { tone: "success", variant: "soft" },
  3: { tone: "warning", variant: "filled" },
  4: { tone: "danger", variant: "filled" },
  5: { tone: "neutral", variant: "soft" },
};

const DATE_FORMAT = "YYYY-MM-DD";

export function getStatusChipProps(status) {
  return STATUS_TONES[Number(status)] ?? { tone: "neutral", variant: "soft" };
}

export function toDateParam(value) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : "";
}

export function isPeriodValid(dateStart, dateEnd) {
  if (!dateStart || !dateEnd) {
    return false;
  }

  return !dayjs(dateEnd).isBefore(dayjs(dateStart), "day");
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : "—";
}

export function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : "—";
}

/** Status counters over the given rows; always contains every known status, zeros included. */
export function buildStatusCounts(rows, statuses) {
  const counts = new Map(statuses.map((status) => [Number(status.id), 0]));

  rows.forEach((row) => {
    const key = Number(row.status);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return statuses.map((status) => ({
    id: Number(status.id),
    name: status.name,
    count: counts.get(Number(status.id)) ?? 0,
  }));
}

/** Groups rows by vendor_id keeping the incoming row order (task_date desc, id desc). */
export function groupRowsByVendor(rows) {
  const groups = new Map();

  rows.forEach((row) => {
    const key = String(row.vendor_id);
    const group = groups.get(key) ?? {
      key,
      vendor_id: row.vendor_id,
      vendor_name: row.vendor_name,
      rows: [],
    };

    group.rows.push(row);
    groups.set(key, group);
  });

  return Array.from(groups.values()).sort((first, second) =>
    String(first.vendor_name ?? "").localeCompare(String(second.vendor_name ?? ""), "ru"),
  );
}

export function hasEmailChanged(row) {
  return Boolean(row.email_original) && row.email_original !== row.email_sent;
}
