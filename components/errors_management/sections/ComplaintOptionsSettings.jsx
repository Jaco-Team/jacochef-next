"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPlural } from "@/src/helpers/utils/i18n";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  JacoButton,
  JacoIconButton,
  JacoModal,
  JacoSegmentedTabs,
  JacoSelect,
  JacoSurface,
  JacoSwitch,
  JacoTextInput,
} from "@/design-system/shared/ui";

const CATEGORY_DEFINITIONS = [
  { objectType: "dish", name: "Блюдо" },
  { objectType: "order", name: "Заказ" },
  { objectType: "extra", name: "Допы" },
  { objectType: "cutlery", name: "Столовые приборы" },
  { objectType: "delivery", name: "Доставка" },
];

const SURFACE_SX = { boxShadow: "none" };

function nodesOf(nodes, kind, parentId = null) {
  return nodes.filter(
    (node) =>
      node.kind === kind && (parentId === null || Number(node.parent_id) === Number(parentId)),
  );
}

function sortNodes(nodes) {
  return [...nodes].sort(
    (left, right) =>
      Number(left.sort_order || 0) - Number(right.sort_order || 0) ||
      String(left.name || "").localeCompare(String(right.name || ""), "ru") ||
      Number(left.id) - Number(right.id),
  );
}

function initialDraft(node, context) {
  return {
    id: node?.id || 0,
    kind: node?.kind || context.kind,
    parent_id: node?.parent_id ?? context.parentId ?? null,
    point_id: node?.point_id ?? context.pointId ?? null,
    name: node?.name || context.name || "",
    description: node?.description || "",
    sort_order: String(node?.sort_order ?? 0),
    is_active: node?.is_active ?? true,
    rules:
      node?.rules ||
      context.rules ||
      (context.kind === "category" ? { object_types: [context.objectType] } : {}),
  };
}

function CatalogNodeEditor({ state, onClose, onSave, saving, error, stages }) {
  const [draft, setDraft] = useState(() => initialDraft(state.node, state.context));
  const isError = draft.kind === "error";
  const title = draft.id ? "Редактировать вариант" : "Добавить вариант";

  useEffect(() => {
    setDraft(initialDraft(state.node, state.context));
  }, [state]);

  const save = () => {
    onSave({
      ...draft,
      sort_order: Number(draft.sort_order || 0),
      rules: isError
        ? {
            requires_ingredient: Boolean(draft.rules?.requires_ingredient),
            stage_ids: (draft.rules?.stage_ids || []).map(Number),
          }
        : draft.rules,
    });
  };

  return (
    <JacoModal
      open
      onClose={onClose}
      title={title}
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            tone="outlinePrimary"
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            disabled={saving || !draft.name.trim()}
            onClick={save}
          >
            Сохранить
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <JacoTextInput
          fullWidth
          required
          label="Наименование"
          value={draft.name}
          disabled={draft.kind === "category"}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <JacoTextInput
          fullWidth
          multiline
          minRows={3}
          label="Описание"
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
        />
        <JacoTextInput
          fullWidth
          type="number"
          label="Порядок"
          value={draft.sort_order}
          onChange={(event) =>
            setDraft((current) => ({ ...current, sort_order: event.target.value }))
          }
        />
        {isError ? (
          <Stack spacing={2}>
            <JacoSelect
              required
              multiple
              label="Этапы возникновения ошибки"
              options={stages}
              value={draft.rules?.stage_ids || []}
              allowNone={false}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  rules: {
                    ...current.rules,
                    stage_ids: Array.isArray(event.target.value)
                      ? event.target.value.map(Number)
                      : [],
                  },
                }))
              }
            />
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
            >
              <JacoSwitch
                checked={Boolean(draft.rules?.requires_ingredient)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    rules: { ...current.rules, requires_ingredient: event.target.checked },
                  }))
                }
              />
              <Box>
                <Typography fontWeight={700}>Запрашивать продукт из состава</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Показывается только при регистрации ошибки блюда.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        ) : null}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <JacoSwitch
            checked={Boolean(draft.is_active)}
            onChange={(event) =>
              setDraft((current) => ({ ...current, is_active: event.target.checked }))
            }
          />
          <Typography fontWeight={700}>Вариант активен</Typography>
        </Stack>
      </Stack>
    </JacoModal>
  );
}

