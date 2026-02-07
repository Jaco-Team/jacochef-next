import { useMediaQuery, useTheme } from "@mui/material";

export default function useFullScreen(bp = "sm") {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(bp));
}
