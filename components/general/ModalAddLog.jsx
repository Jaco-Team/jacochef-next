import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export const ModalAddLog = ({
  open,
  onClose,
  save,
  title = "Создать обновление",
  modules,
  defaultValue,
}) => {
  const [description, setDescription] = useState(defaultValue);
  const [module_id, setModule] = useState({});

  useEffect(() => {
    if (open) {
      setDescription(defaultValue || "");
    }
  }, [open, defaultValue]);

  const handleClose = () => {
    setDescription("");
    onClose();
  };

  const handleSave = () => {
    save({ description, module_id: module_id?.id });
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          width: { xs: "calc(100% - 16px)", sm: "100%" },
          maxWidth: 760,
          margin: { xs: "8px", sm: "32px" },
          maxHeight: { xs: "calc(100% - 16px)", sm: "calc(100% - 64px)" },
          borderRadius: "14px",
          border: "1px solid #E5E7EB",
          backgroundColor: "#F6F7F9",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.25)",
        },
      }}
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: "18px", sm: "22px" },
          fontWeight: 700,
          color: "#2E2E33",
          px: 3,
          pt: { xs: 2, sm: 2.5 },
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ fontWeight: "bold", textAlign: "left", px: 3, pb: 2 }}>
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#fff",
          }}
        >
          <Grid style={{ marginTop: "2px" }}>
            <MyAutocomplite
              label="Модуль"
              data={modules}
              multiple={false}
              value={module_id}
              func={(event, data) => {
                setModule(data);
              }}
            />
          </Grid>
          <Grid style={{ marginTop: "10px" }}>
            <MyTextInput
              minRows={3}
              value={description}
              func={(e) => setDescription(e.target.value)}
              label="Описание"
            />
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid #E5E7EB",
          backgroundColor: "#fff",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: 1,
        }}
      >
        <Button
          autoFocus
          onClick={handleClose}
          sx={{
            color: "#DD1A32",
            fontWeight: 700,
            fontSize: { xs: "12px", sm: "14px" },
            textTransform: "uppercase",
            minWidth: "auto",
            px: 0.5,
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "#2E7D32",
            borderRadius: "9px",
            px: { xs: 1.4, sm: 2 },
            py: 0.55,
            fontWeight: 700,
            fontSize: { xs: "12px", sm: "14px" },
            textTransform: "uppercase",
            minWidth: "auto",
            "&:hover": {
              backgroundColor: "#27692A",
            },
          }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
