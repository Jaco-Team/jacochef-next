import {
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import {
  blockBackground,
  blockBorder,
  desktopOnlySx,
  mobileOnlySx,
  tabletOnlySx,
  textSecondary,
} from "./shared";

const kpiDefinitions = [
  { key: "reviews_total", label: "Всего отзывов", icon: ReviewsOutlinedIcon },
  { key: "average_rating", label: "Средняя оценка", icon: StarRoundedIcon, decimals: 1 },
  { key: "incidents_total", label: "Всего инцидентов", icon: ReportProblemOutlinedIcon },
  { key: "incidents_open", label: "Открытые инциденты", icon: TaskAltOutlinedIcon },
  { key: "reviews_with_photos", label: "Отзывы с фото", icon: PhotoCameraOutlinedIcon },
];

function KpiCards({ summary }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        "@media (min-width: 668px) and (max-width: 990px)": {
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        },
        "@media (min-width: 991px)": {
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        },
        gap: 1.5,
      }}
    >
      {kpiDefinitions.map(({ key, label, icon: Icon, decimals }) => {
        const value = summary[key] || 0;
        return (
          <Paper
            key={key}
            variant="outlined"
            sx={{ p: 2, borderRadius: "12px", borderColor: blockBorder, minWidth: 0 }}
          >
            <Icon
              aria-hidden="true"
              sx={{ color: "primary.main", mb: 1 }}
            />
            <Typography
              sx={{
                fontSize: 22,
                "@media (min-width: 991px)": { fontSize: 28 },
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {decimals ? Number(value).toFixed(decimals) : value}
            </Typography>
            <Typography sx={{ mt: 0.75, color: textSecondary, fontSize: 13 }}>{label}</Typography>
          </Paper>
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
    <Paper
      component="section"
      aria-labelledby="rating-distribution-title"
      variant="outlined"
      sx={{ p: 2, borderRadius: "12px", borderColor: blockBorder }}
    >
      <Typography
        id="rating-distribution-title"
        sx={{ fontSize: 18, fontWeight: 800, mb: 2 }}
      >
        Распределение оценок
      </Typography>
      <Box sx={{ display: "grid", gap: 1.25 }}>
        {rows.map((item) => (
          <Box
            key={item.rating}
            sx={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 52px",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>{item.rating} ★</Typography>
            <LinearProgress
              variant="determinate"
              value={total ? Math.min(100, (item.count / total) * 100) : 0}
              aria-label={`${item.rating} звёзд: ${item.count}`}
              sx={{ height: 8, borderRadius: 999 }}
            />
            <Typography sx={{ textAlign: "right", color: textSecondary }}>{item.count}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function PointCards({ points }) {
  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      {points.map((point) => (
        <Paper
          key={point.point_id}
          variant="outlined"
          sx={{ p: 1.75, borderRadius: "12px", borderColor: blockBorder }}
        >
          <Typography sx={{ fontWeight: 800 }}>{point.point_name || "Кафе"}</Typography>
          {point.city_name ? (
            <Typography sx={{ color: textSecondary, fontSize: 12, mb: 1 }}>
              {point.city_name}
            </Typography>
          ) : null}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: textSecondary }}>Отзывы</Typography>
              <Typography sx={{ fontWeight: 700 }}>{point.reviews_total}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: textSecondary }}>С фото</Typography>
              <Typography sx={{ fontWeight: 700 }}>{point.reviews_with_photos}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: textSecondary }}>Оценка</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {Number(point.average_rating).toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: textSecondary }}>Инциденты</Typography>
              <Typography sx={{ fontWeight: 700 }}>{point.incidents_total}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: textSecondary }}>Открыто</Typography>
              <Typography sx={{ fontWeight: 700 }}>{point.incidents_open}</Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
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
          gap: 2,
          alignItems: "start",
        }}
      >
        <RatingDistribution
          items={dashboard.rating_distribution}
          total={dashboard.summary.completed_total}
        />
        <Box
          component="section"
          aria-labelledby="points-summary-title"
          sx={{
            bgcolor: blockBackground,
            borderRadius: "12px",
            p: 1.5,
            "@media (min-width: 991px)": { p: 2 },
          }}
        >
          <Typography
            id="points-summary-title"
            sx={{ fontSize: 18, fontWeight: 800, mb: 1.5 }}
          >
            Кафе
          </Typography>
          {dashboard.points.length ? (
            <>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ ...desktopOnlySx, borderRadius: "12px", borderColor: blockBorder }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F7F7F7" }}>
                      <TableCell>Кафе</TableCell>
                      <TableCell align="right">Отзывы</TableCell>
                      <TableCell align="right">С фото</TableCell>
                      <TableCell align="right">Средняя оценка</TableCell>
                      <TableCell align="right">Инциденты</TableCell>
                      <TableCell align="right">Открытые инциденты</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.points.map((point) => (
                      <TableRow
                        key={point.point_id}
                        hover
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>
                            {point.point_name || "Кафе"}
                          </Typography>
                          {point.city_name ? (
                            <Typography sx={{ color: textSecondary, fontSize: 12 }}>
                              {point.city_name}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell align="right">{point.reviews_total}</TableCell>
                        <TableCell align="right">{point.reviews_with_photos}</TableCell>
                        <TableCell align="right">
                          {Number(point.average_rating).toFixed(1)}
                        </TableCell>
                        <TableCell align="right">{point.incidents_total}</TableCell>
                        <TableCell align="right">{point.incidents_open}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={tabletOnlySx}>
                <PointCards points={dashboard.points} />
              </Box>
              <Box sx={mobileOnlySx}>
                <PointCards points={dashboard.points} />
              </Box>
            </>
          ) : (
            <Typography sx={{ p: 2, color: textSecondary }}>
              Нет данных по выбранным фильтрам
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
