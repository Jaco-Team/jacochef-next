"use client";

import { useMemo } from "react";
import { useSkladStore } from "./useSkladStore";

const ACCESS_KEY_ALIASES = {
  units: ["ed_izmer"],
  categories: ["cats"],
  recipes: ["rec_list"],
  semi_finished: ["pf_list"],
  site_items: ["item", "tech"],
  delete: ["delete_item"],
};

const FULL_MODULE_WRITE_KEYS = [
  "units",
  "categories",
  "recipes",
  "semi_finished",
  "site_items",
  "history",
  "archive",
];

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const normalizeKey = (key) =>
      String(key || "")
        .trim()
        .replace(/-/g, "_");
    const getKeyBase = (key) => normalizeKey(key).replace(/_(access|view|edit|execute)$/, "");
    const getKeyBases = (key) => {
      const base = getKeyBase(key);
      const aliases = ACCESS_KEY_ALIASES[base] || [];
      return [base, ...aliases].filter(Boolean);
    };
    const hasFlag = (key, suffix) =>
      getKeyBases(key).some((base) => Number(access?.[`${base}_${suffix}`]) === 1);
    const hasRawFlag = (key) => getKeyBases(key).some((base) => Number(access?.[base]) === 1);
    const hasAnyFlag = (keys = [], suffixes = []) =>
      keys.some((key) => suffixes.some((suffix) => hasFlag(key, suffix)));
    const hasViewAccess = (key) =>
      hasFlag(key, "view") || hasFlag(key, "edit") || hasFlag(key, "access") || hasRawFlag(key);
    const hasWriteAccess = (key) =>
      hasFlag(key, "edit") || hasFlag(key, "access") || hasRawFlag(key);
    const hasFullModuleWriteContour = () =>
      FULL_MODULE_WRITE_KEYS.every((key) => hasViewAccess(key));
    const canAccess = (key) => hasViewAccess(key);
    const canView = (key) => canAccess(key);
    const canEdit = (key) => hasWriteAccess(key);
    const canDelete = () =>
      hasFlag("delete", "execute") ||
      hasFlag("delete", "edit") ||
      hasRawFlag("delete_execute") ||
      hasRawFlag("delete");
    const canExecute = (key) => hasFlag(key, "execute");
    const canManageProduction = (entityType) => {
      if (entityType === "recipe") {
        return (
          hasFullModuleWriteContour() ||
          hasWriteAccess("recipes") ||
          hasAnyFlag(["create_rec", "change_rec_pf"], ["edit", "access"]) ||
          hasRawFlag("create_rec")
        );
      }

      return (
        hasFullModuleWriteContour() ||
        hasWriteAccess("semi_finished") ||
        hasAnyFlag(["create_pol", "change_rec_pf"], ["edit", "access"]) ||
        hasRawFlag("create_pol")
      );
    };
    const canManageSiteItems = () =>
      hasFullModuleWriteContour() ||
      hasWriteAccess("site_items") ||
      hasAnyFlag(["create_new", "change_tag", "reload_vk"], ["edit", "access"]) ||
      hasRawFlag("create_new");
    const canManageArchivedEntity = (entityType) => {
      if (entityType === "recipe" || entityType === "semi_finished") {
        return canManageProduction(entityType);
      }

      if (entityType === "site_item") {
        return canManageSiteItems();
      }

      return false;
    };

    return {
      access,
      canView,
      canEdit,
      canAccess,
      canExecute,
      canDelete,
      canManageProduction,
      canManageSiteItems,
      canManageArchivedEntity,
    };
  }, [access]);
}
