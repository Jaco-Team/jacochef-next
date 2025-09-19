import { Card, CardContent, Typography, useTheme } from "@mui/material";

export default function SiteClientsMarketingStatCard({ title, value, bgcolor, onClick }) {
  const theme = useTheme();
  const textColor = theme.palette.getContrastText(bgcolor);

  return (
    <Card
      sx={{
        bgcolor,
        cursor: onClick ? "pointer" : "default",
        color: textColor,
        transition: "background-color 0.3s",
        "&:hover": {
          filter: "brightness(1.1)", // slight lighten on hover
        },
      }}
      onClick={onClick}
    >
      <CardContent>
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
