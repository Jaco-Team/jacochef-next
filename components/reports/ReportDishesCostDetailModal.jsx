import React, { useEffect, useState } from "react";

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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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

function formatQty(value, unit, { digits = 3 } = {}) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);

  return unit ? `${formatted} ${unit}` : formatted;
}

function formatVolume(value, unit) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  const valueInKg = isGramUnit(unit) ? num / 1000 : num;
  const displayUnit = isGramUnit(unit) || isKgUnit(unit) ? "кг" : unit;

  return formatQty(valueInKg, displayUnit, { digits: 3 });
}

function formatPurchasePrice(value, unit) {
  const price = formatNumber(value, { digits: 2 });

  if (price === "—") {
    return price;
  }

  const normalizedUnit = String(unit || "").replace(/\.$/, "") || "ед.";

  return `${price} ₽/${normalizedUnit}`;
}

function formatFormulaNumber(value, digits = 3) {
  return formatNumber(value, { digits });
}

function formatFormulaQuantity(value, unit) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  const valueInKg = isGramUnit(unit) ? num / 1000 : num;
  const displayUnit = isGramUnit(unit) || isKgUnit(unit) ? "кг" : unit;

  return `${formatFormulaNumber(valueInKg)}${displayUnit ? ` ${displayUnit}` : ""}`;
}

function buildRowFormula(row) {
  const lines = [];

  if (
    row.outputQuantity != null &&
    row.quantity != null &&
    row.bruttoQuantity != null &&
    row.writeOff != null
  ) {
    lines.push(
      `Пересчёт объёма: ${formatFormulaQuantity(row.quantity, row.quantityUnit)} состава / ` +
        `${formatFormulaQuantity(row.outputQuantity, row.quantityUnit)} выхода × ` +
        `${formatFormulaQuantity(row.bruttoQuantity, row.writeOffUnit)} brutto = ` +
        `${formatFormulaQuantity(row.writeOff, row.writeOffUnit)} товара`,
    );
  } else if (row.writeOff != null) {
    lines.push(
      `Объём без преобразования: ${formatFormulaQuantity(row.writeOff, row.writeOffUnit)}`,
    );
  }

  if (row.writeOff != null && row.unitPrice != null) {
    const priceUnit = String(row.writeOffUnit || "").replace(/\.$/, "") || "ед.";
    lines.push(
      `Стоимость: ${formatFormulaQuantity(row.writeOff, row.writeOffUnit)} × ` +
        `${formatFormulaNumber(row.unitPrice, 2)} ₽/${priceUnit} = ${formatMoney(row.cost)}`,
    );
  }

  return lines;
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

  if (isKgUnit(itemUnit)) {
    return { value: quantity, unit: "кг" };
  }

  if (isGramUnit(itemUnit)) {
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
        outputQuantity: prepParent?.output_quantity ?? null,
        bruttoQuantity: node.brutto_quantity ?? null,
        unitPrice: node.unit_price,
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

function getPointScopeValue(point, index) {
  return `point:${point?.point_id ?? point?.base ?? index}`;
}

function buildPointDetail(data, point) {
  if (!point) {
    return data;
  }

  return {
    ...data,
    item: {
      ...data?.item,
      id: point.item_id ?? data?.item?.id,
      name: point.item_name ?? data?.item?.name,
      weight: point.item_weight ?? data?.item?.weight,
    },
    filters: {
      ...data?.filters,
      points_label: point.point_name || "Кафе",
      price_period: point.price_period ?? data?.filters?.price_period,
    },
    period_stats: point.period_stats ?? {},
    unit_cost: point.unit_cost,
    known_cost: point.known_cost,
    cost_complete: point.cost_complete,
    formula: point.formula,
    tree: point.tree,
    ingredients: point.ingredients,
    warnings: point.warnings,
    aggregation: null,
  };
}

function CostCalcTable({ rows, totalAmount }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 1.5,
        overflowX: "auto",
      }}
    >
      <Table
        size="small"
        sx={{ minWidth: 1060, width: "100%", tableLayout: "fixed" }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headCellSx, textAlign: "left", width: "16%" }}>
              Исходный состав
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "left", width: "16%" }}>
              Состав в товаре
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right", width: "8%" }}>
              Объём закупки
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "right", width: "12%" }}>
              Стоимость закупки
            </TableCell>
            <TableCell sx={{ ...headCellSx, textAlign: "left", width: "38%" }}>
              Формула расчёта
            </TableCell>
            <TableCell
              sx={{ ...headCellSx, textAlign: "right", width: "10%", whiteSpace: "normal" }}
            >
              Итоговая стоимость
            </TableCell>
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
                <Typography sx={{ fontFamily: FONT, fontSize: 13 }}>{row.sourceName}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 11, color: "#6b7280", mt: 0.25 }}>
                  В составе: {formatVolume(row.quantity, row.quantityUnit)}
                </Typography>
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "left", whiteSpace: "normal" }}>
                {row.transformedName}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                {formatVolume(row.writeOff, row.writeOffUnit)}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "right", whiteSpace: "nowrap" }}>
                {formatPurchasePrice(row.unitPrice, row.writeOffUnit)}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: "left", whiteSpace: "normal" }}>
                {buildRowFormula(row).map((line, lineIndex) => (
                  <Typography
                    key={`${line}-${lineIndex}`}
                    sx={{
                      fontFamily: FONT,
                      fontSize: 11,
                      color: lineIndex === 0 ? "#4b5563" : "#111827",
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      lineHeight: 1.45,
                    }}
                  >
                    {line}
                  </Typography>
                ))}
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

