import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  JacoButton,
  JacoDatePicker,
  JacoModal,
  JacoSearchField,
  JacoSegmentedTabs,
  JacoSelect,
  JacoStatusChip,
  JacoSurface,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
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
  wrappingChipSx,
} from "./helpers";
import {
  ControlHistoryButton,
  ControlRefreshControl,
  ControlReturnsBadge,
  usePendingAction,
} from "./shared";

const actionButtonSx = {
  whiteSpace: "nowrap",
};

const cellTextSx = {
  ...uiTypography.label,
  color: uiColors.text,
};

// Date picker change → «YYYY-MM-DD» or "" for a cleared / invalid value.
function toDateValue(value) {
  return value?.isValid?.() ? value.format("YYYY-MM-DD") : "";
}

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
    <JacoStatusChip
      label={statusMeta.label}
      tone={statusMeta.tone}
      variant={statusMeta.variant}
      sx={sx}
    />
  );
}

const deleteInfoSx = {
  ...uiTypography.compactLabel,
  mt: 0.5,
  maxWidth: 280,
  fontSize: 13,
  color: uiColors.textMuted,
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
  // JacoSelect reports string values; the page keeps location ids as they came from the API.
  const toLocationId = (value) =>
    locationOptions.find((option) => String(option.id) === String(value))?.id ?? value;
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
        <JacoSurface sx={{ overflow: "hidden" }}>
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "360px 170px 170px auto" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <JacoSelect
              label="Кафе"
              data={locationOptions}
              value={selectedCafeId}
              onChange={(event) => onCafeChange(toLocationId(event.target.value))}
              allowNone={false}
              disabled={locationOptions.length <= 1}
            />
            <JacoDatePicker
              label="Дата от"
              value={dateFrom}
              maxDate={dateTo || undefined}
              onChange={(value) => onDateFromChange(toDateValue(value))}
            />
            <JacoDatePicker
              label="Дата до"
              value={dateTo}
              minDate={dateFrom || undefined}
              onChange={(value) => onDateToChange(toDateValue(value))}
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
              <JacoButton
                compact
                startIcon={<AddIcon />}
                onClick={onAddManualOpen}
                disabled={!canEdit}
                sx={actionButtonSx}
              >
                Добавить уборку
              </JacoButton>
            </Box>
          </Box>
        </JacoSurface>
      </Grid>

      <Grid size={12}>
        <JacoSurface
          sx={{
            borderRadius: { xs: 0, md: uiRadii.lg },
            overflow: "hidden",
            border: { xs: 0, md: `1px solid ${uiColors.border}` },
            bgcolor: { xs: "transparent", md: uiColors.surface },
          }}
        >
          <Box
            sx={{
              p: { xs: 0, md: 1.5 },
              mb: { xs: 1.75, md: 0 },
              borderBottom: { xs: 0, md: `1px solid ${uiColors.borderLight}` },
            }}
          >
            <JacoSegmentedTabs
              size="compact"
              variant="scrollable"
              scrollButtons={false}
              value={filter}
              onChange={(_, value) => value && onFilterChange(value)}
              items={filterItems.map((item) => ({
                id: item.value,
                label: (
                  <Box
                    component="span"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, whiteSpace: "nowrap" }}
                  >
                    {item.label}
                    {item.count ? (
                      <JacoStatusChip
                        label={item.count}
                        tone="neutral"
                        variant="soft"
                        sx={{ height: 20, minWidth: 24 }}
                      />
                    ) : null}
                  </Box>
                ),
              }))}
              aria-label="Фильтр по статусу"
              tabSx={{ flexShrink: 0 }}
            />
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
                        <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                          {cleaningName}
                        </Typography>
                        <ControlReturnsBadge
                          count={item.returnsCount}
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell sx={cellTextSx}>
                        {person.employee}
                      </TableCell>
                      <TableCell sx={cellTextSx}>
                        {person.startedAt}
                      </TableCell>
                      <TableCell sx={cellTextSx}>
                        {item.finishedAt || "—"}
                      </TableCell>
                      <TableCell sx={cellTextSx}>
                        {confirmation.confirmedAt}
                      </TableCell>
                      <TableCell sx={cellTextSx}>
                        {confirmation.confirmer}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <ControlStatusChip
                          item={item}
                          sx={wrappingChipSx}
                        />
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
                      sx={{ ...cellTextSx, py: 4, textAlign: "center" }}
                    >
                      Нет уборок по выбранным фильтрам
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: { xs: "grid", md: "none" },
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 1.75,
              p: 0,
            }}
          >
            {visibleItems.map((item) => {
              const cleaning = getCleaning(item.cleaningId);
              const cleaningName = item.workName || item.name || cleaning?.name || "Уборка";
              const person = getControlPerson(item);
              const confirmation = getControlConfirmation(item);

              return (
                <JacoSurface
                  key={item.id}
                  sx={{
                    p: 1.5,
                    borderLeft: `3px solid ${uiColors.primary}`,
                  }}
                >
                  <Box sx={{ display: "grid", gap: 0.75, mb: 1 }}>
                    <Box>
                      <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                        {cleaningName}
                      </Typography>
                      <Typography sx={cellTextSx}>
                        {person.employee} · {person.startedAt} — {item.finishedAt || "—"}
                      </Typography>
                      <Typography sx={cellTextSx}>
                        Подтвердили: {confirmation.confirmedAt} · {confirmation.confirmer}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      <ControlStatusChip
                        item={item}
                        sx={wrappingChipSx}
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
                </JacoSurface>
              );
            })}
          </Box>
        </JacoSurface>
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
    : { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 1 };
  const buttonSx = mobile ? { ...actionButtonSx, width: "100%" } : actionButtonSx;
  const canChange = canEdit && item.status !== "approved" && item.status !== "deleted";
  const isPending = item.status === "pending";
  const canDetach = item.status === "in_progress" || isPending;
  const hasHistory = item.eventsCount > 0;

  if (!canChange && !hasHistory) {
    return <Typography sx={{ ...uiTypography.label, color: uiColors.textSubtle }}>—</Typography>;
  }

  return (
    <Box sx={gridSx}>
      {canChange && isPending ? (
        <>
          <JacoButton
            tone="warning"
            compact={!mobile}
            startIcon={<ReplayIcon />}
            onClick={() => onReturn(item.id)}
            sx={buttonSx}
          >
            Вернуть
          </JacoButton>
          <JacoButton
            tone="success"
            compact={!mobile}
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => onApprove(item.id)}
            sx={buttonSx}
          >
            Подтвердить
          </JacoButton>
        </>
      ) : null}
      {canChange && canDetach ? (
        <JacoButton
          tone="secondary"
          compact={!mobile}
          startIcon={<PersonRemoveOutlinedIcon />}
          onClick={() => onDetach(item.id)}
          sx={buttonSx}
        >
          Снять
        </JacoButton>
      ) : null}
      {canChange ? (
        <JacoButton
          tone="danger"
          compact={!mobile}
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDelete(item.id)}
          sx={buttonSx}
        >
          Удалить
        </JacoButton>
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
    <JacoModal
      open={open}
      onClose={onClose}
      title="Добавить уборку"
      maxWidth="sm"
      actions={
        <JacoButton
          tone="secondary"
          compact
          onClick={onClose}
        >
          Закрыть
        </JacoButton>
      }
    >
      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
          {getLocationNameById(cafeId, locations)}
        </Typography>
        <JacoSearchField
          value={query}
          onValueChange={onQueryChange}
          minLength={1}
          debounceMs={150}
          placeholder="Поиск по объекту, должности или виду уборки"
        />

        <Box sx={{ display: "grid", gap: 1, maxHeight: 420, overflow: "auto" }}>
          {filteredItems.length ? (
            filteredItems.map((item) => {
              const details = getManualTemplateDetails(item);

              return (
                <JacoSurface
                  key={item.id}
                  sx={{
                    p: 1.5,
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr) 44px", sm: "minmax(0, 1fr) auto" },
                    alignItems: "center",
                    gap: { xs: 1.25, sm: 2 },
                    borderRadius: uiRadii.md,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                      {item.name}
                    </Typography>
                    {details ? <Typography sx={cellTextSx}>{details}</Typography> : null}
                    <Typography sx={cellTextSx}>
                      Сегодня: {item.todayCount} из {item.maxCount}
                    </Typography>
                  </Box>
                  <JacoButton
                    tone="outlinePrimary"
                    compact
                    aria-label="Добавить"
                    startIcon={<AddIcon />}
                    onClick={() => runPending(() => onAdd(item.id), item.id)}
                    disabled={isPending || isManualTemplateLimitReached(item)}
                    loading={pendingKey === item.id}
                    sx={{
                      minWidth: { xs: 44, sm: 112 },
                      px: { xs: 0, sm: 2 },
                      "& .MuiButton-startIcon": { m: { xs: 0, sm: "0 8px 0 -4px" } },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      Добавить
                    </Box>
                  </JacoButton>
                </JacoSurface>
              );
            })
          ) : (
            <Typography sx={cellTextSx}>{emptyText}</Typography>
          )}
        </Box>
      </Box>
    </JacoModal>
  );
}
