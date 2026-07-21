"use client";

import { useEffect, useRef } from "react";
import useSkladHistoryController from "./useSkladHistoryController";

export default function SkladHistoryTab({ showAlert, refreshToken }) {
  const { entityType, entityId, loadRows, content } = useSkladHistoryController({ showAlert });
  const loadRowsRef = useRef(loadRows);

  useEffect(() => {
    loadRowsRef.current = loadRows;
  }, [loadRows]);

  useEffect(() => {
    if (!entityId) {
      return;
    }

    loadRowsRef.current();
  }, [entityId, entityType, refreshToken]);

  return content;
}
