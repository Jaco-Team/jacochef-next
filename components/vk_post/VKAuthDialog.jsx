import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import { styled } from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    minWidth: 600,
    maxWidth: 700,
  },
}));

const AuthUrlBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#e3f2fd",
  border: "2px solid #2196f3",
  borderRadius: 8,
  padding: theme.spacing(2),
  position: "relative",
  wordBreak: "break-all",
  fontFamily: "monospace",
  fontSize: "0.875rem",
  minHeight: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const TokenTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    fontFamily: "monospace",
    fontSize: "0.875rem",
  },
  "& .MuiOutlinedInput-input": {
    minHeight: 80,
  },
}));

const VKAuthDialog = ({ open, onClose, onSave, authUrl = "" }) => {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(authUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTokenChange = (e) => {
    const value = e.target.value;
    setToken(value);
    setError("");
  };

  const handleSave = () => {
    if (!token.trim()) {
      setError("Введите access_token или URL");
      return;
    }

    // Проверяем, что введено (токен или URL)
    const tokenValue = token.includes("access_token=")
      ? token.split("access_token=")[1].split("&")[0]
      : token.trim();

    onSave?.(tokenValue);
    setToken("");
    onClose?.();
  };

  const handleClose = () => {
    setToken("");
    setError("");
    onClose?.();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 3,
          pt: 3,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          fontWeight={600}
        >
          Подтвердить права VK
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            lineHeight: 1.5,
          }}
        >
          Открой ссылку, разреши доступ, скопируй итоговый URL или access_token и вставь ниже.
        </Typography>

        {/* Ссылка авторизации */}
        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, fontWeight: 500 }}
        >
          Ссылка авторизации
        </Typography>
        <AuthUrlBox>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkIcon sx={{ color: "#2196f3", fontSize: 20 }} />
            <Typography
              component="span"
              sx={{ color: "#1976d2", fontWeight: 500 }}
            >
              {authUrl || "https://oauth.vk.com/authorize?client_id=51841..."}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCopyUrl}
            size="small"
            sx={{
              color: "#2196f3",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.08)",
              },
            }}
            title="Копировать ссылку"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </AuthUrlBox>

        {copied && (
          <Alert
            severity="success"
            sx={{ mt: 1, mb: 2 }}
            icon={false}
          >
            Ссылка скопирована!
          </Alert>
        )}

        {/* Поле для токена */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 500 }}
          >
            Вставь access_token или весь URL после авторизации
          </Typography>
          <TokenTextField
            fullWidth
            multiline
            rows={3}
            placeholder="vk1.a.xxxxx... или https://oauth.vk.com/blank.html#access_token=..."
            value={token}
            onChange={handleTokenChange}
            error={!!error}
            helperText={error}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "error.main" : "divider",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            mr: 1,
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!token.trim()}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 4,
            backgroundColor: "#2196f3",
            "&:hover": {
              backgroundColor: "#1976d2",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          Сохранить токен
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default VKAuthDialog;
