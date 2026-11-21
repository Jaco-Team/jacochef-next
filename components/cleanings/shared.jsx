import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  TableCell,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  JacoButton,
  JacoIconButton,
  JacoStatusChip,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";
import { formatClockTime, getAdditionTypeShortName, getDeleteBehavior } from "./helpers";

// Blocks repeated submits until the async action settles; `pendingKey` marks the clicked row.
export function usePendingAction() {
  const [pendingKey, setPendingKey] = useState(null);
  const pendingRef = useRef(false);

  const runPending = useCallback(async (action, key = true) => {
    if (pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    setPendingKey(key);
    try {
      await action();
    } finally {
      pendingRef.current = false;
      setPendingKey(null);
    }
  }, []);

  return { pendingKey, isPending: pendingKey !== null, runPending };
}

// Browser prompt on reload / tab close while `active` (unsaved changes).
export function useBeforeUnloadGuard(active) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active]);
}

export function FormLabel({ children }) {
  return (
    <Typography sx={{ ...uiTypography.label, color: uiColors.text, fontWeight: 600, mb: 0.75 }}>
      {children}
    </Typography>
  );
}

const formHintColors = {
  muted: uiColors.textMuted,
  error: uiColors.danger,
  warning: uiColors.warningHover,
};

export function FormHint({ children, tone = "muted", sx }) {
  return (
    <Typography
      sx={{ color: formHintColors[tone] || formHintColors.muted, fontSize: 13, mt: 0.75, ...sx }}
    >
      {children}
    </Typography>
  );
}

// Row badges shared by «Время уборок» and «Уборки Кафе»: auto-delete behaviour and addition type.
export function CleaningTemplateChips({ item, withAdditionType = true, sx }) {
  const deleteBehavior = getDeleteBehavior(item);
  const additionTypeName = withAdditionType ? getAdditionTypeShortName(item?.additionType) : "";

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, ...sx }}>
      {deleteBehavior.kind === "mandatory" ? (
        <JacoStatusChip
          label="Обязательная"
          tone="danger"
          variant="soft"
        />
      ) : (
        <JacoStatusChip
          label={
            deleteBehavior.kind === "pool"
              ? "Не удаляется ночью"
              : `Удалится в ${deleteBehavior.time}`
          }
          tone="neutral"
          variant="outlined"
        />
      )}
      {additionTypeName ? (
        <JacoStatusChip
          label={additionTypeName}
          tone={item.additionType === "other" ? "warning" : "neutral"}
          variant="soft"
        />
      ) : null}
    </Box>
  );
}

export function SortableHeaderCell({ children, sortKey, sortBy, sortDirection, onSort, ...props }) {
  const active = sortBy === sortKey;

  return (
    <TableCell
      sortDirection={active ? sortDirection : false}
      {...props}
    >
      <TableSortLabel
        active={active}
        direction={active ? sortDirection : "asc"}
        onClick={() => onSort(sortKey)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
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
          color: uiColors.text,
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
              <UnarchiveOutlinedIcon fontSize="small" />
            ) : (
              <ArchiveOutlinedIcon fontSize="small" />
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

// «Обновить» of the control toolbars with the time of the last successful load; a failed load is a soft hint.
export function ControlRefreshControl({ onRefresh, refreshing = false, disabled = false, updatedAt, error }) {
  const updatedText = updatedAt ? `Обновлено в ${formatClockTime(updatedAt)}` : "";
  const hint = error
    ? [updatedText, "не удалось обновить"].filter(Boolean).join(" · ")
    : updatedText;

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
      {hint ? (
        <Tooltip title={error || ""}>
          <Typography
            sx={{
              ...uiTypography.compactLabel,
              fontSize: 13,
              color: error ? uiColors.warningHover : uiColors.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {hint}
          </Typography>
        </Tooltip>
      ) : null}
      <Tooltip title="Обновить сейчас">
        <span>
          <JacoIconButton
            aria-label="Обновить"
            onClick={onRefresh}
            disabled={disabled || refreshing}
            sx={{ width: 36, height: 36 }}
          >
            {refreshing ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
          </JacoIconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

// «История» of a control row: an icon in the table, a full-width button in mobile cards.
export function ControlHistoryButton({ onClick, mobile = false, sx }) {
  if (mobile) {
    return (
      <JacoButton
        tone="secondary"
        compact
        startIcon={<HistoryIcon />}
        onClick={onClick}
        sx={sx}
      >
        История
      </JacoButton>
    );
  }

  return (
    <Tooltip title="История действий">
      <IconButton
        size="small"
        aria-label="История"
        onClick={onClick}
        sx={{ color: uiColors.text }}
      >
        <HistoryIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export function ControlReturnsBadge({ count, sx }) {
  return count > 0 ? (
    <JacoStatusChip
      label={`Возвращали: ${count}`}
      tone="warning"
      variant="soft"
      sx={sx}
    />
  ) : null;
}
