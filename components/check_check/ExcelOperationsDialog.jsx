import { useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoResponsiveModalShell,
  JacoTextInput,
} from "@/design-system/shared/ui";
import {
  excelOperationsAvailable,
  excelOperationTotals,
  filterExcelOperations,
  scopedExcelOperations,
} from "./excelOperations.mjs";

const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
const stateLabel = (row) => (row.included ? "Учитывается" : "Пропущена: неизвестный тип");
const momentLabel = (row) => row.date_time || `${row.date || "—"} · время не указано`;
const registerLabel = (row) => (row.kassa == null ? "Касса не определена" : `Касса ${row.kassa}`);
const shiftLabel = (row) => (row.smena == null ? "Смена не определена" : `Смена ${row.smena}`);

export function ExcelOperationsDialog({
  open,
  onClose,
  excelCompare,
  scope = {},
  onlyUnknown = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const available = excelOperationsAvailable(excelCompare);
  const rows = scopedExcelOperations(excelCompare, scope);
  const visible = filterExcelOperations(rows, search, onlyUnknown);
  const pages = Math.max(1, Math.ceil(visible.length / 50));
  const currentPage = Math.min(page, pages - 1);
  const pageRows = visible.slice(currentPage * 50, (currentPage + 1) * 50);
  const totals = excelOperationTotals(rows);

  return (
    <JacoResponsiveModalShell
      open={open}
      onClose={onClose}
      title={onlyUnknown ? "Пропущенные операции Excel" : "Операции Excel"}
      maxWidth="lg"
      actions={
        <JacoButton
          tone="secondary"
          compact
          onClick={onClose}
        >
          Закрыть
        </JacoButton>
      }
    >
      <Stack spacing={2}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {scope.date || "Выбранный период"}
          {scope.kassa != null && ` · Касса ${scope.kassa}`}
          {scope.smena != null && ` · Смена ${scope.smena}`}
          {" · Только просмотр; заказы и чеки не изменяются."}
        </Typography>
        {!available ? (
          <JacoAlert severity="info">
            Детализация недоступна. Загрузите Excel повторно после обновления сервера.
          </JacoAlert>
        ) : (
          <>
            <Stack
              direction="row"
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                label={`Учтённая сумма: ${money(totals.included)} ₽`}
                size="small"
              />
              <Chip
                label={`Суммы пропущенных операций: ${money(totals.unknown)} ₽`}
                size="small"
                color={rows.some((row) => !row.included) ? "warning" : "default"}
              />
            </Stack>
            <JacoTextInput
              label="Поиск по сумме, RRN, терминалу, времени или строке"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Показано: {visible.length} / {filterExcelOperations(rows, "", onlyUnknown).length}{" "}
              операций.
              {
                " Номер строки соответствует исходному Excel. Номера заказов не определяются автоматически."
              }
            </Typography>
            {rows.some((row) => !row.included) && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Для неизвестных типов показаны абсолютные суммы из файла; направление операции не
                определено.
              </Typography>
            )}
            {visible.length === 0 ? (
              <JacoAlert severity="info">Операции по выбранным условиям не найдены.</JacoAlert>
            ) : mobile ? (
              <Stack spacing={1}>
                {pageRows.map((row) => (
                  <Paper
                    key={`${row.included}-${row.row_number}`}
                    variant="outlined"
                    sx={{ p: 1.5 }}
                  >
                    <Stack spacing={0.75}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between", gap: 1 }}
                      >
                        <Typography variant="body2">Строка {row.row_number}</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{money(row.amount)} ₽</Typography>
                      </Stack>
                      <Typography variant="body2">{row.operation_type}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {momentLabel(row)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        RRN: {row.rrn || "—"} · Терминал: {row.terminal || "—"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {registerLabel(row)} · {shiftLabel(row)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={row.included ? "text.secondary" : "warning.main"}
                      >
                        {stateLabel(row)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table
                  size="small"
                  stickyHeader
                  aria-label="Операции исходного Excel"
                >
                  <TableHead>
                    <TableRow>
                      {[
                        "Строка",
                        "Дата / время",
                        "Операция",
                        "Сумма",
                        "Терминал / RRN",
                        "Касса / смена",
                        "Обработка",
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageRows.map((row) => (
                      <TableRow
                        key={`${row.included}-${row.row_number}`}
                        hover
                      >
                        <TableCell>{row.row_number}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{momentLabel(row)}</TableCell>
                        <TableCell>{row.operation_type}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {money(row.amount)} ₽
                        </TableCell>
                        <TableCell>
                          <Box>{row.terminal || "—"}</Box>
                          <Box>RRN: {row.rrn || "—"}</Box>
                        </TableCell>
                        <TableCell>
                          {registerLabel(row)}
                          <br />
                          {shiftLabel(row)}
                        </TableCell>
                        <TableCell sx={{ color: row.included ? "text.secondary" : "warning.main" }}>
                          {stateLabel(row)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {pages > 1 && (
              <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}
              >
                <JacoButton
                  tone="secondary"
                  compact
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Назад
                </JacoButton>
                <Typography variant="body2">
                  {currentPage + 1} / {pages}
                </Typography>
                <JacoButton
                  tone="secondary"
                  compact
                  disabled={currentPage === pages - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Далее
                </JacoButton>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </JacoResponsiveModalShell>
  );
}

export default function ExcelOperationsButton({
  excelCompare,
  scope,
  onlyUnknown = false,
  label = "Операции Excel",
}) {
  const [open, setOpen] = useState(false);
  if (!excelOperationsAvailable(excelCompare)) return null;
  return (
    <Box
      sx={{ display: "contents" }}
      onClick={(event) => event.stopPropagation()}
    >
      <JacoButton
        compact
        tone="secondary"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {label}
      </JacoButton>
      {open && (
        <ExcelOperationsDialog
          open
          onClose={() => setOpen(false)}
          excelCompare={excelCompare}
          scope={scope}
          onlyUnknown={onlyUnknown}
        />
      )}
    </Box>
  );
}
