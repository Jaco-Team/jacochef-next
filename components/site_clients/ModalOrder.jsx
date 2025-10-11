"use client";

import { Close, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { memo } from "react";

const ModalOrder = ({ open, onClose, order, order_items, err_order }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"md"}
      fullScreen={false}
    >
      <DialogTitle className="button">
        <Typography
          style={{
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Заказ #{order?.order_id}
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={0}
        >
          <Grid
            size={{
              xs: 12
            }}>
            <span>
              {order?.type_order}: {order?.type_order_addr_new}
            </span>
          </Grid>

          {parseInt(order?.type_order_) == 1 ? (
            parseInt(order?.fake_dom) == 0 ? (
              <Grid
                size={{
                  xs: 12
                }}>
                <b style={{ color: "red", fontWeight: 900 }}>Домофон не работает</b>
              </Grid>
            ) : (
              <Grid
                size={{
                  xs: 12
                }}>
                <b style={{ color: "green", fontWeight: 900 }}>Домофон работает</b>
              </Grid>
            )
          ) : null}
          <Grid
            size={{
              xs: 12
            }}>
            <span>
              {order?.time_order_name}: {order?.time_order}
            </span>
          </Grid>

          {order?.number?.length > 1 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <b>Телефон: </b>
              <span>{order?.number}</span>
            </Grid>
          ) : null}

          {order?.delete_reason?.length > 0 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <span style={{ color: "red" }}>Удален: {order?.date_time_delete}</span>
            </Grid>
          ) : null}
          {order?.delete_reason?.length > 0 ? (
            <Grid
              size={{
                xs: 12
              }}>
              <span style={{ color: "red" }}>{order?.delete_reason}</span>
            </Grid>
          ) : null}

          {parseInt(order?.is_preorder) == 1 ? null : (
            <Grid
              size={{
                xs: 12
              }}>
              <span>
                {"Обещали: " + order?.time_to_client + " / "}
                {order?.text_time}
                {order?.time}
              </span>
            </Grid>
          )}

          {order?.promo_name == null || order?.promo_name?.length == 0 ? null : (
            <>
              <Grid
                size={{
                  xs: 12
                }}>
                <b>Промокод: </b>
                <span>{order?.promo_name}</span>
              </Grid>
              <Grid
                size={{
                  xs: 12
                }}>
                <span className="noSpace">{order?.promo_text}</span>
              </Grid>
            </>
          )}

          {order?.comment == null || order?.comment.length == 0 ? null : (
            <Grid
              size={{
                xs: 12
              }}>
              <b>Комментарий: </b>
              <span>{order?.comment}</span>
            </Grid>
          )}

          {order?.sdacha == null || parseInt(order?.sdacha) == 0 ? null : (
            <Grid
              size={{
                xs: 12
              }}>
              <b>Сдача: </b>
              <span>{order?.sdacha}</span>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12
            }}>
            <b>Сумма заказа: </b>
            <span>{order?.sum_order} р</span>
          </Grid>

          {order?.check_pos_drive == null || !order?.check_pos_drive ? null : (
            <Grid
              size={{
                xs: 12
              }}>
              <b>Довоз оформлен: </b>
              <span>{order?.check_pos_drive?.comment}</span>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12
            }}>
            <Table
              size={"small"}
              style={{ marginTop: 15 }}
            >
              <TableBody>
                {order_items
                  ? order_items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count ? `${item.count} шт` : ""}</TableCell>
                        <TableCell>{item.price ? `${item.price} р` : ""}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold", color: "#000" }}>Сумма заказа</TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {`${order?.sum_order}`} р
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>

          {!err_order ? null : (
            <Grid
              mt={3}
              size={{
                xs: 12
              }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography style={{ fontWeight: "bold" }}>Ошибка</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "20%" }}>Дата создания</TableCell>
                        <TableCell style={{ width: "30%" }}>Проблема</TableCell>
                        <TableCell style={{ width: "30%" }}>Решение</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>{err_order?.date_time_desc}</TableCell>
                        <TableCell>{err_order?.order_desc}</TableCell>
                        <TableCell>{err_order?.text_win}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ModalOrder);
