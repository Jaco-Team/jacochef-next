"use client";

import { Box, Stack, Typography } from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import { CP_RADIUS, CP_SPACE } from "../layout";

const CHANNEL_ICON = {
  HALL: StorefrontOutlinedIcon,
  HALL_TAKEAWAY: RestaurantOutlinedIcon,
  PICKUP: ShoppingBagOutlinedIcon,
  TAKEAWAY: ShoppingBagOutlinedIcon,
  DELIVERY: DeliveryDiningOutlinedIcon,
};

const resolveIcon = (orderType) => CHANNEL_ICON[orderType] || StorefrontOutlinedIcon;

export default function ChannelListItem({
  name,
  rightValue,
  subtitle,
  orderType,
  onClick,
  ariaLabel,
}) {
  const Icon = resolveIcon(orderType);

  return (
    <Stack
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      direction="row"
      alignItems="center"
      spacing={CP_SPACE.compact}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        p: CP_SPACE.compact,
        borderRadius: CP_RADIUS.control,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
        "&:hover": onClick
          ? {
              borderColor: "border.hover",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
              transform: "translateY(-1px)",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: CP_RADIUS.control,
          backgroundColor: "action.hover",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Stack
        spacing={CP_SPACE.micro}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={CP_SPACE.related}
        >
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600 }}
          >
            {name}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
          >
            {rightValue}
          </Typography>
        </Stack>
        {subtitle ? (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

export { resolveIcon as resolveChannelIcon };
