"use client";

import { useMemo } from "react";
import useVendorDetailsStore from "./useVendorDetailsStore";

export default function useVendorProductsView() {
  const vendorItems = useVendorDetailsStore((state) => state.vendorItems || []);
  const allItems = useVendorDetailsStore((state) => state.allItems || []);

  const sortedVendorItems = useMemo(
    () => [...vendorItems].sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0)),
    [vendorItems],
  );

  const vendorItemIds = useMemo(
    () => new Set(vendorItems.map((item) => Number(item.item_id))),
    [vendorItems],
  );

  const itemsSelectData = useMemo(
    () =>
      allItems
        .filter((item) => !vendorItemIds.has(Number(item.id)))
        .map((item) => ({
          id: String(item.id),
          name: item.cat_name
            ? `${item.name || `Товар #${item.id}`} · ${item.cat_name}`
            : item.name || `Товар #${item.id}`,
        })),
    [allItems, vendorItemIds],
  );

  const productCategoryOptions = useMemo(() => {
    const categoriesMap = new Map();

    vendorItems.forEach((item) => {
      const categoryId = Number(item.cat_id);

      if (!categoryId || categoriesMap.has(categoryId)) {
        return;
      }

      categoriesMap.set(categoryId, {
        id: String(categoryId),
        name: item.cat_name || `Категория #${categoryId}`,
      });
    });

    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [vendorItems]);

  return {
    itemsSelectData,
    productCategoryOptions,
    sortedVendorItems,
    vendorItemIds,
  };
}
