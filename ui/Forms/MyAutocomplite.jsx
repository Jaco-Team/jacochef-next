"use client";

import { forwardRef } from "react";
import { Autocomplete, NoSsr, Popper, Stack, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const UnifiedAutocompletePopper = forwardRef(function UnifiedAutocompletePopper(popperProps, ref) {
  const { anchorEl, style, ...other } = popperProps;

  return (
    <Popper
      {...other}
      ref={ref}
      anchorEl={anchorEl}
      style={{
        ...style,
        width: anchorEl?.offsetWidth ?? style?.width ?? undefined,
      }}
    />
  );
});

export function MyAutocomplite(props) {
  const isUnifiedPopup = Boolean(props.unifiedPopup);
  const customStylesRenderInput = {
    journal: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        border: "1px solid #E5E5E5",
        color: "#666666",
        backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
        "&:hover": {
          backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E5E5",
          },
        },
        "&.Mui-focused": {
          color: "#666666",
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E5E5",
            borderWidth: "2px",
          },
        },
        "&.Mui-disabled": {
          backgroundColor: "#F5F5F5",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
      "& .MuiInputLabel-root": {
        color: "#666666",
        backgroundColor: "#fff",
        paddingInline: "12px",
        borderRadius: "12px",
        "&.Mui-focused": {
          color: "#A6A6A6",
        },
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
        },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        display: "none",
      },
    },
  };

  const unifiedAutocompleteSx = isUnifiedPopup
    ? {
        "&.Mui-expanded .MuiOutlinedInput-root": {
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
        },
      }
    : {};

  const unifiedTextFieldSx = isUnifiedPopup
    ? {
        "& .MuiOutlinedInput-root": {
          borderRadius: "18px",
          border: "1px solid #E5E5E5",
          color: "#3C3B3B",
          backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
          transition: "border-radius 0.16s ease",
          "&:hover": {
            backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
            borderColor: "#E5E5E5",
          },
          "&.Mui-focused": {
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E5E5",
          },
          "&.Mui-disabled": {
            backgroundColor: "#F5F5F5",
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            display: "none",
          },
        },
        "& .MuiInputLabel-root": {
          color: "#666666",
          backgroundColor: "#fff",
          paddingInline: "8px",
          borderRadius: "12px",
          "&.Mui-focused": {
            color: "#A6A6A6",
          },
          "&.Mui-disabled": {
            color: "rgba(0, 0, 0, 0.38)",
          },
        },
      }
    : {};

  const unifiedPopperSx = isUnifiedPopup
    ? {
        marginTop: "-1px !important",
        [`& .MuiAutocomplete-paper`]: {
          margin: 0,
        },
      }
    : {};

  const unifiedPaperSx = isUnifiedPopup
    ? {
        marginTop: 0,
        border: "1px solid #E5E5E5",
        borderTop: "none",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: "18px",
        borderBottomRightRadius: "18px",
        boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }
    : {};

  const unifiedListboxSx = isUnifiedPopup
    ? {
        padding: 0,
        maxHeight: 320,
        "& .MuiAutocomplete-option": {
          minHeight: 52,
          padding: "12px 20px",
          fontSize: 16,
          lineHeight: "24px",
          color: "#3C3B3B",
          borderTop: "1px solid #F3F3F3",
        },
        "& .MuiAutocomplete-option:first-of-type": {
          borderTop: "none",
        },
        "& .MuiAutocomplete-option.Mui-focused": {
          backgroundColor: "#F8F8F8",
        },
        '& .MuiAutocomplete-option[aria-selected="true"]': {
          backgroundColor: "#FFF7F8",
        },
        '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          backgroundColor: "#FFF1F3",
        },
      }
    : {};

  const mergedSlotProps = {
    ...props.slotProps,
    popper: {
      ...props.slotProps?.popper,
      sx: {
        ...(unifiedPopperSx || {}),
        ...(props.slotProps?.popper?.sx || {}),
      },
    },
    paper: {
      ...props.slotProps?.paper,
      sx: {
        ...(unifiedPaperSx || {}),
        ...(props.slotProps?.paper?.sx || {}),
      },
    },
    listbox: {
      ...props.slotProps?.listbox,
      sx: {
        ...(unifiedListboxSx || {}),
        ...(props.slotProps?.listbox?.sx || {}),
      },
    },
  };

  const mergedSlots = {
    ...props.slots,
    ...(isUnifiedPopup ? { popper: UnifiedAutocompletePopper } : {}),
  };

  const autocompleteContent = (
    <Stack spacing={3}>
      <Autocomplete
        size="small"
        clearIcon={
          props.customRI === "journal" ? (
            <CloseIcon
              fontSize="small"
              style={{ color: "#BABABA" }}
            />
          ) : undefined
        }
        popupIcon={
          props.customRI === "journal" ? (
            <KeyboardArrowDownIcon style={{ color: "#BABABA" }} />
          ) : undefined
        }
        disableCloseOnSelect={
          props.disableCloseOnSelect ?? (props.multiple === false ? false : true)
        }
        style={props.style}
        // freeSolo
        // multiple={true}
        disabled={props.disabled || props.disabled === true ? true : false}
        id={props.id ?? null}
        options={props.data ?? []}
        getOptionLabel={(option) => option?.name || ""}
        disableClearable={props.disableClearable}
        getOptionKey={props.getOptionKey}
        value={props.value ?? (props.multiple ? [] : null)}
        onChange={props.func}
        onFocus={props.onFocus}
        autoFocus={props.autoFocus}
        disabledItemsFocusable={props.disabledItemsFocusable}
        //disableAutoFocus={props.disableAutoFocus}
        blurOnSelect={props.blurOnSelect}
        ListboxProps={props.ListboxProps || undefined}
        onBlur={props.onBlur || undefined}
        filterSelectedOptions={props.filterSelectedOptions ?? true}
        multiple={props.multiple && props.multiple === true ? true : false}
        slots={mergedSlots}
        slotProps={mergedSlotProps}
        sx={{
          ...(unifiedAutocompleteSx || {}),
          ...(props.autocompleteSx || {}),
        }}
        isOptionEqualToValue={
          props.isOptionEqualToValue ||
          ((option, value) => parseInt(option?.id) === parseInt(value?.id))
        }
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.name}
              size="small"
              sx={{
                color: props.disabled ? "rgba(0, 0, 0, 0.38)" : undefined,
                "&.Mui-disabled": {
                  backgroundColor: props.disabled ? "rgba(0, 0, 0, 0.08) !important" : undefined,
                },
                "& .MuiChip-deleteIcon": {
                  color: props.disabled ? "rgba(0, 0, 0, 0.26)" : undefined,
                },
              }}
            />
          ))
        }
        renderInput={
          props.renderInput ||
          ((params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
              sx={{
                ...(unifiedTextFieldSx || {}),
                ...(props.customRI ? customStylesRenderInput[props.customRI] : {}),
                ...(props.sx || {}),
              }}
            />
          ))
        }
        renderOption={
          props.renderOption
            ? props.renderOption
            : (params, option) => (
                <li
                  {...params}
                  key={props.optionKey ? option[`${props.optionKey}`] : option.id}
                >
                  {option.name}
                </li>
              )
        }
      />
    </Stack>
  );

  if (props.disableNoSsr) {
    return autocompleteContent;
  }

  return <NoSsr>{autocompleteContent}</NoSsr>;
}
