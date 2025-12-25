"use client";
import { memo } from "react";
import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
} from "@mui/material";
import { Close, ExpandMore } from "@mui/icons-material";
import { formatRUR } from "@/src/helpers/utils/i18n";
import useSortTable from "@/src/hooks/useSortTable";

const DialogUser = ({ open, onClose, user, openOrder }) => {
  // sorting
  const { order, orderBy, handleSort, sortedRows } = useSortTable(user.orders, "date_time");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={false}
      maxWidth={"lg"}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ zIndex: 98 }} // хак, иначе вылазит над бэкдропом
    >
      <DialogTitle className="button">
        <Typography style={{ fontWeight: "bold", alignSelf: "center" }}>
          Информация о клиенте
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 10 }}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Grid container>
              <Grid size={12}>
                <span>Телефон: </span>
                <span>{user?.info?.login}</span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>Имя: </span>
                <span>{user?.info?.name}</span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>Регистрация: </span>
                <span>{user?.info?.date_reg}</span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>День рождения: </span>
                <span>{user?.info?.date_bir}</span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>Заказов: </span>
                <span>
                  {user?.info?.all_count_order} / {formatRUR(user?.info?.summ)}
                </span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>Доставок: </span>
                <span>
                  {user?.info?.count_dev} / {formatRUR(user?.info?.summ_dev)}
                </span>
              </Grid>
              <Grid
                style={{ paddingTop: 12 }}
                size={12}
              >
                <span>Самовывозов: </span>
                <span>
                  {user?.info?.count_pic} / {formatRUR(user?.info?.summ_pic)}
                </span>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 8,
            }}
          >
            <Accordion style={{ width: "100%" }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Заказы</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={orderBy === "point" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "point"}
                            direction={orderBy === "point" ? order : "asc"}
                            onClick={() => handleSort("point")}
                          >
                            Точка
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "new_type_order" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "new_type_order"}
                            direction={orderBy === "new_type_order" ? order : "asc"}
                            onClick={() => handleSort("new_type_order")}
                          >
                            Тип заказа
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "date_time" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "date_time"}
                            direction={orderBy === "date_time" ? order : "asc"}
                            onClick={() => handleSort("date_time")}
                          >
                            Дата
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "order_id" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "order_id"}
                            direction={orderBy === "order_id" ? order : "asc"}
                            onClick={() => handleSort("order_id")}
                          >
                            Номер
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "summ" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "summ"}
                            direction={orderBy === "summ" ? order : "asc"}
                            onClick={() => handleSort("summ")}
                          >
                            Сумма
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRows.map((item) => (
                        <TableRow
                          key={item.order_id}
                          hover
                          style={{ cursor: "pointer" }}
                          onClick={() => openOrder(item.point_id, item.order_id)}
                        >
                          <TableCell>{item.point}</TableCell>
                          <TableCell>{item.new_type_order}</TableCell>
                          <TableCell>{item.date_time}</TableCell>
                          <TableCell>#{item.order_id}</TableCell>
                          <TableCell>{formatRUR(item.summ)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DialogUser);
