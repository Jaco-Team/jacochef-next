import { useId } from "react";
import { Box, FormControlLabel, Radio, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { uiColors, uiRadii, uiStateColors } from "../tokens";

export default function JacoRadioCard({
  value,
  label,
  description,
  icon,
  checked,
  disabled = false,
  accentColor = uiColors.primary,
  sx,
}) {
  const descriptionId = useId();

  return (
    <FormControlLabel
      value={value}
      disabled={disabled}
      control={
        <Radio
          checked={checked}
          size="small"
          slotProps={{ input: { "aria-label": label, "aria-describedby": description ? descriptionId : undefined } }}
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            p: 0,
            overflow: "hidden",
            clipPath: "inset(50%)",
            whiteSpace: "nowrap",
          }}
        />
      }
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: uiRadii.sm,
              color: checked ? accentColor : uiColors.text,
              bgcolor: checked ? alpha(accentColor, 0.08) : uiColors.surfaceMuted,
              "& svg": { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="span" sx={{ display: "block", fontSize: 14, lineHeight: 1.4, fontWeight: 600, color: uiColors.textStrong }}>
              {label}
            </Typography>
            {description ? (
              <Typography component="span" id={descriptionId} sx={{ display: "block", mt: 0.25, fontSize: 12, lineHeight: 1.4, color: uiColors.text }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>
      }
      sx={{
        m: 0,
        position: "relative",
        px: 1.5,
        py: 1.25,
        minHeight: 76,
        boxSizing: "border-box",
        border: "1px solid",
        borderColor: checked ? accentColor : uiColors.border,
        borderRadius: uiRadii.md,
        bgcolor: checked ? alpha(accentColor, 0.03) : uiColors.surface,
        transition: "border-color 150ms, background-color 150ms, box-shadow 150ms",
        "& .MuiFormControlLabel-label": { flex: 1, minWidth: 0 },
        "&:hover": disabled ? {} : { borderColor: accentColor, bgcolor: alpha(accentColor, 0.04) },
        "&:has(input:focus-visible)": { outline: `2px solid ${accentColor}`, outlineOffset: 3 },
        "&.Mui-disabled": { cursor: "not-allowed", opacity: 0.55, bgcolor: uiStateColors.disabledSurface },
        ...sx,
      }}
    />
  );
}
