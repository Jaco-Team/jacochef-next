import { Tab, Tabs } from "@mui/material";
import { uiColors, uiTypography } from "../tokens";

export default function JacoCompactTabs({ items, value, onChange, sx, tabSx, ...props }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      sx={{
        minHeight: 40,
        "& .MuiTabs-indicator": {
          backgroundColor: uiColors.primary,
          height: 2,
        },
        "& .MuiTab-root": {
          minHeight: 40,
          textTransform: "none",
          fontWeight: uiTypography.label.fontWeight,
          fontSize: uiTypography.label.fontSize,
          lineHeight: uiTypography.label.lineHeight,
          color: uiColors.textMuted,
          ...tabSx,
        },
        "& .Mui-selected": {
          color: uiColors.primary,
        },
        ...sx,
      }}
      {...props}
    >
      {items.map((item) => (
        <Tab
          key={item.value ?? item.id}
          value={item.value ?? item.id}
          label={item.label}
        />
      ))}
    </Tabs>
  );
}
