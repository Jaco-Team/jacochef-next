import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import { MyDatePickerNew, MySelect } from "@/ui/Forms";
import { getLocationName, isSameId, isDateInRange, tableHeaderSx, tableRowSx } from "./helpers";

const actionButtonSx = {
  borderRadius: "8px",
  fontWeight: 700,
  minHeight: 36,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

const dialogButtonSx = {
  ...actionButtonSx,
  minHeight: 40,
  minWidth: 112,
  px: 2,
};

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
  onRefresh,
  isLoading,
  canEdit,
}) {
  const locationOptions = locations.map((location) => ({
    id: location.id,
    name: getLocationName(location),
  }));
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
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={isLoading}
              sx={{ ...actionButtonSx, justifySelf: { xs: "stretch", md: "end" } }}
            >
              Обновить
            </Button>
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
                        sx={{
                          p: 0,
                          border: 0,
                          bgcolor: "transparent",
                          color: canEdit ? "primary.main" : "text.primary",
                          cursor: canEdit ? "pointer" : "default",
                          fontFamily: "inherit",
                          fontSize: 14,
                          fontWeight: 800,
                          textAlign: "left",
                          textTransform: "uppercase",
                          "&:hover": canEdit ? { textDecoration: "underline" } : {},
                        }}
                      >
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.preparedAt || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {formatPreparationAmount(item.volume, item.unit)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {formatPreparationAmount(item.waste, item.unit)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.employee}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.helper || "—"}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.confirmedAt || "—"}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.confirmer || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {canEdit && item.status === "pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => onApprove(item.id)}
                            sx={{
                              ...actionButtonSx,
                              bgcolor: "#16a34a",
                              color: "#fff",
                              "&:hover": { bgcolor: "#15803d" },
                            }}
                          >
                            Подтвердить
                          </Button>
                        ) : null}
                        {canEdit && item.status === "pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => onDelete(item.id)}
                            sx={{
                              ...actionButtonSx,
                              bgcolor: "primary.main",
                              color: "#fff",
                              "&:hover": { bgcolor: "primary.dark" },
                            }}
                          >
                            Удалить
                          </Button>
                        ) : (
                          <Typography sx={{ color: "text.disabled", fontSize: 14 }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.75, p: 0 }}>
            {visibleItems.map((item) => (
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
                    <Typography
                      component="button"
                      type="button"
                      onClick={() => canEdit && onEdit(item.id)}
                      sx={{
                        p: 0,
                        border: 0,
                        bgcolor: "transparent",
                        color: canEdit ? "primary.main" : "text.primary",
                        cursor: canEdit ? "pointer" : "default",
                        fontFamily: "inherit",
                        fontSize: 16,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        textAlign: "left",
                        textTransform: "uppercase",
                        "&:hover": canEdit ? { textDecoration: "underline" } : {},
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.preparedAt || "—"} · {formatPreparationAmount(item.volume, item.unit)} /{" "}
                      {formatPreparationAmount(item.waste, item.unit)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gap: 0.25, mb: 1 }}>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Сотрудник: {item.employee}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Подтвердили: {item.confirmedAt || "—"}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
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
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => onApprove(item.id)}
                        sx={{
                          ...actionButtonSx,
                          minHeight: 44,
                          width: "100%",
                          bgcolor: "#16a34a",
                          color: "#fff",
                          "&:hover": { bgcolor: "#15803d" },
                        }}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => onDelete(item.id)}
                        sx={{
                          ...actionButtonSx,
                          minHeight: 44,
                          width: "100%",
                          bgcolor: "primary.main",
                          color: "#fff",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        Удалить
                      </Button>
                    </>
                  ) : null}
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Редактирование заготовки: {item?.name || ""}
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={2}
          sx={{ pt: 1 }}
        >
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Уборку начал</Typography>
            <Typography sx={{ color: "text.secondary" }}>{item?.employee || "Не указано"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Уборку подтвердил</Typography>
            <Typography sx={{ color: "text.secondary" }}>
              {item?.confirmer || "Не указано"}
            </Typography>
          </Grid> */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Объем заготовки"
              value={form.volume}
              onChange={(event) => setForm((prev) => ({ ...prev, volume: event.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Объем отходов"
              value={form.waste}
              onChange={(event) => setForm((prev) => ({ ...prev, waste: event.target.value }))}
            />
          </Grid>
          {item?.history?.length ? (
            <Grid size={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>История изменений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          sx={{
            ...dialogButtonSx,
            bgcolor: "#16a34a",
            color: "#fff",
            "&:hover": { bgcolor: "#15803d" },
          }}
        >
          Сохранить
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={dialogButtonSx}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
