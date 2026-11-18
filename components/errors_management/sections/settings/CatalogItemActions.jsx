"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { Box, Stack, Tooltip } from "@mui/material";
import { JacoIconButton, JacoStatusChip, JacoSwitch } from "@/design-system/shared/ui";
import { isInheritedNode } from "./catalogModel.mjs";

export default function CatalogItemActions({
  node,
  pointId = null,
  isEditable,
  onEdit: providedEdit,
  onHistory,
  onToggle: providedToggle,
}) {
  const editable = isEditable ? isEditable(node) : true;
  const onEdit = editable ? providedEdit : null;
  const onToggle = editable ? providedToggle : null;
  return (
    <Stack
      direction="row"
      spacing={0.5}
      onClick={(event) => event.stopPropagation()}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      {isInheritedNode(node, pointId) ? (
        <Tooltip
          title="Общий вариант для всех кафе. Изменяется в области «Все кафе (общие)»."
          arrow
        >
          <Box
            component="span"
            sx={{ display: "inline-flex" }}
          >
            <JacoStatusChip
              label="Общий"
              tone="neutral"
              variant="outlined"
            />
          </Box>
        </Tooltip>
      ) : null}
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
