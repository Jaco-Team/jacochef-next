import { Tab, Tabs } from "@mui/material";
import { uiColors, uiControl, uiRadii, uiTypography } from "../tokens";

export default function JacoSegmentedTabs({ items, value, onChange, sx, tabSx, ...props }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      sx={{
        minHeight: 58,
        p: `${uiControl.segmentPadding}px`,
        borderRadius: uiRadii.md,
        backgroundColor: uiColors.surfaceMuted,
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTab-root": {
          minHeight: 40,
          textTransform: "none",
          borderRadius: uiRadii.sm,
          color: uiColors.text,
          fontSize: uiTypography.bodyLarge.fontSize,
          lineHeight: uiTypography.bodyLarge.lineHeight,
          fontWeight: uiTypography.bodyLarge.fontWeight,
          backgroundColor: "transparent",
          ...tabSx,
        },
        "& .MuiTab-root.Mui-selected": {
          backgroundColor: uiColors.surface,
          border: `1px solid ${uiColors.border}`,
          color: `${uiColors.primary} !important`,
        },
        ...sx,
      }}
      {...props}
    >
      {items.map((item) => (
        <Tab
          key={item.id}
          value={item.value ?? item.id}
          label={item.label ?? item.name ?? item.id}
        />
      ))}
    </Tabs>
  );
}
