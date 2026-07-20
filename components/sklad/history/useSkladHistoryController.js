"use client";

import { useCallback, useMemo } from "react";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import {
  HISTORY_ENTITY_OPTIONS,
  HISTORY_INITIAL_STATE,
  useSkladHistoryStore,
} from "./useSkladHistoryStore";

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function normalizeRows(response) {
  const rawRows = response?.list || response?.versions || response?.revisions || [];

  if (!Array.isArray(rawRows)) {
    return [];
  }

  return rawRows.map((row, index) => ({
    key: String(row?.revision_key || row?.history_id || row?.id || index),
    revisionKey: String(row?.revision_key || row?.history_id || row?.id || ""),
    historyId: row?.history_id ?? row?.id ?? null,
    createdAt: row?.created_at || row?.date_create || row?.created || "",
    dateStart: row?.date_start || "",
    dateEnd: row?.date_end || "",
    operationType: row?.operation_type || row?.operation || row?.type_operation || "",
    source: row?.source || "",
    raw: row,
  }));
}

function getEntityPayload(entityType, entityId) {
  return {
    entity_type: entityType,
    entity_id: Number(entityId),
  };
}

function normalizeRevision(response, revisionKey) {
  return (
    response?.revision ||
    response?.item ||
    response?.data || {
      revision_key: revisionKey,
      snapshot: null,
    }
  );
}

function SnapshotField({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}

function getSnapshotCollections(snapshot) {
  return [
    {
      key: "categories",
      label: "Категории",
      items: Array.isArray(snapshot?.categories) ? snapshot.categories : [],
    },
    {
      key: "tags",
      label: "Теги",
      items: Array.isArray(snapshot?.tags) ? snapshot.tags : [],
    },
    {
      key: "allergens",
      label: "Аллергены",
      items: Array.isArray(snapshot?.allergens) ? snapshot.allergens : [],
    },
    {
      key: "allergens_derived",
      label: "Derived allergens",
      items: Array.isArray(snapshot?.allergens_derived) ? snapshot.allergens_derived : [],
    },
  ]
    .map((section) => ({
      ...section,
      values: section.items
        .map((item) => item?.name || item?.title || item?.label || "")
        .filter(Boolean)
        .slice(0, 8),
    }))
    .filter((section) => section.values.length);
}

function getCompositionPreviewRows(snapshot) {
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];

  return items.slice(0, 6).map((item, index) => ({
    key: String(item?.id || item?.item_id || index),
    name: item?.name || item?.item_name || item?.item?.name || "-",
    brutto: item?.brutto ?? "-",
    netto: item?.netto ?? "-",
    output: item?.res ?? item?.output ?? "-",
    type: item?.type || item?.entity_type || "-",
  }));
}

