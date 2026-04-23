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

export default function ChannelListItem({ name, rightValue, subtitle, orderType }) {
  const Icon = resolveIcon(orderType);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={CP_SPACE.compact}
      sx={{
        p: CP_SPACE.compact,
        borderRadius: CP_RADIUS.control,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
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
