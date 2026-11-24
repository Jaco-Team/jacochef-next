import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TextEditor } from "@/ui/Forms";
import HistoryLog from "@/ui/history/HistoryLog";
import {
  JacoAutocomplete,
  JacoButton,
  JacoModal,
  JacoSearchField,
  JacoStatusChip,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { getCategoryName, isSameId } from "./helpers";
import { FormHint, FormLabel } from "./shared";

const titleSx = {
  ...uiTypography.bodyMedium,
  fontWeight: 700,
  color: uiColors.textStrong,
};

const mutedTextSx = {
  ...uiTypography.label,
  color: uiColors.textMuted,
};

function getAppliedToText(count) {
  return count
    ? `Применяется к ${formatPlural(count, ["уборке", "уборкам", "уборкам"])}`
    : "Пока ни к одной уборке не применяется";
}

function getCardTitle(card) {
  return card.name || (card.id == null ? "Новый вид уборки" : "");
}

// TinyMCE emits its re-serialization of a loaded value while unfocused; user edits (typing, toolbar) focus it.
function getInstructionChangeOptions(editor) {
  return { userEdit: typeof editor?.hasFocus === "function" ? editor.hasFocus() : true };
}

function getTemplateOptionLabel(template) {
  const label = template.role ? `${template.name} · ${template.role}` : template.name;

  return template.status === "archive" ? `${label} · архив` : label;
}

function compareTemplateOptions(left, right) {
  if (left.status !== right.status) {
    return left.status === "archive" ? 1 : -1;
  }

  return getTemplateOptionLabel(left).localeCompare(getTemplateOptionLabel(right), "ru");
}

function UnsavedChangesHint({ dirty, sx }) {
  return dirty ? (
    <FormHint
      tone="warning"
      sx={{ mt: 0, ...sx }}
    >
      Есть несохранённые изменения
    </FormHint>
  ) : null;
}

// Every template incl. archived; one moved here leaves its current вид уборки on save.
function CategoryTemplatesAccordion({
  categoryId,
  templates,
  categories,
  templateIds,
  onChange,
  canEdit,
}) {
  const options = useMemo(() => [...templates].sort(compareTemplateOptions), [templates]);
  const selectedTemplates = useMemo(() => {
    const selectedIds = new Set(templateIds.map((templateId) => String(templateId)));
    return options.filter((template) => selectedIds.has(String(template.id)));
  }, [options, templateIds]);

  return (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{
        borderRadius: `${uiRadii.md} !important`,
        borderColor: uiColors.border,
        overflow: "hidden",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={titleSx}>Применяется для</Typography>
          <JacoStatusChip
            label={selectedTemplates.length}
            tone="neutral"
            variant="soft"
            sx={{ minWidth: 28 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <JacoAutocomplete
          multiple
          disableCloseOnSelect
          options={options}
          value={selectedTemplates}
          disabled={!canEdit}
          onChange={(_, value) => onChange(value.map((template) => template.id))}
          getOptionLabel={getTemplateOptionLabel}
          getOptionKey={(template) => String(template.id)}
          isOptionEqualToValue={(option, value) => isSameId(option.id, value.id)}
          placeholder={selectedTemplates.length ? "" : "Объект уборки или должность"}
          noOptionsText="Уборки не найдены"
          renderOption={(props, template) => {
            const { key, ...optionProps } = props;
            const movesFromCategory =
              categoryId == null || !isSameId(template.categoryId, categoryId);

            return (
              <li
                key={key}
                {...optionProps}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...uiTypography.label, color: uiColors.textStrong }}>
                    {getTemplateOptionLabel(template)}
                  </Typography>
                  {movesFromCategory ? (
                    <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textMuted }}>
                      Сейчас: {getCategoryName(categories, template.categoryId)}
                    </Typography>
                  ) : null}
                </Box>
              </li>
            );
          }}
        />
        <FormHint>Уборки, убранные из списка, останутся без вида уборки</FormHint>
      </AccordionDetails>
    </Accordion>
  );
}

