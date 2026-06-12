import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import { getControlStatusMeta, tableHeaderSx, tableRowSx } from "./helpers";

export default function ControlView({
  items,
  templates,
  filter,
  onFilterChange,
  onApprove,
  onReturn,
  onDelete,
}) {
  const visibleItems = items.filter((item) => filter === "all" || item.status === filter);
  const pendingCount = items.filter((item) => item.status === "pending").length;
  const activeCount = items.filter((item) => item.status === "active").length;
  const inProgressCount = items.filter((item) => item.status === "in_progress").length;
  const approvedCount = items.filter((item) => item.status === "approved").length;
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
            <Table size="small">
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell sx={{ width: "30%" }}>Уборка</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell>Завершение</TableCell>
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
                        {item.employee}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.startedAt || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: 14 }}>
                        {item.finishedAt || "—"}
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
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          {item.status === "pending" ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ReplayIcon />}
                                onClick={() => onReturn(item.id)}
                                sx={{
                                  borderRadius: "8px",
                                  fontWeight: 700,
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
                                  borderRadius: "8px",
                                  fontWeight: 700,
                                  bgcolor: "#16a34a",
                                  color: "#fff",
                                  "&:hover": { bgcolor: "#15803d" },
                                }}
                              >
                                Подтвердить
                              </Button>
                            </>
                          ) : null}
                          {item.status !== "approved" ? (
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
                  );
                })}
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
                        {item.employee} · {item.startedAt || "—"} — {item.finishedAt || "—"}
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
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, auto)",
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
                          startIcon={<ReplayIcon />}
                          onClick={() => onReturn(item.id)}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 700,
                            minHeight: 44,
                            width: "100%",
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
                            borderRadius: "8px",
                            fontWeight: 700,
                            minHeight: 44,
                            width: "100%",
                            bgcolor: "#16a34a",
                            color: "#fff",
                            "&:hover": { bgcolor: "#15803d" },
                          }}
                        >
                          Подтвердить
                        </Button>
                      </>
                    ) : null}
                    {item.status !== "approved" ? (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => onDelete(item.id)}
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 700,
                          minHeight: 44,
                          width: "100%",
                          bgcolor: "primary.main",
                          color: "#fff",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        Удалить
                      </Button>
                    ) : null}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
