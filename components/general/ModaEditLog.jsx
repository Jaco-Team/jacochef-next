import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";
import { ModalAccept } from "@/components/general/ModalAccept";

export const ModalEditLog = ({
  open,
  deletes,
  onClose,
  save,
  title = "Редактирование обновления",
  modules,
  defaultValue,
  module,
}) => {
  const [description, setDescription] = useState(defaultValue);
  const [module_id, setModule] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [moduleHistory, setModuleHistory] = useState([]);

  useEffect(() => {
    if (open) {
      setDescription(module.description);
      setModule(modules.find((i) => i.id == module.module_id));
      setModuleHistory(module.history);
    }
  }, [open, defaultValue]);

  const handleClose = () => {
    setDescription("");
    setModule({});
    setModuleHistory([]);
    onClose();
  };

  const handleSave = () => {
    save({ id: module?.id, description, module_id: module_id?.id });
  };

  return (
    <Dialog
      sx={{
        "& .MuiDialog-paper": {
          width: { xs: "calc(100% - 16px)", sm: "100%" },
          maxWidth: 820,
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
      {openDelete ? (
        <ModalAccept
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Удалить обновление?"
          save={() => deletes({ id: module.id })}
        />
      ) : null}
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
        {moduleHistory.length ? (
          <Grid style={{ marginTop: "12px" }}>
            <Accordion
              style={{ width: "100%" }}
              sx={{
                borderRadius: "12px !important",
                border: "1px solid #E5E7EB",
                boxShadow: "none",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700, fontSize: "20px", color: "#2E2E33" }}>
                  История изменений
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 0, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
                <TableContainer
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                    maxHeight: { xs: 280, sm: 360 },
                    border: "1px solid #F0F0F0",
                    borderRadius: 1,
                  }}
                >
                  <Table sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Дата / время</TableCell>
                        <TableCell>Сотрудник</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Модуль</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {moduleHistory.map((it, k) => (
                        <TableRow
                          hover
                          key={k}
                        >
                          <TableCell>{k + 1}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{it.time}</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>{it.short_name}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{it.type}</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            {k !== 0 ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: 0.25,
                                }}
                              >
                                {moduleHistory[k - 1]?.description !== it.description ? (
                                  <>
                                    <span>{moduleHistory[k - 1]?.description}</span>
                                    <span>↓</span>
                                    <span>{it.description}</span>
                                  </>
                                ) : null}
                              </Box>
                            ) : (
                              <span>{it.description}</span>
                            )}
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            {k !== 0 ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: 0.25,
                                }}
                              >
                                {moduleHistory[k - 1]?.module_name !== it.module_name ? (
                                  <>
                                    <span>{moduleHistory[k - 1]?.module_name}</span>
                                    <span>↓</span>
                                    <span>{it.module_name}</span>
                                  </>
                                ) : (
                                  <span>{it.module_name}</span>
                                )}
                              </Box>
                            ) : (
                              <span>{it.module_name}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid #E5E7EB",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: { xs: 0.5, sm: 1 },
            flexWrap: "nowrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenDelete(true)}
            sx={{
              backgroundColor: "#DD1A32",
              borderRadius: "9px",
              px: { xs: 1.4, sm: 2 },
              py: 0.55,
              fontWeight: 700,
              fontSize: { xs: "12px", sm: "14px" },
              textTransform: "uppercase",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "#be1630",
              },
            }}
          >
            Удалить
          </Button>
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
            <Button
              autoFocus
              onClick={handleClose}
              sx={{
                color: "#DD1A32",
                fontWeight: 700,
                fontSize: { xs: "12px", sm: "14px" },
                textTransform: "uppercase",
                minWidth: "auto",
                px: { xs: 0.5, sm: 1 },
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
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