function CatalogHistory({ node, request, onClose }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!node) return;
    setItems([]);
    setError("");
    request("v2/settings/history", { id: node.id })
      .then((response) => setItems((response?.data ?? response)?.history || []))
      .catch(() => setError("Не удалось загрузить историю изменений."));
  }, [node, request]);

  return (
    <JacoModal
      open={Boolean(node)}
      onClose={onClose}
      title={`История: ${node?.name || ""}`}
      maxWidth="sm"
    >
      <Stack spacing={1.5}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!error && items.length === 0 ? (
          <Typography color="text.secondary">Изменений пока нет.</Typography>
        ) : null}
        {items.map((item) => (
          <JacoSurface
            key={item.id}
            variant="outlined"
            sx={{ p: 1.5, ...SURFACE_SX }}
          >
            <Typography fontWeight={700}>
              {item.event_type === "create" ? "Создание" : "Изменение"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {item.actor_name || "Система"} · {item.created_at}
            </Typography>
          </JacoSurface>
        ))}
      </Stack>
    </JacoModal>
  );
}

function CatalogItemActions({ node, onEdit, onHistory, onToggle }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      {onToggle ? (
        <JacoSwitch
          checked={Boolean(node.is_active)}
          onChange={(event) => onToggle(node, event.target.checked)}
          slotProps={{
            input: { "aria-label": `${node.is_active ? "Отключить" : "Включить"} ${node.name}` },
          }}
          sx={{ transform: "scale(.78)", transformOrigin: "right center", mr: -0.75 }}
        />
      ) : null}
      {onEdit ? (
        <JacoIconButton
          aria-label={`Редактировать ${node.name}`}
          onClick={() => onEdit(node)}
        >
          <EditOutlinedIcon fontSize="small" />
        </JacoIconButton>
      ) : null}
      <JacoIconButton
        aria-label={`История ${node.name}`}
        onClick={() => onHistory(node)}
      >
        <HistoryOutlinedIcon fontSize="small" />
      </JacoIconButton>
    </Stack>
  );
}

