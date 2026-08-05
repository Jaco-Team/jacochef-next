"use client";

import ModalOrderWithFeedback from "@/components/site_clients/ModalOrderWithFeedback";
import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";

export default function OrdersExtendedOrderModal({
  orderModal,
  canSendFeedback,
  getData,
  showAlert,
  onClose,
  onOpenOrder,
}) {
  if (!orderModal.open || !orderModal.order) {
    return null;
  }

  if (canSendFeedback) {
    return (
      <ModalOrderWithFeedback
        open={orderModal.open}
        onClose={onClose}
        order={orderModal.order}
        getData={getData}
        showAlert={showAlert}
        openOrder={(pointId, orderId) => onOpenOrder(pointId, orderId, orderModal.row)}
      />
    );
  }

  return (
    <OrderDetailsModal
      open={orderModal.open}
      onClose={onClose}
      order={orderModal.order}
    />
  );
}
