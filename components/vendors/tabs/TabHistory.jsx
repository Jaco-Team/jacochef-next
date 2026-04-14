"use client";

import { useMemo } from "react";
import HistoryLog from "@/ui/history/HistoryLog";
import useVendorDetailsStore from "../useVendorDetailsStore";
import { normalizeVendorHistory } from "../vendorHistory";

export default function TabHistory() {
  const history = useVendorDetailsStore((state) => state.history || []);
  const vendorItems = useVendorDetailsStore((state) => state.vendorItems || []);
  const normalizedHistory = useMemo(
    () => normalizeVendorHistory(history, vendorItems),
    [history, vendorItems],
  );

  return (
    <HistoryLog
      history={normalizedHistory}
      defaultExpanded
    />
  );
}
