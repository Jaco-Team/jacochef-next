import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import {
  JacoButton,
  JacoCheckboxField,
  JacoCityCafe,
  JacoModal,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import {
  LinksDesktopTable,
  LinksMobileList,
  pointName,
  zoneLabel as formatZoneLabel,
} from "./CafeReviewsLinksPresentational";
import {
  EmptyState,
  formatDateTime,
  sectionTitleSx,
  tableCellSx,
  tableHeadCellSx,
} from "./shared";

const qrModalActionSx = {
  "@media (max-width: 600px)": {
    minWidth: 44,
    px: 1.25,
    "& .qr-action-label": { display: "none" },
    "& .MuiButton-startIcon": { m: 0 },
  },
};

const historyAccordionSx = {
  border: `1px solid ${uiColors.border}`,
  borderRadius: `${uiRadii.lg}px !important`,
  backgroundColor: uiColors.surface,
  overflow: "hidden",
  "&::before": { display: "none" },
};

const historySummarySx = {
  minHeight: 52,
  px: 2,
  "&.Mui-expanded": { minHeight: 52 },
  "& .MuiAccordionSummary-content": { my: 1 },
};

const statusOptions = [
  { id: "active", name: "Активные" },
  { id: "revoked", name: "Отозванные" },
  { id: "all", name: "Все" },
];

const mutedTextSx = { ...uiTypography.body, color: uiColors.text };

function modalActions(children) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1 }}>
      {children}
    </Box>
  );
}

