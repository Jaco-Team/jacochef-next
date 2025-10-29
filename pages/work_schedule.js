import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import Paper from "@mui/material/Paper";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";

import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckIcon from "@mui/icons-material/Check";
import SendIcon from "@mui/icons-material/Send";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import InfoIcon from "@mui/icons-material/Info";

import {
  MyDatePickerGraph,
  MySelect,
  MyTextInput,
  MyTimePicker,
  MyCheckBox,
  MyAutocomplite2,
  MyDatePickerNew,
} from "@/ui/Forms";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

import queryString from "query-string";

import dayjs from "dayjs";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import TestAccess from "@/ui/TestAccess";
import MyAlert from "@/ui/MyAlert";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
    >
      <List sx={{ pt: 0 }}>
        <ListItem
          autoFocus
          button
          onClick={() => handleListItemClick("addAccount")}
        >
          <ListItemAvatar>
            <Avatar>
              <AccessTimeIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Сменить часы на месяц" />
        </ListItem>

        <ListItem
          autoFocus
          button
          onClick={() => handleListItemClick("addAccount")}
        >
          <ListItemAvatar>
            <Avatar>
              <SyncAltIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Сменить смену" />
        </ListItem>
        <ListItem
          autoFocus
          button
          onClick={() => handleListItemClick("addAccount")}
        >
          <ListItemAvatar>
            <Avatar>
              <HomeWorkIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Сменить точку" />
        </ListItem>
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class WorkSchedule_Confirm extends React.Component {
  onClose() {
    this.props.methodConfirm();

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
      >
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent
          align="center"
          style={{ paddingBottom: 10, paddingTop: 10 }}
        >
          <Typography style={{ fontWeight: "bold" }}>{this.props.textConfirm}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose.bind(this)}>Отмена</Button>
          <Button
            onClick={this.onClose.bind(this)}
            color="success"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class HeaderItem extends React.Component {
  render() {
    //Ур. кафе: {this.props.lv_cafe}
    //Ур. дира: {this.props.lv_dir_new}
    return (
      <>
        <TableRow>
          <TableCell style={{ minWidth: 140, minHeight: 38 }}></TableCell>
          <TableCell style={{ minWidth: 165, minHeight: 38 }}>Число месяца</TableCell>

          {this.props.kind == "manager" || this.props.kind == "other" ? null : (
            <TableCell style={{ textAlign: "center" }}>
              <SyncAltIcon
                style={{ cursor: "pointer", display: "block", margin: "auto" }}
                onClick={this.props.openAddUser.bind(this)}
              />
            </TableCell>
          )}

          {this.props.kind == "manager" || this.props.kind == "other" ? null : <TableCell />}

          {this.props.days.map((item, key) => (
            <TableCell
              className="min_block"
              style={{
                backgroundColor:
                  item.day == "Пт" || item.day == "Сб" || item.day == "Вс" ? "#ffe9bd" : "#fff",
              }}
              key={key}
            >
              {item.date}
            </TableCell>
          ))}

          <TableCell></TableCell>
          <TableCell></TableCell>

          {this.props.dataKey > 0 ? (
            <>
              <TableCell style={{ textAlign: "center" }}></TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </>
          ) : (
            <>
              <TableCell
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={
                  this.props.kind == "manager" || this.props.kind == "dir"
                    ? () => {}
                    : this.props.bonus_other
                      ? () => {}
                      : this.props.changeDopBonus
                }
              >
                {!this.props.bonus_other ? (
                  "+ / -"
                ) : parseInt(this.props.bonus_other) == 1 ? (
                  <AddIcon style={{ fontSize: 30, color: "green" }} />
                ) : (
                  <CloseIcon style={{ fontSize: 30, color: "red" }} />
                )}
              </TableCell>
              <TableCell
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={
                  this.props.kind == "manager" || this.props.kind == "dir"
                    ? () => {}
                    : this.props.changeLVDir
                }
              ></TableCell>
            </>
          )}

          <TableCell style={{ textAlign: "center" }}></TableCell>
          <TableCell style={{ textAlign: "center" }}></TableCell>
          <TableCell style={{ textAlign: "center" }}></TableCell>
          <TableCell style={{ textAlign: "center" }}></TableCell>

          <TableCell style={{ textAlign: "center" }}></TableCell>
          <TableCell style={{ textAlign: "center" }}></TableCell>
          {this.props.kind == "manager" || this.props.kind == "dir" ? (
            false
          ) : this.props.part == 1 ? (
            false
          ) : (
            <TableCell style={{ textAlign: "center" }}></TableCell>
          )}
        </TableRow>

        <TableRow>
          <TableCell style={{ minWidth: 140, minHeight: 38 }}>Сотрудник</TableCell>
          <TableCell style={{ minWidth: 165, minHeight: 38 }}>Должность</TableCell>

          {this.props.kind == "manager" || this.props.kind == "other" ? null : (
            <TableCell></TableCell>
          )}
          {this.props.kind == "manager" || this.props.kind == "other" ? null : (
            <TableCell></TableCell>
          )}

          {this.props.days.map((item, key) => (
            <TableCell
              className="min_block"
              style={{
                backgroundColor:
                  item.day == "Пт" || item.day == "Сб" || item.day == "Вс" ? "#ffe9bd" : "#fff",
              }}
              key={key}
            >
              {item.day}
            </TableCell>
          ))}

          <TableCell style={{ textAlign: 'center' }}>За 1ч</TableCell>
          <TableCell style={{ textAlign: 'center' }}>За 1ч + доплата</TableCell>

          <TableCell style={{ textAlign: "center" }}>Командный бонус</TableCell>
          <TableCell style={{ textAlign: "center" }}>За часы</TableCell>
          <TableCell style={{ textAlign: "center" }}>Ошибки</TableCell>
          <TableCell style={{ textAlign: "center" }}>Бонус</TableCell>

          {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
            <TableCell style={{ textAlign: "center" }}>Всего</TableCell>
          ) : null}

          <TableCell style={{ textAlign: "center" }}>Выдано</TableCell>

          <TableCell style={{ textAlign: "center" }}>Перечислено на карты</TableCell>
          <TableCell style={{ textAlign: "center" }}>Сумма к выплате</TableCell>
          {this.props.kind == "manager" || this.props.kind == "dir" ? (
            false
          ) : this.props.part == 1 ? (
            false
          ) : (
            <TableCell style={{ textAlign: "center" }}>Премия по ведомости</TableCell>
          )}
        </TableRow>

        <TableRow style={{ backgroundColor: "#e5e5e5" }}>
          <TableCell
            style={{ textAlign: "center", cursor: "pointer" }}
            colSpan={this.props.days.length + 3 + 8 + 2}
            onClick={
              this.props.kind == "manager"
                ? () => {}
                : this.props.editSmena
                  ? this.props.editSmena.bind(this, this.props.item.smena_id)
                  : () => console.log("no_edit_smena")
            }
          >
            {this.props.item.data}
          </TableCell>
        </TableRow>
      </>
    );
  }
}

