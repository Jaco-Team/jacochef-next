"use client";

import { Chip, Stack, Typography } from "@mui/material";

import { MySelect } from "@/ui/Forms";

function hasOwnCount(item, key) {
  return Object.prototype.hasOwnProperty.call(item || {}, key) && item?.[key] != null;
}

function getCount(item) {
  return hasOwnCount(item, "items_count") ? item.items_count : null;
}

export default function SkladCategorySelect(props) {
  return (
    <MySelect
      {...props}
      renderItem={(item) => {
        const count = getCount(item);

        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", minWidth: 0 }}
          >
            <Typography
              variant="inherit"
              component="span"
              sx={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item?.name}
            </Typography>

            {count != null ? (
              <Chip
                label={count}
                size="small"
                color="success"
                sx={{
                  height: 20,
                  fontSize: "0.75rem",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            ) : null}
          </Stack>
        );
      }}
    />
  );
}
