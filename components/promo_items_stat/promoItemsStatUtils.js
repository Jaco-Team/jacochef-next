import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";

export function getDefaultPromoItemsStatState() {
  const today = formatDate(new Date());
  const weekAgo = dayjs().subtract(7, "day");

  return {
    module: "promo_items_stat",
    moduleName: "",
    isLoad: false,
    isBootstrapLoaded: false,
    tab: 0,
    pointList: [],
    selectedPoints: [],
    date_start: weekAgo,
    date_end: today,
    stats: [],
    promoTable: [],
    promoTablePagination: {
      page: 0,
      perpage: 50,
      total: 0,
      total_pages: 0,
    },
    selectedItems: [],
    itemList: [],
    promoList: [],
    promoListRequestKey: null,
    selectedPromos: [],
    typeOrderList: [],
    typeOrder: null,
    clientSourceList: [],
    selectedClientSources: [],
    activationsRange: { min: null, max: null },
    activationsFilter: { from: null, to: null },
  };
}

export function buildPromoItemsStatPayload(filters, options = {}) {
  const point_ids = Array.isArray(filters.selectedPoints)
    ? filters.selectedPoints.map((item) => item?.id).filter((id) => id !== undefined && id !== null)
    : [];

  const promo_ids = Array.isArray(filters.selectedPromos)
    ? filters.selectedPromos
        .flatMap((item) => (Array.isArray(item?.promo_ids) ? item.promo_ids : []))
        .filter((id) => id !== undefined && id !== null)
    : [];

  const item_ids = Array.isArray(filters.selectedItems)
    ? filters.selectedItems.map((item) => item?.id).filter((id) => id !== undefined && id !== null)
    : [];

  const client_sources = Array.isArray(filters.selectedClientSources)
    ? filters.selectedClientSources
        .map((item) => item?.id)
        .filter((id) => id !== undefined && id !== null)
    : [];

  const payload = {
    point_ids,
    date_start: filters.date_start ? dayjs(filters.date_start).format("YYYY-MM-DD") : null,
    date_end: filters.date_end ? dayjs(filters.date_end).format("YYYY-MM-DD") : null,
    promo_ids,
    item_ids,
    client_sources,
  };

  payload[options.typeOrderKey || "type_order"] = filters.typeOrder ?? null;

  if (filters.page !== undefined) {
    payload.page = filters.page;
  }

  if (filters.perpage !== undefined) {
    payload.perpage = filters.perpage;
  }

  const activationFrom = filters.activationsFilter?.from;
  const activationTo = filters.activationsFilter?.to;

  const activationFromValue = Number(activationFrom);
  const activationToValue = Number(activationTo);

  if (
    activationFrom !== undefined &&
    activationFrom !== null &&
    activationFrom !== "" &&
    Number.isFinite(activationFromValue)
  ) {
    payload.activations = {
      ...(payload.activations || {}),
      from: activationFromValue,
    };
  }

  if (
    activationTo !== undefined &&
    activationTo !== null &&
    activationTo !== "" &&
    Number.isFinite(activationToValue)
  ) {
    payload.activations = {
      ...(payload.activations || {}),
      to: activationToValue,
    };
  }

  return payload;
}

export function formatPromoItemsSum(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value || 0)} ₽`;
}

export function formatPromoItemsPercent(value) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value || 0)}%`;
}
