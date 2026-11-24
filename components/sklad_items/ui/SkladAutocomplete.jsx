"use client";

import { useState } from "react";
import { TextField } from "@mui/material";
import { JacoAutocomplete, uiColors, uiRadii, uiTypography } from "@/design-system/shared/ui";

export const skladAutocompleteInputSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    borderRadius: uiRadii.md,
    "& fieldset": { borderColor: uiColors.border },
    "&.Mui-focused fieldset": { borderColor: uiColors.primary, borderWidth: 1 },
  },
  "& .MuiInputBase-input": { ...uiTypography.body },
  "& .MuiInputLabel-root": {
    ...uiTypography.label,
    transform: "translate(16px, 13px) scale(1)",
    "&.MuiInputLabel-shrink": { transform: "translate(16px, -9px) scale(0.75)" },
  },
};

export default function SkladAutocomplete({
  multiple = false,
  autocompleteSx,
  slotProps,
  renderInput,
  ...props
}) {
  const [popupAbove, setPopupAbove] = useState(false);
  return (
    <JacoAutocomplete
      {...props}
      multiple={multiple}
      selectAppearance
      renderInput={
        renderInput ??
        (props.required
          ? (params) => (
              <TextField
                {...params}
                label={props.label}
                placeholder={props.placeholder}
                required
                size="small"
                sx={skladAutocompleteInputSx}
              />
            )
          : undefined)
      }
      autocompleteSx={{
        ...(multiple
          ? {
              "& .MuiOutlinedInput-root": { height: "auto", minHeight: 44, py: "4px !important" },
              "& .MuiAutocomplete-tag": { maxWidth: "calc(100% - 36px)" },
            }
          : {}),
        ...(popupAbove
          ? {
              "&.Mui-expanded .MuiOutlinedInput-root": {
                borderRadius: `0 0 ${uiRadii.md} ${uiRadii.md}`,
              },
            }
          : {}),
        ...autocompleteSx,
      }}
      slotProps={{
        ...slotProps,
        popper: {
          allowAdaptivePlacement: true,
          ...slotProps?.popper,
          modifiers: [
            ...(slotProps?.popper?.modifiers || []),
            {
              name: "skladConnectedPlacement",
              enabled: true,
              phase: "afterWrite",
              fn: ({ state }) => setPopupAbove(state.placement.startsWith("top")),
            },
          ],
        },
        paper: {
          ...slotProps?.paper,
          sx: {
            ...(popupAbove
              ? {
                  marginTop: 0,
                  marginBottom: "-1px",
                  borderTop: `1px solid ${uiColors.primary}`,
                  borderBottom: "none",
                  borderRadius: `${uiRadii.md} ${uiRadii.md} 0 0`,
                }
              : {}),
            ...slotProps?.paper?.sx,
          },
        },
      }}
    />
  );
}
