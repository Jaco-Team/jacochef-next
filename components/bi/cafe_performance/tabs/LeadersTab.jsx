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

export default function LeadersTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const topCards = data.top_employee_cards || [];
  const ranking = data.cafe_ranking || [];

  return (
    <Stack spacing={3}>
      <SectionCard title="Топ сотрудники">
        {topCards.length ? (
          <Grid
            container
            spacing={2}
          >
            {topCards.map((item) => (
              <Grid
                key={`${item.employee_id}-${item.stage_type}`}
                size={{ xs: 12, md: 6, lg: 4 }}
              >
                <KpiCard
                  label={`${item.employee_name} • ${item.stage_type}`}
                  value={formatters.percent(item.sla)}
                  caption={`P50 ${formatters.duration(item.p50)} • Стабильность ${formatters.percent(item.stability)} • ${formatters.integer(item.sample_size)} позиций`}
                  tone="success"
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      <SectionCard title="Рейтинг кафе">
        {ranking.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Кафе</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>P50</TableCell>
                  <TableCell>P90</TableCell>
                  <TableCell>SLA</TableCell>
                  <TableCell>Выборка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ranking.map((item) => (
                  <TableRow key={item.point_id}>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">{item.point_name}</Typography>
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
                    <TableCell>{formatters.number(item.score)}</TableCell>
                    <TableCell>{formatters.duration(item.p50)}</TableCell>
                    <TableCell>{formatters.duration(item.p90)}</TableCell>
                    <TableCell>{formatters.percent(item.sla)}</TableCell>
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
