"use client";

import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";

export default function OrdersExtendedOrderModal({ orderModal, onClose }) {
  if (!orderModal.open || !orderModal.order) {
    return null;
  }

  return (
    <OrderDetailsModal
      open={orderModal.open}
      onClose={onClose}
      order={orderModal.order}
    />
  );
}
