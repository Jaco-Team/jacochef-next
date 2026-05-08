"use client";

import { useCallback, useState } from "react";

const getOrderIds = (input) => {
  if (!input) return {};

  return {
    point_id: input.point_id,
    order_id: input.order_id,
  };
};

export default function useOrderDetailsModal({ getOrder, onError, setLoading } = {}) {
  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);

  const updateLoading = useCallback(
    (value) => {
      setLoading?.(value);
    },
    [setLoading],
  );

  const closeOrder = useCallback(() => {
    setOpen(false);
  }, []);

  const openOrder = useCallback(
    async (input) => {
      const { point_id, order_id } = getOrderIds(input);

      if (!point_id || !order_id || !getOrder) return;

      try {
        setOrder(null);
        updateLoading(true);

        const res = await getOrder({ point_id, order_id });
        if (!res?.order) {
          onError?.(res?.text || "Ошибка получения заказа");
          return;
        }

        setOrder(res);
        setOpen(true);
      } catch (error) {
        onError?.(error?.message || "Ошибка запроса заказа");
      } finally {
        updateLoading(false);
      }
    },
    [getOrder, onError, updateLoading],
  );

  return {
    open,
    order,
    openOrder,
    closeOrder,
    setOrder,
    setOpen,
  };
}