function ClassifierTree({ nodes, pointId, onEdit, onCreate, onHistory, onToggle }) {
  const categoriesByObject = useMemo(() => {
    const categories = nodesOf(nodes, "category");
    return new Map(categories.map((node) => [node.rules?.object_types?.[0], node]));
  }, [nodes]);

  return (
    <Stack spacing={1.25}>
      {CATEGORY_DEFINITIONS.map((definition) => {
        const category = categoriesByObject.get(definition.objectType);
        const types = category ? sortNodes(nodesOf(nodes, "error_type", category.id)) : [];
        return (
          <Accordion
            key={definition.objectType}
            disableGutters
            defaultExpanded={definition.objectType === "dish"}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", width: "100%", pr: 1 }}
              >
                <Typography
                  fontWeight={700}
                  sx={{ flex: 1 }}
                >
                  {definition.name}
                </Typography>
                <Chip
                  size="small"
                  label={
                    category ? formatPlural(types.length, ["тип", "типа", "типов"]) : "Не настроено"
                  }
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
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
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Настройки категории
                    </Typography>
                    <CatalogItemActions
                      node={category}
                      onEdit={onEdit}
                      onHistory={onHistory}
                      onToggle={onToggle}
                    />
                  </Stack>
                  {types.map((type) => {
                    const errors = sortNodes(nodesOf(nodes, "error", type.id));
                    return (
                      <JacoSurface
                        key={type.id}
                        variant="outlined"
                        sx={{ p: 1.5, ...SURFACE_SX }}
                      >
                        <Stack spacing={1.25}>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <Typography
                              fontWeight={700}
                              sx={{ flex: 1 }}
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
                              <Box sx={{ flex: 1 }}>
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
                              onClick={() =>
                                onCreate({ kind: "error", parentId: type.id, pointId })
                              }
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
                      onClick={() =>
                        onCreate({ kind: "error_type", parentId: category.id, pointId })
                      }
                    >
                      Добавить тип ошибки
                    </JacoButton>
                  ) : null}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}

function FlatDirectory({ kind, nodes, pointId, onEdit, onCreate, onHistory, onToggle }) {
  const label = kind === "stage" ? "Этапы возникновения ошибки" : "Варианты решения";
  const addLabel = kind === "stage" ? "Добавить этап" : "Добавить решение";
  return (
    <Stack spacing={1.5}>
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
      {sortNodes(nodesOf(nodes, kind)).map((node) => (
        <JacoSurface
          key={node.id}
          variant="outlined"
          sx={{ p: 1.5, ...SURFACE_SX }}
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

export default function ComplaintOptionsSettings({ request, pointId, canEdit }) {
  const [settings, setSettings] = useState({ active: [], inactive: [] });
  const [error, setError] = useState("");
  const [view, setView] = useState("classifier");
  const [editor, setEditor] = useState(null);
  const [history, setHistory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoaded(false);
    setError("");
    try {
      const response = await request("v2/settings", pointId ? { point_id: Number(pointId) } : {});
      setSettings(response?.data ?? response ?? { active: [], inactive: [] });
      setLoaded(true);
    } catch {
      setError("Не удалось загрузить варианты решений жалоб.");
    }
  }, [pointId, request]);

  useEffect(() => {
    load();
  }, [load]);

  const activeNodes = settings.active || [];
  const inactiveNodes = settings.inactive || [];
  const activeStages = sortNodes(nodesOf(activeNodes, "stage"));
  const openEditor = (node, context = {}) => setEditor({ node, context });
  const saveNode = async (setting) => {
    setSaving(true);
    setError("");
    try {
      await request(
        "v2/settings/save",
        { setting },
        { throwErrors: true, suppressAuthRedirect: true },
      );
      setEditor(null);
      await load();
    } catch {
      setError("Не удалось сохранить настройку. Проверьте право на редактирование.");
    } finally {
      setSaving(false);
    }
  };
  const toggle = async (node, isActive) => {
    await saveNode({ ...node, is_active: isActive, rules: node.rules || {} });
  };

  return (
    <Stack spacing={2.5}>
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
            Настройки применяются к регистрации жалобы после сохранения.
          </Typography>
        </Box>
        <JacoButton
          tone="outlinePrimary"
          onClick={load}
        >
          Обновить
        </JacoButton>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!canEdit ? (
        <Alert severity="info">
          У вас нет права изменять настройки. Доступен просмотр текущих вариантов и их истории.
        </Alert>
      ) : null}
      <JacoSegmentedTabs
        size="compact"
        value={view}
        onChange={(_, value) => setView(value)}
        items={[
          { id: "classifier", label: "Классификатор" },
          { id: "stages", label: "Этапы" },
          { id: "solutions", label: "Решения" },
        ]}
      />
      {!loaded && !error ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 5 }}>
          <CircularProgress aria-label="Загрузка настроек" />
        </Box>
      ) : null}
      {loaded && view === "classifier" ? (
        <ClassifierTree
          nodes={activeNodes}
          pointId={pointId ? Number(pointId) : null}
          onEdit={canEdit ? (node) => openEditor(node) : null}
          onCreate={canEdit ? (context) => openEditor(null, context) : null}
          onHistory={setHistory}
          onToggle={canEdit ? toggle : null}
        />
      ) : null}
      {loaded && view === "stages" ? (
        <FlatDirectory
          kind="stage"
          nodes={activeNodes}
          pointId={pointId ? Number(pointId) : null}
          onEdit={canEdit ? (node) => openEditor(node) : null}
          onCreate={canEdit ? (context) => openEditor(null, context) : null}
          onHistory={setHistory}
          onToggle={canEdit ? toggle : null}
        />
      ) : null}
      {loaded && view === "solutions" ? (
        <FlatDirectory
          kind="solution"
          nodes={activeNodes}
          pointId={pointId ? Number(pointId) : null}
          onEdit={canEdit ? (node) => openEditor(node) : null}
          onCreate={canEdit ? (context) => openEditor(null, context) : null}
          onHistory={setHistory}
          onToggle={canEdit ? toggle : null}
        />
      ) : null}
      {loaded ? (
        <>
          <Divider />
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>Неактивные варианты ({inactiveNodes.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {inactiveNodes.length === 0 ? (
                  <Typography color="text.secondary">Нет неактивных вариантов.</Typography>
                ) : null}
                {sortNodes(inactiveNodes).map((node) => (
                  <Stack
                    key={node.id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography>{node.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {node.kind}
                      </Typography>
                    </Box>
                    <CatalogItemActions
                      node={node}
                      onEdit={canEdit ? (item) => openEditor(item) : null}
                      onHistory={setHistory}
                      onToggle={canEdit ? toggle : null}
                    />
                  </Stack>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </>
      ) : null}
      {editor ? (
        <CatalogNodeEditor
          state={editor}
          onClose={() => setEditor(null)}
          onSave={saveNode}
          saving={saving}
          error={error}
          stages={activeStages}
        />
      ) : null}
      <CatalogHistory
        node={history}
        request={request}
        onClose={() => setHistory(null)}
      />
    </Stack>
  );
}
