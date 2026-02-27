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
import { ModalAccept } from "@/components/general/ModalAccept";

export const ModalEditLog = ({
  open,
  deletes,
  onClose,
  save,
  title = "Редактировать новость",
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
      sx={{ "& .MuiDialog-paper": { width: "100%" } }}
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      {openDelete ? (
        <ModalAccept
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Удалить новость?"
          save={() => deletes({ id: module.id })}
        />
      ) : null}
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        <Grid style={{ marginTop: "20px" }}>
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
        {moduleHistory.length ? (
          <Grid style={{ marginTop: "10px" }}>
            <Accordion style={{ width: "100%" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{ fontWeight: "bold" }}>История изменений</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Table>
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
                        <TableCell>{it.time}</TableCell>
                        <TableCell>{it.short_name}</TableCell>
                        <TableCell>{it.type}</TableCell>
                        <TableCell>
                          {k !== 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              {moduleHistory[k - 1]?.description !== it.description ? (
                                <>
                                  <span>{moduleHistory[k - 1]?.description}</span>
                                  <span>↓</span>
                                  <span>{it.description}</span>
                                </>
                              ) : null}
                            </div>
                          ) : (
                            <span>{it.description}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {k !== 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
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
                            </div>
                          ) : (
                            <span>{it.module_name}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button
            variant={"contained"}
            onClick={() => setOpenDelete(true)}
          >
            Удалить
          </Button>
          <div>
            <Button
              autoFocus
              onClick={handleClose}
            >
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};
