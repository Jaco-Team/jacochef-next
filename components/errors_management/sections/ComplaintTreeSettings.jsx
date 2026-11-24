"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { Box, Collapse, Stack, Tooltip, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoIconButton,
  JacoStatusChip,
  JacoSurface,
  JacoSwitch,
  uiColors,
} from "@/design-system/shared/ui";
import { buildCategoryTree, categoryPayload, categorySummary } from "../optionTreeModel.mjs";
import { requestErrorText } from "../requestErrors.mjs";
import CategoryEditor from "./tree/CategoryEditor";

function NodeRow({ node, depth, canEdit, lookups, onAdd, onEdit, onToggle }) {
  const [expanded, setExpanded] = useState(depth === 0 && node.children.length > 0);
  const hasChildren = node.children.length > 0;
  const { stageNames, solutionNames } = categorySummary(node, lookups.stages, lookups.solutions);
  const siteNames = node.site_cats.map((id) => lookups.siteCategories.get(id)).filter(Boolean);
  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          alignItems: "center",
          minWidth: 0,
          py: 0.75,
          pl: { xs: depth * 1.5, sm: depth * 3 },
          borderBottom: `1px solid ${uiColors.borderLight}`,
        }}
      >
        <JacoIconButton
          aria-label={expanded ? `Свернуть ${node.name}` : `Развернуть ${node.name}`}
          aria-expanded={expanded}
          disabled={!hasChildren}
          onClick={() => setExpanded((current) => !current)}
          sx={{ width: 32, height: 32, border: "none", visibility: hasChildren ? "visible" : "hidden" }}
        >
          <ExpandMoreIcon
            fontSize="small"
            sx={{ transform: expanded ? "rotate(180deg)" : "rotate(-90deg)" }}
          />
        </JacoIconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography
              fontWeight={depth === 0 ? 700 : 500}
              sx={{ color: node.is_active ? "text.primary" : "text.disabled" }}
            >
              {node.name}
            </Typography>
            {!node.is_active ? (
              <JacoStatusChip
                label="Отключён"
                tone="neutral"
                variant="outlined"
              />
            ) : null}
            {node.need_img ? (
              <Tooltip
                title="Фото обязательно"
                arrow
              >
                <PhotoCameraOutlinedIcon
                  fontSize="small"
                  color="action"
                  aria-label="Фото обязательно"
                />
              </Tooltip>
            ) : null}
          </Stack>
          {depth === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {siteNames.length
                ? `Категории сайта: ${siteNames.join(", ")}`
                : "Без категорий сайта: ошибки заказа и доставки"}
            </Typography>
          ) : null}
          {!hasChildren && (stageNames.length || solutionNames.length) ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {[
                stageNames.length ? `Этапы: ${stageNames.join(", ")}` : null,
                solutionNames.length ? `Решения: ${solutionNames.join(", ")}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          ) : null}
        </Box>
        {canEdit ? (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            <Tooltip
              title="Добавить вложенный вариант"
              arrow
            >
              <Box component="span">
                <JacoIconButton
                  aria-label={`Добавить вариант в ${node.name}`}
                  onClick={() => onAdd(node)}
                  sx={{ width: 36, height: 36 }}
                >
                  <AddIcon fontSize="small" />
                </JacoIconButton>
              </Box>
            </Tooltip>
            <Tooltip
              title={node.is_active ? "Отключить вариант" : "Включить вариант"}
              arrow
            >
              <Box
                component="span"
                sx={{ display: "inline-flex" }}
              >
                <JacoSwitch
                  checked={node.is_active}
                  onChange={(event) => onToggle(node, event.target.checked)}
                  slotProps={{
                    input: {
                      "aria-label": `${node.is_active ? "Отключить" : "Включить"} ${node.name}`,
                    },
                  }}
                />
              </Box>
            </Tooltip>
            <Tooltip
              title="Изменить"
              arrow
            >
              <Box component="span">
                <JacoIconButton
                  aria-label={`Редактировать ${node.name}`}
                  onClick={() => onEdit(node)}
                  sx={{ width: 36, height: 36 }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </JacoIconButton>
              </Box>
            </Tooltip>
          </Stack>
        ) : null}
      </Stack>
      {hasChildren ? (
        <Collapse
          in={expanded}
          unmountOnExit
        >
          {node.children.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              canEdit={canEdit}
              lookups={lookups}
              onAdd={onAdd}
              onEdit={onEdit}
              onToggle={onToggle}
            />
          ))}
        </Collapse>
      ) : null}
    </Box>
  );
}

export default function ComplaintTreeSettings({ model }) {
  const { api, canEdit, errCats, reloadTree, siteCategories, solutions, stages, withLoading } =
    model;
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState("");
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const tree = useMemo(() => buildCategoryTree(errCats), [errCats]);
  const lookups = useMemo(
    () => ({
      stages: new Map(stages.map((stage) => [Number(stage.id), stage.name])),
      solutions: new Map(solutions.map((solution) => [Number(solution.id), solution.name])),
      siteCategories: new Map(siteCategories.map((item) => [Number(item.id), item.name])),
    }),
    [siteCategories, solutions, stages],
  );
  const rawById = useMemo(
    () => new Map((errCats || []).map((node) => [Number(node.id), node])),
    [errCats],
  );

  const run = async (operation, fallback, { fromEditor = false } = {}) => {
    setSaving(true);
    setError("");
    setEditorError("");
    try {
      await withLoading(operation);
      if (fromEditor) setEditor(null);
      await reloadTree();
    } catch (runError) {
      const text = requestErrorText(runError, fallback);
      if (fromEditor) setEditorError(text);
      else setError(text);
    } finally {
      setSaving(false);
    }
  };
  const save = (draft) => {
    const payload = categoryPayload(draft, draft.id ? rawById.get(Number(draft.id)) : null);
    return run(
      () => (payload.id ? api.updateTreeNode(payload) : api.addTreeNode(payload)),
      "Не удалось сохранить вариант.",
      { fromEditor: true },
    );
  };
  const remove = (id) =>
    run(() => api.deleteTreeNode(id), "Не удалось удалить вариант.", { fromEditor: true });
  const toggle = (node, isActive) =>
    run(() => api.setTreeNodeActive(node.id, isActive ? 1 : 0), "Не удалось изменить активность.");
  const openEditor = (node, parent = null) => {
    setEditorError("");
    setEditor({
      node: node ? rawById.get(node.id) || null : null,
      parent: parent ? rawById.get(parent.id) || null : null,
    });
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Варианты решения жалоб
          </Typography>
          <Typography color="text.secondary">
            Дерево категорий ошибок, общее с разделом «Варианты решения». Изменения сразу действуют
            при регистрации жалоб.
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
        >
          <JacoButton
            tone="outlinePrimary"
            onClick={() => run(() => Promise.resolve(), "Не удалось обновить дерево.")}
          >
            Обновить
          </JacoButton>
          {canEdit ? (
            <JacoButton
              startIcon={<AddIcon />}
              onClick={() => openEditor(null)}
            >
              Добавить раздел
            </JacoButton>
          ) : null}
        </Stack>
      </Stack>
      {error ? <JacoAlert severity="error">{error}</JacoAlert> : null}
      {!canEdit ? (
        <JacoAlert severity="info">
          У вас нет права изменять дерево. Доступен только просмотр.
        </JacoAlert>
      ) : null}
      <JacoSurface
        variant="outlined"
        sx={{ px: { xs: 1, sm: 2 }, py: 1 }}
      >
        {tree.length ? (
          tree.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              depth={0}
              canEdit={canEdit}
              lookups={lookups}
              onAdd={(parent) => openEditor(null, parent)}
              onEdit={(item) => openEditor(item)}
              onToggle={toggle}
            />
          ))
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 2, textAlign: "center" }}
          >
            Дерево категорий пустое.
          </Typography>
        )}
      </JacoSurface>
      {editor ? (
        <CategoryEditor
          state={editor}
          tree={tree}
          errCats={errCats}
          siteCategories={siteCategories}
          stages={stages}
          solutions={solutions}
          saving={saving}
          error={editorError}
          onClose={() => setEditor(null)}
          onSave={save}
          onDelete={remove}
        />
      ) : null}
    </Stack>
  );
}
