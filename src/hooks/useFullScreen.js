import { useMediaQuery, useTheme } from "@mui/material";

export default function useFullScreen() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
