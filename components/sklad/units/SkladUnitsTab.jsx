"use client";

import { useEffect } from "react";
import useSkladUnitsController from "./useSkladUnitsController";

export default function SkladUnitsTab({ showAlert, refreshToken }) {
  const { loadUnits, content } = useSkladUnitsController({ showAlert });

  useEffect(() => {
    loadUnits();
  }, [loadUnits, refreshToken]);

  return content;
}
