import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import {
  getTodayDate,
  normalizeBootstrap,
  normalizeCategoriesResponse,
  normalizeCategoryPayload,
  normalizeCafesResponse,
  normalizeControlResponse,
  normalizeHistoryResponse,
  normalizePreparationEditResponse,
  normalizeTemplatePayload,
  normalizeTemplatesResponse,
} from "./cleaningsNormalizers";
import useCleaningsApi from "./useCleaningsApi";
import { CLEANINGS_MODULE_NAME } from "./constants";
import {
  getCategoryName,
  getCategoryTemplateIds,
  getSavedDopTime,
  getVisibleControlKindTabs,
  getVisibleSectionTabs,
  isSameId,
  isSameIdSet,
  resolveCleaningsRoute,
} from "./helpers";
import {
  presentCategoryHistory,
  presentTemplateHistory,
} from "./cleaningsHistoryPresenter.mjs";
import { getRichTextBaseline, isRichTextChanged, settleRichTextBaseline } from "./richText.mjs";
import { useBeforeUnloadGuard } from "./shared";

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

// Control responses embed template/cafe data (incl. manualTemplates).
function invalidateControlCache() {
  cleaningsSessionCache.controlByFilters = {};
}

// Saving a template or a вид уборки also writes events of related templates and categories.
function invalidateHistoryCache() {
  cleaningsSessionCache.templateHistoryById = {};
  cleaningsSessionCache.categoryHistoryById = {};
}

const NEW_CATEGORY_KEY = "new";
const EMPTY_CATEGORY_CHANGES = {};
const EMPTY_CATEGORY = {
  id: null,
  name: "",
  instruction: "",
  templatesCount: 0,
  deletable: true,
};

// Dop. time drafts are numbers or "" (an emptied input, saved as 0).
function isSavedDopTime(draftValue, template) {
  const draftMinutes = draftValue === "" || draftValue == null ? 0 : Number(draftValue);

  return draftMinutes === Number(getSavedDopTime(template));
}

// Keeps unsaved dop. time edits of templates that are still assigned and still differ from the stored value.
function pickPendingDopTimeDrafts(drafts, assignedTemplates) {
  return Object.fromEntries(
    Object.entries(drafts).filter(([templateId, value]) => {
      const template = assignedTemplates.find((item) => isSameId(item.id, templateId));
      return template && !isSavedDopTime(value, template);
    }),
  );
}

