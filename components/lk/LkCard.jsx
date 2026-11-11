import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { JacoSurface, uiColors, uiTypography } from "@/design-system/shared/ui";

export default function LkCard({ icon = null, title, aside = null, children }) {
  return (
    <JacoSurface
      sx={{
        p: 2.5,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        {icon ? <Box sx={{ display: "flex", color: uiColors.text }}>{icon}</Box> : null}
        <Typography
          component="h3"
          sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong, flexGrow: 1 }}
        >
          {title}
        </Typography>
        {aside}
      </Box>
      {children}
    </JacoSurface>
  );
}
