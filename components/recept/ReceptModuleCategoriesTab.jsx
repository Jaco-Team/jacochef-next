import React, { useEffect, useMemo, useState } from "react";
import {
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
import SearchIcon from "@mui/icons-material/Search";

const actionButtonSx = {
  minHeight: 40,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

function getCategoryUsageCount(categoryId, recList = [], pfList = []) {
  const id = Number(categoryId);
  if (!id) {
    return 0;
  }

  const hasCategory = (item) => {
    const { cats } = item || {};
    if (cats === null || cats === undefined || cats === "") {
      return false;
    }
    if (Array.isArray(cats)) {
      return cats.some((cat) => Number(typeof cat === "object" ? cat?.id : cat) === id);
    }
    if (typeof cats === "string") {
      return cats
        .split(",")
        .map((part) => Number(part.trim()))
        .some((catId) => catId === id);
    }
    return Number(cats) === id;
  };

  return [...recList, ...pfList].filter(hasCategory).length;
}

function ReceptCategoryMobileDialog({
  open,
  category,
  usageCount,
  canEdit,
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
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {category.id ? category.name || "Категория" : "Новая категория"}
        {category.id ? (
          <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
            Используется в {usageCount} рецептах и полуфабрикатах
          </Typography>
        ) : null}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.75 }}
        >
          Название
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={category.name || ""}
          disabled={!canEdit}
          onChange={(event) => onChange("name", event.target.value)}
        />
      </DialogContent>
      <DialogActions
        sx={{ px: 3, pb: 2.5, gap: 1, flexDirection: { xs: "column-reverse", sm: "row" } }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          fullWidth
          sx={{ width: { sm: "auto" }, ...actionButtonSx }}
        >
          Закрыть
        </Button>
        {canEdit ? (
          <Button
            variant="contained"
            onClick={onSave}
            fullWidth
            sx={{ width: { sm: "auto" }, ...actionButtonSx }}
          >
            Сохранить
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default function ReceptModuleCategoriesTab({
  categories = [],
  recList = [],
  pfList = [],
  canEdit,
  categoryQuery,
  onCategoryQueryChange,
  selectedCategoryId,
  onSelectCategory,
  draftCategory,
  onDraftCategoryChange,
  onSaveCategory,
  onDeleteCategory,
  deleteCategoryCandidate,
  deleteCategoryUsageCount = 0,
  onCloseDeleteCategory,
  onConfirmDeleteCategory,
}) {
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const search = categoryQuery.trim().toLowerCase();
    return categories.filter(
      (category) => !search || (category.name || "").toLowerCase().includes(search),
    );
  }, [categories, categoryQuery]);

  const selectedCategory = useMemo(() => {
    if (draftCategory) {
      return draftCategory;
    }
    return (
      categories.find((category) => String(category.id) === String(selectedCategoryId)) ||
      categories[0] ||
      null
    );
  }, [categories, draftCategory, selectedCategoryId]);

  const selectedUsageCount = selectedCategory?.id
    ? getCategoryUsageCount(selectedCategory.id, recList, pfList)
    : 0;

  const selectCategory = (id) => {
    onSelectCategory(id);
    if (isMobile) {
      setMobileEditorOpen(true);
    }
  };

  useEffect(() => {
    if (isMobile && draftCategory && !draftCategory.id) {
      setMobileEditorOpen(true);
    }
  }, [draftCategory, isMobile]);

  if (!selectedCategory && !canEdit) {
    return <Typography color="text.secondary">Категории пока не созданы.</Typography>;
  }

  if (!selectedCategory && canEdit) {
    return (
      <Typography color="text.secondary">
        Нажмите «Новая категория», чтобы добавить первую категорию.
      </Typography>
    );
  }

  const canDeleteSelected =
    canEdit && selectedCategory?.id && categories.length > 1 && selectedUsageCount === 0;

  return (
    <>
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
                const usageCount = getCategoryUsageCount(category.id, recList, pfList);
                const selected = String(category.id) === String(selectedCategory?.id);

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
                      bgcolor: selected ? "grey.100" : "transparent",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={usageCount}
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
          {selectedCategory ? (
            <Paper
              variant="outlined"
              sx={{ borderRadius: "8px", overflow: "hidden" }}
            >
              <Box
                sx={{
                  p: 1.5,
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
                    {selectedCategory.id ? selectedCategory.name : "Новая категория"}
                  </Typography>
                  {selectedCategory.id ? (
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      Используется в {selectedUsageCount} рецептах и полуфабрикатах
                    </Typography>
                  ) : null}
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => onDeleteCategory(selectedCategory.id)}
                  disabled={!canDeleteSelected}
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
                  disabled={!canEdit || !(selectedCategory.name || "").trim()}
                  sx={actionButtonSx}
                >
                  Сохранить
                </Button>
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.75 }}
                >
                  Название
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={selectedCategory.name || ""}
                  disabled={!canEdit}
                  onChange={(event) => onDraftCategoryChange("name", event.target.value)}
                />
              </Box>
            </Paper>
          ) : null}
        </Grid>
      </Grid>

      <ReceptCategoryMobileDialog
        open={mobileEditorOpen}
        category={selectedCategory}
        usageCount={selectedUsageCount}
        canEdit={canEdit}
        onClose={() => setMobileEditorOpen(false)}
        onChange={onDraftCategoryChange}
        onSave={() => {
          if (canEdit) {
            onSaveCategory();
            setMobileEditorOpen(false);
          }
        }}
      />

      <Dialog
        open={Boolean(deleteCategoryCandidate)}
        onClose={onCloseDeleteCategory}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Удалить категорию?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
            {deleteCategoryUsageCount > 0
              ? `Категорию «${deleteCategoryCandidate?.name || ""}» нельзя удалить, пока она используется в рецептах или полуфабрикатах.`
              : `Категория «${deleteCategoryCandidate?.name || ""}» будет удалена.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onCloseDeleteCategory}
            sx={actionButtonSx}
          >
            Отмена
          </Button>
          {deleteCategoryUsageCount === 0 ? (
            <Button
              variant="contained"
              onClick={onConfirmDeleteCategory}
              sx={actionButtonSx}
            >
              Удалить
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}

export { getCategoryUsageCount };
