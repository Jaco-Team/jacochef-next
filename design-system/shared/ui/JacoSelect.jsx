import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useId, useState } from "react";

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
  unifiedPopup = true,
  id: providedId,
  inputProps: providedInputProps,
  open: controlledOpen,
  defaultOpen = false,
  onOpen,
  onClose,
  MenuProps: providedMenuProps,
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
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
  const isOpen = controlledOpen ?? internalOpen;
  const controlRadius = uiRadii.md;

  const handleOpen = (event) => {
    setInternalOpen(true);
    onOpen?.(event);
  };

  const handleClose = (event) => {
    setInternalOpen(false);
    onClose?.(event);
  };

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

    return items.find((item) => item.id === selected)?.name ?? (withNone ? "None" : "");
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
          sx={{
            ...uiTypography.label,
            color: uiColors.textMuted,
            transform: "translate(16px, 13px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(16px, -9px) scale(0.75)",
            },
            "&.Mui-focused": {
              color: uiColors.primary,
            },
          }}
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
        open={controlledOpen}
        defaultOpen={defaultOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        renderValue={renderValue}
        IconComponent={KeyboardArrowDownRoundedIcon}
        MenuProps={{
          ...providedMenuProps,
          anchorOrigin: providedMenuProps?.anchorOrigin ?? {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: providedMenuProps?.transformOrigin ?? {
            vertical: "top",
            horizontal: "left",
          },
          slotProps: {
            ...providedMenuProps?.slotProps,
            paper: {
              ...providedMenuProps?.slotProps?.paper,
              sx: {
                mt: "-1px",
                boxSizing: "border-box",
                border: `1px solid ${unifiedPopup ? uiColors.primary : uiColors.border}`,
                borderTop: unifiedPopup ? "none" : undefined,
                borderRadius: unifiedPopup
                  ? `0 0 ${controlRadius} ${controlRadius}`
                  : controlRadius,
                boxShadow: uiShadows.popover,
                overflow: "hidden",
                ...providedMenuProps?.slotProps?.paper?.sx,
                ...menuSx,
              },
            },
          },
          MenuListProps: {
            ...providedMenuProps?.MenuListProps,
            sx: {
              py: 0,
              ...providedMenuProps?.MenuListProps?.sx,
            },
          },
        }}
        sx={{
          height: 44,
          borderRadius:
            unifiedPopup && isOpen ? `${controlRadius} ${controlRadius} 0 0` : controlRadius,
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
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            height: "100% !important",
            minHeight: "0 !important",
            py: "0 !important",
            pl: "16px !important",
            pr: "40px !important",
            ...uiTypography.body,
          },
          "& .MuiSelect-icon": {
            top: "50%",
            right: 12,
            transform: "translateY(-50%)",
            color: uiColors.textMuted,
          },
          "& .MuiSelect-iconOpen": {
            transform: "translateY(-50%) rotate(180deg)",
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            sx={{
              minHeight: "44px !important",
              px: "15px",
              py: 0,
              ...uiTypography.body,
              color: uiColors.textStrong,
              "&.Mui-selected": {
                backgroundColor: uiColors.primarySoft,
              },
              "&.Mui-selected:hover": {
                backgroundColor: uiColors.primarySoft,
              },
            }}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
