import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { locations } from "./constants";
import {
  getCategoryName,
  getControlStatusMeta,
  getLocationName,
  getLocationNameById,
  isDateInRange,
  tableHeaderSx,
  tableRowSx,
} from "./helpers";

const actionButtonSx = {
  borderRadius: "8px",
  fontWeight: 700,
  minHeight: 36,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

export default function ControlView({
  items,
  templates,
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
}) {
  const filteredByContext = items.filter(
    (item) => item.locationId === selectedCafeId && isDateInRange(item.date, dateFrom, dateTo),
  );
  const visibleItems = filteredByContext.filter(
    (item) => filter === "all" || item.status === filter,
  );
  const pendingCount = filteredByContext.filter((item) => item.status === "pending").length;
  const activeCount = filteredByContext.filter((item) => item.status === "active").length;
  const inProgressCount = filteredByContext.filter((item) => item.status === "in_progress").length;
  const approvedCount = filteredByContext.filter((item) => item.status === "approved").length;
  const filterItems = [
    { value: "all", label: "Все" },
    { value: "active", label: "Активно", count: activeCount },
    { value: "in_progress", label: "В процессе", count: inProgressCount },
    { value: "pending", label: "Ожидают", count: pendingCount },
    { value: "approved", label: "Подтверждено", count: approvedCount },
  ];

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
              gridTemplateColumns: { xs: "1fr", md: "260px 170px 170px auto" },
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
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddManualOpen}
              sx={{ ...actionButtonSx, justifySelf: { xs: "stretch", md: "end" } }}
            >
              Добавить уборку
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
              sx={{ minWidth: 1180 }}
            >
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "20%" }}>Уборка</TableCell>
                  <TableCell>Кафе</TableCell>
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
                  const statusMeta = getControlStatusMeta(item.status);

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
                          {cleaning?.name || "Уборка"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {getLocationNameById(item.locationId)}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.employee || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.startedAt || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.finishedAt || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.confirmedAt || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.confirmer || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusMeta.label}
                          size="small"
                          sx={{
                            height: 24,
                            color: statusMeta.color,
                            bgcolor: statusMeta.bgcolor,
                            border: "1px solid",
                            borderColor: statusMeta.borderColor,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <ControlRowActions
                          item={item}
                          onApprove={onApprove}
                          onReturn={onReturn}
                          onDetach={onDetach}
                          onDelete={onDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visibleItems.length ? null : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
              const statusMeta = getControlStatusMeta(item.status);

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
                        {cleaning?.name || "Уборка"}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        {getLocationNameById(item.locationId)}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.employee || "—"} · {item.startedAt || "—"} — {item.finishedAt || "—"}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        Подтвердили: {item.confirmedAt || "—"} · {item.confirmer || "—"}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusMeta.label}
                      size="small"
                      sx={{
                        justifySelf: "start",
                        width: "fit-content",
                        maxWidth: "100%",
                        height: 22,
                        color: statusMeta.color,
                        bgcolor: statusMeta.bgcolor,
                        border: "1px solid",
                        borderColor: statusMeta.borderColor,
                        "& .MuiChip-label": {
                          px: 1.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <ControlRowActions
                    item={item}
                    onApprove={onApprove}
                    onReturn={onReturn}
                    onDetach={onDetach}
                    onDelete={onDelete}
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

function ControlRowActions({ item, onApprove, onReturn, onDetach, onDelete, mobile = false }) {
  const gridSx = mobile
    ? {
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, auto)" },
        gap: 1,
      }
    : { display: "flex", justifyContent: "flex-end", gap: 1 };
  const buttonSx = mobile ? { ...actionButtonSx, minHeight: 44, width: "100%" } : actionButtonSx;

  if (item.status === "approved") {
    return <Typography sx={{ color: "text.disabled", fontSize: 14 }}>—</Typography>;
  }

  return (
    <Box sx={gridSx}>
      {item.status === "pending" ? (
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
      {item.status === "in_progress" ? (
        <Button
          size="small"
          variant="contained"
          startIcon={<ReplayIcon />}
          onClick={() => onDetach(item.id)}
          sx={{ ...buttonSx, bgcolor: "#f59e0b", color: "#fff", "&:hover": { bgcolor: "#d97706" } }}
        >
          Снять
        </Button>
      ) : null}
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
    </Box>
  );
}

export function AddManualCleaningDialog({
  open,
  items,
  categories,
  cafeId,
  query,
  onQueryChange,
  onClose,
  onAdd,
}) {
  const filteredItems = items.filter((item) => {
    const search = query.trim().toLowerCase();
    const byCafe = item.locationIds.includes(cafeId);
    const bySearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      getCategoryName(categories, item.categoryId).toLowerCase().includes(search);

    return byCafe && bySearch;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Добавить уборку
        <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
          {getLocationNameById(cafeId)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 1.5 }}>
        <TextField
          size="small"
          value={query}
          placeholder="Поиск по названию, роли или категории"
          onChange={(event) => onQueryChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "grid", gap: 1, maxHeight: 420, overflow: "auto" }}>
          {filteredItems.length ? (
            filteredItems.map((item) => (
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
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    {getCategoryName(categories, item.categoryId)} · {item.role} · {item.duration}{" "}
                    мин
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => onAdd(item.id)}
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
            ))
          ) : (
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Нет ручных уборок для выбранного кафе
            </Typography>
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
