"use client";

import { useMemo, useState } from "react";
import {
  Box,
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
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SectionCard from "../components/SectionCard";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import BestEmployeeCard from "../components/BestEmployeeCard";
import RankBadge from "../components/RankBadge";
import SlaChip from "../components/SlaChip";
import { getStageTypeLabel } from "../config";
import { CP_SPACE } from "../layout";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

const VARIANT_BY_INDEX = ["fastest", "stable", "sla"];

const resolveVariant = (item, index) => {
  const metric = String(item?.metric || "").toLowerCase();
  if (metric.includes("sla")) return "sla";
  if (metric.includes("stab") || metric === "cv") return "stable";
  if (metric.includes("p50") || metric.includes("speed") || metric.includes("fast")) {
    return "fastest";
  }
  return VARIANT_BY_INDEX[index % VARIANT_BY_INDEX.length];
};

const formatCardValue = (variant, item, formatters) => {
  const stageLabel = item?.stage_type ? getStageTypeLabel(item.stage_type).toLowerCase() : "";
  const onStage = stageLabel ? ` на ${stageLabel}` : "";

  if (variant === "sla") {
    return `${formatters.percent(item.sla)}${onStage}`;
  }
  if (variant === "stable") {
    return `CV: ${formatters.percent(item.stability)}${onStage}`;
  }
  return `${formatters.duration(item.p50)}${onStage}`;
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
    <Stack spacing={CP_SPACE.section}>
      <Stack spacing={CP_SPACE.group}>
        <SectionHeading
          icon={<EmojiEventsRoundedIcon fontSize="small" />}
          iconColor="#B8860B"
          iconBg="#FFF6D6"
          title="Лидеры кафе"
          subtitle="Лучшие сотрудники за период"
        />
        {topCards.length ? (
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
            {topCards.map((item, index) => {
              const variant = resolveVariant(item, index);
              return (
                <BestEmployeeCard
                  key={`${item.employee_id}-${item.stage_type || index}`}
                  variant={variant}
                  name={item.employee_name}
                  caption={formatCardValue(variant, item, formatters)}
                />
              );
            })}
          </Box>
        ) : (
          <EmptyState />
        )}
      </Stack>

      <SectionCard
        title="Лига кафе"
        subtitle="Рейтинг по эффективности"
      >
        {ranking.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>#</TableCell>
                  <TableCell sortDirection={sortBy === "point_name" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "point_name"}
                      direction={sortBy === "point_name" ? sortDirection : "asc"}
                      onClick={() => handleSort("point_name")}
                    >
                      Кафе
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "score" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "score"}
                      direction={sortBy === "score" ? sortDirection : "desc"}
                      onClick={() => handleSort("score")}
                    >
                      Score
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
                      P50 позиции
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
                    sortDirection={sortBy === "sample_size" ? sortDirection : false}
                  >
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
                {sortedRanking.map((item, index) => (
                  <TableRow
                    key={item.point_id}
                    hover
                    sx={{
                      opacity: item.is_valid_for_rating === false ? 0.6 : 1,
                    }}
                  >
                    <TableCell>
                      <RankBadge position={index + 1} />
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {item.point_name}
                        </Typography>
                        {!item.is_valid_for_rating ? (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={CP_SPACE.micro}
                            sx={{ color: "warning.dark" }}
                          >
                            <WarningAmberRoundedIcon sx={{ fontSize: 14 }} />
                            <Typography
                              variant="caption"
                              sx={{ color: "warning.dark" }}
                            >
                              мало данных
                            </Typography>
                          </Stack>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                      >
                        {formatters.number(item.score)}
                      </Typography>
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatters.integer(item.sample_size)}
                      </Typography>
                    </TableCell>
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
