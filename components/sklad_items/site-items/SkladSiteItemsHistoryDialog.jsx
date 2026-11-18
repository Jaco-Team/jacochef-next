"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import useSkladApi from "../useSkladApi";
import { revisionSavedAt, formatRevisionSavedAt } from "../history/revisionSavedAt.mjs";
import {
  buildHistoryComparison,
  canViewHistoryField,
  compositionSections,
  compositionTotals,
  formatHistoryValue,
  historySections,
} from "./skladSiteItemsHistoryModel";
import SkladSiteItemsHistoryExtendedDialog from "./SkladSiteItemsHistoryExtendedDialog";

const keyOf = (row) => String(row?.revision_key || row?.history_id || "");
const snapshotOf = (response) =>
  response?.revision?.snapshot || response?.data?.revision?.snapshot || null;
// Values in the legacy snapshots originate from FLOAT columns. Recover the
// shortest decimal that round-trips to the stored float32, without rounding
// away distinctions that the database can represent.
function floatDisplay(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  const stored = Math.fround(number);
  for (let digits = 1; digits <= 9; digits += 1) {
    const candidate = Number(stored.toPrecision(digits));
    if (Math.fround(candidate) === stored) return String(candidate).replace(".", ",");
  }
  return String(stored).replace(".", ",");
}
const floatFields = new Set([
  "weight",
  "protein",
  "fat",
  "carbohydrates",
  "kkal",
  "all_w_brutto",
  "all_w_netto",
  "all_w",
]);
function fieldValue(field, snapshot) {
  return floatFields.has(field.key)
    ? floatDisplay(snapshot?.[field.key])
    : formatHistoryValue(field, snapshot);
}

function createSnapshotLoader(api, entityType, entityId) {
  const cache = new Map();
  const queue = [];
  let running = 0;
  let active = true;
  const pump = () => {
    while (active && running < 4 && queue.length) {
      const job = queue.shift();
      running += 1;
      Promise.resolve()
        .then(job.run)
        .then(job.resolve, job.reject)
        .finally(() => {
          running -= 1;
          pump();
        });
    }
  };
  return {
    activate() {
      active = true;
      pump();
    },
    deactivate() {
      active = false;
      while (queue.length) queue.shift().reject(new Error("Загрузка отменена"));
    },
    get(key, item) {
      if (item.snapshot) return Promise.resolve(item.snapshot);
      if (!cache.has(key)) {
        const pending = new Promise((resolve, reject) => {
          queue.push({
            resolve,
            reject,
            run: async () => {
              const response = await api.historyGetOne({
                entity_type: entityType,
                entity_id: entityId,
                revision_key: key,
              });
              if (!response?.st)
                throw new Error(response?.text || "Не удалось загрузить изменения");
              const snapshot = snapshotOf(response);
              if (!snapshot) throw new Error("Данные версии недоступны");
              return snapshot;
            },
          });
          pump();
        });
        cache.set(key, pending);
        pending.catch(() => {
          if (cache.get(key) === pending) cache.delete(key);
        });
      }
      return cache.get(key);
    },
  };
}

