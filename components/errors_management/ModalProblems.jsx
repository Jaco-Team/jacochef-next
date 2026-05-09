"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate, CloudUpload, Delete } from "@mui/icons-material";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

function parseCsvIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((id) => Number.isFinite(id) && id > 0);
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
    if (Number.isFinite(id)) {
      byId.set(id, cat);
    }
  });

  const activeCats = errCats.filter((cat) => Number(cat?.is_active) === 1);
  const activeChildrenByParent = new Map();

  activeCats.forEach((cat) => {
    const parentId = Number(cat?.parent_id);
    if (!Number.isFinite(parentId)) return;

    if (!activeChildrenByParent.has(parentId)) {
      activeChildrenByParent.set(parentId, []);
    }
    activeChildrenByParent.get(parentId).push(cat);
  });

  const selectableCats = activeCats.filter((cat) => {
    const id = Number(cat?.id);
    if (!Number.isFinite(id)) return false;
    return (activeChildrenByParent.get(id) || []).length === 0;
  });

  const buildPath = (cat) => {
    const path = [];
    let current = cat;
    const visited = new Set();

    while (current) {
      const currentId = Number(current?.id);
      if (!Number.isFinite(currentId) || visited.has(currentId)) break;
      visited.add(currentId);
      path.unshift(current?.name || String(currentId));

      const parentId = Number(current?.parent_id);
      if (!Number.isFinite(parentId)) break;
      current = byId.get(parentId);
    }

    return path;
  };

  return selectableCats.map((cat) => {
    const id = Number(cat.id);
    const pathNodes = [];
    let current = cat;
    const visited = new Set();

    while (current) {
      const currentId = Number(current?.id);
      if (!Number.isFinite(currentId) || visited.has(currentId)) break;
      visited.add(currentId);
      pathNodes.unshift({
        id: currentId,
        name: current?.name || String(currentId),
      });

      const parentId = Number(current?.parent_id);
      if (!Number.isFinite(parentId)) break;
      current = byId.get(parentId);
    }

    const pathIds = pathNodes.map((node) => node.id);
    const pathNames = pathNodes.map((node) => node.name);

    return {
      id,
      name: pathNames.join(" / "),
      shortName: cat?.name || String(id),
      pathIds,
      pathNames,
      needImg: Number(cat?.need_img) === 1,
      siteCats: parseCsvIds(cat?.site_cats),
      stage1: parseCsvIds(cat?.stage_1),
      stage2: parseCsvIds(cat?.stage_2),
      stage3: parseCsvIds(cat?.stage_3),
      solutionIds: parseCsvIds(cat?.solutions),
    };
  });
}

function extractPositionCategoryIds(positions = []) {
  const ids = positions
    .map((position) => Number(position?.category_id ?? position?.cat_id))
    .filter((id) => Number.isFinite(id) && id > 0);

  return [...new Set(ids)];
}

function categoryMatchesPositionIds(categoryOption, positionCategoryIds) {
  if (!categoryOption) return false;
  if (!Array.isArray(positionCategoryIds) || !positionCategoryIds.length) return true;
  if (!Array.isArray(categoryOption.siteCats) || !categoryOption.siteCats.length) return true;

  return positionCategoryIds.every((id) => categoryOption.siteCats.includes(id));
}

function areNumberArraysEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index += 1) {
    if (Number(a[index]) !== Number(b[index])) {
      return false;
    }
  }

  return true;
}

function getCascadeLevelLabel(levelIndex, visibleLevelsCount) {
  if (visibleLevelsCount <= 1) return "Тип ошибки";
  if (levelIndex === 0) return "Раздел ошибки";
  if (levelIndex === visibleLevelsCount - 1) return "Тип ошибки";
  return "Подраздел ошибки";
}

