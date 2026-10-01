import { FormControlLabel } from "@mui/material";

import JacoCheckbox from "./JacoCheckbox";
import { uiColors, uiTypography } from "../tokens";

export default function JacoCheckboxField({
  checked,
  value,
  onChange,
  func,
  label,
  disabled = false,
  sx,
  checkboxSx,
  ...props
}) {
  return (
    <FormControlLabel
      control={
        <JacoCheckbox
          checked={Boolean(checked ?? value)}
          onChange={onChange ?? func}
          disabled={disabled}
          sx={checkboxSx}
        />
      }
      label={label}
      disabled={disabled}
      sx={{
        m: 0,
        gap: 1,
        color: uiColors.textStrong,
        "& .MuiFormControlLabel-label": uiTypography.body,
        ...sx,
      }}
      {...props}
    />
  );
}
