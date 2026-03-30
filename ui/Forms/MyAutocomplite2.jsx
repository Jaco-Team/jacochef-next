"use client";

import { forwardRef } from "react";
import { Autocomplete, createFilterOptions, Popper, Stack, TextField } from "@mui/material";

const filter = createFilterOptions();

const UnifiedAutocomplete2Popper = forwardRef(
  function UnifiedAutocomplete2Popper(popperProps, ref) {
    const {
      anchorEl,
      style,
      modifiers,
      placement,
      allowAdaptivePlacement = false,
      ...other
    } = popperProps;

    const resolvedModifiers = allowAdaptivePlacement
      ? [
          ...(Array.isArray(modifiers)
            ? modifiers.filter(
                (modifier) => modifier?.name !== "flip" && modifier?.name !== "preventOverflow",
              )
            : []),
          {
            name: "flip",
            enabled: true,
            options: {
              padding: 8,
              fallbackPlacements: ["top-start", "bottom-start"],
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              padding: 8,
              mainAxis: true,
              altAxis: true,
              tether: true,
            },
          },
        ]
      : [
          ...(Array.isArray(modifiers)
            ? modifiers.filter(
                (modifier) => modifier?.name !== "flip" && modifier?.name !== "preventOverflow",
              )
            : []),
          { name: "flip", enabled: false },
          {
            name: "preventOverflow",
            options: {
              mainAxis: false,
              altAxis: false,
            },
          },
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
  },
);

export function MyAutocomplite2(props) {
  const isUnifiedPopup = Boolean(props.unifiedPopup);
  const unifiedRadius = "18px";
  const unifiedFieldMinHeight = 44;
  const unifiedInputHorizontalPadding = 16;

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
          minHeight: unifiedFieldMinHeight,
          borderRadius: unifiedRadius,
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
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
          },
          "&.Mui-disabled": {
            backgroundColor: "#F5F5F5",
            borderColor: "rgba(0, 0, 0, 0.12)",
            boxShadow: "none",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            display: "none",
          },
        },
        "& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root": {
          minHeight: unifiedFieldMinHeight,
          alignItems: "center",
          paddingTop: "0 !important",
          paddingBottom: "0 !important",
          paddingLeft: `${unifiedInputHorizontalPadding}px !important`,
          paddingRight: "44px !important",
        },
        "& .MuiAutocomplete-input": {
          minHeight: "0 !important",
          boxSizing: "content-box",
          paddingTop: "0 !important",
          paddingBottom: "0 !important",
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
          margin: "0 !important",
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
        "& .MuiAutocomplete-popupIndicator .MuiSvgIcon-root, & .MuiAutocomplete-clearIndicator .MuiSvgIcon-root":
          {
            color: "#94a3b8",
          },
      }
    : {};

  const unifiedPopperSx = isUnifiedPopup
    ? {
        marginTop: "-1px !important",
        zIndex: 1400,
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
        borderBottomLeftRadius: unifiedRadius,
        borderBottomRightRadius: unifiedRadius,
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
          backgroundColor: "rgba(148, 163, 184, 0.14)",
        },
        '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          backgroundColor: "rgba(148, 163, 184, 0.2)",
        },
      }
    : {};

  const mergedSlots = {
    ...(props.slots || {}),
    ...(isUnifiedPopup ? { popper: UnifiedAutocomplete2Popper } : {}),
  };

  const mergedSlotProps = {
    ...(props.slotProps || {}),
    popper: {
      ...(props.slotProps?.popper || {}),
      sx: {
        ...(unifiedPopperSx || {}),
        ...(props.slotProps?.popper?.sx || {}),
      },
    },
    paper: {
      ...(props.slotProps?.paper || {}),
      sx: {
        ...(unifiedPaperSx || {}),
        ...(props.slotProps?.paper?.sx || {}),
      },
    },
    listbox: {
      ...(props.slotProps?.listbox || {}),
      sx: {
        ...(unifiedListboxSx || {}),
        ...(props.slotProps?.listbox?.sx || {}),
      },
    },
  };

  if (props.id && props.id == "promoName") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          disablePortal={props.disablePortal ?? false}
          disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data ?? []}
          getOptionLabel={(option) => option.name}
          value={props.value}
          onChange={props.func}
          //filterSelectedOptions
          disabled={props.disabled && props.disabled === true ? true : false}
          multiple={props.multiple && props.multiple === true ? true : false}
          slots={mergedSlots}
          slotProps={mergedSlotProps}
          sx={{
            ...(unifiedAutocompleteSx || {}),
            ...(props.autocompleteSx || {}),
          }}
          //isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
              sx={{
                ...(unifiedTextFieldSx || {}),
                ...(props.sx || {}),
              }}
            />
          )}
        />
      </Stack>
    );
  }

  // для Управление точкой управляющего
  if (props.id && props.id == "cafe_upr_edit") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          disablePortal={props.disablePortal ?? false}
          //disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data.map((option) => option.name)}
          value={props.value}
          onChange={props.func}
          filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          disabled={props.disabled && props.disabled === true ? true : false}
          slots={mergedSlots}
          slotProps={mergedSlotProps}
          sx={{
            ...(unifiedAutocompleteSx || {}),
            ...(props.autocompleteSx || {}),
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
              sx={{
                ...(unifiedTextFieldSx || {}),
                ...(props.sx || {}),
              }}
            />
          )}
        />
      </Stack>
    );
  }

  //isOptionEqualToValue

  if (props.name && props.name == "only_choose") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          disablePortal={props.disablePortal ?? false}
          //disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data.map((option) => option.name)}
          value={props.value}
          onChange={props.func}
          //filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            //console.log( 'params', params )
            //console.log( 'filtered', filtered )

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option.name);
            /*if (inputValue !== '' && !isExisting) {
                filtered.push(
                  inputValue
                );
              }*/

            //console.log( 'new filtered', filtered )

            return filtered;
          }}
          disabled={props.disabled && props.disabled === true ? true : false}
          slots={mergedSlots}
          slotProps={mergedSlotProps}
          sx={{
            ...(unifiedAutocompleteSx || {}),
            ...(props.autocompleteSx || {}),
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
              sx={{
                ...(unifiedTextFieldSx || {}),
                ...(props.sx || {}),
              }}
            />
          )}
        />
      </Stack>
    );
  }
  return (
    <Stack spacing={3}>
      <Autocomplete
        freeSolo={props.freeSolo ? props.freeSolo : false}
        size="small"
        disablePortal={props.disablePortal ?? false}
        //disableCloseOnSelect={true}
        onBlur={props.onBlur ? props.onBlur : null}
        id={props.id ?? null}
        options={props.data.map((option) => option.name)}
        value={props.value}
        onChange={props.func}
        //filterSelectedOptions
        multiple={props.multiple && props.multiple === true ? true : false}
        //isOptionEqualToValue={(option, value) => option.id === value.id}

        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          //console.log( 'params', params )
          //console.log( 'filtered', filtered )

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.name);
          if (inputValue !== "" && !isExisting) {
            filtered.push(inputValue);
          }

          //console.log( 'new filtered', filtered )

          return filtered;
        }}
        disabled={props.disabled && props.disabled === true ? true : false}
        slots={mergedSlots}
        slotProps={mergedSlotProps}
        sx={{
          ...(unifiedAutocompleteSx || {}),
          ...(props.autocompleteSx || {}),
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={props.label}
            placeholder={props.placeholder}
            sx={{
              ...(unifiedTextFieldSx || {}),
              ...(props.sx || {}),
            }}
          />
        )}
      />
    </Stack>
  );
}
