import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  JacoIconButton,
  JacoStatusChip,
  JacoSurface,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTableColors,
  uiTypography,
} from "@/design-system/shared/ui";
import {
  desktopOnlySx,
  EmptyState,
  formatDateTime,
  RatingValue,
  SeverityChip,
  StatusChip,
  tableCellSx,
  tableHeadCellSx,
  ZoneChip,
} from "./shared";

const sortLabelSx = {
  color: "inherit",
  fontWeight: "inherit",
  "&:hover, &.Mui-active": { color: uiColors.textStrong },
  "&.Mui-active .MuiTableSortLabel-icon": { color: uiColors.primary },
};

function activateWithKeyboard(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function DesktopTable({
  kind,
  items,
  dictionaries,
  selectedId,
  onOpen,
  showActions = false,
  sort,
  direction,
  onSort,
}) {
  const isIncident = kind === "incident";
  const sortable = (label, key) => (
    <TableSortLabel
      active={sort === key}
      direction={sort === key ? direction : "desc"}
      onClick={() => onSort(key)}
      sx={sortLabelSx}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <JacoSurface sx={{ ...desktopOnlySx, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "60dvh" }}>
        <Table
          size="small"
          stickyHeader
          aria-label={isIncident ? "Список инцидентов" : "Список отзывов"}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadCellSx}>{sortable("Дата", "created_at")}</TableCell>
              <TableCell sx={tableHeadCellSx}>Кафе</TableCell>
              <TableCell sx={tableHeadCellSx}>{sortable("Оценка", "rating")}</TableCell>
              {isIncident ? (
                <TableCell sx={tableHeadCellSx}>{sortable("Критичность", "severity")}</TableCell>
              ) : null}
              <TableCell sx={tableHeadCellSx}>{sortable("Статус", "status")}</TableCell>
              <TableCell
                align="center"
                sx={tableHeadCellSx}
              >
                {sortable("Причины", "issues_count")}
              </TableCell>
              <TableCell
                align="center"
                sx={tableHeadCellSx}
              >
                Фото
              </TableCell>
              {showActions ? (
                <TableCell
                  align="right"
                  sx={tableHeadCellSx}
                >
                  Действия
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const isSelected = String(selectedId) === String(item.id);

              return (
                <TableRow
                  key={item.id}
                  aria-selected={isSelected}
                  tabIndex={0}
                  role="button"
                  onClick={() => onOpen(item.id)}
                  onKeyDown={(event) => activateWithKeyboard(event, () => onOpen(item.id))}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected ? uiStateColors.selectedSoft : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? uiStateColors.selectedSoft
                        : uiTableColors.rowHover,
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${uiColors.primary}`,
                      outlineOffset: -2,
                    },
                    "&:last-of-type td": { borderBottom: 0 },
                  }}
                >
                  <TableCell sx={{ ...tableCellSx, whiteSpace: "nowrap" }}>
                    {formatDateTime(item.created_at)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    <Typography sx={{ ...uiTypography.label, fontWeight: 600, color: "inherit" }}>
                      {item.point_name || "—"}
                    </Typography>
                    {item.city_name ? (
                      <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
                        {item.city_name}
                      </Typography>
                    ) : null}
                    {item.zone_code || item.zone_label ? (
                      <Box sx={{ mt: 0.5 }}>
                        <ZoneChip
                          code={item.zone_code}
                          label={item.zone_label}
                        />
                      </Box>
                    ) : null}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    <RatingValue
                      value={item.rating}
                      isIncident={isIncident || item.is_incident}
                    />
                  </TableCell>
                  {isIncident ? (
                    <TableCell sx={tableCellSx}>
                      <SeverityChip
                        value={item.severity}
                        options={dictionaries.severities}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell sx={tableCellSx}>
                    <StatusChip
                      value={item.status}
                      options={dictionaries.statuses}
                      highlightNew={isIncident}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={tableCellSx}
                  >
                    {item.issues_count}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ ...tableCellSx, color: uiColors.text }}
                  >
                    {item.has_photos ? (
                      <PhotoCameraOutlinedIcon
                        fontSize="small"
                        aria-label="Есть фото"
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {showActions ? (
                    <TableCell
                      align="right"
                      sx={tableCellSx}
                    >
                      <JacoIconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(item.id);
                        }}
                        aria-label={`Открыть ${isIncident ? "инцидент" : "отзыв"} ${item.id}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </JacoIconButton>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </JacoSurface>
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
      {items.map((item) => {
        const isSelected = String(selectedId) === String(item.id);

        return (
          <JacoSurface
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Открыть ${isIncident ? "инцидент" : "отзыв"} ${item.id}`}
            onClick={() => onOpen(item.id)}
            onKeyDown={(event) => activateWithKeyboard(event, () => onOpen(item.id))}
            sx={{
              p: 2,
              borderRadius: uiRadii.md,
              borderColor: isSelected ? uiColors.primary : uiColors.border,
              backgroundColor: isSelected ? uiStateColors.selectedSoft : uiColors.surface,
              cursor: "pointer",
              "&:focus-visible": { outline: `3px solid ${uiStateColors.focusRing}` },
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                  {item.point_name || "Кафе"}
                </Typography>
                <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
                  {formatDateTime(item.created_at)}
                </Typography>
              </Box>
              <RatingValue
                value={item.rating}
                isIncident={isIncident || item.is_incident}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.25 }}>
              <StatusChip
                value={item.status}
                options={dictionaries.statuses}
                highlightNew={isIncident}
              />
              <ZoneChip
                code={item.zone_code}
                label={item.zone_label}
              />
              {isIncident ? (
                <SeverityChip
                  value={item.severity}
                  options={dictionaries.severities}
                />
              ) : null}
              {item.issues_count ? (
                <JacoStatusChip
                  tone="neutral"
                  variant="outlined"
                  label={`Причин: ${item.issues_count}`}
                />
              ) : null}
              {item.has_photos ? (
                <JacoStatusChip
                  tone="neutral"
                  variant="outlined"
                  icon={<PhotoCameraOutlinedIcon />}
                  label="Есть фото"
                />
              ) : null}
            </Box>
            {item.comment || item.review_comment ? (
              <Typography
                sx={{
                  ...uiTypography.label,
                  mt: 1.25,
                  color: uiColors.text,
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
          </JacoSurface>
        );
      })}
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
  onRowsPerPageChange,
  sort,
  direction,
  onSort,
}) {
  return (
    <Box sx={{ pb: 4 }}>
      {items.length ? (
        <>
          <DesktopTable
            kind={kind}
            items={items}
            dictionaries={dictionaries}
            selectedId={selectedId}
            onOpen={onOpen}
            sort={sort}
            direction={direction}
            onSort={onSort}
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
      {pagination.total > 0 ? (
        <TablePagination
          component="div"
          count={pagination.total}
          page={Math.max(0, pagination.page - 1)}
          onPageChange={(event, page) => onPageChange(event, page + 1)}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPage={pagination.per_page}
          rowsPerPageOptions={[20, 50, 100]}
          labelRowsPerPage="Записей на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          sx={{ mt: 1.5, color: uiColors.text }}
        />
      ) : null}
    </Box>
  );
}
