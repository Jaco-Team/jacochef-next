import React, { useState } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyCheckBox, MyTextInput, MyDatePickerNew, MyAutocomplite } from "@/ui/Forms";

import Dropzone from "dropzone";
import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { SiteItemsModalTech } from "@/components/site_items_new/site_items_tech_modal";
import { TableSortLabel } from "@mui/material";

function roundTo(n, digits) {
  if (n.length == 0) {
    return n;
  }

  var negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
    n = (n * -1).toFixed(digits);
  }
  return n;
}

class SiteItems_Modal_History_View_Tech extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView,
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, itemName, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>
            Изменения в{itemName ? `: ${itemName}` : ""}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
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
              <MyTextInput
                label="Наименование"
                value={
                  this.state.itemView
                    ? this.state.itemView.name?.color
                      ? this.state.itemView.name.key
                      : this.state.itemView.name
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.name?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <MyTextInput
                label="Действует с"
                value={
                  this.state.itemView
                    ? this.state.itemView.date_start?.color
                      ? this.state.itemView.date_start.key
                      : this.state.itemView.date_start
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.date_start?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <MyTextInput
                label="по"
                value={
                  this.state.itemView
                    ? this.state.itemView.date_end?.color
                      ? this.state.itemView.date_end.key
                      : this.state.itemView.date_end
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.date_end?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Код 1С"
                value={
                  this.state.itemView
                    ? this.state.itemView.art?.color
                      ? this.state.itemView.art.key
                      : this.state.itemView.art
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.art?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Категория"
                value={
                  this.state.itemView
                    ? this.state.itemView.category_name?.color
                      ? this.state.itemView.category_name.key
                      : this.state.itemView.category_name
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.category_name?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <MyTextInput
                label="Кусочков или размер"
                value={
                  this.state.itemView
                    ? this.state.itemView.count_part?.color
                      ? this.state.itemView.count_part.key
                      : this.state.itemView.count_part
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.count_part?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <MyTextInput
                label="Стол"
                value={
                  this.state.itemView
                    ? this.state.itemView.stol?.color
                      ? this.state.itemView.stol.key
                      : this.state.itemView.stol
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.stol?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Вес"
                value={
                  this.state.itemView
                    ? this.state.itemView.weight?.color
                      ? this.state.itemView.weight.key
                      : this.state.itemView.weight
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.weight?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Установить цену"
                value={
                  this.state.itemView
                    ? this.state.itemView.is_price?.color
                      ? this.state.itemView.is_price.key
                      : this.state.itemView.is_price
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.is_price?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Активность"
                value={
                  this.state.itemView
                    ? this.state.itemView.is_show?.color
                      ? this.state.itemView.is_show.key
                      : this.state.itemView.is_show
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.is_show?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            />
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Белки"
                value={
                  this.state.itemView
                    ? this.state.itemView.protein?.color
                      ? this.state.itemView.protein.key
                      : this.state.itemView.protein
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.protein?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Жиры"
                value={
                  this.state.itemView
                    ? this.state.itemView.fat?.color
                      ? this.state.itemView.fat.key
                      : this.state.itemView.fat
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.fat?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Углеводы"
                value={
                  this.state.itemView
                    ? this.state.itemView.carbohydrates?.color
                      ? this.state.itemView.carbohydrates.key
                      : this.state.itemView.carbohydrates
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.carbohydrates?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            />
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Время на 1 этап"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_stage_1?.color
                      ? this.state.itemView.time_stage_1.key
                      : this.state.itemView.time_stage_1
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_stage_1?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Время на 2 этап"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_stage_2?.color
                      ? this.state.itemView.time_stage_2.key
                      : this.state.itemView.time_stage_2
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_stage_2?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Время на 3 этап"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_stage_3?.color
                      ? this.state.itemView.time_stage_3.key
                      : this.state.itemView.time_stage_3
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_stage_3?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell width="30%">Номенклатура</TableCell>
                    <TableCell>Единица измерения</TableCell>
                    <TableCell>Брутто</TableCell>
                    <TableCell>% потери при ХО</TableCell>
                    <TableCell>Нетто</TableCell>
                    <TableCell>% потери при ГО</TableCell>
                    <TableCell>Выход</TableCell>
                    <TableCell>Этапы</TableCell>
                  </TableRow>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell colSpan={8}>Заготовки</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.itemView?.stage_1.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <MyTextInput
                          value={item.name?.color ? item.name.key : item.name}
                          disabled={true}
                          className={
                            item.name?.color
                              ? item.name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                          disabled={true}
                          className={
                            item.ei_name?.color
                              ? item.ei_name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto?.color ? item.brutto.key : item.brutto}
                          disabled={true}
                          className={
                            item.brutto?.color
                              ? item.brutto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                          disabled={true}
                          className={
                            item.pr_1?.color
                              ? item.pr_1.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto?.color ? item.netto.key : item.netto}
                          disabled={true}
                          className={
                            item.netto?.color
                              ? item.netto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                          disabled={true}
                          className={
                            item.pr_2?.color
                              ? item.pr_2.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res?.color ? item.res.key : item.res}
                          disabled={true}
                          className={
                            item.res?.color
                              ? item.res.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.stage?.color ? item.stage.key : item.stage}
                          disabled={true}
                          className={
                            item.stage?.color
                              ? item.stage.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {this.state.itemView?.stage_2.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <MyTextInput
                          value={item.name?.color ? item.name.key : item.name}
                          disabled={true}
                          className={
                            item.name?.color
                              ? item.name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                          disabled={true}
                          className={
                            item.ei_name?.color
                              ? item.ei_name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto?.color ? item.brutto.key : item.brutto}
                          disabled={true}
                          className={
                            item.brutto?.color
                              ? item.brutto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                          disabled={true}
                          className={
                            item.pr_1?.color
                              ? item.pr_1.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto?.color ? item.netto.key : item.netto}
                          disabled={true}
                          className={
                            item.netto?.color
                              ? item.netto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                          disabled={true}
                          className={
                            item.pr_2?.color
                              ? item.pr_2.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res?.color ? item.res.key : item.res}
                          disabled={true}
                          className={
                            item.res?.color
                              ? item.res.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.stage?.color ? item.stage.key : item.stage}
                          disabled={true}
                          className={
                            item.stage?.color
                              ? item.stage.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {this.state.itemView?.stage_3.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <MyTextInput
                          value={item.name?.color ? item.name.key : item.name}
                          disabled={true}
                          className={
                            item.name?.color
                              ? item.name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.ei_name?.color ? item.ei_name.key : item.ei_name}
                          disabled={true}
                          className={
                            item.ei_name?.color
                              ? item.ei_name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto?.color ? item.brutto.key : item.brutto}
                          disabled={true}
                          className={
                            item.brutto?.color
                              ? item.brutto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                          disabled={true}
                          className={
                            item.pr_1?.color
                              ? item.pr_1.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto?.color ? item.netto.key : item.netto}
                          disabled={true}
                          className={
                            item.netto?.color
                              ? item.netto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                          disabled={true}
                          className={
                            item.pr_2?.color
                              ? item.pr_2.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res?.color ? item.res.key : item.res}
                          disabled={true}
                          className={
                            item.res?.color
                              ? item.res.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.stage?.color ? item.stage.key : item.stage}
                          disabled={true}
                          className={
                            item.stage?.color
                              ? item.stage.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                    <TableCell colSpan={8}>Позиции</TableCell>
                  </TableRow>
                  {this.state.itemView?.items.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell colSpan={2}>
                        <MyTextInput
                          value={item.name?.color ? item.name.key : item.name}
                          disabled={true}
                          className={
                            item.name?.color
                              ? item.name.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto?.color ? item.brutto.key : item.brutto}
                          disabled={true}
                          className={
                            item.brutto?.color
                              ? item.brutto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1?.color ? item.pr_1.key : item.pr_1}
                          disabled={true}
                          className={
                            item.pr_1?.color
                              ? item.pr_1.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto?.color ? item.netto.key : item.netto}
                          disabled={true}
                          className={
                            item.netto?.color
                              ? item.netto.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2?.color ? item.pr_2.key : item.pr_2}
                          disabled={true}
                          className={
                            item.pr_2?.color
                              ? item.pr_2.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res?.color ? item.res.key : item.res}
                          disabled={true}
                          className={
                            item.res?.color
                              ? item.res.color === "true"
                                ? "disabled_input disabled_input_color"
                                : "disabled_input disabled_input_color_delete"
                              : "disabled_input"
                          }
                        />
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell>
                      <MyTextInput
                        value={
                          this.state.itemView
                            ? this.state.itemView.all_w_brutto?.color
                              ? this.state.itemView.all_w_brutto.key
                              : this.state.itemView.all_w_brutto
                            : ""
                        }
                        disabled={true}
                        className={
                          this.state.itemView
                            ? this.state.itemView.all_w_brutto?.color
                              ? "disabled_input disabled_input_color"
                              : "disabled_input"
                            : "disabled_input"
                        }
                      />
                    </TableCell>
                    <TableCell colSpan={1} />
                    <TableCell>
                      <MyTextInput
                        value={
                          this.state.itemView
                            ? this.state.itemView.all_w_netto?.color
                              ? this.state.itemView.all_w_netto.key
                              : this.state.itemView.all_w_netto
                            : ""
                        }
                        disabled={true}
                        className={
                          this.state.itemView
                            ? this.state.itemView.all_w_netto?.color
                              ? "disabled_input disabled_input_color"
                              : "disabled_input"
                            : "disabled_input"
                        }
                      />
                    </TableCell>
                    <TableCell colSpan={1} />
                    <TableCell>
                      <MyTextInput
                        value={
                          this.state.itemView
                            ? this.state.itemView.all_w?.color
                              ? this.state.itemView.all_w.key
                              : this.state.itemView.all_w
                            : ""
                        }
                        disabled={true}
                        className={
                          this.state.itemView
                            ? this.state.itemView.all_w?.color
                              ? "disabled_input disabled_input_color"
                              : "disabled_input"
                            : "disabled_input"
                        }
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={this.onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteItems_Modal_History_View_Mark extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView,
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, itemName, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>
            Изменения в{itemName ? `: ${itemName}` : ""}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyTextInput
                label="Действует с"
                value={
                  this.state.itemView
                    ? this.state.itemView.date_start?.color
                      ? this.state.itemView.date_start.key
                      : this.state.itemView.date_start
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.date_start?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Состав"
                value={
                  this.state.itemView
                    ? this.state.itemView.tmp_desc?.color
                      ? this.state.itemView.tmp_desc.key
                      : this.state.itemView.tmp_desc
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.tmp_desc?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Теги"
                multiple={true}
                disabled={true}
                data={this.state.itemView?.tags_all?.key}
                value={this.state.itemView?.tags?.key}
                className={
                  this.state.itemView
                    ? this.state.itemView.tags?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Короткое описание (в карточке)"
                value={
                  this.state.itemView
                    ? this.state.itemView.marc_desc?.color
                      ? this.state.itemView.marc_desc.key
                      : this.state.itemView.marc_desc
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.marc_desc?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Полное описание (в карточке)"
                value={
                  this.state.itemView
                    ? this.state.itemView.marc_desc_full?.color
                      ? this.state.itemView.marc_desc_full.key
                      : this.state.itemView.marc_desc_full
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.marc_desc_full?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="На кассе"
                value={
                  this.state.itemView
                    ? this.state.itemView.show_program?.color
                      ? this.state.itemView.show_program.key
                      : this.state.itemView.show_program
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.show_program?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Новинка"
                value={
                  this.state.itemView
                    ? this.state.itemView.is_new?.color
                      ? this.state.itemView.is_new.key
                      : this.state.itemView.is_new
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.is_new?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Сортировка"
                value={
                  this.state.itemView
                    ? this.state.itemView.sort?.color
                      ? this.state.itemView.sort.key
                      : this.state.itemView.sort
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.sort?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="На сайте и КЦ"
                value={
                  this.state.itemView
                    ? this.state.itemView.show_site?.color
                      ? this.state.itemView.show_site.key
                      : this.state.itemView.show_site
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.show_site?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Хит"
                value={
                  this.state.itemView
                    ? this.state.itemView.is_hit?.color
                      ? this.state.itemView.is_hit.key
                      : this.state.itemView.is_hit
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.is_hit?.color
                      ? "disabled_input disabled_input_color"
                      : "disabled_input"
                    : "disabled_input"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <Typography
                    style={{
                      backgroundColor: this.state.itemView
                        ? this.state.itemView?.img_app.length > 0
                          ? this.state.itemView?.img_new_update?.color
                            ? "#fadadd"
                            : "#fff"
                          : "#fff"
                        : "#fff",
                    }}
                  >
                    {this.state.itemView
                      ? this.state.itemView?.img_app.length > 0
                        ? this.state.itemView?.img_new_update?.color
                          ? "Картинка была изменена на:"
                          : "Картинка не была изменена"
                        : "Картинка отсутствует"
                      : "Картинка отсутствует"}
                  </Typography>
                </Grid>

                {this.state.itemView ? (
                  this.state.itemView?.img_app.length > 0 ? (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <picture>
                        <source
                          srcSet={`https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_276x276.jpg 138w, 
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_292x292.jpg 146w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_366x366.jpg 183w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_466x466.jpg 233w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_585x585.jpg 292w
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_732x732.jpg 366w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_1168x1168.jpg 584w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_1420x1420.jpg 760w,
                                  https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_2000x2000.jpg 1875w`}
                          sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px"
                        />
                        <img
                          style={{ maxHeight: 300 }}
                          src={`https://storage.yandexcloud.net/site-img/${this.state.itemView.img_app}_276x276.jpg`}
                        />
                      </picture>
                    </Grid>
                  ) : null
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={this.onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteItems_Modal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  onClose() {
    setTimeout(() => {
      this.setState({
        item: [],
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={"xl"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: "center" }}>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ""}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              aria-label="sticky table"
            >
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell style={{ width: "2%" }}>#</TableCell>
                  <TableCell style={{ width: "19%" }}>Наименование</TableCell>
                  <TableCell style={{ width: "18%" }}>Действует с</TableCell>
                  <TableCell style={{ width: "18%" }}>Дата редактирования</TableCell>
                  <TableCell style={{ width: "20%" }}>Редактор</TableCell>
                  <TableCell style={{ width: "5%" }}>Просмотр</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow
                    key={key}
                    hover
                  >
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.date_start}</TableCell>
                    <TableCell>{it.date_update}</TableCell>
                    <TableCell>{it.user}</TableCell>
                    <TableCell
                      style={{ cursor: "pointer" }}
                      onClick={this.props.openModalHistoryView.bind(this, key)}
                    >
                      <TextSnippetOutlinedIcon />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onClose.bind(this)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SiteItems_Modal_Mark extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://apichef.jacochef.ru/api/site_setting/upload_banner",
  };

  myDropzoneNew = null;
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      date_start: null,
      date_end: null,
      tmp_desc: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
      openAlert: false,
      err_status: true,
      err_text: "",
      tags_all: [],
      tags_my: [],
      modalNewTag: "",
      tag_name_new: "",
    };
  }

  // Метод для валидации размеров изображения

  componentDidUpdate(prevProps) {
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      const tags = [{ id: -1, name: "Новый" }, ...this.props.item?.tags_all];
      this.setState({
        date_start: this.props.item?.date_start ? formatDate(this.props.item.date_start) : null,
        date_end: this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
        tmp_desc: this.props.item?.tmp_desc,
        marc_desc: this.props.item?.marc_desc,
        marc_desc_full: this.props.item?.marc_desc_full,
        is_hit: parseInt(this.props.item?.is_hit) ? 1 : 0,
        is_new: parseInt(this.props.item?.is_new) ? 1 : 0,
        show_program: parseInt(this.props.item?.show_program) ? 1 : 0,
        show_site: parseInt(this.props.item?.show_site) ? 1 : 0,
        img_app: this.props.item?.img_app ?? "",
        tags_all: tags ?? [],
        tags_my: this.props.item?.tags,
      });

      setTimeout(() => {
        this.myDropzone = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
      }, 300);
    }
  }

  changeItem(type, event, data) {
    this.setState({
      [type]: data ? data : event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  async save() {
    if (!this.click) {
      this.click = true;

      const data = {
        date_start: this.state.date_start ? dayjs(this.state.date_start).format("YYYY-MM-DD") : "",
        date_end: this.state.date_end ? dayjs(this.state.date_end).format("YYYY-MM-DD") : "",
        tmp_desc: this.state.tmp_desc,
        marc_desc: this.state.marc_desc,
        marc_desc_full: this.state.marc_desc_full,
        is_hit: this.state.is_hit,
        is_new: this.state.is_new,
        show_program: this.state.show_program,
        show_site: this.state.show_site,
        img_app: this.state.img_app,
        id: this.props.item.id,
        name: this.props.item.name,
        link: this.props.item.link,
        category_id: this.props.item.category_id,
        weight: this.props.item.weight,
        stol: this.props.item.stol,
        type: this.props.item.type,
        tags: this.state.tags_my,
        type_save: "mark",
      };

      const res = await this.props.getData("save_edit", data);

      if (res.st === false) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        if (this.myDropzone["files"].length > 0) {
          if (this.myDropzone["files"].length > 0 && this.isInit === false) {
            this.isInit = true;

            let name = this.props.item.name,
              id = this.props.item.id,
              type = "new";

            this.myDropzone.on("sending", (file, xhr, data) => {
              let file_type = file.name.split(".");
              file_type = file_type[file_type.length - 1];
              file_type = file_type.toLowerCase();

              data.append("type", "mini");
              data.append("name", name + "site_items");
              data.append("login", localStorage.getItem("token"));
              data.append("id", id);
            });

            this.myDropzone.on("queuecomplete", (data) => {
              var check_img = false;

              this.myDropzone["files"].map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
              } else {
                setTimeout(() => {
                  this.onClose(true);
                  this.props.update();
                }, 1000);
              }

              this.isInit = false;
            });
          }

          this.myDropzone.processQueue();
        } else {
          this.onClose(true);
          this.props.update();
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }

    this.onClose();
  }

  openNewTag() {
    this.setState({
      modalNewTag: true,
      tag_name_new: "",
    });
  }

  onClose() {
    this.setState({
      date_start: null,
      date_end: null,
      tmp_desc: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
    });

    this.props.onClose();
  }

  changeAutocomplite(data, event, value) {
    let check = value.find((item) => parseInt(item.id) === -1);

    if (check) {
      this.openNewTag();

      return;
    } else {
      this.setState({
        [data]: value,
      });
    }
  }

  async saveNewTag() {
    let data = {
      name: this.state.tag_name_new,
    };

    let res = await this.props.getData("saveNewTag", data);

    if (res.st === true) {
      this.setState({
        tags_all: res.tags_all,
        modalNewTag: false,
      });
    }
  }

  render() {
    const { open, method, fullScreen } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.modalNewTag ? (
          <Dialog
            maxWidth={"sm"}
            fullWidth={true}
            open={this.state.modalNewTag}
            onClose={() => this.setState({ modalNewTag: false })}
          >
            <DialogTitle className="button">
              <Typography style={{ alignSelf: "center" }}>Новый тег</Typography>
              <IconButton onClick={() => this.setState({ modalNewTag: false })}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <MyTextInput
                    label=""
                    value={this.state.tag_name_new}
                    func={this.changeItem.bind(this, "tag_name_new")}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ modalNewTag: false })}>Отмена</Button>
              <Button
                type="submit"
                onClick={this.saveNewTag.bind(this)}
              >
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={"lg"}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography>Описание блюда</Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography>{method}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyDatePickerNew
                  label="Действует с"
                  value={this.state.date_start}
                  disabled={!this.props.acces?.date_start_edit}
                  minDate={dayjs(new Date())}
                  func={this.changeDateRange.bind(this, "date_start")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Состав"
                  value={this.state.tmp_desc}
                  disabled={!this.props.acces?.tmp_desc_edit}
                  func={this.changeItem.bind(this, "tmp_desc")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <MyAutocomplite
                  label="Теги"
                  multiple={true}
                  data={this.state.tags_all}
                  value={this.state.tags_my}
                  func={this.changeAutocomplite.bind(this, "tags_my")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Короткое описание (в карточке)"
                  value={this.state.marc_desc}
                  disabled={!this.props.acces?.marc_desc_edit}
                  func={this.changeItem.bind(this, "marc_desc")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Полное описание (в карточке)"
                  value={this.state.marc_desc_full}
                  disabled={!this.props.acces?.marc_desc_full_edit}
                  func={this.changeItem.bind(this, "marc_desc_full")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="На кассе"
                  value={parseInt(this.state.show_program) == 1 ? true : false}
                  disabled={!this.props.acces?.show_program_edit}
                  func={this.changeItemChecked.bind(this, "show_program")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="Новинка"
                  value={parseInt(this.state.is_new) == 1 ? true : false}
                  disabled={!this.props.acces?.is_new_edit}
                  func={this.changeItemChecked.bind(this, "is_new")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              />
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="На сайте и КЦ"
                  value={parseInt(this.state.show_site) == 1 ? true : false}
                  disabled={!this.props.acces?.show_site_edit}
                  func={this.changeItemChecked.bind(this, "show_site")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="Хит"
                  value={parseInt(this.state.is_hit) == 1 ? true : false}
                  disabled={!this.props.acces?.is_hit_edit}
                  func={this.changeItemChecked.bind(this, "is_hit")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography>
                      Картинка соотношением сторон 600х400 или 300х200 только JPG
                    </Typography>
                  </Grid>
                  {this.state.img_app.length > 0 ? (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <img
                        style={{ maxHeight: 300, maxWidth: 400 }}
                        src={`https://storage.yandexcloud.net/site-home-img/${this.state.img_app}site_items_600x400.jpg?date_update=${this.props.item.img_new_update}`}
                      />
                    </Grid>
                  ) : null}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <div
                      className="dropzone"
                      id="for_img_edit_new"
                      style={{
                        width: "100%",
                        minHeight: 150,
                        ...(!this.props.acces?.dropzone_edit
                          ? {
                              pointerEvents: "none",
                              cursor: "not-allowed",
                              filter: "grayscale(50%)",
                            }
                          : {}),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={this.save.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const ModalEditTags = ({ open, onClose, save, title = "Редактирование тэгов", tags }) => {
  const [chooseTag, setChooseTag] = useState({});
  const [name, setName] = useState("");

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogTitle className="button">
        <Typography>{title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <MyAutocomplite
          label="Теги"
          multiple={false}
          data={tags}
          value={chooseTag}
          func={(data, value) => {
            (setChooseTag(value), setName(value.name));
          }}
        />
      </DialogContent>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <MyTextInput
          label="Новое название"
          value={name}
          func={(event) => {
            setName(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={() => save(chooseTag, name)}>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  );
};

class SiteItems_Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openChange: false,
      itemId: 1,
      cats: this.props.cats || [],
      sortField: "name",
      sortOrder: "asc",
      type: "",
    };
  }

  componentDidUpdate(prevProps) {
    // Обновляем состояние только если изменились данные и они не равны текущим
    if (prevProps.cats !== this.props.cats && this.props.cats) {
      this.setState({
        cats: this.props.cats,
        sortField: "name",
        sortOrder: "asc",
      });
    }
  }

  // Удалить shouldComponentUpdate или исправить:
  shouldComponentUpdate(nextProps, nextState) {
    // Проверяем, изменились ли пропсы или состояние
    if (this.props.timeUpdate !== nextProps.timeUpdate) return true;
    if (this.state.sortField !== nextState.sortField) return true;
    if (this.state.sortOrder !== nextState.sortOrder) return true;
    if (JSON.stringify(this.state.cats) !== JSON.stringify(nextState.cats)) return true;
    if (this.props.user_app !== nextProps.user_app) return true;
    if (this.props.acces !== nextProps.acces) return true;

    return false;
  }

  handleSort = (field) => {
    let sortOrder = "asc";
    if (this.state.sortField === field) {
      sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
    }

    const sortedData = [...this.state.cats];

    sortedData.forEach((category) => {
      if (category.items && Array.isArray(category.items)) {
        category.items.sort((a, b) => {
          let valueA = this.prepareValueForSort(a[field], field);
          let valueB = this.prepareValueForSort(b[field], field);

          if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
          if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
    });

    // Также сортируем категории, если нужно
    if (field === "name") {
      sortedData.sort((a, b) => {
        let valueA = this.prepareValueForSort(a[field], field);
        let valueB = this.prepareValueForSort(b[field], field);

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    this.setState({
      cats: sortedData,
      sortField: field,
      sortOrder: sortOrder,
    });
  };

  prepareValueForSort = (value, field) => {
    if (value === null || value === undefined) return "";
    if (value === "") return "";

    switch (field) {
      case "name":
        return value.toString().toLowerCase();

      case "date_start":
      case "date_update":
        if (typeof value === "string") {
          const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (isoMatch) {
            const [_, year, month, day] = isoMatch;
            return new Date(year, month - 1, day).getTime();
          }

          const ruMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
          if (ruMatch) {
            const [_, day, month, year] = ruMatch;
            return new Date(year, month - 1, day).getTime();
          }
        }
        return 0;

      case "sort":
        return parseInt(value) || 0;

      case "weight":
        return parseFloat(value) || 0;

      case "id":
        return parseInt(value) || 0;

      default:
        if (typeof value === "number") return value;
        return value.toString().toLowerCase();
    }
  };

  getSortProps = (field) => ({
    active: this.state.sortField === field,
    direction: this.state.sortField === field ? this.state.sortOrder : "asc",
    onClick: () => this.handleSort(field),
  });

  render() {
    const { cats, user_app, acces } = this.props;
    const { changeSort, saveSort, changeTableCheck, openItem, openHistoryItem } = this.props;

    return (
      <Grid
        style={{ paddingBottom: "50px" }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        {this.state.cats.map((cat, key) => (
          <Accordion key={key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {cat.name}
                {cat.items ? ` (${cat.items.length})` : ""}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="accordion_details">
              <TableContainer
                component={Paper}
                sx={{ maxHeight: { xs: "none", sm: 600 } }}
              >
                <Table
                  stickyHeader
                  aria-label="sticky table"
                >
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                      <TableCell style={{ width: "1%" }}>№</TableCell>

                      {(acces?.site_kc_edit || acces?.site_kc_view) && (
                        <TableCell style={{ width: "11%" }}>
                          <TableSortLabel
                            {...this.getSortProps(
                              user_app === "technologist" ? "is_show" : "show_site",
                            )}
                          >
                            {user_app === "technologist" ? "Активность" : "Сайт и КЦ"}
                          </TableSortLabel>
                        </TableCell>
                      )}

                      {(acces?.kassa_edit || acces?.kassa_view) && (
                        <TableCell style={{ width: "11%" }}>
                          <TableSortLabel {...this.getSortProps("show_program")}>
                            Касса
                          </TableSortLabel>
                        </TableCell>
                      )}

                      {user_app === "marketing" && (
                        <TableCell style={{ width: "11%" }}>
                          <TableSortLabel {...this.getSortProps("sort")}>Сортировка</TableSortLabel>
                        </TableCell>
                      )}

                      <TableCell style={{ width: "11%" }}>
                        <TableSortLabel {...this.getSortProps("name")}>Название</TableSortLabel>
                      </TableCell>

                      <TableCell style={{ width: "11%" }}>
                        <TableSortLabel {...this.getSortProps("date_start")}>
                          Действует с
                        </TableSortLabel>
                      </TableCell>

                      <TableCell style={{ width: "11%" }}>
                        <TableSortLabel {...this.getSortProps("date_end")}>по</TableSortLabel>
                      </TableCell>

                      <TableCell style={{ width: "11%" }}>
                        <TableSortLabel {...this.getSortProps("date_update")}>
                          Обновление
                        </TableSortLabel>
                      </TableCell>

                      {user_app === "technologist" && (
                        <TableCell style={{ width: "11%" }}>
                          <TableSortLabel {...this.getSortProps("art")}>Код для 1С</TableSortLabel>
                        </TableCell>
                      )}

                      <TableCell style={{ width: "11%" }}>Редактирование</TableCell>
                      <TableCell style={{ width: "11%" }}>История изменений</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {cat.items &&
                      cat.items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>{index + 1}</TableCell>

                          {(acces?.site_kc_edit || acces?.site_kc_view) && (
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={
                                  parseInt(
                                    user_app === "technologist" ? item.is_show : item.show_site,
                                  ) === 1
                                }
                                func={changeTableCheck.bind(
                                  this,
                                  key,
                                  index,
                                  item.id,
                                  user_app === "technologist" ? "is_show" : "show_site",
                                )}
                              />
                            </TableCell>
                          )}

                          {(acces?.kassa_edit || acces?.kassa_view) && (
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(item.show_program) === 1}
                                func={changeTableCheck.bind(
                                  this,
                                  key,
                                  index,
                                  item.id,
                                  "show_program",
                                )}
                              />
                            </TableCell>
                          )}

                          {user_app === "marketing" && (
                            <TableCell>
                              <MyTextInput
                                label=""
                                value={item.sort}
                                func={changeSort.bind(this, key, index)}
                                onBlur={saveSort.bind(this, item.id, "sort")}
                              />
                            </TableCell>
                          )}

                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.date_start}</TableCell>
                          <TableCell>{item.date_end}</TableCell>
                          <TableCell>{item.date_update || item.update_item}</TableCell>

                          {user_app === "technologist" && <TableCell>{item.art}</TableCell>}

                          <TableCell
                            style={{ cursor: "pointer" }}
                            onClick={openItem.bind(this, item.id, item.name)}
                          >
                            <EditIcon />
                          </TableCell>

                          <TableCell
                            style={{ cursor: "pointer" }}
                            onClick={openHistoryItem.bind(this, item.id, "История изменений")}
                          >
                            <EditNoteIcon />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    );
  }
}

class SiteItems_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "site_items_new",
      module_name: "",
      is_load: false,

      user_app: "",

      cats: [],
      confirmDialog: false,
      timeUpdate: new Date(),
      fullScreen: false,

      openAlert: false,
      err_status: false,
      err_text: "",

      modalDialogTech: false,
      itemTech: null,
      modalChangeTags: false,

      modalDialogMark: false,
      itemMark: null,

      modalDialogHist: false,
      itemHist: null,
      tags: [],
      modalEditTags: false,

      modalDialogView_Mark: false,
      itemView_Mark: null,

      modalDialogView: false,
      itemView: null,
      acces: {},

      items_stage: null,
      item_items: null,

      category: [],
      stages: [],
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      acces: data.acces,
      user_app: data.user_app,
      timeUpdate: new Date(),
      tags: data.tags,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 750);
      });

    return res;
  };

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      cats: data.cats,
      user_app: data.user_app,
      timeUpdate: new Date(),
      tags: data.tags,
    });
  }

  async openItemNew(method) {
    this.handleResize();

    let res = await this.getData("get_all_for_new_tech");

    res.items_stage.not_stage = [];
    const stages = [
      { id: "1", name: "1 этап" },
      { id: "2", name: "2 этап" },
      { id: "3", name: "3 этап" },
    ];
    res.item.category_id = "";
    res.item.tags_all = res?.tags_all;

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      stages,
    });
  }

  async openItemTech(id, method) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_tech", data);

    res.items_stage.stage_1.map((it) => {
      let value;

      if (it.type === "rec") {
        value = res.items_stage.all.find(
          (item) => item.type === "rec" && parseInt(item.id) === parseInt(it.rec_id),
        );
      } else {
        value = res.items_stage.all.find(
          (item) => item.type === "pf" && parseInt(item.id) === parseInt(it.pf_id),
        );
      }

      if (value) {
        it.type_id = { id: value.id, name: value.name };
      } else {
        it.type_id = { id: "", name: it.name };
      }
    });

    res.items_stage.stage_2.map((it) => {
      let value;

      if (it.type === "rec") {
        value = res.items_stage.all.find(
          (item) => item.type === "rec" && parseInt(item.id) === parseInt(it.rec_id),
        );
      } else {
        value = res.items_stage.all.find(
          (item) => item.type === "pf" && parseInt(item.id) === parseInt(it.pf_id),
        );
      }

      if (value) {
        it.type_id = { id: value.id, name: value.name };
      } else {
        it.type_id = { id: "", name: it.name };
      }
    });

    res.items_stage.stage_3.map((it) => {
      let value;

      if (it.type === "rec") {
        value = res.items_stage.all.find(
          (item) => item.type === "rec" && parseInt(item.id) === parseInt(it.rec_id),
        );
      } else {
        value = res.items_stage.all.find(
          (item) => item.type === "pf" && parseInt(item.id) === parseInt(it.pf_id),
        );
      }

      if (value) {
        it.type_id = { id: value.id, name: value.name };
      } else {
        it.type_id = { id: "", name: it.name };
      }
    });

    res.items_stage.not_stage = [];

    res.item_items.this_items.map((it) => {
      const value = res.item_items.all_items.find(
        (item) => parseInt(item.id) === parseInt(it.item_id),
      );
      it.item_id = { id: value.id, name: value.name };
      return it;
    });

    const stages = [
      { id: "1", name: "1 этап" },
      { id: "2", name: "2 этап" },
      { id: "3", name: "3 этап" },
    ];
    res.item.tags_all = res.tags_all;

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      tags_all: res.tags_all,
      stages,
    });
  }

  async openItemMark(id, method) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_mark", data);
    res.item.tags_all = res?.tags_all;
    this.setState({
      itemMark: res.item,
      modalDialogTech: true,
      method,
    });
  }

  async updateVK() {
    this.setState({
      confirmDialog: false,
    });

    await this.getData("updateVK", {});
  }

  changeSort(key_cat, key_item, event) {
    const value = event.target.value;
    let cats = this.state.cats;

    cats[key_cat]["items"][key_item]["sort"] = value;

    this.setState({
      cats,
      timeUpdate: new Date(),
    });
  }

  async saveSort(id, type, event) {
    const value = event.target.value;

    const data = {
      id,
      type,
      value,
    };

    await this.getData("save_check", data);
  }

  async changeTableCheck(key_cat, key_item, id, type, event, val) {
    const value = val ? 1 : 0;

    let cats = this.state.cats;
    cats[key_cat]["items"][key_item][type] = value;

    this.setState({
      cats,
      timeUpdate: new Date(),
    });

    const data = {
      id,
      type,
      value,
    };

    const res = await this.getData("save_check", data);

    // setTimeout(() => {
    //   this.update();
    // }, 300);
  }

  async saveTech(item_) {
    const method = this.state.method;

    const item = JSON.parse(JSON.stringify(item_));

    item.item_items.this_items = item.item_items.this_items.map((it) => {
      it.item_id = it.item_id.id;
      return it;
    });

    const pf_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const data = {
      ...item,
      pf_stage_1,
      pf_stage_2,
      pf_stage_3,
      rec_stage_1,
      rec_stage_2,
      rec_stage_3,
    };

    let res;

    if (method === "Новое блюдо") {
      res = await this.getData("save_new", data);
    } else {
      res = await this.getData("save_edit", data);
    }

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialogTech: false,
        itemTech: null,
      });

      setTimeout(async () => {
        this.update();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
    return res;
  }

  async openHistoryMark(id, method) {
    this.handleResize();

    const data = {
      item_id: id,
    };

    let res;

    res = await this.getData("get_one_hist_mark", data);

    if (res.hist.length) {
      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_update = res?.hist[index + 1]?.date_start ?? "";
          return hist;
        });
      }

      this.setState({
        modalDialogHist: true,
        itemHist: res.hist,
        itemName: res.hist[0].name,
        method,
      });
    } else {
      const data = {
        id,
      };

      res = await this.getData("get_one_mark", data);

      this.setState({
        modalDialogHist: true,
        itemHist: [res.item],
        itemName: res.item.name,
        method,
      });
    }
  }

  async openHistoryTech(id, method, type) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_hist_tech", data);

    if (res.hist.length) {
      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_update = res?.hist[index + 1]?.date_start ?? "";
          return hist;
        });
      }

      this.setState({
        modalDialogHist: true,
        itemHist: res.hist,
        itemName: res.hist[0].name,
        method,
      });
    } else {
      const data = {
        id,
      };

      const res = await this.getData("get_one_tech", data);

      res.item.items = res.item_items.this_items;
      res.item.stage_1 = res.items_stage.stage_1;
      res.item.stage_2 = res.items_stage.stage_2;
      res.item.stage_3 = res.items_stage.stage_3;

      if (res.item.category_id) {
        res.item.category_name =
          res.cat_list.find((cat) => parseInt(cat.id) === parseInt(res.item.category_id))?.name ??
          "";
      } else {
        res.item.category_name =
          res.cat_list.find((cat) => parseInt(cat.id) === parseInt(res.item.category_id2))?.name ??
          "";
      }

      this.setState({
        modalDialogHist: true,
        itemHist: [res.item],
        itemName: res.item.name,
        method,
      });
    }
  }

  async changeTags(chooseTag, name) {
    const res = await this.getData("edit_tag", { chooseTag, name });
    if (res.st) {
      this.setState({
        modalEditTags: false,
        tags: res.tags,
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  openModalHistoryView_Mark(index) {
    const item = this.state.itemHist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.show_program = parseInt(itemView.show_program) ? "Да" : "Нет";
    itemView.is_new = parseInt(itemView.is_new) ? "Да" : "Нет";
    itemView.show_site = parseInt(itemView.show_site) ? "Да" : "Нет";
    itemView.is_hit = parseInt(itemView.is_hit) ? "Да" : "Нет";

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.show_program = parseInt(itemView_old.show_program) ? "Да" : "Нет";
      itemView_old.is_new = parseInt(itemView_old.is_new) ? "Да" : "Нет";
      itemView_old.show_site = parseInt(itemView_old.show_site) ? "Да" : "Нет";
      itemView_old.is_hit = parseInt(itemView_old.is_hit) ? "Да" : "Нет";

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key] && key !== "img_app") {
          itemView[key] = { key: itemView[key], color: "true" };
        }
      }
    }

    this.setState({
      modalDialogView_Mark: true,
      itemView_Mark: itemView,
    });
  }

  openModalHistoryView_Tech(index) {
    const item = this.state.itemHist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.is_show = parseInt(itemView.is_show) ? "Да" : "Нет";
    itemView.is_price = parseInt(itemView.is_price) ? "Да" : "Нет";

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.is_show = parseInt(itemView_old.is_show) ? "Да" : "Нет";
      itemView_old.is_price = parseInt(itemView_old.is_price) ? "Да" : "Нет";

      for (let key in itemView) {
        if (
          itemView[key] !== itemView_old[key] &&
          key !== "stage_1" &&
          key !== "stage_2" &&
          key !== "stage_3" &&
          key !== "items"
        ) {
          itemView[key] = { key: itemView[key], color: "true" };
        }

        if (key === "stage_1") {
          itemView.stage_1 = itemView.stage_1
            .reduce((newList, it) => {
              let item_old;

              if (it.type === "rec") {
                item_old = itemView_old.stage_1.find(
                  (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                );
              } else {
                item_old = itemView_old.stage_1.find(
                  (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                );
              }

              if (item_old) {
                for (let key in it) {
                  if (it[key] !== item_old[key]) {
                    it[key] = { key: it[key], color: "true" };
                  }
                }
              } else {
                for (let key in it) {
                  it[key] = { key: it[key], color: "true" };
                }
              }

              return (newList = [...newList, ...[it]]);
            }, [])
            .concat(
              itemView_old.stage_1.filter((it) => {
                if (it.type === "rec") {
                  let item_old = itemView_old.stage_1.find(
                    (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                  );
                  if (
                    !itemView.stage_1.find(
                      (item) =>
                        item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                } else {
                  if (
                    !itemView.stage_1.find(
                      (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                }
              }),
            );
        }

        if (key === "stage_2") {
          itemView.stage_2 = itemView.stage_2
            .reduce((newList, it) => {
              let item_old;

              if (it.type === "rec") {
                item_old = itemView_old.stage_2.find(
                  (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                );
              } else {
                item_old = itemView_old.stage_2.find(
                  (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                );
              }

              if (item_old) {
                for (let key in it) {
                  if (it[key] !== item_old[key]) {
                    it[key] = { key: it[key], color: "true" };
                  }
                }
              } else {
                for (let key in it) {
                  it[key] = { key: it[key], color: "true" };
                }
              }

              return (newList = [...newList, ...[it]]);
            }, [])
            .concat(
              itemView_old.stage_2.filter((it) => {
                if (it.type === "rec") {
                  let item_old = itemView_old.stage_2.find(
                    (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                  );
                  if (
                    !itemView.stage_2.find(
                      (item) =>
                        item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                } else {
                  if (
                    !itemView.stage_2.find(
                      (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                }
              }),
            );
        }

        if (key === "stage_3") {
          itemView.stage_3 = itemView.stage_3
            .reduce((newList, it) => {
              let item_old;

              if (it.type === "rec") {
                item_old = itemView_old.stage_3.find(
                  (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                );
              } else {
                item_old = itemView_old.stage_3.find(
                  (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                );
              }

              if (item_old) {
                for (let key in it) {
                  if (it[key] !== item_old[key]) {
                    it[key] = { key: it[key], color: "true" };
                  }
                }
              } else {
                for (let key in it) {
                  it[key] = { key: it[key], color: "true" };
                }
              }

              return (newList = [...newList, ...[it]]);
            }, [])
            .concat(
              itemView_old.stage_3.filter((it) => {
                if (it.type === "rec") {
                  item_old = itemView_old.stage_3.find(
                    (item) => item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                  );
                  if (
                    !itemView.stage_3.find(
                      (item) =>
                        item.type === "rec" && parseInt(item.rec_id) === parseInt(it.rec_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                } else {
                  if (
                    !itemView.stage_3.find(
                      (item) => item.type === "pf" && parseInt(item.pf_id) === parseInt(it.pf_id),
                    )
                  ) {
                    for (let key in it) {
                      it[key] = { key: it[key], color: "del" };
                    }
                    return it;
                  }
                }
              }),
            );
        }

        if (key === "items") {
          itemView.items = itemView.items
            .reduce((newList, it) => {
              const item_old = itemView_old.items.find(
                (item) => parseInt(item.item_id) === parseInt(it.item_id),
              );

              if (item_old) {
                for (let key in it) {
                  if (it[key] !== item_old[key]) {
                    it[key] = { key: it[key], color: "true" };
                  }
                }
              } else {
                for (let key in it) {
                  it[key] = { key: it[key], color: "true" };
                }
              }

              return (newList = [...newList, ...[it]]);
            }, [])
            .concat(
              itemView_old.items.filter((it) => {
                if (
                  !itemView.items.find((item) => parseInt(item.item_id) === parseInt(it.item_id))
                ) {
                  for (let key in it) {
                    it[key] = { key: it[key], color: "del" };
                  }
                  return it;
                }
              }),
            );
        }
      }
    }

    this.setState({
      modalDialogView: true,
      itemView,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99999 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.modalEditTags ? (
          <ModalEditTags
            tags={this.state.tags}
            onClose={() => this.setState({ modalEditTags: false })}
            open={this.state.modalEditTags}
            save={this.changeTags.bind(this)}
          />
        ) : null}
        <SiteItemsModalTech
          open={this.state.modalDialogTech}
          onClose={() => this.setState({ modalDialogTech: false, itemTech: null })}
          item={this.state.itemTech}
          method={this.state.method}
          category={this.state.category}
          save={this.saveTech.bind(this)}
          getData={this.getData.bind(this)}
          update={this.update.bind(this)}
          tags_all={this.state.tags_all}
          fullScreen={this.state.fullScreen}
          acces={this.state.acces}
          item_items={this.state.item_items}
          items_stage={this.state.items_stage}
          stages={this.state.stages}
        />
        <SiteItems_Modal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false, itemHist: null })}
          item={this.state.itemHist}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={
            this.state.user_app === "technologist"
              ? this.openModalHistoryView_Tech.bind(this)
              : this.openModalHistoryView_Mark.bind(this)
          }
          itemName={this.state.itemName}
        />
        <SiteItems_Modal_History_View_Mark
          open={this.state.modalDialogView_Mark}
          onClose={() => this.setState({ modalDialogView_Mark: false, itemView_Mark: null })}
          itemView={this.state.itemView_Mark}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
        <SiteItems_Modal_History_View_Tech
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          itemView={this.state.itemView}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
        <Dialog
          sx={{
            "& .MuiDialog-paper": {
              width: "80%",
              maxHeight: 435,
            },
          }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Точно обновить товары в VK ?
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.updateVK.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>
          {this.state.acces?.reload_vk_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <Button
                onClick={() => this.setState({ confirmDialog: true })}
                color="primary"
                variant="contained"
              >
                Обновить товары VK
              </Button>
            </Grid>
          ) : null}

          {this.state.acces?.new_item_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <Button
                onClick={this.openItemNew.bind(this, "Новое блюдо")}
                color="primary"
                variant="contained"
              >
                Новый товар
              </Button>
            </Grid>
          ) : null}
          {this.state.acces?.change_tag_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <Button
                onClick={() => this.setState({ modalEditTags: true })}
                color="primary"
                variant="contained"
              >
                Редактировать тэги
              </Button>
            </Grid>
          ) : null}

          {this.state.cats.length == 0 ? null : (
            <SiteItems_Table
              user_app={this.state.user_app}
              cats={this.state.cats}
              timeUpdate={this.state.timeUpdate}
              changeSort={this.changeSort.bind(this)}
              saveSort={this.saveSort.bind(this)}
              changeTableCheck={this.changeTableCheck.bind(this)}
              acces={this.state.acces}
              openItem={this.openItemTech.bind(this)}
              openHistoryItem={
                this.state.user_app === "technologist"
                  ? this.openHistoryTech.bind(this)
                  : this.openHistoryMark.bind(this)
              }
            />
          )}
        </Grid>
      </>
    );
  }
}

export default function SiteItems() {
  return <SiteItems_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
