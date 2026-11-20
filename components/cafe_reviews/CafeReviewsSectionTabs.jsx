import { Box } from "@mui/material";
import { JacoCompactTabs, uiColors, uiRadii } from "@/design-system/shared/ui";

function IncidentsLabel({ label, count }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      <span>{label}</span>
      {count > 0 ? (
        <Box
          component="span"
          aria-label={`Новых инцидентов: ${count}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 18,
            height: 18,
            px: 0.5,
            flexShrink: 0,
            borderRadius: uiRadii.full,
            backgroundColor: uiColors.primary,
            color: uiColors.surface,
            fontSize: 11,
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          {count}
        </Box>
      ) : null}
    </Box>
  );
}

export default function CafeReviewsSectionTabs({
  value,
  sections,
  newIncidentCount = 0,
  onChange,
}) {
  const items = sections.map((section) => ({
    id: section.value,
    value: section.value,
    label:
      section.value === "incidents" ? (
        <IncidentsLabel
          label={section.label}
          count={newIncidentCount}
        />
      ) : (
        section.label
      ),
  }));

  return (
    <Box sx={{ borderBottom: `1px solid ${uiColors.border}` }}>
      <JacoCompactTabs
        items={items}
        value={value}
        onChange={(_, nextValue) => onChange(nextValue)}
        aria-label="Разделы отзывов кафе"
        sx={{ maxWidth: 640 }}
      />
    </Box>
  );
}
