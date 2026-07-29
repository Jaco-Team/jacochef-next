"use client";

import { useMemo } from "react";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import { useSkladStore } from "./useSkladStore";

const PRODUCTION_WRITE_KEYS = [
  "name",
  "shelf_life",
  "date_start",
  "date_end",
  "time",
  "dop_time",
  "rec_apps",
  "storages",
  "items",
  "allergens",
  "allergens_diff",
  "structure",
  "cats",
  "ed_izmer",
  "show_in_rev",
  "two_user",
  "is_show",
];

const SITE_ITEM_WRITE_KEYS = [
  "create_new",
  "is_show",
  "show_in_order",
  "honest_sign",
  "tmp_desc",
  "marc_desc",
  "marc_desc_full",
  "show_program",
  "is_new",
  "show_site",
  "is_hit",
  "dropzone",
  "category_id",
  "count_part",
  "stol",
  "weight",
  "protein",
  "fat",
  "carbohydrates",
  "time_stage_1",
  "time_stage_2",
  "time_stage_3",
  "change_tag",
  "reload_vk",
  "short_name",
  "marc",
  "stage",
  "items",
];

function canAny(accessApi, action, keys) {
  return keys.some((key) => accessApi.userCan(action, key));
}

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const accessApi = handleUserAccess(access);
    const canView = (key) => accessApi.userCan("view", key);
    const canEdit = (key) => accessApi.userCan("edit", key);
    const canAccess = (key) => accessApi.userCan("access", key);
    const canViewProductionHistory = () => canView("production_history_view");
    const canViewSiteItemHistory = () => canView("site_item_history_view");
    const canViewUnitHistory = () => canView("unit_history_view");
    const canViewUnitUsage = () => canView("unit_usage_view");
    const canCreateUnit = () => canAccess("unit_create_access");
    const canCreateCategory = () => canAccess("category_create_access");
    const canArchive = () => canView("archive_list_view");
    const canCreateProduction = (entityType) =>
      entityType === "recipe" ? canEdit("create_rec") : canEdit("create_pol");
    const canManageProduction = (entityType) =>
      canCreateProduction(entityType) ||
      canEdit("change_rec_pf") ||
      canAny(accessApi, "edit", PRODUCTION_WRITE_KEYS);
    const canManageSiteItems = () => canAny(accessApi, "edit", SITE_ITEM_WRITE_KEYS);
    const canDelete = () => Number(access?.delete_execute) === 1;
    const canManageArchivedEntity = (entityType) => {
      if (entityType === "recipe" || entityType === "semi_finished") {
        return canEdit("is_show") || canManageProduction(entityType);
      }

      if (entityType === "site_item") {
        return canEdit("is_show") || canManageSiteItems();
      }

      return false;
    };

    return {
      access,
      accessApi,
      canView,
      canEdit,
      canAccess,
      canViewProductionHistory,
      canViewSiteItemHistory,
      canViewUnitHistory,
      canViewUnitUsage,
      canCreateUnit,
      canCreateCategory,
      canArchive,
      canCreateProduction,
      canDelete,
      canManageProduction,
      canManageSiteItems,
      canManageArchivedEntity,
    };
  }, [access]);
}