// `requestedPath` / `requestedKind` are raw URL segments; the active section is resolved against access.
// `confirmDiscardChanges` resolves to true when the user agrees to drop unsaved changes.
export default function useCleaningsPage({
  requestedPath = null,
  requestedKind = null,
  routeReady = false,
  confirmDiscardChanges = null,
} = {}) {
  const cleaningsApi = useCleaningsApi();
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const cachedBootstrap = cleaningsSessionCache.bootstrap;
  const cachedLocations = cachedBootstrap?.locations || [];

  const [bootstrapReady, setBootstrapReady] = useState(Boolean(cachedBootstrap));
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [controlLoading, setControlLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);

  const [moduleInfo, setModuleInfo] = useState(cachedBootstrap?.moduleInfo || {});
  const [templates, setTemplates] = useState(cleaningsSessionCache.templates || []);
  const [categories, setCategories] = useState(cleaningsSessionCache.categories || []);
  const [locations, setLocations] = useState(cachedLocations);
  const [cities, setCities] = useState(cachedBootstrap?.cities || []);
  const [roles, setRoles] = useState(cachedBootstrap?.roles || []);
  const [scheduleTypeOptions, setScheduleTypeOptions] = useState(
    cachedBootstrap?.scheduleTypeOptions || [],
  );
  const [additionTypeOptions, setAdditionTypeOptions] = useState(
    cachedBootstrap?.additionTypeOptions || [],
  );
  const [access, setAccess] = useState(cachedBootstrap?.access || {});

  const accessApi = useMemo(() => handleUserAccess(access), [access]);
  const canView = useCallback((key) => accessApi.userCan("view", key), [accessApi]);
  const canEdit = useCallback((key) => accessApi.userCan("edit", key), [accessApi]);
  const canAccess = useCallback((key) => accessApi.userCan("access", key), [accessApi]);

  const sectionTabs = useMemo(() => getVisibleSectionTabs(canView), [canView]);
  const controlKindTabs = useMemo(() => getVisibleControlKindTabs(canView), [canView]);
  const route = useMemo(
    () =>
      bootstrapReady && routeReady
        ? resolveCleaningsRoute([requestedPath, requestedKind], canView)
        : null,
    [bootstrapReady, canView, requestedKind, requestedPath, routeReady],
  );
  const section = route?.section ?? null;
  const controlKind = route?.controlKind ?? null;

  const [controlItems, setControlItems] = useState([]);
  const [preparationItems, setPreparationItems] = useState([]);
  const [manualTemplates, setManualTemplates] = useState([]);
  const [manualTemplatesSupported, setManualTemplatesSupported] = useState(true);
  const [controlPermissions, setControlPermissions] = useState({});

  const [cafeAssignedTemplates, setCafeAssignedTemplates] = useState([]);
  const [cafeAvailableTemplates, setCafeAvailableTemplates] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    cleaningsSessionCache.categories?.[0]?.id ?? "",
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  // Unsaved card fields, bound to the category they were made for (`key`).
  const [categoryDraft, setCategoryDraft] = useState(null);
  // Editor re-serialization of the stored instruction (`settleRichTextBaseline`); outlives draft discards.
  const [instructionBaseline, setInstructionBaseline] = useState(null);
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
  const [templateHistoryRawRows, setTemplateHistoryRawRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryHistoryRawRows, setCategoryHistoryRawRows] = useState([]);
  const [categoryHistoryLoading, setCategoryHistoryLoading] = useState(false);
  const [categoryHistoryVersion, setCategoryHistoryVersion] = useState(0);
  const [addCafeDialogOpen, setAddCafeDialogOpen] = useState(false);
  const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);
  const [removeCafeCleaningId, setRemoveCafeCleaningId] = useState(null);
  const [archiveToggleId, setArchiveToggleId] = useState(null);
  const [controlAction, setControlAction] = useState(null);
  const [preparationAction, setPreparationAction] = useState(null);
  const [editingPreparation, setEditingPreparation] = useState(null);
  const cafeDraftsLocationRef = useRef(null);

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

  // A reload keeps unsaved card changes: they are bound to their category and re-applied on fresh data.
  const syncCategorySelection = useCallback((nextCategories) => {
    setSelectedCategoryId((prev) =>
      nextCategories.some((category) => category.id === prev) ? prev : (nextCategories[0]?.id ?? ""),
    );
  }, []);

  const applyBootstrap = useCallback(
    (payload) => {
      const normalized = normalizeBootstrap(payload);
      cleaningsSessionCache.bootstrap = normalized;

      setModuleInfo(normalized.moduleInfo);
      setLocations(normalized.locations);
      setCities(normalized.cities);
      setRoles(normalized.roles);
      setScheduleTypeOptions(normalized.scheduleTypeOptions);
      setAdditionTypeOptions(normalized.additionTypeOptions);
      setAccess(normalized.access);
      syncLocationFilters(normalized.locations);
      setBootstrapReady(true);
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

      const isSameLocation =
        getCacheKey(cafeDraftsLocationRef.current) === getCacheKey(nextLocationId);
      cafeDraftsLocationRef.current = nextLocationId;

      setSelectedCafeId(nextLocationId || "");
      setCafeAssignedTemplates(normalized.assignedTemplates);
      setCafeAvailableTemplates(normalized.availableTemplates);
      setCafeDopTimeDrafts((prev) =>
        isSameLocation ? pickPendingDopTimeDrafts(prev, normalized.assignedTemplates) : {},
      );

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
          throw new Error(response?.text || "Ошибка загрузки видов уборок");
        }

        return applyCategories(response);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки видов уборок");
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
        setManualTemplatesSupported(normalized.manualTemplatesSupported);
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
              throw new Error(response?.text || "Ошибка загрузки данных проверки");
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
        setManualTemplatesSupported(normalized.manualTemplatesSupported);
        setControlPermissions(normalized.permissions);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки данных проверки");
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

  const refreshControl = useCallback(() => loadControl({ force: true }), [loadControl]);

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
    loadControl();
  }, [loadControl]);

  const historyContext = useMemo(
    () => ({
      categories,
      templates,
      roles,
      locations,
      scheduleTypeOptions,
      additionTypeOptions,
    }),
    [additionTypeOptions, categories, locations, roles, scheduleTypeOptions, templates],
  );

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );
  const categoryDraftKey = isCreatingCategory ? NEW_CATEGORY_KEY : getCacheKey(activeCategory?.id);
  const categoryChanges =
    categoryDraft && categoryDraft.key === categoryDraftKey
      ? categoryDraft.changes
      : EMPTY_CATEGORY_CHANGES;
  // Stored state of the card: the selected category with its templates, or an empty new one.
  const categoryBase = useMemo(() => {
    if (isCreatingCategory) {
      return { ...EMPTY_CATEGORY, templateIds: [] };
    }

    return activeCategory
      ? { ...activeCategory, templateIds: getCategoryTemplateIds(templates, activeCategory.id) }
      : null;
  }, [activeCategory, isCreatingCategory, templates]);
  const categoryCard = useMemo(() => {
    if (!categoryBase) {
      return null;
    }

    const card = { ...categoryBase, ...categoryChanges };
    // Templates gone after a reload drop out of the drafted set (counter and save).
    if (categoryChanges.templateIds) {
      const templateIds = new Set(templates.map((template) => String(template.id)));
      card.templateIds = categoryChanges.templateIds.filter((templateId) =>
        templateIds.has(String(templateId)),
      );
    }

    return card;
  }, [categoryBase, categoryChanges, templates]);
  // One rule for the unsaved-changes hint and for choosing what `saveCategory` sends.
  const categoryChangedFields = useMemo(() => {
    if (!categoryCard || categoryChanges === EMPTY_CATEGORY_CHANGES) {
      return { name: false, instruction: false, templates: false };
    }

    return {
      name: String(categoryCard.name ?? "").trim() !== String(categoryBase.name ?? "").trim(),
      instruction: isRichTextChanged(
        categoryCard.instruction,
        categoryBase.instruction,
        getRichTextBaseline(instructionBaseline, categoryDraftKey, categoryBase.instruction),
      ),
      templates: !isSameIdSet(categoryCard.templateIds, categoryBase.templateIds),
    };
  }, [categoryBase, categoryCard, categoryChanges, categoryDraftKey, instructionBaseline]);
  const isCategoryDirty =
    categoryChangedFields.name || categoryChangedFields.instruction || categoryChangedFields.templates;
  const historyCategoryId = isCreatingCategory ? null : (activeCategory?.id ?? null);

  useEffect(() => {
    if (section !== "categories" || !historyCategoryId) {
      setCategoryHistoryLoading(false);
      setCategoryHistoryRawRows([]);
      return;
    }

    const cacheKey = getCacheKey(historyCategoryId);
    if (cleaningsSessionCache.categoryHistoryById[cacheKey]) {
      setCategoryHistoryRawRows(cleaningsSessionCache.categoryHistoryById[cacheKey]);
      setCategoryHistoryLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setCategoryHistoryLoading(true);
      try {
        const response = await cleaningsApi.getCategoryHistory(historyCategoryId);
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки истории");
        }

        const rawRows = normalizeHistoryResponse(response);
        cleaningsSessionCache.categoryHistoryById[cacheKey] = rawRows;

        if (!cancelled) {
          setCategoryHistoryRawRows(rawRows);
        }
      } catch (error) {
        if (!cancelled) {
          setCategoryHistoryRawRows([]);
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
  }, [categoryHistoryVersion, cleaningsApi, historyCategoryId, section]);

  const categoryHistoryRows = useMemo(
    () => presentCategoryHistory(categoryHistoryRawRows, historyContext),
    [categoryHistoryRawRows, historyContext],
  );
  const historyRows = useMemo(
    () => presentTemplateHistory(templateHistoryRawRows, historyContext),
    [historyContext, templateHistoryRawRows],
  );

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
  const archiveToggleCandidate = templates.find((template) => template.id === archiveToggleId) || null;
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

  // Never rejects: shows the error and resolves to null, so callers keep their dialog open.
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
      return null;
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

      const response = await runMutation(async () => {
        const result = template.id
          ? await cleaningsApi.updateTemplate(template.id, payload)
          : await cleaningsApi.createTemplate(payload);

        invalidateControlCache();
        invalidateHistoryCache();
        await loadTemplates({ force: true });
        await loadCategories({ force: true });
        if (section === "cafes" && selectedCafeId) {
          await loadCafes(selectedCafeId, { force: true });
        }
        return result;
      });

      if (!response) {
        return;
      }

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

      return runMutation(async () => {
        const response = await cleaningsApi.updateTemplateStatus(id, nextStatus);
        invalidateControlCache();
        invalidateHistoryCache();
        await loadTemplates({ force: true });
        if (section === "cafes" && selectedCafeId) {
          await loadCafes(selectedCafeId, { force: true });
        }
        return response;
      });
    },
    [cleaningsApi, loadCafes, loadTemplates, runMutation, section, selectedCafeId, templates],
  );

  const confirmArchiveToggle = useCallback(async () => {
    if (!archiveToggleId) {
      return;
    }

    const response = await toggleArchive(archiveToggleId);
    if (response) {
      setArchiveToggleId(null);
    }
  }, [archiveToggleId, toggleArchive]);

  const removeTemplate = useCallback(
    async (id) => {
      await runMutation(async () => {
        const response = await cleaningsApi.deleteTemplate(id);
        invalidateControlCache();
        invalidateHistoryCache();
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

  const confirmDiscard = useCallback(
    async () => (confirmDiscardChanges ? Boolean(await confirmDiscardChanges()) : true),
    [confirmDiscardChanges],
  );

  const discardCategoryChanges = useCallback(() => {
    setCategoryDraft(null);
    setIsCreatingCategory(false);
  }, []);

  // Resolves to false when the user keeps editing.
  const confirmCategoryLeave = useCallback(async () => {
    if (isCategoryDirty && !(await confirmDiscard())) {
      return false;
    }

    discardCategoryChanges();
    return true;
  }, [confirmDiscard, discardCategoryChanges, isCategoryDirty]);

  // `userEdit` (instruction only): false for the editor's own emission on load, see `settleRichTextBaseline`.
  const changeCategoryCard = useCallback(
    (field, value, { userEdit = true } = {}) => {
      if (field === "instruction" && categoryBase) {
        setInstructionBaseline((prev) =>
          settleRichTextBaseline(prev, {
            key: categoryDraftKey,
            stored: categoryBase.instruction,
            value,
            userEdit,
          }),
        );
      }

      setCategoryDraft((prev) => ({
        key: categoryDraftKey,
        changes: { ...(prev?.key === categoryDraftKey ? prev.changes : {}), [field]: value },
      }));
    },
    [categoryBase, categoryDraftKey],
  );

  const selectCategory = useCallback(
    async (id) => {
      if (!isCreatingCategory && isSameId(id, selectedCategoryId)) {
        return true;
      }

      if (!(await confirmCategoryLeave())) {
        return false;
      }

      setSelectedCategoryId(id);
      return true;
    },
    [confirmCategoryLeave, isCreatingCategory, selectedCategoryId],
  );

  const createCategory = useCallback(async () => {
    if (!(await confirmCategoryLeave())) {
      return false;
    }

    setIsCreatingCategory(true);
    return true;
  }, [confirmCategoryLeave]);

  // `categories/save_*` only for changed name/instruction, `categories/templates/save` only for a changed template set.
  const saveCategory = useCallback(async () => {
    if (!categoryCard || !categoryBase) {
      return false;
    }

    const isNew = categoryCard.id == null;
    // An instruction only re-serialized by the editor is sent as stored, so BE records no fake change.
    const payload = normalizeCategoryPayload({
      name: categoryCard.name,
      instruction: categoryChangedFields.instruction
        ? categoryCard.instruction
        : categoryBase.instruction,
    });
    const fieldsChanged =
      isNew || categoryChangedFields.name || categoryChangedFields.instruction;
    const templateIds = categoryCard.templateIds.map((templateId) => Number(templateId));
    const templatesChanged = categoryChangedFields.templates;

    if (!fieldsChanged && !templatesChanged) {
      discardCategoryChanges();
      return true;
    }

    const progress = {
      categoryId: categoryCard.id,
      fieldsSaved: false,
      templatesSaved: false,
      nextCategories: [],
    };

    const response = await runMutation(async () => {
      try {
        let result = null;

        if (fieldsChanged) {
          result = isNew
            ? await cleaningsApi.createCategory(payload)
            : await cleaningsApi.updateCategory(categoryCard.id, payload);
          if (!result?.st) {
            return result;
          }

          progress.fieldsSaved = true;
          progress.categoryId =
            result?.id ?? result?.data?.category?.id ?? result?.category?.id ?? progress.categoryId;
        }

        if (templatesChanged) {
          if (progress.categoryId == null) {
            return { st: false, text: "Не удалось определить вид уборки" };
          }

          result = await cleaningsApi.saveCategoryTemplates(progress.categoryId, templateIds);
          if (!result?.st) {
            return result;
          }

          progress.templatesSaved = true;
        }

        return result;
      } finally {
        if (progress.fieldsSaved || progress.templatesSaved) {
          invalidateHistoryCache();
          if (progress.templatesSaved) {
            invalidateControlCache();
            cleaningsSessionCache.cafesByLocation = {};
            await loadTemplates({ force: true });
          }
          progress.nextCategories = await loadCategories({ force: true });
        }
      }
    });

    if (progress.fieldsSaved || progress.templatesSaved) {
      setCategoryHistoryVersion((version) => version + 1);
    }

    const savedCategoryId =
      progress.nextCategories.find((category) => isSameId(category.id, progress.categoryId))?.id ??
      progress.categoryId;

    if (isNew && progress.fieldsSaved) {
      setIsCreatingCategory(false);
      setSelectedCategoryId(savedCategoryId);
    }

    if (response) {
      setCategoryDraft(null);
      return true;
    }

    // Name and instruction are stored; the template set stays as an unsaved change of the stored category.
    if (progress.fieldsSaved) {
      setCategoryDraft({
        key: getCacheKey(savedCategoryId),
        changes: { templateIds: categoryCard.templateIds },
      });
    }

    return false;
  }, [
    categoryBase,
    categoryCard,
    categoryChangedFields,
    cleaningsApi,
    discardCategoryChanges,
    loadCategories,
    loadTemplates,
    runMutation,
  ]);

  const deleteCategory = useCallback(async () => {
    if (!deleteCategoryId) {
      return;
    }

    const response = await runMutation(async () => {
      const result = await cleaningsApi.deleteCategory(deleteCategoryId);
      invalidateHistoryCache();
      await loadCategories({ force: true });
      return result;
    });

    if (!response) {
      return;
    }

    setDeleteCategoryId(null);
  }, [cleaningsApi, deleteCategoryId, loadCategories, runMutation]);

  const openTemplateHistory = useCallback(
    async (item) => {
      setHistoryItem(item);
      setTemplateHistoryRawRows([]);
      setHistoryLoading(true);

      const cacheKey = getCacheKey(item?.id);
      if (cacheKey && cleaningsSessionCache.templateHistoryById[cacheKey]) {
        setTemplateHistoryRawRows(cleaningsSessionCache.templateHistoryById[cacheKey]);
        setHistoryLoading(false);
        return;
      }

      try {
        const response = await cleaningsApi.getTemplateHistory(item.id);
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки истории");
        }

        const rawRows = normalizeHistoryResponse(response);
        if (cacheKey) {
          cleaningsSessionCache.templateHistoryById[cacheKey] = rawRows;
        }
        setTemplateHistoryRawRows(rawRows);
      } catch (error) {
        setTemplateHistoryRawRows([]);
        showAlert(error?.message || "Ошибка загрузки истории");
      } finally {
        setHistoryLoading(false);
      }
    },
    [cleaningsApi],
  );

  const closeTemplateHistory = useCallback(() => {
    setHistoryItem(null);
    setTemplateHistoryRawRows([]);
    setHistoryLoading(false);
  }, []);

  const addCleaningToCafe = useCallback(
    async (templateId) => {
      if (!selectedCafeId) {
        return;
      }

      const response = await runMutation(async () => {
        const result = await cleaningsApi.assignTemplateToCafe(selectedCafeId, templateId, 0);
        invalidateControlCache();
        await loadCafes(selectedCafeId, { force: true });
        await loadTemplates({ force: true });
        return result;
      });

      if (!response) {
        return;
      }

      setAddCafeDialogOpen(false);
      setAddCafeQuery("");
    },
    [cleaningsApi, loadCafes, loadTemplates, runMutation, selectedCafeId],
  );

  const setCafeDopTimeDraft = useCallback(
    (templateId, value) => {
      // "015" from the number input is kept as 15, so it matches the saved value after a reload.
      const digits = String(value ?? "").replace(/\D/g, "");
      const normalizedValue = digits === "" ? "" : Number(digits);

      setCafeDopTimeDrafts((prev) => {
        const template = cafeAssignedTemplates.find((item) => item.id === templateId);

        if (isSavedDopTime(normalizedValue, template)) {
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

    const response = await runMutation(async () => {
      const result = await cleaningsApi.removeTemplateFromCafe(
        selectedCafeId,
        removeCafeCleaningId,
      );
      invalidateControlCache();
      await loadCafes(selectedCafeId, { force: true });
      await loadTemplates({ force: true });
      return result;
    });

    if (!response) {
      return;
    }

    setRemoveCafeCleaningId(null);
  }, [cleaningsApi, loadCafes, loadTemplates, removeCafeCleaningId, runMutation, selectedCafeId]);

  const saveCafeDopTimes = useCallback(async () => {
    if (!selectedCafeId || Object.keys(cafeDopTimeDrafts).length === 0) {
      return;
    }

    const items = Object.entries(cafeDopTimeDrafts).map(([templateId, value]) => ({
      templateId: Number(templateId),
      dop_time: value === "" ? 0 : Number(value),
    }));

    const response = await runMutation(async () => {
      const result = await cleaningsApi.saveCafeDopTimes(selectedCafeId, items);
      invalidateControlCache();
      await loadCafes(selectedCafeId, { force: true });
      return result;
    });

    if (!response) {
      return;
    }

    const skippedTemplateIds = Array.isArray(response?.skippedTemplateIds)
      ? response.skippedTemplateIds
      : [];
    if (skippedTemplateIds.length) {
      const skippedNames = skippedTemplateIds.map(
        (templateId) =>
          cafeAssignedTemplates.find((template) => String(template.id) === String(templateId))
            ?.name || `#${templateId}`,
      );
      showAlert(`Доп. время не сохранено: ${skippedNames.join(", ")}`);
    }
  }, [
    cafeAssignedTemplates,
    cafeDopTimeDrafts,
    cleaningsApi,
    loadCafes,
    runMutation,
    selectedCafeId,
  ]);

  const selectCafe = useCallback(
    async (locationId) => {
      if (isSameId(locationId, selectedCafeId)) {
        return;
      }

      if (Object.keys(cafeDopTimeDrafts).length && !(await confirmDiscard())) {
        return;
      }

      setCafeDopTimeDrafts({});
      setSelectedCafeId(locationId);
    },
    [cafeDopTimeDrafts, confirmDiscard, selectedCafeId],
  );

  // Tab switch inside the module: resolves to false when the user stays with unsaved changes.
  const confirmSectionLeave = useCallback(async () => {
    if (section === "categories") {
      return confirmCategoryLeave();
    }

    if (section === "cafes" && Object.keys(cafeDopTimeDrafts).length) {
      if (!(await confirmDiscard())) {
        return false;
      }

      setCafeDopTimeDrafts({});
    }

    return true;
  }, [cafeDopTimeDrafts, confirmCategoryLeave, confirmDiscard, section]);

  // Reload / tab close; links out of the module and browser back/forward are not guarded.
  useBeforeUnloadGuard(isCategoryDirty || Object.keys(cafeDopTimeDrafts).length > 0);

  const addManualCleaning = useCallback(
    async (templateId) => {
      if (!controlCafeId) {
        return;
      }

      const response = await runMutation(async () => {
        const result = await cleaningsApi.addManualCleaning(controlCafeId, templateId);
        await loadControl({ force: true });
        return result;
      });

      if (!response) {
        return;
      }

      setAddManualDialogOpen(false);
      setAddManualQuery("");
    },
    [cleaningsApi, controlCafeId, loadControl, runMutation],
  );

  const confirmControlAction = useCallback(
    async (reason = "") => {
      if (!controlAction) {
        return;
      }

      const { id } = controlAction;
      const locationId = controlActionCandidate?.locationId || controlCafeId;
      const actions = {
        approve: () => cleaningsApi.approveControlCleaning(locationId, id),
        return: () => cleaningsApi.returnControlCleaning(locationId, id),
        detach: () => cleaningsApi.detachControlCleaning(locationId, id),
        delete: () => cleaningsApi.deleteControlCleaning(locationId, id, reason),
      };

      const actionRunner = actions[controlAction.type];
      if (!actionRunner || !locationId) {
        return;
      }

      const response = await runMutation(async () => {
        const result = await actionRunner();
        await loadControl({ force: true });
        return result;
      });

      if (!response) {
        return;
      }

      setControlAction(null);
    },
    [cleaningsApi, controlAction, controlActionCandidate, controlCafeId, loadControl, runMutation],
  );

  const confirmPreparationAction = useCallback(
    async (reason = "") => {
      if (!preparationAction) {
        return;
      }

      const { id } = preparationAction;
      const locationId = preparationActionCandidate?.locationId || preparationCafeId;
      const actions = {
        approve: () => cleaningsApi.approvePreparation(locationId, id),
        delete: () => cleaningsApi.deletePreparation(locationId, id, reason),
      };

      const actionRunner = actions[preparationAction.type];
      if (!actionRunner || !locationId) {
        return;
      }

      const response = await runMutation(async () => {
        const result = await actionRunner();
        await loadControl({ force: true });
        return result;
      });

      if (!response) {
        return;
      }

      setPreparationAction(null);
    },
    [
      cleaningsApi,
      loadControl,
      preparationAction,
      preparationActionCandidate,
      preparationCafeId,
      runMutation,
    ],
  );

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

      const response = await runMutation(async () => {
        const result = await cleaningsApi.savePreparationEdit({
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
        return result;
      });

      if (!response) {
        return;
      }

      setEditingPreparation(null);
    },
    [cleaningsApi, loadControl, locations, runMutation, showAlert],
  );

  const moduleName = moduleInfo?.name || CLEANINGS_MODULE_NAME;

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
    archiveToggleCandidate,
    bootstrapLoading,
    bootstrapReady,
    cafeAssignedTemplates,
    cafeAvailableTemplates,
    cafeRoleFilter,
    categories,
    categoryCard,
    categoryHistoryLoading,
    categoryHistoryRows,
    categoryQuery,
    cities,
    closeAlert,
    closeDialog,
    closeTemplateHistory,
    confirmArchiveToggle,
    confirmCategoryLeave,
    confirmSectionLeave,
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
    isAlert,
    isCategoryDirty,
    loading: bootstrapLoading || mutationLoading,
    locations,
    manualTemplates,
    manualTemplatesSupported,
    moduleName,
    mutationLoading,
    openCreate,
    openEdit,
    openPreparationEdit,
    openTemplateHistory,
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
    route,
    section,
    sectionTabs,
    controlKindTabs,
    selectedCafe,
    selectedCafeId,
    selectedCategoryId,
    setAddCafeDialogOpen,
    setAddCafeQuery,
    setAddCafeRoleFilter,
    setAddManualDialogOpen,
    setAddManualQuery,
    setArchiveToggleId,
    setCategoryQuery,
    setControlAction,
    setControlCafeId,
    setControlDateFrom,
    setControlDateTo,
    setControlFilter,
    setDeleteCategoryId,
    setEditingPreparation,
    setFilter,
    setPreparationAction,
    setPreparationCafeId,
    setPreparationDateFrom,
    setPreparationDateTo,
    setQuery,
    setRemoveCafeCleaningId,
    selectCafe,
    setCafeRoleFilter,
    selectCategory,
    canAccess,
    canEdit,
    canView,
    cafeDopTimeDrafts,
    showAlert,
    syncLocationFilters,
    templates,
    toggleArchive,
    removeTemplate,
    changeCategoryCard,
    createCategory,
    addableCafeCleanings,
    addCleaningToCafe,
    removeCleaningFromCafe,
    saveCafeDopTimes,
    setCafeDopTimeDraft,
    addManualCleaning,
    controlPermissions,
    refreshControl,
  };
}
