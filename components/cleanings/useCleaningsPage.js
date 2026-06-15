import { useCallback, useEffect, useMemo, useState } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import {
  getTodayDate,
  normalizeBootstrap,
  normalizeCategoriesResponse,
  normalizeCategoryPayload,
  normalizeCafesResponse,
  normalizeControlResponse,
  normalizeHistoryRows,
  normalizePreparationEditResponse,
  normalizeTemplatePayload,
  normalizeTemplatesResponse,
} from "./cleaningsNormalizers";
import useCleaningsApi from "./useCleaningsApi";
import { getCategoryName } from "./helpers";

const cleaningsSessionCache = {
  bootstrap: null,
  templates: null,
  categories: null,
  cafesByLocation: {},
  templateHistoryById: {},
  categoryHistoryById: {},
  controlByFilters: {},
  inFlightControlRequest: null,
  controlFilters: null,
  preparationFilters: null,
};

function getInitialLocationId(locations = []) {
  return locations[0]?.id ?? "";
}

function getCacheKey(value) {
  return value == null || value === "" ? "" : String(value);
}

export default function useCleaningsPage({
  initialSection = "templates",
  initialControlKind = "cleanings",
} = {}) {
  const cleaningsApi = useCleaningsApi();
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const cachedBootstrap = cleaningsSessionCache.bootstrap;
  const cachedLocations = cachedBootstrap?.locations || [];

  const [section, setSection] = useState(initialSection);
  const [controlKind, setControlKind] = useState(initialControlKind);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [controlLoading, setControlLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);

  const [moduleInfo, setModuleInfo] = useState(cachedBootstrap?.moduleInfo || {});
  const [templates, setTemplates] = useState(cleaningsSessionCache.templates || []);
  const [categories, setCategories] = useState(cleaningsSessionCache.categories || []);
  const [locations, setLocations] = useState(cachedLocations);
  const [roles, setRoles] = useState(cachedBootstrap?.roles || []);
  const [scheduleTypeOptions, setScheduleTypeOptions] = useState(
    cachedBootstrap?.scheduleTypeOptions || [],
  );
  const [additionTypeOptions, setAdditionTypeOptions] = useState(
    cachedBootstrap?.additionTypeOptions || [],
  );
  const [access, setAccess] = useState(cachedBootstrap?.access || {});

  const [controlItems, setControlItems] = useState([]);
  const [preparationItems, setPreparationItems] = useState([]);
  const [manualTemplates, setManualTemplates] = useState([]);
  const [controlPermissions, setControlPermissions] = useState({});

  const [cafeAssignedTemplates, setCafeAssignedTemplates] = useState([]);
  const [cafeAvailableTemplates, setCafeAvailableTemplates] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    cleaningsSessionCache.categories?.[0]?.id ?? "",
  );
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [controlFilter, setControlFilter] = useState("all");
  const [selectedCafeId, setSelectedCafeId] = useState(getInitialLocationId(cachedLocations));
  const [cafeRoleFilter, setCafeRoleFilter] = useState("all");
  const [addCafeRoleFilter, setAddCafeRoleFilter] = useState("all");
  const [addCafeQuery, setAddCafeQuery] = useState("");
  const [cafeDopTimeDrafts, setCafeDopTimeDrafts] = useState({});
  const [addManualQuery, setAddManualQuery] = useState("");
  const [controlCafeId, setControlCafeId] = useState(
    cleaningsSessionCache.controlFilters?.locationId ?? getInitialLocationId(cachedLocations),
  );
  const [preparationCafeId, setPreparationCafeId] = useState(
    cleaningsSessionCache.preparationFilters?.locationId ?? getInitialLocationId(cachedLocations),
  );

  const [controlDateFrom, setControlDateFrom] = useState(
    cleaningsSessionCache.controlFilters?.dateFrom ?? getTodayDate(),
  );
  const [controlDateTo, setControlDateTo] = useState(
    cleaningsSessionCache.controlFilters?.dateTo ?? getTodayDate(),
  );
  const [preparationDateFrom, setPreparationDateFrom] = useState(
    cleaningsSessionCache.preparationFilters?.dateFrom ?? getTodayDate(),
  );
  const [preparationDateTo, setPreparationDateTo] = useState(
    cleaningsSessionCache.preparationFilters?.dateTo ?? getTodayDate(),
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryHistoryRows, setCategoryHistoryRows] = useState([]);
  const [categoryHistoryLoading, setCategoryHistoryLoading] = useState(false);
  const [addCafeDialogOpen, setAddCafeDialogOpen] = useState(false);
  const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);
  const [removeCafeCleaningId, setRemoveCafeCleaningId] = useState(null);
  const [controlAction, setControlAction] = useState(null);
  const [preparationAction, setPreparationAction] = useState(null);
  const [editingPreparation, setEditingPreparation] = useState(null);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setControlKind(initialControlKind);
  }, [initialControlKind]);

  useEffect(() => {
    cleaningsSessionCache.controlFilters = {
      locationId: controlCafeId,
      dateFrom: controlDateFrom,
      dateTo: controlDateTo,
    };
  }, [controlCafeId, controlDateFrom, controlDateTo]);

  useEffect(() => {
    cleaningsSessionCache.preparationFilters = {
      locationId: preparationCafeId,
      dateFrom: preparationDateFrom,
      dateTo: preparationDateTo,
    };
  }, [preparationCafeId, preparationDateFrom, preparationDateTo]);

  const syncLocationFilters = useCallback((nextLocations) => {
    const fallbackLocationId = getInitialLocationId(nextLocations);

    setSelectedCafeId((prev) =>
      nextLocations.some((location) => location.id === prev) ? prev : fallbackLocationId,
    );
    setControlCafeId((prev) =>
      nextLocations.some((location) => location.id === prev) ? prev : fallbackLocationId,
    );
    setPreparationCafeId((prev) =>
      nextLocations.some((location) => location.id === prev) ? prev : fallbackLocationId,
    );
  }, []);

  const syncCategorySelection = useCallback((nextCategories) => {
    const fallbackCategoryId = nextCategories[0]?.id ?? "";

    setSelectedCategoryId((prev) => {
      const nextSelectedCategoryId = nextCategories.some((category) => category.id === prev)
        ? prev
        : fallbackCategoryId;

      setCategoryDraft((currentDraft) => {
        if (currentDraft && currentDraft.id == null) {
          return currentDraft;
        }

        return (
          nextCategories.find((category) => category.id === nextSelectedCategoryId) ||
          (nextSelectedCategoryId ? null : null)
        );
      });

      return nextSelectedCategoryId;
    });
  }, []);

  const applyBootstrap = useCallback(
    (payload) => {
      const normalized = normalizeBootstrap(payload);
      cleaningsSessionCache.bootstrap = normalized;

      setModuleInfo(normalized.moduleInfo);
      setLocations(normalized.locations);
      setRoles(normalized.roles);
      setScheduleTypeOptions(normalized.scheduleTypeOptions);
      setAdditionTypeOptions(normalized.additionTypeOptions);
      setAccess(normalized.access);
      syncLocationFilters(normalized.locations);
    },
    [syncLocationFilters],
  );

  const applyTemplates = useCallback((payload) => {
    const normalized = Array.isArray(payload) ? payload : normalizeTemplatesResponse(payload);
    cleaningsSessionCache.templates = normalized;
    setTemplates(normalized);
    return normalized;
  }, []);

  const applyCategories = useCallback(
    (payload) => {
      const normalized = Array.isArray(payload) ? payload : normalizeCategoriesResponse(payload);
      cleaningsSessionCache.categories = normalized;
      setCategories(normalized);
      syncCategorySelection(normalized);
      return normalized;
    },
    [syncCategorySelection],
  );

  const applyCafes = useCallback(
    (payload, requestedLocationId) => {
      const normalized = normalizeCafesResponse(payload);
      const nextLocationId =
        normalized.selectedLocationId ||
        requestedLocationId ||
        selectedCafeId ||
        getInitialLocationId(locations);
      const cacheKey = getCacheKey(nextLocationId);

      if (cacheKey) {
        cleaningsSessionCache.cafesByLocation[cacheKey] = normalized;
      }

      setSelectedCafeId(nextLocationId || "");
      setCafeAssignedTemplates(normalized.assignedTemplates);
      setCafeAvailableTemplates(normalized.availableTemplates);
      setCafeDopTimeDrafts({});

      return normalized;
    },
    [locations, selectedCafeId],
  );

  const loadBootstrap = useCallback(
    async ({ force = false } = {}) => {
      if (!force && cleaningsSessionCache.bootstrap) {
        applyBootstrap(cleaningsSessionCache.bootstrap);
        return cleaningsSessionCache.bootstrap;
      }

      setBootstrapLoading(true);
      try {
        const response = await cleaningsApi.getBootstrap();
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки модуля");
        }

        applyBootstrap(response);
        return cleaningsSessionCache.bootstrap;
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки модуля");
        return null;
      } finally {
        setBootstrapLoading(false);
      }
    },
    [applyBootstrap, cleaningsApi],
  );

  const loadTemplates = useCallback(
    async ({ force = false } = {}) => {
      if (!force && cleaningsSessionCache.templates) {
        return applyTemplates(cleaningsSessionCache.templates);
      }

      setBootstrapLoading(true);
      try {
        const response = await cleaningsApi.getTemplates();
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки уборок");
        }

        return applyTemplates(response);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки уборок");
        return [];
      } finally {
        setBootstrapLoading(false);
      }
    },
    [applyTemplates, cleaningsApi],
  );

  const loadCategories = useCallback(
    async ({ force = false } = {}) => {
      if (!force && cleaningsSessionCache.categories) {
        return applyCategories(cleaningsSessionCache.categories);
      }

      setBootstrapLoading(true);
      try {
        const response = await cleaningsApi.getCategories();
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки категорий");
        }

        return applyCategories(response);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки категорий");
        return [];
      } finally {
        setBootstrapLoading(false);
      }
    },
    [applyCategories, cleaningsApi],
  );

  const loadCafes = useCallback(
    async (locationId = null, { force = false } = {}) => {
      const fallbackLocationId =
        locationId ||
        selectedCafeId ||
        getInitialLocationId(locations) ||
        getInitialLocationId(cachedLocations);
      const cacheKey = getCacheKey(fallbackLocationId);

      if (!fallbackLocationId) {
        setCafeAssignedTemplates([]);
        setCafeAvailableTemplates([]);
        return null;
      }

      if (!force && cleaningsSessionCache.cafesByLocation[cacheKey]) {
        return applyCafes(cleaningsSessionCache.cafesByLocation[cacheKey], fallbackLocationId);
      }

      setBootstrapLoading(true);
      try {
        const response = await cleaningsApi.getCafes({ locationId: fallbackLocationId });
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки кафе");
        }

        return applyCafes(response, fallbackLocationId);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки кафе");
        return null;
      } finally {
        setBootstrapLoading(false);
      }
    },
    [applyCafes, cleaningsApi, locations, selectedCafeId, cachedLocations],
  );

  const loadControl = useCallback(
    async ({ force = false } = {}) => {
      if (section !== "control") {
        return;
      }

      const activeLocationId = controlKind === "preparations" ? preparationCafeId : controlCafeId;
      const activeDateFrom = controlKind === "preparations" ? preparationDateFrom : controlDateFrom;
      const activeDateTo = controlKind === "preparations" ? preparationDateTo : controlDateTo;

      if (!activeLocationId) {
        return;
      }

      const requestKey = [activeLocationId, activeDateFrom, activeDateTo].join(":");

      if (!force && cleaningsSessionCache.controlByFilters[requestKey]) {
        const normalized = cleaningsSessionCache.controlByFilters[requestKey];
        setControlItems(normalized.cleanings);
        setPreparationItems(normalized.preparations);
        setManualTemplates(normalized.manualTemplates);
        setControlPermissions(normalized.permissions);
        return normalized;
      }

      setControlLoading(true);
      try {
        let requestPromise = !force
          ? cleaningsSessionCache.inFlightControlRequest?.promise || null
          : null;

        if (
          force ||
          cleaningsSessionCache.inFlightControlRequest?.key !== requestKey ||
          !requestPromise
        ) {
          requestPromise = (async () => {
            const response = await cleaningsApi.getControl({
              locationId: activeLocationId,
              dateFrom: activeDateFrom,
              dateTo: activeDateTo,
            });
            if (!response?.st) {
              throw new Error(response?.text || "Ошибка загрузки данных контроля");
            }

            const normalized = normalizeControlResponse(response);
            cleaningsSessionCache.controlByFilters[requestKey] = normalized;
            return normalized;
          })();

          cleaningsSessionCache.inFlightControlRequest = {
            key: requestKey,
            promise: requestPromise,
          };
        }

        const normalized = await requestPromise;
        setControlItems(normalized.cleanings);
        setPreparationItems(normalized.preparations);
        setManualTemplates(normalized.manualTemplates);
        setControlPermissions(normalized.permissions);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки данных контроля");
      } finally {
        if (cleaningsSessionCache.inFlightControlRequest?.key === requestKey) {
          cleaningsSessionCache.inFlightControlRequest = null;
        }
        setControlLoading(false);
      }
    },
    [
      cleaningsApi,
      controlCafeId,
      controlDateFrom,
      controlDateTo,
      controlKind,
      preparationCafeId,
      preparationDateFrom,
      preparationDateTo,
      section,
    ],
  );

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    if (section === "templates") {
      loadTemplates();
      loadCategories();
      return;
    }

    if (section === "categories") {
      loadCategories();
      loadTemplates();
      return;
    }

    if (section === "cafes") {
      loadCategories();
    }
  }, [loadCategories, loadTemplates, section]);

  useEffect(() => {
    if (section === "cafes") {
      loadCafes(selectedCafeId);
    }
  }, [loadCafes, section, selectedCafeId]);

  useEffect(() => {
    if (section === "control" && addManualDialogOpen) {
      loadCategories();
    }
  }, [addManualDialogOpen, loadCategories, section]);

  useEffect(() => {
    loadControl();
  }, [loadControl]);

  const selectedCategory = useMemo(
    () =>
      categoryDraft || categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, categoryDraft, selectedCategoryId],
  );

  const accessApi = useMemo(() => handleUserAccess(access), [access]);
  const canView = useCallback((key) => accessApi.userCan("view", key), [accessApi]);
  const canEdit = useCallback((key) => accessApi.userCan("edit", key), [accessApi]);
  const canAccess = useCallback((key) => accessApi.userCan("access", key), [accessApi]);

  useEffect(() => {
    if (section !== "categories" || !selectedCategory?.id) {
      setCategoryHistoryLoading(false);
      setCategoryHistoryRows([]);
      return;
    }

    const cacheKey = getCacheKey(selectedCategory.id);
    if (cleaningsSessionCache.categoryHistoryById[cacheKey]) {
      setCategoryHistoryRows(cleaningsSessionCache.categoryHistoryById[cacheKey]);
      setCategoryHistoryLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setCategoryHistoryLoading(true);
      try {
        const response = await cleaningsApi.getCategoryHistory(selectedCategory.id);
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки истории");
        }

        const normalizedRows = normalizeHistoryRows(response, {
          categories,
          roles,
          locations,
          scheduleTypeOptions,
          additionTypeOptions,
        });
        cleaningsSessionCache.categoryHistoryById[cacheKey] = normalizedRows;

        if (!cancelled) {
          setCategoryHistoryRows(normalizedRows);
        }
      } catch (error) {
        if (!cancelled) {
          setCategoryHistoryRows([]);
          showAlert(error?.message || "Ошибка загрузки истории");
        }
      } finally {
        if (!cancelled) {
          setCategoryHistoryLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    additionTypeOptions,
    categories,
    cleaningsApi,
    locations,
    roles,
    scheduleTypeOptions,
    section,
    selectedCategory?.id,
  ]);

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

  const selectedCafe =
    locations.find((location) => location.id === selectedCafeId) || locations[0] || null;
  const removeCafeCleaningCandidate =
    cafeAssignedTemplates.find((template) => template.id === removeCafeCleaningId) || null;
  const deleteCategoryCandidate =
    categories.find((category) => category.id === deleteCategoryId) || null;
  const deleteCategoryTemplates = deleteCategoryCandidate
    ? templates.filter((template) => template.categoryId === deleteCategoryCandidate.id)
    : [];
  const controlActionCandidate = controlItems.find((item) => item.id === controlAction?.id) || null;
  const controlActionCleaningCandidate = controlActionCandidate
    ? templates.find((template) => template.id === controlActionCandidate.cleaningId) || {
        name: controlActionCandidate.name || "Уборка",
      }
    : null;
  const preparationActionCandidate =
    preparationItems.find((item) => item.id === preparationAction?.id) || null;
  const addableCafeCleanings = cafeAvailableTemplates.filter(
    (template) => template.status === "active",
  );

  const runMutation = useCallback(async (callback, successMessage) => {
    setMutationLoading(true);
    try {
      const response = await callback();
      if (!response?.st) {
        throw new Error(response?.text || "Ошибка сохранения");
      }

      if (successMessage || response?.text) {
        showAlert(successMessage || response?.text, true);
      }

      return response;
    } catch (error) {
      showAlert(error?.message || "Ошибка сохранения");
      throw error;
    } finally {
      setMutationLoading(false);
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
  }, []);

  const saveTemplate = useCallback(
    async (template) => {
      const payload = normalizeTemplatePayload(template);

      await runMutation(async () => {
        const response = template.id
          ? await cleaningsApi.updateTemplate(template.id, payload)
          : await cleaningsApi.createTemplate(payload);

        await loadTemplates({ force: true });
        await loadCategories({ force: true });
        if (section === "cafes" && selectedCafeId) {
          await loadCafes(selectedCafeId, { force: true });
        }
        return response;
      });

      closeDialog();
    },
    [
      cleaningsApi,
      closeDialog,
      loadCafes,
      loadCategories,
      loadTemplates,
      runMutation,
      section,
      selectedCafeId,
    ],
  );

  const toggleArchive = useCallback(
    async (id) => {
      const template = templates.find((item) => item.id === id);
      if (!template) {
        return;
      }

      const nextStatus = template.status === "archive" ? "active" : "archive";

      await runMutation(async () => {
        const response = await cleaningsApi.updateTemplateStatus(id, nextStatus);
        await loadTemplates({ force: true });
        if (section === "cafes" && selectedCafeId) {
          await loadCafes(selectedCafeId, { force: true });
        }
        return response;
      });
    },
    [cleaningsApi, loadCafes, loadTemplates, runMutation, section, selectedCafeId, templates],
  );

  const removeTemplate = useCallback(
    async (id) => {
      await runMutation(async () => {
        const response = await cleaningsApi.deleteTemplate(id);
        await loadTemplates({ force: true });
        await loadCategories({ force: true });
        if (section === "cafes" && selectedCafeId) {
          await loadCafes(selectedCafeId, { force: true });
        }
        return response;
      });
    },
    [cleaningsApi, loadCafes, loadCategories, loadTemplates, runMutation, section, selectedCafeId],
  );

  const createCategory = useCallback(() => {
    setCategoryDraft({
      id: null,
      name: "",
      instruction: "",
      templatesCount: 0,
      deletable: true,
    });
    setSection("categories");
  }, []);

  const saveCategory = useCallback(async () => {
    if (!categoryDraft) {
      return;
    }

    const payload = normalizeCategoryPayload(categoryDraft);

    const response = await runMutation(async () => {
      const result = categoryDraft.id
        ? await cleaningsApi.updateCategory(categoryDraft.id, payload)
        : await cleaningsApi.createCategory(payload);

      await loadCategories({ force: true });
      return result;
    });

    setCategoryDraft(null);
    const createdCategoryId = response?.data?.category?.id ?? response?.category?.id;
    if (!categoryDraft.id && createdCategoryId != null) {
      setSelectedCategoryId(createdCategoryId);
    }
  }, [categoryDraft, cleaningsApi, loadCategories, runMutation]);

  const updateCategoryDraft = useCallback((nextValue) => {
    if (!nextValue) {
      return;
    }

    if (typeof nextValue === "function") {
      setCategoryDraft((prev) => nextValue(prev));
      return;
    }

    setCategoryDraft(nextValue);
  }, []);

  const selectCategory = useCallback(
    (id) => {
      setSelectedCategoryId(id);
      setCategoryDraft(categories.find((category) => category.id === id) || null);
    },
    [categories],
  );

  const deleteCategory = useCallback(async () => {
    if (!deleteCategoryId) {
      return;
    }

    await runMutation(async () => {
      const response = await cleaningsApi.deleteCategory(deleteCategoryId);
      await loadCategories({ force: true });
      return response;
    });

    setDeleteCategoryId(null);
  }, [cleaningsApi, deleteCategoryId, loadCategories, runMutation]);

  const openTemplateHistory = useCallback(
    async (item) => {
      setHistoryItem(item);
      setHistoryRows([]);
      setHistoryLoading(true);

      const cacheKey = getCacheKey(item?.id);
      if (cacheKey && cleaningsSessionCache.templateHistoryById[cacheKey]) {
        setHistoryRows(cleaningsSessionCache.templateHistoryById[cacheKey]);
        setHistoryLoading(false);
        return;
      }

      try {
        const response = await cleaningsApi.getTemplateHistory(item.id);
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки истории");
        }

        const normalizedRows = normalizeHistoryRows(response, {
          categories,
          roles,
          locations,
          scheduleTypeOptions,
          additionTypeOptions,
        });
        if (cacheKey) {
          cleaningsSessionCache.templateHistoryById[cacheKey] = normalizedRows;
        }
        setHistoryRows(normalizedRows);
      } catch (error) {
        setHistoryRows([]);
        showAlert(error?.message || "Ошибка загрузки истории");
      } finally {
        setHistoryLoading(false);
      }
    },
    [additionTypeOptions, categories, cleaningsApi, locations, roles, scheduleTypeOptions],
  );

  const closeTemplateHistory = useCallback(() => {
    setHistoryItem(null);
    setHistoryRows([]);
    setHistoryLoading(false);
  }, []);

  const addCleaningToCafe = useCallback(
    async (templateId) => {
      if (!selectedCafeId) {
        return;
      }

      await runMutation(async () => {
        const response = await cleaningsApi.assignTemplateToCafe(selectedCafeId, templateId);
        await loadCafes(selectedCafeId, { force: true });
        await loadTemplates({ force: true });
        return response;
      });

      setAddCafeDialogOpen(false);
      setAddCafeQuery("");
    },
    [cleaningsApi, loadCafes, loadTemplates, runMutation, selectedCafeId],
  );

  const setCafeDopTimeDraft = useCallback(
    (templateId, value) => {
      const normalizedValue = value === "" ? "" : value.replace(/\D/g, "");

      setCafeDopTimeDrafts((prev) => {
        const template = cafeAssignedTemplates.find((item) => item.id === templateId);
        const currentValue = String(template?.dopTime ?? template?.extraTime ?? 0);
        const nextValue = normalizedValue === "" ? "0" : normalizedValue;

        if (nextValue === currentValue) {
          if (!Object.prototype.hasOwnProperty.call(prev, templateId)) {
            return prev;
          }

          const nextDrafts = { ...prev };
          delete nextDrafts[templateId];
          return nextDrafts;
        }

        return {
          ...prev,
          [templateId]: normalizedValue,
        };
      });
    },
    [cafeAssignedTemplates],
  );

  const removeCleaningFromCafe = useCallback(async () => {
    if (!selectedCafeId || !removeCafeCleaningId) {
      return;
    }

    await runMutation(async () => {
      const response = await cleaningsApi.removeTemplateFromCafe(
        selectedCafeId,
        removeCafeCleaningId,
      );
      await loadCafes(selectedCafeId, { force: true });
      await loadTemplates({ force: true });
      return response;
    });

    setRemoveCafeCleaningId(null);
  }, [cleaningsApi, loadCafes, loadTemplates, removeCafeCleaningId, runMutation, selectedCafeId]);

  const saveCafeDopTimes = useCallback(async () => {
    if (!selectedCafeId || Object.keys(cafeDopTimeDrafts).length === 0) {
      return;
    }

    await runMutation(async () => {
      const items = Object.entries(cafeDopTimeDrafts).map(([id, value]) => ({
        id: Number(id),
        dop_time: value === "" ? 0 : Number(value),
      }));
      const response = await cleaningsApi.saveCafeAssignments({
        locationId: selectedCafeId,
        items,
      });
      await loadCafes(selectedCafeId, { force: true });
      return response;
    });
  }, [cafeDopTimeDrafts, cleaningsApi, loadCafes, runMutation, selectedCafeId]);

  const addManualCleaning = useCallback(
    async (templateId) => {
      if (!controlCafeId) {
        return;
      }

      await runMutation(async () => {
        const response = await cleaningsApi.addManualCleaning({
          templateId,
          locationId: controlCafeId,
          date: controlDateFrom || getTodayDate(),
        });
        await loadControl({ force: true });
        return response;
      });

      setAddManualDialogOpen(false);
      setAddManualQuery("");
    },
    [cleaningsApi, controlCafeId, controlDateFrom, loadControl, runMutation],
  );

  const confirmControlAction = useCallback(async () => {
    if (!controlAction) {
      return;
    }

    const actions = {
      approve: () => cleaningsApi.approveControlCleaning(controlAction.id),
      return: () => cleaningsApi.returnControlCleaning(controlAction.id),
      detach: () => cleaningsApi.detachControlCleaning(controlAction.id),
      delete: () => cleaningsApi.deleteControlCleaning(controlAction.id, ""),
    };

    const actionRunner = actions[controlAction.type];
    if (!actionRunner) {
      return;
    }

    await runMutation(async () => {
      const response = await actionRunner();
      await loadControl({ force: true });
      return response;
    });

    setControlAction(null);
  }, [cleaningsApi, controlAction, loadControl, runMutation]);

  const confirmPreparationAction = useCallback(async () => {
    if (!preparationAction) {
      return;
    }

    const actions = {
      approve: () => cleaningsApi.approvePreparation(preparationAction.id),
      delete: () => cleaningsApi.deletePreparation(preparationAction.id, ""),
    };

    const actionRunner = actions[preparationAction.type];
    if (!actionRunner) {
      return;
    }

    await runMutation(async () => {
      const response = await actionRunner();
      await loadControl({ force: true });
      return response;
    });

    setPreparationAction(null);
  }, [cleaningsApi, loadControl, preparationAction, runMutation]);

  const openPreparationEdit = useCallback(
    async (id) => {
      const item = preparationItems.find((preparationItem) => preparationItem.id === id);
      const location =
        locations.find((locationItem) => locationItem.id === item?.locationId) ||
        locations.find((locationItem) => locationItem.id === preparationCafeId);

      if (!item || !location) {
        showAlert("Не удалось загрузить данные заготовки");
        return;
      }

      setMutationLoading(true);

      try {
        const response = await cleaningsApi.getPreparationEditContext({
          point_id: {
            id: location.id,
            base: location.base,
            name: location.name,
          },
          id,
        });

        setEditingPreparation(normalizePreparationEditResponse(response));
      } catch (error) {
        showAlert(error?.message || "Не удалось загрузить данные заготовки");
      } finally {
        setMutationLoading(false);
      }
    },
    [cleaningsApi, locations, preparationCafeId, preparationItems, showAlert],
  );

  const savePreparation = useCallback(
    async (preparation) => {
      const location = locations.find((locationItem) => locationItem.id === preparation.locationId);

      if (!location) {
        showAlert("Не удалось определить кафе");
        return;
      }

      await runMutation(async () => {
        const response = await cleaningsApi.savePreparationEdit({
          point_id: {
            id: location.id,
            base: location.base,
            name: location.name,
          },
          id: preparation.id,
          count_pf: preparation.volume,
          count_trash: preparation.waste,
        });
        await loadControl({ force: true });
        return response;
      });

      setEditingPreparation(null);
    },
    [cleaningsApi, loadControl, locations, runMutation, showAlert],
  );

  const pageTitle =
    section === "categories"
      ? "Категории уборок"
      : section === "cafes"
        ? "Кафе"
        : section === "control"
          ? controlKind === "preparations"
            ? "Контроль - заготовки"
            : "Контроль - уборки"
          : moduleInfo?.name || "Уборки";
  const pageSubtitle =
    section === "categories"
      ? "Группируйте уборки по типу работ. В каждой категории — инструкция для сотрудника."
      : section === "cafes"
        ? "Просматривайте уборки, назначенные на выбранное кафе."
        : section === "control"
          ? "Подтверждайте выполненные уборки и заготовки."
          : "Создавайте и настраивайте уборки. Назначьте их на локации во вкладке «Кафе».";

  return {
    access,
    addCafeDialogOpen,
    addCafeQuery,
    addCafeRoleFilter,
    addManualDialogOpen,
    addManualQuery,
    additionTypeOptions,
    alertMessage,
    alertStatus,
    bootstrapLoading,
    cafeAssignedTemplates,
    cafeAvailableTemplates,
    cafeRoleFilter,
    categories,
    categoryDraft,
    categoryHistoryLoading,
    categoryHistoryRows,
    categoryQuery,
    closeAlert,
    closeDialog,
    closeTemplateHistory,
    confirmControlAction,
    confirmPreparationAction,
    controlAction,
    controlActionCandidate,
    controlActionCleaningCandidate,
    controlCafeId,
    controlDateFrom,
    controlDateTo,
    controlFilter,
    controlItems,
    controlKind,
    controlLoading,
    deleteCategory,
    deleteCategoryCandidate,
    deleteCategoryId,
    deleteCategoryTemplates,
    dialogOpen,
    editingItem,
    editingPreparation,
    filteredTemplates,
    filter,
    historyItem,
    historyLoading,
    historyRows,
    initialSection,
    isAlert,
    loading: bootstrapLoading || mutationLoading,
    locations,
    manualTemplates,
    mutationLoading,
    openCreate,
    openEdit,
    openPreparationEdit,
    openTemplateHistory,
    pageSubtitle,
    pageTitle,
    preparationAction,
    preparationActionCandidate,
    preparationCafeId,
    preparationDateFrom,
    preparationDateTo,
    preparationItems,
    query,
    removeCafeCleaningCandidate,
    roles,
    saveCategory,
    savePreparation,
    saveTemplate,
    scheduleTypeOptions,
    section,
    selectedCafe,
    selectedCafeId,
    selectedCategoryId,
    setAddCafeDialogOpen,
    setAddCafeQuery,
    setAddCafeRoleFilter,
    setAddManualDialogOpen,
    setAddManualQuery,
    setCategoryQuery,
    setControlAction,
    setControlCafeId,
    setControlDateFrom,
    setControlDateTo,
    setControlFilter,
    setControlKind,
    setDeleteCategoryId,
    setEditingPreparation,
    setFilter,
    setPreparationAction,
    setPreparationCafeId,
    setPreparationDateFrom,
    setPreparationDateTo,
    setQuery,
    setRemoveCafeCleaningId,
    setSection,
    setSelectedCafeId,
    setCategoryDraft: updateCategoryDraft,
    setCafeRoleFilter,
    setSelectedCategoryId,
    selectCategory,
    selectedCategory,
    canAccess,
    canEdit,
    canView,
    cafeDopTimeDrafts,
    showAlert,
    syncLocationFilters,
    templates,
    toggleArchive,
    removeTemplate,
    updateCategoryDraft,
    createCategory,
    addableCafeCleanings,
    addCleaningToCafe,
    removeCleaningFromCafe,
    saveCafeDopTimes,
    setCafeDopTimeDraft,
    addManualCleaning,
    controlPermissions,
  };
}
