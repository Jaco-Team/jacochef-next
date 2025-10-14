import { Card, CardContent, Typography, useTheme } from "@mui/material";

export default function SiteClientsMarketingStatCard({ title, value, onClick, bgcolor = "#fff" }) {
  const theme = useTheme();
  const textColor = theme.palette.getContrastText(bgcolor);

  return (
    <Card
      sx={{
        // bgcolor,
        cursor: onClick ? "pointer" : "default",
        color: textColor,
        transition: "background-color 0.3s",
        "&:hover": onClick
          ? {
              // filter: "brightness(1.1)", // slight lighten on hover
              backgroundColor: "#f5f5f5",
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h6">{title}</Typography>
        <Typography
          variant="h4"
          sx={{
            transition: "opacity 0.2s",
            "&:hover": onClick ? { opacity: 0.8 } : undefined,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
