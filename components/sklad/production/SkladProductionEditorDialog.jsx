"use client";

import { useEffect, useMemo, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
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

import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

const TABS = [
  { value: "main", label: "Основные", icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: "refs", label: "Привязки", icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { value: "composition", label: "Состав", icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { value: "activity", label: "Статус", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

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
    is_active: Number(draft?.is_active ?? 0) === 1,
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
    id: String(item?.id ?? ""),
    name: normalizeOptionName(item),
  }));

  return dedupeSelectOptions(
    emptyLabel ? [{ id: "", name: emptyLabel }].concat(list.filter((item) => item.id)) : list,
  );
}

function formatTagNames(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => normalizeOptionName(item)).filter(Boolean);
}

function normalizeSelectedOptions(value, options) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const match = options.find((option) => String(option?.id ?? "") === String(item?.id ?? item));

    return (
      match || {
        id: item?.id ?? item,
        name: normalizeOptionName(item),
      }
    );
  });
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getCompositionRowKey(item, index) {
  return [item?.item_id ?? item?.id ?? "item", item?.type_rec ?? "type", index].join("-");
}

function getCompositionItemId(item) {
  return String(item?.item_id ?? item?.nomenclature_id ?? item?.id ?? "");
}

function getCompositionItemName(item) {
  return (
    item?.name ||
    item?.item_name ||
    item?.nomenclature_name ||
    item?.item?.name ||
    item?.item?.item_name ||
    "-"
  );
}

function getCompositionUnitName(item) {
  return item?.unit_name || item?.ed_izmer_name || item?.unit?.name || "-";
}

function getCompositionLoss(item) {
  return item?.pr_1 ?? item?.loss ?? item?.waste ?? item?.proc_loss ?? item?.loss_percent ?? "";
}

function getCompositionOutput(item) {
  return item?.res ?? item?.output ?? item?.all_w ?? item?.weight_out ?? "-";
}

function InfoCard({ title, description, children }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack spacing={1.5}>
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
        {children}
      </Stack>
    </Paper>
  );
}

