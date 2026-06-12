import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  cleaningSectionTabs,
  controlKindTabs,
  initialCategories,
  initialControlItems,
  initialPreparationItems,
  initialTemplates,
  locations,
} from "./constants";
import { getCategoryName } from "./helpers";
import CleaningTemplateDialog from "./CleaningTemplateDialog";
import CleaningHistoryDialog from "./CleaningHistoryDialog";
import CleaningsListPage from "./CleaningsListPage";
import CleaningCategoriesView, { DeleteCategoryDialog } from "./CategoriesPage";
import CafesView, { AddCafeCleaningDialog, RemoveCafeCleaningDialog } from "./CafesPage";
import ControlView from "./ControlCleaningsPage";
import PreparationControlView, { PreparationEditDialog } from "./ControlPreparationsPage";
import { ControlActionConfirmDialog, PreparationActionConfirmDialog } from "./ControlDialogs";

export default function CleaningsPage({
  initialSection = "templates",
  initialControlKind = "cleanings",
} = {}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [categories, setCategories] = useState(initialCategories);
  const [controlItems, setControlItems] = useState(initialControlItems);
  const [preparationItems, setPreparationItems] = useState(initialPreparationItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategories[0].id);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [controlFilter, setControlFilter] = useState("all");
  const [section, setSection] = useState(initialSection);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [selectedCafeId, setSelectedCafeId] = useState(locations[0].id);
  const [cafeRoleFilter, setCafeRoleFilter] = useState("all");
  const [addCafeDialogOpen, setAddCafeDialogOpen] = useState(false);
  const [addCafeQuery, setAddCafeQuery] = useState("");
  const [removeCafeCleaningId, setRemoveCafeCleaningId] = useState(null);
  const [controlAction, setControlAction] = useState(null);
  const [preparationAction, setPreparationAction] = useState(null);
  const [editingPreparationId, setEditingPreparationId] = useState(null);
  const [controlKind, setControlKind] = useState(initialControlKind);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setControlKind(initialControlKind);
  }, [initialControlKind]);

  const filteredTemplates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return templates.filter((item) => {
      const byFilter = filter === "all" || item.status === filter;
      const bySearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.role.toLowerCase().includes(search) ||
        getCategoryName(categories, item.categoryId).toLowerCase().includes(search);

      return byFilter && bySearch;
    });
  }, [categories, filter, query, templates]);

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const saveTemplate = (template) => {
    setTemplates((prev) => {
      if (template.id) {
        return prev.map((item) => (item.id === template.id ? template : item));
      }

      const nextId = Math.max(...prev.map((item) => item.id), 0) + 1;
      return [{ ...template, id: nextId }, ...prev];
    });
    closeDialog();
  };

  const toggleArchive = (id) => {
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "archive" ? "active" : "archive" }
          : item,
      ),
    );
  };

  const createCategory = () => {
    setCategoryDraft({
      id: null,
      name: "Новая категория",
      instruction: "<p>Добавьте подробную инструкцию для сотрудника.</p>",
    });
    setSection("categories");
  };

  const saveCategory = () => {
    if (!categoryDraft) {
      return;
    }

    if (categoryDraft.id) {
      setCategories((prev) =>
        prev.map((item) => (item.id === categoryDraft.id ? categoryDraft : item)),
      );
      return;
    }

    const nextId = Math.max(...categories.map((category) => category.id), 0) + 1;
    const nextCategory = { ...categoryDraft, id: nextId };

    setCategories((prev) => [...prev, nextCategory]);
    setSelectedCategoryId(nextId);
    setCategoryDraft(nextCategory);
  };

  const updateCategory = (category) => {
    setCategoryDraft(category);
  };

  const selectCategory = (id) => {
    setSelectedCategoryId(id);
    setCategoryDraft(categories.find((category) => category.id === id) || null);
  };

  const deleteCategory = (id) => {
    const nextCategory = categories.find((category) => category.id !== id);

    if (!nextCategory) {
      return;
    }

    setCategories((prev) => prev.filter((category) => category.id !== id));
    setTemplates((prev) =>
      prev.map((template) =>
        template.categoryId === id ? { ...template, categoryId: nextCategory.id } : template,
      ),
    );
    setSelectedCategoryId(nextCategory.id);
    setCategoryDraft(nextCategory);
    setDeleteCategoryId(null);
  };

  const deleteCategoryCandidate =
    categories.find((category) => category.id === deleteCategoryId) || null;
  const selectedCafe = locations.find((location) => location.id === selectedCafeId) || locations[0];
  const addableCafeCleanings = templates.filter(
    (template) => template.status === "active" && !template.locationIds.includes(selectedCafeId),
  );
  const removeCafeCleaningCandidate =
    templates.find((template) => template.id === removeCafeCleaningId) || null;

  const addCleaningToCafe = (id) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, locationIds: [...template.locationIds, selectedCafeId] }
          : template,
      ),
    );
  };

  const removeCleaningFromCafe = (id) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? {
              ...template,
              locationIds: template.locationIds.filter(
                (locationId) => locationId !== selectedCafeId,
              ),
            }
          : template,
      ),
    );
    setRemoveCafeCleaningId(null);
  };

  const updateControlStatus = (id, status) => {
    setControlItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              finishedAt:
                status === "active" || status === "in_progress" ? "" : item.finishedAt || "—",
            }
          : item,
      ),
    );
  };

  const deleteControlItem = (id) => {
    setControlItems((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmControlAction = () => {
    if (!controlAction) {
      return;
    }

    if (controlAction.type === "approve") {
      updateControlStatus(controlAction.id, "approved");
    }

    if (controlAction.type === "return") {
      updateControlStatus(controlAction.id, "in_progress");
    }

    if (controlAction.type === "delete") {
      deleteControlItem(controlAction.id);
    }

    setControlAction(null);
  };

  const controlActionCandidate = controlItems.find((item) => item.id === controlAction?.id) || null;
  const controlActionCleaningCandidate = controlActionCandidate
    ? templates.find((template) => template.id === controlActionCandidate.cleaningId)
    : null;
  const confirmPreparationAction = () => {
    if (!preparationAction) {
      return;
    }

    if (preparationAction.type === "approve") {
      setPreparationItems((prev) =>
        prev.map((item) =>
          item.id === preparationAction.id
            ? {
                ...item,
                status: "approved",
                confirmedAt: "2026-06-12 14:30:00",
                confirmer: "Винокуров М. Ю.",
              }
            : item,
        ),
      );
    }

    if (preparationAction.type === "delete") {
      setPreparationItems((prev) => prev.filter((item) => item.id !== preparationAction.id));
    }

    setPreparationAction(null);
  };
  const preparationActionCandidate =
    preparationItems.find((item) => item.id === preparationAction?.id) || null;
  const editingPreparationCandidate =
    preparationItems.find((item) => item.id === editingPreparationId) || null;

  const savePreparation = (preparation) => {
    setPreparationItems((prev) =>
      prev.map((item) => (item.id === preparation.id ? preparation : item)),
    );
    setEditingPreparationId(null);
  };

  const pageTitle =
    section === "categories"
      ? "Категории уборок"
      : section === "cafes"
        ? "Кафе"
        : section === "control"
          ? controlKind === "preparations"
            ? "Контроль - заготовки"
            : "Контроль - уборки"
          : "Уборки";
  const pageSubtitle =
    section === "categories"
      ? "Группируйте уборки по типу работ. В каждой категории — инструкция для сотрудника."
      : section === "cafes"
        ? "Просматривайте уборки, назначенные на выбранное кафе."
        : section === "control"
          ? "Подтверждайте выполненные уборки и заготовки."
          : "Создавайте и настраивайте уборки. Назначьте их на локации во вкладке «Кафе».";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <>
      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: 28, md: 32 } }}
              >
                {pageTitle}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{pageSubtitle}</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={section}
                sx={{
                  "& .MuiToggleButton-root": {
                    width: 92,
                    height: 40,
                    px: 0,
                    py: 0,
                    minHeight: 40,
                    lineHeight: "20px",
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                  },
                }}
              >
                {cleaningSectionTabs.map((tab) => (
                  <ToggleButton
                    key={tab.value}
                    component={Link}
                    href={tab.href}
                    value={tab.value}
                    onClick={() => setSection(tab.value)}
                  >
                    {tab.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: section === "templates" ? "inline-flex" : "none",
                }}
              >
                Новая уборка
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={createCategory}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: section === "categories" ? "inline-flex" : "none",
                }}
              >
                Новая категория
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddCafeDialogOpen(true)}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: section === "cafes" ? "inline-flex" : "none",
                }}
              >
                Добавить уборку
              </Button>
            </Box>
          </Box>
        </Grid>

        {section === "categories" ? (
          <Grid size={12}>
            <CleaningCategoriesView
              categories={categories}
              templates={templates}
              selectedCategoryId={selectedCategoryId}
              categoryQuery={categoryQuery}
              onCategoryQueryChange={setCategoryQuery}
              onSelectCategory={selectCategory}
              draftCategory={categoryDraft}
              onDraftCategoryChange={updateCategory}
              onSaveCategory={saveCategory}
              onDeleteCategory={setDeleteCategoryId}
            />
          </Grid>
        ) : null}

        {section === "cafes" ? (
          <Grid size={12}>
            <CafesView
              templates={templates}
              categories={categories}
              selectedCafeId={selectedCafeId}
              roleFilter={cafeRoleFilter}
              onCafeChange={setSelectedCafeId}
              onRoleFilterChange={setCafeRoleFilter}
              onRemoveCleaning={setRemoveCafeCleaningId}
            />
          </Grid>
        ) : null}

        {section === "control" ? (
          <Grid size={12}>
            <Box sx={{ display: "flex", mb: 1.5 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={controlKind}
                sx={{
                  "& .MuiToggleButton-root": {
                    minHeight: 38,
                    px: 2,
                    py: 0,
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 700,
                  },
                }}
              >
                {controlKindTabs.map((tab) => (
                  <ToggleButton
                    key={tab.value}
                    component={Link}
                    href={tab.href}
                    value={tab.value}
                    onClick={() => setControlKind(tab.value)}
                  >
                    {tab.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {controlKind === "cleanings" ? (
              <ControlView
                items={controlItems}
                templates={templates}
                filter={controlFilter}
                onFilterChange={setControlFilter}
                onApprove={(id) => setControlAction({ type: "approve", id })}
                onReturn={(id) => setControlAction({ type: "return", id })}
                onDelete={(id) => setControlAction({ type: "delete", id })}
              />
            ) : (
              <PreparationControlView
                items={preparationItems}
                onEdit={setEditingPreparationId}
                onApprove={(id) => setPreparationAction({ type: "approve", id })}
                onDelete={(id) => setPreparationAction({ type: "delete", id })}
              />
            )}
          </Grid>
        ) : null}

        {section === "templates" ? (
          <CleaningsListPage
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filteredTemplates={filteredTemplates}
            templates={templates}
            categories={categories}
            openEdit={openEdit}
            toggleArchive={toggleArchive}
            setHistoryItem={setHistoryItem}
          />
        ) : null}
      </Grid>

      <CleaningTemplateDialog
        open={dialogOpen}
        item={editingItem}
        categories={categories}
        onClose={closeDialog}
        onSave={saveTemplate}
      />

      <CleaningHistoryDialog
        open={Boolean(historyItem)}
        item={historyItem}
        categories={categories}
        onClose={() => setHistoryItem(null)}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteCategoryCandidate)}
        category={deleteCategoryCandidate}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={() => deleteCategory(deleteCategoryId)}
      />

      <AddCafeCleaningDialog
        open={addCafeDialogOpen}
        cafe={selectedCafe}
        items={addableCafeCleanings}
        categories={categories}
        query={addCafeQuery}
        onQueryChange={setAddCafeQuery}
        onClose={() => setAddCafeDialogOpen(false)}
        onAdd={addCleaningToCafe}
      />

      <RemoveCafeCleaningDialog
        open={Boolean(removeCafeCleaningCandidate)}
        cleaning={removeCafeCleaningCandidate}
        cafe={selectedCafe}
        onClose={() => setRemoveCafeCleaningId(null)}
        onConfirm={() => removeCleaningFromCafe(removeCafeCleaningId)}
      />

      <ControlActionConfirmDialog
        open={Boolean(controlActionCandidate)}
        action={controlAction}
        item={controlActionCandidate}
        cleaning={controlActionCleaningCandidate}
        onClose={() => setControlAction(null)}
        onConfirm={confirmControlAction}
      />

      <PreparationActionConfirmDialog
        open={Boolean(preparationActionCandidate)}
        action={preparationAction}
        item={preparationActionCandidate}
        onClose={() => setPreparationAction(null)}
        onConfirm={confirmPreparationAction}
      />

      <PreparationEditDialog
        open={Boolean(editingPreparationCandidate)}
        item={editingPreparationCandidate}
        onClose={() => setEditingPreparationId(null)}
        onSave={savePreparation}
      />
    </>
  );
}
