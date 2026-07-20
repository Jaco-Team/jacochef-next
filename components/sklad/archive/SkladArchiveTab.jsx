"use client";

import { useEffect } from "react";

import useSkladArchiveController from "./useSkladArchiveController";

export default function SkladArchiveTab({ showAlert, refreshToken }) {
  const { entityType, loadRows, content } = useSkladArchiveController({ showAlert });

  useEffect(() => {
    loadRows();
  }, [refreshToken, entityType]);

  return content;
}
