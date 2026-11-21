import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  JacoButton,
  JacoDatePicker,
  JacoModal,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
import { getLocationName, isSameId, isDateInRange, tableHeaderSx, tableRowSx } from "./helpers";
import { ControlHistoryButton, ControlRefreshControl } from "./shared";

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

function preparationNameSx(canEdit) {
  return {
    p: 0,
    border: 0,
    bgcolor: "transparent",
    color: canEdit ? uiColors.primary : uiColors.textStrong,
    cursor: canEdit ? "pointer" : "default",
    fontFamily: "inherit",
    ...uiTypography.label,
    fontWeight: 700,
    textAlign: "left",
    textTransform: "uppercase",
    "&:hover": canEdit ? { textDecoration: "underline" } : {},
  };
}

function formatPreparationAmount(value, unit) {
  if (value === "" || value == null) {
    return "—";
  }

  return unit ? `${value} ${unit}` : String(value);
}

export default function PreparationControlView({
  items,
  locations = [],
  selectedCafeId,
  dateFrom,
  dateTo,
  onCafeChange,
  onDateFromChange,
  onDateToChange,
  onEdit,
  onApprove,
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
  const visibleItems = items.filter(
    (item) =>
      isSameId(item.locationId, selectedCafeId) && isDateInRange(item.preparedAt, dateFrom, dateTo),
  );

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
            <Box sx={{ justifySelf: { xs: "stretch", md: "end" } }}>
              <ControlRefreshControl
                onRefresh={onRefresh}
                refreshing={refreshing}
                disabled={isLoading}
                updatedAt={updatedAt}
                error={refreshError}
              />
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
            <Table
              size="small"
              sx={{ minWidth: 940 }}
            >
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "20%" }}>Позиция</TableCell>
                  <TableCell>Время</TableCell>
                  <TableCell>Заготовка</TableCell>
                  <TableCell>Отходы</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Помощник</TableCell>
                  <TableCell>Подтвердили</TableCell>
                  <TableCell>Подтвердивший</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleItems.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={tableRowSx}
                  >
                    <TableCell
                      className="cleaning-name-cell"
                      sx={{ borderLeft: "3px solid transparent" }}
                    >
                      <Typography
                        component="button"
                        type="button"
                        onClick={() => canEdit && onEdit(item.id)}
                        sx={preparationNameSx(canEdit)}
                      >
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellTextSx}>
                      {item.preparedAt || "—"}
                    </TableCell>
                    <TableCell sx={{ ...cellTextSx, color: uiColors.textStrong }}>
                      {formatPreparationAmount(item.volume, item.unit)}
                    </TableCell>
                    <TableCell sx={{ ...cellTextSx, color: uiColors.textStrong }}>
                      {formatPreparationAmount(item.waste, item.unit)}
                    </TableCell>
                    <TableCell sx={cellTextSx}>
                      {item.employee}
                    </TableCell>
                    <TableCell sx={cellTextSx}>
                      {item.helper || "—"}
                    </TableCell>
                    <TableCell sx={cellTextSx}>
                      {item.confirmedAt || "—"}
                    </TableCell>
                    <TableCell sx={cellTextSx}>
                      {item.confirmer || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {canEdit && item.status === "pending" ? (
                          <JacoButton
                            tone="success"
                            compact
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => onApprove(item.id)}
                            sx={actionButtonSx}
                          >
                            Подтвердить
                          </JacoButton>
                        ) : null}
                        {canEdit && item.status === "pending" ? (
                          <JacoButton
                            tone="danger"
                            compact
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => onDelete(item.id)}
                            sx={actionButtonSx}
                          >
                            Удалить
                          </JacoButton>
                        ) : item.eventsCount > 0 ? null : (
                          <Typography sx={{ ...uiTypography.label, color: uiColors.textSubtle }}>
                            —
                          </Typography>
                        )}
                        {item.eventsCount > 0 ? (
                          <ControlHistoryButton onClick={() => onHistory(item.id)} />
                        ) : null}
                      </Box>
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
            {visibleItems.map((item) => (
              <JacoSurface
                key={item.id}
                sx={{
                  p: 1.5,
                  borderLeft: `3px solid ${uiColors.primary}`,
                }}
              >
                <Box sx={{ display: "grid", gap: 0.75, mb: 1 }}>
                  <Box>
                    <Typography
                      component="button"
                      type="button"
                      onClick={() => canEdit && onEdit(item.id)}
                      sx={{ ...preparationNameSx(canEdit), ...uiTypography.bodyMedium, fontWeight: 700 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography sx={cellTextSx}>
                      {item.preparedAt || "—"} · {formatPreparationAmount(item.volume, item.unit)} /{" "}
                      {formatPreparationAmount(item.waste, item.unit)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gap: 0.25, mb: 1 }}>
                  <Typography sx={cellTextSx}>
                    Сотрудник: {item.employee}
                  </Typography>
                  <Typography sx={cellTextSx}>
                    Подтвердили: {item.confirmedAt || "—"}
                  </Typography>
                  <Typography sx={cellTextSx}>
                    Подтвердивший: {item.confirmer || "—"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(2, auto)",
                    },
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  {canEdit && item.status === "pending" ? (
                    <>
                      <JacoButton
                        tone="success"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => onApprove(item.id)}
                        sx={{ ...actionButtonSx, width: "100%" }}
                      >
                        Подтвердить
                      </JacoButton>
                      <JacoButton
                        tone="danger"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => onDelete(item.id)}
                        sx={{ ...actionButtonSx, width: "100%" }}
                      >
                        Удалить
                      </JacoButton>
                    </>
                  ) : null}
                  {item.eventsCount > 0 ? (
                    <ControlHistoryButton
                      mobile
                      onClick={() => onHistory(item.id)}
                      sx={{ ...actionButtonSx, width: "100%" }}
                    />
                  ) : null}
                </Box>
              </JacoSurface>
            ))}
          </Box>
        </JacoSurface>
      </Grid>
    </Grid>
  );
}