class WorkSchedule_Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: null,
    };
  }

  clickAppName(index) {
    this.props.clickAppNameUser(index, this.props.numberChoose);

    const i = this.state.index;
    const newIndex = i === index ? null : index;

    this.setState({
      index: newIndex,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    var array1 = nextProps.test;
    var array2 = this.props.test;

    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      }) &&
      nextState.index === this.state.index;

    return !is_same;
  }

  render() {
    let check_period = this.props.test.find(
      (item) => item.row !== "header" && parseInt(item.data.check_period) == 0,
    );

    //this.props.openModalDirBonus;

    // console.log('this.props', this.props);

    return (
      <TableContainer
        component={Paper}
        style={{ paddingRight: 0 }}
      >
        <Table id={this.props.numberChoose === 1 ? "table_graph_one" : "table_graph_two"}>
          <TableBody>
            {!check_period ? null : (
              <TableRow>
                <TableCell
                  colSpan={this.props.number.days.length + 3 + 8 + 2}
                  style={{ textAlign: "center", color: "red", fontSize: "3rem" }}
                >
                  Чтобы увидеть зарплату, надо закрыть все ошибки в модуле "Регистрация ошибок
                  кухни"
                </TableCell>
              </TableRow>
            )}

            {this.props.test.map((item, key) =>
              item.row == "header" ? (
                <React.Fragment key={key}>
                  <HeaderItem
                    bonus_other={this.props.number.bonus_other}
                    changeLVDir={this.props.changeLVDir.bind(this)}
                    changeDopBonus={this.props.changeDopBonus.bind(this)}
                    kind={this.props.kind}
                    show_zp={this.props.show_zp}
                    lv_dir={this.props.lv_dir}
                    add_lv={this.props.add_lv}
                    lv_dir_new={this.props.lv_dir_new}
                    lv_cafe={this.props.lv_cafe}
                    dataKey={key}
                    days={this.props.number.days}
                    item={item}
                    editSmena={this.props.editSmena.bind(this)}
                    openAddUser={this.props.openAddUser.bind(this)}
                    part={this.props.numberChoose}
                  />

                  {parseInt(key) == 0 &&
                  this.props.kind !== "manager" &&
                  this.props.kind !== "other" ? (
                    <TableRow>
                      <TableCell
                        colSpan={this.props.number.days.length + 3 + 8 + 2}
                        style={{ textAlign: "left", fontSize: "3rem", cursor: "pointer" }}
                        onClick={this.props.addSmena.bind(this)}
                      >
                        Добавить смену
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              ) : (
                <TableRow
                  key={key}
                  style={{ backgroundColor: item?.color ? "#D3D3D3" : "#fff" }}
                >
                  <TableCell
                    className="name_pinning"
                    style={{
                      background: item?.color
                        ? "#D3D3D3"
                        : parseInt(item.data.type) == 0
                          ? "#fff"
                          : parseInt(item.data.type) == 1
                            ? "#fff"
                            : parseInt(item.data.type) == 2
                              ? "#ffcc00"
                              : "#c03",
                      color: item?.color
                        ? "#000"
                        : parseInt(item.data.type) == 0
                          ? "#000"
                          : parseInt(item.data.type) == 1
                            ? "#000"
                            : parseInt(item.data.type) == 2
                              ? "#000"
                              : "#fff",
                    }}
                    onClick={
                      this.props.kind == "manager"
                        ? () => {}
                        : this.props.openM.bind(this, item.data)
                    }
                  >
                    {item.data.user_name}
                  </TableCell>

                  <TableCell
                    style={{ minWidth: 165, minHeight: 38, cursor: "pointer" }}
                    onClick={this.clickAppName.bind(this, key)}
                  >
                    {item.data.app_name}
                  </TableCell>

                  {this.props.kind == "manager" ? null : item.data.smena_id === "-1" ? (
                    <TableCell />
                  ) : (
                    <TableCell className="checkBox">
                      <MyCheckBox
                        style={{ justifyContent: "center" }}
                        func={this.props.addUser.bind(this, item.data)}
                        size={"small"}
                        defaultChecked={false}
                      />
                    </TableCell>
                  )}

                  {this.props.kind == "manager" ? null : item.data.smena_id === "-1" ? (
                    <TableCell />
                  ) : (
                    <TableCell style={{ textAlign: "center" }}>
                      <SyncAltIcon
                        style={{ cursor: "pointer", display: "block", margin: "auto" }}
                        onClick={this.props.mix.bind(this, item.data)}
                      />
                    </TableCell>
                  )}

                  {item.data.dates.map((date, date_k) => (
                    <TableCell
                      onClick={this.props.openH.bind(this, item.data, date.date)}
                      className="min_block"
                      sx={
                        item.data?.smena_id === "-1"
                          ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                              cursor: "not-allowed",
                            }
                          : null
                      }
                      style={{
                        backgroundColor: item?.color
                          ? "#D3D3D3"
                          : date.info
                            ? date.info.color
                            : "#fff",
                        color: item?.color ? "#000" : date.info ? date.info.colorT : "#000",
                        cursor: "pointer",
                      }}
                      key={date_k}
                    >
                      {date.info ? date.info.hours : ""}
                    </TableCell>
                  ))}

                  <TableCell
                    style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    onClick={
                      this.props.kind == "manager"
                        ? () => {}
                        : this.props.pricePerHour.bind(this, item.data)
                    }
                  >
                    {item.data.price_p_h}
                  </TableCell>

                  <TableCell style={{ textAlign: 'center', minWidth: 70 }}>
                    {item.data.price_p_h_dop}
                  </TableCell>

                  <TableCell style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={this.props.kind == 'manager' ? () => {} : this.props.changeDopBonusUser.bind(this, item)}
                  >
                    {parseInt(item.data.check_period) == 1 ? item.data.dop_bonus : " - "}
                  </TableCell>

                  <TableCell style={{ textAlign: "center" }}>
                    {parseInt(item.data.check_period) == 1 ? item.data.h_price : " - "}
                  </TableCell>

                  <TableCell style={{ textAlign: "center" }}>
                    {parseInt(item.data.check_period) == 1 ? item.data.err_price : " - "}
                  </TableCell>

                  <TableCell
                    style={{
                      textAlign: "center",
                      cursor:
                        item.data.app_type == "dir" &&
                        (this.props.kind == "dir" || this.props.kind == "mega_dir")
                          ? "pointer"
                          : "default",
                      backgroundColor:
                        this.props.numberChoose == 2 &&
                        (this.props.kind == "dir" || this.props.kind == "mega_dir") &&
                        item.data.app_type == "dir"
                          ? "#e5e5e5"
                          : "#fff",
                    }}
                    onClick={
                      this.props.numberChoose == 2 &&
                      (this.props.kind == "dir" || this.props.kind == "mega_dir") &&
                      item.data.app_type == "dir"
                        ? this.props.openModalDirBonus.bind(
                            this,
                            item.data.id,
                            item.data.smena_id,
                            item.data.app_id,
                            this.props.numberChoose,
                            item.data,
                          )
                        : () => {
                            console.log(
                              this.props.numberChoose,
                              this.props.kind,
                              item.data.app_type,
                              this.props.numberChoose == 2 &&
                                (this.props.kind == "dir" || this.props.kind == "mega_dir") &&
                                item.data.app_type == "dir",
                            );
                          }
                    }
                    //onClick={ item.data.app_type == 'dir' || this.props.kind == 'dir' ? () => {} : this.props.openZPCart.bind(this, item.data.id, item.data.smena_id, item.data.app_id, this.props.numberChoose, item.data)}
                  >
                    {parseInt(item.data.check_period) == 1 ? item.data.my_bonus : " - "}
                  </TableCell>

                  {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                    <TableCell style={{ textAlign: "center" }}>
                      {parseInt(item.data.check_period) == 1
                        ? parseInt(item.data.dop_bonus) +
                          parseInt(item.data.dir_price) +
                          parseInt(item.data.register_price) +
                          parseInt(item.data.dir_price_dop) +
                          parseInt(item.data.h_price) +
                          parseInt(item.data.my_bonus) -
                          parseInt(item.data.err_price) +
                          ""
                        : " - "}
                    </TableCell>
                  ) : null}

                  {item.data.app_type == "driver" ? (
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  ) : (
                    <TableCell
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={this.props.openZP.bind(
                        this,
                        item.data.id,
                        item.data.smena_id,
                        item.data.app_id,
                        this.props.numberChoose,
                        item.data,
                      )}
                    >
                      {item.data.given}
                    </TableCell>
                  )}

                  {item.data.app_type == "driver" ? (
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  ) : (
                    <TableCell
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={
                        this.props.kind == "manager" || this.props.kind == "dir"
                          ? () => {}
                          : this.props.openZPCart.bind(
                              this,
                              item.data.id,
                              item.data.smena_id,
                              item.data.app_id,
                              this.props.numberChoose,
                              item.data,
                            )
                      }
                    >
                      {item.data.given_cart}
                    </TableCell>
                  )}

                  {item.data.app_type == "driver" ? (
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  ) : (
                    <TableCell style={{ textAlign: "center" }}>
                      {parseInt(item.data.check_period) == 1
                        ? parseInt(item.data.dop_bonus) +
                          parseInt(item.data.dir_price) +
                          parseInt(item.data.register_price) +
                          parseInt(item.data.dir_price_dop) +
                          parseInt(item.data.h_price) +
                          parseInt(item.data.my_bonus) -
                          parseInt(item.data.err_price) -
                          parseInt(item.data.given_cart) +
                          ""
                        : " - "}
                    </TableCell>
                  )}

                  {this.props.kind == "manager" || this.props.kind == "dir" ? (
                    false
                  ) : this.props.numberChoose == 1 ? (
                    false
                  ) : (
                    <TableCell
                      style={{
                        textAlign: "center",
                        backgroundColor: parseInt(item.data.acc_to_kas) == 1 ? "#c03" : "#fff",
                        color: parseInt(item.data.acc_to_kas) == 1 ? "#fff" : "#000",
                      }}
                    >
                      {parseInt(item.data.test_all_price)}
                    </TableCell>
                  )}
                </TableRow>
              ),
            )}
          </TableBody>

          {this.props.kind == "other" ? null : (
            <TableFooter sx={{ "& td": { color: "rgba(0, 0, 0, 0.87)" } }}>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}
                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    style={{ backgroundColor: item.type == "cur" ? "#98e38d" : "#fff" }}
                    key={key}
                  >
                    {item.res}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_dop_bonus_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_h_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_err_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_bonus_price}
                    </TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}>
                        {this.props.number.other_summ.sum_to_given_price}
                      </TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_given_price}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell>Роллов</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}
                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_rolls}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell>Пиццы</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}
                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_pizza}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell className="min_size">Заказы готовились больше 40 минут</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}
                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.order_stat.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_false}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    );
  }
}

class WorkSchedule_Table_without_functions extends React.Component {
  shouldComponentUpdate(nextProps) {
    // console.log(nextProps);

    // var array1 = nextProps.event;
    // var array2 = this.props.event;

    // var is_same =
    //   array1.length == array2.length &&
    //   array1.every(function (element, index) {
    //     return element === array2[index];
    //   });

    // return !is_same;
    return true;
  }

  render() {
    return (
      <TableContainer component={Paper}>
        <Table id={this.props.numberChoose === 1 ? "table_graph_one" : "table_graph_two"}>
          <TableBody>
            {this.props.test.map((item, key) =>
              item.row == "header" ? (
                <HeaderItem
                  key={key}
                  bonus_other={this.props.number.bonus_other}
                  // changeLVDir={this.props.changeLVDir.bind(this)}
                  // changeDopBonus={this.props.changeDopBonus.bind(this)}
                  kind={this.props.kind}
                  show_zp={this.props.show_zp}
                  lv_dir={this.props.lv_dir}
                  add_lv={this.props.add_lv}
                  lv_cafe={this.props.lv_cafe}
                  lv_dir_new={this.props.lv_dir_new}
                  dataKey={key}
                  days={this.props.number.days}
                  item={item}
                  openAddUser={this.props.openAddUser.bind(this)}
                  part={this.props.numberChoose}
                />
              ) : (
                <TableRow key={key}>
                  <TableCell
                    className="name_pinning"
                    style={{
                      background:
                        parseInt(item.data.type) == 0
                          ? "#fff"
                          : parseInt(item.data.type) == 1
                            ? "#fff"
                            : parseInt(item.data.type) == 2
                              ? "#ffcc00"
                              : "#c03",
                      color:
                        parseInt(item.data.type) == 0
                          ? "#000"
                          : parseInt(item.data.type) == 1
                            ? "#000"
                            : parseInt(item.data.type) == 2
                              ? "#000"
                              : "#fff",
                    }}
                    // onClick={this.props.openM.bind(this, item.data)}
                  >
                    {item.data.user_name}
                  </TableCell>

                  <TableCell style={{ minWidth: 165, minHeight: 38 }}>
                    {item.data.app_name}
                  </TableCell>

                  {this.props.kind == "manager" || this.props.kind == "other" ? null : (
                    <TableCell style={{ textAlign: "center" }} />
                  )}

                  {item.data.dates.map((date, date_k) => (
                    <TableCell
                      onClick={this.props.openH.bind(this, item.data, date.date)}
                      className="min_block"
                      style={{
                        backgroundColor: date.info ? date.info.color : "#fff",
                        color: date.info ? date.info.colorT : "#000",
                        cursor: "pointer",
                      }}
                      key={date_k}
                    >
                      {date.info ? date.info.hours : ""}
                    </TableCell>
                  ))}

                  {this.props.kind == "manager" ? null : (
                    <>
                      <TableCell
                        style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                        // onClick={this.props.pricePerHour.bind(this, item.data)}
                      >
                        {item.data.price_p_h}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center', minWidth: 70 }}>
                        {item.data.price_p_h_dop}
                      </TableCell>

                      <TableCell
                        style={{ textAlign: "center", сursor: "pointer" }}
                        // onClick={this.props.changeDopBonusUser.bind(this, item)}
                      >
                        {parseInt(item.data.check_period) == 1 ? item.data.dop_bonus : " - "}
                      </TableCell>

                      <TableCell style={{ textAlign: "center" }}>
                        {parseInt(item.data.check_period) == 1 ? item.data.h_price : " - "}
                      </TableCell>

                      <TableCell style={{ textAlign: "center" }}>
                        {parseInt(item.data.check_period) == 1 ? item.data.err_price : " - "}
                      </TableCell>

                      <TableCell style={{ textAlign: "center" }}>
                        {parseInt(item.data.check_period) == 1 ? item.data.my_bonus : " - "}
                      </TableCell>

                      {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                        <TableCell style={{ textAlign: "center" }}>
                          {parseInt(item.data.check_period) == 1
                            ? parseInt(item.data.dop_bonus) +
                              parseInt(item.data.dir_price) +
                              parseInt(item.data.register_price) +
                              parseInt(item.data.dir_price_dop) +
                              parseInt(item.data.h_price) +
                              parseInt(item.data.my_bonus) -
                              parseInt(item.data.err_price) +
                              ""
                            : " - "}
                        </TableCell>
                      ) : null}

                      {item.data.app_type == "driver" ? (
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                      ) : (
                        <TableCell style={{ textAlign: "center" }}>{item.data.given}</TableCell>
                      )}

                      <TableCell style={{ textAlign: "center" }}>{item.data.given_cart}</TableCell>
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    </>
                  )}
                </TableRow>
              ),
            )}
          </TableBody>

          {this.props.kind == "other" ? null : (
            <TableFooter sx={{ "& td": { color: "rgba(0, 0, 0, 0.87)" } }}>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    style={{ backgroundColor: item.type == "cur" ? "#98e38d" : "#fff" }}
                    key={key}
                  >
                    {item.res}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_dop_bonus_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_h_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_err_price}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_bonus_price}
                    </TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}>
                        {this.props.number.other_summ.sum_to_given_price}
                      </TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}>
                      {this.props.number.other_summ.sum_given_price}
                    </TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell>Роллов</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_rolls}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell>Пиццы</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.bonus.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_pizza}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell className="min_size">Заказы готовились больше 40 минут</TableCell>

                {this.props.kind == "manager" ? null : <TableCell></TableCell>}

                {this.props.number.order_stat.map((item, key) => (
                  <TableCell
                    className="min_block min_size"
                    key={key}
                  >
                    {item.count_false}
                  </TableCell>
                ))}

                {this.props.kind == "manager" ? null : (
                  <>
                    <TableCell
                      style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}
                    ></TableCell>

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>
                    <TableCell style={{ textAlign: "center" }}></TableCell>

                    {this.props.show_zp == 1 || this.props.show_zp == 0 ? (
                      <TableCell style={{ textAlign: "center" }}></TableCell>
                    ) : null}

                    <TableCell style={{ textAlign: "center" }}></TableCell>
                  </>
                )}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    );
  }
}

