import { useMemo } from "react";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
  JacoButton,
  JacoModal,
  JacoSearchField,
  JacoSegmentedTabs,
  JacoStatusChip,
  JacoSurface,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
import {
  getCategoryName,
  getScheduleSortValue,
  getScheduleText,
  tableHeaderSx,
  tableRowSx,
  wrappingChipSx,
} from "./helpers";
import {
  CleaningActions,
  CleaningTemplateChips,
  SortableHeaderCell,
  usePendingAction,
} from "./shared";
import useTableSort from "./useTableSort";

const STATUS_LABELS = { active: "Активный", archive: "Архив" };

const STATUS_FILTERS = [
  { id: "active", label: "Активные" },
  { id: "archive", label: "Архив" },
  { id: "all", label: "Все" },
];

const cellTextSx = {
  ...uiTypography.label,
  color: uiColors.text,
};

const nameSx = {
  ...uiTypography.bodyMedium,
  fontWeight: 700,
  color: uiColors.textStrong,
};

function TemplateStatusChip({ status, sx }) {
  return (
    <JacoStatusChip
      label={STATUS_LABELS[status] || STATUS_LABELS.active}
      tone={status === "archive" ? "neutral" : "success"}
      variant="soft"
      sx={sx}
    />
  );
}

export default function CleaningsListPage({
  query,
  setQuery,
  filter,
  setFilter,
  filteredTemplates,
  templates,
  categories,
  scheduleTypeOptions,
  onCreate,
  canCreate = false,
  openEdit,
  toggleArchive,
  removeTemplate,
  onHistory,
  canEdit,
}) {
  const sortAccessors = useMemo(
    () => ({
      name: (item) => item.name,
      category: (item) => getCategoryName(categories, item.categoryId),
      role: (item) => item.role,
      duration: (item) => (item.duration === "" || item.duration == null ? "" : Number(item.duration)),
      schedule: getScheduleSortValue,
      locations: (item) => item.locationIds.length,
      status: (item) => STATUS_LABELS[item.status] || "",
    }),
    [categories],
  );
  const { sortedRows, sortBy, sortDirection, requestSort } = useTableSort(
    filteredTemplates,
    sortAccessors,
  );
  const sortProps = { sortBy, sortDirection, onSort: requestSort };

  return (
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
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: { xs: 1.75, md: 0 },
            borderBottom: { xs: 0, md: `1px solid ${uiColors.borderLight}` },
          }}
        >
          <Box
            sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" }, flex: 1 }}
          >
            <JacoSearchField
              value={query}
              onValueChange={setQuery}
              minLength={1}
              debounceMs={150}
              placeholder="Поиск по объекту уборки или должности"
              sx={{ width: { xs: "100%", sm: 420 } }}
            />

            <JacoSegmentedTabs
              size="compact"
              value={filter}
              onChange={(_, value) => value && setFilter(value)}
              items={STATUS_FILTERS}
              aria-label="Фильтр по статусу"
              sx={{ width: { xs: "100%", sm: 300 }, flexShrink: 0 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "space-between", md: "flex-end" },
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ ...cellTextSx, whiteSpace: "nowrap" }}>
              Показано <b>{filteredTemplates.length}</b> из {templates.length}
            </Typography>
            {canCreate ? (
              <JacoButton
                compact
                startIcon={<AddIcon />}
                onClick={onCreate}
              >
                Новая уборка
              </JacoButton>
            ) : null}
          </Box>
        </Box>

        <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={tableHeaderSx}>
                <SortableHeaderCell
                  sortKey="name"
                  sx={{ width: "34%" }}
                  {...sortProps}
                >
                  Объект уборки
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="category"
                  {...sortProps}
                >
                  Вид уборки
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="role"
                  {...sortProps}
                >
                  Должность
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="duration"
                  {...sortProps}
                >
                  Длительность
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="schedule"
                  sx={{ width: "18%" }}
                  {...sortProps}
                >
                  Расписание
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="locations"
                  align="center"
                  {...sortProps}
                >
                  Кафе
                </SortableHeaderCell>
                <SortableHeaderCell
                  sortKey="status"
                  {...sortProps}
                >
                  Статус
                </SortableHeaderCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={tableRowSx}
                >
                  <TableCell
                    className="cleaning-name-cell"
                    sx={{ borderLeft: "3px solid transparent" }}
                  >
                    <Typography sx={nameSx}>{item.name}</Typography>
                    <CleaningTemplateChips
                      item={item}
                      sx={{ mt: 0.5 }}
                    />
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
                      <Typography sx={nameSx}>{item.duration}</Typography>
                      <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textMuted }}>
                        мин
                      </Typography>
                    </Box>
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
                  <TableCell align="center">
                    <JacoStatusChip
                      label={item.locationIds.length}
                      tone="neutral"
                      variant="soft"
                      sx={{ minWidth: 32 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TemplateStatusChip status={item.status} />
                  </TableCell>
                  <TableCell align="right">
                    <CleaningActions
                      item={item}
                      onEdit={openEdit}
                      onArchiveToggle={toggleArchive}
                      onRemove={removeTemplate}
                      onHistory={onHistory}
                      canEdit={canEdit}
                    />
                  </TableCell>
                </TableRow>
              ))}
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
          {sortedRows.map((item) => (
            <JacoSurface
              key={item.id}
              sx={{
                p: 1.5,
                borderLeft: `3px solid ${uiColors.primary}`,
              }}
            >
              <Box sx={{ display: "grid", gap: 0.75, mb: 1 }}>
                <Box>
                  <Typography sx={nameSx}>{item.name}</Typography>
                  <CleaningTemplateChips
                    item={item}
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
                <TemplateStatusChip
                  status={item.status}
                  sx={{ justifySelf: "start", width: "fit-content" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: uiColors.textMuted,
                  mb: 0.75,
                }}
              >
                <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography sx={cellTextSx}>
                  {item.duration} мин · {getScheduleText(item, scheduleTypeOptions)}
                </Typography>
              </Box>
              <Typography sx={{ ...cellTextSx, mb: 1 }}>
                Кафе: {item.locationIds.length}
              </Typography>
              <CleaningActions
                item={item}
                onEdit={openEdit}
                onArchiveToggle={toggleArchive}
                onRemove={removeTemplate}
                onHistory={onHistory}
                canEdit={canEdit}
              />
            </JacoSurface>
          ))}
        </Box>
      </JacoSurface>
    </Grid>
  );
}

const templateStatusMeta = {
  archive: {
    title: "Перенести уборку в архив?",
    text: (name) => `Уборка «${name}» будет перенесена в архив. Вернуть её можно в любой момент.`,
    button: "В архив",
    icon: <ArchiveOutlinedIcon />,
  },
  restore: {
    title: "Вернуть уборку из архива?",
    text: (name) => `Уборка «${name}» снова станет активной.`,
    button: "Вернуть",
    icon: <UnarchiveOutlinedIcon />,
  },
};

export function TemplateStatusConfirmDialog({ open, item, onClose, onConfirm }) {
  const { isPending, runPending } = usePendingAction();
  const meta = item?.status === "archive" ? templateStatusMeta.restore : templateStatusMeta.archive;

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={meta.title}
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
            compact
            startIcon={meta.icon}
            onClick={() => runPending(onConfirm)}
            loading={isPending}
          >
            {meta.button}
          </JacoButton>
        </Box>
      }
    >
      <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>
        {meta.text(item?.name || "")}
      </Typography>
    </JacoModal>
  );
}
