import { Box } from "@mui/material";

export default function JacoTabPanel({ children, value, index, ...props }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`jaco-tabpanel-${index}`}
      aria-labelledby={`jaco-tab-${index}`}
      {...props}
    >
      {value === index ? <Box sx={{ width: "100%" }}>{children}</Box> : null}
    </div>
  );
}
