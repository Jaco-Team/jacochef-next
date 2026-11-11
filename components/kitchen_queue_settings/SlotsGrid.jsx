import { Fragment } from "react";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { JacoTextInput, uiColors, uiTableColors, uiTypography } from "@/design-system/shared/ui";

import { getHourSlots, getHourState } from "./kitchenQueueUtils";

const cellSx = { px: 0.5, py: 0.5, borderBottom: `1px solid ${uiColors.borderLight}` };

function LimitInput({ value, placeholder, dirty, disabled, ariaLabel, onChange }) {
  return (
    <JacoTextInput
      value={value === null || value === undefined ? "" : String(value)}
      placeholder={placeholder}
      disabled={disabled}
      inputProps={{
        inputMode: "numeric",
        maxLength: 2,
        "aria-label": ariaLabel,
        style: { textAlign: "center" },
      }}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        minWidth: 56,
        "& .MuiInputBase-root": {
          minHeight: 36,
          backgroundColor: dirty
            ? uiColors.primarySoft
            : value === 0
              ? uiColors.surfaceMuted
              : uiColors.surface,
        },
      }}
    />
  );
}

/**
 * Сетка лимитов: строка — час, столбец — день. Число в ячейке часа ставится всем четырём слотам;
 * раскрытый час показывает слоты по отдельности.
 */
export default function SlotsGrid({
  columns,
  hours,
  expandedHours,
  disabled,
  getValue,
  isDirty,
  onToggleHour,
  onHourChange,
  onSlotChange,
}) {
  return (
    <TableContainer>
      <Table
        size="small"
        sx={{ minWidth: 120 + columns.length * 72 }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...cellSx, width: 104 }} />
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align="center"
                sx={{
                  ...cellSx,
                  ...uiTypography.label,
                  fontWeight: 500,
                  color: uiColors.textStrong,
                }}
              >
                {column.header ?? column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((hour) => {
            const slots = getHourSlots(hour);
            const expanded = expandedHours.includes(hour);

            return (
              <Fragment key={hour}>
                <TableRow>
                  <TableCell sx={cellSx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        aria-label={`${expanded ? "Свернуть" : "Раскрыть"} час ${hour}:00`}
                        aria-expanded={expanded}
                        onClick={() => onToggleHour(hour)}
                      >
                        <ExpandMoreRoundedIcon
                          fontSize="small"
                          sx={{ transform: expanded ? "rotate(180deg)" : "none" }}
                        />
                      </IconButton>
                      <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                        {hour}:00
                      </Typography>
                    </Box>
                  </TableCell>
                  {columns.map((column) => {
                    const state = getHourState(slots.map((time) => getValue(column.key, time)));

                    return (
                      <TableCell
                        key={column.key}
                        sx={cellSx}
                      >
                        <LimitInput
                          value={state.value}
                          placeholder={state.kind === "mixed" ? "разные" : ""}
                          dirty={slots.some((time) => isDirty(column.key, time))}
                          disabled={disabled}
                          ariaLabel={`${column.label}, ${hour}:00, весь час`}
                          onChange={(raw) => onHourChange(column.key, hour, raw)}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>

                {expanded
                  ? slots.map((time) => (
                      <TableRow
                        key={time}
                        sx={{ backgroundColor: uiTableColors.rowHover }}
                      >
                        <TableCell sx={{ ...cellSx, pl: 5.5 }}>
                          <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>
                            {time}
                          </Typography>
                        </TableCell>
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            sx={cellSx}
                          >
                            <LimitInput
                              value={getValue(column.key, time)}
                              placeholder=""
                              dirty={isDirty(column.key, time)}
                              disabled={disabled}
                              ariaLabel={`${column.label}, слот ${time}`}
                              onChange={(raw) => onSlotChange(column.key, time, raw)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
