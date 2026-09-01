"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { resolveSiteItemImageUrl } from "../site-items/siteItemImage";
import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";

function formatValue(value, fallback = "") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatDate(value, withTime = false) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return String(value);
  }

  return parsed.format(withTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY");
}

function formatBoolean(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return Number(value) === 1 || value === true ? "Да" : "Нет";
}

function getHistoryRows(history) {
  return Array.isArray(history?.rows) ? history.rows.filter(Boolean) : [];
}

function getImageHistoryRows(imageHistory) {
  return Array.isArray(imageHistory?.rows) ? imageHistory.rows.filter(Boolean) : [];
}

function getEntityType(history, row) {
  return row?.entity_type || history?.meta?.entity_type || "";
}

function formatNumber(value, decimals = null) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed = Number(String(value).replace(",", "."));
  if (Number.isNaN(parsed)) {
    return String(value);
  }

  if (decimals === null) {
    return Number.isInteger(parsed) ? String(parsed) : String(parsed).replace(".", ",");
  }

  return parsed.toFixed(decimals).replace(".", ",");
}

function getName(item) {
  if (!item) {
    return "";
  }

  if (typeof item === "string" || typeof item === "number") {
    return String(item);
  }

  return (
    item?.name ||
    item?.title ||
    item?.label ||
    item?.category_name ||
    item?.allergen_name ||
    item?.storage_name ||
    item?.app_name ||
    item?.ei_name ||
    item?.unit_name ||
    item?.ed_izmer_name ||
    item?.short_name ||
    String(item?.id ?? "")
  );
}

function formatNameList(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  return items
    .map((item) => getName(item))
    .filter(Boolean)
    .join(", ");
}

function formatProductionComposition(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  return items
    .map((item) => {
      const name =
        item?.name || item?.item_name || item?.nomenclature_name || item?.item?.name || "";
      const parts = [
        name,
        item?.ei_name || item?.unit_name || item?.ed_izmer_name
          ? `ед: ${item?.ei_name || item?.unit_name || item?.ed_izmer_name}`
          : "",
        item?.brutto !== undefined ? `брутто: ${formatNumber(item.brutto, 3)}` : "",
        item?.pr_1 !== undefined ? `% ХО: ${formatNumber(item.pr_1)}` : "",
        item?.netto !== undefined ? `нетто: ${formatNumber(item.netto, 3)}` : "",
        item?.pr_2 !== undefined ? `% ГО: ${formatNumber(item.pr_2)}` : "",
        item?.res !== undefined ? `выход: ${formatNumber(item.res, 3)}` : "",
      ].filter(Boolean);

      return parts.join(", ");
    })
    .join(" | ");
}

function formatSiteItemCollection(items = [], { isFinal = false } = {}) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  return items
    .map((item) => {
      const name = item?.name || item?.item_id?.name || item?.type_id?.name || "";
      const parts = [
        name,
        item?.ei_name ? `ед: ${item.ei_name}` : "",
        item?.brutto !== undefined ? `брутто: ${formatNumber(item.brutto, 3)}` : "",
        item?.pr_1 !== undefined ? `% ХО: ${formatNumber(item.pr_1)}` : "",
        item?.netto !== undefined ? `нетто: ${formatNumber(item.netto, 3)}` : "",
        item?.pr_2 !== undefined ? `% ГО: ${formatNumber(item.pr_2)}` : "",
        item?.res !== undefined ? `выход: ${formatNumber(item.res, 3)}` : "",
        !isFinal && item?.stage ? `этап: ${item.stage}` : "",
      ].filter(Boolean);

      return parts.join(", ");
    })
    .join(" | ");
}

function normalizeSiteItemStageRows(snapshot) {
  return [
    ...(Array.isArray(snapshot?.items_stage?.stage_1)
      ? snapshot.items_stage.stage_1.map((item) => ({ ...item, stage: "1 этап" }))
      : []),
    ...(Array.isArray(snapshot?.items_stage?.stage_2)
      ? snapshot.items_stage.stage_2.map((item) => ({ ...item, stage: "2 этап" }))
      : []),
    ...(Array.isArray(snapshot?.items_stage?.stage_3)
      ? snapshot.items_stage.stage_3.map((item) => ({ ...item, stage: "3 этап" }))
      : []),
  ];
}

function getCategoryName(snapshot) {
  return snapshot?.category_name || getName(snapshot?.category) || "";
}

function resolveHistoryImageUrl(imageValue, fallbackAssetKey = "") {
  if (!imageValue) {
    return null;
  }

  if (typeof imageValue === "string") {
    return resolveSiteItemImageUrl({ asset_key: imageValue }, fallbackAssetKey);
  }

  return resolveSiteItemImageUrl(imageValue, fallbackAssetKey);
}

