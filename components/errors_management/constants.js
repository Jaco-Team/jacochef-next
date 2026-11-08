import dayjs from "dayjs";

export const MODULE_NAME = "errors_management";

export const DEFAULT_FILTERS = {
  cityId: "",
  pointId: "",
  orderNumber: "",
  phone: "",
  amountFrom: "",
  amountTo: "",
  orderType: "",
  orderSource: "",
  orderStages: [],
  complaintStatuses: [],
  // Temporary default: keep local stale data queries bounded to the latest seven days.
  dateFrom: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  dateTo: dayjs().format("YYYY-MM-DD"),
};

export const ORDER_TYPE_OPTIONS = [
  { id: "1", name: "Доставка" },
  { id: "2", name: "Самовывоз" },
  { id: "3", name: "Зал" },
  { id: "4", name: "Зал с собой" },
];

export const rootSx = { pb: 3 };
export const filterSx = {
  p: { xs: 2, md: 2.5 },
  "& .MuiOutlinedInput-notchedOutline legend > span, & .MuiPickersOutlinedInput-notchedOutline legend > span":
    {
      fontSize: "12px !important",
      lineHeight: "18px !important",
    },
};
export const titleSx = { fontSize: { xs: 26, md: 32 }, fontWeight: 700, lineHeight: 1.2 };

export const ORDER_STAGE_OPTIONS = [
  { id: "1", name: "В очереди" },
  { id: "2", name: "Готовится" },
  { id: "3", name: "Готов на кухне" },
  { id: "4", name: "Собран" },
  { id: "5", name: "В пути" },
  { id: "6", name: "У клиента" },
];

export const COMPLAINT_STATUS_OPTIONS = [
  { id: "draft", name: "Черновик" },
  { id: "registered", name: "В решении" },
  { id: "sent_to_cafe", name: "Отправлена в кафе" },
  { id: "accepted_by_cafe", name: "Принята кафе" },
  { id: "resolved", name: "Решена" },
  { id: "cancelled", name: "Отменена" },
];
