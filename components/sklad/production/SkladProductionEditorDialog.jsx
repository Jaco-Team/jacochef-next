"use client";

import { useEffect, useMemo, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import SkladCsvAutocompleteField from "../SkladCsvAutocompleteField";

function dedupeSelectOptions(options) {
  const seen = new Set();

  return options.filter((option) => {
    const key = String(option?.id ?? "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildInitialDraft(draft) {
  return {
    id: draft?.id ?? null,
    name: draft?.name ?? "",
    shelf_life: draft?.shelf_life ?? "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    ed_izmer_id: draft?.ed_izmer_id ? String(draft.ed_izmer_id) : "",
    all_w: draft?.all_w ?? "",
    all_w_brutto: draft?.all_w_brutto ?? "",
    all_w_netto: draft?.all_w_netto ?? "",
    time_min: draft?.time_min ?? "",
    time_min_dop: draft?.time_min_dop ?? "",
    structure: draft?.structure ?? "",
    show_in_rev: Number(draft?.show_in_rev ?? 0) === 1,
    two_user: Number(draft?.two_user ?? 0) === 1,
    is_show: Number(draft?.is_show ?? 1) === 1,
    categories: Array.isArray(draft?.categories) ? draft.categories : [],
    allergens: Array.isArray(draft?.allergens) ? draft.allergens : [],
    allergens_possible: Array.isArray(draft?.allergens_possible) ? draft.allergens_possible : [],
    allergens_derived: Array.isArray(draft?.allergens_derived) ? draft.allergens_derived : [],
    allergens_possible_derived: Array.isArray(draft?.allergens_possible_derived)
      ? draft.allergens_possible_derived
      : [],
    storages: Array.isArray(draft?.storages) ? draft.storages : [],
    apps: Array.isArray(draft?.apps) ? draft.apps : [],
    items: Array.isArray(draft?.items) ? draft.items : [],
  };
}

function normalizeOptionName(item) {
  return (
    item?.name ??
    item?.title ??
    item?.label ??
    item?.app_name ??
    item?.storage_name ??
    item?.allergen_name ??
    String(item?.id ?? "")
  );
}

function normalizeOptions(options, emptyLabel = "") {
  const list = (options || []).map((item) => ({
    ...item,
    id: String(item?.id ?? ""),
    name: normalizeOptionName(item),
  }));

  return dedupeSelectOptions(
    emptyLabel ? [{ id: "", name: emptyLabel }].concat(list.filter((item) => item.id)) : list,
  );
}

function getTypedCompositionOptionKey(item) {
  const typedKey = item?.id_name ?? item?.un_id;

  if (typedKey) {
    return String(typedKey);
  }

  if (item?.id === null || item?.id === undefined || item?.id === "") {
    return "";
  }

  return `${item.id}-${item?.type_rec ?? item?.type ?? "item"}`;
}

function normalizeItemOptions(options) {
  const list = (options || []).map((item) => ({
    ...item,
    id: getTypedCompositionOptionKey(item),
    source_id: item?.id ?? "",
    type_rec: item?.type_rec ?? item?.type ?? "item",
    ei_name: item?.ei_name ?? item?.unit_name ?? item?.ed_izmer_name ?? "",
    name: normalizeOptionName(item),
  }));

  return dedupeSelectOptions(list.filter((item) => item.id));
}

function normalizeSelectedOptions(value, options) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const match = options.find((option) => String(option?.id ?? "") === String(item?.id ?? item));

    return match || { id: item?.id ?? item, name: normalizeOptionName(item) };
  });
}

function formatTagNames(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => normalizeOptionName(item)).filter(Boolean);
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getPrimitiveId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return value?.id !== null && value?.id !== undefined ? String(value.id) : "";
  }

  const valueType = typeof value;
  return valueType === "string" || valueType === "number" ? String(value) : "";
}

function getCompositionRowKey(item, index) {
  return [
    item?.item_option_key ||
      item?.id_name ||
      item?.un_id ||
      getPrimitiveId(item?.item_id) ||
      getPrimitiveId(item?.nomenclature_id) ||
      getPrimitiveId(item?.id) ||
      "item",
    item?.type_rec ?? "type",
    index,
  ].join("-");
}

