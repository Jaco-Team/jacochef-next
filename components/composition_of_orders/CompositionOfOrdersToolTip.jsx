import { SvgIconInfo } from "@/ui/icons";
import { IconButton, Tooltip } from "@mui/material";

export default function CompositionOfOrdersTooltip({ title }) {
  return (
    <Tooltip title={title}>
      <IconButton>
        <SvgIconInfo style={{ verticalAlign: "bottom" }} />
      </IconButton>
    </Tooltip>
  );
}
