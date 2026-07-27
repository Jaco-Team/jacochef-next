"use client";

import { useEffect, useRef } from "react";
import useSkladProductionController from "./useSkladProductionController";

export default function SkladProductionTab({ showAlert, refreshToken }) {
  const { search, categoryId, archiveMode, loadRows, content } = useSkladProductionController({
    showAlert,
  });

  const loadRowsRef = useRef(loadRows);

  useEffect(() => {
    loadRowsRef.current = loadRows;
  }, [loadRows]);

  useEffect(() => {
    loadRowsRef.current({ resetPage: true });
  }, [archiveMode, categoryId, search]);

  useEffect(() => {
    loadRowsRef.current();
  }, [refreshToken]);

  return content;
}
