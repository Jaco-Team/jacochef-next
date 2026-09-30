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
  selectAppearance = false,
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
          alignItems: "center",
          py: "0 !important",
          borderRadius: uiRadii.md,
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
        "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
          ...uiTypography.body,
          boxSizing: "border-box",
          height: 20,
          py: "0 !important",
          alignSelf: "center",
        },
        "& .MuiInputLabel-root": {
          ...uiTypography.label,
          color: uiColors.textMuted,
          transform: "translate(16px, 13px) scale(1)",
          "&.MuiInputLabel-shrink": {
            transform: "translate(16px, -9px) scale(0.75)",
          },
          "&.Mui-focused": {
            color: uiColors.primary,
          },
        },
      }
    : {};
  const selectAppearanceSx = selectAppearance
    ? {
        "& .MuiOutlinedInput-root": {
          height: 44,
          minHeight: 44,
          paddingLeft: "16px !important",
        },
        "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
          padding: "0 !important",
        },
        "& .MuiAutocomplete-endAdornment": {
          top: "50%",
          right: 12,
          transform: "translateY(-50%)",
        },
        "& .MuiAutocomplete-popupIndicator": {
          padding: 0,
          color: uiColors.textMuted,
        },
        "&.Mui-expanded .MuiOutlinedInput-root": {
          borderRadius: `${uiRadii.md} ${uiRadii.md} 0 0`,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: uiColors.primary,
            borderWidth: 1,
          },
        },
      }
    : null;

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
        ((option, selectedValue) => {
          const label = optionLabel(option);
          const selectedLabel = optionLabel(selectedValue);
          const optionId = option?.id;
          const selectedId = selectedValue?.id;

          return (
            (label !== "" && selectedLabel !== "" && label === selectedLabel) ||
            (optionId != null && selectedId != null && optionId === selectedId)
          );
        })
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
            marginTop: selectAppearance ? "-1px" : undefined,
            boxSizing: selectAppearance ? "border-box" : undefined,
            border: `1px solid ${selectAppearance ? uiColors.primary : uiColors.border}`,
            borderTop: selectAppearance ? "none" : undefined,
            borderRadius: selectAppearance ? `0 0 ${uiRadii.md} ${uiRadii.md}` : uiRadii.md,
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
              minHeight: selectAppearance ? "44px !important" : 44,
              px: selectAppearance ? "15px" : 2,
              py: selectAppearance ? 0 : undefined,
              color: selectAppearance ? uiColors.textStrong : uiColors.text,
              ...uiTypography.body,
              ...(selectAppearance
                ? {
                    '&[aria-selected="true"]': {
                      backgroundColor: uiColors.primarySoft,
                      "&.Mui-focused, &:hover": {
                        backgroundColor: uiColors.primarySoft,
                      },
                    },
                  }
                : {}),
            },
            ...slotProps?.listbox?.sx,
          },
        },
      }}
      sx={selectAppearance ? [selectAppearanceSx, autocompleteSx].filter(Boolean) : autocompleteSx}
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
