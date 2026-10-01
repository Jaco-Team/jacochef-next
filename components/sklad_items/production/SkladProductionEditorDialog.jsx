"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
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
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import {
  JacoAutocomplete,
  JacoButton,
  JacoCheckboxField,
  JacoDatePicker,
  JacoIconButton,
  JacoModal,
  JacoSelect,
  JacoTextInput,
  JacoTimePicker,
} from "@/design-system/shared/ui";
import SkladCsvAutocompleteField from "../SkladCsvAutocompleteField";
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
  apps = [],
  allItemsList = [],
  access = {},
  isEditable = false,
  canViewHistory = false,
  canCreateCategory = false,
  allowPastDate = false,
  initialTab = "main",
  onCreateCategory,
  onSubmit,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(canViewHistory ? initialTab : "main");
  const [form, setForm] = useState(() => buildInitialDraft(draft));

  const isRecipe = entityType === "recipe";
  const createRequiredFields = ["name", "shelf_life", "unit", "date_start", "date_end"];
  const canEditField = (field) =>
    isEditable &&
    (Number(access?.[`production_${field}_edit`]) === 1 ||
      (mode === "create" && createRequiredFields.includes(field)));
  const canEditItems = canEditField("items");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialDraft(draft));
    setActiveTab(canViewHistory ? initialTab : "main");
  }, [canViewHistory, draft, initialTab, open]);

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

  const productionTotals = useMemo(() => calculateProductionTotals(form.items), [form.items]);

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
            disabled={!isEditable}
            loading={loading}
            onClick={() => onSubmit?.(form)}
          >
            {submitLabel}
          </JacoButton>
        </Stack>
      }
    >
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
                <SkladSectionCard
                  icon={<InfoOutlinedIcon fontSize="small" />}
                  title="Основные"
                >
                  <Grid
                    container
                    spacing={1.5}
                  >
                    <Grid size={12}>
                      <JacoTextInput
                        label="Название"
                        value={form.name}
                        disabled={!canEditField("name")}
                        onChange={(event) => updateField("name", event.target.value)}
                      />
                    </Grid>
                    <Grid size={12}>
                      <JacoTextInput
                        label="Срок годности"
                        value={form.shelf_life}
                        disabled={!canEditField("shelf_life")}
                        onChange={(event) => updateField("shelf_life", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <JacoSelect
                        label="Единица"
                        options={unitOptions}
                        allowNone={false}
                        value={safeUnitValue}
                        disabled={!canEditField("unit")}
                        onChange={(event) => updateField("ed_izmer_id", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <JacoDatePicker
                        label="Действует с"
                        value={form.date_start}
                        minDate={allowPastDate ? undefined : dayjs().startOf("day")}
                        disabled={!canEditField("date_start")}
                        onChange={(value) =>
                          updateField("date_start", value?.format?.("YYYY-MM-DD") || "")
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <JacoDatePicker
                        label="Действует по"
                        value={form.date_end}
                        minDate={form.date_start ? dayjs(form.date_start) : dayjs().startOf("day")}
                        clearable
                        customActions
                        disabled={!canEditField("date_end")}
                        onChange={(value) =>
                          updateField("date_end", value?.format?.("YYYY-MM-DD") || "")
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <JacoTimePicker
                        label="Время приготовления"
                        value={form.time_min}
                        disabled={!canEditField("time")}
                        onChange={(event) => updateField("time_min", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <JacoTimePicker
                        label="Доп. время"
                        value={form.time_min_dop}
                        disabled={!canEditField("dop_time")}
                        onChange={(event) => updateField("time_min_dop", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <JacoTextInput
                        label="Брутто"
                        value={productionTotals.all_w_brutto}
                        disabled
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <JacoTextInput
                        label="Нетто"
                        value={productionTotals.all_w_netto}
                        disabled
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <JacoTextInput
                        label="Выход"
                        value={productionTotals.all_w}
                        disabled
                      />
                    </Grid>
                    <Grid size={12}>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{
                          flexWrap: "wrap",
                        }}
                      >
                        <JacoCheckboxField
                          label="Активность"
                          checked={Boolean(form.is_show)}
                          disabled={!canEditField("activity")}
                          onChange={(event) => updateField("is_show", event.target.checked)}
                        />
                        <JacoCheckboxField
                          label="Показывать в ревизии"
                          checked={Boolean(form.show_in_rev)}
                          disabled={!canEditField("show_in_rev")}
                          onChange={(event) => updateField("show_in_rev", event.target.checked)}
                        />
                        <JacoCheckboxField
                          label="Требуется 2 сотрудника"
                          checked={Boolean(form.two_user)}
                          disabled={!canEditField("two_user")}
                          onChange={(event) => updateField("two_user", event.target.checked)}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </SkladSectionCard>

                <SkladSectionCard
                  icon={<LocalShippingOutlinedIcon fontSize="small" />}
                  title="Привязки"
                >
                  <Grid
                    container
                    spacing={1.5}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          alignItems: "center",
                        }}
                      >
                        <Stack sx={{ minWidth: 0, flex: 1 }}>
                          <JacoAutocomplete
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
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoAutocomplete
                        multiple
                        label="Аллергены"
                        data={allergenOptions}
                        value={selectedAllergens}
                        disabled={!canEditField("allergens")}
                        func={(_, value) => updateRelationField("allergens", value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoAutocomplete
                        multiple
                        label="Места хранения"
                        data={storageOptions}
                        value={selectedStorages}
                        disabled={!canEditField("storages")}
                        func={(_, value) => updateRelationField("storages", value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoAutocomplete
                        multiple
                        label="Возможные аллергены"
                        data={allergenOptions}
                        value={selectedPossibleAllergens}
                        disabled={!canEditField("allergens_diff")}
                        func={(_, value) => updateRelationField("allergens_possible", value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <JacoAutocomplete
                        multiple
                        label="Должности в кафе"
                        data={appOptions}
                        value={selectedApps}
                        disabled={!canEditField("apps")}
                        func={(_, value) => updateRelationField("apps", value)}
                      />
                    </Grid>
                  </Grid>
                </SkladSectionCard>

                <SkladSectionCard
                  icon={<Inventory2OutlinedIcon fontSize="small" />}
                  title={isRecipe ? "Номенклатура" : "Состав"}
                >
                  <>
                    {!isRecipe ? (
                      <Stack sx={{ mb: 1.5 }}>
                        <SkladCsvAutocompleteField
                          label="Состав"
                          value={form.structure}
                          disabled={!canEditField("structure")}
                          onChange={(nextValue) => updateField("structure", nextValue)}
                          placeholder="Введите состав через запятую"
                        />
                      </Stack>
                    ) : null}
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
                              {canEditItems ? <TableCell align="right" /> : null}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {form.items.map((item, index) => (
                              <TableRow key={getCompositionRowKey(item, index)}>
                                <TableCell sx={{ minWidth: 260 }}>
                                  {canEditItems ? (
                                    <JacoAutocomplete
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
                                      disabled
                                    />
                                  ) : (
                                    formatMetricValue(getCompositionOutput(item))
                                  )}
                                </TableCell>
                                {canEditItems ? (
                                  <TableCell align="right">
                                    <JacoIconButton onClick={() => removeCompositionRow(index)}>
                                      <CloseIcon />
                                    </JacoIconButton>
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : null}
                    {canEditItems ? (
                      <TableContainer sx={{ mt: form.items.length ? 1.5 : 0 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ minWidth: 260 }}>
                                <JacoAutocomplete
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
                </SkladSectionCard>
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
