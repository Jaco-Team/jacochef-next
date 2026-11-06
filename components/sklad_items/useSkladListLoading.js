"use client";

import { useLayoutEffect } from "react";
import { useSkladStore } from "./useSkladStore";

export default function useSkladListLoading(section) {
  const beginListLoad = useSkladStore((state) => state.beginListLoad);
  const finishListLoad = useSkladStore((state) => state.finishListLoad);

  useLayoutEffect(() => {
    beginListLoad(section);
    // Invalidate outstanding requests and show the loader on the next mount.
    return () => {
      beginListLoad(section);
    };
  }, [beginListLoad, section]);

  return { beginListLoad, finishListLoad };
}
