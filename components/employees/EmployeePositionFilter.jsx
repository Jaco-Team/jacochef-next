import React, { useMemo } from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  ListItemText,
  TextField,
  Typography,
  createFilterOptions,
} from "@mui/material";

const ALL_OPTION = { id: "__ALL__", name: "Все должности", unit_name: "Общее" };

const optionId = (option) => Number(option?.id ?? 0);
const unitGroupKey = (option) =>
  option?.id === ALL_OPTION.id
    ? "__ALL__"
    : `${option?.unit_id ?? "without_unit"}::${option?.unit_name || "Без отдела"}`;

export default function EmployeePositionFilter({ options, value, onChange, onBlur, disabled }) {
  const positions = useMemo(
    () =>
      (Array.isArray(options) ? options : [])
        .filter((option) => optionId(option) > 0)
        .sort(
          (left, right) =>
            Number(left.unit_sort ?? Number.MAX_SAFE_INTEGER) -
              Number(right.unit_sort ?? Number.MAX_SAFE_INTEGER) ||
            String(left.unit_name || "Без отдела").localeCompare(
              String(right.unit_name || "Без отдела"),
              "ru",
            ) ||
            Number(left.sort ?? Number.MAX_SAFE_INTEGER) -
              Number(right.sort ?? Number.MAX_SAFE_INTEGER) ||
            String(left.name || "").localeCompare(String(right.name || ""), "ru"),
        ),
    [options],
  );
  const selected = Array.isArray(value) ? value : [];
  const selectedIds = useMemo(
    () => new Set(selected.map((option) => optionId(option))),
    [selected],
  );
  const positionsByUnit = useMemo(() => {
    const groups = new Map();

    positions.forEach((position) => {
      const key = unitGroupKey(position);
      if (!groups.has(key)) {
        groups.set(key, {
          name: String(position.unit_name || "Без отдела"),
          positions: [],
        });
      }
      groups.get(key).positions.push(position);
    });

    return groups;
  }, [positions]);
  const actualValue = selected.length ? selected : [ALL_OPTION];
  const filterOptions = useMemo(
    () =>
      createFilterOptions({
        stringify: (option) => `${option.name || ""} ${option.unit_name || ""}`,
      }),
    [],
  );

  const setSelected = (next) => {
    const unique = new Map();

    next.forEach((option) => {
      const id = optionId(option);
      if (id > 0) unique.set(id, option);
    });

    const normalized = [...unique.values()];
    onChange?.(normalized.length === positions.length ? [] : normalized);
  };

  const toggleUnit = (unitKey) => {
    const unitPositions = positionsByUnit.get(unitKey)?.positions || [];
    const allSelected =
      unitPositions.length > 0 &&
      unitPositions.every((position) => selectedIds.has(optionId(position)));

    if (allSelected) {
      const unitIds = new Set(unitPositions.map((position) => optionId(position)));
      setSelected(selected.filter((position) => !unitIds.has(optionId(position))));
      return;
    }

    setSelected([
      ...selected,
      ...unitPositions.filter((position) => !selectedIds.has(optionId(position))),
    ]);
  };

  const renderCompactTags = (tagValue) => {
    if (tagValue.some((option) => option.id === ALL_OPTION.id)) {
      return (
        <Chip
          size="small"
          label="Все должности"
        />
      );
    }

    const labels = [];
    const coveredIds = new Set();

    positionsByUnit.forEach((unit) => {
      const unitPositions = unit.positions;
      if (
        unitPositions.length > 0 &&
        unitPositions.every((position) => selectedIds.has(optionId(position)))
      ) {
        labels.push({
          key: `unit-${unitGroupKey(unitPositions[0])}`,
          label: `${unit.name} · ${unitPositions.length}`,
          ids: unitPositions.map((position) => optionId(position)),
        });
        unitPositions.forEach((position) => coveredIds.add(optionId(position)));
      }
    });

    selected.forEach((position) => {
      const id = optionId(position);
      if (!coveredIds.has(id)) {
        labels.push({ key: `position-${id}`, label: position.name, ids: [id] });
      }
    });

    if (!labels.length) return null;

    const visible = labels.slice(0, 1);
    return (
      <>
        {visible.map((item) => (
          <Chip
            key={item.key}
            size="small"
            label={item.label}
            onDelete={() => {
              const removed = new Set(item.ids);
              setSelected(selected.filter((position) => !removed.has(optionId(position))));
            }}
          />
        ))}
        {labels.length > 1 ? (
          <Chip
            size="small"
            label={`+${labels.length - 1}`}
          />
        ) : null}
      </>
    );
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={[ALL_OPTION, ...positions]}
      value={actualValue}
      disabled={disabled}
      onBlur={onBlur}
      filterOptions={filterOptions}
      groupBy={unitGroupKey}
      getOptionLabel={(option) => String(option.name || "")}
      isOptionEqualToValue={(left, right) => String(left.id) === String(right.id)}
      onChange={(_, next, reason, details) => {
        if (details?.option?.id === ALL_OPTION.id) {
          onChange?.([]);
          return;
        }

        setSelected(next.filter((option) => option.id !== ALL_OPTION.id));
      }}
      renderTags={renderCompactTags}
      slotProps={{
        listbox: {
          sx: {
            p: 0,
            overflowX: "hidden",
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Должности"
          placeholder="Отдел или должность"
          sx={{
            "& .MuiInputBase-root": { minHeight: 40 },
            "& .MuiInputBase-input": { fontSize: 14 },
            "& .MuiInputLabel-root": { fontSize: 13 },
          }}
        />
      )}
      renderGroup={(params) => {
        if (params.group === "__ALL__") {
          return (
            <li
              key={params.key}
              style={{ display: "contents" }}
            >
              <Box
                component="ul"
                sx={{ p: 0 }}
              >
                {params.children}
              </Box>
            </li>
          );
        }

        const unit = positionsByUnit.get(params.group);
        const unitPositions = unit?.positions || [];
        const selectedCount = unitPositions.filter((position) =>
          selectedIds.has(optionId(position)),
        ).length;

        return (
          <li
            key={params.key}
            style={{ display: "contents" }}
          >
            <Box
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => toggleUnit(params.group)}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                px: 1,
                py: 0.5,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                cursor: "pointer",
              }}
            >
              <Checkbox
                size="small"
                checked={unitPositions.length > 0 && selectedCount === unitPositions.length}
                indeterminate={selectedCount > 0 && selectedCount < unitPositions.length}
              />
              <ListItemText
                primary={unit?.name || "Без отдела"}
                secondary={`${selectedCount} из ${unitPositions.length}`}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 800 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </Box>
            <Box
              component="ul"
              sx={{ p: 0 }}
            >
              {params.children}
            </Box>
          </li>
        );
      }}
      renderOption={(props, option, state) => {
        const { key, ...optionProps } = props;
        const isAll = option.id === ALL_OPTION.id;

        return (
          <li
            key={key}
            {...optionProps}
          >
            <Checkbox
              size="small"
              checked={isAll ? selected.length === 0 : state.selected}
            />
            <ListItemText primary={<Typography sx={{ fontSize: 14 }}>{option.name}</Typography>} />
          </li>
        );
      }}
      size="small"
    />
  );
}