function getProductionFieldLabels(isRecipe) {
  return {
    name: "Наименование",
    shelf_life: "Срок годности",
    ed_izmer: "Ед. измерения",
    two_user: "Количество сотрудников",
    show_in_rev: "Ревизия",
    date_start: "Действует с",
    date_end: "Действует до",
    time_min: "Время приготовления",
    time_min_dop: "Доп. время",
    apps: "Должности в кафе",
    storages: "Места хранения",
    categories: "Категории",
    allergens: "Аллергены",
    allergens_possible: "Возможные аллергены",
    structure: "Состав",
    items: isRecipe ? "Номенклатура" : "Номенклатура полуфабриката",
    all_w_brutto: "Итого брутто",
    all_w_netto: "Итого нетто",
    all_w: "Итого выход",
    is_show: "Активность",
  };
}

function formatProductionValue(field, snapshot, entityType) {
  const isRecipe = entityType === "recipe";

  switch (field) {
    case "name":
      return formatValue(snapshot?.name);
    case "shelf_life":
      return formatValue(snapshot?.shelf_life);
    case "ed_izmer":
      return formatValue(snapshot?.unit_name || snapshot?.ei_name || snapshot?.ed_izmer_name);
    case "two_user":
      return Number(snapshot?.two_user) === 1 ? "Два сотрудника" : "Один сотрудник";
    case "show_in_rev":
      return formatBoolean(snapshot?.show_in_rev);
    case "date_start":
    case "date_end":
      return formatDate(snapshot?.[field]);
    case "time_min":
    case "time_min_dop":
      return formatValue(snapshot?.[field]);
    case "apps":
      return formatNameList(snapshot?.apps);
    case "storages":
      return formatNameList(snapshot?.storages);
    case "categories":
      return formatNameList(snapshot?.categories);
    case "allergens":
      return formatNameList(snapshot?.allergens);
    case "allergens_possible":
      return formatNameList(snapshot?.allergens_possible);
    case "structure":
      return isRecipe
        ? ""
        : formatValue(snapshot?.structure || snapshot?.text_contents || snapshot?.contents);
    case "items":
      return formatProductionComposition(snapshot?.items || snapshot?.composition || []);
    case "all_w_brutto":
    case "all_w_netto":
    case "all_w":
      return formatNumber(snapshot?.[field], 3);
    case "is_show":
      return formatBoolean(snapshot?.is_active ?? snapshot?.is_show);
    default:
      return snapshot?.[field] === null || snapshot?.[field] === undefined
        ? ""
        : String(snapshot[field]);
  }
}

function buildProductionDiff(current, previous, entityType) {
  const diff = {};
  const isRecipe = entityType === "recipe";
  const labels = getProductionFieldLabels(isRecipe);
  const fields = [
    "name",
    "shelf_life",
    "ed_izmer",
    "two_user",
    "show_in_rev",
    "date_start",
    "date_end",
    "time_min",
    "time_min_dop",
    "apps",
    "storages",
    "categories",
    "allergens",
    "allergens_possible",
    "structure",
    "items",
    "all_w_brutto",
    "all_w_netto",
    "all_w",
    "is_show",
  ];

  fields.forEach((field) => {
    const currentValue = formatProductionValue(field, current, entityType);
    const previousValue = previous ? formatProductionValue(field, previous, entityType) : "";

    if (currentValue !== previousValue) {
      diff[labels[field] || field] = {
        from: previousValue,
        to: currentValue,
      };
    }
  });

  if (!Object.keys(diff).length) {
    diff["Изменения"] = {
      from: "",
      to: previous ? "Карточка обновлена" : "Карточка создана",
    };
  }

  return diff;
}

const siteItemHistoryFieldLabels = {
  name: "Наименование",
  short_name: "Короткое название",
  date_start: "Действует с",
  date_end: "Действует по",
  art: "Код 1С",
  is_mark: "Маркировка",
  mark_code: "Код маркировки",
  category_id: "Старая категория",
  category_id2: "Новая категория",
  weight: "Вес",
  count_part: "Кусочков или размер",
  stol: "Стол",
  is_show: "Активность",
  protein: "Белки",
  fat: "Жиры",
  carbohydrates: "Углеводы",
  time_stage_1: "Время на 1 этап",
  time_stage_2: "Время на 2 этап",
  time_stage_3: "Время на 3 этап",
  tmp_desc: "Состав",
  marc_desc: "Короткое описание",
  marc_desc_full: "Полное описание",
  show_program: "На кассе",
  show_site: "На сайте и КЦ",
  is_new: "Новинка",
  is_hit: "Хит",
  is_spicy: "Острый",
  img_app: "Изображение",
  stage_rows: "Полуфабрикаты и рецепты",
  items: "Позиции",
  tags: "Теги",
};

