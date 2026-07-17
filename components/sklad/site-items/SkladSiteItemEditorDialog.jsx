"use client";

import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";

const EDITOR_SECTIONS = [
  { value: "main", label: "Основные", icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: "nutrition", label: "БЖУ", icon: <RestaurantOutlinedIcon fontSize="small" /> },
  { value: "description", label: "Описание", icon: <TuneOutlinedIcon fontSize="small" /> },
  { value: "tags", label: "Теги", icon: <SellOutlinedIcon fontSize="small" /> },
  { value: "activity", label: "Активность", icon: <SettingsOutlinedIcon fontSize="small" /> },
  { value: "composition", label: "Состав", icon: <LocalOfferOutlinedIcon fontSize="small" /> },
];

const MARKING_OPTIONS = [
  { id: "0", name: "Обычный товар" },
  { id: "1", name: "Вода" },
  { id: "2", name: "Сладкий напиток" },
];

function createEmptySiteItemRelations() {
  return {
    composition_source: {
      pf: [],
      recipes: [],
    },
    composition_derived: {
      pf_total: [],
    },
    item_items: {
      this_items: [],
      all_items: [],
    },
    items_stage: {
      stage_1: [],
      stage_2: [],
      stage_3: [],
      all: [],
    },
  };
}

function buildInitialDraft(draft) {
  const emptyRelations = createEmptySiteItemRelations();

  return {
    id: draft?.id ?? null,
    name: draft?.name ?? "",
    short_name: draft?.short_name ?? "",
    category_id: draft?.category_id ? String(draft.category_id) : "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    art: draft?.art ?? "",
    stol: draft?.stol ?? "",
    count_part: draft?.count_part ?? "",
    weight: draft?.weight ?? "",
    protein: draft?.protein ?? "",
    fat: draft?.fat ?? "",
    carbohydrates: draft?.carbohydrates ?? "",
    kkal: draft?.kkal ?? "",
    kkal_preview: draft?.kkal_preview ?? "",
    tmp_desc: draft?.tmp_desc ?? "",
    marc_desc: draft?.marc_desc ?? "",
    marc_desc_full: draft?.marc_desc_full ?? "",
    is_mark: String(draft?.marking?.is_mark ?? draft?.is_mark ?? 0),
    mark_code: draft?.marking?.mark_code ?? draft?.mark_code ?? "",
    series: draft?.marking?.series ?? draft?.series ?? "",
    is_akchis: Number(draft?.marking?.is_akchis ?? draft?.is_akchis ?? 0) === 1,
    tags: Array.isArray(draft?.tags) ? draft.tags : [],
    show_site: Number(draft?.show_site ?? 0) === 1,
    show_program: Number(draft?.show_program ?? 0) === 1,
    is_show: Number(draft?.is_show ?? draft?.is_active ?? 0) === 1,
    is_hit: Number(draft?.is_hit ?? 0) === 1,
    is_new: Number(draft?.is_new ?? 0) === 1,
    time_stage_1: draft?.time_stage_1 ?? "",
    time_stage_2: draft?.time_stage_2 ?? "",
    time_stage_3: draft?.time_stage_3 ?? "",
    composition_source: draft?.composition_source ?? emptyRelations.composition_source,
    composition_derived: draft?.composition_derived ?? emptyRelations.composition_derived,
    item_items: draft?.item_items ?? emptyRelations.item_items,
    items_stage: draft?.items_stage ?? emptyRelations.items_stage,
  };
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

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export default function SkladSiteItemEditorDialog({
  open,
  mode = "edit",
  draft,
  categories = [],
  tags = [],
  isEditable = false,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("main");
  const [form, setForm] = useState(() => buildInitialDraft(draft));

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialDraft(draft));
    setActiveTab("main");
  }, [draft, open]);

  const categoryOptions = useMemo(() => {
    return [{ id: "", name: "Выберите категорию" }].concat(
      (categories || []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name || String(item?.id || ""),
      })),
    );
  }, [categories]);

  const tagNames = useMemo(() => {
    return Array.isArray(form.tags) ? form.tags.map((tag) => tag?.name).filter(Boolean) : [];
  }, [form.tags]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const compositionSourceCount =
    (Array.isArray(form?.composition_source?.pf) ? form.composition_source.pf.length : 0) +
    (Array.isArray(form?.composition_source?.recipes) ? form.composition_source.recipes.length : 0);

  const compositionDerivedCount = Array.isArray(form?.composition_derived?.pf_total)
    ? form.composition_derived.pf_total.length
    : 0;

  const linkedItemsCount = Array.isArray(form?.item_items?.this_items)
    ? form.item_items.this_items.length
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ pr: 7 }}>
        {mode === "create"
          ? "Новый товар сайта"
          : `Редактирование: ${draft?.name || "Товар сайта"}`}
        <IconButton
          onClick={onClose}
          aria-label="Закрыть"
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert
            severity="info"
            sx={{ borderRadius: 2 }}
          >
            Это wireframe редактора. Поля уже разложены по legacy-логике, но save/upload/tag
            mutations intentionally не отправляются в API до следующего backend pass.
          </Alert>

          {!isEditable ? (
            <Alert
              severity="warning"
              sx={{ borderRadius: 2 }}
            >
              Редактор открыт в preview-режиме без edit access. Табы и компоновка можно проверить,
              но сохранение останется выключенным.
            </Alert>
          ) : null}

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
              {EDITOR_SECTIONS.map((section) => (
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
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 8 }}>
                  <InfoCard
                    title="Основные данные"
                    description="Базовая карточка, близкая к legacy tab `Основные`"
                  >
                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid size={{ xs: 12, md: 8 }}>
                        <MyTextInput
                          label="Наименование"
                          value={form.name}
                          disabled={!isEditable}
                          func={(event) => updateField("name", event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <MyTextInput
                          label="Короткое название"
                          value={form.short_name}
                          disabled={!isEditable}
                          func={(event) => updateField("short_name", event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <MySelect
                          label="Категория"
                          data={categoryOptions}
                          is_none={false}
                          value={form.category_id}
                          disabled={!isEditable}
                          func={(event) => updateField("category_id", event.target.value)}
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
                          disabled={!isEditable}
                          func={(value) =>
                            updateField("date_end", value?.format?.("YYYY-MM-DD") || "")
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <MyTextInput
                          label="Код 1С"
                          value={form.art}
                          disabled={!isEditable}
                          func={(event) => updateField("art", event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <MyTextInput
                          label="Стол"
                          value={form.stol}
                          disabled={!isEditable}
                          func={(event) => updateField("stol", event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <MyTextInput
                          label="Кусочков или размер"
                          value={form.count_part}
                          disabled={!isEditable}
                          func={(event) => updateField("count_part", event.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </InfoCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2}>
                    <InfoCard
                      title="Маркировка"
                      description="Вынесена в editor shell сразу, как в legacy flow"
                    >
                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid size={12}>
                          <MySelect
                            label="Тип маркировки"
                            data={MARKING_OPTIONS}
                            is_none={false}
                            value={form.is_mark}
                            disabled={!isEditable}
                            func={(event) => updateField("is_mark", event.target.value)}
                          />
                        </Grid>
                        <Grid size={12}>
                          <MyTextInput
                            label="Код маркировки"
                            value={form.mark_code}
                            disabled={!isEditable}
                            func={(event) => updateField("mark_code", event.target.value)}
                          />
                        </Grid>
                        <Grid size={12}>
                          <MyTextInput
                            label="Серия"
                            value={form.series}
                            disabled={!isEditable}
                            func={(event) => updateField("series", event.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </InfoCard>

                    <InfoCard title="Текущее состояние">
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          size="small"
                          color={form.is_show ? "success" : "default"}
                          label={form.is_show ? "Активен" : "Скрыт"}
                        />
                        <Chip
                          size="small"
                          color={form.show_site ? "primary" : "default"}
                          label={form.show_site ? "Сайт" : "Без сайта"}
                        />
                        <Chip
                          size="small"
                          color={form.show_program ? "secondary" : "default"}
                          label={form.show_program ? "Касса" : "Без кассы"}
                        />
                      </Stack>
                    </InfoCard>
                  </Stack>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel
              value="nutrition"
              sx={{ p: 0, pt: 2 }}
            >
              <InfoCard
                title="БЖУ"
                description="Вес, БЖУ и калорийность"
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Вес"
                      value={form.weight}
                      disabled={!isEditable}
                      func={(event) => updateField("weight", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Белки"
                      value={form.protein}
                      disabled={!isEditable}
                      func={(event) => updateField("protein", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Жиры"
                      value={form.fat}
                      disabled={!isEditable}
                      func={(event) => updateField("fat", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyTextInput
                      label="Углеводы"
                      value={form.carbohydrates}
                      disabled={!isEditable}
                      func={(event) => updateField("carbohydrates", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyTextInput
                      label="Ккал (persisted)"
                      value={form.kkal}
                      disabled={!isEditable}
                      func={(event) => updateField("kkal", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <MyTextInput
                      label="Ккал preview"
                      value={form.kkal_preview}
                      disabled
                    />
                  </Grid>
                </Grid>
              </InfoCard>
            </TabPanel>

            <TabPanel
              value="description"
              sx={{ p: 0, pt: 2 }}
            >
              <InfoCard
                title="Описание"
                description="Тексты карточки и списка"
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={12}>
                    <MyTextInput
                      label="Состав"
                      value={form.tmp_desc}
                      disabled={!isEditable}
                      func={(event) => updateField("tmp_desc", event.target.value)}
                      multiline
                      minRows={3}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MyTextInput
                      label="Короткое описание"
                      value={form.marc_desc}
                      disabled={!isEditable}
                      func={(event) => updateField("marc_desc", event.target.value)}
                      multiline
                      minRows={3}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MyTextInput
                      label="Полное описание"
                      value={form.marc_desc_full}
                      disabled={!isEditable}
                      func={(event) => updateField("marc_desc_full", event.target.value)}
                      multiline
                      minRows={5}
                    />
                  </Grid>
                </Grid>
              </InfoCard>
            </TabPanel>

            <TabPanel
              value="tags"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <InfoCard
                  title="Теги"
                  description="Read-first wireframe под следующий tag-management slice"
                >
                  {tagNames.length ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      {tagNames.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Теги пока не назначены.</Typography>
                  )}
                </InfoCard>

                <Alert
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  Inline tag create/edit deliberately postponed until `site-items/tags/save_new` and
                  `save_edit` are validated against the current API quality.
                </Alert>
              </Stack>
            </TabPanel>

            <TabPanel
              value="activity"
              sx={{ p: 0, pt: 2 }}
            >
              <InfoCard
                title="Активность"
                description="Публикация, продажа и промо-флаги"
              >
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Chip
                    clickable
                    disabled={!isEditable}
                    color={form.is_show ? "success" : "default"}
                    label={form.is_show ? "Активен" : "Скрыт"}
                    onClick={() => updateField("is_show", !form.is_show)}
                  />
                  <Chip
                    clickable
                    disabled={!isEditable}
                    color={form.show_site ? "primary" : "default"}
                    label={form.show_site ? "Показывать на сайте" : "Скрыт на сайте"}
                    onClick={() => updateField("show_site", !form.show_site)}
                  />
                  <Chip
                    clickable
                    disabled={!isEditable}
                    color={form.show_program ? "secondary" : "default"}
                    label={form.show_program ? "Показывать на кассе" : "Скрыт на кассе"}
                    onClick={() => updateField("show_program", !form.show_program)}
                  />
                  <Chip
                    clickable
                    disabled={!isEditable}
                    color={form.is_hit ? "warning" : "default"}
                    label={form.is_hit ? "Хит" : "Не хит"}
                    onClick={() => updateField("is_hit", !form.is_hit)}
                  />
                  <Chip
                    clickable
                    disabled={!isEditable}
                    color={form.is_new ? "info" : "default"}
                    label={form.is_new ? "Новинка" : "Обычный"}
                    onClick={() => updateField("is_new", !form.is_new)}
                  />
                </Stack>
              </InfoCard>
            </TabPanel>

            <TabPanel
              value="composition"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <InfoCard
                  title="Состав технологической карты"
                  description="Каркас под staged composition editor"
                >
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 4 }}>
                      <MyTextInput
                        label="Время на 1 этап"
                        value={form.time_stage_1}
                        disabled={!isEditable}
                        func={(event) => updateField("time_stage_1", event.target.value)}
                        isTimeMask
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <MyTextInput
                        label="Время на 2 этап"
                        value={form.time_stage_2}
                        disabled={!isEditable}
                        func={(event) => updateField("time_stage_2", event.target.value)}
                        isTimeMask
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <MyTextInput
                        label="Время на 3 этап"
                        value={form.time_stage_3}
                        disabled={!isEditable}
                        func={(event) => updateField("time_stage_3", event.target.value)}
                        isTimeMask
                      />
                    </Grid>
                  </Grid>
                </InfoCard>

                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Исходные связи">
                      <Typography sx={{ fontWeight: 700 }}>{compositionSourceCount}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Текущие связи с рецептами и заготовками
                      </Typography>
                    </InfoCard>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Итоговый состав">
                      <Typography sx={{ fontWeight: 700 }}>{compositionDerivedCount}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Derived rows из `composition_derived.pf_total`
                      </Typography>
                    </InfoCard>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Связанные позиции">
                      <Typography sx={{ fontWeight: 700 }}>{linkedItemsCount}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Link rows из `item_items.this_items`
                      </Typography>
                    </InfoCard>
                  </Grid>
                </Grid>

                <Alert
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  Full composition row editor is the next FE slice. The shell is already aligned so
                  staged PF/recipe inputs can be mounted here without rebuilding the dialog.
                </Alert>
              </Stack>
            </TabPanel>
          </TabContext>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Закрыть</Button>
        <Button disabled>Сохранить черновик</Button>
        <Button
          variant="contained"
          disabled
        >
          {mode === "create" ? "Создать товар" : "Сохранить изменения"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
