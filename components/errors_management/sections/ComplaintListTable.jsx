"use client";

import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import {
  JacoButton,
  JacoInfoLabel,
  JacoStatusChip,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";
import { complaintStatusAppearance } from "../complaintStatusModel.mjs";
import {
  amountLabel,
  cafeLabel,
  complaintStatusLabel,
  historyTimestamp,
  orderAddressLabel,
  orderId,
  orderSourceLabel,
  orderTimeLabel,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";
import ComplaintPagination from "./ComplaintPagination";
import { removedErrorsRowSx } from "./ComplaintStatusLegend";

const deletedRowSx = {
  backgroundColor: uiColors.primarySoft,
  "&:hover": { backgroundColor: `${uiColors.primarySoft} !important` },
};

const stickyCellSx = (backgroundColor = uiColors.surface) => ({
  position: "sticky",
  left: 0,
  zIndex: 2,
  backgroundColor,
  boxShadow: `2px 0 0 0 ${uiColors.borderLight}`,
});

const stickyActionSx = (backgroundColor = uiColors.surface) => ({
  position: "sticky",
  right: 0,
  zIndex: 2,
  backgroundColor,
  boxShadow: `-2px 0 0 0 ${uiColors.borderLight}`,
});

function SortableHeader({ field, sort, onSort, children }) {
  return (
    <TableCell sortDirection={sort.by === field ? sort.direction : false}>
      <TableSortLabel
        active={sort.by === field}
        direction={sort.by === field ? sort.direction : "asc"}
        onClick={() => onSort(field)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );
}

function HeaderHint({ tooltip, children }) {
  return (
    <JacoInfoLabel
      variant="inherit"
      tooltip={tooltip}
    >
      {children}
    </JacoInfoLabel>
  );
}

function OrderLink({ row, onOpenOrder }) {
  return (
    <Link
      component="button"
      type="button"
      underline="hover"
      onClick={(event) => {
        event.stopPropagation();
        onOpenOrder(row);
      }}
      sx={{ fontWeight: 600, fontSize: "inherit" }}
    >
      №{orderId(row)}
    </Link>
  );
}

function JournalHeaders({ sort, onSort }) {
  return (
    <>
      <SortableHeader
        field="order_id"
        sort={sort}
        onSort={onSort}
      >
        Заказ
      </SortableHeader>
      <TableCell>№ жалобы</TableCell>
      <TableCell>Зарегистрировал</TableCell>
      <SortableHeader
        field="created_at"
        sort={sort}
        onSort={onSort}
      >
        Дата
      </SortableHeader>
      <TableCell>Кафе</TableCell>
      <TableCell>Клиент</TableCell>
      <TableCell>Адрес</TableCell>
      <TableCell>Сумма</TableCell>
      <TableCell>Оплата</TableCell>
      <TableCell>
        <HeaderHint tooltip="Выписано / Активировано: количество промокодов, созданных для решения жалобы, и количество применённых клиентами.">
          Промокоды
        </HeaderHint>
      </TableCell>
      <TableCell>Комментарий</TableCell>
      <TableCell>Решил</TableCell>
      <SortableHeader
        field="status"
        sort={sort}
        onSort={onSort}
      >
        Статус
      </SortableHeader>
      <SortableHeader
        field="error_amount"
        sort={sort}
        onSort={onSort}
      >
        <HeaderHint tooltip="Сумма по действующим ошибкам заказа. Снятые ошибки не учитываются.">
          Сумма ошибки
        </HeaderHint>
      </SortableHeader>
      <SortableHeader
        field="changed_amount"
        sort={sort}
        onSort={onSort}
      >
        <HeaderHint tooltip="Корректировка суммы заказа после рассмотрения жалобы. Пока жалоба у кафе, сумма скрыта.">
          Сумма изменения
        </HeaderHint>
      </SortableHeader>
      <TableCell />
    </>
  );
}

function JournalRow({ row, points, onOpenOrder, onOpenComplaint }) {
  const appearance = complaintStatusAppearance(row.status);
  return (
    <TableRow
      hover
      onClick={() => onOpenComplaint(row)}
      sx={{ cursor: "pointer", ...(row.has_removed_errors ? removedErrorsRowSx : {}) }}
    >
      <TableCell>
        <OrderLink
          row={row}
          onOpenOrder={onOpenOrder}
        />
      </TableCell>
      <TableCell>№{row.id}</TableCell>
      <TableCell>{workflowSourceLabel(row.source)}</TableCell>
      <TableCell>{historyTimestamp(row.created_at)}</TableCell>
      <TableCell>{cafeLabel(row, points)}</TableCell>
      <TableCell>{row.order_snapshot?.client_name || "—"}</TableCell>
      <TableCell>{row.order_snapshot?.delivery_address || "—"}</TableCell>
      <TableCell>{amountLabel(row.order_snapshot?.order_amount)}</TableCell>
      <TableCell>{row.order_snapshot?.payment_method || "—"}</TableCell>
      <TableCell>
        {row.issued_promos || 0}/{row.activated_promos || 0}
      </TableCell>
      <TableCell>{row.common_comment || "—"}</TableCell>
      <TableCell>{row.resolved_by_name || "—"}</TableCell>
      <TableCell>
        <JacoStatusChip
          label={complaintStatusLabel(row)}
          tone={appearance.tone}
          variant={appearance.variant}
        />
      </TableCell>
      <TableCell>{amountLabel(row.error_amount_total)}</TableCell>
      <TableCell>{row.is_salary_visible ? amountLabel(row.changed_amount_total) : "—"}</TableCell>
      <TableCell align="right">
        <JacoButton
          compact
          variant="text"
          tone="outlinePrimary"
          onClick={(event) => {
            event.stopPropagation();
            onOpenComplaint(row);
          }}
        >
          Открыть детали
        </JacoButton>
      </TableCell>
    </TableRow>
  );
}

const ORDER_COLUMNS = [
  { id: "cafe", label: "Кафе", value: (row, points) => cafeLabel(row, points) },
  { id: "channel", label: "Канал заказа", value: (row) => orderSourceLabel(row.order_source) },
  { id: "placed_by", label: "Оформил", value: (row) => row.type_user || "—" },
  { id: "client", label: "Клиент", phone: true, value: (row) => row.number || "—" },
  { id: "address", label: "Адрес", value: (row) => orderAddressLabel(row) },
  {
    id: "opened",
    label: "Открыт",
    tooltip: "Время открытия заказа",
    value: (row) => orderTimeLabel(row.date_time_order),
  },
  {
    id: "table",
    label: "Выход на стол",
    tooltip: "Время выхода на стол",
    value: (row) => orderTimeLabel(row.start_stol, "04:00:00"),
  },
  {
    id: "preorder",
    label: "Ко времени",
    value: (row) => (Number.parseInt(row.is_preorder, 10) === 1 ? row.need_time || "—" : "—"),
  },
  {
    id: "kitchen_closed",
    label: "Закрыт кухней",
    tooltip: "Время закрытия заказа на кухне",
    value: (row) => orderTimeLabel(row.give_data_time, "00:00:00"),
  },
  {
    id: "cook_time",
    label: "На готовку",
    tooltip: "Время на готовку",
    value: (row) => orderTimeLabel(row.cook_time),
  },
  {
    id: "received",
    label: "Получен",
    tooltip: "Время получения клиентом",
    value: (row) => orderTimeLabel(row.close_order),
  },
  { id: "to_time", label: "До просрочки", value: (row) => orderTimeLabel(row.to_time) },
  { id: "dif", label: "Разница", value: (row) => orderTimeLabel(row.dif) },
  { id: "cooking", label: "Готовка", value: (row) => orderTimeLabel(row.diff2) },
  {
    id: "promised",
    label: "Обещ. время",
    tooltip: "Обещанное время",
    value: (row) => orderTimeLabel(row.unix_time_to_client),
  },
  {
    id: "delivery_time",
    label: "Доставка: план/факт",
    tooltip: "Время по программе / реальное время доставки",
    value: (row) => orderTimeLabel(row.time_dev_text),
  },
  { id: "type", label: "Тип", value: (row) => row.type_order || "—" },
  { id: "status", label: "Статус", value: (row) => row.status || "—" },
  { id: "amount", label: "Сумма", value: (row) => amountLabel(row.order_price) },
  { id: "payment", label: "Оплата", value: (row) => row.type_pay || "—" },
  { id: "driver", label: "Водитель", value: (row) => row.driver || "—" },
];

function OrdersTable({ rows, points, canSeePhone, onOpenOrder, onRegister }) {
  const columns = ORDER_COLUMNS.filter((column) => canSeePhone || !column.phone);
  return (
    <>
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5, borderBottom: `1px solid ${uiColors.borderLight}` }}>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Прокрутите таблицу вправо, чтобы увидеть все колонки
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: "70vh", overflowX: "auto" }}>
        <Table
          size="small"
          stickyHeader
          sx={{ minWidth: 2200, "& td, & th": { whiteSpace: "nowrap" } }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...stickyCellSx(), zIndex: 3 }}>Заказ</TableCell>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.tooltip ? (
                    <HeaderHint tooltip={column.tooltip}>{column.label}</HeaderHint>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              <TableCell sx={{ ...stickyActionSx(), zIndex: 3 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const deleted = Number(row.is_delete) === 1;
              const background = deleted ? uiColors.primarySoft : uiColors.surface;
              return (
                <TableRow
                  hover
                  key={`${row.point_id}-${orderId(row)}-${index}`}
                  sx={deleted ? deletedRowSx : undefined}
                >
                  <TableCell sx={stickyCellSx(background)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                      ) : null}
                    </Box>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{column.value(row, points)}</TableCell>
                  ))}
                  <TableCell
                    align="right"
                    sx={stickyActionSx(background)}
                  >
                    <JacoButton
                      compact
                      variant="text"
                      tone="outlinePrimary"
                      onClick={() => onRegister(row)}
                    >
                      Зарегистрировать
                    </JacoButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default function ComplaintListTable({
  rows,
  mode,
  points,
  canSeePhone,
  sort,
  onSort,
  onOpenOrder,
  onOpenComplaint,
  onRegister,
  pagination,
}) {
  if (mode !== "journal") {
    return (
      <JacoSurface
        variant="outlined"
        sx={{ overflow: "hidden" }}
      >
        <OrdersTable
          rows={rows}
          points={points}
          canSeePhone={canSeePhone}
          onOpenOrder={onOpenOrder}
          onRegister={onRegister}
        />
      </JacoSurface>
    );
  }
  return (
    <JacoSurface variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <JournalHeaders
                sort={sort}
                onSort={onSort}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <JournalRow
                key={`complaint-${row.id}`}
                row={row}
                points={points}
                onOpenOrder={onOpenOrder}
                onOpenComplaint={onOpenComplaint}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination ? <ComplaintPagination pagination={pagination} /> : null}
    </JacoSurface>
  );
}
