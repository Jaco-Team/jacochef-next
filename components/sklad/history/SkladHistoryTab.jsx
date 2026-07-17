"use client";

import { useEffect } from "react";
import useSkladHistoryController from "./useSkladHistoryController";

export default function SkladHistoryTab({ showAlert, refreshToken }) {
  const { entityType, entityId, loadRows, content } = useSkladHistoryController({ showAlert });

  useEffect(() => {
    if (!entityId) {
      return;
    }

    loadRows();
  }, [refreshToken, entityType, entityId, loadRows]);

  return content;
}