export const ModalProblems = ({
  open,
  onClose,
  save,
  positions,
  problem_arr = [],
  current_name,
  title = "Проблема с позициями",
  errCats = [],
  solutionCatalog = [],
}) => {
  const [comment, setComment] = useState("");
  const [selectedPathIds, setSelectedPathIds] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  const normalizedSolutions = useMemo(() => normalizeSolutions(solutionCatalog), [solutionCatalog]);
  const categoryOptions = useMemo(() => buildCategoryOptions(errCats), [errCats]);
  const positionCategoryIds = useMemo(() => extractPositionCategoryIds(positions), [positions]);
  const filteredCategoryOptions = useMemo(
    () =>
      categoryOptions.filter((categoryOption) =>
        categoryMatchesPositionIds(categoryOption, positionCategoryIds),
      ),
    [categoryOptions, positionCategoryIds],
  );

  const cascadeLevelOptions = useMemo(() => {
    const maxDepth = filteredCategoryOptions.reduce(
      (acc, item) => Math.max(acc, item.pathIds?.length || 0),
      0,
    );
    const levels = [];

    for (let levelIndex = 0; levelIndex < maxDepth; levelIndex += 1) {
      if (levelIndex > 0 && !selectedPathIds[levelIndex - 1]) {
        levels.push([]);
        continue;
      }

      const optionsById = new Map();

      filteredCategoryOptions.forEach((leafCategory) => {
        const pathIds = Array.isArray(leafCategory.pathIds) ? leafCategory.pathIds : [];
        const pathNames = Array.isArray(leafCategory.pathNames) ? leafCategory.pathNames : [];

        if (!pathIds[levelIndex]) return;

        let matchesPrefix = true;
        for (let prefixIndex = 0; prefixIndex < levelIndex; prefixIndex += 1) {
          if (Number(pathIds[prefixIndex]) !== Number(selectedPathIds[prefixIndex])) {
            matchesPrefix = false;
            break;
          }
        }

        if (!matchesPrefix) return;

        const optionId = Number(pathIds[levelIndex]);
        if (!Number.isFinite(optionId)) return;

        if (!optionsById.has(optionId)) {
          optionsById.set(optionId, {
            id: optionId,
            name: pathNames[levelIndex] || String(optionId),
          });
        }
      });

      const options = Array.from(optionsById.values()).sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "ru"),
      );
      levels.push(options);
    }

    return levels;
  }, [filteredCategoryOptions, selectedPathIds]);

  const visibleLevelIndexes = useMemo(() => {
    const indexes = [];

    for (let levelIndex = 0; levelIndex < cascadeLevelOptions.length; levelIndex += 1) {
      const options = cascadeLevelOptions[levelIndex] || [];
      if (!options.length) break;

      indexes.push(levelIndex);
      if (!selectedPathIds[levelIndex]) break;
    }

    return indexes;
  }, [cascadeLevelOptions, selectedPathIds]);

  const selectedValueByLevel = useMemo(
    () =>
      cascadeLevelOptions.map((levelOptions, levelIndex) => {
        const selectedId = Number(selectedPathIds[levelIndex]);
        if (!Number.isFinite(selectedId)) return null;
        return levelOptions.find((option) => Number(option.id) === selectedId) || null;
      }),
    [cascadeLevelOptions, selectedPathIds],
  );

  const selectedCategory = useMemo(() => {
    if (!selectedPathIds.length) return null;

    return (
      filteredCategoryOptions.find((leafCategory) => {
        if (!Array.isArray(leafCategory.pathIds)) return false;
        if (leafCategory.pathIds.length !== selectedPathIds.length) return false;

        return selectedPathIds.every(
          (selectedPathId, pathIndex) =>
            Number(leafCategory.pathIds[pathIndex]) === Number(selectedPathId),
        );
      }) || null
    );
  }, [filteredCategoryOptions, selectedPathIds]);

  const availableSolutions = useMemo(() => {
    if (!selectedCategory) return [];
    if (!selectedCategory.solutionIds.length) return [];

    return normalizedSolutions.filter((solution) =>
      selectedCategory.solutionIds.includes(Number(solution.id)),
    );
  }, [normalizedSolutions, selectedCategory]);

  const isImageRequired = Boolean(selectedCategory?.needImg);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setValidationError("");
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setValidationError("");
  };

  useEffect(() => {
    if (!selectedPathIds.length) return;

    setSelectedPathIds((prev) => {
      if (!prev.length) return prev;

      const next = [...prev];
      for (let levelIndex = 0; levelIndex < next.length; levelIndex += 1) {
        const levelOptions = cascadeLevelOptions[levelIndex] || [];
        const exists = levelOptions.some(
          (option) => Number(option.id) === Number(next[levelIndex]),
        );

        if (!exists) {
          const cropped = next.slice(0, levelIndex);
          return areNumberArraysEqual(prev, cropped) ? prev : cropped;
        }
      }

      const cropped = next.slice(0, cascadeLevelOptions.length);
      return areNumberArraysEqual(prev, cropped) ? prev : cropped;
    });
  }, [cascadeLevelOptions, selectedPathIds]);

  useEffect(() => {
    const positionIds = new Set(positions.map((position) => Number(position?.id)).filter(Boolean));
    const matchingItem = problem_arr.find(
      (item) =>
        positionIds.has(Number(item?.id)) &&
        (Number(item?.id) === Number(current_name) || item?.id === ""),
    );

    if (!matchingItem) {
      setSelectedPathIds([]);
      setSelectedSolution(null);
      setComment("");
      setPreviewUrl("");
      setSelectedImage(null);
      setValidationError("");
      return;
    }

    const storedCategoryId = Number(matchingItem?.problem_cat_id);
    const fromId = Number.isFinite(storedCategoryId)
      ? categoryOptions.find((option) => option.id === storedCategoryId)
      : null;
    const fromName = !fromId
      ? categoryOptions.find((option) => option.shortName === matchingItem?.problem_name)
      : null;
    const nextCategory = fromId || fromName || null;
    const validCategory =
      nextCategory && categoryMatchesPositionIds(nextCategory, positionCategoryIds)
        ? nextCategory
        : null;

    const storedSolutionId = Number(matchingItem?.problem_solution?.id);
    const nextSolution = Number.isFinite(storedSolutionId)
      ? normalizedSolutions.find((solution) => Number(solution.id) === storedSolutionId) || null
      : null;

    setSelectedPathIds(validCategory?.pathIds || []);
    setSelectedSolution(nextSolution);
    setComment(matchingItem?.problem_comment || "");
    setPreviewUrl(matchingItem?.previewUrl || "");
    setSelectedImage(null);
    setValidationError("");
  }, [
    problem_arr,
    positions,
    current_name,
    categoryOptions,
    normalizedSolutions,
    positionCategoryIds,
  ]);

  useEffect(() => {
    if (!selectedCategory) return;

    const isStillValid = categoryMatchesPositionIds(selectedCategory, positionCategoryIds);
    if (isStillValid) return;

    setSelectedPathIds([]);
    setSelectedSolution(null);
  }, [selectedCategory, positionCategoryIds]);

  useEffect(() => {
    if (!selectedSolution) return;

    const exists = availableSolutions.some(
      (solution) => Number(solution?.id) === Number(selectedSolution?.id),
    );
    if (!exists) {
      setSelectedSolution(null);
    }
  }, [availableSolutions, selectedSolution]);

  const handleLevelChange = (levelIndex) => (_, option) => {
    setValidationError("");
    setSelectedPathIds((prev) => {
      const basePath = prev.slice(0, levelIndex);
      if (option?.id) {
        basePath[levelIndex] = Number(option.id);
      }
      return basePath;
    });
    setSelectedSolution(null);
  };

  const handleSave = () => {
    if (!selectedCategory) {
      setValidationError("Выберите тип ошибки.");
      return;
    }

    if (availableSolutions.length && !selectedSolution) {
      setValidationError("Выберите вариант решения.");
      return;
    }

    if (isImageRequired && !previewUrl && !selectedImage) {
      setValidationError("Для выбранной ошибки необходимо приложить фото.");
      return;
    }

    if (!categoryMatchesPositionIds(selectedCategory, positionCategoryIds)) {
      setValidationError("Тип ошибки не подходит для выбранных позиций.");
      return;
    }

    setValidationError("");

    save({
      problem_cat_id: selectedCategory.id,
      problem_name: selectedCategory.shortName,
      problem_path: selectedCategory.name,
      problem_comment: comment,
      problem_solution: selectedSolution,
      previewUrl,
      selectedImage,
      need_img: selectedCategory.needImg ? 1 : 0,
      site_cats: selectedCategory.siteCats,
      stage_1: selectedCategory.stage1,
      stage_2: selectedCategory.stage2,
      stage_3: selectedCategory.stage3,
      selected_position_category_ids: positionCategoryIds,
    });

    setSelectedPathIds([]);
    setSelectedSolution(null);
    setComment("");
    setPreviewUrl("");
    setSelectedImage(null);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 620 } }}
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ fontWeight: "bold" }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Выбранные позиции:</Typography>
          <ul style={{ margin: 0, paddingLeft: 22 }}>
            {positions.map((item, index) => (
              <li key={`${item.id || item.name}-${index}`}>{item.name}</li>
            ))}
          </ul>
        </Box>

        {validationError ? (
          <Alert
            severity="warning"
            sx={{ mb: 1.5 }}
          >
            {validationError}
          </Alert>
        ) : null}

        {!filteredCategoryOptions.length && positionCategoryIds.length ? (
          <Alert
            severity="info"
            sx={{ mb: 1.5 }}
          >
            Для выбранных позиций не найдено подходящих типов ошибок.
          </Alert>
        ) : null}

        <Grid
          container
          spacing={1.25}
        >
          {visibleLevelIndexes.map((levelIndex) => (
            <Grid
              key={levelIndex}
              size={12}
            >
              <MyAutocomplite
                value={selectedValueByLevel[levelIndex]}
                data={cascadeLevelOptions[levelIndex]}
                label={getCascadeLevelLabel(levelIndex, visibleLevelIndexes.length)}
                func={handleLevelChange(levelIndex)}
                multiple={false}
                disabled={!cascadeLevelOptions[levelIndex]?.length}
              />
            </Grid>
          ))}
        </Grid>

        <Grid sx={{ mt: 1.25 }}>
          <MyAutocomplite
            value={selectedSolution}
            data={availableSolutions}
            label="Решение ошибки"
            func={(_, data) => {
              setSelectedSolution(data || null);
              setValidationError("");
            }}
            multiple={false}
            disabled={!selectedCategory || !availableSolutions.length}
          />
        </Grid>

        {selectedCategory ? (
          <>
            <Grid sx={{ mt: 1.25 }}>
              <MyTextInput
                value={comment}
                multiline={true}
                rows={4}
                func={(event) => setComment(event.target.value)}
                label="Комментарий"
              />
            </Grid>

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", p: 2 }}
            >
              {isImageRequired ? (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ alignSelf: "flex-start" }}
                >
                  Для этой ошибки фото обязательно
                </Typography>
              ) : null}

              {previewUrl ? (
                <Box sx={{ position: "relative" }}>
                  <Card sx={{ maxWidth: 400 }}>
                    <CardMedia
                      component="img"
                      image={previewUrl}
                      alt="Preview"
                      sx={{ height: 140, objectFit: "cover" }}
                    />
                  </Card>
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "white",
                      border: "1px solid #DD1A32",
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Avatar
                  component="label"
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: "grey.100",
                    border: "2px dashed",
                    borderColor: isImageRequired ? "#DD1A32" : "grey.300",
                  }}
                  variant="rounded"
                >
                  <AddPhotoAlternate sx={{ fontSize: 48, color: "grey.400" }} />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Avatar>
              )}

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                size="large"
              >
                Выбрать картинку
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
