import { formatDate } from "@/src/helpers/ui/formatDate";

export function resolvePercentSaleId(promo_sale_list, percent) {
  if (!promo_sale_list?.length) {
    return 1;
  }

  const exact = promo_sale_list.find((item) => parseInt(item.name, 10) === percent);
  if (exact) {
    return exact.id;
  }

  const sorted = [...promo_sale_list].sort(
    (a, b) => Math.abs(parseInt(a.name, 10) - percent) - Math.abs(parseInt(b.name, 10) - percent),
  );

  return sorted[0]?.id ?? promo_sale_list[0].id;
}

function getDatePromoFields(datePromo) {
  const thisDay = new Date();
  const nextDay = new Date();

  if (datePromo === 2 || datePromo === 3) {
    nextDay.setDate(nextDay.getDate() + 14);

    return {
      date_promo: datePromo,
      rangeDate: [formatDate(thisDay), formatDate(nextDay)],
      date_start: formatDate(thisDay),
      date_end: formatDate(nextDay),
      time_start: datePromo === 2 ? "10:00" : "00:00",
      time_end: datePromo === 2 ? "21:40" : "23:59",
    };
  }

  if (datePromo === 4 || datePromo === 5) {
    nextDay.setDate(nextDay.getDate() + 30);

    return {
      date_promo: datePromo,
      rangeDate: [formatDate(thisDay), formatDate(nextDay)],
      date_start: formatDate(thisDay),
      date_end: formatDate(nextDay),
      time_start: datePromo === 4 ? "10:00" : "00:00",
      time_end: datePromo === 4 ? "21:40" : "23:59",
    };
  }

  return {
    date_promo: 1,
    date_start: formatDate(thisDay),
    date_end: formatDate(thisDay),
    rangeDate: [formatDate(thisDay), formatDate(thisDay)],
    time_start: "10:00",
    time_end: "21:30",
  };
}

function baseDiscountPatch(state, { percent, datePromo = 2, extra = {} } = {}) {
  return {
    promo_action: 1,
    type_sale: 3,
    sale_type: 2,
    promo_sale: resolvePercentSaleId(state.promo_sale_list, percent),
    promo_conditions: 2,
    price_start: 0,
    price_end: 0,
    type_order: 1,
    where_order: 1,
    city: 0,
    point: 0,
    for_new: false,
    once_number: false,
    for_registred: false,
    for_number: false,
    for_number_text: "",
    where_promo: 1,
    generate_new: false,
    count_action: 1,
    promo_count: 1,
    saleItem: [],
    saleCat: [],
    itemsAdd: [],
    itemsAddPrice: [],
    conditionItems: [],
    conditionCat: [],
    testDate: [],
    day_1: true,
    day_2: true,
    day_3: true,
    day_4: true,
    day_5: true,
    day_6: true,
    day_7: true,
    auto_text: true,
    ...getDatePromoFields(datePromo),
    ...extra,
  };
}

export const PROMO_PRESETS = [
  {
    id: "menu_20",
    label: "Скидка 20% на меню",
    description: "30 дней, 10:00–21:40",
    build: (state) => baseDiscountPatch(state, { percent: 20, datePromo: 4 }),
  },
  {
    id: "menu_10",
    label: "Скидка 10% на меню",
    description: "14 дней, 10:00–21:40",
    build: (state) => baseDiscountPatch(state, { percent: 10, datePromo: 2 }),
  },
  {
    id: "first_order_20",
    label: "20% на первый заказ",
    description: "Для новых клиентов, 30 дней",
    build: (state) =>
      baseDiscountPatch(state, {
        percent: 20,
        datePromo: 4,
        extra: { for_new: true, type_sale: 7 },
      }),
  },
  {
    id: "registered_10",
    label: "10% зарегистрированным",
    description: "Только зарегистрированные клиенты, 30 дней",
    build: (state) =>
      baseDiscountPatch(state, {
        percent: 10,
        datePromo: 4,
        extra: { for_registred: true, type_sale: 7 },
      }),
  },
  {
    id: "gift_for_one",
    label: "Подарок за 1 ₽",
    description: "Выберите позицию — 1 штука за 1 ₽",
    build: (state) =>
      baseDiscountPatch(state, {
        percent: 10,
        datePromo: 4,
        extra: {
          promo_action: 2,
          addItem: null,
          addItemCount: 1,
          addItemPrice: 1,
          addItemAllPrice: 0,
          itemsAdd: [],
          itemsAddPrice: [],
          priceItem: null,
        },
      }),
  },
  {
    id: "fixed_price",
    label: "Позиции по фиксированной цене",
    description: "Выберите позиции и укажите цену каждой",
    build: (state) =>
      baseDiscountPatch(state, {
        percent: 10,
        datePromo: 4,
        extra: {
          promo_action: 3,
          addItem: null,
          addItemCount: 1,
          addItemPrice: 1,
          addItemAllPrice: 0,
          itemsAdd: [],
          itemsAddPrice: [],
          priceItem: null,
        },
      }),
  },
];

export function getPresetPatch(presetId, state) {
  const preset = PROMO_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    return null;
  }

  return {
    ...preset.build(state),
    activePresetId: presetId,
  };
}
