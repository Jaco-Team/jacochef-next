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
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { locations, roles } from "./constants";
import {
  getCategoryName,
  getLocationName,
  getScheduleText,
  tableHeaderSx,
  tableRowSx,
} from "./helpers";

export default function CafesView({
  templates,
  categories,
  selectedCafeId,
  roleFilter,
  onCafeChange,
  onRoleFilterChange,
  onRemoveCleaning,
}) {
  const selectedCafe = locations.find((location) => location.id === selectedCafeId) || locations[0];
  const assignedCleanings = templates.filter((template) =>
    template.locationIds.includes(selectedCafeId),
  );
  const visibleCleanings = assignedCleanings.filter(
    (template) => roleFilter === "all" || template.role === roleFilter,
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
                  color: "text.secondary",
                  flexShrink: 0,
                  display: { xs: "none", md: "block" },
                }}
              />
              <FormControl
                size="small"
                sx={{ flex: { xs: 1, md: "initial" }, minWidth: 0, width: { xs: "auto", md: 320 } }}
              >
                <Select
                  value={selectedCafeId}
                  onChange={(event) => onCafeChange(event.target.value)}
                  IconComponent={ExpandMoreIcon}
                  sx={{
                    "& .MuiSelect-select": {
                      py: { xs: 1, md: 1.25 },
                      fontSize: { xs: 14, md: 14 },
                    },
                  }}
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

              <FormControl
                size="small"
                sx={{
                  flex: { xs: "1 1 100%", md: "initial" },
                  minWidth: { xs: 0, md: 180 },
                }}
              >
                <Select
                  value={roleFilter}
                  onChange={(event) => onRoleFilterChange(event.target.value)}
                  IconComponent={ExpandMoreIcon}
                  sx={{
                    "& .MuiSelect-select": {
                      py: { xs: 1, md: 1.25 },
                      fontSize: { xs: 14, md: 14 },
                    },
                  }}
                >
                  <MenuItem value="all">Все роли</MenuItem>
                  {roles.map((role) => (
                    <MenuItem
                      key={role}
                      value={role}
                    >
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
                whiteSpace: { xs: "normal", md: "nowrap" },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <b>{assignedCleanings.length}</b> уборок назначено на «{selectedCafe.name}»
            </Typography>
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
            <Table size="small">
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "34%" }}>Уборка</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell sx={{ width: "24%" }}>Расписание</TableCell>
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
                      sx={{ borderLeft: "3px solid transparent" }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{item.name}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                          {item.confirmation ? "С подтверждением менеджера" : "Без подтверждения"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryName(categories, item.categoryId)}
                        size="small"
                        sx={{ height: 24, bgcolor: "surface.subtle", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.role}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 58,
                          py: 0.5,
                          borderRadius: "8px",
                          bgcolor: "surface.muted",
                          textAlign: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: "18px" }}>
                          {item.duration}
                        </Typography>
                        <Typography
                          sx={{ color: "text.secondary", fontSize: 11, lineHeight: "14px" }}
                        >
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
                          color: "text.secondary",
                        }}
                      >
                        <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontSize: 14 }}>{getScheduleText(item)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Убрать из кафе">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onRemoveCleaning(item.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {visibleCleanings.length ? null : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
            {visibleCleanings.map((item) => (
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
                <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.75 }}>
                      <Chip
                        label={getCategoryName(categories, item.categoryId)}
                        size="small"
                        sx={{ height: 22, bgcolor: "surface.subtle", fontWeight: 700 }}
                      />
                      <Chip
                        label={item.role}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onRemoveCleaning(item.id)}
                    sx={{
                      justifySelf: "start",
                      minHeight: 36,
                      px: 1.75,
                      borderRadius: "8px",
                      fontWeight: 700,
                      bgcolor: "primary.main",
                      color: "#fff",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    Убрать
                  </Button>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}
                >
                  <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: 14 }}>
                    {item.duration} мин · {getScheduleText(item)}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {visibleCleanings.length ? null : (
              <Typography
                sx={{ color: "text.secondary", fontSize: 14, textAlign: "center", py: 3 }}
              >
                Нет уборок по выбранным фильтрам
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export function AddCafeCleaningDialog({
  open,
  cafe,
  items,
  categories,
  query,
  onQueryChange,
  onClose,
  onAdd,
}) {
  const filteredItems = items.filter((item) => {
    const search = query.trim().toLowerCase();

    return (
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      getCategoryName(categories, item.categoryId).toLowerCase().includes(search)
    );
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
          {cafe ? getLocationName(cafe) : ""}
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
              Нет уборок, которые можно добавить
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: "8px" }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RemoveCafeCleaningDialog({ open, cleaning, cafe, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Убрать уборку?</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
          Уборка «{cleaning?.name || ""}» будет убрана из кафе «{cafe?.name || ""}».
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: "8px" }}
        >
          Отмена
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          sx={{ borderRadius: "8px" }}
        >
          Убрать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
