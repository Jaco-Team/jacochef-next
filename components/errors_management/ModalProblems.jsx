"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate, CloudUpload, Delete } from "@mui/icons-material";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

function parseCsvIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(Number).filter((id) => Number.isFinite(id) && id > 0);
  }

  return String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function normalizeSolutions(items = []) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      ...item,
      id: Number(item?.id),
      name: item?.name || item?.title || item?.label || String(item?.id ?? ""),
    }))
    .filter((item) => Number.isFinite(item.id));
}

function buildCategoryOptions(errCats = []) {
  if (!Array.isArray(errCats) || !errCats.length) return [];

  const byId = new Map();
  errCats.forEach((cat) => {
    const id = Number(cat?.id);
    if (Number.isFinite(id)) byId.set(id, cat);
  });

  const activeCats = errCats.filter((cat) => Number(cat?.is_active) === 1);
  const activeChildrenByParent = new Map();

  activeCats.forEach((cat) => {
    const parentId = Number(cat?.parent_id);
    if (!Number.isFinite(parentId)) return;
    if (!activeChildrenByParent.has(parentId)) activeChildrenByParent.set(parentId, []);
    activeChildrenByParent.get(parentId).push(cat);
  });

  return activeCats
    .filter((cat) => !(activeChildrenByParent.get(Number(cat?.id)) || []).length)
    .map((cat) => {
      const pathNodes = [];
      let current = cat;
      const visited = new Set();

      while (current) {
        const currentId = Number(current?.id);
        if (!Number.isFinite(currentId) || visited.has(currentId)) break;
        visited.add(currentId);
        pathNodes.unshift({ id: currentId, name: current?.name || String(currentId) });

        const parentId = Number(current?.parent_id);
        if (!Number.isFinite(parentId) || parentId <= 0) break;
        current = byId.get(parentId);
      }

      const pathIds = pathNodes.map((node) => node.id);
      const pathNames = pathNodes.map((node) => node.name);
      const siteCats = [
        ...new Set(pathNodes.flatMap((node) => parseCsvIds(byId.get(node.id)?.site_cats))),
      ];

      return {
        id: Number(cat.id),
        name: pathNames.join(" / "),
        shortName: cat?.name || String(cat.id),
        pathIds,
        pathNames,
        needImg: Number(cat?.need_img) === 1,
        siteCats,
        stage1: parseCsvIds(cat?.stage_1),
        stage2: parseCsvIds(cat?.stage_2),
        stage3: parseCsvIds(cat?.stage_3),
        solutionIds: parseCsvIds(cat?.solutions),
      };
    });
}

function getPositionKey(position, index = 0) {
  return String(position?.position_key || position?.id || `position-${index}`);
}

function getPositionCategoryIds(position) {
  const categoryId = Number(position?.category_id ?? position?.cat_id);
  return Number.isFinite(categoryId) && categoryId > 0 ? [categoryId] : [];
}

function categoryMatchesPosition(categoryOption, position) {
  const positionCategoryIds = getPositionCategoryIds(position);
  if (!positionCategoryIds.length) return true;
  if (!categoryOption?.siteCats?.length) return true;
  return positionCategoryIds.every((id) => categoryOption.siteCats.includes(id));
}

function filteredCategoriesForPosition(categoryOptions, position) {
  return categoryOptions.filter((category) => categoryMatchesPosition(category, position));
}

function automaticRootPath(categoryOptions, position) {
  const positionCategoryIds = getPositionCategoryIds(position);
  if (positionCategoryIds.length !== 1) return [];

  const categoryId = positionCategoryIds[0];
  const roots = new Set(
    categoryOptions
      .filter((category) => category.siteCats.includes(categoryId))
      .map((category) => Number(category.pathIds?.[0]))
      .filter(Number.isFinite),
  );

  return roots.size === 1 ? [Array.from(roots)[0]] : [];
}

function findSelectedCategory(categoryOptions, selectedPathIds) {
  if (!selectedPathIds?.length) return null;

  return (
    categoryOptions.find(
      (category) =>
        category.pathIds.length === selectedPathIds.length &&
        selectedPathIds.every(
          (selectedId, index) => Number(category.pathIds[index]) === Number(selectedId),
        ),
    ) || null
  );
}

