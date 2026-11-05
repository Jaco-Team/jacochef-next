"use client";

import { useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {
  JacoButton,
  JacoCheckbox,
  JacoIconButton,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";

import { formatDateRU } from "../formatDateRangeRU";
import { interactiveRowProps } from "../table/interactiveRow";
import SkladCategoryHistoryDialog from "../SkladCategoryHistoryDialog";
import SkladItemNameButton from "../SkladItemNameButton";

const brandRed = "#DD1A32";
const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";

function sortValue(row, field) {
  const value = field === "update_item" ? row?.date_update || row?.update_item : row?.[field];

  if (field === "date_start" || field === "date_end" || field === "update_item") {
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (field === "sort") {
    return Number(value) || 0;
  }

  return String(value || "").toLocaleLowerCase("ru");
}

function categoryKey(category) {
  return String(category?.id ?? "uncategorized");
}

function FieldValue({ label, children, fullWidth = false }) {
  return (
    <Box sx={{ minWidth: 0, gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <Typography
        sx={{
          fontSize: 11,
          lineHeight: "14px",
          fontWeight: 600,
          color: "#8B8B8B",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ mt: 0.35, fontSize: 14, lineHeight: "18px", color: textPrimary }}>
        {children || "—"}
      </Typography>
    </Box>
  );
}

export default function SkladSiteItemsCatalog({
  search,
  archiveMode,
  rows,
  loading,
  error,
  onRetry,
  categories,
  canCreate,
  canSyncSiteItemsVk,
  canManageTags,
  canDeleteAction,
  canEditCash,
  canEditSort,
  canViewHistory,
  setState,
  openCreate,
  onSyncSiteItemsVk,
  openTagsEditor,
  onManageCategories,
  openEdit,
  openDeleteDialog,
  onSaveQuickField,
}) {
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [sortDrafts, setSortDrafts] = useState({});
  const [historyCategory, setHistoryCategory] = useState(null);

  const counts = useMemo(
    () => ({
      active: rows.filter((row) => Number(row?.is_archived) !== 1).length,
      archive: rows.filter((row) => Number(row?.is_archived) === 1).length,
    }),
    [rows],
  );

  const visibleRows = useMemo(
    () =>
      rows.filter((row) =>
        archiveMode === "archive" ? Number(row?.is_archived) === 1 : Number(row?.is_archived) !== 1,
      ),
    [archiveMode, rows],
  );

  const groupedRows = useMemo(() => {
    const categoryMap = new Map(
      (categories || []).map((category) => [String(category.id), { ...category, items: [] }]),
    );
    const uncategorized = { id: "uncategorized", name: "Без категории", items: [] };

    visibleRows.forEach((row) => {
      const group = categoryMap.get(String(row?.category_id2)) || uncategorized;
      group.items.push(row);
    });

    const result = [...categoryMap.values()];
    if (uncategorized.items.length) {
      result.push(uncategorized);
    }

    return result
      .filter((category) => category.items.length > 0)
      .map((category) => ({
        ...category,
        items: [...category.items].sort((left, right) => {
          const leftValue = sortValue(left, sortField);
          const rightValue = sortValue(right, sortField);
          const result = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
          return sortOrder === "asc" ? result : -result;
        }),
      }));
  }, [categories, sortField, sortOrder, visibleRows]);

  const requestSort = (field) => {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("asc");
  };

  const sortProps = (field) => ({
    active: sortField === field,
    direction: sortField === field ? sortOrder : "asc",
    onClick: () => requestSort(field),
  });

  const toggleCategory = (key) => {
    setExpandedCategories((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const allExpanded =
    groupedRows.length > 0 &&
    groupedRows.every((category) => expandedCategories.includes(categoryKey(category)));

  const toggleAll = () => {
    setExpandedCategories(allExpanded ? [] : groupedRows.map(categoryKey));
  };

  const quickCheck = (row, type) => (event) => {
    event.stopPropagation();
    onSaveQuickField?.(row, type, event.target.checked ? 1 : 0);
  };

  return (
    <Stack spacing={2}>
      <JacoSurface
        sx={{ p: { xs: 1.5, lg: 2 }, borderRadius: 2.5, border: `1px solid ${blockBorder}` }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 20, lineHeight: "24px", fontWeight: 600 }}>
              Товары сайта
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 14, color: textSecondary }}>
              Каталог, сгруппированный по категориям
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
          >
            {canCreate ? (
              <JacoButton
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ whiteSpace: "nowrap" }}
              >
                Новый товар
              </JacoButton>
            ) : null}
            {canManageTags ? (
              <JacoButton
                tone="secondary"
                startIcon={<LocalOfferOutlinedIcon />}
                onClick={openTagsEditor}
                sx={{ whiteSpace: "nowrap" }}
              >
                Редактировать теги
              </JacoButton>
            ) : null}
            {canSyncSiteItemsVk ? (
              <JacoButton
                tone="secondary"
                startIcon={<SyncIcon />}
                onClick={onSyncSiteItemsVk}
                sx={{ whiteSpace: "nowrap" }}
              >
                Обновить товары VK
              </JacoButton>
            ) : null}
          </Stack>
        </Stack>
      </JacoSurface>
      <Box
        sx={{
          p: { xs: 1.5, lg: 2 },
          borderRadius: 2.5,
          backgroundColor: blockBackground,
        }}
      >
        <Stack spacing={2}>
          <JacoSurface
            sx={{ p: { xs: 1.5, lg: 2 }, borderRadius: 2.5, border: `1px solid ${blockBorder}` }}
          >
            <Stack spacing={1.75}>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={1.5}
                sx={{
                  alignItems: { xs: "stretch", lg: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 20, lineHeight: "24px", fontWeight: 500 }}>
                    {archiveMode === "archive" ? "Архив товаров" : "Каталог товаров"}
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 14, color: textSecondary }}>
                    {archiveMode === "archive"
                      ? "Позиции с выключенной активностью"
                      : "Активные позиции, сгруппированные по категориям"}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <JacoTextInput
                    placeholder="Поиск по названию"
                    value={search}
                    onChange={(event) => setState({ search: event.target.value, page: 0 })}
                    sx={{ width: { xs: "100%", lg: 320 }, backgroundColor: "#fff" }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: textSecondary, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Tooltip title="Управление категориями товаров сайта">
                    <JacoIconButton
                      aria-label="Управление категориями товаров сайта"
                      onClick={onManageCategories}
                    >
                      <SettingsOutlinedIcon />
                    </JacoIconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 0.5,
                    borderRadius: 2,
                    border: `1px solid ${blockBorder}`,
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  {[
                    { value: "active", label: "Активные", count: counts.active },
                    { value: "archive", label: "Архив", count: counts.archive },
                  ].map((tab) => {
                    const selected = archiveMode === tab.value;
                    return (
                      <JacoButton
                        key={tab.value}
                        onClick={() => setState({ archiveMode: tab.value, page: 0 })}
                        sx={{
                          flex: { xs: 1, md: "none" },
                          minHeight: 36,
                          px: 1.75,
                          borderRadius: 1.5,
                          textTransform: "none",
                          color: selected ? "#fff" : textSecondary,
                          backgroundColor: selected ? brandRed : "transparent",
                          "&:hover": { backgroundColor: selected ? brandRed : blockBackground },
                        }}
                      >
                        {tab.label}
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            minWidth: 22,
                            height: 20,
                            px: 0.75,
                            borderRadius: 999,
                            backgroundColor: selected ? "rgba(255,255,255,.2)" : blockBackground,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {tab.count}
                        </Box>
                      </JacoButton>
                    );
                  })}
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", justifyContent: "flex-end" }}
                >
                  <Typography sx={{ fontSize: 13, color: textSecondary }}>
                    {groupedRows.length} категорий · {visibleRows.length} товаров
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </JacoSurface>

          {loading ? (
            <JacoSurface
              role="status"
              sx={{ p: 5, textAlign: "center", borderRadius: 2.5 }}
            >
              <CircularProgress size={28} />
              <Typography sx={{ mt: 1, color: textSecondary }}>Загрузка товаров сайта…</Typography>
            </JacoSurface>
          ) : error ? (
            <JacoSurface
              role="alert"
              sx={{ p: 5, textAlign: "center", borderRadius: 2.5 }}
            >
              <Typography>{error}</Typography>
              <JacoButton
                tone="secondary"
                onClick={() => onRetry()}
                sx={{ mt: 2 }}
              >
                Повторить
              </JacoButton>
            </JacoSurface>
          ) : groupedRows.length ? (
            <Stack spacing={1.25}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 0.25,
                }}
              >
                <Typography sx={{ color: textSecondary, fontSize: 13 }}>
                  Выберите категорию, чтобы увидеть товары
                </Typography>
                <JacoButton
                  compact
                  tone="secondary"
                  startIcon={allExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                  onClick={toggleAll}
                  sx={{ color: textSecondary, textTransform: "none" }}
                >
                  {allExpanded ? "Свернуть все" : "Развернуть все"}
                </JacoButton>
              </Stack>

              {groupedRows.map((category) => {
                const key = categoryKey(category);
                return (
                  <Accordion
                    key={key}
                    expanded={expandedCategories.includes(key)}
                    onChange={() => toggleCategory(key)}
                    disableGutters
                    elevation={0}
                    sx={{
                      borderRadius: 2.5,
                      border: `1px solid ${blockBorder}`,
                      overflow: "hidden",
                      "&::before": { display: "none" },
                      "&.Mui-expanded": { m: 0 },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: textSecondary }} />}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          px: { xs: 1.5, lg: 2 },
                          minHeight: 56,
                          "&.Mui-expanded": { minHeight: 56 },
                          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.25 },
                        }}
                      >
                        <Typography sx={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>
                          {category.name}
                        </Typography>
                        <Box
                          sx={{
                            minWidth: 28,
                            height: 24,
                            px: 1,
                            borderRadius: 999,
                            backgroundColor: blockBackground,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            color: textSecondary,
                          }}
                        >
                          {category.items.length}
                        </Box>
                      </AccordionSummary>
                      {Number(category.id) > 0 ? (
                        <Tooltip title="История категории">
                          <Box
                            component="span"
                            role="button"
                            tabIndex={0}
                            aria-label={`История категории: ${category.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setHistoryCategory({ ...category, source_type: "site_item" });
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                setHistoryCategory({ ...category, source_type: "site_item" });
                              }
                            }}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              p: 1,
                              borderRadius: 1,
                              cursor: "pointer",
                              "&:focus-visible": { outline: "2px solid currentColor" },
                            }}
                          >
                            <HistoryIcon fontSize="small" />
                          </Box>
                        </Tooltip>
                      ) : null}
                    </Box>
                    <AccordionDetails
                      sx={{ px: 0, pt: 1, pb: 2, backgroundColor: blockBackground }}
                    >
                      <TableContainer
                        component={JacoSurface}
                        role="region"
                        aria-label={`Товары категории ${category.name}`}
                        tabIndex={0}
                        sx={{
                          display: { xs: "none", md: "block" },
                          mx: 1,
                          width: "calc(100% - 16px)",
                          borderRadius: 2.5,
                          border: `1px solid ${blockBorder}`,
                          overflowX: "auto",
                        }}
                      >
                        <Table
                          size="small"
                          sx={{ minWidth: 960 }}
                        >
                          <TableHead>
                            <TableRow
                              sx={{
                                "& th": {
                                  bgcolor: blockBackground,
                                  fontWeight: 700,
                                  fontSize: { md: "0.75rem", lg: "0.875rem" },
                                  whiteSpace: "nowrap",
                                },
                              }}
                            >
                              <TableCell sx={{ width: "40px" }}>№</TableCell>
                              <TableCell sx={{ width: "70px" }}>Касса</TableCell>
                              <TableCell sx={{ minWidth: "110px" }}>
                                <TableSortLabel {...sortProps("sort")}>Сортировка</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ minWidth: "160px" }}>
                                <TableSortLabel {...sortProps("name")}>Название</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ minWidth: "100px" }}>Код для 1С</TableCell>
                              <TableCell sx={{ minWidth: "110px" }}>
                                <TableSortLabel {...sortProps("date_start")}>
                                  Действует с
                                </TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "70px" }}>
                                <TableSortLabel {...sortProps("date_end")}>по</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ minWidth: "100px" }}>
                                <TableSortLabel {...sortProps("update_item")}>
                                  Обновление
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ minWidth: "100px" }}
                              >
                                Действия
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.items.map((row, index) => (
                              <TableRow
                                key={row.id}
                                data-testid={`site-item-${row.id}`}
                                {...interactiveRowProps(row?.name, () => openEdit(row, "main"))}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell
                                  align="center"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <JacoCheckbox
                                    inputProps={{ "aria-label": `Касса: ${row.name}` }}
                                    checked={Number(row?.show_program) === 1}
                                    disabled={!canEditCash}
                                    onChange={quickCheck(row, "show_program")}
                                  />
                                </TableCell>
                                <TableCell>
                                  <JacoTextInput
                                    type="number"
                                    sx={{ minWidth: 88, width: 88 }}
                                    value={sortDrafts[row.id] ?? row?.sort ?? 0}
                                    disabled={!canEditSort}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={(event) =>
                                      setSortDrafts((current) => ({
                                        ...current,
                                        [row.id]: event.target.value,
                                      }))
                                    }
                                    onBlur={(event) => {
                                      const value = Number(event.target.value) || 0;
                                      setSortDrafts((current) => {
                                        const next = { ...current };
                                        delete next[row.id];
                                        return next;
                                      });
                                      if (value !== Number(row?.sort || 0)) {
                                        onSaveQuickField?.(row, "sort", value);
                                      }
                                    }}
                                    slotProps={{
                                      htmlInput: {
                                        min: 0,
                                        step: 1,
                                        "aria-label": `Сортировка: ${row.name}`,
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{row?.name || "—"}</TableCell>
                                <TableCell>{row?.art || "—"}</TableCell>
                                <TableCell>{formatDateRU(row?.date_start) || "—"}</TableCell>
                                <TableCell>{formatDateRU(row?.date_end) || "—"}</TableCell>
                                <TableCell>
                                  {formatDateRU(row?.date_update || row?.update_item) || "—"}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{
                                      justifyContent: "center",
                                    }}
                                  >
                                    {canViewHistory ? (
                                      <Tooltip title="История изменений">
                                        <JacoIconButton
                                          aria-label="История"
                                          onClick={() => openEdit(row, "history")}
                                        >
                                          <EditNoteIcon fontSize="small" />
                                        </JacoIconButton>
                                      </Tooltip>
                                    ) : null}
                                    {canDeleteAction ? (
                                      <Tooltip title="Удалить">
                                        <span>
                                          <JacoIconButton
                                            sx={{ color: "error.main" }}
                                            aria-label="Удалить"
                                            disabled={row?.can_delete === false}
                                            onClick={() => openDeleteDialog(row)}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </JacoIconButton>
                                        </span>
                                      </Tooltip>
                                    ) : null}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Stack
                        spacing={1}
                        sx={{ display: { xs: "flex", md: "none" }, mx: 1 }}
                      >
                        {category.items.map((row) => (
                          <JacoSurface
                            key={row.id}
                            data-testid={`site-item-${row.id}`}
                            elevation={0}
                            sx={{ p: 1.5, borderRadius: 2.5 }}
                          >
                            <Stack spacing={1.25}>
                              <SkladItemNameButton
                                name={row?.name}
                                onClick={() => openEdit(row, "main")}
                              />
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                  gap: 1.25,
                                }}
                              >
                                <FieldValue label="Код 1С">{row?.art}</FieldValue>
                                <FieldValue label="Действует с">
                                  {formatDateRU(row?.date_start)}
                                </FieldValue>
                                <FieldValue label="Действует по">
                                  {formatDateRU(row?.date_end)}
                                </FieldValue>
                                <FieldValue
                                  label="Обновление"
                                  fullWidth
                                >
                                  {formatDateRU(row?.date_update || row?.update_item)}
                                </FieldValue>
                                <FieldValue label="Сортировка">{row?.sort}</FieldValue>
                              </Box>
                              <Stack
                                direction="row"
                                useFlexGap
                                sx={{
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: "1 1 130px",
                                    px: 1.25,
                                    py: 0.75,
                                    border: `1px solid ${blockBorder}`,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography sx={{ fontSize: 13, color: textSecondary }}>
                                    Касса
                                  </Typography>
                                  <JacoCheckbox
                                    inputProps={{ "aria-label": `Касса: ${row.name}` }}
                                    checked={Number(row?.show_program) === 1}
                                    disabled={!canEditCash}
                                    onChange={quickCheck(row, "show_program")}
                                  />
                                </Box>
                              </Stack>
                              <Stack
                                direction="row"
                                useFlexGap
                                sx={{
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {canViewHistory ? (
                                  <JacoButton
                                    tone="secondary"
                                    startIcon={<EditNoteIcon />}
                                    onClick={() => openEdit(row, "history")}
                                    sx={{ flex: 1 }}
                                  >
                                    История
                                  </JacoButton>
                                ) : null}
                              </Stack>
                            </Stack>
                          </JacoSurface>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          ) : (
            <JacoSurface sx={{ p: 5, textAlign: "center", borderRadius: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Ничего не найдено</Typography>
              <Typography sx={{ mt: 0.75, color: textSecondary }}>
                Измените строку поиска или переключите режим списка.
              </Typography>
            </JacoSurface>
          )}
        </Stack>
      </Box>
      <SkladCategoryHistoryDialog
        category={historyCategory}
        onClose={() => setHistoryCategory(null)}
      />
    </Stack>
  );
}
