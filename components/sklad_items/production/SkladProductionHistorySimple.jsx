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
  Stack,
  Typography,
} from "@mui/material";
import useSkladApi from "../useSkladApi";
import { previousEffectiveRevision, snapshotFieldRows } from "../history/SkladEmbeddedHistoryTable";
import { collectVisibleChanges } from "../history/historyChangeSummary.mjs";
import { formatRevisionSavedAt, revisionSavedAt } from "../history/revisionSavedAt.mjs";

const keyOf = (row) => String(row?.revision_key || row?.history_id || "");
const displayChange = (value) => (value == null || value === "" ? "—" : String(value));
const specialRevisionStatus = {
  scheduled: "Запланирована",
  cancelled: "Отменена",
  superseded: "Заменена",
};
const fieldPermission = {
  name: "name",
  shelf_life: "shelf_life",
  ed_izmer: "unit",
  two_user: "two_user",
  show_in_rev: "show_in_rev",
  date_start: "date_start",
  date_end: "date_end",
  time_min: "time",
  time_min_dop: "dop_time",
  apps: "apps",
  storages: "storages",
  categories: "categories",
  allergens: "allergens",
  allergens_possible: "allergens_diff",
  structure: "structure",
  items: "items",
  all_w_brutto: "items",
  all_w_netto: "items",
  all_w: "items",
  is_show: "activity",
};

function createLoader(api, entityType, entityId) {
  const cache = new Map();
  const queue = [];
  let running = 0;
  let active = true;
  function pump() {
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
  }
  return {
    activate() {
      active = true;
      pump();
    },
    deactivate() {
      active = false;
      while (queue.length) queue.shift().reject(new Error("Загрузка отменена"));
    },
    get(row) {
      const key = keyOf(row);
      if (row.snapshot) return Promise.resolve(row.snapshot);
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
              const snapshot = response?.revision?.snapshot || response?.data?.revision?.snapshot;
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

function HistoryDay({ title, rows, allRows, entityId, entityType, access, loader }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ loading: false, error: "", snapshots: {} });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!expanded || !entityId) return undefined;
    let active = true;
    const needed = new Map();
    rows.forEach((row) => {
      [row, previousEffectiveRevision(allRows, row)]
        .filter(Boolean)
        .forEach((item) => needed.set(keyOf(item), item));
    });
    setState({ loading: true, error: "", snapshots: {} });
    Promise.all([...needed].map(async ([key, row]) => [key, await loader.get(row)]))
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

  const visibleRows = (snapshot) =>
    snapshotFieldRows(snapshot, entityType).filter(({ field }) => {
      const permission = fieldPermission[field];
      return (
        permission &&
        (Number(access?.[`production_${permission}_view`]) === 1 ||
          Number(access?.[`production_${permission}_edit`]) === 1)
      );
    });

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
            action={<Button onClick={() => setAttempt((value) => value + 1)}>Повторить</Button>}
          >
            {state.error}
          </Alert>
        )}
        {!state.loading && !state.error && rows.some((row) => row.revision_status === "legacy") && (
          <Alert severity="info">
            В старых версиях названия справочников могут отображаться в текущем состоянии.
          </Alert>
        )}
        {!state.loading &&
          !state.error &&
          rows.map((row) => {
            const previous = previousEffectiveRevision(allRows, row);
            const currentSnapshot = state.snapshots[keyOf(row)];
            const previousSnapshot = state.snapshots[keyOf(previous)];
            const changes =
              currentSnapshot && previousSnapshot
                ? collectVisibleChanges(visibleRows(currentSnapshot), visibleRows(previousSnapshot))
                : [];
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
                  {specialRevisionStatus[row.revision_status]
                    ? ` · ${specialRevisionStatus[row.revision_status]}`
                    : ""}
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
                    {changes.map((change) => (
                      <Typography
                        key={change.field}
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        <strong>{change.label}:</strong> {displayChange(change.from)} →{" "}
                        {displayChange(change.to)}
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

export default function SkladProductionHistorySimple({ history, access }) {
  const api = useSkladApi();
  const rows = useMemo(
    () => (Array.isArray(history?.rows) ? history.rows.filter(Boolean) : []),
    [history],
  );
  const entityType = history?.meta?.entity_type || rows[0]?.entity_type || "";
  const entityId = history?.meta?.entity_id || rows[0]?.entity_id || null;
  const loader = useMemo(
    () => createLoader(api, entityType, entityId),
    [api, entityType, entityId],
  );
  useEffect(() => {
    loader.activate();
    return () => loader.deactivate();
  }, [loader]);
  const groups = useMemo(() => {
    const result = new Map();
    [...rows]
      .sort(
        (a, b) =>
          (revisionSavedAt(b) ? dayjs(revisionSavedAt(b)).valueOf() : 0) -
          (revisionSavedAt(a) ? dayjs(revisionSavedAt(a)).valueOf() : 0),
      )
      .forEach((row) => {
        const savedAt = revisionSavedAt(row);
        const label = savedAt ? dayjs(savedAt).format("DD.MM.YYYY") : "Дата сохранения неизвестна";
        if (!result.has(label)) result.set(label, []);
        result.get(label).push(row);
      });
    return [...result].map(([title, items]) => ({ title, rows: items }));
  }, [rows]);
  if (!rows.length)
    return <Typography color="text.secondary">История изменений отсутствует.</Typography>;
  if (!entityId || !entityType) return <Alert severity="error">Данные истории недоступны.</Alert>;
  return groups.map((group) => (
    <HistoryDay
      key={group.title}
      title={group.title}
      rows={group.rows}
      allRows={rows}
      entityId={entityId}
      entityType={entityType}
      access={access}
      loader={loader}
    />
  ));
}
