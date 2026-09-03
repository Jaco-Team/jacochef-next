"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { MyAutocomplite, MyDatePickerNew, MyTimeInput } from "@/ui/Forms";
import { SkladEmbeddedHistoryTable } from "../history/SkladEmbeddedHistoryTable";
import SkladSectionCard from "../ui/SkladSectionCard";

const TODAY = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Samara" });

function ids(value) {
  return (Array.isArray(value) ? value : [])
    .map((row) => Number(typeof row === "object" ? row?.id : row))
    .filter(Boolean);
}

function sanitizePackQuantity(value) {
  return String(value ?? "").replace(/[^\d\p{P}\s]/gu, "");
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
    <Autocomplete
      size="small"
      multiple
      options={options || []}
      value={selected}
      getOptionLabel={(row) => row?.name || ""}
      isOptionEqualToValue={(option, selectedOption) =>
        Number(option?.id) === Number(selectedOption?.id)
      }
      onChange={(_, next) => onChange(next.map((row) => Number(row.id)))}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={label}
        />
      )}
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState(0);
  const [draft, setDraft] = useState(() => normalize(detail?.item));

  useEffect(() => {
    setDraft(normalize(detail?.item));
    setTab(detail?.initialHistoryTab ? 1 : 0);
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
    onSave({ ...draft, id: detail?.item?.id || null });
  };

  const field = (permission, key, label, options = {}) =>
    canView(permission) ? (
      <TextField
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
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, minHeight: { md: "76dvh" } } }}
    >
      <DialogTitle>
        {detail?.item?.id ? `Редактирование: ${detail.item.name}` : "Новый товар склада"}
      </DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Карточка" />
        {detail?.item?.id ? <Tab label="История" /> : null}
      </Tabs>
      <DialogContent
        dividers
        sx={{ bgcolor: "grey.50", p: { xs: 1.5, md: 2 } }}
      >
        {tab === 1 && detail?.item?.id ? (
          <SkladEmbeddedHistoryTable history={detail?.history} />
        ) : (
          <Stack spacing={1.5}>
            <SkladSectionCard
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
                    <MyAutocomplite
                      label="Категория"
                      data={categoryOptions}
                      multiple={false}
                      value={selectedCategory}
                      func={(_, value) => set("category_id", value?.id ? Number(value.id) : "")}
                      disabled={!canEdit("categories")}
                      unifiedPopup
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          required
                          label="Категория"
                        />
                      )}
                    />
                  </Grid>
                ) : null}
                {canView("unit") ? (
                  <Grid size={{ xs: 12, md: 2 }}>
                    <MyAutocomplite
                      label="Единица"
                      data={detail?.units || []}
                      multiple={false}
                      value={selectedUnit}
                      func={(_, value) => set("ed_izmer_id", value?.id ? Number(value.id) : "")}
                      disabled={!canEdit("unit")}
                      unifiedPopup
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          required
                          label="Единица"
                        />
                      )}
                    />
                  </Grid>
                ) : null}
                {canView("date_start") ? (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      required
                      label="Действует с"
                      value={draft?.date_start || ""}
                      minDate={allowPastDate ? undefined : dayjs(TODAY)}
                      disabled={!canEdit("date_start")}
                      func={(value) => set("date_start", value?.format?.("YYYY-MM-DD") || "")}
                    />
                  </Grid>
                ) : null}
                {canView("date_end") ? (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Действует по"
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

            <SkladSectionCard
              title="Закупка и остатки"
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
                <Grid size={{ xs: 12, md: 3 }}>
                  {field("max_count_in_m", "max_count_in_m", "Максимальный вес", {
                    type: "number",
                  })}
                </Grid>
              </Grid>
            </SkladSectionCard>

            <SkladSectionCard
              title="Приготовление"
              description="Состав и временные параметры"
            >
              <Grid
                container
                spacing={1.5}
              >
                <Grid size={{ xs: 12, md: 4 }}>{field("composition", "pf_id", "Состав")}</Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  {canView("time") ? (
                    <MyTimeInput
                      label="Время"
                      value={draft?.time_min || ""}
                      disabled={!canEdit("time")}
                      func={(event) => set("time_min", event.target.value)}
                    />
                  ) : null}
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  {canView("time") ? (
                    <MyTimeInput
                      label="Доп. время"
                      value={draft?.time_dop_min || ""}
                      disabled={!canEdit("time")}
                      func={(event) => set("time_dop_min", event.target.value)}
                    />
                  ) : null}
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  {canView("time") ? (
                    <MyTimeInput
                      label="Другое время"
                      value={draft?.time_min_other || ""}
                      disabled={!canEdit("time")}
                      func={(event) => set("time_min_other", event.target.value)}
                    />
                  ) : null}
                </Grid>
              </Grid>
            </SkladSectionCard>

            <SkladSectionCard
              title="Активность"
              description="Состояния текущей версии"
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
              >
                {[
                  ["activity", "is_show", "Активен"],
                  ["order", "show_in_order", "Показывать в заявке"],
                  ["revision", "show_in_rev", "Показывать в ревизии"],
                ].map(([permission, key, label]) =>
                  canView(permission) ? (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={Boolean(Number(draft?.[key]))}
                          onChange={(event) => set(key, event.target.checked ? 1 : 0)}
                          disabled={!canEdit(permission)}
                        />
                      }
                      label={label}
                    />
                  ) : null,
                )}
              </Stack>
            </SkladSectionCard>

            <SkladSectionCard
              title="Привязки"
              description="Аллергены, хранение, учёт и должности"
            >
              <Grid
                container
                spacing={1.5}
              >
                {canView("allergens") ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <RelationField
                      label="Аллергены"
                      options={detail?.allergens}
                      value={draft?.allergens}
                      onChange={(value) => set("allergens", value)}
                      disabled={!canEdit("allergens")}
                    />
                  </Grid>
                ) : null}
                {canView("allergens_possible") ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <RelationField
                      label="Возможные аллергены"
                      options={detail?.allergens}
                      value={draft?.allergens_possible}
                      onChange={(value) => set("allergens_possible", value)}
                      disabled={!canEdit("allergens_possible")}
                    />
                  </Grid>
                ) : null}
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
                {canView("apps") ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Должность"
                      value={draft?.app_id || ""}
                      onChange={(event) => set("app_id", Number(event.target.value))}
                      disabled={!canEdit("apps")}
                    >
                      <MenuItem value="">Не выбрана</MenuItem>
                      {(detail?.apps || []).map((row) => (
                        <MenuItem
                          key={row.id}
                          value={row.id}
                        >
                          {row.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                ) : null}
              </Grid>
            </SkladSectionCard>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          size="small"
          onClick={onClose}
          disabled={loading}
        >
          Закрыть
        </Button>
        {tab === 0 ? (
          <Button
            size="small"
            variant="contained"
            onClick={submit}
            disabled={loading || !String(draft?.name || "").trim()}
          >
            Сохранить изменения
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
