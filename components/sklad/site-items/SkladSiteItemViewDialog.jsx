"use client";

import { useRef } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import MyModal from "@/ui/MyModal";

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatBoolean(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return Number(value) === 1 ? "Да" : "Нет";
}

function formatMarkingType(value) {
  switch (Number(value)) {
    case 0:
      return "Обычный товар";
    case 1:
      return "Вода";
    case 2:
      return "Сладкий напиток";
    default:
      return formatValue(value);
  }
}

function formatDateRange(detail) {
  if (!detail?.date_start && !detail?.date_end) {
    return "-";
  }

  return `${detail?.date_start || "..."} - ${detail?.date_end || "..."}`;
}

function formatTagNames(tags) {
  if (!Array.isArray(tags) || !tags.length) {
    return "-";
  }

  const names = tags.map((item) => item?.name).filter(Boolean);
  return names.length ? names.join(", ") : "-";
}

function formatAllergenNames(items) {
  if (!Array.isArray(items) || !items.length) {
    return "-";
  }

  const names = items.map((item) => item?.name ?? "").filter(Boolean);

  return names.length ? names.join(", ") : "-";
}

function formatCompositionRows(items, typeLabel) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item, index) => ({
    key: `${typeLabel}-${item?.id ?? index}`,
    typeLabel,
    name: item?.name ?? "-",
    brutto: item?.brutto ?? "-",
    netto: item?.netto ?? "-",
    output: item?.res ?? "-",
    stage: item?.stage ?? "-",
  }));
}

function formatStageRows(itemsStage) {
  if (!itemsStage) {
    return [];
  }

  const stages = [
    { key: "stage_1", label: "1 этап" },
    { key: "stage_2", label: "2 этап" },
    { key: "stage_3", label: "3 этап" },
  ];

  return stages.flatMap((stage) => {
    const stageItems = Array.isArray(itemsStage?.[stage.key]) ? itemsStage[stage.key] : [];

    return stageItems.map((item, index) => ({
      key: `${stage.key}-${item?.id ?? index}`,
      stage: stage.label,
      entityType: item?.type === "rec" ? "Рецепт" : "Заготовка",
      name: item?.name ?? "-",
      brutto: item?.brutto ?? "-",
      netto: item?.netto ?? "-",
      output: item?.res ?? "-",
    }));
  });
}

function formatLinkedItemRows(itemItems) {
  const items = Array.isArray(itemItems?.this_items) ? itemItems.this_items : [];

  return items.map((item, index) => ({
    key: `linked-item-${item?.id ?? index}`,
    name: item?.name ?? "-",
    maxCount: item?.max_count ?? "-",
    isAdd: Number(item?.is_add) === 1 ? "Да" : "Нет",
  }));
}

function getStageTimingRows(detail) {
  const stages = [
    { key: "time_stage_1", label: "1 этап" },
    { key: "time_stage_2", label: "2 этап" },
    { key: "time_stage_3", label: "3 этап" },
  ];

  return stages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    value: detail?.[stage.key] ?? "",
  }));
}

function getDeletePreviewMeta(detail) {
  const status = detail?.delete_usage?.status || "";
  const isAvailable = detail?.delete_usage?.is_available;
  const usageCanDelete = detail?.delete_usage?.can_delete;
  const previewError = detail?.delete_usage?.preview_error || "";

  if (typeof detail?.can_delete === "boolean") {
    return {
      label: detail.can_delete ? "Можно удалить" : "Удаление ограничено",
      color: detail.can_delete ? "success" : "warning",
      variant: detail.can_delete ? "filled" : "outlined",
      helper: previewError,
    };
  }

  if (typeof usageCanDelete === "boolean") {
    return {
      label: usageCanDelete ? "Можно удалить" : "Удаление ограничено",
      color: usageCanDelete ? "success" : "warning",
      variant: usageCanDelete ? "filled" : "outlined",
      helper: previewError,
    };
  }

  if (isAvailable === false || status === "unavailable") {
    return {
      label: "Проверка недоступна",
      color: "default",
      variant: "outlined",
      helper: previewError || "Проверка удаления временно недоступна.",
    };
  }

  return {
    label: "Статус не получен",
    color: "default",
    variant: "outlined",
    helper: previewError,
  };
}

function getImageCurrentFieldRows(image) {
  if (!image?.current_fields || typeof image.current_fields !== "object") {
    return [];
  }

  return [
    { key: "img_new", label: "img_new", value: image.current_fields.img_new },
    { key: "img_new_update", label: "img_new_update", value: image.current_fields.img_new_update },
    { key: "img_app", label: "img_app", value: image.current_fields.img_app },
  ];
}

