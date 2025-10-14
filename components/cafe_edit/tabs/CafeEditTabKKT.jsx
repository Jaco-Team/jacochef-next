"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import useCafeEditModalsStore from "../useCafeEditModalsStore";
import useCafeEditStore from "../useCafeEditStore";
import { Edit, ExpandMore, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";

function CafeEditTabKKT({ canAccess, canView, canEdit, openHistModal }) {
  const [kkt_info_active, kkt_info_none_active, kkt_info_hist] = useCafeEditStore((state) => [
    state.kkt_info_active,
    state.kkt_info_none_active,
    state.kkt_info_hist,
  ]);

  const openModalKktInfo = (type_modal, kkt) => {
    const { points, point, kkt_info_active } = useCafeEditStore.getState();

    const pointModal = points.find((it) => parseInt(it.id) === parseInt(point.id)).name;

    const all_fn = [{ id: 0, name: "Добавить новый ФН" }];

    kkt_info_active.forEach((item) => {
      if (item.rn_kkt == kkt.rn_kkt) {
        const dateStart = item.date_start.split("-").reverse().join("-");
        const dateEnd = item.date_end.split("-").reverse().join("-");
        const name = `${item.fn} ( с ${dateStart} по ${dateEnd} )`;

        all_fn.push({
          id: item.fn,
          name,
          date_start: dayjs(item.date_start).format("YYYY-MM-DD"),
          date_end: dayjs(item.date_end).format("YYYY-MM-DD"),
        });
      }
    });

    kkt.all_fn = all_fn;

    useCafeEditModalsStore.setState({
      type_modal,
      pointModal,
      modalDialog_kkt: true,
      kkt_update: kkt,
    });
  };

  const openModalKktInfo_add = (kkt) => {
    useCafeEditModalsStore.setState({
      modalDialog_kkt_add: true,
      kkt_update: kkt,
    });
  };
  return (
    <Grid
      container
      spacing={3}
    >
      {canAccess("add_kkt") && (
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button
            variant="contained"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => openModalKktInfo("add_kkt", {})}
          >
            Добавить кассу
          </Button>
        </Grid>
      )}

      <Grid
        size={12}
        mb={5}
      >
        <TableContainer>
          <Table>
            <caption
              style={{
                captionSide: "top",
                fontWeight: "bold",
                fontSize: "1.1rem",
                textAlign: "left",
              }}
            >
              Активные кассы
            </caption>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell style={{ minWidth: "50px" }}>№ кассы</TableCell>
                <TableCell>РН ККТ</TableCell>
                <TableCell>ФН</TableCell>
                <TableCell style={{ minWidth: "200px" }}>Дата регистрации</TableCell>
                <TableCell style={{ minWidth: "200px" }}>Дата окончания</TableCell>
                <TableCell style={{ minWidth: "200px" }}>Лицензия ОФД дата завершения</TableCell>
                {canAccess("add_fn") && (
                  <TableCell style={{ minWidth: "200px" }}>Добавить новый ФН</TableCell>
                )}
                {canView("edit_kkt") && (
                  <TableCell>{canEdit("edit_kkt") ? "Редактирование" : "Просмотр"}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {kkt_info_active.map((item, key) => (
                <TableRow key={key}>
                  <TableCell>{item.kassa}</TableCell>
                  <TableCell>{item.rn_kkt}</TableCell>
                  <TableCell>{item.fn}</TableCell>
                  <TableCell>{item.date_start}</TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {!!item.date_end && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{ margin: "16px 0" }}
                          >
                            {item.date_end}
                          </Typography>
                          <Tooltip
                            title={item.days_left_end === "!" ? "Дни просрочены" : "Осталось дней"}
                          >
                            <Chip
                              label={item.days_left_end}
                              size="small"
                              sx={{
                                ml: 2,
                                height: 22,
                                cursor: "default",
                                "&:hover": {
                                  cursor: "default",
                                },
                                "& .MuiChip-label": {
                                  fontSize: "14px !important",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  px: 1.2,
                                  color: item.days_left_end === "!" ? "red" : "inherit",
                                },
                              }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {!!item.date_license && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{ margin: "16px 0" }}
                          >
                            {item.date_license}
                          </Typography>
                          <Tooltip
                            title={
                              item.days_left_license === "!" ? "Дни просрочены" : "Осталось дней"
                            }
                          >
                            <Chip
                              label={item.days_left_license}
                              size="small"
                              sx={{
                                ml: 2,
                                height: 22,
                                cursor: "default",
                                "&:hover": {
                                  cursor: "default",
                                },
                                "& .MuiChip-label": {
                                  fontSize: "14px !important",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  px: 1.2,
                                  color: item.days_left_license === "!" ? "red" : "inherit",
                                },
                              }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>

                  {canAccess("add_fn") && (
                    <TableCell>
                      <Button
                        variant="contained"
                        style={{ whiteSpace: "nowrap" }}
                        onClick={() => openModalKktInfo_add(item)}
                      >
                        Новый ФН
                      </Button>
                    </TableCell>
                  )}
                  {canAccess("edit_kkt") && (
                    <TableCell>
                      <IconButton
                        onClick={() =>
                          openModalKktInfo(canEdit("edit_kkt") ? "update_kkt" : "view_kkt", item)
                        }
                      >
                        {canEdit("edit_kkt") ? <Edit /> : <Visibility />}
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {kkt_info_none_active.length > 0 && (
        <Grid
          size={12}
          mb={kkt_info_hist.length ? 0 : 5}
        >
          <Accordion style={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography style={{ fontWeight: "bold" }}>Неактивные кассы</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                      <TableCell style={{ minWidth: "80px" }}>№ кассы</TableCell>
                      <TableCell>РН ККТ</TableCell>
                      <TableCell>ФН</TableCell>
                      <TableCell style={{ minWidth: "200px" }}>Дата регистрации</TableCell>
                      <TableCell style={{ minWidth: "200px" }}>Дата окончания</TableCell>
                      <TableCell style={{ minWidth: "200px" }}>
                        Лицензия ОФД дата завершения
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kkt_info_none_active.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.kassa}</TableCell>
                        <TableCell>{item.rn_kkt}</TableCell>
                        <TableCell>{item.fn}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.date_end}</TableCell>
                        <TableCell>{item.date_license}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}

      {kkt_info_hist.length > 0 && canView("edit_kkt") && (
        <Grid
          size={12}
          mb={5}
        >
          <Accordion style={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography style={{ fontWeight: "bold" }}>История изменений</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>№ кассы</TableCell>
                    <TableCell>Дата / время</TableCell>
                    <TableCell>Сотрудник</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kkt_info_hist.map((it, k) => (
                    <TableRow
                      hover
                      key={k}
                      style={{ cursor: "pointer" }}
                      onClick={() => openHistModal(it.id, it.kkt_id)}
                    >
                      <TableCell>{k + 1}</TableCell>
                      <TableCell>{it.kassa}</TableCell>
                      <TableCell>{it.date_time_update}</TableCell>
                      <TableCell>{it.user_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}
    </Grid>
  );
}
export default CafeEditTabKKT;
