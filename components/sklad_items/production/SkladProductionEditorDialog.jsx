"use client";

import SkladAutocomplete from "../ui/SkladAutocomplete";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import {
  JacoButton,
  JacoCheckboxField,
  JacoDatePicker,
  JacoIconButton,
  JacoModal,
  JacoSelect,
  JacoTextInput,
  JacoTimePicker,
} from "@/design-system/shared/ui";
import { SkladEmbeddedHistoryTable } from "../history/SkladEmbeddedHistoryTable";
import SkladSectionCard from "../ui/SkladSectionCard";
import {
  buildInitialDraft,
  calculateProductionTotals,
  dedupeSelectOptions,
  filterProductionCompositionOptions,
  getCompositionItemId,
  getCompositionItemName,
  getCompositionLoss,
  getCompositionOutput,
  getCompositionRowKey,
  getCompositionUnitName,
  normalizeItemOptions,
  normalizeOptions,
  normalizeSelectedOptions,
  recalculateProductionRow,
} from "./productionEditor.helpers";

const dateRangeFieldSx = {
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    top: "50%",
    transform: "translate(14px, -50%)",
  },
};

function getValidProductionDate(value) {
  if (!value) {
    return null;
  }

  const date = dayjs(value);
  return date.isValid() && date.format("YYYY-MM-DD") === value ? date : null;
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
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
  allItemsList = [],
  access = {},
  isEditable = false,
  canViewHistory = false,
  canCreateCategory = false,
  allowPastDate = false,
  initialTab = "main",
  onCreateCategory,
  onChangeEntityType,
  onSubmit,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(canViewHistory ? initialTab : "main");
  const [form, setForm] = useState(() => ({
    ...buildInitialDraft(draft),
    ...(mode === "create" ? { two_user: null } : {}),
  }));

  const isRecipe = entityType === "recipe";
  const compositionTotals = useMemo(() => calculateProductionTotals(form.items), [form.items]);
  const formatTotal = (value) =>
    Number(value).toLocaleString("ru-RU", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const canEditField = (field) => isEditable && Number(access?.[`production_${field}_edit`]) === 1;
  const canViewField = (field) =>
    Number(access?.[`production_${field}_view`]) === 1 ||
    Number(access?.[`production_${field}_edit`]) === 1;
  const missingCreateFields =
    mode === "create"
      ? [
          ["name", "Название"],
          ["shelf_life", "Срок годности"],
          ["date_start", "Действует С"],
        ]
          .filter(([field]) => !canEditField(field))
          .map(([, label]) => label)
      : [];
  const canEditItems = canEditField("items");
  const startDate = getValidProductionDate(form.date_start);
  const endDate = getValidProductionDate(form.date_end);
  const dateRangeError =
    (canEditField("date_start") && form.date_start && !startDate) ||
    (canEditField("date_end") && form.date_end && !endDate)
      ? "Введите корректную дату начала и окончания"
      : (canEditField("date_start") || canEditField("date_end")) &&
          startDate &&
          endDate &&
          endDate.isBefore(startDate, "day")
        ? "Дата окончания не может быть раньше даты начала"
        : "";

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...buildInitialDraft(draft),
      ...(mode === "create" ? { two_user: null } : {}),
    });
    setActiveTab(canViewHistory ? initialTab : "main");
  }, [canViewHistory, draft, initialTab, mode, open]);

  const unitOptions = useMemo(() => {
    const options = (units || []).map((item) => ({
      id: String(item?.id ?? ""),
      name: item?.name || String(item?.id || ""),
    }));

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
        itemIndex === index ? recalculateProductionRow({ ...item, [key]: value }, key) : item,
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
    <JacoModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={
        mode === "create"
          ? `Новый ${entityLabel.toLowerCase()}`
          : `Редактирование: ${draft?.name || entityLabel}`
      }
      actions={
        <Stack
          direction="row"
          spacing={1}
        >
          <JacoButton
            tone="secondary"
            onClick={onClose}
          >
            Закрыть
          </JacoButton>
          <JacoButton
            tone="success"
            disabled={!isEditable || missingCreateFields.length > 0 || Boolean(dateRangeError)}
            loading={loading}
            onClick={() => {
              if (isEditable && !missingCreateFields.length && !dateRangeError) {
                onSubmit?.(form);
              }
            }}
          >
            {submitLabel}
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <JacoSelect
            label="Тип"
            value={entityType}
            options={[
              { id: "recipe", name: "Рецепт" },
              { id: "semi_finished", name: "Полуфабрикат" },
            ]}
            allowNone={false}
            disabled={mode !== "create" || loading || !isEditable || form.items.length > 0}
            onChange={(event) => onChangeEntityType?.(event.target.value)}
          />
          {mode === "create" && form.items.length > 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Чтобы изменить тип, сначала удалите номенклатуру.
            </Typography>
          ) : null}
        </Stack>
        {missingCreateFields.length ? (
          <Alert severity="warning">
            Для создания недостаточно прав на обязательные поля: {missingCreateFields.join(", ")}.
          </Alert>
        ) : null}
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
          <TabContext value={activeTab}>
            <TabList
              onChange={(_, nextValue) => setActiveTab(nextValue)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 44,
                  textTransform: "none",
                  alignItems: "center",
                  gap: 1,
                },
              }}
            >
              <Tab
                value="main"
                icon={<InfoOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Карточка"
              />
              {canViewHistory ? (
                <Tab
                  value="history"
                  icon={<HistoryOutlinedIcon fontSize="small" />}
                  iconPosition="start"
                  label="История"
                />
              ) : null}
            </TabList>

            <TabPanel
              value="main"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <Grid
                  container
                  spacing={1.5}
                >
                  {canViewField("categories") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          alignItems: "center",
                        }}
                      >
                        <Stack sx={{ minWidth: 0, flex: 1 }}>
                          <SkladAutocomplete
                            multiple
                            label="Категории"
                            data={categoryOptions}
                            value={selectedCategories}
                            disabled={!canEditField("categories")}
                            func={(_, value) => updateRelationField("categories", value)}
                          />
                        </Stack>
                        {canCreateCategory && canEditField("categories") ? (
                          <JacoIconButton
                            aria-label="Добавить категорию"
                            onClick={onCreateCategory}
                          >
                            <AddIcon fontSize="small" />
                          </JacoIconButton>
                        ) : null}
                      </Stack>
                    </Grid>
                  ) : null}
                  {canViewField("name") ? (
                    <Grid size={12}>
                      <JacoTextInput
                        label="Название"
                        value={form.name}
                        disabled={!canEditField("name")}
                        onChange={(event) => updateField("name", event.target.value)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("unit") ? (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <SkladAutocomplete
                        label="Единица измерения"
                        options={unitOptions}
                        value={
                          unitOptions.find((item) => String(item.id) === String(safeUnitValue)) ??
                          null
                        }
                        multiple={false}
                        freeSolo={false}
                        isOptionEqualToValue={(option, value) =>
                          String(option.id) === String(value.id)
                        }
                        disabled={!canEditField("unit")}
                        onChange={(_event, option) => updateField("ed_izmer_id", option?.id ?? "")}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("storages") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SkladAutocomplete
                        multiple
                        label="Места хранения"
                        data={storageOptions}
                        value={selectedStorages}
                        disabled={!canEditField("storages")}
                        func={(_, value) => updateRelationField("storages", value)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("shelf_life") ? (
                    <Grid size={12}>
                      <JacoTextInput
                        label="Срок годности"
                        value={form.shelf_life}
                        multiline
                        minRows={3}
                        disabled={!canEditField("shelf_life")}
                        onChange={(event) => updateField("shelf_life", event.target.value)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("show_in_rev") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoCheckboxField
                        label="Показывать в ревизии"
                        checked={Boolean(form.show_in_rev)}
                        disabled={!canEditField("show_in_rev")}
                        onChange={(event) => updateField("show_in_rev", event.target.checked)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("time") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoTimePicker
                        label="Время приготовления"
                        value={form.time_min}
                        disabled={!canEditField("time")}
                        onChange={(event) => updateField("time_min", event.target.value)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("dop_time") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoTimePicker
                        label="Доп. время"
                        value={form.time_min_dop}
                        disabled={!canEditField("dop_time")}
                        onChange={(event) => updateField("time_min_dop", event.target.value)}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("two_user") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoSelect
                        label="Количество сотрудников"
                        value={form.two_user === null ? "" : form.two_user ? "1" : "0"}
                        options={[
                          { id: 0, name: "Один сотрудник" },
                          { id: 1, name: "Два сотрудника" },
                        ]}
                        allowNone={false}
                        disabled={!canEditField("two_user")}
                        onChange={(event) => updateField("two_user", event.target.value === "1")}
                      />
                    </Grid>
                  ) : null}
                  {canViewField("date_start") ? (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <JacoDatePicker
                        label="Действует С"
                        sx={dateRangeFieldSx}
                        value={form.date_start}
                        minDate={allowPastDate ? undefined : dayjs().startOf("day")}
                        maxDate={endDate ?? undefined}
                        disabled={!canEditField("date_start")}
                        onChange={(value) =>
                          updateField("date_start", value?.format?.("YYYY-MM-DD") || "")
                        }
                      />
                    </Grid>
                  ) : null}
                  {canViewField("date_end") ? (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <JacoDatePicker
                        label="Действует по"
                        sx={dateRangeFieldSx}
                        value={form.date_end}
                        minDate={startDate ?? dayjs().startOf("day")}
                        clearable
                        customActions
                        disabled={!canEditField("date_end")}
                        onChange={(value) =>
                          updateField("date_end", value?.format?.("YYYY-MM-DD") || "")
                        }
                      />
                    </Grid>
                  ) : null}
                  {dateRangeError ? (
                    <Grid size={12}>
                      <Alert
                        severity="error"
                        sx={{ borderRadius: 2 }}
                      >
                        {dateRangeError}
                      </Alert>
                    </Grid>
                  ) : null}
                </Grid>

                {!isRecipe && canViewField("structure") ? (
                  <JacoTextInput
                    label="Состав"
                    multiline
                    minRows={3}
                    value={form.structure}
                    disabled={!canEditField("structure")}
                    onChange={(event) => updateField("structure", event.target.value)}
                  />
                ) : null}
                <Grid
                  container
                  spacing={1.5}
                >
                  {!isRecipe ? (
                    <>
                      {canViewField("allergens") ? (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <SkladAutocomplete
                            multiple
                            label="Аллергены"
                            data={allergenOptions}
                            value={selectedAllergens}
                            disabled={!canEditField("allergens")}
                            func={(_, value) => updateRelationField("allergens", value)}
                          />
                        </Grid>
                      ) : null}
                      {canViewField("allergens_diff") ? (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <SkladAutocomplete
                            multiple
                            label="Возможные аллергены"
                            data={allergenOptions}
                            value={selectedPossibleAllergens}
                            disabled={!canEditField("allergens_diff")}
                            func={(_, value) => updateRelationField("allergens_possible", value)}
                          />
                        </Grid>
                      ) : null}
                    </>
                  ) : null}
                </Grid>

                {canViewField("items") ? (
                  <SkladSectionCard
                    icon={<Inventory2OutlinedIcon fontSize="small" />}
                    title="Техническая карта"
                  >
                    <>
                      {canViewField("items") ? (
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
                                {canEditItems ? <TableCell align="right" /> : null}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {form.items.map((item, index) => (
                                <TableRow key={getCompositionRowKey(item, index)}>
                                  <TableCell sx={{ minWidth: 260 }}>
                                    {canEditItems ? (
                                      <SkladAutocomplete
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
                                        filterOptions={filterProductionCompositionOptions}
                                        disabled={!canEditItems}
                                        func={(_, value) => updateCompositionItem(index, value)}
                                      />
                                    ) : (
                                      getCompositionItemName(item)
                                    )}
                                  </TableCell>
                                  <TableCell>{getCompositionUnitName(item)}</TableCell>
                                  <TableCell align="right">
                                    {canEditItems ? (
                                      <JacoTextInput
                                        label=""
                                        value={item?.brutto ?? ""}
                                        inputProps={{
                                          "aria-label": `Брутто: ${getCompositionItemName(item)}`,
                                        }}
                                        disabled={!canEditItems}
                                        func={(event) =>
                                          updateCompositionRow(index, "brutto", event.target.value)
                                        }
                                      />
                                    ) : (
                                      formatMetricValue(item?.brutto)
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {canEditItems ? (
                                      <JacoTextInput
                                        label=""
                                        value={getCompositionLoss(item)}
                                        inputProps={{
                                          "aria-label": `Потери при ХО: ${getCompositionItemName(item)}`,
                                        }}
                                        disabled={!canEditItems}
                                        func={(event) =>
                                          updateCompositionRow(index, "pr_1", event.target.value)
                                        }
                                      />
                                    ) : (
                                      formatMetricValue(getCompositionLoss(item))
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {canEditItems ? (
                                      <JacoTextInput
                                        label=""
                                        value={item?.netto ?? ""}
                                        inputProps={{
                                          "aria-label": `Нетто: ${getCompositionItemName(item)}`,
                                        }}
                                        disabled
                                      />
                                    ) : (
                                      formatMetricValue(item?.netto)
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {canEditItems ? (
                                      <JacoTextInput
                                        label=""
                                        value={item?.pr_2 ?? ""}
                                        inputProps={{
                                          "aria-label": `Потери при ГО: ${getCompositionItemName(item)}`,
                                        }}
                                        disabled={!canEditItems}
                                        func={(event) =>
                                          updateCompositionRow(index, "pr_2", event.target.value)
                                        }
                                      />
                                    ) : (
                                      formatMetricValue(item?.pr_2)
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {canEditItems ? (
                                      <JacoTextInput
                                        label=""
                                        value={getCompositionOutput(item)}
                                        inputProps={{
                                          "aria-label": `Выход: ${getCompositionItemName(item)}`,
                                        }}
                                        disabled
                                      />
                                    ) : (
                                      formatMetricValue(getCompositionOutput(item))
                                    )}
                                  </TableCell>
                                  {canEditItems ? (
                                    <TableCell align="right">
                                      <JacoIconButton
                                        aria-label={`Удалить из техкарты: ${getCompositionItemName(item)}`}
                                        onClick={() => removeCompositionRow(index)}
                                      >
                                        <CloseIcon />
                                      </JacoIconButton>
                                    </TableCell>
                                  ) : null}
                                </TableRow>
                              ))}
                              {canEditItems ? (
                                <TableRow>
                                  <TableCell sx={{ minWidth: 260 }}>
                                    <SkladAutocomplete
                                      key={`composition-add-${form.items.length}`}
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
                                      filterOptions={filterProductionCompositionOptions}
                                      disabled={!canEditItems}
                                      func={(_, value) => appendCompositionItem(value)}
                                    />
                                  </TableCell>
                                  <TableCell colSpan={7} />
                                </TableRow>
                              ) : null}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={2}>Итого</TableCell>
                                <TableCell align="right">
                                  {formatTotal(compositionTotals.all_w_brutto)}
                                </TableCell>
                                <TableCell />
                                <TableCell align="right">
                                  {formatTotal(compositionTotals.all_w_netto)}
                                </TableCell>
                                <TableCell />
                                <TableCell align="right">
                                  {formatTotal(compositionTotals.all_w)}
                                </TableCell>
                                {canEditItems ? <TableCell /> : null}
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </TableContainer>
                      ) : null}
                    </>
                  </SkladSectionCard>
                ) : null}
              </Stack>
            </TabPanel>

            {canViewHistory ? (
              <TabPanel
                value="history"
                sx={{ p: 0, pt: 2 }}
              >
                <SkladSectionCard
                  icon={<HistoryOutlinedIcon fontSize="small" />}
                  title="История"
                >
                  <SkladEmbeddedHistoryTable history={form.history} />
                </SkladSectionCard>
              </TabPanel>
            ) : null}
          </TabContext>
        )}
      </Stack>
    </JacoModal>
  );
}
