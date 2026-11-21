import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { MyDatePickerNew, MySelect } from "@/ui/Forms";
import {
  formatControlTime,
  getControlStatusKey,
  getControlStatusMeta,
  getLocationName,
  getLocationNameById,
  isControlItemNeverTaken,
  isSameId,
  isDateInRange,
  tableHeaderSx,
  tableRowSx,
} from "./helpers";
import {
  ControlHistoryButton,
  ControlRefreshControl,
  ControlReturnsBadge,
  usePendingAction,
} from "./shared";

const actionButtonSx = {
  borderRadius: "8px",
  fontWeight: 700,
  minHeight: 36,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

const statusChipSx = {
  height: 24,
  border: "1px solid",
  fontWeight: 700,
};

function countByStatusKey(items) {
  return items.reduce((counts, item) => {
    const key = getControlStatusKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function ControlStatusChip({ item, sx }) {
  const statusMeta = getControlStatusMeta(getControlStatusKey(item));

  return (
    <Chip
      label={statusMeta.label}
      size="small"
      sx={{
        ...statusChipSx,
        color: statusMeta.color,
        bgcolor: statusMeta.bgcolor,
        borderColor: statusMeta.borderColor,
        ...sx,
      }}
    />
  );
}

const deleteInfoSx = {
  mt: 0.5,
  maxWidth: 280,
  color: "text.secondary",
  fontSize: 13,
};

// «2026-11-21 10:05:04» → «10:05» on the row's own date, «22.11 10:05» on another one.
function formatDeleteTime(value, rowDate) {
  const text = String(value || "");
  const day = text.slice(0, 10);
  const time = formatControlTime(text);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day === String(rowDate || "").slice(0, 10)) {
    return time;
  }

  return `${day.slice(8, 10)}.${day.slice(5, 7)} ${time}`;
}

// For a deleted row `confirmedAt` / `confirmer` are the delete time and author, not a confirmation.
function ControlDeleteInfo({ item }) {
  if (item.status !== "deleted") {
    return null;
  }

  const time = item.confirmedAt ? formatDeleteTime(item.confirmedAt, item.date) : "";
  const author = item.deletedBy === "manager" ? item.confirmer : "";
  const deletedLine = time ? [`Удалена в ${time}`, author].filter(Boolean).join(" · ") : "";

  return (
    <>
      {deletedLine ? <Typography sx={deleteInfoSx}>{deletedLine}</Typography> : null}
      {item.deleteReason ? (
        <Tooltip title={item.deleteReason}>
          <Typography
            sx={{
              ...deleteInfoSx,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            Причина: {item.deleteReason}
          </Typography>
        </Tooltip>
      ) : null}
    </>
  );
}

function getControlConfirmation(item) {
  if (item.status === "deleted") {
    return { confirmedAt: "—", confirmer: "—" };
  }

  return { confirmedAt: item.confirmedAt || "—", confirmer: item.confirmer || "—" };
}

// Deleted rows that were never taken show «—» instead of whatever the legacy join returned.
function getControlPerson(item) {
  if (isControlItemNeverTaken(item)) {
    return { employee: "—", startedAt: "—" };
  }

  return { employee: item.employee || "—", startedAt: item.startedAt || "—" };
}

export default function ControlView({
  items,
  templates,
  locations = [],
  filter,
  selectedCafeId,
  dateFrom,
  dateTo,
  onFilterChange,
  onCafeChange,
  onDateFromChange,
  onDateToChange,
  onAddManualOpen,
  onApprove,
  onReturn,
  onDetach,
  onDelete,
  onHistory,
  onRefresh,
  isLoading,
  refreshing,
  updatedAt,
  refreshError,
  canEdit,
}) {
  const locationOptions = locations.map((location) => ({
    id: location.id,
    name: getLocationName(location),
  }));
  const filteredByContext = items.filter(
    (item) =>
      isSameId(item.locationId, selectedCafeId) && isDateInRange(item.date, dateFrom, dateTo),
  );
  const visibleItems = filteredByContext.filter(
    (item) => filter === "all" || getControlStatusKey(item) === filter,
  );
  const statusCounts = countByStatusKey(filteredByContext);
  const filterItems = [
    { value: "all", label: "Все" },
    { value: "active", label: "Активно", count: statusCounts.active },
    { value: "in_progress", label: "В процессе", count: statusCounts.in_progress },
    { value: "pending", label: "Ожидают", count: statusCounts.pending },
    { value: "approved", label: "Подтверждено", count: statusCounts.approved },
    {
      value: "deleted_system",
      label: "Не выполнены (удалены автоматически)",
      count: statusCounts.deleted_system,
    },
    { value: "deleted_manager", label: "Удалены менеджером", count: statusCounts.deleted_manager },
    // Deleted rows without `deletedBy` (old BE): the filter is shown only while there are any.
    { value: "deleted", label: "Удалено", count: statusCounts.deleted },
  ].filter((item) => item.value !== "deleted" || item.count || filter === "deleted");

  const getCleaning = (id) => templates.find((template) => template.id === id);

  return (
    <Grid
      container
      spacing={2.5}
    >
      <Grid size={12}>
        <Paper
          variant="outlined"
          sx={{ borderRadius: "8px", overflow: "hidden" }}
        >
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "360px 170px 170px auto" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <MySelect
              label="Кафе"
              data={locationOptions}
              value={selectedCafeId}
              func={(event) => onCafeChange(event.target.value)}
              is_none={false}
              disabled={locationOptions.length <= 1}
            />
            <MyDatePickerNew
              label="Дата от"
              value={dateFrom}
              maxDate={dateTo ? dayjs(dateTo) : null}
              func={(value) => onDateFromChange(value ? value.format("YYYY-MM-DD") : "")}
            />
            <MyDatePickerNew
              label="Дата до"
              value={dateTo}
              minDate={dateFrom ? dayjs(dateFrom) : null}
              func={(value) => onDateToChange(value ? value.format("YYYY-MM-DD") : "")}
            />
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifySelf: { xs: "stretch", md: "end" },
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <ControlRefreshControl
                onRefresh={onRefresh}
                refreshing={refreshing}
                disabled={isLoading}
                updatedAt={updatedAt}
                error={refreshError}
              />
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddManualOpen}
                disabled={!canEdit}
                sx={actionButtonSx}
              >
                Добавить уборку
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: { xs: 0, md: "12px" },
            overflow: "hidden",
            border: { xs: 0, md: "1px solid #e0e0e0" },
            bgcolor: { xs: "transparent", md: "background.paper" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              p: { xs: 0, md: 1.5 },
              mb: { xs: 1.75, md: 0 },
              overflowX: { xs: "auto", md: "visible" },
              borderBottom: { xs: 0, md: "1px solid #e0e0e0" },
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, value) => value && onFilterChange(value)}
              sx={{
                "& .MuiToggleButton-root": {
                  minHeight: 36,
                  minWidth: { xs: 104, md: "auto" },
                  flexShrink: 0,
                  px: 1.5,
                  py: 0,
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                },
                "& .MuiChip-root": {
                  flexShrink: 0,
                },
              }}
            >
              {filterItems.map((item) => (
                <ToggleButton
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                  {item.count ? (
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{ ml: 1, height: 20, minWidth: 24, fontWeight: 700 }}
                    />
                  ) : null}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table
              size="small"
              sx={{ minWidth: 1040 }}
            >
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "20%" }}>Объект уборки</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell>Завершение</TableCell>
                  <TableCell>Подтвердили</TableCell>
                  <TableCell>Подтвердивший</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleItems.map((item) => {
                  const cleaning = getCleaning(item.cleaningId);
                  const cleaningName = item.workName || item.name || cleaning?.name || "Уборка";
                  const person = getControlPerson(item);
                  const confirmation = getControlConfirmation(item);

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={tableRowSx}
                    >
                      <TableCell
                        className="cleaning-name-cell"
                        sx={{ borderLeft: "3px solid transparent" }}
                      >
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                          {cleaningName}
                        </Typography>
                        <ControlReturnsBadge
                          count={item.returnsCount}
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {person.employee}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {person.startedAt}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.finishedAt || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {confirmation.confirmedAt}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {confirmation.confirmer}
                      </TableCell>
                      <TableCell>
                        <ControlStatusChip item={item} />
                        <ControlDeleteInfo item={item} />
                      </TableCell>
                      <TableCell align="right">
                        <ControlRowActions
                          item={item}
                          onApprove={onApprove}
                          onReturn={onReturn}
                          onDetach={onDetach}
                          onDelete={onDelete}
                          onHistory={onHistory}
                          canEdit={canEdit}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visibleItems.length ? null : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{ py: 4, textAlign: "center", color: "text.secondary" }}
                    >
                      Нет уборок по выбранным фильтрам
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.75, p: 0 }}>
            {visibleItems.map((item) => {
              const cleaning = getCleaning(item.cleaningId);
              const cleaningName = item.workName || item.name || cleaning?.name || "Уборка";
              const person = getControlPerson(item);
              const confirmation = getControlConfirmation(item);

              return (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    borderLeft: "3px solid",
                    borderLeftColor: "primary.main",
                  }}
                >
                  <Box sx={{ display: "grid", gap: 0.75, mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>
                        {cleaningName}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        {person.employee} · {person.startedAt} — {item.finishedAt || "—"}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        Подтвердили: {confirmation.confirmedAt} · {confirmation.confirmer}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      <ControlStatusChip
                        item={item}
                        sx={{
                          maxWidth: "100%",
                          height: 22,
                          "& .MuiChip-label": {
                            px: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                      <ControlReturnsBadge count={item.returnsCount} />
                    </Box>
                    <ControlDeleteInfo item={item} />
                  </Box>
                  <ControlRowActions
                    item={item}
                    onApprove={onApprove}
                    onReturn={onReturn}
                    onDetach={onDetach}
                    onDelete={onDelete}
                    onHistory={onHistory}
                    canEdit={canEdit}
                    mobile
                  />
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

// «Вернуть» / «Подтвердить» only for finished rows, «Снять» for taken ones (in progress or finished).
function ControlRowActions({
  item,
  onApprove,
  onReturn,
  onDetach,
  onDelete,
  onHistory,
  canEdit,
  mobile = false,
}) {
  const gridSx = mobile
    ? {
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, auto)" },
        gap: 1,
      }
    : { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 };
  const buttonSx = mobile ? { ...actionButtonSx, minHeight: 44, width: "100%" } : actionButtonSx;
  const canChange = canEdit && item.status !== "approved" && item.status !== "deleted";
  const isPending = item.status === "pending";
  const canDetach = item.status === "in_progress" || isPending;
  const hasHistory = item.eventsCount > 0;

  if (!canChange && !hasHistory) {
    return <Typography sx={{ color: "text.disabled", fontSize: 14 }}>—</Typography>;
  }

  return (
    <Box sx={gridSx}>
      {canChange && isPending ? (
        <>
          <Button
            size="small"
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={() => onReturn(item.id)}
            sx={{
              ...buttonSx,
              bgcolor: "#f59e0b",
              color: "#fff",
              "&:hover": { bgcolor: "#d97706" },
            }}
          >
            Вернуть
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => onApprove(item.id)}
            sx={{
              ...buttonSx,
              bgcolor: "#16a34a",
              color: "#fff",
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            Подтвердить
          </Button>
        </>
      ) : null}
      {canChange && canDetach ? (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PersonRemoveOutlinedIcon />}
          onClick={() => onDetach(item.id)}
          sx={{
            ...buttonSx,
            color: "#b45309",
            borderColor: "#f59e0b",
            "&:hover": { borderColor: "#d97706", bgcolor: "#fff7ed" },
          }}
        >
          Снять
        </Button>
      ) : null}
      {canChange ? (
        <Button
          size="small"
          variant="contained"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDelete(item.id)}
          sx={{
            ...buttonSx,
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Удалить
        </Button>
      ) : null}
      {hasHistory ? (
        <ControlHistoryButton
          mobile={mobile}
          onClick={() => onHistory(item.id)}
          sx={buttonSx}
        />
      ) : null}
    </Box>
  );
}

function getManualTemplateDetails(item) {
  return [item.role, item.category, item.duration ? `${item.duration} мин` : ""]
    .filter(Boolean)
    .join(" · ");
}

function isManualTemplateLimitReached(item) {
  return item.todayCount >= item.maxCount;
}

export function AddManualCleaningDialog({
  open,
  items = [],
  supported = true,
  locations = [],
  cafeId,
  query,
  onQueryChange,
  onClose,
  onAdd,
}) {
  const { pendingKey, isPending, runPending } = usePendingAction();
  const search = query.trim().toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search),
  );
  const emptyText = !supported
    ? "Список уборок для ручного добавления пока недоступен: сервер его не вернул. Попробуйте позже."
    : items.length
      ? "Ничего не найдено"
      : "Нет ручных уборок для выбранного кафе";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Добавить уборку
        <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
          {getLocationNameById(cafeId, locations)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 1.5 }}>
        <TextField
          size="small"
          value={query}
          placeholder="Поиск по объекту, должности или виду уборки"
          onChange={(event) => onQueryChange(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: "grid", gap: 1, maxHeight: 420, overflow: "auto" }}>
          {filteredItems.length ? (
            filteredItems.map((item) => {
              const details = getManualTemplateDetails(item);

              return (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr) 40px", sm: "minmax(0, 1fr) auto" },
                    alignItems: "center",
                    gap: { xs: 1.25, sm: 2 },
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
                      {item.name}
                    </Typography>
                    {details ? (
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        {details}
                      </Typography>
                    ) : null}
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                      Сегодня: {item.todayCount} из {item.maxCount}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => runPending(() => onAdd(item.id), item.id)}
                    disabled={isPending || isManualTemplateLimitReached(item)}
                    loading={pendingKey === item.id}
                    loadingPosition="start"
                    sx={{
                      minWidth: { xs: 40, sm: 96 },
                      width: { xs: 40, sm: "auto" },
                      height: 40,
                      px: { xs: 0, sm: 1.5 },
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      "& .MuiButton-startIcon": {
                        m: { xs: 0, sm: "0 8px 0 -4px" },
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      Добавить
                    </Box>
                  </Button>
                </Paper>
              );
            })
          ) : (
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{emptyText}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}
