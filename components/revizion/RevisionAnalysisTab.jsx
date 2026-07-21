import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

// import { api_laravel_local as api_laravel } from "@/src/api_new";
import { api_laravel } from "@/src/api_new";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

const ALL_POSITIONS = { id: "__all__", name: "Все позиции" };

const getResponseData = (response) => response?.data ?? response;

const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 3,
});
const moneyFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
  style: "currency",
  currency: "RUB",
});

const formatNumber = (value) => numberFormat.format(Number(value || 0));
const formatMoney = (value) =>
  value === null || value === undefined ? "—" : moneyFormat.format(value);
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
    : "—";

const valueColor = (value) => {
  if (Number(value) < 0) return "error.main";
  if (Number(value) > 0) return "success.main";
  return "text.primary";
};

const reportTableSx = {
  "& .MuiTableCell-root": {
    px: 1.25,
    py: 1.125,
    borderColor: "divider",
    whiteSpace: "nowrap",
  },
  "& .MuiTableCell-head": {
    bgcolor: "background.paper",
    color: "text.secondary",
    fontWeight: 600,
    borderBottom: "2px solid",
    borderBottomColor: "divider",
  },
  "& .MuiTableRow-root:hover .MuiTableCell-body": {
    bgcolor: "action.hover",
  },
};

const tableLinkSx = {
  p: 0,
  minWidth: 0,
  color: "text.primary",
  textTransform: "none",
  textAlign: "left",
  fontWeight: 500,
  "&:hover": {
    color: "primary.main",
    bgcolor: "transparent",
  },
};

const sourcePositionsLabel = (position) => {
  const names = position?.source_position_names || [];
  return names.length > 1 ? `Учитываются заготовки: ${names.join(", ")}` : "";
};

const priceDiagnosticText = {
  no_item_mapping: "Нет связи с номенклатурой накладных (items.pf_id)",
  no_purchases: "За всю историю кафе до конечной ревизии нет действующих приходных накладных",
  price_not_filled: "Приходы есть, но сумма с НДС не заполнена или равна нулю",
  invalid_quantity_or_unit:
    "Цена есть, но количество или коэффициент единицы не позволяют её рассчитать",
  no_valid_weighted_price: "Строки есть, но не получилась положительная взвешенная цена",
};

