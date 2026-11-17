import {
  Box,
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
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  JacoIconButton,
  JacoStatusChip,
  JacoSurface,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTableColors,
  uiTypography,
} from "@/design-system/shared/ui";
import { desktopOnlySx, formatDateTime, tableCellSx, tableHeadCellSx } from "./shared";

const rowActionSx = { width: 36, height: 36, borderRadius: uiRadii.sm };
const inlineActionSx = { width: 32, height: 32, borderRadius: uiRadii.sm, border: "none" };

export function pointName(points, link) {
  return (
    link.point_name ||
    points.find((point) => String(point.id) === String(link.point_id))?.name ||
    `Кафе #${link.point_id}`
  );
}

export function linkUrl(link, variant) {
  return link.feedback_urls_by_variant?.[variant] || "";
}

export function zoneLabel(link) {
  return link.zone_code || link.zone_label
    ? `${link.zone_code || ""}${link.zone_code && link.zone_label ? " — " : ""}${link.zone_label || ""}`
    : "Кафе";
}

/** One form variant of a link: its name, a copy action and an open action. */
export function LinkChip({ link, variant, onCopy }) {
  const url = linkUrl(link, variant);
  if (!url) return null;

  const isStars = variant === "stars";
  const Icon = isStars ? StarRoundedIcon : SentimentSatisfiedAltOutlinedIcon;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        pl: 1,
        pr: 0.5,
        minHeight: 40,
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.md,
        backgroundColor: uiColors.surface,
      }}
    >
      <Icon
        aria-hidden="true"
        fontSize="small"
        sx={{ color: uiColors.primary }}
      />
      <Typography
        component="span"
        sx={{ ...uiTypography.label, color: uiColors.textStrong, mx: 0.5 }}
      >
        {isStars ? "Звёзды" : "Эмодзи"}
      </Typography>
      <Tooltip title="Скопировать ссылку">
        <JacoIconButton
          aria-label={`Скопировать ${isStars ? "звёздную" : "эмодзи"} ссылку`}
          onClick={(event) => {
            event.stopPropagation();
            onCopy(url);
          }}
          sx={inlineActionSx}
        >
          <ContentCopyOutlinedIcon fontSize="small" />
        </JacoIconButton>
      </Tooltip>
      <Tooltip title="Открыть в новой вкладке">
        <JacoIconButton
          component="a"
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Открыть ${isStars ? "звёздную" : "эмодзи"} ссылку`}
          onClick={(event) => event.stopPropagation()}
          sx={inlineActionSx}
        >
          <OpenInNewOutlinedIcon fontSize="small" />
        </JacoIconButton>
      </Tooltip>
    </Box>
  );
}

function LinkActions({ link, canEdit, loading, onEdit, onArchive }) {
  const canArchive = canEdit && !loading && link.status === "active";

  return (
    <Box sx={{ display: "inline-flex", gap: 0.75 }}>
      <Tooltip title="Изменить ссылки">
        <span>
          <JacoIconButton
            aria-label="Изменить ссылки"
            disabled={!canEdit || loading}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(link);
            }}
            sx={rowActionSx}
          >
            <EditOutlinedIcon fontSize="small" />
          </JacoIconButton>
        </span>
      </Tooltip>
      <Tooltip title="Отозвать QR-ссылку">
        <span>
          <JacoIconButton
            aria-label="Отозвать QR-ссылку"
            disabled={!canArchive}
            onClick={(event) => {
              event.stopPropagation();
              onArchive(link);
            }}
            sx={{ ...rowActionSx, ...(canArchive ? { color: uiColors.danger } : null) }}
          >
            <BlockOutlinedIcon fontSize="small" />
          </JacoIconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export function MobileLinkCard({
  link,
  points,
  canEdit,
  loading,
  onOpen,
  onEdit,
  onArchive,
  onCopy,
}) {
  return (
    <JacoSurface
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
        p: 2,
        borderRadius: uiRadii.md,
        cursor: "pointer",
        minWidth: 0,
        "&:focus-visible": { outline: `3px solid ${uiStateColors.focusRing}` },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong, overflowWrap: "anywhere" }}
          >
            {pointName(points, link)}
          </Typography>
          <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
            {formatDateTime(link.created_at)}
          </Typography>
        </Box>
        <JacoStatusChip
          tone={link.status === "active" ? "success" : "neutral"}
          variant="soft"
          label={link.status === "active" ? "Активна" : "Отозвана"}
          sx={{ flexShrink: 0 }}
        />
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <JacoStatusChip
          tone="success"
          variant="soft"
          label={zoneLabel(link)}
          sx={{ maxWidth: "100%" }}
        />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.25, minWidth: 0 }}>
        <LinkChip
          link={link}
          variant="stars"
          onCopy={onCopy}
        />
        <LinkChip
          link={link}
          variant="emoji"
          onCopy={onCopy}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.25 }}>
        <LinkActions
          link={link}
          canEdit={canEdit}
          loading={loading}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      </Box>
    </JacoSurface>
  );
}

export function LinksDesktopTable({
  links,
  points,
  canEdit,
  loading,
  onOpen,
  onEdit,
  onArchive,
  onCopy,
}) {
  return (
    <JacoSurface sx={{ ...desktopOnlySx, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "60dvh" }}>
        <Table
          size="small"
          stickyHeader
          aria-label="QR-ссылки"
        >
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadCellSx}>Кафе</TableCell>
              <TableCell sx={tableHeadCellSx}>Зона</TableCell>
              <TableCell sx={tableHeadCellSx}>Создана</TableCell>
              <TableCell sx={tableHeadCellSx}>Ссылки</TableCell>
              <TableCell
                align="right"
                sx={tableHeadCellSx}
              >
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link) => {
              const hasUrls = linkUrl(link, "stars") || linkUrl(link, "emoji");

              return (
                <TableRow
                  key={link.id}
                  onClick={() => onOpen(link)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: uiTableColors.rowHover },
                    "&:last-of-type td": { borderBottom: 0 },
                  }}
                >
                  <TableCell sx={{ ...tableCellSx, fontWeight: 600 }}>
                    {pointName(points, link)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    <JacoStatusChip
                      tone="success"
                      variant="soft"
                      label={zoneLabel(link)}
                    />
                  </TableCell>
                  <TableCell sx={{ ...tableCellSx, whiteSpace: "nowrap" }}>
                    {formatDateTime(link.created_at)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {hasUrls ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <LinkChip
                          link={link}
                          variant="stars"
                          onCopy={onCopy}
                        />
                        <LinkChip
                          link={link}
                          variant="emoji"
                          onCopy={onCopy}
                        />
                      </Box>
                    ) : (
                      <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
                        Нет короткой ссылки — перевыпустите QR
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableCellSx}
                  >
                    <LinkActions
                      link={link}
                      canEdit={canEdit}
                      loading={loading}
                      onEdit={onEdit}
                      onArchive={onArchive}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </JacoSurface>
  );
}

export function LinksMobileList(props) {
  const { links } = props;

  return (
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
          {...props}
          link={link}
        />
      ))}
    </Box>
  );
}
