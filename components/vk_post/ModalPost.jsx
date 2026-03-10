import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const ModalPost = ({ open, onClose, postData, openGraph, refreshPost }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        ".MuiDialog-container": {
          justifyContent: "flex-end", // Выравнивание контейнера вправо
        },
        ".MuiDialog-paper": {
          marginRight: "0",
          marginTop: "50px",
        },
        ".MuiDialog-backdrop": {
          backgroundColor: "transparent !important",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Заголовок */}
      <DialogTitle
        sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
        >
          Пост {postData.id}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Контент */}
      <DialogContent
        dividers
        sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}
      >
        {/* Текст поста */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {postData.date}
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ lineHeight: 1.5 }}
          >
            {postData.text}
          </Typography>
        </Box>

        {/* Секция ОХВАТЫ */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1, textTransform: "uppercase" }}
        >
          ОХВАТЫ
        </Typography>
        <Grid
          container
          spacing={1.5}
          sx={{ mb: 4 }}
          rowSpacing="22px"
        >
          {postData.reach.map((item, index) => (
            <Grid
              item
              xs={6}
              key={index}
            >
              <Box
                sx={{
                  bgcolor: "#F2F3F7",
                  borderRadius: 2,
                  p: 2,
                  height: "80px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "80px", // Фиксированная минимальная высота
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Секция ДЕЙСТВИЯ */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1, textTransform: "uppercase" }}
        >
          ДЕЙСТВИЯ
        </Typography>
        <Grid
          container
          spacing={5}
          sx={{ mb: 3 }}
          rowSpacing="22px"
        >
          {postData.actions.map((item, index) => (
            <Grid
              item
              xs={4}
              key={index}
            >
              <Box
                sx={{
                  bgcolor: "#F2F3F7",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "60px",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Футер информации */}
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Обновлено: {postData.updated}
        </Typography>
      </DialogContent>

      {/* Кнопки действий */}
      <DialogActions sx={{ p: 2, justifyContent: "space-between", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<BarChartIcon />}
          onClick={() => openGraph(postData)}
          sx={{
            flex: 1,
            textTransform: "none",
            fontWeight: "normal",
            borderColor: "#E0E0E0",
            color: "text.primary",
          }}
        >
          Графики
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refreshPost(postData)}
          sx={{
            flex: 1,
            textTransform: "none",
            fontWeight: "normal",
            borderColor: "#E0E0E0",
            color: "text.primary",
          }}
        >
          Обновить
        </Button>
        <IconButton
          onClick={() =>
            window.open(`https://vk.com/wall-${postData.vk_group_id}_${postData.post_id}`, "_blank")
          }
          sx={{
            border: "1px solid #E0E0E0",
            width: 40,
            height: 40,
            color: "text.primary",
          }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};
