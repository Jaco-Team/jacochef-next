"use client";

import { useMemo } from "react";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import useVendorsStore from "./useVendorsStore";

export default function useVendorAccess() {
  const access = useVendorsStore((state) => state.access);

  return useMemo(() => {
    const { userCan } = handleUserAccess(access);

    return {
      canEdit: userCan("access", "edit"),
      canDeleteDeclaration: userCan("access", "delete_declaration"),
      canEditDeclaration: userCan("access", "edit_declaration"),
      canEditСost: userCan("access", "cost_change"),
      canUpload: userCan("access", "upload"),
    };
  }, [access]);
}
