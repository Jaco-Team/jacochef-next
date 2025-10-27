"use client";

import { useEffect, useMemo } from "react";
import { Autocomplete, NoSsr, TextField } from "@mui/material";

export function MyAutoCompleteWithAll({
  options = [], // default format: [{ id, name }]
  value = [], // controlled array of selected options
  onChange,
  label,
  placeholder,
  keepOrder = false, // will keep the order as in options
  withAll = false,
  withAllSelected = false, // preselect "All" on mount/options arrival
  withAllLabel = "Все",
  ...rest
}) {
  const ALL_OPTION = { id: "__ALL__", name: withAllLabel };

  // include All option in dropdown
  const fullOptions = useMemo(
    () => (withAll ? [ALL_OPTION, ...options] : options),
    [withAll, withAllLabel, options]
  );

  // whether all real options are selected
  const allSelected = withAll && options.length > 0 && value.length === options.length;

  // UI value — show [ALL_OPTION] chip if full set is selected
  const valueForUI = withAll && allSelected ? [ALL_OPTION] : value;

  // on mount / options change → preselect All
  useEffect(() => {
    if (!withAll || !withAllSelected) return;
    if (options.length === 0) return;
    if (value.length === 0) {
      // parent always receives full set, not [ALL_OPTION]
      onChange?.(options);
    }
    // no deps on onChange/value → avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withAll, withAllSelected, options.length]);

  const handleChange = (_, selected) => {
    const selectedSorted = keepOrder
      ? [...selected].sort(
          (a, b) =>
            options.findIndex((o) => o.id === a.id) - options.findIndex((o) => o.id === b.id)
        )
      : selected;
    if (!withAll) {
      onChange?.(selectedSorted);
      return;
    }

    const hasAll = selectedSorted.some((o) => o.id === ALL_OPTION.id);
    const hasOthers = selectedSorted.some((o) => o.id !== ALL_OPTION.id);
    const wasAll = value.length === options.length; // parent stores full set when All is active

    if (hasAll && !hasOthers) {
      // Only All → expand to full
      onChange?.(options);
      return;
    }

    if (wasAll && hasOthers) {
      // All was active, now user clicked another → replace All with just those clicked
      const newSelection = selectedSorted.filter((o) => o.id !== ALL_OPTION.id);
      onChange?.(newSelection);
      return;
    }

    if (hasAll && hasOthers) {
      // User explicitly toggled All along with others → collapse back to All
      onChange?.(options);
      return;
    }

    // Normal case
    onChange?.(selectedSorted.filter((o) => o.id !== ALL_OPTION.id));
  };

  // filter out already selected
  const filterOptions = (opts, { inputValue }) => {
    const selectedIds = new Set(valueForUI.map((o) => o.id));
    return opts.filter(
      (o) =>
        !selectedIds.has(o.id) &&
        (inputValue === "" || o.name.toLowerCase().includes(inputValue.toLowerCase()))
    );
  };

  return (
    <NoSsr>
      <Autocomplete
        multiple
        disableCloseOnSelect
        size="small"
        options={fullOptions}
        value={valueForUI}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionLabel={(o) => o?.name ?? "n/a"}
        filterOptions={filterOptions}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <li
              key={option.id}
              {...restProps}
            >
              {option.name}
            </li>
          );
        }}
        {...rest}
      />
    </NoSsr>
  );
}
