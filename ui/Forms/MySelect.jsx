"use client";

import { forwardRef, useState } from "react";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  NoSsr,
  Popper,
  Select,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const UnifiedSelectPopper = forwardRef(function UnifiedSelectPopper(popperProps, ref) {
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
});

export function MySelect(props) {
  const [isOpen, setIsOpen] = useState(false);
  const unifiedRadius = "18px";
  const unifiedFieldMinHeight = 44;
  const unifiedInputHorizontalPadding = 16;

  // normalize API ids to strings
  const normalizedData = (props.data || []).map((item) => ({
    ...item,
    id: String(item.id),
  }));

  // add None option at the top if needed
  // TODO: this behavior is counterintuitive, swap
  if (props.is_none !== false) {
    normalizedData.unshift({ id: "none", name: "None" });
  }

  // normalize value
  const normalizedValue = props.multiple
    ? Array.isArray(props.value)
      ? props.value.map(String)
      : []
    : props.value != null
      ? String(props.value)
      : "";

  // force display of selected name
  const renderValue = (selected) => {
    if (props.multiple) {
      if (!selected || selected.length === 0) return "None";
      return normalizedData
        .filter((item) => selected.includes(item.id))
        .map((item) => item.name)
        .join(", ");
    } else {
      const sel = normalizedData.find((i) => i.id === normalizedValue);
      return sel ? sel.name : "None";
    }
  };

  const customStylesRenderInput = {
    journal: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        border: "1px solid #E5E5E5",
        color: "#BABABA",
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
      "& .MuiOutlinedInput-input": {
        borderRadius: "12px !important",
      },
      "& .MuiInputLabel-root": {
        color: "#666666",
        backgroundColor: "#fff",
        paddingInline: "12px",
        borderRadius: "12px !important",
        "&.Mui-focused": {
          color: "#A6A6A6",
        },
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
        },
      },
      "& .MuiSelect-select": {
        color: "#666666",
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
          WebkitTextFillColor: "rgba(0, 0, 0, 0.38)",
        },
      },
      "& .MuiSelect-icon": {
        color: "#7A7A7A",
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
        },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        display: "none",
      },
    },
  };

  const isJournalStyle = props.customRI === "journal";
  const isUnifiedPopup = Boolean(props.unifiedPopup);

  const unifiedAutocompleteSx = isUnifiedPopup
    ? {
        "&.Mui-expanded .MuiOutlinedInput-root": {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
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
          cursor: "pointer",
          backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
          transition: "border-radius 0.16s ease",
          ...(isOpen
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : {}),
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
          ...(isOpen
            ? {
                borderBottomLeftRadius: "0 !important",
                borderBottomRightRadius: "0 !important",
              }
            : {}),
        },
        "& .MuiAutocomplete-input": {
          minHeight: "0 !important",
          boxSizing: "content-box",
          paddingTop: "0 !important",
          paddingBottom: "0 !important",
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
          margin: "0 !important",
          userSelect: "none",
          caretColor: "transparent",
          cursor: "pointer",
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

  const unifiedControlSx = isUnifiedPopup
    ? {
        "& .MuiOutlinedInput-root": {
          transition: "border-radius 0.16s ease",
          ...(isOpen
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : {}),
        },
      }
    : {};

  const unifiedPopperSx = isUnifiedPopup
    ? {
        marginTop: "-1px !important",
        zIndex: 1400,
        "& .MuiAutocomplete-paper": {
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
        width: "100%",
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

  const unifiedSlots = {
    ...(props.slots || {}),
    ...(props.slots?.popper ? {} : { popper: UnifiedSelectPopper }),
  };

  const unifiedSlotProps = {
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

  const unifiedValue = props.multiple
    ? normalizedData.filter((item) => normalizedValue.includes(item.id))
    : (normalizedData.find((item) => item.id === normalizedValue) ?? null);

  if (isUnifiedPopup) {
    return (
      <NoSsr>
        <Autocomplete
          size="small"
          style={props.style}
          disablePortal={props.disablePortal ?? false}
          selectOnFocus={false}
          options={normalizedData}
          value={unifiedValue}
          disabled={!!props.disabled}
          multiple={!!props.multiple}
          disableClearable={true}
          disableCloseOnSelect={props.disableCloseOnSelect ?? !!props.multiple}
          filterSelectedOptions={props.filterSelectedOptions ?? false}
          popupIcon={<KeyboardArrowDownIcon style={{ color: "#94a3b8" }} />}
          slots={unifiedSlots}
          slotProps={unifiedSlotProps}
          sx={{
            ...(unifiedAutocompleteSx || {}),
            ...(props.autocompleteSx || {}),
          }}
          getOptionLabel={(option) => option?.name ?? ""}
          isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onOpen={(event) => {
            setIsOpen(true);
            props.onOpen?.(event);
          }}
          onClose={(event) => {
            setIsOpen(false);
            props.onClose?.(event);
          }}
          onChange={(event, value) => {
            const nextValue = props.multiple
              ? Array.isArray(value)
                ? value.map((item) => item?.id).filter(Boolean)
                : []
              : (value?.id ?? (props.is_none !== false ? "none" : ""));

            props.func?.({ target: { value: nextValue } }, value);
          }}
          renderOption={(optionProps, option) => (
            <li
              {...optionProps}
              key={option.id}
              style={{
                ...optionProps.style,
                color: option?.color || optionProps.style?.color,
              }}
            >
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
              sx={{
                ...(unifiedTextFieldSx || {}),
                ...(props.sx || {}),
              }}
              inputProps={{
                ...params.inputProps,
                readOnly: true,
              }}
            />
          )}
        />
      </NoSsr>
    );
  }

  return (
    <NoSsr>
      <FormControl
        fullWidth
        variant="outlined"
        size="small"
        disabled={!!props.disabled}
        style={props.style}
        // sx={{
        //   ...(isJournalStyle ? customStylesRenderInput.journal : {}),
        //   ...(unifiedControlSx || {}),
        //   ...(props.sx || {}),
        // }}
        sx={[isJournalStyle && customStylesRenderInput.journal, unifiedControlSx, props.sx]}
      >
        <InputLabel disabled={!!props.disabled}>{props.label}</InputLabel>
        <Select
          value={normalizedValue}
          IconComponent={isJournalStyle ? KeyboardArrowDownIcon : undefined}
          {...(isJournalStyle &&
          !props.multiple &&
          !props.disabled &&
          normalizedValue &&
          normalizedValue !== "none"
            ? {
                clearIcon: (
                  <CloseIcon
                    fontSize="small"
                    style={{ color: "#BABABA" }}
                  />
                ),
              }
            : {})}
          label={props.label}
          disabled={!!props.disabled}
          onChange={props.func}
          onOpen={(event) => {
            setIsOpen(true);
            props.onOpen?.(event);
          }}
          onClose={(event) => {
            setIsOpen(false);
            props.onClose?.(event);
          }}
          multiple={!!props.multiple}
          renderValue={renderValue}
          MenuProps={{
            ...(props.MenuProps || {}),
          }}
        >
          {normalizedData?.map((item, key) => (
            <MenuItem
              key={key}
              value={item.id}
              sx={{ color: item?.color ? item.color : null }}
            >
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </NoSsr>
  );
}
