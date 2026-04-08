"use client";

import {
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import ReasonsBreakdownChart from "../charts/ReasonsBreakdownChart";

export default function QualityTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const complaintsByCategory = data.complaints_by_category || [];
  const anomalies = data.anomalies_by_stage_category || [];

  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Жалобы / 100 заказов"
            value={formatters.number(summary.complaints_per_100_orders)}
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Жалобы / 100 позиций"
            value={formatters.number(summary.complaints_per_100_items)}
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Ремейки / 100 позиций"
            value={formatters.number(summary.remakes_per_100_items)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Доля аномалий"
            value={formatters.percent(summary.anomaly_share_percent)}
            tone="danger"
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Причины жалоб">
            <ReasonsBreakdownChart data={data.reasons_breakdown || []} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Жалобы по категориям">
            {complaintsByCategory.length ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Категория</TableCell>
                      <TableCell>Жалобы / 100 позиций</TableCell>
                      <TableCell>Жалобы</TableCell>
                      <TableCell>Позиции</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complaintsByCategory.map((item) => (
                      <TableRow key={item.category_id}>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell>{formatters.number(item.complaints_per_100_items)}</TableCell>
                        <TableCell>{formatters.integer(item.complaints_count)}</TableCell>
                        <TableCell>{formatters.integer(item.item_count)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Аномалии по этапам и категориям">
        {anomalies.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Этап</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Всего</TableCell>
                  <TableCell>Длинные</TableCell>
                  <TableCell>Доля длинных</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anomalies.map((item) => (
                  <TableRow key={`${item.stage_type}-${item.category_id}`}>
                    <TableCell>{item.stage_type}</TableCell>
                    <TableCell>{item.category_name}</TableCell>
                    <TableCell>{formatters.integer(item.count)}</TableCell>
                    <TableCell>{formatters.integer(item.long_count)}</TableCell>
                    <TableCell>{formatters.percent(item.share_long_stage_percent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState />
        )}
      </SectionCard>
    </Stack>
  );
}
