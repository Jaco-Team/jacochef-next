import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";

const FONT =
  '"Roboto", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const headCellSx = {
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
  py: 1.1,
  px: 1.25,
};

const bodyCellSx = {
  fontFamily: FONT,
  fontSize: 13,
  color: "#111827",
  borderBottom: "1px solid #edf0f4",
  py: 1.1,
  px: 1.25,
  fontVariantNumeric: "tabular-nums",
};

function formatNumber(value, { digits = 2, empty = "—" } = {}) {
  if (value === null || value === undefined || value === "") {
    return empty;
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return empty;
  }

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

function formatMoney(value) {
  const formatted = formatNumber(value, { digits: 2 });
  return formatted === "—" ? formatted : `${formatted} ₽`;
}

function formatQty(value, unit, { digits = 6 } = {}) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(num);

  return unit ? `${formatted} ${unit}` : formatted;
}

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontFamily: FONT,
        fontSize: 15,
        fontWeight: 700,
        color: "#111827",
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}

function MetaChip({ label, accent = false }) {
  if (!label) {
    return null;
  }

  return (
    <Chip
      size="small"
      label={label}
      variant="outlined"
      sx={{
        fontFamily: FONT,
        borderRadius: 1.5,
        height: 28,
        borderColor: accent ? "#22c55e" : "#d1d5db",
        color: "#111827",
        backgroundColor: "#fff",
        "& .MuiChip-label": {
          px: 1.25,
          fontSize: 13,
        },
      }}
    />
  );
}

function normalizeUnit(unit) {
  return String(unit || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/\s+/g, "");
}

function isPieceUnit(unit) {
  const normalized = normalizeUnit(unit);
  return normalized === "шт" || normalized === "pcs" || normalized === "pc";
}

function isGramUnit(unit) {
  const normalized = normalizeUnit(unit);
  return normalized === "г" || normalized === "гр" || normalized === "g" || normalized === "грм";
}

function isKgUnit(unit) {
  const normalized = normalizeUnit(unit);
  return normalized === "кг" || normalized === "kg";
}

function resolveSourceQuantity(prepParent, itemNode) {
  const quantity = prepParent?.quantity ?? itemNode?.net_quantity ?? itemNode?.quantity ?? null;
  const prepUnit = prepParent?.unit || "";
  const itemUnit = itemNode?.unit || "";

  if (quantity === null || quantity === undefined) {
    return { value: null, unit: "" };
  }

  if (prepUnit) {
    return { value: quantity, unit: prepUnit };
  }

  if (isPieceUnit(itemUnit)) {
    return { value: quantity, unit: "шт" };
  }

  if (isKgUnit(itemUnit) || isGramUnit(itemUnit)) {
    return { value: quantity, unit: "г" };
  }

  return { value: quantity, unit: itemUnit || "" };
}

function resolveWriteOff(itemNode) {
  const value = itemNode?.purchase_quantity ?? itemNode?.net_quantity ?? itemNode?.quantity ?? null;
  const unit = itemNode?.unit || "";

  if (value === null || value === undefined) {
    return { value: null, unit: "" };
  }

  // Если списание в граммах — показываем в кг
  if (isGramUnit(unit)) {
    return { value: Number(value) / 1000, unit: "кг" };
  }

  return { value, unit };
}

function collectCalcRows(nodes, prepParent = null, rows = []) {
  if (!Array.isArray(nodes)) {
    return rows;
  }

  nodes.forEach((node) => {
    if (!node) {
      return;
    }

    if (node.kind === "item") {
      const sourceQuantity = resolveSourceQuantity(prepParent, node);
      const writeOff = resolveWriteOff(node);
      const recipeVolume = node.purchase_quantity ?? node.net_quantity ?? node.quantity ?? null;
      const unitPrice = node.unit_price;
      const amountFromFormula =
        recipeVolume != null && unitPrice != null && !Number.isNaN(Number(recipeVolume))
          ? Number(recipeVolume) * Number(unitPrice)
          : null;

      rows.push({
        id: node.id,
        // Исходный состав — заготовка / позиция из рецепта
        sourceName: prepParent?.name || node.name || "—",
        // Количество — сколько в рецепте
        quantity: sourceQuantity.value,
        quantityUnit: sourceQuantity.unit,
        // Во что преобразовалось — товар со склада
        transformedName: node.name || "—",
        // Сколько списать — purchase_quantity (г → кг)
        writeOff: writeOff.value,
        writeOffUnit: writeOff.unit,
        lossPercent: node.loss_percent,
        cost: node.amount ?? amountFromFormula,
      });
    }

    const nextPrep = node.kind === "pf" ? node : prepParent;
    collectCalcRows(node.children, nextPrep, rows);
  });

  return rows;
}

function resolvePeriodLabel(filters, dateStart, dateEnd) {
  const start = filters?.date_start || dateStart;
  const end = filters?.date_end || dateEnd;

  if (start && end) {
    return `Период: ${start} — ${end}`;
  }

  return null;
}

function resolvePricePeriodLabel(pricePeriod) {
  if (!pricePeriod) {
    return null;
  }

  if (typeof pricePeriod === "string") {
    return pricePeriod;
  }

  const from = pricePeriod.date_from;
  const to = pricePeriod.date_to_exclusive || pricePeriod.date_to;

  if (from && to) {
    return `Цена: ${from} — ${to}`;
  }

  return null;
}

