"use client";

import { useCallback, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { JacoButton, JacoSegmentedTabs } from "@/design-system/shared/ui";
import CatalogHistory from "./settings/CatalogHistory";
import CatalogNodeEditor from "./settings/CatalogNodeEditor";
import CatalogTree, { InactiveCatalogGroups } from "./settings/CatalogTree";
import FlatDirectory from "./settings/FlatDirectory";
import { nodesOf, sortNodes } from "./settings/catalogModel.mjs";

const INACTIVE_VIEWS = {
  classifier: { kinds: ["category", "error_type", "error"], title: "Неактивные элементы" },
  stages: { kinds: ["stage"], title: "Неактивные этапы" },
  solutions: { kinds: ["solution"], title: "Неактивные решения" },
};

export default function ComplaintOptionsSettings({ api, pointId, canEdit, withLoading }) {
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
      const response = await withLoading(() =>
        api.getSettings(pointId ? { point_id: Number(pointId) } : {}),
      );
      setSettings(response?.data ?? response ?? { active: [], inactive: [] });
      setLoaded(true);
    } catch {
      setError("Не удалось загрузить варианты решений жалоб.");
    }
  }, [api, pointId]);
  useEffect(() => {
    load();
  }, [load]);

  const activeNodes = settings.active || [];
  const inactiveView = INACTIVE_VIEWS[view];
  const inactiveNodes = (settings.inactive || []).filter((node) =>
    inactiveView.kinds.includes(node.kind),
  );
  const activeStages = sortNodes(nodesOf(activeNodes, "stage"));
  const openEditor = (node, context = {}) => setEditor({ node, context });
  const saveNode = async (setting) => {
    setSaving(true);
    setError("");
    try {
      await withLoading(() =>
        api.saveSetting({ setting }, { throwErrors: true, suppressAuthRedirect: true }),
      );
      setEditor(null);
      await load();
    } catch {
      setError("Не удалось сохранить настройку. Проверьте право на редактирование.");
    } finally {
      setSaving(false);
    }
  };
  const toggle = (node, isActive) =>
    saveNode({ ...node, is_active: isActive, rules: node.rules || {} });
  const edit = canEdit ? (node) => openEditor(node) : null;
  const create = canEdit ? (context) => openEditor(null, context) : null;
  const toggleNode = canEdit ? toggle : null;
  const numericPointId = pointId ? Number(pointId) : null;

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
      {loaded && view === "classifier" ? (
        <CatalogTree
          nodes={activeNodes}
          pointId={numericPointId}
          onEdit={edit}
          onCreate={create}
          onHistory={setHistory}
          onToggle={toggleNode}
        />
      ) : null}
      {loaded && view === "stages" ? (
        <FlatDirectory
          kind="stage"
          nodes={activeNodes}
          pointId={numericPointId}
          onEdit={edit}
          onCreate={create}
          onHistory={setHistory}
          onToggle={toggleNode}
        />
      ) : null}
      {loaded && view === "solutions" ? (
        <FlatDirectory
          kind="solution"
          nodes={activeNodes}
          pointId={numericPointId}
          onEdit={edit}
          onCreate={create}
          onHistory={setHistory}
          onToggle={toggleNode}
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
                  onEdit={canEdit ? openEditor : null}
                  onHistory={setHistory}
                  onToggle={toggleNode}
                />
              ) : (
                <FlatDirectory
                  kind={view === "stages" ? "stage" : "solution"}
                  nodes={inactiveNodes}
                  onEdit={edit}
                  onHistory={setHistory}
                  onToggle={toggleNode}
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
          onSave={saveNode}
          saving={saving}
          error={error}
          stages={activeStages}
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
