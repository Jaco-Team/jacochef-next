"use client";

import { useEffect } from "react";
import useSkladProductionController from "./useSkladProductionController";

export default function SkladProductionTab({ showAlert, refreshToken }) {
  const { loadRows, content } = useSkladProductionController({ showAlert });

  useEffect(() => {
    loadRows();
  }, [loadRows, refreshToken]);

  return content;
}
