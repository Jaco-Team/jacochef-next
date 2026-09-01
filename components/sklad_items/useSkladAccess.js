"use client";

import { useMemo } from "react";
import { useSkladStore } from "./useSkladStore";

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const canEdit = (group) => Number(access?.[`${group}_edit`]) === 1;
    const canView = (group) => Number(access?.[`${group}_view`]) === 1 || canEdit(group);
    const canAccess = (action) => Number(access?.[action]) === 1;

    const canViewProductionHistory = canView("production");
    const canViewSiteItemsHistory = canView("site_items");
    const canViewUnitsHistory = canView("units");
    const canArchiveProduction = canEdit("production_activity");
    const canArchiveSiteItems = canEdit("site_items_activity");

    return {
      access,
      canView,
      canEdit,
      canAccess,
      canViewUnitUsage: canView("units"),
      canViewHistory: canViewProductionHistory || canViewSiteItemsHistory || canViewUnitsHistory,
      canViewProductionHistory,
      canViewSiteItemsHistory,
      canViewUnitsHistory,
      canCreateUnit: canAccess("units_create"),
      canArchive: canArchiveProduction || canArchiveSiteItems,
      canArchiveProduction,
      canArchiveSiteItems,
      canCreateProduction: canAccess("production_create"),
      canUseProductionPastDate: canAccess("production_past_date"),
      canManageProduction: canEdit("production"),
      canConvertProduction: canAccess("production_convert"),
      canManageSiteItems: canEdit("site_items"),
      canCreateSiteItem: canAccess("site_items_create"),
      canUseSiteItemPastDate: canAccess("site_items_past_date"),
      canDelete: (entityType) => {
        if (entityType === "recipe" || entityType === "semi_finished") {
          return canAccess("production_delete");
        }

        if (entityType === "site_item") {
          return canAccess("site_items_delete");
        }

        if (entityType === "unit") {
          return canAccess("units_delete");
        }

        return false;
      },
      canManageArchivedEntity: canArchiveProduction || canArchiveSiteItems,
    };
  }, [access]);
}
