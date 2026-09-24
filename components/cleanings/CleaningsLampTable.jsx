import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { isSameId } from "./helpers";
import CleaningsLampSummary from "./CleaningsLampSummary";

const stickyFooterCellStyle = {
  position: "sticky",
  bottom: 0,
  zIndex: 1,
  backgroundColor: "#fff",
  fontWeight: 800,
};

function activityForLamp(day, lampId) {
  return day?.lamps?.find((lamp) => isSameId(lamp.lamp_id, lampId)) || null;
}

function periodRows(lamp, days) {
  return days.filter((day) => Boolean(activityForLamp(day, lamp.id)?.id));
}

export default function CleaningsLampTable({
  lamp,
  days,
  canEdit,
  historical = false,
  onEditActivity,
  onAddActivity,
}) {
  const rows = periodRows(lamp, days);
  const desktop = useMediaQuery("(min-width:900px)");

  return (
    <TableContainer sx={{ maxHeight: "50dvh" }}>
      <Table
        stickyHeader={desktop}
        size="small"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          "& th, & td": {
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center">Дата проверки</TableCell>
            <TableCell align="center">Включение</TableCell>
            <TableCell align="center">Выключение</TableCell>
            <TableCell align="center">Время работы</TableCell>
            <TableCell align="center">Подпись менеджера смены</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((day) => (
            <LampActivityRow
              key={`${lamp.id}-${day.date}`}
              day={day}
              lampId={lamp.id}
              canEdit={canEdit}
              historical={historical}
              onEditActivity={onEditActivity}
            />
          ))}
          {!rows.length ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
              >
                За выбранный период активности нет.
              </TableCell>
            </TableRow>
          ) : null}
          {canEdit && !historical ? (
            <TableRow>
              <TableCell align="center">Добавить</TableCell>
              <TableCell
                colSpan={4}
                align="center"
              >
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
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={3}
              style={stickyFooterCellStyle}
            >
              Отработано часов
            </TableCell>
            <TableCell
              align="center"
              style={stickyFooterCellStyle}
            >
              {lamp.svod || "0:00"}
            </TableCell>
            <TableCell style={stickyFooterCellStyle} />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

function LampActivityRow({ day, lampId, canEdit, historical, onEditActivity }) {
  const activity = activityForLamp(day, lampId);
  const interactive = Boolean(activity?.id && canEdit && !historical);

  return (
    <TableRow
      hover={interactive}
      tabIndex={interactive ? 0 : undefined}
      onClick={() => interactive && onEditActivity(activity)}
      onKeyDown={(event) => {
        if (interactive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onEditActivity(activity);
        }
      }}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      <TableCell align="center">{day.date}</TableCell>
      <TableCell align="center">{activity?.only_time_start || "—"}</TableCell>
      <TableCell align="center">{activity?.only_time_end || "—"}</TableCell>
      <TableCell align="center">{activity?.diff || "—"}</TableCell>
      <TableCell align="center">{day.manager || "—"}</TableCell>
    </TableRow>
  );
}

export function CleaningsInactiveLamp({ lamp, days, onHistory }) {
  const [expanded, setExpanded] = useState(true);

  const toggle = () => setExpanded((value) => !value);

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1.25 }}>
      <Box
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        sx={{ display: "flex", alignItems: "center", cursor: "pointer", p: { xs: 1.25, md: 1.5 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CleaningsLampSummary
            lamp={lamp}
            historical
            compact
            showActions={false}
          />
        </Box>
        <Tooltip title="История лампы">
          <IconButton
            color="primary"
            size="small"
            aria-label="История лампы"
            onClick={(event) => {
              event.stopPropagation();
              onHistory(lamp);
            }}
            sx={{ mr: 1.5, border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
          >
            <HistoryOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          aria-label={expanded ? "Свернуть историю лампы" : "Развернуть историю лампы"}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          sx={{ mr: 1 }}
        >
          <ExpandMoreIcon sx={{ transform: expanded ? "rotate(180deg)" : "none" }} />
        </IconButton>
      </Box>
      <Collapse
        in={expanded}
        unmountOnExit
      >
        <CleaningsLampTable
          lamp={lamp}
          days={days}
          historical
          canEdit={false}
        />
      </Collapse>
    </Box>
  );
}