function cascadeOptions(categoryOptions, selectedPathIds) {
  const maxDepth = categoryOptions.reduce(
    (depth, category) => Math.max(depth, category.pathIds.length),
    0,
  );
  const levels = [];

  for (let levelIndex = 0; levelIndex < maxDepth; levelIndex += 1) {
    if (levelIndex > 0 && !selectedPathIds[levelIndex - 1]) break;

    const options = new Map();
    categoryOptions.forEach((category) => {
      const matchesPrefix = selectedPathIds
        .slice(0, levelIndex)
        .every((id, index) => Number(category.pathIds[index]) === Number(id));
      const optionId = Number(category.pathIds[levelIndex]);
      if (!matchesPrefix || !Number.isFinite(optionId)) return;
      if (!options.has(optionId)) {
        options.set(optionId, {
          id: optionId,
          name: category.pathNames[levelIndex] || String(optionId),
        });
      }
    });

    const values = Array.from(options.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "ru"),
    );
    if (!values.length) break;
    levels.push(values);
    if (!selectedPathIds[levelIndex]) break;
  }

  return levels;
}

function cascadeLevelLabel(levelIndex, categoryOptions, selectedPathIds) {
  if (levelIndex === 0) return "Раздел ошибки";

  const hasDeeperLevel = categoryOptions.some(
    (category) =>
      category.pathIds.length > levelIndex + 1 &&
      selectedPathIds
        .slice(0, levelIndex)
        .every((id, index) => Number(category.pathIds[index]) === Number(id)),
  );

  return hasDeeperLevel ? "Подраздел ошибки" : "Тип ошибки";
}

function isIngredientQuality(category) {
  return Boolean(
    category?.pathNames?.some((name) =>
      String(name).toLocaleLowerCase("ru").includes("качество ингредиентов"),
    ),
  );
}

function buildInitialDraft(position, index, categoryOptions, problemArr, normalizedSolutions) {
  const key = getPositionKey(position, index);
  const stored = problemArr.find(
    (problem) =>
      getPositionKey(problem) === key ||
      (!problem?.position_key && Number(problem?.id) === Number(position?.id)),
  );
  const filteredCategories = filteredCategoriesForPosition(categoryOptions, position);
  const storedCategory = filteredCategories.find(
    (category) => Number(category.id) === Number(stored?.problem_cat_id),
  );
  const storedSolution = normalizedSolutions.find(
    (solution) => Number(solution.id) === Number(stored?.problem_solution?.id),
  );
  const ingredients = Array.isArray(position?.ingredients) ? position.ingredients : [];
  const storedIngredient = ingredients.find(
    (ingredient) => Number(ingredient.id) === Number(stored?.problem_ingredient?.id),
  );
  const maxCount = Math.max(1, Number(position?.total_count) || 1);

  return {
    selectedPathIds: storedCategory?.pathIds || automaticRootPath(categoryOptions, position),
    selectedSolution: storedSolution || null,
    selectedIngredient: storedIngredient || null,
    comment: stored?.problem_comment || "",
    selectedImage: stored?.selectedImage || null,
    previewUrl: stored?.previewUrl || "",
    errorCount: Math.min(maxCount, Math.max(1, Number(stored?.error_count) || 1)),
  };
}