function ReportDishesCostDetailModal({
  open,
  onClose,
  loading,
  error,
  data,
  cafeLabel,
  dateStart,
  dateEnd,
}) {
  const [selectedScope, setSelectedScope] = useState("all");
  const points = Array.isArray(data?.points) ? data.points : [];

  useEffect(() => {
    if (open) {
      setSelectedScope("all");
    }
  }, [open, data]);

  const selectedPointIndex = points.findIndex(
    (point, index) => getPointScopeValue(point, index) === selectedScope,
  );
  const selectedPoint = selectedPointIndex >= 0 ? points[selectedPointIndex] : null;
  const activeData = buildPointDetail(data, selectedPoint);
  const item = activeData?.item || {};
  const filters = activeData?.filters || {};
  const periodStats = activeData?.period_stats || {};
  const formula = activeData?.formula || {};
  const warnings = Array.isArray(activeData?.warnings) ? activeData.warnings : [];
  const tree = Array.isArray(activeData?.tree) ? activeData.tree : [];
  const calcRows = collectCalcRows(tree);
  const totalAmount = activeData?.unit_cost ?? formula.result ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          fontFamily: FONT,
          maxHeight: "90vh",
          width: "calc(100vw - 32px)",
          maxWidth: "1800px",
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
              <MetaChip label={filters.production_type} />
              <MetaChip label={resolvePricePeriodLabel(filters.price_period)} />
              {item.weight != null ? <MetaChip label={`Выход: ${item.weight}`} /> : null}
            </Stack>

            {points.length > 1 ? (
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  pb: 0.5,
                }}
              >
                <ToggleButtonGroup
                  exclusive
                  value={selectedScope}
                  onChange={(event, value) => {
                    if (value !== null) {
                      setSelectedScope(value);
                    }
                  }}
                  aria-label="Выбор кафе для расчёта себестоимости"
                  sx={{
                    minWidth: "max-content",
                    "& .MuiToggleButton-root": {
                      fontFamily: FONT,
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      textTransform: "none",
                      color: "#374151",
                      borderColor: "#d1d5db",
                      whiteSpace: "nowrap",
                      px: 1.5,
                      py: 1,
                    },
                    "& .MuiToggleButton-root.Mui-selected": {
                      color: "#d50032",
                      backgroundColor: "rgba(213, 0, 50, 0.08)",
                    },
                    "& .MuiToggleButton-root.Mui-selected:hover": {
                      backgroundColor: "rgba(213, 0, 50, 0.12)",
                    },
                  }}
                >
                  <ToggleButton value="all">
                    Все выбранные кафе · {formatMoney(data?.unit_cost)}
                  </ToggleButton>
                  {points.map((point, index) => (
                    <ToggleButton
                      key={getPointScopeValue(point, index)}
                      value={getPointScopeValue(point, index)}
                    >
                      {point?.point_name || "Кафе"} · {formatMoney(point?.unit_cost)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            ) : null}

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

export default ReportDishesCostDetailModal;
