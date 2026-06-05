"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import useVendorDetailsStore from "./useVendorDetailsStore";
import useVendorItemPriceStore from "./useVendorItemPriceStore";
import { resolveVendorPriceApiMethod, VENDOR_PRICE_API } from "./vendorItemPriceApi";
import { buildVendorItemsPayload } from "./vendorFormUtils";
import {
  buildCatalogSelectOptions,
  buildPriceItemPayload,
  createEmptyAddDraft,
  enrichPriceItems,
} from "./vendorItemPriceUtils";

const PRICE_MODULE = "vendor_item_price";
const VENDORS_MODULE = "vendors";

export default function useVendorItemPricePage(vendorId) {
  const vendor = useVendorDetailsStore((state) => state.vendor);
  const allItems = useVendorDetailsStore((state) => state.allItems || []);
  const vendorItems = useVendorDetailsStore((state) => state.vendorItems || []);
  const {
    cities,
    city,
    items,
    vendorCities,
    selectedVendorCities,
    isLoading,
    isCityModalOpen,
    expandedItemId,
    editingItemId,
    isAddModalOpen,
    addDraft,
    editDraft,
    clearEditState,
    patchAddDraft,
    patchEditDraft,
    removeItem,
    replaceItem,
    resetAddDraft,
    setAddDraft,
    setCity,
    setEditDraft,
    setEditingItemId,
    setExpandedItemId,
    setIsAddModalOpen,
    setIsCityModalOpen,
    setSelectedVendorCities,
    setVendorItems,
  } = useVendorItemPriceStore(
    useShallow((state) => ({
      cities: state.cities,
      city: state.city,
      items: state.items,
      vendorCities: state.vendorCities,
      selectedVendorCities: state.selectedVendorCities,
      isLoading: state.isLoading,
      isCityModalOpen: state.isCityModalOpen,
      expandedItemId: state.expandedItemId,
      editingItemId: state.editingItemId,
      isAddModalOpen: state.isAddModalOpen,
      addDraft: state.addDraft,
      editDraft: state.editDraft,
      clearEditState: state.clearEditState,
      patchAddDraft: state.patchAddDraft,
      patchEditDraft: state.patchEditDraft,
      removeItem: state.removeItem,
      replaceItem: state.replaceItem,
      resetAddDraft: state.resetAddDraft,
      setAddDraft: state.setAddDraft,
      setCity: state.setCity,
      setEditDraft: state.setEditDraft,
      setEditingItemId: state.setEditingItemId,
      setExpandedItemId: state.setExpandedItemId,
      setIsAddModalOpen: state.setIsAddModalOpen,
      setIsCityModalOpen: state.setIsCityModalOpen,
      setSelectedVendorCities: state.setSelectedVendorCities,
      setVendorItems: state.setVendorItems,
    })),
  );

  const { api_laravel: priceApi } = useApi(PRICE_MODULE);
  const { api_laravel: vendorsApi } = useApi(VENDORS_MODULE);
  const priceApiRef = useRef(priceApi);
  const vendorsApiRef = useRef(vendorsApi);
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const showAlertRef = useRef(showAlert);
  const bootstrapRequestRef = useRef(0);
  const pendingUpsertRef = useRef(null);

  priceApiRef.current = priceApi;
  vendorsApiRef.current = vendorsApi;
  showAlertRef.current = showAlert;

  const enrichedItems = useMemo(() => enrichPriceItems(items, vendorItems), [items, vendorItems]);

  const pricedItemIds = useMemo(
    () => new Set(enrichedItems.map((item) => Number(item.item_id))),
    [enrichedItems],
  );

  const catalogSelectOptions = useMemo(() => {
    const options = buildCatalogSelectOptions(allItems, pricedItemIds);
    const knownIds = new Set(options.map((entry) => Number(entry.id)));

    vendorItems.forEach((entry) => {
      const itemId = Number(entry.item_id);
      if (!itemId || pricedItemIds.has(itemId) || knownIds.has(itemId)) {
        return;
      }

      options.push({
        id: String(itemId),
        name: entry.cat_name
          ? `${entry.item_name || `Товар #${itemId}`} · ${entry.cat_name}`
          : entry.item_name || `Товар #${itemId}`,
      });
      knownIds.add(itemId);
    });

    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, [allItems, pricedItemIds, vendorItems]);

  const selectedCityName = useMemo(() => {
    const match = cities.find((entry) => String(entry.id) === String(city));
    return match?.name || "";
  }, [cities, city]);

  const requestPriceApi = useCallback(async (method, data = {}) => {
    const resolvedMethod = resolveVendorPriceApiMethod(method);
    return priceApiRef.current(resolvedMethod, data);
  }, []);

  const callApi = useCallback(
    async (method, data = {}) => {
      const { setIsLoading } = useVendorItemPriceStore.getState();
      setIsLoading(true);
      try {
        return await requestPriceApi(method, data);
      } catch (error) {
        showAlertRef.current(error?.message || "Ошибка запроса", false);
        return null;
      } finally {
        useVendorItemPriceStore.getState().setIsLoading(false);
      }
    },
    [requestPriceApi],
  );

  const reloadItems = useCallback(async () => {
    if (!vendorId || !city) {
      return false;
    }

    const response = await callApi(VENDOR_PRICE_API.LIST_ITEMS, {
      city,
      vendor_id: vendorId,
    });

    if (!response) {
      return false;
    }

    const selectedForCity = useVendorItemPriceStore
      .getState()
      .cities.filter((entry) => Number(entry.id) === Number(city));

    setVendorItems({
      items: response.items || [],
      vendorCities: response.vendor_cities || [],
      selectedVendorCities: selectedForCity,
    });

    return true;
  }, [callApi, city, setVendorItems, vendorId]);

  useEffect(() => {
    return () => {
      useVendorItemPriceStore.getState().reset();
    };
  }, []);

  useEffect(() => {
    if (!vendorId) {
      return undefined;
    }

    const { reset, setIsLoading, setBootstrap } = useVendorItemPriceStore.getState();
    reset();

    const requestId = bootstrapRequestRef.current + 1;
    bootstrapRequestRef.current = requestId;
    let isMounted = true;

    const loadBootstrap = async () => {
      setIsLoading(true);
      try {
        const response = await requestPriceApi(VENDOR_PRICE_API.GET_CONTEXT);
        if (!isMounted || requestId !== bootstrapRequestRef.current) {
          return;
        }

        if (response?.cities) {
          setBootstrap(response.cities);
        }
      } catch (error) {
        if (isMounted) {
          showAlertRef.current(error?.message || "Ошибка запроса", false);
        }
      } finally {
        if (isMounted && requestId === bootstrapRequestRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
  }, [requestPriceApi, vendorId]);

  const handleCityChange = useCallback(
    async (event) => {
      const nextCity = event.target.value;
      setCity(nextCity);

      if (!nextCity || !vendorId) {
        return;
      }

      const response = await callApi(VENDOR_PRICE_API.LIST_ITEMS, {
        city: nextCity,
        vendor_id: vendorId,
      });

      if (!response) {
        return;
      }

      const selectedForCity = useVendorItemPriceStore
        .getState()
        .cities.filter((entry) => Number(entry.id) === Number(nextCity));

      setVendorItems({
        items: response.items || [],
        vendorCities: response.vendor_cities || [],
        selectedVendorCities: selectedForCity,
      });
    },
    [callApi, setCity, setVendorItems, vendorId],
  );

  const beginEditItem = useCallback(
    (item) => {
      if (!item?.item_id) {
        return;
      }

      setEditDraft({
        item_id: item.item_id,
        full_price: item.full_price ?? "",
        rec_pq: item.rec_pq == 0 || item.rec_pq === "0" ? "" : item.rec_pq,
        pqs: item.pqs || [],
        price: item.price || "",
        ei_name: item.ei_name || "шт",
      });
    },
    [setEditDraft],
  );

  const handleToggleExpand = useCallback(
    (item) => {
      const itemId = Number(item.item_id);
      if (expandedItemId === itemId) {
        clearEditState();
        return;
      }

      setExpandedItemId(itemId);
      setEditingItemId(null);
      beginEditItem(item);
    },
    [beginEditItem, clearEditState, expandedItemId, setEditingItemId, setExpandedItemId],
  );

  const handleOpenEditModal = useCallback(
    (item) => {
      const itemId = Number(item.item_id);
      setEditingItemId(itemId);
      setExpandedItemId(null);
      beginEditItem(item);
    },
    [beginEditItem, setEditingItemId, setExpandedItemId],
  );

  const handleCloseEditModal = useCallback(() => {
    setEditingItemId(null);
    setEditDraft(null);
  }, [setEditingItemId, setEditDraft]);

  const handleCancelEdit = useCallback(() => {
    clearEditState();
  }, [clearEditState]);

  const handleDraftChange = useCallback(
    (field) => (event) => {
      patchEditDraft(field, event.target.value);
    },
    [patchEditDraft],
  );

  const persistUpsert = useCallback(
    async (draft, vendorCitySelection) => {
      if (!vendorId || !city || !vendor?.id || !draft?.item_id) {
        showAlertRef.current("Выберите город", false);
        return false;
      }

      const currentItems = useVendorItemPriceStore.getState().items;
      const sourceItem =
        currentItems.find((entry) => Number(entry.item_id) === Number(draft.item_id)) || {};
      const payloadItem = buildPriceItemPayload({ ...sourceItem, ...draft });

      const response = await callApi(VENDOR_PRICE_API.UPSERT_ITEM, {
        vendor_id: vendor.id,
        city_id: city,
        item_id: Number(draft.item_id),
        full_price: payloadItem.full_price,
        rec_pq: payloadItem.rec_pq,
        item: payloadItem,
        vendorCity: vendorCitySelection,
      });

      if (!response) {
        return false;
      }

      if (response.st === false) {
        showAlertRef.current(response.text || "Не удалось сохранить цену", false);
        return false;
      }

      showAlertRef.current(response.text || "Цена сохранена", true);
      replaceItem(draft.item_id, payloadItem);
      await reloadItems();
      return true;
    },
    [callApi, city, reloadItems, replaceItem, vendor?.id, vendorId],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editDraft?.item_id) {
      return false;
    }

    if (vendorCities.length > 1) {
      pendingUpsertRef.current = editDraft;
      setIsCityModalOpen(true);
      return false;
    }

    const isSaved = await persistUpsert(editDraft, selectedVendorCities);
    if (isSaved) {
      clearEditState();
    }
    return isSaved;
  }, [
    clearEditState,
    editDraft,
    persistUpsert,
    selectedVendorCities,
    setIsCityModalOpen,
    vendorCities.length,
  ]);

  const handleConfirmCityScopeSave = useCallback(async () => {
    const draft = pendingUpsertRef.current || editDraft;
    if (!draft) {
      setIsCityModalOpen(false);
      return false;
    }

    const isSaved = await persistUpsert(draft, selectedVendorCities);
    pendingUpsertRef.current = null;
    if (isSaved) {
      setIsCityModalOpen(false);
      clearEditState();
    }
    return isSaved;
  }, [clearEditState, editDraft, persistUpsert, selectedVendorCities, setIsCityModalOpen]);

  const handleCloseCityModal = useCallback(() => {
    pendingUpsertRef.current = null;
    setIsCityModalOpen(false);
  }, [setIsCityModalOpen]);

  const handleSelectedVendorCitiesChange = useCallback(
    (_, value) => {
      setSelectedVendorCities(value || []);
    },
    [setSelectedVendorCities],
  );

  const loadPackOptionsForItem = useCallback(
    async (itemId) => {
      const existing = items.find((entry) => Number(entry.item_id) === Number(itemId));
      if (existing?.pqs?.length) {
        return {
          pqs: existing.pqs,
          rec_pq: existing.rec_pq == 0 || existing.rec_pq === "0" ? "" : existing.rec_pq,
          ei_name: existing.ei_name || "шт",
        };
      }

      try {
        const response = await requestPriceApi(VENDOR_PRICE_API.GET_ITEM_PACK_OPTIONS, {
          vendor_id: vendorId,
          item_id: Number(itemId),
        });

        if (response?.pqs?.length) {
          return {
            pqs: response.pqs,
            rec_pq: response.rec_pq == 0 || response.rec_pq === "0" ? "" : response.rec_pq || "",
            ei_name: response.ei_name || "шт",
          };
        }
      } catch {
        // fallback below
      }

      return { pqs: [], rec_pq: "", ei_name: "шт" };
    },
    [items, requestPriceApi, vendorId],
  );

  const handleCatalogItemSelect = useCallback(
    async (_, value) => {
      const itemId = value?.id || "";
      if (!itemId) {
        resetAddDraft();
        return;
      }

      setAddDraft({
        ...createEmptyAddDraft(),
        item_id: itemId,
      });

      const packOptions = await loadPackOptionsForItem(itemId);
      setAddDraft({
        ...createEmptyAddDraft(),
        item_id: itemId,
        ...packOptions,
      });
    },
    [loadPackOptionsForItem, resetAddDraft, setAddDraft],
  );

  const handleAddDraftChange = useCallback(
    (field) => (event) => {
      patchAddDraft(field, event.target.value);
    },
    [patchAddDraft],
  );

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    resetAddDraft();
  }, [resetAddDraft, setIsAddModalOpen]);

  const createViaVendorsModule = useCallback(
    async (catalogItemId) => {
      const newItemId = Number(catalogItemId);
      const linkedItemIds = new Set(vendorItems.map((entry) => Number(entry.item_id)));

      if (!linkedItemIds.has(newItemId)) {
        const maxSort = vendorItems.reduce(
          (max, entry) => Math.max(max, Number(entry.sort) || 0),
          0,
        );
        const vendorsResponse = await vendorsApiRef.current("save_vendor_items", {
          vendor_id: vendorId,
          items: buildVendorItemsPayload([
            ...vendorItems,
            { item_id: newItemId, nds: -1, sort: maxSort + 10 },
          ]),
        });

        if (!vendorsResponse?.st) {
          showAlertRef.current(vendorsResponse?.text || "Не удалось добавить продукт", false);
          return false;
        }
      }

      return reloadItems();
    },
    [reloadItems, vendorId, vendorItems],
  );

  const handleCreateItem = useCallback(async () => {
    const draft = useVendorItemPriceStore.getState().addDraft;

    if (!draft?.item_id || !city || !vendorId) {
      showAlertRef.current("Выберите продукт и город", false);
      return false;
    }

    const payloadItem = buildPriceItemPayload({
      item_id: Number(draft.item_id),
      full_price: draft.full_price,
      rec_pq: draft.rec_pq,
      price: draft.price,
    });

    let response = await callApi(VENDOR_PRICE_API.CREATE_ITEM, {
      vendor_id: vendorId,
      city_id: city,
      item_id: Number(draft.item_id),
      full_price: draft.full_price,
      rec_pq: draft.rec_pq,
      item: payloadItem,
    });

    if (!response || response.st === false) {
      const isLinked = await createViaVendorsModule(draft.item_id);
      if (!isLinked) {
        return false;
      }

      await reloadItems();

      const isPriced = await persistUpsert(
        {
          item_id: draft.item_id,
          full_price: draft.full_price,
          rec_pq: draft.rec_pq,
          pqs: draft.pqs,
          price: draft.price,
          ei_name: draft.ei_name,
        },
        selectedVendorCities,
      );

      if (isPriced) {
        resetAddDraft();
      }
      return isPriced;
    }

    showAlertRef.current(response.text || "Продукт добавлен", true);
    resetAddDraft();
    await reloadItems();
    return true;
  }, [
    callApi,
    city,
    createViaVendorsModule,
    persistUpsert,
    reloadItems,
    resetAddDraft,
    selectedVendorCities,
    vendorId,
  ]);

  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!itemId || !city || !vendorId) {
        return false;
      }

      const response = await callApi(VENDOR_PRICE_API.DELETE_ITEM, {
        vendor_id: vendorId,
        city_id: city,
        item_id: Number(itemId),
      });

      if (!response || response.st === false) {
        showAlertRef.current(response?.text || "Не удалось удалить продукт", false);
        return false;
      }

      showAlertRef.current(response.text || "Продукт удалён", true);
      removeItem(itemId);
      await reloadItems();
      return true;
    },
    [callApi, city, reloadItems, removeItem, vendorId],
  );

  const editingItem = useMemo(
    () => enrichedItems.find((item) => Number(item.item_id) === Number(editingItemId)) || null,
    [editingItemId, enrichedItems],
  );

  return {
    addDraft,
    alertMessage,
    alertStatus,
    catalogSelectOptions,
    cities,
    city,
    closeAlert,
    editDraft,
    editingItem,
    editingItemId,
    enrichedItems,
    expandedItemId,
    handleCancelEdit,
    handleCityChange,
    handleCloseCityModal,
    handleCloseEditModal,
    handleAddDraftChange,
    handleCatalogItemSelect,
    handleCloseAddModal,
    handleConfirmCityScopeSave,
    handleCreateItem,
    handleDeleteItem,
    handleDraftChange,
    handleOpenEditModal,
    handleSaveEdit,
    handleSelectedVendorCitiesChange,
    handleToggleExpand,
    isAddModalOpen,
    isAlert,
    isCityModalOpen,
    isLoading,
    selectedCityName,
    openAddModal: () => {
      resetAddDraft();
      setIsAddModalOpen(true);
    },
    vendorCities,
    selectedVendorCities,
  };
}
