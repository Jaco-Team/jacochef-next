import { Tab, Tabs } from "@mui/material";
import { v2Colors } from "./tokens";

export default function V2CompactTabs({ items, value, onChange, sx, tabSx, ...props }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="fullWidth"
      sx={{
        minHeight: 40,
        "& .MuiTabs-indicator": {
          backgroundColor: v2Colors.primary,
          height: 2,
        },
        "& .MuiTab-root": {
          minHeight: 40,
          textTransform: "none",
          fontWeight: 600,
          fontSize: 14,
          color: v2Colors.textMuted,
          ...tabSx,
        },
        "& .Mui-selected": {
          color: v2Colors.primary,
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
