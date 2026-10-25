import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import {
  JacoAlert,
  JacoAutocomplete,
  JacoBackdropLoader,
  JacoButton,
  JacoIconButton,
  JacoModal,
  JacoPeriodSwitch,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import {
  POSITION_GRAPH_FILTERS,
  RATE_HISTORY_STATUS,
  formatChange,
  formatDate,
  formatDateTime,
  formatLegacyPrices,
  formatRatesPeriodLabel,
  groupPositionsByUnit,
  isPositionInGraph,
} from "./staffScheduleRates.mjs";
import useStaffScheduleRatesPage from "./useStaffScheduleRatesPage";

const headCellSx = { fontWeight: 700, color: "#111827", whiteSpace: "nowrap" };

function SectionTitle({ children }) {
  return (
    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", mb: 1 }}>
      {children}
    </Typography>
  );
}

function GraphBadge({ inGraph }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 0.75,
        borderRadius: "6px",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "18px",
        whiteSpace: "nowrap",
        color: inGraph ? "#1F7A3A" : "#6B7280",
        backgroundColor: inGraph ? "#E6F4EA" : "#F3F4F6",
      }}
    >
      {inGraph ? "в графике" : "без графика"}
    </Box>
  );
}

const UNIT_ROW_HEIGHT = 44;
const RATES_TABLE_MAX_WIDTH = 720;
const RATE_COLUMN_WIDTH = { xs: 120, md: 150 };
const GRAPH_COLUMN_WIDTH = 120;
const compactInputSx = {
  "& .MuiInputBase-root.MuiOutlinedInput-root": { minHeight: 36, height: 36 },
  "& input.MuiInputBase-input.MuiOutlinedInput-input": { textAlign: "right" },
};

function UnitRow({ group, expanded, onToggle }) {
  const toggle = () => onToggle(group.unitId);

  return (
    <TableRow
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
      sx={{
        height: UNIT_ROW_HEIGHT,
        cursor: "pointer",
        backgroundColor: "#F9FAFB",
        "&:hover": { backgroundColor: "#F3F4F6" },
        "&:focus-visible": { outline: "none", boxShadow: "inset 0 0 0 2px rgba(204, 0, 51, 0.35)" },
      }}
    >
      <TableCell
        colSpan={3}
        sx={{ py: 0, height: UNIT_ROW_HEIGHT }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: UNIT_ROW_HEIGHT }}>
          <ExpandMoreRoundedIcon
            fontSize="small"
            sx={{
              color: "#6B7280",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 160ms ease",
            }}
          />
          <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: "#111827" }}>
            {group.unitName}
          </Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.3, color: "#6B7280" }}>
            должностей: {group.positions.length} · со ставкой: {group.filledCount}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

function PositionRow({ position, canEdit, onChange }) {
  return (
    <TableRow
      hover
      sx={{ "& > td": { py: 0.5 } }}
    >
      <TableCell sx={{ pl: { xs: 4, md: 5 } }}>
        <Typography sx={{ fontSize: 14, color: "#111827" }}>{position.app_name}</Typography>
        {position.has_legacy_spread ? (
          <Typography sx={{ fontSize: 12, color: "#8A5A00" }}>
            {formatLegacyPrices(position)}
          </Typography>
        ) : null}
      </TableCell>
      <TableCell sx={{ width: GRAPH_COLUMN_WIDTH, display: { xs: "none", sm: "table-cell" } }}>
        <GraphBadge inGraph={isPositionInGraph(position)} />
      </TableCell>
      <TableCell sx={{ width: RATE_COLUMN_WIDTH }}>
        <JacoTextInput
          value={position.price}
          onChange={(event) => onChange(position.app_id, event.target.value)}
          disabled={!canEdit}
          inputMode="decimal"
          placeholder="—"
          aria-label={`Ставка: ${position.app_name}`}
          size="small"
          fullWidth
          sx={compactInputSx}
        />
      </TableCell>
    </TableRow>
  );
}

