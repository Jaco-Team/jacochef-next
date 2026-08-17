import { Box, Paper, Tab, Tabs } from "@mui/material";
import SmallFont from "@/ui/SmallFont";
import { blockBorder, brandRed } from "./shared";

export default function CafeReviewsSectionTabs({
  value,
  sections,
  newIncidentCount = 0,
  onChange,
}) {
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
            label={
              section.value === "incidents" ? (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <span>{section.label}</span>
                  {newIncidentCount > 0 ? (
                    <SmallFont
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        flexShrink: 0,
                        borderRadius: "50%",
                        backgroundColor: brandRed,
                        color: "#fff",
                        fontSize: "0.65rem",
                        lineHeight: 1,
                        fontWeight: 800,
                      }}
                    >
                      {newIncidentCount}
                    </SmallFont>
                  ) : null}
                </Box>
              ) : (
                section.label
              )
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
}