function formatSiteItemMarking(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  switch (parseInt(value, 10)) {
    case 0:
      return "Обычный товар";
    case 1:
      return "Вода";
    case 2:
      return "Сладкий напиток";
    default:
      return String(value);
  }
}

function formatSiteItemTags(tags = []) {
  if (!Array.isArray(tags) || !tags.length) {
    return "";
  }

  return [...tags]
    .sort((a, b) => parseInt(a?.id || 0) - parseInt(b?.id || 0))
    .map((tag) => tag?.name)
    .filter(Boolean)
    .join(", ");
}

function formatSiteItemValue(field, snapshot) {
  switch (field) {
    case "date_start":
    case "date_end":
      return formatDate(snapshot?.[field]);
    case "category_id":
      return getCategoryName(snapshot);
    case "category_id2":
      return snapshot?.category_name2 || snapshot?.category_id2 || "";
    case "is_mark":
      return formatSiteItemMarking(snapshot?.marking?.is_mark ?? snapshot?.is_mark);
    case "mark_code":
      return formatValue(snapshot?.marking?.mark_code ?? snapshot?.mark_code);
    case "is_show":
    case "show_program":
    case "show_site":
    case "is_new":
    case "is_hit":
    case "is_spicy":
      return formatBoolean(snapshot?.[field]);
    case "weight":
    case "count_part":
    case "protein":
    case "fat":
    case "carbohydrates":
      return formatNumber(snapshot?.[field]);
    case "time_stage_1":
    case "time_stage_2":
    case "time_stage_3":
      return formatValue(snapshot?.[field]);
    case "stage_rows":
      return formatSiteItemCollection(normalizeSiteItemStageRows(snapshot));
    case "items":
      return formatSiteItemCollection(snapshot?.item_items?.this_items || [], { isFinal: true });
    case "tags":
      return formatSiteItemTags(snapshot?.tags);
    case "img_app":
      return formatValue(snapshot?.img_app || snapshot?.image?.asset_key);
    default:
      return snapshot?.[field] === null || snapshot?.[field] === undefined
        ? ""
        : String(snapshot[field]);
  }
}

function buildSiteItemDiff(current, previous) {
  const diff = {};
  const fields = [
    "name",
    "short_name",
    "date_start",
    "date_end",
    "art",
    "is_mark",
    "mark_code",
    "category_id",
    "category_id2",
    "count_part",
    "stol",
    "weight",
    "is_show",
    "protein",
    "fat",
    "carbohydrates",
    "time_stage_1",
    "time_stage_2",
    "time_stage_3",
    "tmp_desc",
    "marc_desc",
    "marc_desc_full",
    "show_program",
    "show_site",
    "is_new",
    "is_hit",
    "is_spicy",
    "img_app",
    "stage_rows",
    "items",
    "tags",
  ];

  fields.forEach((field) => {
    const currentValue = formatSiteItemValue(field, current);
    const previousValue = previous ? formatSiteItemValue(field, previous) : "";

    if (currentValue !== previousValue) {
      diff[siteItemHistoryFieldLabels[field] || field] = {
        from: previousValue,
        to: currentValue,
      };
    }
  });

  if (!Object.keys(diff).length) {
    diff["Изменения"] = {
      from: "",
      to: previous ? "Карточка обновлена" : "Карточка создана",
    };
  }

  return diff;
}

function buildHistoryItem(history, row, previousRow, index) {
  const entityType = getEntityType(history, row);
  const currentSnapshot = row?.snapshot || {};
  const previousSnapshot = previousRow?.snapshot || null;
  const diff =
    entityType === "site_item"
      ? buildSiteItemDiff(currentSnapshot, previousSnapshot)
      : buildProductionDiff(currentSnapshot, previousSnapshot, entityType);

  return {
    id: row?.history_id || row?.revision_key || `${entityType}-${index}`,
    created_at: row?.changed_at || "",
    actor_name: row?.changed_by || "Неизвестно",
    event_type: previousRow ? "update" : "create",
    diff_json: JSON.stringify(diff),
    meta_json: JSON.stringify({
      entity_type: entityType,
      entity_id: row?.entity_id || history?.meta?.entity_id || null,
    }),
    summary: {
      name: currentSnapshot?.name || "",
      date_start: formatDate(currentSnapshot?.date_start),
      date_end: formatDate(currentSnapshot?.date_end),
      changed_at: formatDate(row?.changed_at, true),
      changed_by: row?.changed_by || "Неизвестно",
    },
  };
}