function getCompositionItemId(item) {
  return (
    item?.item_option_key ||
    item?.id_name ||
    item?.un_id ||
    getPrimitiveId(item?.item_id) ||
    getPrimitiveId(item?.nomenclature_id) ||
    getPrimitiveId(item?.id)
  );
}

function getCompositionItemName(item) {
  return (
    item?.name ||
    item?.item_name ||
    item?.nomenclature_name ||
    item?.item?.name ||
    item?.item?.item_name ||
    item?.item_id?.name ||
    "-"
  );
}

function getCompositionUnitName(item) {
  return item?.unit_name || item?.ei_name || item?.ed_izmer_name || item?.unit?.name || "-";
}

function getCompositionLoss(item) {
  return item?.pr_1 ?? item?.loss ?? item?.waste ?? item?.proc_loss ?? item?.loss_percent ?? "";
}

function getCompositionOutput(item) {
  return item?.res ?? item?.output ?? item?.all_w ?? item?.weight_out ?? "-";
}

function SectionCard({ icon, title, description, children }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {icon}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export default function SkladProductionEditorDialog({
  open,
  loading = false,
  mode = "edit",
  entityType = "semi_finished",
  entityLabel,
  draft,
  units = [],
  categories = [],
  allergens = [],
  storages = [],
  apps = [],
  allItemsList = [],
  isEditable = false,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(() => buildInitialDraft(draft));

  const isRecipe = entityType === "recipe";

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialDraft(draft));
  }, [draft, open]);

  const unitOptions = useMemo(() => {
    const options = [{ id: "", name: "Выберите единицу" }].concat(
      (units || []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name || String(item?.id || ""),
      })),
    );

    if (
      form.ed_izmer_id &&
      !options.some((item) => String(item.id) === String(form.ed_izmer_id)) &&
      draft?.unit_name
    ) {
      options.push({ id: String(form.ed_izmer_id), name: draft.unit_name });
    }

    return dedupeSelectOptions(options);
  }, [draft?.unit_name, form.ed_izmer_id, units]);

  const safeUnitValue = useMemo(
    () =>
      unitOptions.some((item) => String(item.id) === String(form.ed_izmer_id))
        ? form.ed_izmer_id
        : "",
    [form.ed_izmer_id, unitOptions],
  );

  const categoryOptions = useMemo(() => normalizeOptions(categories), [categories]);
  const allergenOptions = useMemo(() => normalizeOptions(allergens), [allergens]);
  const storageOptions = useMemo(() => normalizeOptions(storages), [storages]);
  const appOptions = useMemo(() => normalizeOptions(apps), [apps]);
  const itemOptions = useMemo(() => normalizeItemOptions(allItemsList), [allItemsList]);

  const selectedCategories = useMemo(
    () => normalizeSelectedOptions(form.categories, categoryOptions),
    [categoryOptions, form.categories],
  );
  const selectedAllergens = useMemo(
    () => normalizeSelectedOptions(form.allergens, allergenOptions),
    [allergenOptions, form.allergens],
  );
  const selectedPossibleAllergens = useMemo(
    () => normalizeSelectedOptions(form.allergens_possible, allergenOptions),
    [allergenOptions, form.allergens_possible],
  );
  const selectedStorages = useMemo(
    () => normalizeSelectedOptions(form.storages, storageOptions),
    [form.storages, storageOptions],
  );
  const selectedApps = useMemo(
    () => normalizeSelectedOptions(form.apps, appOptions),
    [appOptions, form.apps],
  );
  const derivedAllergenNames = useMemo(
    () => formatTagNames(form.allergens_derived),
    [form.allergens_derived],
  );
  const derivedPossibleAllergenNames = useMemo(
    () => formatTagNames(form.allergens_possible_derived),
    [form.allergens_possible_derived],
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRelationField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: Array.isArray(value) ? value : [] }));
  };

  const updateCompositionRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: (Array.isArray(prev?.items) ? prev.items : []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateCompositionItem = (index, option) => {
    setForm((prev) => ({
      ...prev,
      items: (Array.isArray(prev?.items) ? prev.items : []).map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (!option?.id) {
          return {
            ...item,
            item_id: "",
            item_option_key: "",
            type_rec: "item",
            name: "",
            unit_name: "",
            ei_name: "",
          };
        }

        return {
          ...item,
          item_id: option?.source_id ? String(option.source_id) : "",
          item_option_key: option.id,
          type_rec: option?.type_rec ?? option?.type ?? "item",
          name: option?.name ?? "",
          unit_name: option?.ei_name ?? option?.unit_name ?? option?.ed_izmer_name ?? "",
          ei_name: option?.ei_name ?? option?.unit_name ?? option?.ed_izmer_name ?? "",
        };
      }),
    }));
  };

  const appendCompositionItem = (option) => {
    if (!option?.id) {
      return;
    }

    setForm((prev) => {
      const items = Array.isArray(prev?.items) ? prev.items : [];
      const exists = items.some(
        (item) => String(item?.item_option_key || "") === String(option.id),
      );

      if (exists) {
        return prev;
      }

      return {
        ...prev,
        items: items.concat({
          item_id: option?.source_id ? String(option.source_id) : "",
          item_option_key: option.id,
          type_rec: option?.type_rec ?? option?.type ?? "item",
          name: option?.name ?? "",
          unit_name: option?.ei_name ?? option?.unit_name ?? option?.ed_izmer_name ?? "",
          ei_name: option?.ei_name ?? option?.unit_name ?? option?.ed_izmer_name ?? "",
          brutto: "0",
          pr_1: "0",
          netto: "0",
          pr_2: "0",
          res: "0",
        }),
      };
    });
  };

  const removeCompositionRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: (Array.isArray(prev?.items) ? prev.items : []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const submitLabel = mode === "create" ? "Создать" : "Сохранить изменения";

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={
        mode === "create"
          ? `Новый ${entityLabel.toLowerCase()}`
          : `Редактирование: ${draft?.name || entityLabel}`
      }
    >
      <DialogContent dividers>
        <Stack spacing={2}>
          {!isEditable ? (
            <Alert
              severity="warning"
              sx={{ borderRadius: 2 }}
            >
              Недостаточно прав для сохранения этой карточки. Поля доступны только для просмотра.
            </Alert>
          ) : null}

          {loading ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 2 }}
            >
              Загружаем данные карточки...
            </Alert>
          ) : (
            <Stack spacing={2}>
              <SectionCard
                icon={<InfoOutlinedIcon fontSize="small" />}
                title="Основные"
                description="Ключевые поля карточки: название, срок действия, единица и расчетные значения."
              >
                <Grid
                  container
                  spacing={1.5}
                >
                  <Grid size={12}>
                    <MyTextInput
                      label="Название"
                      value={form.name}
                      disabled={!isEditable}
                      func={(event) => updateField("name", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Срок годности"
                      value={form.shelf_life}
                      disabled={!isEditable}
                      func={(event) => updateField("shelf_life", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MySelect
                      label="Единица"
                      data={unitOptions}
                      is_none={false}
                      value={safeUnitValue}
                      disabled={!isEditable}
                      func={(event) => updateField("ed_izmer_id", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Действует с"
                      value={form.date_start}
                      disabled={!isEditable}
                      func={(value) =>
                        updateField("date_start", value?.format?.("YYYY-MM-DD") || "")
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Действует по"
                      value={form.date_end}
                      clearable
                      customActions
                      disabled={!isEditable}
                      func={(value) => updateField("date_end", value?.format?.("YYYY-MM-DD") || "")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Время приготовления"
                      value={form.time_min}
                      disabled={!isEditable}
                      func={(event) => updateField("time_min", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Доп. время"
                      value={form.time_min_dop}
                      disabled={!isEditable}
                      func={(event) => updateField("time_min_dop", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <MyTextInput
                      label="Выход"
                      value={form.all_w}
                      disabled={!isEditable}
                      func={(event) => updateField("all_w", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <MyTextInput
                      label="Брутто"
                      value={form.all_w_brutto}
                      disabled={!isEditable}
                      func={(event) => updateField("all_w_brutto", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <MyTextInput
                      label="Нетто"
                      value={form.all_w_netto}
                      disabled={!isEditable}
                      func={(event) => updateField("all_w_netto", event.target.value)}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <MyCheckBox
                        label="Активность"
                        value={form.is_show}
                        disabled={!isEditable}
                        func={(event) => updateField("is_show", event.target.checked)}
                      />
                      <MyCheckBox
                        label="Показывать в ревизии"
                        value={form.show_in_rev}
                        disabled={!isEditable}
                        func={(event) => updateField("show_in_rev", event.target.checked)}
                      />
                      <MyCheckBox
                        label="Требуется 2 сотрудника"
                        value={form.two_user}
                        disabled={!isEditable}
                        func={(event) => updateField("two_user", event.target.checked)}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        label={form.is_show ? "Активен" : "Скрыт"}
                        size="small"
                        color={form.is_show ? "success" : "default"}
                      />
                      <Chip
                        label={form.show_in_rev ? "В ревизии" : "Без ревизии"}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={form.two_user ? "2 сотрудника" : "1 сотрудник"}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard
                icon={<LocalShippingOutlinedIcon fontSize="small" />}
                title="Привязки"
                description="Категории, аллергены, места хранения и должности."
              >
                <Grid
                  container
                  spacing={1.5}
                >
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyAutocomplite
                      multiple
                      label="Категории"
                      data={categoryOptions}
                      value={selectedCategories}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("categories", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyAutocomplite
                      multiple
                      label="Аллергены"
                      data={allergenOptions}
                      value={selectedAllergens}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("allergens", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyAutocomplite
                      multiple
                      label="Места хранения"
                      data={storageOptions}
                      value={selectedStorages}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("storages", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyAutocomplite
                      multiple
                      label="Возможные аллергены"
                      data={allergenOptions}
                      value={selectedPossibleAllergens}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("allergens_possible", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Аллергены по составу
                    </Typography>
                    <Typography>
                      {derivedAllergenNames.length
                        ? derivedAllergenNames.join(", ")
                        : "Нет расчетных аллергенов."}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Возможные аллергены по составу
                    </Typography>
                    <Typography>
                      {derivedPossibleAllergenNames.length
                        ? derivedPossibleAllergenNames.join(", ")
                        : "Нет расчетных возможных аллергенов."}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyAutocomplite
                      multiple
                      label="Должности в кафе"
                      data={appOptions}
                      value={selectedApps}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("apps", value)}
                    />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                title={isRecipe ? "Номенклатура" : "Состав"}
                description={isRecipe ? "Номенклатура рецепта." : "Текстовый состав заготовки."}
              >
                {isRecipe ? (
                  <>
                    {form.items.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Номенклатура</TableCell>
                              <TableCell>Единица измерения</TableCell>
                              <TableCell align="right">Брутто</TableCell>
                              <TableCell align="right">% потери при ХО</TableCell>
                              <TableCell align="right">Нетто</TableCell>
                              <TableCell align="right">% потери при ГО</TableCell>
                              <TableCell align="right">Выход</TableCell>
                              {isEditable ? <TableCell align="right" /> : null}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {form.items.map((item, index) => (
                              <TableRow key={getCompositionRowKey(item, index)}>
                                <TableCell sx={{ minWidth: 260 }}>
                                  {isEditable ? (
                                    <MyAutocomplite
                                      multiple={false}
                                      data={itemOptions}
                                      optionKey="id"
                                      getOptionKey={(option) => option?.id || ""}
                                      getOptionLabel={(option) => option?.name || ""}
                                      isOptionEqualToValue={(option, value) =>
                                        String(option?.id || "") === String(value?.id || "")
                                      }
                                      value={
                                        itemOptions.find(
                                          (option) =>
                                            String(option?.id || "") ===
                                            String(getCompositionItemId(item)),
                                        ) ||
                                        (getCompositionItemId(item)
                                          ? {
                                              id: getCompositionItemId(item),
                                              name: getCompositionItemName(item),
                                              source_id: item?.item_id || "",
                                              type_rec: item?.type_rec || "item",
                                              ei_name: getCompositionUnitName(item),
                                            }
                                          : null)
                                      }
                                      disabled={!isEditable}
                                      func={(_, value) => updateCompositionItem(index, value)}
                                    />
                                  ) : (
                                    getCompositionItemName(item)
                                  )}
                                </TableCell>
                                <TableCell>{getCompositionUnitName(item)}</TableCell>
                                <TableCell align="right">
                                  {isEditable ? (
                                    <MyTextInput
                                      label=""
                                      value={item?.brutto ?? ""}
                                      disabled={!isEditable}
                                      func={(event) =>
                                        updateCompositionRow(index, "brutto", event.target.value)
                                      }
                                    />
                                  ) : (
                                    formatMetricValue(item?.brutto)
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {isEditable ? (
                                    <MyTextInput
                                      label=""
                                      value={getCompositionLoss(item)}
                                      disabled={!isEditable}
                                      func={(event) =>
                                        updateCompositionRow(index, "pr_1", event.target.value)
                                      }
                                    />
                                  ) : (
                                    formatMetricValue(getCompositionLoss(item))
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {isEditable ? (
                                    <MyTextInput
                                      label=""
                                      value={item?.netto ?? ""}
                                      disabled={!isEditable}
                                      func={(event) =>
                                        updateCompositionRow(index, "netto", event.target.value)
                                      }
                                    />
                                  ) : (
                                    formatMetricValue(item?.netto)
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {isEditable ? (
                                    <MyTextInput
                                      label=""
                                      value={item?.pr_2 ?? ""}
                                      disabled={!isEditable}
                                      func={(event) =>
                                        updateCompositionRow(index, "pr_2", event.target.value)
                                      }
                                    />
                                  ) : (
                                    formatMetricValue(item?.pr_2)
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {isEditable ? (
                                    <MyTextInput
                                      label=""
                                      value={getCompositionOutput(item)}
                                      disabled={!isEditable}
                                      func={(event) =>
                                        updateCompositionRow(index, "res", event.target.value)
                                      }
                                    />
                                  ) : (
                                    formatMetricValue(getCompositionOutput(item))
                                  )}
                                </TableCell>
                                {isEditable ? (
                                  <TableCell align="right">
                                    <IconButton
                                      color="error"
                                      onClick={() => removeCompositionRow(index)}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}
                    {isEditable ? (
                      <TableContainer sx={{ mt: form.items.length ? 1.5 : 0 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ minWidth: 260 }}>
                                <MyAutocomplite
                                  multiple={false}
                                  data={itemOptions.filter(
                                    (option) =>
                                      !form.items.some(
                                        (item) =>
                                          String(item?.item_option_key || "") ===
                                          String(option?.id || ""),
                                      ),
                                  )}
                                  optionKey="id"
                                  getOptionKey={(option) => option?.id || ""}
                                  getOptionLabel={(option) => option?.name || ""}
                                  isOptionEqualToValue={(option, value) =>
                                    String(option?.id || "") === String(value?.id || "")
                                  }
                                  value={null}
                                  placeholder="Выберите номенклатуру"
                                  disabled={!isEditable}
                                  func={(_, value) => appendCompositionItem(value)}
                                />
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell align="right">0</TableCell>
                              <TableCell align="right">0</TableCell>
                              <TableCell align="right">0</TableCell>
                              <TableCell align="right">0</TableCell>
                              <TableCell align="right">0</TableCell>
                              <TableCell />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}
                  </>
                ) : (
                  <SkladCsvAutocompleteField
                    label="Состав"
                    value={form.structure}
                    disabled={!isEditable}
                    onChange={(nextValue) => updateField("structure", nextValue)}
                    placeholder="Введите состав через запятую"
                  />
                )}
              </SectionCard>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          variant="contained"
          disabled={!isEditable || loading}
          onClick={() => onSubmit?.(form)}
        >
          {loading ? "Сохраняем..." : submitLabel}
        </Button>
      </DialogActions>
    </MyModal>
  );
}
