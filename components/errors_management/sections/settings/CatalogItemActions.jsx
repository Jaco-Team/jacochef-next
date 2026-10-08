"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { Box, Stack, Tooltip } from "@mui/material";
import { JacoIconButton, JacoSwitch } from "@/design-system/shared/ui";

export default function CatalogItemActions({ node, onEdit, onHistory, onToggle }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      onClick={(event) => event.stopPropagation()}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      {onToggle ? (
        <Tooltip
          title={node.is_active ? "Отключить вариант" : "Включить вариант"}
          arrow
        >
          <Box
            component="span"
            sx={{ display: "inline-flex" }}
          >
            <JacoSwitch
              checked={Boolean(node.is_active)}
              onChange={(event) => onToggle(node, event.target.checked)}
              slotProps={{
                input: {
                  "aria-label": `${node.is_active ? "Отключить" : "Включить"} ${node.name}`,
                },
              }}
            />
          </Box>
        </Tooltip>
      ) : null}
      {onEdit ? (
        <Tooltip
          title="Изменить параметры"
          arrow
        >
          <Box component="span">
            <JacoIconButton
              aria-label={`Редактировать ${node.name}`}
              onClick={() => onEdit(node)}
            >
              <EditOutlinedIcon fontSize="small" />
            </JacoIconButton>
          </Box>
        </Tooltip>
      ) : null}
      <Tooltip
        title="История изменений"
        arrow
      >
        <Box component="span">
          <JacoIconButton
            aria-label={`История ${node.name}`}
            onClick={() => onHistory(node)}
          >
            <HistoryOutlinedIcon fontSize="small" />
          </JacoIconButton>
        </Box>
      </Tooltip>
    </Stack>
  );
}
