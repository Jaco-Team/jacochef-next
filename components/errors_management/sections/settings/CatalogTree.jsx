"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Collapse, Stack, Typography } from "@mui/material";
import {
  JacoButton,
  JacoIconButton,
  JacoInfoLabel,
  JacoStatusChip,
  JacoSurface,
} from "@/design-system/shared/ui";
import { formatPlural } from "@/src/helpers/utils/i18n";
import CatalogItemActions from "./CatalogItemActions";
import {
  CATEGORY_DEFINITIONS,
  categoriesForObjectType,
  nodesOf,
  preferredCategory,
  sortNodes,
} from "./catalogModel.mjs";

function ErrorStages({ error, stages }) {
  const stageIds = (error.rules?.stage_ids || []).map(Number);
  const items = stages.filter((stage) => stageIds.includes(Number(stage.id)));
  if (!items.length) return null;
  return (
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      sx={{ flexWrap: "wrap", alignItems: "center" }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        Этапы:
      </Typography>
      {items.map((stage) => (
        <JacoInfoLabel
          key={stage.id}
          variant="caption"
          color="text.secondary"
          tooltip={stage.description || null}
        >
          {stage.name}
        </JacoInfoLabel>
      ))}
    </Stack>
  );
}

function CategorySection({ definition, category, typesCount, children, actionProps }) {
  const [expanded, setExpanded] = useState(definition.objectType === "dish");
  return (
    <JacoSurface
      variant="outlined"
      sx={{ overflow: "hidden" }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", minWidth: 0, p: 1.5 }}
      >
        <Typography
          fontWeight={700}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {definition.name}
        </Typography>
        <JacoStatusChip
          tone="neutral"
          variant="soft"
          label={category ? formatPlural(typesCount, ["тип", "типа", "типов"]) : "Не настроено"}
        />
        {category ? (
          <CatalogItemActions
            node={category}
            {...actionProps}
          />
        ) : null}
        <JacoIconButton
          aria-label={expanded ? `Свернуть ${definition.name}` : `Развернуть ${definition.name}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <ExpandMoreIcon sx={{ transform: expanded ? "rotate(180deg)" : "none" }} />
        </JacoIconButton>
      </Stack>
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>{children}</Box>
      </Collapse>
    </JacoSurface>
  );
}

export function InactiveCatalogGroups({ nodes, pointId, isEditable, onEdit, onHistory, onToggle }) {
  const groups = [
    { kind: "category", label: "Категории" },
    { kind: "error_type", label: "Типы ошибок" },
    { kind: "error", label: "Ошибки" },
  ];
  return (
    <Stack spacing={1.5}>
      {groups.map((group) => {
        const items = sortNodes(nodesOf(nodes, group.kind));
        return (
          <Box key={group.kind}>
            <Typography
              fontWeight={700}
              sx={{ mb: 0.75 }}
            >
              {group.label} ({items.length})
            </Typography>
            {items.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Нет неактивных элементов.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {items.map((node) => (
                  <JacoSurface
                    key={node.id}
                    variant="outlined"
                    sx={{ p: 1.25 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography>{node.name}</Typography>
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
                        pointId={pointId}
                        isEditable={isEditable}
                        onEdit={onEdit}
                        onHistory={onHistory}
                        onToggle={onToggle}
                      />
                    </Stack>
                  </JacoSurface>
                ))}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

export default function CatalogTree({
  nodes,
  stages = [],
  pointId,
  isEditable,
  onEdit,
  onCreate,
  onHistory,
  onToggle,
}) {
  const actionProps = { pointId, isEditable, onEdit, onHistory, onToggle };
  return (
    <Stack spacing={1.25}>
      {CATEGORY_DEFINITIONS.map((definition) => {
        const categories = categoriesForObjectType(nodes, definition.objectType);
        const category = preferredCategory(categories, pointId);
        const types = sortNodes(
          categories.flatMap((item) => nodesOf(nodes, "error_type", item.id)),
        );
        return (
          <CategorySection
            key={definition.objectType}
            definition={definition}
            category={category}
            typesCount={types.length}
            actionProps={actionProps}
          >
            {!category ? (
              onCreate ? (
                <JacoButton
                  compact
                  tone="outlinePrimary"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    onCreate({
                      kind: "category",
                      pointId,
                      objectType: definition.objectType,
                      name: definition.name,
                    })
                  }
                >
                  Настроить раздел
                </JacoButton>
              ) : null
            ) : (
              <Stack spacing={1.25}>
                {types.map((type) => {
                  const errors = sortNodes(nodesOf(nodes, "error", type.id));
                  return (
                    <JacoSurface
                      key={type.id}
                      variant="outlined"
                      sx={{ p: 1.5 }}
                    >
                      <Stack spacing={1.25}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Typography
                            fontWeight={700}
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            {type.name}
                          </Typography>
                          <CatalogItemActions
                            node={type}
                            {...actionProps}
                          />
                        </Stack>
                        {errors.map((error) => (
                          <Stack
                            key={error.id}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", pl: { xs: 0, sm: 2 } }}
                          >
                            <Stack
                              spacing={0.25}
                              sx={{ flex: 1, minWidth: 0 }}
                            >
                              <Typography>{error.name}</Typography>
                              {error.rules?.requires_ingredient ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  С выбором продукта из состава
                                </Typography>
                              ) : null}
                              <ErrorStages
                                error={error}
                                stages={stages}
                              />
                            </Stack>
                            <CatalogItemActions
                              node={error}
                              {...actionProps}
                            />
                          </Stack>
                        ))}
                        {onCreate ? (
                          <JacoButton
                            compact
                            tone="outlinePrimary"
                            startIcon={<AddIcon />}
                            onClick={() => onCreate({ kind: "error", parentId: type.id, pointId })}
                          >
                            Добавить ошибку
                          </JacoButton>
                        ) : null}
                      </Stack>
                    </JacoSurface>
                  );
                })}
                {onCreate ? (
                  <JacoButton
                    compact
                    tone="outlinePrimary"
                    startIcon={<AddIcon />}
                    onClick={() => onCreate({ kind: "error_type", parentId: category.id, pointId })}
                  >
                    Добавить тип ошибки
                  </JacoButton>
                ) : null}
              </Stack>
            )}
          </CategorySection>
        );
      })}
    </Stack>
  );
}
