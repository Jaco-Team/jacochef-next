"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useVendorDetailsStore from "./useVendorDetailsStore";

export default function useVendorDocumentsView() {
  const { allDeclarations, bindDeclarationId, docModalFile, docModalItemId, vendorItems } =
    useVendorDetailsStore(
      useShallow((state) => ({
        allDeclarations: state.allDeclarations || [],
        bindDeclarationId: state.bindDeclarationId,
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

  const availableDeclarationsForBind = useMemo(() => {
    const modalVendorItem = vendorItems.find(
      (item) => Number(item.item_id) === Number(docModalItemId),
    );
    const boundIds = new Set((modalVendorItem?.declarations || []).map((decl) => Number(decl.id)));

    return allDeclarations
      .filter((decl) => decl?.id && !boundIds.has(Number(decl.id)))
      .map((decl) => ({
        ...decl,
        name: `${decl.filename?.split("/")?.pop() || "Декларация"}${
          decl.created_at ? ` · ${decl.created_at}` : ""
        }`,
      }));
  }, [allDeclarations, docModalItemId, vendorItems]);

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
    availableDeclarationsForBind,
    bindDeclarationId,
    docModalFile,
    docModalItemId,
    vendorDeclarations,
    vendorItems,
    vendorItemsOptions,
  };
}
