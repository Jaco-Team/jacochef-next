"use client";

import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
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

import { MySelect, MyTextInput } from "@/ui/Forms";

const TABS = [
  { value: "main", label: "Основные", icon: <InfoOutlinedIcon fontSize="small" /> },
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
    structure: draft?.structure ?? "",
    show_in_rev: Number(draft?.show_in_rev ?? 0) === 1,
    two_user: Number(draft?.two_user ?? 0) === 1,
    is_active: Number(draft?.is_active ?? 0) === 1,
    categories: Array.isArray(draft?.categories) ? draft.categories : [],
    items: Array.isArray(draft?.items) ? draft.items : [],
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

export default function SkladProductionEditorDialog({
  open,
  loading = false,
  mode = "edit",
  entityLabel,
  draft,
  categories = [],
  units = [],
  isEditable = false,
  onSubmit,
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

  const categoryNames = useMemo(() => {
    return Array.isArray(form.categories)
      ? form.categories.map((item) => item?.name || item?.title || "").filter(Boolean)
      : [];
  }, [form.categories]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submitLabel = mode === "create" ? "Создать" : "Сохранить изменения";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ pr: 7 }}>
        {mode === "create"
          ? `Новый ${entityLabel.toLowerCase()}`
          : `Редактирование: ${draft?.name || entityLabel}`}
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
            Редактор работает на canonical production payload. Поля состава и категорий пока
            остаются read-only в текущем FE scope.
          </Alert>

          {!isEditable ? (
            <Alert
              severity="warning"
              sx={{ borderRadius: 2 }}
            >
              Текущий доступ позволяет проверить layout и поля, но сохранение останется выключенным.
            </Alert>
          ) : null}

          {loading ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 2 }}
            >
              Загружаем payload редактора...
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
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 8 }}>
                    <InfoCard
                      title="Основные поля"
                      description="Shared editor surface для recipe и semi-finished"
                    >
                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid size={{ xs: 12, md: 8 }}>
                          <MyTextInput
                            label="Название"
                            value={form.name}
                            disabled={!isEditable}
                            func={(event) => updateField("name", event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <MyTextInput
                            label="Срок годности"
                            value={form.shelf_life}
                            disabled={!isEditable}
                            func={(event) => updateField("shelf_life", event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <MyTextInput
                            label="Действует с"
                            value={form.date_start}
                            disabled={!isEditable}
                            func={(event) => updateField("date_start", event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <MyTextInput
                            label="Действует по"
                            value={form.date_end}
                            disabled={!isEditable}
                            func={(event) => updateField("date_end", event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <MySelect
                            label="Единица"
                            data={unitOptions}
                            is_none={false}
                            value={safeUnitValue}
                            disabled={!isEditable}
                            func={(event) => updateField("ed_izmer_id", event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <MyTextInput
                            label="Структура"
                            value={form.structure}
                            multiline
                            minRows={3}
                            maxRows={8}
                            disabled={!isEditable}
                            func={(event) => updateField("structure", event.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </InfoCard>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard
                      title="Категории"
                      description="Source-aware production categories"
                    >
                      {categoryNames.length ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {categoryNames.map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              size="small"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">Категории пока не привязаны.</Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Categories create/edit wiring остается следующим этапом production slice.
                      </Typography>
                    </InfoCard>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel
                value="composition"
                sx={{ p: 0, pt: 2 }}
              >
                <InfoCard
                  title="Состав"
                  description="Read-first shell для будущего composition editor"
                >
                  {form.items.length ? (
                    <Stack spacing={1.5}>
                      {form.items.map((item, index) => (
                        <Paper
                          key={`${item?.id || item?.item_id || index}`}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 2 }}
                        >
                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography sx={{ fontWeight: 600 }}>
                                {item?.name || item?.item_name || item?.item?.name || "-"}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 4, md: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Брутто
                              </Typography>
                              <Typography>{item?.brutto ?? "-"}</Typography>
                            </Grid>
                            <Grid size={{ xs: 4, md: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Нетто
                              </Typography>
                              <Typography>{item?.netto ?? "-"}</Typography>
                            </Grid>
                            <Grid size={{ xs: 4, md: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Выход
                              </Typography>
                              <Typography>{item?.res ?? item?.output ?? "-"}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Состав пока не заполнен.</Typography>
                  )}
                </InfoCard>
              </TabPanel>

              <TabPanel
                value="activity"
                sx={{ p: 0, pt: 2 }}
              >
                <InfoCard
                  title="Флаги"
                  description="Подготовка под save_flag/archive wiring"
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
                    />
                    <Chip
                      label={form.show_in_rev ? "В ревизии" : "Без ревизии"}
                      size="small"
                    />
                    <Chip
                      label={form.two_user ? "2 сотрудника" : "1 сотрудник"}
                      size="small"
                    />
                  </Stack>
                </InfoCard>
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
    </Dialog>
  );
}
