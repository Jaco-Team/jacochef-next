"use client";

import { useEffect } from "react";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import usePromoItemsStatStore from "./usePromoItemsStatStore";
import { buildPromoItemsStatPayload } from "./promoItemsStatUtils";

export default function usePromoItemsStatPage() {
  const alert = useMyAlert();

  const module = usePromoItemsStatStore((state) => state.module);
  const isLoad = usePromoItemsStatStore((state) => state.isLoad);
  const isBootstrapLoaded = usePromoItemsStatStore((state) => state.isBootstrapLoaded);
  const tab = usePromoItemsStatStore((state) => state.tab);
  const moduleName = usePromoItemsStatStore((state) => state.moduleName);
  const selectedPoints = usePromoItemsStatStore((state) => state.selectedPoints);
  const date_start = usePromoItemsStatStore((state) => state.date_start);
  const date_end = usePromoItemsStatStore((state) => state.date_end);
  const promoListRequestKey = usePromoItemsStatStore((state) => state.promoListRequestKey);
  const selectedPromos = usePromoItemsStatStore((state) => state.selectedPromos);
  const selectedItems = usePromoItemsStatStore((state) => state.selectedItems);
  const typeOrder = usePromoItemsStatStore((state) => state.typeOrder);
  const selectedClientSources = usePromoItemsStatStore((state) => state.selectedClientSources);
  const activationsFilter = usePromoItemsStatStore((state) => state.activationsFilter);
  const promoTablePagination = usePromoItemsStatStore((state) => state.promoTablePagination);
  const setIsLoad = usePromoItemsStatStore((state) => state.setIsLoad);
  const setBootstrap = usePromoItemsStatStore((state) => state.setBootstrap);
  const setStats = usePromoItemsStatStore((state) => state.setStats);
  const setPromoTable = usePromoItemsStatStore((state) => state.setPromoTable);
  const setPromoTablePagination = usePromoItemsStatStore((state) => state.setPromoTablePagination);
  const setPromoList = usePromoItemsStatStore((state) => state.setPromoList);
  const setPromoListRequestKey = usePromoItemsStatStore((state) => state.setPromoListRequestKey);
  const setSelectedPromos = usePromoItemsStatStore((state) => state.setSelectedPromos);
  const setActivationsRange = usePromoItemsStatStore((state) => state.setActivationsRange);

  const { api_laravel } = useApi(module);

  const callApi = async (method, data = {}, withLoader = true) => {
    if (withLoader) {
      setIsLoad(true);
    }

    try {
      const response = await api_laravel(method, data);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка запроса");
      }

      return response;
    } catch (error) {
      alert.showAlert(error?.message || "Ошибка запроса", false);
      return null;
    } finally {
      if (withLoader) {
        setIsLoad(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadBootstrap = async () => {
      const response = await callApi("get_all");

      if (!response || !isMounted) {
        return;
      }

      setBootstrap({
        moduleName: response.module_info?.name || "",
        pointList: response.points || [],
        stats: response.stats || [],
        promoTable: response.promo_table || [],
        promoTablePagination: response.promo_table_pagination || undefined,
        itemList: response.items || [],
        typeOrderList: response.type_orders || [],
        clientSourceList: response.sources || [],
      });

      document.title = response.module_info?.name || "Статистика промокодов";
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadPromos = async () => {
      if (!isBootstrapLoaded) {
        return;
      }

      if (!date_start || !date_end) {
        setPromoList([]);
        setSelectedPromos([]);
        return;
      }

      const payload = buildPromoItemsStatPayload({
        selectedPoints,
        date_start,
        date_end,
        typeOrder,
      });
      const requestKey = JSON.stringify(payload);

      if (requestKey === promoListRequestKey) {
        return;
      }

      setPromoListRequestKey(requestKey);
      setPromoList([]);
      setSelectedPromos([]);

      const response = await callApi("get_promos_period", payload, false);

      if (response && isActive) {
        const activations = response.activations || {};

        setPromoList(response.promos || []);
        setActivationsRange({
          min: activations.min ?? null,
          max: activations.max ?? null,
        });
        return;
      }

      if (isActive) {
        setPromoListRequestKey(null);
      }
    };

    loadPromos();

    return () => {
      isActive = false;
    };
  }, [isBootstrapLoaded, selectedPoints, date_start, date_end, typeOrder]);

  const handleRefresh = async (pagination = {}) => {
    if (isLoad) {
      return;
    }

    if (!isBootstrapLoaded || !date_start || !date_end || !selectedPoints.length) {
      alert.showAlert("Заполните фильтры", false);
      return;
    }

    if (tab === 1 && !selectedPromos.length) {
      alert.showAlert("Выберите промокод", false);
      return;
    }

    const nextPage = pagination.page ?? (tab === 0 ? 0 : promoTablePagination.page);
    const nextPerpage = pagination.perpage ?? promoTablePagination.perpage;

    const payload = buildPromoItemsStatPayload(
      {
        selectedPoints,
        date_start,
        date_end,
        selectedPromos,
        selectedItems,
        typeOrder,
        selectedClientSources,
        ...(tab === 0 ? { activationsFilter, page: nextPage, perpage: nextPerpage } : {}),
      },
      { typeOrderKey: tab === 0 ? "promo_type" : "type_order" },
    );
    const method = tab === 0 ? "get_promo_stats" : "get_legacy_stats";
    const response = await callApi(method, payload);

    if (!response) {
      return;
    }

    if (tab === 0) {
      setPromoTable(response.promo_table || []);
      setPromoTablePagination(
        response.promo_table_pagination || {
          page: nextPage,
          perpage: nextPerpage,
          total: response.promo_table?.length || 0,
          total_pages: 0,
        },
      );
      return;
    }

    setStats(response.stats || []);
  };

  return {
    alert,
    isLoad,
    tab,
    moduleName,
    handleRefresh,
  };
}
