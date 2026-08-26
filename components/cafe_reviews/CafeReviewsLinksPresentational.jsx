import {
  Box,
  Chip,
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
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  blockBorder,
  desktopOnlySx,
  formatDateTime,
  mutedBackground,
  successBackground,
  successGreen,
  textSecondary,
  white,
} from "./shared";

const linkChipSx = { minHeight: 40, fontWeight: 700 };

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

export function LinkChip({ link, variant, onCopy }) {
  const url = linkUrl(link, variant);
  if (!url) return null;

  const isStars = variant === "stars";
  const color = isStars ? "#1976D2" : successGreen;
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
          color: white,
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
            sx={{ width: 40, height: 40, p: 0, color: white, flexShrink: 0 }}
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
            color: white,
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
            color: link.status === "active" ? successGreen : textSecondary,
            bgcolor: link.status === "active" ? successBackground : mutedBackground,
          }}
        />
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <Chip
          size="small"
          label={zoneLabel(link)}
          sx={{
            fontWeight: 700,
            bgcolor: successBackground,
            color: successGreen,
            maxWidth: "100%",
          }}
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
        <Tooltip title="Отозвать QR-ссылку">
          <IconButton
            aria-label="Отозвать QR-ссылку"
            color="error"
            disabled={!canEdit || loading || link.status !== "active"}
            onClick={(event) => {
              event.stopPropagation();
              onArchive(link);
            }}
          >
            <BlockOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
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
    <TableContainer
      sx={{
        ...desktopOnlySx,
        maxHeight: "60dvh",
        border: "1px solid",
        borderColor: blockBorder,
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
              onClick={() => onOpen(link)}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>{pointName(points, link)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={zoneLabel(link)}
                  sx={{ fontWeight: 700, bgcolor: successBackground, color: successGreen }}
                />
              </TableCell>
              <TableCell>{formatDateTime(link.created_at)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell align="right">
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
                <Tooltip title="Отозвать QR-ссылку">
                  <IconButton
                    aria-label="Отозвать QR-ссылку"
                    color="error"
                    disabled={!canEdit || loading || link.status !== "active"}
                    onClick={(event) => {
                      event.stopPropagation();
                      onArchive(link);
                    }}
                  >
                    <BlockOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
