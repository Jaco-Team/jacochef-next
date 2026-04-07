"use client";

import { useMemo } from "react";
import useVendorDetailsStore from "./useVendorDetailsStore";
import { formatMoney } from "./vendorFormUtils";

export default function useVendorOverviewView() {
  const vendor = useVendorDetailsStore((state) => state.vendor);

  const overviewCards = useMemo(
    () =>
      vendor
        ? [
            {
              id: "main",
              title: "Основное",
              rows: [
                { label: "Наименование", value: vendor.name },
                { label: "Описание", value: vendor.text },
                { label: "Мин. сумма заказа", value: formatMoney(vendor.min_price) },
              ],
            },
            {
              id: "requisites",
              title: "Реквизиты",
              rows: [
                { label: "ИНН", value: vendor.inn },
                { label: "ОГРН", value: vendor.ogrn },
                { label: "Расчетный счет", value: vendor.rc },
                { label: "БИК", value: vendor.bik },
                { label: "Юридический адрес", value: vendor.addr },
              ],
            },
          ]
        : [],
    [vendor],
  );

  const overviewCardsMap = useMemo(
    () =>
      overviewCards.reduce((acc, card) => {
        acc[card.id] = card;
        return acc;
      }, {}),
    [overviewCards],
  );

  return { overviewCards, overviewCardsMap, vendor };
}
