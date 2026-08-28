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
import { MySelect } from "@/ui/Forms";

const actionButtonSx = {
  minHeight: 40,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const ROOT_PARENT_ID = -1;

function flattenSkladCategories(cats = []) {
  const result = [];

  (cats || []).forEach((parent) => {
    const children = parent.cats || [];
    const childrenItemsCount = children.reduce((sum, child) => sum + (child.items || []).length, 0);

    result.push({
      id: parent.id,
      name: parent.name,
      parent_id: ROOT_PARENT_ID,
      parentName: null,
      level: 1,
      itemsCount: childrenItemsCount,
      childrenCount: children.length,
    });

    children.forEach((child) => {
      result.push({
        id: child.id,
        name: child.name,
        parent_id: parent.id,
        parentName: parent.name,
        level: 2,
        itemsCount: (child.items || []).length,
        childrenCount: 0,
      });
    });
  });

  return result;
}

function getSkladCategoryUsageCount(category) {
  if (!category) {
    return 0;
  }

  if (category.level === 2) {
    return category.itemsCount || 0;
  }

  return category.itemsCount || 0;
}

function getParentSelectOptions(category, topLevelParents) {
  if (category?.id && category.level === 1) {
    return [{ id: ROOT_PARENT_ID, name: "Корневая категория" }];
  }

  if (category?.level === 2) {
    return topLevelParents;
  }

  return [{ id: ROOT_PARENT_ID, name: "Корневая категория" }, ...topLevelParents];
}

function SkladCategoryMobileDialog({
  open,
  category,
  usageCount,
  canEdit,
  parentOptions,
  parentSelectDisabled,
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
            {category.level === 1
              ? `${category.childrenCount || 0} подкатегорий, ${usageCount} товаров`
              : `Используется в ${usageCount} товарах`}
          </Typography>
        ) : null}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <MySelect
          label="Родительская категория"
          data={parentOptions}
          value={category.parent_id ?? ROOT_PARENT_ID}
          disabled={!canEdit || parentSelectDisabled}
          func={(event) => onChange("parent_id", event)}
        />
        <TextField
          size="small"
          fullWidth
          label="Название"
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

export default function SkladItemsCategoriesTab({
  catsTree = [],
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
  deleteCategoryChildrenCount = 0,
  onCloseDeleteCategory,
  onConfirmDeleteCategory,
}) {
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  const categories = useMemo(() => flattenSkladCategories(catsTree), [catsTree]);

  const topLevelParents = useMemo(
    () => categories.filter((category) => category.level === 1),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const search = categoryQuery.trim().toLowerCase();

    return categories.filter((category) => {
      if (!search) {
        return true;
      }

      return (
        (category.name || "").toLowerCase().includes(search) ||
        (category.parentName || "").toLowerCase().includes(search)
      );
    });
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

  const selectedUsageCount = getSkladCategoryUsageCount(selectedCategory);
  const parentOptions = getParentSelectOptions(selectedCategory, topLevelParents);
  const parentSelectDisabled = Boolean(selectedCategory?.id && selectedCategory.level === 1);

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
    canEdit &&
    selectedCategory?.id &&
    categories.length > 1 &&
    selectedUsageCount === 0 &&
    (selectedCategory.level !== 1 || (selectedCategory.childrenCount || 0) === 0);

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
                const usageCount = getSkladCategoryUsageCount(category);
                const selected = String(category.id) === String(selectedCategory?.id);

                return (
                  <Box
                    key={category.id}
                    onClick={() => selectCategory(category.id)}
                    sx={{
                      pl: category.level === 2 ? 3 : 1.5,
                      pr: 1.5,
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
                      {category.level === 2 && category.parentName ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.25 }}
                        >
                          {category.parentName}
                        </Typography>
                      ) : null}
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={category.level === 1 ? category.childrenCount || 0 : usageCount}
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
                      {selectedCategory.level === 1
                        ? `${selectedCategory.childrenCount || 0} подкатегорий, ${selectedUsageCount} товаров`
                        : `Используется в ${selectedUsageCount} товарах`}
                    </Typography>
                  ) : null}
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => onDeleteCategory(selectedCategory.id)}
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

              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <MySelect
                  label="Родительская категория"
                  data={parentOptions}
                  value={selectedCategory.parent_id ?? ROOT_PARENT_ID}
                  disabled={!canEdit || parentSelectDisabled}
                  func={(event) => onDraftCategoryChange("parent_id", event)}
                />
                <Box>
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
              </Box>
            </Paper>
          ) : null}
        </Grid>
      </Grid>

      <SkladCategoryMobileDialog
        open={mobileEditorOpen}
        category={selectedCategory}
        usageCount={selectedUsageCount}
        canEdit={canEdit}
        parentOptions={parentOptions}
        parentSelectDisabled={parentSelectDisabled}
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
              ? `Категорию «${deleteCategoryCandidate?.name || ""}» нельзя удалить, пока в ней есть товары.`
              : deleteCategoryChildrenCount > 0
                ? `Категорию «${deleteCategoryCandidate?.name || ""}» нельзя удалить, пока в ней есть подкатегории.`
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
          {deleteCategoryUsageCount === 0 && deleteCategoryChildrenCount === 0 ? (
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

export { flattenSkladCategories, getSkladCategoryUsageCount };
