"use client";

import { useEffect, useRef } from "react";

import { Backdrop, Box, CircularProgress, Container, Tab, Tabs, Typography } from "@mui/material";

import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

import CategoryActionsSheet from "./CategoryActionsSheet";
import CloseBuyHistory from "./CloseBuyHistory";
import CloseBuyManagement from "./CloseBuyManagement";
import CloseConfirmationSheet from "./CloseConfirmationSheet";
import { CLOSE_BUY_TABS } from "./closeBuyUtils";
import useCloseBuyApi from "./useCloseBuyApi";
import { useCloseBuyStore } from "./useCloseBuyStore";

export default function CloseBuyPage() {
  const moduleName = useCloseBuyStore((state) => state.moduleName);
  const points = useCloseBuyStore((state) => state.points);
  const selectedPointId = useCloseBuyStore((state) => state.selectedPointId);
  const activeTab = useCloseBuyStore((state) => state.activeTab);
  const search = useCloseBuyStore((state) => state.search);
  const statusFilter = useCloseBuyStore((state) => state.statusFilter);
  const categories = useCloseBuyStore((state) => state.categories);
  const summary = useCloseBuyStore((state) => state.summary);
  const history = useCloseBuyStore((state) => state.history);
  const historyPagination = useCloseBuyStore((state) => state.historyPagination);
  const historyFilters = useCloseBuyStore((state) => state.historyFilters);
  const loading = useCloseBuyStore((state) => state.loading);
  const errors = useCloseBuyStore((state) => state.errors);
  const sheets = useCloseBuyStore((state) => state.sheets);
  const successMessage = useCloseBuyStore((state) => state.successMessage);

  const changePoint = useCloseBuyStore((state) => state.changePoint);
  const saveItem = useCloseBuyStore((state) => state.saveItem);
  const saveCategory = useCloseBuyStore((state) => state.saveCategory);
  const setActiveTab = useCloseBuyStore((state) => state.setActiveTab);
  const setSearch = useCloseBuyStore((state) => state.setSearch);
  const setStatusFilter = useCloseBuyStore((state) => state.setStatusFilter);
  const setSelectedCategoryId = useCloseBuyStore((state) => state.setSelectedCategoryId);
  const setHistoryFilters = useCloseBuyStore((state) => state.setHistoryFilters);
  const setHistoryPage = useCloseBuyStore((state) => state.setHistoryPage);
  const openCategoryActions = useCloseBuyStore((state) => state.openCategoryActions);
  const closeCategoryActions = useCloseBuyStore((state) => state.closeCategoryActions);
  const openCloseConfirmation = useCloseBuyStore((state) => state.openCloseConfirmation);
  const closeCloseConfirmation = useCloseBuyStore((state) => state.closeCloseConfirmation);
  const clearSuccessMessage = useCloseBuyStore((state) => state.clearSuccessMessage);
  const getSelectedCategory = useCloseBuyStore((state) => state.getSelectedCategory);
  const getVisibleCategoryItems = useCloseBuyStore((state) => state.getVisibleCategoryItems);

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const api = useCloseBuyApi();
  const showAlertRef = useRef(showAlert);
  const shownErrorsRef = useRef({
    bootstrap: "",
    management: "",
    history: "",
  });

  showAlertRef.current = showAlert;

  const selectedCategory = getSelectedCategory();
  const visibleCategoryItems = getVisibleCategoryItems();
  const actionsCategory =
    categories.find((category) => category.id === sheets.categoryActions.categoryId) || null;
  const confirmCategory =
    categories.find((category) => category.id === sheets.closeConfirmation.categoryId) || null;

  useEffect(() => {
    useCloseBuyStore.getState().bootstrap(api);
  }, [api]);

  useEffect(() => {
    if (successMessage) {
      showAlertRef.current(successMessage, true);
      clearSuccessMessage();
    }
  }, [clearSuccessMessage, successMessage]);

  useEffect(() => {
    if (errors.bootstrap && shownErrorsRef.current.bootstrap !== errors.bootstrap) {
      showAlertRef.current(errors.bootstrap, false);
    }
    shownErrorsRef.current.bootstrap = errors.bootstrap;
  }, [errors.bootstrap]);

  useEffect(() => {
    if (errors.management && shownErrorsRef.current.management !== errors.management) {
      showAlertRef.current(errors.management, false);
    }
    shownErrorsRef.current.management = errors.management;
  }, [errors.management]);

  useEffect(() => {
    if (errors.history && shownErrorsRef.current.history !== errors.history) {
      showAlertRef.current(errors.history, false);
    }
    shownErrorsRef.current.history = errors.history;
  }, [errors.history]);

  useEffect(() => {
    if (activeTab === CLOSE_BUY_TABS.history && selectedPointId) {
      useCloseBuyStore.getState().loadHistory(api);
    }
  }, [
    activeTab,
    api,
    selectedPointId,
    historyFilters.category_id,
    historyFilters.date_from,
    historyFilters.date_to,
    historyPagination.page,
    historyPagination.per_page,
  ]);

  useEffect(() => {
    if (!selectedPointId || activeTab !== CLOSE_BUY_TABS.management) return undefined;

    const timeoutId = window.setTimeout(() => {
      useCloseBuyStore.getState().loadManagement(api, { resetSelection: false });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, api, search, selectedPointId, statusFilter]);

  const handleCategoryAction = (category) => {
    if (category.status === "mixed") {
      openCategoryActions(category.id);
      return;
    }

    if (category.status === "open") {
      openCloseConfirmation(category.id, 0);
      return;
    }

    saveCategory({ categoryId: category.id, isActive: 1 }, api);
  };

  const handlePointChange = async (event) => {
    await changePoint(event.target.value);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleRetryManagement = async () => {
    await useCloseBuyStore.getState().loadManagement(api, { resetSelection: false });
  };

  const handleRetryHistory = async () => {
    await useCloseBuyStore.getState().loadHistory(api);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleOpenAll = async () => {
    if (!actionsCategory) return;
    await saveCategory({ categoryId: actionsCategory.id, isActive: 1 }, api);
  };

  const handleCloseAll = () => {
    if (!actionsCategory) return;
    closeCategoryActions();
    openCloseConfirmation(actionsCategory.id, 0);
  };

  const handleConfirmClose = async () => {
    if (!confirmCategory) return;
    await saveCategory({ categoryId: confirmCategory.id, isActive: 0 }, api);
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 5 }}
        open={loading.bootstrap}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <CategoryActionsSheet
        open={sheets.categoryActions.open}
        category={actionsCategory}
        pending={loading.categorySaveId === actionsCategory?.id}
        onClose={closeCategoryActions}
        onOpenAll={handleOpenAll}
        onCloseAll={handleCloseAll}
      />

      <CloseConfirmationSheet
        open={sheets.closeConfirmation.open}
        category={confirmCategory}
        pending={loading.categorySaveId === confirmCategory?.id}
        onClose={closeCloseConfirmation}
        onConfirm={handleConfirmClose}
      />

      <Container
        maxWidth="xl"
        sx={{ py: 3 }}
      >
        <Box className="container_first_child">
          <Typography
            variant="h4"
            sx={{ mb: 3, fontWeight: 700 }}
          >
            {moduleName}
          </Typography>

          {errors.bootstrap ? null : (
            <>
              <Tabs
                value={activeTab}
                onChange={(_, nextTab) => setActiveTab(nextTab)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 3,
                  "& .Mui-selected": { color: "#c03 !important" },
                  "& .MuiTabs-indicator": { bgcolor: "#c03" },
                }}
              >
                <Tab
                  value={CLOSE_BUY_TABS.management}
                  label="Управление"
                />
                <Tab
                  value={CLOSE_BUY_TABS.history}
                  label="История"
                />
              </Tabs>

              {activeTab === CLOSE_BUY_TABS.management ? (
                <CloseBuyManagement
                  points={points}
                  selectedPointId={selectedPointId}
                  search={search}
                  statusFilter={statusFilter}
                  summary={summary}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  visibleCategoryItems={visibleCategoryItems}
                  loading={loading.management}
                  pendingItemId={loading.itemSaveId}
                  pendingCategoryId={loading.categorySaveId}
                  onPointChange={handlePointChange}
                  onSearchChange={handleSearchChange}
                  onStatusFilterChange={handleStatusFilterChange}
                  onSelectCategory={setSelectedCategoryId}
                  onRetry={handleRetryManagement}
                  onCategoryAction={handleCategoryAction}
                  onToggleItem={(payload) => saveItem(payload, api)}
                />
              ) : (
                <CloseBuyHistory
                  categories={categories}
                  filters={historyFilters}
                  pagination={historyPagination}
                  history={history}
                  loading={loading.history}
                  onFiltersChange={setHistoryFilters}
                  onPageChange={setHistoryPage}
                />
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
