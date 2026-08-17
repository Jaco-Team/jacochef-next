import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import { MySelect, MyTextInput } from "@/ui/Forms";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import MyModal from "@/ui/MyModal";
import { useConfirm } from "@/src/hooks/useConfirm";
import { blockBorder, desktopOnlySx, EmptyState, formatDateTime, textSecondary } from "./shared";

const actionButtonSx = { minHeight: 40, borderRadius: "8px", textTransform: "none" };
const linkChipSx = { minHeight: 40, fontWeight: 700 };

const eventLabels = {
  created: "Создана",
  archived: "Архивирована",
  revoked: "Отозвана",
  deleted: "Удалена",
};

function pointName(points, link) {
  return (
    link.point_name ||
    points.find((point) => String(point.id) === String(link.point_id))?.name ||
    `Кафе #${link.point_id}`
  );
}

function linkUrl(link, variant) {
  return link.feedback_urls_by_variant?.[variant] || "";
}

function LinkChip({ link, variant, onCopy }) {
  const url = linkUrl(link, variant);
  if (!url) return null;

  const isStars = variant === "stars";
  const color = isStars ? "#1976D2" : "#2E7D32";
  return (
    <Box
      component="span"
      sx={{
        ...linkChipSx,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: 40,
          px: 0.5,
          borderRadius: "10px",
          bgcolor: color,
          color: "#fff",
        }}
      >
        {isStars ? (
          <StarRoundedIcon sx={{ mx: 0.5 }} />
        ) : (
          <SentimentSatisfiedAltOutlinedIcon sx={{ mx: 0.5 }} />
        )}
        <Tooltip title="Скопировать ссылку">
          <IconButton
            aria-label={`Скопировать ${isStars ? "звёздную" : "эмоджи"} ссылку`}
            onClick={(event) => {
              event.stopPropagation();
              onCopy(url);
            }}
            sx={{ width: 40, height: 40, p: 0, color: "#fff", flexShrink: 0 }}
          >
            <ContentCopyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Tooltip title="Открыть в новой вкладке">
        <IconButton
          component="a"
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="Открыть ссылку"
          onClick={(event) => event.stopPropagation()}
          sx={{
            width: 40,
            height: 40,
            p: 0,
            color: "#fff",
            bgcolor: color,
            borderRadius: "10px",
            flexShrink: 0,
            "&:hover": { bgcolor: color, filter: "brightness(0.9)" },
          }}
        >
          <OpenInNewOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function MobileLinkCard({ link, points, canEdit, loading, onOpen, onEdit, onArchive, onCopy }) {
  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      aria-label={`Открыть QR-зону ${link.zone_label || link.zone_code || "Кафе"}`}
      onClick={() => onOpen(link)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(link);
        }
      }}
      sx={{
        p: 1.5,
        borderRadius: "12px",
        borderColor: blockBorder,
        cursor: "pointer",
        minWidth: 0,
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.light" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
            {pointName(points, link)}
          </Typography>
          <Typography sx={{ color: textSecondary, fontSize: 12 }}>
            {formatDateTime(link.created_at)}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={link.status === "active" ? "Активна" : "Отозвана"}
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            color: link.status === "active" ? "#2E7D32" : textSecondary,
            bgcolor: link.status === "active" ? "#E8F5E9" : "#F6F6F6",
          }}
        />
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <Chip
          size="small"
          label={
            link.zone_code || link.zone_label
              ? `${link.zone_code || ""}${link.zone_code && link.zone_label ? " — " : ""}${link.zone_label || ""}`
              : "Кафе"
          }
          sx={{ fontWeight: 700, bgcolor: "#E8F5E9", color: "#2E7D32", maxWidth: "100%" }}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 0.75, mt: 1.25, minWidth: 0 }}>
        {linkUrl(link, "stars") ? (
          <LinkChip
            link={link}
            variant="stars"
            onCopy={onCopy}
          />
        ) : null}
        {linkUrl(link, "emoji") ? (
          <LinkChip
            link={link}
            variant="emoji"
            onCopy={onCopy}
          />
        ) : null}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1 }}>
        <Tooltip title="Изменить ссылки">
          <IconButton
            aria-label="Изменить ссылки"
            disabled={!canEdit || loading}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(link);
            }}
          >
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Архивировать QR-ссылку">
          <IconButton
            aria-label="Архивировать QR-ссылку"
            color="error"
            disabled={!canEdit || loading || link.status !== "active"}
            onClick={(event) => {
              event.stopPropagation();
              onArchive(link);
            }}
          >
            <ArchiveOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
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
    setHistoryLoading(true);
    const items = await onLoadHistory(null, query);
    setHistory(Array.isArray(items) ? items : []);
    setHistoryLoading(false);
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
        <TableContainer
          sx={{
            ...desktopOnlySx,
            maxHeight: "60dvh",
            border: "1px solid",
            borderColor: "#E5E5E5",
            borderRadius: "12px",
          }}
        >
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell>Кафе</TableCell>
                <TableCell>Зона</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell>Ссылки</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow
                  key={link.id}
                  hover
                  onClick={() => openZoneModal(link)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{pointName(points, link)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        link.zone_code || link.zone_label
                          ? `${link.zone_code || ""}${link.zone_code && link.zone_label ? " — " : ""}${link.zone_label || ""}`
                          : "Кафе"
                      }
                      sx={{ fontWeight: 700, bgcolor: "#E8F5E9", color: "#2E7D32" }}
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(link.created_at)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <LinkChip
                        link={link}
                        variant="stars"
                        onCopy={copy}
                      />
                      <LinkChip
                        link={link}
                        variant="emoji"
                        onCopy={copy}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Изменить ссылки">
                      <IconButton
                        aria-label="Изменить ссылки"
                        disabled={!canEdit || loading}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(link);
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Архивировать QR-ссылку">
                      <IconButton
                        aria-label="Архивировать QR-ссылку"
                        color="error"
                        disabled={!canEdit || loading || link.status !== "active"}
                        onClick={withConfirm(
                          () => onRevoke({ id: link.id }),
                          "Архивировать QR-ссылку? Она перестанет работать, а запись останется в истории.",
                        )}
                      >
                        <ArchiveOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {links.length > 0 ? (
        <Box
          sx={{
            display: "none",
            gap: 1.25,
            "@media (max-width: 990px)": { display: "grid" },
          }}
        >
          {links.map((link) => (
            <MobileLinkCard
              key={link.id}
              link={link}
              points={points}
              canEdit={canEdit}
              loading={loading}
              onOpen={openZoneModal}
              onEdit={openEdit}
              onArchive={withConfirm(
                () => onRevoke({ id: link.id }),
                "Архивировать QR-ссылку? Она перестанет работать, а запись останется в истории.",
              )}
              onCopy={copy}
            />
          ))}
        </Box>
      ) : null}

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
                        bgcolor: "#fff",
                      }}
                    >
                      <Box
                        component="img"
                        src={zoneModalQrs[variant]}
                        alt={`QR-код ${variant === "stars" ? "звёзды" : "эмоджи"}`}
                        sx={{ display: "block", width: "100%", height: "100%" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 42,
                          height: 42,
                          display: "grid",
                          placeItems: "center",
                          border: "3px solid #fff",
                          borderRadius: "50%",
                          bgcolor: "#fff",
                          color: "#DD1A32",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        JACO
                      </Box>
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
            {zoneModalTarget?.status === "active" ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ArchiveOutlinedIcon />}
                disabled={!canEdit || loading}
                onClick={withConfirm(async () => {
                  const archived = await onRevoke({ id: zoneModalTarget.id });
                  if (archived) setZoneModalTarget(null);
                }, "Архивировать QR-ссылку? Она перестанет работать, а запись останется в истории.")}
                sx={actionButtonSx}
              >
                Архивировать
              </Button>
            ) : null}
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              disabled={!canEdit || loading}
              onClick={() => {
                setZoneModalTarget(null);
                openEdit(zoneModalTarget);
              }}
              sx={actionButtonSx}
            >
              Изменить
            </Button>
          </Box>
          <Accordion
            defaultExpanded={false}
            sx={{
              mt: 3,
              mb: 0,
              border: "1px solid #E5E5E5",
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
                bgcolor: "#FAFAFA",
                "&.Mui-expanded": { minHeight: 56 },
                "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
              }}
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography fontWeight={700}>История изменений</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, borderTop: "1px solid #E5E5E5" }}>
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
                          <TableCell>{event.reason || "—"}</TableCell>
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
          border: "1px solid #E5E5E5",
          borderRadius: "12px !important",
          boxShadow: "none",
          overflow: "hidden",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: "24px 0 32px" },
        }}
        onChange={(_, expanded) => {
          if (expanded && history.length === 0 && !historyLoading) loadFullHistory("");
        }}
      >
        <AccordionSummary
          sx={{
            minHeight: 56,
            bgcolor: "#FAFAFA",
            "&.Mui-expanded": { minHeight: 56 },
            "& .MuiAccordionSummary-content.Mui-expanded": { my: 0 },
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography fontWeight={700}>Полная история QR-ссылок</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, borderTop: "1px solid #E5E5E5" }}>
          <Grid
            container
            spacing={1.5}
            sx={{ mb: 1.5 }}
          >
            <Grid size={{ xs: 12, md: 9 }}>
              <MyTextInput
                type="search"
                label="Поиск в истории"
                placeholder="Кафе, зона, событие, пользователь"
                value={historyQuery}
                func={(event) => setHistoryQuery(event.target.value)}
                disabled={historyLoading}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{ display: "flex", alignItems: "end" }}
            >
              <Button
                fullWidth
                variant="outlined"
                disabled={historyLoading}
                onClick={() => loadFullHistory()}
                sx={actionButtonSx}
              >
                Найти
              </Button>
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
                      <TableCell>
                        {event.zone_code || event.zone_label
                          ? `${event.zone_code || ""}${event.zone_code && event.zone_label ? " — " : ""}${event.zone_label || ""}`
                          : "Кафе"}
                      </TableCell>
                      <TableCell>{eventLabels[event.event_type] || event.event_type}</TableCell>
                      <TableCell>{event.link_id || "—"}</TableCell>
                      <TableCell>{event.actor_name || event.actor_id || "—"}</TableCell>
                      <TableCell>{event.reason || "—"}</TableCell>
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