export default function CleaningCategoriesView({
  categories,
  templates,
  categoryQuery,
  onCategoryQueryChange,
  onSelectCategory,
  onCreateCategory,
  card,
  dirty = false,
  onCardChange,
  onCloseCard,
  onSaveCategory,
  onDeleteCategory,
  history = [],
  historyLoading = false,
  canEdit,
}) {
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const filteredCategories = categories.filter((category) => {
    const search = categoryQuery.trim().toLowerCase();

    return !search || category.name.toLowerCase().includes(search);
  });
  const isCreating = Boolean(card) && card.id == null;
  const changeCard = (field, value, options) => {
    if (card) {
      onCardChange(field, value, options);
    }
  };

  const selectCategory = async (id) => {
    const selected = await onSelectCategory(id);

    if (selected && isMobile) {
      setMobileEditorOpen(true);
    }
  };

  const closeMobileEditor = async () => {
    if (await onCloseCard()) {
      setMobileEditorOpen(false);
    }
  };

  const saveFromMobileEditor = async () => {
    if (canEdit && (await onSaveCategory())) {
      setMobileEditorOpen(false);
    }
  };

  useEffect(() => {
    if (isMobile && isCreating) {
      setMobileEditorOpen(true);
    }
  }, [isCreating, isMobile]);

  return (
    <Grid
      container
      spacing={2.5}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <JacoSurface sx={{ overflow: "hidden", height: "100%" }}>
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gap: 1.5,
              borderBottom: `1px solid ${uiColors.borderLight}`,
            }}
          >
            <JacoSearchField
              value={categoryQuery}
              onValueChange={onCategoryQueryChange}
              minLength={1}
              debounceMs={150}
              placeholder="Поиск вида уборки"
            />
            {canEdit ? (
              <JacoButton
                compact
                fullWidth
                startIcon={<AddIcon />}
                onClick={onCreateCategory}
              >
                Новый вид уборки
              </JacoButton>
            ) : null}
          </Box>

          <Box>
            {filteredCategories.map((category) => {
              const usedCount = templates.filter(
                (template) => template.categoryId === category.id,
              ).length;
              const selected = category.id === card?.id;

              return (
                <Box
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    cursor: "pointer",
                    bgcolor: selected ? uiColors.surfaceMuted : "transparent",
                    borderBottom: `1px solid ${uiColors.borderLight}`,
                    "&:hover": { bgcolor: selected ? uiColors.surfaceMuted : uiStateColors.hover },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={titleSx}>{category.name}</Typography>
                  </Box>
                  <JacoStatusChip
                    label={usedCount}
                    tone="neutral"
                    variant="soft"
                    sx={{ minWidth: 28 }}
                  />
                </Box>
              );
            })}
            {filteredCategories.length ? null : (
              <Typography sx={{ ...mutedTextSx, px: 1.5, py: 2 }}>
                {categories.length ? "Ничего не найдено" : "Видов уборок пока нет"}
              </Typography>
            )}
          </Box>
        </JacoSurface>
      </Grid>
      {card ? (
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <JacoSurface sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                p: { xs: 0, md: 1.5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderBottom: `1px solid ${uiColors.borderLight}`,
              }}
            >
              <Box>
                <Typography sx={titleSx}>{getCardTitle(card)}</Typography>
                <Typography sx={mutedTextSx}>
                  {getAppliedToText(card.templateIds.length)}
                </Typography>
              </Box>

              <JacoButton
                tone="secondary"
                compact
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDeleteCategory(card.id)}
                disabled={
                  !canEdit || !card.id || categories.length <= 1 || card.deletable === false
                }
              >
                Удалить
              </JacoButton>
            </Box>

            <Box sx={{ px: 2, pt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <JacoButton
                compact
                onClick={onSaveCategory}
                disabled={!canEdit}
              >
                Сохранить
              </JacoButton>
              <UnsavedChangesHint dirty={dirty} />
            </Box>

            <Box sx={{ p: 2, display: "grid", gap: 2 }}>
              <Grid
                container
                spacing={2}
              >
                <Grid size={12}>
                  <FormLabel>Название</FormLabel>
                  <JacoTextInput
                    value={card.name}
                    disabled={!canEdit}
                    onChange={(event) => changeCard("name", event.target.value)}
                  />
                </Grid>
              </Grid>

              <Box>
                <FormLabel>Подробная инструкция</FormLabel>
                <TextEditor
                  value={card.instruction}
                  func={(value, editor) =>
                    changeCard("instruction", value, getInstructionChangeOptions(editor))
                  }
                  disabled={!canEdit}
                  height={300}
                  variant="newsDialog"
                  menubar="file edit view insert format tools table"
                  toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
                />
              </Box>

              <CategoryTemplatesAccordion
                categoryId={card.id}
                templates={templates}
                categories={categories}
                templateIds={card.templateIds}
                onChange={(templateIds) => changeCard("templateIds", templateIds)}
                canEdit={canEdit}
              />

              {historyLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <HistoryLog
                  history={history}
                  defaultExpanded={false}
                />
              )}
            </Box>
          </JacoSurface>
        </Grid>
      ) : null}
      <CategoryMobileEditDialog
        open={mobileEditorOpen}
        card={card}
        dirty={dirty}
        templates={templates}
        categories={categories}
        history={history}
        historyLoading={historyLoading}
        onClose={closeMobileEditor}
        onChange={changeCard}
        onSave={saveFromMobileEditor}
        canEdit={canEdit}
      />
    </Grid>
  );
}

