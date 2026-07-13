import { Tab, Tabs } from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

export default function V2SegmentedTabs({ items, value, onChange, sx, tabSx, ...props }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      sx={{
        minHeight: 48,
        p: 0.5,
        borderRadius: v2Radii.md,
        backgroundColor: v2Colors.surfaceMuted,
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTab-root": {
          minHeight: 40,
          textTransform: "none",
          borderRadius: v2Radii.sm,
          color: v2Colors.textMuted,
          fontSize: 16,
          fontWeight: 500,
          backgroundColor: "transparent",
          ...tabSx,
        },
        "& .MuiTab-root.Mui-selected": {
          backgroundColor: v2Colors.surface,
          color: `${v2Colors.primary} !important`,
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
