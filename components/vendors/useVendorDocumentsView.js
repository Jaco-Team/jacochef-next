"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useVendorDetailsStore from "./useVendorDetailsStore";

export default function useVendorDocumentsView() {
  const { docModalExpiresAt, docModalFile, docModalItemId, vendorItems } = useVendorDetailsStore(
    useShallow((state) => ({
      docModalExpiresAt: state.docModalExpiresAt,
      docModalFile: state.docModalFile,
      docModalItemId: state.docModalItemId,
      vendorItems: state.vendorItems || [],
    })),
  );

  const vendorItemsOptions = useMemo(
    () =>
      vendorItems.map((item) => ({
        id: String(item.item_id),
        name: item.item_name || `Товар #${item.item_id}`,
      })),
    [vendorItems],
  );

  const vendorDeclarations = useMemo(
    () =>
      vendorItems.flatMap((item) =>
        (item.declarations || []).map((decl) => ({
          ...decl,
          entry_id: `${item.item_id}-${decl.id}`,
          item_id: Number(item.item_id),
          item_name: item.item_name || `Товар #${item.item_id}`,
          nds: item.nds,
        })),
      ),
    [vendorItems],
  );

  return {
    docModalExpiresAt,
    docModalFile,
    docModalItemId,
    vendorDeclarations,
    vendorItems,
    vendorItemsOptions,
  };
}
