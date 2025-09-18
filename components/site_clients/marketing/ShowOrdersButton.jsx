"use client";

import { Button } from "@mui/material";
import useMarketingTabStore from "./useMarketingTabStore";
import { memo } from "react";

function ShowOrdersButton({ orders, modalTitle }) {
  const ids = orders.map((o) => o.order_id);
  const { setIsModalOpen, setOrderIds, setSubtitle, resetFilters } = useMarketingTabStore();
  return (
    <Button
      variant="text"
      onClick={() => {
        resetFilters();
        setOrderIds(ids);
        setSubtitle(modalTitle);
        setIsModalOpen(true);
      }}
      disabled={!ids?.length}
    >
      {ids.length}
    </Button>
  );
}
export default memo(ShowOrdersButton);
