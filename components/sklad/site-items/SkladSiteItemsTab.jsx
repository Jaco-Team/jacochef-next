"use client";

import { useEffect } from "react";
import useSkladSiteItemsController from "./useSkladSiteItemsController";

export default function SkladSiteItemsTab({ showAlert, refreshToken }) {
  const { search, categoryId, tagId, archiveMode, loadRows, content } = useSkladSiteItemsController(
    { showAlert },
  );

  useEffect(() => {
    loadRows();
  }, [refreshToken, search, categoryId, tagId, archiveMode]);

  return content;
}
