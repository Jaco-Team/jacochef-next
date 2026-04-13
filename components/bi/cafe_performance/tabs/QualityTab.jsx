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
} from "@mui/material";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import ReasonsBreakdownChart from "../charts/ReasonsBreakdownChart";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

export default function QualityTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const complaintsByCategory = data.complaints_by_category || [];
  const anomalies = data.anomalies_by_stage_category || [];
  const [sortBy, setSortBy] = useState("count");
  const [sortDirection, setSortDirection] = useState("desc");
  const sortedAnomalies = useMemo(() => {
    return [...anomalies].sort((left, right) => {
      const result = compareValues(left?.[sortBy], right?.[sortBy]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [anomalies, sortBy, sortDirection]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDirection(field === "stage_type" || field === "category_name" ? "asc" : "desc");
  };

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
                  <TableCell sortDirection={sortBy === "stage_type" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "stage_type"}
                      direction={sortBy === "stage_type" ? sortDirection : "asc"}
                      onClick={() => handleSort("stage_type")}
                    >
                      Этап
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "category_name" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "category_name"}
                      direction={sortBy === "category_name" ? sortDirection : "asc"}
                      onClick={() => handleSort("category_name")}
                    >
                      Категория
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "count" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "count"}
                      direction={sortBy === "count" ? sortDirection : "desc"}
                      onClick={() => handleSort("count")}
                    >
                      Всего
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "long_count" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "long_count"}
                      direction={sortBy === "long_count" ? sortDirection : "desc"}
                      onClick={() => handleSort("long_count")}
                    >
                      Длинные
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={sortBy === "share_long_stage_percent" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "share_long_stage_percent"}
                      direction={sortBy === "share_long_stage_percent" ? sortDirection : "desc"}
                      onClick={() => handleSort("share_long_stage_percent")}
                    >
                      Доля длинных
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAnomalies.map((item) => (
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
