"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
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
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import {
  SkladEmbeddedHistoryTable,
  SkladEmbeddedImageHistoryTable,
} from "../history/SkladEmbeddedHistoryTable";
import SkladSectionCard from "../ui/SkladSectionCard";
import { resolveSiteItemImageUrl } from "./siteItemImage";
import {
  buildInitialDraft,
  createEmptySiteItemRelations,
  dedupeSelectOptions,
  getLiveKkalPreview,
  normalizeTagList,
  recalculateCompositionRow,
} from "./siteItemEditor.helpers";

const EDITOR_SECTIONS = [
  { value: "main", label: "Основные", icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: "history", label: "История", icon: <HistoryOutlinedIcon fontSize="small" /> },
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

const STAGE_OPTIONS = [
  { id: "stage_1", name: "1 этап" },
  { id: "stage_2", name: "2 этап" },
  { id: "stage_3", name: "3 этап" },
];

export default function SkladSiteItemEditorDialog({
  open,
  mode = "edit",
  loading = false,
  draft,
  categories = [],
  tags = [],
  isEditable = false,
  onUploadImage,
  onRestoreImage,
  initialTab = "main",
  onSubmit,
  onCreateTag,
  onRenameTag,
  showAlert,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState(() => buildInitialDraft(draft));
  const [expandedField, setExpandedField] = useState("");
  const [tagModal, setTagModal] = useState({
    open: false,
    mode: "create",
    loading: false,
    tagId: "",
    name: "",
  });
  const fileInputRef = useRef(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialDraft(draft));
    setActiveTab(initialTab);
    setExpandedField("");
    setTagModal({
      open: false,
      mode: "create",
      loading: false,
      tagId: "",
      name: "",
    });
    setImagePreviewOpen(false);
  }, [draft, initialTab, open]);

  const categoryOptions = useMemo(() => {
    const options = [{ id: "", name: "Выберите категорию" }].concat(
      (categories || []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name ?? String(item?.id ?? ""),
      })),
    );

    if (
      form.category_id &&
      !options.some((item) => String(item.id) === String(form.category_id)) &&
      draft?.category_name
    ) {
      options.push({
        id: String(form.category_id),
        name: draft.category_name,
      });
    }

    return dedupeSelectOptions(options);
  }, [categories, draft?.category_name, form.category_id]);

  const safeCategoryValue = useMemo(() => {
    return categoryOptions.some((item) => String(item.id) === String(form.category_id))
      ? form.category_id
      : "";
  }, [categoryOptions, form.category_id]);

  const tagNames = useMemo(() => {
    return Array.isArray(form.tags) ? form.tags.map((tag) => tag?.name).filter(Boolean) : [];
  }, [form.tags]);

  const availableTags = useMemo(() => normalizeTagList(tags), [tags]);

  const assignedTagIds = useMemo(() => {
    return new Set(
      Array.isArray(form.tags) ? form.tags.map((tag) => String(tag?.id ?? "")).filter(Boolean) : [],
    );
  }, [form.tags]);

  const liveKkalPreview = useMemo(() => getLiveKkalPreview(form), [form]);
  const imageUrl = useMemo(
    () =>
      resolveSiteItemImageUrl(form?.image, draft?.img_app || form?.image?.current_fields?.img_app),
    [draft?.img_app, form?.image],
  );

  const renameTagOptions = useMemo(() => {
    return [{ id: "", name: "Выберите тег" }].concat(
      availableTags.map((tag) => ({
        id: String(tag?.id ?? ""),
        name: tag?.name ?? String(tag?.id ?? ""),
      })),
    );
  }, [availableTags]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openImagePicker = () => {
    if (!isEditable) {
      return;
    }

    fileInputRef.current?.click();
  };

  const isSupportedImageFile = (file) => {
    if (!file) {
      return false;
    }

    const mimeType = String(file.type || "").toLowerCase();
    const fileName = String(file.name || "").toLowerCase();

    return (
      mimeType === "image/jpeg" ||
      mimeType === "image/png" ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    );
  };

  const submitImageFile = async (file) => {
    if (!file || !draft?.id || !onUploadImage) {
      return;
    }

    if (!isSupportedImageFile(file)) {
      showAlert?.("Допустимы только JPG и PNG", false);
      return;
    }

    await onUploadImage(file);
  };

  const handleImageInputChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await submitImageFile(file);
    event.target.value = "";
  };

  const handleImageDrop = async (event) => {
    event.preventDefault();

    if (!isEditable) {
      return;
    }

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    await submitImageFile(file);
  };

  const stagePreparationOptions = useMemo(() => {
    return dedupeSelectOptions(
      (Array.isArray(form?.items_stage?.all) ? form.items_stage.all : []).map((item) => ({
        id: String(item?.un_id ?? ""),
        name: item?.name ?? String(item?.un_id ?? ""),
      })),
    );
  }, [form?.items_stage?.all]);

  const stagePreparationLookup = useMemo(() => {
    const lookup = new Map();

    (Array.isArray(form?.items_stage?.all) ? form.items_stage.all : []).forEach((item) => {
      const key = String(item?.un_id ?? "");

      if (key) {
        lookup.set(key, item);
      }
    });

    return lookup;
  }, [form?.items_stage?.all]);

  const linkedItemOptions = useMemo(() => {
    return dedupeSelectOptions(
      (Array.isArray(form?.item_items?.all_items) ? form.item_items.all_items : []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name ?? String(item?.id ?? ""),
      })),
    );
  }, [form?.item_items?.all_items]);

  const linkedItemLookup = useMemo(() => {
    const lookup = new Map();

    (Array.isArray(form?.item_items?.all_items) ? form.item_items.all_items : []).forEach(
      (item) => {
        const key = String(item?.id ?? "");

        if (key) {
          lookup.set(key, item);
        }
      },
    );

    return lookup;
  }, [form?.item_items?.all_items]);

  const updateStageRowField = (stageKey, index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items_stage: {
        ...(prev?.items_stage || createEmptySiteItemRelations().items_stage),
        [stageKey]: (Array.isArray(prev?.items_stage?.[stageKey])
          ? prev.items_stage[stageKey]
          : []
        ).map((item, itemIndex) =>
          itemIndex === index ? recalculateCompositionRow({ ...item, [field]: value }) : item,
        ),
      },
    }));
  };

  const updateStageRowSelection = (stageKey, index, selectedId) => {
    const matched = stagePreparationLookup.get(String(selectedId));

    setForm((prev) => ({
      ...prev,
      items_stage: {
        ...(prev?.items_stage || createEmptySiteItemRelations().items_stage),
        [stageKey]: (Array.isArray(prev?.items_stage?.[stageKey])
          ? prev.items_stage[stageKey]
          : []
        ).map((item, itemIndex) =>
          itemIndex === index
            ? recalculateCompositionRow({
                ...item,
                selected_id: String(selectedId),
                type: matched?.type ?? item?.type ?? "pf",
                rec_id: matched?.type === "rec" ? String(matched?.id ?? "") : "",
                pf_id: matched?.type === "pf" ? String(matched?.id ?? "") : "",
                name: matched?.name ?? item?.name ?? "-",
                ei_name: matched?.ei_name ?? item?.ei_name ?? "-",
              })
            : item,
        ),
      },
    }));
  };

  const moveStageRow = (fromStageKey, index, toStageKey) => {
    if (fromStageKey === toStageKey) {
      updateStageRowField(fromStageKey, index, "stage", toStageKey);
      return;
    }

    setForm((prev) => {
      const sourceRows = Array.isArray(prev?.items_stage?.[fromStageKey])
        ? prev.items_stage[fromStageKey]
        : [];
      const targetRows = Array.isArray(prev?.items_stage?.[toStageKey])
        ? prev.items_stage[toStageKey]
        : [];
      const row = sourceRows[index];

      if (!row) {
        return prev;
      }

      return {
        ...prev,
        items_stage: {
          ...(prev?.items_stage || createEmptySiteItemRelations().items_stage),
          [fromStageKey]: sourceRows.filter((_, itemIndex) => itemIndex !== index),
          [toStageKey]: targetRows.concat({
            ...row,
            stage: toStageKey,
          }),
        },
      };
    });
  };

  const addStageRow = () => {
    setForm((prev) => ({
      ...prev,
      items_stage: {
        ...(prev?.items_stage || createEmptySiteItemRelations().items_stage),
        stage_1: (Array.isArray(prev?.items_stage?.stage_1) ? prev.items_stage.stage_1 : [])
          .concat({
            selected_id: "",
            type: "pf",
            rec_id: "",
            pf_id: "",
            name: "",
            ei_name: "",
            brutto: "0,000",
            pr_1: "0",
            netto: "0,000",
            pr_2: "0",
            res: "0,000",
            stage: "stage_1",
          })
          .map(recalculateCompositionRow),
      },
    }));
  };

  const removeStageRow = (stageKey, index) => {
    setForm((prev) => ({
      ...prev,
      items_stage: {
        ...(prev?.items_stage || createEmptySiteItemRelations().items_stage),
        [stageKey]: (Array.isArray(prev?.items_stage?.[stageKey])
          ? prev.items_stage[stageKey]
          : []
        ).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const updateLinkedItemField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      item_items: {
        ...(prev?.item_items || createEmptySiteItemRelations().item_items),
        this_items: (Array.isArray(prev?.item_items?.this_items)
          ? prev.item_items.this_items
          : []
        ).map((item, itemIndex) =>
          itemIndex === index ? recalculateCompositionRow({ ...item, [field]: value }) : item,
        ),
      },
    }));
  };

  const updateLinkedItemSelection = (index, selectedId) => {
    const matched = linkedItemLookup.get(String(selectedId));

    setForm((prev) => ({
      ...prev,
      item_items: {
        ...(prev?.item_items || createEmptySiteItemRelations().item_items),
        this_items: (Array.isArray(prev?.item_items?.this_items)
          ? prev.item_items.this_items
          : []
        ).map((item, itemIndex) =>
          itemIndex === index
            ? recalculateCompositionRow({
                ...item,
                item_id: String(selectedId),
                name: matched?.name ?? item?.name ?? "-",
              })
            : item,
        ),
      },
    }));
  };

  const addLinkedItemRow = () => {
    setForm((prev) => ({
      ...prev,
      item_items: {
        ...(prev?.item_items || createEmptySiteItemRelations().item_items),
        this_items: (Array.isArray(prev?.item_items?.this_items) ? prev.item_items.this_items : [])
          .concat({
            item_id: "",
            name: "",
            brutto: "0,000",
            pr_1: "0",
            netto: "0,000",
            pr_2: "0",
            res: "0,000",
          })
          .map(recalculateCompositionRow),
      },
    }));
  };

  const removeLinkedItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      item_items: {
        ...(prev?.item_items || createEmptySiteItemRelations().item_items),
        this_items: (Array.isArray(prev?.item_items?.this_items)
          ? prev.item_items.this_items
          : []
        ).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const compositionDerivedCount = Array.isArray(form?.composition_derived?.pf_total)
    ? form.composition_derived.pf_total.length
    : 0;

  const linkedItemsCount = Array.isArray(form?.item_items?.this_items)
    ? form.item_items.this_items.length
    : 0;

  const toggleTag = (tag) => {
    const tagId = String(tag?.id ?? "");

    if (!tagId) {
      return;
    }

    setForm((prev) => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];
      const exists = current.some((item) => String(item?.id ?? "") === tagId);

      return {
        ...prev,
        tags: exists
          ? current.filter((item) => String(item?.id ?? "") !== tagId)
          : current.concat({
              id: tag.id,
              name: tag.name,
            }),
      };
    });
  };

  const openCreateTagModal = () => {
    setTagModal({
      open: true,
      mode: "create",
      loading: false,
      tagId: "",
      name: "",
    });
  };

  const openRenameTagModal = () => {
    setTagModal({
      open: true,
      mode: "rename",
      loading: false,
      tagId: "",
      name: "",
    });
  };

  const closeTagModal = () => {
    setTagModal((prev) => ({
      ...prev,
      open: false,
      loading: false,
    }));
  };

  const submitTagModal = async () => {
    try {
      setTagModal((prev) => ({
        ...prev,
        loading: true,
      }));

      if (tagModal.mode === "create") {
        const result = await onCreateTag?.(tagModal.name);
        const createdTag = result?.createdTag;

        if (createdTag) {
          setForm((prev) => ({
            ...prev,
            tags: normalizeTagList([...(prev.tags || []), createdTag]),
          }));
        }

        showAlert?.(result?.text || "Тег создан", true);
      } else {
        const result = await onRenameTag?.(tagModal.tagId, tagModal.name);

        setForm((prev) => ({
          ...prev,
          tags: Array.isArray(prev.tags)
            ? prev.tags.map((tag) =>
                String(tag?.id ?? "") === String(tagModal.tagId)
                  ? {
                      ...tag,
                      name: tagModal.name,
                    }
                  : tag,
              )
            : [],
        }));

        showAlert?.(result?.text || "Тег обновлен", true);
      }

      closeTagModal();
    } catch (error) {
      setTagModal((prev) => ({
        ...prev,
        loading: false,
      }));
      showAlert?.(error?.message || "Ошибка сохранения тега", false);
    }
  };

  return (
    <>
      <MyModal
        open={open}
        onClose={onClose}
        maxWidth="lg"
        containedDesktopScroll
        title={
          mode === "create"
            ? "Новый товар сайта"
            : `Редактирование: ${draft?.name || "Товар сайта"}`
        }
      >
        <DialogContent dividers>
          <Stack spacing={2.5}>
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
                <Stack spacing={2}>
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 8 }}>
                      <SkladSectionCard
                        title="Основные данные"
                        description="Базовые поля карточки товара."
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
                              value={safeCategoryValue}
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
                      </SkladSectionCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Stack spacing={2}>
                        <SkladSectionCard
                          title="Маркировка"
                          description="Поля маркировки текущей версии."
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
                        </SkladSectionCard>

                        <SkladSectionCard title="Текущее состояние">
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
                        </SkladSectionCard>
                      </Stack>
                    </Grid>
                  </Grid>

                  <SkladSectionCard
                    title="Изображение"
                    description="Квадратный исходник 1:1. Загрузка JPG или PNG."
                  >
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                    >
                      {imageUrl ? (
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box
                            role="button"
                            tabIndex={0}
                            onClick={() => setImagePreviewOpen(true)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setImagePreviewOpen(true);
                              }
                            }}
                            sx={{ cursor: "pointer" }}
                          >
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={form.name || "Изображение товара"}
                              sx={{
                                width: "100%",
                                maxWidth: 220,
                                display: "block",
                                marginInline: "auto",
                              }}
                            />
                          </Box>
                        </Grid>
                      ) : null}

                      <Grid size={{ xs: 12, md: imageUrl ? 8 : 12 }}>
                        <Box
                          role="button"
                          tabIndex={isEditable ? 0 : -1}
                          onClick={openImagePicker}
                          onKeyDown={(event) => {
                            if ((event.key === "Enter" || event.key === " ") && isEditable) {
                              event.preventDefault();
                              openImagePicker();
                            }
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={handleImageDrop}
                          sx={{
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                            borderRadius: 1,
                            minHeight: 180,
                            px: 3,
                            py: 4,
                          }}
                        >
                          <Stack
                            spacing={0.75}
                            justifyContent="center"
                            alignItems="center"
                            sx={{ minHeight: "100%" }}
                          >
                            <CloudUploadOutlinedIcon color={isEditable ? "action" : "disabled"} />
                            <Typography sx={{ fontWeight: 700 }}>
                              {imageUrl ? "Заменить изображение" : "Загрузить изображение"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Перетащите файл сюда или нажмите, чтобы выбрать.
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        hidden
                        onChange={handleImageInputChange}
                      />
                    </Grid>
                  </SkladSectionCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="nutrition"
                sx={{ p: 0, pt: 2 }}
              >
                <SkladSectionCard
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
                        label="Ккал"
                        value={form.kkal}
                        disabled={!isEditable}
                        func={(event) => updateField("kkal", event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <MyTextInput
                        label="Ккал расчет"
                        value={liveKkalPreview}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </SkladSectionCard>
              </TabPanel>

              <TabPanel
                value="description"
                sx={{ p: 0, pt: 2 }}
              >
                <SkladSectionCard
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
                        maxRows={expandedField === "tmp_desc" ? 10 : 4}
                        onFocus={() => setExpandedField("tmp_desc")}
                        onBlur={() => setExpandedField((prev) => (prev === "tmp_desc" ? "" : prev))}
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
                        maxRows={expandedField === "marc_desc" ? 8 : 4}
                        onFocus={() => setExpandedField("marc_desc")}
                        onBlur={() =>
                          setExpandedField((prev) => (prev === "marc_desc" ? "" : prev))
                        }
                      />
                    </Grid>
                    <Grid size={12}>
                      <MyTextInput
                        label="Полное описание"
                        value={form.marc_desc_full}
                        disabled={!isEditable}
                        func={(event) => updateField("marc_desc_full", event.target.value)}
                        multiline
                        minRows={4}
                        maxRows={expandedField === "marc_desc_full" ? 12 : 6}
                        onFocus={() => setExpandedField("marc_desc_full")}
                        onBlur={() =>
                          setExpandedField((prev) => (prev === "marc_desc_full" ? "" : prev))
                        }
                      />
                    </Grid>
                  </Grid>
                </SkladSectionCard>
              </TabPanel>

              <TabPanel
                value="tags"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <SkladSectionCard
                    title="Теги"
                    description="Текущие привязанные теги"
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Назначенные теги
                        </Typography>
                        {tagNames.length ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                            sx={{ mt: 1 }}
                          >
                            {form.tags.map((tag) => (
                              <Chip
                                key={`assigned-${tag?.id}`}
                                label={tag?.name ?? String(tag?.id ?? "")}
                                color="primary"
                                variant="filled"
                                clickable={isEditable}
                                onClick={() => (isEditable ? toggleTag(tag) : null)}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Теги пока не назначены.
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Доступные теги
                        </Typography>
                        {availableTags.length ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                            sx={{ mt: 1 }}
                          >
                            {availableTags.map((tag) => {
                              const isAssigned = assignedTagIds.has(String(tag?.id ?? ""));

                              return (
                                <Chip
                                  key={`available-${tag?.id}`}
                                  label={tag?.name ?? String(tag?.id ?? "")}
                                  color={isAssigned ? "primary" : "default"}
                                  variant={isAssigned ? "filled" : "outlined"}
                                  clickable={isEditable}
                                  onClick={() => (isEditable ? toggleTag(tag) : null)}
                                />
                              );
                            })}
                          </Stack>
                        ) : (
                          <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Справочник тегов пуст.
                          </Typography>
                        )}
                      </Box>

                      {isEditable ? (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                        >
                          <Button
                            variant="outlined"
                            startIcon={<AddOutlinedIcon />}
                            onClick={openCreateTagModal}
                          >
                            Новый тег
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            disabled={!availableTags.length}
                            onClick={openRenameTagModal}
                          >
                            Переименовать тег
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </SkladSectionCard>
                </Stack>
              </TabPanel>

              <TabPanel
                value="activity"
                sx={{ p: 0, pt: 2 }}
              >
                <SkladSectionCard
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
                </SkladSectionCard>
              </TabPanel>

              <TabPanel
                value="composition"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <SkladSectionCard
                    title="Тайминги"
                    description="Время по этапам в формате MM:SS"
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
                  </SkladSectionCard>

                  <SkladSectionCard
                    title="Заготовки"
                    description="Состав технологической карты"
                  >
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Номенклатура</TableCell>
                            <TableCell>Ед. изм.</TableCell>
                            <TableCell>Брутто</TableCell>
                            <TableCell>% потери при ХО</TableCell>
                            <TableCell>Нетто</TableCell>
                            <TableCell>% потери при ГО</TableCell>
                            <TableCell>Выход</TableCell>
                            <TableCell>Этап</TableCell>
                            {isEditable ? <TableCell /> : null}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {STAGE_OPTIONS.map((stageOption) => {
                            const rows = Array.isArray(form?.items_stage?.[stageOption.id])
                              ? form.items_stage[stageOption.id]
                              : [];

                            if (!rows.length) {
                              return null;
                            }

                            return rows.map((item, index) => (
                              <TableRow key={`${stageOption.id}-${index}`}>
                                <TableCell sx={{ minWidth: 260 }}>
                                  <MySelect
                                    label=""
                                    data={stagePreparationOptions}
                                    is_none={false}
                                    value={item?.selected_id ?? ""}
                                    disabled={!isEditable}
                                    func={(event) =>
                                      updateStageRowSelection(
                                        stageOption.id,
                                        index,
                                        event.target.value,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell sx={{ minWidth: 80 }}>
                                  <MyTextInput
                                    label=""
                                    value={item?.ei_name ?? ""}
                                    disabled
                                  />
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={item?.brutto ?? ""}
                                    disabled={!isEditable}
                                    isDecimalMask
                                    func={(event) =>
                                      updateStageRowField(
                                        stageOption.id,
                                        index,
                                        "brutto",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={item?.pr_1 ?? ""}
                                    disabled={!isEditable}
                                    func={(event) =>
                                      updateStageRowField(
                                        stageOption.id,
                                        index,
                                        "pr_1",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={item?.netto ?? ""}
                                    disabled
                                  />
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={item?.pr_2 ?? ""}
                                    disabled={!isEditable}
                                    func={(event) =>
                                      updateStageRowField(
                                        stageOption.id,
                                        index,
                                        "pr_2",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={item?.res ?? ""}
                                    disabled
                                  />
                                </TableCell>
                                <TableCell sx={{ minWidth: 120 }}>
                                  <MySelect
                                    label=""
                                    data={STAGE_OPTIONS}
                                    is_none={false}
                                    value={stageOption.id}
                                    disabled={!isEditable}
                                    func={(event) =>
                                      moveStageRow(stageOption.id, index, event.target.value)
                                    }
                                  />
                                </TableCell>
                                {isEditable ? (
                                  <TableCell align="right">
                                    <IconButton
                                      color="error"
                                      onClick={() => removeStageRow(stageOption.id, index)}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            ));
                          })}
                          {isEditable ? (
                            <TableRow>
                              <TableCell colSpan={9}>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddOutlinedIcon />}
                                  onClick={addStageRow}
                                >
                                  Добавить заготовку
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </SkladSectionCard>

                  <SkladSectionCard
                    title="Позиции"
                    description="Связанные позиции карточки"
                  >
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Номенклатура</TableCell>
                            <TableCell>Брутто</TableCell>
                            <TableCell>% потери при ХО</TableCell>
                            <TableCell>Нетто</TableCell>
                            <TableCell>% потери при ГО</TableCell>
                            <TableCell>Выход</TableCell>
                            {isEditable ? <TableCell /> : null}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(Array.isArray(form?.item_items?.this_items)
                            ? form.item_items.this_items
                            : []
                          ).map((item, index) => (
                            <TableRow key={`linked-item-${index}`}>
                              <TableCell sx={{ minWidth: 320 }}>
                                <MySelect
                                  label=""
                                  data={linkedItemOptions}
                                  is_none={false}
                                  value={item?.item_id ?? ""}
                                  disabled={!isEditable}
                                  func={(event) =>
                                    updateLinkedItemSelection(index, event.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={item?.brutto ?? ""}
                                  disabled={!isEditable}
                                  isDecimalMask
                                  func={(event) =>
                                    updateLinkedItemField(index, "brutto", event.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={item?.pr_1 ?? ""}
                                  disabled={!isEditable}
                                  func={(event) =>
                                    updateLinkedItemField(index, "pr_1", event.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={item?.netto ?? ""}
                                  disabled
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={item?.pr_2 ?? ""}
                                  disabled={!isEditable}
                                  func={(event) =>
                                    updateLinkedItemField(index, "pr_2", event.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={item?.res ?? ""}
                                  disabled
                                />
                              </TableCell>
                              {isEditable ? (
                                <TableCell align="right">
                                  <IconButton
                                    color="error"
                                    onClick={() => removeLinkedItemRow(index)}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          ))}
                          {isEditable ? (
                            <TableRow>
                              <TableCell colSpan={7}>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddOutlinedIcon />}
                                  onClick={addLinkedItemRow}
                                >
                                  Добавить позицию
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </SkladSectionCard>

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SkladSectionCard title="Итоговый состав">
                        <Typography sx={{ fontWeight: 700 }}>{compositionDerivedCount}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Расчетные строки итогового состава
                        </Typography>
                      </SkladSectionCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <SkladSectionCard title="Связанные позиции">
                        <Typography sx={{ fontWeight: 700 }}>{linkedItemsCount}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Позиции, связанные с карточкой
                        </Typography>
                      </SkladSectionCard>
                    </Grid>
                  </Grid>
                </Stack>
              </TabPanel>

              <TabPanel
                value="history"
                sx={{ p: 0, pt: 2 }}
              >
                <Stack spacing={2}>
                  <SkladSectionCard
                    title="История карточки"
                    description="Последние ревизии текущей версии."
                  >
                    <SkladEmbeddedHistoryTable history={draft?.history} />
                  </SkladSectionCard>

                  <SkladSectionCard
                    title="История изображения"
                    description="Последние изменения изображения с возможностью восстановления."
                  >
                    <SkladEmbeddedImageHistoryTable
                      imageHistory={draft?.image_history}
                      imageAssetKey={draft?.img_app}
                      onRestoreImage={onRestoreImage}
                    />
                  </SkladSectionCard>
                </Stack>
              </TabPanel>
            </TabContext>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Закрыть</Button>
          <Button
            variant="contained"
            disabled={!isEditable || loading}
            onClick={() => onSubmit?.(form)}
          >
            {loading ? "Сохраняем..." : mode === "create" ? "Создать товар" : "Сохранить изменения"}
          </Button>
        </DialogActions>
      </MyModal>
      <MyModal
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="md"
        title={form.name || "Изображение"}
      >
        <DialogContent dividers>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={form.name || "Изображение товара"}
              sx={{
                width: "100%",
                display: "block",
              }}
            />
          ) : null}
        </DialogContent>
      </MyModal>
      <MyModal
        open={tagModal.open}
        onClose={closeTagModal}
        maxWidth="sm"
        title={tagModal.mode === "create" ? "Новый тег" : "Переименовать тег"}
      >
        <DialogContent>
          <Stack
            spacing={2}
            sx={{ pt: 1 }}
          >
            {tagModal.mode === "rename" ? (
              <MySelect
                label="Тег"
                data={renameTagOptions}
                is_none={false}
                value={tagModal.tagId}
                func={(event) => {
                  const nextTagId = event.target.value;
                  const selectedTag = availableTags.find(
                    (tag) => String(tag?.id ?? "") === String(nextTagId),
                  );

                  setTagModal((prev) => ({
                    ...prev,
                    tagId: nextTagId,
                    name: selectedTag?.name ?? prev.name,
                  }));
                }}
              />
            ) : null}
            <MyTextInput
              label="Название"
              value={tagModal.name}
              func={(event) =>
                setTagModal((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeTagModal}>Закрыть</Button>
          <Button
            variant="contained"
            disabled={tagModal.loading}
            onClick={submitTagModal}
          >
            {tagModal.loading ? "Сохраняем..." : "Сохранить"}
          </Button>
        </DialogActions>
      </MyModal>
    </>
  );
}