function PositionProblemCard({
  position,
  draft,
  updateDraft,
  categoryOptions,
  normalizedSolutions,
  validationError,
}) {
  const filteredCategories = useMemo(
    () => filteredCategoriesForPosition(categoryOptions, position),
    [categoryOptions, position],
  );
  const levels = useMemo(
    () => cascadeOptions(filteredCategories, draft.selectedPathIds),
    [filteredCategories, draft.selectedPathIds],
  );
  const selectedCategory = useMemo(
    () => findSelectedCategory(filteredCategories, draft.selectedPathIds),
    [filteredCategories, draft.selectedPathIds],
  );
  const availableSolutions = useMemo(() => {
    if (!selectedCategory?.solutionIds?.length) return [];
    return normalizedSolutions.filter((solution) =>
      selectedCategory.solutionIds.includes(Number(solution.id)),
    );
  }, [normalizedSolutions, selectedCategory]);
  const ingredients = Array.isArray(position?.ingredients) ? position.ingredients : [];
  const ingredientRequired = isIngredientQuality(selectedCategory);
  const maxCount = Math.max(1, Number(position?.total_count) || 1);

  const handleLevelChange = (levelIndex) => (_, option) => {
    const nextPath = draft.selectedPathIds.slice(0, levelIndex);
    if (option?.id) nextPath[levelIndex] = Number(option.id);
    updateDraft({
      selectedPathIds: nextPath,
      selectedSolution: null,
      selectedIngredient: null,
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    updateDraft({ selectedImage: file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2 }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{position?.name || "Позиция"}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {position?.type === "extra"
                ? "Дополнение"
                : position?.type === "delivery"
                  ? "Доставка"
                  : "Блюдо"}
            </Typography>
          </Box>
          <Typography sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>× {maxCount}</Typography>
        </Box>

        {validationError ? (
          <Alert
            severity="warning"
            sx={{ mb: 1.5 }}
          >
            {validationError}
          </Alert>
        ) : null}
        {!filteredCategories.length ? (
          <Alert
            severity="info"
            sx={{ mb: 1.5 }}
          >
            Для позиции не найдено подходящих типов ошибок.
          </Alert>
        ) : null}

        <Grid
          container
          spacing={1.25}
        >
          {levels.map((levelOptions, levelIndex) => {
            const value =
              levelOptions.find(
                (option) => Number(option.id) === Number(draft.selectedPathIds[levelIndex]),
              ) || null;

            return (
              <Grid
                key={levelIndex}
                size={12}
              >
                <MyAutocomplite
                  value={value}
                  data={levelOptions}
                  label={cascadeLevelLabel(levelIndex, filteredCategories, draft.selectedPathIds)}
                  func={handleLevelChange(levelIndex)}
                  multiple={false}
                />
              </Grid>
            );
          })}

          {maxCount > 1 ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Количество с ошибкой"
                value={draft.errorCount}
                onChange={(event) => updateDraft({ errorCount: Number(event.target.value) })}
              >
                {Array.from({ length: maxCount }, (_, index) => index + 1).map((count) => (
                  <MenuItem
                    key={count}
                    value={count}
                  >
                    {count}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, sm: maxCount > 1 ? 6 : 12 }}>
            <MyAutocomplite
              value={draft.selectedSolution}
              data={availableSolutions}
              label="Решение ошибки"
              func={(_, value) => updateDraft({ selectedSolution: value || null })}
              multiple={false}
              disabled={!selectedCategory || !availableSolutions.length}
            />
          </Grid>

          {ingredientRequired ? (
            <Grid size={12}>
              {ingredients.length ? (
                <MyAutocomplite
                  value={draft.selectedIngredient}
                  data={ingredients}
                  label="Продукт из состава"
                  func={(_, value) => updateDraft({ selectedIngredient: value || null })}
                  multiple={false}
                />
              ) : (
                <Alert severity="info">
                  {position?.ingredients_warning ||
                    "Для позиции не найден состав из закупаемых продуктов."}
                </Alert>
              )}
            </Grid>
          ) : null}

          {selectedCategory ? (
            <Grid size={12}>
              <MyTextInput
                value={draft.comment}
                multiline
                rows={3}
                func={(event) => updateDraft({ comment: event.target.value })}
                label="Комментарий"
              />
            </Grid>
          ) : null}
        </Grid>

        {selectedCategory ? (
          <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            {draft.previewUrl ? (
              <Box sx={{ position: "relative" }}>
                <Card sx={{ width: 150 }}>
                  <CardMedia
                    component="img"
                    image={draft.previewUrl}
                    alt="Фото ошибки"
                    sx={{ height: 100, objectFit: "cover" }}
                  />
                </Card>
                <IconButton
                  size="small"
                  onClick={() => updateDraft({ selectedImage: null, previewUrl: "" })}
                  sx={{ position: "absolute", top: 4, right: 4, bgcolor: "white" }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Avatar
                component="label"
                variant="rounded"
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "grey.100",
                  border: "2px dashed",
                  borderColor: selectedCategory.needImg ? "error.main" : "grey.300",
                }}
              >
                <AddPhotoAlternate sx={{ color: "grey.400" }} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Avatar>
            )}
            <Box>
              {selectedCategory.needImg ? (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mb: 0.75 }}
                >
                  Фото обязательно
                </Typography>
              ) : null}
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                Выбрать фото
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

export const ModalProblems = ({
  open,
  onClose,
  save,
  positions = [],
  problem_arr = [],
  title = "Проблемы с позициями",
  errCats = [],
  solutionCatalog = [],
}) => {
  const categoryOptions = useMemo(() => buildCategoryOptions(errCats), [errCats]);
  const normalizedSolutions = useMemo(() => normalizeSolutions(solutionCatalog), [solutionCatalog]);
  const [drafts, setDrafts] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    const nextDrafts = {};
    positions.forEach((position, index) => {
      nextDrafts[getPositionKey(position, index)] = buildInitialDraft(
        position,
        index,
        categoryOptions,
        problem_arr,
        normalizedSolutions,
      );
    });
    setDrafts(nextDrafts);
    setValidationErrors({});
  }, [open, positions, problem_arr, categoryOptions, normalizedSolutions]);

  const updateDraft = (key, patch) => {
    setDrafts((previous) => ({
      ...previous,
      [key]: { ...previous[key], ...patch },
    }));
    setValidationErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const handleSave = () => {
    const errors = {};
    const assignments = [];

    positions.forEach((position, index) => {
      const key = getPositionKey(position, index);
      const draft = drafts[key];
      const filteredCategories = filteredCategoriesForPosition(categoryOptions, position);
      const selectedCategory = findSelectedCategory(
        filteredCategories,
        draft?.selectedPathIds || [],
      );
      const availableSolutions = selectedCategory?.solutionIds?.length
        ? normalizedSolutions.filter((solution) =>
            selectedCategory.solutionIds.includes(Number(solution.id)),
          )
        : [];

      if (!selectedCategory) {
        errors[key] = "Выберите тип ошибки.";
        return;
      }
      if (availableSolutions.length && !draft?.selectedSolution) {
        errors[key] = "Выберите вариант решения.";
        return;
      }
      if (selectedCategory.needImg && !draft?.previewUrl && !draft?.selectedImage) {
        errors[key] = "Для выбранной ошибки необходимо приложить фото.";
        return;
      }
      if (isIngredientQuality(selectedCategory) && !draft?.selectedIngredient) {
        errors[key] = "Выберите продукт из состава блюда.";
        return;
      }

      assignments.push({
        ...position,
        position_key: key,
        problem_cat_id: selectedCategory.id,
        problem_name: selectedCategory.shortName,
        problem_path: selectedCategory.name,
        problem_comment: draft?.comment || "",
        problem_solution: draft?.selectedSolution || null,
        problem_ingredient: draft?.selectedIngredient || null,
        error_count: Number(draft?.errorCount) || 1,
        previewUrl: draft?.previewUrl || "",
        selectedImage: draft?.selectedImage || null,
        need_img: selectedCategory.needImg ? 1 : 0,
        site_cats: selectedCategory.siteCats,
        stage_1: selectedCategory.stage1,
        stage_2: selectedCategory.stage2,
        stage_3: selectedCategory.stage3,
      });
    });

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    save(assignments);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { maxHeight: "90vh", display: "flex", flexDirection: "column" } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        dividers
        sx={{ overflowY: "auto" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {positions.map((position, index) => {
            const key = getPositionKey(position, index);
            const draft = drafts[key];
            if (!draft) return null;

            return (
              <PositionProblemCard
                key={key}
                position={position}
                draft={draft}
                updateDraft={(patch) => updateDraft(key, patch)}
                categoryOptions={categoryOptions}
                normalizedSolutions={normalizedSolutions}
                validationError={validationErrors[key]}
              />
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleSave}
          variant="contained"
        >
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
