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
  Typography,
} from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

export default function KitchenTab({ data, formatters, stageName }) {
  if (!data) return <EmptyState />;

  const summary = data.stage_summary || {};
  const cards = data.best_employee_cards || [];
  const rows = data.employee_table || [];

  return (
    <Stack spacing={3}>
      <SectionCard
        title="Сводка этапа"
        subtitle={stageName ? `Текущий этап: ${stageName}` : null}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <KpiCard
              label="P50"
              value={formatters.duration(summary.p50)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <KpiCard
              label="P90"
              value={formatters.duration(summary.p90)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
            <KpiCard
              label="SLA"
              value={formatters.percent(summary.sla)}
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6, xl: 3 }}>
            <KpiCard
              label="Доля длинных этапов"
              value={formatters.percent(summary.share_long_stage_percent)}
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6, xl: 3 }}>
            <KpiCard
              label="Количество"
              value={formatters.integer(summary.count)}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="Лучшие сотрудники">
        {cards.length ? (
          <Grid
            container
            spacing={2}
          >
            {cards.map((item) => (
              <Grid
                key={item.id}
                size={{ xs: 12, md: 6, xl: 4 }}
              >
                <KpiCard
                  label={item.employee_name}
                  value={
                    item.metric === "p50"
                      ? formatters.duration(item.value)
                      : formatters.number(item.value)
                  }
                  caption={`${item.metric.toUpperCase()} • ${formatters.integer(item.sample_size)} позиций`}
                  tone="success"
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      <SectionCard title="Сравнение сотрудников">
        {rows.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>P50</TableCell>
                  <TableCell>P90</TableCell>
                  <TableCell>SLA</TableCell>
                  <TableCell>Стабильность</TableCell>
                  <TableCell>Длинные этапы</TableCell>
                  <TableCell>Выборка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.employee_id}>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography sx={{ fontWeight: 600 }}>{item.employee_name}</Typography>
                        {!item.is_valid_for_rating && (
                          <Typography
                            variant="caption"
                            color="warning.main"
                          >
                            мало данных
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatters.duration(item.p50)}</TableCell>
                    <TableCell>{formatters.duration(item.p90)}</TableCell>
                    <TableCell>{formatters.percent(item.sla)}</TableCell>
                    <TableCell>{formatters.percent(item.stability)}</TableCell>
                    <TableCell>{formatters.percent(item.share_long_stage_percent)}</TableCell>
                    <TableCell>{formatters.integer(item.sample_size)}</TableCell>
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