function renderHistorySummary(item) {
  const summary = item?.summary || {};

  return (
    <Grid
      container
      spacing={1}
      alignItems="center"
      sx={{ width: "100%", pr: 1 }}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography sx={{ fontWeight: 700 }}>{summary.name || "Без названия"}</Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {summary.date_start || "—"}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {summary.date_end || "—"}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 2.5 }}>
        <Chip
          size="small"
          variant="outlined"
          label={summary.changed_at || "—"}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {summary.changed_by || "Неизвестно"}
        </Typography>
      </Grid>
    </Grid>
  );
}

const revisionStatusLabels = {
  scheduled: "Запланирована",
  active: "Действует",
  expired: "Завершена",
  cancelled: "Отменена",
  superseded: "Заменена",
  legacy: "Старая история",
};

function revisionKey(row) {
  return String(row?.revision_key || row?.history_id || "");
}

function revisionPeriod(row) {
  const from = formatDate(row?.effective_date_start || row?.date_start) || "—";
  const to = formatDate(row?.effective_date_end || row?.date_end) || "без окончания";
  return `${from} — ${to}`;
}

function revisionStatusColor(status) {
  return {
    active: "success",
    scheduled: "info",
    cancelled: "error",
    superseded: "warning",
    expired: "default",
    legacy: "default",
  }[status || "legacy"];
}

function previousEffectiveRevision(rows, selectedRow) {
  if (!selectedRow) return null;

  const explicitKey = String(selectedRow?.previous_revision_key || "");
  if (explicitKey) {
    const explicit = rows.find((row) => revisionKey(row) === explicitKey);
    if (explicit) return explicit;
  }

  const selectedIndex = rows.findIndex((row) => revisionKey(row) === revisionKey(selectedRow));
  if (selectedIndex < 0) return null;

  return (
    rows
      .slice(selectedIndex + 1)
      .find((row) => !["cancelled", "superseded"].includes(row?.revision_status || "legacy")) ||
    null
  );
}

function historyResponseRevision(response) {
  return response?.revision || response?.data?.revision || null;
}

function assertHistoryResponse(response, fallback) {
  if (!response?.st) {
    throw new Error(response?.text || fallback);
  }

  return response;
}

function snapshotFieldRows(snapshot, entityType) {
  if (!snapshot) {
    return [];
  }

  if (entityType === "site_item") {
    return Object.keys(siteItemHistoryFieldLabels).map((field) => ({
      field,
      label: siteItemHistoryFieldLabels[field],
      value: formatSiteItemValue(field, snapshot),
    }));
  }

  const labels = getProductionFieldLabels(entityType === "recipe");
  return Object.keys(labels).map((field) => ({
    field,
    label: labels[field],
    value: formatProductionValue(field, snapshot, entityType),
  }));
}

function snapshotSections(entityType) {
  if (entityType === "site_item") {
    return [
      {
        title: "Основные",
        rows: [
          ["name", "short_name"],
          ["date_start", "date_end"],
          ["art", "category_id", "category_id2", "is_mark", "mark_code"],
          ["weight", "count_part", "stol"],
        ],
      },
      {
        title: "Статусы и отображение",
        rows: [["is_show", "show_program", "show_site", "is_new", "is_hit", "is_spicy"]],
      },
      {
        title: "Пищевая ценность и этапы",
        rows: [
          ["protein", "fat", "carbohydrates"],
          ["time_stage_1", "time_stage_2", "time_stage_3"],
        ],
      },
      {
        title: "Описание",
        rows: [["tmp_desc"], ["marc_desc"], ["marc_desc_full"], ["tags"], ["img_app"]],
      },
    ];
  }

  return [
    {
      title: "Основные",
      rows: [
        ["name"],
        ["shelf_life"],
        ["ed_izmer", "date_start", "date_end"],
        ["time_min", "time_min_dop", "all_w_brutto", "all_w_netto", "all_w"],
        ["is_show", "show_in_rev", "two_user"],
      ],
    },
    {
      title: "Привязки",
      rows: [["categories", "storages"], ["allergens", "allergens_possible"], ["apps"]],
    },
    { title: "Описание", rows: [["structure"]] },
  ];
}

function changePresentation(status) {
  return {
    added: { label: "Добавлено", color: "success", borderColor: "success.main" },
    removed: { label: "Удалено", color: "error", borderColor: "error.main" },
    changed: { label: "Изменено", color: "warning", borderColor: "warning.main" },
  }[status];
}

