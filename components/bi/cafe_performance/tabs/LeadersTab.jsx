"use client";

import { useMemo, useState } from "react";
import {
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

export default function LeadersTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const topCards = data.top_employee_cards || [];
  const ranking = data.cafe_ranking || [];
  const [sortBy, setSortBy] = useState("score");
  const [sortDirection, setSortDirection] = useState("desc");
  const sortedRanking = useMemo(() => {
    return [...ranking].sort((left, right) => {
      const result = compareValues(left?.[sortBy], right?.[sortBy]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [ranking, sortBy, sortDirection]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDirection(field === "point_name" ? "asc" : "desc");
  };

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
                  <TableCell sortDirection={sortBy === "point_name" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "point_name"}
                      direction={sortBy === "point_name" ? sortDirection : "asc"}
                      onClick={() => handleSort("point_name")}
                    >
                      Кафе
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "score" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "score"}
                      direction={sortBy === "score" ? sortDirection : "desc"}
                      onClick={() => handleSort("score")}
                    >
                      Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "p50" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "p50"}
                      direction={sortBy === "p50" ? sortDirection : "desc"}
                      onClick={() => handleSort("p50")}
                    >
                      P50
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "p90" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "p90"}
                      direction={sortBy === "p90" ? sortDirection : "desc"}
                      onClick={() => handleSort("p90")}
                    >
                      P90
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "sla" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "sla"}
                      direction={sortBy === "sla" ? sortDirection : "desc"}
                      onClick={() => handleSort("sla")}
                    >
                      SLA
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "sample_size" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "sample_size"}
                      direction={sortBy === "sample_size" ? sortDirection : "desc"}
                      onClick={() => handleSort("sample_size")}
                    >
                      Выборка
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRanking.map((item) => (
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
