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
      canUpload: userCan("access", "upload"),
    };
  }, [access]);
}
