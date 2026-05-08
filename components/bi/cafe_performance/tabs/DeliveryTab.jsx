"use client";

import { Grid, Stack } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import DeliveryDiningRoundedIcon from "@mui/icons-material/DeliveryDiningRounded";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import DeliveryChannelCard from "../components/DeliveryChannelCard";
import DeliveryTrendChart from "../charts/DeliveryTrendChart";
import { getOrderTypeLabel, sortByOrderTypes } from "../config";
import { CP_SPACE } from "../layout";

export default function DeliveryTab({
  data,
  formatters,
  orderTypes,
  orderTypeNameMap,
  onOrderTypeOpen,
}) {
  if (!data) return <EmptyState />;

  const orderTypeCards = sortByOrderTypes(data.order_type_cards || [], orderTypes);
  const deliveryOrderType =
    orderTypeCards.find((item) => String(item?.order_type) === "DELIVERY") || null;
  const bestSlaOrderType = orderTypeCards.reduce((best, item) => {
    if (item?.sla == null) return best;
    if (!best || Number(item.sla) > Number(best.sla)) return item;
    return best;
  }, null);
  const totalOrders = orderTypeCards.reduce((sum, item) => sum + Number(item?.count || 0), 0);
  const openOrderTypeDetails = (item) => {
    if (!onOrderTypeOpen) return;

    onOrderTypeOpen(item.order_type, {
      id: "sla_order",
      value: formatters.percent(item.sla),
      label: getOrderTypeLabel(item.order_type, orderTypeNameMap),
      detail_type: "sla_order",
      card: {
        delta: null,
      },
    });
  };

  return (
    <Stack spacing={CP_SPACE.section}>
      <SectionHeading
        icon={<DeliveryDiningRoundedIcon fontSize="small" />}
        iconColor="#1565C0"
        iconBg="#E7EFFD"
        title="Выдача и доставка"
        subtitle="Время от готовности до получения клиентом"
      />

      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            label="P50 (Доставка)"
            value={formatters.duration(deliveryOrderType?.p50)}
            tone="info"
            icon={<TimerOutlinedIcon fontSize="small" />}
            caption={
              deliveryOrderType
                ? getOrderTypeLabel(deliveryOrderType.order_type, orderTypeNameMap)
                : null
            }
            sx={{ height: "auto" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            label="Лучший SLA"
            value={formatters.percent(bestSlaOrderType?.sla)}
            tone="success"
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            caption={
              bestSlaOrderType
                ? getOrderTypeLabel(bestSlaOrderType.order_type, orderTypeNameMap)
                : null
            }
            sx={{ height: "auto" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            label="Всего заказов"
            value={formatters.integer(totalOrders)}
            icon={<ShoppingBasketOutlinedIcon fontSize="small" />}
            caption="Доставка + самовывоз + зал"
            sx={{ height: "auto" }}
          />
        </Grid>
      </Grid>

      {orderTypeCards.length ? (
        <Grid
          container
          spacing={2}
        >
          {orderTypeCards.map((item) => (
            <Grid
              key={item.order_type}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <DeliveryChannelCard
                orderType={item.order_type}
                name={getOrderTypeLabel(item.order_type, orderTypeNameMap)}
                count={item.count}
                p50={item.p50}
                p90={item.p90}
                sla={item.sla}
                formatters={formatters}
                onClick={() => openOrderTypeDetails(item)}
                ariaLabel={`Открыть детализацию типа заказа ${getOrderTypeLabel(item.order_type, orderTypeNameMap)}`}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      <SectionCard
        title="Динамика P50 по типам заказа"
        subtitle="Минуты ожидания в течение периода"
      >
        <DeliveryTrendChart
          data={data.trend || []}
          orderTypes={orderTypes}
          orderTypeNameMap={orderTypeNameMap}
        />
      </SectionCard>
    </Stack>
  );
}
