"use client";

import { FormControl, InputLabel, MenuItem, NoSsr, Select } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export function MySelect(props) {
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
      "& .MuiOutlinedInput-notchedOutline": {
        display: "none",
      },
    },
  };
  const isJournalStyle = props.customRI === "journal";
  return (
    <NoSsr>
      <FormControl
        fullWidth
        variant="outlined"
        size="small"
        style={props.style}
        sx={isJournalStyle ? customStylesRenderInput.journal : {}}
      >
        <InputLabel>{props.label}</InputLabel>
        <Select
          value={normalizedValue}
          IconComponent={isJournalStyle ? KeyboardArrowDownIcon : undefined}
          // Для кнопки очистки (только если Select не multiple и не disabled)
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
          multiple={!!props.multiple}
          renderValue={renderValue}
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
