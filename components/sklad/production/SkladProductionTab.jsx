"use client";

import { useEffect } from "react";
import useSkladProductionController from "./useSkladProductionController";

export default function SkladProductionTab({ showAlert, refreshToken }) {
  const { entityType, search, categoryId, archiveMode, loadRows, content } =
    useSkladProductionController({ showAlert });

  useEffect(() => {
    loadRows();
  }, [refreshToken, entityType, search, categoryId, archiveMode]);

  return content;
}