function PositionSelect({ positions, value, onChange, disabled }) {
  const positionKey = (position) => `${position.scope}:${position.id}`;
  const scopeLabels = { food: "Продукты и напитки", household: "Хозтовары" };
  const sortedPositions = useMemo(
    () =>
      [...positions].sort((left, right) => {
        const scopeCompare = (left.scope === "food" ? 0 : 1) - (right.scope === "food" ? 0 : 1);
        if (scopeCompare) return scopeCompare;
        const categoryCompare = String(left.category_name || "").localeCompare(
          String(right.category_name || ""),
          "ru",
        );
        return categoryCompare || left.name.localeCompare(right.name, "ru");
      }),
    [positions],
  );
  const options = useMemo(() => [ALL_POSITIONS, ...sortedPositions], [sortedPositions]);
  const positionsByScope = useMemo(() => {
    const grouped = new Map();

    for (const position of positions) {
      if (!grouped.has(position.scope)) grouped.set(position.scope, []);
      grouped.get(position.scope).push(position);
    }

    return grouped;
  }, [positions]);
  const positionsByCategory = useMemo(() => {
    const grouped = new Map();

    for (const position of positions) {
      const category = String(position.category_name || "Без категории").trim();
      const key = `${position.scope}::${category}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(position);
    }

    return grouped;
  }, [positions]);
  const firstCategoryByScope = useMemo(() => {
    const result = new Map();

    for (const position of sortedPositions) {
      if (!result.has(position.scope)) {
        result.set(position.scope, String(position.category_name || "Без категории").trim());
      }
    }

    return result;
  }, [sortedPositions]);
  const selectedIds = useMemo(() => new Set(value.map(positionKey)), [value]);
  const allSelected = positions.length > 0 && value.length === positions.length;
  const visibleValue = allSelected ? [ALL_POSITIONS] : value;

  const togglePositions = (targetPositions) => {
    const targetSelected = targetPositions.every((position) =>
      selectedIds.has(positionKey(position)),
    );
    const next = new Map(value.map((position) => [positionKey(position), position]));

    for (const position of targetPositions) {
      const key = positionKey(position);
      if (targetSelected) next.delete(key);
      else next.set(key, position);
    }

    onChange(Array.from(next.values()));
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      disabled={disabled}
      options={options}
      value={visibleValue}
      isOptionEqualToValue={(option, selected) =>
        option.id === selected.id &&
        (option.id === ALL_POSITIONS.id || option.scope === selected.scope)
      }
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => (option.id === ALL_POSITIONS.id ? option.id : positionKey(option))}
      groupBy={(option) =>
        option.id === ALL_POSITIONS.id
          ? "__all__"
          : `${option.scope}::${String(option.category_name || "Без категории").trim()}`
      }
      onChange={(_, next, reason, details) => {
        if (reason === "clear") {
          onChange([]);
          return;
        }

        if (details?.option?.id === ALL_POSITIONS.id) {
          onChange(allSelected ? [] : positions);
          return;
        }

        if (details?.option) togglePositions([details.option]);
      }}
      renderOption={(props, option, state) => {
        const { key, style, ...optionProps } = props;
        return (
          <li
            key={key}
            {...optionProps}
            style={{ ...style, paddingLeft: option.id === ALL_POSITIONS.id ? 16 : 48 }}
          >
            <Checkbox
              size="small"
              checked={
                option.id === ALL_POSITIONS.id ? allSelected : selectedIds.has(positionKey(option))
              }
            />
            <Box>
              <Typography variant="body2">{option.name}</Typography>
              {sourcePositionsLabel(option) ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {sourcePositionsLabel(option)}
                </Typography>
              ) : null}
            </Box>
          </li>
        );
      }}
      renderGroup={(params) => (
        <Box
          component="li"
          key={params.key}
          sx={{ listStyle: "none" }}
        >
          {params.group !== "__all__"
            ? (() => {
                const [scope, category] = params.group.split("::");
                const scopePositions = positionsByScope.get(scope) || [];
                const scopeSelectedCount = scopePositions.filter((position) =>
                  selectedIds.has(positionKey(position)),
                ).length;
                const scopeSelected =
                  scopePositions.length > 0 && scopeSelectedCount === scopePositions.length;
                const categoryPositions = positionsByCategory.get(params.group) || [];
                const selectedCount = categoryPositions.filter((position) =>
                  selectedIds.has(positionKey(position)),
                ).length;
                const categorySelected =
                  categoryPositions.length > 0 && selectedCount === categoryPositions.length;
                const isFirstCategory = firstCategoryByScope.get(scope) === category;

                return (
                  <>
                    {isFirstCategory ? (
                      <Box
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePositions(scopePositions);
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 1,
                          py: 0.75,
                          bgcolor: "action.hover",
                          cursor: "pointer",
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={scopeSelected}
                          indeterminate={scopeSelectedCount > 0 && !scopeSelected}
                        />
                        <Typography
                          component="span"
                          fontWeight={600}
                        >
                          {scopeLabels[scope]} ({scopeSelectedCount}/{scopePositions.length})
                        </Typography>
                      </Box>
                    ) : null}
                    <Box
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePositions(categoryPositions);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        pl: 3,
                        pr: 1,
                        py: 0.5,
                        bgcolor: "background.paper",
                        cursor: "pointer",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={categorySelected}
                        indeterminate={selectedCount > 0 && !categorySelected}
                      />
                      <Typography
                        component="span"
                        variant="subtitle2"
                      >
                        {category} ({selectedCount}/{categoryPositions.length})
                      </Typography>
                    </Box>
                  </>
                );
              })()
            : null}
          <Box
            component="ul"
            sx={{ p: 0 }}
          >
            {params.children}
          </Box>
        </Box>
      )}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id === ALL_POSITIONS.id ? option.id : positionKey(option)}
            size="small"
            label={
              option.id === ALL_POSITIONS.id ? `Все позиции (${positions.length})` : option.name
            }
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Позиции"
          placeholder="Выберите позиции"
        />
      )}
    />
  );
}

function RevisionSelect({ label, options, value, onChange, disabled }) {
  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      options={options}
      value={value}
      onChange={(_, next) => onChange(next)}
      isOptionEqualToValue={(option, selected) => option.date === selected.date}
      getOptionLabel={(option) => formatDate(option.date)}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const participantLines = option.participants?.map((participant) => (
          <Typography
            key={`${participant.point_id}-${participant.revision_id}`}
            variant="caption"
            component="div"
          >
            {participant.point_name}: {participant.user_name || "Автор не указан"}
            {participant.role ? `, ${participant.role}` : ""}
            {participant.offset_days
              ? ` (${participant.offset_days > 0 ? "+" : ""}${participant.offset_days} дн.)`
              : ""}
          </Typography>
        ));

        return (
          <Tooltip
            key={key}
            placement="right"
            title={<Box sx={{ p: 0.5 }}>{participantLines}</Box>}
          >
            <li {...optionProps}>
              <Box>
                <Typography variant="body2">{formatDate(option.date)}</Typography>
                <Typography
                  variant="caption"
                  color={option.complete ? "text.secondary" : "warning.main"}
                >
                  {option.matched_points} из {option.total_points} кафе
                </Typography>
              </Box>
            </li>
          </Tooltip>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
        />
      )}
    />
  );
}

function SummaryCard({ title, value, subtitle, color }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, height: "100%" }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{ mt: 0.5, color: color || "text.primary" }}
      >
        {value}
      </Typography>
      {subtitle ? (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

function RevisionDiagnostic({ label, revision }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={revision ? "default" : "warning"}
      label={
        revision
          ? `${label}: ${formatDate(revision.date)}, ID ${revision.id}${revision.offset_days ? `, смещение ${revision.offset_days > 0 ? "+" : ""}${revision.offset_days} дн.` : ""}`
          : `${label}: не найдена`
      }
    />
  );
}

function CalculationDetailDialog({ detail, onClose }) {
  if (!detail) return null;

  const { point, row, scope } = detail;
  const isFood = scope === "food";
  const unit = row.unit || "ед.";
  const quantity = (value) => `${formatNumber(value)} ${unit}`;
  const amountSeverity = isFood
    ? Number(row.difference) < 0
      ? "error"
      : Number(row.difference) > 0
        ? "success"
        : "info"
    : Number(row.consumption) < 0
      ? "warning"
      : "info";
  const amountText = isFood
    ? Number(row.difference) < 0
      ? "Недостача: фактический остаток меньше ожидаемого."
      : Number(row.difference) > 0
        ? "Излишек: фактический остаток больше ожидаемого."
        : "Фактический остаток совпал с ожидаемым."
    : Number(row.consumption) < 0
      ? "Расход отрицательный: конечный остаток больше начального остатка и учтённого прихода."
      : "Показан расчётный расход хозтовара за выбранный период.";
  const rows = isFood
    ? [
        [
          "Начальный остаток",
          quantity(row.start_balance),
          `revizion_res, ревизия ID ${point.start_revision?.id || "—"}`,
        ],
        [
          "Чистый приход",
          quantity(row.purchases),
          "billing + billing_items, с корректировками и возвратами",
        ],
        ["Программный расход", quantity(row.sales), "ras_by_pf_full"],
        ["Списания", quantity(row.writeoffs), "подтверждённый журнал списаний"],
        [
          "Ожидаемый остаток",
          quantity(row.expected_balance),
          "начало + приход − расход − списания",
        ],
        [
          "Фактический остаток",
          quantity(row.end_balance),
          `revizion_res, ревизия ID ${point.end_revision?.id || "—"}`,
        ],
        ["Расхождение", quantity(row.difference), "факт − ожидаемый остаток"],
        [
          "Закупочная цена",
          row.unit_price === null ? "—" : `${formatMoney(row.unit_price)}/${unit}`,
          "последняя действующая закупочная цена до конечной ревизии",
        ],
        ["Сумма", formatMoney(row.amount), "расхождение × закупочная цена"],
      ]
    : [
        [
          "Начальный остаток",
          quantity(row.start_balance),
          `revizion_res, ревизия ID ${point.start_revision?.id || "—"}`,
        ],
        [
          "Чистый приход",
          quantity(row.purchases),
          "billing + billing_items, с корректировками и возвратами",
        ],
        [
          "Конечный остаток",
          quantity(row.end_balance),
          `revizion_res, ревизия ID ${point.end_revision?.id || "—"}`,
        ],
        ["Расход", quantity(row.consumption), "начало + приход − конец"],
        [
          "Закупочная цена",
          row.unit_price === null ? "—" : `${formatMoney(row.unit_price)}/${unit}`,
          "последняя действующая закупочная цена до конечной ревизии",
        ],
        ["Сумма", formatMoney(row.amount), "расход × закупочная цена"],
      ];

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      onClose={onClose}
    >
      <DialogTitle>Проверка расчёта</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{row.position_name}</Typography>
            <Typography color="text.secondary">{point.name}</Typography>
          </Box>

          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={1}
          >
            <RevisionDiagnostic
              label="Начальная"
              revision={point.start_revision}
            />
            <RevisionDiagnostic
              label="Конечная"
              revision={point.end_revision}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`Интервал: [${formatDate(point.start_revision?.date)}, ${formatDate(point.end_revision?.date)})`}
            />
          </Stack>

          <Alert severity={amountSeverity}>{amountText}</Alert>

          <TableContainer
            component={Paper}
            variant="outlined"
          >
            <Table
              size="small"
              sx={{ minWidth: 720 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Показатель</TableCell>
                  <TableCell align="right">Значение</TableCell>
                  <TableCell>Источник или формула</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(([label, value, source]) => (
                  <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell
                      align="right"
                      sx={
                        label === "Расхождение" || label === "Сумма"
                          ? {
                              color: valueColor(
                                label === "Расхождение" ? row.difference : row.amount,
                              ),
                              fontWeight: 600,
                            }
                          : undefined
                      }
                    >
                      {value}
                    </TableCell>
                    <TableCell>{source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Typography
              fontWeight={600}
              gutterBottom
            >
              Подстановка значений
            </Typography>
            {isFood ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Ожидаемый остаток: {quantity(row.start_balance)} + {quantity(row.purchases)} −{" "}
                  {quantity(row.sales)} − {quantity(row.writeoffs)} ={" "}
                  {quantity(row.expected_balance)}
                </Typography>
                <Typography variant="body2">
                  Расхождение: {quantity(row.end_balance)} − {quantity(row.expected_balance)} ={" "}
                  {quantity(row.difference)}
                </Typography>
                <Typography variant="body2">
                  Сумма: {quantity(row.difference)} ×{" "}
                  {row.unit_price === null
                    ? "цена отсутствует"
                    : `${formatMoney(row.unit_price)}/${unit}`}{" "}
                  = {formatMoney(row.amount)}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Расход: {quantity(row.start_balance)} + {quantity(row.purchases)} −{" "}
                  {quantity(row.end_balance)} = {quantity(row.consumption)}
                </Typography>
                <Typography variant="body2">
                  Сумма: {quantity(row.consumption)} ×{" "}
                  {row.unit_price === null
                    ? "цена отсутствует"
                    : `${formatMoney(row.unit_price)}/${unit}`}{" "}
                  = {formatMoney(row.amount)}
                </Typography>
              </Stack>
            )}
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            PF ID: {(row.position_pf_ids || [row.position_id]).join(", ")}
            {row.source_position_names?.length
              ? ` · Источники: ${row.source_position_names.join(", ")}`
              : ""}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

function PriceDiagnosticTable({ positions, priceBeforeDate }) {
  if (!positions?.length) return null;

  return (
    <Stack
      spacing={1}
      sx={{ mt: 1.5 }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Цена искалась за всю историю кафе по действующим приходам и корректировкам до{" "}
        {formatDate(priceBeforeDate)}, не включая эту дату. Ограничения по давности закупки нет;
        возвраты не используются как источник цены.
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
      >
        <Table
          size="small"
          sx={{ minWidth: 920 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Позиция</TableCell>
              <TableCell>Причина</TableCell>
              <TableCell>Связей с items</TableCell>
              <TableCell>Строк накладных</TableCell>
              <TableCell>С ценой</TableCell>
              <TableCell>Последняя поставка</TableCell>
              <TableCell>Последняя цена</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => {
              const diagnostic = position.diagnostic || {};
              return (
                <TableRow key={position.id}>
                  <TableCell>
                    <Typography variant="body2">{position.name}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      PF: {(position.pf_ids || [position.id]).join(", ")} ·{" "}
                      {position.unit || "единица не указана"}
                    </Typography>
                    {sourcePositionsLabel(position) ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {sourcePositionsLabel(position)}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {priceDiagnosticText[diagnostic.reason] || "Нет подходящей закупочной цены"}
                  </TableCell>
                  <TableCell>{diagnostic.linked_items_count ?? "—"}</TableCell>
                  <TableCell>{diagnostic.billing_rows_count ?? "—"}</TableCell>
                  <TableCell>{diagnostic.positive_price_rows_count ?? "—"}</TableCell>
                  <TableCell>{formatDate(diagnostic.last_delivery_date)}</TableCell>
                  <TableCell>{formatDate(diagnostic.last_positive_price_date)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function WarningDetails({ warning }) {
  const details = warning.details || {};

  if (warning.code === "missing_purchase_price") {
    return (
      <>
        <Stack
          direction="row"
          useFlexGap
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 1 }}
        >
          <RevisionDiagnostic
            label="Начальная"
            revision={details.start_revision}
          />
          <RevisionDiagnostic
            label="Конечная"
            revision={details.end_revision}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Источник: ${details.price_source || "накладные"}`}
          />
        </Stack>
        <PriceDiagnosticTable
          positions={details.positions}
          priceBeforeDate={details.price_before_date}
        />
      </>
    );
  }

  if (warning.code === "missing_interval_price") {
    const intervals = details.intervals || [];
    return (
      <Stack
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Typography variant="body2">
          Позиция: {details.position?.name || "—"} (ID {details.position?.id || "—"})
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Интервалы без цены:{" "}
          {intervals
            .map((item) => `${formatDate(item.date_start)} — ${formatDate(item.date_end)}`)
            .join("; ") || "—"}
        </Typography>
        <PriceDiagnosticTable
          positions={details.position ? [details.position] : []}
          priceBeforeDate={details.price_before_date}
        />
      </Stack>
    );
  }

  if (warning.code === "revision_not_found" || warning.code === "invalid_matched_period") {
    return (
      <Stack
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Целевой период: {formatDate(details.target_start)} — {formatDate(details.target_end)}
          {details.tolerance_days ? `; допустимое отклонение ±${details.tolerance_days} дней` : ""}.
        </Typography>
        {details.search_from && details.search_to ? (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Проверенный диапазон ревизий: {formatDate(details.search_from)} —{" "}
            {formatDate(details.search_to)}.
          </Typography>
        ) : null}
        <Stack
          direction="row"
          useFlexGap
          flexWrap="wrap"
          gap={1}
        >
          <RevisionDiagnostic
            label="Начальная"
            revision={details.start_revision}
          />
          <RevisionDiagnostic
            label="Конечная"
            revision={details.end_revision}
          />
        </Stack>
      </Stack>
    );
  }

  return null;
}