function HistoryTable({ columns, rows, renderRow }) {
  return (
    <TableContainer sx={{ maxHeight: "50dvh" }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={tableHeadCellSx}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-of-type td": { borderBottom: 0 } }}
            >
              {renderRow(row).map((cell, index) => (
                <TableCell
                  key={columns[index]}
                  sx={tableCellSx}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const eventLabels = {
  created: "Создана",
  archived: "Архивирована",
  revoked: "Отозвана",
  deleted: "Удалена",
};

const revokeReasons = [
  { id: "manual", name: "Другая причина" },
  { id: "qr_compromised", name: "QR-код скомпрометирован" },
  { id: "point_closed", name: "Кафе закрыто" },
  { id: "zone_changed", name: "Зона изменена" },
  { id: "incorrect_generation", name: "QR создан ошибочно" },
];

const reasonLabels = {
  manual: "Другая причина",
  qr_compromised: "QR-код скомпрометирован",
  point_closed: "Кафе закрыто",
  zone_changed: "Зона изменена",
  incorrect_generation: "QR создан ошибочно",
  replaced: "Ссылка заменена",
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function CafeReviewsLinks({
  links = [],
  points = [],
  canEdit,
  loading,
  filters,
  onFiltersChange,
  onGenerate,
  onRevoke,
  onLoadHistory,
  onLoadQr,
}) {
  const { withConfirm, ConfirmDialog } = useJacoConfirm();
  const [pointId, setPointId] = useState("");
  const [zoneCode, setZoneCode] = useState("");
  const [zoneLabel, setZoneLabel] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editVariant, setEditVariant] = useState("both");
  const [zoneModalTarget, setZoneModalTarget] = useState(null);
  const [zoneModalHistory, setZoneModalHistory] = useState([]);
  const [zoneModalQrs, setZoneModalQrs] = useState({ stars: null, emoji: null });
  const [zoneModalLoading, setZoneModalLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const historyRequestRef = useRef(0);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("manual");
  const [revokeComment, setRevokeComment] = useState("");

  const pointOptions = useMemo(
    () => points.map((point) => ({ id: point.id, name: point.name })),
    [points],
  );

  const copy = async (value) => {
    if (value && navigator.clipboard) await navigator.clipboard.writeText(value);
  };

  const effectivePointId = points.length === 1 ? points[0].id : pointId;

  const openEdit = (link) => {
    setEditTarget(link);
    setEditVariant(link.ui_variant || "both");
  };

  const openRevokeDialog = (link) => {
    setRevokeTarget(link);
    setRevokeReason("manual");
    setRevokeComment("");
  };

  const submitRevoke = () => {
    if (!revokeTarget) return;

    const comment = revokeComment.trim();
    const reason = comment ? [revokeReason, comment].join(": ").slice(0, 255) : revokeReason;
    const targetId = revokeTarget.id;
    setRevokeTarget(null);
    withConfirm(async () => {
      const revoked = await onRevoke({ id: targetId, reason });
      if (revoked && zoneModalTarget?.id === targetId) {
        setZoneModalTarget(null);
      }
    }, {
      title: "Отозвать QR-ссылку",
      message: "Ссылка перестанет работать, а причина останется в истории.",
      confirmLabel: "Отозвать",
      confirmTone: "danger",
      cancelLabel: "Отмена",
    })();
  };

  const openZoneModal = async (link) => {
    setZoneModalTarget(link);
    setZoneModalHistory([]);
    setZoneModalQrs({ stars: null, emoji: null });
    setZoneModalLoading(true);
    const variants = (link.ui_variant === "both" ? ["stars", "emoji"] : [link.ui_variant]).filter(
      (variant) => link.feedback_urls_by_variant?.[variant],
    );
    const [historyItems, ...qrImages] = await Promise.all([
      onLoadHistory(link),
      ...variants.map((variant) => onLoadQr(link, variant)),
    ]);
    setZoneModalHistory(Array.isArray(historyItems) ? historyItems : []);
    setZoneModalQrs(
      Object.fromEntries(variants.map((variant, index) => [variant, qrImages[index] || null])),
    );
    setZoneModalLoading(false);
  };

  const loadFullHistory = async (query = historyQuery) => {
    const requestId = ++historyRequestRef.current;
    setHistoryLoading(true);
    const items = await onLoadHistory(null, query);
    if (requestId === historyRequestRef.current) {
      setHistory(Array.isArray(items) ? items : []);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!historyExpanded) return undefined;

    const timer = setTimeout(() => {
      loadFullHistory(historyQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [historyExpanded, historyQuery]);

  const printZoneQrs = () => {
    if (!zoneModalTarget || (!zoneModalQrs.stars && !zoneModalQrs.emoji)) return;

    const point = escapeHtml(pointName(points, zoneModalTarget));
    const zone = escapeHtml(
      zoneModalTarget.zone_code || zoneModalTarget.zone_label
        ? `${zoneModalTarget.zone_code || ""}${zoneModalTarget.zone_code && zoneModalTarget.zone_label ? " — " : ""}${zoneModalTarget.zone_label || ""}`
        : "Кафе",
    );
    const qrMarkup = [
      ["stars", zoneModalQrs.stars, "Звёзды"],
      ["emoji", zoneModalQrs.emoji, "Эмоджи"],
    ]
      .filter(([, image]) => image)
      .map(
        ([, image, label]) =>
          `<figure><img src="${image}" alt="QR-код ${label}" /><figcaption>${label}</figcaption></figure>`,
      )
      .join("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document
      .write(`<!doctype html><html lang="ru"><head><meta charset="utf-8" /><title>QR-коды — ${zone}</title><style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #111; font-family: Arial, sans-serif; }
      h1 { margin: 0 0 4mm; font-size: 22pt; }
      p { margin: 0 0 10mm; font-size: 12pt; }
      main { display: flex; flex-wrap: wrap; gap: 12mm; align-items: flex-start; }
      figure { width: 78mm; margin: 0; text-align: center; break-inside: avoid; }
      img { display: block; width: 78mm; height: 78mm; }
      figcaption { margin-top: 3mm; font-size: 13pt; font-weight: 700; }
    </style></head><body><h1>${zone}</h1><p>${point}</p><main>${qrMarkup}</main></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener("load", () => printWindow.print(), { once: true });
  };

  const toggleEditVariant = (variant) => {
    setEditVariant((current) => {
      if (current === "both") return variant === "stars" ? "emoji" : "stars";
      if (current === variant) return variant === "stars" ? "emoji" : "stars";
      return "both";
    });
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    const isCreate = editTarget.create === true;
    const updated = await onGenerate({
      point_id: Number(isCreate ? effectivePointId : editTarget.point_id),
      zone_code: isCreate ? zoneCode.trim() : editTarget.zone_code,
      zone_label: isCreate ? zoneLabel.trim() : editTarget.zone_label || editTarget.zone_code,
      ui_variant: editVariant,
    });
    if (updated) {
      setEditTarget(null);
      if (isCreate) {
        setZoneCode("");
        setZoneLabel("");
      }
    }
  };

  const qrsAvailable = Boolean(zoneModalQrs.stars || zoneModalQrs.emoji);
  const editDisabled =
    !editTarget ||
    !canEdit ||
    loading ||
    !editVariant ||
    (editTarget?.create && (!effectivePointId || !zoneCode.trim()));

  return (
    <>
      <JacoSurface sx={{ p: 2, mb: 2, bgcolor: uiColors.surfaceMuted }}>
        <Grid
          container
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          {points.length > 1 ? (
            <Grid size={{ xs: 12, md: 4 }}>
              <JacoCityCafe
                points={points}
                value={points.filter((point) => String(point.id) === String(filters.point_id))}
                label="Город + кафе"
                placeholder="Все кафе"
                withAll
                withOrganizationMode={false}
                disabled={loading}
                onChange={(value) =>
                  onFiltersChange({ point_id: value?.length === 1 ? value[0].id : "" })
                }
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: points.length > 1 ? 3 : 4 }}>
            <JacoSelect
              label="Статус"
              options={statusOptions}
              value={filters.status}
              allowNone={false}
              onChange={(event) => onFiltersChange({ status: event.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: points.length > 1 ? 3 : 6 }}>
            <JacoTextInput
              type="search"
              label="Зона"
              placeholder="Поиск по названию"
              value={filters.zone_query}
              onChange={(event) => onFiltersChange({ zone_query: event.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <JacoButton
              fullWidth
              startIcon={<QrCode2OutlinedIcon />}
              disabled={!canEdit || loading}
              onClick={() => {
                setEditTarget({ create: true });
                setEditVariant("both");
              }}
            >
              Создать QR
            </JacoButton>
          </Grid>
        </Grid>
      </JacoSurface>

      {links.length === 0 ? (
        <EmptyState>QR-ссылок по выбранному фильтру нет.</EmptyState>
      ) : (
        <>
          <LinksDesktopTable
            links={links}
            points={points}
            canEdit={canEdit}
            loading={loading}
            onOpen={openZoneModal}
            onEdit={openEdit}
            onArchive={openRevokeDialog}
            onCopy={copy}
          />
          <LinksMobileList
            links={links}
            points={points}
            canEdit={canEdit}
            loading={loading}
            onOpen={openZoneModal}
            onEdit={openEdit}
            onArchive={openRevokeDialog}
            onCopy={copy}
          />
        </>
      )}

      <Box sx={{ mt: 3, mb: 4 }}>
      <Accordion
        disableGutters
        elevation={0}
        defaultExpanded={false}
        sx={historyAccordionSx}
        onChange={(_, expanded) => setHistoryExpanded(expanded)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={historySummarySx}
        >
          <Typography sx={sectionTitleSx}>Полная история QR-ссылок</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${uiColors.borderLight}` }}>
          <Box sx={{ p: 2 }}>
            <JacoTextInput
              type="search"
              label="Поиск в истории"
              placeholder="Кафе, зона, событие, пользователь"
              value={historyQuery}
              onChange={(event) => setHistoryQuery(event.target.value)}
              sx={{ maxWidth: 360 }}
            />
          </Box>
          {historyLoading ? (
            <Typography
              role="status"
              sx={{ ...mutedTextSx, px: 2, pb: 2 }}
            >
              Загрузка истории…
            </Typography>
          ) : history.length === 0 ? (
            <Typography
              role="status"
              sx={{ ...mutedTextSx, px: 2, pb: 3, textAlign: "center" }}
            >
              История пока пуста.
            </Typography>
          ) : (
            <HistoryTable
              columns={["Дата", "Кафе", "Зона", "Событие", "Ссылка", "Пользователь", "Причина"]}
              rows={history}
              renderRow={(event) => [
                formatDateTime(event.created_at),
                event.point_name || event.city_name || "—",
                formatZoneLabel(event),
                eventLabels[event.event_type] || event.event_type,
                <Typography
                  key="code"
                  component="code"
                  sx={{ fontSize: 13, wordBreak: "break-all" }}
                >
                  {event.short_code || event.token_hash || event.short_code_hash || "—"}
                </Typography>,
                event.actor_name || event.actor_id || "—",
                reasonLabels[event.reason] || event.reason || "—",
              ]}
            />
          )}
        </AccordionDetails>
      </Accordion>
      </Box>

      <JacoModal
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Отозвать QR-ссылку"
        maxWidth="xs"
        actions={modalActions(
          <>
            <JacoButton
              tone="secondary"
              onClick={() => setRevokeTarget(null)}
            >
              Отмена
            </JacoButton>
            <JacoButton
              tone="danger"
              startIcon={<BlockOutlinedIcon />}
              onClick={submitRevoke}
              disabled={!canEdit || loading || !revokeTarget}
            >
              Отозвать
            </JacoButton>
          </>,
        )}
      >
        <Stack spacing={2}>
          <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
            {revokeTarget ? `${pointName(points, revokeTarget)} · ${formatZoneLabel(revokeTarget)}` : ""}
          </Typography>
          <JacoSelect
            label="Причина"
            options={revokeReasons}
            value={revokeReason}
            allowNone={false}
            onChange={(event) => setRevokeReason(event.target.value)}
            disabled={loading}
          />
          <JacoTextInput
            label="Комментарий"
            placeholder="Дополнительная причина (необязательно)"
            value={revokeComment}
            onChange={(event) => setRevokeComment(event.target.value)}
            multiline
            minRows={3}
            maxRows={5}
            inputProps={{ maxLength: 255 }}
            disabled={loading}
          />
        </Stack>
      </JacoModal>

      <JacoModal
        open={Boolean(zoneModalTarget)}
        onClose={() => setZoneModalTarget(null)}
        title="QR-зона"
        maxWidth="md"
      >
        <Typography sx={{ ...sectionTitleSx, mb: 0.5 }}>
          {zoneModalTarget ? formatZoneLabel(zoneModalTarget) : ""}
        </Typography>
        <Typography sx={{ ...mutedTextSx, mb: 2 }}>
          {pointName(points, zoneModalTarget || {})}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
            minHeight: 220,
          }}
        >
          {zoneModalLoading ? (
            <Typography
              role="status"
              sx={mutedTextSx}
            >
              Загрузка QR-кодов…
            </Typography>
          ) : qrsAvailable ? (
            ["stars", "emoji"]
              .filter((variant) => zoneModalQrs[variant])
              .map((variant) => (
                <Box
                  key={variant}
                  sx={{ textAlign: "center" }}
                >
                  <JacoSurface sx={{ width: 210, height: 210, p: 1, borderRadius: uiRadii.md }}>
                    <Box
                      component="img"
                      src={zoneModalQrs[variant]}
                      alt={`QR-код ${variant === "stars" ? "звёзды" : "эмоджи"}`}
                      sx={{ display: "block", width: "100%", height: "100%" }}
                    />
                  </JacoSurface>
                  <Typography sx={{ ...uiTypography.bodyMedium, mt: 1, color: uiColors.textStrong }}>
                    {variant === "stars" ? "Звёзды" : "Эмоджи"}
                  </Typography>
                </Box>
              ))
          ) : (
            <Typography sx={{ ...mutedTextSx, textAlign: "center", maxWidth: 420 }}>
              QR-код для этой старой записи недоступен. Создайте новые ссылки для зоны.
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 2 }}>
          <JacoButton
            tone="secondary"
            aria-label="Печать QR"
            startIcon={<PrintOutlinedIcon />}
            disabled={zoneModalLoading || !qrsAvailable}
            onClick={printZoneQrs}
            sx={qrModalActionSx}
          >
            <span className="qr-action-label">Печать</span>
          </JacoButton>
          <JacoButton
            tone="secondary"
            aria-label="Изменить ссылки"
            startIcon={<EditOutlinedIcon />}
            disabled={!canEdit || loading}
            onClick={() => {
              setZoneModalTarget(null);
              openEdit(zoneModalTarget);
            }}
            sx={qrModalActionSx}
          >
            <span className="qr-action-label">Изменить</span>
          </JacoButton>
          {zoneModalTarget?.status === "active" ? (
            <JacoButton
              tone="outlinePrimary"
              aria-label="Отозвать QR-ссылку"
              startIcon={<BlockOutlinedIcon />}
              disabled={!canEdit || loading}
              onClick={() => openRevokeDialog(zoneModalTarget)}
              sx={qrModalActionSx}
            >
              <span className="qr-action-label">Отозвать</span>
            </JacoButton>
          ) : null}
        </Box>
        <Box sx={{ mt: 3 }}>
        <Accordion
          disableGutters
          elevation={0}
          defaultExpanded={false}
          sx={historyAccordionSx}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={historySummarySx}
          >
            <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
              История изменений
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${uiColors.borderLight}` }}>
            {zoneModalHistory.length === 0 ? (
              <Typography
                role="status"
                sx={{ ...mutedTextSx, p: 3, textAlign: "center" }}
              >
                История пока пуста.
              </Typography>
            ) : (
              <HistoryTable
                columns={["Дата", "Событие", "Вариант", "Пользователь", "Причина"]}
                rows={zoneModalHistory}
                renderRow={(event) => [
                  formatDateTime(event.created_at),
                  eventLabels[event.event_type] || event.event_type,
                  event.ui_variant || "—",
                  event.actor_name || event.actor_id || "—",
                  reasonLabels[event.reason] || event.reason || "—",
                ]}
              />
            )}
          </AccordionDetails>
        </Accordion>
        </Box>
      </JacoModal>

      <JacoModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={editTarget?.create ? "Создать QR-ссылки" : "Изменить QR-ссылки"}
        maxWidth="xs"
        actions={modalActions(
          <>
            <JacoButton
              tone="secondary"
              onClick={() => setEditTarget(null)}
            >
              Отмена
            </JacoButton>
            <JacoButton
              onClick={withConfirm(submitEdit, {
                title: editTarget?.create ? "Создать QR-ссылки" : "Перевыпустить QR-ссылки",
                message: editTarget?.create
                  ? "Создать QR-ссылки для этой зоны?"
                  : "Создать новые QR-ссылки и отправить старые в архив?",
                tone: "success",
                confirmLabel: editTarget?.create ? "Создать" : "Сгенерировать",
                confirmTone: "primary",
                cancelLabel: "Отмена",
              })}
              disabled={editDisabled}
            >
              {editTarget?.create ? "Создать" : "Сгенерировать"}
            </JacoButton>
          </>,
        )}
      >
        <Stack spacing={2}>
          {editTarget?.create ? (
            <>
              {points.length > 1 ? (
                <JacoSelect
                  label="Кафе"
                  options={pointOptions}
                  value={pointId}
                  allowNone={false}
                  onChange={(event) => setPointId(event.target.value)}
                  disabled={!canEdit || loading}
                />
              ) : (
                <Typography sx={{ ...uiTypography.body, color: uiColors.textStrong }}>
                  Кафе: <strong>{pointName(points, { point_id: effectivePointId })}</strong>
                </Typography>
              )}
              <JacoTextInput
                label="Код зоны"
                value={zoneCode}
                onChange={(event) => setZoneCode(event.target.value)}
                disabled={!canEdit || loading}
                inputProps={{ maxLength: 64, pattern: "[A-Za-z0-9_\\-]+" }}
              />
              <JacoTextInput
                label="Название зоны"
                value={zoneLabel}
                onChange={(event) => setZoneLabel(event.target.value)}
                disabled={!canEdit || loading}
                inputProps={{ maxLength: 128 }}
              />
            </>
          ) : (
            <>
              <Typography sx={{ ...uiTypography.body, color: uiColors.textStrong }}>
                Зона:{" "}
                <strong>
                  {editTarget?.zone_code} — {editTarget?.zone_label || "—"}
                </strong>
              </Typography>
              <Typography sx={mutedTextSx}>
                После подтверждения текущие ссылки будут архивированы, а для зоны создадутся новые.
              </Typography>
            </>
          )}
          <Box>
            <Typography sx={{ ...uiTypography.label, color: uiColors.text, mb: 0.5 }}>
              Варианты формы
            </Typography>
            <Stack spacing={0.5}>
              <JacoCheckboxField
                label="Звёзды"
                checked={editVariant === "stars" || editVariant === "both"}
                onChange={() => toggleEditVariant("stars")}
              />
              <JacoCheckboxField
                label="Эмоджи"
                checked={editVariant === "emoji" || editVariant === "both"}
                onChange={() => toggleEditVariant("emoji")}
              />
            </Stack>
          </Box>
        </Stack>
      </JacoModal>
      <ConfirmDialog />
    </>
  );
}
