import {
  Box,
  Chip,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  blockBorder,
  desktopOnlySx,
  EmptyState,
  formatDateTime,
  RatingValue,
  SeverityChip,
  StatusChip,
  textSecondary,
} from "./shared";

function activateWithKeyboard(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function DesktopTable({ kind, items, dictionaries, selectedId, onOpen }) {
  const isIncident = kind === "incident";

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ ...desktopOnlySx, borderRadius: "12px", borderColor: blockBorder }}
    >
      <Table
        size="small"
        aria-label={isIncident ? "Список инцидентов" : "Список отзывов"}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "#F7F7F7" }}>
            <TableCell>Дата</TableCell>
            <TableCell>Кафе</TableCell>
            <TableCell>Оценка</TableCell>
            {isIncident ? <TableCell>Критичность</TableCell> : null}
            <TableCell>Статус</TableCell>
            <TableCell align="center">Причины</TableCell>
            <TableCell align="center">Фото</TableCell>
            <TableCell align="right">Действие</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              hover
              selected={String(selectedId) === String(item.id)}
            >
              <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(item.created_at)}</TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  {item.point_name || "—"}
                </Typography>
                {item.city_name ? (
                  <Typography sx={{ color: textSecondary, fontSize: 12 }}>
                    {item.city_name}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <RatingValue value={item.rating} />
              </TableCell>
              {isIncident ? (
                <TableCell>
                  <SeverityChip
                    value={item.severity}
                    options={dictionaries.severities}
                  />
                </TableCell>
              ) : null}
              <TableCell>
                <StatusChip
                  value={item.status}
                  options={dictionaries.statuses}
                />
              </TableCell>
              <TableCell align="center">{item.issues_count}</TableCell>
              <TableCell align="center">
                {item.has_photos ? (
                  <PhotoCameraOutlinedIcon
                    fontSize="small"
                    aria-label="Есть фото"
                  />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onOpen(item.id)}
                  aria-label={`Открыть ${isIncident ? "инцидент" : "отзыв"} ${item.id}`}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ResponsiveCards({ kind, items, dictionaries, selectedId, onOpen }) {
  const isIncident = kind === "incident";

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        "@media (min-width: 991px)": { display: "none" },
      }}
    >
      {items.map((item) => (
        <Paper
          key={item.id}
          variant="outlined"
          role="button"
          tabIndex={0}
          aria-label={`Открыть ${isIncident ? "инцидент" : "отзыв"} ${item.id}`}
          onClick={() => onOpen(item.id)}
          onKeyDown={(event) => activateWithKeyboard(event, () => onOpen(item.id))}
          sx={{
            p: 1.5,
            borderRadius: "12px",
            borderColor: String(selectedId) === String(item.id) ? "primary.main" : blockBorder,
            cursor: "pointer",
            "&:focus-visible": { outline: "3px solid", outlineColor: "primary.light" },
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }}>{item.point_name || "Кафе"}</Typography>
              <Typography sx={{ color: textSecondary, fontSize: 12 }}>
                {formatDateTime(item.created_at)}
              </Typography>
            </Box>
            <RatingValue value={item.rating} />
          </Box>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.25 }}>
            <StatusChip
              value={item.status}
              options={dictionaries.statuses}
            />
            {isIncident ? (
              <SeverityChip
                value={item.severity}
                options={dictionaries.severities}
              />
            ) : null}
            {item.issues_count ? (
              <Chip
                size="small"
                label={`Причин: ${item.issues_count}`}
                variant="outlined"
              />
            ) : null}
            {item.has_photos ? (
              <Chip
                size="small"
                icon={<PhotoCameraOutlinedIcon />}
                label="Есть фото"
                variant="outlined"
              />
            ) : null}
          </Box>
          {item.comment || item.review_comment ? (
            <Typography
              sx={{
                mt: 1.25,
                color: textSecondary,
                fontSize: 14,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                overflowWrap: "anywhere",
              }}
            >
              {item.comment || item.review_comment}
            </Typography>
          ) : null}
        </Paper>
      ))}
    </Box>
  );
}

export default function CafeReviewsList({
  kind,
  items,
  dictionaries,
  selectedId,
  onOpen,
  pagination,
  onPageChange,
}) {
  return (
    <Box>
      {items.length ? (
        <>
          <DesktopTable
            kind={kind}
            items={items}
            dictionaries={dictionaries}
            selectedId={selectedId}
            onOpen={onOpen}
          />
          <ResponsiveCards
            kind={kind}
            items={items}
            dictionaries={dictionaries}
            selectedId={selectedId}
            onOpen={onOpen}
          />
        </>
      ) : (
        <EmptyState>
          {kind === "incident"
            ? "Нет инцидентов по выбранным фильтрам"
            : "Нет отзывов по выбранным фильтрам"}
        </EmptyState>
      )}
      {pagination.total_pages > 1 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            page={pagination.page}
            count={pagination.total_pages}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
            aria-label="Навигация по страницам"
          />
        </Box>
      ) : null}
    </Box>
  );
}
