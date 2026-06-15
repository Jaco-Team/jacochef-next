import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
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
import { locations } from "./constants";
import {
  formatControlTime,
  getLocationName,
  getLocationNameById,
  isDateInRange,
  tableHeaderSx,
  tableRowSx,
} from "./helpers";

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

export default function PreparationControlView({
  items,
  selectedCafeId,
  dateFrom,
  dateTo,
  onCafeChange,
  onDateFromChange,
  onDateToChange,
  onEdit,
  onApprove,
  onDelete,
}) {
  const visibleItems = items.filter(
    (item) =>
      item.locationId === selectedCafeId && isDateInRange(item.preparedAt, dateFrom, dateTo),
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
              gridTemplateColumns: { xs: "1fr", md: "260px 170px 170px" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <FormControl size="small">
              <Select
                value={selectedCafeId}
                onChange={(event) => onCafeChange(event.target.value)}
                IconComponent={ExpandMoreIcon}
              >
                {locations.map((location) => (
                  <MenuItem
                    key={location.id}
                    value={location.id}
                  >
                    {getLocationName(location)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="date"
              label="Дата от"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Дата до"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
              sx={{ minWidth: 1060 }}
            >
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "20%" }}>Позиция</TableCell>
                  <TableCell>Кафе</TableCell>
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
                        onClick={() => onEdit(item.id)}
                        sx={{
                          p: 0,
                          border: 0,
                          bgcolor: "transparent",
                          color: "primary.main",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 14,
                          fontWeight: 800,
                          textAlign: "left",
                          textTransform: "uppercase",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {getLocationNameById(item.locationId)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {formatControlTime(item.preparedAt)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{item.volume}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{item.waste}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.employee}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.helper || "—"}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {formatControlTime(item.confirmedAt)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                      {item.confirmer || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {item.status === "pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => onApprove(item.id)}
                            sx={{
                              borderRadius: "8px",
                              fontWeight: 700,
                              bgcolor: "#16a34a",
                              color: "#fff",
                              "&:hover": { bgcolor: "#15803d" },
                            }}
                          >
                            Подтвердить
                          </Button>
                        ) : null}
                        {item.status === "pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => onDelete(item.id)}
                            sx={{
                              borderRadius: "8px",
                              fontWeight: 700,
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
                      onClick={() => onEdit(item.id)}
                      sx={{
                        p: 0,
                        border: 0,
                        bgcolor: "transparent",
                        color: "primary.main",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 16,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        textAlign: "left",
                        textTransform: "uppercase",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                      {getLocationNameById(item.locationId)}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                      {formatControlTime(item.preparedAt)} · {item.volume} / {item.waste}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gap: 0.25, mb: 1 }}>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Сотрудник: {item.employee}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Подтвердили: {formatControlTime(item.confirmedAt)}
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
                  {item.status === "pending" ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => onApprove(item.id)}
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 700,
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
                          borderRadius: "8px",
                          fontWeight: 700,
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
      PaperProps={{ sx: { borderRadius: "12px" } }}
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
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          sx={{
            ...actionButtonSx,
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
          sx={actionButtonSx}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
