"use client";

import { memo, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import SiteClientsMarketingStatCard from "./SiteClientsMarketingStatCard";
import useMarketingTabStore from "./useMarketingTabStore";
import dayjs from "dayjs";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useLoading } from "./useClientsLoadingContext";

const InnerTabStats = ({ getData, showAlert }) => {
  const {
    dateStart,
    dateEnd,
    points,
    stats,
    setStats,
    resetFilters,
    setIsModalOpen,
    setOrderIds, // drop if exists to get orders by slices
    sliceOnline,
    sliceNew,
    slicePromo,
    sliceReset,
    setOrders,
  } = useMarketingTabStore();

  const { setIsLoading } = useLoading();

  const getStats = async () => {
    if (!points.length || !dateStart || !dateEnd) {
      // showAlert("Пожалуйста, выберите кафе и даты", false);
      return;
    }
    const resData = await getData("get_marketing_stats", {
      points: points,
      date_start: dayjs(dateStart).format("YYYY-MM-DD"),
      date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
    });

    if (!resData?.st) {
      showAlert(resData?.text || "За период нет статистики", false);
      return;
    }
    setOrders(null);
    resetFilters();
    setStats(resData);
  };

  const debouncedGetStats = useDebounce(getStats, 500);
  useEffect(() => debouncedGetStats(), [points, dateStart, dateEnd]);

  return (
    <>
      {stats ? (
        <Grid
          container
          spacing={3}
          sx={{ justifyContent: "center" }}
        >
          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Всего заказов"
              value={stats?.total_orders}
              onClick={async () => {
                setIsLoading(true);
                sliceReset();
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Онлайн"
              value={stats?.online_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOnline();
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Офлайн"
              value={stats?.offline_orders}
              onClick={() => {
                setIsLoading(true);
                sliceOnline("offline");
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Активаций промокодов"
              value={stats?.promo_orders}
              onClick={() => {
                setIsLoading(true);
                slicePromo();
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Заказали новые клиенты"
              value={stats?.new_clients}
              onClick={() => {
                setIsLoading(true);
                sliceNew();
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
          >
            <SiteClientsMarketingStatCard
              title="Заказали постоянные клиенты"
              value={stats?.old_clients}
              onClick={() => {
                setIsLoading(true);
                sliceNew("old");
                setOrderIds(null);
                setIsModalOpen(true);
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
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
