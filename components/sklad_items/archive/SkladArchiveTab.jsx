"use client";

import { useEffect, useRef } from "react";

import useSkladArchiveController from "./useSkladArchiveController";

export default function SkladArchiveTab({ showAlert, refreshToken }) {
  const { entityType, loadRows, content } = useSkladArchiveController({ showAlert });
  const loadRowsRef = useRef(loadRows);

  useEffect(() => {
    loadRowsRef.current = loadRows;
  }, [loadRows]);

  useEffect(() => {
    loadRowsRef.current();
  }, [entityType, refreshToken]);

  return content;
}
