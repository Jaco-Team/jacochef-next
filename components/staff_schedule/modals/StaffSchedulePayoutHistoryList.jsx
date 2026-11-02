import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { uiColors } from "@/design-system/shared/ui";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";
import { formatPayoutHistoryChange, formatPayoutHistoryDate } from "../staffSchedulePayoutHistory.mjs";

const IDLE = { status: "idle", rows: [], error: "" };

export function usePayoutHistory({ enabled, request, load, reloadKey }) {
  const [history, setHistory] = useState(IDLE);

  useEffect(() => {
    if (!enabled || !request || !load) {
      setHistory(IDLE);
      return undefined;
    }

    let cancelled = false;
    setHistory({ status: "loading", rows: [], error: "" });
    Promise.resolve(load(request)).then((response) => {
      if (cancelled) return;
      setHistory(
        response?.st === false
          ? { status: "error", rows: [], error: response.text || "Не удалось загрузить историю" }
          : { status: "ready", rows: response?.history ?? [], error: "" },
      );
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, reloadKey]);

  return history;
}

export default function StaffSchedulePayoutHistoryList({ state, title, emptyText, showType = false }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <Stack
      spacing={1}
      data-staff-schedule-payout-history
    >
      <Typography sx={{ ...staffScheduleModalTypography.helperText, fontWeight: 600, color: "#111827" }}>
        {title}
      </Typography>
      {state.status === "loading" ? (
        <Typography sx={staffScheduleModalTypography.helperText}>Загружаем…</Typography>
      ) : state.status === "error" ? (
        <Typography sx={{ ...staffScheduleModalTypography.helperText, color: uiColors.danger }}>
          {state.error}
        </Typography>
      ) : state.rows.length ? (
        <Box
          component="ul"
          sx={{ m: 0, p: 0, listStyle: "none", maxHeight: 220, overflowY: "auto" }}
        >
          {state.rows.map((row, index) => (
            <Box
              component="li"
              key={`${row.date_update}-${row.type}-${index}`}
              sx={{
                display: "grid",
                gridTemplateColumns: "88px minmax(0, 1fr) auto",
                alignItems: "center",
                columnGap: 1.5,
                py: 0.75,
                borderTop: index ? "1px solid #F0F0F0" : "none",
                color: "#111827",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{formatPayoutHistoryDate(row.date_update)}</Typography>
              <Box sx={{ minWidth: 0 }}>
                {showType ? (
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "inherit" }}>{row.type_label}</Typography>
                ) : null}
                <Typography
                  noWrap
                  sx={{ fontSize: showType ? 12 : 13, color: "#6B7280" }}
                >
                  {row.user_name || "—"}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "inherit", whiteSpace: "nowrap" }}>
                {formatPayoutHistoryChange(row)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={staffScheduleModalTypography.helperText}>{emptyText}</Typography>
      )}
    </Stack>
  );
}