function CategoryMobileEditDialog({
  open,
  card,
  dirty,
  templates,
  categories,
  history,
  historyLoading,
  onClose,
  onChange,
  onSave,
  canEdit,
}) {
  if (!card) {
    return null;
  }

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={getCardTitle(card)}
      maxWidth="sm"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
          >
            Закрыть
          </JacoButton>
          <JacoButton
            compact
            onClick={onSave}
            disabled={!canEdit}
          >
            Сохранить
          </JacoButton>
        </Box>
      }
    >
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box>
          <Typography sx={mutedTextSx}>{getAppliedToText(card.templateIds.length)}</Typography>
          <UnsavedChangesHint
            dirty={dirty}
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Box>
          <FormLabel>Название</FormLabel>
          <JacoTextInput
            value={card.name}
            disabled={!canEdit}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </Box>

        <Box>
          <FormLabel>Подробная инструкция</FormLabel>
          <TextEditor
            value={card.instruction}
            func={(value, editor) =>
              onChange("instruction", value, getInstructionChangeOptions(editor))
            }
            disabled={!canEdit}
            height={420}
            variant="newsDialog"
            menubar="file edit view insert format tools table"
            toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
          />
        </Box>

        <CategoryTemplatesAccordion
          categoryId={card.id}
          templates={templates}
          categories={categories}
          templateIds={card.templateIds}
          onChange={(templateIds) => onChange("templateIds", templateIds)}
          canEdit={canEdit}
        />

        {historyLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <HistoryLog
            history={history}
            defaultExpanded={false}
          />
        )}
      </Box>
    </JacoModal>
  );
}

export function DeleteCategoryDialog({ open, category, templates = [], onClose, onConfirm }) {
  const hasLinkedTemplates = templates.length > 0 || category?.deletable === false;

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title="Удалить вид уборки?"
      maxWidth="xs"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          {!hasLinkedTemplates ? (
            <JacoButton
              tone="danger"
              compact
              onClick={onConfirm}
            >
              Удалить
            </JacoButton>
          ) : null}
        </Box>
      }
    >
      <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>
        {hasLinkedTemplates
          ? `Вид уборки «${category?.name || ""}» нельзя удалить, пока он применяется к уборкам. Сначала перенесите или удалите связанные уборки.`
          : `Вид уборки «${category?.name || ""}» будет удалён.`}
      </Typography>

      {hasLinkedTemplates ? (
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {templates.map((template) => (
            <JacoStatusChip
              key={template.id}
              label={template.name}
              tone="neutral"
              variant="outlined"
            />
          ))}
        </Box>
      ) : null}
    </JacoModal>
  );
}
