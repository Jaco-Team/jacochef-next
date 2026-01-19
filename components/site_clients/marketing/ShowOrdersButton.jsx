"use client";

import { Button } from "@mui/material";
import useMarketingTabStore from "./useMarketingTabStore";
import { memo } from "react";
import { useLoading } from "../useClientsLoadingContext";

function ShowOrdersButton({ orders, modalTitle }) {
  const ids = orders.map((o) => o.order_id ?? o);
  const { setIsModalOpen, setOrderIds, setSubtitle, resetFilters } = useMarketingTabStore();
  const { setIsLoading } = useLoading();

  return (
    <Button
      variant="text"
      onClick={() => {
        setIsLoading(true);
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
