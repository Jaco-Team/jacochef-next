"use client";

import { useEffect } from "react";
import useSkladCategoriesController from "./useSkladCategoriesController";

export default function SkladCategoriesTab({ showAlert, refreshToken }) {
  const { loadCategories, content } = useSkladCategoriesController({ showAlert });

  useEffect(() => {
    loadCategories();
  }, [refreshToken]);

  return content;
}
