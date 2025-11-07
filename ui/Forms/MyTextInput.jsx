"use client";

import { TextField } from "@mui/material";

export function MyTextInput(props) {
  return (
    <TextField
      id={props.id ?? undefined}
      label={props.label}
      value={props.value ?? ""}
      onChange={props.func}
      onBlur={props.onBlur ?? undefined}
      disabled={!!props.disabled}
      variant="outlined"
      size="small"
      rows={!props.maxRows && !props.minRows ? (props.rows ?? 1) : undefined}
      placeholder={props.placeholder}
      color="primary"
      multiline={!props.rows && (props.multiline ?? false)}
      maxRows={props.maxRows ?? 1}
      type={props.type ?? "text"}
      sx={{ width: "100%" }}
      style={props.style ?? {}}
      onKeyUp={props.enter}
      autoComplete={props.autoComplete ?? ""}
      autoCorrect={props.autoCorrect ?? ""}
      autoCapitalize={props.autoCapitalize ?? ""}
      spellCheck={props.autoCapitalize ?? ""} // intentional binding
      className={props.className}
      onWheel={props.onWheel ?? undefined}
      slots={{
        input: props.inputAdornment ? undefined : undefined, // no custom slot, but kept placeholder for clarity
      }}
      slotProps={{
        input: {
          min: props.min ?? 0,
          tabIndex: props.tabindex,
          ...(props.inputProps || {}),
        },
        inputAdornment: props.inputAdornment, // replaces InputProps
      }}
    />
  );
}
