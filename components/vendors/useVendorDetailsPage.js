"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useShallow } from "zustand/react/shallow";
import dayjs from "dayjs";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import useVendorAccess from "./useVendorAccess";
import useVendorDetailsStore from "./useVendorDetailsStore";
import useVendorsStore from "./useVendorsStore";
import {
  buildMailsPayload,
  buildVendorItemsPayload,
  buildVendorCitiesPayload,
  buildVendorPayload,
  normalizeCities,
  normalizeCatalogItems,
  normalizeMails,
  normalizeVendor,
  normalizeVendorItems,
  normalizeVendorList,
} from "./vendorFormUtils";

export default function useVendorDetailsPage(vendorId) {
  const router = useRouter();
  const { api_laravel, api_upload } = useApi("vendors");
  const loadingItemVendorsRef = useRef({});
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const { canDeleteDeclaration, canEdit, canEditDeclaration, canUpload } = useVendorAccess();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const bootstrapAllPoints = useVendorsStore((state) => state.allPoints);
  const bootstrapAllDeclarations = useVendorsStore((state) => state.allDeclarations);
  const bootstrapAllItems = useVendorsStore((state) => state.allItems);
  const vendors = useVendorsStore((state) => state.vendors);
  const setSharedBootstrap = useVendorsStore((state) => state.setSharedBootstrap);
  const setLoading = useVendorsStore((state) => state.setLoading);
  const setVendors = useVendorsStore((state) => state.setVendors);
  const {
    allItems,
    docModalExpiresAt,
    docModalFile,
    docModalItemId,
    itemVendorsByItemId,
    mails,
    selectedItemId,
    setAllDeclarations,
    setAllItems,
    setDocModalExpiresAt,
    setDocModalFile,
    setDocModalItemId,
    setItemVendors,
    setIsDocModalOpen,
    setIsEditing,
    setSelectedItemId,
    setState,
    setVendor,
    setVendorCities,
    setVendorItems,
    vendor,
    vendorCities,
    vendorItems,
    reset,
  } = useVendorDetailsStore(
    useShallow((state) => ({
      allItems: state.allItems || [],
      docModalExpiresAt: state.docModalExpiresAt,
      docModalFile: state.docModalFile,
      docModalItemId: state.docModalItemId,
      itemVendorsByItemId: state.itemVendorsByItemId || {},
      mails: state.mails || [],
      selectedItemId: state.selectedItemId,
      setAllDeclarations: state.setAllDeclarations,
      setAllItems: state.setAllItems,
      setDocModalExpiresAt: state.setDocModalExpiresAt,
      setDocModalFile: state.setDocModalFile,
      setDocModalItemId: state.setDocModalItemId,
      setItemVendors: state.setItemVendors,
      setIsDocModalOpen: state.setIsDocModalOpen,
      setIsEditing: state.setIsEditing,
      setSelectedItemId: state.setSelectedItemId,
      setState: state.setState,
      setVendor: state.setVendor,
      setVendorCities: state.setVendorCities,
      setVendorItems: state.setVendorItems,
      vendor: state.vendor,
      vendorCities: state.vendorCities || [],
      vendorItems: state.vendorItems || [],
      reset: state.reset,
    })),
  );

  const loadVendor = async () => {
    if (!vendorId) {
      return false;
    }

    try {
      setLoading(true);
      const shouldLoadBootstrap =
        !Array.isArray(bootstrapAllPoints) ||
        !bootstrapAllPoints.length ||
        !Array.isArray(bootstrapAllDeclarations);

      const [infoResponse, productsResponse, bootstrapResponse, vendorsResponse] =
        await Promise.all([
          api_laravel("get_vendor_info", { vendor_id: vendorId }),
          api_laravel("get_vendor_items", { vendor_id: vendorId }),
          shouldLoadBootstrap ? api_laravel("get_all") : Promise.resolve(null),
          !Array.isArray(vendors) || !vendors.length
            ? api_laravel("get_vendors", { city: -1 })
            : Promise.resolve(null),
        ]);

      if (!infoResponse?.st) {
        throw new Error(infoResponse?.text || "Не удалось загрузить поставщика");
      }

      if (!productsResponse?.st) {
        throw new Error(productsResponse?.text || "Не удалось загрузить товары поставщика");
      }

      const sharedAllPoints = bootstrapResponse?.st
        ? bootstrapResponse.all_points || []
        : bootstrapAllPoints || [];
      const sharedAllDeclarations = bootstrapResponse?.st
        ? bootstrapResponse.all_declarations || []
        : bootstrapAllDeclarations || [];
      const sharedAllItems = bootstrapResponse?.st
        ? normalizeCatalogItems(bootstrapResponse.all_items)
        : normalizeCatalogItems(bootstrapAllItems);

      if (bootstrapResponse?.st) {
        setSharedBootstrap({
          access: bootstrapResponse.access || {},
          allPoints: sharedAllPoints,
          allDeclarations: sharedAllDeclarations,
          allItems: sharedAllItems,
        });
      }

      if (vendorsResponse?.vendors) {
        setVendors(vendorsResponse.vendors || [], -1);
      }

      setState({
        vendor: normalizeVendor(infoResponse.vendor),
        vendorCities: normalizeCities(infoResponse.vendor_cities),
        allCities: normalizeCities(infoResponse.all_cities),
        mails: normalizeMails(infoResponse.mails, sharedAllPoints),
        allPoints: sharedAllPoints,
        allDeclarations: sharedAllDeclarations,
        vendorItems: normalizeVendorItems(productsResponse.vendor_items),
        allItems: sharedAllItems,
        history: infoResponse.history || [],
      });
      document.title = infoResponse.vendor?.name || "Поставщик";
      return true;
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    if (!vendorItems.length) {
      setDocModalItemId("");
      setSelectedItemId(null);
      return;
    }

    const hasDocItem = vendorItems.some((item) => String(item.item_id) === String(docModalItemId));
    if (!hasDocItem) {
      setDocModalItemId(String(vendorItems[0].item_id));
    }

    const hasSelectedItem =
      selectedItemId != null &&
      vendorItems.some((item) => Number(item.item_id) === Number(selectedItemId));
    if (!hasSelectedItem) {
      setSelectedItemId(Number(vendorItems[0].item_id));
    }
  }, [vendorItems, docModalItemId, selectedItemId]);

  const applyDeclarationUpdates = (entries = []) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return;
    }

    const updates = new Map();
    entries.forEach((entry) => {
      if (!entry?.item_id) {
        return;
      }
      updates.set(
        Number(entry.item_id),
        Array.isArray(entry.declarations) ? entry.declarations : [],
      );
    });

    if (!updates.size) {
      return;
    }

    setVendorItems((prev) =>
      prev.map((vendorItem) =>
        updates.has(Number(vendorItem.item_id))
          ? { ...vendorItem, declarations: updates.get(Number(vendorItem.item_id)) }
          : vendorItem,
      ),
    );

    setAllItems((prev) =>
      prev.map((catalogItem) =>
        updates.has(Number(catalogItem.id))
          ? { ...catalogItem, declarations: updates.get(Number(catalogItem.id)) }
          : catalogItem,
      ),
    );
  };

  const handleDeclarationResponse = (response) => {
    if (!response) {
      return;
    }

    if (Array.isArray(response.item_declarations)) {
      applyDeclarationUpdates(response.item_declarations);
      return;
    }

    if (response.item_id) {
      applyDeclarationUpdates([
        { item_id: response.item_id, declarations: response.declarations || [] },
      ]);
    }
  };

  const saveVendorSnapshot = async (
    nextVendor = vendor,
    nextVendorCities = vendorCities,
    nextMails = mails,
    successMessage = "Изменения сохранены",
  ) => {
    try {
      setLoading(true);

      const response = await api_laravel("update_vendor", {
        vendor: buildVendorPayload(nextVendor, "update"),
        vendor_cities: buildVendorCitiesPayload(nextVendorCities),
        mails: buildMailsPayload(nextMails),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось сохранить поставщика");
      }

      showAlert(successMessage, true);
      return true;
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleQuickToggleVendorField = async (field) => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования поставщика", false);
      return false;
    }

    if (!vendor) {
      return false;
    }

    const previousVendor = vendor;
    const nextVendor = {
      ...vendor,
      [field]: Number(vendor[field]) ? 0 : 1,
    };

    setVendor(nextVendor);
    const isSaved = await saveVendorSnapshot(nextVendor, vendorCities, mails);

    if (!isSaved) {
      setVendor(previousVendor);
    }

    return isSaved;
  };

  const handleToggleCity = async (city) => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования поставщика", false);
      return false;
    }

    if (!city?.id) {
      return false;
    }

    const previousCities = vendorCities;
    const cityId = Number(city.id);
    const exists = vendorCities.some((entry) => Number(entry.id) === cityId);
    const nextCities = exists
      ? vendorCities.filter((entry) => Number(entry.id) !== cityId)
      : [...vendorCities, city];

    setVendorCities(nextCities);
    const isSaved = await saveVendorSnapshot(vendor, nextCities, mails);

    if (!isSaved) {
      setVendorCities(previousCities);
    }

    return isSaved;
  };

  const handleUploadDeclaration = async (itemId, file, expiresAt = docModalExpiresAt) => {
    if (!canUpload) {
      showAlert("Недостаточно прав для загрузки деклараций", false);
      return null;
    }

    if (!itemId || !file) {
      return null;
    }

    try {
      setLoading(true);
      const response = await api_upload("upload_declaration", file, {
        item_id: Number(itemId),
        vendor_id: Number(vendorId),
        expires_at:
          expiresAt && dayjs(expiresAt).isValid() ? dayjs(expiresAt).format("YYYY-MM-DD") : "",
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось загрузить декларацию");
      }

      handleDeclarationResponse(response);
      if (response.declaration?.id) {
        setAllDeclarations((prev) => {
          const declarationId = Number(response.declaration.id);
          return [
            ...prev.filter((decl) => Number(decl.id) !== declarationId),
            response.declaration,
          ];
        });
      }
      showAlert("Декларация загружена", true);
      return response;
    } catch (error) {
      showAlert(error?.message || "Не удалось загрузить декларацию", false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setDocModalFile(null);
    setDocModalExpiresAt(null);
  };

  const openDocModal = (itemId = selectedItemId) => {
    if (!canUpload) {
      showAlert("Недостаточно прав для загрузки деклараций", false);
      return;
    }

    if (itemId) {
      setDocModalItemId(String(itemId));
    }
    setDocModalFile(null);
    setDocModalExpiresAt(null);
    setIsDocModalOpen(true);
  };

  const handleDocumentModalSubmit = async () => {
    if (!docModalItemId) {
      showAlert("Выберите товар", false);
      return;
    }

    if (!docModalFile) {
      showAlert("Выберите файл", false);
      return;
    }

    const response = await handleUploadDeclaration(docModalItemId, docModalFile, docModalExpiresAt);
    if (response?.st) {
      closeDocModal();
    }
  };

  const handleDeleteDeclaration = async (declId) => {
    if (!canDeleteDeclaration) {
      showAlert("Недостаточно прав для удаления деклараций", false);
      return;
    }

    if (!declId) {
      return;
    }

    try {
      setLoading(true);
      const response = await api_laravel("delete_declaration", {
        decl_id: Number(declId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось удалить декларацию");
      }

      handleDeclarationResponse(response);
      setAllDeclarations((prev) => prev.filter((decl) => Number(decl.id) !== Number(declId)));
      await loadVendor();
      showAlert("Декларация удалена", true);
    } catch (error) {
      showAlert(error?.message || "Не удалось удалить декларацию", false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeclaration = async (declId, expiresAt, nextVendorId = null) => {
    if (!canEditDeclaration) {
      showAlert("Недостаточно прав для редактирования деклараций", false);
      return false;
    }

    if (!declId || !expiresAt || !dayjs(expiresAt).isValid()) {
      return false;
    }

    try {
      setLoading(true);
      const payload = {
        id: Number(declId),
        expires_at: dayjs(expiresAt).format("YYYY-MM-DD"),
      };

      if (nextVendorId) {
        payload.vendor_id = Number(nextVendorId);
      }

      const response = await api_laravel("declaration-save", payload);

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось сохранить декларацию");
      }

      handleDeclarationResponse(response);
      await loadVendor();
      showAlert("Декларация сохранена", true);
      return true;
    } catch (error) {
      showAlert(error?.message || "Не удалось сохранить декларацию", false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadItemVendors = async (itemId) => {
    if (!itemId) {
      return [];
    }

    const cacheKey = String(itemId);
    if (Array.isArray(itemVendorsByItemId[cacheKey])) {
      return itemVendorsByItemId[cacheKey];
    }

    if (loadingItemVendorsRef.current[cacheKey]) {
      return loadingItemVendorsRef.current[cacheKey];
    }

    loadingItemVendorsRef.current[cacheKey] = (async () => {
      setLoading(true);
      const response = await api_laravel("get_item_vendors", {
        item_id: Number(itemId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось загрузить поставщиков товара");
      }

      const nextVendors = (response.vendors || []).filter(
        (itemVendor) =>
          itemVendor?.id &&
          Number(itemVendor.id) !== 0 &&
          Number(itemVendor.id) !== Number(vendorId),
      );
      const normalizedVendors = normalizeVendorList(nextVendors);
      setItemVendors(itemId, normalizedVendors);
      return normalizedVendors;
    })();

    try {
      return await loadingItemVendorsRef.current[cacheKey];
    } catch (error) {
      showAlert(error?.message || "Не удалось загрузить поставщиков товара", false);
      return [];
    } finally {
      delete loadingItemVendorsRef.current[cacheKey];
      setLoading(false);
    }
  };

  const commitVendorItems = async (nextItems) => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования товаров поставщика", false);
      return false;
    }

    if (!vendorId) {
      return false;
    }

    try {
      setLoading(true);
      const payload = nextItems.map((item, index) => ({
        ...buildVendorItemsPayload([item])[0],
        sort: Number(item.sort ?? index * 10),
      }));

      const response = await api_laravel("save_vendor_items", {
        vendor_id: vendorId,
        items: payload,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось сохранить товары");
      }

      await loadVendor();
      return true;
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendorItem = async (catalogItemId) => {
    if (!catalogItemId) {
      return false;
    }

    const newItemId = Number(catalogItemId);
    const vendorItemIds = new Set(vendorItems.map((item) => Number(item.item_id)));

    if (vendorItemIds.has(newItemId)) {
      return false;
    }

    const existsInCatalog = allItems.some((item) => Number(item.id) === newItemId);
    if (!existsInCatalog) {
      return false;
    }

    const maxSort = vendorItems.reduce((max, item) => Math.max(max, Number(item.sort) || 0), 0);
    return commitVendorItems([...vendorItems, { item_id: newItemId, nds: -1, sort: maxSort + 1 }]);
  };

  const handleRemoveVendorItem = async (itemId) => {
    if (!itemId) {
      return;
    }

    const nextItems = vendorItems.filter((item) => Number(item.item_id) !== Number(itemId));
    const isSaved = await commitVendorItems(nextItems);

    if (isSaved && Number(selectedItemId) === Number(itemId)) {
      setSelectedItemId(null);
    }
  };

  const handleVendorSubmit = async () => {
    const isSaved = await saveVendorSnapshot(vendor, vendorCities, mails, "Поставщик сохранен");

    if (isSaved) {
      setIsEditing(false);
      await loadVendor();
    }
  };

  const handleVendorInfoSubmit = async (nextVendor, nextVendorCities) => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования поставщика", false);
      return false;
    }

    const isSaved = await saveVendorSnapshot(
      nextVendor,
      nextVendorCities,
      mails,
      "Поставщик сохранен",
    );

    if (isSaved) {
      setVendor(nextVendor);
      setVendorCities(nextVendorCities);
      await loadVendor();
    }

    return isSaved;
  };

  const handleVendorMailsSubmit = async (nextMails) => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования поставщика", false);
      return false;
    }

    const isSaved = await saveVendorSnapshot(vendor, vendorCities, nextMails, "Поставщик сохранен");

    if (isSaved) {
      await loadVendor();
    }

    return isSaved;
  };

  const handleDeleteVendor = async () => {
    if (!canEdit) {
      showAlert("Недостаточно прав для удаления поставщика", false);
      return false;
    }

    if (!vendorId) {
      return false;
    }

    try {
      setLoading(true);
      const response = await api_laravel("delete_vendor", {
        vendor_id: Number(vendorId),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось удалить поставщика");
      }

      showAlert("Поставщик удален", true);
      router.push("/vendors");
      return true;
    } catch (error) {
      showAlert(error?.message || "Не удалось удалить поставщика", false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    alertMessage,
    alertStatus,
    closeAlert,
    closeDocModal,
    handleAddVendorItem,
    handleDeleteDeclaration,
    handleDeleteVendor,
    handleDocumentModalSubmit,
    handleSaveDeclaration,
    handleVendorInfoSubmit,
    handleVendorMailsSubmit,
    handleQuickToggleVendorField,
    handleRemoveVendorItem,
    handleToggleCity,
    handleVendorSubmit,
    isAlert,
    isLoading,
    loadVendor,
    openDocModal,
    showAlert,
    getItemVendorOptions: (itemId) => itemVendorsByItemId[String(itemId)] || [],
    loadItemVendors,
  };
}
