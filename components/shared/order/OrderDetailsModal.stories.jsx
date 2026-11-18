import { useState } from "react";
import { Box } from "@mui/material";

import { JacoButton } from "@/design-system/shared/ui";

import OrderDetailsModal from "./OrderDetailsModal";

const order = {
  order: {
    order_id: 990001,
    type_order: "Доставка",
    type_order_: 1,
    type_order_addr_new: "Ленинградская 47",
    time_order_name: "Оформлен",
    time_order: "06.10.2026 14:55",
    time_to_client: "15:40",
    text_time: "Доставка до ",
    time: "15:55",
    number: "+7 900 000-00-00",
    sum_order: 880,
    comment: "Позвонить за пять минут",
    fake_dom: 1,
    promo_name: "LOCAL-E2E-990001",
    promo_text: "Промокод для решения жалобы",
  },
  order_items: [
    { id: 1, name: "Филадельфия запечённый унаги", count: 1, price: 620 },
    { id: 2, name: "Соус", count: 2, price: 130 },
    { id: -1, name: "Доставка", count: 1, price: 130 },
  ],
};

const meta = {
  title: "Chef Design System/Shared UI/OrderDetailsModal",
  component: OrderDetailsModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Единое адаптивное read-only представление заказа для модулей Chef.",
      },
    },
  },
};

export default meta;

export function Default() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ minHeight: "100vh", p: 4 }}>
      <JacoButton onClick={() => setOpen(true)}>Открыть заказ</JacoButton>
      <OrderDetailsModal
        open={open}
        onClose={() => setOpen(false)}
        order={order}
      />
    </Box>
  );
}

export function WithoutDeliveryDetails() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ minHeight: "100vh", p: 4 }}>
      <JacoButton onClick={() => setOpen(true)}>Открыть заказ</JacoButton>
      <OrderDetailsModal
        open={open}
        onClose={() => setOpen(false)}
        order={order}
        hideDeliveryDetails
      />
    </Box>
  );
}
