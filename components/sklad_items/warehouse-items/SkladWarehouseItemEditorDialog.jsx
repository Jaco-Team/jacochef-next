"use client";

import SkladAutocomplete from "../ui/SkladAutocomplete";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { Box, Grid, Stack, Tab, Tabs, Tooltip } from "@mui/material";

import {
  JacoButton,
  JacoCheckboxField,
  JacoDatePicker,
  JacoFieldSwitch,
  JacoIconButton,
  JacoModal,
  JacoSelect,
  JacoTextInput,
  JacoTimePicker,
  uiColors,
  uiRadii,
} from "@/design-system/shared/ui";
import { SkladEmbeddedHistoryTable } from "../history/SkladEmbeddedHistoryTable";
import SkladSectionCard from "../ui/SkladSectionCard";

const TODAY = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Samara" });
const dateRangeFieldSx = {
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    top: "50%",
    transform: "translate(14px, -50%)",
  },
};

function ids(value) {
  return (Array.isArray(value) ? value : [])
    .map((row) => Number(typeof row === "object" ? row?.id : row))
    .filter(Boolean);
}

function sanitizePackQuantity(value) {
  return String(value ?? "").replace(/[^\d\p{P}\s|]/gu, "");
}

function normalizePackQuantity(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s*(?:[#;,/|\r\n]+)\s*/g, "#")
    .replace(/#+/g, "#")
    .replace(/^#|#$/g, "");
}

function normalize(item = {}) {
  if (!item?.id) {
    return {
      name: "",
      name_for_vendor: "",
      mark_name: "",
      category_id: "",
      ed_izmer_id: "",
      app_id: "",
      date_start: "",
      date_end: "",
      art: "",
      pq: "",
      percent: "",
      vend_percent: "",
      min_count: "",
      max_count_in_m: "",
      pf_id: "",
      time_min: "",
      time_dop_min: "",
      time_min_other: "",
      is_show: "",
      show_in_order: "",
      show_in_rev: "",
      allergens: [],
      allergens_possible: [],
      storages: [],
      accounting_systems: [],
      w_pf: 0,
      w_trash: 0,
      w_item: 0,
      two_user: 0,
      honest_sign: 0,
      mercury: 0,
    };
  }

  return {
    ...item,
    date_start: item?.effective_date_start || item?.date_start || "",
    date_end: item?.effective_date_end || item?.date_end || "",
    category_id: Number(item?.category_id || 0),
    ed_izmer_id: Number(item?.ed_izmer_id || 0),
    app_id: Number(item?.app_id || 0),
    allergens: ids(item?.allergens),
    allergens_possible: ids(item?.allergens_possible),
    storages: ids(item?.storages),
    accounting_systems: ids(item?.accounting_systems),
  };
}

function RelationField({ label, options, value, onChange, disabled }) {
  const selected = (options || []).filter((row) => (value || []).includes(Number(row?.id)));
  return (
    <SkladAutocomplete
      size="small"
      multiple
      label={label}
      options={options || []}
      value={selected}
      getOptionLabel={(row) => row?.name || ""}
      isOptionEqualToValue={(option, selectedOption) =>
        Number(option?.id) === Number(selectedOption?.id)
      }
      onChange={(_, next) => onChange(next.map((row) => Number(row.id)))}
      disabled={disabled}
      slotProps={{ popper: { allowAdaptivePlacement: true } }}
    />
  );
}

export default function SkladWarehouseItemEditorDialog({
  open,
  loading,
  detail,
  access,
  allowPastDate,
  onClose,
  onSave,
}) {
  const [tab, setTab] = useState(0);
  const [packHintOpen, setPackHintOpen] = useState(false);
  const [draft, setDraft] = useState(() => normalize(detail?.item));

  useEffect(() => {
    setDraft(normalize(detail?.item));
    setTab(detail?.initialHistoryTab ? 1 : 0);
    setPackHintOpen(false);
  }, [detail, open]);

  const canView = (field) =>
    Number(access?.[`warehouse_items_${field}_view`]) === 1 ||
    Number(access?.[`warehouse_items_${field}_edit`]) === 1;
  const canEdit = (field) => Number(access?.[`warehouse_items_${field}_edit`]) === 1;
  const set = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const categories = useMemo(
    () =>
      (detail?.categories || []).filter(
        (row) =>
          row?.source_type === "warehouse_item" && !row?.is_group && Number(row?.is_archived) !== 1,
      ),
    [detail?.categories],
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((row) => ({
        ...row,
        name: `${"— ".repeat(Number(row.depth || 0))}${row.name}`,
      })),
    [categories],
  );
  const selectedCategory =
    categoryOptions.find((row) => Number(row.id) === Number(draft?.category_id)) || null;
  const selectedUnit =
    (detail?.units || []).find((row) => Number(row.id) === Number(draft?.ed_izmer_id)) || null;

  const submit = () => {
    if (!String(draft?.name || "").trim()) return;
    if (!draft?.date_start || !draft?.category_id || !draft?.ed_izmer_id) return;
    const normalizePq =
      canEdit("pq") &&
      (!detail?.item?.id || String(draft?.pq ?? "") !== String(normalize(detail?.item).pq ?? ""));
    onSave({
      ...draft,
      pq: normalizePq ? normalizePackQuantity(draft?.pq) : draft?.pq,
      id: detail?.item?.id || null,
    });
  };

  const field = (permission, key, label, options = {}) =>
    canView(permission) ? (
      <JacoTextInput
        size="small"
        fullWidth
        label={label}
        value={draft?.[key] ?? ""}
        onChange={(event) => set(key, event.target.value)}
        disabled={!canEdit(permission)}
        {...options}
      />
    ) : null;

  return (
    <JacoModal
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="lg"
      containedDesktopScroll
      title={detail?.item?.id ? `Редактирование: ${detail.item.name}` : "Новый товар склада"}
      contentSx={{ p: { xs: 1.5, md: 2 } }}
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          <JacoButton
            tone="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Закрыть
          </JacoButton>
          {tab === 0 ? (
            <JacoButton
              tone="success"
              loading={loading}
              onClick={submit}
              disabled={loading || !String(draft?.name || "").trim()}
            >
              Сохранить изменения
            </JacoButton>
          ) : null}
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
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
            label="Карточка"
            icon={<InfoOutlinedIcon fontSize="small" />}
            iconPosition="start"
          />
          {detail?.item?.id ? (
            <Tab
              label="История"
              icon={<HistoryOutlinedIcon fontSize="small" />}
              iconPosition="start"
            />
          ) : null}
        </Tabs>
        <Box
          sx={{ bgcolor: uiColors.surfaceMuted, p: { xs: 1.5, md: 2 }, borderRadius: uiRadii.md }}
        >
          {tab === 1 && detail?.item?.id ? (
            <SkladEmbeddedHistoryTable history={detail?.history} />
          ) : (
            <Stack spacing={2}>
              <SkladSectionCard
                icon={<InfoOutlinedIcon fontSize="small" />}
                title="Основные"
                description="Наименование, классификация и период действия"
              >
                <Grid
                  container
                  spacing={1.5}
                >
                  <Grid size={{ xs: 12, md: 6 }}>
                    {field("name", "name", "Наименование", { required: true })}
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("name_for_vendor", "name_for_vendor", "Для поставщика")}
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("mark_name", "mark_name", "Маркетинговое название")}
                  </Grid>
                  {canView("categories") ? (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <SkladAutocomplete
                        label="Категория"
                        data={categoryOptions}
                        multiple={false}
                        value={selectedCategory}
                        func={(_, value) => set("category_id", value?.id ? Number(value.id) : "")}
                        disabled={!canEdit("categories")}
                        unifiedPopup
                        required
                      />
                    </Grid>
                  ) : null}
                  {canView("unit") ? (
                    <Grid size={{ xs: 12, md: 2 }}>
                      <SkladAutocomplete
                        label="Единица измерения"
                        data={detail?.units || []}
                        multiple={false}
                        value={selectedUnit}
                        func={(_, value) => set("ed_izmer_id", value?.id ? Number(value.id) : "")}
                        disabled={!canEdit("unit")}
                        unifiedPopup
                        required
                      />
                    </Grid>
                  ) : null}
                  {canView("date_start") ? (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <JacoDatePicker
                        required
                        label="Действует с"
                        sx={dateRangeFieldSx}
                        value={draft?.date_start || ""}
                        minDate={allowPastDate ? undefined : dayjs(TODAY)}
                        disabled={!canEdit("date_start")}
                        func={(value) => set("date_start", value?.format?.("YYYY-MM-DD") || "")}
                      />
                    </Grid>
                  ) : null}
                  {canView("date_end") ? (
                    <Grid size={{ xs: 12, md: 3 }}>
                      <JacoDatePicker
                        label="Действует по"
                        sx={dateRangeFieldSx}
                        value={draft?.date_end || ""}
                        minDate={
                          draft?.date_start
                            ? dayjs(draft.date_start)
                            : allowPastDate
                              ? undefined
                              : dayjs(TODAY)
                        }
                        clearable
                        customActions
                        disabled={!canEdit("date_end")}
                        func={(value) => set("date_end", value?.format?.("YYYY-MM-DD") || "")}
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </SkladSectionCard>

              {canView("properties") ? (
                <SkladSectionCard
                  icon={<ScaleOutlinedIcon fontSize="small" />}
                  title="Вес и сотрудники"
                  description="Параметры производственного учёта"
                >
                  <Grid
                    container
                    spacing={1.5}
                  >
                    {[
                      ["w_pf", "Вес заготовки"],
                      ["w_trash", "Вес отхода"],
                      ["w_item", "Вес товара"],
                      ["two_user", "Два сотрудника"],
                    ].map(([key, label]) => (
                      <Grid
                        key={key}
                        size={{ xs: 12, md: 3 }}
                      >
                        <JacoFieldSwitch
                          label={label}
                          checked={Boolean(Number(draft?.[key]))}
                          onChange={(event) => set(key, event.target.checked ? 1 : 0)}
                          disabled={!canEdit("properties")}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </SkladSectionCard>
              ) : null}

              <SkladSectionCard
                title="Закупка и остатки"
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                description="Упаковка, заявка и параметры поставки"
              >
                <Grid
                  container
                  spacing={1.5}
                >
                  <Grid size={{ xs: 12, md: 3 }}>{field("art", "art", "Код 1С")}</Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("pq", "pq", "Количество в упаковке", {
                      onChange: (event) => set("pq", sanitizePackQuantity(event.target.value)),
                      inputAdornment: (
                        <Tooltip
                          title="Несколько значений можно указать через #, ;, /, | или запятую. Дробные значения — через точку, например 0.5#1."
                          open={packHintOpen}
                          onOpen={() => setPackHintOpen(true)}
                          onClose={() => setPackHintOpen(false)}
                          enterTouchDelay={0}
                        >
                          <JacoIconButton
                            aria-label="Подсказка о количестве в упаковке"
                            onClick={() => setPackHintOpen(true)}
                            onFocus={() => setPackHintOpen(true)}
                            onBlur={() => setPackHintOpen(false)}
                            sx={{
                              width: 28,
                              height: 28,
                              border: "none",
                              backgroundColor: "transparent",
                            }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </JacoIconButton>
                        </Tooltip>
                      ),
                    })}
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("percent", "percent", "% заявки", { type: "number" })}
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("vend_percent", "vend_percent", "% повышения цены", { type: "number" })}
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {field("min_count", "min_count", "Минимальный остаток", { type: "number" })}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    {field(
                      "max_count_in_m",
                      "max_count_in_m",
                      "Максимальное количество веса за последние 30 дней",
                      {
                        type: "number",
                        sx: {
                          "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
                            whiteSpace: "normal",
                            maxWidth: "calc(100% - 32px)",
                            top: "50%",
                            transform: "translate(16px, -50%)",
                          },
                        },
                      },
                    )}
                  </Grid>
                </Grid>
              </SkladSectionCard>

              {canView("apps") || canView("time") ? (
                <SkladSectionCard
                  title="Разгрузка"
                  icon={<LocalShippingOutlinedIcon fontSize="small" />}
                  description="Должность и время разгрузки товара"
                >
                  <Grid
                    container
                    spacing={1.5}
                  >
                    {canView("apps") ? (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <JacoSelect
                          label="Должность в кафе"
                          value={draft?.app_id || ""}
                          onChange={(event) => set("app_id", Number(event.target.value))}
                          disabled={!canEdit("apps")}
                          allowNone={false}
                          options={[{ id: "", name: "Не выбрана" }, ...(detail?.apps || [])]}
                        />
                      </Grid>
                    ) : null}
                    {canView("time") ? (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <JacoTimePicker
                          label="Время разгрузки 1 ед. товара (ММ:СС)"
                          helperText="За 1 кг / 1 шт / 1 л товара."
                          value={draft?.time_min_other || ""}
                          disabled={!canEdit("time")}
                          func={(event) => set("time_min_other", event.target.value)}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                </SkladSectionCard>
              ) : null}

              <SkladSectionCard
                title="Активность"
                icon={<ToggleOnOutlinedIcon fontSize="small" />}
                description="Состояния текущей версии"
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                >
                  {[
                    ["activity", "is_show", "Активность"],
                    ["order", "show_in_order", "Показывать в заявке"],
                    ["revision", "show_in_rev", "Показывать в ревизии"],
                  ].map(([permission, key, label]) =>
                    canView(permission) ? (
                      <JacoCheckboxField
                        key={key}
                        checked={Boolean(Number(draft?.[key]))}
                        onChange={(event) => set(key, event.target.checked ? 1 : 0)}
                        disabled={!canEdit(permission)}
                        label={label}
                      />
                    ) : null,
                  )}
                </Stack>
              </SkladSectionCard>

              <SkladSectionCard
                title="Привязки"
                icon={<LinkOutlinedIcon fontSize="small" />}
                description="Хранение и учёт"
              >
                <Grid
                  container
                  spacing={1.5}
                >
                  {canView("storages") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <RelationField
                        label="Места хранения"
                        options={detail?.storages}
                        value={draft?.storages}
                        onChange={(value) => set("storages", value)}
                        disabled={!canEdit("storages")}
                      />
                    </Grid>
                  ) : null}
                  {canView("accounting_systems") ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <RelationField
                        label="Системы учёта"
                        options={detail?.accounting_systems}
                        value={draft?.accounting_systems}
                        onChange={(value) => set("accounting_systems", value)}
                        disabled={!canEdit("accounting_systems")}
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </SkladSectionCard>
            </Stack>
          )}
        </Box>
      </Stack>
    </JacoModal>
  );
}
