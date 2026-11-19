"use client";

import { Box, Link, Stack, Typography } from "@mui/material";
import { JacoButton, JacoStatusChip, JacoSurface, uiColors } from "@/design-system/shared/ui";
import { REMOVED_ERRORS_LEGEND, complaintStatusAppearance } from "../complaintStatusModel.mjs";
import {
  amountLabel,
  cafeLabel,
  complaintStatusLabel,
  historyTimestamp,
  orderAddressLabel,
  orderId,
  orderTimeLabel,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";
import ComplaintPagination from "./ComplaintPagination";
import { removedErrorsCardSx } from "./ComplaintStatusLegend";

function OrderLink({ row, onOpenOrder }) {
  return (
    <Link
      component="button"
      type="button"
      underline="hover"
      onClick={() => onOpenOrder(row)}
      sx={{ fontWeight: 700, textAlign: "left" }}
    >
      Заказ №{orderId(row)}
    </Link>
  );
}

function JournalCard({ row, points, onOpenOrder, onOpenComplaint }) {
  const appearance = complaintStatusAppearance(row.status);
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: 2, ...(row.has_removed_errors ? removedErrorsCardSx : {}) }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700}>Жалоба №{row.id}</Typography>
            <OrderLink
              row={row}
              onOpenOrder={onOpenOrder}
            />
          </Box>
          <JacoStatusChip
            label={complaintStatusLabel(row)}
            tone={appearance.tone}
            variant={appearance.variant}
          />
        </Stack>
        <Typography color="text.secondary">Кафе: {cafeLabel(row, points)}</Typography>
        <Typography color="text.secondary">
          {historyTimestamp(row.created_at)} · {workflowSourceLabel(row.source)}
        </Typography>
        <Typography color="text.secondary">
          Ошибок: {row.errors_count ?? "—"} · Промокоды: {row.issued_promos || 0}/{row.activated_promos || 0}
        </Typography>
        {row.has_removed_errors ? (
          <Typography
            variant="body2"
            fontWeight={600}
          >
            {REMOVED_ERRORS_LEGEND}
          </Typography>
        ) : null}
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography>{amountLabel(row.order_snapshot?.order_amount)}</Typography>
          <JacoButton
            compact
            variant="text"
            tone="outlinePrimary"
            onClick={() => onOpenComplaint(row)}
          >
            Открыть детали
          </JacoButton>
        </Stack>
      </Stack>
    </JacoSurface>
  );
}

function OrderCard({ row, points, canSeePhone, onOpenOrder, onRegister }) {
  const deleted = Number(row.is_delete) === 1;
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: 2, ...(deleted ? { backgroundColor: uiColors.primarySoft } : {}) }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <OrderLink
            row={row}
            onOpenOrder={onOpenOrder}
          />
          {deleted ? (
            <JacoStatusChip
              label="Удалён"
              tone="danger"
              variant="soft"
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {row.status || "—"}
            </Typography>
          )}
        </Stack>
        <Typography color="text.secondary">Кафе: {cafeLabel(row, points)}</Typography>
        <Typography color="text.secondary">
          {[row.type_order, orderTimeLabel(row.date_time_order), row.type_user]
            .filter((value) => value && value !== "—")
            .join(" · ") || "—"}
        </Typography>
        <Typography color="text.secondary">{orderAddressLabel(row)}</Typography>
        {canSeePhone ? <Typography>{row.number || "Телефон не указан"}</Typography> : null}
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography>{amountLabel(row.order_price)}</Typography>
          <JacoButton
            compact
            variant="text"
            tone="outlinePrimary"
            onClick={() => onRegister(row)}
          >
            Зарегистрировать
          </JacoButton>
        </Stack>
      </Stack>
    </JacoSurface>
  );
}

export default function ComplaintListMobileCards({
  rows,
  mode,
  points,
  canSeePhone,
  onOpenOrder,
  onOpenComplaint,
  onRegister,
  pagination,
}) {
  const journal = mode === "journal";
  return (
    <Stack spacing={1.5}>
      {rows.map((row, index) =>
        journal ? (
          <JournalCard
            key={`complaint-${row.id}`}
            row={row}
            points={points}
            onOpenOrder={onOpenOrder}
            onOpenComplaint={onOpenComplaint}
          />
        ) : (
          <OrderCard
            key={`${row.point_id}-${orderId(row)}-${index}`}
            row={row}
            points={points}
            canSeePhone={canSeePhone}
            onOpenOrder={onOpenOrder}
            onRegister={onRegister}
          />
        ),
      )}
      {pagination ? (
        <ComplaintPagination
          compact
          pagination={pagination}
        />
      ) : null}
    </Stack>
  );
}
