"use client";

import { useEffect, useRef } from "react";
import useSkladSiteItemsController from "./useSkladSiteItemsController";

export default function SkladSiteItemsTab({ showAlert, refreshToken }) {
  const { search, categoryId, tagId, archiveMode, loadRows, content } = useSkladSiteItemsController(
    { showAlert },
  );

  const loadRowsRef = useRef(loadRows);

  useEffect(() => {
    loadRowsRef.current = loadRows;
  }, [loadRows]);

  useEffect(() => {
    loadRowsRef.current({ resetPage: true });
  }, [archiveMode, categoryId, search, tagId]);

  useEffect(() => {
    loadRowsRef.current();
  }, [refreshToken]);

  return content;
}
