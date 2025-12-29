"use client";

import { memo, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import SiteClientsMarketingStatCard from "./SiteClientsMarketingStatCard";
import useMarketingTabStore from "./useMarketingTabStore";
import dayjs from "dayjs";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useLoading } from "./useClientsLoadingContext";
import { useSiteClientsStore } from "../useSiteClientsStore";

const InnerTabStats = ({ getData, showAlert }) => {
  const {
    stats,
    setStats,
    resetFilters,
    setIsTreeModalOpen,
    setIsStatModalOpen,
    setOrderIds, // drop if exists to get orders by slices
    sliceOrigin,
    sliceNew,
    slicePromo,
    sliceReset,
    setOrders,
    refreshToken,
  } = useMarketingTabStore();

  const { setIsLoading } = useLoading();

  const getStats = async () => {
    const { points_marketing, date_start_marketing, date_end_marketing } =
      useSiteClientsStore.getState();
    if (!points_marketing.length || !date_start_marketing || !date_end_marketing) {
      return;
    }
    const resData = await getData("get_marketing_stats", {
      points: points_marketing,
      date_start: dayjs(date_start_marketing).format("YYYY-MM-DD"),
      date_end: dayjs(date_end_marketing).format("YYYY-MM-DD"),
    });

    if (!resData?.st) {
      return showAlert(resData?.text || "За период нет статистики", false);
    }
    setOrders(null);
    resetFilters();
    setStats(resData);
  };

  const debouncedGetStats = useDebounce(getStats, 500);
  useEffect(() => debouncedGetStats(), [refreshToken]);

  return (
    <>
      {stats ? (
        <Grid
          container
          spacing={3}
          sx={{ justifyContent: "center" }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Заказали новые клиенты"
              value={stats?.new_clients}
              onClick={() => {
                setIsLoading(true);
                sliceNew();
                setOrderIds(null);
                setIsStatModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Заказали постоянные клиенты"
              value={stats?.old_clients}
              onClick={() => {
                setIsLoading(true);
                sliceNew("old");
                setOrderIds(null);
                setIsStatModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Активаций промокодов"
              value={stats?.promo_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOrigin(null);
                slicePromo();
                setOrderIds(null);
                setIsTreeModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Кафе"
              value={stats?.cafe_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOrigin("cafe");
                setOrderIds(null);
                setIsTreeModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="КЦ"
              value={stats?.cc_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOrigin("cc");
                setOrderIds(null);
                setIsTreeModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Сайт"
              value={stats?.site_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOrigin("site");
                setOrderIds(null);
                setIsTreeModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Всего заказов"
              value={stats?.total_orders}
              onClick={async () => {
                setIsLoading(true);
                sliceReset();
                setOrderIds(null);
                setIsStatModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <SiteClientsMarketingStatCard
              title="Средний чек"
              value={`${Number(stats?.avg_order_value || 0).toFixed(2)} ₽`}
            />
          </Grid>
        </Grid>
      ) : (
        <Typography>Нет данных</Typography>
      )}
    </>
  );
};
export default memo(InnerTabStats);
