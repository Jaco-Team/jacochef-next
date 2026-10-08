"use client";

import AddIcon from "@mui/icons-material/Add";
import { Box, Stack, Typography } from "@mui/material";
import { JacoButton, JacoSurface } from "@/design-system/shared/ui";
import CatalogItemActions from "./CatalogItemActions";
import { nodesOf, sortNodes } from "./catalogModel.mjs";

export default function FlatDirectory({
  kind,
  nodes,
  pointId,
  onEdit,
  onCreate,
  onHistory,
  onToggle,
  showHeader = true,
}) {
  const label = kind === "stage" ? "Этапы возникновения ошибки" : "Варианты решения";
  const addLabel = kind === "stage" ? "Добавить этап" : "Добавить решение";
  return (
    <Stack spacing={1.5}>
      {showHeader ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {label}
          </Typography>
          {onCreate ? (
            <JacoButton
              compact
              startIcon={<AddIcon />}
              onClick={() => onCreate({ kind, pointId })}
            >
              {addLabel}
            </JacoButton>
          ) : null}
        </Stack>
      ) : null}
      {sortNodes(nodesOf(nodes, kind)).map((node) => (
        <JacoSurface
          key={node.id}
          variant="outlined"
          sx={{ p: 1.5 }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>{node.name}</Typography>
              {node.description ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {node.description}
                </Typography>
              ) : null}
            </Box>
            <CatalogItemActions
              node={node}
              onEdit={onEdit}
              onHistory={onHistory}
              onToggle={onToggle}
            />
          </Stack>
        </JacoSurface>
      ))}
    </Stack>
  );
}