class WorkSchedule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "work_schedule",
      module_name: "",
      access: null,
      is_load: false,

      points: [],
      mounths: [],
      point: "",
      mounth: "",

      one: null,
      two: null,
      test_one: [],
      test_two: [],

      isOpenModalH: false,
      isOpenModalM: false,
      isOpenModalHMini: false,

      userInfo: null,

      hList: [],
      mList: [],

      newTimeStart: "10:00",
      newTimeEnd: "22:00",

      openNewTimeAdd: false,

      otherAppList: [],
      otherApp: "",

      testVal: "",
      testOpen: false,

      mainMenu: false,
      mainMenuH: false,
      mainMenuS: false,
      mainMenuSmena: false,
      show_bonus: false,
      mainMenuPrice: false,
      mainMenuLVDIR: false,
      mainMenuDopBonus: false,
      mainMenuZP: false,
      mainMenuZPCart: false,
      mainMenuPoints: false,

      mainMenuDopBonusUser: false,
      userDopBonus: null,

      show_zp_one: 0,
      show_zp_two: 0,
      kind: "",

      myOtherPoints: [],
      myOtherSmens: [],

      chooseUser: null,

      tabTable: 0,

      lv_cafe: 0,
      lv_dir: 0,
      add_lv: 0,
      lv_dir_new: 0,
      arr_dir_lv: [],

      arrTimeAdd: [],
      typeTimeAdd: 0,

      isShowErr: false,
      isShowErrCam: false,

      showErr: null,
      showErrCam: null,

      errOrdersOneOrders: [],
      errOrdersTwoOrders: [],
      errOrdersOneCam: [],
      errOrdersTwoCam: [],

      newSmena: false,
      editSmena: false,
      allUsers: [],
      smena: null,
      newSmenaName: "",

      operAlert: false,
      err_status: true,
      err_text: "",

      addUsers: [],
      mainMenuAddUsers: false,
      mainMenuAddUsersWeek: false,
      mainMenuAddUsersMounth: false,

      dataType: [
        { id: 1, name: "Выходной" },
        { id: 2, name: "Здоров" },
        { id: 3, name: "Больничный лист" },
      ],

      isOpenHJ: false,
      date_start: dayjs(Date.now()),
      date_end: dayjs(Date.now()),

      confirmDialog: false,
      methodConfirm: null,
      textConfirm: "",

      isOpenWS: false,
      date_start_ws: dayjs(Date.now()),
      date_end_ws: dayjs(Date.now()),

      isModalDirBonus: false,
      dir_bonus: 0,
    };
  }

  async componentDidMount() {
    let data = {};

    let res = await this.getData("get_all", data);

    let hList = [];
    let mList = [];

    for (let h = 0; h <= 23; h++) {
      hList.push({ id: h, name: h });
    }

    for (let m = 0; m <= 50; m += 10) {
      mList.push({ id: m, name: m });
    }

    this.setState({
      points: res.point_list,
      point: res.point_list[0].id,
      // access: res.access,

      mounths: res.mounths,
      mounth: res.mounths.find((item) => parseInt(item.is_active) == 1)["id"],

      hList: hList,
      mList: mList,

      module_name: res.module_info.name,
    });

    document.title = res.module_info.name;

    let arr_dir_lv = [];

    for (let i = -20; i <= 0; i++) {
      arr_dir_lv.push(i);
    }

    for (let i = 1; i <= 20; i++) {
      arr_dir_lv.push(i);
    }

    this.setState({
      arr_dir_lv: arr_dir_lv,
    });

    setTimeout(() => {
      this.updateData();
    }, 300);
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch("https://jacochef.ru/api/index_new.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == "redir") {
          window.location.pathname = "/";
          return;
        }

        if (json.st === false && json.type == "auth") {
          window.location.pathname = "/auth";
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
        console.log(err);
      });
  };

  changeCheckOrders(event) {
    let data = event.target.checked;

    this.setState({
      showReady: data,
    });
  }

  async updateData() {
    this.setState({
      one: null,
      two: null,
      test_one: [],
      test_two: [],
    });

    let data = {
      point_id: this.state.point,
      mounth: this.state.mounth,
    };

    let res = await this.getData("get_graph", data);

    // console.log(res);

    this.setState({
      one: res.date.one,
      two: res.date.two,

      test_one: res.one,
      test_two: res.two,

      show_zp_one: res.show_zp_one,
      show_zp_two: res.show_zp_two,
      kind: res.kind,

      lv_cafe: res.lv_cafe,
      lv_dir: res.lv_dir,
      add_lv: res.add_lv,
      lv_dir_new: res.lv_dir_new,

      errOrdersOneOrders: res.err.one.orders,
      errOrdersTwoOrders: res.err.two.orders,

      errOrdersOneCam: res.err.one.cam,
      errOrdersTwoCam: res.err.two.cam,

      isShowErr: false,
      showErr: null,

      tabTable: localStorage.getItem("tabTable")
        ? parseInt(localStorage.getItem("tabTable"))
        : parseInt(res.part) - 1,
    });
  }

  async openH(item, this_date) {
    let data = {
      smena_id: item.smena_id,
      app_id: item.app_id,
      user_id: item.id,
      date: this_date,
      date_start: item.date,
    };

    let res = await this.getData("get_user_day", data);

    // console.log(res);

    this.setState({
      isOpenModalH: true,
      userInfo: res.h_info,
      otherAppList: res.other_app,
      show_bonus: res.show_bonus,
    });
  }

  async openHMini(item, this_date) {
    let data = {
      smena_id: item.smena_id,
      app_id: item.app_id,
      user_id: item.id,
      date: this_date,
      date_start: item.date,
    };

    let res = await this.getData("get_user_day", data);

    // console.log(res);

    this.setState({
      isOpenModalHMini: true,
      userInfo: res.h_info,
      //otherAppList: res.other_app,
      show_bonus: res.show_bonus,
    });
  }

  async openM(item) {
    // console.log(item);

    let data = {
      smena_id: item.smena_id,
      app_id: item.app_id,
      user_id: item.id,
      date: this.state.mounth,
      date_start: item.date,
    };

    // console.log(data);

    let res = await this.getData("get_user_month", data);

    // console.log(res);

    this.setState({
      isOpenModalM: true,
      userInfo: res.h_info,
      arrTimeAdd: res.hourse_days,
    });
  }

  delTime(key_time) {
    let userInfo = this.state.userInfo;

    userInfo.hours = userInfo.hours.filter((item, key) => parseInt(key) != parseInt(key_time));

    this.setState({
      userInfo: userInfo,
    });
  }

  changeHourse(type, key, event) {
    let userInfo = this.state.userInfo;

    userInfo.hours[key][[type]] = event.target.value;

    this.setState({
      userInfo: userInfo,
    });
  }

  async saveDayHourse() {
    //let dataType = this.state.dataType.find( el => parseInt(el.id) == parseInt(this.state.userInfo.dataType) );

    let data = {
      date: this.state.userInfo.date,
      user_id: this.state.userInfo.user_id,
      smena_id: this.state.userInfo.smena_id,
      app_id: this.state.userInfo.app_id,
      hours: this.state.userInfo.hours,
      new_app: this.state.userInfo.new_app,
      mentor_id: this.state.userInfo.mentor_id,

      user_temp: this.state.userInfo.user_temp,
      type_healf: this.state.userInfo.type_healf,

      point_id: this.state.point,
    };

    let res = await this.getData("save_user_day", data);

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuH: false,
        mainMenuSmena: false,
        isOpenModalH: false,
        userInfo: null,
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  addTime() {
    let userInfo = this.state.userInfo;

    let check = userInfo.hours.find(
      (item) =>
        item.time_start == this.state.newTimeStart && item.time_end == this.state.newTimeEnd,
    );

    if (check) {
      this.setState({
        openNewTimeAdd: false,
      });

      return;
    }

    userInfo.hours.push({ time_start: this.state.newTimeStart, time_end: this.state.newTimeEnd });

    this.setState({
      userInfo: userInfo,
      openNewTimeAdd: false,
    });
  }

  async saveFastTimeWeekOne(type) {
    let data = {
      type: type,
      user_id: this.state.chooseUser.id,
      app_id: this.state.chooseUser.app_id,
      smena_id: this.state.chooseUser.smena_id,
      date: this.state.mounth,
    };

    let res = await this.getData("save_fastTimeWeekOne", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuS: false,
        mainMenuSmena: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async fastTime(type) {
    let data = {
      type: type,
      user_id: this.state.chooseUser.id,
      app_id: this.state.chooseUser.app_id,
      smena_id: this.state.chooseUser.smena_id,
      date: this.state.mounth,
    };

    let res = await this.getData("save_fastTime", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuH: false,
        mainMenuSmena: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async fastSmena(smena_id) {
    let data = {
      new_smena_id: smena_id,
      user_id: this.state.chooseUser.id,
      app_id: this.state.chooseUser.app_id,
      smena_id: this.state.chooseUser.smena_id,
      date: this.state.mounth,
      part: this.state.tabTable,
    };

    let res = await this.getData("save_fastSmena", data);

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuH: false,
        mainMenuSmena: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async changePriceH(price) {
    let data = {
      price: price,
      user_id: this.state.chooseUser.id,
      app_id: this.state.chooseUser.app_id,
      smena_id: this.state.chooseUser.smena_id,
      date: this.state.mounth,
      part: this.state.tabTable,
    };

    let res = await this.getData("save_userPriceH", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuH: false,
        mainMenuPrice: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.updateData();
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  checkFastPoint(point) {
    //console.log(point);

    this.setState({
      confirmDialog: true,
      methodConfirm: this.fastPoint.bind(this, point.point_id, point.smena_id),
      textConfirm: "Точно сменить точку с сегоднешнего дня ?",
    });
  }

  async fastPoint(point_id, smena_id) {
    let data = {
      new_point_id: point_id,
      new_smena_id: smena_id,
      user_id: this.state.chooseUser.id,
      app_id: this.state.chooseUser.app_id,
      smena_id: this.state.chooseUser.smena_id,
    };

    let res = await this.getData("save_fastPoint", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenu: false,
        mainMenuPoints: false,
        chooseUser: null,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeLVDir() {
    this.setState({
      mainMenuLVDIR: true,
    });
  }

  checkNewLvDir(LV) {
    this.setState({
      confirmDialog: true,
      methodConfirm: this.newLvDir.bind(this, LV),
      textConfirm: "Точно изменить уровень директора ?",
    });
  }

  async newLvDir(LV) {
    let data = {
      date: this.state.mounth,
      point_id: this.state.point,
      dir_lv: LV,
    };

    let res = await this.getData("save_dir_lv", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenuLVDIR: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeDopBonus() {
    this.setState({
      mainMenuDopBonus: true,
    });
  }

  changeDopBonusUser(item) {
    this.setState({
      mainMenuDopBonusUser: true,
      userDopBonus: item,
    });
  }

  checkDopBonus(type) {
    this.setState({
      confirmDialog: true,
      methodConfirm: this.dop_bonus.bind(this, type),
      textConfirm: "Точно ?",
    });
  }

  async dop_bonus(type) {
    let res;

    if (type === 3) {
      const user = this.state.userDopBonus;

      const data = {
        user_id: user.data.id,
        smena_id: user.data.smena_id,
        app_id: user.data.app_id,
        part: this.state.tabTable,
        data: this.state.mounth,
        point_id: this.state.point,
      };

      res = await this.getData("del_dop_bonus_user", data);

      // console.log( res );
    } else {
      let data = {
        date: this.state.mounth,
        part: this.state.tabTable,
        point_id: this.state.point,
        type: type,
      };

      res = await this.getData("save_dop_bonus", data);

      // console.log( res );
    }

    if (res["st"] == true) {
      this.setState({
        mainMenuDopBonus: false,
        mainMenuDopBonusUser: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.updateData();
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  renderWeekPickerDay = (props) => {
    const date = dayjs(props.day).format("YYYY-MM-DD");

    let arr = this.state.arrTimeAdd;
    let res = arr.find((item) => item.date === date);

    if (res) {
      let backgroundColor = "#fff";

      if (parseInt(res.type) == 0) {
        backgroundColor = "#98e38d";
      } else {
        if (parseInt(res.type) == 1) {
          backgroundColor = "#3dcef2";
        } else {
          if (parseInt(res.type) == 2) {
            backgroundColor = "#1560bd";
          } else {
            backgroundColor = "#926eae";
          }
        }
      }

      return (
        <PickersDay
          {...props}
          style={{ backgroundColor: backgroundColor, color: "#fff" }}
          onClick={this.chooseDay.bind(this, date)}
        />
      );
    }

    return (
      <PickersDay
        {...props}
        style={{ backgroundColor: "#fff", color: "rgba(0, 0, 0, 0.87)" }}
        onClick={this.chooseDay.bind(this, date)}
      />
    );
  };

  chooseDay(newValue, event) {
    let arr = this.state.arrTimeAdd;

    let res = arr.find((item) => item.date === newValue);

    if (!res) {
      let time_start = "";
      let time_end = "";

      if (parseInt(this.state.typeTimeAdd) == 0) {
        time_start = "10:00";
        time_end = "22:00";
      }

      if (parseInt(this.state.typeTimeAdd) == 1) {
        time_start = "10:00";
        time_end = "16:00";
      }

      if (parseInt(this.state.typeTimeAdd) == 2) {
        time_start = "16:00";
        time_end = "22:00";
      }

      arr.push({
        date: dayjs(newValue).format("YYYY-MM-DD"),
        type: this.state.typeTimeAdd,
        time_start: time_start,
        time_end: time_end,
      });

      this.setState({
        arrTimeAdd: arr,
      });
    } else {
      if (res.type === this.state.typeTimeAdd) {
        let newArr = arr.filter((item) => item.date !== newValue);

        this.setState({
          arrTimeAdd: newArr,
        });
      } else {
        arr.forEach((item) => {
          if (item.date === newValue) {
            item.type = this.state.typeTimeAdd;
          }
        });

        this.setState({
          arrTimeAdd: arr,
        });
      }
    }
  }

  chooseType(type) {
    this.setState({
      typeTimeAdd: type,
    });
  }

  async saveUserM() {
    let data = {
      dates: this.state.arrTimeAdd,
      point_id: this.state.point,
      date: this.state.mounth,

      user_id: this.state.userInfo.user.user_id,
      smena_id: this.state.userInfo.user.smena_id,
      app_id: this.state.userInfo.user.app_id,
    };

    let res = await this.getData("save_user_month", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        isOpenModalM: false,
        userInfo: null,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  openZP(user_id, smena_id, app_id, part, user) {
    // console.log(user_id, smena_id, app_id, part, user)

    let fullPrice =
      parseInt(user.h_price) +
      parseInt(user.my_bonus) +
      parseInt(user.dir_price) +
      parseInt(user.dir_price_dop) +
      parseInt(user.dop_bonus) -
      parseInt(user.err_price) -
      parseInt(user.given_cart);

    this.setState({
      mainMenuZP: true,
      userInfo: {
        name: user.user_name,
        app: user.full_app_name,
        fullPrice: fullPrice,
        given: user.given_cash,
        date: this.state.mounth + (parseInt(part) == 1 ? "-01" : "-16"),
        user_id: user_id,
        smena_id: smena_id,
        app_id: app_id,
      },
    });
  }

  openZPCart(user_id, smena_id, app_id, part, user) {
    // console.log(user_id, smena_id, app_id, part, user)

    let fullPrice =
      parseInt(user.h_price) +
      parseInt(user.my_bonus) +
      parseInt(user.dir_price) +
      parseInt(user.dir_price_dop) +
      parseInt(user.dop_bonus) -
      parseInt(user.err_price);

    this.setState({
      mainMenuZPCart: true,
      userInfo: {
        name: user.user_name,
        app: user.full_app_name,
        fullPrice: fullPrice,
        given: user.given_cart,
        date: this.state.mounth + (parseInt(part) == 1 ? "-01" : "-16"),
        user_id: user_id,
        smena_id: smena_id,
        app_id: app_id,
      },
    });
  }

  async saveGive() {
    let data = {
      date: this.state.userInfo.date,
      user_id: this.state.userInfo.user_id,
      smena_id: this.state.userInfo.smena_id,
      app_id: this.state.userInfo.app_id,
      give_price: this.state.userInfo.given,
    };

    let res = await this.getData("save_user_give_price", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenuZP: false,
        userInfo: null,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveGiveCart() {
    let data = {
      date: this.state.userInfo.date,
      user_id: this.state.userInfo.user_id,
      smena_id: this.state.userInfo.smena_id,
      app_id: this.state.userInfo.app_id,
      give_price: this.state.userInfo.given,
    };

    let res = await this.getData("save_user_give_cart_price", data);

    // console.log( res );

    if (res["st"] == true) {
      this.setState({
        mainMenuZPCart: false,
        userInfo: null,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  mix(item) {
    // console.log(item)
    this.setState({
      mainMenu: true,
      chooseUser: item,
    });
  }

  pricePerHour(item) {
    // console.log(item)
    this.setState({
      mainMenuPrice: true,
      chooseUser: item,
    });
  }

  async showErrOrder(id, row_id) {
    let data = {
      id: id,
      row_id: row_id,
    };

    let res = await this.getData("get_my_err_order", data);

    // console.log(res);

    this.setState({
      showErr: res,
      isShowErr: true,
    });
  }

  fakeOrders() {
    this.setState({
      confirmDialog: true,
      methodConfirm: this.saveFakeOrders.bind(this),
      textConfirm: "Точно обжаловать ?",
    });
  }

  async saveFakeOrders() {
    let data = {
      err_id: this.state.showErr.err_id,
      row_id: this.state.showErr.row_id,
      order_id: this.state.showErr.order_id,
      text: this.state.showErr.new_text_1,
    };

    // console.log(data);

    let res = await this.getData("save_fake_orders", data);

    if (res["st"] == true) {
      this.setState({
        isShowErr: false,
        showErr: null,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async showErrCam(id) {
    let data = {
      id: id,
    };

    let res = await this.getData("get_my_err_cam", data);

    // console.log(res);

    this.setState({
      showErrCam: res,
      isShowErrCam: true,
    });
  }

  fakeCam() {
    this.setState({
      confirmDialog: true,
      methodConfirm: this.saveFakeCam.bind(this),
      textConfirm: "Точно обжаловать ?",
    });
  }

  async saveFakeCam() {
    let data = {
      id: this.state.showErrCam.id,
      text: this.state.showErrCam.text_one,
    };

    let res = await this.getData("save_fake_cam", data);

    // console.log(res);

    this.setState({
      showErrCam: res,
      isShowErrCam: true,

      operAlert: true,
      err_status: res.st,
      err_text: res.text,
    });
  }

  async addSmena() {
    let data = {
      point_id: this.state.point,
    };

    let res = await this.getData("getAllForNewSmena", data);

    // console.log(res);

    this.setState({
      newSmena: true,
      newSmenaName: "",
      allUsers: res.free_users,
    });
  }

  async editSmena(id) {
    let data = {
      id: id,
      point_id: this.state.point,
    };

    let res = await this.getData("getOneSmena", data);

    this.setState({
      editSmena: true,
      smena: res.smena,
      newSmenaName: res.smena.name,
      allUsers: res.free_users,
    });
  }

  async saveNewSmena() {
    let data = {
      name: this.state.newSmenaName,
      point_id: this.state.point,
      users: this.state.allUsers,
    };

    let res = await this.getData("saveNewSmena", data);

    // console.log(res);

    if (res["st"] == true) {
      this.setState({
        newSmenaName: "",
        newSmena: false,
        allUsers: [],

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveEditSmena() {
    let data = {
      id: this.state.smena.id,
      name: this.state.newSmenaName,
      point_id: this.state.point,
      users: this.state.allUsers,
    };

    let res = await this.getData("saveEditSmena", data);

    if (res["st"] == true) {
      this.setState({
        newSmenaName: "",
        editSmena: false,
        smena: null,
        allUsers: [],

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  deleteSmenaConfirm() {
    this.setState({
      confirmDialog: true,
      methodConfirm: this.deleteSmena.bind(this),
      textConfirm: "Удалить смену ?",
    });
  }

  async deleteSmena() {
    let data = {
      id: this.state.smena.id,
      point_id: this.state.point,
      users: this.state.allUsers,
    };

    let res = await this.getData("deleteSmena", data);

    // console.log(res);

    if (res["st"] == true) {
      this.setState({
        newSmenaName: "",
        editSmena: false,
        smena: null,
        allUsers: [],

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeNewSmenaUsers(user_id) {
    const userList = this.state.allUsers;

    userList.map((item, key) => {
      if (parseInt(item.id) == parseInt(user_id)) {
        userList[key]["is_my"] = parseInt(item.is_my) == 1 ? 0 : 1;
      }
    });

    this.setState({
      allUsers: userList,
    });
  }

  addUser(user, event) {
    let addUser = this.state.addUsers;

    if (event.target.checked) {
      addUser.push({ app_id: user.app_id, smena_id: user.smena_id, user_id: user.id });
    } else {
      addUser = addUser.filter((us) => us.user_id !== user.id);
    }

    this.setState({
      addUsers: addUser,
    });
  }

  async saveFastTimeWeek(type) {
    const data = {
      type,
      date: this.state.mounth,
      users: this.state.addUsers,
    };

    const res = await this.getData("save_fastTime_arr_two_week", data);

    // console.log( res );

    if (res.st) {
      this.setState({
        mainMenuAddUsersWeek: false,
        addUsers: [],
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveFastTimeMounth(type) {
    const data = {
      type,
      date: this.state.mounth,
      users: this.state.addUsers,
    };

    const res = await this.getData("save_fastTime_arr_mounth", data);

    // console.log( res );

    if (res.st) {
      this.setState({
        mainMenuAddUsersMounth: false,
        addUsers: [],
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  async downloadHJ() {
    let data = {
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
      point_id: this.state.point,
    };

    const res = await this.getData("downloadHJ", data);

    // правка 26.12 скачивания файла в один клик
    if (res.url) {
      const link = document.createElement("a");
      link.href = res.url;
      link.click();
    }
  }

  async downloadWS() {
    const data = {
      date_start: dayjs(this.state.date_start_ws).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end_ws).format("YYYY-MM-DD"),
      point_id: this.state.point,
    };

    const res = await this.getData("downloadWS", data);

    if (res.url) {
      const link = document.createElement("a");
      link.href = res.url;
      link.click();
    }
  }

  clickAppNameUser(index, numberChoose) {
    if (numberChoose === 1) {
      const test_one = this.state.test_one;

      test_one.forEach((item, i) => {
        if (index === i) {
          item.color = item?.color ? !item?.color : true;
        } else {
          item.color = false;
        }
      });

      this.setState({
        test_one,
      });
    }

    if (numberChoose === 2) {
      const test_two = this.state.test_two;

      test_two.forEach((item, i) => {
        if (index === i) {
          item.color = item?.color ? !item?.color : true;
        } else {
          item.color = false;
        }
      });

      this.setState({
        test_two,
      });
    }
  }

  openModalDirBonus(user_id, smena_id, app_id, part, user) {
    console.log(user_id, smena_id, app_id, part, user);

    this.setState({
      isModalDirBonus: true,
      dir_bonus: user?.dir_bonus,
      userInfo: {
        name: user.user_name,
        app: user.full_app_name,
        given: user.given_cash,
        date: this.state.mounth + (parseInt(part) == 1 ? "-01" : "-16"),
        user_id: user_id,
        smena_id: smena_id,
        app_id: app_id,
      },
    });
  }

  async saveDirBonus() {
    const data = {
      date: this.state.mounth,
      bonus: this.state.dir_bonus,
      user_id: this.state.userInfo.user_id,
    };

    const res = await this.getData("save_dirBonus", data);

    if (res.st) {
      this.setState({
        isModalDirBonus: false,
        userInfo: {},
        dir_bonus: "",
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.updateData();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  canAccess(property) {
    // return handleUserAccess(this.state.access)?.userCan('access', property);
    return true;
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 999 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {/* <TestAccess access={this.state.access} setAccess={(access) => this.setState({ access })} /> */}
        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {/* конфирм */}
        <WorkSchedule_Confirm
          open={this.state.confirmDialog}
          onClose={() =>
            this.setState({ confirmDialog: false, textConfirm: "", methodConfirm: null })
          }
          textConfirm={this.state.textConfirm}
          methodConfirm={this.state.methodConfirm}
        />
        <Dialog
          onClose={() => this.setState({ mainMenuAddUsersMounth: false })}
          open={this.state.mainMenuAddUsersMounth}
        >
          <List sx={{ pt: 0 }}>
            <ListItemButton onClick={this.saveFastTimeMounth.bind(this, 1)}>
              <ListItemAvatar>
                <Avatar>
                  <LooksOneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"С 1 числа 2/2 с 10 до 22 на месяц"} />
            </ListItemButton>

            <ListItemButton onClick={this.saveFastTimeMounth.bind(this, 2)}>
              <ListItemAvatar>
                <Avatar>
                  <LooksTwoIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"С 2 числа 2/2 с 10 до 22 на месяц"} />
            </ListItemButton>

            <ListItemButton onClick={this.saveFastTimeMounth.bind(this, 3)}>
              <ListItemAvatar>
                <Avatar>
                  <Looks3Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"С 3 числа 2/2 с 10 до 22 на месяц"} />
            </ListItemButton>

            <ListItemButton onClick={this.saveFastTimeMounth.bind(this, 4)}>
              <ListItemAvatar>
                <Avatar>
                  <Looks4Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"С 4 числа 2/2 с 10 до 22 на месяц"} />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuAddUsersWeek: false })}
          open={this.state.mainMenuAddUsersWeek}
        >
          <List sx={{ pt: 0 }}>
            <ListItemButton
              onClick={this.saveFastTimeWeek.bind(this, this.state.tabTable === 0 ? 1 : 16)}
            >
              <ListItemAvatar>
                <Avatar>
                  <LooksOneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 1 числа 2/2 с 10 до 22 на две недели"
                    : "С 16 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeek.bind(this, this.state.tabTable === 0 ? 2 : 17)}
            >
              <ListItemAvatar>
                <Avatar>
                  <LooksTwoIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 2 числа 2/2 с 10 до 22 на две недели"
                    : "С 17 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeek.bind(this, this.state.tabTable === 0 ? 3 : 18)}
            >
              <ListItemAvatar>
                <Avatar>
                  <Looks3Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 3 числа 2/2 с 10 до 22 на две недели"
                    : "С 18 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeek.bind(this, this.state.tabTable === 0 ? 4 : 19)}
            >
              <ListItemAvatar>
                <Avatar>
                  <Looks4Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 4 числа 2/2 с 10 до 22 на две недели"
                    : "С 19 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuAddUsers: false })}
          open={this.state.mainMenuAddUsers}
        >
          <DialogTitle className="button">
            Выбранные сотрудники {this.state.mounth}
            <IconButton
              onClick={() => this.setState({ mainMenuAddUsers: false })}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <List sx={{ pt: 0 }}>
            <ListItemButton
              onClick={() =>
                this.setState({ mainMenuAddUsers: false, mainMenuAddUsersMounth: true })
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <AccessTimeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить часы на месяц" />
            </ListItemButton>

            <ListItemButton
              onClick={() => this.setState({ mainMenuAddUsers: false, mainMenuAddUsersWeek: true })}
            >
              <ListItemAvatar>
                <Avatar>
                  <SyncAltIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить часы на 2 недели" />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuS: false })}
          open={this.state.mainMenuS}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              {this.state.chooseUser.full_app_name} {this.state.chooseUser.user_name}{" "}
              {this.state.mounth}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuS: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          <List sx={{ pt: 0 }}>
            <ListItemButton
              onClick={this.saveFastTimeWeekOne.bind(this, this.state.tabTable === 0 ? 1 : 16)}
            >
              <ListItemAvatar>
                <Avatar>
                  <LooksOneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 1 числа 2/2 с 10 до 22 на две недели"
                    : "С 16 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeekOne.bind(this, this.state.tabTable === 0 ? 2 : 17)}
            >
              <ListItemAvatar>
                <Avatar>
                  <LooksTwoIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 2 числа 2/2 с 10 до 22 на две недели"
                    : "С 17 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeekOne.bind(this, this.state.tabTable === 0 ? 3 : 18)}
            >
              <ListItemAvatar>
                <Avatar>
                  <Looks3Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 3 числа 2/2 с 10 до 22 на две недели"
                    : "С 18 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>

            <ListItemButton
              onClick={this.saveFastTimeWeekOne.bind(this, this.state.tabTable === 0 ? 4 : 19)}
            >
              <ListItemAvatar>
                <Avatar>
                  <Looks4Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  this.state.tabTable === 0
                    ? "С 4 числа 2/2 с 10 до 22 на две недели"
                    : "С 19 числа 2/2 с 10 до 22 на две недели"
                }
              />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenu: false })}
          open={this.state.mainMenu}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              {this.state.chooseUser.full_app_name} {this.state.chooseUser.user_name}{" "}
              {this.state.mounth}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenu: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          <List sx={{ pt: 0 }}>
            <ListItemButton onClick={() => this.setState({ mainMenu: false, mainMenuH: true })}>
              <ListItemAvatar>
                <Avatar>
                  <AccessTimeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить часы на месяц" />
            </ListItemButton>

            <ListItemButton onClick={() => this.setState({ mainMenu: false, mainMenuS: true })}>
              <ListItemAvatar>
                <Avatar>
                  <AccessTimeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить часы на 2 недели" />
            </ListItemButton>

            <ListItemButton
              onClick={() =>
                this.setState({
                  mainMenu: false,
                  mainMenuSmena: true,
                  myOtherSmens: this.state.chooseUser.other_smens,
                })
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <SyncAltIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить смену" />
            </ListItemButton>

            <ListItemButton
              onClick={() =>
                this.setState({
                  mainMenu: false,
                  mainMenuPoints: true,
                  myOtherPoints: this.state.chooseUser.other_points,
                })
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <HomeWorkIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Сменить точку" />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuH: false })}
          open={this.state.mainMenuH}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              Часы {this.state.chooseUser.user_name} {this.state.mounth}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuH: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          <List sx={{ pt: 0 }}>
            <ListItemButton onClick={this.fastTime.bind(this, 1)}>
              <ListItemAvatar>
                <Avatar>
                  <LooksOneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="С 1 числа 2/2 с 10 до 22 на месяц" />
            </ListItemButton>

            <ListItemButton onClick={this.fastTime.bind(this, 2)}>
              <ListItemAvatar>
                <Avatar>
                  <LooksTwoIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="С 2 числа 2/2 с 10 до 22 на месяц" />
            </ListItemButton>
            <ListItemButton onClick={this.fastTime.bind(this, 3)}>
              <ListItemAvatar>
                <Avatar>
                  <Looks3Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="С 3 числа 2/2 с 10 до 22 на месяц" />
            </ListItemButton>
            <ListItemButton onClick={this.fastTime.bind(this, 4)}>
              <ListItemAvatar>
                <Avatar>
                  <Looks4Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="С 4 числа 2/2 с 10 до 22 на месяц" />
            </ListItemButton>
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuSmena: false })}
          open={this.state.mainMenuSmena}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              Смена {this.state.chooseUser.user_name} {this.state.mounth}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuSmena: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          <List sx={{ pt: 0 }}>
            {this.state.myOtherSmens.map((item, key) => (
              <ListItemButton
                key={key}
                onClick={this.fastSmena.bind(this, item.id)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <AssessmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuPoints: false })}
          open={this.state.mainMenuPoints}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              Смена точка с сегоднешнего дня {this.state.chooseUser.user_name}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuPoints: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          <List sx={{ pt: 0 }}>
            {this.state.myOtherPoints.map((item, key) => (
              <ListItemButton
                key={key}
                onClick={this.checkFastPoint.bind(this, item)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <HomeWorkIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuPrice: false })}
          open={this.state.mainMenuPrice}
        >
          {!this.state.chooseUser ? null : (
            <DialogTitle className="button">
              Часовая ставка {this.state.chooseUser.user_name} {this.state.mounth}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuPrice: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
          )}

          {!this.state.chooseUser ? null : (
            <List sx={{ pt: 0 }}>
              {this.state.chooseUser.price_arr.map((item, key) => (
                <ListItemButton
                  key={key}
                  onClick={this.changePriceH.bind(this, item)}
                  style={
                    parseFloat(this.state.chooseUser.price_p_h) == parseFloat(item)
                      ? { backgroundColor: "green", color: "#fff" }
                      : {}
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <AssessmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={item} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuLVDIR: false })}
          open={this.state.mainMenuLVDIR}
        >
          <DialogTitle className="button">
            Изменение уровня дирекора {this.state.mounth}
            <IconButton
              onClick={() => {
                this.setState({ mainMenuLVDIR: false });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <List style={{ overflow: "scroll" }}>
            {this.state.arr_dir_lv.map((item, key) => (
              <ListItemButton
                key={key}
                style={
                  parseFloat(this.state.add_lv) == parseFloat(item)
                    ? { backgroundColor: "green", color: "#fff" }
                    : {}
                }
                onClick={this.checkNewLvDir.bind(this, item)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <AssessmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item + " уровень"} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ mainMenuDopBonus: false })}
          open={this.state.mainMenuDopBonus}
        >
          <DialogTitle className="button">
            Командный бонус {this.state.mounth}-{parseInt(this.state.tabTable) == 0 ? "01" : "16"}
            <IconButton
              onClick={() => {
                this.setState({ mainMenuDopBonus: false });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <List sx={{ pt: 0 }}>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar style={{ backgroundColor: "green" }}>
                  <CheckIcon style={{ color: "#fff" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={"Выдать"}
                onClick={this.checkDopBonus.bind(this, 1)}
              />
            </ListItemButton>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar style={{ backgroundColor: "red" }}>
                  <CloseIcon style={{ color: "#fff" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={"Отказать"}
                onClick={this.checkDopBonus.bind(this, 2)}
              />
            </ListItemButton>
          </List>
        </Dialog>
        {/* Лишение бонуса конкретного сотрудника */}
        <Dialog
          onClose={() => this.setState({ mainMenuDopBonusUser: false })}
          open={this.state.mainMenuDopBonusUser}
        >
          <DialogTitle className="button">
            Командный бонус {this.state.mounth}-{parseInt(this.state.tabTable) == 0 ? "01" : "16"}{" "}
            {this.state.userDopBonus?.data.user_name ?? ""}
            <IconButton
              onClick={() => {
                this.setState({ mainMenuDopBonusUser: false });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <List sx={{ pt: 0 }}>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar style={{ backgroundColor: "green" }}>
                  <CloseIcon style={{ color: "#fff" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={"Отмена"}
                onClick={() => this.setState({ mainMenuDopBonusUser: false })}
              />
            </ListItemButton>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar style={{ backgroundColor: "red" }}>
                  <CheckIcon style={{ color: "#fff" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={"Лишить"}
                onClick={this.checkDopBonus.bind(this, 3)}
              />
            </ListItemButton>
          </List>
        </Dialog>
        {!this.state.userInfo || this.state.mainMenuZP === false ? null : (
          <Dialog
            onClose={() => this.setState({ mainMenuZP: false, userInfo: null })}
            open={this.state.mainMenuZP}
          >
            <DialogTitle className="button">
              {this.state.userInfo.app} {this.state.userInfo.name} {this.state.userInfo.date}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuZP: false, userInfo: null });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Grid
                container
                spacing={3}
                style={{ marginTop: 10 }}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <MyTextInput
                    label="Выданная сумма"
                    value={this.state.userInfo.given}
                    func={(event) => {
                      let userInfo = this.state.userInfo;
                      userInfo.given = event.target.value;
                      this.setState({ userInfo: userInfo });
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Вся сумма: </span>
                  <span
                    style={{ color: "#c03", borderBottom: "1px dotted #c03", cursor: "pointer" }}
                    onClick={() => {
                      let userInfo = this.state.userInfo;
                      userInfo.given = userInfo.fullPrice;
                      this.setState({ userInfo: userInfo });
                    }}
                  >
                    {this.state.userInfo.fullPrice}
                  </span>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.saveGive.bind(this)}
              >
                Сохранить
              </Button>
              <Button
                style={{ backgroundColor: "red", color: "#fff" }}
                onClick={() => this.setState({ mainMenuZP: false, userInfo: null })}
              >
                Отмена
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {!this.state.userInfo || this.state.mainMenuZPCart === false ? null : (
          <Dialog
            onClose={() => this.setState({ mainMenuZPCart: false, userInfo: null })}
            open={this.state.mainMenuZPCart}
          >
            <DialogTitle className="button">
              Перечислено на карту {this.state.userInfo.app} {this.state.userInfo.name}{" "}
              {this.state.userInfo.date}
              <IconButton
                onClick={() => {
                  this.setState({ mainMenuZPCart: false, userInfo: null });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Grid
                container
                spacing={3}
                style={{ marginTop: 10 }}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <MyTextInput
                    label="Выданная сумма"
                    value={this.state.userInfo.given}
                    func={(event) => {
                      let userInfo = this.state.userInfo;
                      userInfo.given = event.target.value;
                      this.setState({ userInfo: userInfo });
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <span>Вся сумма: </span>
                  <span
                    style={{ color: "#c03", borderBottom: "1px dotted #c03", cursor: "pointer" }}
                    onClick={() => {
                      let userInfo = this.state.userInfo;
                      userInfo.given = userInfo.fullPrice;
                      this.setState({ userInfo: userInfo });
                    }}
                  >
                    {this.state.userInfo.fullPrice}
                  </span>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.saveGiveCart.bind(this)}
              >
                Сохранить
              </Button>
              <Button
                style={{ backgroundColor: "red", color: "#fff" }}
                onClick={() => this.setState({ mainMenuZPCart: false, userInfo: null })}
              >
                Отмена
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {!this.state.userInfo || this.state.isOpenModalH === false ? null : (
          <Dialog
            open={this.state.isOpenModalH}
            onClose={() => this.setState({ isOpenModalH: false })}
            scroll="paper"
            fullWidth={true}
            maxWidth={"md"}
            id={"OpenModalH"}
          >
            <DialogTitle
              className="button"
              id="scroll-dialog-title"
            >
              {this.state.userInfo.user.app_name +
                " " +
                this.state.userInfo.user.user_name +
                " " +
                this.state.userInfo.date}
              <IconButton
                onClick={() => {
                  this.setState({ isOpenModalH: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
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
                    sm: 12,
                  }}
                >
                  <Typography style={{ marginBottom: 10 }}>
                    {"Нагрузка: " +
                      this.state.userInfo.user.my_load_h +
                      " / Средняя нагрузка: " +
                      this.state.userInfo.user.all_load_h}
                  </Typography>
                </Grid>

                {!this.state.show_bonus ? null : (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <Typography style={{ marginBottom: 10 }}>
                      {"Бонус: " + this.state.userInfo.user.bonus}
                    </Typography>
                  </Grid>
                )}

                {this.state.otherAppList.length == 0 ? null : (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <MySelect
                      data={this.state.otherAppList}
                      value={this.state.userInfo.new_app}
                      func={(event) => {
                        let userInfo = this.state.userInfo;
                        userInfo.new_app = event.target.value;
                        this.setState({ userInfo: userInfo });
                      }}
                      label="Кем работает"
                    />
                  </Grid>
                )}

                {this.state.userInfo.mentor_list.length == 0 ? null : (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <MySelect
                      data={this.state.userInfo.mentor_list}
                      value={this.state.userInfo.mentor_id}
                      func={(event) => {
                        let userInfo = this.state.userInfo;
                        userInfo.mentor_id = event.target.value;
                        this.setState({ userInfo: userInfo });
                      }}
                      label="Наставник"
                    />
                  </Grid>
                )}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyAutocomplite2
                    data={[{ id: 1, name: "36,6" }]}
                    value={this.state.userInfo.user_temp}
                    freeSolo={true}
                    func={(event, data) => {
                      console.log(event, data);

                      let userInfo = this.state.userInfo;
                      userInfo.user_temp = data;
                      this.setState({ userInfo: userInfo });
                    }}
                    onBlur={(event, data) => {
                      console.log(event.target.value, data);

                      let userInfo = this.state.userInfo;
                      userInfo.user_temp = event.target.value;
                      this.setState({ userInfo: userInfo });
                    }}
                    label="Температура"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MySelect
                    data={this.state.dataType}
                    value={this.state.userInfo.type_healf}
                    func={(event) => {
                      let userInfo = this.state.userInfo;
                      userInfo.type_healf = event.target.value;
                      this.setState({ userInfo: userInfo });
                    }}
                    label="Здоровье"
                    is_none={false}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <Accordion
                    style={{ marginTop: 20 }}
                    expanded={this.state.openNewTimeAdd}
                    onChange={() => this.setState({ openNewTimeAdd: !this.state.openNewTimeAdd })}
                  >
                    <AccordionSummary expandIcon={<AddIcon />}>
                      <AccessTimeIcon style={{ marginRight: 10 }} />
                      <Typography>Добавить время</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ display: "flex", flexDirection: "row" }}>
                      <MyTimePicker
                        value={this.state.newTimeStart}
                        func={(event) => this.setState({ newTimeStart: event.target.value })}
                        label="Время начала работы"
                      />
                      <Typography width={"3%"}></Typography>
                      <MyTimePicker
                        value={this.state.newTimeEnd}
                        func={(event) => this.setState({ newTimeEnd: event.target.value })}
                        label="Время окончания работы"
                      />
                      <Typography width={"3%"}></Typography>
                      <Button
                        style={{
                          minWidth: "12%",
                          backgroundColor: "red",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                        onClick={this.addTime.bind(this)}
                      >
                        Добавить
                      </Button>

                      {/* <AddIcon style={{ minWidth: 50, minHeight: 38, cursor: 'pointer' }} onClick={ this.addTime.bind(this) } /> */}
                    </AccordionDetails>
                  </Accordion>

                  {this.state.userInfo.hours.map((item, key) => (
                    <Accordion key={key}>
                      <AccordionSummary
                        expandIcon={<CloseIcon onClick={this.delTime.bind(this, key)} />}
                      >
                        <AccessTimeIcon style={{ marginRight: 10 }} />
                        <Typography>{item.time_start + " - " + item.time_end}</Typography>
                      </AccordionSummary>
                      <AccordionDetails style={{ display: "flex", flexDirection: "row" }}>
                        <MyTimePicker
                          value={item.time_start}
                          func={this.changeHourse.bind(this, "time_start", key)}
                          label="Время начала работы"
                        />
                        <Typography width={"3%"}></Typography>
                        <MyTimePicker
                          value={item.time_end}
                          func={this.changeHourse.bind(this, "time_end", key)}
                          label="Время окончания работы"
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  {!this.state.userInfo.hist.length ? null : (
                    <Accordion
                      style={{ marginTop: 50 }}
                      disabled
                    >
                      <AccordionSummary>
                        <Typography>История</Typography>
                      </AccordionSummary>
                    </Accordion>
                  )}
                  {this.state.userInfo.hist.map((item, key) => (
                    <Accordion key={key}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{item.date + " - " + item.user_name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails style={{ display: "flex", flexDirection: "column" }}>
                        {item.items.map((it, k) => (
                          <Typography key={k}>
                            {it.time_start + " - " + it.time_end}{" "}
                            {it.app_name == "" ? "" : " - " + it.app_name}{" "}
                          </Typography>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.saveDayHourse.bind(this)}
              >
                Сохранить
              </Button>
              <Button
                style={{ backgroundColor: "red", color: "#fff" }}
                onClick={() => this.setState({ isOpenModalH: false })}
              >
                Отмена
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {!this.state.userInfo || this.state.isOpenModalHMini === false ? null : (
          <Dialog
            open={this.state.isOpenModalHMini}
            onClose={() => this.setState({ isOpenModalHMini: false })}
            scroll="paper"
            fullWidth={true}
            maxWidth={"md"}
            id={"OpenModalH"}
          >
            <DialogTitle
              className="button"
              id="scroll-dialog-title"
            >
              {this.state.userInfo.user.app_name +
                " " +
                this.state.userInfo.user.user_name +
                " " +
                this.state.userInfo.date}
              <IconButton
                onClick={() => {
                  this.setState({ isOpenModalHMini: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {this.state.userInfo.hours.map((item, key) => (
                <Accordion key={key}>
                  <AccordionSummary>
                    <AccessTimeIcon style={{ marginRight: 10 }} />
                    <Typography>{item.time_start + " - " + item.time_end}</Typography>
                  </AccordionSummary>
                </Accordion>
              ))}

              {!this.state.userInfo.hist.length ? null : (
                <Accordion
                  style={{ marginTop: 50 }}
                  disabled
                >
                  <AccordionSummary>
                    <Typography>История</Typography>
                  </AccordionSummary>
                </Accordion>
              )}
              {this.state.userInfo.hist.map((item, key) => (
                <Accordion key={key}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{item.date + " - " + item.user_name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails style={{ display: "flex", flexDirection: "column" }}>
                    {item.items.map((it, k) => (
                      <Typography key={k}>
                        {it.time_start + " - " + it.time_end}{" "}
                        {it.app_name == "" ? "" : " - " + it.app_name}{" "}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </DialogContent>
            <DialogActions
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={() => this.setState({ isOpenModalHMini: false })}
              >
                Закрыть
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {!this.state.userInfo || this.state.isOpenModalM === false ? null : (
          <Dialog
            open={this.state.isOpenModalM}
            onClose={() => this.setState({ isOpenModalM: false })}
            scroll="paper"
            fullWidth={true}
            maxWidth={"md"}
            id={"OpenModalM"}
          >
            <DialogTitle className="button">
              {this.state.userInfo.user.app_name + " " + this.state.userInfo.user.user_name}
              <IconButton
                onClick={() => {
                  this.setState({ isOpenModalM: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
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
                    sm: 6,
                  }}
                >
                  <List component="nav">
                    <ListItemButton
                      onClick={this.chooseType.bind(this, 0)}
                      style={{ backgroundColor: "#98e38d", color: "#fff" }}
                    >
                      <ListItemText primary="10:00 - 22:00" />
                      {this.state.typeTimeAdd === 0 ? <SendIcon /> : null}
                    </ListItemButton>

                    <ListItemButton
                      onClick={this.chooseType.bind(this, 1)}
                      style={{ backgroundColor: "#3dcef2", color: "#fff" }}
                    >
                      <ListItemText primary="10:00 - 16:00" />
                      {this.state.typeTimeAdd === 1 ? <SendIcon /> : null}
                    </ListItemButton>

                    <ListItemButton
                      onClick={this.chooseType.bind(this, 2)}
                      style={{ backgroundColor: "#1560bd", color: "#fff" }}
                    >
                      <ListItemText primary="16:00 - 22:00" />
                      {this.state.typeTimeAdd === 2 ? <SendIcon /> : null}
                    </ListItemButton>

                    <ListItemButton style={{ backgroundColor: "#926eae", color: "#fff" }}>
                      <ListItemText primary="Другое" />
                    </ListItemButton>
                  </List>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyDatePickerGraph
                    year={this.state.mounth}
                    renderWeekPickerDay={this.renderWeekPickerDay}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.saveUserM.bind(this)}
              >
                Сохранить
              </Button>
              <Button
                style={{ backgroundColor: "red", color: "#fff" }}
                onClick={() => this.setState({ isOpenModalM: false })}
              >
                Отмена
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {!this.state.showErr || this.state.isShowErr === false ? null : (
          <Dialog
            open={this.state.isShowErr}
            onClose={() => this.setState({ isShowErr: false })}
            scroll="paper"
            fullWidth={true}
            maxWidth={"md"}
            id={"OpenModalM"}
          >
            <DialogTitle className="button">
              Ошибка по заказу №{this.state.showErr.order_id}
              <IconButton
                onClick={() => {
                  this.setState({ isShowErr: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <b>Ошибка заказа</b>
                  <span>{this.state.showErr.order_desc}</span>
                </Grid>
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <b>Дата заказа</b>
                  <span>{this.state.showErr.date_time_order}</span>
                </Grid>

                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <b>Позиция</b>
                  <span>{this.state.showErr.item_name}</span>
                </Grid>
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <b>Ошибка</b>
                  <span>{this.state.showErr.pr_name}</span>
                </Grid>
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <b>Сумма</b>
                  <span>{this.state.showErr.my_price}</span>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  {this.state.showErr.imgs.map((item, key) => (
                    <a
                      key={key}
                      href={"https://jacochef.ru/src/img/err_orders/uploads/" + item}
                      target="_blank"
                    >
                      <img
                        src={"https://jacochef.ru/src/img/err_orders/uploads/" + item}
                        style={{ maxHeight: 150, maxWidth: 150, margin: 10 }}
                      />
                    </a>
                  ))}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErr.new_text_1.length > 0 &&
                  parseInt(this.state.showErr.is_edit) == 0 ? (
                    <div className="cellErr">
                      <b>Причина обжалования</b>
                      <span>{this.state.showErr.new_text_1}</span>
                    </div>
                  ) : parseInt(this.state.showErr.is_edit) == 0 ? null : (
                    <MyTextInput
                      label="Причина обжалования"
                      multiline={true}
                      disabled={parseInt(this.state.showErr.is_edit) == 1 ? false : true}
                      maxRows={5}
                      value={this.state.showErr.new_text_1}
                      func={(event) => {
                        let userInfo = this.state.showErr;
                        userInfo.new_text_1 = event.target.value;
                        this.setState({ showErr: userInfo });
                      }}
                    />
                  )}
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErr.new_text_2.length == 0 ? null : (
                    <div className="cellErr">
                      <b>Ответ обжалования</b>
                      <span>{this.state.showErr.new_text_2}</span>
                    </div>
                  )}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErr.new_text_1.length > 0 &&
                  parseInt(this.state.showErr.is_edit) == 1 ? (
                    <Button
                      variant="contained"
                      onClick={this.fakeOrders.bind(this)}
                    >
                      Обжаловать
                    </Button>
                  ) : null}
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        )}
        {!this.state.showErrCam || this.state.isShowErrCam === false ? null : (
          <Dialog
            open={this.state.isShowErrCam}
            onClose={() => this.setState({ isShowErrCam: false })}
            scroll="paper"
            fullWidth={true}
            maxWidth={"md"}
            id={"OpenModalM"}
          >
            <DialogTitle className="button">
              Ошибка №{this.state.showErrCam.id}
              <IconButton
                onClick={() => {
                  this.setState({ isShowErrCam: false });
                }}
                style={{ cursor: "pointer" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <b>Ошибка</b>
                  <span>{this.state.showErrCam.fine_name}</span>
                </Grid>
                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <b>Дата время ошибки</b>
                  <span>{this.state.showErrCam.date_time_fine}</span>
                </Grid>

                <Grid
                  className="cellErr"
                  size={{
                    xs: 12,
                  }}
                >
                  <b>Комментарий</b>
                  <span>{this.state.showErrCam.comment}</span>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  {this.state.showErrCam.imgs.map((item, key) => (
                    <a
                      key={key}
                      href={"https://jacochef.ru/src/img/fine_err/uploads/" + item}
                      target="_blank"
                    >
                      <img
                        src={"https://jacochef.ru/src/img/fine_err/uploads/" + item}
                        style={{ maxHeight: 150, maxWidth: 150, margin: 10 }}
                      />
                    </a>
                  ))}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErrCam.text_one.length > 0 &&
                  parseInt(this.state.showErrCam.is_edit) == 0 ? (
                    <div className="cellErr">
                      <b>Причина обжалования</b>
                      <span>{this.state.showErrCam.text_one}</span>
                    </div>
                  ) : parseInt(this.state.showErrCam.is_edit) == 0 ? null : (
                    <MyTextInput
                      label="Причина обжалования"
                      multiline={true}
                      disabled={parseInt(this.state.showErrCam.is_edit) == 1 ? false : true}
                      maxRows={5}
                      value={this.state.showErrCam.text_one}
                      func={(event) => {
                        let userInfo = this.state.showErrCam;
                        userInfo.text_one = event.target.value;
                        this.setState({ showErrCam: userInfo });
                      }}
                    />
                  )}
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErrCam.text_two.length == 0 ? null : (
                    <div className="cellErr">
                      <b>Ответ обжалования</b>
                      <span>{this.state.showErrCam.text_two}</span>
                    </div>
                  )}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  {this.state.showErrCam.text_one.length > 0 &&
                  parseInt(this.state.showErrCam.is_edit) == 1 ? (
                    <Button
                      variant="contained"
                      onClick={this.fakeCam.bind(this)}
                    >
                      Обжаловать
                    </Button>
                  ) : null}
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        )}
        <Dialog
          onClose={() => this.setState({ newSmena: false, newSmenaName: "" })}
          open={this.state.newSmena}
        >
          <DialogTitle className="button">
            Новая смена
            <IconButton
              onClick={() => {
                this.setState({ newSmena: false, newSmenaName: "" });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              spacing={3}
              style={{ marginTop: 10 }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Название смены"
                  value={this.state.newSmenaName}
                  func={(event) => this.setState({ newSmenaName: event.target.value })}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <List className="userSmenalist">
                  {this.state.allUsers.map((item, key) => (
                    <ListItemButton
                      key={item.id}
                      disableRipple={false}
                      selected={parseInt(item.is_my) === 1}
                      onClick={this.changeNewSmenaUsers.bind(this, item.id)}
                    >
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
          >
            <Button
              style={{ backgroundColor: "green", color: "#fff" }}
              onClick={this.saveNewSmena.bind(this)}
            >
              Сохранить
            </Button>
            <Button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={() => this.setState({ newSmena: false })}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          onClose={() => this.setState({ editSmena: false, newSmenaName: "" })}
          open={this.state.editSmena}
          fullWidth={true}
        >
          <DialogTitle className="button">
            Редактирование смены
            <IconButton
              onClick={() => {
                this.setState({ editSmena: false, newSmenaName: "" });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
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
                  sm: 12,
                }}
              >
                <span style={{ color: "red", fontWeight: "bold" }}>
                  Все изменения применяются сразу
                </span>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Название смены"
                  value={this.state.newSmenaName}
                  func={(event) => this.setState({ newSmenaName: event.target.value })}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <List className="userSmenalist">
                  {this.state.allUsers.map((item, key) => (
                    <ListItemButton
                      key={item.id}
                      disableRipple={false}
                      selected={parseInt(item.is_my) === 1}
                      onClick={this.changeNewSmenaUsers.bind(this, item.id)}
                    >
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  ))}

                  <ListItemButton
                    disableRipple={false}
                    selected={true}
                    onClick={this.deleteSmenaConfirm.bind(this)}
                    className="SmenaDelete"
                  >
                    <ListItemText primary="Удалить смену" />
                  </ListItemButton>
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
          >
            <Button
              style={{ backgroundColor: "green", color: "#fff" }}
              onClick={this.saveEditSmena.bind(this)}
            >
              Сохранить
            </Button>
            <Button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={() => this.setState({ editSmena: false })}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.isOpenHJ}
          onClose={() => this.setState({ isOpenHJ: false })}
          scroll="paper"
          fullWidth={true}
          maxWidth={"md"}
          id={"OpenModalM"}
        >
          <DialogTitle className="button">
            Журнал здоровья
            <IconButton
              onClick={() => {
                this.setState({ isOpenHJ: false });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              spacing={3}
              style={{ marginTop: 2 }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyDatePickerNew
                  label="Дата от"
                  value={dayjs(this.state.date_start)}
                  func={this.changeDateRange.bind(this, "date_start")}
                  minDate={dayjs("2023-05-01")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyDatePickerNew
                  label="Дата до"
                  value={dayjs(this.state.date_end)}
                  func={this.changeDateRange.bind(this, "date_end")}
                  minDate={dayjs("2023-05-01")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
          >
            {this.canAccess("export_excel") && (
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.downloadHJ.bind(this)}
              >
                Скачать
              </Button>
            )}
            <Button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={() => this.setState({ isOpenHJ: false })}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
        {/* модалка для распечатки графика работы */}
        <Dialog
          open={this.state.isOpenWS}
          onClose={() => this.setState({ isOpenWS: false })}
          scroll="paper"
          fullWidth={true}
          maxWidth={"md"}
          id={"OpenModalM"}
        >
          <DialogTitle className="button">
            График работ
            <IconButton
              onClick={() => {
                this.setState({ isOpenWS: false });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              spacing={3}
              style={{ marginTop: 2 }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyDatePickerNew
                  label="Дата от"
                  value={dayjs(this.state.date_start_ws)}
                  func={this.changeDateRange.bind(this, "date_start_ws")}
                  minDate={dayjs("2023-05-01")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <MyDatePickerNew
                  label="Дата до"
                  value={dayjs(this.state.date_end_ws)}
                  func={this.changeDateRange.bind(this, "date_end_ws")}
                  minDate={dayjs("2023-05-01")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
          >
            {this.canAccess("export_excel") && (
              <Button
                style={{ backgroundColor: "green", color: "#fff" }}
                onClick={this.downloadWS.bind(this)}
              >
                Скачать
              </Button>
            )}
            <Button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={() => this.setState({ isOpenWS: false })}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
        {/* бонус директора */}
        <Dialog
          onClose={() => this.setState({ isModalDirBonus: false, dir_bonus: 0 })}
          open={this.state.isModalDirBonus}
        >
          <DialogTitle className="button">
            Бонус директора {this.state?.userInfo?.name} {this.state?.userInfo?.date}
            <IconButton
              onClick={() => {
                this.setState({ isModalDirBonus: false, dir_bonus: 0 });
              }}
              style={{ cursor: "pointer" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Grid
              container
              spacing={3}
              style={{ marginTop: 10 }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Сумма"
                  value={this.state.dir_bonus}
                  func={(event) => this.setState({ dir_bonus: event.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}
          >
            <Button
              style={{ backgroundColor: "green", color: "#fff" }}
              onClick={this.saveDirBonus.bind(this)}
            >
              Сохранить
            </Button>
            <Button
              style={{ backgroundColor: "red", color: "#fff" }}
              onClick={() => this.setState({ isModalDirBonus: false })}
            >
              Отмена
            </Button>
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

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point}
              func={(event) => this.setState({ point: event.target.value })}
              label="Точка"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MySelect
              is_none={false}
              data={this.state.mounths}
              value={this.state.mounth}
              func={(event) => this.setState({ mounth: event.target.value })}
              label="Месяц"
            />
          </Grid>

          <Grid
            display="flex"
            justifyContent="space-between"
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={this.updateData.bind(this)}
            >
              Обновить данные
            </Button>

            <Button
              variant="contained"
              onClick={() => this.setState({ isOpenWS: true })}
            >
              Распечатать
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ isOpenHJ: true });
              }}
            >
              Журнал здоровья
            </Button>
          </Grid>

          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={this.state.tabTable}
                onChange={(event, data) => {
                  localStorage.setItem("tabTable", data);
                  this.setState({
                    tabTable: data,
                    addUsers: [],
                  });
                }}
                centered
              >
                <Tab
                  label="С 1 по 15 числа"
                  {...a11yProps(0)}
                />
                <Tab
                  label="С 16 по конец месяца"
                  {...a11yProps(1)}
                />
              </Tabs>
            </Box>

            {this.state.kind == "other" ? (
              <TabPanel
                value={this.state.tabTable}
                index={0}
                style={{ paddingRight: 0 }}
              >
                {!this.state.one ? null : (
                  <WorkSchedule_Table_without_functions
                    number={this.state.one}
                    numberChoose={1}
                    test={this.state.test_one}
                    show_zp={this.state.show_zp_one}
                    kind={this.state.kind}
                    lv_dir={this.state.lv_dir}
                    add_lv={this.state.add_lv}
                    lv_dir_new={this.state.lv_dir_new}
                    lv_cafe={this.state.lv_cafe}
                    changeLVDir={this.changeLVDir.bind(this)}
                    changeDopBonus={this.changeDopBonus.bind(this)}
                    changeDopBonusUser={this.changeDopBonusUser.bind(this)}
                    openM={this.openM.bind(this)}
                    openH={this.openHMini.bind(this)}
                    openZP={this.openZP.bind(this)}
                    openZPCart={this.openZPCart.bind(this)}
                    mix={this.mix.bind(this)}
                    pricePerHour={this.pricePerHour.bind(this)}
                    addSmena={this.addSmena.bind(this)}
                    editSmena={this.editSmena.bind(this)}
                    addUser={this.addUser.bind(this)}
                    openAddUser={() => this.setState({ mainMenuAddUsers: true })}
                  />
                )}
              </TabPanel>
            ) : (
              <TabPanel
                value={this.state.tabTable}
                index={0}
                style={{ paddingRight: 0 }}
              >
                {!this.state.one ? null : (
                  <WorkSchedule_Table
                    number={this.state.one}
                    numberChoose={1}
                    test={this.state.test_one}
                    show_zp={this.state.show_zp_one}
                    kind={this.state.kind}
                    lv_dir={this.state.lv_dir}
                    add_lv={this.state.add_lv}
                    lv_dir_new={this.state.lv_dir_new}
                    lv_cafe={this.state.lv_cafe}
                    changeLVDir={this.changeLVDir.bind(this)}
                    changeDopBonus={this.changeDopBonus.bind(this)}
                    changeDopBonusUser={this.changeDopBonusUser.bind(this)}
                    openM={this.openM.bind(this)}
                    openH={this.openH.bind(this)}
                    openZP={this.openZP.bind(this)}
                    openZPCart={this.openZPCart.bind(this)}
                    mix={this.mix.bind(this)}
                    pricePerHour={this.pricePerHour.bind(this)}
                    addSmena={this.addSmena.bind(this)}
                    editSmena={this.editSmena.bind(this)}
                    addUser={this.addUser.bind(this)}
                    openAddUser={() => this.setState({ mainMenuAddUsers: true })}
                    clickAppNameUser={this.clickAppNameUser.bind(this)}
                    openModalDirBonus={this.openModalDirBonus.bind(this)}
                  />
                )}
              </TabPanel>
            )}

            {this.state.kind == "other" ? (
              <TabPanel
                value={this.state.tabTable}
                index={1}
                style={{ paddingRight: 0 }}
              >
                {!this.state.two ? null : (
                  <WorkSchedule_Table_without_functions
                    number={this.state.two}
                    numberChoose={2}
                    test={this.state.test_two}
                    show_zp={this.state.show_zp_two}
                    kind={this.state.kind}
                    lv_dir={this.state.lv_dir}
                    add_lv={this.state.add_lv}
                    lv_dir_new={this.state.lv_dir_new}
                    lv_cafe={this.state.lv_cafe}
                    changeLVDir={this.changeLVDir.bind(this)}
                    changeDopBonus={this.changeDopBonus.bind(this)}
                    changeDopBonusUser={this.changeDopBonusUser.bind(this)}
                    openM={this.openM.bind(this)}
                    openH={this.openHMini.bind(this)}
                    openZP={this.openZP.bind(this)}
                    openZPCart={this.openZPCart.bind(this)}
                    mix={this.mix.bind(this)}
                    pricePerHour={this.pricePerHour.bind(this)}
                    addSmena={this.addSmena.bind(this)}
                    editSmena={this.editSmena.bind(this)}
                    addUser={this.addUser.bind(this)}
                    openAddUser={() => this.setState({ mainMenuAddUsers: true })}
                  />
                )}
              </TabPanel>
            ) : (
              <TabPanel
                value={this.state.tabTable}
                index={1}
                style={{ paddingRight: 0 }}
              >
                {!this.state.two ? null : (
                  <WorkSchedule_Table
                    number={this.state.two}
                    numberChoose={2}
                    test={this.state.test_two}
                    show_zp={this.state.show_zp_two}
                    kind={this.state.kind}
                    lv_dir={this.state.lv_dir}
                    add_lv={this.state.add_lv}
                    lv_dir_new={this.state.lv_dir_new}
                    lv_cafe={this.state.lv_cafe}
                    changeLVDir={this.changeLVDir.bind(this)}
                    changeDopBonus={this.changeDopBonus.bind(this)}
                    changeDopBonusUser={this.changeDopBonusUser.bind(this)}
                    openM={this.openM.bind(this)}
                    openH={this.openH.bind(this)}
                    openZP={this.openZP.bind(this)}
                    openZPCart={this.openZPCart.bind(this)}
                    mix={this.mix.bind(this)}
                    pricePerHour={this.pricePerHour.bind(this)}
                    addSmena={this.addSmena.bind(this)}
                    editSmena={this.editSmena.bind(this)}
                    addUser={this.addUser.bind(this)}
                    openAddUser={() => this.setState({ mainMenuAddUsers: true })}
                    clickAppNameUser={this.clickAppNameUser.bind(this)}
                    openModalDirBonus={this.openModalDirBonus.bind(this)}
                  />
                )}
              </TabPanel>
            )}
          </Box>

          <Grid
            style={{ overflow: "auto" }}
            size={{
              xs: 12,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Номер заказа</TableCell>
                  <TableCell>Дата заказа</TableCell>
                  <TableCell>Ошибка</TableCell>
                  <TableCell>Довоз</TableCell>
                  <TableCell>Сумма ошибки</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              {parseInt(this.state.tabTable) == 0 ? (
                <TableBody>
                  {this.state.errOrdersOneOrders.map((item, key) => (
                    <TableRow
                      key={key}
                      onClick={this.showErrOrder.bind(this, item.id, item.row_id)}
                      style={{ backgroundColor: parseInt(item.is_delete) == 1 ? "red" : "#fff" }}
                    >
                      <TableCell>{item.order_id}</TableCell>
                      <TableCell>{item.date_time_order}</TableCell>
                      <TableCell>{item.err_name}</TableCell>
                      <TableCell>
                        {parseInt(item.new_order_id) == 0 ? null : <TimeToLeaveIcon />}
                      </TableCell>
                      <TableCell>{item.my_price}</TableCell>
                      <TableCell>
                        {" "}
                        {parseInt(item.new_status) == 1 && parseInt(item.is_edit) == 1 ? (
                          <InfoIcon />
                        ) : null}{" "}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {this.state.errOrdersTwoOrders.map((item, key) => (
                    <TableRow
                      key={key}
                      onClick={this.showErrOrder.bind(this, item.id, item.row_id)}
                      style={{ backgroundColor: parseInt(item.is_delete) == 1 ? "red" : "#fff" }}
                    >
                      <TableCell>{item.order_id}</TableCell>
                      <TableCell>{item.date_time_order}</TableCell>
                      <TableCell>{item.err_name}</TableCell>
                      <TableCell>
                        {parseInt(item.new_order_id) == 0 ? null : <TimeToLeaveIcon />}
                      </TableCell>
                      <TableCell>{item.my_price}</TableCell>
                      <TableCell>
                        {" "}
                        {parseInt(item.new_status) == 1 && parseInt(item.is_edit) == 1 ? (
                          <InfoIcon />
                        ) : null}{" "}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
              <TableFooter>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Дата время совершения ошибки</TableCell>
                  <TableCell>Ошибка</TableCell>
                  <TableCell>Сумма ошибки</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              {parseInt(this.state.tabTable) == 0 ? (
                <TableBody>
                  {this.state.errOrdersOneCam.map((item, key) => (
                    <TableRow
                      key={key}
                      onClick={this.showErrCam.bind(this, item.id)}
                      style={{ backgroundColor: parseInt(item.is_delete) == 1 ? "red" : "#fff" }}
                    >
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.date_time_fine}</TableCell>
                      <TableCell>{item.fine_name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell> {parseInt(item.is_edit) == 1 ? <InfoIcon /> : null} </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {this.state.errOrdersTwoCam.map((item, key) => (
                    <TableRow
                      key={key}
                      onClick={this.showErrCam.bind(this, item.id)}
                      style={{ backgroundColor: parseInt(item.is_delete) == 1 ? "red" : "#fff" }}
                    >
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.date_time_fine}</TableCell>
                      <TableCell>{item.fine_name}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell> {parseInt(item.is_edit) == 1 ? <InfoIcon /> : null} </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
              <TableFooter>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function WorkSchedule() {
  return <WorkSchedule_ />;
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
