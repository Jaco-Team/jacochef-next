import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  JacoSurface,
  uiColors,
  uiRadii,
  uiTableColors,
  uiTypography,
} from "@/design-system/shared/ui";
import {
  desktopOnlySx,
  mobileOnlySx,
  sectionTitleSx,
  tableCellSx,
  tableHeadCellSx,
  tabletOnlySx,
} from "./shared";

const kpiDefinitions = [
  { key: "reviews_total", label: "Всего отзывов" },
  { key: "average_rating", label: "Средняя оценка", decimals: 1 },
  { key: "incidents_total", label: "Всего инцидентов" },
  { key: "incidents_open", label: "Открытые инциденты", attention: true },
  { key: "reviews_with_photos", label: "Отзывы с фото" },
];

const pointMetrics = [
  { key: "reviews_total", label: "Отзывы" },
  { key: "reviews_with_photos", label: "С фото" },
  { key: "average_rating", label: "Средняя оценка", decimals: 1 },
  { key: "incidents_total", label: "Инциденты" },
  { key: "incidents_open", label: "Открытые инциденты", attention: true },
];

function formatMetric(value, decimals) {
  return decimals ? Number(value || 0).toFixed(decimals) : value || 0;
}

function KpiCards({ summary }) {
  return (
    <Box
      role="group"
      aria-label="Ключевые показатели"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 2,
      }}
    >
      {kpiDefinitions.map(({ key, label, decimals, attention }) => {
        const value = summary[key] || 0;

        return (
          <JacoSurface
            key={key}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1.25,
              minHeight: 112,
              minWidth: 0,
              p: 2,
            }}
          >
            <Typography
              component="div"
              sx={{ fontSize: 15, fontWeight: 600, color: uiColors.textStrong }}
            >
              {label}
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 700,
                // Open incidents are the one number that calls for action.
                color: attention && value > 0 ? uiColors.primary : uiColors.textStrong,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMetric(value, decimals)}
            </Typography>
          </JacoSurface>
        );
      })}
    </Box>
  );
}

function RatingDistribution({ items, total }) {
  const rows = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: items.find((item) => item.rating === rating)?.count || 0,
  }));

  return (
    <JacoSurface
      component="section"
      aria-labelledby="rating-distribution-title"
      sx={{ p: { xs: 2, md: 2.5 } }}
    >
      <Typography
        id="rating-distribution-title"
        component="h2"
        sx={{ ...sectionTitleSx, mb: 2 }}
      >
        Распределение оценок
      </Typography>
      <Box sx={{ display: "grid", gap: 1.25 }}>
        {rows.map((item) => (
          <Box
            key={item.rating}
            sx={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 44px",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography sx={{ ...uiTypography.label, color: uiColors.textStrong }}>
              {item.rating} ★
            </Typography>
            <LinearProgress
              variant="determinate"
              value={total ? Math.min(100, (item.count / total) * 100) : 0}
              aria-label={`${item.rating} звёзд: ${item.count}`}
              sx={{
                height: 8,
                borderRadius: uiRadii.full,
                backgroundColor: uiColors.surfaceMuted,
                "& .MuiLinearProgress-bar": {
                  borderRadius: uiRadii.full,
                  backgroundColor: uiColors.primary,
                },
              }}
            />
            <Typography
              sx={{
                ...uiTypography.label,
                textAlign: "right",
                color: uiColors.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>
    </JacoSurface>
  );
}

function PointCards({ points }) {
  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      {points.map((point) => (
        <JacoSurface
          key={point.point_id}
          sx={{ p: 2, borderRadius: uiRadii.md }}
        >
          <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
            {point.point_name || "Кафе"}
          </Typography>
          {point.city_name ? (
            <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text, mb: 1 }}>
              {point.city_name}
            </Typography>
          ) : null}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
            {pointMetrics.map(({ key, label, decimals, attention }) => (
              <Box key={key}>
                <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
                  {label}
                </Typography>
                <Typography
                  sx={{
                    ...uiTypography.bodyMedium,
                    color: attention && point[key] > 0 ? uiColors.primary : uiColors.textStrong,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMetric(point[key], decimals)}
                </Typography>
              </Box>
            ))}
          </Box>
        </JacoSurface>
      ))}
    </Box>
  );
}

function PointsTable({ points }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeadCellSx}>Кафе</TableCell>
            {pointMetrics.map(({ key, label }) => (
              <TableCell
                key={key}
                align="right"
                sx={tableHeadCellSx}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {points.map((point) => (
            <TableRow
              key={point.point_id}
              sx={{
                "&:hover": { backgroundColor: uiTableColors.rowHover },
                "&:last-of-type td": { borderBottom: 0 },
              }}
            >
              <TableCell sx={tableCellSx}>
                <Typography sx={{ ...uiTypography.label, fontWeight: 600, color: "inherit" }}>
                  {point.point_name || "Кафе"}
                </Typography>
                {point.city_name ? (
                  <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
                    {point.city_name}
                  </Typography>
                ) : null}
              </TableCell>
              {pointMetrics.map(({ key, decimals, attention }) => (
                <TableCell
                  key={key}
                  align="right"
                  sx={{
                    ...tableCellSx,
                    ...(attention && point[key] > 0
                      ? { color: uiColors.primary, fontWeight: 600 }
                      : null),
                  }}
                >
                  {formatMetric(point[key], decimals)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function CafeReviewsOverview({ dashboard }) {
  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <KpiCards summary={dashboard.summary} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          "@media (min-width: 991px)": { gridTemplateColumns: "minmax(300px, 0.75fr) 1.5fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <RatingDistribution
          items={dashboard.rating_distribution}
          total={dashboard.summary.completed_total}
        />
        <JacoSurface
          component="section"
          aria-labelledby="points-summary-title"
          sx={{ overflow: "hidden" }}
        >
          <Typography
            id="points-summary-title"
            component="h2"
            sx={{ ...sectionTitleSx, px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 }, pb: 2 }}
          >
            Кафе
          </Typography>
          {dashboard.points.length ? (
            <>
              <Box sx={desktopOnlySx}>
                <PointsTable points={dashboard.points} />
              </Box>
              <Box sx={{ ...tabletOnlySx, px: 2, pb: 2 }}>
                <PointCards points={dashboard.points} />
              </Box>
              <Box sx={{ ...mobileOnlySx, px: 2, pb: 2 }}>
                <PointCards points={dashboard.points} />
              </Box>
            </>
          ) : (
            <Typography sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5, color: uiColors.text }}>
              Нет данных по выбранным фильтрам
            </Typography>
          )}
        </JacoSurface>
      </Box>
    </Box>
  );
}
