"use client";

import { useMemo } from "react";
import { useSkladStore } from "./useSkladStore";

function isGranted(access, key) {
  return Number(access?.[key]) === 1 || access?.[key] === true;
}

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const canEdit = (group) => isGranted(access, `${group}_edit`);
    const canView = (group) => isGranted(access, `${group}_view`) || canEdit(group);
    const canAccess = (action) => isGranted(access, action);

    return {
      access,
      canView,
      canEdit,
      canAccess,
      canViewUnitUsage: () => canView("units"),
      canCreateUnit: () => canAccess("units_create"),
      canArchive: () => canView("archive"),
      canCreateProduction: () => canAccess("production_create"),
      canManageProduction: () => canEdit("production"),
      canManageSiteItems: () => canEdit("site_items"),
      canCreateSiteItem: () => canAccess("site_items_create"),
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
      canManageArchivedEntity: () => canEdit("archive"),
    };
  }, [access]);
}
