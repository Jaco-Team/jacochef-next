import { Paper, Tab, Tabs } from "@mui/material";
import { blockBorder } from "./shared";

export default function CafeReviewsSectionTabs({ value, sections, onChange }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: "12px", borderColor: blockBorder, overflow: "hidden" }}
    >
      <Tabs
        value={value}
        onChange={(_, nextValue) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Разделы отзывов кафе"
        sx={{
          "& .MuiTab-root": {
            minHeight: 48,
            textTransform: "none",
            fontWeight: 700,
          },
        }}
      >
        {sections.map((section) => (
          <Tab
            key={section.value}
            value={section.value}
            label={section.label}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
