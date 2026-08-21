import dayjs from "dayjs";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WbIncandescentOutlinedIcon from "@mui/icons-material/WbIncandescentOutlined";
import { isSameId } from "./helpers";

function activityCells(day, lampId) {
  return day?.lamps?.find((lamp) => isSameId(lamp.lamp_id, lampId)) || null;
}

export function fallbackLampGroups(lamps) {
  const predecessorById = new Map();
  lamps.forEach((lamp) => {
    if (lamp.replaced_by_lamp_id) predecessorById.set(String(lamp.replaced_by_lamp_id), lamp);
  });

  const grouped = new Set();
  const groups = [];
  lamps
    .filter((lamp) => Number(lamp.is_active) === 1)
    .forEach((active) => {
      const inactive = [];
      let previous = predecessorById.get(String(active.id));
      while (previous && !grouped.has(String(previous.id))) {
        inactive.push(previous);
        grouped.add(String(previous.id));
        previous = predecessorById.get(String(previous.id));
      }
      grouped.add(String(active.id));
      groups.push({ active, inactive });
    });
  lamps
    .filter((lamp) => !grouped.has(String(lamp.id)))
    .forEach((lamp) => {
      grouped.add(String(lamp.id));
      groups.push({ active: null, inactive: [lamp] });
    });
  return groups;
}

function lampPeriodRows(lamp, days) {
  return days.filter((day) => Boolean(activityCells(day, lamp.id)?.id));
}

function TableWrapper({ children }) {
  return <TableContainer sx={{ maxHeight: "50dvh" }}>{children}</TableContainer>;
}

function LampSummary({
  lamp,
  historical,
  canEdit,
  onEdit,
  onHistory,
  onReplace,
  showActions = true,
  compact = false,
}) {
  const replacementDate = lamp.removed_at
    ? dayjs(lamp.removed_at).format("DD.MM.YYYY")
    : "дата не указана";

  return (
    <Box
      sx={{
        p: compact ? 0 : { xs: 1.25, md: 1.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        flexWrap: { xs: "wrap", md: "nowrap" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flex: 1,
          minWidth: 0,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Chip
          size="small"
          color={historical ? "default" : "primary"}
          label={historical ? `Заменена: ${replacementDate}` : "Текущая лампа"}
        />
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <PlaceOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.place || "—"}</Typography>
        </Box>
        <Typography variant="body2">№{lamp.number}</Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <WbIncandescentOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.name || "—"}</Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          ID {lamp.id}
        </Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <TimerOutlinedIcon fontSize="small" />
          <Typography color="text.secondary">
            {lamp.total_svod || "0:00"} / {lamp.resource || 0} ч
          </Typography>
        </Box>
      </Box>
      {showActions ? (
        <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
          {canEdit && !historical ? (
            <Tooltip title="Редактировать реквизиты лампы">
              <IconButton
                color="primary"
                size="small"
                aria-label="Редактировать реквизиты лампы"
                onClick={() => onEdit(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {canEdit && !historical ? (
            <Tooltip title="Заменить лампу">
              <IconButton
                color="primary"
                size="small"
                aria-label="Заменить лампу"
                onClick={() => onReplace(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <WbIncandescentOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="История лампы">
            <IconButton
              color="primary"
              size="small"
              aria-label="История лампы"
              onClick={() => onHistory(lamp)}
              sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
            >
              <HistoryOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
    </Box>
  );
}

function LampActivityTable({ lamp, days, canEdit, historical, onEditActivity, onAddActivity }) {
  const rows = lampPeriodRows(lamp, days);
  const periodTotal = lamp.svod || "0:00";
  const desktop = useMediaQuery("(min-width:900px)");

  return (
    <TableWrapper>
      <Table
        stickyHeader={desktop}
        size="small"
        sx={{
          minWidth: 650,
          "& th, & td": {
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            verticalAlign: "middle",
          },
          "& th": { bgcolor: "action.hover" },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Дата проверки</TableCell>
            <TableCell>Включение</TableCell>
            <TableCell>Выключение</TableCell>
            <TableCell>Время работы</TableCell>
            <TableCell>Подпись менеджера смены</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((day) => {
            const activity = activityCells(day, lamp.id);
            const isInteractive = Boolean(activity?.id && canEdit && !historical);

            return (
              <TableRow
                key={`${lamp.id}-${day.date}`}
                hover={isInteractive}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={() => isInteractive && onEditActivity(activity)}
                onKeyDown={(event) => {
                  if (isInteractive && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onEditActivity(activity);
                  }
                }}
                sx={{
                  cursor: isInteractive ? "pointer" : "default",
                  "&:focus-visible": isInteractive
                    ? { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 }
                    : undefined,
                }}
              >
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{day.date}</TableCell>
                <TableCell>{activity?.only_time_start || "—"}</TableCell>
                <TableCell>{activity?.only_time_end || "—"}</TableCell>
                <TableCell>{activity?.diff || "—"}</TableCell>
                <TableCell sx={{ color: day.manager ? "text.primary" : "text.disabled" }}>
                  {day.manager || "—"}
                </TableCell>
              </TableRow>
            );
          })}
          {!rows.length ? (
            <TableRow>
              <TableCell
                colSpan={5}
                sx={{ color: "text.secondary" }}
              >
                За выбранный период активности нет.
              </TableCell>
            </TableRow>
          ) : null}
          {canEdit && !historical ? (
            <TableRow>
              <TableCell>Добавить</TableCell>
              <TableCell colSpan={4}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onAddActivity(lamp)}
                >
                  Добавить активацию
                </Button>
              </TableCell>
            </TableRow>
          ) : null}
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ fontWeight: 800 }}
            >
              Отработано часов
            </TableCell>
            <TableCell sx={{ fontWeight: 800 }}>{periodTotal}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

export default function CleaningsLampLifecycle({
  group,
  days,
  canEdit,
  onEditLamp,
  onHistory,
  onReplace,
  onEditActivity,
  onAddActivity,
}) {
  return (
    <Box sx={{ display: "grid", gap: 1.25, pb: 2 }}>
      {group.active ? (
        <Paper
          variant="outlined"
          sx={{ overflow: "hidden", borderRadius: "10px" }}
        >
          <LampSummary
            lamp={group.active}
            canEdit={canEdit}
            onEdit={onEditLamp}
            onHistory={onHistory}
            onReplace={onReplace}
          />
          <LampActivityTable
            lamp={group.active}
            days={days}
            canEdit={canEdit}
            onEditActivity={onEditActivity}
            onAddActivity={onAddActivity}
          />
        </Paper>
      ) : null}
      {group.inactive.map((lamp) => (
        <Accordion
          key={lamp.id}
          disableGutters
          variant="outlined"
          sx={{ borderRadius: "10px !important", overflow: "hidden" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: { xs: 1.25, md: 1.5 },
              "& .MuiAccordionSummary-content": { my: 1.5, minWidth: 0 },
            }}
          >
            <LampSummary
              lamp={lamp}
              historical
              compact
              canEdit={false}
              onEdit={() => {}}
              onHistory={onHistory}
              onReplace={() => {}}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <LampActivityTable
              lamp={lamp}
              days={days}
              historical
              canEdit={false}
              onEditActivity={onEditActivity}
              onAddActivity={onAddActivity}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
