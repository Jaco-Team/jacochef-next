import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const unitNameOf = (unitsById, unitId) => {
  if (unitId === null || unitId === undefined) return "Без отдела";
  return unitsById.get(Number(unitId))?.name || "Без отдела";
};

const officeStatus = (value) => {
  if (value === null || value === undefined) {
    return { label: "Не задано", color: "warning" };
  }

  return Number(value) === 1 ? { label: "Да", color: "info" } : { label: "Нет", color: "default" };
};

const compareRu = (left, right) => String(left || "").localeCompare(String(right || ""), "ru");

const buildRows = (units, appointments) => {
  const unitsById = new Map(
    (Array.isArray(units) ? units : []).map((unit) => [Number(unit.id), unit]),
  );

  return (Array.isArray(appointments) ? appointments : [])
    .filter((item) => Number(item?.id) > 0)
    .map((item) => {
      const unitId =
        item.unit_id === null || item.unit_id === undefined ? null : Number(item.unit_id);
      const unit = unitId === null ? null : unitsById.get(unitId);

      return {
        id: Number(item.id),
        name: item.name || "Без названия",
        unitId,
        unitName: unitNameOf(unitsById, unitId),
        unitSort: Number(unit?.sort ?? Number.MAX_SAFE_INTEGER),
        sort: Number(item.sort ?? Number.MAX_SAFE_INTEGER),
        isOffice: item.is_office,
        searchText: `${item.name || ""} ${unitNameOf(unitsById, unitId)}`.toLowerCase(),
        item,
      };
    });
};

export default function EmployeeHierarchyList({
  units = [],
  items = [],
  canEdit = false,
  search = "",
  onVisibleCountChange,
  onPositionClick,
}) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const rows = useMemo(() => buildRows(units, items), [units, items]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query ? rows.filter((row) => row.searchText.includes(query)) : rows;

    const direction = sortDirection === "asc" ? 1 : -1;

    return [...filtered].sort((left, right) => {
      if (sortBy === "unit") {
        return (
          (left.unitSort - right.unitSort || compareRu(left.unitName, right.unitName)) *
            direction ||
          left.sort - right.sort ||
          compareRu(left.name, right.name)
        );
      }

      if (sortBy === "office") {
        const leftValue =
          left.isOffice === null || left.isOffice === undefined ? 2 : Number(left.isOffice);
        const rightValue =
          right.isOffice === null || right.isOffice === undefined ? 2 : Number(right.isOffice);
        return (leftValue - rightValue) * direction || compareRu(left.name, right.name);
      }

      return (
        compareRu(left.name, right.name) * direction ||
        left.unitSort - right.unitSort ||
        compareRu(left.unitName, right.unitName)
      );
    });
  }, [rows, search, sortBy, sortDirection]);

  useEffect(() => {
    if (typeof onVisibleCountChange === "function") {
      onVisibleCountChange(visibleRows.length);
    }
  }, [onVisibleCountChange, visibleRows.length]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortDirection("asc");
  };

  const openPosition = (row) => {
    if (typeof onPositionClick === "function") onPositionClick(row.item);
  };

  return (
    <Stack spacing={1.5}>
      {!visibleRows.length ? (
        <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
          <Typography sx={{ fontWeight: 700 }}>Ничего не найдено</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13 }}>Измените поиск или фильтр отдела.</Typography>
        </Box>
      ) : isMobile ? (
        <Stack spacing={1}>
          {visibleRows.map((row) => (
            <Box
              key={row.id}
              onClick={() => openPosition(row)}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800 }}>{row.name}</Typography>
                  <Typography sx={{ mt: 0.25, color: "text.secondary", fontSize: 13 }}>
                    {row.unitName}
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={officeStatus(row.isOffice).color}
                    label={`Офисная: ${officeStatus(row.isOffice).label}`}
                    sx={{ mt: 1, height: 22 }}
                  />
                </Box>
                <ChevronRightIcon sx={{ mt: 0.25, color: "text.disabled" }} />
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            maxHeight: "calc(100vh - 320px)",
            minHeight: 320,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "auto",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "48%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: 48 }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy === "name" ? sortDirection : false}>
                  <TableSortLabel
                    active={sortBy === "name"}
                    direction={sortBy === "name" ? sortDirection : "asc"}
                    onClick={() => toggleSort("name")}
                  >
                    Должность
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === "unit" ? sortDirection : false}>
                  <TableSortLabel
                    active={sortBy === "unit"}
                    direction={sortBy === "unit" ? sortDirection : "asc"}
                    onClick={() => toggleSort("unit")}
                  >
                    Отдел
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === "office" ? sortDirection : false}>
                  <TableSortLabel
                    active={sortBy === "office"}
                    direction={sortBy === "office" ? sortDirection : "asc"}
                    onClick={() => toggleSort("office")}
                  >
                    Офисная
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="right"
                  aria-label="Открыть карточку"
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => openPosition(row)}
                  sx={{
                    height: 52,
                    cursor: "pointer",
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>{row.unitName}</TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={officeStatus(row.isOffice).color}
                      label={officeStatus(row.isOffice).label}
                      sx={{ height: 22 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label={canEdit ? "Редактировать должность" : "Открыть должность"}
                      onClick={(event) => {
                        event.stopPropagation();
                        openPosition(row);
                      }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}
