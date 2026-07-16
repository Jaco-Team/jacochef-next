"use client";

import { useMemo } from "react";
import { useSkladStore } from "./useSkladStore";

export default function useSkladAccess() {
  const access = useSkladStore((state) => state.access);

  return useMemo(() => {
    const canView = (key) => Number(access?.[`${key}_view`]) === 1;
    const canEdit = (key) => Number(access?.[`${key}_edit`]) === 1;
    const canExecute = (key) => Number(access?.[`${key}_execute`]) === 1;

    return {
      access,
      canView,
      canEdit,
      canExecute,
    };
  }, [access]);
}
