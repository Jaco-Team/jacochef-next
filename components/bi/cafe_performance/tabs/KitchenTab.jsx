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
import { MyAutocomplite } from "@/ui/Forms";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import { getStageTypeLabel } from "../config";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

export default function KitchenTab({
  data,
  formatters,
  stageName,
  filters,
  categories,
  stageTypes,
  onFilterChange,
  onStageChange,
}) {
  if (!data) return <EmptyState />;

  const summary = data.stage_summary || {};
  const cards = data.best_employee_cards || [];
  const rows = data.employee_table || [];
  const [sortBy, setSortBy] = useState("employee_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const selectedCategories = useMemo(
    () => categories.filter((category) => filters.category_ids.includes(category.id)),
    [categories, filters.category_ids],
  );
  const sortedRows = useMemo(() => {
    return [...rows].sort((left, right) => {
      const result = compareValues(left?.[sortBy], right?.[sortBy]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, sortBy, sortDirection]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDirection(field === "employee_name" ? "asc" : "desc");
  };

  return (
    <Stack spacing={3}>
      <SectionCard title="Фильтры кухни">
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <MyAutocomplite
              label="Категории"
              multiple
              data={categories}
              value={selectedCategories}
              func={(_, value) =>
                onFilterChange(
                  "category_ids",
                  value.map((item) => item.id),
                )
              }
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={filters.stage_type || ""}
              onChange={(_, value) => {
                if (value) onStageChange(value);
              }}
            >
              {stageTypes.map((stage) => (
                <ToggleButton
                  key={stage.id}
                  value={stage.id}
                >
                  {getStageTypeLabel(stage.id)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </SectionCard>

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
                size={{ xs: 12, md: 6, lg: 4 }}
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
                  <TableCell sortDirection={sortBy === "employee_name" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "employee_name"}
                      direction={sortBy === "employee_name" ? sortDirection : "asc"}
                      onClick={() => handleSort("employee_name")}
                    >
                      Сотрудник
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
                  <TableCell sortDirection={sortBy === "stability" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "stability"}
                      direction={sortBy === "stability" ? sortDirection : "desc"}
                      onClick={() => handleSort("stability")}
                    >
                      Стабильность
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
                      Длинные этапы
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
                {sortedRows.map((item) => (
                  <TableRow key={item.employee_id}>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">{item.employee_name}</Typography>
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
