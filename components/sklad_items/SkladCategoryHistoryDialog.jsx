"use client";

import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { JacoButton, JacoModal } from "@/design-system/shared/ui";
import HistoryLog from "@/ui/history/HistoryLog";
import useSkladApi from "./useSkladApi";

export default function SkladCategoryHistoryDialog({ category, onClose }) {
  const api = useSkladApi();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: "", loading: false, error: "", rows: [] });
  const id = category?.id;
  const sourceType = category?.source_type;
  const key = `${sourceType}:${id}`;

  useEffect(() => {
    if (!id || !sourceType) return;
    let cancelled = false;
    setState({ key, loading: true, error: "", rows: [] });
    api
      .getCategoryHistory(sourceType, id)
      .then((response) => {
        if (!response?.st || !Array.isArray(response.history))
          throw new Error(response?.text || "Ошибка загрузки истории");
        if (!cancelled) setState({ key, loading: false, error: "", rows: response.history });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            key,
            loading: false,
            error: error?.message || "Ошибка загрузки истории",
            rows: [],
          });
      });
    return () => {
      cancelled = true;
    };
  }, [api, id, sourceType, key, attempt]);

  return (
    <JacoModal
      open={Boolean(category)}
      onClose={onClose}
      title={`История категории: ${category?.name || ""}`}
      maxWidth="md"
    >
      {state.loading || state.key !== key ? (
        <Typography role="status">Загрузка истории…</Typography>
      ) : state.error ? (
        <>
          <Typography color="error">{state.error}</Typography>
          <JacoButton
            tone="secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Повторить
          </JacoButton>
        </>
      ) : (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            События до подключения истории могут отсутствовать.
          </Typography>
          <HistoryLog
            history={state.rows}
            defaultExpanded
          />
        </>
      )}
    </JacoModal>
  );
}