export default function useSkladHistoryController({ showAlert }) {
  const api = useSkladApi();
  const setShellState = useSkladStore((state) => state.setState);

  const entityType = useSkladHistoryStore((state) => state.entityType);
  const entityId = useSkladHistoryStore((state) => state.entityId);
  const rows = useSkladHistoryStore((state) => state.rows);
  const selectedRevisionKey = useSkladHistoryStore((state) => state.selectedRevisionKey);
  const selectedRevision = useSkladHistoryStore((state) => state.selectedRevision);
  const compareLeftKey = useSkladHistoryStore((state) => state.compareLeftKey);
  const compareRightKey = useSkladHistoryStore((state) => state.compareRightKey);
  const compareResult = useSkladHistoryStore((state) => state.compareResult);
  const setState = useSkladHistoryStore((state) => state.setState);

  const revisionOptions = useMemo(() => {
    return [{ id: "", name: "Выберите ревизию" }].concat(
      rows.map((row) => ({
        id: row.revisionKey,
        name: row.revisionKey
          ? `${row.revisionKey}${row.createdAt ? ` · ${row.createdAt}` : ""}`
          : row.createdAt || "Ревизия",
      })),
    );
  }, [rows]);

  const loadRows = useCallback(async () => {
    if (!entityId) {
      setState(HISTORY_INITIAL_STATE);
      return;
    }

    setShellState({ isLoading: true });

    try {
      const response = await api.historyList(getEntityPayload(entityType, entityId));

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки истории");
      }

      const nextRows = normalizeRows(response);

      setState({
        rows: nextRows,
        selectedRevisionKey: "",
        selectedRevision: null,
        compareLeftKey: nextRows[0]?.revisionKey || "",
        compareRightKey: nextRows[1]?.revisionKey || nextRows[0]?.revisionKey || "",
        compareResult: null,
      });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки истории", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, entityId, entityType, setShellState, setState, showAlert]);

  const openRevision = useCallback(
    async (revisionKey) => {
      if (!entityId || !revisionKey) {
        return;
      }

      setShellState({ isLoading: true });

      try {
        const response = await api.historyGetOne({
          ...getEntityPayload(entityType, entityId),
          revision_key: revisionKey,
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки ревизии");
        }

        setState({
          selectedRevisionKey: revisionKey,
          selectedRevision: normalizeRevision(response, revisionKey),
        });
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки ревизии", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, entityId, entityType, setShellState, setState, showAlert],
  );

  const runCompare = useCallback(async () => {
    if (!entityId || !compareLeftKey || !compareRightKey) {
      return;
    }

    setShellState({ isLoading: true });

    try {
      const response = await api.historyCompare({
        ...getEntityPayload(entityType, entityId),
        left_revision_key: compareLeftKey,
        right_revision_key: compareRightKey,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка сравнения ревизий");
      }

      setState({
        compareResult: response,
      });
    } catch (error) {
      showAlert(error?.message || "Ошибка сравнения ревизий", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    api,
    compareLeftKey,
    compareRightKey,
    entityId,
    entityType,
    setShellState,
    setState,
    showAlert,
  ]);

  const snapshot = selectedRevision?.snapshot || null;
  const compareChanges = Array.isArray(compareResult?.compare?.changes)
    ? compareResult.compare.changes
    : [];

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", xl: "center" }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ width: "100%" }}
          >
            <MySelect
              label="Сущность"
              data={HISTORY_ENTITY_OPTIONS}
              is_none={false}
              value={entityType}
              func={(event) =>
                setState({
                  entityType: event.target.value,
                  entityId: "",
                  ...HISTORY_INITIAL_STATE,
                })
              }
            />

            <MyTextInput
              label="ID сущности"
              placeholder="Например: 10"
              value={entityId}
              func={(event) =>
                setState({
                  entityId: event.target.value.replace(/[^\d]/g, ""),
                  ...HISTORY_INITIAL_STATE,
                })
              }
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent={{ xs: "flex-start", xl: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<HistoryOutlinedIcon />}
              disabled={!entityId}
              onClick={loadRows}
            >
              Загрузить версии
            </Button>
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3 }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            divider={
              <Divider
                flexItem
                orientation="vertical"
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Сущность
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {HISTORY_ENTITY_OPTIONS.find((item) => item.id === entityType)?.name || entityType}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Загружено ревизий
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{rows.length}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Открытая ревизия
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{selectedRevisionKey || "Нет"}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Compare
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {compareResult
                  ? compareResult?.compare?.has_changes
                    ? `Изменения: ${compareResult?.compare?.changes_count || compareChanges.length}`
                    : "Без изменений"
                  : "Не запущен"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Revision key</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell>Действует с</TableCell>
                <TableCell>Действует по</TableCell>
                <TableCell>Операция</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  hover
                  selected={row.revisionKey === selectedRevisionKey}
                >
                  <TableCell>{formatValue(row.revisionKey)}</TableCell>
                  <TableCell>{formatValue(row.createdAt)}</TableCell>
                  <TableCell>{formatValue(row.dateStart)}</TableCell>
                  <TableCell>{formatValue(row.dateEnd)}</TableCell>
                  <TableCell>{formatValue(row.operationType)}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        disabled={!row.revisionKey}
                        onClick={() => openRevision(row.revisionKey)}
                      >
                        Открыть
                      </Button>
                      <Button
                        size="small"
                        variant={compareLeftKey === row.revisionKey ? "contained" : "text"}
                        disabled={!row.revisionKey}
                        onClick={() => setState({ compareLeftKey: row.revisionKey })}
                      >
                        Left
                      </Button>
                      <Button
                        size="small"
                        variant={compareRightKey === row.revisionKey ? "contained" : "text"}
                        disabled={!row.revisionKey}
                        onClick={() => setState({ compareRightKey: row.revisionKey })}
                      >
                        Right
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      {entityId
                        ? "По текущим фильтрам ревизии не найдены."
                        : "Выберите тип сущности и введите ID, чтобы загрузить версии."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3 }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <MySelect
                label="Left revision"
                data={revisionOptions}
                is_none={false}
                value={compareLeftKey}
                func={(event) => setState({ compareLeftKey: event.target.value })}
              />
              <MySelect
                label="Right revision"
                data={revisionOptions}
                is_none={false}
                value={compareRightKey}
                func={(event) => setState({ compareRightKey: event.target.value })}
              />
              <Button
                variant="outlined"
                startIcon={<CompareArrowsOutlinedIcon />}
                disabled={!compareLeftKey || !compareRightKey || compareLeftKey === compareRightKey}
                onClick={runCompare}
              >
                Сравнить
              </Button>
            </Stack>

            {compareChanges.length ? (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                {compareChanges.slice(0, 12).map((change, index) => (
                  <Chip
                    key={`${change?.path || "change"}-${index}`}
                    label={change?.path || `change_${index + 1}`}
                    size="small"
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3 }}
        >
          <Stack spacing={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
            >
              Snapshot preview
            </Typography>

            {selectedRevision ? (
              <GridLikeSnapshot
                snapshot={snapshot}
                revision={selectedRevision}
              />
            ) : (
              <Typography color="text.secondary">
                Откройте ревизию, чтобы увидеть canonical snapshot.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );

  return {
    entityType,
    entityId,
    loadRows,
    content,
  };
}

function GridLikeSnapshot({ snapshot, revision }) {
  const snapshotEntityType = snapshot?.type || revision?.entity_type || revision?.type || "-";
  const mainFields = [
    ["Revision key", revision?.revision_key || revision?.history_id || "-"],
    ["Source", revision?.source || "-"],
    ["Entity type", snapshotEntityType],
    ["Name", snapshot?.name || snapshot?.title || "-"],
    ["Date start", snapshot?.date_start || "-"],
    ["Date end", snapshot?.date_end || "-"],
  ];

  const collections = [
    ["Items", Array.isArray(snapshot?.items) ? snapshot.items.length : null],
    ["Categories", Array.isArray(snapshot?.categories) ? snapshot.categories.length : null],
    ["Tags", Array.isArray(snapshot?.tags) ? snapshot.tags.length : null],
    ["Stages", Array.isArray(snapshot?.stages) ? snapshot.stages.length : null],
  ].filter((item) => item[1] !== null);
  const collectionSections = getSnapshotCollections(snapshot);
  const compositionRows = getCompositionPreviewRows(snapshot);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {mainFields.map(([label, value]) => (
          <SnapshotField
            key={label}
            label={label}
            value={formatValue(value)}
          />
        ))}
      </Box>

      {collections.length ? (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
        >
          {collections.map(([label, count]) => (
            <Chip
              key={label}
              label={`${label}: ${count}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      ) : null}

      {collectionSections.length ? (
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2 }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Связанные наборы</Typography>
            {collectionSections.map((section) => (
              <Stack
                key={section.key}
                spacing={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {section.label}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                >
                  {section.values.map((value) => (
                    <Chip
                      key={`${section.key}-${value}`}
                      label={value}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {compositionRows.length ? (
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2 }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Состав ревизии</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Позиция</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Брутто</TableCell>
                    <TableCell>Нетто</TableCell>
                    <TableCell>Выход</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compositionRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.brutto}</TableCell>
                      <TableCell>{row.netto}</TableCell>
                      <TableCell>{row.output}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
