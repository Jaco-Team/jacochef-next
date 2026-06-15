import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { TextEditor } from "@/ui/Forms";
import HistoryLog from "@/ui/history/HistoryLog";
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

function buildCategoryHistory(category, templates) {
  if (!category) {
    return [];
  }

  return [
    {
      id: `${category.id || "new"}-instruction`,
      created_at: "2026-06-12T14:20:00",
      actor_name: "Винокуров М. Ю.",
      event_type: "update",
      diff_json: JSON.stringify({
        "Подробная инструкция": {
          from: "Черновик инструкции",
          to: "Обновлена инструкция для сотрудника",
        },
      }),
    },
    {
      id: `${category.id || "new"}-templates`,
      created_at: "2026-06-12T13:40:00",
      actor_name: "Беседина Г. М.",
      event_type: "update",
      diff_json: JSON.stringify({
        "Уборки категории": {
          from: "Не назначены",
          to: templates.length
            ? templates.map((template) => template.name).join(", ")
            : "Нет уборок",
        },
      }),
    },
    {
      id: `${category.id || "new"}-created`,
      created_at: "2026-06-12T12:55:00",
      actor_name: "Система",
      event_type: "create",
      diff_json: JSON.stringify({
        Название: {
          from: "",
          to: category.name,
        },
      }),
    },
  ];
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
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Уборки этой категории</Typography>
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
            В этой категории пока нет уборок
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
  draftCategory,
  onDraftCategoryChange,
  onSaveCategory,
  onDeleteCategory,
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
  const selectedCategoryHistory = buildCategoryHistory(selectedCategory, selectedTemplates);

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

  if (!selectedCategory) {
    return null;
  }

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
          <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              size="small"
              fullWidth
              value={categoryQuery}
              placeholder="Поиск категории"
              onChange={(event) => onCategoryQueryChange(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            {filteredCategories.map((category) => {
              const usedCount = templates.filter(
                (template) => template.categoryId === category.id,
              ).length;
              const selected = category.id === selectedCategory.id;

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
          </Box>
        </Paper>
      </Grid>

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
                Используется в {selectedTemplatesCount} уборках
              </Typography>
            </Box>

            <Button
              size="small"
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onDeleteCategory(selectedCategory.id)}
              disabled={!selectedCategory.id || categories.length <= 1}
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
                  onChange={(event) => updateSelectedCategory("name", event.target.value)}
                />
              </Grid>
            </Grid>

            <Box>
              <FormLabel>Подробная инструкция</FormLabel>
              <TextEditor
                value={selectedCategory.instruction}
                func={(value) => updateSelectedCategory("instruction", value)}
                height={300}
                variant="newsDialog"
                menubar="file edit view insert format tools table"
                toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
              />
            </Box>

            <CategoryTemplatesAccordion templates={selectedTemplates} />

            <HistoryLog
              history={selectedCategoryHistory}
              defaultExpanded={false}
            />
          </Box>
        </Paper>
      </Grid>

      <CategoryMobileEditDialog
        open={mobileEditorOpen}
        category={selectedCategory}
        templates={selectedTemplates}
        history={selectedCategoryHistory}
        templatesCount={selectedTemplatesCount}
        onClose={() => setMobileEditorOpen(false)}
        onChange={updateSelectedCategory}
        onSave={() => {
          onSaveCategory();
          setMobileEditorOpen(false);
        }}
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
  onClose,
  onChange,
  onSave,
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
      PaperProps={{ sx: { borderRadius: "12px", maxHeight: "calc(100dvh - 32px)" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {category.name}
        <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
          Используется в {templatesCount} уборках
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, overflow: "auto" }}>
        <Box>
          <FormLabel>Название</FormLabel>
          <TextField
            size="small"
            fullWidth
            value={category.name}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </Box>

        <Box>
          <FormLabel>Подробная инструкция</FormLabel>
          <TextEditor
            value={category.instruction}
            func={(value) => onChange("instruction", value)}
            height={420}
            variant="newsDialog"
            menubar="file edit view insert format tools table"
            toolbar="undo redo | blocks | bold italic forecolor | bullist numlist | alignleft aligncenter alignright | removeformat"
          />
        </Box>

        <CategoryTemplatesAccordion templates={templates} />

        <HistoryLog
          history={history}
          defaultExpanded={false}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onSave}
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
  const hasLinkedTemplates = templates.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Удалить категорию?</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
          {hasLinkedTemplates
            ? `Категорию «${category?.name || ""}» нельзя удалить, пока она связана с уборками. Сначала перенесите или удалите связанные уборки.`
            : `Категория «${category?.name || ""}» будет удалена.`}
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
