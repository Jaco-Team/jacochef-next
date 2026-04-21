"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Collapse, Stack, Typography } from "@mui/material";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import CategoryPerformanceCard from "../components/CategoryPerformanceCard";
import ChannelListItem from "../components/ChannelListItem";
import SectionHeading from "../components/SectionHeading";
import SlaByCategoryChart from "../charts/SlaByCategoryChart";
import { getOrderTypeLabel, sortByOrderTypes } from "../config";
import { CP_SPACE } from "../layout";

const formatSigned = (value, fractionDigits = 2) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  const abs = Math.abs(numeric);
  const fixed = abs
    .toFixed(fractionDigits)
    .replace(/\.00$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
  if (numeric > 0) return `+${fixed}`;
  if (numeric < 0) return `-${fixed}`;
  return fixed;
};

const buildDelta = ({ value, inverse = false, suffix = "", fractionDigits = 2 }) => {
  if (value == null) return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  if (numeric === 0) {
    return {
      label: `0${suffix}`,
      tone: "neutral",
      direction: "flat",
    };
  }

  const improving = inverse ? numeric < 0 : numeric > 0;

  return {
    label: `${formatSigned(numeric, fractionDigits)}${suffix}`,
    tone: improving ? "success" : "danger",
    direction: numeric > 0 ? "up" : "down",
  };
};

export default function DashboardTab({
  data,
  generatedAt,
  formatters,
  orderTypes,
  orderTypeNameMap,
}) {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const categoryCards = data.category_cards || [];
  const channelSummary = sortByOrderTypes(data.channel_summary || [], orderTypes);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const generatedLabel = generatedAt
    ? `Обновлено: ${dayjs(generatedAt).format("DD.MM.YYYY HH:mm")}`
    : "";

  const sortedCategoryCards = useMemo(
    () =>
      [...categoryCards].sort(
        (left, right) => Number(right?.sample_size || 0) - Number(left?.sample_size || 0),
      ),
    [categoryCards],
  );

  const topCategoryCards = sortedCategoryCards.slice(0, 3);
  const extraCategoryCards = sortedCategoryCards.slice(3);

  return (
    <Stack spacing={CP_SPACE.section}>
      <SectionHeading
        title="Метрики эффективности"
        subtitle={generatedLabel}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: CP_SPACE.component,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <KpiCard
            label="SLA позиции"
            value={formatters.percent(summary.sla_position)}
            caption="Все категории"
            icon={<PercentOutlinedIcon fontSize="small" />}
            compact
            delta={buildDelta({
              value: summary.sla_position_diff,
              suffix: "%",
              fractionDigits: 1,
            })}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <KpiCard
            label="SLA заказа"
            value={formatters.percent(summary.sla_order)}
            caption="От создания до выдачи"
            icon={<PercentOutlinedIcon fontSize="small" />}
            compact
            delta={buildDelta({
              value: summary.sla_order_diff,
              suffix: "%",
              fractionDigits: 1,
            })}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <KpiCard
            label="P50 позиции"
            value={formatters.duration(summary.p50_position)}
            caption="Медиана времени"
            icon={<TimerOutlinedIcon fontSize="small" />}
            compact
            delta={buildDelta({
              value: summary.p50_position_diff,
              inverse: true,
              suffix: " сек",
              fractionDigits: 1,
            })}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <KpiCard
            label="Обращения / 100"
            value={formatters.number(summary.complaints_per_100_orders)}
            caption="На 100 заказов"
            tone="warning"
            icon={<FeedbackOutlinedIcon fontSize="small" />}
            compact
            delta={buildDelta({
              value: summary.complaints_per_100_orders_diff,
              inverse: true,
              fractionDigits: 1,
            })}
          />
        </Box>
      </Box>

      <Stack
        spacing={CP_SPACE.group}
        sx={{ pt: CP_SPACE.group }}
      >
        <SectionHeading
          title="Производительность по категориям"
          subtitle="Топ-3 категорий по числу заказов"
        />
        {sortedCategoryCards.length ? (
          <Stack spacing={CP_SPACE.component}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: CP_SPACE.component,
              }}
            >
              {topCategoryCards.map((item) => (
                <CategoryPerformanceCard
                  key={item.category_id}
                  title={item.category_name}
                  p50={item.p50}
                  p90={item.p90}
                  sla={item.sla}
                  sampleSize={item.sample_size}
                  formatters={formatters}
                  compact
                />
              ))}
            </Box>

            {extraCategoryCards.length ? (
              <Stack spacing={CP_SPACE.group}>
                <Box
                  sx={{
                    pt: CP_SPACE.component,
                    display: "flex",
                    alignItems: "center",
                    minHeight: 40,
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => setShowAllCategories((current) => !current)}
                    endIcon={
                      showAllCategories ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />
                    }
                    sx={{
                      px: 0,
                      py: CP_SPACE.micro,
                      minWidth: 0,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 1,
                      lineHeight: 1.2,
                      color: "text.secondary",
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {showAllCategories
                      ? "Скрыть остальные категории"
                      : `Показать остальные категории (${extraCategoryCards.length})`}
                  </Button>
                </Box>

                <Collapse in={showAllCategories}>
                  <Box
                    sx={{
                      mt: CP_SPACE.component,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    {extraCategoryCards.map((item, index) => (
                      <Box
                        key={item.category_id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "minmax(0, 2fr) repeat(4, minmax(0, 1fr))",
                          },
                          gap: CP_SPACE.component,
                          px: CP_SPACE.component,
                          py: CP_SPACE.compact,
                          borderTop: index === 0 ? "none" : "1px solid",
                          borderColor: "divider",
                          alignItems: "center",
                        }}
                      >
                        <Stack spacing={CP_SPACE.micro}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {item.category_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatters.integer(item.sample_size)} заказов
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          P50 {formatters.duration(item.p50)}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          P90 {formatters.duration(item.p90)}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          SLA {formatters.percent(item.sla)}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatters.integer(item.sample_size)} заказов
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <EmptyState />
        )}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 7fr) minmax(0, 5fr)",
          },
          gap: 3,
          pt: CP_SPACE.section,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <SectionCard
            title="SLA по категориям"
            subtitle="Доля позиций в пределах норматива"
          >
            <SlaByCategoryChart data={data.sla_by_category || []} />
          </SectionCard>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <SectionCard
            title="Выдача по каналам"
            subtitle="Среднее время и объём"
          >
            {channelSummary.length ? (
              <Stack spacing={1.5}>
                {channelSummary.map((item) => (
                  <ChannelListItem
                    key={item.order_type}
                    orderType={item.order_type}
                    name={getOrderTypeLabel(item.order_type, orderTypeNameMap)}
                    rightValue={formatters.duration(item.p50)}
                    subtitle={`${formatters.integer(item.count)} заказов · SLA ${formatters.percent(item.sla)}`}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </Box>
      </Box>
    </Stack>
  );
}
