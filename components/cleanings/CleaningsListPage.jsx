import {
  Box,
  Chip,
  Grid,
  InputAdornment,
  Paper,
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
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { getCategoryName, getScheduleText, tableHeaderSx, tableRowSx } from "./helpers";
import { CleaningActions } from "./shared";

export default function CleaningsListPage({
  query,
  setQuery,
  filter,
  setFilter,
  filteredTemplates,
  templates,
  categories,
  openEdit,
  toggleArchive,
  setHistoryItem,
}) {
  return (
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
            p: { xs: 0, md: 1.5 },
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: { xs: 1.75, md: 0 },
            borderBottom: { xs: 0, md: "1px solid #e0e0e0" },
          }}
        >
          <Box
            sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" }, flex: 1 }}
          >
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию или роли"
              sx={{ width: { xs: "100%", sm: 420 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, value) => value && setFilter(value)}
              sx={{
                "& .MuiToggleButton-root": {
                  px: 1.75,
                  py: 0,
                  height: 40,
                  minHeight: 40,
                  lineHeight: "20px",
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                },
              }}
            >
              <ToggleButton value="active">Активные</ToggleButton>
              <ToggleButton value="archive">Архив</ToggleButton>
              <ToggleButton value="all">Все</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography sx={{ color: "text.secondary", fontSize: 14, whiteSpace: "nowrap" }}>
            Показано <b>{filteredTemplates.length}</b> из {templates.length}
          </Typography>
        </Box>

        <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={tableHeaderSx}>
                <TableCell sx={{ width: "34%" }}>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Длительность</TableCell>
                <TableCell sx={{ width: "18%" }}>Расписание</TableCell>
                <TableCell align="center">Локации</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={tableRowSx}
                >
                  <TableCell
                    className="cleaning-name-cell"
                    sx={{ borderLeft: "3px solid transparent" }}
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{item.name}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      {item.confirmation ? "С подтверждением менеджера" : "Без подтверждения"}
                    </Typography>
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
                  <TableCell align="center">
                    <Chip
                      label={item.locationIds.length}
                      size="small"
                      sx={{ fontWeight: 700, minWidth: 32, height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === "archive" ? "Архив" : "Активный"}
                      color={item.status === "archive" ? "default" : "success"}
                      size="small"
                      sx={{ fontWeight: 700, height: 22 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CleaningActions
                      item={item}
                      onEdit={openEdit}
                      onArchiveToggle={toggleArchive}
                      onHistory={setHistoryItem}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.75, p: 0 }}>
          {filteredTemplates.map((item) => (
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
                    {item.name}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    {item.confirmation ? "С подтверждением менеджера" : "Без подтверждения"}
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
                <Chip
                  label={item.status === "archive" ? "Архив" : "Активный"}
                  color={item.status === "archive" ? "default" : "success"}
                  size="small"
                  sx={{ justifySelf: "start", width: "fit-content", height: 22 }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                  mb: 0.75,
                }}
              >
                <ScheduleOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: 14 }}>
                  {item.duration} мин · {getScheduleText(item)}
                </Typography>
              </Box>
              <Typography sx={{ color: "text.secondary", mb: 1, fontSize: 14 }}>
                Локаций: {item.locationIds.length}
              </Typography>
              <CleaningActions
                item={item}
                onEdit={openEdit}
                onArchiveToggle={toggleArchive}
                onHistory={setHistoryItem}
              />
            </Paper>
          ))}
        </Box>
      </Paper>
    </Grid>
  );
}
