"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { JacoSurface } from "@/design-system/shared/ui";
import {
  amountLabel,
  cafeLabel,
  complaintStatusLabel,
  historyTimestamp,
  orderId,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";

export default function ComplaintListMobileCards({
  rows,
  mode,
  points,
  onOpenOrder,
  onOpenComplaint,
  onRegister,
}) {
  return (
    <Stack spacing={1.5}>
      {rows.map((row, index) => (
        <JacoSurface
          key={mode === "journal" ? `complaint-${row.id}` : `${orderId(row)}-${index}`}
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Box>
                {mode === "journal" ? (
                  <Typography fontWeight={700}>Жалоба №{row.id}</Typography>
                ) : null}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onOpenOrder(row)}
                  sx={{ minWidth: 0, p: 0, fontWeight: 700, textTransform: "none" }}
                >
                  Заказ №{orderId(row)}
                </Button>
              </Box>
              <Chip
                size="small"
                color={row.status === "resolved" ? "success" : "warning"}
                label={
                  mode === "journal"
                    ? complaintStatusLabel(row)
                    : row.status_label || row.status || "—"
                }
              />
            </Stack>
            <Typography color="text.secondary">Кафе: {cafeLabel(row, points)}</Typography>
            {mode === "journal" ? (
              <Typography color="text.secondary">
                {historyTimestamp(row.created_at)} · {workflowSourceLabel(row.source)}
              </Typography>
            ) : null}
            {mode === "journal" ? (
              <Typography color="text.secondary">
                Ошибок: {row.errors_count ?? "—"} · Сумма: {amountLabel(row.error_amount_total)} ·
                Промокоды: {row.issued_promos || 0}/{row.activated_promos || 0}
              </Typography>
            ) : (
              <Typography>{row.number || "Клиент не указан"}</Typography>
            )}
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between" }}
            >
              <Typography>
                {amountLabel(
                  mode === "journal" ? row.order_snapshot?.order_amount : row.order_price,
                )}
              </Typography>
              <Button
                size="small"
                onClick={() => (mode === "registration" ? onRegister(row) : onOpenComplaint(row))}
              >
                {mode === "registration" ? "Зарегистрировать" : "Открыть детали"}
              </Button>
            </Stack>
          </Stack>
        </JacoSurface>
      ))}
    </Stack>
  );
}
