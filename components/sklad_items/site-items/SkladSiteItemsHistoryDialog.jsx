"use client";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import { SkladEmbeddedImageHistoryTable } from "../history/SkladEmbeddedHistoryTable";
import useSkladApi from "../useSkladApi";
import { canEditAccess } from "./skladSiteItemsAccess";
import { resolveSiteItemImageUrl } from "./siteItemImage";
import {
  buildHistoryComparison,
  canViewHistoryField,
  compositionSections,
  compositionTotals,
  formatCompositionNumber,
  formatHistoryDate,
  formatHistoryTimestamp,
  formatHistoryValue,
  getCompositionRowName,
  historySections,
} from "./skladSiteItemsHistoryModel";

const borderColor = "#E5E5E5";
const mutedBackground = "#F5F5F5";
const textPrimary = "#303030";
const textSecondary = "#686868";
const changedBackground = "#FFF7DC";
const addedBackground = "#EEF8EF";
const removedBackground = "#FDEEEE";

const statusLabels = {
  scheduled: "Запланирована",
  active: "Действует",
  expired: "Завершена",
  cancelled: "Отменена",
  superseded: "Заменена",
  legacy: "Старая история",
};

function revisionKey(row) {
  return String(row?.revision_key || row?.history_id || "");
}

function previousEffectiveRow(rows, selected) {
  if (!selected) return null;
  const explicit = String(selected?.previous_revision_key || "");
  if (explicit) {
    const matched = rows.find((row) => revisionKey(row) === explicit);
    if (matched) return matched;
  }
  const index = rows.findIndex((row) => revisionKey(row) === revisionKey(selected));
  return rows
    .slice(index + 1)
    .find((row) => !["cancelled", "superseded"].includes(row?.revision_status || "legacy"));
}

function snapshotFromResponse(response) {
  return response?.revision?.snapshot || response?.data?.revision?.snapshot || null;
}

function statusColor(status) {
  return {
    active: "success",
    scheduled: "info",
    cancelled: "error",
    superseded: "warning",
  }[status || "legacy"];
}