function formatLoss(value) {
  if (value === null || value === undefined || value === "") {
    return "0%";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "0%";
  }

  return `${formatNumber(num, { digits: num % 1 === 0 ? 0 : 1 })}%`;
}

function CostCalcTable({ rows, totalAmount }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 1.5,
        overflow: "hidden",
      }}
    >
      <Table
        size="small"
        sx={{ minWidth: 860 }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headCellSx, textAlign: "left", minWidth: 180 }}>
              Исходный состав
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Количество</TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "left", minWidth: 180 }}>
              Во что преобразовалось
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Сколько списать</TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Потери</TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Стоимость</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.id ?? row.sourceName}-${index}`}
              sx={{
                backgroundColor: index % 2 === 1 ? "#fafafa" : "#fff",
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              <TableCell sx={{ ...bodyCellSx, textAlign: "left", whiteSpace: "normal" }}>
                {row.sourceName}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                {formatQty(row.quantity, row.quantityUnit, { digits: 3 })}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "left", whiteSpace: "normal" }}>
                {row.transformedName}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                {formatQty(row.writeOff, row.writeOffUnit, { digits: 6 })}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                {formatLoss(row.lossPercent)}
              </TableCell>
              <TableCell
                sx={{
                  ...bodyCellSx,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {formatMoney(row.cost)}
              </TableCell>
            </TableRow>
          ))}

          {!rows.length ? (
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{
                  ...bodyCellSx,
                  textAlign: "center",
                  color: "#6b7280",
                  py: 3,
                }}
              >
                Нет данных для расчёта
              </TableCell>
            </TableRow>
          ) : null}

          {rows.length ? (
            <TableRow>
              <TableCell
                colSpan={5}
                sx={{
                  ...bodyCellSx,
                  textAlign: "right",
                  fontWeight: 700,
                  backgroundColor: "#f3f4f6",
                  borderBottom: "none",
                }}
              >
                Итого себестоимость единицы
              </TableCell>
              <TableCell
                sx={{
                  ...bodyCellSx,
                  textAlign: "right",
                  fontWeight: 700,
                  backgroundColor: "#f3f4f6",
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {formatMoney(totalAmount)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ReportCostDetailModal({
  open,
  onClose,
  loading,
  error,
  data,
  cafeLabel,
  dateStart,
  dateEnd,
}) {
  const item = data?.item || {};
  const filters = data?.filters || {};
  const periodStats = data?.period_stats || {};
  const formula = data?.formula || {};
  const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
  const tree = Array.isArray(data?.tree) ? data.tree : [];
  const calcRows = collectCalcRows(tree);
  const totalAmount = data?.unit_cost ?? formula.result ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          fontFamily: FONT,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 18,
          color: "#111827",
          pr: 6,
          pb: 1.5,
        }}
      >
        Проверка расчёта — {item.name || "—"}
        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "#6b7280",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5, pb: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 220,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}

        {!loading && error ? <Alert severity="error">{error}</Alert> : null}

        {!loading && !error && data ? (
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              useFlexGap
              flexWrap="wrap"
              gap={1}
            >
              <MetaChip label={filters.points_label || cafeLabel} />
              <MetaChip label={resolvePeriodLabel(filters, dateStart, dateEnd)} />
              <MetaChip
                label={filters.production_type}
                accent
              />
              <MetaChip label={resolvePricePeriodLabel(filters.price_period)} />
              {item.weight != null ? <MetaChip label={`Выход: ${item.weight}`} /> : null}
            </Stack>

            <Box>
              <SectionTitle>Показатели периода</SectionTitle>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                Выпущено:{" "}
                {periodStats.produced == null
                  ? "—"
                  : formatNumber(periodStats.produced, { digits: 0 })}
                {" • "}
                Продано:{" "}
                {periodStats.sold == null ? "—" : formatNumber(periodStats.sold, { digits: 0 })}
                {" • "}
                Списано:{" "}
                {periodStats.written_off == null
                  ? "—"
                  : formatNumber(periodStats.written_off, { digits: 0 })}
              </Typography>
            </Box>

            <Box>
              <SectionTitle>Расчёт себестоимости</SectionTitle>
              <CostCalcTable
                rows={calcRows}
                totalAmount={totalAmount}
              />
            </Box>

            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1.5,
                backgroundColor: "#f9fafb",
                px: 2,
                py: 1.75,
              }}
            >
              <SectionTitle>Формула и подстановка</SectionTitle>
              {formula.text ? (
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: 14,
                    color: "#111827",
                    mb: 0.75,
                  }}
                >
                  {formula.text}
                </Typography>
              ) : null}
              {formula.substitution ? (
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: 14,
                    color: "#111827",
                    mb: 0.75,
                  }}
                >
                  {formula.substitution}
                </Typography>
              ) : null}
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                Итоговая себестоимость единицы:{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 700 }}
                >
                  {formatMoney(totalAmount)}
                </Box>
              </Typography>
            </Box>

            {warnings.length ? (
              <Box>
                <SectionTitle>Предупреждения</SectionTitle>
                <Stack spacing={1}>
                  {warnings.map((warning, index) => (
                    <Alert
                      key={warning?.code ?? index}
                      severity="warning"
                      sx={{ fontFamily: FONT }}
                    >
                      {warning?.message || warning?.text || warning?.code || "Предупреждение"}
                    </Alert>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ReportCostDetailModal;