function SectionCard({ title, subtitle, children }) {
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

const DETAIL_SECTIONS = [
  { value: "tech", label: "Техкарта", icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: "marking", label: "Маркировка", icon: <LocalOfferOutlinedIcon fontSize="small" /> },
  { value: "image", label: "Изображение", icon: <ImageOutlinedIcon fontSize="small" /> },
  { value: "history", label: "История", icon: <HistoryOutlinedIcon fontSize="small" /> },
];

export default function SkladSiteItemViewDialog({
  open,
  loading = false,
  section = "tech",
  onSectionChange,
  detail,
  isEditable = false,
  onEdit,
  onOpenHistory,
  onUploadImage,
  onSyncVk,
  onClose,
}) {
  const fileInputRef = useRef(null);
  const imageUrl = detail?.image?.variants?.webp?.url ?? detail?.image?.variants?.jpg?.url ?? null;
  const isVisible = detail?.is_show ?? 0;

  const compositionRows = formatCompositionRows(detail?.composition_source?.pf, "Заготовка").concat(
    formatCompositionRows(detail?.composition_source?.recipes, "Рецепт"),
  );

  const derivedRows = formatCompositionRows(
    detail?.composition_derived?.pf_total,
    "Итоговый состав",
  );
  const stageRows = formatStageRows(detail?.items_stage);
  const linkedItemRows = formatLinkedItemRows(detail?.item_items);
  const stageTimingRows = getStageTimingRows(detail);
  const deletePreviewMeta = getDeletePreviewMeta(detail);
  const imageCurrentFieldRows = getImageCurrentFieldRows(detail?.image);
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onUploadImage?.(file);
    }

    event.target.value = "";
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={loading ? "Загрузка карточки" : detail?.name || "Товар сайта"}
    >
      <DialogContent dividers>
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
        />
        {loading ? (
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 240 }}
          >
            <CircularProgress size={28} />
            <Typography color="text.secondary">Загружаем карточку товара сайта...</Typography>
          </Stack>
        ) : (
          <TabContext value={section}>
            <Stack spacing={2.5}>
              <TabList
                onChange={(_, nextValue) => onSectionChange?.(nextValue)}
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
                {DETAIL_SECTIONS.map((item) => (
                  <Tab
                    key={item.value}
                    icon={item.icon}
                    iconPosition="start"
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </TabList>

              <TabPanel
                value="tech"
                sx={{ p: 0 }}
              >
                <Stack spacing={2.5}>
                  {deletePreviewMeta.helper ? (
                    <Alert
                      severity={
                        detail?.delete_usage?.is_available === false ||
                        detail?.delete_usage?.status === "unavailable"
                          ? "warning"
                          : "info"
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      {deletePreviewMeta.helper}
                    </Alert>
                  ) : null}

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 8 }}>
                      <SectionCard
                        title="Техническая карточка"
                        subtitle="Базовые атрибуты, питание и текстовый контент текущей версии"
                      >
                        <Grid
                          container
                          spacing={2}
                        >
                          <Grid size={{ xs: 12, md: 6 }}>
                            <InfoField
                              label="Короткое название"
                              value={formatValue(detail?.short_name)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <InfoField
                              label="Категория"
                              value={formatValue(detail?.category_name)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <InfoField
                              label="Действует"
                              value={formatDateRange(detail)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <InfoField
                              label="Вес"
                              value={formatValue(detail?.weight)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <InfoField
                              label="Статус удаления"
                              value={deletePreviewMeta.label}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <InfoField
                              label="Белки"
                              value={formatValue(detail?.protein)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <InfoField
                              label="Жиры"
                              value={formatValue(detail?.fat)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <InfoField
                              label="Углеводы"
                              value={formatValue(detail?.carbohydrates)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <InfoField
                              label="Ккал"
                              value={formatValue(detail?.kkal_preview ?? detail?.kkal)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <InfoField
                              label="Теги"
                              value={formatTagNames(detail?.tags)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <InfoField
                              label="Состав"
                              value={formatValue(detail?.tmp_desc)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <InfoField
                              label="Короткое описание"
                              value={formatValue(detail?.marc_desc)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <InfoField
                              label="Полное описание"
                              value={formatValue(detail?.marc_desc_full)}
                            />
                          </Grid>
                        </Grid>
                      </SectionCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Stack spacing={2}>
                        <SectionCard title="Статусы">
                          <Stack spacing={1.5}>
                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Chip
                                label={Number(isVisible) === 1 ? "Активен" : "Скрыт"}
                                color={Number(isVisible) === 1 ? "success" : "default"}
                                size="small"
                              />
                              <Chip
                                label={Number(detail?.show_site) === 1 ? "Сайт" : "Без сайта"}
                                color={Number(detail?.show_site) === 1 ? "primary" : "default"}
                                size="small"
                              />
                              <Chip
                                label={Number(detail?.show_program) === 1 ? "Касса" : "Без кассы"}
                                color={Number(detail?.show_program) === 1 ? "secondary" : "default"}
                                size="small"
                              />
                              <Chip
                                label={Number(detail?.is_new) === 1 ? "Новинка" : "Обычный"}
                                color={Number(detail?.is_new) === 1 ? "info" : "default"}
                                size="small"
                              />
                              <Chip
                                label={deletePreviewMeta.label}
                                color={deletePreviewMeta.color}
                                size="small"
                                variant={deletePreviewMeta.variant}
                              />
                            </Stack>
                          </Stack>
                        </SectionCard>

                        <SectionCard
                          title="Маркировка"
                          subtitle="Текущие данные маркировки"
                        >
                          <Stack spacing={1}>
                            <InfoField
                              label="Тип"
                              value={formatMarkingType(detail?.marking?.is_mark)}
                            />
                            <InfoField
                              label="Код"
                              value={formatValue(detail?.marking?.mark_code)}
                            />
                            <InfoField
                              label="Серия"
                              value={formatValue(detail?.marking?.series)}
                            />
                            <InfoField
                              label="Акциз"
                              value={formatBoolean(detail?.marking?.is_akchis)}
                            />
                          </Stack>
                        </SectionCard>

                        <SectionCard title="Аллергены">
                          <Stack spacing={1}>
                            <InfoField
                              label="Итоговые аллергены"
                              value={formatAllergenNames(detail?.allergens_derived)}
                            />
                            <InfoField
                              label="Возможные аллергены"
                              value={formatAllergenNames(detail?.possible_allergens_derived)}
                            />
                          </Stack>
                        </SectionCard>

                        <SectionCard title="Изображение">
                          <Stack spacing={1}>
                            {imageUrl ? (
                              <Box
                                component="img"
                                src={imageUrl}
                                alt={detail?.name || "Изображение товара"}
                                sx={{
                                  width: "100%",
                                  maxHeight: 220,
                                  objectFit: "contain",
                                  borderRadius: 2,
                                  bgcolor: "grey.100",
                                }}
                              />
                            ) : (
                              <Typography color="text.secondary">
                                Изображение не загружено.
                              </Typography>
                            )}
                          </Stack>
                        </SectionCard>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SectionCard
                        title="Этапы по времени"
                        subtitle="Временные интервалы по этапам"
                      >
                        <Grid
                          container
                          spacing={2}
                        >
                          {stageTimingRows.map((row) => (
                            <Grid
                              key={row.key}
                              size={{ xs: 12, sm: 4 }}
                            >
                              <InfoField
                                label={row.label}
                                value={formatValue(row.value)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </SectionCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <SectionCard
                        title="Сводка связей"
                        subtitle="Краткая сводка по связям текущей карточки"
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          divider={
                            <Divider
                              flexItem
                              orientation="vertical"
                              sx={{ display: { xs: "none", sm: "block" } }}
                            />
                          }
                        >
                          <InfoField
                            label="Исходные связи"
                            value={String(compositionRows.length)}
                          />
                          <InfoField
                            label="Итоговые строки"
                            value={String(derivedRows.length)}
                          />
                          <InfoField
                            label="Связанные позиции"
                            value={String(linkedItemRows.length)}
                          />
                        </Stack>
                      </SectionCard>
                    </Grid>
                  </Grid>

                  <SectionCard
                    title="Исходный состав"
                    subtitle="Прямые связи товара сайта с заготовками и рецептами"
                  >
                    {compositionRows.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Тип</TableCell>
                              <TableCell>Название</TableCell>
                              <TableCell>Этап</TableCell>
                              <TableCell>Брутто</TableCell>
                              <TableCell>Нетто</TableCell>
                              <TableCell>Выход</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {compositionRows.map((row) => (
                              <TableRow key={row.key}>
                                <TableCell>{row.typeLabel}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.stage}</TableCell>
                                <TableCell>{row.brutto}</TableCell>
                                <TableCell>{row.netto}</TableCell>
                                <TableCell>{row.output}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">Связи не заданы.</Typography>
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Итоговый состав"
                    subtitle="Расчетный состав карточки"
                  >
                    {derivedRows.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Название</TableCell>
                              <TableCell>Этап</TableCell>
                              <TableCell>Брутто</TableCell>
                              <TableCell>Нетто</TableCell>
                              <TableCell>Выход</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {derivedRows.map((row) => (
                              <TableRow key={row.key}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.stage}</TableCell>
                                <TableCell>{row.brutto}</TableCell>
                                <TableCell>{row.netto}</TableCell>
                                <TableCell>{row.output}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">Итоговый состав не найден.</Typography>
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Этапы приготовления"
                    subtitle="Разбивка состава по этапам"
                  >
                    {stageRows.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Этап</TableCell>
                              <TableCell>Тип</TableCell>
                              <TableCell>Название</TableCell>
                              <TableCell>Брутто</TableCell>
                              <TableCell>Нетто</TableCell>
                              <TableCell>Выход</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stageRows.map((row) => (
                              <TableRow key={row.key}>
                                <TableCell>{row.stage}</TableCell>
                                <TableCell>{row.entityType}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.brutto}</TableCell>
                                <TableCell>{row.netto}</TableCell>
                                <TableCell>{row.output}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">Этапы не заданы.</Typography>
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Связанные позиции"
                    subtitle="Позиции, которые связаны с этой карточкой"
                  >
                    {linkedItemRows.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Название</TableCell>
                              <TableCell>Макс. количество</TableCell>
                              <TableCell>Доп. позиция</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {linkedItemRows.map((row) => (
                              <TableRow key={row.key}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.maxCount}</TableCell>
                                <TableCell>{row.isAdd}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">Связанные позиции не заданы.</Typography>
                    )}
                  </SectionCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="marking"
                sx={{ p: 0 }}
              >
                <Stack spacing={2.5}>
                  <SectionCard
                    title="Маркировка"
                    subtitle="Отдельный раздел маркировки"
                  >
                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Тип"
                          value={formatMarkingType(detail?.marking?.is_mark)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Код"
                          value={formatValue(detail?.marking?.mark_code)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Серия"
                          value={formatValue(detail?.marking?.series)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Акциз"
                          value={formatBoolean(detail?.marking?.is_akchis)}
                        />
                      </Grid>
                      <Grid size={12}>
                        <InfoField
                          label="Теги"
                          value={formatTagNames(detail?.tags)}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                  <SectionCard
                    title="Действия"
                    subtitle="Быстрые переходы к связанным действиям"
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                    >
                      <Button
                        variant="contained"
                        startIcon={<EditOutlinedIcon />}
                        disabled={!isEditable}
                        onClick={onEdit}
                      >
                        Открыть редактор
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<HistoryOutlinedIcon />}
                        onClick={onOpenHistory}
                      >
                        Открыть историю
                      </Button>
                    </Stack>
                  </SectionCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="image"
                sx={{ p: 0 }}
              >
                <Stack spacing={2.5}>
                  <SectionCard
                    title="Изображение товара"
                    subtitle="Текущее изображение и доступные действия"
                  >
                    <Stack spacing={2}>
                      {imageUrl ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={detail?.name || "Изображение товара"}
                          sx={{
                            width: "100%",
                            maxHeight: 340,
                            objectFit: "contain",
                            borderRadius: 2,
                            bgcolor: "grey.100",
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">Изображение не загружено.</Typography>
                      )}
                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid size={{ xs: 12, md: 6 }}>
                          <InfoField
                            label="WebP"
                            value={formatValue(detail?.image?.variants?.webp?.path)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <InfoField
                            label="JPG"
                            value={formatValue(detail?.image?.variants?.jpg?.path)}
                          />
                        </Grid>
                        {imageCurrentFieldRows.map((row) => (
                          <Grid
                            key={row.key}
                            size={{ xs: 12, md: 4 }}
                          >
                            <InfoField
                              label={row.label}
                              value={formatValue(row.value)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="contained"
                          startIcon={<CloudUploadOutlinedIcon />}
                          disabled={!isEditable}
                          onClick={handlePickImage}
                        >
                          Загрузить изображение
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<HistoryOutlinedIcon />}
                          onClick={onOpenHistory}
                        >
                          Открыть историю
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<SyncAltOutlinedIcon />}
                          disabled={!isEditable}
                          onClick={onSyncVk}
                        >
                          Синхронизировать VK
                        </Button>
                      </Stack>
                    </Stack>
                  </SectionCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="history"
                sx={{ p: 0 }}
              >
                <Stack spacing={2.5}>
                  <SectionCard
                    title="История карточки"
                    subtitle="Сводка текущей версии и переход к журналу изменений"
                  >
                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Текущее название"
                          value={formatValue(detail?.name)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Период действия"
                          value={formatDateRange(detail)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Статус"
                          value={Number(isVisible) === 1 ? "Активен" : "Скрыт"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoField
                          label="Удаление"
                          value={deletePreviewMeta.label}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                  <SectionCard
                    title="Действия истории"
                    subtitle="Открывает общий журнал изменений модуля"
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                    >
                      <Button
                        variant="contained"
                        startIcon={<HistoryOutlinedIcon />}
                        onClick={onOpenHistory}
                      >
                        Открыть журнал изменений
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        disabled={!isEditable}
                        onClick={onEdit}
                      >
                        Открыть редактор
                      </Button>
                    </Stack>
                  </SectionCard>
                </Stack>
              </TabPanel>
            </Stack>
          </TabContext>
        )}
      </DialogContent>
    </MyModal>
  );
}