function WarningList({ warnings }) {
  if (!warnings?.length) return null;

  const affectedPoints = new Set(warnings.map((warning) => warning.point_id).filter(Boolean)).size;
  const affectedPositions = warnings.reduce(
    (sum, warning) => sum + Number(warning.details?.count || (warning.details?.position ? 1 : 0)),
    0,
  );

  return (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{ "&:before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <WarningAmberOutlinedIcon color="warning" />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={600}>Предупреждения расчёта ({warnings.length})</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {affectedPoints ? `Кафе: ${affectedPoints}` : ""}
              {affectedPoints && affectedPositions ? " · " : ""}
              {affectedPositions
                ? `Позиции: ${affectedPositions}`
                : "Нажмите, чтобы посмотреть подробности"}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          {warnings.map((warning, index) => (
            <Alert
              severity="warning"
              variant="outlined"
              key={`${warning.point_id || "common"}-${warning.code || "warning"}-${index}`}
            >
              <AlertTitle>{warning.point_name || "Предупреждение"}</AlertTitle>
              {warning.message}
              <WarningDetails warning={warning} />
            </Alert>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function SingleCafeReport({
  report,
  scope,
  onPositionClick,
  onCalculationClick,
  hideInfoIcon = false,
  hideUnit = false,
  neutralValues = false,
}) {
  const [orderBy, setOrderBy] = useState("position_name");
  const [order, setOrder] = useState("asc");
  const rows = report.rows || [];
  const total = rows.reduce((sum, row) => sum + (row.amount === null ? 0 : Number(row.amount)), 0);
  const missingPrices = rows.filter((row) => row.amount === null).length;
  const nonZero = rows.filter((row) => Math.abs(Number(row.quantity)) > 0.0005).length;
  const largest = [...rows]
    .filter((row) => row.amount !== null)
    .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))[0];

  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        const leftValue = left[orderBy];
        const rightValue = right[orderBy];
        const result =
          typeof leftValue === "string"
            ? leftValue.localeCompare(rightValue, "ru")
            : Number(leftValue ?? -Infinity) - Number(rightValue ?? -Infinity);
        return order === "asc" ? result : -result;
      }),
    [order, orderBy, rows],
  );

  const requestSort = (field) => {
    if (orderBy === field) setOrder((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setOrderBy(field);
      setOrder("asc");
    }
  };

  const columns =
    scope === "food"
      ? [
          ["position_name", "Позиция"],
          ["start_balance", "Ост. нач."],
          ["purchases", "Закупки"],
          ["sales", "Продано"],
          ["writeoffs", "Списано"],
          ["expected_balance", "Ожид. остаток"],
          ["end_balance", "Факт кон."],
          ["difference", "Итого"],
          ["amount", "Сумма, ₽"],
        ]
      : [
          ["position_name", "Позиция"],
          ["start_balance", "Ост. нач."],
          ["purchases", "Закупки"],
          ["end_balance", "Ост. кон."],
          ["consumption", "Расход"],
          ["unit_price", "Ср. цена, ₽"],
          ["amount", "Сумма, ₽"],
        ];

  return (
    <Stack spacing={2}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={scope === "food" ? "Итоговое расхождение" : "Стоимость расхода"}
            value={formatMoney(total)}
            color={scope === "food" ? valueColor(total) : undefined}
            subtitle={missingPrices ? `Без цены: ${missingPrices}` : "Все цены учтены"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={scope === "food" ? "Позиции с расхождением" : "Позиции с расходом"}
            value={nonZero}
            subtitle={`из ${rows.length}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Самая крупная сумма"
            value={largest ? formatMoney(largest.amount) : "—"}
            subtitle={largest?.position_name || "Нет данных"}
            color={scope === "food" && largest ? valueColor(largest.amount) : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Подобранный период"
            value={`${formatDate(report.points[0]?.start_revision?.date)} — ${formatDate(report.points[0]?.end_revision?.date)}`}
            subtitle={report.points[0]?.name}
          />
        </Grid>
      </Grid>

      <TableContainer sx={{ maxWidth: "100%" }}>
        <Table
          stickyHeader
          size="small"
          sx={{ ...reportTableSx, minWidth: scope === "food" ? 1120 : 760 }}
        >
          <TableHead>
            <TableRow>
              {columns.map(([field, label]) => (
                <TableCell
                  key={field}
                  align={field === "position_name" ? "left" : "right"}
                >
                  <TableSortLabel
                    active={orderBy === field}
                    direction={orderBy === field ? order : "asc"}
                    onClick={() => requestSort(field)}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow
                hover
                key={row.position_id}
              >
                {columns.map(([field]) => (
                  <TableCell
                    key={field}
                    align={field === "position_name" ? "left" : "right"}
                    sx={
                      !neutralValues && (field === "difference" || field === "amount")
                        ? { color: valueColor(row[field]) }
                        : undefined
                    }
                  >
                    {field === "position_name" ? (
                      <>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => onPositionClick(row.position_id)}
                          sx={tableLinkSx}
                        >
                          {row.position_name}
                          <Box
                            component="span"
                            sx={{ ml: 0.75, color: "text.secondary", fontWeight: 700 }}
                          >
                            ›
                          </Box>
                        </Button>
                        {!hideUnit ? (
                          <Typography
                            display="block"
                            variant="caption"
                            color="text.secondary"
                          >
                            {row.unit || "—"}
                          </Typography>
                        ) : null}
                        {sourcePositionsLabel(row) ? (
                          <Typography
                            display="block"
                            variant="caption"
                            color="text.secondary"
                          >
                            {sourcePositionsLabel(row)}
                          </Typography>
                        ) : null}
                      </>
                    ) : field === "unit_price" ? (
                      row[field] === null ? (
                        "—"
                      ) : (
                        `${formatMoney(row[field])}/${row.unit || "ед."}`
                      )
                    ) : field === "amount" ? (
                      <Tooltip title="Показать полный расчёт">
                        <Button
                          variant="text"
                          size="small"
                          endIcon={
                            hideInfoIcon ? undefined : <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                          }
                          aria-label={`Проверить расчёт ${row.position_name}`}
                          onClick={() => onCalculationClick(row)}
                          sx={{
                            p: 0,
                            minWidth: 0,
                            color: "inherit",
                            textTransform: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatMoney(row[field])}
                        </Button>
                      </Tooltip>
                    ) : (
                      formatNumber(row[field])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function MultiCafeReport({
  report,
  onPositionClick,
  onPointClick,
  onCalculationClick,
  compact = false,
  hideQuantity = false,
  hideInfoIcon = false,
  hideUnit = false,
  neutralValues = false,
}) {
  const isFood = report.scope === "food";
  const metricLabel = isFood ? "Итого" : "Расход";
  const rowsByPosition = useMemo(() => {
    const map = new Map();
    for (const position of report.positions || []) map.set(Number(position.id), new Map());
    for (const row of report.rows || []) {
      if (!map.has(Number(row.position_id))) map.set(Number(row.position_id), new Map());
      map.get(Number(row.position_id)).set(Number(row.point_id), row);
    }
    return map;
  }, [report]);

  const matrixPositions = useMemo(
    () =>
      [...(report.positions || [])].sort((left, right) => {
        const leftRows = rowsByPosition.get(Number(left.id)) || new Map();
        const rightRows = rowsByPosition.get(Number(right.id)) || new Map();
        const leftScore = [...leftRows.values()].reduce(
          (sum, row) => sum + Math.abs(Number(row.amount || 0)),
          0,
        );
        const rightScore = [...rightRows.values()].reduce(
          (sum, row) => sum + Math.abs(Number(row.amount || 0)),
          0,
        );

        return rightScore - leftScore || left.name.localeCompare(right.name, "ru");
      }),
    [report.positions, rowsByPosition],
  );

  const pointTotals = useMemo(() => {
    const totals = new Map();
    for (const point of report.points || [])
      totals.set(Number(point.id), { amount: 0, quantity: 0, missing: false });
    for (const row of report.rows || []) {
      const total = totals.get(Number(row.point_id));
      if (!total) continue;
      total.quantity += Number(row.quantity || 0);
      if (row.amount === null) total.missing = true;
      else total.amount += Number(row.amount);
    }
    return totals;
  }, [report]);

  return (
    <TableContainer sx={{ isolation: "isolate" }}>
      <Table
        size="small"
        sx={{
          ...reportTableSx,
          tableLayout: "auto",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: Math.max(
            520,
            (compact ? 145 : 160) +
              report.points.length * (hideQuantity ? (compact ? 126 : 146) : compact ? 182 : 224),
          ),
          "& .matrixGroupStart": {
            borderLeft: "1px solid",
            borderLeftColor: "divider",
          },
          "& .matrixPositionCell": {
            position: "sticky",
            left: 0,
            zIndex: 5,
            width: compact ? 145 : 150,
            minWidth: compact ? 145 : 150,
            maxWidth: compact ? 145 : 150,
            overflow: "hidden",
            whiteSpace: "normal",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderRightColor: "divider",
            boxShadow: "6px 0 8px -8px rgba(0, 0, 0, 0.45)",
          },
          "& .MuiTableHead-root .matrixPositionCell": {
            zIndex: 8,
          },
          "& .MuiTableFooter-root .matrixPositionCell": {
            zIndex: 7,
          },
          "& .MuiTableBody-root .MuiTableRow-root:hover .matrixPositionCell": {
            bgcolor: "background.paper",
          },
          "& .matrixValueCell": {
            fontSize: 14,
            fontVariantNumeric: "tabular-nums",
          },
          "& .matrixQuantityCell": {
            width: compact ? 56 : 82,
            minWidth: compact ? 56 : 82,
          },
          "& .matrixAmountCell": {
            width: compact ? 126 : hideQuantity ? 146 : 142,
            minWidth: compact ? 126 : hideQuantity ? 146 : 142,
          },
          ...(compact
            ? {
                "& .MuiTableCell-root": {
                  px: 0.75,
                  py: 0.5,
                  fontSize: "12px !important",
                  lineHeight: 1.2,
                },
                "& .MuiTableCell-root button": {
                  fontSize: "12px !important",
                },
                "& .MuiTableCell-root p, & .MuiTableCell-root span": {
                  fontSize: "inherit !important",
                },
                "& .MuiTableHead-root .MuiTableCell-root": {
                  fontSize: "11px !important",
                },
                "& .MuiTableHead-root .MuiTypography-caption": {
                  fontSize: "11px !important",
                },
                "& .matrixValueCell": { fontSize: "12px !important" },
              }
            : {}),
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              rowSpan={2}
              className="matrixPositionCell"
              sx={{ verticalAlign: "bottom" }}
            >
              Позиция
            </TableCell>
            {report.points.map((point) => (
              <TableCell
                key={point.id}
                colSpan={hideQuantity ? 1 : 2}
                align="center"
                className="matrixGroupStart"
                sx={{
                  minWidth: hideQuantity ? (compact ? 126 : 146) : compact ? 182 : 224,
                  py: compact ? 0.5 : 0.75,
                  borderBottomWidth: "1px !important",
                }}
              >
                <Tooltip title={point.name}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => onPointClick(point.id)}
                    sx={{
                      ...tableLinkSx,
                      maxWidth: 164,
                      justifyContent: "center",
                      textAlign: "center",
                      fontSize: compact ? 12 : 13,
                      lineHeight: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {point.address || point.name}
                    </Box>
                  </Button>
                </Tooltip>
                <Typography
                  display="block"
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.25, lineHeight: 1.2 }}
                >
                  {point.city_name}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {report.points.flatMap((point) => {
              const amountCell = (
                <TableCell
                  key={`${point.id}-amount`}
                  align="right"
                  className={`${hideQuantity ? "matrixGroupStart " : ""}matrixAmountCell`}
                  sx={{ color: "text.secondary", fontSize: 12, fontWeight: 500 }}
                >
                  Сумма, ₽
                </TableCell>
              );

              if (hideQuantity) return [amountCell];

              return [
                <TableCell
                  key={`${point.id}-quantity`}
                  align="right"
                  className="matrixGroupStart matrixQuantityCell"
                  sx={{ color: "text.secondary", fontSize: 12, fontWeight: 500 }}
                >
                  {metricLabel}
                </TableCell>,
                amountCell,
              ];
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {matrixPositions.map((position) => {
            const byPoint = rowsByPosition.get(Number(position.id)) || new Map();
            return (
              <TableRow
                hover
                key={position.id}
              >
                <TableCell className="matrixPositionCell">
                  <Tooltip title={position.name}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => onPositionClick(position.id)}
                      sx={{
                        ...tableLinkSx,
                        width: "100%",
                        maxWidth: "100%",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        fontSize: compact ? 12 : 13,
                        whiteSpace: "normal",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          lineHeight: 1.25,
                          overflowWrap: "anywhere",
                          whiteSpace: "normal",
                        }}
                      >
                        {position.name}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          flex: "0 0 auto",
                          ml: 0.5,
                          color: "text.secondary",
                          fontWeight: 700,
                        }}
                      >
                        ›
                      </Box>
                    </Button>
                  </Tooltip>
                  {!hideUnit ? (
                    <Typography
                      display="block"
                      variant="caption"
                      color="text.secondary"
                    >
                      {position.unit}
                    </Typography>
                  ) : null}
                </TableCell>
                {report.points.map((point) => {
                  const row = byPoint.get(Number(point.id));
                  const amountCell = (
                    <TableCell
                      key={`${point.id}-amount`}
                      align="right"
                      className={`${hideQuantity ? "matrixGroupStart " : ""}matrixAmountCell matrixValueCell`}
                      sx={{
                        color: neutralValues || !isFood ? "text.primary" : valueColor(row?.amount),
                      }}
                    >
                      {row ? (
                        <Tooltip title="Показать полный расчёт">
                          <Button
                            variant="text"
                            size="small"
                            endIcon={
                              hideInfoIcon ? undefined : <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                            }
                            aria-label={`Проверить расчёт ${row.position_name}, ${point.name}`}
                            onClick={() => onCalculationClick(row, point)}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              width: "100%",
                              color: "inherit",
                              fontSize: "inherit",
                              fontWeight: "inherit",
                              lineHeight: "inherit",
                              textTransform: "none",
                              textAlign: "right",
                              justifyContent: "flex-end",
                              whiteSpace: "nowrap",
                              "& .MuiButton-endIcon": {
                                flexShrink: 0,
                                ml: 0.5,
                                mr: 0,
                              },
                            }}
                          >
                            {formatMoney(row.amount)}
                          </Button>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  );

                  if (hideQuantity) return [amountCell];

                  return [
                    <TableCell
                      key={`${point.id}-quantity`}
                      align="right"
                      className="matrixGroupStart matrixQuantityCell matrixValueCell"
                      sx={{
                        color:
                          neutralValues || !isFood ? "text.primary" : valueColor(row?.quantity),
                      }}
                    >
                      {row ? formatNumber(row.quantity) : "—"}
                    </TableCell>,
                    amountCell,
                  ];
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                color: "text.primary",
                fontWeight: 700,
                borderTop: "2px solid",
                borderTopColor: "divider",
                borderBottom: 0,
              },
            }}
          >
            <TableCell className="matrixPositionCell">Итого по кафе</TableCell>
            {report.points.map((point) => {
              const total = pointTotals.get(Number(point.id));
              const amountCell = (
                <TableCell
                  key={`${point.id}-amount`}
                  align="right"
                  className={`${hideQuantity ? "matrixGroupStart " : ""}matrixAmountCell matrixValueCell`}
                  sx={{
                    color: neutralValues || !isFood ? "text.primary" : valueColor(total?.amount),
                  }}
                >
                  {formatMoney(total?.amount || 0)}
                  {total?.missing ? (
                    <Typography
                      display="block"
                      variant="caption"
                      color="warning.main"
                    >
                      есть позиции без цены
                    </Typography>
                  ) : null}
                </TableCell>
              );

              if (hideQuantity) return [amountCell];

              return [
                <TableCell
                  key={`${point.id}-quantity`}
                  align="right"
                  className="matrixGroupStart matrixQuantityCell matrixValueCell"
                  sx={{
                    color: neutralValues || !isFood ? "text.primary" : valueColor(total?.quantity),
                  }}
                >
                  {formatNumber(total?.quantity || 0)}
                </TableCell>,
                amountCell,
              ];
            })}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

function BarList({ rows, metric, onRowClick, prototypeStyle = false }) {
  const maxValue = Math.max(1, ...rows.map((row) => Math.abs(Number(row.value || 0))));

  if (!rows.length) {
    return <Alert severity="info">Нет данных для выбранного разреза.</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Box
          key={row.key}
          onClick={() => onRowClick?.(row)}
          sx={{
            ...(prototypeStyle
              ? {
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr) auto",
                    sm: "minmax(220px, 32%) minmax(220px, 1fr) 140px",
                  },
                  alignItems: "center",
                  columnGap: { xs: 1, sm: 2 },
                  rowGap: { xs: 0.75, sm: 0 },
                }
              : {}),
            ...(onRowClick ? { cursor: "pointer", "&:hover": { opacity: 0.78 } } : {}),
          }}
        >
          {prototypeStyle ? (
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, minWidth: 0, overflowWrap: "anywhere" }}
            >
              {row.label}
            </Typography>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography variant="body2">{row.label}</Typography>
              <Typography
                variant="body2"
                sx={{ color: valueColor(row.value), whiteSpace: "nowrap" }}
              >
                {metric === "amount"
                  ? formatMoney(row.value)
                  : `${formatNumber(row.value)} ${row.unit || ""}`}
              </Typography>
            </Stack>
          )}
          <Box
            sx={{
              mt: prototypeStyle ? 0 : 0.5,
              height: prototypeStyle ? 7 : 8,
              borderRadius: 4,
              bgcolor: "action.hover",
              overflow: "hidden",
              width: "100%",
              ...(prototypeStyle
                ? {
                    gridColumn: { xs: "1 / -1", sm: "auto" },
                    gridRow: { xs: 2, sm: "auto" },
                  }
                : {}),
            }}
          >
            <Box
              sx={{
                width: `${Math.max(1, (Math.abs(Number(row.value || 0)) / maxValue) * 100)}%`,
                height: "100%",
                bgcolor: prototypeStyle
                  ? (theme) => (theme.palette.mode === "dark" ? "#7f89aa" : "#6f7896")
                  : Number(row.value) < 0
                    ? "error.main"
                    : "success.main",
              }}
            />
          </Box>
          {prototypeStyle ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textAlign: "right",
              }}
            >
              {metric === "amount" ? formatMoney(row.value) : formatNumber(row.value)}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
}

function Drilldown({
  report,
  drill,
  onClose,
  onPointSelect,
  loadSeries,
  series,
  seriesLoading,
  hideCafeBreakdown = false,
  prototypeStyle = false,
}) {
  const [metric, setMetric] = useState("amount");
  const [view, setView] = useState(drill.pointId ? "revisions" : "cafes");
  const position = report.positions.find((item) => Number(item.id) === Number(drill.positionId));
  const periodStart = report.points?.[0]?.start_revision?.date;
  const periodEnd = report.points?.[0]?.end_revision?.date;

  useEffect(() => {
    setView(drill.pointId ? "revisions" : "cafes");
  }, [drill.pointId, drill.positionId]);

  useEffect(() => {
    if (view === "revisions" && position) loadSeries(position.id);
  }, [loadSeries, position, view]);

  const cafeRows = report.points.map((point) => {
    const row = report.rows.find(
      (item) =>
        Number(item.position_id) === Number(drill.positionId) &&
        Number(item.point_id) === Number(point.id),
    );
    return {
      key: point.id,
      label: point.name,
      value: row?.[metric] ?? 0,
      unit: row?.unit,
      pointId: point.id,
    };
  });

  const revisionRows = useMemo(() => {
    if (!series) return [];
    if (drill.pointId) {
      const point = series.points?.find((item) => Number(item.id) === Number(drill.pointId));
      return (point?.intervals || []).map((interval) => ({
        key: `${interval.date_start}-${interval.date_end}`,
        label: `${formatDate(interval.date_start)} — ${formatDate(interval.date_end)}`,
        value: interval[metric],
        unit: position?.unit,
      }));
    }

    return (series.totals_by_date || []).map((item) => ({
      key: item.date,
      label: formatDate(item.date),
      value: item[metric],
      unit: position?.unit,
    }));
  }, [drill.pointId, metric, position?.unit, series]);

  const cafeRevisionGroups = useMemo(
    () =>
      (series?.points || []).map((point) => {
        const rows = (point.intervals || []).map((interval) => ({
          key: `${point.id}-${interval.date_start}-${interval.date_end}`,
          label: `${formatDate(interval.date_start)} — ${formatDate(interval.date_end)}`,
          value: interval[metric],
          unit: position?.unit,
        }));

        return {
          point,
          rows,
          total: rows.reduce((sum, row) => sum + Number(row.value || 0), 0),
        };
      }),
    [metric, position?.unit, series],
  );

  return (
    <Paper
      variant={prototypeStyle ? undefined : "outlined"}
      elevation={0}
      sx={{
        p: prototypeStyle ? 0 : { xs: 2, sm: 3 },
        bgcolor: prototypeStyle ? "transparent" : undefined,
        border: prototypeStyle ? 0 : undefined,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={prototypeStyle ? 1.5 : 1}
        >
          {prototypeStyle ? (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onClose}
              variant="outlined"
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                flexShrink: 0,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                borderColor: "divider",
                color: "text.primary",
              }}
            >
              К сравнению
            </Button>
          ) : null}
          <Box sx={{ flex: prototypeStyle ? 1 : undefined, minWidth: 0 }}>
            {!prototypeStyle ? (
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onClose}
                sx={{ mb: 0.5 }}
              >
                К отчёту
              </Button>
            ) : null}
            <Typography
              variant="h6"
              sx={prototypeStyle ? { fontSize: 17, fontWeight: 600, lineHeight: 1.25 } : undefined}
            >
              {position?.name || "Динамика позиции"}
            </Typography>
            {prototypeStyle ? (
              <Typography
                display="block"
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {metric === "amount" ? "Сумма" : "Количество"}{" "}
                {view === "cafes" ? "по кафе" : "по ревизиям"}
                {periodStart && periodEnd
                  ? ` · ${formatDate(periodStart)} → ${formatDate(periodEnd)}`
                  : ""}
              </Typography>
            ) : null}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={prototypeStyle ? { ml: { sm: "auto" }, flexShrink: 0 } : undefined}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, next) => next && setView(next)}
              sx={
                prototypeStyle
                  ? {
                      order: 0,
                      borderRadius: 999,
                      bgcolor: "action.hover",
                      "& .MuiToggleButton-root": {
                        px: 1.5,
                        py: 0.75,
                        borderColor: "divider",
                        color: "text.secondary",
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "none",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                      },
                    }
                  : { order: 1 }
              }
            >
              <ToggleButton value="cafes">По кафе</ToggleButton>
              <ToggleButton value="revisions">По ревизиям</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={metric}
              onChange={(_, next) => next && setMetric(next)}
              sx={
                prototypeStyle
                  ? {
                      order: 1,
                      borderRadius: 999,
                      bgcolor: "action.hover",
                      "& .MuiToggleButton-root": {
                        px: 1.5,
                        py: 0.75,
                        borderColor: "divider",
                        color: "text.secondary",
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "none",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                      },
                    }
                  : { order: 0 }
              }
            >
              <ToggleButton value="amount">Сумма ₽</ToggleButton>
              <ToggleButton value="quantity">
                {report.scope === "household" ? "Расход" : "Количество"}
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {seriesLoading && view === "revisions" ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : view === "cafes" ? (
          <Stack spacing={1.5}>
            <BarList
              rows={cafeRows}
              metric={metric}
              onRowClick={(row) => onPointSelect(row.pointId)}
              prototypeStyle={prototypeStyle}
            />
            {!prototypeStyle && report.points.length > 1 ? (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Нажмите на кафе в матрице, чтобы открыть его динамику по ревизиям.
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <>
            {drill.pointId && report.points.length > 1 ? (
              <FormControl
                size="small"
                sx={{ maxWidth: 420 }}
              >
                <InputLabel>Кафе</InputLabel>
                <Select
                  label="Кафе"
                  value={drill.pointId}
                  onChange={(event) => onPointSelect(event.target.value)}
                >
                  {report.points.map((point) => (
                    <MenuItem
                      key={point.id}
                      value={point.id}
                    >
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            {!prototypeStyle && !drill.pointId ? (
              <Box>
                <Typography variant="subtitle2">Все выбранные кафе</Typography>
                <Typography
                  display="block"
                  variant="caption"
                  color="text.secondary"
                >
                  Дата — конец интервала между ревизиями. Значение — сумма расхождений по кафе, у
                  которых интервал заканчивается этой датой.
                </Typography>
              </Box>
            ) : null}
            <BarList
              rows={revisionRows}
              metric={metric}
              prototypeStyle={prototypeStyle}
            />
            {!hideCafeBreakdown && !drill.pointId && cafeRevisionGroups.length > 1 ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Отдельно по каждому кафе</Typography>
                {cafeRevisionGroups.map(({ point, rows, total }) => {
                  const accordionId = `revision-cafe-${point.id}`;

                  return (
                    <Accordion
                      key={point.id}
                      disableGutters
                      variant="outlined"
                      slotProps={{ transition: { unmountOnExit: true } }}
                      sx={{
                        borderRadius: "4px !important",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        id={`${accordionId}-header`}
                        aria-controls={`${accordionId}-content`}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={2}
                          sx={{ width: "100%", pr: 1 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2">{point.name}</Typography>
                            <Typography
                              display="block"
                              variant="caption"
                              color="text.secondary"
                            >
                              Интервалов: {rows.length}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              flexShrink: 0,
                              color: valueColor(total),
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {metric === "amount"
                              ? formatMoney(total)
                              : `${formatNumber(total)} ${position?.unit || ""}`}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails
                        id={`${accordionId}-content`}
                        sx={{ pt: 0 }}
                      >
                        {rows.length ? (
                          <BarList
                            rows={rows}
                            metric={metric}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Для кафе нет интервалов ревизий в выбранном периоде.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            ) : null}
            {!prototypeStyle ? <WarningList warnings={series?.warnings} /> : null}
          </>
        )}
      </Stack>
    </Paper>
  );
}

export { CalculationDetailDialog, Drilldown, MultiCafeReport, SingleCafeReport, WarningList };

export default function RevisionAnalysisTab({ initialData = null }) {
  const [points, setPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [positions, setPositions] = useState({ food: [], household: [] });
  const [selectedPositions, setSelectedPositions] = useState({ food: [], household: [] });
  const [revisions, setRevisions] = useState([]);
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [report, setReport] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [drill, setDrill] = useState(null);
  const [calculationDetail, setCalculationDetail] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [error, setError] = useState("");
  const revisionRequest = useRef(0);

  const allPositions = useMemo(
    () => [...(positions.food || []), ...(positions.household || [])],
    [positions],
  );
  const allSelectedPositions = useMemo(
    () => [...(selectedPositions.food || []), ...(selectedPositions.household || [])],
    [selectedPositions],
  );
  const reportSections = useMemo(
    () =>
      [
        { scope: "food", title: "Продукты и напитки", report: report?.food },
        { scope: "household", title: "Хозтовары", report: report?.household },
      ].filter((section) => section.report),
    [report],
  );
  const drillReport = drill ? report?.[drill.scope] : null;

  useEffect(() => {
    let active = true;

    async function loadFilters() {
      setLoading(true);
      const response = initialData ?? (await api_laravel("revizion", "get_analysis_filters"));
      const result = getResponseData(response);
      if (!active) return;

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить фильтры анализа");
        setLoading(false);
        return;
      }

      const nextPoints = result.points || [];
      const responsePositions = result.positions || { food: [], household: [] };
      const nextPositions = {
        food: (responsePositions.food || []).map((position) => ({ ...position, scope: "food" })),
        household: (responsePositions.household || []).map((position) => ({
          ...position,
          scope: "household",
        })),
      };
      setPoints(nextPoints);
      setSelectedPoints(nextPoints);
      setPositions(nextPositions);
      setSelectedPositions({
        food: nextPositions.food || [],
        household: nextPositions.household || [],
      });
      setLoading(false);
    }

    loadFilters();
    return () => {
      active = false;
    };
  }, [initialData]);

  useEffect(() => {
    const requestId = ++revisionRequest.current;
    setReport(null);
    setAppliedFilters(null);
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);

    if (!selectedPoints.length) {
      setRevisions([]);
      setDateStart(null);
      setDateEnd(null);
      return;
    }

    async function loadRevisions() {
      setRevisionLoading(true);
      setError("");
      const response = await api_laravel("revizion", "get_analysis_revisions", {
        point_ids: selectedPoints.map((point) => point.id),
      });
      const result = getResponseData(response);
      if (requestId !== revisionRequest.current) return;

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить даты ревизий");
        setRevisions([]);
        setDateStart(null);
        setDateEnd(null);
      } else {
        const next = result.revisions || [];
        setRevisions(next);
        setDateEnd(next[0] || null);
        setDateStart(next[1] || next[0] || null);
      }
      setRevisionLoading(false);
    }

    loadRevisions();
  }, [selectedPoints]);

  const runReport = async () => {
    if (!selectedPoints.length || !allSelectedPositions.length || !dateStart || !dateEnd) {
      setError("Выберите кафе, позиции и обе граничные ревизии");
      return;
    }

    if (dateStart.date > dateEnd.date) {
      setError("Начальная ревизия не может быть позже конечной");
      return;
    }

    const commonFilters = {
      point_ids: selectedPoints.map((point) => point.id),
      date_start: dateStart.date,
      date_end: dateEnd.date,
    };
    const filters = Object.fromEntries(
      ["food", "household"]
        .filter((sectionScope) => selectedPositions[sectionScope]?.length)
        .map((sectionScope) => [
          sectionScope,
          {
            ...commonFilters,
            position_ids: selectedPositions[sectionScope].map((position) => position.id),
            scope: sectionScope,
          },
        ]),
    );

    setError("");
    setReportLoading(true);
    setDrill(null);
    setCalculationDetail(null);
    setSeries(null);
    const entries = await Promise.all(
      Object.entries(filters).map(async ([sectionScope, sectionFilters]) => {
        const response = await api_laravel("revizion", "get_analysis", sectionFilters);
        return [sectionScope, getResponseData(response)];
      }),
    );
    setReportLoading(false);

    const failed = entries.find(([, result]) => !result || result.st === false);
    if (failed) {
      setError(failed[1]?.text || "Не удалось построить отчёт");
      return;
    }

    setReport(Object.fromEntries(entries));
    setAppliedFilters(filters);
  };

  const loadSeries = useCallback(
    async (positionId, sectionScope) => {
      const filters = appliedFilters?.[sectionScope];
      if (!filters) return;
      setSeriesLoading(true);
      const response = await api_laravel("revizion", "get_analysis_series", {
        point_ids: filters.point_ids,
        position_id: positionId,
        date_start: filters.date_start,
        date_end: filters.date_end,
        scope: sectionScope,
      });
      const result = getResponseData(response);
      setSeriesLoading(false);

      if (!result || result.st === false) {
        setError(result?.text || "Не удалось загрузить динамику");
        return;
      }

      setSeries(result);
    },
    [appliedFilters],
  );
  const loadActiveSeries = useCallback(
    (positionId) => {
      if (drill?.scope) loadSeries(positionId, drill.scope);
    },
    [drill?.scope, loadSeries],
  );

  const openPosition = (sectionScope, positionId, pointId = null) => {
    setCalculationDetail(null);
    setSeries(null);
    setDrill({ scope: sectionScope, positionId, pointId });
  };

  const openPoint = (sectionScope, pointId) => {
    const positionId = report?.[sectionScope]?.positions?.[0]?.id;
    if (positionId) openPosition(sectionScope, positionId, pointId);
  };

  const openCalculation = (sectionScope, row, point) => {
    setCalculationDetail({ scope: sectionScope, row, point });
  };

  return (
    <Stack spacing={3}>
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <CityCafeAutocomplete2
              points={points}
              value={selectedPoints}
              onChange={setSelectedPoints}
              label="Кафе"
              withAll={points.length > 0}
              withAllSelected
              withOrganizationMode
              compact
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <RevisionSelect
              label="Начальная ревизия"
              options={revisions}
              value={dateStart}
              onChange={(next) => {
                setDateStart(next);
                setReport(null);
                setAppliedFilters(null);
                setDrill(null);
                setCalculationDetail(null);
              }}
              disabled={revisionLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <RevisionSelect
              label="Конечная ревизия"
              options={revisions}
              value={dateEnd}
              onChange={(next) => {
                setDateEnd(next);
                setReport(null);
                setAppliedFilters(null);
                setDrill(null);
                setCalculationDetail(null);
              }}
              disabled={revisionLoading}
            />
          </Grid>
          <Grid size={12}>
            <PositionSelect
              positions={allPositions}
              value={allSelectedPositions}
              disabled={!allPositions.length}
              onChange={(next) => {
                setSelectedPositions({
                  food: next.filter((position) => position.scope === "food"),
                  household: next.filter((position) => position.scope === "household"),
                });
                setReport(null);
                setAppliedFilters(null);
                setDrill(null);
                setCalculationDetail(null);
              }}
            />
          </Grid>
          <Grid size={12}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button
                variant="contained"
                onClick={runReport}
                disabled={reportLoading || revisionLoading}
              >
                {reportLoading ? "Считаем…" : "Построить отчёт"}
              </Button>
              {revisionLoading ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <CircularProgress size={18} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Подбираем ревизии кафе
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !points.length ? (
        <Alert severity="info">Нет доступных кафе для анализа.</Alert>
      ) : null}

      {!revisionLoading && selectedPoints.length > 0 && !revisions.length ? (
        <Alert severity="info">За последние 12 месяцев ревизии не найдены.</Alert>
      ) : null}

      <CalculationDetailDialog
        detail={calculationDetail}
        onClose={() => setCalculationDetail(null)}
      />

      {drillReport?.rows?.length && drill ? (
        <Drilldown
          report={drillReport}
          drill={drill}
          series={series}
          seriesLoading={seriesLoading}
          loadSeries={loadActiveSeries}
          onClose={() => {
            setDrill(null);
            setSeries(null);
          }}
          onPointSelect={(pointId) => {
            setDrill((current) => ({ ...current, pointId }));
          }}
        />
      ) : null}

      {!drill
        ? reportSections.map((section) => (
            <Stack
              key={section.scope}
              spacing={1.5}
            >
              <Typography variant="h6">{section.title}</Typography>
              <WarningList warnings={section.report.warnings} />
              {!section.report.rows?.length ? (
                <Alert severity="info">По выбранным параметрам нет данных для отчёта.</Alert>
              ) : section.report.points.length === 1 ? (
                <SingleCafeReport
                  report={section.report}
                  scope={section.scope}
                  onPositionClick={(positionId) =>
                    openPosition(section.scope, positionId, section.report.points[0].id)
                  }
                  onCalculationClick={(row) =>
                    openCalculation(section.scope, row, section.report.points[0])
                  }
                />
              ) : (
                <MultiCafeReport
                  report={section.report}
                  onPositionClick={(positionId) => openPosition(section.scope, positionId)}
                  onPointClick={(pointId) => openPoint(section.scope, pointId)}
                  onCalculationClick={(row, point) => openCalculation(section.scope, row, point)}
                />
              )}
            </Stack>
          ))
        : null}
    </Stack>
  );
}
