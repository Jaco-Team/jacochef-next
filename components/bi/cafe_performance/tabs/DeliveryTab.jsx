"use client";

import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import DeliveryTrendChart from "../charts/DeliveryTrendChart";

export default function DeliveryTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const overall = data.overall || {};
  const channelCards = data.channel_cards || [];

  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="P50 доставки"
            value={formatters.duration(overall.p50)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="P90 доставки"
            value={formatters.duration(overall.p90)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="SLA доставки"
            value={formatters.percent(overall.sla)}
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Количество заказов"
            value={formatters.integer(overall.count)}
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Каналы">
            {channelCards.length ? (
              <Stack spacing={1.5}>
                {channelCards.map((item) => (
                  <Card
                    key={item.order_type}
                    variant="outlined"
                  >
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{item.order_type}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          P50 {formatters.duration(item.p50)} • P90 {formatters.duration(item.p90)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          SLA {formatters.percent(item.sla)} • {formatters.integer(item.count)}{" "}
                          заказов
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Тренд P50 по каналам">
            <DeliveryTrendChart data={data.trend || []} />
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
