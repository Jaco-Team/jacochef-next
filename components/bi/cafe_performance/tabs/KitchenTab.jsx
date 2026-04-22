"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MyAutocomplite } from "@/ui/Forms";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SectionCard from "../components/SectionCard";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import MetricLabel from "../components/MetricLabel";
import BestEmployeeCard from "../components/BestEmployeeCard";
import EmployeeAvatar from "../components/EmployeeAvatar";
import SlaChip from "../components/SlaChip";
import { BEST_EMPLOYEE_VARIANTS } from "../components/BestEmployeeCard";
import { getStageTypeLabel } from "../config";
import { CP_RADIUS, CP_SPACE } from "../layout";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

const resolveVariant = (metric) => {
  if (!metric) return "fastest";
  const normalized = String(metric).toLowerCase();
  if (normalized.includes("sla")) return "sla";
  if (normalized.includes("stab") || normalized === "cv" || normalized.includes("cv")) {
    return "stable";
  }
  return "fastest";
};

const getStageOrderLabel = (index) => `${index + 1} этап`;

function EmployeeNominations({ variants }) {
  if (!variants?.length) return null;

  return (
    <Stack
      direction="row"
      spacing={CP_SPACE.micro}
      alignItems="center"
    >
      {variants.map((variant) => {
        const config = BEST_EMPLOYEE_VARIANTS[variant];
        if (!config) return null;
        const Icon = config.Icon;

        return (
          <Tooltip
            key={variant}
            title={config.label}
            arrow
            enterTouchDelay={0}
            leaveTouchDelay={2500}
          >
            <Box
              component="span"
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: config.iconBg,
                color: config.iconFg,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 12 }} />
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

function StabilityIndicator({ value, formatters }) {
  if (value == null) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        —
      </Typography>
    );
  }

  const numeric = Number(value);
  const isMid = numeric >= 60;
  const color = numeric >= 80 ? "success.main" : isMid ? "warning.main" : "error.main";

  return (
    <Typography
      variant="body2"
      sx={{ color }}
    >
      {formatters.percent(value)}
    </Typography>
  );
}

export default function KitchenTab({
  data,
  formatters,
  stageName,
  filters,
  categories,
  stageTypes,
  onStageChange,
  onCategoryApply,
  onEmployeeOpen,
}) {
  if (!data) return <EmptyState />;

  const summary = data.stage_summary || {};
  const cards = data.best_employee_cards || [];
  const rows = data.employee_table || [];
  const [sortBy, setSortBy] = useState("p50");
  const [sortDirection, setSortDirection] = useState("asc");
  const [draftCategoryIds, setDraftCategoryIds] = useState(filters.category_ids || []);

  const selectedCategories = useMemo(
    () => categories.filter((category) => draftCategoryIds.includes(category.id)),
    [categories, draftCategoryIds],
  );

  const hasPendingCategoryChange =
    JSON.stringify(draftCategoryIds) !== JSON.stringify(filters.category_ids || []);

  useEffect(() => {
    setDraftCategoryIds(filters.category_ids || []);
  }, [filters.category_ids]);

  const employeeNominationsMap = useMemo(() => {
    const map = new Map();
    cards.forEach((item) => {
      if (!item?.employee_id) return;
      const variant = resolveVariant(item.metric);
      const current = map.get(item.employee_id) || [];
      if (!current.includes(variant)) {
        map.set(item.employee_id, [...current, variant]);
      }
    });
    return map;
  }, [cards]);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        const result = compareValues(left?.[sortBy], right?.[sortBy]);
        return sortDirection === "asc" ? result : -result;
      }),
    [rows, sortBy, sortDirection],
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDirection(field === "employee_name" ? "asc" : "desc");
  };

  const formatCardCaption = (item) => {
    const metric = String(item.metric || "").toLowerCase();
    if (metric.includes("sla")) return `SLA: ${formatters.percent(item.value)}`;
    if (metric.includes("stab") || metric === "cv") {
      return `CV: ${formatters.percent(item.value)}`;
    }
    return `P50: ${formatters.duration(item.value)}`;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: CP_SPACE.section,
      }}
    >
      <Stack spacing={CP_SPACE.group}>
        <SectionHeading
          icon={<KitchenOutlinedIcon fontSize="small" />}
          iconColor="#B8860B"
          iconBg="#FFF6D6"
          title="Производительность этапов"
          subtitle="Анализ эффективности кухни"
          action={
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={CP_SPACE.related}
              alignItems="center"
              sx={{
                width: { xs: "100%", sm: "auto" },
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <Box sx={{ minWidth: { xs: "100%", sm: 260 } }}>
                <MyAutocomplite
                  label="Категории"
                  multiple
                  data={categories}
                  value={selectedCategories}
                  func={(_, value) => setDraftCategoryIds(value.map((item) => item.id))}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                />
              </Box>
              <Button
                variant="contained"
                onClick={() => onCategoryApply(draftCategoryIds)}
                disabled={!hasPendingCategoryChange}
                sx={{
                  alignSelf: { xs: "stretch", sm: "center" },
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: { sm: 120 },
                }}
              >
                Выбрать
              </Button>
            </Stack>
          }
        />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={filters.stage_type || ""}
          onChange={(_, value) => {
            if (value) onStageChange(value);
          }}
          sx={{
            backgroundColor: "action.hover",
            borderRadius: CP_RADIUS.control,
            p: CP_SPACE.micro,
            width: "fit-content",
            "& .MuiToggleButton-root": {
              border: 0,
              borderRadius: CP_RADIUS.control,
              px: CP_SPACE.component,
              py: CP_SPACE.related,
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: CP_SPACE.micro,
              minWidth: 112,
              textAlign: "center",
            },
            "& .MuiToggleButton-root.Mui-selected": {
              backgroundColor: "background.paper",
              color: "text.primary",
              boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
            },
            "& .MuiToggleButton-root .stage-order": {
              fontSize: 11,
              lineHeight: 1.2,
              fontWeight: 500,
              color: "text.disabled",
            },
            "& .MuiToggleButton-root.Mui-selected .stage-order": {
              color: "text.secondary",
            },
            "& .MuiToggleButton-root.Mui-selected:hover": {
              backgroundColor: "background.paper",
            },
          }}
        >
          {stageTypes.map((stage, index) => (
            <ToggleButton
              key={stage.id}
              value={stage.id}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {getStageTypeLabel(stage.id)}
              </Typography>
              <Typography
                component="span"
                className="stage-order"
              >
                {getStageOrderLabel(index)}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          px: { xs: 2, md: 3 },
          py: CP_SPACE.component,
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: CP_SPACE.component,
        }}
      >
        {[
          { label: "P50", value: formatters.duration(summary.p50) },
          { label: "P90", value: formatters.duration(summary.p90) },
          { label: "SLA", value: formatters.percent(summary.sla) },
          {
            label: "Длинные",
            value: formatters.percent(summary.share_long_stage_percent),
          },
          { label: "Количество", value: formatters.integer(summary.count) },
        ].map((metric) => (
          <Stack
            key={metric.label}
            spacing={CP_SPACE.micro}
            alignItems="center"
            sx={{ textAlign: "center" }}
          >
            <MetricLabel
              text={metric.label}
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}
            />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              {metric.value}
            </Typography>
          </Stack>
        ))}
      </Box>

      {cards.length ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {cards.map((item) => {
            const variant = resolveVariant(item.metric);
            const label = BEST_EMPLOYEE_VARIANTS[variant]?.label;
            return (
              <BestEmployeeCard
                key={`${item.employee_id || item.id}-${item.metric}`}
                variant={variant}
                label={label}
                name={item.employee_name}
                caption={formatCardCaption(item)}
                onClick={() => onEmployeeOpen(item)}
                ariaLabel={`Открыть сотрудника ${item.employee_name}`}
              />
            );
          })}
        </Box>
      ) : null}

      <SectionCard title={`Сотрудники на этапе «${stageName || "—"}»`}>
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
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "p50" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "p50"}
                      direction={sortBy === "p50" ? sortDirection : "asc"}
                      onClick={() => handleSort("p50")}
                    >
                      P50
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "p90" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "p90"}
                      direction={sortBy === "p90" ? sortDirection : "asc"}
                      onClick={() => handleSort("p90")}
                    >
                      P90
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "sla" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "sla"}
                      direction={sortBy === "sla" ? sortDirection : "desc"}
                      onClick={() => handleSort("sla")}
                    >
                      SLA
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "stability" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "stability"}
                      direction={sortBy === "stability" ? sortDirection : "desc"}
                      onClick={() => handleSort("stability")}
                    >
                      Стабильность
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((item) => {
                  const nominations = employeeNominationsMap.get(item.employee_id) || [];
                  return (
                    <TableRow
                      key={item.employee_id}
                      hover
                      onClick={() => onEmployeeOpen(item)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <EmployeeAvatar
                            name={item.employee_name}
                            size={36}
                          />
                          <Stack spacing={CP_SPACE.micro}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {item.employee_name}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={CP_SPACE.related}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <EmployeeNominations variants={nominations} />
                              {!item.is_valid_for_rating ? (
                                <WarningAmberRoundedIcon
                                  sx={{ fontSize: 14, color: "warning.dark" }}
                                />
                              ) : null}
                            </Stack>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          {formatters.duration(item.p50)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatters.duration(item.p90)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <SlaChip
                          value={item.sla}
                          formatter={formatters.percent}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                        >
                          <StabilityIndicator
                            value={item.stability}
                            formatters={formatters}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState />
        )}
      </SectionCard>
    </Box>
  );
}
