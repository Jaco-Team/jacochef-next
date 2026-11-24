import { toArray } from "./staffScheduleHelpers";

export function buildOrderErrorModalData(response) {
  return {
    type: "order",
    title: response?.order_id ? `Ошибка по заказу №${response.order_id}` : "Ошибка по заказу",
    orderId: response?.order_id ?? "",
    errId: response?.err_id ?? response?.id ?? "",
    rowId: response?.row_id ?? "",
    orderDesc: response?.order_desc ?? "",
    dateTime: response?.date_time_order ?? "",
    itemName: response?.item_name ?? "",
    errorName: response?.pr_name ?? response?.err_name ?? "",
    price: response?.my_price ?? response?.price ?? "",
    newOrderId: response?.new_order_id ?? 0,
    canEdit: Number(response?.is_edit) === 1,
    appealText: response?.new_text_1 ?? "",
    appealAnswer: response?.new_text_2 ?? "",
    images: toArray(response?.imgs).map((item) => ({
      id: item,
      url: `https://jacochef.ru/src/img/err_orders/uploads/${item}`,
    })),
    raw: response,
  };
}

export function buildCamErrorModalData(response) {
  return {
    type: "cam",
    title: response?.id ? `Ошибка №${response.id}` : "Ошибка камеры",
    id: response?.id ?? "",
    errorName: response?.fine_name ?? "",
    dateTime: response?.date_time_fine ?? "",
    comment: response?.comment ?? "",
    price: response?.price ?? "",
    canEdit: Number(response?.is_edit) === 1,
    appealText: response?.text_one ?? "",
    appealAnswer: response?.text_two ?? "",
    images: toArray(response?.imgs).map((item) => ({
      id: item,
      url: `https://jacochef.ru/src/img/fine_err/uploads/${item}`,
    })),
    raw: response,
  };
}