export function PreparationEditDialog({ open, item, onClose, onSave }) {
  const [form, setForm] = useState({ volume: "", waste: "" });

  useEffect(() => {
    setForm({
      volume: item?.volume || "",
      waste: item?.waste || "",
    });
  }, [item]);

  const handleSave = () => {
    if (!item) {
      return;
    }

    onSave({ ...item, volume: form.volume, waste: form.waste });
  };

  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={`Редактирование заготовки: ${item?.name || ""}`}
      maxWidth="sm"
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
            onClick={handleSave}
          >
            Сохранить
          </JacoButton>
        </Box>
      }
    >
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoTextInput
              label="Объем заготовки"
              value={form.volume}
              onChange={(event) => setForm((prev) => ({ ...prev, volume: event.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoTextInput
              label="Объем отходов"
              value={form.waste}
              onChange={(event) => setForm((prev) => ({ ...prev, waste: event.target.value }))}
            />
          </Grid>
          {item?.history?.length ? (
            <Grid size={12}>
              <Accordion
                disableGutters
                sx={{
                  border: `1px solid ${uiColors.border}`,
                  borderRadius: `${uiRadii.md} !important`,
                  boxShadow: "none",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                    История изменений
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={tableHeaderSx}>
                          <TableCell>Сотрудник</TableCell>
                          <TableCell>Время обновления</TableCell>
                          <TableCell>Заготовки ДО</TableCell>
                          <TableCell>Отходов ДО</TableCell>
                          <TableCell>Заготовки ПОСЛЕ</TableCell>
                          <TableCell>Отходов ПОСЛЕ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.history.map((historyItem) => (
                          <TableRow key={historyItem.id}>
                            <TableCell>{historyItem.userName}</TableCell>
                            <TableCell>{historyItem.dateTime}</TableCell>
                            <TableCell>{historyItem.oldVolume}</TableCell>
                            <TableCell>{historyItem.oldWaste}</TableCell>
                            <TableCell>{historyItem.newVolume}</TableCell>
                            <TableCell>{historyItem.newWaste}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ) : null}
        </Grid>
    </JacoModal>
  );
}
