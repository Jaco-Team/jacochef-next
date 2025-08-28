"use client";

import { MyCheckBox } from "@/ui/elements";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { memo } from "react";
import { useAppointmentModalStore } from "@/components/appointment/store/useAppointmentModalStore";

const AppointmentParamModal = (props) => {
  const params = useAppointmentModalStore((s) => s.params);
  const paramMethod = useAppointmentModalStore((s) => s.paramMethod);
  const type = useAppointmentModalStore((s) => s.type);
  const paramModal = useAppointmentModalStore((s) => s.paramModal);
  const { changeParamFlag } = useAppointmentModalStore.getState();

  const onClose = () => {
    setTimeout(() => {
      props.onClose();
    }, 100);
  };

  const renderFeatureCheckBoxes = (feature, categoryIndex, featureIndex) => {
    const fields = {
      access: "Доступ",
      view: "Просмотр",
      edit: "Редактирование",
    };
    return (
      <>
        {Object.keys(fields).map((field, i) => (
          <TableCell key={`${categoryIndex}-${featureIndex}-${i}`}>
            {feature[field] !== undefined && (
              <Checkbox
                key={`${categoryIndex}-${featureIndex}-${i}`}
                checked={!!+feature[field]}
                onChange={(e) => changeParamFlag(field, featureIndex, categoryIndex, e)}
                label={fields[field]}
              />
            )}
          </TableCell>
        ))}
      </>
    );
  };

  const { fullScreen } = props;

  return (
    <Dialog
      open={paramModal}
      onClose={onClose}
      fullWidth={true}
      maxWidth={"lg"}
      fullScreen={fullScreen}
    >
      <DialogTitle>
        {paramMethod}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
        {params?.table?.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell style={{ width: "30%" }}>Категория</TableCell>
                <TableCell style={{ width: "30%" }}>Параметр</TableCell>
                <TableCell style={{ width: "10%" }}>Доступ</TableCell>
                <TableCell style={{ width: "10%" }}>Просмотр</TableCell>
                <TableCell style={{ width: "10%" }}>Редактирование</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {type === "one"
                ? params.table.map((f, f_key) => (
                    <TableRow
                      hover
                      key={`t_${f_key}`}
                    >
                      <TableCell>{f.category_name}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      {renderFeatureCheckBoxes(f, -1, f.index)}
                    </TableRow>
                  ))
                : params.table?.map((f) =>
                    f?.features?.map((cat_f, cat_f_key) => (
                      <TableRow
                        hover
                        key={`ct_${cat_f_key}`}
                      >
                        <TableCell>{cat_f.category_name}</TableCell>
                        <TableCell>{cat_f.name}</TableCell>
                        {renderFeatureCheckBoxes(cat_f, f.index, cat_f_key)}
                      </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
        )}
        {params?.accordion?.length > 0 && type === "one"
          ? params.accordion?.map((f, f_key) => (
              <Accordion key={`af_${f_key}`}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{f.category_name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "30%" }}>Категория</TableCell>
                        <TableCell style={{ width: "30%" }}>Параметр</TableCell>
                        <TableCell style={{ width: "10%" }}>Доступ</TableCell>
                        <TableCell style={{ width: "10%" }}>Просмотр</TableCell>
                        <TableCell style={{ width: "10%" }}>Редактирование</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>{f.category_name}</TableCell>
                        <TableCell>{f.name}</TableCell>
                        {renderFeatureCheckBoxes(f, -1, f.index)}
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))
          : params?.accordion?.map((f, f_key) => (
              <Accordion key={`ac_${f_key}`}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{f.category_name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "30%" }}>Категория</TableCell>
                        <TableCell style={{ width: "30%" }}>Параметр</TableCell>
                        <TableCell style={{ width: "10%" }}>Доступ</TableCell>
                        <TableCell style={{ width: "10%" }}>Просмотр</TableCell>
                        <TableCell style={{ width: "10%" }}>Редактирование</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {f?.features?.map((cat_f, cat_f_key) => (
                        <TableRow
                          hover
                          key={`acf_${cat_f_key}`}
                        >
                          <TableCell>{cat_f.category_name}</TableCell>
                          <TableCell>{cat_f.name}</TableCell>
                          {renderFeatureCheckBoxes(cat_f, f.index, cat_f_key)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(AppointmentParamModal);
