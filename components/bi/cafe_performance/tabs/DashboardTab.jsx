"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Collapse, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import CategoryPerformanceCard from "../components/CategoryPerformanceCard";
import CategoryPerformanceRow from "../components/CategoryPerformanceRow";
import ChannelListItem from "../components/ChannelListItem";
import SectionHeading from "../components/SectionHeading";
import MetricLegendModal from "../components/MetricLegendModal";
import SlaByCategoryChart from "../charts/SlaByCategoryChart";
import { buildDashboardMetricConfigs } from "../dashboardMetricConfig";
import { buildCategoryLegendMetric } from "../dashboardCategoryConfig";
import { getOrderTypeLabel, sortByOrderTypes } from "../config";
import { CP_SPACE } from "../layout";

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
  const [activeLegend, setActiveLegend] = useState(null);
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

  const metricConfigs = useMemo(
    () => buildDashboardMetricConfigs({ summary, formatters }),
    [formatters, summary],
  );
  const summaryCards = useMemo(
    () =>
      Object.entries(metricConfigs).map(([id, item]) => ({
        id,
        ...item.card,
      })),
    [metricConfigs],
  );
  const openMetricLegend = (metricId) => setActiveLegend(metricConfigs[metricId] || null);
  const openCategoryLegend = (item) =>
    setActiveLegend(buildCategoryLegendMetric({ item, formatters }));

  return (
    <>
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
          {summaryCards.map((card) => (
            <Box
              key={card.id}
              sx={{ minWidth: 0 }}
            >
              <KpiCard
                label={card.label}
                value={card.value}
                caption={card.caption}
                tone={card.tone}
                icon={card.icon}
                compact
                delta={card.delta}
                onClick={() => openMetricLegend(card.id)}
                ariaLabel={`Открыть описание расчёта метрики ${card.label}`}
                sx={{
                  cursor: "pointer",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                    borderColor: "primary.light",
                  },
                }}
              />
            </Box>
          ))}
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
                    onClick={() => openCategoryLegend(item)}
                    ariaLabel={`Открыть описание категории ${item.category_name}`}
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
                            borderTop: index === 0 ? "none" : "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <CategoryPerformanceRow
                            item={item}
                            formatters={formatters}
                            onClick={() => openCategoryLegend(item)}
                          />
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

      <MetricLegendModal
        open={Boolean(activeLegend)}
        onClose={() => setActiveLegend(null)}
        metric={activeLegend}
      />
    </>
  );
}