function isBooleanStatusField(field) {
  return [
    "is_show",
    "show_in_rev",
    "show_program",
    "show_site",
    "is_new",
    "is_hit",
    "is_spicy",
  ].includes(field);
}

function SnapshotCard({ snapshot, compareSnapshot, entityType, onlyChanges }) {
  const sourceRows = snapshotFieldRows(snapshot, entityType);
  const compareRows = snapshotFieldRows(compareSnapshot, entityType);
  const rows = sourceRows
    .map((row) => {
      const previous = compareRows.find((candidate) => candidate.label === row.label)?.value;
      const changed = Boolean(compareSnapshot) && row.value !== previous;
      const added = changed && !previous && Boolean(row.value);
      const removed = changed && Boolean(previous) && !row.value;
      const status = removed ? "removed" : added ? "added" : changed ? "changed" : "unchanged";

      return { ...row, previous: previous || "", changed, added, removed, status };
    })
    .filter((row) => !onlyChanges || row.changed);

  const byLabel = new Map(rows.map((row) => [row.label, row]));
  const labels =
    entityType === "site_item"
      ? siteItemHistoryFieldLabels
      : getProductionFieldLabels(entityType === "recipe");

  return (
    <Stack spacing={1.5}>
      {snapshotSections(entityType).map((section) => {
        const sectionRows = section.rows
          .map((fields) => fields.map((field) => byLabel.get(labels[field])).filter(Boolean))
          .filter((group) => group.length);

        if (!sectionRows.length) return null;

        return (
          <Paper
            key={section.title}
            variant="outlined"
            sx={{ overflow: "hidden", borderRadius: 2 }}
          >
            <Box
              sx={{
                px: { xs: 1.5, md: 2 },
                py: 1.25,
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                {section.title}
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 1.5, md: 2 } }}>
              {sectionRows.map((group, groupIndex) => (
                <Box
                  key={group.map((row) => row.field).join("-")}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      sm:
                        group.length === 1
                          ? "minmax(0, 1fr)"
                          : `repeat(${Math.min(group.length, 2)}, minmax(0, 1fr))`,
                      md: `repeat(${group.length}, minmax(0, 1fr))`,
                    },
                    borderBottom: groupIndex < sectionRows.length - 1 ? "1px solid" : "none",
                    borderBottomColor: "divider",
                  }}
                >
                  {group.map((row, rowIndex) => {
                    const change = changePresentation(row.status);
                    const fullWidthRow = group.length === 1;

                    return (
                      <Box
                        key={row.label}
                        sx={{
                          minHeight: fullWidthRow ? 58 : 76,
                          display: "grid",
                          gridTemplateColumns: fullWidthRow
                            ? { xs: "1fr", sm: "minmax(130px, 36%) minmax(0, 1fr)" }
                            : "minmax(0, 1fr)",
                          gap: 0.75,
                          alignItems: "start",
                          boxSizing: "border-box",
                          py: 1.25,
                          px: 1.25,
                          borderLeft: "3px solid",
                          borderLeftColor: change?.borderColor || "transparent",
                          borderRight: {
                            xs: "none",
                            md: rowIndex < group.length - 1 ? "1px solid" : "none",
                          },
                          borderRightColor: "divider",
                          borderBottom: {
                            xs: rowIndex < group.length - 1 ? "1px solid" : "none",
                            md: "none",
                          },
                          borderBottomColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {row.label}
                        </Typography>
                        <Stack
                          spacing={0.5}
                          sx={{ minWidth: 0 }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            useFlexGap
                            flexWrap="wrap"
                          >
                            {isBooleanStatusField(row.field) && row.value ? (
                              <Chip
                                size="small"
                                variant="outlined"
                                color={row.value === "Да" ? "success" : "default"}
                                label={row.value}
                                sx={{ height: 24 }}
                              />
                            ) : (
                              <Typography
                                sx={{
                                  minWidth: 0,
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "break-word",
                                  wordBreak: "normal",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {row.value || "—"}
                              </Typography>
                            )}
                            {change ? (
                              <Chip
                                size="small"
                                variant="outlined"
                                color={change.color}
                                label={change.label}
                                sx={{ height: 22 }}
                              />
                            ) : null}
                          </Stack>
                          {row.changed && row.previous ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                textDecoration: "line-through",
                                overflowWrap: "break-word",
                                wordBreak: "normal",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              Было: {row.previous}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}

function compositionRows(snapshot, entityType) {
  if (!snapshot) return [];

  if (entityType !== "site_item") {
    return (snapshot?.items || snapshot?.composition || []).map((item, index) => ({
      key: `${item?.type || item?.type_rec || "item"}:${item?.item_id || 0}:${item?.stage || 0}:${item?.sort ?? index}`,
      label: item?.name || `Компонент #${item?.item_id || 0}`,
      value: formatProductionComposition([item]),
    }));
  }

  const stages = normalizeSiteItemStageRows(snapshot).map((item, index) => ({
    key: `${item?.type || "pf"}:${item?.pf_id || item?.rec_id || item?.selected_id || 0}:${item?.stage || 0}:${item?.sort ?? index}`,
    label: item?.name || `Компонент #${item?.pf_id || item?.rec_id || item?.selected_id || 0}`,
    value: formatSiteItemCollection([item]),
  }));
  const linked = (snapshot?.item_items?.this_items || []).map((item, index) => ({
    key: `site_item:${item?.item_id || 0}:linked:${item?.sort ?? index}`,
    label: item?.name || `Товар сайта #${item?.item_id || 0}`,
    value: formatSiteItemCollection([item], { isFinal: true }),
  }));

  return [...stages, ...linked];
}

function CompositionChanges({ snapshot, compareSnapshot, entityType, onlyChanges }) {
  const current = new Map(compositionRows(snapshot, entityType).map((row) => [row.key, row]));
  const previous = new Map(
    compositionRows(compareSnapshot, entityType).map((row) => [row.key, row]),
  );
  const keys = [...new Set([...current.keys(), ...previous.keys()])];
  const rows = keys
    .map((key) => {
      const currentRow = current.get(key);
      const previousRow = previous.get(key);
      const status = !compareSnapshot
        ? "unchanged"
        : !previousRow
          ? "added"
          : !currentRow
            ? "removed"
            : currentRow.value !== previousRow.value
              ? "changed"
              : "unchanged";

      return { key, currentRow, previousRow, status };
    })
    .filter((row) => !onlyChanges || row.status !== "unchanged");

  if (!rows.length) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ overflow: "hidden", borderRadius: 2 }}
    >
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1.25,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700 }}
        >
          Состав
        </Typography>
      </Box>
      <TableContainer>
        <Table
          size="small"
          sx={{ minWidth: 700 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Позиция</TableCell>
              <TableCell>Значение в выбранной версии</TableCell>
              <TableCell>Предыдущее значение</TableCell>
              <TableCell width={120}>Изменение</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const change = changePresentation(row.status);

              return (
                <TableRow key={row.key}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      borderLeft: "3px solid",
                      borderLeftColor: change?.borderColor || "transparent",
                    }}
                  >
                    {row.currentRow?.label || row.previousRow?.label || "Компонент"}
                  </TableCell>
                  <TableCell>
                    {row.currentRow?.value ||
                      (row.status === "removed" ? "Удалён из состава" : "—")}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      textDecoration:
                        row.status === "changed" || row.status === "removed"
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {row.status === "changed" || row.status === "removed"
                      ? row.previousRow?.value || "—"
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {change ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={change.color}
                        label={change.label}
                        sx={{ height: 22 }}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export function SkladEmbeddedHistoryTable({ history, emptyText = "История пока пуста." }) {
  const api = useSkladApi();
  const { canManageProduction, canManageSiteItems } = useSkladAccess();
  const sourceRows = useMemo(() => getHistoryRows(history), [history]);
  const [showAll, setShowAll] = useState(false);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [selectedKey, setSelectedKey] = useState(() => revisionKey(sourceRows[0]));
  const [resolvedDate, setResolvedDate] = useState("");
  const [snapshots, setSnapshots] = useState(() => ({}));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolutionWarning, setResolutionWarning] = useState("");
  const [cancelledKeys, setCancelledKeys] = useState(() => new Set());
  const entityType = history?.meta?.entity_type || sourceRows[0]?.entity_type || "";
  const entityId = history?.meta?.entity_id || sourceRows[0]?.entity_id || null;
  const canManageSchedule = entityType === "site_item" ? canManageSiteItems : canManageProduction;
  const rows = useMemo(
    () =>
      sourceRows
        .map((row) =>
          cancelledKeys.has(revisionKey(row)) ? { ...row, revision_status: "cancelled" } : row,
        )
        .filter(
          (row) =>
            showAll || !["cancelled", "superseded"].includes(row?.revision_status || "legacy"),
        ),
    [cancelledKeys, showAll, sourceRows],
  );
  const selectedIndex = rows.findIndex((row) => revisionKey(row) === selectedKey);
  const selectedRow = rows[selectedIndex] || rows[0] || null;
  const compareRow = previousEffectiveRevision(sourceRows, selectedRow);
  const compareKey = revisionKey(compareRow);

  useEffect(() => {
    if (!rows.some((row) => revisionKey(row) === selectedKey)) {
      setSelectedKey(revisionKey(rows[0]));
    }
  }, [rows, selectedKey]);

  useEffect(() => {
    if (!compareKey) {
      setOnlyChanges(false);
    }
  }, [compareKey]);

  useEffect(() => {
    let active = true;
    const keys = [selectedKey, compareKey].filter(Boolean);
    const missing = keys.filter((key) => snapshots[key] === undefined);

    if (!entityId || !entityType || !missing.length) {
      return undefined;
    }

    setLoading(true);
    setError("");
    setResolutionWarning("");
    Promise.all(
      missing.map(async (key) => {
        const local = sourceRows.find((row) => revisionKey(row) === key)?.snapshot;
        if (local) {
          return [key, local];
        }

        const response = assertHistoryResponse(
          await api.historyGetOne({
            entity_type: entityType,
            entity_id: entityId,
            revision_key: key,
          }),
          "Не удалось загрузить выбранную версию.",
        );
        const revision = historyResponseRevision(response);
        return [key, revision?.snapshot || null];
      }),
    )
      .then((loaded) => {
        if (active) {
          setSnapshots((current) => ({ ...current, ...Object.fromEntries(loaded) }));
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError?.message || "Не удалось загрузить выбранную версию.");
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [api, compareKey, entityId, entityType, selectedKey, snapshots, sourceRows]);

  if (!rows.length) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 2 }}
      >
        {emptyText}
      </Alert>
    );
  }

  const selectedSnapshot = snapshots[revisionKey(selectedRow)] || selectedRow?.snapshot || null;
  const compareSnapshot = snapshots[revisionKey(compareRow)] || compareRow?.snapshot || null;

  const resolveOnDate = async () => {
    if (!resolvedDate) return;
    setLoading(true);
    setError("");
    try {
      const response = assertHistoryResponse(
        await api.historyResolve({
          entity_type: entityType,
          entity_id: entityId,
          date: resolvedDate,
        }),
        "На выбранную дату версия не найдена.",
      );
      setResolutionWarning(response?.warning || response?.data?.warning || "");
      const resolved = historyResponseRevision(response);
      const key = revisionKey(resolved);
      if (key) {
        setSnapshots((current) => ({ ...current, [key]: resolved?.snapshot || null }));
        setSelectedKey(key);
      }
    } catch (requestError) {
      setError(requestError?.message || "На выбранную дату версия не найдена.");
    } finally {
      setLoading(false);
    }
  };

  const cancelSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      assertHistoryResponse(
        await api.cancelScheduledHistory({
          entity_type: entityType,
          entity_id: entityId,
          revision_key: revisionKey(selectedRow),
        }),
        "Не удалось отменить запланированную версию.",
      );
      setCancelledKeys((current) => new Set([...current, revisionKey(selectedRow)]));
    } catch (requestError) {
      setError(requestError?.message || "Не удалось отменить запланированную версию.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {resolutionWarning ? <Alert severity="warning">{resolutionWarning}</Alert> : null}
      {selectedRow?.revision_status === "legacy" ? (
        <Alert severity="warning">
          Старая версия: названия справочников без собственного снимка могут быть показаны в текущем
          состоянии.
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{ overflow: "hidden" }}
      >
        <Stack spacing={1.5}>
          <Box sx={{ px: 1.5, pt: 1.5 }}>
            <Typography sx={{ fontWeight: 700 }}>Сохранения</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Выберите строку, чтобы открыть полное состояние карточки.
            </Typography>
          </Box>

          <TableContainer sx={{ maxHeight: 280 }}>
            <Table
              stickyHeader
              size="small"
              aria-label="Список сохранений"
              sx={{ minWidth: 760 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Сохранено</TableCell>
                  <TableCell>Автор</TableCell>
                  <TableCell>Действует с</TableCell>
                  <TableCell>Действует по</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const key = revisionKey(row);
                  const selected = key === revisionKey(selectedRow);

                  return (
                    <TableRow
                      key={key}
                      hover
                      selected={selected}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => setSelectedKey(key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedKey(key);
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{formatDate(row?.changed_at, true) || "—"}</TableCell>
                      <TableCell>{row?.changed_by || "Неизвестно"}</TableCell>
                      <TableCell>
                        {formatDate(row?.effective_date_start || row?.date_start) || "—"}
                      </TableCell>
                      <TableCell>
                        {formatDate(row?.effective_date_end || row?.date_end) || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={revisionStatusColor(row?.revision_status)}
                          label={revisionStatusLabels[row?.revision_status] || "Версия"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid
            container
            spacing={1.5}
            alignItems="center"
            sx={{ px: 1.5 }}
          >
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Состояние на дату"
                value={resolvedDate}
                onChange={(event) => setResolvedDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                disabled={!resolvedDate || loading}
                onClick={resolveOnDate}
              >
                Показать
              </Button>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
            sx={{ px: 1.5, pb: 1.5 }}
          >
            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                size="small"
                startIcon={<NavigateBeforeIcon />}
                disabled={selectedIndex >= rows.length - 1}
                onClick={() => setSelectedKey(revisionKey(rows[selectedIndex + 1]))}
              >
                Предыдущий период
              </Button>
              <Button
                size="small"
                endIcon={<NavigateNextIcon />}
                disabled={selectedIndex <= 0}
                onClick={() => setSelectedKey(revisionKey(rows[selectedIndex - 1]))}
              >
                Следующий период
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={showAll}
                    onChange={(event) => setShowAll(event.target.checked)}
                  />
                }
                label="Показывать отменённые и заменённые"
              />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 1.5 }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                size="small"
                color={revisionStatusColor(selectedRow?.revision_status)}
                label={revisionStatusLabels[selectedRow?.revision_status] || "Версия"}
              />
              <Typography variant="body2">{revisionPeriod(selectedRow)}</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {formatDate(selectedRow?.changed_at, true) || "—"} ·{" "}
                {selectedRow?.changed_by || "Неизвестно"}
              </Typography>
            </Stack>
            {selectedRow?.can_cancel_schedule && canManageSchedule ? (
              <Button
                color="error"
                size="small"
                disabled={loading}
                onClick={cancelSchedule}
              >
                Отменить версию
              </Button>
            ) : null}
          </Stack>

          <Grid
            container
            spacing={1.5}
            alignItems="center"
          >
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  minHeight: 52,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.25 }}
                >
                  Сравнение
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {compareRow
                    ? `С предыдущей версией: ${revisionPeriod(compareRow)}`
                    : "Предыдущей версии нет"}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyChanges}
                    disabled={!compareSnapshot || loading}
                    onChange={(event) => setOnlyChanges(event.target.checked)}
                  />
                }
                label="Только изменения"
              />
              {!compareRow ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: -0.5 }}
                >
                  Для первой версии изменения не рассчитываются.
                </Typography>
              ) : null}
            </Grid>
          </Grid>

          {loading && !selectedSnapshot ? (
            <Stack
              alignItems="center"
              sx={{ py: 4 }}
            >
              <CircularProgress size={28} />
            </Stack>
          ) : selectedSnapshot ? (
            <>
              <SnapshotCard
                snapshot={selectedSnapshot}
                compareSnapshot={compareSnapshot}
                entityType={entityType}
                onlyChanges={onlyChanges}
              />
              <CompositionChanges
                snapshot={selectedSnapshot}
                compareSnapshot={compareSnapshot}
                entityType={entityType}
                onlyChanges={onlyChanges}
              />
            </>
          ) : (
            <Alert severity="warning">Полный снимок версии недоступен.</Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

export function SkladEmbeddedImageHistoryTable({
  imageHistory,
  imageAssetKey = "",
  onRestoreImage,
  emptyText = "История изображения пока пуста.",
}) {
  const rows = getImageHistoryRows(imageHistory);

  if (!rows.length) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 2 }}
      >
        {emptyText}
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      {rows.map((row, index) => {
        const beforeUrl = resolveHistoryImageUrl(row?.before_image, imageAssetKey);
        const afterUrl = resolveHistoryImageUrl(row?.after_image, imageAssetKey);
        const rowKey = `${row?.history_id ?? row?.revision_key ?? "history"}-${index}`;

        return (
          <Accordion
            key={rowKey}
            component={Paper}
            variant="outlined"
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                sx={{ width: "100%", pr: 1 }}
              >
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={{ fontWeight: 700 }}>Изменение изображения</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={formatDate(row?.changed_at, true) || "—"}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatValue(row?.changed_by, "Неизвестно")}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700 }}
                      >
                        До
                      </Typography>
                      {beforeUrl ? (
                        <Box
                          component="img"
                          src={beforeUrl}
                          alt="До изменения"
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Изображение отсутствовало.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700 }}
                      >
                        После
                      </Typography>
                      {afterUrl ? (
                        <Box
                          component="img"
                          src={afterUrl}
                          alt="После изменения"
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Изображение отсутствует.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                {row?.can_restore ? (
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onRestoreImage?.(row?.history_id)}
                    >
                      Восстановить
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
