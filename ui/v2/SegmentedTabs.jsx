import { Box, Tab, Tabs } from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

export default function V2SegmentedTabs({ items, value, onChange, sx, tabSx, ...props }) {
  return (
    <Box
      sx={{
        p: 0.5,
        borderRadius: v2Radii.md,
        backgroundColor: v2Colors.surfaceMuted,
        ...sx,
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="fullWidth"
        sx={{
          minHeight: 48,
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTab-root": {
            minHeight: 48,
            textTransform: "none",
            borderRadius: v2Radii.md,
            color: v2Colors.textMuted,
            fontSize: 16,
            fontWeight: 500,
            ...tabSx,
          },
          "& .Mui-selected": {
            backgroundColor: v2Colors.surface,
            color: `${v2Colors.primary} !important`,
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.08)",
          },
        }}
        {...props}
      >
        {items.map((item) => (
          <Tab
            key={item.id}
            value={item.value ?? item.id}
            label={item.label}
          />
        ))}
      </Tabs>
    </Box>
  );
}
