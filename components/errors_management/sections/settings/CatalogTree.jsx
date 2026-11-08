"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Chip, Collapse, Stack, Typography } from "@mui/material";
import { JacoButton, JacoIconButton, JacoSurface } from "@/design-system/shared/ui";
import { formatPlural } from "@/src/helpers/utils/i18n";
import CatalogItemActions from "./CatalogItemActions";
import { CATEGORY_DEFINITIONS, nodesOf, sortNodes } from "./catalogModel.mjs";

function CategorySection({ definition, category, types, children, onEdit, onHistory, onToggle }) {
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
        <Chip
          size="small"
          label={category ? formatPlural(types.length, ["тип", "типа", "типов"]) : "Не настроено"}
        />
        {category ? (
          <CatalogItemActions
            node={category}
            onEdit={onEdit}
            onHistory={onHistory}
            onToggle={onToggle}
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

export function InactiveCatalogGroups({ nodes, onEdit, onHistory, onToggle }) {
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

export default function CatalogTree({ nodes, pointId, onEdit, onCreate, onHistory, onToggle }) {
  const categories = new Map(
    nodesOf(nodes, "category").map((node) => [node.rules?.object_types?.[0], node]),
  );
  return (
    <Stack spacing={1.25}>
      {CATEGORY_DEFINITIONS.map((definition) => {
        const category = categories.get(definition.objectType);
        const types = category ? sortNodes(nodesOf(nodes, "error_type", category.id)) : [];
        return (
          <CategorySection
            key={definition.objectType}
            definition={definition}
            category={category}
            types={types}
            onEdit={onEdit}
            onHistory={onHistory}
            onToggle={onToggle}
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
                            onEdit={onEdit}
                            onHistory={onHistory}
                            onToggle={onToggle}
                          />
                        </Stack>
                        {errors.map((error) => (
                          <Stack
                            key={error.id}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", pl: { xs: 0, sm: 2 } }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography>{error.name}</Typography>
                              {error.rules?.requires_ingredient ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  С выбором продукта из состава
                                </Typography>
                              ) : null}
                            </Box>
                            <CatalogItemActions
                              node={error}
                              onEdit={onEdit}
                              onHistory={onHistory}
                              onToggle={onToggle}
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
