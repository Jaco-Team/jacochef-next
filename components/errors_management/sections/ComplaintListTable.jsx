"use client";

import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { JacoInfoLabel, JacoSurface } from "@/design-system/shared/ui";
import {
  amountLabel,
  cafeLabel,
  complaintStatusLabel,
  historyTimestamp,
  orderId,
  orderSourceLabel,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";

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
        <JacoInfoLabel
          variant="inherit"
          tooltip="Выписано / Активировано: количество промокодов, созданных для решения жалобы, и количество применённых клиентами."
        >
          Промокоды
        </JacoInfoLabel>
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
        <JacoInfoLabel
          variant="inherit"
          tooltip="Сумма по зарегистрированным ошибкам заказа."
        >
          Сумма ошибки
        </JacoInfoLabel>
      </SortableHeader>
      <SortableHeader
        field="changed_amount"
        sort={sort}
        onSort={onSort}
      >
        <JacoInfoLabel
          variant="inherit"
          tooltip="Корректировка суммы заказа после рассмотрения жалобы."
        >
          Сумма изменения
        </JacoInfoLabel>
      </SortableHeader>
    </>
  );
}

function RegistrationHeaders() {
  return (
    <>
      <TableCell>Заказ</TableCell>
      <TableCell>Кафе</TableCell>
      <TableCell>Источник заказа</TableCell>
      <TableCell>Клиент</TableCell>
      <TableCell>Адрес</TableCell>
      <TableCell>Статус</TableCell>
      <TableCell>Сумма</TableCell>
    </>
  );
}

function JournalCells({ row, points }) {
  return (
    <>
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
        <Chip
          size="small"
          color={row.status === "resolved" ? "success" : "warning"}
          label={complaintStatusLabel(row)}
        />
      </TableCell>
      <TableCell>{amountLabel(row.error_amount_total)}</TableCell>
      <TableCell>{row.is_salary_visible ? amountLabel(row.changed_amount_total) : "—"}</TableCell>
    </>
  );
}

function RegistrationCells({ row, points }) {
  return (
    <>
      <TableCell>{cafeLabel(row, points)}</TableCell>
      <TableCell>{orderSourceLabel(row.order_source)}</TableCell>
      <TableCell>{row.number || "—"}</TableCell>
      <TableCell>
        {row.type_order_ === 1
          ? `${row.street || ""} ${row.home || ""}`
          : row.type_order_addr_new || "—"}
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          color={row.status === "resolved" ? "success" : "warning"}
          label={row.status_label || row.status || "—"}
        />
      </TableCell>
      <TableCell>{amountLabel(row.order_price)}</TableCell>
    </>
  );
}

export default function ComplaintListTable({
  rows,
  mode,
  points,
  sort,
  onSort,
  onOpenOrder,
  onOpenComplaint,
  onRegister,
  pagination,
}) {
  const journal = mode === "journal";
  return (
    <JacoSurface variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {journal ? (
                <JournalHeaders
                  sort={sort}
                  onSort={onSort}
                />
              ) : (
                <RegistrationHeaders />
              )}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                hover
                key={journal ? `complaint-${row.id}` : `${orderId(row)}-${index}`}
                onClick={journal ? () => onOpenComplaint(row) : undefined}
                sx={journal ? { cursor: "pointer" } : undefined}
              >
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenOrder(row);
                    }}
                    sx={{ minWidth: 0, p: 0, textTransform: "none" }}
                  >
                    №{orderId(row)}
                  </Button>
                </TableCell>
                {journal ? (
                  <JournalCells
                    row={row}
                    points={points}
                  />
                ) : (
                  <RegistrationCells
                    row={row}
                    points={points}
                  />
                )}
                <TableCell align="right">
                  {journal ? (
                    <Button size="small">Открыть детали</Button>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => onRegister(row)}
                    >
                      Зарегистрировать
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {journal ? (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.perPage}
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Строк на странице"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          onRowsPerPageChange={(event) => pagination.onPerPageChange(Number(event.target.value))}
        />
      ) : null}
    </JacoSurface>
  );
}
