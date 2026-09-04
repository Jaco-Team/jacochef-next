import { Tab, Tabs } from "@mui/material";
import { uiColors, uiControl, uiRadii, uiTypography } from "../tokens";

export default function JacoSegmentedTabs({
  items,
  value,
  onChange,
  size = "regular",
  sx,
  tabSx,
  ...props
}) {
  const isCompact = size === "compact";

  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      sx={{
        minHeight: isCompact ? 46 : 58,
        p: isCompact ? 0.5 : `${uiControl.segmentPadding}px`,
        borderRadius: isCompact ? "14px" : uiRadii.md,
        backgroundColor: uiColors.surfaceMuted,
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTab-root": {
          minHeight: isCompact ? 36 : 40,
          px: isCompact ? 2 : undefined,
          textTransform: "none",
          borderRadius: isCompact ? "10px" : uiRadii.sm,
          color: uiColors.text,
          fontSize: isCompact ? uiTypography.label.fontSize : uiTypography.bodyLarge.fontSize,
          lineHeight: isCompact ? uiTypography.label.lineHeight : uiTypography.bodyLarge.lineHeight,
          fontWeight: isCompact ? 600 : uiTypography.bodyLarge.fontWeight,
          backgroundColor: "transparent",
          ...tabSx,
        },
        "& .MuiTab-root.Mui-selected": {
          backgroundColor: uiColors.surface,
          border: isCompact ? 0 : `1px solid ${uiColors.border}`,
          color: isCompact ? `${uiColors.textStrong} !important` : `${uiColors.primary} !important`,
          boxShadow: isCompact ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
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
