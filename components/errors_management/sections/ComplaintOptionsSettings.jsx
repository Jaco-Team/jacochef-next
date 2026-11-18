"use client";

import { useCallback, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { JacoAlert, JacoButton, JacoSegmentedTabs } from "@/design-system/shared/ui";
import { requestErrorText, requestFieldErrors } from "../requestErrors.mjs";
import CatalogHistory from "./settings/CatalogHistory";
import CatalogNodeEditor from "./settings/CatalogNodeEditor";
import CatalogTree, { InactiveCatalogGroups } from "./settings/CatalogTree";
import FlatDirectory from "./settings/FlatDirectory";
import {
  allowsIngredient,
  canEditCatalogNode,
  nodeRules,
  nodesOf,
  sortNodes,
} from "./settings/catalogModel.mjs";

const INACTIVE_VIEWS = {
  classifier: { kinds: ["category", "error_type", "error"], title: "Неактивные элементы" },
  stages: { kinds: ["stage"], title: "Неактивные этапы" },
  solutions: { kinds: ["solution"], title: "Неактивные решения" },
};

const NO_ERROR = { text: "", fields: {} };

function ScopeNotice({ canEdit, pointId, scopeLabel }) {
  if (!canEdit) {
    return (
      <JacoAlert severity="info">
        У вас нет права изменять настройки. Доступен просмотр текущих вариантов и их истории.
      </JacoAlert>
    );
  }
  if (pointId) {
    return (
      <JacoAlert severity="info">
        Показаны общие варианты и варианты кафе «{scopeLabel}». Новые варианты создаются только для
        этого кафе. Общие варианты (метка «Общий») изменяются в области «Все кафе (общие)».
      </JacoAlert>
    );
  }
  return (
    <JacoAlert severity="info">
      Общие варианты применяются во всех кафе. Чтобы добавить вариант только для одного кафе,
      выберите его в поле «Область настроек».
    </JacoAlert>
  );
}

export default function ComplaintOptionsSettings({
  api,
  pointId,
  scopeLabel,
  canEdit,
  siteCategories,
  withLoading,
}) {
  const [settings, setSettings] = useState({ active: [], inactive: [] });
  const [error, setError] = useState("");
  const [editorError, setEditorError] = useState(NO_ERROR);
  const [view, setView] = useState("classifier");
  const [editor, setEditor] = useState(null);
  const [history, setHistory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoaded(false);
    setError("");
    try {
      const response = await withLoading(() =>
        api.getSettings(pointId ? { point_id: pointId } : {}),
      );
      setSettings(response?.data ?? response ?? { active: [], inactive: [] });
      setLoaded(true);
    } catch (loadError) {
      setError(requestErrorText(loadError, "Не удалось загрузить варианты решений жалоб."));
    }
  }, [api, pointId, withLoading]);
  useEffect(() => {
    load();
  }, [load]);

  const activeNodes = settings.active || [];
  const inactiveView = INACTIVE_VIEWS[view];
  const inactiveNodes = (settings.inactive || []).filter((node) =>
    inactiveView.kinds.includes(node.kind),
  );
  const activeStages = sortNodes(nodesOf(activeNodes, "stage"));
  const visibleNodes = [...activeNodes, ...(settings.inactive || [])];
  const isEditable = (node) => canEditCatalogNode(node, pointId, canEdit);
  const openEditor = (node, context = {}) => {
    setEditorError(NO_ERROR);
    setEditor({ node, context });
  };
  const saveNode = async (setting, { fromEditor = false } = {}) => {
    setSaving(true);
    setError("");
    setEditorError(NO_ERROR);
    try {
      await withLoading(() => api.saveSetting({ setting }));
      setEditor(null);
      await load();
    } catch (saveError) {
      const text = requestErrorText(
        saveError,
        "Не удалось сохранить настройку. Проверьте соединение и повторите попытку.",
      );
      if (fromEditor) {
        setEditorError({ text, fields: requestFieldErrors(saveError) });
      } else {
        setError(text);
      }
    } finally {
      setSaving(false);
    }
  };
  const toggle = (node, isActive) =>
    saveNode({
      ...node,
      is_active: isActive,
      rules: nodeRules(node.kind, node.rules || {}, {
        allowIngredient: allowsIngredient(visibleNodes, node),
      }),
    });
  const edit = canEdit ? (node) => openEditor(node) : null;
  const create = canEdit ? (context) => openEditor(null, { ...context, pointId }) : null;
  const toggleNode = canEdit ? toggle : null;
  const treeProps = {
    pointId,
    isEditable,
    onEdit: edit,
    onCreate: create,
    onHistory: setHistory,
    onToggle: toggleNode,
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
      {error ? <JacoAlert severity="error">{error}</JacoAlert> : null}
      <ScopeNotice
        canEdit={canEdit}
        pointId={pointId}
        scopeLabel={scopeLabel}
      />
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
      {loaded && view === "classifier" ? (
        <CatalogTree
          nodes={activeNodes}
          stages={activeStages}
          {...treeProps}
        />
      ) : null}
      {loaded && view === "stages" ? (
        <FlatDirectory
          kind="stage"
          nodes={activeNodes}
          {...treeProps}
        />
      ) : null}
      {loaded && view === "solutions" ? (
        <FlatDirectory
          kind="solution"
          nodes={activeNodes}
          {...treeProps}
        />
      ) : null}
      {loaded && inactiveNodes.length ? (
        <>
          <Divider />
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>
                {inactiveView.title} ({inactiveNodes.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {view === "classifier" ? (
                <InactiveCatalogGroups
                  nodes={inactiveNodes}
                  {...treeProps}
                />
              ) : (
                <FlatDirectory
                  kind={view === "stages" ? "stage" : "solution"}
                  nodes={inactiveNodes}
                  {...treeProps}
                  onCreate={null}
                  showHeader={false}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </>
      ) : null}
      {editor ? (
        <CatalogNodeEditor
          state={editor}
          onClose={() => setEditor(null)}
          onSave={(setting) => saveNode(setting, { fromEditor: true })}
          saving={saving}
          error={editorError}
          stages={activeStages}
          nodes={visibleNodes}
          siteCategories={siteCategories}
          scopeLabel={scopeLabel}
        />
      ) : null}
      <CatalogHistory
        node={history}
        api={api}
        withLoading={withLoading}
        onClose={() => setHistory(null)}
      />
    </Stack>
  );
}