function HistoryDay({ title, rows, allRows, entityId, access, loader }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ loading: false, error: "", snapshots: {} });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!expanded || !entityId) return undefined;
    let active = true;
    const needed = new Map();
    rows.forEach((row) => {
      const index = allRows.findIndex((item) => keyOf(item) === keyOf(row));
      const previous =
        allRows.find((item) => keyOf(item) === String(row.previous_revision_key || "")) ||
        allRows
          .slice(index + 1)
          .find((item) => !["cancelled", "superseded"].includes(item.revision_status || "legacy"));
      [row, previous].filter(Boolean).forEach((item) => needed.set(keyOf(item), item));
    });
    setState({ loading: true, error: "", snapshots: {} });
    Promise.all([...needed].map(async ([key, item]) => [key, await loader.get(key, item)]))
      .then((entries) => {
        if (active) setState({ loading: false, error: "", snapshots: Object.fromEntries(entries) });
      })
      .catch((error) => {
        if (active)
          setState({
            loading: false,
            error: error?.message || "Не удалось загрузить изменения",
            snapshots: {},
          });
      });
    return () => {
      active = false;
    };
  }, [expanded, entityId, rows, allRows, loader, attempt]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, value) => setExpanded(value)}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>
          {title} · {rows.length}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {state.loading && <CircularProgress size={24} />}
        {state.error && (
          <Alert
            severity="error"
            action={<Button onClick={() => setAttempt((n) => n + 1)}>Повторить</Button>}
          >
            {state.error}
          </Alert>
        )}
        {!state.loading &&
          !state.error &&
          rows.map((row) => {
            const index = allRows.findIndex((item) => keyOf(item) === keyOf(row));
            const previous =
              allRows.find((item) => keyOf(item) === String(row.previous_revision_key || "")) ||
              allRows
                .slice(index + 1)
                .find(
                  (item) => !["cancelled", "superseded"].includes(item.revision_status || "legacy"),
                );
            const currentSnapshot = state.snapshots[keyOf(row)];
            const previousSnapshot = state.snapshots[keyOf(previous)];
            const comparison = buildHistoryComparison(currentSnapshot, previousSnapshot);
            const changes =
              currentSnapshot && previousSnapshot
                ? [...historySections.flatMap((section) => section.fields), ...compositionTotals]
                    .filter(
                      (field) =>
                        canViewHistoryField(access, field) &&
                        comparison.changedFields.has(field.key) &&
                        fieldValue(field, previousSnapshot) !== fieldValue(field, currentSnapshot),
                    )
                    .map((field) => ({
                      label: field.label,
                      from: fieldValue(field, previousSnapshot),
                      to: fieldValue(field, currentSnapshot),
                    }))
                : [];
            if (
              currentSnapshot &&
              previousSnapshot &&
              canViewHistoryField(access, { access: "composition" })
            )
              compositionSections.forEach((section) => {
                const collection = comparison.collections[section.key];
                if (
                  collection.removed.length ||
                  collection.rows.some(
                    (item) => item.historyStatus && item.historyStatus !== "unchanged",
                  )
                )
                  changes.push({
                    label: section.title,
                    from: "Предыдущий состав",
                    to: "Состав изменён",
                  });
              });
            return (
              <Box
                key={keyOf(row)}
                sx={{
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Typography variant="subtitle2">
                  Время сохранения: {formatRevisionSavedAt(row)} · Изменил:{" "}
                  {row.changed_by || "неизвестно"}
                </Typography>
                {!currentSnapshot ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Данные версии недоступны.
                  </Typography>
                ) : !previousSnapshot ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Нет предыдущей версии для сравнения.
                  </Typography>
                ) : !changes.length ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    В доступных полях изменений не найдено.
                  </Typography>
                ) : (
                  <Stack
                    spacing={0.5}
                    sx={{ mt: 0.5 }}
                  >
                    {changes.map((change, i) => (
                      <Typography
                        key={`${change.label}-${i}`}
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        <strong>{change.label}:</strong> {String(change.from ?? "—")} →{" "}
                        {String(change.to ?? "—")}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
      </AccordionDetails>
    </Accordion>
  );
}

export default function SkladSiteItemsHistoryDialog(props) {
  const { open, onClose, history, itemName, fullScreen, access } = props;
  const api = useSkladApi();
  const [extended, setExtended] = useState(false);
  const rows = useMemo(
    () => (Array.isArray(history?.rows) ? history.rows.filter(Boolean) : []),
    [history],
  );
  const entityType = history?.meta?.entity_type || rows[0]?.entity_type || "site_item";
  const entityId = history?.meta?.entity_id || rows[0]?.entity_id || null;
  const loader = useMemo(
    () => createSnapshotLoader(api, entityType, entityId),
    [api, entityType, entityId, open],
  );
  useEffect(() => {
    if (open) loader.activate();
    return () => loader.deactivate();
  }, [loader, open]);
  const groups = useMemo(() => {
    const result = new Map();
    [...rows]
      .sort(
        (a, b) =>
          (revisionSavedAt(b) ? dayjs(revisionSavedAt(b)).valueOf() : 0) -
          (revisionSavedAt(a) ? dayjs(revisionSavedAt(a)).valueOf() : 0),
      )
      .forEach((row) => {
        const timestamp = revisionSavedAt(row);
        const label = timestamp
          ? dayjs(timestamp).format("DD.MM.YYYY")
          : "Дата сохранения неизвестна";
        if (!result.has(label)) result.set(label, []);
        result.get(label).push(row);
      });
    return [...result].map(([title, items]) => ({ title, rows: items }));
  }, [rows]);
  useEffect(() => {
    if (!open) setExtended(false);
  }, [open]);
  if (extended)
    return (
      <SkladSiteItemsHistoryExtendedDialog
        {...props}
        onClose={() => setExtended(false)}
      />
    );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>История изменений{itemName ? `: ${itemName}` : ""}</DialogTitle>
      <DialogContent dividers>
        {!rows.length ? (
          <Typography color="text.secondary">История изменений отсутствует.</Typography>
        ) : (
          groups.map((group) => (
            <HistoryDay
              key={group.title}
              title={group.title}
              rows={group.rows}
              allRows={rows}
              entityId={entityId}
              access={access}
              loader={loader}
            />
          ))
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExtended(true)}>Расширенная история</Button>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
