import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  DialogActions,
  DialogContent,
  Grid,
  Paper,
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
import { MySelect, MyTextInput } from "@/ui/Forms";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import MyModal from "@/ui/MyModal";
import { useConfirm } from "@/src/hooks/useConfirm";
import {
  linkUrl,
  LinksDesktopTable,
  LinksMobileList,
  pointName,
  zoneLabel,
} from "./CafeReviewsLinksPresentational";
import {
  accordionHeaderBackground,
  blockBorder,
  brandRed,
  EmptyState,
  formatDateTime,
  textSecondary,
  white,
} from "./shared";

const actionButtonSx = { minHeight: 40, borderRadius: "8px", textTransform: "none" };
const qrModalActionSx = {
  ...actionButtonSx,
  "@media (max-width: 600px)": {
    minWidth: 40,
    px: 1,
    "& .qr-action-label": { display: "none" },
    "& .MuiButton-startIcon": { m: 0 },
  },
};

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
  const { withConfirm, ConfirmDialog } = useConfirm();
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
    }, "Отозвать QR-ссылку? Она перестанет работать, а причина останется в истории.")();
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

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: "12px", mb: 2 }}
      >
        <Grid
          container
          spacing={1.5}
        >
          {points.length > 1 ? (
            <Grid size={{ xs: 12, md: 4 }}>
              <CityCafeAutocomplete2
                points={points}
                value={points.filter((point) => String(point.id) === String(filters.point_id))}
                label="Город + кафе"
                placeholder="Все кафе"
                withAll
                withOrganizationMode={false}
                disabled={loading}
                onChange={(value) =>
                  onFiltersChange({ point_id: value.length === 1 ? value[0].id : "" })
                }
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: points.length > 1 ? 3 : 4 }}>
            <MySelect
              label="Статус"
              data={[
                { id: "active", name: "Активные" },
                { id: "revoked", name: "Отозванные" },
                { id: "all", name: "Все" },
              ]}
              value={filters.status}
              func={(event) => onFiltersChange({ status: event.target.value })}
              is_none={false}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: points.length > 1 ? 3 : 6 }}>
            <MyTextInput
              type="search"
              label="Зона"
              placeholder="Поиск по названию"
              value={filters.zone_query}
              func={(event) => onFiltersChange({ zone_query: event.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<QrCode2OutlinedIcon />}
              disabled={!canEdit || loading}
              onClick={() => {
                setEditTarget({ create: true });
                setEditVariant("both");
              }}
              sx={actionButtonSx}
            >
              Создать QR
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {links.length === 0 ? (
        <EmptyState>QR-ссылок по выбранному фильтру нет.</EmptyState>
      ) : (
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
      )}

      {links.length > 0 ? (
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
      ) : null}

      <MyModal
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Отозвать QR-ссылку"
        maxWidth="xs"
      >
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>
            {revokeTarget ? pointName(points, revokeTarget) : ""}
          </Typography>
          <Grid
            container
            spacing={1.5}
          >
            <Grid size={12}>
              <MySelect
                label="Причина"
                data={revokeReasons}
                value={revokeReason}
                func={(event) => setRevokeReason(event.target.value)}
                is_none={false}
                disabled={loading}
              />
            </Grid>
            <Grid size={12}>
              <MyTextInput
                label="Комментарий"
                placeholder="Дополнительная причина (необязательно)"
                value={revokeComment}
                func={(event) => setRevokeComment(event.target.value)}
                multiline
                minRows={3}
                maxRows={5}
                inputProps={{ maxLength: 255 }}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setRevokeTarget(null)}
            sx={actionButtonSx}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            startIcon={<BlockOutlinedIcon />}
            onClick={submitRevoke}
            disabled={!canEdit || loading || !revokeTarget}
            sx={{
              ...actionButtonSx,
              bgcolor: brandRed,
              "&:hover": { bgcolor: "#B51629" },
            }}
          >
            Отозвать
          </Button>
        </DialogActions>
      </MyModal>

      <MyModal
        open={Boolean(zoneModalTarget)}
        onClose={() => setZoneModalTarget(null)}
        title="QR-зона"
        maxWidth="md"
      >
        <DialogContent>
          <Typography
            fontWeight={700}
            sx={{ mb: 0.5 }}
          >
            {zoneModalTarget?.zone_code} — {zoneModalTarget?.zone_label || "—"}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {pointName(points, zoneModalTarget || {})}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              flexWrap: "wrap",
              minHeight: 220,
            }}
          >
            {zoneModalLoading ? (
              <Typography color="text.secondary">Загрузка QR-кодов…</Typography>
            ) : (
              ["stars", "emoji"]
                .filter((variant) => zoneModalQrs[variant])
                .map((variant) => (
                  <Box
                    key={variant}
                    sx={{ textAlign: "center" }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 210,
                        height: 210,
                        p: 1,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: white,
                      }}
                    >
                      <Box
                        component="img"
                        src={zoneModalQrs[variant]}
                        alt={`QR-код ${variant === "stars" ? "звёзды" : "эмоджи"}`}
                        sx={{ display: "block", width: "100%", height: "100%" }}
                      />
                    </Box>
                    <Typography sx={{ mt: 0.75, fontWeight: 700 }}>
                      {variant === "stars" ? "Звёзды" : "Эмоджи"}
                    </Typography>
                  </Box>
                ))
            )}
            {!zoneModalLoading && !zoneModalQrs.stars && !zoneModalQrs.emoji ? (
              <Typography color="text.secondary">
                QR-код для этой старой записи недоступен. Создайте новые ссылки для зоны.
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              aria-label="Печать QR"
              startIcon={<PrintOutlinedIcon />}
              disabled={zoneModalLoading || (!zoneModalQrs.stars && !zoneModalQrs.emoji)}
              onClick={printZoneQrs}
              sx={qrModalActionSx}
            >
              <span className="qr-action-label">Печать</span>
            </Button>
            <Button
              variant="outlined"
              color="error"
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
            </Button>
            {zoneModalTarget?.status === "active" ? (
              <Button
                variant="contained"
                color="error"
                aria-label="Отозвать QR-ссылку"
                startIcon={<BlockOutlinedIcon />}
                disabled={!canEdit || loading}
                onClick={() => openRevokeDialog(zoneModalTarget)}
                sx={qrModalActionSx}
              >
                <span className="qr-action-label">Отозвать</span>
              </Button>
            ) : null}
          </Box>
          <Accordion
            defaultExpanded={false}
            sx={{
              mt: 3,
              mb: 0,
              border: `1px solid ${blockBorder}`,
              borderRadius: "12px !important",
              boxShadow: "none",
              overflow: "hidden",
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: "24px 0 0" },
            }}
          >
            <AccordionSummary
              sx={{
                minHeight: 56,
                bgcolor: accordionHeaderBackground,
                "&.Mui-expanded": { minHeight: 56 },
                "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
              }}
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography fontWeight={700}>История изменений</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${blockBorder}` }}>
              {zoneModalHistory.length === 0 ? (
                <Typography
                  role="status"
                  sx={{ p: 3, textAlign: "center", color: textSecondary }}
                >
                  История пока пуста.
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: "50dvh" }}>
                  <Table
                    size="small"
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Событие</TableCell>
                        <TableCell>Вариант</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Причина</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {zoneModalHistory.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{formatDateTime(event.created_at)}</TableCell>
                          <TableCell>{eventLabels[event.event_type] || event.event_type}</TableCell>
                          <TableCell>{event.ui_variant || "—"}</TableCell>
                          <TableCell>{event.actor_name || event.actor_id || "—"}</TableCell>
                          <TableCell>{reasonLabels[event.reason] || event.reason || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </MyModal>

      <Accordion
        defaultExpanded={false}
        sx={{
          mt: 3,
          mb: 4,
          border: `1px solid ${blockBorder}`,
          borderRadius: "12px !important",
          boxShadow: "none",
          overflow: "hidden",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: "24px 0 32px" },
        }}
        onChange={(_, expanded) => {
          setHistoryExpanded(expanded);
        }}
      >
        <AccordionSummary
          sx={{
            minHeight: 56,
            bgcolor: accordionHeaderBackground,
            "&.Mui-expanded": { minHeight: 56 },
            "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography fontWeight={700}>Полная история QR-ссылок</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, borderTop: `1px solid ${blockBorder}` }}>
          <Grid
            container
            spacing={1.5}
            sx={{ mb: 1.5 }}
          >
            <Grid size={{ xs: 12 }}>
              <MyTextInput
                type="search"
                label="Поиск в истории"
                placeholder="Кафе, зона, событие, пользователь"
                value={historyQuery}
                func={(event) => setHistoryQuery(event.target.value)}
                disabled={historyLoading}
                sx={{ maxWidth: 300 }}
              />
            </Grid>
          </Grid>
          {historyLoading ? (
            <Typography color="text.secondary">Загрузка истории…</Typography>
          ) : history.length === 0 ? (
            <Typography
              role="status"
              sx={{ p: 2, textAlign: "center", color: textSecondary }}
            >
              История пока пуста.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: "50dvh" }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Кафе</TableCell>
                    <TableCell>Зона</TableCell>
                    <TableCell>Событие</TableCell>
                    <TableCell>Ссылка</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Причина</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{formatDateTime(event.created_at)}</TableCell>
                      <TableCell>{event.point_name || event.city_name || "—"}</TableCell>
                      <TableCell>{zoneLabel(event)}</TableCell>
                      <TableCell>{eventLabels[event.event_type] || event.event_type}</TableCell>
                      <TableCell>
                        <Typography
                          component="code"
                          sx={{ fontSize: 13, wordBreak: "break-all" }}
                        >
                          {event.short_code || event.token_hash || event.short_code_hash || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{event.actor_name || event.actor_id || "—"}</TableCell>
                      <TableCell>{reasonLabels[event.reason] || event.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      <MyModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={editTarget?.create ? "Создать QR-ссылки" : "Изменить QR-ссылки"}
        maxWidth="xs"
      >
        <DialogContent>
          {editTarget?.create ? (
            <>
              {points.length > 1 ? (
                <MySelect
                  label="Кафе"
                  data={pointOptions}
                  value={pointId}
                  func={(event) => setPointId(event.target.value)}
                  is_none={false}
                  disabled={!canEdit || loading}
                />
              ) : (
                <Typography sx={{ mb: 1 }}>
                  Кафе: <strong>{pointName(points, { point_id: effectivePointId })}</strong>
                </Typography>
              )}
              <MyTextInput
                label="Код зоны"
                value={zoneCode}
                func={(event) => setZoneCode(event.target.value)}
                disabled={!canEdit || loading}
                inputProps={{ maxLength: 64, pattern: "[A-Za-z0-9_\\-]+" }}
              />
              <MyTextInput
                label="Название зоны"
                value={zoneLabel}
                func={(event) => setZoneLabel(event.target.value)}
                disabled={!canEdit || loading}
                inputProps={{ maxLength: 128 }}
              />
            </>
          ) : (
            <>
              <Typography sx={{ mb: 1 }}>
                Зона:{" "}
                <strong>
                  {editTarget?.zone_code} — {editTarget?.zone_label || "—"}
                </strong>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                После подтверждения текущие ссылки будут архивированы, а для зоны создадутся новые.
              </Typography>
            </>
          )}
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editVariant === "stars" || editVariant === "both"}
                  onChange={() => toggleEditVariant("stars")}
                />
              }
              label="Звёзды"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editVariant === "emoji" || editVariant === "both"}
                  onChange={() => toggleEditVariant("emoji")}
                />
              }
              label="Эмоджи"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setEditTarget(null)}
            sx={actionButtonSx}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={withConfirm(
              submitEdit,
              editTarget?.create
                ? "Создать QR-ссылки для этой зоны?"
                : "Создать новые QR-ссылки и отправить старые в архив?",
            )}
            disabled={
              !editTarget ||
              !canEdit ||
              loading ||
              !editVariant ||
              (editTarget?.create && (!effectivePointId || !zoneCode.trim()))
            }
            sx={actionButtonSx}
          >
            {editTarget?.create ? "Создать" : "Сгенерировать"}
          </Button>
        </DialogActions>
      </MyModal>
      <ConfirmDialog />
    </>
  );
}
