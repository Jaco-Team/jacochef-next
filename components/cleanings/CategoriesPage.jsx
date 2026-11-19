import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { TextEditor } from "@/ui/Forms";
import HistoryLog from "@/ui/history/HistoryLog";
import { JacoButton } from "@/design-system/shared/ui";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { FormLabel } from "./shared";

const centeredButtonSx = {
  alignItems: "center",
  justifyContent: "center",
  lineHeight: "20px",
};

const actionButtonSx = {
  ...centeredButtonSx,
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

function getAppliedToText(count) {
  return count
    ? `Применяется к ${formatPlural(count, ["уборке", "уборкам", "уборкам"])}`
    : "Пока ни к одной уборке не применяется";
}

function CategoryTemplatesAccordion({ templates }) {
  return (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{
        borderRadius: "8px",
        overflow: "hidden",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Применяется для</Typography>
          <Chip
            label={templates.length}
            size="small"
            sx={{ height: 22, minWidth: 28, fontWeight: 700 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {templates.length ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {templates.map((template) => (
              <Chip
                key={template.id}
                label={`${template.name} · ${template.role}`}
                size="small"
                variant="outlined"
                sx={{ height: 28, fontWeight: 600 }}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Пока ни к одной уборке не применяется
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default function CleaningCategoriesView({
  categories,
  templates,
  selectedCategoryId,
  categoryQuery,
  onCategoryQueryChange,
  onSelectCategory,
  onCreateCategory,
  draftCategory,
  onDraftCategoryChange,
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
  const selectedCategory =
    draftCategory ||
    categories.find((category) => category.id === selectedCategoryId) ||
    categories[0];
  const selectedTemplates = selectedCategory?.id
    ? templates.filter((template) => template.categoryId === selectedCategory.id)
    : [];
  const selectedTemplatesCount = selectedTemplates.length;
  const updateSelectedCategory = (field, value) => {
    if (!selectedCategory) {
      return;
    }

    onDraftCategoryChange({ ...selectedCategory, [field]: value });
  };

  const selectCategory = (id) => {
    onSelectCategory(id);
    const category = categories.find((item) => item.id === id);

    if (category) {
      onDraftCategoryChange(category);
    }

    if (isMobile) {
      setMobileEditorOpen(true);
    }
  };

  useEffect(() => {
    if (isMobile && draftCategory && !draftCategory.id) {
      setMobileEditorOpen(true);
    }
  }, [draftCategory, isMobile]);

  return (
    <Grid
      container
      spacing={2.5}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper
          variant="outlined"
          sx={{ borderRadius: "8px", overflow: "hidden", height: "100%" }}
        >
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gap: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <TextField
              size="small"
              fullWidth
              value={categoryQuery}
              placeholder="Поиск вида уборки"
              onChange={(event) => onCategoryQueryChange(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
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
              const selected = category.id === selectedCategory?.id;

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
                    bgcolor: selected ? "surface.muted" : "transparent",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "surface.muted" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{category.name}</Typography>
                  </Box>
                  <Chip
                    label={usedCount}
                    size="small"
                    sx={{ minWidth: 28, height: 22, fontWeight: 700 }}
                  />
                </Box>
              );
            })}
            {filteredCategories.length ? null : (
              <Typography sx={{ px: 1.5, py: 2, color: "text.secondary", fontSize: 14 }}>
                {categories.length ? "Ничего не найдено" : "Видов уборок пока нет"}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
      {selectedCategory ? (
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Paper
            variant="outlined"
            sx={{
              borderRadius: { xs: 0, md: "8px" },
              overflow: "hidden",
              border: { xs: 0, md: "1px solid #e0e0e0" },
              bgcolor: { xs: "transparent", md: "background.paper" },
            }}
          >
            <Box
              sx={{
                p: { xs: 0, md: 1.5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {selectedCategory.name}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  {getAppliedToText(selectedTemplatesCount)}
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDeleteCategory(selectedCategory.id)}
                disabled={
                  !canEdit ||
                  !selectedCategory.id ||
                  categories.length <= 1 ||
                  selectedCategory.deletable === false
                }
                sx={actionButtonSx}
              >
                Удалить
              </Button>
            </Box>

            <Box sx={{ px: 2, pt: 2 }}>
              <Button
                size="small"
                variant="contained"
                onClick={onSaveCategory}
                disabled={!canEdit}
                sx={actionButtonSx}
              >
                Сохранить
              </Button>
            </Box>

            <Box sx={{ p: 2, display: "grid", gap: 2 }}>
              <Grid
                container
                spacing={2}
              >
                <Grid size={12}>
                  <FormLabel>Название</FormLabel>
                  <TextField
                    size="small"
                    fullWidth
                    value={selectedCategory.name}
                    disabled={!canEdit}
                    onChange={(event) => updateSelectedCategory("name", event.target.value)}
                  />
                </Grid>
              </Grid>

              <Box>
                <FormLabel>Подробная инструкция</FormLabel>
                <TextEditor
                  value={selectedCategory.instruction}
                  func={(value) => updateSelectedCategory("instruction", value)}
                  disabled={!canEdit}
                  height={300}
                  variant="newsDialog"
                  menubar="file edit view insert format tools table"
                  toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
                />
              </Box>

              <CategoryTemplatesAccordion templates={selectedTemplates} />

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
          </Paper>
        </Grid>
      ) : null}
      <CategoryMobileEditDialog
        open={mobileEditorOpen}
        category={selectedCategory}
        templates={selectedTemplates}
        history={history}
        templatesCount={selectedTemplatesCount}
        historyLoading={historyLoading}
        onClose={() => setMobileEditorOpen(false)}
        onChange={updateSelectedCategory}
        onSave={() => {
          if (canEdit) {
            onSaveCategory();
            setMobileEditorOpen(false);
          }
        }}
        canEdit={canEdit}
      />
    </Grid>
  );
}

function CategoryMobileEditDialog({
  open,
  category,
  templates,
  history,
  templatesCount,
  historyLoading,
  onClose,
  onChange,
  onSave,
  canEdit,
}) {
  if (!category) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "12px", maxHeight: "calc(100dvh - 32px)" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {category.name}
        <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
          {getAppliedToText(templatesCount)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, overflow: "auto" }}>
        <Box>
          <FormLabel>Название</FormLabel>
          <TextField
            size="small"
            fullWidth
            value={category.name}
            disabled={!canEdit}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </Box>

        <Box>
          <FormLabel>Подробная инструкция</FormLabel>
          <TextEditor
            value={category.instruction}
            func={(value) => onChange("instruction", value)}
            disabled={!canEdit}
            height={420}
            variant="newsDialog"
            menubar="file edit view insert format tools table"
            toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
          />
        </Box>

        <CategoryTemplatesAccordion templates={templates} />

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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={!canEdit}
          sx={actionButtonSx}
        >
          Сохранить
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DeleteCategoryDialog({ open, category, templates = [], onClose, onConfirm }) {
  const hasLinkedTemplates = templates.length > 0 || category?.deletable === false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Удалить вид уборки?</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
          {hasLinkedTemplates
            ? `Вид уборки «${category?.name || ""}» нельзя удалить, пока он применяется к уборкам. Сначала перенесите или удалите связанные уборки.`
            : `Вид уборки «${category?.name || ""}» будет удалён.`}
        </Typography>

        {hasLinkedTemplates ? (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {templates.map((template) => (
              <Chip
                key={template.id}
                label={template.name}
                size="small"
                variant="outlined"
                sx={{ height: 28, fontWeight: 600 }}
              />
            ))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        {!hasLinkedTemplates ? (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onConfirm}
            sx={actionButtonSx}
          >
            Удалить
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
