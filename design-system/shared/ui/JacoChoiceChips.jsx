import { ButtonBase, Stack } from "@mui/material";

import { uiColors, uiRadii, uiStateColors, uiTypography } from "../tokens";

/**
 * Single choice from a short list shown at once as pill buttons. `value` is the
 * selected option id; `allowDeselect` lets a second click clear the choice.
 */
export default function JacoChoiceChips({
  options = [],
  value,
  onChange,
  allowDeselect = false,
  disabled = false,
  ariaLabel,
  sx,
}) {
  const selectedId = value === null || value === undefined || value === "" ? null : String(value);
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      role="group"
      aria-label={ariaLabel}
      sx={{ flexWrap: "wrap", ...sx }}
    >
      {options.map((option) => {
        const id = String(option.id);
        const selected = selectedId === id;
        const optionDisabled = disabled || Boolean(option.disabled);
        return (
          <ButtonBase
            key={id}
            type="button"
            aria-pressed={selected}
            disabled={optionDisabled}
            onClick={() => onChange?.(selected && allowDeselect ? "" : id, option)}
            sx={{
              minHeight: 44,
              px: 1.75,
              borderRadius: uiRadii.full,
              border: `1px solid ${selected ? uiColors.primary : uiColors.border}`,
              backgroundColor: selected ? uiColors.primarySoft : uiColors.surface,
              color: selected ? uiColors.dangerHover : uiColors.textStrong,
              ...uiTypography.label,
              fontWeight: selected ? 500 : 400,
              textAlign: "left",
              "&:hover": {
                backgroundColor: selected ? uiColors.primarySoft : uiStateColors.hover,
              },
              "&.Mui-focusVisible": {
                outline: `2px solid ${uiColors.primary}`,
                outlineOffset: 2,
              },
              "&.Mui-disabled": {
                color: uiStateColors.disabledText,
                backgroundColor: uiStateColors.disabledSurface,
                borderColor: uiColors.border,
              },
            }}
          >
            {option.name ?? option.label ?? id}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