function PositionsByUnit({ page }) {
  const groups = groupPositionsByUnit(page.positions, page.graphFilter);

  return (
    <Stack spacing={1.5}>
      <JacoPeriodSwitch
        aria-label="Должности в графике работы"
        items={POSITION_GRAPH_FILTERS}
        value={page.graphFilter}
        onChange={(_, value) => page.setGraphFilter(value)}
        tabSx={{
          px: { xs: 0.5, sm: 1.5 },
          fontSize: { xs: 14, sm: 16 },
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
        sx={{ maxWidth: RATES_TABLE_MAX_WIDTH }}
      />
      <JacoSurface sx={{ p: 0, overflow: "hidden", maxWidth: RATES_TABLE_MAX_WIDTH }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Должность</TableCell>
                <TableCell
                  sx={{
                    ...headCellSx,
                    width: GRAPH_COLUMN_WIDTH,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  График
                </TableCell>
                <TableCell sx={{ ...headCellSx, width: RATE_COLUMN_WIDTH }}>Ставка, ₽/ч</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length ? (
                groups.flatMap((group) => {
                  const expanded = page.expandedUnitIds.includes(group.unitId);
                  return [
                    <UnitRow
                      key={`unit-${group.unitId}`}
                      group={group}
                      expanded={expanded}
                      onToggle={page.toggleUnit}
                    />,
                    ...(expanded
                      ? group.positions.map((position) => (
                          <PositionRow
                            key={position.app_id}
                            position={position}
                            canEdit={page.canEdit}
                            onChange={page.handlePriceChange}
                          />
                        ))
                      : []),
                  ];
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ color: "#6B7280" }}
                  >
                    Нет должностей
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </JacoSurface>
    </Stack>
  );
}

function StatusChip({ status }) {
  const meta = RATE_HISTORY_STATUS[status] ?? RATE_HISTORY_STATUS.applied;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: "999px",
        fontSize: 12,
        fontWeight: 600,
        color: meta.color,
        backgroundColor: meta.background,
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </Box>
  );
}

function AuthorCell({ row }) {
  return (
    <>
      <Typography sx={{ fontSize: 13, color: "#111827" }}>
        {row.creator || (row.source === "seed" ? "Перенос из app_per_h" : "—")}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
        {formatDateTime(row.created_at)}
      </Typography>
      {row.status === "deleted" ? (
        <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
          Удалил: {row.deleter || "—"}, {formatDateTime(row.deleted_at)}
        </Typography>
      ) : null}
    </>
  );
}

function HistoryTable({ title, rows, columns, onDelete }) {
  return (
    <JacoSurface sx={{ p: { xs: 1.5, md: 2 } }}>
      <SectionTitle>{title}</SectionTitle>
      {rows.length ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>С даты</TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={headCellSx}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell sx={headCellSx}>Статус</TableCell>
                <TableCell sx={headCellSx}>Кто и когда</TableCell>
                <TableCell sx={{ ...headCellSx, width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={row.status === "deleted" ? { "& td": { color: "#9CA3AF" } } : null}
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(row.date_start)}</TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.render(row)}</TableCell>
                  ))}
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    <AuthorCell row={row} />
                  </TableCell>
                  <TableCell>
                    {row.can_delete ? (
                      <JacoIconButton
                        aria-label="Удалить запланированное изменение"
                        title="Удалить запланированное изменение"
                        onClick={() => onDelete(row)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </JacoIconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ fontSize: 14, color: "#6B7280" }}>Изменений пока нет</Typography>
      )}
    </JacoSurface>
  );
}

const rateColumns = [
  { key: "app_name", label: "Должность", render: (row) => row.app_name },
  { key: "price", label: "Ставка", render: (row) => formatChange(row.old_price, row.price) },
];

const coefColumns = [
  {
    key: "k_rolls",
    label: "Коэф. роллов",
    render: (row) => formatChange(row.old_k_rolls, row.k_rolls),
  },
  {
    key: "k_pizza",
    label: "Коэф. пиццы",
    render: (row) => formatChange(row.old_k_pizza, row.k_pizza),
  },
];

function SaveDialog({ page }) {
  const { saveDialog } = page;
  const periodOptions = page.periods.map((period) => ({
    id: period.value,
    name: formatRatesPeriodLabel(period),
  }));

  return (
    <JacoModal
      open={saveDialog.open}
      onClose={page.closeSaveDialog}
      title="Сохранить ставки"
      maxWidth="sm"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
          <JacoButton
            tone="secondary"
            compact
            onClick={page.closeSaveDialog}
          >
            Отмена
          </JacoButton>
          <JacoButton
            compact
            onClick={page.save}
            disabled={!saveDialog.dateStart || !saveDialog.points.length}
          >
            Сохранить
          </JacoButton>
        </Box>
      }
    >
      <Stack spacing={2}>
        <JacoSelect
          label="С какого периода"
          allowNone={false}
          options={periodOptions}
          value={saveDialog.dateStart}
          onChange={(event) => page.updateSaveDialog({ dateStart: event.target.value })}
        />
        <JacoAutocomplete
          label="Кафе"
          placeholder={saveDialog.points.length ? undefined : "Выберите кафе"}
          multiple
          selectAppearance
          disableClearable
          disableCloseOnSelect
          options={page.points}
          value={saveDialog.points}
          onChange={(_, value) => page.updateSaveDialog({ points: value })}
          renderValue={(selected) => (
            <Box
              component="span"
              sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {formatSelectedPoints(selected, page.points.length)}
            </Box>
          )}
          autocompleteSx={{
            "& .MuiOutlinedInput-root": { flexWrap: "nowrap" },
            "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": { minWidth: "24px !important" },
          }}
        />
        <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
          Ставка заменит ставку всех сотрудников этой должности в выбранных кафе с начала периода,
          кроме строк, по которым уже выданы деньги. Будущий период применится автоматически в дату
          начала.
        </Typography>
      </Stack>
    </JacoModal>
  );
}

function formatSelectedPoints(selected, total) {
  if (!selected.length) return "";
  if (total > 1 && selected.length === total) return "Все кафе";
  return selected.length === 1 ? selected[0].name : `${selected[0].name} и ещё ${selected.length - 1}`;
}

export default function StaffScheduleRatesPage() {
  const page = useStaffScheduleRatesPage();
  const { ConfirmDialog, confirm } = useJacoConfirm();
  const hasInvalidFields = page.invalidFields.length > 0;

  const handleDelete = (type) => async (row) => {
    const accepted = await confirm({
      title: "Удалить изменение?",
      message: `Запланированное изменение с ${formatDate(row.date_start)} не будет применено.`,
      confirmLabel: "Удалить",
      cancelLabel: "Отмена",
    });
    if (accepted) page.deleteHistory(type, row);
  };

  return (
    <Box
      className="v2-module"
      sx={{ pb: 6, fontSize: 14 }}
    >
      <JacoBackdropLoader open={page.isLoading} />
      <JacoAlert
        isOpen={Boolean(page.notice)}
        onClose={() => page.setNotice(null)}
        status={Boolean(page.notice?.status)}
        text={page.notice?.text}
        autoHideDuration={6000}
      />
      <ConfirmDialog />
      <SaveDialog page={page} />

      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <JacoButton
            tone="secondary"
            compact
            component={Link}
            href="/staff_schedule"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ mb: 1 }}
          >
            График работы
          </JacoButton>
          <h1>Ставки и коэффициенты</h1>
        </Grid>

        {page.error ? (
          <Grid size={12}>
            <JacoAlert severity="error">{page.error}</JacoAlert>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, md: 4 }}>
          <JacoAutocomplete
            disableClearable
            selectAppearance
            label="Кафе"
            options={page.points}
            value={page.point}
            onChange={page.handlePointChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <JacoTextInput
            label="Коэф. роллов для бонуса"
            value={page.coefficients.k_rolls}
            onChange={(event) => page.handleCoefficientChange("k_rolls", event.target.value)}
            disabled={!page.canEdit}
            inputMode="decimal"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <JacoTextInput
            label="Коэф. пиццы для бонуса"
            value={page.coefficients.k_pizza}
            onChange={(event) => page.handleCoefficientChange("k_pizza", event.target.value)}
            disabled={!page.canEdit}
            inputMode="decimal"
            fullWidth
          />
        </Grid>
        {page.canEdit ? (
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: "flex", justifyContent: { md: "flex-end" }, alignItems: "flex-start" }}
          >
            <JacoButton
              onClick={page.openSaveDialog}
              disabled={!page.point || hasInvalidFields}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Сохранить изменения
            </JacoButton>
          </Grid>
        ) : null}

        {hasInvalidFields ? (
          <Grid size={12}>
            <JacoAlert severity="warning">
              Проверьте значения: {page.invalidFields.join(", ")}. Допустимо число с двумя знаками
              после запятой.
            </JacoAlert>
          </Grid>
        ) : null}

        <Grid size={12}>
          <SectionTitle>Ставки по отделам</SectionTitle>
          <PositionsByUnit page={page} />
        </Grid>

        <Grid size={12}>
          <HistoryTable
            title="История ставок"
            rows={page.pointData.rate_history}
            columns={rateColumns}
            onDelete={handleDelete("rate")}
          />
        </Grid>
        <Grid size={12}>
          <HistoryTable
            title="История коэффициентов"
            rows={page.pointData.coef_history}
            columns={coefColumns}
            onDelete={handleDelete("coef")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
