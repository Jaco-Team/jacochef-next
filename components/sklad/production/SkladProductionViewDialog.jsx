"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Alert, Box, Chip, DialogContent, Grid, Paper, Stack, Typography } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import MyModal from "@/ui/MyModal";
import { formatDateRangeRU } from "../formatDateRangeRU";

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatDateRangeValue(detail) {
  return formatDateRangeRU(detail?.date_start, detail?.date_end);
}

function formatTags(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item) => item?.name || item?.title || item?.label || "").filter(Boolean);
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return null;
}

function getCompositionLoss(item) {
  return pickFirstDefined(item?.loss, item?.waste, item?.proc_loss, item?.loss_percent);
}

function getCompositionOutput(item) {
  return pickFirstDefined(item?.res, item?.output, item?.all_w, item?.weight_out);
}

function InfoCard({ title, subtitle, children }) {
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
          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

function InfoField({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}

const TABS = [
  { value: "main", label: "Основные", icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: "composition", label: "Состав", icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { value: "activity", label: "Статус", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export default function SkladProductionViewDialog({
  open,
  loading = false,
  tab = "main",
  onTabChange,
  detail,
  entityLabel,
  onClose,
}) {
  const categoryNames = formatTags(detail?.categories);
  const allergenNames = formatTags(detail?.allergens);
  const possibleAllergenNames = formatTags(detail?.allergens_possible);
  const derivedAllergenNames = formatTags(detail?.allergens_derived);
  const derivedPossibleAllergenNames = formatTags(detail?.allergens_possible_derived);
  const items = Array.isArray(detail?.items) ? detail.items : [];

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={
        loading
          ? `Загрузка ${entityLabel.toLowerCase()}...`
          : `${entityLabel}: ${detail?.name || "-"}`
      }
    >
      <DialogContent dividers>
        {loading ? (
          <Alert
            severity="info"
            sx={{ borderRadius: 2 }}
          >
            Загружаем детальную карточку.
          </Alert>
        ) : (
          <TabContext value={tab}>
            <TabList
              onChange={(_, nextValue) => onTabChange?.(nextValue)}
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
              {TABS.map((item) => (
                <Tab
                  key={item.value}
                  value={item.value}
                  icon={item.icon}
                  iconPosition="start"
                  label={item.label}
                />
              ))}
            </TabList>

            <TabPanel
              value="main"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <InfoCard
                  title="Основная карточка"
                  subtitle="Основные поля и срок действия текущей карточки"
                >
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Название"
                        value={formatValue(detail?.name)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <InfoField
                        label="Тип"
                        value={entityLabel}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <InfoField
                        label="Срок годности"
                        value={formatValue(detail?.shelf_life)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Действует"
                        value={formatDateRangeValue(detail)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <InfoField
                        label="Время приготовления"
                        value={formatMetricValue(detail?.time_min)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <InfoField
                        label="Доп. время"
                        value={formatMetricValue(detail?.time_min_dop)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Единица"
                        value={formatValue(detail?.unit_name || detail?.ed_izmer_id)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <InfoField
                        label="Выход"
                        value={formatMetricValue(detail?.all_w)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <InfoField
                        label="Брутто"
                        value={formatMetricValue(detail?.all_w_brutto)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <InfoField
                        label="Нетто"
                        value={formatMetricValue(detail?.all_w_netto)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Категории"
                        value={categoryNames.length ? categoryNames.join(", ") : "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Места хранения"
                        value={formatTags(detail?.storages).join(", ") || "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Позиции кафе"
                        value={formatTags(detail?.apps).join(", ") || "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <InfoField
                        label="Структура"
                        value={formatValue(detail?.structure)}
                      />
                    </Grid>
                  </Grid>
                </InfoCard>

                <InfoCard
                  title="Аллергены"
                  subtitle="Исходные и производные аллергены карточки"
                >
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Исходные аллергены"
                        value={allergenNames.length ? allergenNames.join(", ") : "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Возможные исходные аллергены"
                        value={
                          possibleAllergenNames.length ? possibleAllergenNames.join(", ") : "-"
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Итоговые аллергены"
                        value={derivedAllergenNames.length ? derivedAllergenNames.join(", ") : "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField
                        label="Возможные итоговые аллергены"
                        value={
                          derivedPossibleAllergenNames.length
                            ? derivedPossibleAllergenNames.join(", ")
                            : "-"
                        }
                      />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Stack>
            </TabPanel>

            <TabPanel
              value="composition"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <InfoCard
                  title="Состав"
                  subtitle="Связанные позиции текущей карточки"
                >
                  {items.length ? (
                    <Stack spacing={1.5}>
                      {items.map((item, index) => (
                        <Paper
                          key={`${item?.id || item?.item_id || index}`}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 2 }}
                        >
                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid size={{ xs: 12, md: 5 }}>
                              <InfoField
                                label="Позиция"
                                value={formatValue(
                                  item?.name || item?.item_name || item?.item?.name,
                                )}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, md: 1.5 }}>
                              <InfoField
                                label="Ед."
                                value={formatValue(
                                  item?.unit_name || item?.ed_izmer_name || item?.unit?.name,
                                )}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, md: 2 }}>
                              <InfoField
                                label="Брутто"
                                value={formatValue(item?.brutto)}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, md: 1.5 }}>
                              <InfoField
                                label="Потери"
                                value={formatValue(getCompositionLoss(item))}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, md: 2 }}>
                              <InfoField
                                label="Нетто"
                                value={formatValue(item?.netto)}
                              />
                            </Grid>
                            <Grid size={{ xs: 6, md: 1.5 }}>
                              <InfoField
                                label="Выход"
                                value={formatValue(getCompositionOutput(item))}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Состав пока не заполнен.</Typography>
                  )}
                </InfoCard>
              </Stack>
            </TabPanel>

            <TabPanel
              value="activity"
              sx={{ p: 0, pt: 2 }}
            >
              <Stack spacing={2}>
                <InfoCard
                  title="Статусы и операции"
                  subtitle="Текущее состояние карточки"
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip
                      label={Number(detail?.is_active) === 1 ? "Активен" : "Скрыт"}
                      color={Number(detail?.is_active) === 1 ? "success" : "default"}
                      size="small"
                    />
                    <Chip
                      label={Number(detail?.is_archived) === 1 ? "Архив" : "Не архив"}
                      color={Number(detail?.is_archived) === 1 ? "default" : "primary"}
                      size="small"
                      variant={Number(detail?.is_archived) === 1 ? "filled" : "outlined"}
                    />
                    <Chip
                      label={Number(detail?.show_in_rev) === 1 ? "В ревизии" : "Без ревизии"}
                      size="small"
                    />
                    <Chip
                      label={Number(detail?.two_user) === 1 ? "2 сотрудника" : "1 сотрудник"}
                      size="small"
                    />
                  </Stack>
                </InfoCard>
              </Stack>
            </TabPanel>
          </TabContext>
        )}
      </DialogContent>
    </MyModal>
  );
}
