import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React from "react";
import { Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const ModalOrderPostRecNotFoundItems = ({ open, onClose, items = [] }) => {
  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>У вас есть несохраненные данные</DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <Paper
              key={item.id || index}
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CheckCircleIcon
                color="primary"
                fontSize="small"
              />
              <Typography
                variant="body1"
                fontWeight={500}
              >
                {item.name}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
};
