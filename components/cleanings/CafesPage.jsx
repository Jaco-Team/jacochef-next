import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import HistoryIcon from "@mui/icons-material/History";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  JacoButton,
  JacoModal,
  JacoSearchField,
  JacoSelect,
  JacoStatusChip,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
import {
  getAdditionTypeName,
  getCategoryName,
  getLocationName,
  getScheduleText,
  isSameId,
  tableHeaderSx,
  tableRowSx,
  wrappingChipSx,
} from "./helpers";
import { CleaningTemplateChips, FormHint, usePendingAction } from "./shared";

const cellTextSx = {
  ...uiTypography.label,
  color: uiColors.text,
};

const cleaningNameButtonSx = {
  p: 0,
  border: 0,
  bgcolor: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  ...uiTypography.bodyMedium,
  fontWeight: 700,
  color: uiColors.textStrong,
  textAlign: "left",
  "&:hover": { color: uiColors.primary },
};

function getCategory(categories, categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

export default function CafesView({
  templates,
  categories,
  locations = [],
  roles = [],
  scheduleTypeOptions = [],
  additionTypeOptions = [],
  selectedCafeId,
  roleFilter,
  onCafeChange,
  onRoleFilterChange,
  onRemoveCleaning,
  onAddOpen,
  onHistoryOpen,
  onSaveDopTimes,
  dopTimeDraftCount = 0,
  dopTimeDrafts = {},
  onDopTimeChange,
  canEdit,
}) {
  const [infoCleaningId, setInfoCleaningId] = useState(null);
  const locationOptions = locations.map((location) => ({
    id: location.id,
    name: getLocationName(location),
  }));
  // JacoSelect reports string values; the page keeps location ids as they came from the API.
  const toLocationId = (value) =>
    locationOptions.find((option) => String(option.id) === String(value))?.id ?? value;
  const roleOptions = [
    { id: "all", name: "Все должности" },
    ...roles.map((role) => ({
      id: role?.name || "",
      name: role?.name || "",
    })),
  ];
  const selectedCafe =
    locations.find((location) => isSameId(location.id, selectedCafeId)) || locations[0];
  const assignedCleanings = templates.filter((template) =>
    template.locationIds.some((locationId) => isSameId(locationId, selectedCafeId)),
  );
  const visibleCleanings = assignedCleanings.filter(
    (template) => roleFilter === "all" || template.role === roleFilter,
  );
  const infoCleaning = templates.find((template) => template.id === infoCleaningId) || null;
  const infoCategory = infoCleaning ? getCategory(categories, infoCleaning.categoryId) : null;

  const isDopTimeUnsaved = (item) => Object.prototype.hasOwnProperty.call(dopTimeDrafts, item.id);

  const getDopTimeValue = (item) => {
    if (isDopTimeUnsaved(item)) {
      return dopTimeDrafts[item.id];
    }

    return item.dopTime ?? item.extraTime ?? 0;
  };

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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: { xs: 1, md: 1.5 },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <PlaceOutlinedIcon
                sx={{
                  color: uiColors.textMuted,
                  flexShrink: 0,
                  display: { xs: "none", md: "block" },
                }}
              />
              <JacoSelect
                label="Кафе"
                data={locationOptions}
                value={selectedCafeId}
                onChange={(event) => onCafeChange(toLocationId(event.target.value))}
                allowNone={false}
                disabled={locationOptions.length <= 1}
                sx={{
                  flex: { xs: 1, md: "0 1 360px" },
                  minWidth: 0,
                  width: { xs: "auto", md: 360 },
                }}
              />

              <JacoSelect
                label="Должность"
                data={roleOptions}
                value={roleFilter}
                onChange={(event) => onRoleFilterChange(event.target.value)}
                allowNone={false}
                sx={{
                  flex: { xs: "1 1 100%", md: "0 1 240px" },
                  minWidth: { xs: 0, md: 240 },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                flexWrap: "wrap",
                gap: 1.5,
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                sx={{
                  ...cellTextSx,
                  whiteSpace: { xs: "normal", md: "nowrap" },
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <b>{assignedCleanings.length}</b> уборок назначено на «{selectedCafe?.name || "—"}»
              </Typography>
              <JacoButton
                compact
                tone="secondary"
                startIcon={<HistoryIcon />}
                onClick={onHistoryOpen}
                disabled={!selectedCafe}
              >
                История изменений
              </JacoButton>
              {canEdit ? (
                <>
                  <JacoButton
                    compact
                    startIcon={<AddIcon />}
                    onClick={onAddOpen}
                  >
                    Добавить уборку
                  </JacoButton>
                  <JacoButton
                    compact
                    tone="success"
                    onClick={onSaveDopTimes}
                    disabled={!dopTimeDraftCount}
                  >
                    Сохранить изменения
                  </JacoButton>
                  {dopTimeDraftCount ? (
                    <Typography
                      sx={{
                        ...uiTypography.label,
                        color: uiColors.warningHover,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Не сохранено: {dopTimeDraftCount}
                    </Typography>
                  ) : null}
                </>
              ) : null}
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
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "34%" }}>Объект уборки</TableCell>
                  <TableCell>Вид уборки</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell sx={{ width: 132 }}>Доп. время</TableCell>
                  <TableCell sx={{ width: "20%" }}>Расписание</TableCell>
                  <TableCell>Тип добавления</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCleanings.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={tableRowSx}
                  >
                    <TableCell
                      className="cleaning-name-cell"
                      sx={{
                        borderLeft: "3px solid",
                        borderLeftColor: isDopTimeUnsaved(item) ? uiColors.warning : "transparent",
                      }}
                    >
                      <Box>
                        <Typography
                          component="button"
                          type="button"
                          onClick={() => setInfoCleaningId(item.id)}
                          sx={cleaningNameButtonSx}
                        >
                          {item.name}
                        </Typography>
                        <CleaningTemplateChips
                          item={item}
                          withAdditionType={false}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <JacoStatusChip
                        label={getCategoryName(categories, item.categoryId)}
                        tone="neutral"
                        variant="soft"
                        sx={wrappingChipSx}
                      />
                    </TableCell>
                    <TableCell>
                      <JacoStatusChip
                        label={item.role}
                        tone="neutral"
                        variant="outlined"
                        sx={wrappingChipSx}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 58,
                          py: 0.5,
                          borderRadius: uiRadii.sm,
                          bgcolor: uiColors.surfaceMuted,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{ ...uiTypography.bodyMedium, fontWeight: 700, color: uiColors.textStrong }}
                        >
                          {item.duration}
                        </Typography>
                        <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textMuted }}>
                          мин
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <JacoTextInput
                        value={getDopTimeValue(item)}
                        onChange={(event) => onDopTimeChange(item.id, event.target.value ?? "")}
                        type="number"
                        min={0}
                        step={1}
                        disabled={!canEdit}
                        sx={{ minWidth: 96 }}
                      />
                      {isDopTimeUnsaved(item) ? (
                        <FormHint
                          tone="warning"
                          sx={{ mt: 0.5, fontSize: 12 }}
                        >
                          Не сохранено
                        </FormHint>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: uiColors.textMuted,
                        }}
                      >
                        <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography sx={cellTextSx}>
                          {getScheduleText(item, scheduleTypeOptions)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={cellTextSx}>
                        {getAdditionTypeName(item.additionType, additionTypeOptions) || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canEdit ? (
                        <Tooltip title="Убрать из кафе">
                          <IconButton
                            size="small"
                            onClick={() => onRemoveCleaning(item.id)}
                            sx={{ color: uiColors.primary }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
                {visibleCleanings.length ? null : (
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
            {visibleCleanings.map((item) => (
              <JacoSurface
                key={item.id}
                sx={{
                  p: 1.5,
                  borderLeft: `3px solid ${isDopTimeUnsaved(item) ? uiColors.warning : uiColors.primary}`,
                }}
              >
                <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
                  <Box>
                    <Typography
                      component="button"
                      type="button"
                      onClick={() => setInfoCleaningId(item.id)}
                      sx={cleaningNameButtonSx}
                    >
                      {item.name}
                    </Typography>
                    <CleaningTemplateChips
                      item={item}
                      withAdditionType={false}
                      sx={{ mt: 0.75 }}
                    />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.75 }}>
                      <JacoStatusChip
                        label={getCategoryName(categories, item.categoryId)}
                        tone="neutral"
                        variant="soft"
                      />
                      <JacoStatusChip
                        label={item.role}
                        tone="neutral"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  {canEdit ? (
                    <JacoButton
                      tone="danger"
                      compact
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => onRemoveCleaning(item.id)}
                      sx={{ justifySelf: "start" }}
                    >
                      Убрать
                    </JacoButton>
                  ) : null}
                  <Box
                    sx={{
                      width: 100,
                    }}
                  >
                    <JacoTextInput
                      value={getDopTimeValue(item)}
                      onChange={(event) => onDopTimeChange(item.id, event.target.value ?? "")}
                      type="number"
                      min={0}
                      step={1}
                      disabled={!canEdit}
                    />
                    {isDopTimeUnsaved(item) ? (
                      <FormHint
                        tone="warning"
                        sx={{ mt: 0.5, fontSize: 12 }}
                      >
                        Не сохранено
                      </FormHint>
                    ) : null}
                  </Box>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, color: uiColors.textMuted }}
                >
                  <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={cellTextSx}>
                    {item.duration} мин · {getScheduleText(item, scheduleTypeOptions)}
                  </Typography>
                </Box>
                <Typography sx={{ ...cellTextSx, mt: 0.75 }}>
                  Тип добавления:{" "}
                  {getAdditionTypeName(item.additionType, additionTypeOptions) || "—"}
                </Typography>
              </JacoSurface>
            ))}
            {visibleCleanings.length ? null : (
              <Typography sx={{ ...cellTextSx, textAlign: "center", py: 3 }}>
                Нет уборок по выбранным фильтрам
              </Typography>
            )}
          </Box>
        </JacoSurface>
      </Grid>

      <CafeCleaningInfoDialog
        open={Boolean(infoCleaning)}
        cleaning={infoCleaning}
        category={infoCategory}
        onClose={() => setInfoCleaningId(null)}
      />
    </Grid>
  );
}

function CafeCleaningInfoDialog({ open, cleaning, category, onClose }) {
  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={cleaning?.name || ""}
      maxWidth="md"
    >
      <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, mb: 2 }}>
        {category?.name || "Без вида уборки"} · {cleaning?.role || "Без должности"} ·{" "}
        {cleaning?.duration || "—"} мин
      </Typography>
      <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong, mb: 1 }}>
        Описание процесса уборки:
      </Typography>
      <Box
        sx={{
          ...uiTypography.body,
          color: uiColors.textStrong,
          lineHeight: 1.55,
          "& p": { m: 0, mb: 1.5 },
          "& ol, & ul": { mt: 0, mb: 1.5, pl: 2.5 },
          "& li": { mb: 0.5 },
        }}
        dangerouslySetInnerHTML={{
          __html: category?.instruction || "<p>Описание не заполнено</p>",
        }}
      />
    </JacoModal>
  );
}

