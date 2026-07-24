"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import SmartDiff from "@/ui/history/SmartDiff";
import { resolveSiteItemImageUrl } from "../site-items/siteItemImage";

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
    items: isRecipe ? "Номенклатура" : "Номенклатура заготовки",
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
  category_id: "Категория",
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
  img_app: "Изображение",
  stage_rows: "Заготовки и рецепты",
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
    case "is_mark":
      return formatSiteItemMarking(snapshot?.marking?.is_mark ?? snapshot?.is_mark);
    case "mark_code":
      return formatValue(snapshot?.marking?.mark_code ?? snapshot?.mark_code);
    case "is_show":
    case "show_program":
    case "show_site":
    case "is_new":
    case "is_hit":
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

export function SkladEmbeddedHistoryTable({ history, emptyText = "История пока пуста." }) {
  const rows = getHistoryRows(history);

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

  const normalized = rows.map((row, index) =>
    buildHistoryItem(history, row, rows[index + 1] || null, index),
  );

  return (
    <Stack spacing={1.25}>
      {normalized.map((item) => (
        <Accordion
          key={item.id}
          component={Paper}
          variant="outlined"
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {renderHistorySummary(item)}
          </AccordionSummary>
          <AccordionDetails>
            <SmartDiff item={item} />
          </AccordionDetails>
        </Accordion>
      ))}
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

        return (
          <Accordion
            key={`${row?.history_id ?? row?.revision_key ?? index}`}
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
