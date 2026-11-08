import dayjs from "dayjs";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WbIncandescentOutlinedIcon from "@mui/icons-material/WbIncandescentOutlined";

export default function CleaningsLampSummary({
  lamp,
  historical = false,
  canEdit = false,
  onEdit,
  onHistory,
  onReplace,
  showActions = true,
  compact = false,
}) {
  const replacementDate = lamp.removed_at
    ? dayjs(lamp.removed_at).format("DD.MM.YYYY")
    : "дата не указана";
  const installedDate = lamp.installed_at
    ? dayjs(lamp.installed_at).format("DD.MM.YYYY")
    : "дата не указана";
  const statusLabel = historical ? "Заменена: " + replacementDate : "Активная лампа";
  const statusTooltip = historical
    ? "Период действия: " + installedDate + " — " + replacementDate
    : "Действует с: " + installedDate;

  return (
    <Box
      sx={{
        p: compact ? 0 : { xs: 1.25, md: 1.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        flexWrap: { xs: "wrap", md: "nowrap" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flex: 1,
          minWidth: 0,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Tooltip title={statusTooltip}>
          <Chip
            size="small"
            color={historical ? "default" : "primary"}
            label={statusLabel}
          />
        </Tooltip>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <PlaceOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.place || "—"}</Typography>
        </Box>
        <Typography variant="body2">№{lamp.number}</Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <WbIncandescentOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.name || "—"}</Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          ID: {lamp.id}
        </Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <TimerOutlinedIcon fontSize="small" />
          <Typography color="text.secondary">
            {lamp.total_svod || "0:00"} / {lamp.resource || 0} ч
          </Typography>
        </Box>
      </Box>
      {showActions ? (
        <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
          {canEdit && !historical ? (
            <Tooltip title="Редактировать реквизиты лампы">
              <IconButton
                color="primary"
                size="small"
                aria-label="Редактировать реквизиты лампы"
                onClick={() => onEdit(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {canEdit && !historical ? (
            <Tooltip title="Заменить лампу">
              <IconButton
                color="primary"
                size="small"
                aria-label="Заменить лампу"
                onClick={() => onReplace(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <WbIncandescentOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="История лампы">
            <IconButton
              color="primary"
              size="small"
              aria-label="История лампы"
              onClick={() => onHistory(lamp)}
              sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
            >
              <HistoryOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
    </Box>
  );
}
