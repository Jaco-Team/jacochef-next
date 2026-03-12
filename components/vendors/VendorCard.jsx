"use client";
import { Card, CardContent, Typography, Chip, Box, Avatar, Stack, IconButton } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function VendorCard({ vendor, onClick, onToggleActive }) {
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: "pointer",
        transition: "transform .12s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
      onClick={() => onClick && onClick(vendor)}
    >
      <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <StorefrontIcon />
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1">{vendor.name}</Typography>
            <Chip
              label={vendor.city}
              size="small"
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            <LocationOnIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />{" "}
            {vendor.address}
          </Typography>
        </Box>

        <Stack
          alignItems="center"
          spacing={1}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive && onToggleActive(vendor.id);
            }}
            title="Toggle active"
          >
            <Inventory2Icon />
          </IconButton>
          <Chip
            label={`${vendor.itemsCount} товаров`}
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
