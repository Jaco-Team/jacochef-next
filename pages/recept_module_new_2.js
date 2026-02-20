import React from "react";

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
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";

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

import { MyCheckBox, MyTextInput, MyAutocomplite, MyDatePickerNew, MySelect } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { ModalAccept } from "@/components/general/ModalAccept";
import { TableSortLabel } from "@mui/material";

const SwapIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Верхняя стрелка: вправо */}
    <path
      d="M7 8L12 3L17 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Нижняя стрелка: влево */}
    <path
      d="M17 16L12 21L7 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Центральная линия (опционально — для баланса) */}
    <path
      d="M12 7V17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

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

class ReceptModule_Modal_History_View extends React.Component {
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
    const { open, itemName } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={"xl"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
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
            spacing={4}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
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
                sm: 3,
              }}
            >
              <MyTextInput
                label="Срок годности"
                value={
                  this.state.itemView
                    ? this.state.itemView.shelf_life?.color
                      ? this.state.itemView.shelf_life.key
                      : this.state.itemView.shelf_life
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.shelf_life?.color
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
                label="Количество сотрудников"
                value={
                  this.state.itemView
                    ? this.state.itemView.two_user?.color
                      ? this.state.itemView.two_user.key
                      : this.state.itemView.two_user
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.two_user?.color
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
                label="Ревизия"
                value={
                  this.state.itemView
                    ? this.state.itemView.show_in_rev?.color
                      ? this.state.itemView.show_in_rev.key
                      : this.state.itemView.show_in_rev
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.show_in_rev?.color
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
                sm: 3,
              }}
            >
              <MyTextInput
                label="Действует до"
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
                sm: 3,
              }}
            >
              <MyTextInput
                label="Время приготовления 1 кг ММ:SS (15:20)"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_min?.color
                      ? this.state.itemView.time_min.key
                      : this.state.itemView.time_min
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_min?.color
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
                label="Доп. время (уборка рабочего места) MM:SS (15:20)"
                value={
                  this.state.itemView
                    ? this.state.itemView.time_min_dop?.color
                      ? this.state.itemView.time_min_dop.key
                      : this.state.itemView.time_min_dop
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.time_min_dop?.color
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
            >
              <MyTextInput
                label="Должность в кафе (кто будет готовить)"
                value={
                  this.state.itemView
                    ? this.state.itemView.rec_apps?.color
                      ? this.state.itemView.rec_apps.key
                      : this.state.itemView.rec_apps
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.rec_apps?.color
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
            >
              <MyTextInput
                label="Места хранения"
                value={
                  this.state.itemView
                    ? this.state.itemView.storages?.color
                      ? this.state.itemView.storages.key
                      : this.state.itemView.storages
                    : ""
                }
                disabled={true}
                className={
                  this.state.itemView
                    ? this.state.itemView.storages?.color
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.itemView?.pf_list.map((item, key) => (
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

class ReceptModule_Modal_History extends React.Component {
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
    this.setState({
      item: [],
    });

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
                  <TableCell style={{ width: "18%" }}>по</TableCell>
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
                    <TableCell>{it.date_end}</TableCell>
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

class ReceptModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      shelf_life: "",
      storages: [],
      addMethod: {},
      date_start: null,
      date_end: null,
      time: "",
      dop_time: "",
      two_user: "",
      rec_apps: [],
      rec_users: [],
      acces_save: true,
      focusedRow: null,
      list: [],
      all_w: 0,
      acces: {},
      all_w_brutto: 0,
      all_w_netto: 0,
      show_in_rev: 0,
      openAlert: false,
      err_status: false,
      err_text: "",
      openDelete: false,
    };
  }

  async delete() {
    const res = await this.props.getData("delete_item", {
      id: this.props.rec.id,
      type: this.props.type,
    });
    this.setState(
      {
        openDelete: false,
      },
      () => {
        this.props.onClose();
        this.props.update();
      },
    );
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.rec) {
      return;
    }

    if (this.props.rec !== prevProps.rec) {
      let list = this.props.list;

      let all_w_brutto = list.reduce((sum, item) => sum + parseFloat(item.brutto), 0);

      all_w_brutto = roundTo(all_w_brutto, 3);

      let all_w_netto = list.reduce((sum, item) => sum + parseFloat(item.netto), 0);

      all_w_netto = roundTo(all_w_netto, 3);

      let all_w = list.reduce((sum, item) => sum + parseFloat(item.res), 0);

      all_w = roundTo(all_w, 3);
      this.setState({
        name: this.props.rec?.name,
        shelf_life: this.props.rec?.shelf_life,
        storages: this.props.rec?.storages,
        time: this.props.rec?.time_min,
        date_start: this.props.rec?.date_start ? formatDate(this.props.rec.date_start) : null,
        date_end: this.props.rec?.date_end ? formatDate(this.props.rec.date_end) : null,
        list: this.props.list.length ? list : [],
        rec_apps: this.props.rec?.rec_apps ?? [],
        rec_users: this.props.rec?.rec_users ?? [],
        two_user: this.props.rec?.two_user,
        all_w: all_w,
        all_w_brutto: all_w_brutto,
        all_w_netto: all_w_netto,
        show_in_rev: this.props.rec?.show_in_rev,
        dop_time: this.props.rec?.time_min_dop,
      });

      let objAcces = {
        name_edit: this.props.acces?.name_edit,
        name_view: this.props.acces?.name_view,
        shelf_life_edit: this.props.acces?.shelf_life_edit,
        shelf_life_view: this.props.acces?.shelf_life_view,
        two_user_edit: this.props.acces?.two_user_edit,
        two_user_view: this.props.acces?.two_user_view,
        show_in_rev_edit: this.props.acces?.show_in_rev_edit,
        show_in_rev_view: this.props.acces?.show_in_rev_view,
        date_start_edit: this.props.acces?.date_start_edit,
        date_start_view: this.props.acces?.date_start_view,
        date_end_edit: this.props.acces?.date_end_edit,
        date_end_view: this.props.acces?.date_end_view,
        time_edit: this.props.acces?.time_edit,
        time_view: this.props.acces?.time_view,
        dop_time_edit: this.props.acces?.dop_time_edit,
        dop_time_view: this.props.acces?.dop_time_view,
        rec_apps_edit: this.props.acces?.rec_apps_edit,
        rec_apps_view: this.props.acces?.rec_apps_view,
        storages_edit: this.props.acces?.storages_edit,
        storages_view: this.props.acces?.storages_view,
        items_edit: this.props.acces?.items_edit,
        items_view: this.props.acces?.items_view,
      };

      this.setState({
        acces: objAcces,
        acces_save: Object.entries(objAcces).filter(
          ([key, value]) => key.includes("_edit") && value,
        )?.length,
        addMethod:
          this.props.method === "Новый рецепт"
            ? { id: "rec", name: "Рецепт" }
            : { id: "pf", name: "Полуфабрикат" },
      });
    }
  }

  chooseItem = (event, value) => {
    if (!value?.id) return;

    this.setState((prevState) => {
      const { list } = prevState;
      const valueId = parseInt(value.id);

      // Проверка на дубликат во всем списке
      const isDuplicate = list.some(
        (item) => item.item_id && parseInt(item.item_id.id) === valueId,
      );

      if (isDuplicate) {
        this.showAlert("Данная позиция уже добавлена", false);
        return null;
      }

      // Добавляем новую строку
      const newItem = {
        item_id: {
          id: value.id,
          name: value.name,
        },
        ei_name: value.ei_name || "",
        type_rec: value.type_rec || "",
        brutto: 0,
        pr_1: 0,
        netto: 0,
        pr_2: 0,
        res: 0,
      };

      return {
        list: [...list, newItem],
      };
    });
  };

  deleteItemData(key) {
    let list = this.state.list;

    list.splice(key, 1);

    let all_w_brutto = list.reduce((sum, item) => sum + parseFloat(item.brutto), 0);

    all_w_brutto = roundTo(all_w_brutto, 3);

    let all_w_netto = list.reduce((sum, item) => sum + parseFloat(item.netto), 0);

    all_w_netto = roundTo(all_w_netto, 3);

    let all_w = list.reduce((sum, item) => sum + parseFloat(item.res), 0);

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w_brutto, all_w_netto, all_w });
  }

  changeItemData(key, event, value) {
    if (value) {
      let list = this.state.list;

      const find_item = list.find((item) => parseInt(item.item_id.id) === parseInt(value.id));

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена",
        });

        return;
      }
      const obj = {
        item_id: { id: value.id, name: value.name },
        ei_name: value.ei_name,
        type_rec: value.type_rec,
        brutto: list[key].brutto ? list[key].brutto : 0,
        pr_1: list[key].pr_1 ? list[key].pr_1 : 0,
        netto: list[key].netto ? list[key].netto : 0,
        pr_2: list[key].pr_2 ? list[key].pr_2 : 0,
        res: list[key].res ? list[key].res : 0,
      };

      list[key] = obj;

      this.setState({ list });
    }
  }

  changeItem(type, event) {
    this.setState({
      [type]: event.target.value,
    });
  }

  changeItemList(type, key, event) {
    let list = [...this.state.list];

    let value = event.target.value;

    if (value < 0) {
      list[key][type] = 0;
    } else {
      list[key][type] = value;
    }

    if (type === "brutto") {
      let all_w_brutto = list.reduce((sum, item) => sum + parseFloat(item.brutto), 0);

      all_w_brutto = roundTo(all_w_brutto, 3);
      list[key].netto = roundTo(
        (parseFloat(list[key].brutto) * (100 - parseFloat(list[key].pr_1))) / 100,
        3,
      );

      list[key].res = roundTo(
        (parseFloat(list[key].netto) * (100 - parseFloat(list[key].pr_2))) / 100,
        3,
      );

      this.setState({ all_w_brutto });
    }

    if (type === "pr_1") {
      list[key].netto = roundTo(
        (parseFloat(list[key].brutto) * (100 - parseFloat(list[key].pr_1))) / 100,
        3,
      );

      list[key].res = roundTo(
        (parseFloat(list[key].netto) * (100 - parseFloat(list[key].pr_2))) / 100,
        3,
      );
    }

    if (type === "pr_2") {
      list[key].res = roundTo(
        (parseFloat(list[key].netto) * (100 - parseFloat(list[key].pr_2))) / 100,
        3,
      );
    }

    if (type === "brutto" || type === "pr_1") {
      let all_w_netto = list.reduce((sum, item) => sum + parseFloat(item.netto), 0);
      all_w_netto = roundTo(all_w_netto, 3);

      this.setState({ all_w_netto });
    }

    let all_w = list.reduce((sum, item) => sum + parseFloat(item.res), 0);

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeComplite(type, event, value) {
    this.setState({
      [type]: value,
    });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  save() {
    let data = {
      name: this.state.name,
      shelf_life: this.state.shelf_life,
      storages: this.state.storages,
      date_start: this.state.date_start ? dayjs(this.state.date_start).format("YYYY-MM-DD") : "",
      date_end: this.state.date_end ? dayjs(this.state.date_end).format("YYYY-MM-DD") : "",
      show_in_rev: this.state.show_in_rev,
      list: this.state.list,
      time_min: this.state.time,
      time_min_dop: this.state.dop_time,
      two_user: this.state.two_user,
      rec_apps: this.state.rec_apps,
      all_w: this.state.all_w,
      all_w_brutto: this.state.all_w_brutto,
      all_w_netto: this.state.all_w_netto,
    };

    if (this.props.method === "Новый рецепт" || this.props.method === "Новый полуфабрикат") {
      this.props.saveNew(data);
    } else {
      data.id = this.props.rec.id;
      this.props.saveEdit(data);
    }
  }

  onClose() {
    this.setState({
      name: "",
      shelf_life: "",
      storages: [],
      date_start: null,
      date_end: null,
      time: "",
      dop_time: "",
      two_user: "",
      rec_apps: [],
      rec_users: [],
      list: [],
      all_w: 0,
      all_w_brutto: 0,
      all_w_netto: 0,
      show_in_rev: 0,
      openAlert: false,
      err_status: false,
      err_text: "",
    });

    this.props.onClose();
  }

  render() {
    const { open, method, apps, storages, all_pf_list } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={"xl"}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
        >
          <DialogTitle className="button">
            <Typography>{method}</Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          {this.state.openDelete && (
            <ModalAccept
              open={this.state.openDelete}
              onClose={() => this.setState({ openDelete: false })}
              title="Удалить товар?"
              save={() => {
                this.delete();
                this.setState({ openDelete: false });
              }}
            />
          )}
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={4}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  this.props.method === "Новый рецепт" || this.props.method === "Новый полуфабрикат"
                    ? {}
                    : { display: "none" }
                }
              >
                <MyAutocomplite
                  label="Тип"
                  multiple={false}
                  data={[
                    { id: "rec", name: "Рецепт" },
                    { id: "pf", name: "Полуфабрикат" },
                  ]}
                  value={this.state.addMethod}
                  func={(event, value) => {
                    if (value.id === "rec") {
                      this.props.changeAddMethod("Новый рецепт", "rec");
                    } else {
                      this.props.changeAddMethod("Новый полуфабрикат", "pf");
                    }
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.name_edit && !this.state.acces?.name_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Наименование"
                  value={this.state.name}
                  disabled={!this.state.acces?.name_edit}
                  func={this.changeItem.bind(this, "name")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.shelf_life_edit && !this.state.acces?.shelf_life_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Срок годности"
                  value={this.state.shelf_life}
                  disabled={!this.state.acces?.shelf_life_edit}
                  func={this.changeItem.bind(this, "shelf_life")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.two_user_edit && !this.state.acces?.two_user_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MySelect
                  is_none={false}
                  data={this.state.rec_users}
                  value={this.state.two_user}
                  func={this.changeItem.bind(this, "two_user")}
                  disabled={!this.state.acces?.two_user_edit}
                  label="Количество сотрудников"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.show_in_rev_edit && !this.state.acces?.show_in_rev_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyCheckBox
                  label="Ревизия"
                  value={parseInt(this.state.show_in_rev) == 1 ? true : false}
                  disabled={!this.state.acces?.show_in_rev_edit}
                  func={this.changeItemChecked.bind(this, "show_in_rev")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.date_start_edit && !this.state.acces?.date_start_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyDatePickerNew
                  label="Действует с"
                  format="DD.MM.YYYY"
                  maxDate={this.state.date_end ? dayjs(this.state.date_end) : null}
                  minDate={dayjs(new Date())}
                  value={this.state.date_start}
                  disabled={!this.state.acces?.date_start_edit}
                  func={this.changeDateRange.bind(this, "date_start")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.date_end_edit && !this.state.acces?.date_end_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyDatePickerNew
                  label="Действует до"
                  format="DD.MM.YYYY"
                  minDate={dayjs(new Date()).add(1, "day")}
                  value={this.state.date_end}
                  disabled={!this.state.acces?.date_end_edit}
                  func={this.changeDateRange.bind(this, "date_end")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.time_edit && !this.state.acces?.time_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Время приготовления 1 кг ММ:SS (15:20)"
                  value={this.state.time}
                  isTimeMask
                  disabled={!this.state.acces?.time_edit}
                  func={this.changeItem.bind(this, "time")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
                style={
                  !this.state.acces?.dop_time_edit && !this.state.acces?.dop_time_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyTextInput
                  label="Доп. время (уборка рабочего места) MM:SS (15:20)"
                  value={this.state.dop_time}
                  isTimeMask
                  disabled={!this.state.acces?.dop_time_edit}
                  func={this.changeItem.bind(this, "dop_time")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
                style={
                  !this.state.acces?.rec_apps_edit && !this.state.acces?.rec_apps_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Должность в кафе (кто будет готовить)"
                  multiple={true}
                  data={apps}
                  disabled={!this.state.acces?.rec_apps_edit}
                  value={this.state.rec_apps}
                  func={this.changeComplite.bind(this, "rec_apps")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
                style={
                  !this.state.acces?.storages_edit && !this.state.acces?.storages_view
                    ? { display: "none" }
                    : {}
                }
              >
                <MyAutocomplite
                  label="Места хранения"
                  multiple={true}
                  data={storages}
                  value={this.state.storages}
                  disabled={!this.state.acces?.storages_edit}
                  func={this.changeComplite.bind(this, "storages")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                style={
                  !this.state.acces?.items_edit && !this.state.acces?.items_view
                    ? {
                        backgroundColor: "rgba(245,245,245,0.5)",
                        pointerEvents: "none",
                        cursor: "not-allowed",
                        opacity: "0.6",
                      }
                    : {}
                }
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
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.list.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            optionKey="id_name"
                            getOptionKey={(option) => `${option?.id}-${option?.name}`}
                            data={all_pf_list}
                            isOptionEqualToValue={(option, value) => {
                              const isEqual = option?.name === value?.name;
                              return isEqual;
                            }}
                            value={item.item_id}
                            getOptionLabel={(option) => option?.name || ""}
                            func={this.changeItemData.bind(this, key)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.ei_name}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.brutto}
                            type={"number"}
                            func={this.changeItemList.bind(this, "brutto", key)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_1}
                            type={"number"}
                            func={this.changeItemList.bind(this, "pr_1", key)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.netto}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.pr_2}
                            type={"number"}
                            func={this.changeItemList.bind(this, "pr_2", key)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            value={item.res}
                            disabled={true}
                            className="disabled_input"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={this.deleteItemData.bind(this, key)}>
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <MyAutocomplite
                          multiple={false}
                          data={all_pf_list}
                          optionKey="id_name"
                          getOptionLabel={(option) => option?.name || ""}
                          disabledItemsFocusable={true}
                          value={null}
                          blurOnSelect={true}
                          autoFocus={false}
                          func={this.chooseItem.bind(this)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={""}
                          disabled={true}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w_brutto}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w_netto}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell colSpan={1} />
                      <TableCell>
                        <MyTextInput
                          value={this.state.all_w}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent:
                  (this.props.acces?.delete_access && this.props.method !== "Новый рецепт") ||
                  this.props.method !== "Новый полуфабрикат"
                    ? "space-between"
                    : "flex-end",
              }}
            >
              {(this.props.acces?.delete_access && this.props.method !== "Новый рецепт") ||
              this.props.method !== "Новый полуфабрикат" ? (
                <Button
                  color="primary"
                  onClick={() => this.setState({ openDelete: true })}
                  variant="contained"
                >
                  Удалить
                </Button>
              ) : null}
              <Button
                color="success"
                disabled={!this.state.acces_save}
                onClick={this.save.bind(this)}
                variant="contained"
              >
                Сохранить
              </Button>
            </div>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class ReceptModule_Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openChange: false,
      itemId: 1,
      data: this.props.data || [],
      sortField: "name",
      sortOrder: "asc",
      type: "",
    };
  }

  saveChange = async () => {
    const { itemId, type } = this.state;
    const data = { itemId, type };
    const res = await this.props.getData("change_rec_and_pf", data);
    if (res.st) {
      this.setState(
        {
          openChange: false,
        },
        () => {
          this.props.update();
        },
      );
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        data: this.props.data || [],
        sortField: "name",
        sortOrder: "asc",
      });
    }
  }

  handleSort = (field) => {
    let sortOrder = "asc";
    if (this.state.sortField === field) {
      sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
    }

    const sortedData = [...this.state.data];

    sortedData.sort((a, b) => {
      if (this.state.acces?.rev_table_view && this.state.acces?.rev_table_edit) {
        const showInRevA = parseInt(a.show_in_rev) === 1 ? 1 : 0;
        const showInRevB = parseInt(b.show_in_rev) === 1 ? 1 : 0;

        if (showInRevA !== showInRevB) {
          return showInRevB - showInRevA;
        }
      }

      let valueA = this.prepareValueForSort(a[field], field);
      let valueB = this.prepareValueForSort(b[field], field);

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    this.setState({
      data: sortedData,
      sortField: field,
      sortOrder: sortOrder,
    });
  };

  prepareValueForSort = (value, field) => {
    if (value === null || value === undefined) return "";

    switch (field) {
      case "name":
        return value.toString().toLowerCase();
      case "date_start":
      case "date_update":
        const date = new Date(value.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
        return date.getTime() || 0;
      default:
        return value;
    }
  };

  getSortProps = (field) => ({
    active: this.state.sortField === field,
    direction: this.state.sortField === field ? this.state.sortOrder : "asc",
    onClick: () => this.handleSort(field),
  });

  render() {
    const { data, method, openItemEdit, checkTable, openHistoryItem, type, acces, getData } =
      this.props;
    const { openChange, sortField, sortOrder } = this.state;

    return (
      <>
        {!data.length ? null : (
          <Grid
            style={{ paddingBottom: type === "rec" ? "40px" : "0px" }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <ModalAccept
              open={openChange}
              onClose={() => this.setState({ openChange: false })}
              title={
                type === "rec"
                  ? "Заменить Рецепт на Полуфабрикат?"
                  : "Заменить Полуфабрикат на Рецепт?"
              }
              save={() => {
                this.saveChange();
                this.setState({ openChange: false });
              }}
            />

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{ fontWeight: "bold" }}>{method}</Typography>
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
                    <TableHead sx={{ "& th": { fontWeight: "bold" } }}>
                      <TableRow>
                        {acces?.rev_table_view && acces?.rev_table_edit ? (
                          <TableCell style={{ width: "10%" }}>Ревизия</TableCell>
                        ) : null}
                        <TableCell style={{ width: "18%" }}>
                          <TableSortLabel {...this.getSortProps("name")}>
                            Наименование
                          </TableSortLabel>
                        </TableCell>
                        <TableCell style={{ width: "12%" }}>
                          <TableSortLabel {...this.getSortProps("date_start")}>
                            Дата создания
                          </TableSortLabel>
                        </TableCell>
                        <TableCell style={{ width: "18%" }}>Обновление</TableCell>
                        <TableCell style={{ width: "18%" }}>Редактирование</TableCell>
                        <TableCell style={{ width: "18%" }}>История изменений</TableCell>
                        <TableCell style={{ width: "18%" }}></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.data.map((item, key) => (
                        <TableRow key={key}>
                          {acces?.rev_table_view && acces?.rev_table_edit ? (
                            <TableCell>
                              <MyCheckBox
                                label=""
                                value={parseInt(item.show_in_rev) == 1 ? true : false}
                                func={checkTable.bind(this, item.id, "show_in_rev", type)}
                              />
                            </TableCell>
                          ) : null}
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.date_start}</TableCell>
                          <TableCell>{item.date_update}</TableCell>
                          <TableCell
                            style={{ cursor: "pointer" }}
                            onClick={openItemEdit.bind(
                              this,
                              item.id,
                              `Редактирование ${type === "rec" ? "Рецепта" : "Полуфабриката"}: ${item.name}`,
                              type,
                            )}
                          >
                            <EditIcon />
                          </TableCell>
                          <TableCell
                            onClick={openHistoryItem.bind(this, item.id, "История изменений", type)}
                            style={{ cursor: "pointer" }}
                          >
                            <EditNoteIcon />
                          </TableCell>
                          <TableCell>
                            {acces?.change_rec_pf_access ? (
                              <IconButton
                                title={`Смена на ${type === "rec" ? "полуфабрикат" : "рецепт"}`}
                                onClick={() =>
                                  this.setState({ type, itemId: item.id, openChange: true })
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <SwapIcon />
                              </IconButton>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </>
    );
  }
}

class ReceptModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "recept_module_new_2",
      module_name: "",
      is_load: false,

      rec_list: [],
      pf_list: [],

      modalDialog: false,
      modalDialogHist: false,
      storages: [],
      method: "",
      apps: [],
      all_pf_list: [],
      rec: null,
      item: [],
      acces: {},
      typeMethod: "",

      openAlert: false,
      err_status: false,
      err_text: "",

      fullScreen: false,

      rec_pf_list: [],

      modalDialogView: false,
      itemView: null,
      itemName: "",

      type: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      rec_list: data.rec,
      pf_list: data.pf,
      acces: data.acces,
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
        }, 500);
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

  async openItemNew(method, type) {
    this.handleResize();

    const data = {
      id: 0,
    };

    if (type === "rec") {
      const res = await this.getData("get_one_rec", data);

      res.rec.rec_users = [
        { id: 0, name: "Один сотрудник" },
        { id: 20, name: "Два сотрудника" },
      ];

      this.setState({
        modalDialog: true,
        method,
        storages: res.all_storages,
        apps: res.apps,
        all_pf_list: res.all_pf_list,
        rec: res.rec,
        rec_pf_list: res.pf_list,
      });
    } else {
      const res = await this.getData("get_one_pf", data);

      res.items_list.map((pf) => {
        const value = res.all_items_list.find((item) => parseInt(item.id) === parseInt(pf.item_id));
        pf.item_id = { id: value.id, name: value.name };
        return pf;
      });

      res.pf.rec_users = [
        { id: 0, name: "Один сотрудник" },
        { id: 20, name: "Два сотрудника" },
      ];

      this.setState({
        modalDialog: true,
        method,
        storages: res.all_storages,
        apps: res.apps,
        all_pf_list: res.all_items_list,
        rec: res.pf,
        rec_pf_list: res.items_list,
      });
    }
  }

  async openItemEdit(id, method, type) {
    this.handleResize();

    const data = { id };

    if (type === "rec") {
      const res = await this.getData("get_one_rec", data);
      res.pf_list.map((pf) => {
        const value = res.all_pf_list.find(
          (item) => parseInt(item.id) === parseInt(pf.item_id) && item.type_rec === pf.type_rec,
        );
        pf.item_id = { id: value.id, name: value.name };
        return pf;
      });

      res.rec.rec_users = [
        { id: 0, name: "Один сотрудник" },
        { id: 20, name: "Два сотрудника" },
      ];

      this.setState({
        modalDialog: true,
        method,
        storages: res.all_storages,
        apps: res.apps,
        all_pf_list: res.all_pf_list,
        rec: res.rec,
        rec_pf_list: res.pf_list,
        type,
        typeMethod: "edit_rec",
      });
    } else {
      const res = await this.getData("get_one_pf", data);

      res.items_list.map((pf) => {
        const value = res.all_items_list.find((item) => parseInt(item.id) === parseInt(pf.item_id));
        pf.item_id = { id: value.id, name: value.name };
        return pf;
      });

      res.pf.rec_users = [
        { id: 0, name: "Один сотрудник" },
        { id: 20, name: "Два сотрудника" },
      ];

      this.setState({
        modalDialog: true,
        method,
        storages: res.all_storages,
        apps: res.apps,
        all_pf_list: res.all_items_list,
        rec: res.pf,
        rec_pf_list: res.items_list,
        type,
        typeMethod: "edit_pf",
      });
    }
  }

  async openHistoryItem(id, method, type) {
    this.handleResize();

    const data = {
      item_id: id,
    };

    let res;

    if (type === "rec") {
      res = await this.getData("get_one_hist_rec", data);
    } else {
      res = await this.getData("get_one_hist_pf", data);
    }

    if (res.hist.length) {
      if (res.hist.length > 1) {
        res.hist.map((hist, index) => {
          hist.date_update = res?.hist[index + 1]?.date_start ?? "";
          return hist;
        });
      }

      this.setState({
        modalDialogHist: true,
        item: res.hist,
        itemName: res.hist[0].name,
        method,
      });
    } else {
      const data = {
        id,
      };

      if (type === "rec") {
        res = await this.getData("get_one_rec", data);

        res.rec.pf_list = res.pf_list;

        res.rec.storages = res.rec.storages
          .map((storage) => {
            storage = storage.name;
            return storage;
          })
          .join(", ");

        res.rec.rec_apps = res.rec.rec_apps
          .map((app) => {
            app = app.name;
            return app;
          })
          .join(", ");

        this.setState({
          modalDialogHist: true,
          item: [res.rec],
          itemName: res.rec.name,
          method,
        });
      } else {
        res = await this.getData("get_one_pf", data);

        res.pf.pf_list = res.items_list;

        res.pf.storages = res.pf.storages
          .map((storage) => {
            storage = storage.name;
            return storage;
          })
          .join(", ");

        res.pf.rec_apps = res.pf.rec_apps
          .map((app) => {
            app = app.name;
            return app;
          })
          .join(", ");

        this.setState({
          modalDialogHist: true,
          item: [res.pf],
          itemName: res.pf.name,
          method,
        });
      }
    }
  }

  openModalHistoryView(index) {
    const item = this.state.item;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.two_user = parseInt(itemView.two_user) ? "Два сотрудника" : "Один сотрудник";
    itemView.show_in_rev = parseInt(itemView.show_in_rev) ? "Да" : "Нет";

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      itemView_old.two_user = parseInt(itemView_old.two_user) ? "Два сотрудника" : "Один сотрудник";
      itemView_old.show_in_rev = parseInt(itemView_old.show_in_rev) ? "Да" : "Нет";

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key] && key !== "pf_list") {
          itemView[key] = { key: itemView[key], color: "true" };
        }

        if (key === "pf_list") {
          itemView.pf_list = itemView.pf_list
            .reduce((newList, pf) => {
              const pf_old = itemView_old.pf_list.find(
                (item) => parseInt(item.item_id) === parseInt(pf.item_id),
              );

              if (pf_old) {
                for (let key in pf) {
                  if (pf[key] !== pf_old[key]) {
                    pf[key] = { key: pf[key], color: "true" };
                  }
                }
              } else {
                for (let key in pf) {
                  pf[key] = { key: pf[key], color: "true" };
                }
              }

              return (newList = [...newList, ...[pf]]);
            }, [])
            .concat(
              itemView_old.pf_list.filter((it) => {
                if (
                  !itemView.pf_list.find((item) => parseInt(item.item_id) === parseInt(it.item_id))
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

  async saveNew(rec) {
    const method = this.state.method;

    const data = {
      rec,
    };

    let res;

    if (method === "Новый рецепт") {
      res = await this.getData("save_new_rec", data);
    } else {
      res = await this.getData("save_new_pf", data);
    }

    if (res.st === true) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
        rec: null,
      });

      setTimeout(async () => {
        this.update();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: true,
      });
    }
  }

  async saveEdit(rec) {
    const type = this.state.type;

    const data = {
      rec,
    };

    let res;

    if (type === "rec") {
      res = await this.getData("save_edit_rec", data);
    } else {
      res = await this.getData("save_edit_pf", data);
    }

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
        rec: null,
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
  }

  async checkTable(id, type, type_item, event, value) {
    const data = {
      type: type,
      rec_id: id,
      value: value ? 1 : 0,
    };

    let res;

    if (type_item === "rec") {
      res = await this.getData("save_check_rec", data);
    } else {
      res = await this.getData("save_check_pf", data);
    }

    if (res.st) {
      setTimeout(async () => {
        this.update();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      rec_list: data.rec,
      pf_list: data.pf,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <ReceptModule_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          all_pf_list={this.state.all_pf_list}
          update={this.update.bind(this)}
          method={this.state.method}
          typeMethod={this.state.typeMethod}
          changeAddMethod={this.openItemNew.bind(this)}
          storages={this.state.storages}
          apps={this.state.apps}
          rec={this.state.rec}
          acces={this.state.acces}
          getData={this.getData.bind(this)}
          saveNew={this.saveNew.bind(this)}
          saveEdit={this.saveEdit.bind(this)}
          fullScreen={this.state.fullScreen}
          list={this.state.rec_pf_list}
          type={this.state.type}
        />
        <ReceptModule_Modal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false })}
          item={this.state.item}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={this.openModalHistoryView.bind(this)}
          itemName={this.state.itemName}
        />
        <ReceptModule_Modal_History_View
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          itemView={this.state.itemView}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
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

          {this.state.acces?.create_rec_access || this.state.acces?.create_pol_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
              sx={{
                mb: 3,
              }}
            >
              <Button
                onClick={this.openItemNew.bind(this, "Новый рецепт", "rec")}
                variant="contained"
              >
                Добавить рецепт или полуфабрикат
              </Button>
            </Grid>
          ) : null}
          <ReceptModule_Table
            data={this.state.pf_list}
            method="Полуфабрикаты"
            getData={this.getData.bind(this)}
            openItemEdit={this.openItemEdit.bind(this)}
            checkTable={this.checkTable.bind(this)}
            update={this.update.bind(this)}
            openHistoryItem={this.openHistoryItem.bind(this)}
            type={"pf"}
            acces={this.state.acces}
          />

          <ReceptModule_Table
            data={this.state.rec_list}
            method="Рецепты"
            update={this.update.bind(this)}
            getData={this.getData.bind(this)}
            openItemEdit={this.openItemEdit.bind(this)}
            checkTable={this.checkTable.bind(this)}
            openHistoryItem={this.openHistoryItem.bind(this)}
            type={"rec"}
            acces={this.state.acces}
          />
        </Grid>
      </>
    );
  }
}

export default function ReceptModule() {
  return <ReceptModule_ />;
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
