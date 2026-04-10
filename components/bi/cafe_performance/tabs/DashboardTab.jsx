"use client";

import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import SlaByCategoryChart from "../charts/SlaByCategoryChart";

export default function DashboardTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const categoryCards = data.category_cards || [];
  const channelSummary = data.channel_summary || [];

  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="SLA позиция"
            value={formatters.percent(summary.sla_position)}
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="SLA заказ"
            value={formatters.percent(summary.sla_order)}
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="P50 позиция"
            value={formatters.duration(summary.p50_position)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Жалобы на 100 заказов"
            value={formatters.number(summary.complaints_per_100_orders)}
            tone="warning"
          />
        </Grid>
      </Grid>

      <SectionCard title="Категории">
        {categoryCards.length ? (
          <Grid
            container
            spacing={2}
          >
            {categoryCards.map((item) => (
              <Grid
                key={item.category_id}
                size={{ xs: 12, md: 6, lg: 4 }}
              >
                <KpiCard
                  label={item.category_name}
                  value={formatters.duration(item.p50)}
                  caption={`P90 ${formatters.duration(item.p90)} • SLA ${formatters.percent(item.sla)} • ${formatters.integer(item.sample_size)} заказов`}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="SLA по категориям">
            <SlaByCategoryChart data={data.sla_by_category || []} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Каналы">
            {channelSummary.length ? (
              <Stack spacing={1.5}>
                {channelSummary.map((item) => (
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
      </Grid>
    </Stack>
  );
}
