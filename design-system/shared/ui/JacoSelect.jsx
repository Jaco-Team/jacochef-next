import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useId } from "react";

import { uiColors, uiRadii, uiShadows, uiStateColors, uiTypography } from "../tokens";

function normalizeOptions(options) {
  return Array.isArray(options)
    ? options.map((option) => ({
        ...option,
        id: String(option?.id ?? ""),
        name: option?.name ?? option?.label ?? String(option?.id ?? ""),
      }))
    : [];
}

export default function JacoSelect({
  options,
  data,
  value,
  onChange,
  func,
  allowNone,
  is_none,
  label,
  multiple = false,
  disabled = false,
  sx,
  menuSx,
  customRI,
  unifiedPopup,
  id: providedId,
  inputProps: providedInputProps,
  ...props
}) {
  const generatedId = useId().replace(/:/g, "");
  const selectId = providedId || `jaco-select-${generatedId}`;
  const nativeInputId = `${selectId}-input`;
  const labelId = label ? `${selectId}-label` : undefined;
  const normalizedOptions = normalizeOptions(options ?? data);
  const withNone = (allowNone ?? is_none) !== false;
  const items = withNone ? [{ id: "none", name: "None" }, ...normalizedOptions] : normalizedOptions;
  const normalizedValue = multiple
    ? Array.isArray(value)
      ? value.map(String)
      : []
    : value != null && value !== ""
      ? String(value)
      : withNone
        ? "none"
        : "";

  const renderValue = (selected) => {
    if (multiple) {
      if (!Array.isArray(selected) || selected.length === 0) {
        return "None";
      }
      return items
        .filter((item) => selected.includes(item.id))
        .map((item) => item.name)
        .join(", ");
    }

    return items.find((item) => item.id === selected)?.name ?? "None";
  };

  return (
    <FormControl
      fullWidth
      size="small"
      disabled={disabled}
      sx={sx}
    >
      {label ? (
        <InputLabel
          id={labelId}
          htmlFor={nativeInputId}
        >
          {label}
        </InputLabel>
      ) : null}
      <Select
        {...props}
        id={selectId}
        labelId={labelId}
        inputProps={{ ...providedInputProps, id: nativeInputId }}
        multiple={multiple}
        value={normalizedValue}
        label={label}
        onChange={onChange ?? func}
        renderValue={renderValue}
        IconComponent={KeyboardArrowDownRoundedIcon}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                mt: "-1px",
                border: `1px solid ${uiColors.border}`,
                borderRadius: `0 0 ${uiRadii.lg} ${uiRadii.lg}`,
                boxShadow: uiShadows.popover,
                overflow: "hidden",
                ...menuSx,
              },
            },
          },
        }}
        sx={{
          minHeight: 44,
          borderRadius: customRI === "journal" ? uiRadii.md : uiRadii.lg,
          color: uiColors.text,
          backgroundColor: disabled ? uiStateColors.disabledSurface : uiColors.surface,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: uiColors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: uiColors.border,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: uiColors.primary,
            borderWidth: 1,
          },
          "& .MuiSelect-select": {
            py: 1.25,
            ...uiTypography.body,
          },
          "& .MuiInputLabel-root": {
            ...uiTypography.label,
            color: uiColors.textMuted,
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