export default function SkladProductionEditorDialog({
  open,
  loading = false,
  mode = "edit",
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
  const [activeTab, setActiveTab] = useState("main");
  const [form, setForm] = useState(() => buildInitialDraft(draft));
  const [expandedField, setExpandedField] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialDraft(draft));
    setActiveTab("main");
    setExpandedField("");
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
      options.push({
        id: String(form.ed_izmer_id),
        name: draft.unit_name,
      });
    }

    return dedupeSelectOptions(options);
  }, [draft?.unit_name, form.ed_izmer_id, units]);

  const safeUnitValue = useMemo(() => {
    return unitOptions.some((item) => String(item.id) === String(form.ed_izmer_id))
      ? form.ed_izmer_id
      : "";
  }, [form.ed_izmer_id, unitOptions]);

  const categoryOptions = useMemo(() => normalizeOptions(categories), [categories]);
  const allergenOptions = useMemo(() => normalizeOptions(allergens), [allergens]);
  const storageOptions = useMemo(() => normalizeOptions(storages), [storages]);
  const appOptions = useMemo(() => normalizeOptions(apps), [apps]);
  const itemOptions = useMemo(
    () => normalizeOptions(allItemsList, "Выберите номенклатуру"),
    [allItemsList],
  );

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
  const selectedCategoryNames = useMemo(
    () => formatTagNames(selectedCategories),
    [selectedCategories],
  );
  const selectedStorageNames = useMemo(() => formatTagNames(selectedStorages), [selectedStorages]);
  const selectedAppNames = useMemo(() => formatTagNames(selectedApps), [selectedApps]);
  const derivedAllergenNames = useMemo(
    () => formatTagNames(form.allergens_derived),
    [form.allergens_derived],
  );
  const derivedPossibleAllergenNames = useMemo(
    () => formatTagNames(form.allergens_possible_derived),
    [form.allergens_possible_derived],
  );

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRelationField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: Array.isArray(value) ? value : [],
    }));
  };

  const updateCompositionRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: (Array.isArray(prev?.items) ? prev.items : []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addCompositionRow = () => {
    setForm((prev) => ({
      ...prev,
      items: (Array.isArray(prev?.items) ? prev.items : []).concat({
        item_id: "",
        type_rec: "item",
        brutto: "",
        pr_1: "",
        netto: "",
        pr_2: "",
        res: "",
      }),
    }));
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
                {TABS.map((section) => (
                  <Tab
                    key={section.value}
                    value={section.value}
                    icon={section.icon}
                    iconPosition="start"
                    label={section.label}
                  />
                ))}
              </TabList>

              <TabPanel
                value="main"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <InfoCard
                    title="Основные данные"
                    description="Основные данные карточки: срок действия, единица измерения, время приготовления и расчетные веса"
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
                          func={(value) =>
                            updateField("date_end", value?.format?.("YYYY-MM-DD") || "")
                          }
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
                        <MyTextInput
                          label="Состав"
                          value={form.structure}
                          multiline
                          minRows={3}
                          maxRows={expandedField === "structure" ? 10 : 4}
                          disabled={!isEditable}
                          func={(event) => updateField("structure", event.target.value)}
                          onFocus={() => setExpandedField("structure")}
                          onBlur={() =>
                            setExpandedField((prev) => (prev === "structure" ? "" : prev))
                          }
                        />
                      </Grid>
                    </Grid>
                  </InfoCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="refs"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <InfoCard
                    title="Категории"
                    description="Категории, по которым карточка отображается и фильтруется в складском справочнике"
                  >
                    <MyAutocomplite
                      multiple
                      label="Категории"
                      data={categoryOptions}
                      value={selectedCategories}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("categories", value)}
                    />
                  </InfoCard>

                  <InfoCard
                    title="Аллергены"
                    description="Аллергены, указанные вручную для этой карточки"
                  >
                    <MyAutocomplite
                      multiple
                      label="Аллергены"
                      data={allergenOptions}
                      value={selectedAllergens}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("allergens", value)}
                    />
                  </InfoCard>

                  <InfoCard
                    title="Возможные аллергены"
                    description="Возможные аллергены, указанные вручную для этой карточки"
                  >
                    <MyAutocomplite
                      multiple
                      label="Возможные аллергены"
                      data={allergenOptions}
                      value={selectedPossibleAllergens}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("allergens_possible", value)}
                    />
                  </InfoCard>

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoCard
                        title="Аллергены по составу"
                        description="Рассчитывается автоматически по составу карточки"
                      >
                        <Typography color="text.secondary">
                          {derivedAllergenNames.length
                            ? derivedAllergenNames.join(", ")
                            : "Нет расчетных аллергенов."}
                        </Typography>
                      </InfoCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoCard
                        title="Возможные аллергены по составу"
                        description="Рассчитывается автоматически по составу карточки"
                      >
                        <Typography color="text.secondary">
                          {derivedPossibleAllergenNames.length
                            ? derivedPossibleAllergenNames.join(", ")
                            : "Нет расчетных возможных аллергенов."}
                        </Typography>
                      </InfoCard>
                    </Grid>
                  </Grid>

                  <InfoCard
                    title="Места хранения"
                    description="Места хранения, где используется или хранится эта заготовка"
                  >
                    <MyAutocomplite
                      multiple
                      label="Места хранения"
                      data={storageOptions}
                      value={selectedStorages}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("storages", value)}
                    />
                  </InfoCard>

                  <InfoCard
                    title="Должности в кафе"
                    description="Должности в кафе, связанные с приготовлением этой карточки"
                  >
                    <MyAutocomplite
                      multiple
                      label="Должности в кафе"
                      data={appOptions}
                      value={selectedApps}
                      disabled={!isEditable}
                      func={(_, value) => updateRelationField("apps", value)}
                    />
                  </InfoCard>

                  <InfoCard
                    title="Итог по привязкам"
                    description="Краткая сводка выбранных привязок"
                  >
                    <Grid
                      container
                      spacing={1.5}
                    >
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Категории
                        </Typography>
                        <Typography>
                          {selectedCategoryNames.length ? selectedCategoryNames.join(", ") : "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Места хранения
                        </Typography>
                        <Typography>
                          {selectedStorageNames.length ? selectedStorageNames.join(", ") : "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Должности в кафе
                        </Typography>
                        <Typography>
                          {selectedAppNames.length ? selectedAppNames.join(", ") : "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </InfoCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="composition"
                sx={{ p: 0, pt: 2 }}
              >
                <InfoCard
                  title="Состав"
                  description="Состав карточки: номенклатура, единица измерения, брутто, потери, нетто и выход"
                >
                  {form.items.length ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Номенклатура</TableCell>
                            <TableCell>Ед.</TableCell>
                            <TableCell align="right">Брутто</TableCell>
                            <TableCell align="right">% потери ХО</TableCell>
                            <TableCell align="right">Нетто</TableCell>
                            <TableCell align="right">% потери ГО</TableCell>
                            <TableCell align="right">Выход</TableCell>
                            {isEditable ? <TableCell align="right"> </TableCell> : null}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {form.items.map((item, index) => (
                            <TableRow key={getCompositionRowKey(item, index)}>
                              <TableCell sx={{ minWidth: 260 }}>
                                {isEditable ? (
                                  <MySelect
                                    label=""
                                    data={itemOptions}
                                    is_none={false}
                                    value={getCompositionItemId(item)}
                                    disabled={!isEditable}
                                    func={(event) =>
                                      updateCompositionRow(index, "item_id", event.target.value)
                                    }
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
                                  <Button
                                    color="error"
                                    onClick={() => removeCompositionRow(index)}
                                  >
                                    Удалить
                                  </Button>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">Состав пока не заполнен.</Typography>
                  )}
                  {isEditable ? (
                    <Button
                      sx={{ mt: 2 }}
                      variant="outlined"
                      onClick={addCompositionRow}
                    >
                      Добавить строку состава
                    </Button>
                  ) : null}
                </InfoCard>
              </TabPanel>

              <TabPanel
                value="activity"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <InfoCard
                    title="Флаги"
                    description="Настройки отображения карточки, участия в ревизии и нормы сотрудников"
                  >
                    <Stack spacing={0.5}>
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
                      <MyCheckBox
                        label="Показывать карточку"
                        value={form.is_show}
                        disabled={!isEditable}
                        func={(event) => updateField("is_show", event.target.checked)}
                      />
                    </Stack>
                  </InfoCard>

                  <InfoCard
                    title="Текущий статус"
                    description="Текущие признаки карточки по сохраненным данным"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        label={form.is_active ? "Активен" : "Скрыт"}
                        size="small"
                        color={form.is_active ? "success" : "default"}
                      />
                      <Chip
                        label={form.is_show ? "Показывается" : "Скрыта"}
                        size="small"
                        variant="outlined"
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
                  </InfoCard>
                </Stack>
              </TabPanel>
            </TabContext>
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
