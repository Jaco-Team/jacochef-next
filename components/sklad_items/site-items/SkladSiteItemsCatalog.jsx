"use client";

import { useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { formatDateRU } from "../formatDateRangeRU";

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
  categories,
  isEditable,
  canCreate,
  canManageTags,
  canDeleteAction,
  canEditActivity,
  canEditCash,
  canEditSort,
  canViewHistory,
  setState,
  openCreate,
  openTagsEditor,
  openEdit,
  openDeleteDialog,
  onSaveQuickField,
}) {
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [sortDrafts, setSortDrafts] = useState({});

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
      <Paper
        elevation={0}
        sx={{ p: { xs: 1.5, lg: 2 }, borderRadius: 2.5, border: `1px solid ${blockBorder}` }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ whiteSpace: "nowrap" }}
              >
                Новый товар
              </Button>
            ) : null}
            {canManageTags ? (
              <Button
                variant="outlined"
                startIcon={<LocalOfferOutlinedIcon />}
                onClick={openTagsEditor}
                sx={{ whiteSpace: "nowrap" }}
              >
                Редактировать теги
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          p: { xs: 1.5, lg: 2 },
          borderRadius: 2.5,
          backgroundColor: blockBackground,
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 1.5, lg: 2 }, borderRadius: 2.5, border: `1px solid ${blockBorder}` }}
          >
            <Stack spacing={1.75}>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", lg: "center" }}
                justifyContent="space-between"
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
                <TextField
                  size="small"
                  placeholder="Поиск по названию"
                  value={search}
                  onChange={(event) => setState({ search: event.target.value, page: 0 })}
                  sx={{ width: { xs: "100%", lg: 320 }, backgroundColor: "#fff" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: textSecondary, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
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
                      <Button
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
                      </Button>
                    );
                  })}
                </Box>
                <Typography sx={{ fontSize: 13, color: textSecondary }}>
                  {groupedRows.length} категорий · {visibleRows.length} товаров
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {groupedRows.length ? (
            <Stack spacing={1.25}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 0.25 }}
              >
                <Typography sx={{ color: textSecondary, fontSize: 13 }}>
                  Выберите категорию, чтобы увидеть товары
                </Typography>
                <Button
                  size="small"
                  startIcon={allExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                  onClick={toggleAll}
                  sx={{ color: textSecondary, textTransform: "none" }}
                >
                  {allExpanded ? "Свернуть все" : "Развернуть все"}
                </Button>
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
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: textSecondary }} />}
                      sx={{
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
                    <AccordionDetails
                      sx={{ px: 0, pt: 0, pb: 2, backgroundColor: blockBackground }}
                    >
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          display: { xs: "none", md: "block" },
                          mx: 2,
                          borderRadius: 2.5,
                          border: `1px solid ${blockBorder}`,
                          overflow: "hidden",
                        }}
                      >
                        <Table
                          size="small"
                          sx={{ tableLayout: "fixed" }}
                        >
                          <TableHead>
                            <TableRow
                              sx={{ "& th": { bgcolor: blockBackground, fontWeight: 700 } }}
                            >
                              <TableCell sx={{ width: "4%" }}>№</TableCell>
                              <TableCell sx={{ width: "8%" }}>Активность</TableCell>
                              <TableCell sx={{ width: "7%" }}>Касса</TableCell>
                              <TableCell sx={{ width: "8%" }}>
                                <TableSortLabel {...sortProps("sort")}>Сортировка</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "23%" }}>
                                <TableSortLabel {...sortProps("name")}>Название</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "10%" }}>
                                <TableSortLabel {...sortProps("date_start")}>
                                  Действует с
                                </TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "9%" }}>
                                <TableSortLabel {...sortProps("date_end")}>по</TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "12%" }}>
                                <TableSortLabel {...sortProps("update_item")}>
                                  Обновление
                                </TableSortLabel>
                              </TableCell>
                              <TableCell sx={{ width: "9%" }}>Код для 1С</TableCell>
                              <TableCell
                                align="center"
                                sx={{ width: "10%" }}
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
                                hover
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell align="center">
                                  <Checkbox
                                    size="small"
                                    checked={Number(row?.is_show) === 1}
                                    disabled={!canEditActivity}
                                    onChange={quickCheck(row, "is_show")}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Checkbox
                                    size="small"
                                    checked={Number(row?.show_program) === 1}
                                    disabled={!canEditCash}
                                    onChange={quickCheck(row, "show_program")}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
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
                                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{row?.name || "—"}</TableCell>
                                <TableCell>{formatDateRU(row?.date_start) || "—"}</TableCell>
                                <TableCell>{formatDateRU(row?.date_end) || "—"}</TableCell>
                                <TableCell>
                                  {formatDateRU(row?.date_update || row?.update_item) || "—"}
                                </TableCell>
                                <TableCell>{row?.art || "—"}</TableCell>
                                <TableCell align="center">
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    justifyContent="center"
                                  >
                                    <Tooltip title={isEditable ? "Редактировать" : "Открыть"}>
                                      <IconButton
                                        size="small"
                                        aria-label="Редактировать"
                                        onClick={() => openEdit(row, "main")}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    {canViewHistory ? (
                                      <Tooltip title="История изменений">
                                        <IconButton
                                          size="small"
                                          aria-label="История"
                                          onClick={() => openEdit(row, "history")}
                                        >
                                          <EditNoteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ) : null}
                                    {canDeleteAction ? (
                                      <Tooltip title="Удалить">
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            aria-label="Удалить"
                                            disabled={row?.can_delete === false}
                                            onClick={() => openDeleteDialog(row)}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
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
                        {category.items.map((row, index) => (
                          <Paper
                            key={row.id}
                            data-testid={`site-item-${row.id}`}
                            elevation={0}
                            sx={{ p: 1.5, borderRadius: 2.5 }}
                          >
                            <Stack spacing={1.25}>
                              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                                {index + 1}. {row?.name || "Без названия"}
                              </Typography>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                  gap: 1.25,
                                }}
                              >
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
                                <FieldValue label="Код 1С">{row?.art}</FieldValue>
                                <FieldValue label="Сортировка">{row?.sort}</FieldValue>
                              </Box>
                              <Stack
                                direction="row"
                                useFlexGap
                                flexWrap="wrap"
                                gap={1}
                              >
                                {[
                                  ["Активность", "is_show", canEditActivity],
                                  ["Касса", "show_program", canEditCash],
                                ].map(([label, field, canEditField]) => (
                                  <Box
                                    key={field}
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
                                      {label}
                                    </Typography>
                                    <Checkbox
                                      size="small"
                                      checked={Number(row?.[field]) === 1}
                                      disabled={!canEditField}
                                      onChange={quickCheck(row, field)}
                                    />
                                  </Box>
                                ))}
                              </Stack>
                              <Stack
                                direction="row"
                                useFlexGap
                                flexWrap="wrap"
                                gap={1}
                              >
                                <Button
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  aria-label="Редактировать"
                                  onClick={() => openEdit(row, "main")}
                                  sx={{ flex: 1 }}
                                >
                                  {isEditable ? "Изменить" : "Открыть"}
                                </Button>
                                {canViewHistory ? (
                                  <Button
                                    variant="outlined"
                                    startIcon={<EditNoteIcon />}
                                    onClick={() => openEdit(row, "history")}
                                    sx={{ flex: 1 }}
                                  >
                                    История
                                  </Button>
                                ) : null}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 5, textAlign: "center", borderRadius: 2.5 }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Ничего не найдено</Typography>
              <Typography sx={{ mt: 0.75, color: textSecondary }}>
                Измените строку поиска или переключите режим списка.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
