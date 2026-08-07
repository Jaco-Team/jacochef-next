"use client";

import { useMemo } from "react";
import { useSkladStore } from "./useSkladStore";

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const canEdit = (group) => Number(access?.[`${group}_edit`]) === 1;
    const canView = (group) => Number(access?.[`${group}_view`]) === 1 || canEdit(group);
    const canAccess = (action) => Number(access?.[action]) === 1;

    return {
      access,
      canView,
      canEdit,
      canAccess,
      canViewUnitUsage: canView("units"),
      canViewHistory: Number(access?.history_view) === 1,
      canCreateUnit: canAccess("units_create"),
      canArchive: canView("archive"),
      canCreateProduction: canAccess("production_create"),
      canManageProduction: canEdit("production"),
      canManageSiteItems: canEdit("site_items"),
      canCreateSiteItem: canAccess("site_items_create"),
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
      canManageArchivedEntity: canEdit("archive"),
    };
  }, [access]);
}
