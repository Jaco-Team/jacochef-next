import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Autocomplete, Popper, TextField, createFilterOptions } from "@mui/material";
import { forwardRef } from "react";

import { uiColors, uiRadii, uiShadows, uiStateColors, uiTypography } from "../tokens";

const filter = createFilterOptions();

const JacoAutocompletePopper = forwardRef(function JacoAutocompletePopper(props, ref) {
  const { anchorEl, style, modifiers, placement, allowAdaptivePlacement = false, ...other } = props;
  const resolvedModifiers = allowAdaptivePlacement
    ? modifiers
    : [
        ...(Array.isArray(modifiers)
          ? modifiers.filter(
              (modifier) => modifier?.name !== "flip" && modifier?.name !== "preventOverflow",
            )
          : []),
        { name: "flip", enabled: false },
        { name: "preventOverflow", options: { mainAxis: false, altAxis: false } },
      ];

  return (
    <Popper
      {...other}
      ref={ref}
      anchorEl={anchorEl}
      placement={placement ?? "bottom-start"}
      modifiers={resolvedModifiers}
      style={{
        ...style,
        width: anchorEl?.offsetWidth ?? style?.width ?? undefined,
      }}
    />
  );
});

function optionLabel(option) {
  if (typeof option === "string") {
    return option;
  }
  return option?.name ?? option?.label ?? "";
}

function normalizeOptions(options) {
  return Array.isArray(options) ? options : [];
}

export default function JacoAutocomplete({
  options,
  data,
  value,
  onChange,
  func,
  label,
  placeholder,
  freeSolo = false,
  multiple = false,
  disabled = false,
  unifiedPopup = true,
  autocompleteSx,
  sx,
  slots,
  slotProps,
  renderInput,
  filterOptions,
  isOptionEqualToValue,
  ...props
}) {
  const normalizedOptions = normalizeOptions(options ?? data);
  const controlSx = unifiedPopup
    ? {
        "& .MuiOutlinedInput-root": {
          minHeight: 44,
          borderRadius: uiRadii.lg,
          backgroundColor: disabled ? uiStateColors.disabledSurface : uiColors.surface,
          color: uiColors.text,
          "& fieldset": {
            borderColor: uiColors.border,
          },
          "&:hover fieldset": {
            borderColor: uiColors.border,
          },
          "&.Mui-focused fieldset": {
            borderColor: uiColors.primary,
            borderWidth: 1,
          },
        },
        "& .MuiInputBase-input": {
          ...uiTypography.body,
        },
        "& .MuiInputLabel-root": {
          ...uiTypography.label,
          color: uiColors.textMuted,
          "&.Mui-focused": {
            color: uiColors.primary,
          },
        },
      }
    : {};

  return (
    <Autocomplete
      {...props}
      freeSolo={freeSolo}
      multiple={multiple}
      disabled={disabled}
      disablePortal={props.disablePortal ?? false}
      options={normalizedOptions}
      value={value ?? (multiple ? [] : null)}
      onChange={onChange ?? func}
      getOptionLabel={props.getOptionLabel ?? optionLabel}
      isOptionEqualToValue={
        isOptionEqualToValue ??
        ((option, selectedValue) =>
          optionLabel(option) === optionLabel(selectedValue) || option?.id === selectedValue?.id)
      }
      filterOptions={
        filterOptions ??
        ((currentOptions, params) => {
          const filtered = filter(currentOptions, params);
          const { inputValue } = params;
          const isExisting = currentOptions.some((option) => inputValue === optionLabel(option));
          if (freeSolo && inputValue !== "" && !isExisting) {
            filtered.push(inputValue);
          }
          return filtered;
        })
      }
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      slots={{
        ...slots,
        popper: slots?.popper ?? JacoAutocompletePopper,
      }}
      slotProps={{
        ...slotProps,
        paper: {
          ...slotProps?.paper,
          sx: {
            border: `1px solid ${uiColors.border}`,
            borderRadius: uiRadii.lg,
            boxShadow: uiShadows.popover,
            overflow: "hidden",
            ...slotProps?.paper?.sx,
          },
        },
        listbox: {
          ...slotProps?.listbox,
          sx: {
            py: 0,
            "& .MuiAutocomplete-option": {
              minHeight: 44,
              px: 2,
              color: uiColors.text,
              ...uiTypography.body,
            },
            ...slotProps?.listbox?.sx,
          },
        },
      }}
      sx={autocompleteSx}
      renderInput={
        renderInput ??
        ((params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            size="small"
            sx={{
              ...controlSx,
              ...sx,
            }}
          />
        ))
      }
    />
  );
}