export function AddCafeCleaningDialog({
  open,
  cafe,
  items,
  categories,
  query,
  roleFilter,
  roles = [],
  onQueryChange,
  onRoleFilterChange,
  onClose,
  onAdd,
}) {
  const { pendingKey, isPending, runPending } = usePendingAction();
  const roleOptions = [
    { id: "all", name: "Все должности" },
    ...roles.map((role) => ({
      id: role?.name || "",
      name: role?.name || "",
    })),
  ];
  const filteredItems = items.filter((item) => {
    const search = query.trim().toLowerCase();

    const bySearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      getCategoryName(categories, item.categoryId).toLowerCase().includes(search);
    const byRole = roleFilter === "all" || item.role === roleFilter;

    return bySearch && byRole;
  });

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
          {cafe ? getLocationName(cafe) : ""}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) 200px" },
            gap: 1,
          }}
        >
          <JacoSearchField
            value={query}
            onValueChange={onQueryChange}
            minLength={1}
            debounceMs={150}
            placeholder="Поиск по объекту, должности или виду уборки"
          />
          <JacoSelect
            label="Должность"
            data={roleOptions}
            value={roleFilter}
            onChange={(event) => onRoleFilterChange(event.target.value)}
            allowNone={false}
          />
        </Box>

        <Box sx={{ display: "grid", gap: 1, maxHeight: 420, overflow: "auto" }}>
          {filteredItems.length ? (
            filteredItems.map((item) => (
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
                  <Typography sx={cellTextSx}>
                    {getCategoryName(categories, item.categoryId)} · {item.role} · {item.duration}{" "}
                    мин
                  </Typography>
                </Box>
                <JacoButton
                  tone="outlinePrimary"
                  compact
                  aria-label="Добавить"
                  startIcon={<AddIcon />}
                  onClick={() => runPending(() => onAdd(item.id), item.id)}
                  disabled={isPending}
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
            ))
          ) : (
            <Typography sx={cellTextSx}>Нет уборок, которые можно добавить</Typography>
          )}
        </Box>
      </Box>
    </JacoModal>
  );
}

export function RemoveCafeCleaningDialog({ open, cleaning, cafe, onClose, onConfirm }) {
  const { isPending, runPending } = usePendingAction();

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title="Убрать уборку?"
      maxWidth="xs"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            tone="danger"
            compact
            onClick={() => runPending(onConfirm)}
            loading={isPending}
          >
            Убрать
          </JacoButton>
        </Box>
      }
    >
      <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>
        Уборка «{cleaning?.name || ""}» будет убрана из кафе «{cafe?.name || ""}».
      </Typography>
    </JacoModal>
  );
}