function FieldCard({ field, snapshot, changed }) {
  const image = field.type === "image" ? snapshot?.[field.key] : null;

  return (
    <Grid size={{ xs: 12, sm: field.multiline ? 12 : 6, lg: field.multiline ? 12 : 4 }}>
      <Box
        sx={{
          height: "100%",
          minHeight: field.multiline ? 104 : 72,
          px: 1.5,
          py: 1.25,
          borderLeft: changed ? "3px solid #F0A000" : "3px solid transparent",
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: changed ? changedBackground : "#FFFFFF",
        }}
      >
        <Typography sx={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>
          {field.label}
        </Typography>
        {field.type === "image" ? (
          image ? (
            <Box
              component="img"
              src={resolveSiteItemImageUrl({ asset_key: image }, image)}
              alt={snapshot?.name || "Изображение товара"}
              sx={{ display: "block", mt: 1, width: 150, height: 150, objectFit: "contain" }}
            />
          ) : (
            <Typography sx={{ mt: 0.75, color: textPrimary }}>Изображение отсутствует</Typography>
          )
        ) : (
          <Typography
            sx={{
              mt: 0.75,
              color: textPrimary,
              fontSize: 15,
              lineHeight: 1.45,
              fontWeight: changed ? 600 : 400,
              whiteSpace: field.multiline ? "pre-wrap" : "normal",
              overflowWrap: "anywhere",
            }}
          >
            {formatHistoryValue(field, snapshot)}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}

function SnapshotSection({ section, comparison, access, onlyChanges }) {
  const fields = section.fields.filter(
    (field) =>
      canViewHistoryField(access, field) &&
      (!onlyChanges || comparison.changedFields.has(field.key) || !comparison.previous),
  );
  if (!fields.length) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor, borderRadius: 2.5, overflow: "hidden", boxShadow: "none" }}
    >
      <Box
        sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderColor}`, bgcolor: mutedBackground }}
      >
        <Typography sx={{ color: textPrimary, fontSize: 16, fontWeight: 700 }}>
          {section.title}
        </Typography>
        <Typography sx={{ mt: 0.25, color: textSecondary, fontSize: 13 }}>
          {section.description}
        </Typography>
      </Box>
      <Grid
        container
        sx={{ p: 1.5 }}
      >
        {fields.map((field) => (
          <FieldCard
            key={field.key}
            field={field}
            snapshot={comparison.current}
            changed={comparison.changedFields.has(field.key)}
          />
        ))}
      </Grid>
    </Paper>
  );
}

function CompositionTable({ title, rows, removed = false, isFinal = false, onlyChanges }) {
  const visibleRows = onlyChanges
    ? rows.filter((row) => row.historyStatus && row.historyStatus !== "unchanged")
    : rows;
  if (!visibleRows.length) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor, borderRadius: 2, overflow: "hidden", boxShadow: "none" }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: mutedBackground,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <TableContainer>
        <Table
          size="small"
          sx={{ minWidth: 760 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Номенклатура</TableCell>
              <TableCell align="right">Брутто</TableCell>
              <TableCell align="right">% ХО</TableCell>
              <TableCell align="right">Нетто</TableCell>
              <TableCell align="right">% ГО</TableCell>
              <TableCell align="right">Выход</TableCell>
              {isFinal ? <TableCell align="center">Добавка</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                key={row.historyKey}
                sx={{
                  bgcolor: removed
                    ? removedBackground
                    : row.historyStatus === "added"
                      ? addedBackground
                      : row.historyStatus === "changed"
                        ? changedBackground
                        : "#FFFFFF",
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{getCompositionRowName(row)}</Typography>
                  {row?.ei_name ? (
                    <Typography sx={{ color: textSecondary, fontSize: 12 }}>
                      {row.ei_name}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.brutto)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.pr_1)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.netto)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.pr_2)}</TableCell>
                <TableCell align="right">{formatCompositionNumber(row?.res)}</TableCell>
                {isFinal ? (
                  <TableCell align="center">{Number(row?.is_add) ? "Да" : "Нет"}</TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function CompositionSection({ comparison, access, onlyChanges }) {
  if (!canViewHistoryField(access, { access: "composition" })) return null;
  const totals = compositionTotals.filter(
    (field) => !onlyChanges || comparison.changedFields.has(field.key) || !comparison.previous,
  );

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor, borderRadius: 2.5, overflow: "hidden", boxShadow: "none" }}
    >
      <Box
        sx={{ px: 2, py: 1.5, bgcolor: mutedBackground, borderBottom: `1px solid ${borderColor}` }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Состав</Typography>
        <Typography sx={{ mt: 0.25, color: textSecondary, fontSize: 13 }}>
          Тайминги, полуфабрикаты и позиции
        </Typography>
      </Box>
      <Stack
        spacing={1.5}
        sx={{ p: 1.5 }}
      >
        {totals.length ? (
          <Grid container>
            {totals.map((field) => (
              <FieldCard
                key={field.key}
                field={field}
                snapshot={comparison.current}
                changed={comparison.changedFields.has(field.key)}
              />
            ))}
          </Grid>
        ) : null}
        {compositionSections.map((section) => {
          const collection = comparison.collections[section.key];
          return (
            <Stack
              key={section.key}
              spacing={1}
            >
              <CompositionTable
                title={section.title}
                rows={collection.rows}
                isFinal={section.isFinal}
                onlyChanges={onlyChanges}
              />
              <CompositionTable
                title={`${section.title}: удалённые позиции`}
                rows={collection.removed}
                removed
                isFinal={section.isFinal}
                onlyChanges={onlyChanges}
              />
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function SkladSiteItemsHistoryDialog({
  open,
  onClose,
  history,
  itemName,
  fullScreen,
  access,
  imageHistory,
  imageAssetKey,
  onRestoreImage,
}) {
  const api = useSkladApi();
  const sourceRows = useMemo(
    () => (Array.isArray(history?.rows) ? history.rows.filter(Boolean) : []),
    [history],
  );
  const entityType = history?.meta?.entity_type || sourceRows[0]?.entity_type || "site_item";
  const entityId = history?.meta?.entity_id || sourceRows[0]?.entity_id || null;
  const [showAll, setShowAll] = useState(false);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("main");
  const [selectedKey, setSelectedKey] = useState("");
  const [snapshots, setSnapshots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolveDate, setResolveDate] = useState("");
  const requestCache = useRef({ entity: "", promises: {} });
  const requestEntity = `${entityType}:${entityId || ""}`;
  if (requestCache.current.entity !== requestEntity) {
    requestCache.current = { entity: requestEntity, promises: {} };
  }

  const rows = useMemo(
    () =>
      sourceRows.filter(
        (row) => showAll || !["cancelled", "superseded"].includes(row?.revision_status || "legacy"),
      ),
    [showAll, sourceRows],
  );
  const selectedIndex = rows.findIndex((row) => revisionKey(row) === selectedKey);
  const selectedRow = rows[selectedIndex] || rows[0] || null;
  const previousRow = previousEffectiveRow(sourceRows, selectedRow);
  const selectedSnapshot = snapshots[revisionKey(selectedRow)] || selectedRow?.snapshot || null;
  const previousSnapshot = snapshots[revisionKey(previousRow)] || previousRow?.snapshot || null;
  const comparison = useMemo(
    () => buildHistoryComparison(selectedSnapshot, previousSnapshot),
    [previousSnapshot, selectedSnapshot],
  );
  const navigation = useMemo(
    () => [
      ...historySections.filter((section) =>
        section.fields.some((field) => canViewHistoryField(access, field)),
      ),
      ...(canViewHistoryField(access, { access: "composition" })
        ? [{ id: "composition", title: "Состав", description: "Тайминги и позиции" }]
        : []),
      ...(canViewHistoryField(access, { access: "dropzone" }) && imageHistory?.rows?.length
        ? [{ id: "images", title: "Изображения", description: "Версии изображения карточки" }]
        : []),
    ],
    [access, imageHistory?.rows?.length],
  );

  useEffect(() => {
    if (!open) return;
    setShowAll(false);
    setOnlyChanges(false);
    setSelectedKey(revisionKey(sourceRows[0]));
    setActiveSection(navigation[0]?.id || "main");
    setSnapshots({});
    setError("");
    setResolveDate("");
  }, [navigation, open, sourceRows]);

  useEffect(() => {
    if (!rows.some((row) => revisionKey(row) === selectedKey)) {
      setSelectedKey(revisionKey(rows[0]));
    }
  }, [rows, selectedKey]);

  useEffect(() => {
    let active = true;
    const candidates = [selectedRow, previousRow].filter(Boolean);
    const missing = candidates.filter(
      (row) => !row?.snapshot && snapshots[revisionKey(row)] === undefined,
    );
    if (!open || !entityId || !missing.length) return undefined;

    setLoading(true);
    setError("");
    Promise.all(
      missing.map(async (row) => {
        const key = revisionKey(row);
        requestCache.current.promises[key] ||= api.historyGetOne({
          entity_type: entityType,
          entity_id: entityId,
          revision_key: key,
        });
        const response = await requestCache.current.promises[key];
        if (!response?.st) throw new Error(response?.text || "Не удалось загрузить версию");
        return [key, snapshotFromResponse(response)];
      }),
    )
      .then((loaded) => {
        if (active) setSnapshots((current) => ({ ...current, ...Object.fromEntries(loaded) }));
      })
      .catch((requestError) => {
        if (active) setError(requestError?.message || "Не удалось загрузить версию");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [api, entityId, entityType, open, previousRow, selectedRow, snapshots]);

  const resolveOnDate = async () => {
    if (!resolveDate || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.historyResolve({
        entity_type: entityType,
        entity_id: entityId,
        date: resolveDate,
      });
      if (!response?.st) throw new Error(response?.text || "Версия на дату не найдена");
      const revision = response?.revision || response?.data?.revision;
      const key = revisionKey(revision);
      if (key) {
        setSnapshots((current) => ({ ...current, [key]: revision?.snapshot || null }));
        setSelectedKey(key);
      }
    } catch (requestError) {
      setError(requestError?.message || "Версия на дату не найдена");
    } finally {
      setLoading(false);
    }
  };

  const selectRelative = (direction) => {
    const nextIndex = selectedIndex + direction;
    if (nextIndex >= 0 && nextIndex < rows.length) setSelectedKey(revisionKey(rows[nextIndex]));
  };

  const currentSection = historySections.find((section) => section.id === activeSection);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen={fullScreen}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: { xs: "100%", xl: 1380 },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, md: 2.5 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          px: { xs: 1.5, md: 2.5 },
          py: 1.5,
          bgcolor: mutedBackground,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: textSecondary,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              История изменений
            </Typography>
            <Typography
              component="h2"
              sx={{ mt: 0.4, color: textPrimary, fontSize: { xs: 20, md: 24 }, fontWeight: 700 }}
            >
              История версий{itemName ? `: ${itemName}` : ""}
            </Typography>
          </Box>
          <IconButton
            aria-label="Закрыть"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.25, md: 2.5 }, bgcolor: "#FAFAFA" }}>
        {!sourceRows.length ? (
          <Alert severity="info">История изменений отсутствует.</Alert>
        ) : (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Paper
              variant="outlined"
              sx={{ borderColor, borderRadius: 2.5, overflow: "hidden", boxShadow: "none" }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Сохранения</Typography>
                  <Typography sx={{ mt: 0.25, color: textSecondary, fontSize: 13 }}>
                    Выберите строку, чтобы открыть полное состояние карточки.
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAll}
                      onChange={(event) => setShowAll(event.target.checked)}
                    />
                  }
                  label="Показывать отменённые и заменённые"
                />
              </Stack>

              <Box sx={{ display: { xs: "block", md: "none" }, p: 1.5 }}>
                <Select
                  fullWidth
                  size="small"
                  value={revisionKey(selectedRow)}
                  onChange={(event) => setSelectedKey(event.target.value)}
                >
                  {rows.map((row) => (
                    <MenuItem
                      key={revisionKey(row)}
                      value={revisionKey(row)}
                    >
                      {formatHistoryTimestamp(row?.changed_at)} ·{" "}
                      {formatHistoryDate(row?.effective_date_start)}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <TableContainer sx={{ display: { xs: "none", md: "block" }, maxHeight: 260 }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label="Список сохранений товара сайта"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Сохранено</TableCell>
                      <TableCell>Автор</TableCell>
                      <TableCell>Действует с</TableCell>
                      <TableCell>Действует по</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={revisionKey(row)}
                        hover
                        selected={revisionKey(row) === revisionKey(selectedRow)}
                        onClick={() => setSelectedKey(revisionKey(row))}
                        sx={{ cursor: "pointer", "&.Mui-selected": { bgcolor: changedBackground } }}
                      >
                        <TableCell>{formatHistoryTimestamp(row?.changed_at)}</TableCell>
                        <TableCell>{row?.changed_by || "Неизвестно"}</TableCell>
                        <TableCell>{formatHistoryDate(row?.effective_date_start)}</TableCell>
                        <TableCell>{formatHistoryDate(row?.effective_date_end)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={statusColor(row?.revision_status)}
                            label={
                              statusLabels[row?.revision_status || "legacy"] || row?.revision_status
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.25}
                sx={{
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                  p: 1.5,
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                >
                  <Button
                    startIcon={<NavigateBeforeIcon />}
                    disabled={selectedIndex >= rows.length - 1}
                    onClick={() => selectRelative(1)}
                  >
                    Предыдущий период
                  </Button>
                  <Button
                    endIcon={<NavigateNextIcon />}
                    disabled={selectedIndex <= 0}
                    onClick={() => selectRelative(-1)}
                  >
                    Следующий период
                  </Button>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                >
                  <TextField
                    size="small"
                    type="date"
                    label="Состояние на дату"
                    value={resolveDate}
                    onChange={(event) => setResolveDate(event.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                  <Button
                    variant="outlined"
                    disabled={!resolveDate || loading}
                    onClick={resolveOnDate}
                  >
                    Показать
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              sx={{
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
              }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  size="small"
                  label={
                    selectedRow?.revision_status === "legacy"
                      ? "Старая история"
                      : "Выбранная версия"
                  }
                />
                {comparison.previous ? (
                  <>
                    <Chip
                      size="small"
                      label="Изменено"
                      sx={{ bgcolor: changedBackground }}
                    />
                    <Chip
                      size="small"
                      label="Добавлено"
                      sx={{ bgcolor: addedBackground }}
                    />
                    <Chip
                      size="small"
                      label="Удалено"
                      sx={{ bgcolor: removedBackground }}
                    />
                  </>
                ) : (
                  <Chip
                    size="small"
                    label="Нет предыдущей версии"
                  />
                )}
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyChanges}
                    disabled={!comparison.previous}
                    onChange={(event) => setOnlyChanges(event.target.checked)}
                  />
                }
                label="Только изменения"
              />
            </Stack>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
              <Box
                sx={{
                  display: { xs: "flex", lg: "none" },
                  gap: 1,
                  overflowX: "auto",
                  pb: 0.5,
                }}
              >
                {navigation.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "outlined" : "text"}
                    onClick={() => setActiveSection(section.id)}
                    sx={{ flexShrink: 0 }}
                  >
                    {section.title}
                  </Button>
                ))}
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  display: { xs: "none", lg: "block" },
                  width: 250,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  p: 1.25,
                  borderColor,
                  borderRadius: 2.5,
                  bgcolor: mutedBackground,
                }}
              >
                <Typography sx={{ px: 1, pb: 1, fontSize: 16, fontWeight: 700 }}>
                  Разделы
                </Typography>
                <Stack spacing={0.75}>
                  {navigation.map((section) => (
                    <Button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      sx={{
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        px: 1.25,
                        py: 1,
                        color: textPrimary,
                        bgcolor: activeSection === section.id ? "#FFFFFF" : "transparent",
                        border: `1px solid ${activeSection === section.id ? "#DD1A32" : "transparent"}`,
                        textAlign: "left",
                        textTransform: "none",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{section.title}</Typography>
                        <Typography sx={{ mt: 0.25, color: textSecondary, fontSize: 12 }}>
                          {section.description}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Stack>
              </Paper>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {loading && !comparison.current ? (
                  <Stack
                    sx={{
                      alignItems: "center",
                      py: 8,
                    }}
                  >
                    <CircularProgress />
                  </Stack>
                ) : activeSection === "composition" ? (
                  <CompositionSection
                    comparison={comparison}
                    access={access}
                    onlyChanges={onlyChanges}
                  />
                ) : activeSection === "images" ? (
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderColor, borderRadius: 2.5, boxShadow: "none" }}
                  >
                    <SkladEmbeddedImageHistoryTable
                      imageHistory={{
                        ...imageHistory,
                        rows: (imageHistory?.rows || []).map((row) => ({
                          ...row,
                          can_restore:
                            Boolean(row?.can_restore) && canEditAccess(access, "dropzone", false),
                        })),
                      }}
                      imageAssetKey={imageAssetKey}
                      onRestoreImage={onRestoreImage}
                    />
                  </Paper>
                ) : currentSection && comparison.current ? (
                  <SnapshotSection
                    section={currentSection}
                    comparison={comparison}
                    access={access}
                    onlyChanges={onlyChanges}
                  />
                ) : (
                  <Alert severity="info">Полный снимок выбранной версии недоступен.</Alert>
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${borderColor}` }}>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
