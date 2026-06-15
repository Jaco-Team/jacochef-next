import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";

export function FormLabel({ children }) {
  return (
    <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 600, mb: 0.75 }}>
      {children}
    </Typography>
  );
}

export function FormSection({ icon, title, children }) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.75,
          color: "text.secondary",
          "& .MuiSvgIcon-root": { fontSize: 20 },
        }}
      >
        {icon}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

export function CleaningActions({ item, onEdit, onArchiveToggle, onHistory, onRemove, canEdit }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      {canEdit ? (
        <Tooltip title="Редактировать">
          <IconButton
            size="small"
            onClick={() => onEdit(item)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
      <Tooltip title="История изменений">
        <IconButton
          size="small"
          onClick={() => onHistory(item)}
        >
          <HistoryIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit ? (
        <Tooltip title={item.status === "archive" ? "Вернуть из архива" : "В архив"}>
          <IconButton
            size="small"
            onClick={() => onArchiveToggle(item.id)}
          >
            {item.status === "archive" ? (
              <RestoreFromTrashOutlinedIcon fontSize="small" />
            ) : (
              <DeleteOutlineIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ) : null}
      {canEdit && item.status === "archive" ? (
        <Tooltip title="Удалить полностью">
          <IconButton
            size="small"
            onClick={() => onRemove?.(item.id)}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}
